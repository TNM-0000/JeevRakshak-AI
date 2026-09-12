'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  HealthReportWithDetails,
  DiagnosticSample,
  CaseEscalation,
  CaseStatus,
  SampleStatus,
} from '@/types/database';
import {
  getLocalizedField,
  localizeSpecies,
  localizeBreed,
  localizeSymptoms,
  localizeBlock,
  localizeVillage,
  localizeSampleType,
  localizeSampleStatus,
} from '@/lib/i18n/dbLocalization';
import {
  ClipboardList,
  AlertTriangle,
  FlaskConical,
  Send,
  CheckCircle2,
  Navigation as NavIcon,
  MapPin,
  Clock,
  ChevronRight,
  X,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Tag,
} from 'lucide-react';

interface FieldHealthCasesProps {
  onSelectAnimal: (animalId: string) => void;
}

export const FieldHealthCases: React.FC<FieldHealthCasesProps> = ({ onSelectAnimal }) => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'new' | 'review' | 'pending' | 'confirmed'>('all');
  const [selectedCase, setSelectedCase] = useState<HealthReportWithDetails | null>(null);

  // Sample Collection Modal State (Screen 17 & 18)
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleType, setSampleType] = useState('Nasal swab');
  const [sampleNotes, setSampleNotes] = useState('');

  // Case Escalation Modal State (Screen 19)
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateTo, setEscalateTo] = useState('District Veterinary Officer (DAHO)');
  const [escalateReason, setEscalateReason] = useState('Rapid spread');

  const loadCases = () => {
    dataService.getHealthReports().then(setReports);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'new') return !r.assessment || r.assessment.status === 'suspected';
    if (activeFilter === 'review') return r.assessment?.status === 'probable';
    if (activeFilter === 'pending') return r.samples && r.samples.some((s) => s.status !== 'tested');
    if (activeFilter === 'confirmed') return r.assessment?.status === 'confirmed';
    return true;
  });

  const handleCollectSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    await dataService.collectDiagnosticSample({
      health_report_id: selectedCase.id,
      sample_type: sampleType,
      collected_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      received_at: null,
      tested_at: null,
      status: 'collected',
      result: null,
      notes: sampleNotes || (language === 'mr' ? 'पुणे जिल्हा पशुवैद्यकीय प्रयोगशाळेकडे नमुना पाठवला' : language === 'hi' ? 'पुणे जिला पशु चिकित्सा प्रयोगशाला भेजा गया नमूना' : 'Sample dispatched to District Veterinary Lab Pune'),
    });

    setShowSampleModal(false);
    setSampleNotes('');
    loadCases();
    // Refresh open case
    dataService.getHealthReports().then((all) => {
      const refreshed = all.find((c) => c.id === selectedCase.id);
      if (refreshed) setSelectedCase(refreshed);
    });
  };

  const handleEscalateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    await dataService.escalateCase({
      health_report_id: selectedCase.id,
      escalated_to: escalateTo,
      reason: escalateReason,
      status: 'open',
      resolved_at: null,
    });

    setShowEscalateModal(false);
    loadCases();
    // Refresh open case
    dataService.getHealthReports().then((all) => {
      const refreshed = all.find((c) => c.id === selectedCase.id);
      if (refreshed) setSelectedCase(refreshed);
    });
  };

  const handleAdvanceSampleStatus = async (sampleId: string, nextStatus: SampleStatus) => {
    await dataService.updateSampleStatus(
      sampleId,
      nextStatus,
      nextStatus === 'tested' ? (language === 'mr' ? 'अँथ्रॅक्स चाचणी नकारात्मक; बीआरडी विषाणू संसर्ग निष्पन्न' : language === 'hi' ? 'एंथ्रेक्स परीक्षण नकारात्मक; बीआरडी वायरल अलग' : 'Negative for Anthrax; Positive for BRD viral isolate') : undefined
    );
    loadCases();
    if (selectedCase) {
      dataService.getHealthReports().then((all) => {
        const refreshed = all.find((c) => c.id === selectedCase.id);
        if (refreshed) setSelectedCase(refreshed);
      });
    }
  };

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
          { id: 'review', label: t.fieldHealth.review },
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
                      {language === 'mr' ? 'केस' : language === 'hi' ? 'केस' : 'CASE'} #{String(report.id).replace('rep-', '').substring(0, 8).toUpperCase()}
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

      {/* Case Details Drawer / Modal (Matching Screen 16) */}
      {selectedCase && (
        <div className="modal-backdrop" onClick={() => setSelectedCase(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                    {language === 'mr' ? 'केस' : language === 'hi' ? 'केस' : 'Case'} #{String(selectedCase.id).replace('rep-', '').substring(0, 8).toUpperCase()}
                  </h3>
                  <span
                    className={`badge ${
                      selectedCase.riskAssessment?.risk_level === 'critical' ? 'badge-critical' : 'badge-warning'
                    }`}
                  >
                    {selectedCase.riskAssessment?.risk_level?.toUpperCase() || 'ELEVATED'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language === 'mr'
                    ? `सुरेश शिंदे (शेतकरी) यांनी नोंदवले • स्रोत: ${selectedCase.source}`
                    : language === 'hi'
                    ? `सुरेश शिंदे (किसान) द्वारा सूचित • स्रोत: ${selectedCase.source}`
                    : `Reported by Suresh Shinde (Farmer) • Source: ${selectedCase.source}`}
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Case Details: Animal & Symptoms */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'जनावर टॅग क्रमांक' : language === 'hi' ? 'पशु टैग संख्या' : 'Animal Tag'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {selectedCase.animal?.tag_number || (language === 'mr' ? 'टॅग' : language === 'hi' ? 'टैग' : 'Tag')}
                </div>
                <button
                  onClick={() => {
                    if (selectedCase.animal) onSelectAnimal(selectedCase.animal.id);
                  }}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}
                >
                  {language === 'mr' ? 'जनावराची नोंद पहा →' : language === 'hi' ? 'पशु रिकॉर्ड देखें →' : 'View Animal Record →'}
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'स्थान आणि अंतर' : language === 'hi' ? 'स्थान और दूरी' : 'Location Distance'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {localizeVillage('Shirapur', language)}, {localizeBlock('Shirur', language)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? '११.८ किमी अंतरावर' : language === 'hi' ? '11.8 किमी दूर' : '11.8 km away'}
                </div>
              </div>
            </div>

            {/* Symptoms Tags */}
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
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  {language === 'mr'
                    ? 'संभाव्य आजार निदान (रोग सूचीवरून)'
                    : language === 'hi'
                    ? 'संभावित रोग निदान (रोग सूची से)'
                    : 'Differential Disease Associations (from Disease Catalog)'}
                </div>
                {selectedCase.diseases.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{getLocalizedField(d.disease, 'name', language) || d.disease?.name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      {d.confidence}% {language === 'mr' ? 'निश्चितता' : language === 'hi' ? 'सटीकता' : 'Confidence'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostic Samples Tracking (Screen 18) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'प्रयोगशाळा तपासणी नमुने' : language === 'hi' ? 'प्रयोगशाला नैदानिक नमूने' : 'Diagnostic Lab Samples'}
                </span>
                <button
                  onClick={() => setShowSampleModal(true)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <FlaskConical size={14} color="var(--primary)" />
                  <span>{t.fieldHealth.collectSample}</span>
                </button>
              </div>

              {selectedCase.samples && selectedCase.samples.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedCase.samples.map((samp) => (
                    <div
                      key={samp.id}
                      style={{
                        padding: '12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-card)',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {localizeSampleType(samp.sample_type, language)}
                        </span>
                        <span className="badge badge-warning">
                          {localizeSampleStatus(samp.status, language)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {language === 'mr' ? 'जिल्हा पशुवैद्यकीय प्रयोगशाळा • नमुना संकलन:' : language === 'hi' ? 'जिला पशु चिकित्सा प्रयोगशाला • संग्रह:' : 'District Veterinary Lab • Collected:'}{' '}
                        {samp.collected_at.slice(0, 10)}
                      </div>
                      {samp.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px' }}>
                          {language === 'mr' ? 'नोंद:' : language === 'hi' ? 'टिप्पणी:' : 'Notes:'} {samp.notes}
                        </div>
                      )}

                      {/* Advance sample lifecycle stages */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        {samp.status === 'collected' && (
                          <button
                            onClick={() => handleAdvanceSampleStatus(samp.id, 'sent')}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            {language === 'mr' ? 'नमुना पाठवला (वाहतुकीत)' : language === 'hi' ? 'भेज दिया गया (रास्ते में)' : 'Mark In Transit / Sent'}
                          </button>
                        )}
                        {samp.status === 'sent' && (
                          <button
                            onClick={() => handleAdvanceSampleStatus(samp.id, 'received')}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            {language === 'mr' ? 'लॅबमध्ये प्राप्त झाले' : language === 'hi' ? 'प्रयोगशाला में प्राप्त' : 'Mark Lab Received'}
                          </button>
                        )}
                        {samp.status === 'received' && (
                          <button
                            onClick={() => handleAdvanceSampleStatus(samp.id, 'tested')}
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            {language === 'mr' ? 'चाचणी पूर्ण करा व निकाल नोंदवा' : language === 'hi' ? 'परीक्षण पूरा करें और परिणाम दर्ज करें' : 'Complete Test & Post Result'}
                          </button>
                        )}
                        {samp.status === 'tested' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--stable)', fontWeight: 700 }}>
                            {language === 'mr' ? 'निकाल:' : language === 'hi' ? 'परिणाम:' : 'Result:'} {samp.result}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  {language === 'mr'
                    ? 'या अहवालासाठी अद्याप नमुने गोळा केलेले नाहीत.'
                    : language === 'hi'
                    ? 'इस रिपोर्ट के लिए अभी तक कोई नमूना एकत्र नहीं किया गया है।'
                    : 'No samples collected yet for this report.'}
                </div>
              )}
            </div>

            {/* Case Escalations Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'केस वरिष्ठ पातळीवर पाठवणे (Escalations)' : language === 'hi' ? 'मामला वरिष्ठ स्तर पर भेजना (Escalations)' : 'Case Escalations'}
                </span>
                <button
                  onClick={() => setShowEscalateModal(true)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', color: 'var(--critical)' }}
                >
                  <ArrowUpRight size={14} />
                  <span>{t.fieldHealth.escalateCase}</span>
                </button>
              </div>

              {selectedCase.escalations && selectedCase.escalations.length > 0 ? (
                selectedCase.escalations.map((esc) => (
                  <div
                    key={esc.id}
                    style={{
                      background: '#fff1f2',
                      border: '1px solid var(--critical-border)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#991b1b' }}>
                        {language === 'mr' ? 'पाठवले:' : language === 'hi' ? 'भेजा गया:' : 'Escalated to:'} {esc.escalated_to}
                      </span>
                      <span className="badge badge-critical">{esc.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '2px' }}>
                      {language === 'mr' ? 'कारण:' : language === 'hi' ? 'कारण:' : 'Reason:'} {esc.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'केस सध्या स्थानिक पातळीवर हाताळली जात आहे.' : language === 'hi' ? 'मामला वर्तमान में क्षेत्रीय स्तर पर ही संभाला जा रहा है।' : 'Case currently handled at field level.'}
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSampleModal(true)}
                className="btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                <FlaskConical size={16} />
                <span>{t.fieldHealth.collectSample}</span>
              </button>
              <button
                onClick={() => setShowEscalateModal(true)}
                className="btn-secondary"
                style={{ padding: '12px 18px', color: 'var(--critical)' }}
              >
                <ArrowUpRight size={16} />
                <span>{t.fieldHealth.escalateCase}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Sample Modal (Screen 17) */}
      {showSampleModal && selectedCase && (
        <div className="modal-backdrop" onClick={() => setShowSampleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.fieldHealth.collectSample}</h3>
              <button onClick={() => setShowSampleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {language === 'mr' ? 'केस' : language === 'hi' ? 'केस' : 'Case'}: #{String(selectedCase.id).replace('rep-', '').substring(0, 8).toUpperCase()} • {language === 'mr' ? 'जनावर' : language === 'hi' ? 'पशु' : 'Animal'}: {selectedCase.animal?.tag_number || (language === 'mr' ? 'टॅग' : language === 'hi' ? 'टैग' : 'Tag')}
            </div>

            <form onSubmit={handleCollectSample}>
              <div className="form-group">
                <label className="form-label">{t.fieldHealth.sampleType}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {['Blood', 'Nasal swab', 'Saliva', 'Tissue biopsy', 'Milk sample', 'Other'].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setSampleType(type)}
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        border: sampleType === type ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: sampleType === type ? 'var(--primary-light)' : '#ffffff',
                        color: sampleType === type ? 'var(--primary-deep)' : 'var(--text-main)',
                      }}
                    >
                      {localizeSampleType(type, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fieldHealth.sendToLab}</label>
                <input
                  type="text"
                  readOnly
                  value={language === 'mr' ? 'जिल्हा पशुवैद्यकीय पॉलीक्लिनिक आणि प्रयोगशाळा (पुणे)' : language === 'hi' ? 'जिला पशु चिकित्सा पॉलीक्लिनिक एवं प्रयोगशाला (पुणे)' : 'District Veterinary Polyclinic & Laboratory (Pune)'}
                  className="form-input"
                  style={{ background: '#f8fafc', color: 'var(--text-muted)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {language === 'mr' ? 'नोंदी आणि साठवणुकीची स्थिती' : language === 'hi' ? 'टिप्पणियां और भंडारण की स्थिति' : 'Notes & Storage Condition'}
                </label>
                <textarea
                  rows={2}
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  placeholder={language === 'mr' ? 'उदा. ४°C वर बर्फाच्या पॅकवर सुरक्षित, विषाणू चाचणीसाठी' : language === 'hi' ? 'उदा. 4°C पर आइस पैक पर सुरक्षित, वायरल परीक्षण के लिए' : 'e.g. Preserved on ice pack at 4°C, testing for viral panel'}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                {t.fieldHealth.confirmSample}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Escalate Case Modal (Screen 19) */}
      {showEscalateModal && selectedCase && (
        <div className="modal-backdrop" onClick={() => setShowEscalateModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--critical)' }}>
                {t.fieldHealth.escalateCase}
              </h3>
              <button onClick={() => setShowEscalateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                background: '#fff1f2',
                border: '1px solid var(--critical-border)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: '#991b1b',
                marginBottom: '16px',
              }}
            >
              <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
              {t.fieldHealth.escalationNotice}
            </div>

            <form onSubmit={handleEscalateCase}>
              <div className="form-group">
                <label className="form-label">{t.fieldHealth.reasonForEscalation}</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    {
                      en: 'Rapid spread across multiple farms',
                      hi: 'कई फार्मों में तेजी से फैलाव',
                      mr: 'एकाहून अधिक गोठ्यांमध्ये वेगाने प्रसार',
                    },
                    {
                      en: 'Multiple unexplained livestock deaths',
                      hi: 'कई अकस्मात पशु मृत्यु',
                      mr: 'एकाहून अधिक जनावरांचा अस्पष्ट कारणाने मृत्यू',
                    },
                    {
                      en: 'Severe respiratory / vesicular symptoms',
                      hi: 'गंभीर श्वसन या छाले संबंधी लक्षण',
                      mr: 'तीव्र श्वसन विकार / फोड येण्याची लक्षणे',
                    },
                    {
                      en: 'Suspected zoonotic transmission risk',
                      hi: 'मानवों में फैलने (जूनोटिक) का संभावित जोखिम',
                      mr: 'मानवांमध्ये संसर्गाचा (झुनोटिक) संभाव्य धोका',
                    },
                    {
                      en: 'Diagnostic lab confirmation needed',
                      hi: 'नैदानिक प्रयोगशाला पुष्टि की आवश्यकता',
                      mr: 'प्रयोगशाळा तपासणीद्वारे त्वरित निदानाची गरज',
                    },
                  ].map((rObj) => {
                    const reasonText = language === 'mr' ? rObj.mr : language === 'hi' ? rObj.hi : rObj.en;
                    return (
                      <button
                        type="button"
                        key={rObj.en}
                        onClick={() => setEscalateReason(rObj.en)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textAlign: 'left',
                          border: escalateReason === rObj.en ? '2px solid var(--critical)' : '1px solid var(--border-subtle)',
                          background: escalateReason === rObj.en ? '#fff1f2' : '#ffffff',
                          color: escalateReason === rObj.en ? '#991b1b' : 'var(--text-main)',
                        }}
                      >
                        {reasonText}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fieldHealth.escalateTo}</label>
                <select
                  value={escalateTo}
                  onChange={(e) => setEscalateTo(e.target.value)}
                  className="form-select"
                >
                  <option value="Block Veterinary Officer (Shirur)">
                    {language === 'mr' ? 'तालुका पशुवैद्यकीय अधिकारी (शिरूर)' : language === 'hi' ? 'ब्लॉक पशु चिकित्सा अधिकारी (शिरूर)' : 'Block Veterinary Officer (Shirur)'}
                  </option>
                  <option value="District Veterinary Officer (DAHO Pune)">
                    {language === 'mr' ? 'जिल्हा पशुवैद्यकीय अधिकारी (DAHO पुणे)' : language === 'hi' ? 'जिला पशु चिकित्सा अधिकारी (DAHO पुणे)' : 'District Veterinary Officer (DAHO Pune)'}
                  </option>
                  <option value="State Disease Surveillance Officer (Maharashtra)">
                    {language === 'mr' ? 'राज्य रोग नियंत्रण अधिकारी (महाराष्ट्र)' : language === 'hi' ? 'राज्य रोग निगरानी अधिकारी (महाराष्ट्र)' : 'State Disease Surveillance Officer (Maharashtra)'}
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '12px', background: 'var(--critical)', marginTop: '10px' }}
              >
                {t.fieldHealth.confirmEscalate}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

