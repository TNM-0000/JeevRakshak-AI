-- ====================================================================
-- JEEVRAKSHAK AI - NATIONAL LIVESTOCK DISEASE SURVEILLANCE & HEALTH PLATFORM
-- SMART INDIA HACKATHON (SIH) COMPLETE ECOSYSTEM DATABASE SCHEMA
-- PostgreSQL / Supabase Schema covering Farmers, Veterinarians, & Government Officials
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. ENUMS & DOMAIN TYPES
-- --------------------------------------------------------------------
DO $$ BEGIN CREATE TYPE user_role_type AS ENUM (
  'super_admin', 'state_officer', 'district_officer', 'block_officer',
  'disease_monitoring_officer', 'vaccination_officer', 'emergency_response_officer',
  'veterinarian', 'farmer'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE species_type AS ENUM (
  'cattle', 'buffalo', 'goat', 'sheep', 'poultry', 'pig', 'horse', 'camel', 'dog', 'cat', 'rabbit', 'other'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE case_priority AS ENUM ('routine', 'urgent', 'critical', 'emergency_outbreak'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE case_workflow_status AS ENUM ('reported', 'assigned', 'accepted', 'in_diagnosis', 'treatment_ongoing', 'resolved', 'escalated', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE risk_level_type AS ENUM ('low', 'medium', 'high', 'critical'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE outbreak_status_type AS ENUM ('monitoring', 'active_confirmed', 'contained', 'resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE sample_status_type AS ENUM ('pending_collection', 'collected', 'in_transit_vidl', 'testing', 'result_ready'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE visit_status_type AS ENUM ('scheduled', 'in_progress', 'completed', 'rescheduled', 'cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE emergency_status_type AS ENUM ('alert_triggered', 'team_dispatched', 'on_site', 'stabilized', 'resolved'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------------
-- 2. ADMINISTRATIVE & SPATIAL GEOGRAPHY TABLES
-- --------------------------------------------------------------------

-- Table 1: states
CREATE TABLE IF NOT EXISTS states (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT UNIQUE NOT NULL, -- e.g. 'MH', 'GJ', 'KA'
  name_en TEXT NOT NULL,
  name_hi TEXT,
  name_mr TEXT,
  capital TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 2: districts
CREATE TABLE IF NOT EXISTS districts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  state_id TEXT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_hi TEXT,
  name_mr TEXT,
  headquarters TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 3: villages (and talukas/blocks)
CREATE TABLE IF NOT EXISTS villages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  block_taluka_en TEXT NOT NULL,
  block_taluka_hi TEXT,
  block_taluka_mr TEXT,
  village_name_en TEXT NOT NULL,
  village_name_hi TEXT,
  village_name_mr TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  livestock_population_estimate INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 3. AUTHENTICATION, ROLES & AUDITING
-- --------------------------------------------------------------------

-- Table 4: users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role_type NOT NULL,
  full_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  preferred_language TEXT DEFAULT 'en',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 5: roles
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role_name user_role_type UNIQUE NOT NULL,
  description TEXT,
  tier_level INT DEFAULT 1,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 6: permissions
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL, -- 'cases', 'prescriptions', 'outbreaks', 'census'
  can_create BOOLEAN DEFAULT FALSE,
  can_read BOOLEAN DEFAULT TRUE,
  can_update BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 7: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'LOGIN', 'PRESCRIBE_RX', 'CONTAINMENT_ORDER', 'VACCINE_LOG'
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 4. PROFILE SPECIALIZATIONS
-- --------------------------------------------------------------------

-- Table 8: veterinarians
CREATE TABLE IF NOT EXISTS veterinarians (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  qualification TEXT DEFAULT 'B.V.Sc & A.H.',
  specialization TEXT DEFAULT 'General Bovine & Small Ruminants',
  experience_years INT DEFAULT 0,
  hospital_name TEXT NOT NULL,
  hospital_type TEXT DEFAULT 'Government Veterinary Polyclinic',
  hospital_address TEXT NOT NULL,
  district_id TEXT REFERENCES districts(id),
  block_taluka TEXT,
  village TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  emergency_phone TEXT,
  is_available_for_emergency BOOLEAN DEFAULT TRUE,
  government_verified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 9: farmers
CREATE TABLE IF NOT EXISTS farmers (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  farm_name TEXT,
  village_id TEXT REFERENCES villages(id),
  district_id TEXT REFERENCES districts(id),
  block_taluka TEXT,
  village_name TEXT,
  state TEXT DEFAULT 'Maharashtra',
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  registered_animals_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 10: government_officials
CREATE TABLE IF NOT EXISTS government_officials (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  department TEXT DEFAULT 'Department of Animal Husbandry & Dairying',
  designation TEXT NOT NULL, -- 'State Officer', 'DAHO', 'Block Officer'
  jurisdiction_level TEXT NOT NULL, -- 'national', 'state', 'district', 'block'
  assigned_state_id TEXT REFERENCES states(id),
  assigned_district_id TEXT REFERENCES districts(id),
  official_email TEXT,
  phone_extension TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 5. LIVESTOCK, HERDS & CENSUS
-- --------------------------------------------------------------------

-- Table 11: animals
CREATE TABLE IF NOT EXISTS animals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  owner_farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  tag_number TEXT UNIQUE NOT NULL,
  name TEXT,
  species species_type NOT NULL,
  breed TEXT,
  age_months INT,
  weight_kg NUMERIC(6,2),
  gender TEXT DEFAULT 'female',
  is_vaccinated BOOLEAN DEFAULT FALSE,
  current_health_status TEXT DEFAULT 'healthy', -- 'healthy', 'under_treatment', 'quarantined', 'deceased'
  qr_code_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 12: animal_health_records
CREATE TABLE IF NOT EXISTS animal_health_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'DIAGNOSIS', 'VACCINATION', 'SURGERY', 'DEWORMING', 'RECOVERY'
  description TEXT NOT NULL,
  recorded_by_doctor_id TEXT REFERENCES veterinarians(id),
  event_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 6. CLINICAL TRIAGE, DIAGNOSES & TREATMENTS (Doctor-Linked)
-- --------------------------------------------------------------------

-- Table 13: cases
CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_number TEXT UNIQUE NOT NULL,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  assigned_doctor_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  priority case_priority DEFAULT 'routine',
  workflow_status case_workflow_status DEFAULT 'reported',
  reported_symptoms TEXT[] DEFAULT '{}',
  ai_preliminary_disease TEXT,
  ai_confidence_percent NUMERIC(5,2),
  initial_farmer_notes TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 14: symptom_records
CREATE TABLE IF NOT EXISTS symptom_records (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  symptom_key TEXT NOT NULL,
  severity_rating INT CHECK (severity_rating BETWEEN 1 AND 5),
  onset_days INT DEFAULT 1,
  body_temperature_f NUMERIC(5,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 15: diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  primary_diagnosis TEXT NOT NULL,
  secondary_diagnosis TEXT,
  icd_veterinary_code TEXT,
  differential_diagnosis TEXT[],
  clinical_observations TEXT NOT NULL,
  contagion_risk risk_level_type DEFAULT 'low',
  quarantine_recommended BOOLEAN DEFAULT FALSE,
  is_notifiable_disease BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 16: treatments
CREATE TABLE IF NOT EXISTS treatments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  diagnosis_id TEXT REFERENCES diagnoses(id) ON DELETE SET NULL,
  doctor_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  treatment_plan TEXT NOT NULL,
  route_of_administration TEXT, -- 'IM', 'IV', 'SC', 'Oral', 'Topical'
  duration_days INT DEFAULT 3,
  clinical_instructions TEXT,
  follow_up_date DATE,
  outcome TEXT DEFAULT 'under_treatment', -- 'recovered', 'improving', 'critical', 'deceased'
  recovery_notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 17: medicines
CREATE TABLE IF NOT EXISTS medicines (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Antibiotic', 'NSAID', 'Anthelminthic', 'Antipyretic', 'Vaccine'
  standard_dosage_formula TEXT,
  contraindications TEXT,
  withdrawal_period_days INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 18: prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  treatment_id TEXT NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  medicine_id TEXT REFERENCES medicines(id),
  medicine_custom_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL, -- 'OD (Once Daily)', 'BD (Twice Daily)', 'TDS'
  duration_text TEXT NOT NULL,
  digital_signature_hash TEXT,
  qr_verification_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 7. VACCINATIONS & CAMPAIGNS
-- --------------------------------------------------------------------

-- Table 19: vaccination_campaigns
CREATE TABLE IF NOT EXISTS vaccination_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_code TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  title_mr TEXT,
  target_disease TEXT NOT NULL, -- 'FMD', 'Lumpy Skin', 'Brucellosis', 'PPR'
  target_species species_type[] NOT NULL,
  target_district_id TEXT REFERENCES districts(id),
  target_count INT NOT NULL,
  achieved_count INT DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 20: vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  animal_id TEXT NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  doctor_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  campaign_id TEXT REFERENCES vaccination_campaigns(id) ON DELETE SET NULL,
  vaccine_name TEXT NOT NULL,
  batch_number TEXT NOT NULL,
  administered_date DATE NOT NULL DEFAULT CURRENT_DATE,
  booster_due_date DATE,
  certificate_number TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 8. FIELD VISITS & TELE-COMMUNICATION
-- --------------------------------------------------------------------

-- Table 21: appointments
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  animal_id TEXT REFERENCES animals(id),
  scheduled_slot TIMESTAMPTZ NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 22: field_visits
CREATE TABLE IF NOT EXISTS field_visits (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  doctor_id TEXT NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purpose TEXT NOT NULL,
  visit_status visit_status_type DEFAULT 'scheduled',
  gps_latitude DOUBLE PRECISION,
  gps_longitude DOUBLE PRECISION,
  clinical_notes TEXT,
  biosecurity_advice TEXT,
  distance_travelled_km NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 23: messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  sender_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id TEXT REFERENCES cases(id),
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 9. EPIDEMIOLOGY, OUTBREAKS & AI FORECASTING (Government Integrated)
-- --------------------------------------------------------------------

-- Table 24: outbreaks
CREATE TABLE IF NOT EXISTS outbreaks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outbreak_code TEXT UNIQUE NOT NULL,
  disease_name TEXT NOT NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  epicenter_village_id TEXT REFERENCES villages(id),
  epicenter_lat DOUBLE PRECISION NOT NULL,
  epicenter_lng DOUBLE PRECISION NOT NULL,
  containment_radius_km NUMERIC(5,2) DEFAULT 5.0,
  affected_herds_count INT DEFAULT 1,
  affected_animals_count INT DEFAULT 1,
  mortality_count INT DEFAULT 0,
  severity risk_level_type DEFAULT 'critical',
  outbreak_status outbreak_status_type DEFAULT 'active_confirmed',
  quarantine_enforced BOOLEAN DEFAULT TRUE,
  market_closure_ordered BOOLEAN DEFAULT FALSE,
  ring_vaccination_active BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 25: disease_reports
CREATE TABLE IF NOT EXISTS disease_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporting_doctor_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  district_id TEXT NOT NULL REFERENCES districts(id),
  disease_name TEXT NOT NULL,
  suspected_species species_type NOT NULL,
  cases_observed INT DEFAULT 1,
  mortalities INT DEFAULT 0,
  clinical_summary TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  is_outbreak_risk BOOLEAN DEFAULT FALSE,
  reported_to_daho BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 26: outbreak_alerts (Government Broadcasts)
CREATE TABLE IF NOT EXISTS outbreak_alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  outbreak_id TEXT REFERENCES outbreaks(id) ON DELETE CASCADE,
  target_district_id TEXT REFERENCES districts(id),
  headline TEXT NOT NULL,
  guidelines TEXT NOT NULL,
  broadcast_channels TEXT[] DEFAULT '{"sms","push","ivr"}',
  dispatched_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'dispatched',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 27: ai_predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  district_id TEXT NOT NULL REFERENCES districts(id),
  target_disease TEXT NOT NULL,
  predicted_risk_level risk_level_type NOT NULL,
  risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
  confidence_percentage NUMERIC(5,2) NOT NULL,
  contributing_weather_factors JSONB DEFAULT '{}', -- temp, humidity, rainfall
  recommended_containment_action TEXT,
  forecast_date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 10. RESOURCE ALLOCATION, EMERGENCIES & GOVERNANCE
-- --------------------------------------------------------------------

-- Table 28: resource_allocations
CREATE TABLE IF NOT EXISTS resource_allocations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  district_id TEXT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- 'Mobile Vet Van 1962', 'FMD Vaccines', 'Antibiotic Kits'
  quantity_allocated INT NOT NULL,
  quantity_available INT NOT NULL,
  is_shortage_detected BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'deployed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 29: emergency_cases (1962 Rapid Response)
CREATE TABLE IF NOT EXISTS emergency_cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  emergency_code TEXT UNIQUE NOT NULL,
  case_id TEXT REFERENCES cases(id) ON DELETE SET NULL,
  caller_name TEXT NOT NULL,
  caller_phone TEXT NOT NULL,
  village_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  incident_type TEXT NOT NULL, -- 'Severe Outbreak Spill', 'Toxic Ingestion', 'Acute Trauma'
  dispatched_doctor_id TEXT REFERENCES veterinarians(id),
  dispatched_van_number TEXT,
  emergency_status emergency_status_type DEFAULT 'alert_triggered',
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 30: complaints (Public & Vet Grievance Redressal)
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  submitted_by_user_id TEXT REFERENCES users(id),
  complaint_type TEXT NOT NULL, -- 'Medicine Shortage', 'Doctor Unavailability', 'Delayed Response'
  description TEXT NOT NULL,
  assigned_officer_id TEXT REFERENCES government_officials(id),
  resolution_status TEXT DEFAULT 'open', -- 'open', 'under_investigation', 'resolved'
  resolution_notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- Table 31: awareness_campaigns
CREATE TABLE IF NOT EXISTS awareness_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title_en TEXT NOT NULL,
  title_hi TEXT,
  title_mr TEXT,
  topic TEXT NOT NULL, -- 'Foot and Mouth Disease Biosecurity', 'Mastitis Prevention'
  video_url TEXT,
  infographic_url TEXT,
  target_audience TEXT DEFAULT 'Livestock Farmers',
  total_views INT DEFAULT 0,
  feedback_rating NUMERIC(3,2) DEFAULT 5.0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_by TEXT
);

-- --------------------------------------------------------------------
-- 11. INDEXES FOR HIGH-PERFORMANCE ANALYTICS & GIS LOOKUPS
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_cases_assigned_doctor ON cases(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_cases_farmer ON cases(farmer_id);
CREATE INDEX IF NOT EXISTS idx_cases_workflow_status ON cases(workflow_status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_doctor ON diagnoses(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatments_doctor ON treatments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatments_animal ON treatments(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_doctor ON vaccinations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_animal ON vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_field_visits_doctor ON field_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_outbreaks_district ON outbreaks(district_id);
CREATE INDEX IF NOT EXISTS idx_outbreaks_status ON outbreaks(outbreak_status);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_district ON ai_predictions(district_id);

-- --------------------------------------------------------------------
-- 12. ROW-LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbreaks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active outbreaks, campaigns, and medicines
CREATE POLICY p_public_outbreaks ON outbreaks FOR SELECT USING (true);
CREATE POLICY p_public_medicines ON medicines FOR SELECT USING (true);
CREATE POLICY p_public_campaigns ON vaccination_campaigns FOR SELECT USING (true);

-- Doctor Isolation Policy: Doctors can select and insert records linked to their doctor_id
CREATE POLICY p_doctor_cases ON cases FOR ALL USING (
  assigned_doctor_id = auth.uid()::text OR assigned_doctor_id IS NULL OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role IN ('super_admin', 'state_officer', 'district_officer')
  )
);

CREATE POLICY p_doctor_diagnoses ON diagnoses FOR ALL USING (
  doctor_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role IN ('super_admin', 'state_officer', 'district_officer')
  )
);

CREATE POLICY p_doctor_treatments ON treatments FOR ALL USING (
  doctor_id = auth.uid()::text OR EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role IN ('super_admin', 'state_officer', 'district_officer')
  )
);

-- ====================================================================
-- END OF COMPLETE JEEVRAKSHAK AI ENTERPRISE SCHEMA (31 TABLES)
-- ====================================================================
