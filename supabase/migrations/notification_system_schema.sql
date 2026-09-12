-- =============================================================================
-- JEEVRAKSHAK AI - REGIONAL DISEASE ALERT & NOTIFICATION SYSTEM SCHEMA
-- SIH 2026 Innovation Milestone
-- =============================================================================

-- 1. Extend existing profiles table (Safe idempotent columns)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_account_notif_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS first_login_notif_sent BOOLEAN DEFAULT false;

-- 2. Disease Alerts Table
CREATE TABLE IF NOT EXISTS public.disease_alerts (
  id TEXT PRIMARY KEY DEFAULT ('alert-' || floor(extract(epoch from clock_timestamp()) * 1000)::text),
  disease_id TEXT NOT NULL DEFAULT 'dis-gen',
  disease_name TEXT NOT NULL,
  region_level TEXT NOT NULL CHECK (region_level IN ('state', 'district', 'block', 'village')),
  district TEXT NOT NULL,
  block TEXT,
  village TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  case_count INTEGER NOT NULL DEFAULT 1,
  reported_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alert_expiry_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  recommended_action TEXT NOT NULL,
  source_authority TEXT NOT NULL DEFAULT 'Department of Animal Husbandry, Govt of Maharashtra',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  target_audience TEXT NOT NULL DEFAULT 'both' CHECK (target_audience IN ('farmers', 'vets', 'both')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for rapid spatial and status lookups
CREATE INDEX IF NOT EXISTS idx_disease_alerts_district ON public.disease_alerts (district);
CREATE INDEX IF NOT EXISTS idx_disease_alerts_block ON public.disease_alerts (block);
CREATE INDEX IF NOT EXISTS idx_disease_alerts_status ON public.disease_alerts (status);
CREATE INDEX IF NOT EXISTS idx_disease_alerts_risk ON public.disease_alerts (risk_level);

-- 3. Notification History & Audit Log
CREATE TABLE IF NOT EXISTS public.notification_history (
  id TEXT PRIMARY KEY DEFAULT ('notif_hist_' || floor(extract(epoch from clock_timestamp()) * 1000)::text),
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_phone TEXT,
  user_email TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'veterinarian', 'government')),
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  disease_id TEXT,
  disease_name TEXT,
  region TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'SENT' CHECK (delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED')),
  failure_reason TEXT,
  related_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for delivery audits and deduplication lookups
CREATE INDEX IF NOT EXISTS idx_notif_hist_user_id ON public.notification_history (user_id);
CREATE INDEX IF NOT EXISTS idx_notif_hist_event ON public.notification_history (related_event_id);
CREATE INDEX IF NOT EXISTS idx_notif_hist_created ON public.notification_history (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_hist_type ON public.notification_history (notification_type);

-- 4. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id TEXT PRIMARY KEY,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  vaccination_reminders BOOLEAN NOT NULL DEFAULT true,
  disease_alerts BOOLEAN NOT NULL DEFAULT true,
  regional_risk_alerts BOOLEAN NOT NULL DEFAULT true,
  vaccination_campaigns BOOLEAN NOT NULL DEFAULT true,
  health_announcements BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and permissive policies for authenticated and anon operations
ALTER TABLE public.disease_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Disease Alerts') THEN
    CREATE POLICY "Public Read Disease Alerts" ON public.disease_alerts FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All Access Disease Alerts') THEN
    CREATE POLICY "All Access Disease Alerts" ON public.disease_alerts FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read Notification History') THEN
    CREATE POLICY "Public Read Notification History" ON public.notification_history FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All Access Notification History') THEN
    CREATE POLICY "All Access Notification History" ON public.notification_history FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'All Access Preferences') THEN
    CREATE POLICY "All Access Preferences" ON public.notification_preferences FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
