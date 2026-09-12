-- ====================================================================================
-- JEEVRAKSHAK AI - DEDICATED INTERACTIVE VOICE RESPONSE (IVR) DATABASE SCHEMA
-- Multi-Lingual Rural Toll-Free Telephony, Voice Triage & Central Synchronization
-- Problem Statement: #26128 | Smart India Hackathon
-- ====================================================================================

-- Enable PostGIS & UUID extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ------------------------------------------------------------------------------------
-- ENUM DEFINITIONS
-- ------------------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE ivr_call_status AS ENUM (
        'ringing', 'in_progress', 'completed', 'missed', 'busy', 'failed', 'transferred'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ivr_menu_option AS ENUM (
        'disease_reporting', 'vaccination_info', 'vet_consultation', 
        'emergency_sos', 'gov_announcements', 'complaints_feedback'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ivr_priority AS ENUM ('routine', 'elevated', 'urgent', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ivr_callback_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ivr_feedback_category AS ENUM (
        'service_delay', 'medicine_unavailability', 'vet_hospital_conduct', 
        'vaccination_camp', 'app_suggestion', 'other'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------------
-- TABLE 1: ivr_calls
-- Core call session log capturing inbound calls, caller metadata, duration, and status
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_sid VARCHAR(64) UNIQUE,
    caller_phone VARCHAR(20) NOT NULL,
    caller_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    toll_free_number VARCHAR(20) DEFAULT '1800-120-JEEV',
    language VARCHAR(10) DEFAULT 'mr', -- hi, mr, en, gu, ta, te, kn, bn, pa
    status ivr_call_status DEFAULT 'completed',
    direction VARCHAR(10) DEFAULT 'inbound', -- inbound or outbound_callback
    duration_seconds INTEGER DEFAULT 0,
    primary_intent ivr_menu_option,
    dtmf_digits_pressed VARCHAR(64),
    district VARCHAR(64) DEFAULT 'Pune',
    taluka VARCHAR(64) DEFAULT 'Shirur',
    village VARCHAR(64),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 2: ivr_sessions
-- Live session state machine tracking multi-step interactive DTMF flows
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE CASCADE,
    caller_phone VARCHAR(20) NOT NULL,
    current_step VARCHAR(64) NOT NULL, -- e.g. 'language_select', 'menu', 'select_animal', 'select_symptoms', 'record_audio'
    language VARCHAR(10) DEFAULT 'mr',
    selected_animal VARCHAR(32),
    selected_symptoms TEXT[] DEFAULT '{}',
    voice_recording_url TEXT,
    case_id VARCHAR(32),
    is_completed BOOLEAN DEFAULT FALSE,
    session_data JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 3: ivr_voice_recordings
-- Audio recordings of farmer descriptions, symptoms, and grievances
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_voice_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE CASCADE,
    caller_phone VARCHAR(20) NOT NULL,
    recording_sid VARCHAR(64),
    audio_url TEXT NOT NULL,
    duration_seconds NUMERIC(6, 2) DEFAULT 0,
    channels INTEGER DEFAULT 1,
    sample_rate INTEGER DEFAULT 16000,
    encoding VARCHAR(16) DEFAULT 'audio/webm',
    file_size_bytes BIGINT,
    purpose VARCHAR(32) DEFAULT 'disease_description', -- 'disease_description', 'complaint', 'callback_reason'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 4: ivr_transcripts
-- Automatic Speech-to-Text (STT) transcription in regional language and English
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id UUID REFERENCES public.ivr_voice_recordings(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE CASCADE,
    detected_language VARCHAR(10) DEFAULT 'mr',
    raw_transcript TEXT NOT NULL,
    english_translation TEXT,
    confidence_score NUMERIC(5, 4) DEFAULT 0.9500,
    stt_engine VARCHAR(32) DEFAULT 'Whisper-Large-v3-Bhashini',
    extracted_symptoms TEXT[] DEFAULT '{}',
    extracted_urgency ivr_priority DEFAULT 'routine',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 5: ivr_reports
-- Official disease reports submitted via voice, linked with central database & case ID
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(32) UNIQUE NOT NULL, -- e.g. JRK-2026-00125
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE SET NULL,
    recording_id UUID REFERENCES public.ivr_voice_recordings(id) ON DELETE SET NULL,
    transcript_id UUID REFERENCES public.ivr_transcripts(id) ON DELETE SET NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    farmer_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    animal_type VARCHAR(32) NOT NULL, -- Cow, Buffalo, Goat, Sheep, Poultry, Pig, Horse, Other
    symptoms TEXT[] NOT NULL DEFAULT '{}',
    suspected_disease VARCHAR(128) NOT NULL,
    risk_level ivr_priority DEFAULT 'elevated',
    assigned_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_hospital_name VARCHAR(255) DEFAULT 'Taluka Veterinary Polyclinic',
    district VARCHAR(64) DEFAULT 'Pune',
    taluka VARCHAR(64) DEFAULT 'Shirur',
    village VARCHAR(64) DEFAULT 'Shirapur',
    status VARCHAR(32) DEFAULT 'pending_review', -- 'pending_review', 'accepted', 'investigating', 'resolved'
    ai_confidence_score NUMERIC(5, 2) DEFAULT 88.50,
    recommended_actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 6: ivr_symptoms
-- Reference catalog of DTMF-selectable and voice-extracted symptoms
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_symptoms (
    id VARCHAR(32) PRIMARY KEY,
    dtmf_key VARCHAR(4),
    name_en VARCHAR(64) NOT NULL,
    name_hi VARCHAR(64) NOT NULL,
    name_mr VARCHAR(64) NOT NULL,
    name_gu VARCHAR(64),
    severity_weight INTEGER DEFAULT 1,
    is_contagious_marker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 7: ivr_callback_requests
-- Farmer callback requests when veterinarian is unavailable or consultation is requested
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_callback_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE SET NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    farmer_name VARCHAR(128) DEFAULT 'Livestock Owner',
    animal_type VARCHAR(32) DEFAULT 'Cattle',
    district VARCHAR(64) DEFAULT 'Pune',
    taluka VARCHAR(64) DEFAULT 'Shirur',
    village VARCHAR(64) DEFAULT 'Shirapur',
    reason TEXT DEFAULT 'Veterinary medical consultation requested via IVR',
    recording_id UUID REFERENCES public.ivr_voice_recordings(id) ON DELETE SET NULL,
    transcript TEXT,
    priority ivr_priority DEFAULT 'urgent',
    assigned_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status ivr_callback_status DEFAULT 'pending',
    resolution_notes TEXT,
    called_back_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 8: ivr_emergency_cases
-- Option 4 High-Priority Critical Cases triggering 1962 SOS ambulance dispatch
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_emergency_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    emergency_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. SOS-1962-8921
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE SET NULL,
    farmer_phone VARCHAR(20) NOT NULL,
    animal_type VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    district VARCHAR(64) DEFAULT 'Pune',
    taluka VARCHAR(64) DEFAULT 'Shirur',
    village VARCHAR(64) DEFAULT 'Shirapur',
    priority ivr_priority DEFAULT 'critical',
    dispatched_unit VARCHAR(64) DEFAULT 'Mobile Veterinary Clinic Van #MH-12-EM-1962',
    response_status VARCHAR(32) DEFAULT 'dispatched', -- 'dispatched', 'on_site', 'admitted', 'stabilized'
    eta_minutes INTEGER DEFAULT 25,
    assigned_doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notified_daho BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 9: ivr_announcements
-- Option 5 Government Outbreak Bulletins and NADCP vaccination announcements
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content_en TEXT NOT NULL,
    content_hi TEXT NOT NULL,
    content_mr TEXT NOT NULL,
    audio_en_url TEXT,
    audio_hi_url TEXT,
    audio_mr_url TEXT,
    category VARCHAR(64) DEFAULT 'outbreak_alert', -- 'outbreak_alert', 'vaccination_campaign', 'advisory'
    target_district VARCHAR(64) DEFAULT 'Pune',
    target_taluka VARCHAR(64) DEFAULT 'All',
    is_active BOOLEAN DEFAULT TRUE,
    priority ivr_priority DEFAULT 'urgent',
    play_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 10: ivr_feedback
-- Option 6 Farmer Voice Complaints and Grievances forwarded to DAHO Dashboard
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. GRV-2026-0419
    call_id UUID REFERENCES public.ivr_calls(id) ON DELETE SET NULL,
    caller_phone VARCHAR(20) NOT NULL,
    category ivr_feedback_category DEFAULT 'other',
    audio_url TEXT,
    transcript TEXT,
    sentiment VARCHAR(16) DEFAULT 'negative', -- negative, neutral, positive
    district VARCHAR(64) DEFAULT 'Pune',
    taluka VARCHAR(64) DEFAULT 'Shirur',
    status VARCHAR(32) DEFAULT 'pending_review', -- 'pending_review', 'under_investigation', 'resolved'
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 11: ivr_language_preferences
-- Remembers preferred language for repeat callers based on telephone number
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_language_preferences (
    phone VARCHAR(20) PRIMARY KEY,
    language VARCHAR(10) NOT NULL DEFAULT 'mr',
    call_count INTEGER DEFAULT 1,
    last_call_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------------
-- TABLE 12: ivr_analytics
-- Daily and hourly aggregation of IVR traffic, channel breakdown, and drop-off rates
-- ------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ivr_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    district VARCHAR(64) DEFAULT 'Pune',
    total_calls INTEGER DEFAULT 0,
    completed_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    disease_reports_count INTEGER DEFAULT 0,
    emergency_sos_count INTEGER DEFAULT 0,
    callbacks_requested INTEGER DEFAULT 0,
    callbacks_resolved INTEGER DEFAULT 0,
    avg_call_duration_seconds INTEGER DEFAULT 142,
    language_breakdown JSONB DEFAULT '{"mr": 0.55, "hi": 0.28, "en": 0.12, "gu": 0.05}'::jsonb,
    intent_breakdown JSONB DEFAULT '{"disease": 0.42, "vaccine": 0.22, "vet": 0.18, "emergency": 0.08, "announcements": 0.06, "feedback": 0.04}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, district)
);

-- ------------------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ivr_calls_phone ON public.ivr_calls(caller_phone);
CREATE INDEX IF NOT EXISTS idx_ivr_calls_created_at ON public.ivr_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ivr_reports_case_id ON public.ivr_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_ivr_reports_doctor ON public.ivr_reports(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_ivr_callbacks_status ON public.ivr_callback_requests(status);
CREATE INDEX IF NOT EXISTS idx_ivr_emergency_priority ON public.ivr_emergency_cases(priority);
CREATE INDEX IF NOT EXISTS idx_ivr_feedback_status ON public.ivr_feedback(status);

-- ------------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------------
ALTER TABLE public.ivr_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivr_callback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivr_emergency_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivr_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ivr_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public service role or authenticated users read/insert
CREATE POLICY "Public IVR Call Ingestion" ON public.ivr_calls FOR ALL USING (true);
CREATE POLICY "Public IVR Reports" ON public.ivr_reports FOR ALL USING (true);
CREATE POLICY "Public IVR Callbacks" ON public.ivr_callback_requests FOR ALL USING (true);
CREATE POLICY "Public IVR Emergencies" ON public.ivr_emergency_cases FOR ALL USING (true);
CREATE POLICY "Public IVR Announcements" ON public.ivr_announcements FOR ALL USING (true);
CREATE POLICY "Public IVR Feedback" ON public.ivr_feedback FOR ALL USING (true);
