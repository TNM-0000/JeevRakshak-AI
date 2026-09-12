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
  AppLanguage,
  HealthReportWithDetails,
  AnimalWithDetails,
  OutbreakWithDetails,
  SampleStatus,
  CaseStatus,
  TriageMethod,
  DoctorCase,
  DoctorDiagnosis,
  DoctorTreatmentRecord,
  DoctorPrescriptionRecord,
  DoctorVaccinationRecord,
  DoctorFieldVisitRecord,
  DoctorDiseaseReportRecord,
  DoctorStats,
} from '@/types/database';

import {
  initialLocations,
  initialDiseases,
  initialWeather,
  initialAdvisories,
  initialOutbreaks,
  initialNotifications,
} from './seedData';

import {
  getLocalizedField,
  localizeSpecies,
  localizeBreed,
  localizeSymptoms,
  localizeTreatment,
  localizeVaccine,
  localizeSampleType,
  localizeSampleStatus,
  localizeStatus,
  localizeBlock,
  localizeVillage,
} from '@/lib/i18n/dbLocalization';
export {
  getLocalizedField,
  localizeSpecies,
  localizeBreed,
  localizeSymptoms,
  localizeTreatment,
  localizeVaccine,
  localizeSampleType,
  localizeSampleStatus,
  localizeStatus,
  localizeBlock,
  localizeVillage,
} from '@/lib/i18n/dbLocalization';

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
export interface RegisteredAccount {
  id: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
  full_name: string;
  farm_name?: string;
  district?: string;
  block?: string;
  village?: string;
  state?: string;
  herd_size?: number;
}

class LocalStore {
  registeredAccounts: RegisteredAccount[] = [
    {
      id: 'demo-farmer-1',
      phone: '9823012345',
      email: 'farmer@jeevrakshak.org',
      password: 'Farmer@123',
      role: 'farmer',
      full_name: 'Suresh Rambhau Shinde',
      farm_name: "Suresh Rambhau Shinde's Farm",
      district: 'Pune',
      block: 'Shirur',
      village: 'Shirapur',
      state: 'Maharashtra',
    },
    {
      id: 'demo-vet-1',
      phone: '9823011111',
      email: 'vet@jeevrakshak.org',
      password: 'Vet@12345',
      role: 'veterinarian',
      full_name: 'Dr. Priya Kulkarni, B.V.Sc',
    },
    {
      id: 'demo-govt-1',
      phone: '9823099999',
      email: 'govt@jeevrakshak.org',
      password: 'Govt@12345',
      role: 'government',
      full_name: 'Rajesh Patil, DAHO Pune',
    },
  ];
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
  outbreaks: OutbreakEvent[] = [...initialOutbreaks];
  advisories: HealthAdvisory[] = [...initialAdvisories];
  notifications: AppNotification[] = [...initialNotifications];
  currentRole: UserRole = 'farmer';
  currentLanguage: AppLanguage = 'en';
  currentUser: Profile | null = null;
  onboardingDone: boolean = false;
  herdSetupDone: boolean = false;
  vetHospitalSetupDone: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Purge legacy mock data
        const isCleanV3 = localStorage.getItem('jr_clean_db_v3');
        if (!isCleanV3) {
          localStorage.removeItem('jr_animals');
          localStorage.removeItem('jr_herds');
          localStorage.removeItem('jr_health_reports');
          localStorage.removeItem('jr_samples');
          localStorage.removeItem('jr_escalations');
          localStorage.removeItem('jr_treatments');
          localStorage.removeItem('jr_vaccinations');
          localStorage.setItem('jr_clean_db_v3', 'true');
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

        const savedOutbreaks = localStorage.getItem('jr_outbreaks');
        if (savedOutbreaks) {
          this.outbreaks = JSON.parse(savedOutbreaks);
        } else {
          this.outbreaks = [...initialOutbreaks];
        }

        const savedNotifications = localStorage.getItem('jr_notifications');
        if (savedNotifications) {
          this.notifications = JSON.parse(savedNotifications);
        } else {
          this.notifications = [...initialNotifications];
        }

        const savedRole = localStorage.getItem('jr_current_role') as UserRole;
        if (savedRole && (savedRole === 'farmer' || savedRole === 'veterinarian' || savedRole === 'government')) {
          this.currentRole = savedRole;
        } else {
          this.currentRole = 'farmer';
        }

        const savedLang = localStorage.getItem('jeevrakshak_lang') as AppLanguage;
        if (savedLang && (savedLang === 'en' || savedLang === 'hi' || savedLang === 'mr')) {
          this.currentLanguage = savedLang;
        }

        const savedUser = localStorage.getItem('jr_current_user');
        if (savedUser) this.currentUser = JSON.parse(savedUser);

        const savedOnboarding = localStorage.getItem('jr_onboarding_done');
        if (savedOnboarding) this.onboardingDone = JSON.parse(savedOnboarding);

        const savedHerdSetup = localStorage.getItem('jr_herd_setup_done');
        if (savedHerdSetup) this.herdSetupDone = JSON.parse(savedHerdSetup);

        const savedVetSetup = localStorage.getItem('jr_vet_setup_done');
        if (savedVetSetup) this.vetHospitalSetupDone = JSON.parse(savedVetSetup);

        const savedAccounts = localStorage.getItem('jr_registered_accounts');
        if (savedAccounts) {
          try {
            const parsed = JSON.parse(savedAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.registeredAccounts = parsed;
            }
          } catch {
            // ignore
          }
        }
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
        localStorage.setItem('jr_outbreaks', JSON.stringify(this.outbreaks));
        localStorage.setItem('jr_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('jr_current_role', this.currentRole);
        localStorage.setItem('jeevrakshak_lang', this.currentLanguage);
        if (this.currentUser) {
          localStorage.setItem('jr_current_user', JSON.stringify(this.currentUser));
        } else {
          localStorage.removeItem('jr_current_user');
        }
        localStorage.setItem('jr_onboarding_done', JSON.stringify(this.onboardingDone));
        localStorage.setItem('jr_herd_setup_done', JSON.stringify(this.herdSetupDone));
        localStorage.setItem('jr_vet_setup_done', JSON.stringify(this.vetHospitalSetupDone));
        localStorage.setItem('jr_registered_accounts', JSON.stringify(this.registeredAccounts));
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

  getAppLanguage(): AppLanguage {
    return localStore.currentLanguage;
  },

  async setAppLanguage(lang: AppLanguage) {
    localStore.currentLanguage = lang;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('jeevrakshak_lang', lang);
      } catch {
        // ignore
      }
    }

    // 1. If user is logged in, update preferred_language in DB
    if (localStore.currentUser) {
      localStore.currentUser.preferred_language = lang;
      try {
        await dbUpdate('profiles', { preferred_language: lang }, { id: localStore.currentUser.id });
      } catch {
        // ignore
      }
    }

    // 2. Localize all in-memory database records
    localStore.locations = localStore.locations.map((loc) => ({
      ...loc,
      name: getLocalizedField(loc, 'name', lang) || loc.name,
    }));

    localStore.diseases = localStore.diseases.map((d) => ({
      ...d,
      name: getLocalizedField(d, 'name', lang) || d.name,
      description: getLocalizedField(d, 'description', lang) || d.description,
    }));

    localStore.weather = localStore.weather.map((wx) => ({
      ...wx,
      description: getLocalizedField(wx, 'description', lang) || wx.description,
    }));

    localStore.outbreaks = localStore.outbreaks.map((ob) => ({
      ...ob,
      title: getLocalizedField(ob, 'title', lang) || ob.title,
      description: getLocalizedField(ob, 'description', lang) || ob.description,
    }));

    localStore.advisories = localStore.advisories.map((adv) => ({
      ...adv,
      title: getLocalizedField(adv, 'title', lang) || adv.title,
      message: getLocalizedField(adv, 'message', lang) || adv.message,
    }));

    localStore.notifications = localStore.notifications.map((notif) => ({
      ...notif,
      title: getLocalizedField(notif, 'title', lang) || notif.title,
      message: getLocalizedField(notif, 'message', lang) || notif.message,
    }));

    localStore.animals = localStore.animals.map((anim) => ({
      ...anim,
      species: localizeSpecies(anim.species, lang),
      breed: localizeBreed(anim.breed, lang),
    }));

    localStore.healthReports = localStore.healthReports.map((rep) => ({
      ...rep,
      symptoms: localizeSymptoms(rep.symptoms, lang),
    }));

    localStore.treatments = localStore.treatments.map((tr) => ({
      ...tr,
      treatment_name: localizeTreatment(tr.treatment_name, lang),
    }));

    localStore.vaccinations = localStore.vaccinations.map((vac) => ({
      ...vac,
      vaccine_name: localizeVaccine(vac.vaccine_name, lang),
    }));

    localStore.save();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jeevrakshak:language-change', { detail: { language: lang } }));
    }
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

  hasCompletedHerdSetup(): boolean {
    if (localStore.herdSetupDone) return true;
    if (localStore.currentUser && localStore.currentRole === 'farmer') {
      const userHerdIds = localStore.herds
        .filter((h) => h.owner_profile_id === localStore.currentUser?.id)
        .map((h) => String(h.id));
      return localStore.animals.some((a) => userHerdIds.includes(String(a.herd_id)));
    }
    return false;
  },

  setHerdSetupCompleted(completed: boolean) {
    localStore.herdSetupDone = completed;
    localStore.save();
  },

  hasCompletedVetHospitalSetup(): boolean {
    return localStore.vetHospitalSetupDone || Boolean(localStore.currentUser?.hospital_name);
  },

  setVetHospitalSetupCompleted(completed: boolean) {
    localStore.vetHospitalSetupDone = completed;
    localStore.save();
  },

  async saveVetHospital(params: {
    hospital_name: string;
    facility_type: string;
    license_number: string;
    hospital_address: string;
    hospital_lat: number;
    hospital_lng: number;
    hospital_pincode: string;
    hospital_district: string;
    hospital_block: string;
    emergency_phone: string;
  }): Promise<Profile> {
    const user = localStore.currentUser || {
      id: generateUUID(),
      full_name: 'Dr. Veterinarian',
      phone: params.emergency_phone || '9822000000',
      location_id: null,
      is_active: true,
    };

    const updatedProfile: Profile = {
      ...user,
      hospital_name: params.hospital_name,
      facility_type: params.facility_type,
      license_number: params.license_number,
      hospital_address: params.hospital_address,
      hospital_lat: params.hospital_lat,
      hospital_lng: params.hospital_lng,
      hospital_pincode: params.hospital_pincode,
      hospital_district: params.hospital_district,
      hospital_block: params.hospital_block,
      emergency_phone: params.emergency_phone,
      updated_at: new Date().toISOString(),
    };

    localStore.currentUser = updatedProfile;
    localStore.profiles = localStore.profiles.map((p) => (p.id === updatedProfile.id ? updatedProfile : p));
    if (!localStore.profiles.some((p) => p.id === updatedProfile.id)) {
      localStore.profiles.unshift(updatedProfile);
    }
    localStore.vetHospitalSetupDone = true;
    localStore.save();

    // Persist to Supabase
    try {
      await dbUpdate(
        'profiles',
        {
          hospital_name: params.hospital_name,
          facility_type: params.facility_type,
          license_number: params.license_number,
          hospital_address: params.hospital_address,
          hospital_lat: params.hospital_lat,
          hospital_lng: params.hospital_lng,
          hospital_pincode: params.hospital_pincode,
          hospital_district: params.hospital_district,
          hospital_block: params.hospital_block,
          emergency_phone: params.emergency_phone,
        },
        { id: updatedProfile.id }
      );
    } catch {
      // ignore
    }

    return updatedProfile;
  },

  async saveHerdWithAnimals(params: {
    herdName: string;
    animals: Array<{
      name?: string;
      tag_number: string;
      species: string;
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
    }>;
  }): Promise<{ herd: Herd; animals: Animal[] }> {
    const currentUser = localStore.currentUser;
    const ownerId = currentUser?.id || '00000000-0000-0000-0000-000000000000';

    // 1. Create or get Herd
    let targetHerd = localStore.herds.find((h) => h.owner_profile_id === ownerId);
    if (!targetHerd) {
      targetHerd = await this.createHerd({
        name: params.herdName.trim() || 'My Livestock Herd',
        owner_profile_id: ownerId,
        location_id: currentUser?.location_id || '1',
      });
    } else if (params.herdName.trim()) {
      targetHerd.name = params.herdName.trim();
      targetHerd.updated_at = new Date().toISOString();
      localStore.save();
    }

    // 2. Batch create animals
    const createdAnimals: Animal[] = [];
    for (const animalData of params.animals) {
      if (!animalData.tag_number.trim()) continue;
      const created = await this.createAnimal({
        herd_id: targetHerd.id,
        tag_number: animalData.tag_number.trim().toUpperCase(),
        name: animalData.name?.trim(),
        species: animalData.species,
        species_en: animalData.species_en || animalData.species,
        species_hi: animalData.species_hi || animalData.species,
        species_mr: animalData.species_mr || animalData.species,
        breed: animalData.breed,
        breed_en: animalData.breed_en || animalData.breed,
        breed_hi: animalData.breed_hi || animalData.breed,
        breed_mr: animalData.breed_mr || animalData.breed,
        sex: animalData.sex,
        date_of_birth: animalData.date_of_birth || null,
        is_milking: animalData.is_milking,
        milking_status: animalData.milking_status,
        vaccination_status: animalData.vaccination_status,
        notes: animalData.notes,
      });
      createdAnimals.push(created);
    }

    localStore.herdSetupDone = true;
    localStore.save();
    return { herd: targetHerd, animals: createdAnimals };
  },

  signOut() {
    localStore.currentUser = null;
    localStore.onboardingDone = false;
    localStore.herdSetupDone = false;
    localStore.vetHospitalSetupDone = false;
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
    district?: string;
    block?: string;
    village?: string;
    state?: string;
    herd_size?: number;
    hospital_name?: string;
    license_number?: string;
  }): Promise<{ profile: Profile; error?: string }> {
    let profileId = generateUUID();
    const cleanPhone = params.phone.replace(/[^0-9]/g, '');
    const farmerFarmName = `${params.full_name}'s Farm`;

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
      email: params.email?.trim() || undefined,
      location_id: params.location_id || null,
      district: params.district,
      block: params.block,
      village: params.village,
      state: params.state || 'Maharashtra',
      farm_name: farmerFarmName,
      hospital_name: params.hospital_name,
      license_number: params.license_number,
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

    // Track registered user account for strict credential matching and preserving signup data
    const registeredAccount: RegisteredAccount = {
      id: profileId,
      phone: cleanPhone,
      email: params.email?.trim() || undefined,
      password: params.password.trim(),
      role: params.role,
      full_name: params.full_name.trim(),
      farm_name: farmerFarmName,
      district: params.district,
      block: params.block,
      village: params.village,
      state: params.state || 'Maharashtra',
      herd_size: params.herd_size,
    };
    localStore.registeredAccounts = localStore.registeredAccounts.filter(
      (a) => a.phone !== cleanPhone && (!params.email || a.email !== params.email.trim())
    );
    localStore.registeredAccounts.unshift(registeredAccount);

    // 3. If farmer, create herd in Supabase & localStore titled "[Farmer Name]'s Farm"
    if (params.role === 'farmer') {
      const herdName = farmerFarmName;
      await this.createHerd({
        owner_profile_id: profileId,
        name: herdName,
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
      title_en: 'Welcome to JeevRakshak AI (Govt of Maharashtra)',
      title_hi: 'जीवक्षक AI में आपका स्वागत है (महाराष्ट्र शासन)',
      title_mr: 'जीवरक्षक AI मध्ये आपले स्वागत आहे (महाराष्ट्र शासन)',
      message: `Namaste ${params.full_name}, your ${params.role.replace('_', ' ')} account is verified. You can now register livestock and track health reports.`,
      message_en: `Namaste ${params.full_name}, your ${params.role} account is verified. You can now register livestock and track health reports.`,
      message_hi: `नमस्ते ${params.full_name}, आपका ${params.role === 'farmer' ? 'पशुपालक' : params.role === 'veterinarian' ? 'पशुचिकित्सक' : 'शासकीय'} खाता सत्यापित हो गया है। आप पशुधन पंजीकृत कर सकते हैं और स्वास्थ्य रिपोर्ट देख सकते हैं।`,
      message_mr: `नमस्ते ${params.full_name}, आपले ${params.role === 'farmer' ? 'शेतकरी/पशुपालक' : params.role === 'veterinarian' ? 'पशुवैद्यक' : 'शासकीय अधिकारी'} खाते सत्यापित झाले आहे. आपण जनावरांची नोंदणी करू शकता व आरोग्य अहवाल पाहू शकता.`,
      notification_type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    localStore.notifications.unshift(welcomeNotif);

    await dbInsert('notifications', [{
      recipient_profile_id: profileId,
      title: welcomeNotif.title,
      title_en: welcomeNotif.title_en,
      title_hi: welcomeNotif.title_hi,
      title_mr: welcomeNotif.title_mr,
      message: welcomeNotif.message,
      message_en: welcomeNotif.message_en,
      message_hi: welcomeNotif.message_hi,
      message_mr: welcomeNotif.message_mr,
      notification_type: welcomeNotif.notification_type,
      is_read: false,
    }]);

    localStore.save();
    return { profile: newProfile };
  },

  // User Sign In
  async signInUser(params: { login: string; password: string }): Promise<{ profile?: Profile; error?: string }> {
    const cleanLogin = params.login.trim();
    const cleanPhone = cleanLogin.replace(/[^0-9]/g, '');
    const cleanPass = params.password.trim();

    // 1. Try Supabase Auth
    try {
      const isPhone = cleanPhone.length === 10;
      const authEmail = isPhone ? `${cleanPhone}@jeevrakshak.org` : cleanLogin;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: cleanPass,
      });
      if (!error && data?.user) {
        const profileId = data.user.id;
        const profileRole = (data.user.user_metadata?.role as UserRole) || 'farmer';
        const matched = localStore.registeredAccounts.find(
          (acc) => acc.id === profileId || (acc.email && acc.email.toLowerCase() === authEmail.toLowerCase())
        );
        const resolvedName = matched?.full_name || data.user.user_metadata?.full_name || 'Livestock Owner';
        const profile: Profile = {
          id: profileId,
          full_name: resolvedName,
          phone: matched?.phone || data.user.user_metadata?.phone || cleanLogin,
          email: matched?.email || authEmail,
          location_id: null,
          district: matched?.district,
          block: matched?.block,
          village: matched?.village,
          state: matched?.state || 'Maharashtra',
          farm_name: `${resolvedName}'s Farm`,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (profileRole === 'farmer') {
          const herdTitle = `${resolvedName}'s Farm`;
          const existingHerd = localStore.herds.find((h) => h.owner_profile_id === profileId);
          if (existingHerd) {
            existingHerd.name = herdTitle;
          } else {
            localStore.herds.unshift({
              id: `herd-${profileId}`,
              owner_profile_id: profileId,
              name: herdTitle,
              location_id: '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
        localStore.currentUser = profile;
        localStore.currentRole = profileRole;
        localStore.onboardingDone = true;
        localStore.save();
        return { profile };
      }
    } catch {
      // ignore
    }

    // 2. Query registered accounts in localStore (matches phone or email)
    const matched = localStore.registeredAccounts.find((acc) => {
      if (cleanPhone && acc.phone === cleanPhone) return true;
      if (acc.phone === cleanLogin) return true;
      if (acc.email && acc.email.toLowerCase() === cleanLogin.toLowerCase()) return true;
      return false;
    });

    if (matched) {
      if (matched.password === cleanPass) {
        // Password matches!
        let profile = localStore.profiles.find((p) => p.id === matched.id || p.phone === matched.phone);
        if (!profile) {
          profile = {
            id: matched.id,
            full_name: matched.full_name,
            phone: matched.phone,
            email: matched.email,
            location_id: null,
            district: matched.district,
            block: matched.block,
            village: matched.village,
            state: matched.state || 'Maharashtra',
            farm_name: `${matched.full_name}'s Farm`,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          localStore.profiles.unshift(profile);
        } else {
          profile.full_name = matched.full_name;
          if (matched.email) profile.email = matched.email;
          if (matched.district) profile.district = matched.district;
          if (matched.block) profile.block = matched.block;
          if (matched.village) profile.village = matched.village;
          if (matched.state) profile.state = matched.state;
          profile.farm_name = `${matched.full_name}'s Farm`;
        }

        // Ensure user's herd is titled with farmer's name's farm
        if (matched.role === 'farmer') {
          const herdTitle = `${matched.full_name}'s Farm`;
          const userHerd = localStore.herds.find((h) => h.owner_profile_id === profile!.id);
          if (userHerd) {
            userHerd.name = herdTitle;
          } else {
            localStore.herds.unshift({
              id: `herd-${matched.id}`,
              owner_profile_id: profile.id,
              name: herdTitle,
              location_id: profile.location_id || '1',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }

        localStore.currentUser = profile;
        localStore.currentRole = matched.role;
        localStore.onboardingDone = true;
        localStore.save();
        return { profile };
      } else {
        // Wrong password entered
        return { error: 'INVALID_CREDENTIALS' };
      }
    }

    // 3. User account not found in registered database
    return { error: 'INVALID_CREDENTIALS' };
  },

  // 1. Administrative Locations (Maharashtra Reference Catalog)
  async getLocations(lang?: AppLanguage): Promise<AdministrativeLocation[]> {
    let locs: AdministrativeLocation[] = [];
    try {
      const { data, error } = await supabase.from('administrative_locations').select('*');
      if (!error && data && data.length > 0) {
        locs = data as AdministrativeLocation[];
      }
    } catch {
      // ignore
    }
    if (locs.length === 0) {
      locs = localStore.locations;
    }
    if (lang) {
      return locs.map((loc) => ({
        ...loc,
        name: getLocalizedField(loc, 'name', lang) || loc.name,
      }));
    }
    return locs;
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
      if (!error && data && data.length > 0) {
        return data as Herd[];
      }
    } catch {
      // ignore
    }
    const filtered = activeOwnerId ? localStore.herds.filter((h) => h.owner_profile_id === activeOwnerId) : localStore.herds;
    if (filtered.length > 0) {
      return filtered;
    }
    if (localStore.currentUser && localStore.currentRole === 'farmer') {
      const synthHerd: Herd = {
        id: `herd-${localStore.currentUser.id}`,
        owner_profile_id: localStore.currentUser.id,
        name: `${localStore.currentUser.full_name}'s Farm`,
        location_id: localStore.currentUser.location_id || '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStore.herds.unshift(synthHerd);
      localStore.save();
      return [synthHerd];
    }
    return [];
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

    // If farmer, strictly scope animals to the farmer's herd(s)
    if (localStore.currentRole === 'farmer' && localStore.currentUser) {
      const userHerds = await this.getHerds(localStore.currentUser.id);
      const userHerdIds = userHerds.map((h) => String(h.id));

      if (userHerdIds.length === 0) {
        return [];
      }

      if (herdId && !userHerdIds.includes(String(herdId))) {
        return [];
      }

      const targetHerdIds = herdId ? [String(herdId)] : userHerdIds;
      const numericHerdIds = targetHerdIds
        .map((id) => Number(id))
        .filter((n) => !isNaN(n) && n > 0);

      if (numericHerdIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('animals')
            .select('*')
            .in('herd_id', numericHerdIds);
          if (!error && data) {
            rawAnimals = data as Animal[];
          }
        } catch {
          // ignore
        }
      }

      // Merge matching animals from localStore for this user's herds only
      const localMatching = localStore.animals.filter((a) =>
        targetHerdIds.includes(String(a.herd_id))
      );
      const seenIds = new Set(rawAnimals.map((a) => String(a.id)));
      for (const a of localMatching) {
        if (!seenIds.has(String(a.id))) {
          rawAnimals.push(a);
          seenIds.add(String(a.id));
        }
      }

      // If user has not registered any animals yet, return empty database!
      if (rawAnimals.length === 0) {
        return [];
      }
    } else {
      // Veterinarian or Government or general overview
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

      // Fallback to localStore
      if (rawAnimals.length === 0) {
        rawAnimals = herdId
          ? localStore.animals.filter((a) => String(a.herd_id) === String(herdId))
          : localStore.animals;
      }
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
  async getDiseases(lang?: AppLanguage): Promise<DiseaseCatalogItem[]> {
    let list: DiseaseCatalogItem[] = [];
    try {
      const { data, error } = await supabase.from('disease_catalog').select('*');
      if (!error && data && data.length > 0) {
        list = data as DiseaseCatalogItem[];
      }
    } catch {
      // ignore
    }
    if (list.length === 0) {
      list = localStore.diseases;
    }
    if (lang) {
      return list.map((d) => ({
        ...d,
        name: getLocalizedField(d, 'name', lang) || d.name,
        description: getLocalizedField(d, 'description', lang) || d.description,
      }));
    }
    return list;
  },

  // 5. Health Reports & AI Triage Assessments
  async getHealthReports(): Promise<HealthReportWithDetails[]> {
    let reports: HealthReport[] = [];

    if (localStore.currentRole === 'farmer' && localStore.currentUser) {
      const currentUserId = localStore.currentUser.id;
      // 1. Fetch reports created by this farmer from Supabase
      try {
        const { data, error } = await supabase
          .from('health_reports')
          .select('*')
          .eq('reported_by', currentUserId)
          .order('reported_at', { ascending: false });
        if (!error && data) {
          reports = data as HealthReport[];
        }
      } catch {
        // ignore
      }

      // 2. Also check local reports for this user and their animals
      const userAnimals = await this.getAnimals();
      const userAnimalIds = new Set(userAnimals.map((a) => String(a.id)));

      const localUserReports = localStore.healthReports.filter(
        (r) => r.reported_by === currentUserId || (r.animal_id && userAnimalIds.has(String(r.animal_id)))
      );

      const seenIds = new Set(reports.map((r) => String(r.id)));
      for (const rep of localUserReports) {
        if (!seenIds.has(String(rep.id))) {
          reports.push(rep);
          seenIds.add(String(rep.id));
        }
      }
    } else {
      // Veterinarian or Government or general overview
      try {
        const { data, error } = await supabase
          .from('health_reports')
          .select('*')
          .order('reported_at', { ascending: false });
        if (!error && data) {
          reports = data as HealthReport[];
        }
      } catch {
        // ignore
      }

      if (reports.length === 0) {
        reports = localStore.healthReports;
      }
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
    if (localStore.currentRole === 'farmer' && localStore.currentUser && !animalId) {
      const userAnimals = await this.getAnimals();
      const userAnimalIds = new Set(userAnimals.map((a) => String(a.id)));
      if (userAnimalIds.size === 0) return [];
      return localStore.treatments.filter((t) => userAnimalIds.has(String(t.animal_id)));
    }

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

  async createTreatment(treatment: Omit<AnimalTreatment, 'id' | 'created_at'>): Promise<AnimalTreatment> {
    return this.addTreatment(treatment);
  },

  async assessCase(params: {
    health_report_id: string;
    status: CaseStatus;
    triage_method?: TriageMethod;
    assessment_notes?: string;
    assessed_by?: string;
  }): Promise<CaseAssessment> {
    const existing = localStore.caseAssessments.find((a) => String(a.health_report_id) === String(params.health_report_id));
    if (existing) {
      existing.status = params.status;
      if (params.triage_method) existing.triage_method = params.triage_method;
      if (params.assessment_notes) existing.assessment_notes = params.assessment_notes;
      if (params.assessed_by) existing.assessed_by = params.assessed_by;
      existing.assessed_at = new Date().toISOString();
      localStore.save();
      return existing;
    }

    const newAssessment: CaseAssessment = {
      id: `case-${Date.now()}`,
      health_report_id: params.health_report_id,
      status: params.status,
      triage_method: params.triage_method || 'manual',
      assessment_notes: params.assessment_notes || null,
      assessed_by: params.assessed_by || 'Veterinarian',
      assessed_at: new Date().toISOString(),
    };
    localStore.caseAssessments.unshift(newAssessment);
    localStore.save();
    return newAssessment;
  },

  // 7. Vaccinations
  async getVaccinations(animalId?: string): Promise<AnimalVaccination[]> {
    if (localStore.currentRole === 'farmer' && localStore.currentUser && !animalId) {
      const userAnimals = await this.getAnimals();
      const userAnimalIds = new Set(userAnimals.map((a) => String(a.id)));
      if (userAnimalIds.size === 0) return [];
      return localStore.vaccinations.filter((v) => userAnimalIds.has(String(v.animal_id)));
    }

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

  // 8. Diagnostic Samples
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

  async getDiagnosticSamples(): Promise<DiagnosticSample[]> {
    return this.getSamples();
  },

  async createDiagnosticSample(sample: Omit<DiagnosticSample, 'id' | 'created_at'>): Promise<DiagnosticSample> {
    return this.collectDiagnosticSample(sample);
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
  async getWeather(lang?: AppLanguage): Promise<WeatherObservation[]> {
    let list: WeatherObservation[] = [];
    try {
      const { data, error } = await supabase.from('weather_observations').select('*');
      if (!error && data && data.length > 0) {
        list = data as WeatherObservation[];
      }
    } catch {
      // ignore
    }
    if (list.length === 0) {
      list = localStore.weather;
    }
    if (lang) {
      return list.map((wx) => ({
        ...wx,
        description: getLocalizedField(wx, 'description', lang) || wx.description,
      }));
    }
    return list;
  },

  // 11. Health Advisories (Reference Data)
  async getAdvisories(lang?: AppLanguage): Promise<HealthAdvisory[]> {
    let list: HealthAdvisory[] = [];
    try {
      let query = supabase.from('health_advisories').select('*');
      if (lang) query = query.eq('language', lang);
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        list = data as HealthAdvisory[];
      }
    } catch {
      // ignore
    }
    if (list.length === 0) {
      if (lang) {
        const filtered = localStore.advisories.filter((a) => a.language === lang);
        list = filtered.length > 0 ? filtered : localStore.advisories;
      } else {
        list = localStore.advisories;
      }
    }
    if (lang) {
      return list.map((adv) => ({
        ...adv,
        title: getLocalizedField(adv, 'title', lang) || adv.title,
        message: getLocalizedField(adv, 'message', lang) || adv.message,
      }));
    }
    return list;
  },

  // 12. Notifications
  async getNotifications(profileId?: string, lang?: AppLanguage): Promise<AppNotification[]> {
    const activeId = profileId || localStore.currentUser?.id;
    let notifs: AppNotification[] = [];
    try {
      let query = supabase.from('notifications').select('*');
      if (activeId) {
        query = query.eq('recipient_profile_id', activeId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        notifs = data as AppNotification[];
      }
    } catch {
      // ignore
    }

    if (notifs.length === 0) {
      notifs = activeId
        ? localStore.notifications.filter((n) => n.recipient_profile_id === activeId || !n.recipient_profile_id)
        : localStore.notifications;
      if (notifs.length === 0) {
        notifs = localStore.notifications;
      }
    }

    if (lang) {
      return notifs.map((n) => ({
        ...n,
        title: getLocalizedField(n, 'title', lang) || n.title,
        message: getLocalizedField(n, 'message', lang) || n.message,
      }));
    }
    return notifs;
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
    if (localStore.currentRole === 'farmer' && localStore.currentUser && !herdId) {
      const userHerds = await this.getHerds(localStore.currentUser.id);
      const userHerdIds = new Set(userHerds.map((h) => String(h.id)));
      if (userHerdIds.size === 0) return [];
      return localStore.herdHealthEvents.filter((e) => userHerdIds.has(String(e.herd_id)));
    }

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
  async getOutbreaks(lang?: AppLanguage): Promise<OutbreakWithDetails[]> {
    let list: OutbreakEvent[] = [];
    try {
      const { data, error } = await supabase.from('outbreak_events').select('*');
      if (!error && data && data.length > 0) {
        list = data as OutbreakEvent[];
      }
    } catch {
      // ignore
    }
    if (list.length === 0) {
      list = localStore.outbreaks;
    }
    return list.map((ob) => {
      const rawDisease = localStore.diseases.find((d) => String(d.id) === String(ob.disease_id));
      const rawLocation = localStore.locations.find((l) => String(l.id) === String(ob.location_id));
      return {
        ...ob,
        title: lang ? getLocalizedField(ob, 'title', lang) || ob.title : ob.title,
        description: lang ? getLocalizedField(ob, 'description', lang) || ob.description : ob.description,
        disease: rawDisease && lang ? {
          ...rawDisease,
          name: getLocalizedField(rawDisease, 'name', lang) || rawDisease.name,
          description: getLocalizedField(rawDisease, 'description', lang) || rawDisease.description,
        } : rawDisease,
        location: rawLocation && lang ? {
          ...rawLocation,
          name: getLocalizedField(rawLocation, 'name', lang) || rawLocation.name,
        } : rawLocation,
      };
    });
  },

  // 15. Master Data Sync: Syncs all reference catalogs with full English, Hindi, and Marathi translations to Supabase
  async seedSupabaseMaster(): Promise<{ success: boolean; message: string }> {
    try {
      let count = 0;
      for (const loc of initialLocations) {
        const { data, error } = await dbInsert('administrative_locations', [{
          id: loc.id,
          name: loc.name,
          name_en: loc.name_en,
          name_hi: loc.name_hi,
          name_mr: loc.name_mr,
          level: loc.level,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }]);
        if (!error && data) count++;
      }

      for (const dis of initialDiseases) {
        const { data, error } = await dbInsert('disease_catalog', [{
          id: dis.id,
          name: dis.name,
          name_en: dis.name_en,
          name_hi: dis.name_hi,
          name_mr: dis.name_mr,
          description: dis.description,
          description_en: dis.description_en,
          description_hi: dis.description_hi,
          description_mr: dis.description_mr,
          species: dis.species,
          severity: dis.severity,
          is_active: dis.is_active,
        }]);
        if (!error && data) count++;
      }

      for (const adv of initialAdvisories) {
        const { data, error } = await dbInsert('health_advisories', [{
          id: adv.id,
          title: adv.title,
          title_en: adv.title_en,
          title_hi: adv.title_hi,
          title_mr: adv.title_mr,
          message: adv.message,
          message_en: adv.message_en,
          message_hi: adv.message_hi,
          message_mr: adv.message_mr,
          language: adv.language,
        }]);
        if (!error && data) count++;
      }

      for (const wx of initialWeather) {
        const { data, error } = await dbInsert('weather_observations', [{
          id: wx.id,
          location_id: wx.location_id,
          temperature_c: wx.temperature_c,
          humidity_percent: wx.humidity_percent,
          rainfall_mm: wx.rainfall_mm,
          wind_speed_kmh: wx.wind_speed_kmh,
          description: wx.description,
          description_en: wx.description_en,
          description_hi: wx.description_hi,
          description_mr: wx.description_mr,
          observed_at: wx.observed_at,
        }]);
        if (!error && data) count++;
      }

      for (const ob of initialOutbreaks) {
        const { data, error } = await dbInsert('outbreak_events', [{
          id: ob.id,
          disease_id: ob.disease_id,
          location_id: ob.location_id,
          title: ob.title,
          title_en: ob.title_en,
          title_hi: ob.title_hi,
          title_mr: ob.title_mr,
          description: ob.description,
          description_en: ob.description_en,
          description_hi: ob.description_hi,
          description_mr: ob.description_mr,
          severity: ob.severity,
          affected_herds: ob.affected_herds,
          affected_animals: ob.affected_animals,
          mortality_count: ob.mortality_count,
          started_at: ob.started_at,
          status: ob.status,
        }]);
        if (!error && data) count++;
      }

      return { success: count > 0, message: `Synced ${count} multilingual records to Supabase.` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Sync failed due to permissions.' };
    }
  },

  // =========================================================================
  // 16. VETERINARY DOCTOR SPECIFIC DATA ENGINE & ZERO-STATE ISOLATION
  // =========================================================================

  // Internal helper to read a doctor's isolated workspace store
  _getDoctorStore(doctorId: string): {
    cases: DoctorCase[];
    diagnoses: DoctorDiagnosis[];
    treatments: DoctorTreatmentRecord[];
    prescriptions: DoctorPrescriptionRecord[];
    vaccinations: DoctorVaccinationRecord[];
    visits: DoctorFieldVisitRecord[];
    diseaseReports: DoctorDiseaseReportRecord[];
  } {
    if (typeof window === 'undefined') {
      return { cases: [], diagnoses: [], treatments: [], prescriptions: [], vaccinations: [], visits: [], diseaseReports: [] };
    }

    const key = `jr_doctor_data_${doctorId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // continue
      }
    }

    // STRICT USER REQUIREMENT:
    // If this is a newly registered doctor (any doctor ID other than the demo doctor),
    // they start with strictly 0 cases, 0 treatments, 0 reports, 0 visits, 0 records!
    if (doctorId !== 'demo-vet-1') {
      const emptyStore = {
        cases: [],
        diagnoses: [],
        treatments: [],
        prescriptions: [],
        vaccinations: [],
        visits: [],
        diseaseReports: [],
      };
      localStorage.setItem(key, JSON.stringify(emptyStore));
      return emptyStore;
    }

    // Starter dataset ONLY for demo doctor ('demo-vet-1' Dr. Priya Kulkarni)
    const demoStore = {
      cases: [
        {
          id: 'case-demo-101',
          doctor_id: 'demo-vet-1',
          case_number: 'JR-CASE-261',
          animal_id: 'anim-1',
          animal_tag: 'MH-12-0042',
          animal_species: 'Cattle (Gir Cow)',
          farmer_name: 'Suresh Rambhau Shinde',
          farmer_phone: '9823012345',
          village: 'Shirapur',
          district: 'Pune',
          symptoms: 'High fever, excessive frothy salivation, oral vesicles & foot lesions',
          priority: 'urgent' as const,
          status: 'accepted' as const,
          reported_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          accepted_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'case-demo-102',
          doctor_id: 'demo-vet-1',
          case_number: 'JR-CASE-262',
          animal_id: 'anim-2',
          animal_tag: 'MH-12-0089',
          animal_species: 'Buffalo (Murrah)',
          farmer_name: 'Baburao Kale',
          farmer_phone: '9822456789',
          village: 'Koregaon Bhima',
          district: 'Pune',
          symptoms: 'Swollen quarter, reduced milk yield, clots in milk',
          priority: 'routine' as const,
          status: 'treatment_ongoing' as const,
          reported_at: new Date(Date.now() - 86400000).toISOString(),
          accepted_at: new Date(Date.now() - 43200000).toISOString(),
          diagnosis: 'Acute Clinical Mastitis (Staphylococcus aureus)',
        },
      ],
      diagnoses: [
        {
          id: 'diag-demo-1',
          doctor_id: 'demo-vet-1',
          case_id: 'case-demo-102',
          animal_tag: 'MH-12-0089',
          disease_name: 'Clinical Mastitis',
          confidence: 94,
          symptoms_analyzed: 'Swollen udder, fever 103.5°F, milk discolouration',
          recommended_tests: 'California Mastitis Test (CMT), Milk Culture',
          recommended_treatment: 'Intramammary Ceftiofur, Meloxicam injection, frequent milking',
          diagnosed_at: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      treatments: [
        {
          id: 'treat-demo-1',
          doctor_id: 'demo-vet-1',
          case_id: 'case-demo-102',
          animal_id: 'anim-2',
          animal_tag: 'MH-12-0089',
          farmer_name: 'Baburao Kale',
          treatment_plan: 'Course of 3rd generation cephalosporin + NSAID anti-inflammatory support',
          medicines: 'Ceftiofur Sodium 1g + Meloxicam 100mg',
          dosage: '1g Ceftiofur IM daily + 15ml Meloxicam IM',
          instructions: 'Strip affected quarter 4 times daily. Maintain strict teat-dip hygiene.',
          follow_up_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          status: 'ongoing' as const,
          created_at: new Date(Date.now() - 40000000).toISOString(),
        },
      ],
      prescriptions: [
        {
          id: 'rx-demo-1',
          doctor_id: 'demo-vet-1',
          doctor_name: 'Dr. Priya Kulkarni, B.V.Sc & A.H.',
          license_number: 'MSVC-18492',
          hospital_name: 'Taluka Veterinary Polyclinic, Baramati',
          animal_tag: 'MH-12-0089',
          animal_species: 'Buffalo (Murrah)',
          farmer_name: 'Baburao Kale',
          farmer_phone: '9822456789',
          medicines: [
            { name: 'Inj. Ceftiofur Sodium 1g', dosage: '1 vial IM', frequency: 'OD', duration: '3 Days' },
            { name: 'Inj. Melonex (Meloxicam)', dosage: '15 ml IM', frequency: 'OD', duration: '3 Days' },
            { name: 'Intramammary Infusion Cloxacillin', dosage: '1 tube per teat', frequency: 'BD', duration: '3 Days' },
          ],
          clinical_instructions: 'Keep cow bed clean and dry. Avoid calf suckling from infected quarter.',
          created_at: new Date(Date.now() - 40000000).toISOString(),
        },
      ],
      vaccinations: [
        {
          id: 'vac-demo-1',
          doctor_id: 'demo-vet-1',
          animal_id: 'anim-1',
          animal_tag: 'MH-12-0042',
          farmer_name: 'Suresh Rambhau Shinde',
          vaccine_name: 'Raksha-Ovac (FMD Trivalent Oil Adjuvant)',
          batch_number: 'RO-2026-B84',
          date: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0],
          booster_date: new Date(Date.now() + 86400000 * 160).toISOString().split('T')[0],
          certificate_no: 'VAC-MH-PUN-2026-9912',
        },
      ],
      visits: [
        {
          id: 'visit-demo-1',
          doctor_id: 'demo-vet-1',
          farmer_name: 'Suresh Rambhau Shinde',
          village: 'Shirapur',
          visit_date: new Date().toISOString().split('T')[0],
          purpose: 'Emergency quarantine inspection for suspected FMD vesicular lesions',
          status: 'completed' as const,
          notes: 'Quarantine barrier established. Ring vaccination advisory given to neighbor farmers.',
          distance_km: 18.4,
        },
      ],
      diseaseReports: [
        {
          id: 'dis-rep-demo-1',
          doctor_id: 'demo-vet-1',
          disease_name: 'Foot and Mouth Disease (FMD)',
          species: 'Cattle',
          district: 'Pune',
          village: 'Shirapur',
          cases_observed: 4,
          mortalities: 0,
          is_outbreak_risk: true,
          reported_to_daho: true,
          clinical_summary: '4 cattle showing vesicular eruptions on tongue and interdigital cleft. Ring vaccination initiated.',
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ],
    };

    localStorage.setItem(key, JSON.stringify(demoStore));
    return demoStore;
  },

  // Save changes to doctor's permanent isolated store
  _saveDoctorStore(doctorId: string, store: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`jr_doctor_data_${doctorId}`, JSON.stringify(store));
    }
  },

  // 1. Get Doctor Summary Statistics (Strictly dynamic & 0 for new doctors)
  async getDoctorStats(doctorId: string): Promise<DoctorStats> {
    const store = this._getDoctorStore(doctorId);
    const totalCases = store.cases.length;
    const completedCases = store.cases.filter((c) => c.status === 'resolved' || c.status === 'closed').length;
    const pendingCases = store.cases.filter((c) => c.status === 'assigned' || c.status === 'accepted' || c.status === 'in_diagnosis' || c.status === 'treatment_ongoing').length;
    const emergencyCases = store.cases.filter((c) => c.priority === 'urgent' || c.priority === 'critical').length;
    const animalsTreated = store.treatments.length;
    const vaccinationsDone = store.vaccinations.length;
    const monthlyVisits = store.visits.length;
    const reportsSubmitted = store.diseaseReports.length;
    const recoveryRate = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;

    return {
      assignedCases: totalCases,
      pendingCases,
      completedCases,
      emergencyCases,
      animalsTreated,
      vaccinationsDone,
      todayAppointments: pendingCases > 0 ? 1 : 0,
      monthlyVisits,
      recoveryRate,
      reportsSubmitted,
    };
  },

  // 2. Doctor Cases Management
  async getDoctorCases(doctorId: string): Promise<DoctorCase[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.cases];
  },

  // Accept a case
  async acceptCase(doctorId: string, caseId: string): Promise<DoctorCase | null> {
    const store = this._getDoctorStore(doctorId);
    const item = store.cases.find((c) => c.id === caseId);
    if (item) {
      item.status = 'accepted';
      item.accepted_at = new Date().toISOString();
      this._saveDoctorStore(doctorId, store);
      return item;
    }
    return null;
  },

  // Reject a case
  async rejectCase(doctorId: string, caseId: string): Promise<boolean> {
    const store = this._getDoctorStore(doctorId);
    const idx = store.cases.findIndex((c) => c.id === caseId);
    if (idx !== -1) {
      store.cases[idx].status = 'rejected';
      this._saveDoctorStore(doctorId, store);
      return true;
    }
    return false;
  },

  // Update case status
  async updateDoctorCaseStatus(
    doctorId: string,
    caseId: string,
    status: DoctorCase['status'],
    treatmentNotes?: string
  ): Promise<DoctorCase | null> {
    const store = this._getDoctorStore(doctorId);
    const item = store.cases.find((c) => c.id === caseId);
    if (item) {
      item.status = status;
      if (treatmentNotes) item.treatment_notes = treatmentNotes;
      if (status === 'resolved' || status === 'closed') {
        item.closed_at = new Date().toISOString();
      }
      this._saveDoctorStore(doctorId, store);
      return item;
    }
    return null;
  },

  // 3. Diagnosis Center
  async getDoctorDiagnoses(doctorId: string): Promise<DoctorDiagnosis[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.diagnoses];
  },

  async createDoctorDiagnosis(
    doctorId: string,
    diag: Omit<DoctorDiagnosis, 'id' | 'diagnosed_at'>
  ): Promise<DoctorDiagnosis> {
    const store = this._getDoctorStore(doctorId);
    const newDiag: DoctorDiagnosis = {
      ...diag,
      id: `diag-${Date.now()}`,
      diagnosed_at: new Date().toISOString(),
    };
    store.diagnoses.unshift(newDiag);

    // Update case if linked
    const linkedCase = store.cases.find((c) => c.id === diag.case_id);
    if (linkedCase) {
      linkedCase.diagnosis = diag.disease_name;
      linkedCase.status = 'in_diagnosis';
    }

    this._saveDoctorStore(doctorId, store);
    return newDiag;
  },

  // 4. Treatment Management
  async getDoctorTreatments(doctorId: string): Promise<DoctorTreatmentRecord[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.treatments];
  },

  async createDoctorTreatment(
    doctorId: string,
    treat: Omit<DoctorTreatmentRecord, 'id' | 'created_at'>
  ): Promise<DoctorTreatmentRecord> {
    const store = this._getDoctorStore(doctorId);
    const newTreat: DoctorTreatmentRecord = {
      ...treat,
      id: `treat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.treatments.unshift(newTreat);

    // Update linked case status to treatment_ongoing
    const linkedCase = store.cases.find((c) => c.id === treat.case_id);
    if (linkedCase) {
      linkedCase.status = 'treatment_ongoing';
      linkedCase.treatment_notes = treat.treatment_plan;
    }

    // Ripple into localStore.treatments so the farmer sees the treatment on their animal record!
    localStore.treatments.unshift({
      id: newTreat.id,
      animal_id: treat.animal_id || 'anim-1',
      treatment_name: treat.medicines || 'Prescribed Veterinary Regimen',
      treatment_date: new Date().toISOString().split('T')[0],
      dosage: treat.dosage,
      notes: `${treat.medicines}: ${treat.treatment_plan}`,
      prescribed_by: doctorId,
      created_at: newTreat.created_at,
    });
    localStore.save();

    this._saveDoctorStore(doctorId, store);
    return newTreat;
  },

  // 5. Prescription Management
  async getDoctorPrescriptions(doctorId: string): Promise<DoctorPrescriptionRecord[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.prescriptions];
  },

  async createDoctorPrescription(
    doctorId: string,
    rx: Omit<DoctorPrescriptionRecord, 'id' | 'created_at'>
  ): Promise<DoctorPrescriptionRecord> {
    const store = this._getDoctorStore(doctorId);
    const newRx: DoctorPrescriptionRecord = {
      ...rx,
      id: `rx-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.prescriptions.unshift(newRx);
    this._saveDoctorStore(doctorId, store);
    return newRx;
  },

  // 6. Vaccination Management
  async getDoctorVaccinations(doctorId: string): Promise<DoctorVaccinationRecord[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.vaccinations];
  },

  async createDoctorVaccination(
    doctorId: string,
    vac: Omit<DoctorVaccinationRecord, 'id'>
  ): Promise<DoctorVaccinationRecord> {
    const store = this._getDoctorStore(doctorId);
    const newVac: DoctorVaccinationRecord = {
      ...vac,
      id: `vac-${Date.now()}`,
    };
    store.vaccinations.unshift(newVac);

    // Ripple into localStore.vaccinations so farmer animal record is marked vaccinated!
    localStore.vaccinations.unshift({
      id: newVac.id,
      animal_id: vac.animal_id,
      vaccine_name: vac.vaccine_name,
      vaccination_date: vac.date,
      next_due_date: vac.booster_date,
      administered_by: doctorId,
      notes: `Batch: ${vac.batch_number} • Certificate: ${vac.certificate_no}`,
      created_at: new Date().toISOString(),
    });
    localStore.save();

    this._saveDoctorStore(doctorId, store);
    return newVac;
  },

  // 7. Field Visit Management
  async getDoctorVisits(doctorId: string): Promise<DoctorFieldVisitRecord[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.visits];
  },

  async createDoctorFieldVisit(
    doctorId: string,
    visit: Omit<DoctorFieldVisitRecord, 'id'>
  ): Promise<DoctorFieldVisitRecord> {
    const store = this._getDoctorStore(doctorId);
    const newVisit: DoctorFieldVisitRecord = {
      ...visit,
      id: `visit-${Date.now()}`,
    };
    store.visits.unshift(newVisit);
    this._saveDoctorStore(doctorId, store);
    return newVisit;
  },

  // 8. Disease Reporting Center (Ripples into Government Surveillance!)
  async getDoctorDiseaseReports(doctorId: string): Promise<DoctorDiseaseReportRecord[]> {
    const store = this._getDoctorStore(doctorId);
    return [...store.diseaseReports];
  },

  async createDoctorDiseaseReport(
    doctorId: string,
    rep: Omit<DoctorDiseaseReportRecord, 'id' | 'created_at'>
  ): Promise<DoctorDiseaseReportRecord> {
    const store = this._getDoctorStore(doctorId);
    const newReport: DoctorDiseaseReportRecord = {
      ...rep,
      id: `dis-rep-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    store.diseaseReports.unshift(newReport);

    // Ripple to Outbreaks and Advisories so Government Official Surveillance catches it immediately!
    if (rep.is_outbreak_risk) {
      localStore.outbreaks.unshift({
        id: `ob-auto-${Date.now()}`,
        disease_id: 'dis-1',
        location_id: 'loc-1',
        title: `Outbreak Alert: ${rep.disease_name} in ${rep.village}, ${rep.district}`,
        title_en: `Outbreak Alert: ${rep.disease_name} in ${rep.village}, ${rep.district}`,
        title_hi: `प्रकोप चेतावनी: ${rep.village}, ${rep.district} में ${rep.disease_name}`,
        title_mr: `प्रकोप सतर्कता: ${rep.village}, ${rep.district} येथे ${rep.disease_name}`,
        description: rep.clinical_summary,
        description_en: rep.clinical_summary,
        description_hi: rep.clinical_summary,
        description_mr: rep.clinical_summary,
        severity: 'critical',
        affected_herds: 2,
        affected_animals: rep.cases_observed,
        mortality_count: rep.mortalities,
        started_at: new Date().toISOString(),
        ended_at: null,
        status: 'active',
        created_by: doctorId,
      });

      localStore.advisories.unshift({
        id: `adv-auto-${Date.now()}`,
        health_report_id: null,
        title: `Urgent Veterinary Advisory: ${rep.disease_name}`,
        title_en: `Urgent Veterinary Advisory: ${rep.disease_name}`,
        title_hi: `महत्वपूर्ण पशु चिकित्सा परामर्श: ${rep.disease_name}`,
        title_mr: `तातडीचा पशुवैद्यकीय सल्ला: ${rep.disease_name}`,
        message: rep.clinical_summary,
        message_en: rep.clinical_summary,
        message_hi: rep.clinical_summary,
        message_mr: rep.clinical_summary,
        language: 'en',
        created_by: doctorId,
      });
      localStore.save();
    }

    this._saveDoctorStore(doctorId, store);
    return newReport;
  },

  // 9. Incoming Farmer Reports that a doctor can claim / accept
  async getIncomingFarmerReports(): Promise<DoctorCase[]> {
    const rawReports = await this.getHealthReports();
    return rawReports.map((r, idx) => ({
      id: `case-inc-${r.id}`,
      doctor_id: '',
      case_number: `JR-INC-${200 + idx}`,
      animal_id: String(r.animal_id || 'anim-1'),
      animal_tag: r.animal?.tag_number || `MH-12-${String(1000 + idx).slice(1)}`,
      animal_species: r.animal?.species ? `${r.animal.species.toUpperCase()} (${r.animal.breed || 'Indigenous'})` : 'Cattle (Gir)',
      farmer_name: r.reporter?.full_name || 'Shri Rameshwar Shinde',
      farmer_phone: r.reporter?.phone || '9822100200',
      village: r.location?.name || 'Shirapur',
      district: 'Pune',
      symptoms: r.symptoms || 'High fever, loss of appetite',
      priority: r.mortality_count > 0 ? 'critical' : r.symptoms.toLowerCase().includes('mouth') || r.symptoms.toLowerCase().includes('blister') ? 'urgent' : 'routine',
      status: 'assigned',
      reported_at: r.reported_at,
    }));
  },

  // Claim an incoming case into doctor's assigned cases
  async claimIncomingCase(doctorId: string, incomingCase: DoctorCase): Promise<DoctorCase> {
    const store = this._getDoctorStore(doctorId);
    const claimed: DoctorCase = {
      ...incomingCase,
      id: `case-${Date.now()}`,
      doctor_id: doctorId,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    };
    store.cases.unshift(claimed);
    this._saveDoctorStore(doctorId, store);
    return claimed;
  },
};

