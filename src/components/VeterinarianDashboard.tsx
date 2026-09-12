'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { HealthReportWithDetails, AnimalWithDetails } from '@/types/database';
import { formatDailyCaseNumber } from '@/lib/caseUtils';
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface VeterinarianDashboardProps {
  onOpenCases: () => void;
  onOpenSurveillance: () => void;
  onOpenReport: () => void;
}

export const VeterinarianDashboard: React.FC<VeterinarianDashboardProps> = ({
  onOpenCases,
  onOpenSurveillance,
  onOpenReport,
}) => {
  const { t, language } = useLanguage();
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [animals, setAnimals] = useState<AnimalWithDetails[]>([]);
  const [jurisdictionName, setJurisdictionName] = useState<string>('Shirur Block');

  useEffect(() => {
    dataService.getHealthReports().then(setReports);
    dataService.getAnimals().then(setAnimals);
  }, []);

  const pendingAssessments = reports.filter((r) => r.assessment?.status === 'suspected');
  const criticalCases = reports.filter(
    (r) => r.riskAssessment?.risk_level === 'critical' || r.mortality_count > 0
  );
  const underTreatment = animals.filter((a) => a.currentStatus === 'treatment').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Jurisdiction Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            <MapPin size={14} />
            <span>Jurisdiction Overview</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{jurisdictionName}</h2>
        </div>
        <button
          onClick={onOpenReport}
          className="btn-saffron"
          style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
        >
          Record Clinical Visit
        </button>
      </div>

      {/* Main Status Overview */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #edf6f2 0%, #fbf9f4 100%)',
          border: '1.5px solid var(--primary-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={16} strokeWidth={3} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
            Region Health Status
          </h3>
        </div>

        <div className="status-metric-grid">
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '12px 10px', border: '1px solid var(--border-card)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: 'var(--text-main)' }}>
              {pendingAssessments.length}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>Pending Assessments</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '12px 10px', border: '1px solid var(--border-card)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: criticalCases.length > 0 ? 'var(--critical)' : 'var(--text-main)' }}>
              {criticalCases.length}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>Critical Cases</div>
          </div>
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '12px 10px', border: '1px solid var(--border-card)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: 'var(--warning)' }}>
              {underTreatment}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>Under Treatment</div>
          </div>
        </div>
      </div>

      {/* Action Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
        {/* Outbreak Alert */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Outbreak Warning</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 hotspots identified</div>
            </div>
          </div>
          <button
            onClick={onOpenSurveillance}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            View Map
          </button>
        </div>

        {/* Triage Queue */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <ClipboardList size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>AI Triaged Cases</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires Vet Validation</div>
            </div>
          </div>
          <button
            onClick={onOpenCases}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {language === 'mr' ? 'केसेस यादी' : language === 'hi' ? 'केस कतार' : 'Cases Queue'}
          </button>
        </div>
      </div>

      {/* Recent High Priority Cases */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Urgent Cases</h3>
          <button
            onClick={onOpenCases}
            style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center' }}
          >
            See all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {criticalCases.slice(0, 3).map((report) => (
            <div key={report.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={18} strokeWidth={2.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatDailyCaseNumber(report, criticalCases, language)}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                    {report.mortality_count > 0 ? 'MORTALITY' : 'CRITICAL'}
                  </div>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {report.animal?.tag_number} • {report.animal?.species} • {report.symptoms.split(',')[0]}
                </div>
              </div>
            </div>
          ))}

          {criticalCases.length === 0 && (
            <div className="glass-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '4px' }}>No urgent cases currently</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All critical health events have been resolved.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
