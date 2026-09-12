'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  dataService,
  localizeSpecies,
  localizeBreed,
  localizeTreatment,
  localizeVaccine,
  localizeSampleType,
  localizeSampleStatus,
} from '@/lib/supabase/dataService';
import {
  AnimalWithDetails,
  AnimalTreatment,
  AnimalVaccination,
  DiagnosticSample,
} from '@/types/database';
import {
  X,
  Calendar,
  Syringe,
  Pill,
  Activity,
  FlaskConical,
  Clock,
  Plus,
  CheckCircle,
} from 'lucide-react';

interface AnimalDetailModalProps {
  animalId: string;
  onClose: () => void;
  onReportAnimal: (animalId: string) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animalId,
  onClose,
  onReportAnimal,
}) => {
  const { language, t } = useLanguage();
  const [animal, setAnimal] = useState<AnimalWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'vaccines' | 'treatments' | 'labs'>('timeline');

  // Treatment form state
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [treatmentName, setTreatmentName] = useState('');
  const [treatmentDosage, setTreatmentDosage] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');

  // Vaccination form state
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDueDate, setVaccineDueDate] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');
  // Diagnostic samples state
  const [samples, setSamples] = useState<DiagnosticSample[]>([]);

  const loadAnimal = async () => {
    const a = await dataService.getAnimalById(animalId);
    setAnimal(a);
    if (a) {
      const allReports = await dataService.getHealthReports();
      const animalReportIds = new Set(
        allReports.filter((r) => String(r.animal_id) === String(animalId)).map((r) => String(r.id))
      );
      const allSamples = await dataService.getSamples();
      const animalSamples = allSamples.filter((s) => animalReportIds.has(String(s.health_report_id)));
      setSamples(animalSamples);
    }
  };

  useEffect(() => {
    loadAnimal();
  }, [animalId, language]);

  if (!animal) return null;

  const handleSaveTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentName) return;
    await dataService.addTreatment({
      animal_id: animal.id,
      prescribed_by: 'prof-vet-1',
      treatment_name: treatmentName,
      dosage: treatmentDosage || 'As directed',
      treatment_date: new Date().toISOString().split('T')[0],
      notes: treatmentNotes || null,
    });
    setTreatmentName('');
    setTreatmentDosage('');
    setTreatmentNotes('');
    setShowAddTreatment(false);
    loadAnimal();
  };

  const handleSaveVaccine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccineName) return;
    await dataService.addVaccination({
      animal_id: animal.id,
      vaccine_name: vaccineName,
      vaccination_date: new Date().toISOString().split('T')[0],
      next_due_date: vaccineDueDate || null,
      administered_by: 'prof-vet-1',
      notes: vaccineNotes || null,
    });
    setVaccineName('');
    setVaccineDueDate('');
    setVaccineNotes('');
    setShowAddVaccine(false);
    loadAnimal();
  };

  const isCrit = animal.currentStatus === 'critical';
  const isTreat = animal.currentStatus === 'treatment';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{animal.tag_number}</h2>
              <span className={`badge ${isCrit ? 'badge-critical' : isTreat ? 'badge-warning' : 'badge-stable'}`}>
                {isCrit ? t.dashboard.critical : isTreat ? t.dashboard.underTreatment : t.dashboard.healthy}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {localizeSpecies(animal.species, language)} • {localizeBreed(animal.breed, language)} • {animal.sex === 'female' ? t.animalProfile.female : t.animalProfile.male}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Meta Cards */}
        <div className="modal-meta-grid">
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.species}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{localizeSpecies(animal.species, language)}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.breed}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{localizeBreed(animal.breed, language)}</div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.sex}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {animal.sex === 'female' ? t.animalProfile.female : t.animalProfile.male}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'जन्मतारीख' : language === 'hi' ? 'जन्म तिथि' : 'DOB'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{animal.date_of_birth || '2022'}</div>
          </div>
        </div>

        {/* Action Buttons: Report Symptoms */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => {
              onClose();
              onReportAnimal(animal.id);
            }}
            className="btn-primary"
            style={{ flex: 1, padding: '10px 16px', fontSize: '0.85rem' }}
          >
            <Activity size={16} />
            <span>
              {language === 'mr'
                ? `${animal.tag_number} साठी लक्षणाची तक्रार करा`
                : language === 'hi'
                ? `${animal.tag_number} के लिए लक्षण रिपोर्ट करें`
                : `Report Symptom for ${animal.tag_number}`}
            </span>
          </button>
        </div>

        {/* Tabs for Timeline, Vaccinations, Treatments, Labs */}
        <div className="horizontal-scroll-strip" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          {[
            { id: 'timeline', label: t.animalProfile.healthTimeline, icon: Activity },
            { id: 'vaccines', label: t.animalProfile.vaccinationHistory, icon: Syringe },
            { id: 'treatments', label: t.animalProfile.treatments, icon: Pill },
            { id: 'labs', label: t.animalProfile.labTests, icon: FlaskConical },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Health Timeline */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'मागील अहवाल व मूल्यांकन' : language === 'hi' ? 'ऐतिहासिक रिपोर्ट व मूल्यांकन' : 'Historical Reports & Assessments'}
            </div>
            <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border-subtle)' }}>
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '-26px',
                    top: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--warning)',
                  }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'सप्टेंबर २०२६ • थेट अहवाल' : language === 'hi' ? 'सितंबर 2026 • लाइव रिपोर्ट' : 'September 2026 • Live Report'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'ताप + चारा खाण्यात घट' : language === 'hi' ? 'बुखार + भूख में कमी' : 'Fever + Reduced appetite'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {language === 'mr'
                    ? 'संभाव्य श्वसन आजार म्हणून मूल्यांकन. ट्राइएज पातळी वाढवली.'
                    : language === 'hi'
                    ? 'संभावित श्वसन रोग के रूप में मूल्यांकन। ट्राइएज स्तर बढ़ाया गया।'
                    : 'Assessed as probable respiratory illness. Triage level elevated.'}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '-26px',
                    top: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--stable)',
                  }}
                />
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'नोव्हेंबर २०२५ • नियमित तपासणी' : language === 'hi' ? 'नवंबर 2025 • नियमित जांच' : 'November 2025 • Routine Checkup'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'नियमित लाळ-खुरकूत (FMD) लसीकरण पूर्ण' : language === 'hi' ? 'नियमित खुरपका-मुंहपका (FMD) टीकाकरण पूर्ण' : 'Routine FMD Vaccination Completed'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'पशूची शारीरिक स्थिती उत्तम. दूध उत्पादन सुरळीत.' : language === 'hi' ? 'पशु अच्छी शारीरिक स्थिति में है। सामान्य दुग्ध उत्पादन।' : 'Animal in good physical condition. Normal lactation.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vaccinations History */}
        {activeTab === 'vaccines' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {language === 'mr' ? 'नोंदवलेले लसीकरण' : language === 'hi' ? 'दर्ज टीकाकरण' : 'Recorded Vaccinations'}
              </span>
              <button
                onClick={() => setShowAddVaccine(!showAddVaccine)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <Plus size={14} />
                <span>{t.animalProfile.recordVaccine}</span>
              </button>
            </div>

            {showAddVaccine && (
              <form onSubmit={handleSaveVaccine} style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    {language === 'mr' ? 'लसीचे नाव' : language === 'hi' ? 'टीके का नाम' : 'Vaccine Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    placeholder="e.g. FMD Quadrivalent, HS Vaccine"
                    className="form-input"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    {language === 'mr' ? 'पुढील देय तारीख' : language === 'hi' ? 'अगली देय तिथि' : 'Next Due Date'}
                  </label>
                  <input
                    type="date"
                    value={vaccineDueDate}
                    onChange={(e) => setVaccineDueDate(e.target.value)}
                    className="form-input"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  {language === 'mr' ? 'लसीकरण जतन करा' : language === 'hi' ? 'टीकाकरण सहेजें' : 'Save Vaccination'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {animal.vaccinations && animal.vaccinations.length > 0 ? (
                animal.vaccinations.map((vac) => (
                  <div key={vac.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{localizeVaccine(vac.vaccine_name, language)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {language === 'mr' ? 'लस दिली:' : language === 'hi' ? 'टीका दिया गया:' : 'Administered:'} {vac.vaccination_date}
                      </div>
                    </div>
                    {vac.next_due_date && (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                        {language === 'mr' ? 'पुढील तारीख:' : language === 'hi' ? 'अगली तिथि:' : 'Due:'} {vac.next_due_date}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'कोणतेही लसीकरण रेकॉर्ड नाही.' : language === 'hi' ? 'कोई टीकाकरण रिकॉर्ड नहीं है।' : 'No vaccination records yet.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Treatments */}
        {activeTab === 'treatments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                {language === 'mr' ? 'विहित उपचार' : language === 'hi' ? 'निर्धारित उपचार' : 'Prescribed Treatments'}
              </span>
              <button
                onClick={() => setShowAddTreatment(!showAddTreatment)}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                <Plus size={14} />
                <span>{t.animalProfile.addTreatment}</span>
              </button>
            </div>

            {showAddTreatment && (
              <form onSubmit={handleSaveTreatment} style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    {language === 'mr' ? 'औषध / उपचाराचे नाव' : language === 'hi' ? 'दवा / उपचार का नाम' : 'Medicine / Treatment Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={treatmentName}
                    onChange={(e) => setTreatmentName(e.target.value)}
                    placeholder="e.g. Ceftiofur, Meloxicam"
                    className="form-input"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>
                    {language === 'mr' ? 'डोस व मार्ग' : language === 'hi' ? 'खुराक व मार्ग' : 'Dosage & Route'}
                  </label>
                  <input
                    type="text"
                    value={treatmentDosage}
                    onChange={(e) => setTreatmentDosage(e.target.value)}
                    placeholder="e.g. 10ml IM daily"
                    className="form-input"
                    style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                  {language === 'mr' ? 'उपचार जतन करा' : language === 'hi' ? 'उपचार सहेजें' : 'Save Treatment'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {animal.treatments && animal.treatments.length > 0 ? (
                animal.treatments.map((tr) => (
                  <div key={tr.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', background: '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{localizeTreatment(tr.treatment_name, language)}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tr.treatment_date}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {language === 'mr' ? 'डोस:' : language === 'hi' ? 'खुराक:' : 'Dosage:'} {tr.dosage}
                    </div>
                    {tr.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-deep)', marginTop: '4px', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '4px' }}>
                        {language === 'mr' ? 'टीप:' : language === 'hi' ? 'नोट:' : 'Note:'} {tr.notes}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'कोणतेही सक्रिय उपचार नाहीत.' : language === 'hi' ? 'कोई सक्रिय उपचार नहीं है।' : 'No active treatments.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Lab Tests / Diagnostic Samples */}
        {activeTab === 'labs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {samples.length > 0 ? (
              samples.map((s) => (
                <div key={s.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                      {localizeSampleType(s.sample_type, language)}
                    </span>
                    <span className={`badge badge-${s.status === 'tested' ? 'stable' : s.status === 'received' ? 'info' : 'warning'}`}>
                      {localizeSampleStatus(s.status, language)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {language === 'mr' ? 'संकलित दिनांक:' : language === 'hi' ? 'एकत्रित तिथि:' : 'Collected:'} {s.collected_at ? new Date(s.collected_at).toLocaleDateString() : 'N/A'}
                  </div>
                  {s.result && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-deep)', marginTop: '4px', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {language === 'mr' ? 'निष्कर्ष:' : language === 'hi' ? 'जांच परिणाम:' : 'Result:'} {s.result}
                    </div>
                  )}
                  {s.notes && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {s.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)' }}>
                <FlaskConical size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                  {language === 'mr' ? 'कोणतेही प्रयोगशाळा नमुने नाहीत' : language === 'hi' ? 'कोई प्रयोगशाला नमूने नहीं' : 'No Lab Samples Recorded'}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  {language === 'mr'
                    ? 'या जनावरासाठी अजून कोणतीही प्रयोगशाळा चाचणी किंवा नमुना नोंदवलेला नाही.'
                    : language === 'hi'
                    ? 'इस पशु के लिए अभी तक कोई प्रयोगशाला जांच या नमूना दर्ज नहीं किया गया है।'
                    : 'No diagnostic specimens or laboratory tests have been ordered for this animal yet.'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
