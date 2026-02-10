export type SubscriptionCategory = 
  | 'streaming' 
  | 'fitness' 
  | 'insurance' 
  | 'gaming' 
  | 'productivity' 
  | 'food' 
  | 'news' 
  | 'other';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  amount: number;
  currency: string;
  renewalDate: string;
  trialEndsAt?: string;
  status: 'active' | 'inactive' | 'trial';
  atRisk?: boolean;
}

export const CATEGORY_METADATA: Record<SubscriptionCategory, { label: string; icon: string; color: string }> = {
  streaming: { label: 'סטרימינג', icon: '📺', color: '#FF0000' },
  fitness: { label: 'כושר', icon: '💪', color: '#4CAF50' },
  insurance: { label: 'ביטוח', icon: '🛡️', color: '#2196F3' },
  gaming: { label: 'משחקים', icon: '🎮', color: '#9C27B0' },
  productivity: { label: 'פרודוקטיביות', icon: '🚀', color: '#FFC107' },
  food: { label: 'אוכל', icon: '🍕', color: '#FF5722' },
  news: { label: 'חדשות', icon: '📰', color: '#607D8B' },
  other: { label: 'אחר', icon: '✨', color: '#E91E63' },
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
  },
  {
    id: '2',
    name: 'Spotify Family',
    category: 'streaming',
    amount: 39.9,
    currency: '₪',
    renewalDate: '2025-06-10',
    status: 'active',
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
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    category: 'productivity',
    amount: 199,
    currency: '₪',
    renewalDate: '2025-05-28',
    status: 'active',
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
  },
];
