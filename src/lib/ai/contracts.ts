/**
 * JeevRakshak AI - AI/ML Integration Contracts
 * 
 * Formal interfaces defining input schemas and response payloads for:
 * 1. Clinical Disease Decision & Differential Triage
 * 2. Spatial Epidemiological Outbreak Forecasting & Ring Containment
 * 3. Lesion & Dermatological Computer Vision Analysis
 * 4. Multilingual Clinical Voice / Audio Intake
 * 
 * These contracts decouple backend orchestration and Next.js route handlers
 * from the specific ML inference runtime (TensorFlow, PyTorch, Gemini Vision, or ICAR rule heuristics).
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type CaseTriageStatus = 'suspected' | 'probable' | 'confirmed' | 'ruled_out';
export type OutbreakClusterStatus = 'emerging' | 'active' | 'contained';

// ---------------------------------------------------------------------------
// 1. Disease Prediction & Differential Triage
// ---------------------------------------------------------------------------

export interface DiseasePredictionInput {
  animalId?: string;
  species: string; // 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep' | 'Poultry' | string
  breed?: string;
  ageMonths?: number;
  symptoms: string[] | string;
  vitals?: {
    temperatureC?: number;
    heartRateBpm?: number;
    respiratoryRateBpm?: number;
    rumenMotilityPer2Min?: number;
  };
  mortalityCount?: number;
  location?: {
    latitude: number;
    longitude: number;
    district?: string;
    taluka?: string;
    village?: string;
  };
  durationDays?: number;
  notes?: string;
  language?: 'en' | 'hi' | 'mr';
}

export interface DifferentialDiagnosisItem {
  diseaseId: string;
  diseaseName: string;
  diseaseNameHi?: string;
  diseaseNameMr?: string;
  confidence: number; // 0 to 100
  rationale: string;
  keyMatchingSymptoms: string[];
}

export interface DiseasePredictionResult {
  primaryDisease: {
    diseaseId: string;
    diseaseName: string;
    diseaseNameHi: string;
    diseaseNameMr: string;
    confidence: number; // 0 to 100
    severity: RiskLevel;
  };
  differentials: DifferentialDiagnosisItem[];
  triageStatus: CaseTriageStatus;
  triageMethod: 'rule_based' | 'ai_assisted' | 'manual';
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  recommendedSampleType: string;
  sampleCollectionProtocol: string;
  immediateSOP: string[];
  multilingualNotes: {
    en: string;
    hi: string;
    mr: string;
  };
  isContagiousZoonotic: boolean;
  requiresImmediateQuarantine: boolean;
  requiresDAHOEscalation: boolean;
}

// ---------------------------------------------------------------------------
// 2. Spatial Outbreak Forecasting & Ring Containment
// ---------------------------------------------------------------------------

export interface CaseGeoPoint {
  id: string;
  diseaseId: string;
  diseaseName?: string;
  latitude: number;
  longitude: number;
  reportedAt: string;
  mortalityCount: number;
  district?: string;
  taluka?: string;
  village?: string;
}

export interface OutbreakForecastInput {
  cases: CaseGeoPoint[];
  district?: string;
  timeHorizonDays?: number;
  clusteringRadiusKm?: number; // default 5km
  environmentalData?: {
    avgTemperatureC?: number;
    avgHumidityPercent?: number;
    rainfallMm?: number;
  };
}

export interface SpatialCluster {
  clusterId: string;
  diseaseId: string;
  diseaseName: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  totalCases: number;
  totalMortality: number;
  attackRatePercent: number;
  status: OutbreakClusterStatus;
  primaryDistrict: string;
  primaryTaluka: string;
  estimatedReproductionNumberR0: number;
  caseVelocity7Days: number; // cases/day trend
}

export interface ContainmentZoneSpec {
  center: { latitude: number; longitude: number };
  infectedZoneRadiusKm: number; // Usually 0 - 3 km
  surveillanceZoneRadiusKm: number; // Usually 3 - 10 km
  targetHerdsCount: number;
  recommendedVaccinationDoses: number;
  movementRestrictionMandated: boolean;
  emergencyMeasures: string[];
}

export interface OutbreakForecastResult {
  activeClusters: SpatialCluster[];
  containmentZones: ContainmentZoneSpec[];
  projectedCasesNext7Days: number;
  overallDistrictRisk: RiskLevel;
  criticalHotspots: Array<{
    locationName: string;
    taluka: string;
    district: string;
    latitude: number;
    longitude: number;
    caseCount: number;
    riskScore: number;
  }>;
  epidemiologicalSummary: {
    en: string;
    hi: string;
    mr: string;
  };
}

// ---------------------------------------------------------------------------
// 3. Lesion & Dermatological Vision Analysis
// ---------------------------------------------------------------------------

export interface ImageAnalysisInput {
  imageBase64?: string;
  imageUrl?: string;
  species?: string;
  anatomicalRegion?: 'skin' | 'oral_cavity' | 'feet_hooves' | 'teats_udder' | 'eyes_conjunctiva';
  notes?: string;
}

export interface DetectedLesionFeature {
  label: string;
  confidence: number;
  description: string;
}

export interface ImageAnalysisResult {
  detectedCondition: string;
  confidence: number;
  features: DetectedLesionFeature[];
  suggestedDiseases: Array<{ diseaseId: string; name: string; probability: number }>;
  severityAssessment: 'mild' | 'moderate' | 'severe';
  sampleRecommendation: string;
  diagnosticAdvice: string;
}

// ---------------------------------------------------------------------------
// 4. Multilingual Clinical Voice / Audio Transcription
// ---------------------------------------------------------------------------

export interface VoiceTranscriptionInput {
  audioBase64?: string;
  audioMimeType?: string;
  languageHint?: 'mr' | 'hi' | 'en';
}

export interface VoiceTranscriptionResult {
  transcript: string;
  detectedLanguage: 'mr' | 'hi' | 'en';
  confidence: number;
  extractedClinicalData: {
    species?: string;
    symptoms: string[];
    affectedCount?: number;
    mortalityCount?: number;
    duration?: string;
  };
}

// ---------------------------------------------------------------------------
// 5. Canonical Phase 2/3A JeevRakshak Assessment Contract (FastAPI /api/ai/assess)
// ---------------------------------------------------------------------------

export interface InputSummary {
  original_text: string;
  image_provided: boolean;
  image_path?: string | null;
  location_provided: boolean;
  state?: string | null;
  district?: string | null;
}

export interface AnimalContext {
  species: 'cattle' | 'buffalo' | 'sheep' | 'goat' | 'swine' | 'other' | 'unknown' | string;
  affected_count?: number | null;
  total_herd_size?: number | null;
  duration_days?: number | null;
  mortality_count: number;
  vaccination_status: string;
  treatment_history?: string | null;
}

export interface ExtractedObservations {
  symptoms: string[];
  anatomical_locations: string[];
  clinical_observations: string[];
  extraction_confidence?: number | null;
}

export interface VisualAnalysis {
  available: boolean;
  model_name?: string | null;
  architecture?: string | null;
  predicted_class?: string | null;
  confidence?: number | null;
  class_probabilities: Record<string, number>;
  evidence_nature: 'VISUAL_EVIDENCE_ONLY';
  image_sha256?: string | null;
  disclaimer: string;
  clinical_disclaimer?: string;
}

export interface ConditionDifferential {
  disease: string;
  pathogen?: string | null;
  support_level: 'low' | 'moderate' | 'high';
  supporting_evidence: string[];
  contradicting_or_missing_evidence: string[];
  sources: string[];
}

export interface EpidemiologicalContextData {
  nadres: Record<string, any>;
  wahis: Record<string, any>;
}

export interface EnvironmentalContextData {
  weather_available: boolean;
  temperature_2m_c?: number | null;
  relative_humidity_2m_pct?: number | null;
  precipitation_mm?: number | null;
  relevant_observations: string[];
  source: string;
}

export interface RiskAssessmentData {
  overall_risk: 'low' | 'moderate' | 'high' | 'critical';
  risk_factors: string[];
  uncertainties: string[];
  cluster_signal?: string | null;
}

export interface RecommendedActionsData {
  immediate_actions: string[];
  veterinary_referral: string[];
  containment_precautions: string[];
  sample_collection: string[];
  monitoring: string[];
}

export interface EscalationDecisionData {
  required: boolean;
  urgency: 'routine' | 'moderate' | 'urgent' | 'emergency';
  reason: string[];
}

export interface JeevRakshakAssessment {
  assessment_id: string;
  created_at: string;
  input_summary: InputSummary;
  animal_context: AnimalContext;
  observations: ExtractedObservations;
  visual_analysis: VisualAnalysis;
  possible_conditions: ConditionDifferential[];
  epidemiological_context: EpidemiologicalContextData;
  environmental_context: EnvironmentalContextData;
  risk_assessment: RiskAssessmentData;
  recommended_actions: RecommendedActionsData;
  escalation: EscalationDecisionData;
  data_gaps: string[];
  sources: string[];
  disclaimer: string;
}

