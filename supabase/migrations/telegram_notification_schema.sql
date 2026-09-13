-- =============================================================================
-- JEEVRAKSHAK AI - TELEGRAM BOT NOTIFICATION SYSTEM SCHEMA
-- SIH 2026 Innovation Milestone
-- =============================================================================

-- 1. Extend existing profiles table (Safe idempotent columns)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS telegram_connected BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS telegram_connected_at TIMESTAMPTZ;

-- 2. Dedicated Telegram Connections Table
CREATE TABLE IF NOT EXISTS public.telegram_connections (
  id TEXT PRIMARY KEY DEFAULT ('tg_conn_' || floor(extract(epoch from clock_timestamp()) * 1000)::text),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  telegram_chat_id TEXT NOT NULL,
  telegram_username TEXT,
  first_name TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_telegram_chat_id UNIQUE (telegram_chat_id)
);

CREATE INDEX IF NOT EXISTS idx_tg_conn_user_id ON public.telegram_connections (user_id);
CREATE INDEX IF NOT EXISTS idx_tg_conn_chat_id ON public.telegram_connections (telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_tg_conn_status ON public.telegram_connections (status);

-- 3. Temporary Secure One-Time Linking Tokens Table
CREATE TABLE IF NOT EXISTS public.telegram_linking_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_tg_tokens_user_id ON public.telegram_linking_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_tg_tokens_expires ON public.telegram_linking_tokens (expires_at);

-- 4. Extend Notification Preferences Table with telegram_enabled
ALTER TABLE IF EXISTS public.notification_preferences
  ADD COLUMN IF NOT EXISTS telegram_enabled BOOLEAN NOT NULL DEFAULT true;

-- 5. Row Level Security & Access Policies
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_linking_tokens ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Telegram Connections') THEN
    CREATE POLICY "Public Read Telegram Connections" ON public.telegram_connections FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All Access Telegram Connections') THEN
    CREATE POLICY "All Access Telegram Connections" ON public.telegram_connections FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All Access Linking Tokens') THEN
    CREATE POLICY "All Access Linking Tokens" ON public.telegram_linking_tokens FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
