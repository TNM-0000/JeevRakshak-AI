'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  HealthReportWithDetails,
  DiagnosticSample,
  CaseEscalation,
  AnimalTreatment,
  Profile,
} from '@/types/database';
import {
  Building2,
  MapPin,
  Stethoscope,
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
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
} from 'lucide-react';

interface VetDashboardProps {
  onOpenCases: () => void;
  onOpenReport: () => void;
  onOpenAdvisories: () => void;
  onEditHospitalSetup: () => void;
  onSelectAnimal: (id: string) => void;
}

const vetCopy = {
  en: {
    badge: 'GOVERNMENT OF MAHARASHTRA • ANIMAL HUSBANDRY CLINICAL DESK',
    hospitalNode: 'Official Veterinary Hospital Node',
    exactLocation: 'Exact GPS Node',
    licenseNo: 'MSVC License',
    emergencyHelpline: 'Emergency 24/7 Helpline',
    editHospitalBtn: 'Update Hospital & Exact Location',
    kpiPendingCases: 'Urgent Cases in Queue',
    kpiSamplesDispatched: 'Lab Samples Pipeline',
    kpiHighRiskAlerts: 'Suspected Outbreak Alerts',
    kpiTreatmentsCount: 'Prescriptions Issued',
    urgentQueueTitle: 'Active Clinical Triage Queue',
    urgentQueueSubtitle: 'Live health reports submitted by local farmers requiring veterinarian review and intervention.',
    allCasesBtn: 'View Full Clinical Register',
    animalTag: 'Tag',
    species: 'Species',
    farmer: 'Farmer',
    village: 'Village',
    symptoms: 'Symptoms',
    reportedAt: 'Reported',
    actions: 'Clinical Actions',
    assessBtn: 'Triage & Assess',
    prescribeBtn: 'Prescribe Rx',
    sampleBtn: 'Order Lab Test',
    escalateBtn: 'Escalate to DAHO',
    noUrgentCases: 'No pending urgent cases. All local reports have been triaged.',
    samplesPipelineTitle: 'Diagnostic Samples & Laboratory Pipeline',
    samplesSubtitle: 'Tracking disease specimens dispatched to District Veterinary Diagnostic Labs.',
    sampleId: 'Sample ID',
    type: 'Sample Type',
    status: 'Lab Status',
    collectedDate: 'Collected On',
    statusCollected: 'Collected (नमुना घेतला)',
    statusSent: 'In Transit to Lab (पाठवला)',
    statusReceived: 'Received at Lab (प्राप्त)',
    statusTested: 'Test Completed (चाचणी पूर्ण)',
    prescribeModalTitle: 'Prescribe Treatment & Medication',
    medicineName: 'Medicine / Antibiotic / Antipyretic Name',
    medicinePlaceholder: 'e.g. Enrofloxacin 10% / Meloxicam injection',
    dosage: 'Dosage & Administration Route',
    dosagePlaceholder: 'e.g. 15 ml IM daily for 3 days',
    notes: 'Clinical Instructions for Farmer',
    notesPlaceholder: 'e.g. Keep animal in isolated stall, provide fresh water',
    saveTreatmentBtn: 'Record Treatment in Database',
    savingTreatment: 'Saving Prescription...',
    quickTreatmentRecorded: 'Prescription recorded successfully in database.',
    sampleModalTitle: 'Dispatch Diagnostic Specimen',
    sampleTypeLabel: 'Sample Specimen Type',
    sampleNotes: 'Field Observations & Suspected Pathogen',
    sampleNotesPlaceholder: 'e.g. Vesicular fluid from oral lesion, suspected FMD',
    dispatchSampleBtn: 'Dispatch to District Lab',
    dispatching: 'Dispatching Sample...',
    sampleDispatchedSuccess: 'Specimen dispatched to District Disease Investigation Laboratory.',
    escalateModalTitle: 'Escalate Outbreak to DAHO (District Animal Husbandry Officer)',
    escalateReason: 'Reason for State Escalation',
    escalateNotes: 'Epidemiological Details',
    escalateNotesPlaceholder: 'e.g. 5 animals in same village displaying high fever and mouth blisters',
    sendEscalationBtn: 'Transmit Urgent Alert to DAHO',
    escalationSentSuccess: 'Outbreak alert transmitted directly to District Officer.',
    closeBtn: 'Close',
  },
  hi: {
    badge: 'महाराष्ट्र शासन • पशु चिकित्सालय क्लिनिकल डेस्क',
    hospitalNode: 'अधिकृत पशु चिकित्सालय नोड',
    exactLocation: 'सटीक जीपीएस नोड',
    licenseNo: 'लाइसेंस क्रमांक',
    emergencyHelpline: '२४/७ आपातकालीन नंबर',
    editHospitalBtn: 'अस्पताल व जीपीएस स्थान अपडेट करें',
    kpiPendingCases: 'जांच प्रतीक्षा सूची',
    kpiSamplesDispatched: 'लैब नमूने (पाइपलाइन)',
    kpiHighRiskAlerts: 'प्रकोप चेतावनी',
    kpiTreatmentsCount: 'जारी किए गए नुस्खे',
    urgentQueueTitle: 'सक्रिय क्लिनिकल जांच सूची',
    urgentQueueSubtitle: 'स्थानीय पशुपालकों द्वारा दर्ज किए गए लक्षण जिन पर तत्काल पशु चिकित्सक की आवश्यकता है।',
    allCasesBtn: 'पूरी सूची देखें',
    animalTag: 'टैग',
    species: 'पशु',
    farmer: 'पशुपालक',
    village: 'गाँव',
    symptoms: 'लक्षण',
    reportedAt: 'समय',
    actions: 'चिकित्सकीय कार्रवाई',
    assessBtn: 'जांच करें',
    prescribeBtn: 'दवा लिखें',
    sampleBtn: 'लैब नमूना लें',
    escalateBtn: 'ज़िला अधिकारी को भेजें',
    noUrgentCases: 'कोई लंबित केस नहीं है। सभी रिपोर्ट की जांच हो चुकी है।',
    samplesPipelineTitle: 'प्रयोगशाला परीक्षण एवं नमूना स्थिति',
    samplesSubtitle: 'ज़िला रोग निदान प्रयोगशाला में भेजे गए नमूनों की स्थिति।',
    sampleId: 'नमूना आईडी',
    type: 'प्रकार',
    status: 'स्थिति',
    collectedDate: 'तारीख',
    statusCollected: 'नमूना संकलित',
    statusSent: 'लैब भेजा गया',
    statusReceived: 'लैब प्राप्त हुआ',
    statusTested: 'जांच पूर्ण',
    prescribeModalTitle: 'उपचार और दवा दर्ज करें',
    medicineName: 'दवा का नाम',
    medicinePlaceholder: 'उदा. एनरोफ्लोक्सासिन / मेलोक्सिकैम',
    dosage: 'खुराक',
    dosagePlaceholder: 'उदा. १५ मिलीलीटर मांसपेशी में ३ दिन',
    notes: 'पशुपालक के लिए निर्देश',
    notesPlaceholder: 'उदा. पशु को अलग रखें, स्वच्छ पानी दें',
    saveTreatmentBtn: 'डेटाबेस में उपचार सहेजें',
    savingTreatment: 'सहेजा जा रहा है...',
    quickTreatmentRecorded: 'उपचार सफलतापूर्वक सहेजा गया।',
    sampleModalTitle: 'जांच के लिए नमूना भेजें',
    sampleTypeLabel: 'नमूने का प्रकार',
    sampleNotes: 'संदेहास्पद बीमारी व विवरण',
    sampleNotesPlaceholder: 'उदा. मुंह के छालों से द्रव, एफएमडी का संदेह',
    dispatchSampleBtn: 'ज़िला प्रयोगशाला भेजें',
    dispatching: 'भेजा जा रहा है...',
    sampleDispatchedSuccess: 'नमूना प्रयोगशाला को सफलतापूर्वक भेजा गया।',
    escalateModalTitle: 'ज़िला पशु संवर्धन अधिकारी (DAHO) को सूचित करें',
    escalateReason: 'सूचित करने का कारण',
    escalateNotes: 'प्रकोप विवरण',
    escalateNotesPlaceholder: 'उदा. एक ही गाँव में कई पशुओं में खुरपका-मुंहपका के लक्षण',
    sendEscalationBtn: 'अधिकारी को तत्काल अलर्ट भेजें',
    escalationSentSuccess: 'ज़िला अधिकारी को आपातकालीन अलर्ट भेज दिया गया।',
    closeBtn: 'बंद करें',
  },
  mr: {
    badge: 'महाराष्ट्र शासन • पशुवैद्यकीय क्लिनिकल डेस्क',
    hospitalNode: 'अधिकृत पशुवैद्यकीय रुग्णालय नोड',
    exactLocation: 'अचूक GPS नोड',
    licenseNo: 'MSVC लायसन्स',
    emergencyHelpline: '२४/७ आपत्कालीन संपर्क',
    editHospitalBtn: 'रुग्णालय माहिती व GPS स्थान बदला',
    kpiPendingCases: 'तपासणी प्रतीक्षा सूची',
    kpiSamplesDispatched: 'प्रयोगशाळा नमुने (Pipeline)',
    kpiHighRiskAlerts: 'प्रकोप धोक्याची सूचना',
    kpiTreatmentsCount: 'दिलेले औषधोपचार',
    urgentQueueTitle: 'सक्रिय क्लिनिकल तपासणी सूची',
    urgentQueueSubtitle: 'स्थानिक शेतकऱ्यांनी नोंदवलेले आजारी जनावरांचे अहवाल ज्यांना तातडीने उपचारांची गरज आहे.',
    allCasesBtn: 'संपूर्ण रुग्ण नोंदवही पहा',
    animalTag: 'टॅग क्र.',
    species: 'पशू',
    farmer: 'शेतकरी',
    village: 'गाव',
    symptoms: 'लक्षणे',
    reportedAt: 'वेळ',
    actions: 'उपचार कृती',
    assessBtn: 'तपासणी व निदान',
    prescribeBtn: 'औषधोपचार नोंदवा',
    sampleBtn: 'नमुना पाठवा',
    escalateBtn: 'DAHO कडे पाठवा',
    noUrgentCases: 'कोणतीही तातडीची तपासणी शिल्लक नाही. सर्व अहवाल तपासले गेले आहेत.',
    samplesPipelineTitle: 'निदान नमुने व प्रयोगशाळा तपासणी',
    samplesSubtitle: 'जिल्हा पशुवैद्यकीय रोग निदान प्रयोगशाळेकडे पाठवलेल्या नमुन्यांचा मागोवा.',
    sampleId: 'नमुना क्र.',
    type: 'नमुना प्रकार',
    status: 'प्रयोगशाळा स्थिती',
    collectedDate: 'संकलन तारीख',
    statusCollected: 'नमुना घेतला',
    statusSent: 'प्रयोगशाळेकडे रवाना',
    statusReceived: 'प्रयोगशाळेत प्राप्त',
    statusTested: 'तपासणी अहवाल तयार',
    prescribeModalTitle: 'औषधोपचार व प्रिस्क्रिप्शन नोंदवा',
    medicineName: 'औषध / ॲन्टिबायोटिकचे नाव',
    medicinePlaceholder: 'उदा. एन्रोफ्लॉक्सॉसिन १०% / मेलोक्सिकॅम',
    dosage: 'मात्रा व देण्याची पद्धत (Dosage)',
    dosagePlaceholder: 'उदा. १५ मिली दररोज स्नायूमध्ये सलग ३ दिवस',
    notes: 'शेतकऱ्यास द्यावयाच्या सूचना',
    notesPlaceholder: 'उदा. जनावरास इतर जनावरांपासून वेगळे बांधावे, ताजे पाणी द्यावे',
    saveTreatmentBtn: 'डेटाबेसमध्ये उपचार नोंदवा',
    savingTreatment: 'उपचार नोंद होत आहे...',
    quickTreatmentRecorded: 'औषधोपचार डेटाबेसमध्ये यशस्वीरित्या नोंदवला गेला.',
    sampleModalTitle: 'रोगनिदान नमुना प्रयोगशाळेकडे पाठवा',
    sampleTypeLabel: 'नमुना प्रकार',
    sampleNotes: 'प्राथमिक लक्षणे व संशयित आजार',
    sampleNotesPlaceholder: 'उदा. तोंडातील लाळ व व्रण, संशयित लाळ-खुरकूत',
    dispatchSampleBtn: 'जिल्हा प्रयोगशाळेकडे रवाना करा',
    dispatching: 'नमुना पाठवला जात आहे...',
    sampleDispatchedSuccess: 'नमुना जिल्हा रोग अन्वेषण प्रयोगशाळेकडे रवाना करण्यात आला.',
    escalateModalTitle: 'जिल्हा पशुसंवर्धन अधिकाऱ्यांकडे (DAHO) तक्रार पाठवा',
    escalateReason: 'कारणे',
    escalateNotes: 'प्रकोपाचा सविस्तर तपशील',
    escalateNotesPlaceholder: 'उदा. गावातील ५ जनावरांमध्ये एकाच वेळी तीव्र ताप व तोंडाचे व्रण आढळले',
    sendEscalationBtn: 'DAHO कडे तत्काळ अलर्ट पाठवा',
    escalationSentSuccess: 'जिल्हा पशुसंवर्धन अधिकाऱ्यांना तत्काळ अलर्ट पाठवला गेला.',
    closeBtn: 'बंद करा',
  },
};

export const VetDashboard: React.FC<VetDashboardProps> = ({
  onOpenCases,
  onOpenReport,
  onOpenAdvisories,
  onEditHospitalSetup,
  onSelectAnimal,
}) => {
  const { language } = useLanguage();
  const copy = vetCopy[language] || vetCopy.mr;

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [samples, setSamples] = useState<DiagnosticSample[]>([]);
  const [treatments, setTreatments] = useState<AnimalTreatment[]>([]);
  const [activeReport, setActiveReport] = useState<HealthReportWithDetails | null>(null);

  // Modals
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  // Prescribe form
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [treatmentSuccessMsg, setTreatmentSuccessMsg] = useState<string | null>(null);

  // Sample form
  const [sampleType, setSampleType] = useState('Nasal Swab');
  const [sampleNotes, setSampleNotes] = useState('');
  const [sampleSuccessMsg, setSampleSuccessMsg] = useState<string | null>(null);

  // Escalate form
  const [escalateReason, setEscalateReason] = useState('Rapid disease cluster in taluka');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [escalateSuccessMsg, setEscalateSuccessMsg] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const user = dataService.getCurrentUser();
    setCurrentUser(user);

    const allReports = await dataService.getHealthReports();
    setReports(allReports);

    const allSamples = await dataService.getDiagnosticSamples();
    setSamples(allSamples);

    const allTreatments = await dataService.getTreatments();
    setTreatments(allTreatments);
  };

  useEffect(() => {
    loadData();
  }, [language]);

  const urgentReports = reports.filter(
    (r) => r.assessment?.status === 'suspected' || !r.assessment
  );

  const handlePrescribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    setIsSubmitting(true);

    try {
      await dataService.createTreatment({
        animal_id: activeReport.animal_id,
        treatment_name: medicineName.trim(),
        dosage: dosage.trim() || '1 Dose IM',
        notes: treatmentNotes.trim(),
        treatment_date: new Date().toISOString().split('T')[0],
        prescribed_by: currentUser?.id || 'vet-profile-1',
      });

      // Update assessment to probable/confirmed
      await dataService.assessCase({
        health_report_id: activeReport.id,
        status: 'confirmed',
        triage_method: 'manual',
        assessment_notes: `Prescribed: ${medicineName.trim()} (${dosage.trim()})`,
      });

      setTreatmentSuccessMsg(copy.quickTreatmentRecorded);
      setTimeout(() => {
        setTreatmentSuccessMsg(null);
        setShowPrescribeModal(false);
        setMedicineName('');
        setDosage('');
        setTreatmentNotes('');
        loadData();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSampleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    setIsSubmitting(true);

    try {
      await dataService.createDiagnosticSample({
        health_report_id: activeReport.id,
        sample_type: sampleType,
        collected_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        received_at: null,
        tested_at: null,
        status: 'collected',
        result: null,
        notes: sampleNotes.trim() || 'Sample dispatched to District Disease Investigation Laboratory',
      });

      setSampleSuccessMsg(copy.sampleDispatchedSuccess);
      setTimeout(() => {
        setSampleSuccessMsg(null);
        setShowSampleModal(false);
        setSampleNotes('');
        loadData();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;
    setIsSubmitting(true);

    try {
      await dataService.escalateCase({
        health_report_id: activeReport.id,
        escalated_to: 'District Animal Husbandry Officer (DAHO)',
        reason: `${escalateReason} - ${escalateNotes}`,
        status: 'open',
        resolved_at: null,
      });

      setEscalateSuccessMsg(copy.escalationSentSuccess);
      setTimeout(() => {
        setEscalateSuccessMsg(null);
        setShowEscalateModal(false);
        setEscalateNotes('');
        loadData();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hospitalName = currentUser?.hospital_name || (language === 'mr' ? 'तालुका पशुवैद्यकीय सर्वचिकित्सालय, बारामती' : 'Baramati Taluka Veterinary Polyclinic');
  const lat = currentUser?.hospital_lat || 18.520432;
  const lng = currentUser?.hospital_lng || 73.856743;
  const license = currentUser?.license_number || 'MSVC/2021/04910';
  const emergencyPhone = currentUser?.emergency_phone || '02112-224100';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* 1. Official Hospital Node Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #092c3e 0%, #03151f 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          border: '1px solid rgba(14, 165, 233, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(14, 165, 233, 0.2)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                marginBottom: '10px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <Building2 size={13} />
              <span>{copy.badge}</span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
              {hospitalName}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: '#cbd5e1', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#38bdf8" />
                <span>
                  {copy.exactLocation}: <strong style={{ color: '#fff' }}>{lat.toFixed(6)}° N, {lng.toFixed(6)}° E</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={15} color="#38bdf8" />
                <span>
                  {copy.licenseNo}: <strong style={{ color: '#fff' }}>{license}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#38bdf8" />
                <span>
                  {copy.emergencyHelpline}: <strong style={{ color: '#fff' }}>{emergencyPhone}</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onEditHospitalSetup}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={15} />
            <span>{copy.editHospitalBtn}</span>
          </button>
        </div>
      </div>

      {/* 2. Clinical KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div
          className="metric-card"
          onClick={onOpenCases}
          style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {copy.kpiPendingCases}
            </span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {urgentReports.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, marginTop: '4px' }}>
            {language === 'mr' ? 'तात्काळ तपासणी आवश्यक' : 'Awaiting veterinary triage'}
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {copy.kpiSamplesDispatched}
            </span>
            <FlaskConical size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {samples.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0369a1', fontWeight: 600, marginTop: '4px' }}>
            {language === 'mr' ? 'जिल्हा रोग निदान प्रयोगशाळा' : 'District Lab Dispatch Pipeline'}
          </div>
        </div>

        <div
          className="metric-card"
          onClick={onOpenAdvisories}
          style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {copy.kpiHighRiskAlerts}
            </span>
            <ShieldAlert size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            2
          </div>
          <div style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
            {language === 'mr' ? 'FMD व लाळ्या खुरकूत सतर्कता' : 'Taluka containment active'}
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {copy.kpiTreatmentsCount}
            </span>
            <Pill size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {treatments.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, marginTop: '4px' }}>
            {language === 'mr' ? 'डेटाबेसमध्ये नोंद असलेले उपचार' : 'Recorded treatments'}
          </div>
        </div>
      </div>

      {/* 3. Urgent Clinical Triage Desk */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} color="var(--primary)" />
              <span>{copy.urgentQueueTitle}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {urgentReports.length} {language === 'mr' ? 'केस' : 'cases'}
              </span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {copy.urgentQueueSubtitle}
            </p>
          </div>

          <button
            onClick={onOpenCases}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <span>{copy.allCasesBtn}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {urgentReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="var(--stable)" style={{ margin: '0 auto 10px auto' }} />
            <p style={{ fontWeight: 600 }}>{copy.noUrgentCases}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {urgentReports.map((report) => (
              <div
                key={report.id}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#e0f2fe',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}
                    >
                      {report.animal?.species === 'Buffalo' ? '🐃' : report.animal?.species === 'Goat' ? '🐐' : '🐄'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          onClick={() => onSelectAnimal(report.animal_id)}
                          style={{
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {report.animal?.tag_number || report.animal_id}
                          {report.animal?.name ? ` (${report.animal.name})` : ''}
                        </span>
                        <span style={{ fontSize: '0.74rem', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                          {report.animal?.species} • {report.animal?.breed}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {copy.farmer}: <strong>{report.reporter?.full_name || 'Livestock Owner'}</strong> ({report.reporter?.phone || 'Shirur'})
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertTriangle size={12} />
                    <span>{report.assessment?.status || 'SUSPECTED'}</span>
                  </span>
                </div>

                {/* Symptoms highlight box */}
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertTriangle size={15} flex-shrink="0" />
                  <div>
                    <strong>{copy.symptoms}:</strong> {report.symptoms}
                    {report.notes ? ` — ${report.notes}` : ''}
                  </div>
                </div>

                {/* 1-Click Action Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      setActiveReport(report);
                      setShowPrescribeModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Pill size={14} />
                    <span>{copy.prescribeBtn}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveReport(report);
                      setShowSampleModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(2, 132, 199, 0.1)',
                      color: '#0284c7',
                      border: '1px solid rgba(2, 132, 199, 0.3)',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <FlaskConical size={14} />
                    <span>{copy.sampleBtn}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveReport(report);
                      setShowEscalateModal(true);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#dc2626',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      padding: '7px 14px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={14} />
                    <span>{copy.escalateBtn}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Diagnostic Samples Pipeline */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FlaskConical size={20} color="#0284c7" />
              <span>{copy.samplesPipelineTitle}</span>
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {copy.samplesSubtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {samples.slice(0, 4).map((sample) => (
            <div
              key={sample.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '12px 16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                  {sample.sample_type} • <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{sample.id}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {copy.collectedDate}: {sample.collected_at ? new Date(sample.collected_at).toLocaleDateString() : 'Today'}
                  {sample.notes ? ` — ${sample.notes}` : ''}
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background:
                    sample.status === 'tested'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : sample.status === 'received'
                      ? 'rgba(2, 132, 199, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                  color:
                    sample.status === 'tested'
                      ? 'var(--stable)'
                      : sample.status === 'received'
                      ? '#0284c7'
                      : '#d97706',
                  border: '1px solid currentColor',
                }}
              >
                {sample.status === 'tested'
                  ? copy.statusTested
                  : sample.status === 'received'
                  ? copy.statusReceived
                  : sample.status === 'sent'
                  ? copy.statusSent
                  : copy.statusCollected}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Prescribe Medication */}
      {showPrescribeModal && activeReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={18} color="var(--primary)" />
                <span>{copy.prescribeModalTitle}</span>
              </div>
              <button onClick={() => setShowPrescribeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', marginBottom: '16px' }}>
              <strong>Animal:</strong> {activeReport.animal?.tag_number} ({activeReport.animal?.species}) • <strong>Farmer:</strong> {activeReport.reporter?.full_name}
            </div>

            {treatmentSuccessMsg ? (
              <div style={{ padding: '16px', background: '#ecfdf5', color: '#047857', borderRadius: '8px', textAlign: 'center', fontWeight: 700 }}>
                ✓ {treatmentSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handlePrescribeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.medicineName} *</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.medicinePlaceholder}
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.dosage} *</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.dosagePlaceholder}
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.notes}</label>
                  <textarea
                    rows={2}
                    placeholder={copy.notesPlaceholder}
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowPrescribeModal(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                  >
                    {copy.closeBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ flex: 2, padding: '10px', borderRadius: '8px' }}
                  >
                    {isSubmitting ? copy.savingTreatment : copy.saveTreatmentBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Order Diagnostic Sample */}
      {showSampleModal && activeReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="#0284c7" />
                <span>{copy.sampleModalTitle}</span>
              </div>
              <button onClick={() => setShowSampleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {sampleSuccessMsg ? (
              <div style={{ padding: '16px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', textAlign: 'center', fontWeight: 700 }}>
                ✓ {sampleSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSampleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.sampleTypeLabel}</label>
                  <select
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Nasal swab">Nasal Swab (नाकातील स्राव)</option>
                    <option value="Blood smear">Blood Smear / Whole Blood (रक्त नमुना)</option>
                    <option value="Vesicular fluid">Vesicular Fluid (तोंडातील फोडांचे पाणी)</option>
                    <option value="Milk sample">Milk Sample (दुधाचा नमुना - Mastitis)</option>
                    <option value="Fecal sample">Fecal Sample (शेण नमुना)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.sampleNotes}</label>
                  <textarea
                    rows={3}
                    placeholder={copy.sampleNotesPlaceholder}
                    value={sampleNotes}
                    onChange={(e) => setSampleNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowSampleModal(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                  >
                    {copy.closeBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#0284c7' }}
                  >
                    {isSubmitting ? copy.dispatching : copy.dispatchSampleBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Escalate to DAHO */}
      {showEscalateModal && activeReport && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '500px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} />
                <span>{copy.escalateModalTitle}</span>
              </div>
              <button onClick={() => setShowEscalateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {escalateSuccessMsg ? (
              <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center', fontWeight: 700 }}>
                ✓ {escalateSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.escalateReason}</label>
                  <select
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="form-select"
                  >
                    <option value="Suspected Notifiable Zoonotic Outbreak">Suspected Notifiable Zoonotic Outbreak (अधिसूचित संसर्गजन्य रोग)</option>
                    <option value="Rapid disease spread across taluka herds">Rapid disease spread across taluka herds (तालुक्यात जलद प्रसार)</option>
                    <option value="Mortality cluster in village">Mortality cluster in village (जनावरांचा संशयास्पद मृत्यू)</option>
                    <option value="Urgent ring vaccination buffer required">Urgent ring vaccination buffer required (तातडीने लस पुरवठा गरज)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.escalateNotes}</label>
                  <textarea
                    rows={3}
                    placeholder={copy.escalateNotesPlaceholder}
                    value={escalateNotes}
                    onChange={(e) => setEscalateNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
                  >
                    {copy.closeBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ flex: 2, padding: '10px', borderRadius: '8px', background: '#dc2626' }}
                  >
                    {copy.sendEscalationBtn}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
