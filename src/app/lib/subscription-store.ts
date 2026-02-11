export type SubscriptionCategory = 
  | 'streaming' 
  | 'fitness' 
  | 'insurance' 
  | 'saas' 
  | 'cloud' 
  | 'mobile' 
  | 'news' 
  | 'other';

export type SubscriptionStatus = 'active' | 'trial' | 'cancelled' | 'frozen' | 'not_in_use';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  amount: number;
  currency: string;
  renewalDate: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod?: string;
  reminderDays: number[]; // Array of days to notify in advance, e.g., [14, 7, 3, 0]
  trialEndsAt?: string;
  status: SubscriptionStatus;
  atRisk?: boolean;
  usageCount?: number;
  lastUsed?: string;
  priority?: 'critical' | 'high' | 'medium' | 'none';
  notes?: string;
  credentials?: {
    username?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
}

export const CATEGORY_METADATA: Record<SubscriptionCategory, { label: string; icon: string; color: string }> = {
  streaming: { label: 'סטרימינג', icon: '📺', color: '#E91E63' },
  fitness: { label: 'כושר', icon: '💪', color: '#4CAF50' },
  insurance: { label: 'ביטוח', icon: '🛡️', color: '#2196F3' },
  saas: { label: 'SaaS', icon: '💻', color: '#9C27B0' },
  cloud: { label: 'ענן', icon: '☁️', color: '#00BCD4' },
  mobile: { label: 'סלולר', icon: '📱', color: '#FF9800' },
  news: { label: 'עיתונים', icon: '📰', color: '#795548' },
  other: { label: 'אחר', icon: '✨', color: '#607D8B' },
};

export const STATUS_METADATA: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: 'פעיל', color: '#4CAF50' },
  trial: { label: 'תקופת ניסיון', color: '#FF5722' },
  cancelled: { label: 'בוטל', color: '#9E9E9E' },
  frozen: { label: 'מוקפא', color: '#03A9F4' },
  not_in_use: { label: 'לא בשימוש', color: '#FFC107' },
};

export const PRIORITY_CONFIG = {
  critical: { label: 'קריטי', color: '#F44336' },
  high: { label: 'גבוה', color: '#FF9800' },
  medium: { label: 'בינוני', color: '#FFEB3B' },
  none: { label: 'ללא', color: '#E0E0E0' }
};

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'streaming',
    amount: 54.9,
    currency: '₪',
    renewalDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    billingCycle: 'monthly',
    paymentMethod: 'Visa 4242',
    reminderDays: [7, 3, 0],
    status: 'active',
    usageCount: 12,
    lastUsed: '2024-05-20',
    priority: 'medium',
    credentials: { email: 'user@example.com', username: 'israel_n' }
  },
  {
    id: '2',
    name: 'Spotify Family',
    category: 'streaming',
    amount: 31.9,
    currency: '₪',
    renewalDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().split('T')[0],
    billingCycle: 'monthly',
    paymentMethod: 'Mastercard 1234',
    reminderDays: [3, 0],
    status: 'active',
    priority: 'none'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    category: 'saas',
    amount: 199,
    currency: '₪',
    renewalDate: '2025-05-28',
    billingCycle: 'yearly',
    paymentMethod: 'Mastercard 8899',
    reminderDays: [14, 7, 0],
    status: 'trial',
    usageCount: 8,
    lastUsed: '2024-05-18',
    priority: 'critical'
  },
];
