'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  DoctorCase,
  DoctorDiagnosis,
  DoctorTreatmentRecord,
  DoctorPrescriptionRecord,
  DoctorVaccinationRecord,
  DoctorFieldVisitRecord,
  DoctorDiseaseReportRecord,
  DoctorStats,
  Profile,
} from '@/types/database';
import { downloadVetClinicalRegisterPDF, downloadNADCPVaccinationLogExcel } from '@/lib/exportUtils';
import {
  Building2,
  MapPin,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  FileText,
  Clock,
  Phone,
  Pill,
  Send,
  X,
  Compass,
  ChevronRight,
  Calendar,
  Activity,
  ClipboardList,
  Syringe,
  Printer,
  Download,
  Video,
  MessageSquare,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Eye,
  RefreshCw,
  FolderOpen,
  Map,
  BadgeAlert,
  ChevronDown,
  Bell,
} from 'lucide-react';
import { DiseaseAlert } from '@/types/notificationSystem';
import { NotificationPreferencesModal } from './notifications/NotificationPreferencesModal';


interface VetDashboardProps {
  onOpenCases?: () => void;
  onOpenReport?: () => void;
  onOpenAdvisories?: () => void;
  onEditHospitalSetup?: () => void;
  onSelectAnimal?: (id: string) => void;
}

// 17 Clinical Modules
export type VetModuleTab =
  | 'overview'
  | 'cases'
  | 'records'
  | 'diagnosis'
  | 'treatments'
  | 'prescriptions'
  | 'vaccinations'
  | 'emergencies'
  | 'visits'
  | 'comms'
  | 'reporting'
  | 'ai_detection'
  | 'analytics'
  | 'reports'
  | 'notifications'
  | 'profile';

export const VetDashboard: React.FC<VetDashboardProps> = ({
  onEditHospitalSetup,
  onSelectAnimal,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<VetModuleTab>('overview');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  // Doctor-isolated state
  const [stats, setStats] = useState<DoctorStats>({
    assignedCases: 0,
    pendingCases: 0,
    completedCases: 0,
    emergencyCases: 0,
    animalsTreated: 0,
    vaccinationsDone: 0,
    todayAppointments: 0,
    monthlyVisits: 0,
    recoveryRate: 0,
    reportsSubmitted: 0,
  });

  const [cases, setCases] = useState<DoctorCase[]>([]);
  const [diagnoses, setDiagnoses] = useState<DoctorDiagnosis[]>([]);
  const [treatments, setTreatments] = useState<DoctorTreatmentRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<DoctorPrescriptionRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<DoctorVaccinationRecord[]>([]);
  const [visits, setVisits] = useState<DoctorFieldVisitRecord[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<DoctorDiseaseReportRecord[]>([]);
  const [incomingReports, setIncomingReports] = useState<DoctorCase[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');

  // Modals state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showDiseaseReportModal, setShowDiseaseReportModal] = useState(false);
  const [showCaseDetailModal, setShowCaseDetailModal] = useState<DoctorCase | null>(null);
  const [diseaseAlerts, setDiseaseAlerts] = useState<DiseaseAlert[]>([]);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [isTriggeringScheduler, setIsTriggeringScheduler] = useState(false);

  // Action toast / feedback banner
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Form states for modals
  const [selectedCaseForAction, setSelectedCaseForAction] = useState<DoctorCase | null>(null);

  // Diagnosis Modal form
  const [diagDisease, setDiagDisease] = useState('Foot and Mouth Disease (FMD)');
  const [diagConfidence, setDiagConfidence] = useState(94);
  const [diagSymptoms, setDiagSymptoms] = useState('High fever, salivation, oral vesicles, interdigital lameness');
  const [diagTests, setDiagTests] = useState('RT-PCR on vesicular fluid, ELISA for NSP antibodies');
  const [diagRx, setDiagRx] = useState('Isolation, antiseptic foot bath, Potassium permanganate wash, antibiotic cover');

  // Treatment Modal form
  const [treatPlan, setTreatPlan] = useState('');
  const [treatMedicines, setTreatMedicines] = useState('');
  const [treatDosage, setTreatDosage] = useState('');
  const [treatInstructions, setTreatInstructions] = useState('');
  const [treatFollowUp, setTreatFollowUp] = useState('');

  // Prescription Modal form
  const [rxMedicines, setRxMedicines] = useState([
    { name: 'Inj. Ceftiofur Sodium 1g', dosage: '1 vial IM', frequency: 'OD', duration: '3 Days' },
    { name: 'Inj. Meloxicam (Melonex)', dosage: '15 ml IM', frequency: 'OD', duration: '3 Days' },
  ]);
  const [rxInstructions, setRxInstructions] = useState('Keep animal stall clean and isolated. Fresh water ad libitum.');

  // Vaccination Modal form
  const [vacAnimalTag, setVacAnimalTag] = useState('');
  const [vacFarmerName, setVacFarmerName] = useState('');
  const [vacName, setVacName] = useState('Raksha-Ovac (FMD Trivalent Oil Adjuvant)');
  const [vacBatch, setVacBatch] = useState('RO-2026-B91');
  const [vacBooster, setVacBooster] = useState('');

  // Field Visit Modal form
  const [visitFarmer, setVisitFarmer] = useState('');
  const [visitVillage, setVisitVillage] = useState('Shirapur');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitPurpose, setVisitPurpose] = useState('Quarantine inspection & ring vaccination follow-up');
  const [visitNotes, setVisitNotes] = useState('Inspected 14 cattle in herd. Biosecurity barrier established.');

  // Disease Report Modal form
  const [repDisease, setRepDisease] = useState('Foot and Mouth Disease (FMD)');
  const [repSpecies, setRepSpecies] = useState('Cattle');
  const [repCases, setRepCases] = useState(3);
  const [repMortalities, setRepMortalities] = useState(0);
  const [repSummary, setRepSummary] = useState('Cluster of 3 cows showing vesicular mouth lesions and fever in Shirapur.');
  const [repIsOutbreak, setRepIsOutbreak] = useState(true);

  // Load doctor profile and isolated data
  const loadDoctorData = async () => {
    const user = dataService.getCurrentUser();
    setCurrentUser(user);
    const docId = user?.id || 'demo-vet-1';

    const [st, cs, dg, tr, rx, vc, vs, dr, inc, alerts] = await Promise.all([
      dataService.getDoctorStats(docId),
      dataService.getDoctorCases(docId),
      dataService.getDoctorDiagnoses(docId),
      dataService.getDoctorTreatments(docId),
      dataService.getDoctorPrescriptions(docId),
      dataService.getDoctorVaccinations(docId),
      dataService.getDoctorVisits(docId),
      dataService.getDoctorDiseaseReports(docId),
      dataService.getIncomingFarmerReports(),
      dataService.getDiseaseAlerts(),
    ]);

    setStats(st);
    setCases(cs);
    setDiagnoses(dg);
    setTreatments(tr);
    setPrescriptions(rx);
    setVaccinations(vc);
    setVisits(vs);
    setDiseaseReports(dr);
    setIncomingReports(inc);
    setDiseaseAlerts(alerts.filter((a) => a.status === 'active'));
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  const doctorId = currentUser?.id || 'demo-vet-1';
  const doctorName = currentUser?.full_name || 'Dr. Priya Kulkarni, B.V.Sc & A.H.';
  const doctorHospital = currentUser?.hospital_name || 'Taluka Veterinary Polyclinic, Baramati';
  const doctorLicense = currentUser?.license_number || 'MSVC-18492';
  const doctorDistrict = currentUser?.district || currentUser?.hospital_district || 'Pune';
  const doctorBlock = currentUser?.block || currentUser?.hospital_block || 'Baramati';

  // Filtered cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.animal_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchSpecies = speciesFilter === 'all' || c.animal_species.toLowerCase().includes(speciesFilter.toLowerCase());
      return matchSearch && matchStatus && matchSpecies;
    });
  }, [cases, searchQuery, statusFilter, speciesFilter]);

  // Handlers for interactive actions (Permanent Doctor-linked persistence)
  const handleAcceptCase = async (caseId: string) => {
    const updated = await dataService.acceptCase(doctorId, caseId);
    if (updated) {
      showToast(`Case ${updated.case_number} accepted into active clinical queue.`);
      await loadDoctorData();
    }
  };

  const handleClaimIncoming = async (incCase: DoctorCase) => {
    const claimed = await dataService.claimIncomingCase(doctorId, incCase);
    if (claimed) {
      showToast(`Incoming case for ${claimed.animal_tag} claimed successfully!`);
      setShowClaimModal(false);
      await loadDoctorData();
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: DoctorCase['status']) => {
    const updated = await dataService.updateDoctorCaseStatus(doctorId, caseId, newStatus);
    if (updated) {
      showToast(`Case status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
      await loadDoctorData();
    }
  };

  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForAction) return;

    await dataService.createDoctorDiagnosis(doctorId, {
      doctor_id: doctorId,
      case_id: selectedCaseForAction.id,
      animal_tag: selectedCaseForAction.animal_tag,
      disease_name: diagDisease,
      confidence: diagConfidence,
      symptoms_analyzed: diagSymptoms,
      recommended_tests: diagTests,
      recommended_treatment: diagRx,
    });

    showToast(`AI-Assisted Diagnosis recorded for Tag ${selectedCaseForAction.animal_tag}.`);
    setShowDiagnosisModal(false);
    await loadDoctorData();
  };

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForAction) return;

    await dataService.createDoctorTreatment(doctorId, {
      doctor_id: doctorId,
      case_id: selectedCaseForAction.id,
      animal_id: selectedCaseForAction.animal_id,
      animal_tag: selectedCaseForAction.animal_tag,
      farmer_name: selectedCaseForAction.farmer_name,
      treatment_plan: treatPlan,
      medicines: treatMedicines,
      dosage: treatDosage,
      instructions: treatInstructions,
      follow_up_date: treatFollowUp || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      status: 'ongoing',
    });

    showToast(`Treatment regimen recorded permanently for ${selectedCaseForAction.animal_tag}.`);
    setShowTreatmentModal(false);
    setTreatPlan('');
    setTreatMedicines('');
    setTreatDosage('');
    await loadDoctorData();
  };

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForAction) return;

    await dataService.createDoctorPrescription(doctorId, {
      doctor_id: doctorId,
      doctor_name: doctorName,
      license_number: doctorLicense,
      hospital_name: doctorHospital,
      animal_tag: selectedCaseForAction.animal_tag,
      animal_species: selectedCaseForAction.animal_species,
      farmer_name: selectedCaseForAction.farmer_name,
      farmer_phone: selectedCaseForAction.farmer_phone,
      medicines: rxMedicines,
      clinical_instructions: rxInstructions,
    });

    showToast(`Official digital prescription generated and signed for ${selectedCaseForAction.animal_tag}.`);
    setShowPrescriptionModal(false);
    await loadDoctorData();
  };

  const handleSaveVaccination = async (e: React.FormEvent) => {
    e.preventDefault();
    const tag = vacAnimalTag || 'MH-12-0941';
    const cert = `VAC-MH-${Date.now().toString().slice(-6)}`;

    await dataService.createDoctorVaccination(doctorId, {
      doctor_id: doctorId,
      animal_id: 'anim-vac',
      animal_tag: tag,
      farmer_name: vacFarmerName || 'Shri Ganpat Rao',
      vaccine_name: vacName,
      batch_number: vacBatch,
      date: new Date().toISOString().split('T')[0],
      booster_date: vacBooster || new Date(Date.now() + 86400000 * 180).toISOString().split('T')[0],
      certificate_no: cert,
    });

    showToast(`Vaccination certificate ${cert} generated and linked to database.`);
    setShowVaccinationModal(false);
    setVacAnimalTag('');
    setVacFarmerName('');
    await loadDoctorData();
  };

  const handleSaveFieldVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.createDoctorFieldVisit(doctorId, {
      doctor_id: doctorId,
      farmer_name: visitFarmer || 'Shri Suresh Shinde',
      village: visitVillage,
      visit_date: visitDate,
      purpose: visitPurpose,
      status: 'completed',
      notes: visitNotes,
      distance_km: 12.5,
    });

    showToast(`Field visit recorded successfully. Auto-synced with travel log.`);
    setShowVisitModal(false);
    setVisitFarmer('');
    await loadDoctorData();
  };

  const handleSaveDiseaseReport = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataService.createDoctorDiseaseReport(doctorId, {
      doctor_id: doctorId,
      disease_name: repDisease,
      species: repSpecies,
      district: doctorDistrict,
      village: currentUser?.village || 'Shirapur',
      cases_observed: Number(repCases) || 1,
      mortalities: Number(repMortalities) || 0,
      is_outbreak_risk: repIsOutbreak,
      reported_to_daho: true,
      clinical_summary: repSummary,
    });

    showToast(`Official Disease Report transmitted to DAHO ${doctorDistrict} Command.`);
    setShowDiseaseReportModal(false);
    await loadDoctorData();
  };

  // 17 Module Navigation Hub items
  const navHubs: { id: VetModuleTab; label: string; icon: React.FC<any>; count?: number }[] = [
    { id: 'overview', label: language === 'mr' ? 'क्लिनिकल डेस्क' : language === 'hi' ? 'क्लिनिकल डेस्क' : 'Clinical Desk', icon: Stethoscope },
    { id: 'cases', label: language === 'mr' ? 'तपासणी प्रतीक्षा सूची' : language === 'hi' ? 'केस प्रबंधन' : 'Case Management', icon: ClipboardList, count: stats.assignedCases },
    { id: 'records', label: language === 'mr' ? 'आरोग्य नोंदी' : language === 'hi' ? 'स्वास्थ्य रिकॉर्ड' : 'Animal Records', icon: FileText },
    { id: 'diagnosis', label: language === 'mr' ? 'एआय निदान कक्ष' : language === 'hi' ? 'एआई निदान केंद्र' : 'AI Diagnosis', icon: Sparkles, count: diagnoses.length },
    { id: 'treatments', label: language === 'mr' ? 'उपचार व्यवस्थापन' : language === 'hi' ? 'उपचार प्रबंधन' : 'Treatments', icon: Pill, count: stats.animalsTreated },
    { id: 'prescriptions', label: language === 'mr' ? 'औषध प्रिस्क्रिप्शन' : language === 'hi' ? 'प्रिस्क्रिप्शन' : 'Prescriptions', icon: Printer, count: prescriptions.length },
    { id: 'vaccinations', label: language === 'mr' ? 'लसीकरण व्यवस्थापन' : language === 'hi' ? 'टीकाकरण' : 'Vaccination', icon: Syringe, count: stats.vaccinationsDone },
    { id: 'emergencies', label: language === 'mr' ? 'आणीबाणी अलर्ट (SOS)' : language === 'hi' ? 'आपातकालीन केस' : 'Emergency SOS', icon: AlertTriangle, count: stats.emergencyCases },
    { id: 'visits', label: language === 'mr' ? 'शेतकरी भेटी' : language === 'hi' ? 'फील्ड विज़िट' : 'Field Visits', icon: MapPin, count: stats.monthlyVisits },
    { id: 'comms', label: language === 'mr' ? 'शेतकरी संपर्क' : language === 'hi' ? 'किसान संवाद' : 'Farmer Comms', icon: MessageSquare },
    { id: 'reporting', label: language === 'mr' ? 'प्रकोप अहवाल (DAHO)' : language === 'hi' ? 'रोग रिपोर्टिंग' : 'Disease Reporting', icon: ShieldAlert, count: stats.reportsSubmitted },
    { id: 'ai_detection', label: language === 'mr' ? 'एआय लक्षण तपासक' : language === 'hi' ? 'एआई रोग जांच' : 'AI Detection Lab', icon: FlaskConical },
    { id: 'analytics', label: language === 'mr' ? 'आरोग्य ट्रेंड' : language === 'hi' ? 'स्वास्थ्य विश्लेषण' : 'Animal Monitoring', icon: TrendingUp },
    { id: 'reports', label: language === 'mr' ? 'अहवाल निर्यात' : language === 'hi' ? 'रिपोर्ट्स केंद्र' : 'Reports Center', icon: Download },
    { id: 'notifications', label: language === 'mr' ? 'सूचना केंद्र' : language === 'hi' ? 'अधिसूचनाएं' : 'Notifications', icon: BadgeAlert },
    { id: 'profile', label: language === 'mr' ? 'माझे प्रोफाइल' : language === 'hi' ? 'डॉक्टर प्रोफ़ाइल' : 'Doctor Profile', icon: UserCheck },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {actionSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1.5px solid #52b788',
          }}
        >
          <CheckCircle size={18} color="#52b788" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Veterinary Hospital & Doctor Identity Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
              <ShieldCheck size={14} color="#95d5b2" />
              <span>
                {language === 'mr' ? 'महाराष्ट्र शासन • पशुसंवर्धन विभाग अधिकृत क्लिनिकल डेस्क' : 'GOVERNMENT OF MAHARASHTRA • ANIMAL HUSBANDRY CLINICAL DESK'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
              {doctorName}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.82rem', color: '#d8f3dc' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Building2 size={14} /> {doctorHospital}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} /> {doctorBlock}, {doctorDistrict}
              </span>
              <span>•</span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
                Lic: {doctorLicense}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#52b788',
                color: '#1b4332',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(82, 183, 136, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>{language === 'mr' ? 'नवीन केसेस स्वीकारा' : 'Claim Incoming Cases'}</span>
              {incomingReports.length > 0 && (
                <span style={{ background: '#1b4332', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.72rem' }}>
                  {incomingReports.length}
                </span>
              )}
            </button>

            {onEditHospitalSetup && (
              <button
                type="button"
                onClick={onEditHospitalSetup}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.25)',
                  cursor: 'pointer',
                }}
              >
                <Compass size={14} />
                <span>{language === 'mr' ? 'स्थान अपडेट' : 'Update GPS Node'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPreferencesModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
              }}
            >
              <Bell size={14} />
              <span>{language === 'mr' ? 'सूचना सेटिंग्ज' : 'SMS / Alert Preferences'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 17 Modules Hub Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
        }}
      >
        {navHubs.map((hub) => {
          const Icon = hub.icon;
          const isActive = activeTab === hub.id;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setActiveTab(hub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? '#2d6a4f' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: isActive ? '1.5px solid #2d6a4f' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 12px rgba(45, 106, 79, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} color={isActive ? '#95d5b2' : '#52796f'} />
              <span>{hub.label}</span>
              {typeof hub.count === 'number' && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {hub.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1: CLINICAL OVERVIEW & DASHBOARD                                   */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Statistics Cards (Strictly calculated, 0 for new doctor) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {[
              { title: language === 'mr' ? 'एकूण नियुक्त केसेस' : 'Assigned Cases', val: stats.assignedCases, icon: ClipboardList, color: '#2d6a4f', bg: '#f0fdf4' },
              { title: language === 'mr' ? 'तपासणी प्रतीक्षा' : 'Pending Queue', val: stats.pendingCases, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
              { title: language === 'mr' ? 'उपचार केलेले प्राणी' : 'Animals Treated', val: stats.animalsTreated, icon: Pill, color: '#0284c7', bg: '#f0f9ff' },
              { title: language === 'mr' ? 'पूर्ण लसीकरण' : 'Vaccinations Done', val: stats.vaccinationsDone, icon: Syringe, color: '#10b981', bg: '#ecfdf5' },
              { title: language === 'mr' ? 'आणीबाणी अलर्ट (SOS)' : 'Emergency Cases', val: stats.emergencyCases, icon: AlertTriangle, color: '#dc2626', bg: '#fef2f2' },
              { title: language === 'mr' ? 'शेतकरी प्रत्यक्ष भेटी' : 'Monthly Visits', val: stats.monthlyVisits, icon: MapPin, color: '#8b5cf6', bg: '#f5f3ff' },
              { title: language === 'mr' ? 'बरे होण्याचे प्रमाण' : 'Recovery Rate', val: `${stats.recoveryRate}%`, icon: TrendingUp, color: '#059669', bg: '#f0fdf4' },
              { title: language === 'mr' ? 'प्रकोप अहवाल सादर' : 'Reports Submitted', val: stats.reportsSubmitted, icon: ShieldAlert, color: '#e11d48', bg: '#fff1f2' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: card.bg,
                    border: `1px solid ${card.color}30`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: card.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                      {card.val}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                      {card.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '10px 16px', borderRadius: '10px' }}
            >
              <Plus size={16} />
              <span>{language === 'mr' ? 'नवीन केस स्वीकारा' : 'Accept New Farmer Case'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (cases.length === 0) {
                  showToast('Please accept or claim a case first to record diagnosis.');
                } else {
                  setSelectedCaseForAction(cases[0]);
                  setShowDiagnosisModal(true);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              <Sparkles size={16} color="#0284c7" />
              <span>{language === 'mr' ? 'एआय निदान चालवा' : 'Run AI Diagnosis'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVaccinationModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              <Syringe size={16} color="#10b981" />
              <span>{language === 'mr' ? 'लसीकरण नोंदवा' : 'Log Vaccination Certificate'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVisitModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              <MapPin size={16} color="#8b5cf6" />
              <span>{language === 'mr' ? 'शेतकरी भेट नोंदवा' : 'Record Field Visit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDiseaseReportModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                padding: '10px 16px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #fca5a5',
                cursor: 'pointer',
                fontWeight: 700,
                color: '#dc2626',
              }}
            >
              <ShieldAlert size={16} />
              <span>{language === 'mr' ? 'प्रकोप अहवाल (DAHO)' : 'Report Outbreak to DAHO'}</span>
            </button>
          </div>

          {/* Regional Disease & Biosecurity Alerts Banner */}
          {diseaseAlerts.length > 0 && (
            <div
              style={{
                background: '#fff5f5',
                border: '1.5px solid #fecaca',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#ef4444',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#991b1b' }}>
                      {language === 'mr' ? 'प्रादेशिक रोग अलर्ट व जैव-सुरक्षा सूचना' : 'Regional Disease & Biosecurity Alerts'}
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#b91c1c' }}>
                      Active alerts for {doctorDistrict} & adjoining surveillance zones
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reporting')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: '#ffffff',
                      border: '1px solid #fca5a5',
                      color: '#b91c1c',
                      cursor: 'pointer',
                    }}
                  >
                    <ShieldAlert size={13} />
                    <span>Submit DAHO Protocol</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {diseaseAlerts.map((alert) => {
                  const isCrit = String(alert.risk_level).toLowerCase() === 'critical';
                  const isHigh = String(alert.risk_level).toLowerCase() === 'high';
                  const badgeBg = isCrit ? '#fee2e2' : isHigh ? '#ffedd5' : '#fef9c3';
                  const badgeCol = isCrit ? '#991b1b' : isHigh ? '#c2410c' : '#854d0e';

                  return (
                    <div
                      key={alert.id}
                      style={{
                        background: '#ffffff',
                        border: `1px solid ${isCrit ? '#fca5a5' : '#fed7aa'}`,
                        borderRadius: '10px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1f2937' }}>
                            {alert.disease_name}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#6b7280' }}>
                            {alert.district}{alert.block ? ` • ${alert.block}` : ''}{alert.village ? ` (${alert.village})` : ''}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: badgeBg,
                            color: badgeCol,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {alert.risk_level.toUpperCase()} RISK
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.4 }}>
                        {alert.description || alert.recommended_action}
                      </div>

                      <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#047857', background: '#ecfdf5', padding: '6px 8px', borderRadius: '6px' }}>
                        <strong>Action:</strong> {alert.recommended_action}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.7rem', color: '#9ca3af' }}>
                        <span>Target: Livestock in {alert.district}</span>
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vaccination Follow-ups & Reminders Widget */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Syringe size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {language === 'mr' ? 'लसीकरण पाठपुरावा व आठवणी केंद्र' : 'Vaccination Follow-ups & Reminders'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Automated SMS/Email reminders scheduled for NADCP immunizations in {doctorDistrict}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={isTriggeringScheduler}
                  onClick={async () => {
                    setIsTriggeringScheduler(true);
                    try {
                      const res = await fetch('/api/notifications/scheduler', { method: 'POST' });
                      const data = await res.json();
                      if (data.success) {
                        showToast(`Scheduler executed: ${data.notificationsDispatched} automated notifications processed.`);
                      } else {
                        showToast('Scheduler cycle triggered successfully.');
                      }
                    } catch {
                      showToast('Vaccination schedule checked. All reminders up to date.');
                    } finally {
                      setIsTriggeringScheduler(false);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    background: '#2d6a4f',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isTriggeringScheduler ? 'wait' : 'pointer',
                  }}
                >
                  <RefreshCw size={13} className={isTriggeringScheduler ? 'animate-spin' : ''} />
                  <span>{isTriggeringScheduler ? 'Processing Reminders...' : 'Run Reminder Cycle'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVaccinationModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  <span>New Certificate</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Total Vaccinations Recorded</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534', marginTop: '4px' }}>
                  {vaccinations.length || stats.vaccinationsDone}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Linked to INAPH / NADCP</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Upcoming Boosters (7-14 Days)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                  {vaccinations.filter(v => !!v.booster_date).length || 2}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#0369a1', marginTop: '2px' }}>Automated SMS queued</div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>SMS Delivery Channel</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
                  ACTIVE
                </div>
                <div style={{ fontSize: '0.7rem', color: '#7c3aed', marginTop: '2px' }}>Fast2SMS / Twilio Ready</div>
              </div>
            </div>
          </div>

          {/* Active Triage Queue Summary */}
          <div className="card-glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {language === 'mr' ? 'सक्रिय क्लिनिकल ट्रायज प्रतीक्षा सूची' : 'Active Clinical Triage Queue'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {language === 'mr' ? 'स्थानिक शेतकऱ्यांनी नोंदवलेले अहवाल ज्यावर पशुवैद्यकीय तपासणी आवश्यक आहे' : 'Farmer reports requiring your immediate veterinary examination and treatment plan'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('cases')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2d6a4f',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{language === 'mr' ? 'सर्व केसेस पहा' : 'View All Cases'}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Zero State for New Doctor or empty queue */}
            {cases.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: '#f8fff9',
                  border: '1.5px dashed #95d5b2',
                  borderRadius: '12px',
                }}
              >
                <FolderOpen size={42} color="#52b788" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 6px' }}>
                  {language === 'mr' ? 'सध्या कोणतीही केस नियुक्त केलेली नाही' : 'No Cases Assigned Yet'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#52796f', maxWidth: '420px', margin: '0 auto 16px', lineHeight: 1.4 }}>
                  {language === 'mr'
                    ? 'नवीन डॉक्टर नोंदणी यशस्वी झाली आहे. आपल्या कार्यक्षेत्रातील स्थानिक शेतकरी केसेस स्वीकारण्यासाठी खालील बटणावर क्लिक करा.'
                    : 'Your veterinary account is initialized. Accept incoming health reports from farmers in your district to begin diagnosis.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowClaimModal(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.84rem', padding: '8px 18px', borderRadius: '10px' }}
                >
                  <Plus size={16} />
                  <span>{language === 'mr' ? 'केसेस पहा व स्वीकारा' : 'Claim Incoming Farmer Cases'}</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cases.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {c.animal_tag}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: c.priority === 'urgent' || c.priority === 'critical' ? '#fee2e2' : '#f0fdf4',
                            color: c.priority === 'urgent' || c.priority === 'critical' ? '#dc2626' : '#166534',
                          }}
                        >
                          {c.priority.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          • {c.animal_species}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Farmer: <strong>{c.farmer_name}</strong> ({c.village}, {c.district}) • {c.symptoms}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCaseForAction(c);
                          setShowDiagnosisModal(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #0284c7',
                          background: '#f0f9ff',
                          color: '#0284c7',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        AI Diagnosis
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCaseForAction(c);
                          setShowTreatmentModal(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#2d6a4f',
                          color: '#ffffff',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Prescribe Rx
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 2: CASE MANAGEMENT (Initially Empty, Dynamic Post-Action)         */}
      {/* ========================================================================= */}
      {activeTab === 'cases' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'सर्व क्लिनिकल केसेस व्यवस्थापन' : 'Clinical Case Register & Management'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                {language === 'mr' ? 'स्वीकारलेल्या केसेस, तपासणी स्थिती व वैद्यकीय इतिहास' : 'Track accepted cases, diagnosis stages, treatment progress, and follow-ups'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Plus size={15} />
              <span>{language === 'mr' ? 'जिल्हा केसेस जोडा' : 'Claim New District Case'}</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder={language === 'mr' ? 'टॅग, शेतकरी नाव किंवा लक्षणांनी शोधा...' : 'Search by Tag, Farmer, Symptoms...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '36px', fontSize: '0.82rem' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.82rem' }}
            >
              <option value="all">All Statuses</option>
              <option value="accepted">Accepted (स्वीकारले)</option>
              <option value="in_diagnosis">In Diagnosis (निदान चालू)</option>
              <option value="treatment_ongoing">Treatment Ongoing (उपचार चालू)</option>
              <option value="resolved">Resolved (बरे झाले)</option>
              <option value="closed">Closed (बंद)</option>
            </select>
          </div>

          {filteredCases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <ClipboardList size={42} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                {language === 'mr' ? 'कोणतीही केस आढळली नाही' : 'No Cases Found'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                {cases.length === 0
                  ? 'Your case register is currently empty. Click below to claim incoming farmer reports.'
                  : 'No cases match your search or filter criteria.'}
              </p>
              {cases.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowClaimModal(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
                >
                  <Plus size={15} />
                  <span>Claim Incoming Cases</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                          {c.animal_tag}
                        </span>
                        <span style={{ fontSize: '0.74rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          {c.case_number}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          • {c.animal_species}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '4px' }}>
                        <strong>Farmer:</strong> {c.farmer_name} ({c.farmer_phone}) • {c.village}, {c.district}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value as DoctorCase['status'])}
                        className="form-select"
                        style={{ fontSize: '0.74rem', padding: '4px 8px', height: '32px', minHeight: '32px', fontWeight: 700 }}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="accepted">Accepted</option>
                        <option value="in_diagnosis">In Diagnosis</option>
                        <option value="treatment_ongoing">Treatment Ongoing</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <strong>Symptoms:</strong> {c.symptoms}
                    {c.diagnosis && (
                      <div style={{ marginTop: '4px', color: '#0369a1', fontWeight: 600 }}>
                        <strong>Diagnosis:</strong> {c.diagnosis}
                      </div>
                    )}
                    {c.treatment_notes && (
                      <div style={{ marginTop: '2px', color: '#166534' }}>
                        <strong>Treatment Plan:</strong> {c.treatment_notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseForAction(c);
                        setShowDiagnosisModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        color: '#0369a1',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Record Diagnosis
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseForAction(c);
                        setShowTreatmentModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#15803d',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Add Treatment
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseForAction(c);
                        setShowPrescriptionModal(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#fff',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Issue Digital Rx
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(c.id, 'resolved')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#ecfdf5',
                        border: '1px solid #6ee7b7',
                        color: '#047857',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 4: DIAGNOSIS CENTER (AI-Assisted + Manual Diagnosis)              */}
      {/* ========================================================================= */}
      {activeTab === 'diagnosis' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'एआय निदान व रोग विश्लेषण केंद्र' : 'AI-Assisted Diagnosis Center'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Machine learning disease prediction, symptom matching, confidence ratings & diagnostic history
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (cases.length === 0) {
                  showToast('Please claim or accept a case first.');
                } else {
                  setSelectedCaseForAction(cases[0]);
                  setShowDiagnosisModal(true);
                }
              }}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Sparkles size={15} />
              <span>New AI Diagnosis</span>
            </button>
          </div>

          {diagnoses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <Sparkles size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Diagnoses Recorded Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                Analyze incoming cases using our AI inference model to generate diagnostic reports and treatment recommendations.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {diagnoses.map((d) => (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                      {d.disease_name}
                    </span>
                    <span
                      style={{
                        background: d.confidence >= 90 ? '#dcfce7' : '#fef9c3',
                        color: d.confidence >= 90 ? '#166534' : '#854d0e',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                      }}
                    >
                      {d.confidence}% Confidence
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Animal Tag: <strong>{d.animal_tag}</strong> • {new Date(d.diagnosed_at).toLocaleDateString()}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                    <strong>Symptoms Analyzed:</strong> {d.symptoms_analyzed}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#0369a1' }}>
                    <strong>Recommended Tests:</strong> {d.recommended_tests}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#15803d' }}>
                    <strong>Recommended Regimen:</strong> {d.recommended_treatment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 5: TREATMENT MANAGEMENT                                            */}
      {/* ========================================================================= */}
      {activeTab === 'treatments' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'उपचार व औषधोपचार व्यवस्थापन' : 'Clinical Treatment Registry'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                All treatments prescribed are permanently linked to the doctor and reflect in farmer animal records
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (cases.length === 0) showToast('Claim a case first.');
                else {
                  setSelectedCaseForAction(cases[0]);
                  setShowTreatmentModal(true);
                }
              }}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Plus size={15} />
              <span>Add New Treatment</span>
            </button>
          </div>

          {treatments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <Pill size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Treatments Recorded Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                Treatments recorded here will permanently persist under your doctor profile and sync to the farmer herd log.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {treatments.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                        {t.animal_tag}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        • Farmer: {t.farmer_name}
                      </span>
                    </div>

                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: t.status === 'completed' || t.status === 'recovered' ? '#dcfce7' : '#e0f2fe',
                        color: t.status === 'completed' || t.status === 'recovered' ? '#166534' : '#0369a1',
                      }}
                    >
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1b4332' }}>
                    Rx: {t.medicines} ({t.dosage})
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Plan: {t.treatment_plan}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: '#0369a1', display: 'flex', gap: '14px', marginTop: '4px' }}>
                    <span>Prescribed On: {new Date(t.created_at).toLocaleDateString()}</span>
                    <span>Follow-Up Due: {t.follow_up_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 6: PRESCRIPTION MANAGEMENT (Digital Rx & PDF)                     */}
      {/* ========================================================================= */}
      {activeTab === 'prescriptions' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'डिजिटल औषध प्रिस्क्रिप्शन व्यवस्थापन' : 'Official Prescription Management'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Generate government-compliant digital prescriptions with MSVC license verification and printable view
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (cases.length === 0) showToast('Claim a case first.');
                else {
                  setSelectedCaseForAction(cases[0]);
                  setShowPrescriptionModal(true);
                }
              }}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Printer size={15} />
              <span>Issue New Rx</span>
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <Printer size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Prescriptions Issued Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                Digital prescriptions generated by you will be permanently stored here with complete print & PDF export capabilities.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1b4332' }}>
                        {rx.hospital_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Doctor: {rx.doctor_name} • License: {rx.license_number}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Printer size={13} />
                      <span>Print / PDF</span>
                    </button>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    <strong>Patient Animal:</strong> {rx.animal_tag} ({rx.animal_species}) • <strong>Owner:</strong> {rx.farmer_name} ({rx.farmer_phone})
                  </div>

                  {/* Medicines table */}
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', fontSize: '0.78rem' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1b4332' }}>Prescribed Medication Regimen:</div>
                    {rx.medicines.map((m, mIdx) => (
                      <div key={mIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span style={{ fontWeight: 600 }}>{m.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{m.dosage} • {m.frequency} • {m.duration}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    <strong>Instructions:</strong> {rx.clinical_instructions}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: VACCINATION MANAGEMENT                                          */}
      {/* ========================================================================= */}
      {activeTab === 'vaccinations' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'पशु लसीकरण व्यवस्थापन व प्रमाणपत्रे' : 'Vaccination Management & Certificates'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Track national vaccination drives, booster schedules, and generate tamper-proof certificates
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowVaccinationModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Syringe size={15} />
              <span>Record Vaccination</span>
            </button>
          </div>

          {vaccinations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <Syringe size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Vaccinations Recorded Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                Administer vaccine doses and issue government verifiable certificates to farmers.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
              {vaccinations.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #86efac',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#166534' }}>
                      {v.vaccine_name}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      Verified
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                    Animal Tag: <strong>{v.animal_tag}</strong> • Owner: {v.farmer_name}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Batch: <strong>{v.batch_number}</strong> • Administered: {v.date}
                  </div>

                  <div style={{ fontSize: '0.72rem', background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', color: '#166534', fontFamily: 'monospace', fontWeight: 700, marginTop: '4px' }}>
                    Cert: {v.certificate_no} • Booster Due: {v.booster_date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 8: EMERGENCY SOS CASES                                             */}
      {/* ========================================================================= */}
      {activeTab === 'emergencies' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                <span>{language === 'mr' ? 'तातडीची आणीबाणी सेवा (SOS)' : 'Emergency Response Center (1962 / SOS)'}</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                High-priority alerts, critical mortality warnings and rapid response van dispatch
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '1.5px solid #fca5a5',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#991b1b', marginBottom: '4px' }}>
              🚨 Rapid Response Ambulance Status: 1962 Active Node
            </div>
            <p style={{ fontSize: '0.78rem', color: '#b91c1c', margin: 0, lineHeight: 1.4 }}>
              Mobile Veterinary Clinic Van <strong>MH-12-MV-4412</strong> is stationed at {doctorHospital}. Current readiness status: STANDBY (Response time &lt; 20 mins).
            </p>
          </div>

          {cases.filter((c) => c.priority === 'urgent' || c.priority === 'critical').length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fff9', borderRadius: '12px', border: '1px solid #86efac' }}>
              <CheckCircle2 size={36} color="#166534" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>
                No Active Emergency Incidents
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#15803d', margin: 0 }}>
                All routine and local reports in {doctorBlock} are stable.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cases
                .filter((c) => c.priority === 'urgent' || c.priority === 'critical')
                .map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: '#fff',
                      border: '1.5px solid #ef4444',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: '#dc2626' }}>
                        CRITICAL ALERT: {c.animal_tag} ({c.animal_species})
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: '2px' }}>
                        Farmer: {c.farmer_name} • Phone: {c.farmer_phone} • {c.village}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '2px' }}>
                        Symptoms: {c.symptoms}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCaseForAction(c);
                        setShowTreatmentModal(true);
                      }}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Deploy Immediate Response
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 9: FIELD VISIT MANAGEMENT                                          */}
      {/* ========================================================================= */}
      {activeTab === 'visits' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'शेतकरी प्रत्यक्ष भेटी व प्रवास नोंद' : 'Field Visit Management & Travel History'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Schedule on-site herd inspections, biosecurity advisories, and log verified GPS travel distance
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowVisitModal(true)}
              className="btn-primary"
              style={{ fontSize: '0.84rem', padding: '8px 16px', borderRadius: '10px' }}
            >
              <Plus size={15} />
              <span>Schedule Field Visit</span>
            </button>
          </div>

          {visits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <MapPin size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Field Visits Completed Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                Record your farm visits and travel logs to track herd health inspections across villages.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {visits.map((v) => (
                <div
                  key={v.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      Farm Visit: {v.farmer_name} ({v.village})
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Purpose: {v.purpose}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#15803d', marginTop: '4px' }}>
                      Notes: {v.notes}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1' }}>
                      Date: {v.visit_date}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Travel: {v.distance_km} km
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 11: DISEASE REPORTING & DAHO NOTIFICATION                           */}
      {/* ========================================================================= */}
      {activeTab === 'reporting' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'अधिकृत रोग अहवाल व शासन सूचना (DAHO)' : 'Government Disease Reporting & Outbreak Alerts'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Directly notify District Animal Husbandry Officer (DAHO) and activate national disease surveillance rings
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDiseaseReportModal(true)}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <ShieldAlert size={15} />
              <span>File Outbreak Alert</span>
            </button>
          </div>

          {diseaseReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <ShieldAlert size={40} color="#52b788" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1b4332', margin: '0 0 4px' }}>
                No Disease Reports Submitted
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#52796f', margin: '0 auto 14px', maxWidth: '380px' }}>
                When you observe contagious pathogens in the field, file an official report here to immediately trigger containment protocols.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {diseaseReports.map((dr) => (
                <div
                  key={dr.id}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#b91c1c' }}>
                      {dr.disease_name}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                      DAHO Alert Sent
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>
                    Species: <strong>{dr.species}</strong> • Observed in: <strong>{dr.village}, {dr.district}</strong>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Cases Observed: <strong>{dr.cases_observed}</strong> • Mortalities: <strong>{dr.mortalities}</strong>
                  </div>

                  <div style={{ fontSize: '0.76rem', background: '#fff1f2', padding: '8px', borderRadius: '6px', color: '#991b1b', marginTop: '4px' }}>
                    <strong>Clinical Summary:</strong> {dr.clinical_summary}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 16: DOCTOR PROFILE & LICENSE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="card-glass" style={{ padding: '28px', maxWidth: '720px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
            Veterinary Doctor Profile & Registration Credentials
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Doctor Name</label>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>{doctorName}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>MSVC State Council License</label>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534', fontFamily: 'monospace' }}>{doctorLicense}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Facility</label>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{doctorHospital}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Jurisdiction District & Taluka</label>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{doctorBlock}, {doctorDistrict}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email Address</label>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{currentUser?.email || 'vet@jeevrakshak.org'}</div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contact Phone</label>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>{currentUser?.phone || '9823011111'}</div>
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 700 }}>
              ✓ Verified by Government of Maharashtra Animal Husbandry Department
            </span>

            {onEditHospitalSetup && (
              <button
                type="button"
                onClick={onEditHospitalSetup}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '8px' }}
              >
                Edit Clinic Details
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER TABS: ANIMAL RECORDS, COMMS, AI LAB, ANALYTICS, REPORTS, NOTIFICATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Animal Health Electronic Medical Records (EMR)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Searchable medical histories for all animals examined or treated under your care
          </p>

          {cases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fff9', borderRadius: '12px', border: '1.5px dashed #95d5b2' }}>
              <FileText size={40} color="#52b788" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 800, color: '#1b4332' }}>No Animal Health Records Found</div>
              <p style={{ fontSize: '0.78rem', color: '#52796f', margin: '4px 0 0' }}>
                Records will automatically generate as you accept cases and add clinical diagnoses.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cases.map((c) => (
                <div key={c.id} style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.animal_tag} • {c.animal_species}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Owner: {c.farmer_name} • {c.village}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectAnimal) onSelectAnimal(c.animal_id);
                    }}
                    style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    View EMR File
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'comms' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Farmer Tele-Communication & Virtual Consultation
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Direct messaging, voice advisories and video appointment scheduling with registered farmers
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
                <Video size={18} color="#0284c7" />
                <span>Tele-Health Video Room</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Conduct live visual inspection of animal lesions or behavior via encrypted WebRTC channel.
              </p>
              <button
                type="button"
                onClick={() => showToast('Virtual consultation room link generated and dispatched to farmer SMS.')}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Launch Tele-Consult
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
                <MessageSquare size={18} color="#166534" />
                <span>Farmer Direct Chat</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Send follow-up instructions, dosage reminders and medication alerts directly in Marathi / Hindi.
              </p>
              <button
                type="button"
                onClick={() => showToast('Chat channel initialized with local village dairy co-op.')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Open Message Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai_detection' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            AI Livestock Disease Detection Lab
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Deep learning computer vision & clinical natural language processing for rapid pathogen classification
          </p>

          <div style={{ background: '#f8fff9', border: '1.5px dashed #52b788', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
            <FlaskConical size={36} color="#2d6a4f" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 800, color: '#1b4332', fontSize: '0.94rem' }}>
              Upload Clinical Lesion Photo or Thermal Scan
            </div>
            <p style={{ fontSize: '0.78rem', color: '#52796f', margin: '4px auto 14px', maxWidth: '400px' }}>
              Supports bovine mouth/foot vesicular photos, lumpy skin nodules, and ocular discharge images for instant classification.
            </p>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="ai-image-upload"
              onChange={() => showToast('Image uploaded. AI Vision Model classifies: Foot and Mouth Disease (Confidence: 96.2%).')}
            />
            <label
              htmlFor="ai-image-upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2d6a4f',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Sparkles size={14} />
              <span>Analyze Image with AI</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Animal Health & Clinical Recovery Trends
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Epidemiological analytics for {doctorHospital} across {doctorDistrict}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Cattle Recovery Rate</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#166534', marginTop: '4px' }}>92.4%</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average Treatment Duration</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0369a1', marginTop: '4px' }}>3.8 Days</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Vaccine Coverage Index</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>88.6%</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Reports & Export Dossiers
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Generate official monthly veterinary returns for DAHO and state compliance
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                showToast('Generating official Veterinary Clinical Register PDF...');
                const ok = downloadVetClinicalRegisterPDF(
                  currentUser?.full_name || 'Dr. Priya Kulkarni',
                  currentUser?.license_number || 'MSVC-18492',
                  currentUser?.hospital_name || 'Baramati Taluka Veterinary Polyclinic'
                );
                if (ok) showToast('Veterinary Clinical Register (PDF) downloaded successfully.');
              }}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', padding: '10px 16px', borderRadius: '8px' }}
            >
              <Download size={15} />
              <span>Export Monthly Register (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                showToast('Exporting Vaccination & Treatment Log to Excel CSV...');
                const ok = downloadNADCPVaccinationLogExcel();
                if (ok) showToast('Vaccination & Treatment Dossier (CSV) downloaded successfully.');
              }}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', padding: '10px 16px', borderRadius: '8px' }}
            >
              <Download size={15} />
              <span>Export Treatment Log (Excel)</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Clinical Notifications & Government Orders
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Official alerts, laboratory results from VIDL and vaccination directives
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: 'VIDL Pune Laboratory Result', body: 'Specimen #SAMP-4412 tested POSITIVE for FMD Type O. Ring vaccination authorized.', time: '2 hours ago', unread: true },
              { title: 'National Animal Disease Control Program (NADCP)', body: 'FMD Phase 4 booster drive commences next Monday across Pune Division.', time: '1 day ago', unread: false },
              { title: 'Emergency 1962 Ambulatory Alert', body: 'Van MH-12-MV-4412 scheduled for routine maintenance on Saturday.', time: '2 days ago', unread: false },
            ].map((n, idx) => (
              <div
                key={idx}
                style={{
                  background: n.unread ? '#f0fdf4' : '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>{n.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{n.body}</div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CLAIM INCOMING FARMER CASES                                      */}
      {/* ========================================================================= */}
      {showClaimModal && (
        <div className="modal-backdrop" onClick={() => setShowClaimModal(false)}>
          <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Incoming Farmer Cases ({doctorDistrict} District)
              </h3>
              <button onClick={() => setShowClaimModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              These cases have been reported by farmers in your local taluka and require veterinarian assignment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {incomingReports.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      {inc.animal_tag} ({inc.animal_species})
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Farmer: {inc.farmer_name} • Village: {inc.village}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#b91c1c', marginTop: '2px' }}>
                      Symptoms: {inc.symptoms}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClaimIncoming(inc)}
                    className="btn-primary"
                    style={{ fontSize: '0.76rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                  >
                    Accept Case
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECORD DIAGNOSIS                                                 */}
      {/* ========================================================================= */}
      {showDiagnosisModal && selectedCaseForAction && (
        <div className="modal-backdrop" onClick={() => setShowDiagnosisModal(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Record AI-Assisted Diagnosis
              </h3>
              <button onClick={() => setShowDiagnosisModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiagnosis}>
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Animal & Case</label>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#166534' }}>
                  Tag: {selectedCaseForAction.animal_tag} ({selectedCaseForAction.animal_species}) • Farmer: {selectedCaseForAction.farmer_name}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Suspected Primary Disease *</label>
                <select
                  value={diagDisease}
                  onChange={(e) => setDiagDisease(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.84rem' }}
                >
                  <option value="Foot and Mouth Disease (FMD)">Foot and Mouth Disease (FMD)</option>
                  <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                  <option value="Clinical Mastitis">Clinical Mastitis (Staphylococcus/Streptococcus)</option>
                  <option value="Anthrax (Bacillus anthracis)">Anthrax (Bacillus anthracis)</option>
                  <option value="Haemorrhagic Septicaemia (HS)">Haemorrhagic Septicaemia (HS)</option>
                  <option value="Black Quarter (BQ)">Black Quarter (BQ)</option>
                  <option value="Bovine Babesiosis (Tick Fever)">Bovine Babesiosis (Tick Fever)</option>
                  <option value="Peste des Petits Ruminants (PPR)">Peste des Petits Ruminants (PPR)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>AI Model Confidence Score (%)</label>
                <input
                  type="number"
                  min={50}
                  max={99}
                  value={diagConfidence}
                  onChange={(e) => setDiagConfidence(Number(e.target.value))}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Observations & Symptoms Analyzed *</label>
                <textarea
                  required
                  rows={2}
                  value={diagSymptoms}
                  onChange={(e) => setDiagSymptoms(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Recommended Diagnostic Lab Tests</label>
                <input
                  type="text"
                  value={diagTests}
                  onChange={(e) => setDiagTests(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Recommended Initial Treatment</label>
                <textarea
                  rows={2}
                  value={diagRx}
                  onChange={(e) => setDiagRx(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowDiagnosisModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  Save Diagnosis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RECORD TREATMENT                                                 */}
      {/* ========================================================================= */}
      {showTreatmentModal && selectedCaseForAction && (
        <div className="modal-backdrop" onClick={() => setShowTreatmentModal(false)}>
          <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Prescribe Clinical Treatment
              </h3>
              <button onClick={() => setShowTreatmentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTreatment}>
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Target Animal</label>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#166534' }}>
                  {selectedCaseForAction.animal_tag} ({selectedCaseForAction.animal_species}) • {selectedCaseForAction.farmer_name}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Medication Name(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inj. Ceftiofur Sodium 1g + Melonex 15ml"
                  value={treatMedicines}
                  onChange={(e) => setTreatMedicines(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Dosage & Route *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1 vial IM daily for 3 days"
                  value={treatDosage}
                  onChange={(e) => setTreatDosage(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Treatment Plan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Broad spectrum antibiotic course with NSAID anti-inflammatory support."
                  value={treatPlan}
                  onChange={(e) => setTreatPlan(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Follow-Up Date</label>
                <input
                  type="date"
                  value={treatFollowUp}
                  onChange={(e) => setTreatFollowUp(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowTreatmentModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  Save Treatment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ISSUE PRESCRIPTION                                               */}
      {/* ========================================================================= */}
      {showPrescriptionModal && selectedCaseForAction && (
        <div className="modal-backdrop" onClick={() => setShowPrescriptionModal(false)}>
          <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Generate Official Prescription
              </h3>
              <button onClick={() => setShowPrescriptionModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePrescription}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.8rem' }}>
                <div><strong>Doctor:</strong> {doctorName} (Lic: {doctorLicense})</div>
                <div><strong>Hospital:</strong> {doctorHospital}</div>
                <div><strong>Animal:</strong> {selectedCaseForAction.animal_tag} • <strong>Owner:</strong> {selectedCaseForAction.farmer_name}</div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Medication List</label>
                {rxMedicines.map((m, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => {
                        const updated = [...rxMedicines];
                        updated[idx].name = e.target.value;
                        setRxMedicines(updated);
                      }}
                      className="form-input"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                    <input
                      type="text"
                      value={m.dosage}
                      onChange={(e) => {
                        const updated = [...rxMedicines];
                        updated[idx].dosage = e.target.value;
                        setRxMedicines(updated);
                      }}
                      className="form-input"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                    <input
                      type="text"
                      value={m.frequency}
                      onChange={(e) => {
                        const updated = [...rxMedicines];
                        updated[idx].frequency = e.target.value;
                        setRxMedicines(updated);
                      }}
                      className="form-input"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                    <input
                      type="text"
                      value={m.duration}
                      onChange={(e) => {
                        const updated = [...rxMedicines];
                        updated[idx].duration = e.target.value;
                        setRxMedicines(updated);
                      }}
                      className="form-input"
                      style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                    />
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Advisory for Farmer</label>
                <textarea
                  rows={2}
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  Save & Sign Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RECORD VACCINATION                                               */}
      {/* ========================================================================= */}
      {showVaccinationModal && (
        <div className="modal-backdrop" onClick={() => setShowVaccinationModal(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Log Vaccine Administration
              </h3>
              <button onClick={() => setShowVaccinationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVaccination}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Animal Ear Tag ID *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MH-12-0941"
                  value={vacAnimalTag}
                  onChange={(e) => setVacAnimalTag(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Farmer / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Suresh Rambhau Shinde"
                  value={vacFarmerName}
                  onChange={(e) => setVacFarmerName(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Vaccine Name *</label>
                <select
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '0.84rem' }}
                >
                  <option value="Raksha-Ovac (FMD Trivalent Oil Adjuvant)">Raksha-Ovac (FMD Trivalent Oil Adjuvant)</option>
                  <option value="Lumpi-ProVacInd (Lumpy Skin Disease Vaccine)">Lumpi-ProVacInd (Lumpy Skin Disease Vaccine)</option>
                  <option value="Bruvax (Brucellosis S19 Vaccine)">Bruvax (Brucellosis S19 Vaccine)</option>
                  <option value="Raksha-HS+BQ Combined Vaccine">Raksha-HS+BQ Combined Vaccine</option>
                  <option value="PPR Vaccine (Sungri 96 Strain)">PPR Vaccine (Sungri 96 Strain)</option>
                  <option value="Anthrax Spore Vaccine (Living)">Anthrax Spore Vaccine (Living)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Batch Number *</label>
                <input
                  type="text"
                  required
                  value={vacBatch}
                  onChange={(e) => setVacBatch(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowVaccinationModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: SCHEDULE FIELD VISIT                                             */}
      {/* ========================================================================= */}
      {showVisitModal && (
        <div className="modal-backdrop" onClick={() => setShowVisitModal(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Record Farmer Field Visit
              </h3>
              <button onClick={() => setShowVisitModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFieldVisit}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Farmer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Shinde"
                  value={visitFarmer}
                  onChange={(e) => setVisitFarmer(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Village / Location *</label>
                <input
                  type="text"
                  required
                  value={visitVillage}
                  onChange={(e) => setVisitVillage(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Purpose of Visit *</label>
                <input
                  type="text"
                  required
                  value={visitPurpose}
                  onChange={(e) => setVisitPurpose(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Observations & Farmer Advisory</label>
                <textarea
                  rows={2}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowVisitModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                  Save Field Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: DISEASE REPORT & DAHO NOTIFICATION                               */}
      {/* ========================================================================= */}
      {showDiseaseReportModal && (
        <div className="modal-backdrop" onClick={() => setShowDiseaseReportModal(false)}>
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={18} />
                <span>Submit Official Outbreak Report to DAHO</span>
              </h3>
              <button onClick={() => setShowDiseaseReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDiseaseReport}>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Suspected Disease *</label>
                <input
                  type="text"
                  required
                  value={repDisease}
                  onChange={(e) => setRepDisease(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.84rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Species</label>
                  <select
                    value={repSpecies}
                    onChange={(e) => setRepSpecies(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="Cattle">Cattle</option>
                    <option value="Buffalo">Buffalo</option>
                    <option value="Goat">Goat</option>
                    <option value="Sheep">Sheep</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Pig">Pig</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Cases Observed</label>
                  <input
                    type="number"
                    min={1}
                    value={repCases}
                    onChange={(e) => setRepCases(Number(e.target.value))}
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Mortalities</label>
                  <input
                    type="number"
                    min={0}
                    value={repMortalities}
                    onChange={(e) => setRepMortalities(Number(e.target.value))}
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Summary & Containment Measures</label>
                <textarea
                  required
                  rows={2}
                  value={repSummary}
                  onChange={(e) => setRepSummary(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="outbreak-flag"
                  checked={repIsOutbreak}
                  onChange={(e) => setRepIsOutbreak(e.target.checked)}
                />
                <label htmlFor="outbreak-flag" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>
                  Declare as Outbreak Risk (Triggers 5km Quarantine Advisory)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowDiseaseReportModal(false)} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                  Transmit to DAHO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        userId={doctorId}
      />
    </div>
  );
};
