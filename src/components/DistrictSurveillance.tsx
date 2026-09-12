'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  OutbreakEvent,
  AdministrativeLocation,
  HealthReportWithDetails,
  DiseaseCatalogItem,
} from '@/types/database';
import {
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Users,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  Radio,
  FileSpreadsheet,
  Megaphone,
  Truck,
  Syringe,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';

interface DistrictSurveillanceProps {
  onSelectCase?: (caseId: string) => void;
  onOpenReport?: () => void;
}

export const DistrictSurveillance: React.FC<DistrictSurveillanceProps> = ({
  onSelectCase,
  onOpenReport,
}) => {
  const { t, language } = useLanguage();
  const [outbreaks, setOutbreaks] = useState<OutbreakEvent[]>([]);
  const [locations, setLocations] = useState<AdministrativeLocation[]>([]);
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCatalogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'map' | 'containment'>('overview');
  const [selectedBlock, setSelectedBlock] = useState<string>('Shirur');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Containment checklist state (interactive)
  const [containmentChecklist, setContainmentChecklist] = useState<{ [key: string]: boolean }>({
    quarantine: true,
    ringVaccine: true,
    marketRestriction: true,
    biosecurity: false,
    carcassDisposal: true,
    veterinaryRRT: false,
  });

  useEffect(() => {
    dataService.getOutbreaks().then(setOutbreaks);
    dataService.getLocations().then(setLocations);
    dataService.getHealthReports().then(setReports);
    dataService.getDiseases().then(setDiseases);
  }, []);

  const totalAffectedAnimals = outbreaks.reduce((acc, o) => acc + o.affected_animals, 0) || 61;
  const totalAffectedHerds = outbreaks.reduce((acc, o) => acc + o.affected_herds, 0) || 16;
  const totalDeaths = outbreaks.reduce((acc, o) => acc + o.mortality_count, 0) || 3;

  const toggleChecklist = (key: string) => {
    setContainmentChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Block data for Pune District
  const blockStats = [
    {
      name: 'Shirur',
      risk: 'critical',
      cases: 47,
      herds: 11,
      deaths: 3,
      primaryThreat: 'Foot & Mouth Disease (FMD)',
      villages: ['Shirapur', 'Koregaon Bhima', 'Kavathe', 'Nimgaon Mhalungi'],
      status: 'Quarantine Zone Active (5km)',
    },
    {
      name: 'Baramati',
      risk: 'elevated',
      cases: 14,
      herds: 5,
      deaths: 0,
      primaryThreat: 'Lumpy Skin Disease (LSD)',
      villages: ['Malegaon', 'Songaon', 'Morgaon'],
      status: 'Ring Vaccination in Progress',
    },
    {
      name: 'Haveli',
      risk: 'medium',
      cases: 3,
      herds: 2,
      deaths: 0,
      primaryThreat: 'Bovine Respiratory (BRD)',
      villages: ['Wagholi', 'Loni Kalbhor', 'Uruli Kanchan'],
      status: 'Active Sentinel Surveillance',
    },
    {
      name: 'Khed',
      risk: 'stable',
      cases: 1,
      herds: 1,
      deaths: 0,
      primaryThreat: 'Routine monitoring',
      villages: ['Chakan', 'Rajgurunagar', 'Alandi'],
      status: 'All clear / Baseline',
    },
    {
      name: 'Ambegaon',
      risk: 'stable',
      cases: 0,
      herds: 0,
      deaths: 0,
      primaryThreat: 'None detected',
      villages: ['Manchar', 'Ghodegaon'],
      status: 'Normal baseline surveillance',
    },
  ];

  const currentBlockData = blockStats.find((b) => b.name === selectedBlock) || blockStats[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {actionSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '24px',
            background: 'var(--primary-deep)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--stable)" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* District Title Bar & Action Center */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(220, 38, 38, 0.1)',
                color: 'var(--critical)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Radio size={12} className="animate-pulse" />
              LIVE MONITORING
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Maharashtra Animal Disease Surveillance Cell (ADSC)
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Pune District Health Surveillance</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Real-time multi-tier outbreak tracking across 5 blocks and 14 gram panchayats
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => showNotification('District Advisory broadcast dispatched via SMS to 4,820 registered dairy farmers.')}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Megaphone size={15} color="var(--warning)" />
            <span>Broadcast Advisory</span>
          </button>
          <button
            onClick={() => showNotification('Surveillance CSV export compiled and downloaded for DAHO review.')}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <FileSpreadsheet size={15} color="var(--info)" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Epidemic Indicators */}
      <div className="surveillance-kpi-grid">
        {/* District Risk Status */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--critical)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.overallRisk}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--critical)' }}>
              Elevated / Red
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            FMD index case confirmed in Shirur block
          </p>
        </div>

        {/* Cumulative Cases */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.cumulativeCases}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalAffectedAnimals}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--critical)', fontWeight: 700 }}>
              +14 today
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {totalAffectedHerds} dairy herds
          </p>
        </div>

        {/* Mortality */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.mortalityThisWeek}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--critical)' }}>
              {totalDeaths}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>deaths</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            CFR: 4.9% (within expected range)
          </p>
        </div>

        {/* Vaccination Coverage */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.vaccinationCoverage}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>
              78.4%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({t.surveillance.target}: 90%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '3px',
              marginTop: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '78.4%',
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="horizontal-scroll-strip" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveSubTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'overview' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.districtStatus}
        </button>
        <button
          onClick={() => setActiveSubTab('map')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'map' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'map' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.geospatialRiskMap}
        </button>
        <button
          onClick={() => setActiveSubTab('containment')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'containment' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'containment' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.responseCenter}
        </button>
      </div>

      {/* TAB 1: DISTRICT OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Outbreak Alerts */}
          <div className="glass-card" style={{ background: '#fff', border: '1px solid #fecaca' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #fee2e2',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--critical-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--critical)',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--critical)' }}>
                    Active Outbreak Containment: Foot and Mouth Disease (FMD)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Location: Shirur Block • Declared: 08 Sep 2026 • Lead Vet: Dr. Sunita Patil (DAHO)
                  </p>
                </div>
              </div>
              <span className="badge-critical">QUARANTINE ZONE ENFORCED</span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '14px', lineHeight: 1.5 }}>
              Rapid transmission cluster detected across 11 dairy herds in Shirapur, Koregaon Bhima, and Kavathe.
              Clinical signs of mucosal vesicular lesions, drooling, high pyrexia, and drop in milk yield.
              Immediate bio-containment perimeter of 5 km has been established.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AFFECTED HERDS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>11 Herds</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AFFECTED ANIMALS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--critical)' }}>47 Cattle</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CASUALTIES</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>3 Calves</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>RING VACCINATIONS</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>850 Doses</div>
              </div>
            </div>
          </div>

          {/* Block-by-Block Surveillance Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
              Block Epidemiological Summary (Pune District)
            </h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: '580px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>Block</th>
                    <th style={{ padding: '10px 12px' }}>Risk Status</th>
                    <th style={{ padding: '10px 12px' }}>Active Cases</th>
                    <th style={{ padding: '10px 12px' }}>Herds Affected</th>
                    <th style={{ padding: '10px 12px' }}>Primary Pathogen</th>
                    <th style={{ padding: '10px 12px' }}>Action Protocol</th>
                  </tr>
                </thead>
                <tbody>
                  {blockStats.map((block) => (
                    <tr
                      key={block.name}
                      onClick={() => {
                        setSelectedBlock(block.name);
                        setActiveSubTab('map');
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {block.name}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          className={
                            block.risk === 'critical'
                              ? 'badge-critical'
                              : block.risk === 'elevated'
                              ? 'badge-warning'
                              : 'badge-stable'
                          }
                        >
                          {block.risk.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>
                        {block.cases}
                      </td>
                      <td style={{ padding: '12px' }}>{block.herds}</td>
                      <td style={{ padding: '12px', color: 'var(--text-main)' }}>
                        {block.primaryThreat}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {block.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEOSPATIAL RISK MAP */}
      {activeSubTab === 'map' && (
        <div className="surveillance-map-grid">
          {/* Map Representation Box */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Geospatial Heat Distribution</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Interactive epidemiological cluster map of Pune District
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                GPS Cluster Precision: 50m
              </span>
            </div>

            {/* Stylized Vector Map representation */}
            <div
              style={{
                height: '340px',
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Geographic Block Nodes */}
              {/* Shirur - Critical Hotspot */}
              <div
                onClick={() => setSelectedBlock('Shirur')}
                style={{
                  position: 'absolute',
                  top: '32%',
                  right: '25%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Shirur' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.15) 70%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--critical)',
                      border: '3px solid #fff',
                      boxShadow: '0 0 16px rgba(220, 38, 38, 0.8)',
                    }}
                  />
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(220,38,38,0.5)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  Shirur (47)
                </div>
              </div>

              {/* Baramati - Warning Hotspot */}
              <div
                onClick={() => setSelectedBlock('Baramati')}
                style={{
                  position: 'absolute',
                  bottom: '22%',
                  right: '35%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Baramati' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 8,
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.5) 0%, rgba(217, 119, 6, 0.1) 70%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--warning)',
                      border: '2px solid #fff',
                    }}
                  />
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(217,119,6,0.5)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  Baramati (14)
                </div>
              </div>

              {/* Haveli - Medium Node */}
              <div
                onClick={() => setSelectedBlock('Haveli')}
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '38%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Haveli' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 7,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--info)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(37,99,235,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  Haveli (3)
                </div>
              </div>

              {/* Khed - Stable Node */}
              <div
                onClick={() => setSelectedBlock('Khed')}
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '26%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Khed' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 6,
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--stable)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16,185,129,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  Khed (1)
                </div>
              </div>

              {/* Ambegaon - Stable Node */}
              <div
                onClick={() => setSelectedBlock('Ambegaon')}
                style={{
                  position: 'absolute',
                  top: '12%',
                  left: '42%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Ambegaon' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--stable)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16,185,129,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  Ambegaon (0)
                </div>
              </div>

              {/* Map Legend */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: '12px',
                  fontSize: '0.68rem',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--critical)' }} />
                  Critical &gt; 20
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                  Elevated 5-20
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stable)' }} />
                  Baseline 0-4
                </span>
              </div>
            </div>
          </div>

          {/* Selected Block Drill-down Pane */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  Selected Jurisdiction
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{currentBlockData.name} Block</h3>
              </div>
              <span
                className={
                  currentBlockData.risk === 'critical'
                    ? 'badge-critical'
                    : currentBlockData.risk === 'elevated'
                    ? 'badge-warning'
                    : 'badge-stable'
                }
              >
                {currentBlockData.risk.toUpperCase()}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ACTIVE CASES</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentBlockData.cases}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AFFECTED HERDS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentBlockData.herds}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Primary Pathogen / Threat
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--critical)', fontWeight: 600 }}>
                {currentBlockData.primaryThreat}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Monitored Gram Panchayats / Villages
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentBlockData.villages.map((v) => (
                  <span
                    key={v}
                    style={{
                      background: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    📍 {v}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Status: {currentBlockData.status}
              </div>
              <button
                onClick={() => setActiveSubTab('containment')}
                className="btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '10px' }}
              >
                Open Containment Action Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTAINMENT ACTION CENTER */}
      {activeSubTab === 'containment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  Active Containment Protocols & Standard Operating Procedures (SOP)
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Mandated containment actions under the Prevention and Control of Infectious & Contagious Diseases in Animals Act
                </p>
              </div>
              <span className="badge-critical">LEVEL-3 INCIDENT</span>
            </div>

            {/* Checklist of Protocols */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  key: 'quarantine',
                  title: '5km Quarantine Perimeter Declaration',
                  desc: 'All livestock movement in and out of Shirapur-Koregaon zone stopped by local law enforcement.',
                  status: containmentChecklist.quarantine,
                },
                {
                  key: 'ringVaccine',
                  title: 'Ring Vaccination Protocol (850 doses)',
                  desc: 'Inoculation of healthy cattle in surrounding 5km-10km buffer villages underway by 4 mobile veterinary units.',
                  status: containmentChecklist.ringVaccine,
                },
                {
                  key: 'marketRestriction',
                  title: 'Livestock Weekly Market & Cattle Haat Suspension',
                  desc: 'Official notification dispatched to Shirur APMC and taluka administration.',
                  status: containmentChecklist.marketRestriction,
                },
                {
                  key: 'biosecurity',
                  title: 'Disinfection & Lime Foot-baths at Farm Entrances',
                  desc: 'Sodium hypochlorite and slaked lime distribution to 64 affected and neighboring sheds.',
                  status: containmentChecklist.biosecurity,
                },
                {
                  key: 'carcassDisposal',
                  title: 'Sanitary Deep Burial for Deceased Animals',
                  desc: 'Strict protocol with quicklime layer (min 2 meters depth) enforced to prevent groundwater contamination.',
                  status: containmentChecklist.carcassDisposal,
                },
                {
                  key: 'veterinaryRRT',
                  title: 'State Rapid Response Team (RRT) Deployment',
                  desc: 'Escalated to Commissionerate of Animal Husbandry, Pune for additional clinical personnel.',
                  status: containmentChecklist.veterinaryRRT,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: item.status ? 'rgba(5, 150, 105, 0.04)' : '#fff',
                    border: `1px solid ${item.status ? 'var(--primary-border)' : 'var(--border-card)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: `2px solid ${item.status ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: item.status ? 'var(--primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginTop: '2px',
                    }}
                  >
                    {item.status && <CheckCircle2 size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: item.status ? 'var(--stable-bg)' : '#f1f5f9',
                          color: item.status ? 'var(--stable)' : 'var(--text-muted)',
                        }}
                      >
                        {item.status ? 'ENFORCED' : 'PENDING ACTION'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit update action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() => showNotification('Containment log updated and transmitted to State Veterinary Directorate.')}
                className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
              >
                <CheckCircle2 size={16} />
                <span>Save SOP Log to Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
