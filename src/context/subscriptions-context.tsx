"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subscription, SAMPLE_SUBSCRIPTIONS, PRIORITY_CONFIG } from '@/app/lib/subscription-store';

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  markAsUsed: (id: string) => void;
  isWizardComplete: boolean;
  completeWizard: () => void;
  exportData: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
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

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

const encrypt = (data: string) => btoa(encodeURIComponent(data));
const decrypt = (data: string) => {
  try {
    return decodeURIComponent(atob(data));
  } catch(e) {
    return data;
  }
};

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isWizardComplete, setIsWizardComplete] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('panda_subs_v4');
    const wizardState = localStorage.getItem('panda_wizard');
    
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

    if (wizardState === 'complete') {
      setIsWizardComplete(true);
    } else if (!saved) {
      setIsWizardComplete(false);
    }
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      localStorage.setItem('panda_subs_v4', encrypt(JSON.stringify(subscriptions)));
    }
    checkReminders();
  }, [subscriptions]);

  const checkReminders = () => {
    const today = new Date();
    const newNotifications: Notification[] = [];

    subscriptions.forEach(sub => {
      const renewalDate = new Date(sub.renewalDate);
      const diffDays = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // התראת ביטול יזום (Lead Days)
      const leadDays = sub.cancelLeadDays || 3;
      if (diffDays === leadDays) {
        newNotifications.push({
          id: `lead-cancel-${sub.id}`,
          title: `ביטול יזום: ${sub.name}`,
          message: `זה הזמן שביקשת לבטל את המינוי כדי להימנע מחיוב (נשארו ${diffDays} ימים).`,
          date: today.toISOString(),
          read: false,
          type: 'warning',
          priority: 'high'
        });
      }

      // Check Renewal Reminders
      if (diffDays <= 3 && diffDays > 0) {
        newNotifications.push({
          id: `renewal-crit-${sub.id}`,
          title: `דחוף: חיוב מחר/היום עבור ${sub.name}`,
          message: `המינוי מתחדש בעוד ${diffDays} ימים. סכום: ${sub.amount} ${sub.currency}`,
          date: today.toISOString(),
          read: false,
          type: 'critical',
          priority: 'critical'
        });
      }

      // Check Trial End
      if (sub.status === 'trial' && sub.trialEndsAt) {
        const trialEnd = new Date(sub.trialEndsAt);
        const trialDiff = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (trialDiff <= 3 && trialDiff > 0) {
          newNotifications.push({
            id: `trial-${sub.id}`,
            title: `תקופת ניסיון מסתיימת: ${sub.name}`,
            message: `שים לב, תקופת הניסיון מסתיימת בעוד ${trialDiff} ימים.`,
            date: today.toISOString(),
            read: false,
            type: 'critical',
            priority: 'critical'
          });
        }
      }

      // Check Inactivity
      if (sub.lastUsed) {
        const lastUsedDate = new Date(sub.lastUsed);
        const daysSinceUsed = Math.ceil((today.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceUsed >= 30 && sub.status === 'active') {
          newNotifications.push({
            id: `usage-${sub.id}`,
            title: `מינוי לא בשימוש: ${sub.name}`,
            message: `לא השתמשת ב-${sub.name} כבר חודש. אולי כדאי לבטל ולחסוך?`,
            date: today.toISOString(),
            read: false,
            type: 'warning',
            priority: 'medium'
          });
        }
      }
    });

    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.id));
      const added = newNotifications.filter(n => !existingIds.has(n.id));
      return [...added, ...prev].slice(0, 30);
    });
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
      markAsUsed,
      isWizardComplete,
      completeWizard,
      exportData,
      notifications,
      markNotificationAsRead
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
