"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subscription, SAMPLE_SUBSCRIPTIONS } from '@/app/lib/subscription-store';

interface SubscriptionsContextType {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, sub: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  markAsUsed: (id: string) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('panda_subs');
    if (saved) {
      setSubscriptions(JSON.parse(saved));
    } else {
      setSubscriptions(SAMPLE_SUBSCRIPTIONS);
    }
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      localStorage.setItem('panda_subs', JSON.stringify(subscriptions));
    }
  }, [subscriptions]);

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
      s.id === id ? { ...s, usageCount: (s.usageCount || 0) + 1, lastUsed: today } : s
    ));
  };

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription, updateSubscription, deleteSubscription, markAsUsed }}>
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