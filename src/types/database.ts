// JeevRakshak AI - Central Database Schema Types
// Strictly mirrors the 19 Supabase PostgreSQL tables and 7 enums

// ==========================================
// 1. ENUM TYPES
// ==========================================

export type LocationLevel = 'district' | 'block' | 'village';

export type ReportSource = 'web' | 'mobile' | 'ivr';

export type CaseStatus = 'suspected' | 'probable' | 'confirmed' | 'ruled_out' | 'treated' | 'resolved';

export type TriageMethod = 'rule_based' | 'ai_assisted' | 'manual';

export type SampleStatus = 'collected' | 'sent' | 'received' | 'tested';

export type EscalationStatus = 'open' | 'in_progress' | 'resolved';

export type UserRole = 'farmer' | 'veterinarian' | 'government';

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
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
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
  preferred_language?: AppLanguage;
  email?: string;
  farm_name?: string;
  district?: string;
  block?: string;
  village?: string;
  state?: string;
  // Hospital metadata for veterinarians
  hospital_name?: string;
  facility_type?: string;
  license_number?: string;
  hospital_address?: string;
  hospital_lat?: number;
  hospital_lng?: number;
  hospital_pincode?: string;
  hospital_district?: string;
  hospital_block?: string;
  emergency_phone?: string;
  first_login_at?: string;
  first_account_notif_sent?: boolean;
  first_login_notif_sent?: boolean;
  telegram_chat_id?: string;
  telegram_username?: string;
  telegram_connected?: boolean;
  telegram_connected_at?: string;
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
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  location_id: string;
  created_at?: string;
  updated_at?: string;
}

// Table 5: animals
export interface Animal {
  id: string;
  herd_id: string;
  owner_profile_id?: string;
  tag_number: string;
  name?: string;
  species: string; // e.g., Cattle, Buffalo, Goat, Sheep
  species_en?: string;
  species_hi?: string;
  species_mr?: string;
  breed: string;
  breed_en?: string;
  breed_hi?: string;
  breed_mr?: string;
  sex: 'male' | 'female';
  date_of_birth: string | null;
  is_milking?: boolean;
  milking_status?: 'lactating' | 'dry' | 'heifer' | 'calving';
  vaccination_status?: 'vaccinated' | 'due' | 'not_vaccinated';
  notes?: string;
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
  symptoms_en?: string;
  symptoms_hi?: string;
  symptoms_mr?: string;
  mortality_count: number;
  notes: string | null;
  notes_en?: string | null;
  notes_hi?: string | null;
  notes_mr?: string | null;
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
  assessment_notes_en?: string | null;
  assessment_notes_hi?: string | null;
  assessment_notes_mr?: string | null;
  assessed_by: string | null; // profile id
  assessed_at: string;
}

// Table 8: animal_treatments
export interface AnimalTreatment {
  id: string;
  animal_id: string;
  prescribed_by: string | null;
  treatment_name: string;
  treatment_name_en?: string;
  treatment_name_hi?: string;
  treatment_name_mr?: string;
  dosage: string;
  treatment_date: string;
  notes: string | null;
  notes_en?: string | null;
  notes_hi?: string | null;
  notes_mr?: string | null;
  created_at?: string;
}

// Table 9: animal_vaccinations
export interface AnimalVaccination {
  id: string;
  animal_id: string;
  vaccine_name: string;
  vaccine_name_en?: string;
  vaccine_name_hi?: string;
  vaccine_name_mr?: string;
  vaccination_date: string;
  next_due_date: string | null;
  administered_by: string | null;
  notes: string | null;
  notes_en?: string | null;
  notes_hi?: string | null;
  notes_mr?: string | null;
  created_at?: string;
}

// Table 10: diagnostic_samples
export interface DiagnosticSample {
  id: string;
  health_report_id: string;
  sample_type: string; // Blood, Nasal swab, Saliva, Tissue, etc.
  sample_type_en?: string;
  sample_type_hi?: string;
  sample_type_mr?: string;
  collected_at: string;
  sent_at: string | null;
  received_at: string | null;
  tested_at: string | null;
  status: SampleStatus;
  result: string | null;
  result_en?: string | null;
  result_hi?: string | null;
  result_mr?: string | null;
  notes: string | null;
  notes_en?: string | null;
  notes_hi?: string | null;
  notes_mr?: string | null;
  created_at?: string;
}

// Table 11: case_escalations
export interface CaseEscalation {
  id: string;
  health_report_id: string;
  escalated_to: string; // profile id or title
  reason: string;
  reason_en?: string;
  reason_hi?: string;
  reason_mr?: string;
  status: EscalationStatus;
  created_at?: string;
  resolved_at: string | null;
}

// Table 12: health_advisories
export interface HealthAdvisory {
  id: string;
  health_report_id: string | null;
  title: string;
  title_en?: string;
  title_hi?: string;
  title_mr?: string;
  message: string;
  message_en?: string;
  message_hi?: string;
  message_mr?: string;
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
  description_en?: string | null;
  description_hi?: string | null;
  description_mr?: string | null;
  event_date: string;
  created_at?: string;
}

// Table 14: disease_catalog
export interface DiseaseCatalogItem {
  id: string;
  name: string;
  name_en?: string;
  name_hi?: string;
  name_mr?: string;
  description: string | null;
  description_en?: string | null;
  description_hi?: string | null;
  description_mr?: string | null;
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
  description_en?: string | null;
  description_hi?: string | null;
  description_mr?: string | null;
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
  title_en?: string;
  title_hi?: string;
  title_mr?: string;
  description: string | null;
  description_en?: string | null;
  description_hi?: string | null;
  description_mr?: string | null;
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
  title_en?: string;
  title_hi?: string;
  title_mr?: string;
  message: string;
  message_en?: string;
  message_hi?: string;
  message_mr?: string;
  notification_type: NotificationType;
  is_read: boolean;
  language?: string;
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

// ==========================================
// 4. VETERINARY DOCTOR MEDICAL WORKSPACE TYPES
// ==========================================

export interface DoctorCase {
  id: string;
  doctor_id: string;
  case_number: string;
  animal_id: string;
  animal_tag: string;
  animal_species: string;
  farmer_name: string;
  farmer_phone: string;
  village: string;
  district: string;
  symptoms: string;
  priority: 'routine' | 'urgent' | 'critical';
  status: 'assigned' | 'accepted' | 'in_diagnosis' | 'treatment_ongoing' | 'treated' | 'resolved' | 'rejected' | 'closed' | 'escalated';
  reported_at: string;
  accepted_at?: string;
  closed_at?: string;
  diagnosis?: string;
  treatment_notes?: string;
  is_escalated?: boolean;
  escalated_to?: string;
  escalation_reason?: string;
  escalated_at?: string;
  sms_sent?: boolean;
  sms_sent_at?: string;
  sms_phone?: string;
  sms_message?: string;
}

export interface DoctorDiagnosis {
  id: string;
  doctor_id: string;
  case_id: string;
  animal_tag: string;
  disease_name: string;
  confidence: number;
  symptoms_analyzed: string;
  recommended_tests: string;
  recommended_treatment: string;
  diagnosed_at: string;
}

export interface DoctorTreatmentRecord {
  id: string;
  doctor_id: string;
  case_id: string;
  animal_id: string;
  animal_tag: string;
  farmer_name: string;
  treatment_plan: string;
  medicines: string;
  dosage: string;
  instructions: string;
  follow_up_date: string;
  status: 'ongoing' | 'completed' | 'recovered';
  recovery_notes?: string;
  created_at: string;
}

export interface DoctorPrescriptionRecord {
  id: string;
  doctor_id: string;
  doctor_name: string;
  license_number: string;
  hospital_name: string;
  animal_tag: string;
  animal_species: string;
  farmer_name: string;
  farmer_phone: string;
  diagnosis?: string;
  case_id?: string;
  case_number?: string;
  follow_up_date?: string;
  status?: 'active' | 'completed';
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  clinical_instructions: string;
  created_at: string;
}

export interface DoctorVaccinationRecord {
  id: string;
  doctor_id: string;
  animal_id: string;
  animal_tag: string;
  farmer_name: string;
  vaccine_name: string;
  batch_number: string;
  date: string;
  booster_date: string;
  certificate_no: string;
}

export interface DoctorFieldVisitRecord {
  id: string;
  doctor_id: string;
  farmer_name: string;
  village: string;
  visit_date: string;
  purpose: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  notes: string;
  distance_km: number;
}

export interface DoctorDiseaseReportRecord {
  id: string;
  doctor_id: string;
  disease_name: string;
  species: string;
  district: string;
  village: string;
  cases_observed: number;
  mortalities: number;
  is_outbreak_risk: boolean;
  reported_to_daho: boolean;
  clinical_summary: string;
  created_at: string;
}

export interface DoctorStats {
  assignedCases: number;
  pendingCases: number;
  completedCases: number;
  emergencyCases: number;
  animalsTreated: number;
  vaccinationsDone: number;
  todayAppointments: number;
  monthlyVisits: number;
  recoveryRate: number;
  reportsSubmitted: number;
}

// ==========================================
// 5. GOVERNMENT OFFICIAL PORTAL TYPES
// ==========================================

export type GovOfficialRole =
  | 'super_admin'
  | 'state_officer'
  | 'district_officer'
  | 'block_officer'
  | 'disease_monitoring_officer'
  | 'vaccination_officer'
  | 'emergency_response_officer';

export interface EmergencyCaseRecord {
  id: string;
  code: string;
  caller_name: string;
  caller_phone: string;
  village: string;
  district: string;
  incident_type: string;
  severity: 'critical' | 'high' | 'moderate';
  status: 'alert_triggered' | 'team_dispatched' | 'on_site' | 'stabilized' | 'resolved';
  dispatched_team?: string;
  dispatched_van?: string;
  reported_at: string;
}

export interface ResourceAllocationRecord {
  id: string;
  district: string;
  resource_type: string;
  allocated: number;
  available: number;
  shortage_detected: boolean;
  last_updated: string;
}

export interface VaccinationCampaignRecord {
  id: string;
  campaign_code: string;
  title: string;
  disease: string;
  target_count: number;
  achieved_count: number;
  districts: string[];
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'completed';
}

// ==========================================
// 8. INTERACTIVE VOICE RESPONSE (IVR) TYPES
// ==========================================

export type IVRLanguage = 'mr' | 'hi' | 'en' | 'gu' | 'pa' | 'ta' | 'te' | 'kn' | 'bn';

export type IVRCallStatus = 'ringing' | 'in_progress' | 'completed' | 'missed' | 'busy' | 'failed' | 'transferred';

export type IVRMenuOption =
  | 'disease_reporting'
  | 'vaccination_info'
  | 'vet_consultation'
  | 'emergency_sos'
  | 'gov_announcements'
  | 'complaints_feedback';

export type IVRPriority = 'routine' | 'elevated' | 'urgent' | 'critical';

export type IVRCallbackStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type IVRFeedbackCategory =
  | 'service_delay'
  | 'medicine_unavailability'
  | 'vet_hospital_conduct'
  | 'vaccination_camp'
  | 'app_suggestion'
  | 'other';

export interface IVRCall {
  id: string;
  call_sid: string;
  caller_phone: string;
  caller_profile_id?: string | null;
  toll_free_number: string;
  language: string;
  status: IVRCallStatus;
  direction: 'inbound' | 'outbound_callback';
  duration_seconds: number;
  primary_intent?: IVRMenuOption | null;
  dtmf_digits_pressed?: string;
  district: string;
  taluka: string;
  village?: string;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface IVRSession {
  id: string;
  call_id: string;
  caller_phone: string;
  current_step: string;
  language: string;
  selected_animal?: string;
  selected_symptoms?: string[];
  voice_recording_url?: string;
  case_id?: string;
  is_completed: boolean;
  session_data?: Record<string, any>;
  updated_at: string;
  created_at: string;
}

export interface IVRVoiceRecording {
  id: string;
  call_id: string;
  caller_phone: string;
  recording_sid?: string;
  audio_url: string;
  duration_seconds: number;
  channels: number;
  sample_rate: number;
  encoding: string;
  file_size_bytes?: number;
  purpose: 'disease_description' | 'complaint' | 'callback_reason';
  created_at: string;
}

export interface IVRTranscript {
  id: string;
  recording_id: string;
  call_id: string;
  detected_language: string;
  raw_transcript: string;
  english_translation?: string;
  confidence_score: number;
  stt_engine: string;
  extracted_symptoms: string[];
  extracted_urgency: IVRPriority;
  created_at: string;
}

export interface IVRReport {
  id: string;
  case_id: string;
  call_id?: string;
  recording_id?: string;
  transcript_id?: string;
  farmer_phone: string;
  farmer_profile_id?: string;
  farmer_name?: string;
  animal_type: string;
  symptoms: string[];
  suspected_disease: string;
  risk_level: IVRPriority;
  assigned_doctor_id?: string;
  assigned_hospital_name?: string;
  district: string;
  taluka: string;
  village: string;
  status: 'pending_review' | 'accepted' | 'investigating' | 'resolved';
  ai_confidence_score: number;
  recommended_actions: string[];
  audio_url?: string;
  transcript?: string;
  created_at: string;
  updated_at: string;
}

export interface IVRSymptom {
  id: string;
  dtmf_key: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  name_gu?: string;
  severity_weight: number;
  is_contagious_marker: boolean;
  created_at?: string;
}

export interface IVRCallbackRequest {
  id: string;
  call_id?: string;
  farmer_phone: string;
  farmer_name: string;
  animal_type: string;
  district: string;
  taluka: string;
  village: string;
  reason: string;
  recording_id?: string;
  transcript?: string;
  priority: IVRPriority;
  assigned_doctor_id?: string;
  status: IVRCallbackStatus;
  resolution_notes?: string;
  called_back_at?: string;
  created_at: string;
}

export interface IVREmergencyCase {
  id: string;
  emergency_code: string;
  call_id?: string;
  farmer_phone: string;
  farmer_name?: string;
  animal_type: string;
  description: string;
  district: string;
  taluka: string;
  village: string;
  priority: IVRPriority;
  dispatched_unit: string;
  response_status: 'dispatched' | 'on_site' | 'admitted' | 'stabilized';
  eta_minutes: number;
  assigned_doctor_id?: string;
  notified_daho: boolean;
  created_at: string;
}

export interface IVRAnnouncement {
  id: string;
  title: string;
  content_en: string;
  content_hi: string;
  content_mr: string;
  audio_en_url?: string;
  audio_hi_url?: string;
  audio_mr_url?: string;
  category: 'outbreak_alert' | 'vaccination_campaign' | 'advisory';
  target_district: string;
  target_taluka: string;
  is_active: boolean;
  priority: IVRPriority;
  play_count: number;
  created_by?: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface IVRFeedback {
  id: string;
  feedback_code: string;
  call_id?: string;
  caller_phone: string;
  category: IVRFeedbackCategory;
  audio_url?: string;
  transcript?: string;
  sentiment: 'negative' | 'neutral' | 'positive';
  district: string;
  taluka: string;
  status: 'pending_review' | 'under_investigation' | 'resolved';
  resolution_notes?: string;
  created_at: string;
}

export interface IVRLanguagePreference {
  phone: string;
  language: string;
  call_count: number;
  last_call_at: string;
  updated_at: string;
}

export interface IVRAnalytics {
  id: string;
  date: string;
  district: string;
  total_calls: number;
  completed_calls: number;
  missed_calls: number;
  disease_reports_count: number;
  emergency_sos_count: number;
  callbacks_requested: number;
  callbacks_resolved: number;
  avg_call_duration_seconds: number;
  language_breakdown: Record<string, number>;
  intent_breakdown: Record<string, number>;
  created_at: string;
}


