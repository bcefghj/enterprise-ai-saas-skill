# Supabase Database Schema

Enterprise AI SaaS 的完整数据库初始化 SQL，涵盖表结构、RLS 策略、触发器、索引，以及从 schema 自动生成的 TypeScript 类型。

---

## 1. Tables

```sql
-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free_user'
    CHECK (role IN ('free_user', 'pro_user', 'admin')),
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
  subscription_tier TEXT DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage tracking
CREATE TABLE public.usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  chat_count INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Audit log (enterprise feature)
CREATE TABLE public.audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System settings
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES public.profiles(id)
);
```

---

## 2. Row Level Security (RLS) Policies

```sql
-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: check if current user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- profiles
-- ============================================================

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- conversations
-- ============================================================

CREATE POLICY "Users can CRUD own conversations"
  ON public.conversations FOR ALL
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- messages
-- ============================================================

CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "Users can insert own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- usage
-- ============================================================

CREATE POLICY "Users can read own usage"
  ON public.usage FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- ============================================================
-- audit_log
-- ============================================================

CREATE POLICY "Anyone can insert audit entries"
  ON public.audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read audit log"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- system_settings
-- ============================================================

CREATE POLICY "All authenticated users can read settings"
  ON public.system_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can write settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin());
```

---

## 3. Triggers

```sql
-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Generic updated_at timestamp keeper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-increment usage counters (called from Edge Function / server)
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_tokens  INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage (user_id, date, chat_count, tokens_used)
  VALUES (p_user_id, CURRENT_DATE, 1, p_tokens)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    chat_count  = public.usage.chat_count  + 1,
    tokens_used = public.usage.tokens_used + EXCLUDED.tokens_used;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 4. Indexes

```sql
-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_messages_conversation_created
  ON public.messages (conversation_id, created_at);

CREATE INDEX idx_usage_user_date
  ON public.usage (user_id, date);

CREATE INDEX idx_audit_log_user_created
  ON public.audit_log (user_id, created_at);

CREATE INDEX idx_profiles_stripe_customer
  ON public.profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
```

---

## 5. TypeScript Types

由 `supabase gen types typescript` 自动生成，手动维护时保持同步。

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      conversations: {
        Row: Conversation;
        Insert: ConversationInsert;
        Update: ConversationUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      usage: {
        Row: Usage;
        Insert: UsageInsert;
        Update: UsageUpdate;
      };
      audit_log: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
      system_settings: {
        Row: SystemSetting;
        Insert: SystemSettingInsert;
        Update: SystemSettingUpdate;
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      increment_usage: {
        Args: { p_user_id: string; p_tokens: number };
        Returns: undefined;
      };
    };
  };
}

// --------------- Row types ---------------

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "free_user" | "pro_user" | "admin";
  stripe_customer_id: string | null;
  subscription_status: "active" | "inactive" | "past_due" | "canceled";
  subscription_tier: "free" | "pro" | "enterprise";
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at"> &
  Partial<Pick<Profile, "role" | "subscription_status" | "subscription_tier">>;
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export type ConversationInsert = Pick<Conversation, "user_id"> &
  Partial<Pick<Conversation, "title">>;
export type ConversationUpdate = Partial<Pick<Conversation, "title">>;

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number;
  created_at: string;
}

export type MessageInsert = Pick<Message, "conversation_id" | "role" | "content"> &
  Partial<Pick<Message, "tokens_used">>;
export type MessageUpdate = Partial<Pick<Message, "content">>;

export interface Usage {
  id: string;
  user_id: string;
  date: string;
  chat_count: number;
  tokens_used: number;
}

export type UsageInsert = Pick<Usage, "user_id"> &
  Partial<Pick<Usage, "date" | "chat_count" | "tokens_used">>;
export type UsageUpdate = Partial<Pick<Usage, "chat_count" | "tokens_used">>;

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export type AuditLogInsert = Pick<AuditLog, "action" | "resource_type"> &
  Partial<Omit<AuditLog, "id" | "created_at" | "action" | "resource_type">>;
export type AuditLogUpdate = never;

export interface SystemSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
  updated_by: string | null;
}

export type SystemSettingInsert = Pick<SystemSetting, "key" | "value"> &
  Partial<Pick<SystemSetting, "updated_by">>;
export type SystemSettingUpdate = Partial<Pick<SystemSetting, "value" | "updated_by">>;
```
