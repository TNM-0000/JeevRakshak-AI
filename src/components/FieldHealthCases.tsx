'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  HealthReportWithDetails,
  CaseStatus,
} from '@/types/database';
import {
  getLocalizedField,
  localizeSpecies,
  localizeBreed,
  localizeSymptoms,
  localizeBlock,
  localizeVillage,
} from '@/lib/i18n/dbLocalization';
import { formatDailyCaseNumber } from '@/lib/caseUtils';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Navigation as NavIcon,
  MapPin,
  Clock,
  X,
  FileText,
  ShieldAlert,
  Tag,
  Calendar,
  User,
} from 'lucide-react';

interface FieldHealthCasesProps {
  onSelectAnimal: (animalId: string) => void;
}

export const FieldHealthCases: React.FC<FieldHealthCasesProps> = ({ onSelectAnimal }) => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'pending' | 'confirmed'>('all');
  const [selectedCase, setSelectedCase] = useState<HealthReportWithDetails | null>(null);

  const loadCases = () => {
    dataService.getHealthReports().then(setReports);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') return !r.assessment || r.assessment.status === 'suspected';
    if (activeFilter === 'pending') return !r.assessment || r.assessment.status === 'suspected';
    if (activeFilter === 'confirmed') return r.assessment?.status === 'confirmed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Attention Counter (Matching Screen 10) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            <MapPin size={14} />
            <span>{localizeBlock('Shirur', language)}, {language === 'mr' ? 'पुणे जिल्हा' : language === 'hi' ? 'पुणे जिला' : 'Pune District'}</span>
            <span>•</span>
            <span style={{ color: 'var(--primary)' }}>{t.fieldHealth.updatedJustNow}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{t.fieldHealth.title}</h2>
        </div>
      </div>

      {/* Top Banner Alert */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: '1px solid var(--critical-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--critical)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#991b1b' }}>
            {reports.length} {t.fieldHealth.casesNeedAttention}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
            {language === 'mr'
              ? 'शिरूर आणि हवेली तालुक्यात सक्रिय रोग नियंत्रण व देखरेख.'
              : language === 'hi'
              ? 'शिरूर और हवेली ब्लॉकों में सक्रिय रोग निगरानी कतार।'
              : 'Active disease surveillance queue across Shirur and Haveli blocks.'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: language === 'mr' ? 'सर्व केसेस' : language === 'hi' ? 'सभी मामले' : 'All Cases' },
          { id: 'new', label: t.fieldHealth.new },
          { id: 'pending', label: t.fieldHealth.pending },
          { id: 'confirmed', label: t.fieldHealth.confirmed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`role-pill ${activeFilter === tab.id ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cases List (Screen 10) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReports.map((report) => {
          const isCrit = report.riskAssessment?.risk_level === 'critical' || report.mortality_count > 0;
          const status = report.assessment?.status || 'suspected';

          return (
            <div
              key={report.id}
              className="glass-card"
              style={{
                borderLeft: isCrit ? '4px solid var(--critical)' : '4px solid var(--warning)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {formatDailyCaseNumber(report, reports, language)}
                    </span>
                    <span className={`badge ${isCrit ? 'badge-critical' : 'badge-warning'}`}>
                      {isCrit ? t.fieldHealth.urgent : status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {localizeVillage('Shirapur', language)} • {localizeSpecies(report.animal?.species || 'Cattle', language)} ({report.animal?.tag_number || (language === 'mr' ? 'टॅग' : language === 'hi' ? 'टैग' : 'Tag')})
                    {report.mortality_count > 0 && (
                      <strong style={{ color: 'var(--critical)', marginLeft: '6px' }}>
                        • {report.mortality_count} {language === 'mr' ? 'मृत्यू नोंद' : language === 'hi' ? 'मृत्यु दर्ज' : 'mortality'}
                      </strong>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {report.source.toUpperCase()}
                </span>
              </div>

              {/* Symptoms snippet */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: '#f8fafc', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                <strong>{language === 'mr' ? 'लक्षणे:' : language === 'hi' ? 'लक्षण:' : 'Symptoms:'}</strong> {localizeSymptoms(report.symptoms, language)}
              </div>

              {/* Action Buttons: Review Case & Navigate */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => setSelectedCase(report)}
                  className="btn-primary"
                  style={{ flex: 1, padding: '8px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                >
                  <FileText size={15} />
                  <span>{t.fieldHealth.reviewCase}</span>
                </button>
                <button
                  onClick={() => alert(language === 'mr' ? 'शिरापूर (१८.८१२०, ७४.३९१०) कडे दिशादर्शन सुरू करत आहे' : language === 'hi' ? 'शिरापुर (18.8120, 74.3910) की ओर नेविगेशन शुरू' : 'Navigating to Shirapur coordinates (18.8120, 74.3910)')}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem', borderRadius: 'var(--radius-md)' }}
                >
                  <NavIcon size={14} />
                  <span>{t.fieldHealth.navigate}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Details Drawer / Review Modal: Strictly Description & Clinical Case Details */}
      {selectedCase && (
        <div className="modal-backdrop" onClick={() => setSelectedCase(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {formatDailyCaseNumber(selectedCase, reports, language)}
                  </h3>
                  <span
                    className={`badge ${
                      selectedCase.riskAssessment?.risk_level === 'critical' ? 'badge-critical' : 'badge-warning'
                    }`}
                  >
                    {selectedCase.riskAssessment?.risk_level?.toUpperCase() || 'ELEVATED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {language === 'mr'
                    ? `नोंदणी स्रोत: ${selectedCase.source.toUpperCase()} • तारीख: ${(selectedCase.reported_at || '').slice(0, 10)}`
                    : language === 'hi'
                    ? `पंजीकरण स्रोत: ${selectedCase.source.toUpperCase()} • दिनांक: ${(selectedCase.reported_at || '').slice(0, 10)}`
                    : `Intake Source: ${selectedCase.source.toUpperCase()} • Date: ${(selectedCase.reported_at || '').slice(0, 10)}`}
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Case Description Section (Prominent) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1.5px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-deep)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} color="var(--primary)" />
                <span>
                  {language === 'mr' ? 'केस तपशील व निरीक्षण (Case Description)' : language === 'hi' ? 'केस विवरण एवं अवलोकन (Case Description)' : 'Case Description & Clinical Observations'}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                {selectedCase.notes ||
                  (language === 'mr'
                    ? 'या केससाठी कोणतीही अतिरिक्त निरीक्षणे नोंदवलेली नाहीत.'
                    : language === 'hi'
                    ? 'इस केस के लिए कोई अतिरिक्त टिप्पणी दर्ज नहीं है।'
                    : 'No additional clinical description recorded for this case.')}
              </p>
            </div>

            {/* Animal & Location Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'जनावर टॅग व प्रजाती' : language === 'hi' ? 'पशु टैग एवं प्रजाति' : 'Animal Tag & Species'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                  {selectedCase.animal?.tag_number || (language === 'mr' ? 'नोंदणीकृत टॅग' : 'Tag')}{' '}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    ({localizeSpecies(selectedCase.animal?.species || 'Cattle', language)})
                  </span>
                </div>
                {selectedCase.animal && (
                  <button
                    onClick={() => {
                      if (selectedCase.animal) onSelectAnimal(selectedCase.animal.id);
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '4px', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    {language === 'mr' ? 'जनावराची नोंद पहा →' : language === 'hi' ? 'पशु रिकॉर्ड देखें →' : 'View Animal Profile →'}
                  </button>
                )}
              </div>

              <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'स्थान व कार्यक्षेत्र' : language === 'hi' ? 'स्थान व कार्यक्षेत्र' : 'Location & Node'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                  {localizeVillage('Shirapur', language)}, {localizeBlock('Shirur', language)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {language === 'mr' ? 'पुणे जिल्हा • कार्यक्षेत्र कक्ष' : language === 'hi' ? 'पुणे जिला • सेवा क्षेत्र' : 'Pune District • Field Cluster'}
                </div>
              </div>
            </div>

            {/* Observed Symptoms */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                {language === 'mr' ? 'निदर्शनास आलेली लक्षणे' : language === 'hi' ? 'देखे गए लक्षण' : 'Observed Symptoms'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCase.symptoms.split(',').map((sym, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    {localizeSymptoms(sym.trim(), language)}
                  </span>
                ))}
              </div>
            </div>

            {/* Differential Diagnosis / Disease Catalog Associations */}
            {selectedCase.diseases && selectedCase.diseases.length > 0 && (
              <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                  {language === 'mr'
                    ? 'संभाव्य आजार निदान (Differential Disease Assessment)'
                    : language === 'hi'
                    ? 'संभावित रोग निदान'
                    : 'Differential Disease Associations'}
                </div>
                {selectedCase.diseases.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '4px 0' }}>
                    <span style={{ fontWeight: 600 }}>
                      {getLocalizedField(d.disease, 'name', language) || d.disease?.name}
                    </span>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>
                      {d.confidence}% {language === 'mr' ? 'निश्चितता' : language === 'hi' ? 'सटीकता' : 'Confidence'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCase(null)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
            >
              {language === 'mr' ? 'तपशील बंद करा' : language === 'hi' ? 'विवरण बंद करें' : 'Close Case Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

