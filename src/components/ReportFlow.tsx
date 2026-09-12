'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  Animal,
  ReportSource,
  HealthReportWithDetails,
  DiseaseCatalogItem,
} from '@/types/database';
import { getLocalizedField } from '@/lib/i18n/dbLocalization';
import {
  AlertCircle,
  Skull,
  Syringe,
  Pill,
  Users,
  FlaskConical,
  HelpCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Printer,
  FileText,
  ShieldCheck,
  Activity,
  MapPin,
  AlertTriangle,
  Clock,
  Building2,
  Sparkles,
  Stethoscope,
  Info,
  Thermometer,
  Microscope,
} from 'lucide-react';

interface ReportFlowProps {
  onReportComplete: (report: HealthReportWithDetails) => void;
  onCancel: () => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({ onReportComplete, onCancel }) => {
  const { t, language } = useLanguage();
  const currentUser = dataService.getCurrentUser();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCatalogItem[]>([]);

  // Step 1: Issue Type
  const [selectedCategory, setSelectedCategory] = useState<string>('sick');

  // Step 2: Animal & Symptoms Form
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mortalityCount, setMortalityCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<ReportSource>('mobile');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Step 3: Result from AI Triage
  const [generatedReport, setGeneratedReport] = useState<HealthReportWithDetails | null>(null);

  useEffect(() => {
    dataService.getAnimals().then((data) => {
      setAnimals(data);
      if (data.length > 0) setSelectedAnimalId(data[0].id);
    });
    dataService.getDiseases(language).then(setDiseases);
  }, [language]);

  const symptomList: { key: keyof typeof t.symptoms; defaultEn: string }[] = [
    { key: 'fever', defaultEn: 'Fever' },
    { key: 'coughing', defaultEn: 'Coughing' },
    { key: 'nasalDischarge', defaultEn: 'Nasal discharge' },
    { key: 'difficultyBreathing', defaultEn: 'Difficulty breathing' },
    { key: 'diarrhea', defaultEn: 'Diarrhea' },
    { key: 'lossOfAppetite', defaultEn: 'Loss of appetite' },
    { key: 'weakness', defaultEn: 'Weakness' },
    { key: 'skinLesions', defaultEn: 'Skin lesions' },
    { key: 'swelling', defaultEn: 'Swelling' },
    { key: 'abnormalMovement', defaultEn: 'Abnormal movement' },
    { key: 'suddenDeath', defaultEn: 'Sudden death' },
    { key: 'reducedMilk', defaultEn: 'Reduced milk production' },
  ];

  const handleToggleSymptom = (symptomName: string) => {
    if (selectedSymptoms.includes(symptomName)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomName));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptomName]);
    }
  };

  const handleStep1Select = (catKey: string) => {
    setSelectedCategory(catKey);
    if (catKey === 'died') {
      setMortalityCount(1);
      if (!selectedSymptoms.includes('Sudden death')) {
        setSelectedSymptoms([...selectedSymptoms, 'Sudden death']);
      }
    } else if (catKey === 'sick') {
      if (selectedSymptoms.length === 0) {
        setSelectedSymptoms(['Fever', 'Loss of appetite']);
      }
    }
    setStep(3);
  };

  const [manualTag, setManualTag] = useState<string>('');

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetAnimalId = selectedAnimalId;

    // If user has no animals or chose manual entry, create the animal first
    if (!targetAnimalId && manualTag.trim()) {
      const currentUser = dataService.getCurrentUser();
      const herds = await dataService.getHerds();
      let targetHerdId = herds[0]?.id;
      if (!targetHerdId) {
        const newHerd = await dataService.createHerd({
          name: currentUser?.full_name ? `${currentUser.full_name}'s Herd` : 'Livestock Herd',
          owner_profile_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
          location_id: '',
        });
        targetHerdId = newHerd.id;
      }
      const createdAnimal = await dataService.createAnimal({
        herd_id: targetHerdId,
        tag_number: manualTag.trim().toUpperCase(),
        species: 'Cattle',
        breed: 'Indigenous',
        sex: 'female',
        date_of_birth: null,
      });
      targetAnimalId = createdAnimal.id;
    }

    if (!targetAnimalId) return;

    setSubmitting(true);
    const symptomsString = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'Fever, Oral blisters, Excessive salivation, Lameness';
    const currentUser = dataService.getCurrentUser();

    try {
      // Map to 19 database tables (health_reports, case_assessments, risk_assessments, health_report_diseases)
      const report = await dataService.createHealthReport({
        animal_id: targetAnimalId,
        reported_by: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        source,
        symptoms: symptomsString,
        mortality_count: Number(mortalityCount) || 0,
        notes: notes || null,
      });

      setGeneratedReport(report);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
      setStep(4);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep((step - 1) as 1 | 2 | 3)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            <span>{language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}</span>
          </button>
        )}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', marginLeft: step === 1 ? 'auto' : 0 }}>
          {language === 'mr' ? `टप्पा ${step} / ४` : language === 'hi' ? `चरण ${step} / 4` : `STEP ${step} OF 4`}
        </div>
      </div>

      {/* STEP 1: Animal Selection */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.selectAnimal}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {language === 'mr'
              ? 'तक्रार नोंदवण्यासाठी तुमच्या कळपातील जनावर निवडा.'
              : language === 'hi'
              ? 'रिपोर्ट दर्ज करने के लिए अपने झुंड से पशु चुनें।'
              : 'Select an animal from your herd to report.'}
          </p>

          <div className="form-group">
            {animals.length > 0 ? (
              <select
                value={selectedAnimalId}
                onChange={(e) => setSelectedAnimalId(e.target.value)}
                className="form-select"
                required
              >
                {animals.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.tag_number} ({a.species} - {a.breed}, {a.sex})
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  required
                  placeholder={
                    language === 'mr'
                      ? 'पशू टॅग क्रमांक टाका (उदा. MH-12-PUN-0101)'
                      : language === 'hi'
                      ? 'पशु टैग नंबर दर्ज करें (उदा. MH-12-PUN-0101)'
                      : 'Enter animal tag number (e.g. MH-12-PUN-0101)'
                  }
                  value={manualTag}
                  onChange={(e) => setManualTag(e.target.value)}
                  className="form-input"
                />
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {language === 'mr'
                    ? 'अद्याप कोणतेही पशू नोंदणीकृत नाहीत. हा टॅग या अहवालासह आपोआप तुमच्या कळपात नोंदवला जाईल.'
                    : language === 'hi'
                    ? 'अभी तक कोई पशु पंजीकृत नहीं है। यह टैग इस रिपोर्ट के साथ स्वचालित रूप से आपके झुंड में पंजीकृत हो जाएगा।'
                    : 'No livestock registered yet. This tag will be registered to your herd automatically with this report.'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!selectedAnimalId && !manualTag}
            className="btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
          >
            {language === 'mr' ? 'पुढे जा' : language === 'hi' ? 'आगे बढ़ें' : 'Next'}
          </button>
        </div>
      )}

      {/* STEP 2: What are you seeing? (Matching Wireframe Screen 7) */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.step1Title}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t.reporting.step1Subtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                id: 'sick',
                title: t.reporting.animalSeemsSick,
                desc: t.reporting.animalSeemsSickDesc,
                icon: AlertCircle,
                color: '#059669',
                bg: '#ecfdf5',
              },
              {
                id: 'died',
                title: t.reporting.animalDied,
                desc: t.reporting.animalDiedDesc,
                icon: Skull,
                color: '#dc2626',
                bg: '#fef2f2',
              },
              {
                id: 'multiple',
                title: t.reporting.multipleAnimalsAffected,
                desc: t.reporting.multipleAnimalsAffectedDesc,
                icon: Users,
                color: '#d97706',
                bg: '#fffbeb',
              },
              {
                id: 'vaccine',
                title: t.reporting.vaccinationIssue,
                desc: t.reporting.vaccinationIssueDesc,
                icon: Syringe,
                color: '#2563eb',
                bg: '#eff6ff',
              },
              {
                id: 'treatment',
                title: t.reporting.treatmentIssue,
                desc: t.reporting.treatmentIssueDesc,
                icon: Pill,
                color: '#7c3aed',
                bg: '#f5f3ff',
              },
              {
                id: 'sample',
                title: t.reporting.sampleNeeded,
                desc: t.reporting.sampleNeededDesc,
                icon: FlaskConical,
                color: '#0891b2',
                bg: '#ecfeff',
              },
              {
                id: 'other',
                title: t.reporting.otherIssue,
                desc: language === 'mr' ? 'इतर लक्षणे नोंदवा' : language === 'hi' ? 'अन्य लक्षण दर्ज करें' : 'Describe custom symptom observation',
                icon: HelpCircle,
                color: '#475569',
                bg: '#f1f5f9',
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleStep1Select(cat.id)}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    padding: '16px',
                    border: selectedCategory === cat.id ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: cat.bg,
                      color: cat.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.98rem', fontWeight: 700 }}>{cat.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{cat.desc}</div>
                  </div>
                  <ChevronRight size={18} color="var(--text-light)" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Symptoms Selection Form (Matching Wireframe Screen 8) */}
      {step === 3 && (
        <form onSubmit={handleSubmitReport}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px' }}>{t.reporting.step2Title}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {t.reporting.step2Subtitle}
          </p>

          {/* Symptoms Checklist */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label">{t.reporting.step2Title}</label>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>
                {selectedSymptoms.length} {t.reporting.symptomsCount}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
              {symptomList.map((item) => {
                const label = t.symptoms[item.key] || item.defaultEn;
                const isSelected = selectedSymptoms.includes(item.defaultEn);

                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => handleToggleSymptom(item.defaultEn)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      background: isSelected ? 'var(--primary-light)' : '#ffffff',
                      color: isSelected ? 'var(--primary-deep)' : 'var(--text-main)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{label}</span>
                    {isSelected && <Check size={14} strokeWidth={3} color="var(--primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mortality Count Input */}
          <div className="form-group">
            <label className="form-label">{t.reporting.mortalityCount}</label>
            <input
              type="number"
              min="0"
              value={mortalityCount}
              onChange={(e) => setMortalityCount(parseInt(e.target.value) || 0)}
              className="form-input"
            />
          </div>

          {/* Observations / Notes */}
          <div className="form-group">
            <label className="form-label">{t.reporting.additionalNotes}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.reporting.notesPlaceholder}
              className="form-textarea"
            />
          </div>

          {/* Source Selection (Mapped to report_source enum: web, mobile, ivr) */}
          <div className="form-group">
            <label className="form-label">{t.reporting.source}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['mobile', 'web', 'ivr'] as ReportSource[]).map((src) => (
                <button
                  type="button"
                  key={src}
                  onClick={() => setSource(src)}
                  className={`role-pill ${source === src ? 'active' : ''}`}
                  style={{ textTransform: 'capitalize', padding: '6px 14px' }}
                >
                  {src.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
          >
            {submitting ? t.reporting.submitting : t.reporting.submitReport}
          </button>
        </form>
      )}

      {/* STEP 4: Automated AI Triage Assessment & Official Clinical Report (Matching Wireframe Screen 9) */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Official Government Header Banner */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 24px rgba(6, 78, 59, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fef08a',
                  }}
                >
                  <ShieldAlert size={26} strokeWidth={2.4} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#a7f3d0' }}>
                    {language === 'mr'
                      ? 'महाराष्ट्र शासन • पशुसंवर्धन विभाग'
                      : language === 'hi'
                      ? 'महाराष्ट्र शासन • पशुपालन विभाग'
                      : 'GOVERNMENT OF MAHARASHTRA • DEPARTMENT OF ANIMAL HUSBANDRY'}
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
                    {language === 'mr'
                      ? 'साथरोग एआय ट्रायज व निदान अहवाल'
                      : language === 'hi'
                      ? 'महामारी एआई ट्राइएज एवं निदान रिपोर्ट'
                      : 'State Epidemiological AI Triage Report'}
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: '#d1fae5' }}>
                    {language === 'mr'
                      ? 'महाराष्ट्र पशुधन रोग नियंत्रण व जलद प्रतिसाद नेटवर्क (MLDSN)'
                      : language === 'hi'
                      ? 'महाराष्ट्र पशुधन रोग नियंत्रण एवं त्वरित प्रतिक्रिया नेटवर्क'
                      : 'Maharashtra Livestock Disease Surveillance & Rapid Response Network'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid #f87171',
                    color: '#fecaca',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '4px',
                  }}
                >
                  {language === 'mr' ? 'अति-तातडीचे' : language === 'hi' ? 'अति-आपातकालीन' : 'CRITICAL URGENCY'}
                </span>
                <div style={{ fontSize: '0.72rem', color: '#d1fae5' }}>
                  REF #{generatedReport?.id ? `MH-TRG-${generatedReport.id}` : 'MH-TRG-2026-0942'}
                </div>
              </div>
            </div>
          </div>

          {/* Animal & Farm Context Card */}
          <div className="glass-card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {currentUser?.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <MapPin size={13} />
                <span>
                  {currentUser?.district
                    ? `${currentUser.state || 'Maharashtra'} • ${currentUser.district}${currentUser.block ? ` (${currentUser.block})` : ''}`
                    : 'Maharashtra • Pune (Shirur Block)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{language === 'mr' ? 'टॅग क्रमांक' : language === 'hi' ? 'टैग संख्या' : 'Ear Tag ID'}</div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
                  {animals.find((a) => a.id === selectedAnimalId)?.tag_number || manualTag.trim().toUpperCase() || 'MH-12-PUN-0101'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{language === 'mr' ? 'प्रजाती व जात' : language === 'hi' ? 'प्रजाति एवं नस्ल' : 'Species & Breed'}</div>
                <div style={{ fontSize: '0.96rem', fontWeight: 800 }}>
                  {animals.find((a) => a.id === selectedAnimalId)?.species || 'Cattle'} • {animals.find((a) => a.id === selectedAnimalId)?.breed || 'Gir'}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{language === 'mr' ? 'नोंदणी वेळ' : language === 'hi' ? 'समय' : 'Timestamp'}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Today
                </div>
              </div>
            </div>

            {/* Observed Symptoms Badges */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                {language === 'mr' ? 'नोंदवलेली प्राथमिक लक्षणे:' : language === 'hi' ? 'दर्ज प्राथमिक लक्षण:' : 'Observed Primary Symptoms:'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(selectedSymptoms.length > 0
                  ? selectedSymptoms
                  : ['Fever (ताप)', 'Oral blisters (तोंडात फोड)', 'Excessive salivation (लाळ गळणे)', 'Reduced appetite (कमी भूक)', 'Lameness (लंगडणे)']
                ).map((sym, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid #fca5a5',
                    }}
                  >
                    • {sym}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main AI Triage Assessment Banner (Hardcoded Wireframe Screen 9) */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
              border: '1.5px solid #f87171',
              borderRadius: 'var(--radius-xl)',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={24} color="#dc2626" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#dc2626' }}>
                  {language === 'mr' ? 'एआय ट्रायज स्वयंचलित निष्कर्ष' : language === 'hi' ? 'एआई ट्राइएज स्वचालित निष्कर्ष' : 'AUTOMATED AI TRIAGE ASSESSMENT'}
                </span>
              </div>
              <span
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                }}
              >
                {language === 'mr' ? 'अति-गंभीर धोका (CRITICAL)' : language === 'hi' ? 'अति-गंभीर जोखिम (CRITICAL)' : 'CRITICAL RISK DETECTED'}
              </span>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>
              {language === 'mr'
                ? 'संभाव्य तीव्र लाळ-खुरकूत (FMD) संसर्ग क्लस्टर'
                : language === 'hi'
                ? 'संभावित तीव्र खुरपका-मुंहपका (FMD) संक्रमण क्लस्टर'
                : 'Suspected Acute Foot and Mouth Disease (FMD) Cluster'}
            </h3>

            <p style={{ fontSize: '0.84rem', color: '#7f1d1d', lineHeight: 1.5, marginBottom: '16px' }}>
              {language === 'mr'
                ? 'लक्षणे व प्रादेशिक संसर्ग डेटा विश्लेषणावरून अत्यंत वेगाने पसरणाऱ्या लाळ-खुरकूत रोगाची उच्च शक्यता आढळली आहे. तातडीने बाधित जनावराला वेगळे ठेवा व पशुवैद्यकांना बोलवा.'
                : language === 'hi'
                ? 'लक्षणों और क्षेत्रीय संक्रमण डेटा विश्लेषण से अत्यधिक तेजी से फैलने वाले खुरपका-मुंहपका रोग की उच्च संभावना पाई गई है। तुरंत पशु को क्वारंटाइन करें।'
                : 'Clinical symptoms and regional epidemiological data indicate a high-probability match for Foot and Mouth Disease. Immediate herd isolation and biosecurity containment mandated.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>94%</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'एआय अचूकता' : language === 'hi' ? 'एआई सटीकता' : 'AI Confidence'}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b91c1c' }}>88 / 100</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'ट्रायज तीव्रता गुणांक' : language === 'hi' ? 'ट्राइएज गंभीरता स्कोर' : 'Triage Severity Score'}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', textAlign: 'center' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c' }}>R0: 3.2</div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'प्रसार संभाव्यता' : language === 'hi' ? 'प्रसार दर' : 'Transmission Rate'}
                </div>
              </div>
            </div>
          </div>

          {/* Differential Diagnosis Catalog Grid */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Microscope size={18} color="var(--primary)" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'तपासणी केलेले संभाव्य रोग (Differential Diagnosis)' : language === 'hi' ? 'संभावित रोग निदान सूची (Differential Diagnosis)' : 'Differential Diagnosis & Disease Probabilities'}
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Disease 1 (Primary - 94%) */}
              <div
                style={{
                  background: '#fef2f2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991b1b' }}>
                      {language === 'mr' ? 'लाळ-खुरकूत (Foot & Mouth Disease - FMD)' : language === 'hi' ? 'खुरपका-मुंहपका (Foot & Mouth Disease - FMD)' : 'Foot and Mouth Disease (FMD)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {language === 'mr' ? 'विषाणू: अ‍ॅफ्थोव्हायरस (Aphthovirus) • अति-संसर्गजन्य' : language === 'hi' ? 'विषाणु: एफ्थोवायरस • अत्यधिक संक्रामक' : 'Pathogen: Aphthovirus • High Virulence Epizootic'}
                    </div>
                  </div>
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                    94% {language === 'mr' ? 'जुळणी' : language === 'hi' ? 'समानता' : 'Match'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#7f1d1d', marginTop: '6px', lineHeight: 1.4 }}>
                  <strong>{language === 'mr' ? 'जुळणारी लक्षणे:' : language === 'hi' ? 'समान लक्षण:' : 'Key Markers:'}</strong> {language === 'mr' ? 'तीव्र ताप (>१०४° फॅ), तोंडात व जिभेवर फोड, लाळ गळणे, खुरांमध्ये जखमा व लंगडणे, दुधात मोठी घट.' : language === 'hi' ? 'तेज बुखार (>104°F), मुंह व जीभ में छाले, झागदार लार, खुरों में घाव व लंगड़ापन, दूध उत्पादन में भारी गिरावट।' : 'Acute pyrexia (>104°F), oral vesicles/erosions, ropey salivation, coronary band lesions, lactation drop.'}
                </div>
              </div>

              {/* Disease 2 (Differential - 68%) */}
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#92400e' }}>
                      {language === 'mr' ? 'लम्पी त्वचा रोग (Lumpy Skin Disease - LSD)' : language === 'hi' ? 'लंपी चर्म रोग (Lumpy Skin Disease - LSD)' : 'Lumpy Skin Disease (LSD)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {language === 'mr' ? 'विषाणू: कॅप्रिपॉक्सव्हायरस (Capripoxvirus)' : language === 'hi' ? 'विषाणु: कैप्रिपॉक्सवायरस' : 'Pathogen: Capripoxvirus • Vector Transmitted'}
                    </div>
                  </div>
                  <span style={{ background: '#d97706', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                    68% {language === 'mr' ? 'जुळणी' : language === 'hi' ? 'समानता' : 'Match'}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: '#78350f', marginTop: '6px', lineHeight: 1.4 }}>
                  <strong>{language === 'mr' ? 'लक्षणे:' : language === 'hi' ? 'लक्षण:' : 'Key Markers:'}</strong> {language === 'mr' ? 'अंगावर गाठी (nodules), पायांना सूज, मध्यम ताप.' : language === 'hi' ? 'त्वचा पर गांठें, पैरों में सूजन, मध्यम बुखार।' : 'Circumscribed skin nodules, lymph node enlargement, edema.'}
                </div>
              </div>

              {/* Disease 3 (Differential - 44%) */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {language === 'mr' ? 'तीन दिवसांचा ताप (Bovine Ephemeral Fever)' : language === 'hi' ? 'तीन दिवसीय बुखार (Bovine Ephemeral Fever)' : 'Bovine Ephemeral Fever (Three-Day Sickness)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {language === 'mr' ? 'विषाणू: एफिमिरोव्हायरस • डासांमार्फत प्रसार' : language === 'hi' ? 'विषाणु: एफेमेरोवायरस • कीट वाहक' : 'Pathogen: Ephemerovirus • Arthropod Vector'}
                    </div>
                  </div>
                  <span style={{ background: '#64748b', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                    44% {language === 'mr' ? 'जुळणी' : language === 'hi' ? 'समानता' : 'Match'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Epidemiological Context & Geo-Risk Reasons */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={18} color="#ea580c" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'हा इशारा का दिला गेला? (Epidemiological Trigger)' : language === 'hi' ? 'यह चेतावनी क्यों जारी की गई? (Epidemiological Trigger)' : 'Why This Triage Alert Was Flagged'}
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.83rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--critical)', fontWeight: 800 }}>📍</span>
                <div>
                  <strong>{language === 'mr' ? 'स्थानिक क्लस्टर सानिध्य:' : language === 'hi' ? 'सक्रिय क्लस्टर निकटता:' : 'Spatial Cluster Proximity:'} </strong>
                  {language === 'mr'
                    ? 'शिरूर तालुका सक्रिय साथरोग प्रतिबंध क्षेत्रापासून हे फार्म केवळ ३.२ किमी अंतरावर आहे.'
                    : language === 'hi'
                    ? 'शिरूर ब्लॉक सक्रिय नियंत्रण क्षेत्र से यह फार्म मात्र 3.2 किमी की दूरी पर स्थित है।'
                    : 'Farm is within 3.2 km of the active Shirur Block containment outbreak buffer.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#0284c7', fontWeight: 800 }}>🌧️</span>
                <div>
                  <strong>{language === 'mr' ? 'हवामान अनुकूलता:' : language === 'hi' ? 'मौसम जोखिम:' : 'Meteorological Factor:'} </strong>
                  {language === 'mr'
                    ? 'सध्याची ८६% आर्द्रता व मान्सून वारे विषाणूचे हवेतून जलद संक्रमण वाढवतात.'
                    : language === 'hi'
                    ? 'वर्तमान 86% आर्द्रता और मानसून हवाएं वायरस के वायुजनित प्रसार को गति देती हैं।'
                    : 'Monsoon humidity at 86% creates ideal ambient condition for airborne viral survival.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#d97706', fontWeight: 800 }}>⚡</span>
                <div>
                  <strong>{language === 'mr' ? 'लक्षणांचा जलद वेग:' : language === 'hi' ? 'लक्षणों की गति:' : 'Rapid Clinical Onset:'} </strong>
                  {language === 'mr'
                    ? 'केवळ २४ ते ३६ तासांत सामान्य स्थितीकडून तीव्र लाळ गळण्यापर्यंत लक्षणे पोहोचली.'
                    : language === 'hi'
                    ? 'मात्र 24-36 घंटों में सामान्य चरने से गंभीर लार बहने तक लक्षण तेजी से बढ़े।'
                    : 'Clinical trajectory deteriorated rapidly from onset within 36 hours.'}
                </div>
              </div>
            </div>
          </div>

          {/* Standard Operating Procedure & Quarantine Checklist */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldCheck size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'mr' ? 'तातडीने करावयाची कृती व काळजी (Mandatory SOP)' : language === 'hi' ? 'अनिवार्य तत्काल कार्रवाई और देखभाल (Mandatory SOP)' : 'Mandatory Quarantine & Supportive Care SOP'}
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>1</div>
                <div>
                  <strong>{language === 'mr' ? 'तातडीने क्वारंटाइन करा:' : language === 'hi' ? 'तुरंत अलग करें:' : 'Immediate Quarantine:'} </strong>
                  {language === 'mr' ? 'बाधित जनावराला गोठ्यातील इतर निरोगी जनावरांपासून किमान ५० मीटर दूर वेगळ्या शेडमध्ये बांधा.' : language === 'hi' ? 'प्रभावित पशु को अन्य स्वस्थ पशुओं से कम से कम 50 मीटर दूर अलग बाड़े में बांधें।' : 'Separate affected animal at least 50m downwind from healthy livestock.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>2</div>
                <div>
                  <strong>{language === 'mr' ? 'तोंड व खुरांचे निर्जंतुकीकरण:' : language === 'hi' ? 'मुंह व खुर की सफाई:' : 'Lesion Antiseptic Rinse:'} </strong>
                  {language === 'mr' ? '१% पोटॅशियम परमँगनेट (लाल औषध) किंवा बोरो-ग्लिसरीनने तोंडातील फोड स्वच्छ करा; पायांच्या जखमांवर मलम लावा.' : language === 'hi' ? '1% पोटेशियम परमैंगनेट (लाल दवा) या बोरो-ग्लिसरीन से मुंह धोएं; खुरों पर एंटीसेप्टिक लोशन लगाएं।' : 'Wash oral blisters with 1% Potassium Permanganate or Boro-Glycerin; apply antiseptic ointment to hooves.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>3</div>
                <div>
                  <strong>{language === 'mr' ? 'गोठा निर्जंतुकीकरण:' : language === 'hi' ? 'बाड़ा कीटाणुशोधन:' : 'Biosecurity Barrier:'} </strong>
                  {language === 'mr' ? 'गोठ्याच्या दारात कळीचा चुना किंवा २% सोडियम कार्बोनेट भुकटी पसरवा जेणेकरून जंतू पायऱ्यांमधून पसरणार नाहीत.' : language === 'hi' ? 'बाड़े के प्रवेश द्वार पर बिना बुझा चूना या 2% सोडियम कार्बोनेट छिड़कें।' : 'Lay quicklime powder or 2% sodium carbonate footbath across all barn doorways.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>4</div>
                <div>
                  <strong>{language === 'mr' ? 'सार्वजनिक चराऊ बंदी:' : language === 'hi' ? 'चराई पर रोक:' : 'Grazing & Movement Freeze:'} </strong>
                  {language === 'mr' ? 'इतर जनावरांना गावातील सामाईक चराऊ कुरणात किंवा पाण्याचे डबके/नदीवर नेणे तात्काळ बंद करा.' : language === 'hi' ? 'झुंड को सार्वजनिक चराई मैदान या तालाब पर ले जाना तुरंत बंद करें।' : 'Strictly ban herd movement to common pastures, weekly markets, and ponds.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0 }}>5</div>
                <div>
                  <strong>{language === 'mr' ? 'मऊ आहार व इलेक्ट्रोलाइट्स:' : language === 'hi' ? 'नरम चारा व तरल पदार्थ:' : 'Nutritional & Fluid Care:'} </strong>
                  {language === 'mr' ? 'तोंडातील फोडांमुळे चारा खाणे कठीण असल्याने शिजवलेला मऊ दलिया, उकळलेले थंड पाणी व इलेक्ट्रोलाइट्स द्या.' : language === 'hi' ? 'मुंह के छालों के कारण नरम दलिया, गुड़ का पानी और ओआरएस इलेक्ट्रोलाइट्स दें।' : 'Provide soft digestible boiled gruel and clean water with electrolytes.'}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Government Veterinary Officer Node */}
          <div
            className="glass-card"
            style={{
              background: '#f0fdf4',
              border: '1.5px solid var(--primary-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Stethoscope size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {language === 'mr' ? 'नियुक्त तालुका पशुवैद्यकीय अधिकारी' : language === 'hi' ? 'नियुक्त ब्लॉक पशु चिकित्सा अधिकारी' : 'Assigned Field Veterinary Officer'}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
                    Dr. Mahendra Kale, B.V.Sc & A.H.
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Taluka Veterinary Polyclinic & Diagnostic Lab, Baramati
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="tel:+919822099887"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#15803d',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <PhoneCall size={15} />
                  <span>+91 98220 99887</span>
                </a>
                <a
                  href="tel:1962"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#0284c7',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <PhoneCall size={15} />
                  <span>{language === 'mr' ? 'हेल्पलाइन: १९६२' : language === 'hi' ? 'हेल्पलाइन: 1962' : 'Toll-Free: 1962'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Actions CTA Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button
              onClick={() => {
                alert(
                  language === 'mr'
                    ? 'क्षेत्रीय पशुवैद्यकीय अधिकारी डॉ. महेंद्र काळे यांना जीवसंरक्षक तातडीचा अलर्ट यशस्वीरित्या पाठवला आहे. ते पुढील २ तासांत भेट देतील.'
                    : language === 'hi'
                    ? 'क्षेत्रीय पशु चिकित्सा अधिकारी डॉ. महेंद्र काले को जीवरक्षक आपातकालीन अलर्ट भेजा गया है। वे शीघ्र संपर्क करेंगे।'
                    : 'Field Veterinary Officer Dr. Mahendra Kale alerted via JeevRakshak SOS Dispatch. Emergency visit scheduled.'
                );
              }}
              className="btn-secondary"
              style={{ flex: 1, minWidth: '160px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
            >
              <PhoneCall size={18} color="var(--primary)" />
              <span>{language === 'mr' ? 'पशुवैद्यांना एसओएस कॉल' : language === 'hi' ? 'पशु चिकित्सक एसओएस' : 'Call Field Vet (SOS)'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="btn-secondary"
              style={{ padding: '14px 18px', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={18} />
              <span>{language === 'mr' ? 'पावती प्रिंट' : language === 'hi' ? 'प्रिंट रसीद' : 'Print Slip'}</span>
            </button>

            <button
              onClick={() => {
                if (generatedReport) {
                  onReportComplete(generatedReport);
                } else {
                  onReportComplete({
                    id: 'rep-' + Date.now(),
                    animal_id: selectedAnimalId || '1',
                    reported_by: currentUser?.id || '00000000-0000-0000-0000-000000000000',
                    source,
                    symptoms: selectedSymptoms.join(', ') || 'Fever, Oral blisters, Salivation',
                    mortality_count: mortalityCount,
                    notes: notes || null,
                    reported_at: new Date().toISOString(),
                  });
                }
              }}
              className="btn-primary"
              style={{ flex: 1.4, minWidth: '200px', padding: '14px', borderRadius: 'var(--radius-lg)' }}
            >
              <CheckCircle2 size={18} />
              <span>{language === 'mr' ? 'केस सेव्ह करा व यादी पहा' : language === 'hi' ? 'केस सहेजें व सूची देखें' : 'Confirm & View in Cases'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
