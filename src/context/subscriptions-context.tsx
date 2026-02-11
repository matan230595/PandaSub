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
  visibleColumns: string[];
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
  userPhone: '050-1234567',
  visibleColumns: ['name', 'amount', 'renewalDate', 'status', 'category', 'paymentMethod']
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

  useEffect(() => {
    const saved = localStorage.getItem('panda_subs_v10');
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
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }

    if (wizardState === 'complete') {
      setIsWizardComplete(true);
    } else if (!saved) {
      setIsWizardComplete(false);
    }
  }, []);

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
      localStorage.setItem('panda_subs_v10', encrypt(JSON.stringify(subscriptions)));
    }
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
      const { id: _, ...rest } = subToCopy;
      addSubscription({ ...rest, name: `${subToCopy.name} (עותק)` });
    }
  };

  const markAsUsed = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setSubscriptions(prev => prev.map(s => 
      s.id === id ? { ...s, usageCount: (s.usageCount || 0) + 1, lastUsed: today } : s
    ));
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
