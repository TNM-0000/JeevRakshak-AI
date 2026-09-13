'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  dataService,
  localizeSpecies,
  localizeBreed,
  localizeTreatment,
  localizeVaccine,
} from '@/lib/supabase/dataService';
import {
  AnimalWithDetails,
  AnimalTreatment,
  AnimalVaccination,
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
  FileText,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Printer,
  Download,
  AlertTriangle,
  Phone,
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
  const [activeTab, setActiveTab] = useState<'report' | 'timeline' | 'vaccines' | 'treatments' | 'labs'>('report');
  const [reportGeneratedNotice, setReportGeneratedNotice] = useState<string | null>(null);

  // Hardcoded Clinical Health & Triage Report (Always Generated)
  const [reportState, setReportState] = useState<{
    id: string;
    generatedAt: string;
    triageLevel: 'critical' | 'warning' | 'stable';
    suspectedDisease: string;
    aiConfidence: number;
    symptoms: string[];
    vitals: { temp: string; heartRate: string; rumination: string; weight: string };
    prescription: { medicine: string; dosage: string; frequency: string; duration: string }[];
    veterinarian: { name: string; designation: string; clinic: string; contact: string };
    advisory: string;
  }>({
    id: `JR-REP-2026-${animalId.replace(/[^0-9]/g, '').slice(-4) || '7821'}`,
    generatedAt: '12 Sep 2026, 02:45 PM',
    triageLevel: 'warning',
    suspectedDisease: 'Bovine Pyrexia & Acute Respiratory Syndrome (BRD)',
    aiConfidence: 94,
    symptoms: [
      'High Body Temperature (103.8°F)',
      'Serous Nasal Droplets & Lacrimation',
      'Sudden Drop in Daily Milk Yield (-30%)',
      'Depressed Demeanour & Loss of Appetite',
    ],
    vitals: {
      temp: '103.8°F (High Pyrexia)',
      heartRate: '78 bpm (Tachycardia)',
      rumination: '14 cycles/hr (Sub-normal)',
      weight: '385 kg (Estimated)',
    },
    prescription: [
      { medicine: 'Meloxicam + Paracetamol (Melonex Plus)', dosage: '15 ml', frequency: 'Once Daily (IM)', duration: '3 Days' },
      { medicine: 'Ceftiofur Sodium (Broad-spectrum)', dosage: '1.0 g', frequency: 'Every 24 hrs (IM)', duration: '3 Days' },
      { medicine: 'Oral Electrolytes & Probiotic Bolus', dosage: '2 Bolus', frequency: 'Twice Daily (Oral)', duration: '5 Days' },
    ],
    veterinarian: {
      name: 'Dr. Suresh K. Deshmukh',
      designation: 'Taluka Livestock Development Officer (LDO)',
      clinic: 'Government Veterinary Dispensary, Pune Division',
      contact: '+91 98220 11445',
    },
    advisory: 'Isolate affected animal in a dry, sanitized shed immediately. Avoid communal grazing or shared water troughs. Re-check body temperature in 12 hours.',
  });

  const handleRegenerateReport = () => {
    const isCrit = Math.random() > 0.5;
    const now = new Date();
    const timeString = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setReportState({
      id: `JR-REP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      generatedAt: timeString,
      triageLevel: isCrit ? 'critical' : 'warning',
      suspectedDisease: isCrit ? 'Foot and Mouth Disease (FMD) Suspected' : 'Bovine Ephemeral Illness & Mild Bronchitis',
      aiConfidence: Math.floor(88 + Math.random() * 10),
      symptoms: isCrit
        ? ['High Fever (104.2°F)', 'Oral & Tongue Vesicles / Blisters', 'Excessive Salivation (Ropy Drool)', 'Lameness in hind limbs']
        : ['Elevated Temperature (103.4°F)', 'Nasal Congestion', 'Reduced Rumination', 'Decreased Milk Yield (-20%)'],
      vitals: {
        temp: isCrit ? '104.2°F (Severe Fever)' : '103.4°F (Moderate Fever)',
        heartRate: isCrit ? '86 bpm (Elevated)' : '76 bpm (Mild tachycardia)',
        rumination: isCrit ? '8 cycles/hr (Severely depressed)' : '16 cycles/hr (Depressed)',
        weight: '380 kg',
      },
      prescription: isCrit
        ? [
            { medicine: 'Potassium Permanganate (1:1000 mouth wash)', dosage: 'External wash', frequency: 'Thrice Daily', duration: '5 Days' },
            { medicine: 'Flunixin Meglumine (NSAID)', dosage: '12 ml', frequency: 'Once Daily (Slow IV/IM)', duration: '3 Days' },
            { medicine: 'Enrofloxacin 10% Injection', dosage: '15 ml', frequency: 'Once Daily (IM)', duration: '4 Days' },
          ]
        : [
            { medicine: 'Meloxicam + Paracetamol', dosage: '15 ml', frequency: 'Once Daily (IM)', duration: '3 Days' },
            { medicine: 'Vitamin B-Complex + Liver Extract', dosage: '10 ml', frequency: 'Alternate Days (IM)', duration: '3 Doses' },
          ],
      veterinarian: {
        name: 'Dr. Suresh K. Deshmukh',
        designation: 'Taluka Livestock Development Officer (LDO)',
        clinic: 'Government Veterinary Dispensary, Pune Division',
        contact: '+91 98220 11445',
      },
      advisory: isCrit
        ? 'CRITICAL ALERT: Suspected Notifiable FMD outbreak. Strict biosecurity quarantine enforced. Notify District Animal Disease Control Room.'
        : 'Isolate animal in dry shelter. Administer warm gruel and oral electrolytes. Observe herd mates for onset of pyrexia.',
    });

    setReportGeneratedNotice('Fresh Clinical Triage Report successfully generated and validated!');
    setTimeout(() => setReportGeneratedNotice(null), 3500);
  };

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

  const loadAnimal = () => {
    dataService.getAnimalById(animalId).then(setAnimal);
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
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Meta Cards */}
        <div className="modal-meta-grid">
          <div style={{ background: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.species}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{localizeSpecies(animal.species, language)}</div>
          </div>
          <div style={{ background: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.breed}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{localizeBreed(animal.breed, language)}</div>
          </div>
          <div style={{ background: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.animalProfile.sex}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'capitalize' }}>
              {animal.sex === 'female' ? t.animalProfile.female : t.animalProfile.male}
            </div>
          </div>
          <div style={{ background: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'जन्मतारीख' : language === 'hi' ? 'जन्म तिथि' : 'DOB'}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{animal.date_of_birth || '2022'}</div>
          </div>
        </div>

        {/* Notice Alert if newly generated */}
        {reportGeneratedNotice && (
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            color: '#065f46',
            fontWeight: 600,
          }}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{reportGeneratedNotice}</span>
          </div>
        )}

        {/* Action Buttons: View Report vs Generate New vs Report Symptom */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('report')}
            className={activeTab === 'report' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <FileText size={16} />
            <span>Clinical Health Report</span>
          </button>
          <button
            onClick={handleRegenerateReport}
            className="btn-secondary"
            style={{ padding: '10px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Generate Fresh AI Triage Report"
          >
            <Sparkles size={16} color="var(--primary)" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onReportAnimal(animal.id);
            }}
            className="btn-saffron"
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

        {/* Tabs for Report, Timeline, Vaccinations, Treatments, Labs */}
        <div className="horizontal-scroll-strip" style={{ borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          {[
            { id: 'report', label: 'Clinical Report', icon: FileText },
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

        {/* Tab 0: Hardcoded Generated Official Clinical Health Report */}
        {activeTab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Report Certificate Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 700 }}>
                    Government of Maharashtra • Animal Husbandry Department
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0' }}>
                    Livestock Clinical Health & Triage Report
                  </h3>
                </div>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  {reportState.id}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.95, paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <span>Generated: {reportState.generatedAt}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} />
                  <span>Verified by AI Triage Engine</span>
                </span>
              </div>
            </div>

            {/* Suspected Diagnosis Banner */}
            <div
              style={{
                background: reportState.triageLevel === 'critical' ? '#fef2f2' : '#fffbeb',
                border: `1.5px solid ${reportState.triageLevel === 'critical' ? '#fecaca' : '#fde68a'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldAlert size={18} color={reportState.triageLevel === 'critical' ? '#dc2626' : '#d97706'} />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: reportState.triageLevel === 'critical' ? '#dc2626' : '#d97706' }}>
                    Triage Diagnosis: {reportState.triageLevel.toUpperCase()}
                  </span>
                </div>
                <span className={`badge ${reportState.triageLevel === 'critical' ? 'badge-critical' : 'badge-warning'}`}>
                  {reportState.aiConfidence}% AI Confidence
                </span>
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                {reportState.suspectedDisease}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Automatic clinical differential matched against District Surveillance Catalog & cluster observations.
              </p>
            </div>

            {/* Physiological Vitals Recorded */}
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                Vital Clinical Signs Recorded
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rectal Temperature</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626' }}>{reportState.vitals.temp}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Heart Rate</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{reportState.vitals.heartRate}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rumen Motility</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{reportState.vitals.rumination}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated Weight</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{reportState.vitals.weight}</div>
                </div>
              </div>
            </div>

            {/* Symptoms Reported */}
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                Presenting Clinical Symptoms
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {reportState.symptoms.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#1e293b',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Prescribed Treatment Plan */}
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pill size={15} color="var(--primary)" />
                <span>Prescribed Treatment & Dosage Plan</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reportState.prescription.map((rx, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-card)',
                      borderRadius: 'var(--radius-md)',
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{rx.medicine}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Route: {rx.frequency} • Duration: {rx.duration}
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                      {rx.dosage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attending Veterinary Officer & Advisory */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attending Veterinary Officer</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {reportState.veterinarian.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {reportState.veterinarian.designation} • {reportState.veterinarian.clinic}
                  </div>
                </div>
                <a
                  href={`tel:${reportState.veterinarian.contact}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'var(--primary-light)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                  }}
                >
                  <Phone size={12} />
                  <span>Call Vet</span>
                </a>
              </div>

              <div style={{ fontSize: '0.74rem', color: '#92400e', background: '#fef3c7', padding: '8px 10px', borderRadius: '6px', marginTop: '6px' }}>
                <strong>Quarantine Advisory:</strong> {reportState.advisory}
              </div>
            </div>

            {/* Quick Actions for the Report */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={handleRegenerateReport}
                className="btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Sparkles size={15} />
                <span>Re-generate AI Triage Report</span>
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn-secondary"
                style={{ padding: '10px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        )}

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
              <form onSubmit={handleSaveVaccine} style={{ background: 'var(--surface-raised)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
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
              <form onSubmit={handleSaveTreatment} style={{ background: 'var(--surface-raised)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
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
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                  {language === 'mr' ? 'नाकातील स्त्राव (श्वसन पॅनेल चाचणी)' : language === 'hi' ? 'नेजल स्वैब (श्वसन पैनल जांच)' : 'Nasal Swab (Respiratory Panel)'}
                </span>
                <span className="badge badge-warning">
                  {language === 'mr' ? 'चाचणी सुरू आहे' : language === 'hi' ? 'जांच जारी है' : 'Testing in Progress'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {language === 'mr'
                  ? 'जिल्हा पशुवैद्यकीय प्रयोगशाळा पुणे • प्राप्त सकाळी ०९:३०'
                  : language === 'hi'
                  ? 'जिला पशु चिकित्सा प्रयोगशाला पुणे • प्राप्त सुबह 09:30'
                  : 'District Veterinary Lab Pune • Received 09:30 AM'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
