'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService, localizeSpecies } from '@/lib/supabase/dataService';
import { DoctorPrescriptionRecord, AnimalWithDetails } from '@/types/database';
import {
  FileText,
  Pill,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  MapPin,
  Phone,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Share2,
  Info,
  BadgeCheck,
  AlertTriangle,
} from 'lucide-react';

interface FarmerPrescriptionsProps {
  onSelectAnimal?: (animalId: string) => void;
  onNavigateToCases?: () => void;
  onOpenReport?: () => void;
}

export const FarmerPrescriptions: React.FC<FarmerPrescriptionsProps> = ({
  onSelectAnimal,
  onNavigateToCases,
  onOpenReport,
}) => {
  const { language } = useLanguage();
  const [prescriptions, setPrescriptions] = useState<DoctorPrescriptionRecord[]>([]);
  const [animals, setAnimals] = useState<AnimalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRxForSlip, setSelectedRxForSlip] = useState<DoctorPrescriptionRecord | null>(null);

  // Dose checklist tracking (local interactive state: key -> boolean)
  const [checkedDoses, setCheckedDoses] = useState<Record<string, boolean>>({});

  const toggleDose = (key: string) => {
    setCheckedDoses((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [rxList, animList] = await Promise.all([
        dataService.getFarmerPrescriptions(),
        dataService.getAnimals(),
      ]);
      setPrescriptions(rxList);
      setAnimals(animList);
    } catch (err) {
      console.error('Failed to load farmer prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [language]);

  const activeCount = prescriptions.filter((p) => p.status !== 'completed').length;
  const completedCount = prescriptions.filter((p) => p.status === 'completed').length;

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (activeFilter === 'active' && rx.status === 'completed') return false;
    if (activeFilter === 'completed' && rx.status !== 'completed') return false;
    if (selectedTag !== 'all' && rx.animal_tag.toUpperCase() !== selectedTag.toUpperCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTag = rx.animal_tag.toLowerCase().includes(q);
      const matchDoctor = rx.doctor_name.toLowerCase().includes(q);
      const matchDiag = (rx.diagnosis || '').toLowerCase().includes(q);
      const matchMeds = rx.medicines.some((m) => m.name.toLowerCase().includes(q));
      if (!matchTag && !matchDoctor && !matchDiag && !matchMeds) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 4px 16px rgba(45, 106, 79, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '8px',
              }}
            >
              <ShieldCheck size={14} color="#95d5b2" />
              <span>
                {language === 'mr'
                  ? 'महाराष्ट्र शासन • पशुसंवर्धन विभाग अधिकृत डिजिटल प्रिस्क्रिप्शन'
                  : language === 'hi'
                  ? 'महाराष्ट्र सरकार • पशुपालन विभाग अधिकृत डिजिटल प्रिस्क्रिप्शन'
                  : 'GOVT. OF MAHARASHTRA • OFFICIAL VETERINARY PRESCRIPTIONS'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.7rem)', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
              {language === 'mr'
                ? 'डॉक्टरांचे प्रिस्क्रिप्शन व उपचार सल्ला'
                : language === 'hi'
                ? 'डॉक्टर प्रिस्क्रिप्शन व उपचार योजना'
                : 'Doctor Prescriptions & Clinical Care Plans'}
            </h1>

            <p style={{ fontSize: '0.82rem', color: '#d8f3dc', margin: 0, maxWidth: '580px', lineHeight: 1.4 }}>
              {language === 'mr'
                ? 'अधिकृत पशुवैद्यकीय डॉक्टरांनी दिलेल्या औषधांच्या नोंदी, मात्रा वेळापत्रक आणि डिजिटल प्रिस्क्रिप्शन स्लिप्स.'
                : language === 'hi'
                ? 'पशु चिकित्सकों द्वारा निर्धारित दवाइयों का रिकॉर्ड, खुराक समय सारणी व डिजिटल प्रिस्क्रिप्शन।'
                : 'Official digital prescriptions, diagnosis details, medicine dosage schedules, and care plans issued by licensed veterinarians.'}
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '10px 16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#95d5b2' }}>{activeCount}</div>
              <div style={{ fontSize: '0.7rem', color: '#d8f3dc', fontWeight: 600 }}>
                {language === 'mr' ? 'सक्रिय उपचार' : language === 'hi' ? 'सक्रिय उपचार' : 'Active Rx'}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '10px 16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textAlign: 'center',
                minWidth: '90px',
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>{prescriptions.length}</div>
              <div style={{ fontSize: '0.7rem', color: '#d8f3dc', fontWeight: 600 }}>
                {language === 'mr' ? 'एकूण प्रिस्क्रिप्शन' : language === 'hi' ? 'कुल प्रिस्क्रिप्शन' : 'Total Issued'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '14px 18px',
        }}
      >
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: activeFilter === 'all' ? 700 : 500,
              background: activeFilter === 'all' ? '#1b4332' : '#f1f5f9',
              color: activeFilter === 'all' ? '#ffffff' : 'var(--text-main)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {language === 'mr' ? 'सर्व प्रिस्क्रिप्शन' : language === 'hi' ? 'सभी' : 'All Prescriptions'} ({prescriptions.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: activeFilter === 'active' ? 700 : 500,
              background: activeFilter === 'active' ? '#15803d' : '#f1f5f9',
              color: activeFilter === 'active' ? '#ffffff' : 'var(--text-main)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {language === 'mr' ? 'उपचार चालू' : language === 'hi' ? 'सक्रिय उपचार' : 'Active Treatments'} ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: activeFilter === 'completed' ? 700 : 500,
              background: activeFilter === 'completed' ? '#0369a1' : '#f1f5f9',
              color: activeFilter === 'completed' ? '#ffffff' : 'var(--text-main)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {language === 'mr' ? 'पूर्ण झालेले' : language === 'hi' ? 'पूर्ण' : 'Completed'} ({completedCount})
          </button>
        </div>

        {/* Animal Tag Filter & Search */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '240px' }}>
          {animals.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="form-select"
              style={{ fontSize: '0.78rem', padding: '6px 10px', width: 'auto', minWidth: '130px', height: '36px' }}
            >
              <option value="all">{language === 'mr' ? 'सर्व पशू' : language === 'hi' ? 'सभी पशु' : 'All Animals'}</option>
              {animals.map((a) => (
                <option key={a.id} value={a.tag_number}>
                  {a.tag_number} ({localizeSpecies(a.species, language)})
                </option>
              ))}
            </select>
          )}

          <div style={{ position: 'relative', minWidth: '180px' }}>
            <input
              type="text"
              placeholder={language === 'mr' ? 'औषध, डॉक्टर किंवा टॅगने शोधा...' : language === 'hi' ? 'दवा, डॉक्टर या टैग से खोजें...' : 'Search medicine, doctor, tag...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.78rem', paddingLeft: '32px', height: '36px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>
      </div>

      {/* Main List of Prescriptions */}
      {filteredPrescriptions.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            border: '1.5px dashed var(--border-card)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Pill size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            {language === 'mr'
              ? 'कोणतेही प्रिस्क्रिप्शन उपलब्ध नाही'
              : language === 'hi'
              ? 'कोई प्रिस्क्रिप्शन उपलब्ध नहीं है'
              : 'No Prescriptions Found'}
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
            {prescriptions.length === 0
              ? language === 'mr'
                ? 'जेव्हा पशुवैद्यकीय अधिकारी तुमच्या आजारी जनावरांची तपासणी करून औषधोपचार देतील, तेव्हा त्यांची अधिकृत डिजिटल प्रिस्क्रिप्शन स्लिप येथे थेट उपलब्ध होईल.'
                : language === 'hi'
                ? 'जब पशु चिकित्सक आपके बीमार पशु की जांच कर दवाई निर्धारित करेंगे, तो उनकी आधिकारिक डिजिटल पर्ची यहाँ स्वतः दिखाई देगी।'
                : 'When a veterinarian examines your livestock and prescribes medicines or treatment regimens, the official digital prescription will appear here automatically.'
              : language === 'mr'
              ? 'निवडलेल्या फिल्टरनुसार कोणतेही प्रिस्क्रिप्शन आढळले नाही.'
              : 'No prescriptions matched your search or filter criteria.'}
          </p>
          {onNavigateToCases && (
            <button
              type="button"
              onClick={onNavigateToCases}
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '8px 18px', borderRadius: 'var(--radius-full)' }}
            >
              <FileText size={15} />
              <span>{language === 'mr' ? 'माझे आरोग्य अहवाल पहा' : language === 'hi' ? 'स्वास्थ्य रिपोर्ट देखें' : 'View Health Reports'}</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredPrescriptions.map((rx) => {
            const isCompleted = rx.status === 'completed';
            return (
              <div
                key={rx.id}
                className="glass-card"
                style={{
                  borderRadius: '16px',
                  border: isCompleted ? '1px solid var(--border-subtle)' : '1.5px solid #a7f3d0',
                  padding: '20px',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                {/* Header Row: Doctor & Rx Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {rx.doctor_name}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#dcfce7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                          }}
                        >
                          <BadgeCheck size={12} />
                          <span>Govt. Reg. Vet</span>
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        <Building2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {rx.hospital_name} • Lic: <strong>{rx.license_number}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status & Rx Slip Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: isCompleted ? '#f1f5f9' : '#ecfdf5',
                        color: isCompleted ? '#475569' : '#15803d',
                        border: isCompleted ? '1px solid #cbd5e1' : '1px solid #bbf7d0',
                      }}
                    >
                      {isCompleted
                        ? (language === 'mr' ? 'उपचार पूर्ण' : language === 'hi' ? 'उपचार पूर्ण' : 'Treatment Completed')
                        : (language === 'mr' ? 'उपचार चालू' : language === 'hi' ? 'उपचार जारी' : 'Active Treatment')}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedRxForSlip(rx)}
                      className="btn-primary"
                      style={{
                        fontSize: '0.74rem',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Printer size={14} />
                      <span>{language === 'mr' ? 'डिजिटल Rx पावती' : language === 'hi' ? 'पर्चा देखें' : 'View Official Rx'}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Livestock & Diagnosis Context */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    border: '1px solid var(--border-card)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                      {rx.animal_tag}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      • {localizeSpecies(rx.animal_species, language)}
                    </span>
                    {rx.case_number && (
                      <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                        {rx.case_number}
                      </span>
                    )}
                  </div>

                  {rx.diagnosis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {language === 'mr' ? 'निदान:' : language === 'hi' ? 'निदान:' : 'Diagnosis:'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1', background: '#f0f9ff', padding: '3px 10px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                        {rx.diagnosis}
                      </span>
                    </div>
                  )}
                </div>

                {/* Prescribed Medicines Schedule */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {language === 'mr' ? 'विहित औषधोपचार वेळापत्रक' : language === 'hi' ? 'निर्धारित दवाइयां व खुराक' : 'Prescribed Medicines & Dosage Schedule'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {rx.medicines.length} {language === 'mr' ? 'औषधे' : 'items'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rx.medicines.map((med, idx) => {
                      const doseKey = `${rx.id}-med-${idx}`;
                      const isGiven = checkedDoses[doseKey] || false;

                      return (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: '1px solid var(--border-subtle)',
                            background: isGiven ? '#f0fdf4' : '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '8px',
                            transition: 'background 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Pill size={16} color={isGiven ? '#16a34a' : '#059669'} />
                            <div>
                              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {med.name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {language === 'mr' ? 'डोस:' : 'Dose:'} <strong>{med.dosage}</strong> • {language === 'mr' ? 'वेळ:' : 'Freq:'} <strong>{med.frequency}</strong> • {language === 'mr' ? 'कालावधी:' : 'Duration:'} <strong>{med.duration}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Daily Administration Dose Tracker */}
                          <button
                            type="button"
                            onClick={() => toggleDose(doseKey)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: isGiven ? '1px solid #86efac' : '1px solid var(--border-subtle)',
                              background: isGiven ? '#dcfce7' : '#f8fafc',
                              color: isGiven ? '#166534' : 'var(--text-muted)',
                            }}
                          >
                            {isGiven ? <CheckSquare size={14} color="#166534" /> : <Square size={14} />}
                            <span>
                              {isGiven
                                ? (language === 'mr' ? 'डोस दिला ✓' : language === 'hi' ? 'खुराक दी गई ✓' : 'Administered ✓')
                                : (language === 'mr' ? 'डोस नोंदवा' : language === 'hi' ? 'खुराक दर्ज करें' : 'Mark Given')}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Doctor's Clinical Instructions */}
                {rx.clinical_instructions && (
                  <div
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      lineHeight: 1.45,
                    }}
                  >
                    <strong style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <AlertTriangle size={14} />
                      <span>{language === 'mr' ? 'डॉक्टरांच्या महत्त्वाच्या सूचना:' : language === 'hi' ? 'डॉक्टर के महत्वपूर्ण निर्देश:' : 'Doctor\'s Clinical Instructions:'}</span>
                    </strong>
                    {rx.clinical_instructions}
                  </div>
                )}

                {/* Bottom Card Footer: Date, Follow-up & Contact */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {language === 'mr' ? 'जारी:' : 'Issued:'} {new Date(rx.created_at).toLocaleDateString()}
                    </span>
                    {rx.follow_up_date && (
                      <span style={{ color: '#15803d', fontWeight: 700 }}>
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {language === 'mr' ? 'पुढील तपासणी:' : 'Follow-up:'} {rx.follow_up_date}
                      </span>
                    )}
                  </div>

                  <a
                    href="tel:18001205338"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#059669',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <Phone size={12} />
                    <span>{language === 'mr' ? 'डॉक्टरांशी बोला (1962)' : 'Helpline 1962'}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Digital Prescription Slip Modal */}
      {selectedRxForSlip && (
        <div className="modal-backdrop" onClick={() => setSelectedRxForSlip(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', width: '100%', borderRadius: '20px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }} className="no-print">
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Official Veterinary Rx Slip
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary"
                  style={{ fontSize: '0.76rem', padding: '6px 14px', borderRadius: '8px' }}
                >
                  <Printer size={14} />
                  <span>{language === 'mr' ? 'प्रिंट काढा / PDF' : 'Print Slip'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRxForSlip(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Printable Rx Document Container */}
            <div
              style={{
                border: '2px solid #0f172a',
                borderRadius: '12px',
                padding: '24px',
                background: '#ffffff',
                fontFamily: 'serif',
                color: '#0f172a',
              }}
            >
              {/* Document Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.08em', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Government of Maharashtra • Department of Animal Husbandry
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '4px 0 2px', fontFamily: 'var(--font-heading)' }}>
                  {selectedRxForSlip.hospital_name}
                </h2>
                <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                  Taluka Polyclinic & Veterinary Clinical Services • Emergency 1962 Node
                </div>
              </div>

              {/* Doctor & Patient Two-Column Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', marginBottom: '14px', fontSize: '0.8rem' }}>
                <div>
                  <div><strong>Veterinary Officer:</strong> {selectedRxForSlip.doctor_name}</div>
                  <div><strong>MSVC Reg. License:</strong> {selectedRxForSlip.license_number}</div>
                  <div><strong>Date of Issue:</strong> {new Date(selectedRxForSlip.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div><strong>Patient Animal Tag:</strong> {selectedRxForSlip.animal_tag}</div>
                  <div><strong>Species / Breed:</strong> {selectedRxForSlip.animal_species}</div>
                  <div><strong>Owner:</strong> {selectedRxForSlip.farmer_name} ({selectedRxForSlip.farmer_phone})</div>
                  {selectedRxForSlip.diagnosis && (
                    <div style={{ color: '#0369a1', marginTop: '2px' }}>
                      <strong>Diagnosis:</strong> {selectedRxForSlip.diagnosis}
                    </div>
                  )}
                </div>
              </div>

              {/* Rx Symbol & Medication Table */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'serif', fontStyle: 'italic', marginBottom: '8px' }}>
                  ℞
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #0f172a', textAlign: 'left' }}>
                      <th style={{ padding: '6px 8px' }}>#</th>
                      <th style={{ padding: '6px 8px' }}>Medicine Name</th>
                      <th style={{ padding: '6px 8px' }}>Dosage & Route</th>
                      <th style={{ padding: '6px 8px' }}>Frequency</th>
                      <th style={{ padding: '6px 8px' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRxForSlip.medicines.map((m, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{i + 1}</td>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{m.name}</td>
                        <td style={{ padding: '6px 8px' }}>{m.dosage}</td>
                        <td style={{ padding: '6px 8px' }}>{m.frequency}</td>
                        <td style={{ padding: '6px 8px' }}>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              {selectedRxForSlip.clinical_instructions && (
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.76rem', marginBottom: '16px' }}>
                  <strong>Care Guidelines for Farmer:</strong> {selectedRxForSlip.clinical_instructions}
                </div>
              )}

              {/* Document Seal & Signature */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Verified via JeevRakshak AI Clinical Network<br />
                  Digital Rx ID: {selectedRxForSlip.id.toUpperCase()}<br />
                  Compliant with Indian Veterinary Council Act
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', borderBottom: '1px solid #0f172a', marginBottom: '4px' }}></div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>{selectedRxForSlip.doctor_name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Digitally Certified & Signed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
