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
import { formatDailyCaseNumber, getDailyCaseNumber } from '@/lib/caseUtils';
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
  Smartphone,
  Send,
} from 'lucide-react';

interface FieldHealthCasesProps {
  onSelectAnimal: (animalId: string) => void;
}

export const FieldHealthCases: React.FC<FieldHealthCasesProps> = ({ onSelectAnimal }) => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'escalated' | 'new' | 'pending' | 'confirmed'>('all');
  const [selectedCase, setSelectedCase] = useState<HealthReportWithDetails | null>(null);

  const loadCases = () => {
    dataService.getHealthReports().then(setReports);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const isReportEscalated = (r: HealthReportWithDetails) => {
    return Boolean(r.escalations && r.escalations.length > 0);
  };

  const isReportTreated = (r: HealthReportWithDetails) => {
    return r.assessment?.status === 'resolved' || r.assessment?.status === 'ruled_out';
  };

  // Sort helper: Ascending daily case number order (Case #1, Case #2, Case #3...)
  const sortReportsAscending = (a: HealthReportWithDetails, b: HealthReportWithDetails): number => {
    const numA = getDailyCaseNumber(a, reports);
    const numB = getDailyCaseNumber(b, reports);
    if (numA !== numB) return numA - numB;
    const timeA = new Date(a.reported_at || a.created_at || 0).getTime();
    const timeB = new Date(b.reported_at || b.created_at || 0).getTime();
    return timeA - timeB;
  };

  // Escalated cases (moved to dedicated Escalated Cases section, sorted ascending)
  const escalatedReports = reports.filter(isReportEscalated).sort(sortReportsAscending);

  // Active cases (non-escalated, sorted ascending)
  const activeReports = reports
    .filter((r) => {
      if (isReportEscalated(r)) return false; // MOVED
      if (activeFilter === 'escalated') return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'new') return !r.assessment || r.assessment.status === 'suspected';
      if (activeFilter === 'pending') return !r.assessment || r.assessment.status === 'suspected';
      if (activeFilter === 'confirmed') return r.assessment?.status === 'confirmed';
      return true;
    })
    .sort(sortReportsAscending);

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
          { id: 'escalated', label: language === 'mr' ? '⚠️ अग्रेषित केसेस' : language === 'hi' ? '⚠️ अग्रेषित केस' : '⚠️ Escalated Cases' },
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

      {/* ========================================================================= */}
      {/* 1. DEDICATED SECTION: ESCALATED CASES (अग्रेषित केसेस)                    */}
      {/* ========================================================================= */}
      {(activeFilter === 'all' || activeFilter === 'escalated') && (
        <div
          style={{
            background: '#fffdfa',
            border: '1.5px solid #fed7aa',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1.5px solid #fde68a', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fcd34d' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9a3412', margin: 0 }}>
                    {language === 'mr' ? 'अग्रेषित केसेस (Escalated Cases)' : 'Escalated Cases'}
                  </h3>
                  <span style={{ background: '#ffedd5', color: '#9a3412', fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', border: '1px solid #fdba74' }}>
                    {escalatedReports.length} {language === 'mr' ? 'केसेस' : 'Cases'}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#c2410c', margin: '2px 0 0' }}>
                  {language === 'mr'
                    ? 'जिल्हा पशुवैद्यकीय अधिकारी (DAHO) कडे वर्ग केलेल्या केसेस व शेतकऱ्यास थेट SMS अलर्ट'
                    : 'Cases forwarded to DAHO authorities with automated livestock owner SMS delivery tracking'}
                </p>
              </div>
            </div>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
              <Smartphone size={13} color="#b45309" />
              <span>SMS Gateway: Dispatched</span>
            </span>
          </div>

          {escalatedReports.length === 0 ? (
            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '10px', border: '1px dashed #fcd34d', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
                {language === 'mr' ? 'सध्या कोणतीही केस अग्रेषित नाही.' : 'No field cases currently escalated.'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {escalatedReports.map((report) => {
                const esc = report.escalations?.[0];
                const caseNum = formatDailyCaseNumber(report, reports, language);

                return (
                  <div
                    key={`esc-rep-${report.id}`}
                    style={{
                      background: '#ffffff',
                      border: '2px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 3px 8px rgba(245, 158, 11, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                            {caseNum}
                          </span>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1.5px solid #fca5a5',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <AlertTriangle size={12} color="#dc2626" />
                            <span>{language === 'mr' ? 'अग्रेषित (Escalated to DAHO)' : 'Escalated to DAHO'}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          {localizeVillage('Shirapur', language)} • {localizeSpecies(report.animal?.species || 'Cattle', language)} ({report.animal?.tag_number || 'Tag'})
                        </div>
                      </div>

                      <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#7f1d1d', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>
                        HIGH PRIORITY
                      </span>
                    </div>

                    {/* Escalation details */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px', fontSize: '0.8rem', color: '#92400e' }}>
                      <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                        <ShieldAlert size={14} color="#b45309" />
                        <span>Escalated To: {esc?.escalated_to || 'Dr. Sunita Patil, DAHO (District Animal Husbandry Officer)'}</span>
                      </div>
                      <div>
                        <strong>Reason:</strong> {esc?.reason || 'Contagious disease outbreak suspected; biosafety and state lab confirmation required'}
                      </div>
                    </div>

                    {/* Dedicated SMS Notification Box */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                        border: '1.5px solid #86efac',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '5px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Smartphone size={14} color="#15803d" />
                          <span style={{ fontWeight: 800, fontSize: '0.78rem', color: '#166534' }}>
                            {language === 'mr' ? 'पशुपालकास SMS पाठवला (SMS Dispatched to User)' : 'SMS Notification Dispatched to User'}
                          </span>
                          <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 800 }}>
                            ✓ Delivered to +91 9822019482
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', border: '1px dashed #86efac', borderRadius: '6px', padding: '6px 10px', fontSize: '0.74rem', color: '#14532d', fontFamily: 'monospace' }}>
                        &ldquo;[JeevRakshak AI] प्रिय शेतकरी, आपली केस क्र. {caseNum} जिल्हा पशुवैद्यकीय अधिकारी (DAHO) यांच्याकडे वर्ग करण्यात आली आहे. मदत कक्ष: 1800-120-JEEV.&rdquo;
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: '#16a34a' }}>
                        <span>Gateway: JeevRakshak SMS Portal</span>
                        <span>Status: Verified Delivered</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <button
                        onClick={() => setSelectedCase(report)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '7px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}
                      >
                        <FileText size={14} />
                        <span>{t.fieldHealth.reviewCase}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACTIVE FIELD CASES (Non-escalated cases)                                */}
      {/* ========================================================================= */}
      {activeFilter !== 'escalated' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <ClipboardList size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {language === 'mr' ? 'सक्रिय फील्ड केसेस' : 'Active Field Cases'} ({activeReports.length})
            </h3>
          </div>

          {activeReports.map((report) => {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {formatDailyCaseNumber(report, reports, language)}
                      </span>
                      {isReportTreated(report) && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            background: '#dcfce7',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <CheckCircle2 size={12} color="#16a34a" />
                          {language === 'mr' ? 'उपचारित' : language === 'hi' ? 'उपचारित' : 'Treated'}
                        </span>
                      )}
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
      )}

      {/* Case Details Drawer / Review Modal: Strictly Description & Clinical Case Details */}
      {selectedCase && (
        <div className="modal-backdrop" onClick={() => setSelectedCase(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    {formatDailyCaseNumber(selectedCase, reports, language)}
                  </h3>
                  {isReportTreated(selectedCase) && (
                    <span
                      style={{
                        fontSize: '0.76rem',
                        background: '#dcfce7',
                        color: '#15803d',
                        border: '1.5px solid #86efac',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={13} color="#16a34a" />
                      {language === 'mr' ? 'उपचारित' : language === 'hi' ? 'उपचारित' : 'Treated'}
                    </span>
                  )}
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

