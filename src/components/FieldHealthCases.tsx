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
  const { t } = useLanguage();
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
      notes: sampleNotes || 'Sample dispatched to District Veterinary Lab Pune',
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
      nextStatus === 'tested' ? 'Negative for Anthrax; Positive for BRD viral isolate' : undefined
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
            <span>Shirur Block, Pune</span>
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
            Active disease surveillance queue across Shirur and Haveli blocks.
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'All Cases' },
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
                      CASE #{report.id.replace('rep-', '').toUpperCase()}
                    </span>
                    <span className={`badge ${isCrit ? 'badge-critical' : 'badge-warning'}`}>
                      {isCrit ? t.fieldHealth.urgent : status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Shirapur • {report.animal?.species || 'Livestock'} ({report.animal?.tag_number || 'Tag'})
                    {report.mortality_count > 0 && (
                      <strong style={{ color: 'var(--critical)', marginLeft: '6px' }}>
                        • {report.mortality_count} mortality
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
                <strong>Symptoms:</strong> {report.symptoms}
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
                  onClick={() => alert(`Navigating to Shirapur coordinates (18.8120, 74.3910)`)}
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
                    Case #{selectedCase.id.replace('rep-', '').toUpperCase()}
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
                  Reported by Suresh Shinde (Farmer) • Source: {selectedCase.source}
                </div>
              </div>
              <button onClick={() => setSelectedCase(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Case Details: Animal & Symptoms */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Animal Tag</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {selectedCase.animal?.tag_number || 'Tag'}
                </div>
                <button
                  onClick={() => {
                    if (selectedCase.animal) onSelectAnimal(selectedCase.animal.id);
                  }}
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}
                >
                  View Animal Record &rarr;
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Location Distance</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>Shirapur, Shirur Block</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>11.8 km away</div>
              </div>
            </div>

            {/* Symptoms Tags */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>Observed Symptoms</div>
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
                    {sym.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Differential Diagnosis / Disease Catalog Associations */}
            {selectedCase.diseases && selectedCase.diseases.length > 0 && (
              <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px' }}>
                  Differential Disease Associations (from Disease Catalog)
                </div>
                {selectedCase.diseases.map((d) => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{d.disease?.name}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.confidence}% Confidence</span>
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostic Samples Tracking (Screen 18) */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Diagnostic Lab Samples</span>
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
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{samp.sample_type}</span>
                        <span className="badge badge-warning">{samp.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        District Veterinary Lab • Collected: {samp.collected_at.slice(0, 10)}
                      </div>
                      {samp.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '4px' }}>
                          Notes: {samp.notes}
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
                            Mark In Transit / Sent
                          </button>
                        )}
                        {samp.status === 'sent' && (
                          <button
                            onClick={() => handleAdvanceSampleStatus(samp.id, 'received')}
                            className="btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Mark Lab Received
                          </button>
                        )}
                        {samp.status === 'received' && (
                          <button
                            onClick={() => handleAdvanceSampleStatus(samp.id, 'tested')}
                            className="btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            Complete Test & Post Result
                          </button>
                        )}
                        {samp.status === 'tested' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--stable)', fontWeight: 700 }}>
                            Result: {samp.result}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  No samples collected yet for this report.
                </div>
              )}
            </div>

            {/* Case Escalations Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>Case Escalations</span>
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
                        Escalated to: {esc.escalated_to}
                      </span>
                      <span className="badge badge-critical">{esc.status.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: '2px' }}>
                      Reason: {esc.reason}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Case currently handled at field level.
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
              Case: #{selectedCase.id.replace('rep-', '').toUpperCase()} • Animal: {selectedCase.animal?.tag_number || 'Tag'}
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
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fieldHealth.sendToLab}</label>
                <input
                  type="text"
                  readOnly
                  value="District Veterinary Polyclinic & Laboratory (Pune)"
                  className="form-input"
                  style={{ background: '#f8fafc', color: 'var(--text-muted)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notes & Storage Condition</label>
                <textarea
                  rows={2}
                  value={sampleNotes}
                  onChange={(e) => setSampleNotes(e.target.value)}
                  placeholder="e.g. Preserved on ice pack at 4°C, testing for viral panel"
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
                    'Rapid spread across multiple farms',
                    'Multiple unexplained livestock deaths',
                    'Severe respiratory / vesicular symptoms',
                    'Suspected zoonotic transmission risk',
                    'Diagnostic lab confirmation needed',
                  ].map((reason) => (
                    <button
                      type="button"
                      key={reason}
                      onClick={() => setEscalateReason(reason)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textAlign: 'left',
                        border: escalateReason === reason ? '2px solid var(--critical)' : '1px solid var(--border-subtle)',
                        background: escalateReason === reason ? '#fff1f2' : '#ffffff',
                        color: escalateReason === reason ? '#991b1b' : 'var(--text-main)',
                      }}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.fieldHealth.escalateTo}</label>
                <select
                  value={escalateTo}
                  onChange={(e) => setEscalateTo(e.target.value)}
                  className="form-select"
                >
                  <option value="Block Veterinary Officer (Shirur)">Block Veterinary Officer (Shirur)</option>
                  <option value="District Veterinary Officer (DAHO Pune)">District Veterinary Officer (DAHO Pune)</option>
                  <option value="State Disease Surveillance Officer (Maharashtra)">State Disease Surveillance Officer (Maharashtra)</option>
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
