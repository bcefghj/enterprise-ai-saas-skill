export type UserRole = 'free_user' | 'pro_user' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'past_due' | 'canceled';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  stripe_customer_id: string | null;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  date: string;
  chat_count: number;
  tokens_used: number;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

// Supabase Database type
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at' | 'updated_at'>; Update: Partial<Omit<Profile, 'id' | 'created_at'>> };
      conversations: { Row: Conversation; Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Omit<Conversation, 'id' | 'created_at'>> };
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at'>; Update: Partial<Omit<Message, 'id' | 'created_at'>> };
      usage: { Row: Usage; Insert: Omit<Usage, 'id'>; Update: Partial<Omit<Usage, 'id'>> };
      audit_log: { Row: AuditLogEntry; Insert: Omit<AuditLogEntry, 'id' | 'created_at'>; Update: never };
      system_settings: { Row: SystemSetting; Insert: Omit<SystemSetting, 'updated_at'>; Update: Partial<Omit<SystemSetting, 'key'>> };
    };
  };
}
