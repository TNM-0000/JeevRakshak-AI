import {
  AdministrativeLocation,
  Profile,
  ProfileRole,
  Herd,
  Animal,
  HealthReport,
  CaseAssessment,
  AnimalTreatment,
  AnimalVaccination,
  DiagnosticSample,
  CaseEscalation,
  HealthAdvisory,
  HerdHealthEvent,
  DiseaseCatalogItem,
  HealthReportDisease,
  WeatherObservation,
  RiskAssessment,
  OutbreakEvent,
  AppNotification,
} from '@/types/database';

export const initialLocations: AdministrativeLocation[] = [
  { id: 'loc-pune', name: 'Pune', level: 'district', parent_id: null, latitude: 18.5204, longitude: 73.8567 },
  { id: 'loc-shirur', name: 'Shirur', level: 'block', parent_id: 'loc-pune', latitude: 18.8256, longitude: 74.3789 },
  { id: 'loc-haveli', name: 'Haveli', level: 'block', parent_id: 'loc-pune', latitude: 18.4575, longitude: 73.8677 },
  { id: 'loc-baramati', name: 'Baramati', level: 'block', parent_id: 'loc-pune', latitude: 18.1517, longitude: 74.5768 },
  { id: 'loc-khed', name: 'Khed', level: 'block', parent_id: 'loc-pune', latitude: 18.8500, longitude: 73.9100 },
  { id: 'loc-shirapur', name: 'Shirapur', level: 'village', parent_id: 'loc-shirur', latitude: 18.8120, longitude: 74.3910 },
  { id: 'loc-kavathe', name: 'Kavathe', level: 'village', parent_id: 'loc-shirur', latitude: 18.8450, longitude: 74.3420 },
  { id: 'loc-koregaon', name: 'Koregaon Bhima', level: 'village', parent_id: 'loc-haveli', latitude: 18.6520, longitude: 74.0710 },
  { id: 'loc-baburdi', name: 'Baburdi', level: 'village', parent_id: 'loc-shirur', latitude: 18.7900, longitude: 74.4200 },
];

export const initialProfiles: Profile[] = [
  { id: 'prof-farmer-1', full_name: 'Suresh Shinde', phone: '+91 98220 12345', location_id: 'loc-shirapur', is_active: true },
  { id: 'prof-field-1', full_name: 'Ramesh Gaikwad', phone: '+91 98220 54321', location_id: 'loc-shirur', is_active: true },
  { id: 'prof-vet-1', full_name: 'Dr. Mahendra Kale', phone: '+91 98220 99887', location_id: 'loc-pune', is_active: true },
  { id: 'prof-govt-1', full_name: 'Dr. Sunita Patil (DAHO)', phone: '+91 98220 66778', location_id: 'loc-pune', is_active: true },
];

export const initialProfileRoles: ProfileRole[] = [
  { profile_id: 'prof-farmer-1', role: 'farmer', assigned_at: '2026-01-10T10:00:00Z' },
  { profile_id: 'prof-field-1', role: 'field_worker', assigned_at: '2026-01-10T10:00:00Z' },
  { profile_id: 'prof-vet-1', role: 'veterinarian', assigned_at: '2026-01-10T10:00:00Z' },
  { profile_id: 'prof-govt-1', role: 'government', assigned_at: '2026-01-10T10:00:00Z' },
];

export const initialHerds: Herd[] = [
  { id: 'herd-1', owner_profile_id: 'prof-farmer-1', name: 'Shinde Dairy & Livestock Farm', location_id: 'loc-shirapur' },
  { id: 'herd-2', owner_profile_id: 'prof-farmer-1', name: 'Pasture Herd 2', location_id: 'loc-shirapur' },
];

export const initialAnimals: Animal[] = [
  { id: 'anim-1', herd_id: 'herd-1', tag_number: 'COW-023', species: 'Cattle', breed: 'Gir', sex: 'female', date_of_birth: '2022-04-12' },
  { id: 'anim-2', herd_id: 'herd-1', tag_number: 'BUF-015', species: 'Buffalo', breed: 'Murrah', sex: 'female', date_of_birth: '2021-09-20' },
  { id: 'anim-3', herd_id: 'herd-1', tag_number: 'OXN-008', species: 'Cattle', breed: 'Khillari', sex: 'male', date_of_birth: '2020-03-15' },
  { id: 'anim-4', herd_id: 'herd-1', tag_number: 'COW-012', species: 'Cattle', breed: 'Holstein Friesian', sex: 'female', date_of_birth: '2023-01-10' },
  { id: 'anim-5', herd_id: 'herd-1', tag_number: 'COW-045', species: 'Cattle', breed: 'Sahiwal', sex: 'female', date_of_birth: '2022-08-05' },
  { id: 'anim-6', herd_id: 'herd-1', tag_number: 'GOT-009', species: 'Goat', breed: 'Osmanabadi', sex: 'female', date_of_birth: '2023-06-18' },
];

export const initialDiseases: DiseaseCatalogItem[] = [
  { id: 'dis-fmd', name: 'Foot and Mouth Disease (FMD)', description: 'Highly contagious viral disease causing vesicles and blisters on feet, tongue, and teats, severe drop in milk yield.', species: 'Cattle, Buffalo, Sheep, Goat', severity: 'high', is_active: true },
  { id: 'dis-lsd', name: 'Lumpy Skin Disease (LSD)', description: 'Poxviral disease characterized by nodular lesions covering skin and mucous membranes, high fever, and edema.', species: 'Cattle, Buffalo', severity: 'high', is_active: true },
  { id: 'dis-anthrax', name: 'Anthrax (Bacillus anthracis)', description: 'Severe bacterial zoonotic infection marked by sudden death, unclotted bleeding from body orifices, and high fever.', species: 'All Ruminants', severity: 'critical', is_active: true },
  { id: 'dis-brd', name: 'Bovine Respiratory Disease (BRD)', description: 'Complex multifactorial respiratory condition with fever, purulent nasal discharge, and acute dyspnea.', species: 'Cattle, Buffalo', severity: 'medium', is_active: true },
  { id: 'dis-ppr', name: 'Peste des Petits Ruminants (PPR)', description: 'Viral goat plague with stomatitis, pneumo-enteritis, and high mortality in small ruminants.', species: 'Goat, Sheep', severity: 'high', is_active: true },
  { id: 'dis-brucellosis', name: 'Brucellosis', description: 'Chronic bacterial disease causing late abortions, retained placenta, and reduced fertility.', species: 'Cattle, Buffalo', severity: 'medium', is_active: true },
];

export const initialHealthReports: HealthReport[] = [
  {
    id: 'rep-mh-2048',
    animal_id: 'anim-1',
    reported_by: 'prof-farmer-1',
    source: 'mobile',
    symptoms: 'Fever, Nasal discharge, Coughing, Reduced milk production',
    mortality_count: 0,
    notes: 'Cow stopped grazing yesterday morning. High temperature recorded by field thermometer. 4 other cows showing mild discharge.',
    reported_at: '2026-09-12T05:30:00Z',
    created_at: '2026-09-12T05:30:00Z',
  },
  {
    id: 'rep-mh-2045',
    animal_id: 'anim-3',
    reported_by: 'prof-farmer-1',
    source: 'field_worker',
    symptoms: 'Difficulty breathing, Weakness, Sudden death',
    mortality_count: 1,
    notes: 'Sudden collapse in pen 2. Neighboring farm in Shirapur reported 1 death 48 hours ago.',
    reported_at: '2026-09-11T14:15:00Z',
    created_at: '2026-09-11T14:15:00Z',
  },
  {
    id: 'rep-mh-2039',
    animal_id: 'anim-6',
    reported_by: 'prof-field-1',
    source: 'web',
    symptoms: 'Diarrhea, Weakness, Loss of appetite',
    mortality_count: 0,
    notes: 'Goat flock grazing near river bed showing watery diarrhea.',
    reported_at: '2026-09-10T09:00:00Z',
    created_at: '2026-09-10T09:00:00Z',
  },
  {
    id: 'rep-mh-2044',
    animal_id: 'anim-2',
    reported_by: 'prof-farmer-1',
    source: 'ivr',
    symptoms: 'Reduced milk production, Loss of appetite',
    mortality_count: 0,
    notes: 'Reported via toll-free IVR line. Milk yield dropped from 12L to 4L.',
    reported_at: '2026-09-11T18:00:00Z',
    created_at: '2026-09-11T18:00:00Z',
  },
];

export const initialCaseAssessments: CaseAssessment[] = [
  {
    id: 'assess-1',
    health_report_id: 'rep-mh-2048',
    status: 'probable',
    triage_method: 'ai_assisted',
    assessment_notes: 'Symptoms match Bovine Respiratory Disease / early FMD cluster. High transmission probability due to communal watering.',
    assessed_by: 'prof-vet-1',
    assessed_at: '2026-09-12T05:45:00Z',
  },
  {
    id: 'assess-2',
    health_report_id: 'rep-mh-2045',
    status: 'suspected',
    triage_method: 'rule_based',
    assessment_notes: 'Sudden death flag triggered. Immediate biosafety precautions required. Rule out Anthrax / Hemorrhagic Septicemia.',
    assessed_by: 'prof-vet-1',
    assessed_at: '2026-09-11T14:30:00Z',
  },
  {
    id: 'assess-3',
    health_report_id: 'rep-mh-2039',
    status: 'suspected',
    triage_method: 'manual',
    assessment_notes: 'Parasitic enteritis or early PPR. Hydration therapy prescribed.',
    assessed_by: 'prof-field-1',
    assessed_at: '2026-09-10T10:00:00Z',
  },
];

export const initialHealthReportDiseases: HealthReportDisease[] = [
  { id: 'hrd-1', health_report_id: 'rep-mh-2048', disease_id: 'dis-brd', is_primary: true, confidence: 84, notes: 'Respiratory cluster pattern matches' },
  { id: 'hrd-2', health_report_id: 'rep-mh-2048', disease_id: 'dis-fmd', is_primary: false, confidence: 45, notes: 'Secondary differential' },
  { id: 'hrd-3', health_report_id: 'rep-mh-2045', disease_id: 'dis-anthrax', is_primary: true, confidence: 78, notes: 'Sudden death trigger' },
];

export const initialRiskAssessments: RiskAssessment[] = [
  {
    id: 'risk-1',
    health_report_id: 'rep-mh-2048',
    location_id: 'loc-shirapur',
    risk_level: 'high',
    risk_score: 82,
    assessment_method: 'ai_assisted',
    reasoning: 'Multiple animals affected within 48h in Shirapur. High humidity and standing water accelerating vector and bacterial transmission.',
    assessed_by: 'prof-vet-1',
    assessed_at: '2026-09-12T05:50:00Z',
  },
  {
    id: 'risk-2',
    health_report_id: null,
    location_id: 'loc-shirur',
    risk_level: 'critical',
    risk_score: 91,
    assessment_method: 'ai_assisted',
    reasoning: 'Cluster of 14 cases across Shirur block within 5km radius.',
    assessed_by: 'prof-govt-1',
    assessed_at: '2026-09-11T12:00:00Z',
  },
];

export const initialDiagnosticSamples: DiagnosticSample[] = [
  {
    id: 'samp-1',
    health_report_id: 'rep-mh-2048',
    sample_type: 'Nasal swab',
    collected_at: '2026-09-12T06:00:00Z',
    sent_at: '2026-09-12T07:15:00Z',
    received_at: '2026-09-12T09:30:00Z',
    tested_at: null,
    status: 'received',
    result: null,
    notes: 'Sample received at District Veterinary Lab Pune. Testing for respiratory panel in progress.',
  },
];

export const initialCaseEscalations: CaseEscalation[] = [
  {
    id: 'esc-1',
    health_report_id: 'rep-mh-2045',
    escalated_to: 'Dr. Sunita Patil (DAHO)',
    reason: 'Sudden mortality event with rapid progression in Shirur block.',
    status: 'in_progress',
    created_at: '2026-09-11T15:00:00Z',
    resolved_at: null,
  },
];

export const initialTreatments: AnimalTreatment[] = [
  {
    id: 'treat-1',
    animal_id: 'anim-1',
    prescribed_by: 'prof-vet-1',
    treatment_name: 'Ceftiofur Sodium (Antibiotic course)',
    dosage: '10ml IM daily for 3 days',
    treatment_date: '2026-09-12',
    notes: 'Isolate animal and ensure fresh hydration.',
  },
];

export const initialVaccinations: AnimalVaccination[] = [
  {
    id: 'vac-1',
    animal_id: 'anim-1',
    vaccine_name: 'FMD Quadrivalent Vaccine',
    vaccination_date: '2025-11-10',
    next_due_date: '2026-09-16',
    administered_by: 'prof-vet-1',
    notes: 'Routine bi-annual vaccination booster due.',
  },
  {
    id: 'vac-2',
    animal_id: 'anim-2',
    vaccine_name: 'Haemorrhagic Septicaemia (HS) Vaccine',
    vaccination_date: '2025-10-15',
    next_due_date: '2026-10-15',
    administered_by: 'prof-vet-1',
    notes: 'Annual booster dose.',
  },
];

export const initialHerdHealthEvents: HerdHealthEvent[] = [
  {
    id: 'hhe-1',
    herd_id: 'herd-1',
    reported_by: 'prof-farmer-1',
    event_type: 'respiratory_outbreak',
    affected_count: 5,
    mortality_count: 0,
    description: 'Sudden nasal discharge and coughing across 5 animals in Shed B.',
    event_date: '2026-09-11',
    created_at: '2026-09-11T10:00:00Z',
  },
  {
    id: 'hhe-2',
    herd_id: 'herd-2',
    reported_by: 'prof-farmer-2',
    event_type: 'sudden_mortality',
    affected_count: 3,
    mortality_count: 1,
    description: 'Unusual lethargy and sudden death of 1 calf within 12 hours.',
    event_date: '2026-09-10',
    created_at: '2026-09-10T14:30:00Z',
  },
];

export const initialWeather: WeatherObservation[] = [
  {
    id: 'wx-1',
    location_id: 'loc-shirur',
    observed_at: '2026-09-12T06:00:00Z',
    temperature_c: 28.4,
    humidity_percent: 86,
    rainfall_mm: 34.2,
    wind_speed_kmh: 14.5,
    description: 'Heavy seasonal monsoon showers with waterlogging in low-lying pastures.',
  },
  {
    id: 'wx-2',
    location_id: 'loc-baramati',
    observed_at: '2026-09-12T06:00:00Z',
    temperature_c: 29.1,
    humidity_percent: 78,
    rainfall_mm: 12.0,
    wind_speed_kmh: 11.2,
    description: 'Partly cloudy with scattered rain.',
  },
];

export const initialOutbreaks: OutbreakEvent[] = [
  {
    id: 'out-1',
    disease_id: 'dis-fmd',
    location_id: 'loc-shirur',
    title: 'Foot and Mouth Disease Cluster - Shirur Block',
    description: 'Unusual incidence of blisters and reduced lactation across 11 dairy farms along Shirur-Koregaon corridor.',
    severity: 'critical',
    affected_herds: 11,
    affected_animals: 47,
    mortality_count: 3,
    started_at: '2026-09-08T00:00:00Z',
    ended_at: null,
    status: 'active',
    created_by: 'prof-govt-1',
  },
  {
    id: 'out-2',
    disease_id: 'dis-lsd',
    location_id: 'loc-baramati',
    title: 'Suspected Lumpy Skin Disease Surveillance',
    description: 'Nodular skin lesions detected in 5 farms. Vector control operations activated.',
    severity: 'medium',
    affected_herds: 5,
    affected_animals: 14,
    mortality_count: 0,
    started_at: '2026-09-05T00:00:00Z',
    ended_at: null,
    status: 'contained',
    created_by: 'prof-govt-1',
  },
];

export const initialAdvisories: HealthAdvisory[] = [
  {
    id: 'adv-1-en',
    health_report_id: null,
    title: 'Monsoon Pasture Alert: High Risk of Vector and Foot Infections',
    message: 'Continuous rainfall has elevated humidity above 85%. Keep animal sheds dry with dry straw bedding. Clean feeding troughs daily and avoid grazing in stagnant water pools.',
    language: 'en',
    created_by: 'prof-vet-1',
    created_at: '2026-09-11T08:00:00Z',
  },
  {
    id: 'adv-1-hi',
    health_report_id: null,
    title: 'मानसून चारागाह चेतावनी: संक्रमण और खुरपका का उच्च जोखिम',
    message: 'लगातार बारिश के कारण नमी 85% से अधिक हो गई है। पशु बाड़े को सूखा रखें। पीने का पानी साफ दें और जलभराव वाले क्षेत्रों में पशुओं को चरने न भेजें।',
    language: 'hi',
    created_by: 'prof-vet-1',
    created_at: '2026-09-11T08:00:00Z',
  },
  {
    id: 'adv-1-mr',
    health_report_id: null,
    title: 'पावसाळी चारा व गोठा दक्षता: जंतुसंसर्ग व लाळ-खुरकूतचा वाढता धोका',
    message: 'सततच्या पावसामुळे गोठ्यात दमटपणा वाढला आहे. गोठ्याची जमीन कोरडी ठेवा, जंतुनाशक चुन्याची भुकटी टाका. दूषित किंवा साचलेले पाणी पिण्यास देऊ नका. ताप आल्यास तात्काळ पशुवैद्यकांशी संपर्क साधा.',
    language: 'mr',
    created_by: 'prof-vet-1',
    created_at: '2026-09-11T08:00:00Z',
  },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    recipient_profile_id: 'prof-farmer-1',
    health_report_id: 'rep-mh-2048',
    outbreak_event_id: 'out-1',
    title: 'Possible Disease Cluster Detected in Shirur',
    message: 'Similar respiratory & fever symptoms reported within 5 km of your village. Monitor your animals closely.',
    notification_type: 'outbreak_alert',
    is_read: false,
    created_at: '2026-09-12T06:15:00Z',
    read_at: null,
  },
  {
    id: 'notif-2',
    recipient_profile_id: 'prof-farmer-1',
    health_report_id: null,
    outbreak_event_id: null,
    title: 'Vaccination Due: FMD Booster in 4 Days',
    message: 'COW-023 is scheduled for its bi-annual Foot and Mouth Disease vaccination.',
    notification_type: 'health_alert',
    is_read: false,
    created_at: '2026-09-12T07:00:00Z',
    read_at: null,
  },
  {
    id: 'notif-3',
    recipient_profile_id: 'prof-field-1',
    health_report_id: 'rep-mh-2048',
    outbreak_event_id: null,
    title: 'New Urgent Report in Shirapur (#MH-2048)',
    message: 'Farmer Suresh Shinde reported 5 animals affected with fever and discharge. Triage assessment: Probable BRD.',
    notification_type: 'escalation',
    is_read: false,
    created_at: '2026-09-12T05:35:00Z',
    read_at: null,
  },
];
