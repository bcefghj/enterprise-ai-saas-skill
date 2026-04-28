export * from './database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface PricingPlan {
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  price: number;
  priceId: string | null;
  features: string[];
  limits: { chatsPerDay: number; description: string };
  highlighted?: boolean;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalChatsToday: number;
  monthlyRevenue: number;
  userGrowth: number;
  subscriptionGrowth: number;
}
