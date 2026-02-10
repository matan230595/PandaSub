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
  trialEndsAt?: string;
  status: SubscriptionStatus;
  atRisk?: boolean;
  usageCount?: number;
  lastUsed?: string;
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

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'streaming',
    amount: 54.9,
    currency: '₪',
    renewalDate: '2025-06-15',
    status: 'active',
    usageCount: 12,
    lastUsed: '2024-05-20',
  },
  {
    id: '2',
    name: 'Spotify Family',
    category: 'streaming',
    amount: 39.9,
    currency: '₪',
    renewalDate: '2025-06-10',
    status: 'active',
    usageCount: 45,
    lastUsed: '2024-05-22',
  },
  {
    id: '3',
    name: 'הולמס פלייס',
    category: 'fitness',
    amount: 299,
    currency: '₪',
    renewalDate: '2025-07-01',
    status: 'active',
    atRisk: true,
    usageCount: 2,
    lastUsed: '2024-04-15',
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    category: 'saas',
    amount: 199,
    currency: '₪',
    renewalDate: '2025-05-28',
    status: 'active',
    usageCount: 8,
    lastUsed: '2024-05-18',
  },
  {
    id: '5',
    name: 'YouTube Premium',
    category: 'streaming',
    amount: 31.9,
    currency: '₪',
    trialEndsAt: '2025-06-05',
    renewalDate: '2025-06-05',
    status: 'trial',
    usageCount: 20,
    lastUsed: '2024-05-21',
  },
];