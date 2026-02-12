
"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Subscription } from '@/app/lib/subscription-store';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useUser } from '@/firebase';

interface UserSettings {
  darkMode: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  pushNotifications: boolean;
  emailDigest: boolean;
  soundEnabled: boolean;
  currency: string;
  language: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  familyName: string;
  visibleColumns: string[];
  bankSyncEnabled: boolean;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical';
  priority?: 'critical' | 'high' | 'medium';
}

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'userId'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  duplicateSubscription: (id: string) => void;
  markAsUsed: (id: string) => void;
  isWizardComplete: boolean;
  completeWizard: () => void;
  exportData: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  convertAmount: (amount: number, fromCurrency: string) => number;
  isLoading: boolean;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  compactMode: false,
  fontSize: 'medium',
  pushNotifications: true,
  emailDigest: true,
  soundEnabled: true,
  currency: '₪',
  language: 'he',
  userName: 'ישראל ישראלי',
  userEmail: '',
  userPhone: '',
  familyName: '',
  visibleColumns: ['name', 'amount', 'renewalDate', 'status', 'category'],
  bankSyncEnabled: false
};

const EXCHANGE_RATES: Record<string, number> = {
  '₪': 1,
  'ILS': 1,
  '$': 3.72,
  'USD': 3.72,
  '€': 4.05,
  'EUR': 4.05,
};

/**
 * Deeply scrubs undefined values from an object to prevent Firebase crashes.
 */
function scrubUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(scrubUndefined);
  
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      result[key] = scrubUndefined(value);
    }
  });
  return result;
}

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isWizardComplete, setIsWizardComplete] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { user, isUserLoading } = useUser();

  // Listen for Subscriptions
  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      const saved = localStorage.getItem('panda_subs_v11');
      if (saved) setSubscriptions(JSON.parse(saved));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const subsRef = collection(db!, 'users', user.uid, 'subscriptions');
    const unsubscribe = onSnapshot(subsRef, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach(doc => subs.push({ ...doc.data() as Subscription, id: doc.id }));
      setSubscriptions(subs);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore subscriptions error:", error);
      setIsLoading(false);
    });

    const settingsRef = doc(db!, 'users', user.uid);
    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
      }
    });

    // Listen for Notifications from Firestore
    const notificationsRef = collection(db!, 'users', user.uid, 'notifications');
    const qNotifications = query(notificationsRef, orderBy('date', 'desc'), limit(20));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      const notes: Notification[] = [];
      snapshot.forEach(doc => notes.push({ ...doc.data() as Notification, id: doc.id }));
      setNotifications(notes);
    });

    return () => {
      unsubscribe();
      unsubscribeSettings();
      unsubscribeNotifications();
    }
  }, [user, isUserLoading]);

  useEffect(() => {
    if (!user && subscriptions.length > 0) {
      localStorage.setItem('panda_subs_v11', JSON.stringify(subscriptions));
    }
    if (user && !isLoading) {
      checkReminders();
    }
  }, [subscriptions, user, isLoading]);

  const convertAmount = (amount: number, fromCurrency: string) => {
    const rate = EXCHANGE_RATES[fromCurrency] || EXCHANGE_RATES[fromCurrency.toUpperCase()] || 1;
    return amount * rate;
  };

  const initAudio = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return;
    try {
      const ctx = initAudio();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  };

  const checkReminders = async () => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    for (const sub of subscriptions) {
      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0,0,0,0);
      const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const activeReminders = sub.reminderDays || [3];
      if (activeReminders.includes(diffDays)) {
        // Unique ID for this specific notification to prevent duplicates in Firestore
        const noteId = `renewal-${sub.id}-${diffDays}-${todayStr}`;
        
        // Check if we already have this notification in the current list
        if (!notifications.some(n => n.id === noteId)) {
          const newNote: Omit<Notification, 'id'> = {
            userId: user.uid,
            title: diffDays === 0 ? `היום חיוב: ${sub.name}` : `חיוב עבור ${sub.name} בעוד ${diffDays} ימים`,
            message: `סכום: ${sub.amount}${sub.currency}.`,
            date: new Date().toISOString(),
            read: false,
            type: diffDays <= 1 ? 'critical' : 'warning',
            priority: diffDays <= 1 ? 'critical' : 'high'
          };
          
          try {
            await setDoc(doc(db!, 'users', user.uid, 'notifications', noteId), newNote);
            playNotificationSound();
          } catch (e) {
            console.error("Error creating notification:", e);
          }
        }
      }
    }
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user && db) {
      setDoc(doc(db, 'users', user.uid), { settings: scrubUndefined(updated) }, { merge: true });
    }
  };

  const addSubscription = (sub: Omit<Subscription, 'id' | 'userId'>) => {
    if (user && db) {
      const subWithUser = { ...sub, userId: user.uid };
      const dataToSave = scrubUndefined(subWithUser);
      const newDoc = doc(collection(db, 'users', user.uid, 'subscriptions'));
      setDoc(newDoc, { ...dataToSave, id: newDoc.id }).catch(e => {
        console.error("Error adding subscription:", e);
      });
    } else {
      const newSub = { ...scrubUndefined(sub), id: Math.random().toString(36).substr(2, 9), userId: 'local' } as Subscription;
      setSubscriptions(prev => [newSub, ...prev]);
    }
  };

  const updateSubscription = (id: string, sub: Partial<Subscription>) => {
    const dataToSave = scrubUndefined(sub);
    if (user && db) {
      const subRef = doc(db, 'users', user.uid, 'subscriptions', id);
      updateDoc(subRef, dataToSave).catch(e => {
        console.error("Error updating subscription:", e);
      });
    } else {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...dataToSave } : s));
    }
  };

  const deleteSubscription = (id: string) => {
    if (user && db) {
      deleteDoc(doc(db, 'users', user.uid, 'subscriptions', id));
    } else {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    }
  };

  const duplicateSubscription = (id: string) => {
    const subToCopy = subscriptions.find(s => s.id === id);
    if (subToCopy) {
      const { id: _, ...rest } = subToCopy;
      addSubscription({ ...rest, name: `${subToCopy.name} (עותק)` });
    }
  };

  const markAsUsed = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      const today = new Date().toISOString().split('T')[0];
      updateSubscription(id, { usageCount: (sub.usageCount || 0) + 1, lastUsed: today });
    }
  };

  const completeWizard = () => {
    setIsWizardComplete(true);
    localStorage.setItem('panda_wizard', 'complete');
  };

  const exportData = () => {
    const headers = ['Name', 'Category', 'Amount', 'Currency', 'Renewal Date', 'Cycle', 'Status'];
    const rows = subscriptions.map(s => [s.name, s.category, s.amount, s.currency, s.renewalDate, s.billingCycle, s.status]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "panda_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markNotificationAsRead = (id: string) => {
    if (user && db) {
      updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  return (
    <SubscriptionsContext.Provider value={{ 
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      duplicateSubscription, markAsUsed, isWizardComplete, completeWizard,
      exportData, notifications, markNotificationAsRead, settings, updateSettings,
      convertAmount, isLoading
    }}>
      <div onClick={() => initAudio()}>
        {children}
      </div>
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  return context;
}
