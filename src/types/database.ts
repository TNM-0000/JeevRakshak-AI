// JeevRakshak AI - Central Database Schema Types
// Strictly mirrors the 19 Supabase PostgreSQL tables and 7 enums

// ==========================================
// 1. ENUM TYPES
// ==========================================

export type LocationLevel = 'district' | 'block' | 'village';

export type ReportSource = 'web' | 'mobile' | 'ivr' | 'field_worker';

export type CaseStatus = 'suspected' | 'probable' | 'confirmed' | 'ruled_out';

export type TriageMethod = 'rule_based' | 'ai_assisted' | 'manual';

export type SampleStatus = 'collected' | 'sent' | 'received' | 'tested';

export type EscalationStatus = 'open' | 'in_progress' | 'resolved';

export type UserRole = 'farmer' | 'field_worker' | 'veterinarian' | 'government';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type OutbreakStatus = 'active' | 'contained' | 'resolved';

export type NotificationType = 'health_alert' | 'outbreak_alert' | 'advisory' | 'advisories' | 'escalation' | 'system';

export type AppLanguage = 'en' | 'hi' | 'mr'; // English, Hindi, Marathi

// ==========================================
// 2. DATABASE TABLES (Row Interfaces)
// ==========================================

// Table 1: administrative_locations
export interface AdministrativeLocation {
  id: string;
  name: string;
  level: LocationLevel;
  parent_id: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
}

// Table 2: profiles
export interface Profile {
  id: string; // matches auth.users UUID
  full_name: string;
  phone: string | null;
  location_id: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Table 3: profile_roles
export interface ProfileRole {
  profile_id: string;
  role: UserRole;
  assigned_at?: string;
}

// Table 4: herds
export interface Herd {
  id: string;
  owner_profile_id: string;
  name: string;
  location_id: string;
  created_at?: string;
  updated_at?: string;
}

// Table 5: animals
export interface Animal {
  id: string;
  herd_id: string;
  tag_number: string;
  species: string; // e.g., Cattle, Buffalo, Goat, Sheep
  breed: string;
  sex: 'male' | 'female';
  date_of_birth: string | null;
  created_at?: string;
  updated_at?: string;
}

// Table 6: health_reports
export interface HealthReport {
  id: string;
  animal_id: string;
  reported_by: string; // profile id
  source: ReportSource;
  symptoms: string; // comma-separated or text of symptoms
  mortality_count: number;
  notes: string | null;
  reported_at: string;
  created_at?: string;
}

// Table 7: case_assessments
export interface CaseAssessment {
  id: string;
  health_report_id: string;
  status: CaseStatus;
  triage_method: TriageMethod;
  assessment_notes: string | null;
  assessed_by: string | null; // profile id
  assessed_at: string;
}

// Table 8: animal_treatments
export interface AnimalTreatment {
  id: string;
  animal_id: string;
  prescribed_by: string | null;
  treatment_name: string;
  dosage: string;
  treatment_date: string;
  notes: string | null;
  created_at?: string;
}

// Table 9: animal_vaccinations
export interface AnimalVaccination {
  id: string;
  animal_id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  administered_by: string | null;
  notes: string | null;
  created_at?: string;
}

// Table 10: diagnostic_samples
export interface DiagnosticSample {
  id: string;
  health_report_id: string;
  sample_type: string; // Blood, Nasal swab, Saliva, Tissue, etc.
  collected_at: string;
  sent_at: string | null;
  received_at: string | null;
  tested_at: string | null;
  status: SampleStatus;
  result: string | null;
  notes: string | null;
  created_at?: string;
}

// Table 11: case_escalations
export interface CaseEscalation {
  id: string;
  health_report_id: string;
  escalated_to: string; // profile id or title
  reason: string;
  status: EscalationStatus;
  created_at?: string;
  resolved_at: string | null;
}

// Table 12: health_advisories
export interface HealthAdvisory {
  id: string;
  health_report_id: string | null;
  title: string;
  message: string;
  language: string; // 'en', 'hi', 'mr'
  created_by: string | null;
  created_at?: string;
}

// Table 13: herd_health_events
export interface HerdHealthEvent {
  id: string;
  herd_id: string;
  reported_by: string;
  event_type: string;
  affected_count: number;
  mortality_count: number;
  description: string | null;
  event_date: string;
  created_at?: string;
}

// Table 14: disease_catalog
export interface DiseaseCatalogItem {
  id: string;
  name: string;
  description: string | null;
  species: string;
  severity: RiskLevel | string;
  is_active: boolean;
  created_at?: string;
}

// Table 15: health_report_diseases
export interface HealthReportDisease {
  id: string;
  health_report_id: string;
  disease_id: string;
  is_primary: boolean;
  confidence: number | null; // 0 to 100
  notes: string | null;
  created_at?: string;
}

// Table 16: weather_observations
export interface WeatherObservation {
  id: string;
  location_id: string;
  observed_at: string;
  temperature_c: number | null;
  humidity_percent: number | null;
  rainfall_mm: number | null;
  wind_speed_kmh: number | null;
  description: string | null;
  created_at?: string;
}

// Table 17: risk_assessments
export interface RiskAssessment {
  id: string;
  health_report_id: string | null;
  location_id: string | null;
  risk_level: RiskLevel;
  risk_score: number | null; // 0 to 100
  assessment_method: TriageMethod;
  reasoning: string | null;
  assessed_by: string | null;
  assessed_at: string;
  created_at?: string;
}

// Table 18: outbreak_events
export interface OutbreakEvent {
  id: string;
  disease_id: string;
  location_id: string;
  title: string;
  description: string | null;
  severity: RiskLevel;
  affected_herds: number;
  affected_animals: number;
  mortality_count: number;
  started_at: string;
  ended_at: string | null;
  status: OutbreakStatus;
  created_by: string | null;
  created_at?: string;
}

// Table 19: notifications
export interface AppNotification {
  id: string;
  recipient_profile_id: string;
  health_report_id: string | null;
  outbreak_event_id: string | null;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at?: string;
  read_at: string | null;
}

// ==========================================
// 3. JOINED / COMPOUND TYPES FOR UI
// ==========================================

export interface AnimalWithDetails extends Animal {
  herd?: Herd;
  treatments?: AnimalTreatment[];
  vaccinations?: AnimalVaccination[];
  healthReports?: HealthReportWithDetails[];
  currentStatus?: 'healthy' | 'treatment' | 'affected' | 'critical';
}

export interface HealthReportWithDetails extends HealthReport {
  animal?: Animal;
  reporter?: Profile;
  assessment?: CaseAssessment;
  riskAssessment?: RiskAssessment;
  diseases?: (HealthReportDisease & { disease?: DiseaseCatalogItem })[];
  samples?: DiagnosticSample[];
  escalations?: CaseEscalation[];
  location?: AdministrativeLocation;
}

export interface OutbreakWithDetails extends OutbreakEvent {
  disease?: DiseaseCatalogItem;
  location?: AdministrativeLocation;
}
