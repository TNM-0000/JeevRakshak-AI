'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  Mic,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  User,
  Search,
  RefreshCw,
  FileAudio,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { IVRReport, IVRCallbackRequest, IVREmergencyCase } from '@/types/database';
import { dataService } from '@/lib/supabase/dataService';
import { speakIVRPrompt, stopIVRSpeech } from '@/lib/ivr/ivrAudioEngine';

interface VetIVRMonitorProps {
  onOpenPhoneSimulator?: (phone?: string) => void;
  onConvertToCase?: (report: IVRReport) => void;
}

export const VetIVRMonitor: React.FC<VetIVRMonitorProps> = ({
  onOpenPhoneSimulator,
}) => {
  const [reports, setReports] = useState<IVRReport[]>([]);
  const [callbacks, setCallbacks] = useState<IVRCallbackRequest[]>([]);
  const [emergencies, setEmergencies] = useState<IVREmergencyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'callbacks' | 'emergencies'>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reps, cbs, emgs] = await Promise.all([
        dataService.getIVRReports(),
        dataService.getIVRCallbacks(),
        dataService.getIVREmergencies(),
      ]);
      setReports(reps);
      setCallbacks(cbs);
      setEmergencies(emgs);
    } catch (err) {
      console.error('Failed to load IVR vet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    return () => {
      stopIVRSpeech();
    };
  }, []);

  const handlePlayVoice = (id: string, text: string) => {
    if (playingAudioId === id) {
      stopIVRSpeech();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(id);
    speakIVRPrompt(
      text,
      'mr',
      () => setPlayingAudioId(null),
      () => setPlayingAudioId(id)
    );
  };

  const handleAcceptReport = async (reportId: string) => {
    await dataService.updateIVRReportStatus(reportId, 'accepted');
    showToast('IVR Voice Report accepted and assigned to clinical queue.');
    await loadData();
  };

  const handleCompleteCallback = async (cbId: string) => {
    await dataService.updateIVRCallbackStatus(
      cbId,
      'completed',
      'Doctor called farmer back and provided tele-advice.'
    );
    showToast('Doctor callback marked as resolved.');
    await loadData();
  };

  const filteredReports = reports.filter(
    (r) =>
      r.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.farmer_phone.includes(searchQuery) ||
      r.suspected_disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.animal_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCallbacks = callbacks.filter(
    (cb) =>
      cb.farmer_phone.includes(searchQuery) ||
      cb.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cb.animal_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {actionSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            border: '1.5px solid #52b788',
          }}
        >
          <CheckCircle2 size={18} color="#52b788" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Top Banner (Website Forest Green Theme) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
              <Phone size={13} color="#95d5b2" />
              <span>TOLL-FREE 1800-120-JEEV RURAL VOICE INTAKE DESK</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.3rem, 2.8vw, 1.7rem)', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
              Veterinary IVR & Tele-Consultation Console
            </h2>

            <p style={{ fontSize: '0.84rem', color: '#d8f3dc', maxWidth: '680px', lineHeight: 1.5 }}>
              Real-time incoming voice disease reports from non-smartphone livestock owners, automated speech-to-text transcripts, AI diagnostic triage, and priority callback queues.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onOpenPhoneSimulator && (
              <button
                type="button"
                onClick={() => onOpenPhoneSimulator()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#52b788',
                  color: '#1b4332',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(82, 183, 136, 0.3)',
                }}
              >
                <PhoneCall size={16} />
                <span>Launch IVR Simulator</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
              }}
              title="Refresh Queue"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Counters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '22px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.74rem', color: '#d8f3dc', display: 'block', fontWeight: 600 }}>Total Voice Reports</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2 }}>{reports.length}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.74rem', color: '#fde68a', display: 'block', fontWeight: 600 }}>Pending Callbacks</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fde68a', lineHeight: 1.2 }}>
              {callbacks.filter((c) => c.status === 'pending').length}
            </span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.74rem', color: '#fecdd3', display: 'block', fontWeight: 600 }}>1962 SOS Dispatches</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fecdd3', lineHeight: 1.2 }}>{emergencies.length}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: '0.74rem', color: '#95d5b2', display: 'block', fontWeight: 600 }}>Avg Triage Speed</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#95d5b2', lineHeight: 1.2 }}>&lt; 3 mins</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'reports' ? 800 : 600,
              background: activeTab === 'reports' ? '#2d6a4f' : '#ffffff',
              color: activeTab === 'reports' ? '#ffffff' : 'var(--text-main)',
              border: activeTab === 'reports' ? '1.5px solid #2d6a4f' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              boxShadow: activeTab === 'reports' ? '0 4px 12px rgba(45, 106, 79, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Mic size={14} color={activeTab === 'reports' ? '#95d5b2' : '#52796f'} />
            <span>Voice Disease Reports ({reports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('callbacks')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'callbacks' ? 800 : 600,
              background: activeTab === 'callbacks' ? '#2d6a4f' : '#ffffff',
              color: activeTab === 'callbacks' ? '#ffffff' : 'var(--text-main)',
              border: activeTab === 'callbacks' ? '1.5px solid #2d6a4f' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              boxShadow: activeTab === 'callbacks' ? '0 4px 12px rgba(45, 106, 79, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <PhoneCall size={14} color={activeTab === 'callbacks' ? '#95d5b2' : '#52796f'} />
            <span>Doctor Callbacks ({callbacks.filter((c) => c.status === 'pending').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergencies')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'emergencies' ? 800 : 600,
              background: activeTab === 'emergencies' ? '#dc2626' : '#ffffff',
              color: activeTab === 'emergencies' ? '#ffffff' : 'var(--text-main)',
              border: activeTab === 'emergencies' ? '1.5px solid #dc2626' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              boxShadow: activeTab === 'emergencies' ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <AlertTriangle size={14} color={activeTab === 'emergencies' ? '#ffffff' : '#dc2626'} />
            <span>1962 SOS Dispatches ({emergencies.length})</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Case ID, phone, disease..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.8rem', height: '36px' }}
          />
        </div>
      </div>

      {/* TAB 1: Voice Disease Reports */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredReports.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <FileAudio size={42} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                No IVR Voice Reports
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Voice reports submitted by farmers calling 1800-120-JEEV will show up here automatically in real time.
              </p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="glass-card"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Top Case Badge & Metadata Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-hover)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--primary-border)',
                        }}
                      >
                        {report.case_id}
                      </span>

                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          background:
                            report.risk_level === 'critical'
                              ? '#fef2f2'
                              : report.risk_level === 'urgent'
                              ? '#fffbeb'
                              : '#f0fdf4',
                          color:
                            report.risk_level === 'critical'
                              ? '#dc2626'
                              : report.risk_level === 'urgent'
                              ? '#d97706'
                              : '#16a34a',
                          border: `1px solid ${
                            report.risk_level === 'critical'
                              ? '#fecaca'
                              : report.risk_level === 'urgent'
                              ? '#fde68a'
                              : '#bbf7d0'
                          }`,
                        }}
                      >
                        {report.risk_level} Priority
                      </span>

                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} />
                        {new Date(report.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {report.status === 'pending_review' ? (
                        <button
                          type="button"
                          onClick={() => handleAcceptReport(report.id)}
                          className="btn-primary"
                          style={{
                            fontSize: '0.78rem',
                            padding: '6px 14px',
                            borderRadius: '20px',
                          }}
                        >
                          Accept Case
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#166534',
                            background: '#dcfce7',
                            padding: '5px 12px',
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            border: '1px solid #86efac',
                          }}
                        >
                          <CheckCircle2 size={14} /> Under Clinical Care
                        </span>
                      )}

                      <a
                        href={`tel:${report.farmer_phone}`}
                        className="btn-secondary"
                        style={{
                          width: '34px',
                          height: '34px',
                          padding: 0,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Direct Dial Farmer"
                      >
                        <Phone size={14} color="#2d6a4f" />
                      </a>
                    </div>
                  </div>

                  {/* Caller & Location Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontWeight: 600 }}>
                      <User size={15} color="var(--primary)" />
                      <span>{report.farmer_name || 'Shri Babanrao Babar'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 600 }}>
                      <Phone size={15} color="var(--primary)" />
                      <span>{report.farmer_phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <MapPin size={15} color="var(--primary)" />
                      <span>{report.village}, {report.taluka}</span>
                    </div>
                  </div>

                  {/* Vernacular Voice Audio & Transcript Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mic size={14} color="var(--primary)" />
                        Farmer Vernacular Voice Recording & STT Transcript:
                      </span>

                      <button
                        type="button"
                        onClick={() => handlePlayVoice(report.id, report.transcript || '')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: playingAudioId === report.id ? '#dc2626' : '#2d6a4f',
                          color: '#ffffff',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {playingAudioId === report.id ? (
                          <>
                            <Pause size={12} />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} />
                            <span>Play Audio</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p
                      style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.6,
                        fontStyle: 'italic',
                        background: '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        margin: 0,
                      }}
                    >
                      &quot;{report.transcript || 'जनावराची लक्षणे फोनवर सांगितली.'}&quot;
                    </p>
                  </div>

                  {/* AI Diagnosis and Action Recommendations */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Sparkles size={15} color="#059669" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#065f46' }}>
                          AI Triaged Disease: {report.suspected_disease}
                        </span>
                        <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', border: '1px solid #86efac' }}>
                          {report.ai_confidence_score}% Confidence
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#047857', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {report.recommended_actions?.slice(0, 2).map((act, i) => (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                            • {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Doctor Callbacks */}
      {activeTab === 'callbacks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredCallbacks.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <PhoneCall size={42} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                No Pending Callbacks
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Farmers who press Option 3 on the IVR to speak with a vet will appear in this queue.
              </p>
            </div>
          ) : (
            filteredCallbacks.map((cb) => (
              <div
                key={cb.id}
                className="glass-card"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--text-main)' }}>{cb.farmer_name}</span>
                    <span style={{ fontSize: '0.76rem', fontFamily: 'monospace', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #86efac', fontWeight: 700 }}>
                      {cb.farmer_phone}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: cb.priority === 'urgent' ? '#fef3c7' : '#dcfce7',
                        color: cb.priority === 'urgent' ? '#92400e' : '#166534',
                      }}
                    >
                      {cb.priority}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', margin: 0 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reason: </span>
                    {cb.reason}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--primary)" />
                      {cb.village}, {cb.taluka}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {new Date(cb.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {cb.status === 'pending' ? (
                    <>
                      <a
                        href={`tel:${cb.farmer_phone}`}
                        onClick={() => handleCompleteCallback(cb.id)}
                        className="btn-primary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <PhoneCall size={14} />
                        <span>Call Farmer Now</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCompleteCallback(cb.id)}
                        className="btn-secondary"
                        style={{
                          fontSize: '0.78rem',
                          padding: '8px 14px',
                          borderRadius: '20px',
                        }}
                      >
                        Mark Completed
                      </button>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#166534',
                        background: '#dcfce7',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <CheckCircle2 size={14} /> Resolved
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: 1962 SOS Dispatches */}
      {activeTab === 'emergencies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {emergencies.length === 0 ? (
            <div className="glass-card" style={{ padding: '48px 20px', textAlign: 'center' }}>
              <AlertTriangle size={42} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
                No Active 1962 SOS Cases
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Emergency calls made via Toll-Free IVR option 4 appear here immediately with ambulance tracking.
              </p>
            </div>
          ) : (
            emergencies.map((emg) => (
              <div
                key={emg.id}
                className="glass-card"
                style={{
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                  border: '1.5px solid #fecdd3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        background: '#dc2626',
                        color: '#ffffff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {emg.emergency_code}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
                      CRITICAL DISPATCH
                    </span>
                    <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>
                      {emg.farmer_phone}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: '#881337', fontWeight: 600, margin: 0 }}>
                    Animal: <span style={{ fontWeight: 800 }}>{emg.animal_type}</span> • Description: {emg.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.76rem', color: '#9f1239' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <MapPin size={13} color="#dc2626" />
                      {emg.village}, {emg.taluka}
                    </span>
                    <span>•</span>
                    <span style={{ fontWeight: 700 }}>
                      Ambulance: {emg.dispatched_unit} (ETA {emg.eta_minutes} mins)
                    </span>
                  </div>
                </div>

                <div>
                  <a
                    href={`tel:${emg.farmer_phone}`}
                    className="btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      fontSize: '0.78rem',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Phone size={14} />
                    <span>Contact Farmer</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
