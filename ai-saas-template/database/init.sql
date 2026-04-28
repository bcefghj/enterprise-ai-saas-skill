-- ============================================================================
-- AiFlow - Complete Database Initialization
-- Supabase / PostgreSQL
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'free_user'
                CHECK (role IN ('free_user', 'pro_user', 'admin')),
  stripe_customer_id  TEXT UNIQUE,
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
                CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
  subscription_tier   TEXT NOT NULL DEFAULT 'free'
                CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- ============================================================================
-- 2. CONVERSATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'New Conversation',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);

-- ============================================================================
-- 3. MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content           TEXT NOT NULL,
  tokens_used       INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================================================
-- 4. USAGE (daily aggregation per user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  chat_count  INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX idx_usage_user_date ON usage(user_id, date);
CREATE INDEX idx_usage_date ON usage(date);

-- ============================================================================
-- 5. AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT,
  details       JSONB,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================================
-- 6. SYSTEM SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Default system settings
INSERT INTO system_settings (key, value) VALUES
  ('general', '{"system_name": "AiFlow", "tagline": "Enterprise AI Assistant Platform"}'),
  ('ai_config', '{"model": "MiniMax-M2.7", "max_tokens": 2048, "temperature": 0.7}'),
  ('security', '{"rate_limit_per_minute": 30, "rate_limit_per_day": 500}'),
  ('maintenance', '{"enabled": false, "message": "We are performing scheduled maintenance."}')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- TRIGGER: increment usage counters on new message
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_usage_on_message()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  INSERT INTO usage (user_id, date, chat_count, tokens_used)
  VALUES (v_user_id, CURRENT_DATE, 1, NEW.tokens_used)
  ON CONFLICT (user_id, date) DO UPDATE
    SET chat_count  = usage.chat_count + 1,
        tokens_used = usage.tokens_used + NEW.tokens_used;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_message_usage
  AFTER INSERT ON messages
  FOR EACH ROW
  WHEN (NEW.role = 'assistant')
  EXECUTE FUNCTION increment_usage_on_message();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY profiles_admin_select ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY profiles_admin_update ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_select_own ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversations_insert_own ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversations_update_own ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY conversations_delete_own ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_select_own ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY messages_insert_own ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Usage
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_select_own ON usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY usage_admin_select ON usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit Log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_admin_select ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY audit_log_insert_service ON audit_log
  FOR INSERT WITH CHECK (true);

-- System Settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_settings_select_all ON system_settings
  FOR SELECT USING (true);

CREATE POLICY system_settings_admin_update ON system_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY system_settings_admin_insert ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
