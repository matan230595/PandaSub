
"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Subscription, SAMPLE_SUBSCRIPTIONS } from '@/app/lib/subscription-store';

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
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

const encrypt = (data: string) => btoa(encodeURIComponent(data));
const decrypt = (data: string) => {
  try {
    return decodeURIComponent(atob(data));
  } catch(e) {
    return data;
  }
};

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
  userPhone: '050-1234567'
};

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isWizardComplete, setIsWizardComplete] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const audioContextRef = useRef<AudioContext | null>(null);

  // טעינת מידע ראשוני
  useEffect(() => {
    const saved = localStorage.getItem('panda_subs_v5');
    const wizardState = localStorage.getItem('panda_wizard');
    const savedSettings = localStorage.getItem('panda_settings');
    
    if (saved) {
      try {
        const decoded = decrypt(saved);
        setSubscriptions(JSON.parse(decoded));
      } catch (e) {
        setSubscriptions(SAMPLE_SUBSCRIPTIONS);
      }
    } else {
      setSubscriptions(SAMPLE_SUBSCRIPTIONS);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    if (wizardState === 'complete') {
      setIsWizardComplete(true);
    } else if (!saved) {
      setIsWizardComplete(false);
    }
  }, []);

  // שמירת הגדרות ויישום Dark Mode
  useEffect(() => {
    localStorage.setItem('panda_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      localStorage.setItem('panda_subs_v5', encrypt(JSON.stringify(subscriptions)));
    }
    checkReminders();
  }, [subscriptions]);

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
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn("Could not play notification sound", e);
    }
  };

  const checkReminders = () => {
    const today = new Date();
    const newNotifications: Notification[] = [];

    subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 3 && diffDays >= 0) {
        newNotifications.push({
          id: `renewal-crit-${sub.id}-${today.getDate()}`,
          title: `דחוף: חיוב עבור ${sub.name}`,
          message: `המינוי מתחדש בעוד ${diffDays} ימים. סכום: ${sub.amount} ${sub.currency}`,
          date: today.toISOString(),
          read: false,
          type: 'critical',
          priority: 'critical'
        });
      }

      if (sub.status === 'trial' && sub.trialEndsAt) {
        const trialEnd = new Date(sub.trialEndsAt);
        const trialDiff = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (trialDiff <= 3 && trialDiff >= 0) {
          newNotifications.push({
            id: `trial-end-${sub.id}-${today.getDate()}`,
            title: `תקופת ניסיון מסתיימת: ${sub.name}`,
            message: `שים לב, תקופת הניסיון מסתיימת בעוד ${trialDiff} ימים.`,
            date: today.toISOString(),
            read: false,
            type: 'critical',
            priority: 'critical'
          });
        }
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const added = newNotifications.filter(n => !existingIds.has(n.id));
      
      if (added.length > 0) {
        playNotificationSound();
      }
      
      return [...added, ...prev].slice(0, 30);
    });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub = { ...sub, id: Math.random().toString(36).substr(2, 9) };
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const updateSubscription = (id: string, sub: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...sub } : s));
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const duplicateSubscription = (id: string) => {
    const subToCopy = subscriptions.find(s => s.id === id);
    if (subToCopy) {
      const { id: _, name, ...rest } = subToCopy;
      addSubscription({
        ...rest,
        name: `${name} (עותק)`,
      });
    }
  };

  const markAsUsed = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSubscriptions(prev => prev.map(s => 
      s.id === id ? { ...s, usageCount: (s.usageCount || 0) + 1, lastUsed: today, atRisk: false } : s
    ));
  };

  const completeWizard = () => {
    setIsWizardComplete(true);
    localStorage.setItem('panda_wizard', 'complete');
  };

  const exportData = () => {
    const headers = ['Name', 'Category', 'Amount', 'Currency', 'Renewal Date', 'Status', 'Priority', 'Username', 'Email'];
    const rows = subscriptions.map(s => [
      s.name, 
      s.category, 
      s.amount, 
      s.currency, 
      s.renewalDate, 
      s.status, 
      s.priority || 'none',
      s.credentials?.username || '',
      s.credentials?.email || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "panda_subscriptions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <SubscriptionsContext.Provider value={{ 
      subscriptions, 
      addSubscription, 
      updateSubscription, 
      deleteSubscription,
      duplicateSubscription,
      markAsUsed,
      isWizardComplete,
      completeWizard,
      exportData,
      notifications,
      markNotificationAsRead,
      settings,
      updateSettings
    }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
}
