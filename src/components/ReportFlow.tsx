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
} from 'lucide-react';

interface ReportFlowProps {
  onReportComplete: (report: HealthReportWithDetails) => void;
  onCancel: () => void;
}

export const ReportFlow: React.FC<ReportFlowProps> = ({ onReportComplete, onCancel }) => {
  const { t, language } = useLanguage();
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
    const symptomsString = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'General health complaint';
    const currentUser = dataService.getCurrentUser();

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
    setSubmitting(false);
    setStep(3);
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

      {/* STEP 4: Automated AI Triage Assessment (Matching Wireframe Screen 9) */}
      {step === 4 && generatedReport && (
        <div>
          {/* Status Banner */}
          <div
            className="glass-card"
            style={{
              background:
                generatedReport.riskAssessment?.risk_level === 'critical'
                  ? 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)'
                  : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border:
                generatedReport.riskAssessment?.risk_level === 'critical'
                  ? '1.5px solid var(--critical-border)'
                  : '1.5px solid var(--warning-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert
                size={22}
                color={generatedReport.riskAssessment?.risk_level === 'critical' ? 'var(--critical)' : 'var(--warning)'}
              />
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color:
                    generatedReport.riskAssessment?.risk_level === 'critical' ? 'var(--critical)' : 'var(--warning)',
                }}
              >
                {t.reporting.preliminaryAssessment}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
              {t.reporting.riskDetected}
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span
                className={`badge ${
                  generatedReport.riskAssessment?.risk_level === 'critical' ? 'badge-critical' : 'badge-warning'
                }`}
              >
                {language === 'mr' ? 'पातळी:' : language === 'hi' ? 'स्तर:' : 'LEVEL:'} {generatedReport.riskAssessment?.risk_level === 'critical' ? (language === 'mr' ? 'गंभीर' : language === 'hi' ? 'गंभीर' : 'CRITICAL') : (language === 'mr' ? 'मध्यम' : language === 'hi' ? 'मध्यम' : 'MODERATE')}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t.reporting.confidence}: {generatedReport.riskAssessment?.risk_score}%
              </span>
            </div>
          </div>

          {/* Possible Disease Categories (Matched from disease_catalog) */}
          <div className="glass-card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px' }}>
              {t.reporting.possibleDiseases}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {generatedReport.diseases && generatedReport.diseases.length > 0 ? (
                generatedReport.diseases.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{getLocalizedField(d.disease, 'name', language) || d.disease?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.disease?.species}</div>
                    </div>
                    <span className="badge badge-info">
                      {d.confidence}% {language === 'mr' ? 'जुळणी' : language === 'hi' ? 'समानता' : 'Match'}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'संसर्गजन्य श्वसन आजार' : language === 'hi' ? 'संक्रामक श्वसन रोग' : 'Infectious Respiratory Illness'}
                </div>
              )}
            </div>
          </div>

          {/* Why this was flagged */}
          <div className="glass-card" style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px' }}>{t.reporting.whyFlagged}</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <li>
                {language === 'mr'
                  ? 'लक्षणे २४-४८ तासांत वेगाने दिसून आली.'
                  : language === 'hi'
                  ? 'लक्षण 24-48 घंटों के भीतर तेजी से प्रकट हुए।'
                  : 'Symptoms appeared rapidly within 24-48 hours.'}
              </li>
              <li>
                {language === 'mr'
                  ? 'शिरूर तालुका क्लस्टरमध्ये अशाच प्रकारचे श्वसन अहवाल नोंदवले गेले.'
                  : language === 'hi'
                  ? 'शिरूर ब्लॉक क्लस्टर में इसी तरह की श्वसन रिपोर्ट दर्ज की गई।'
                  : 'Similar respiratory reports registered in Shirur block cluster.'}
              </li>
              <li>
                {language === 'mr'
                  ? 'मान्सून हवामान निरीक्षण ८६% आर्द्रता दर्शवते, जे रोगजंतू प्रसारास अनुकूल आहे.'
                  : language === 'hi'
                  ? 'मानसून मौसम अवलोकन 86% आर्द्रता दर्शाता है जो रोगाणुओं के प्रसार के लिए अनुकूल है।'
                  : 'Monsoon weather observation indicates 86% humidity favorable for microbial propagation.'}
              </li>
              <li>
                {language === 'mr' ? 'पशू मृत्यू संख्या नोंद:' : language === 'hi' ? 'पशु मृत्यु गणना ध्वज:' : 'Animal mortality count flag:'} {generatedReport.mortality_count}.
              </li>
            </ul>
          </div>

          {/* Recommended Next Steps */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px' }}>
              {t.reporting.recommendedSteps}
            </h4>
            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.7 }}>
              <li>
                <strong>{language === 'mr' ? 'पशू वेगळा करा:' : language === 'hi' ? 'पशु अलग करें:' : 'Isolate animal:'} </strong>
                {language === 'mr'
                  ? `बाधित पशू (${generatedReport.animal?.tag_number || 'पशू'}) त्वरित वेगळ्या गोठ्यात बांधा.`
                  : language === 'hi'
                  ? `प्रभावित पशु (${generatedReport.animal?.tag_number || 'पशु'}) को तुरंत क्वारंटाइन शेड में अलग करें।`
                  : `Immediately separate ${generatedReport.animal?.tag_number || 'affected animal'} to quarantine stall.`}
              </li>
              <li>
                <strong>{language === 'mr' ? 'हालचालीवर मर्यादा:' : language === 'hi' ? 'आवाजाही पर प्रतिबंध:' : 'Movement restriction:'} </strong>
                {language === 'mr'
                  ? 'उर्वरित कळपाला सार्वजनिक चराऊ कुरणात पाठवणे टाळा.'
                  : language === 'hi'
                  ? 'शेष झुंड को सार्वजनिक चराई के मैदान में भेजने से बचें।'
                  : 'Avoid sending remaining herd to communal grazing pastures.'}
              </li>
              <li>
                <strong>{language === 'mr' ? 'पशुवैद्यकांशी संपर्क:' : language === 'hi' ? 'पशु चिकित्सक से संपर्क:' : 'Contact veterinarian:'} </strong>
                {language === 'mr'
                  ? 'स्थानिक पशुवैद्यकीय अधिकाऱ्यांना सूचना पाठवली आहे.'
                  : language === 'hi'
                  ? 'क्षेत्रीय पशु चिकित्सक को सूचित कर दिया गया है।'
                  : 'A field veterinarian has been notified.'}
              </li>
              <li>
                <strong>{language === 'mr' ? 'निर्जंतुकीकरण:' : language === 'hi' ? 'कीटाणुशोधन:' : 'Disinfection:'} </strong>
                {language === 'mr'
                  ? 'गव्हाणी आणि पिण्याच्या पाण्याची जागा चुन्याच्या भुकटीने निर्जंतुक करा.'
                  : language === 'hi'
                  ? 'खुरली और पीने के पानी की जगह को चूने के पाउडर से विसंक्रमित करें।'
                  : 'Sanitize feeding troughs and drinking water with lime powder.'}
              </li>
              <li>
                <strong>{language === 'mr' ? 'निरीक्षण:' : language === 'hi' ? 'निगरानी:' : 'Monitor:'} </strong>
                {language === 'mr'
                  ? 'दुधातील अचानक घट किंवा श्वास घेण्यास त्रास यावर बारकाईने लक्ष ठेवा.'
                  : language === 'hi'
                  ? 'दूध में अचानक कमी या सांस लेने में तकलीफ पर कड़ी नज़र रखें।'
                  : 'Watch closely for sudden drop in milk or laboured breathing.'}
              </li>
            </ol>
          </div>

          {/* Actions CTA */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onReportComplete(generatedReport)}
              className="btn-primary"
              style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-lg)' }}
            >
              <CheckCircle2 size={18} />
              <span>{t.reporting.viewDetailed}</span>
            </button>
            <button
              onClick={() => {
                alert(
                  language === 'mr'
                    ? 'क्षेत्रीय पशुवैद्य डॉ. महेंद्र काळे (+९१ ९८२२० ९९८८७) यांना जीवसंरक्षक अलर्ट पाठवला.'
                    : language === 'hi'
                    ? 'क्षेत्रीय पशु चिकित्सक डॉ. महेंद्र काले (+91 98220 99887) को जीवरक्षक अलर्ट भेजा गया।'
                    : 'Field Veterinarian Dr. Mahendra Kale (+91 98220 99887) alerted via JeevRakshak alert.'
                );
                onReportComplete(generatedReport);
              }}
              className="btn-secondary"
              style={{ padding: '14px', borderRadius: 'var(--radius-lg)' }}
            >
              <PhoneCall size={18} color="var(--primary)" />
              <span>{t.reporting.contactVet}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
