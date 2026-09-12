-- ====================================================================
-- JEEVRAKSHAK AI (महाराष्ट्र शासन - Department of Animal Husbandry)
-- Comprehensive PostgreSQL Schema: 19 Tables with Full Multilingual Support
-- Languages Supported: English ('en'), Hindi ('hi'), Marathi ('mr')
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ENUMS
-- --------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE location_level AS ENUM ('district', 'block', 'village');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE report_source AS ENUM ('web', 'mobile', 'ivr');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM ('suspected', 'probable', 'confirmed', 'ruled_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE triage_method AS ENUM ('rule_based', 'ai_assisted', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sample_status AS ENUM ('collected', 'sent', 'received', 'tested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE escalation_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('farmer', 'veterinarian', 'government');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE outbreak_status AS ENUM ('active', 'contained', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('health_alert', 'outbreak_alert', 'advisory', 'advisories', 'escalation', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------------
-- 2. TABLES WITH MULTILINGUAL COLUMNS (name_en, name_hi, name_mr, etc.)
-- --------------------------------------------------------------------

-- Table 1: administrative_locations
CREATE TABLE IF NOT EXISTS administrative_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_hi TEXT,
  name_mr TEXT,
  level location_level NOT NULL,
  parent_id TEXT REFERENCES administrative_locations(id) ON DELETE SET NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  location_id TEXT REFERENCES administrative_locations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  preferred_language TEXT DEFAULT 'mr', -- 'mr', 'hi', 'en'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: profile_roles
CREATE TABLE IF NOT EXISTS profile_roles (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (profile_id, role)
);

-- Table 4: herds
CREATE TABLE IF NOT EXISTS herds (
  id TEXT PRIMARY KEY,
  owner_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  name_hi TEXT,
  name_mr TEXT,
  location_id TEXT REFERENCES administrative_locations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: animals
CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY,
  herd_id TEXT NOT NULL REFERENCES herds(id) ON DELETE CASCADE,
  tag_number TEXT NOT NULL,
  species TEXT NOT NULL,
  species_en TEXT,
  species_hi TEXT,
  species_mr TEXT,
  breed TEXT NOT NULL,
  breed_en TEXT,
  breed_hi TEXT,
  breed_mr TEXT,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: health_reports
CREATE TABLE IF NOT EXISTS health_reports (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source report_source NOT NULL DEFAULT 'mobile',
  symptoms TEXT NOT NULL,
  symptoms_en TEXT,
  symptoms_hi TEXT,
  symptoms_mr TEXT,
  mortality_count INTEGER DEFAULT 0,
  notes TEXT,
  notes_en TEXT,
  notes_hi TEXT,
  notes_mr TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: case_assessments
CREATE TABLE IF NOT EXISTS case_assessments (
  id TEXT PRIMARY KEY,
  health_report_id TEXT NOT NULL REFERENCES health_reports(id) ON DELETE CASCADE,
  status case_status NOT NULL DEFAULT 'suspected',
  triage_method triage_method NOT NULL DEFAULT 'ai_assisted',
  assessment_notes TEXT,
  assessment_notes_en TEXT,
  assessment_notes_hi TEXT,
  assessment_notes_mr TEXT,
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: animal_treatments
CREATE TABLE IF NOT EXISTS animal_treatments (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  prescribed_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  treatment_name TEXT NOT NULL,
  treatment_name_en TEXT,
  treatment_name_hi TEXT,
  treatment_name_mr TEXT,
  dosage TEXT NOT NULL,
  treatment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  notes_en TEXT,
  notes_hi TEXT,
  notes_mr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 9: animal_vaccinations
CREATE TABLE IF NOT EXISTS animal_vaccinations (
  id TEXT PRIMARY KEY,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_name_en TEXT,
  vaccine_name_hi TEXT,
  vaccine_name_mr TEXT,
  vaccination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  administered_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  notes_en TEXT,
  notes_hi TEXT,
  notes_mr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 10: diagnostic_samples
CREATE TABLE IF NOT EXISTS diagnostic_samples (
  id TEXT PRIMARY KEY,
  health_report_id TEXT NOT NULL REFERENCES health_reports(id) ON DELETE CASCADE,
  sample_type TEXT NOT NULL,
  sample_type_en TEXT,
  sample_type_hi TEXT,
  sample_type_mr TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  tested_at TIMESTAMPTZ,
  status sample_status NOT NULL DEFAULT 'collected',
  result TEXT,
  result_en TEXT,
  result_hi TEXT,
  result_mr TEXT,
  notes TEXT,
  notes_en TEXT,
  notes_hi TEXT,
  notes_mr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 11: case_escalations
CREATE TABLE IF NOT EXISTS case_escalations (
  id TEXT PRIMARY KEY,
  health_report_id TEXT NOT NULL REFERENCES health_reports(id) ON DELETE CASCADE,
  escalated_to TEXT NOT NULL,
  reason TEXT NOT NULL,
  reason_en TEXT,
  reason_hi TEXT,
  reason_mr TEXT,
  status escalation_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Table 12: health_advisories
CREATE TABLE IF NOT EXISTS health_advisories (
  id TEXT PRIMARY KEY,
  health_report_id TEXT REFERENCES health_reports(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_hi TEXT,
  title_mr TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  message_hi TEXT,
  message_mr TEXT,
  language TEXT NOT NULL DEFAULT 'en', -- 'en', 'hi', 'mr'
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 13: herd_health_events
CREATE TABLE IF NOT EXISTS herd_health_events (
  id TEXT PRIMARY KEY,
  herd_id TEXT NOT NULL REFERENCES herds(id) ON DELETE CASCADE,
  reported_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  affected_count INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  description TEXT,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 14: disease_catalog
CREATE TABLE IF NOT EXISTS disease_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  name_hi TEXT,
  name_mr TEXT,
  description TEXT,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  species TEXT NOT NULL,
  severity risk_level NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 15: health_report_diseases
CREATE TABLE IF NOT EXISTS health_report_diseases (
  id TEXT PRIMARY KEY,
  health_report_id TEXT NOT NULL REFERENCES health_reports(id) ON DELETE CASCADE,
  disease_id TEXT NOT NULL REFERENCES disease_catalog(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  confidence DOUBLE PRECISION,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 16: weather_observations
CREATE TABLE IF NOT EXISTS weather_observations (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL REFERENCES administrative_locations(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ DEFAULT NOW(),
  temperature_c DOUBLE PRECISION,
  humidity_percent DOUBLE PRECISION,
  rainfall_mm DOUBLE PRECISION,
  wind_speed_kmh DOUBLE PRECISION,
  description TEXT,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 17: risk_assessments
CREATE TABLE IF NOT EXISTS risk_assessments (
  id TEXT PRIMARY KEY,
  health_report_id TEXT REFERENCES health_reports(id) ON DELETE CASCADE,
  location_id TEXT REFERENCES administrative_locations(id) ON DELETE SET NULL,
  risk_level risk_level NOT NULL DEFAULT 'medium',
  risk_score DOUBLE PRECISION,
  assessment_method triage_method NOT NULL DEFAULT 'ai_assisted',
  reasoning TEXT,
  assessed_by TEXT,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 18: outbreak_events
CREATE TABLE IF NOT EXISTS outbreak_events (
  id TEXT PRIMARY KEY,
  disease_id TEXT NOT NULL REFERENCES disease_catalog(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL REFERENCES administrative_locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  title_hi TEXT,
  title_mr TEXT,
  description TEXT,
  description_en TEXT,
  description_hi TEXT,
  description_mr TEXT,
  severity risk_level NOT NULL DEFAULT 'high',
  affected_herds INTEGER DEFAULT 0,
  affected_animals INTEGER DEFAULT 0,
  mortality_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status outbreak_status NOT NULL DEFAULT 'active',
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 19: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  recipient_profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  health_report_id TEXT REFERENCES health_reports(id) ON DELETE SET NULL,
  outbreak_event_id TEXT REFERENCES outbreak_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  title_hi TEXT,
  title_mr TEXT,
  message TEXT NOT NULL,
  message_en TEXT,
  message_hi TEXT,
  message_mr TEXT,
  notification_type notification_type NOT NULL DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- --------------------------------------------------------------------
-- 3. MIGRATION COMMANDS: ADD MULTILINGUAL COLUMNS TO EXISTING TABLES
-- (Safely runs if tables were created previously without localized columns)
-- --------------------------------------------------------------------
ALTER TABLE administrative_locations
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_hi TEXT,
  ADD COLUMN IF NOT EXISTS name_mr TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'mr';

ALTER TABLE herds
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_hi TEXT,
  ADD COLUMN IF NOT EXISTS name_mr TEXT;

ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS species_en TEXT,
  ADD COLUMN IF NOT EXISTS species_hi TEXT,
  ADD COLUMN IF NOT EXISTS species_mr TEXT,
  ADD COLUMN IF NOT EXISTS breed_en TEXT,
  ADD COLUMN IF NOT EXISTS breed_hi TEXT,
  ADD COLUMN IF NOT EXISTS breed_mr TEXT;

ALTER TABLE health_reports
  ADD COLUMN IF NOT EXISTS symptoms_en TEXT,
  ADD COLUMN IF NOT EXISTS symptoms_hi TEXT,
  ADD COLUMN IF NOT EXISTS symptoms_mr TEXT,
  ADD COLUMN IF NOT EXISTS notes_en TEXT,
  ADD COLUMN IF NOT EXISTS notes_hi TEXT,
  ADD COLUMN IF NOT EXISTS notes_mr TEXT;

ALTER TABLE case_assessments
  ADD COLUMN IF NOT EXISTS assessment_notes_en TEXT,
  ADD COLUMN IF NOT EXISTS assessment_notes_hi TEXT,
  ADD COLUMN IF NOT EXISTS assessment_notes_mr TEXT;

ALTER TABLE animal_treatments
  ADD COLUMN IF NOT EXISTS treatment_name_en TEXT,
  ADD COLUMN IF NOT EXISTS treatment_name_hi TEXT,
  ADD COLUMN IF NOT EXISTS treatment_name_mr TEXT,
  ADD COLUMN IF NOT EXISTS notes_en TEXT,
  ADD COLUMN IF NOT EXISTS notes_hi TEXT,
  ADD COLUMN IF NOT EXISTS notes_mr TEXT;

ALTER TABLE animal_vaccinations
  ADD COLUMN IF NOT EXISTS vaccine_name_en TEXT,
  ADD COLUMN IF NOT EXISTS vaccine_name_hi TEXT,
  ADD COLUMN IF NOT EXISTS vaccine_name_mr TEXT,
  ADD COLUMN IF NOT EXISTS notes_en TEXT,
  ADD COLUMN IF NOT EXISTS notes_hi TEXT,
  ADD COLUMN IF NOT EXISTS notes_mr TEXT;

ALTER TABLE diagnostic_samples
  ADD COLUMN IF NOT EXISTS sample_type_en TEXT,
  ADD COLUMN IF NOT EXISTS sample_type_hi TEXT,
  ADD COLUMN IF NOT EXISTS sample_type_mr TEXT,
  ADD COLUMN IF NOT EXISTS result_en TEXT,
  ADD COLUMN IF NOT EXISTS result_hi TEXT,
  ADD COLUMN IF NOT EXISTS result_mr TEXT,
  ADD COLUMN IF NOT EXISTS notes_en TEXT,
  ADD COLUMN IF NOT EXISTS notes_hi TEXT,
  ADD COLUMN IF NOT EXISTS notes_mr TEXT;

ALTER TABLE case_escalations
  ADD COLUMN IF NOT EXISTS reason_en TEXT,
  ADD COLUMN IF NOT EXISTS reason_hi TEXT,
  ADD COLUMN IF NOT EXISTS reason_mr TEXT;

ALTER TABLE health_advisories
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS title_mr TEXT,
  ADD COLUMN IF NOT EXISTS message_en TEXT,
  ADD COLUMN IF NOT EXISTS message_hi TEXT,
  ADD COLUMN IF NOT EXISTS message_mr TEXT;

ALTER TABLE herd_health_events
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_mr TEXT;

ALTER TABLE disease_catalog
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_hi TEXT,
  ADD COLUMN IF NOT EXISTS name_mr TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_mr TEXT;

ALTER TABLE weather_observations
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_mr TEXT;

ALTER TABLE outbreak_events
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS title_mr TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_hi TEXT,
  ADD COLUMN IF NOT EXISTS description_mr TEXT;

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_hi TEXT,
  ADD COLUMN IF NOT EXISTS title_mr TEXT,
  ADD COLUMN IF NOT EXISTS message_en TEXT,
  ADD COLUMN IF NOT EXISTS message_hi TEXT,
  ADD COLUMN IF NOT EXISTS message_mr TEXT;

-- --------------------------------------------------------------------
-- 4. DISABLE RLS FOR SEAMLESS APPLICATION ACCESS (OR CONFIGURE RLS)
-- --------------------------------------------------------------------
ALTER TABLE administrative_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE herds DISABLE ROW LEVEL SECURITY;
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_treatments DISABLE ROW LEVEL SECURITY;
ALTER TABLE animal_vaccinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_samples DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_escalations DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_advisories DISABLE ROW LEVEL SECURITY;
ALTER TABLE herd_health_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE disease_catalog DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_report_diseases DISABLE ROW LEVEL SECURITY;
ALTER TABLE weather_observations DISABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE outbreak_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
