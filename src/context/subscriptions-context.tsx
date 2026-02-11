"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { Subscription, SAMPLE_SUBSCRIPTIONS } from '@/app/lib/subscription-store';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'critical';
  priority?: 'critical' | 'high' | 'medium';
}

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
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
  userEmail: 'israel@example.com',
  userPhone: '050-1234567',
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

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isWizardComplete, setIsWizardComplete] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { user } = useUser();
  const db = useFirestore();

  // סנכרון עם Firebase במקום LocalStorage
  useEffect(() => {
    if (!db || !user) {
      // אם אין משתמש מחובר, השתמש ב-SAMPLE ו-LocalStorage (פרוטוטיפ)
      const saved = localStorage.getItem('panda_subs_v11');
      if (saved) setSubscriptions(JSON.parse(saved));
      else setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      return;
    }

    const subsRef = collection(db, 'users', user.uid, 'subscriptions');
    const unsubscribe = onSnapshot(subsRef, (snapshot) => {
      const subs: Subscription[] = [];
      snapshot.forEach(doc => subs.push({ ...doc.data() as Subscription, id: doc.id }));
      setSubscriptions(subs);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: subsRef.path,
        operation: 'list'
      }));
    });

    const settingsRef = doc(db, 'users', user.uid);
    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSettings();
    }
  }, [db, user]);

  // גיבוי ל-LocalStorage למקרה חירום/אופליין
  useEffect(() => {
    localStorage.setItem('panda_subs_v11', JSON.stringify(subscriptions));
    checkReminders();
  }, [subscriptions]);

  const convertAmount = (amount: number, fromCurrency: string) => {
    const rate = EXCHANGE_RATES[fromCurrency] || EXCHANGE_RATES[fromCurrency.toUpperCase()] || 1;
    return amount * rate;
  };

  const playNotificationSound = () => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
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

  const checkReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newNotifications: Notification[] = [];

    subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      renewalDate.setHours(0,0,0,0);
      const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      const activeReminders = sub.reminderDays || [3];
      if (activeReminders.includes(diffDays)) {
        newNotifications.push({
          id: `renewal-${sub.id}-${diffDays}-${today.getDate()}`,
          title: diffDays === 0 ? `היום חיוב: ${sub.name}` : `חיוב עבור ${sub.name} בעוד ${diffDays} ימים`,
          message: `סכום: ${sub.amount}${sub.currency}. וודא שהכל מוכן!`,
          date: new Date().toISOString(),
          read: false,
          type: diffDays <= 1 ? 'critical' : 'warning',
          priority: diffDays <= 1 ? 'critical' : 'high'
        });
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const added = newNotifications.filter(n => !existingIds.has(n.id));
      if (added.length > 0) playNotificationSound();
      return [...added, ...prev].slice(0, 20);
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user && db) {
      setDoc(doc(db, 'users', user.uid), { settings: updated }, { merge: true });
    }
  };

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    if (user && db) {
      const newDoc = doc(collection(db, 'users', user.uid, 'subscriptions'));
      setDoc(newDoc, { ...sub, id: newDoc.id }).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: newDoc.path,
          operation: 'create',
          requestResourceData: sub
        }));
      });
    } else {
      const newSub = { ...sub, id: Math.random().toString(36).substr(2, 9) };
      setSubscriptions(prev => [newSub, ...prev]);
    }
  };

  const updateSubscription = (id: string, sub: Partial<Subscription>) => {
    if (user && db) {
      const subRef = doc(db, 'users', user.uid, 'subscriptions', id);
      updateDoc(subRef, sub).catch(e => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: subRef.path,
          operation: 'update',
          requestResourceData: sub
        }));
      });
    } else {
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...sub } : s));
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
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <SubscriptionsContext.Provider value={{ 
      subscriptions, addSubscription, updateSubscription, deleteSubscription,
      duplicateSubscription, markAsUsed, isWizardComplete, completeWizard,
      exportData, notifications, markNotificationAsRead, settings, updateSettings,
      convertAmount
    }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  return context;
}
