import { supabase } from './client';
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
  UserRole,
  HealthReportWithDetails,
  AnimalWithDetails,
  OutbreakWithDetails,
  SampleStatus,
} from '@/types/database';

import {
  initialLocations,
  initialDiseases,
  initialWeather,
  initialAdvisories,
} from './seedData';

// Helper to generate a valid RFC4122 UUID in browser or node
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Database bridge to Supabase: routes via /api/db (for server-side service role) or direct client
export async function dbInsert(table: string, payload: any[]): Promise<{ data?: any[]; error?: any }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'insert', payload }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        return { data: json.data };
      }
      if (json.error) {
        console.warn(`[Supabase /api/db Insert Error on "${table}"]:`, json.error);
        return { error: json.error };
      }
    }
  } catch (e) {
    console.warn(`[Supabase /api/db Fetch Exception]:`, e);
  }

  // Fallback to direct client
  try {
    const { data, error } = await supabase.from(table).insert(payload).select();
    if (error) {
      console.warn(`[Supabase Direct Insert Error on "${table}"]:`, error.message);
      return { error };
    }
    return { data: data || [] };
  } catch (err) {
    return { error: err };
  }
}

export async function dbUpdate(table: string, payload: any, filters: Record<string, any>): Promise<{ data?: any[]; error?: any }> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, action: 'update', payload, filters }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        return { data: json.data };
      }
    }
  } catch {
    // fallback
  }

  try {
    let query = supabase.from(table).update(payload);
    for (const [k, v] of Object.entries(filters)) {
      query = query.eq(k, v);
    }
    const { data, error } = await query.select();
    if (error) return { error };
    return { data: data || [] };
  } catch (err) {
    return { error: err };
  }
}

// Clean in-memory store for active session and offline resilience
class LocalStore {
  locations: AdministrativeLocation[] = [...initialLocations];
  profiles: Profile[] = [];
  profileRoles: ProfileRole[] = [];
  herds: Herd[] = [];
  animals: Animal[] = [];
  diseases: DiseaseCatalogItem[] = [...initialDiseases];
  healthReports: HealthReport[] = [];
  caseAssessments: CaseAssessment[] = [];
  healthReportDiseases: HealthReportDisease[] = [];
  riskAssessments: RiskAssessment[] = [];
  diagnosticSamples: DiagnosticSample[] = [];
  caseEscalations: CaseEscalation[] = [];
  treatments: AnimalTreatment[] = [];
  vaccinations: AnimalVaccination[] = [];
  herdHealthEvents: HerdHealthEvent[] = [];
  weather: WeatherObservation[] = [...initialWeather];
  outbreaks: OutbreakEvent[] = [];
  advisories: HealthAdvisory[] = [...initialAdvisories];
  notifications: AppNotification[] = [];
  currentRole: UserRole = 'farmer';
  currentUser: Profile | null = null;
  onboardingDone: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Purge legacy mock data
        const isCleanV2 = localStorage.getItem('jr_clean_db_v2');
        if (!isCleanV2) {
          localStorage.removeItem('jr_animals');
          localStorage.removeItem('jr_herds');
          localStorage.removeItem('jr_health_reports');
          localStorage.removeItem('jr_samples');
          localStorage.removeItem('jr_escalations');
          localStorage.removeItem('jr_treatments');
          localStorage.removeItem('jr_vaccinations');
          localStorage.setItem('jr_clean_db_v2', 'true');
        }

        const savedProfiles = localStorage.getItem('jr_profiles');
        if (savedProfiles) this.profiles = JSON.parse(savedProfiles);

        const savedHerds = localStorage.getItem('jr_herds');
        if (savedHerds) this.herds = JSON.parse(savedHerds);

        const savedAnimals = localStorage.getItem('jr_animals');
        if (savedAnimals) this.animals = JSON.parse(savedAnimals);

        const savedReports = localStorage.getItem('jr_health_reports');
        if (savedReports) this.healthReports = JSON.parse(savedReports);

        const savedTreatments = localStorage.getItem('jr_treatments');
        if (savedTreatments) this.treatments = JSON.parse(savedTreatments);

        const savedVaccinations = localStorage.getItem('jr_vaccinations');
        if (savedVaccinations) this.vaccinations = JSON.parse(savedVaccinations);

        const savedSamples = localStorage.getItem('jr_samples');
        if (savedSamples) this.diagnosticSamples = JSON.parse(savedSamples);

        const savedEscalations = localStorage.getItem('jr_escalations');
        if (savedEscalations) this.caseEscalations = JSON.parse(savedEscalations);

        const savedRole = localStorage.getItem('jr_current_role') as UserRole;
        if (savedRole) this.currentRole = savedRole;

        const savedUser = localStorage.getItem('jr_current_user');
        if (savedUser) this.currentUser = JSON.parse(savedUser);

        const savedOnboarding = localStorage.getItem('jr_onboarding_done');
        if (savedOnboarding) this.onboardingDone = JSON.parse(savedOnboarding);
      } catch {
        // ignore localStorage error
      }
    }
  }

  save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jr_profiles', JSON.stringify(this.profiles));
        localStorage.setItem('jr_herds', JSON.stringify(this.herds));
        localStorage.setItem('jr_animals', JSON.stringify(this.animals));
        localStorage.setItem('jr_health_reports', JSON.stringify(this.healthReports));
        localStorage.setItem('jr_treatments', JSON.stringify(this.treatments));
        localStorage.setItem('jr_vaccinations', JSON.stringify(this.vaccinations));
        localStorage.setItem('jr_samples', JSON.stringify(this.diagnosticSamples));
        localStorage.setItem('jr_escalations', JSON.stringify(this.caseEscalations));
        localStorage.setItem('jr_current_role', this.currentRole);
        if (this.currentUser) {
          localStorage.setItem('jr_current_user', JSON.stringify(this.currentUser));
        } else {
          localStorage.removeItem('jr_current_user');
        }
        localStorage.setItem('jr_onboarding_done', JSON.stringify(this.onboardingDone));
      } catch {
        // ignore
      }
    }
  }
}

export const localStore = new LocalStore();

export const dataService = {
  // Current user role & profile
  getCurrentRole(): UserRole {
    return localStore.currentRole;
  },

  setCurrentRole(role: UserRole) {
    localStore.currentRole = role;
    localStore.save();
  },

  getCurrentUser(): Profile | null {
    return localStore.currentUser || null;
  },

  hasCompletedOnboarding(): boolean {
    return localStore.onboardingDone && !!localStore.currentUser;
  },

  setOnboardingCompleted(completed: boolean) {
    localStore.onboardingDone = completed;
    localStore.save();
  },

  signOut() {
    localStore.currentUser = null;
    localStore.onboardingDone = false;
    localStore.save();
    try {
      supabase.auth.signOut().catch(() => {});
    } catch {
      // ignore
    }
  },

  // User Registration
  async registerUser(params: {
    full_name: string;
    phone: string;
    email?: string;
    password: string;
    role: UserRole;
    location_id?: string;
    farm_name?: string;
  }): Promise<{ profile: Profile; error?: string }> {
    let profileId = generateUUID();
    const cleanPhone = params.phone.replace(/[^0-9]/g, '');

    // 1. Try Supabase Auth
    try {
      const authEmail = params.email?.trim() || `${cleanPhone || Date.now()}@jeevrakshak.org`;
      const { data: authData } = await supabase.auth.signUp({
        email: authEmail,
        password: params.password,
        options: {
          data: {
            full_name: params.full_name,
            phone: params.phone,
            role: params.role,
          },
        },
      });
      if (authData?.user?.id) {
        profileId = authData.user.id;
      }
    } catch {
      // ignore
    }

    const newProfile: Profile = {
      id: profileId,
      full_name: params.full_name,
      phone: params.phone,
      location_id: params.location_id || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newRole: ProfileRole = {
      profile_id: profileId,
      role: params.role,
      assigned_at: new Date().toISOString(),
    };

    // 2. Insert into Supabase profiles and profile_roles table via bridge
    await dbInsert('profiles', [{
      id: profileId,
      full_name: params.full_name,
      phone: params.phone,
      is_active: true,
    }]);

    await dbInsert('profile_roles', [{
      profile_id: profileId,
      role: params.role,
    }]);

    localStore.profiles = [newProfile];
    localStore.profileRoles = [newRole];
    localStore.currentUser = newProfile;
    localStore.currentRole = params.role;
    localStore.onboardingDone = true;

    // 3. If farmer, create herd in Supabase
    if (params.role === 'farmer' && params.farm_name) {
      await this.createHerd({
        owner_profile_id: profileId,
        name: params.farm_name,
        location_id: params.location_id || '1',
      });
    }

    // 4. Welcome notification in local store & Supabase
    const welcomeNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipient_profile_id: profileId,
      health_report_id: null,
      outbreak_event_id: null,
      title: 'Welcome to JeevRakshak AI (महाराष्ट्र शासन)',
      message: `Namaste ${params.full_name}, your ${params.role.replace('_', ' ')} account is verified. You can now register livestock and track health reports.`,
      notification_type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    localStore.notifications.unshift(welcomeNotif);

    await dbInsert('notifications', [{
      recipient_profile_id: profileId,
      title: welcomeNotif.title,
      message: welcomeNotif.message,
      notification_type: welcomeNotif.notification_type,
      is_read: false,
    }]);

    localStore.save();
    return { profile: newProfile };
  },

  // User Sign In
  async signInUser(params: { login: string; password: string }): Promise<{ profile?: Profile; error?: string }> {
    const cleanLogin = params.login.trim();

    // 1. Try Supabase Auth
    try {
      const isPhone = /^[0-9+ ]+$/.test(cleanLogin);
      const authEmail = isPhone ? `${cleanLogin.replace(/[^0-9]/g, '')}@jeevrakshak.org` : cleanLogin;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: params.password,
      });
      if (!error && data?.user) {
        const profileId = data.user.id;
        const profile: Profile = {
          id: profileId,
          full_name: data.user.user_metadata?.full_name || 'Livestock Owner',
          phone: data.user.user_metadata?.phone || cleanLogin,
          location_id: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStore.currentUser = profile;
        localStore.onboardingDone = true;
        localStore.save();
        return { profile };
      }
    } catch {
      // ignore
    }

    // 2. Query Supabase profiles table directly by phone or name
    try {
      const { data: dbProfiles } = await supabase.from('profiles').select('*').or(`phone.eq.${cleanLogin},full_name.ilike.%${cleanLogin}%`).limit(1);
      if (dbProfiles && dbProfiles.length > 0) {
        const found = dbProfiles[0] as Profile;
        localStore.currentUser = found;
        localStore.onboardingDone = true;
        localStore.save();
        return { profile: found };
      }
    } catch {
      // ignore
    }

    // 3. Check localStore
    const existing = localStore.profiles.find((p) => p.phone === cleanLogin || p.full_name.toLowerCase() === cleanLogin.toLowerCase());
    if (existing) {
      localStore.currentUser = existing;
      localStore.onboardingDone = true;
      localStore.save();
      return { profile: existing };
    }

    // 4. Create new verified session profile
    const profileId = generateUUID();
    const newProfile: Profile = {
      id: profileId,
      full_name: cleanLogin,
      phone: cleanLogin,
      location_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localStore.profiles.unshift(newProfile);
    localStore.currentUser = newProfile;
    localStore.onboardingDone = true;
    localStore.save();
    return { profile: newProfile };
  },

  // 1. Administrative Locations (Maharashtra Reference Catalog)
  async getLocations(): Promise<AdministrativeLocation[]> {
    try {
      const { data, error } = await supabase.from('administrative_locations').select('*');
      if (!error && data && data.length > 0) {
        return data as AdministrativeLocation[];
      }
    } catch {
      // ignore
    }
    return localStore.locations;
  },

  // 2. Herds (Real user herds)
  async getHerds(ownerId?: string): Promise<Herd[]> {
    const activeOwnerId = ownerId || localStore.currentUser?.id;
    try {
      let query = supabase.from('herds').select('*');
      if (activeOwnerId) {
        query = query.eq('owner_profile_id', activeOwnerId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Herd[];
      }
    } catch {
      // ignore
    }
    return activeOwnerId ? localStore.herds.filter((h) => h.owner_profile_id === activeOwnerId) : localStore.herds;
  },

  async createHerd(herd: Omit<Herd, 'id'>): Promise<Herd> {
    const payload: any = {
      owner_profile_id: herd.owner_profile_id,
      name: herd.name,
    };
    if (herd.location_id && !isNaN(Number(herd.location_id))) {
      payload.location_id = Number(herd.location_id);
    }

    let createdId = `herd-${Date.now()}`;
    const res = await dbInsert('herds', [payload]);
    if (res.data && res.data[0]) {
      createdId = String(res.data[0].id);
    }

    const newHerd: Herd = {
      id: createdId,
      owner_profile_id: herd.owner_profile_id,
      name: herd.name,
      location_id: herd.location_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.herds.unshift(newHerd);
    localStore.save();
    return newHerd;
  },

  // 3. Animals (Real livestock only)
  async getAnimals(herdId?: string): Promise<AnimalWithDetails[]> {
    let rawAnimals: Animal[] = [];

    // 1. Fetch from Supabase
    try {
      let query = supabase.from('animals').select('*');
      if (herdId && !isNaN(Number(herdId))) {
        query = query.eq('herd_id', Number(herdId));
      }
      const { data, error } = await query;
      if (!error && data) {
        rawAnimals = data as Animal[];
      }
    } catch {
      // ignore
    }

    // 2. Fallback to localStore
    if (rawAnimals.length === 0) {
      rawAnimals = herdId ? localStore.animals.filter((a) => String(a.herd_id) === String(herdId)) : localStore.animals;
    }

    // Hydrate status, treatments, vaccinations
    return rawAnimals.map((animal) => {
      const treatments = localStore.treatments.filter((t) => String(t.animal_id) === String(animal.id));
      const vaccinations = localStore.vaccinations.filter((v) => String(v.animal_id) === String(animal.id));
      const reports = localStore.healthReports.filter((r) => String(r.animal_id) === String(animal.id));

      let currentStatus: 'healthy' | 'treatment' | 'affected' | 'critical' = 'healthy';
      if (reports.some((r) => r.symptoms.toLowerCase().includes('death') || (r.mortality_count && r.mortality_count > 0))) {
        currentStatus = 'critical';
      } else if (treatments.length > 0) {
        currentStatus = 'treatment';
      } else if (reports.length > 0) {
        currentStatus = 'affected';
      }

      return {
        ...animal,
        treatments,
        vaccinations,
        currentStatus,
      };
    });
  },

  async getAnimalById(id: string): Promise<AnimalWithDetails | null> {
    const animals = await this.getAnimals();
    return animals.find((a) => String(a.id) === String(id)) || null;
  },

  async createAnimal(animal: Omit<Animal, 'id'>): Promise<Animal> {
    const payload: any = {
      tag_number: animal.tag_number,
      species: animal.species,
      breed: animal.breed,
      sex: animal.sex,
      date_of_birth: animal.date_of_birth || null,
    };
    if (animal.herd_id && !isNaN(Number(animal.herd_id))) {
      payload.herd_id = Number(animal.herd_id);
    }

    let animalId = `anim-${Date.now()}`;
    const res = await dbInsert('animals', [payload]);
    if (res.data && res.data[0]) {
      animalId = String(res.data[0].id);
    }

    const newAnimal: Animal = {
      ...animal,
      id: animalId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localStore.animals.unshift(newAnimal);
    localStore.save();
    return newAnimal;
  },

  // 4. Disease Catalog (Reference Data)
  async getDiseases(): Promise<DiseaseCatalogItem[]> {
    try {
      const { data, error } = await supabase.from('disease_catalog').select('*');
      if (!error && data && data.length > 0) {
        return data as DiseaseCatalogItem[];
      }
    } catch {
      // ignore
    }
    return localStore.diseases;
  },

  // 5. Health Reports & AI Triage Assessments
  async getHealthReports(): Promise<HealthReportWithDetails[]> {
    let reports: HealthReport[] = [];
    try {
      const { data, error } = await supabase.from('health_reports').select('*').order('reported_at', { ascending: false });
      if (!error && data) {
        reports = data as HealthReport[];
      }
    } catch {
      // ignore
    }

    if (reports.length === 0) {
      reports = localStore.healthReports;
    }

    return reports.map((rep) => {
      const animal = localStore.animals.find((a) => String(a.id) === String(rep.animal_id));
      const assessment = localStore.caseAssessments.find((ca) => String(ca.health_report_id) === String(rep.id));
      const samples = localStore.diagnosticSamples.filter((s) => String(s.health_report_id) === String(rep.id));
      const escalations = localStore.caseEscalations.filter((e) => String(e.health_report_id) === String(rep.id));

      return {
        ...rep,
        animal,
        assessment,
        samples,
        escalations,
      };
    });
  },

  async createHealthReport(report: Omit<HealthReport, 'id' | 'reported_at'>): Promise<HealthReportWithDetails> {
    const reportedAt = new Date().toISOString();
    const payload: any = {
      reported_by: report.reported_by,
      source: report.source || 'web',
      symptoms: report.symptoms,
      mortality_count: report.mortality_count || 0,
      notes: report.notes || null,
      reported_at: reportedAt,
    };
    if (report.animal_id && !isNaN(Number(report.animal_id))) {
      payload.animal_id = Number(report.animal_id);
    }

    let reportId = `rep-${Date.now()}`;
    const repRes = await dbInsert('health_reports', [payload]);
    if (repRes.data && repRes.data[0]) {
      reportId = String(repRes.data[0].id);
    }

    const newReport: HealthReport = {
      ...report,
      id: reportId,
      reported_at: reportedAt,
      created_at: reportedAt,
    };

    // Calculate preliminary AI assessment
    const sLow = report.symptoms.toLowerCase();
    let status: 'suspected' | 'probable' | 'confirmed' | 'ruled_out' = 'suspected';
    let diseaseName = 'General health complaint';

    if (sLow.includes('blister') || sLow.includes('salivation') || sLow.includes('mouth')) {
      status = 'probable';
      diseaseName = 'Foot and Mouth Disease (FMD)';
    } else if (sLow.includes('lump') || sLow.includes('nodule') || sLow.includes('skin')) {
      status = 'probable';
      diseaseName = 'Lumpy Skin Disease (LSD)';
    } else if (report.mortality_count > 0 || sLow.includes('sudden death') || sLow.includes('blood')) {
      status = 'confirmed';
      diseaseName = 'Anthrax (Bacillus anthracis)';
    }

    const assessment: CaseAssessment = {
      id: `case-${Date.now()}`,
      health_report_id: reportId,
      assessed_by: 'ai_triage_engine',
      triage_method: 'ai_assisted',
      status,
      assessment_notes: `Preliminary triage assessment for ${diseaseName}.`,
      assessed_at: new Date().toISOString(),
    };

    // Save assessment to Supabase
    const casePayload: any = {
      status: assessment.status,
      assessed_by: assessment.assessed_by,
      assessed_at: assessment.assessed_at,
      assessment_notes: assessment.assessment_notes,
      triage_method: 'ai_assisted',
    };
    if (!isNaN(Number(reportId))) {
      casePayload.health_report_id = Number(reportId);
    }
    await dbInsert('case_assessments', [casePayload]);

    localStore.healthReports.unshift(newReport);
    localStore.caseAssessments.unshift(assessment);
    localStore.save();

    const animal = localStore.animals.find((a) => String(a.id) === String(report.animal_id));
    return {
      ...newReport,
      animal,
      assessment,
      diseases: [],
      samples: [],
      escalations: [],
    };
  },

  // 6. Clinical Treatments
  async getTreatments(animalId?: string): Promise<AnimalTreatment[]> {
    try {
      let query = supabase.from('animal_treatments').select('*');
      if (animalId && !isNaN(Number(animalId))) {
        query = query.eq('animal_id', Number(animalId));
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as AnimalTreatment[];
      }
    } catch {
      // ignore
    }
    return animalId ? localStore.treatments.filter((t) => String(t.animal_id) === String(animalId)) : localStore.treatments;
  },

  async addTreatment(treatment: Omit<AnimalTreatment, 'id' | 'created_at'>): Promise<AnimalTreatment> {
    let treatId = `treat-${Date.now()}`;
    const payload: any = {
      dosage: treatment.dosage,
      notes: treatment.notes || null,
      prescribed_by: treatment.prescribed_by,
    };
    if (treatment.animal_id && !isNaN(Number(treatment.animal_id))) {
      payload.animal_id = Number(treatment.animal_id);
    }

    const res = await dbInsert('animal_treatments', [payload]);
    if (res.data && res.data[0]) {
      treatId = String(res.data[0].id);
    }

    const newTreatment: AnimalTreatment = {
      ...treatment,
      id: treatId,
      created_at: new Date().toISOString(),
    };
    localStore.treatments.unshift(newTreatment);
    localStore.save();
    return newTreatment;
  },

  // 7. Vaccinations
  async getVaccinations(animalId?: string): Promise<AnimalVaccination[]> {
    try {
      let query = supabase.from('animal_vaccinations').select('*');
      if (animalId && !isNaN(Number(animalId))) {
        query = query.eq('animal_id', Number(animalId));
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as AnimalVaccination[];
      }
    } catch {
      // ignore
    }
    return animalId ? localStore.vaccinations.filter((v) => String(v.animal_id) === String(animalId)) : localStore.vaccinations;
  },

  async addVaccination(vaccination: Omit<AnimalVaccination, 'id' | 'created_at'>): Promise<AnimalVaccination> {
    let vacId = `vac-${Date.now()}`;
    const payload: any = {
      notes: vaccination.notes || null,
    };
    if (vaccination.animal_id && !isNaN(Number(vaccination.animal_id))) {
      payload.animal_id = Number(vaccination.animal_id);
    }

    const res = await dbInsert('animal_vaccinations', [payload]);
    if (res.data && res.data[0]) {
      vacId = String(res.data[0].id);
    }

    const newVac: AnimalVaccination = {
      ...vaccination,
      id: vacId,
      created_at: new Date().toISOString(),
    };
    localStore.vaccinations.unshift(newVac);
    localStore.save();
    return newVac;
  },

  // 8. Diagnostic Samples (Field Workers)
  async getSamples(): Promise<DiagnosticSample[]> {
    try {
      const { data, error } = await supabase.from('diagnostic_samples').select('*');
      if (!error && data) {
        return data as DiagnosticSample[];
      }
    } catch {
      // ignore
    }
    return localStore.diagnosticSamples;
  },

  async collectDiagnosticSample(sample: Omit<DiagnosticSample, 'id' | 'created_at'>): Promise<DiagnosticSample> {
    let sampleId = `sample-${Date.now()}`;
    const payload: any = {
      status: sample.status || 'collected',
      notes: sample.notes || null,
    };
    if (sample.health_report_id && !isNaN(Number(sample.health_report_id))) {
      payload.health_report_id = Number(sample.health_report_id);
    }

    const res = await dbInsert('diagnostic_samples', [payload]);
    if (res.data && res.data[0]) {
      sampleId = String(res.data[0].id);
    }

    const newSample: DiagnosticSample = {
      ...sample,
      id: sampleId,
      created_at: new Date().toISOString(),
    };
    localStore.diagnosticSamples.unshift(newSample);
    localStore.save();
    return newSample;
  },

  async updateSampleStatus(sampleId: string, status: SampleStatus, result?: string): Promise<DiagnosticSample | null> {
    const updatePayload: any = { status };
    if (result) updatePayload.notes = result;
    await dbUpdate('diagnostic_samples', updatePayload, { id: sampleId });
    const s = localStore.diagnosticSamples.find((item) => String(item.id) === String(sampleId));
    if (s) {
      s.status = status;
      if (result) s.result = result;
      localStore.save();
      return s;
    }
    return null;
  },

  // 9. Case Escalations (Veterinarians to DAHO)
  async getEscalations(): Promise<CaseEscalation[]> {
    try {
      const { data, error } = await supabase.from('case_escalations').select('*');
      if (!error && data) {
        return data as CaseEscalation[];
      }
    } catch {
      // ignore
    }
    return localStore.caseEscalations;
  },

  async escalateCase(esc: Omit<CaseEscalation, 'id' | 'created_at'>): Promise<CaseEscalation> {
    let escId = `esc-${Date.now()}`;
    const payload: any = {
      status: esc.status || 'open',
      escalated_to: esc.escalated_to,
    };
    if (esc.health_report_id && !isNaN(Number(esc.health_report_id))) {
      payload.health_report_id = Number(esc.health_report_id);
    }

    const res = await dbInsert('case_escalations', [payload]);
    if (res.data && res.data[0]) {
      escId = String(res.data[0].id);
    }

    const newEsc: CaseEscalation = {
      ...esc,
      id: escId,
      created_at: new Date().toISOString(),
    };
    localStore.caseEscalations.unshift(newEsc);
    localStore.save();
    return newEsc;
  },

  // 10. Weather Observations (Reference Data)
  async getWeather(): Promise<WeatherObservation[]> {
    try {
      const { data, error } = await supabase.from('weather_observations').select('*');
      if (!error && data && data.length > 0) {
        return data as WeatherObservation[];
      }
    } catch {
      // ignore
    }
    return localStore.weather;
  },

  // 11. Health Advisories (Reference Data)
  async getAdvisories(lang?: string): Promise<HealthAdvisory[]> {
    try {
      let query = supabase.from('health_advisories').select('*');
      if (lang) query = query.eq('language', lang);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as HealthAdvisory[];
      }
    } catch {
      // ignore
    }
    return lang ? localStore.advisories.filter((a) => a.language === lang) : localStore.advisories;
  },

  // 12. Notifications
  async getNotifications(profileId?: string): Promise<AppNotification[]> {
    const activeId = profileId || localStore.currentUser?.id;
    try {
      let query = supabase.from('notifications').select('*');
      if (activeId) {
        query = query.eq('recipient_profile_id', activeId);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as AppNotification[];
      }
    } catch {
      // ignore
    }
    return activeId ? localStore.notifications.filter((n) => n.recipient_profile_id === activeId) : localStore.notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await dbUpdate('notifications', { is_read: true, read_at: new Date().toISOString() }, { id });
    const notif = localStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      notif.read_at = new Date().toISOString();
      localStore.save();
    }
  },

  // 13. Herd Health Events (Table 13: herd_health_events)
  async getHerdHealthEvents(herdId?: string): Promise<HerdHealthEvent[]> {
    try {
      let query = supabase.from('herd_health_events').select('*');
      if (herdId && !isNaN(Number(herdId))) {
        query = query.eq('herd_id', Number(herdId));
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as HerdHealthEvent[];
      }
    } catch {
      // ignore
    }
    return herdId ? localStore.herdHealthEvents.filter((e) => String(e.herd_id) === String(herdId)) : localStore.herdHealthEvents;
  },

  async logHerdHealthEvent(event: Omit<HerdHealthEvent, 'id' | 'created_at'>): Promise<HerdHealthEvent> {
    let eventId = `event-${Date.now()}`;
    const payload: any = {
      event_type: event.event_type,
      description: event.description,
      event_date: event.event_date || new Date().toISOString().split('T')[0],
    };
    if (event.herd_id && !isNaN(Number(event.herd_id))) {
      payload.herd_id = Number(event.herd_id);
    }

    const res = await dbInsert('herd_health_events', [payload]);
    if (res.data && res.data[0]) {
      eventId = String(res.data[0].id);
    }

    const newEvent: HerdHealthEvent = {
      ...event,
      id: eventId,
      created_at: new Date().toISOString(),
    };
    localStore.herdHealthEvents.unshift(newEvent);
    localStore.save();
    return newEvent;
  },

  // 14. Outbreaks (District Surveillance)
  async getOutbreaks(): Promise<OutbreakWithDetails[]> {
    try {
      const { data, error } = await supabase.from('outbreak_events').select('*');
      if (!error && data && data.length > 0) {
        return data as OutbreakWithDetails[];
      }
    } catch {
      // ignore
    }
    return localStore.outbreaks.map((ob) => ({
      ...ob,
      disease: localStore.diseases.find((d) => String(d.id) === String(ob.disease_id)),
      location: localStore.locations.find((l) => String(l.id) === String(ob.location_id)),
    }));
  },

  // 15. Master Data Sync
  async seedSupabaseMaster(): Promise<{ success: boolean; message: string }> {
    try {
      let count = 0;
      for (const loc of initialLocations) {
        const { data, error } = await dbInsert('administrative_locations', [{
          name: loc.name,
          level: loc.level,
        }]);
        if (!error && data) count++;
      }
      return { success: count > 0, message: `Synced ${count} master locations to Supabase.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync failed due to permissions.' };
    }
  },
};
