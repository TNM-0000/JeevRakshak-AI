'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  OutbreakEvent,
  AdministrativeLocation,
  DiseaseCatalogItem,
  EmergencyCaseRecord,
  ResourceAllocationRecord,
  VaccinationCampaignRecord,
} from '@/types/database';
import {
  Building2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
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
  TrendingUp,
  MapPin,
  Compass,
  Download,
  Printer,
  Sparkles,
  CloudRain,
  PhoneCall,
  UserCheck,
  Server,
  Database,
  Lock,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  BadgeAlert,
  Check,
  Plus,
  Stethoscope,
} from 'lucide-react';

export type GovModuleTab =
  | 'overview'
  | 'surveillance'
  | 'outbreaks'
  | 'ai_prediction'
  | 'vaccination'
  | 'resources'
  | 'emergency'
  | 'vet_monitoring'
  | 'farmer_monitoring'
  | 'census'
  | 'gis_heatmap'
  | 'alerts_broadcast'
  | 'awareness'
  | 'complaints'
  | 'reports'
  | 'user_management'
  | 'system_admin';

interface GovernmentOfficialDashboardProps {
  onSelectCase?: (caseId: string) => void;
  onOpenReport?: () => void;
}

export const GovernmentOfficialDashboard: React.FC<GovernmentOfficialDashboardProps> = ({
  onSelectCase,
  onOpenReport,
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<GovModuleTab>('overview');

  // Interactive filters
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  // Data states
  const [outbreaks, setOutbreaks] = useState<OutbreakEvent[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCatalogItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Containment Protocol checklist state
  const [containmentChecklist, setContainmentChecklist] = useState<{ [key: string]: boolean }>({
    quarantineRing: true,
    ringVaccination: true,
    cattleMarketClosure: true,
    movementCheckpost: true,
    biosecurityDisinfection: true,
    rapidResponseDeployed: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    dataService.getOutbreaks(language).then(setOutbreaks);
    dataService.getDiseases(language).then(setDiseases);
  }, [language]);

  // Government Official Key KPI Totals (Executive Dashboard)
  const stats = useMemo(() => {
    return {
      totalFarmers: '48,920',
      totalVets: '342',
      totalAnimals: '3,84,190',
      reportedCases: '1,248',
      activeOutbreaks: outbreaks.filter((o) => o.status === 'active').length || 2,
      vaccinatedAnimals: '3,12,850',
      pendingCases: '47',
      recoveredAnimals: '1,162',
      diseaseAlerts: '6',
      emergencyCases: '14',
      districtsCovered: '36',
      villagesCovered: '1,840',
      vaccinationCoveragePct: 81.4,
    };
  }, [outbreaks]);

  // 18 Modules Tabs configuration
  const navHubs: { id: GovModuleTab; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'overview', label: language === 'mr' ? 'कमांड केंद्र' : language === 'hi' ? 'कमांड केंद्र' : 'Executive Command', icon: Building2 },
    { id: 'surveillance', label: language === 'mr' ? 'रोग पाळत केंद्र' : language === 'hi' ? 'रोग निगरानी केंद्र' : 'Disease Surveillance', icon: Activity, badge: 'Live' },
    { id: 'outbreaks', label: language === 'mr' ? 'प्रकोप व्यवस्थापन' : language === 'hi' ? 'प्रकोप प्रबंधन' : 'Outbreak Management', icon: ShieldAlert, badge: `${stats.activeOutbreaks}` },
    { id: 'ai_prediction', label: language === 'mr' ? 'एआय अंदाज केंद्र' : language === 'hi' ? 'एआई पूर्वानुमान' : 'AI Predictions', icon: Sparkles },
    { id: 'gis_heatmap', label: language === 'mr' ? 'जीआयएस उष्णता नकाशा' : language === 'hi' ? 'जीआईएस हीटमैप' : 'GIS Disease Heatmap', icon: MapPin },
    { id: 'vaccination', label: language === 'mr' ? 'राष्ट्रीय लसीकरण पोर्टल' : language === 'hi' ? 'टीकाकरण प्रबंधन' : 'Vaccination Hub', icon: Syringe },
    { id: 'resources', label: language === 'mr' ? 'संसाधन वाटप' : language === 'hi' ? 'संसाधन आवंटन' : 'Resource Allocation', icon: Truck },
    { id: 'emergency', label: language === 'mr' ? 'आणीबाणी १९६२ डॅशबोर्ड' : language === 'hi' ? 'आपातकालीन प्रतिक्रिया' : 'Emergency 1962 SOS', icon: AlertTriangle, badge: '14' },
    { id: 'vet_monitoring', label: language === 'mr' ? 'पशुवैद्यक निरीक्षण' : language === 'hi' ? 'पशु चिकित्सक निगरानी' : 'Veterinary Monitoring', icon: Stethoscope },
    { id: 'farmer_monitoring', label: language === 'mr' ? 'शेतकरी सहभाग पोर्टल' : language === 'hi' ? 'किसान निगरानी' : 'Farmer Monitoring', icon: Users },
    { id: 'census', label: language === 'mr' ? 'पशुधन जनगणना' : language === 'hi' ? 'पशुधन जनगणना' : 'Livestock Census', icon: Layers },
    { id: 'alerts_broadcast', label: language === 'mr' ? 'सूचना प्रसारण' : language === 'hi' ? 'चेतावनी प्रसारण' : 'Alerts Broadcast', icon: Radio },
    { id: 'awareness', label: language === 'mr' ? 'शेतकरी जनजागृती' : language === 'hi' ? 'जागरूकता अभियान' : 'Awareness Campaigns', icon: Megaphone },
    { id: 'complaints', label: language === 'mr' ? 'तक्रार निवारण' : language === 'hi' ? 'शिकायत निवारण' : 'Complaint Redressal', icon: MessageSquare },
    { id: 'reports', label: language === 'mr' ? 'शासकीय अहवाल' : language === 'hi' ? 'रिपोर्ट्स एवं विश्लेषण' : 'Reports & Analytics', icon: Download },
    { id: 'user_management', label: language === 'mr' ? 'वापरकर्ता व्यवस्थापन' : language === 'hi' ? 'उपयोगकर्ता प्रबंधन' : 'User Management', icon: UserCheck },
    { id: 'system_admin', label: language === 'mr' ? 'प्रणाली प्रशासन' : language === 'hi' ? 'सिस्टम प्रशासन' : 'System Administration', icon: Server },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Feedback */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
        </div>
      )}

      {/* National Government Official Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
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
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
              <Shield size={14} color="#95d5b2" />
              <span>
                {language === 'mr'
                  ? 'महाराष्ट्र शासन • पशुसंवर्धन विभाग • राज्यस्तरीय नियंत्रण कक्ष'
                  : 'GOVERNMENT OF MAHARASHTRA • DEPARTMENT OF ANIMAL HUSBANDRY • STATE COMMAND CENTER'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.85rem)', fontWeight: 800, margin: '4px 0 6px', color: '#ffffff' }}>
              {language === 'mr' ? 'पुणे विभाग राष्ट्रीय पशुधन रोग पाळत प्रणाली' : 'National Livestock Disease Surveillance & Epidemic Command'}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: '#d8f3dc' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <MapPin size={14} /> Pune Division (Jurisdiction: 14 Talukas, 1,840 Villages)
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <UserCheck size={14} /> Authorized Officer: Rajesh Patil, DAHO Pune
              </span>
              <span>•</span>
              <span style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)' }}>
                SURVEILLANCE LEVEL: HIGH
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => showToast('Dispatched High-Priority Advisory SMS to 48,920 farmers in Shirur & Baramati.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#e63946',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontSize: '0.84rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(230, 57, 70, 0.4)',
              }}
            >
              <Radio size={16} />
              <span>{language === 'mr' ? 'तातडीचे अलर्ट प्रक्षेपण' : 'Broadcast Flash Alert'}</span>
            </button>

            <button
              type="button"
              onClick={() => showToast('Generating official Ministerial Dossier (PDF/Excel)... Download ready.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              <Download size={15} />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* 18 Modules Navigation Pill Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
        }}
      >
        {navHubs.map((hub) => {
          const Icon = hub.icon;
          const isActive = activeTab === hub.id;
          return (
            <button
              key={hub.id}
              type="button"
              onClick={() => setActiveTab(hub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? '#2d6a4f' : '#ffffff',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: isActive ? '1.5px solid #2d6a4f' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 4px 12px rgba(45, 106, 79, 0.25)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} color={isActive ? '#95d5b2' : '#52796f'} />
              <span>{hub.label}</span>
              {hub.badge && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#fee2e2',
                    color: isActive ? '#ffffff' : '#dc2626',
                  }}
                >
                  {hub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODULE 1 & 2: EXECUTIVE COMMAND HOME                                      */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 12 Key Official Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { title: 'Registered Farmers', val: stats.totalFarmers, icon: Users, color: '#2d6a4f', bg: '#f0fdf4' },
              { title: 'Registered Veterinarians', val: stats.totalVets, icon: Stethoscope, color: '#0284c7', bg: '#f0f9ff' },
              { title: 'Total Livestock Registered', val: stats.totalAnimals, icon: Layers, color: '#059669', bg: '#ecfdf5' },
              { title: 'Reported Field Cases', val: stats.reportedCases, icon: Activity, color: '#f59e0b', bg: '#fffbeb' },
              { title: 'Active Outbreak Epicenters', val: stats.activeOutbreaks, icon: ShieldAlert, color: '#dc2626', bg: '#fef2f2' },
              { title: 'Vaccinated Animals', val: stats.vaccinatedAnimals, icon: Syringe, color: '#10b981', bg: '#ecfdf5' },
              { title: 'Pending Case Reviews', val: stats.pendingCases, icon: Clock, color: '#d97706', bg: '#fffbeb' },
              { title: 'Cured & Recovered', val: stats.recoveredAnimals, icon: CheckCircle2, color: '#166534', bg: '#f0fdf4' },
              { title: 'Active Disease Alerts', val: stats.diseaseAlerts, icon: BadgeAlert, color: '#e11d48', bg: '#fff1f2' },
              { title: '1962 Emergency Cases', val: stats.emergencyCases, icon: AlertTriangle, color: '#b91c1c', bg: '#fef2f2' },
              { title: 'Districts Monitored', val: stats.districtsCovered, icon: MapPin, color: '#4f46e5', bg: '#eef2ff' },
              { title: 'Villages Connected', val: stats.villagesCovered, icon: Compass, color: '#0891b2', bg: '#ecfeff' },
            ].map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.color}35`,
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '94px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>{c.title}</span>
                    <Icon size={16} color={c.color} />
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                    {c.val}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Outbreak Containment Protocol Status Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
              border: '1.5px solid #fca5a5',
              borderRadius: '14px',
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="#dc2626" />
                  <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#991b1b' }}>
                    Active Containment Ring: Foot & Mouth Disease (FMD) — Shirur Taluka (5km Zone)
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#b91c1c', margin: '3px 0 0' }}>
                  Epicenter: Shirapur Village (Lat: 18.8120° N, Lng: 74.3910° E) • 47 Cattle in Quarantine • Zero Mortalities in last 24h
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('outbreaks')}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Inspect Containment Protocols
              </button>
            </div>

            {/* Quick checklist pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: '5km Quarantine Ring Enforced', active: true },
                { label: 'Ring Vaccination (10,000 Doses Active)', active: true },
                { label: 'Animal Market Ban (APMC Shirur)', active: true },
                { label: 'RRT Mobile Van #1962 Deployed', active: true },
              ].map((pill, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    background: '#fff',
                    border: '1px solid #f87171',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Check size={12} color="#dc2626" strokeWidth={3} />
                  <span>{pill.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Surveillance Feed & Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {/* Chart 1: Disease Distribution */}
            <div className="card-glass" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} color="#0284c7" />
                <span>Pan-District Pathogen Distribution (Current Month)</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Foot & Mouth Disease (FMD)', cases: 47, pct: 45, color: '#dc2626' },
                  { name: 'Lumpy Skin Disease (LSD)', cases: 28, pct: 27, color: '#f59e0b' },
                  { name: 'Clinical Mastitis', cases: 18, pct: 17, color: '#0284c7' },
                  { name: 'Haemorrhagic Septicaemia (HS)', cases: 7, pct: 7, color: '#8b5cf6' },
                  { name: 'Black Quarter (BQ)', cases: 4, pct: 4, color: '#10b981' },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</span>
                      <span style={{ fontWeight: 700, color: item.color }}>{item.cases} cases ({item.pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Species Population & Health Status */}
            <div className="card-glass" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} color="#166534" />
                <span>Species-Wise Livestock Census in Division</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { species: 'Cattle (Cow / Bull)', count: '2,14,500', healthy: '98.8%', color: '#2d6a4f' },
                  { species: 'Buffalo', count: '1,02,300', healthy: '99.1%', color: '#1b4332' },
                  { species: 'Goat & Sheep', count: '54,200', healthy: '99.4%', color: '#52b788' },
                  { species: 'Poultry & Others', count: '13,190', healthy: '99.6%', color: '#0284c7' },
                ].map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-main)' }}>{s.species}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Registered Population: {s.count}</div>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      {s.healthy} Healthy
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 3: DISEASE SURVEILLANCE CENTER                                     */}
      {/* ========================================================================= */}
      {activeTab === 'surveillance' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Pan-District Disease Surveillance Center
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Real-time spatial monitoring of active pathogen transmission across talukas and village clusters
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => showToast('Surveillance radar refreshed with latest field telemetric reports.')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Activity size={14} />
                <span>Live Refresh</span>
              </button>
            </div>
          </div>

          {/* Taluka surveillance table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Taluka / Block</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Risk Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Active Cases</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Herds Affected</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Primary Threat</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Containment Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { taluka: 'Shirur', risk: 'Critical', cases: 47, herds: 11, threat: 'Foot & Mouth Disease (FMD)', action: '5km Quarantine Zone Active', color: '#dc2626' },
                  { taluka: 'Baramati', risk: 'Elevated', cases: 14, herds: 4, threat: 'Clinical Mastitis', action: 'Polyclinic RRT Deployed', color: '#f59e0b' },
                  { taluka: 'Haveli', risk: 'Low', cases: 5, herds: 2, threat: 'Lumpy Skin (Isolated)', action: 'Booster Drive in Progress', color: '#10b981' },
                  { taluka: 'Daund', risk: 'Low', cases: 3, herds: 1, threat: 'Bovine Babesiosis', action: 'Acaricide Dipping Advisory', color: '#10b981' },
                  { taluka: 'Khed', risk: 'Moderate', cases: 9, herds: 3, threat: 'Black Quarter (BQ)', action: 'Antibiotic Buffer Stock Dispatched', color: '#3b82f6' },
                  { taluka: 'Junnar', risk: 'Low', cases: 2, herds: 1, threat: 'Nutritional Deficiency', action: 'Mineral Mixture Distributed', color: '#10b981' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 800 }}>{row.taluka}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: `${row.color}18`, color: row.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '0.72rem' }}>
                        {row.risk.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{row.cases}</td>
                    <td style={{ padding: '12px' }}>{row.herds}</td>
                    <td style={{ padding: '12px', color: 'var(--text-main)' }}>{row.threat}</td>
                    <td style={{ padding: '12px', color: '#166534', fontWeight: 600 }}>{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 4: OUTBREAK MANAGEMENT SYSTEM                                      */}
      {/* ========================================================================= */}
      {activeTab === 'outbreaks' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', margin: 0 }}>
                Outbreak Containment & Emergency Protocols
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Legal containment actions under Section 6 of Prevention and Control of Infectious Diseases in Animals Act
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fff', border: '1.5px solid #f87171', borderRadius: '12px', padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#991b1b' }}>
                  Protocol Checklist: FMD Containment — Shirapur Cluster (Pune)
                </span>
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 800 }}>
                  Active Enforcement
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {[
                  { key: 'quarantineRing', label: 'Enforce 5km Strict Quarantine Perimeter' },
                  { key: 'ringVaccination', label: 'Ring Vaccination of 10,000 Bovines in Buffer Zone' },
                  { key: 'cattleMarketClosure', label: 'Mandatory Closure of Live Cattle Markets (APMC)' },
                  { key: 'movementCheckpost', label: 'Fodder & Livestock Movement Highway Checkposts' },
                  { key: 'biosecurityDisinfection', label: 'Disinfection of Milk Vans with Sodium Carbonate 4%' },
                  { key: 'rapidResponseDeployed', label: 'Deploy Veterinary Rapid Response Team (RRT 1962)' },
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      setContainmentChecklist((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                      showToast(`Containment protocol "${item.label}" updated.`);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: containmentChecklist[item.key] ? '#ecfdf5' : '#f8fafc',
                      border: containmentChecklist[item.key] ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: containmentChecklist[item.key] ? '#166534' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: containmentChecklist[item.key] ? '#166534' : '#fff',
                        border: '1px solid #94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {containmentChecklist[item.key] && <Check size={13} color="#fff" strokeWidth={3} />}
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 5: AI PREDICTION CENTER                                            */}
      {/* ========================================================================= */}
      {activeTab === 'ai_prediction' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#0284c7" />
                <span>AI Outbreak Forecasting & Contagion Prediction Engine</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Multimodal machine learning model analyzing rainfall, humidity, livestock density, and clinical report velocity
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {[
              {
                region: 'Shirur - Khed Border',
                disease: 'Foot and Mouth Disease (FMD)',
                risk: '94% HIGH RISK',
                color: '#dc2626',
                factors: 'Rainfall 42mm, High Humidity (88%), Fodder Trade Movement',
                recommendation: 'Initiate preventive ring vaccination in adjacent 8 villages immediately.',
              },
              {
                region: 'Baramati Canal Belt',
                disease: 'Haemorrhagic Septicaemia (HS)',
                risk: '78% MODERATE RISK',
                color: '#f59e0b',
                factors: 'Waterlogging in grazing lands, low-lying pastures',
                recommendation: 'Pre-monsoon oil adjuvant HS vaccine booster drive recommended.',
              },
              {
                region: 'Purandar Taluka',
                disease: 'Peste des Petits Ruminants (PPR)',
                risk: '42% LOW RISK',
                color: '#10b981',
                factors: 'Controlled goat herds, high vaccination adherence (91%)',
                recommendation: 'Maintain routine surveillance and deworming schedule.',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${card.color}40`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.94rem' }}>{card.region}</span>
                  <span style={{ background: `${card.color}15`, color: card.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 800, fontSize: '0.72rem' }}>
                    {card.risk}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Target Threat: {card.disease}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <strong>Environmental Drivers:</strong> {card.factors}
                </div>
                <div style={{ fontSize: '0.76rem', background: '#f0fdf4', padding: '8px', borderRadius: '6px', color: '#166534', marginTop: '4px' }}>
                  <strong>AI Recommended Action:</strong> {card.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 6: VACCINATION HUB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'vaccination' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                National Livestock Vaccination Campaign Tracking (NADCP)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                District-wise target allocation, cold-chain temperature verification & missed animal follow-up
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {[
              { campaign: 'National FMD Control Programme (Phase 4)', target: '3,84,000', achieved: '3,12,850', pct: 81.4, color: '#166534' },
              { campaign: 'Lumpy Skin Disease Ring Immunization', target: '1,50,000', achieved: '1,38,000', pct: 92.0, color: '#0284c7' },
              { campaign: 'Brucellosis Calf-Hood Vaccination', target: '65,000', achieved: '48,200', pct: 74.1, color: '#f59e0b' },
              { campaign: 'PPR Eradication Drive (Goat/Sheep)', target: '55,000', achieved: '51,400', pct: 93.4, color: '#8b5cf6' },
            ].map((c, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {c.campaign}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Achieved: {c.achieved} / {c.target}</span>
                  <span style={{ fontWeight: 800, color: c.color }}>{c.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 7: RESOURCE ALLOCATION & MOBILE VANS                                */}
      {/* ========================================================================= */}
      {activeTab === 'resources' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, marginBottom: '6px' }}>
            Resource Allocation & Mobile Veterinary Clinic (1962) Tracking
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Fleet management of emergency mobile veterinary ambulances, cold-chain freezers and antibiotic inventories
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {[
              { resource: 'Mobile Veterinary Clinic Vans (1962)', deployed: 18, total: 20, status: 'Active Field Duty', color: '#166534' },
              { resource: 'FMD Trivalent Vaccine Vials (Doses)', deployed: '3,20,000', total: '4,00,000', status: 'Adequate Reserve', color: '#0284c7' },
              { resource: 'Emergency Ceftiofur Antibiotic Kits', deployed: '4,500', total: '5,000', status: 'Adequate Reserve', color: '#166534' },
              { resource: 'Liquid Nitrogen Semen / Vaccine Tanks', deployed: 42, total: 45, status: 'Cold-Chain Nominal', color: '#0284c7' },
            ].map((r, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)' }}>{r.resource}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1b4332', marginTop: '6px' }}>
                  {r.deployed} / {r.total}
                </div>
                <div style={{ fontSize: '0.72rem', color: r.color, fontWeight: 700, marginTop: '2px' }}>
                  ● {r.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE 11: GIS DISEASE HEATMAP                                            */}
      {/* ========================================================================= */}
      {activeTab === 'gis_heatmap' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Interactive GIS Disease Heatmap (Pan-India & Maharashtra View)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Spatial risk density mapping, quarantine boundaries, and active disease cluster centroids
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => showToast('Switched to High-Resolution Satellite View with NDVI Crop Overlay.')}
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Satellite Layer
              </button>
              <button
                type="button"
                onClick={() => showToast('Epidemiological Heatmap Density recalculated.')}
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Recalculate Heatmap
              </button>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1.5px solid var(--border)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            <iframe
              title="GIS Disease Surveillance Live Map"
              width="100%"
              height="380"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              src="https://maps.google.com/maps?q=18.8120,74.3910&t=&z=11&ie=UTF8&iwloc=&output=embed"
            />
            {/* Overlay Status Badge */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(6px)',
                padding: '8px 14px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                fontSize: '0.76rem',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 800, color: '#dc2626' }}>● RED ZONE: Shirur Cluster (FMD)</div>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Radius: 5.0 km • Buffer: 10.0 km</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OTHER MODULES: COMPLAINTS, AWARENESS, USER MANAGEMENT, SYSTEM ADMIN       */}
      {/* ========================================================================= */}
      {activeTab === 'complaints' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Farmer & Veterinarian Grievance Redressal Portal
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Official tracking of medicine shortages, doctor availability requests, and emergency escalation tickets
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'TKT-2026-881', from: 'Koregaon Bhima Dairy Co-op', issue: 'Shortage of intramammary mastitis tubes in local polyclinic', priority: 'High', status: 'Resolved' },
              { id: 'TKT-2026-882', from: 'Farmer Suresh Shinde', issue: 'Request for rapid response van inspection for lame cow', priority: 'Urgent', status: 'In Progress' },
              { id: 'TKT-2026-883', from: 'Taluka Polyclinic Baramati', issue: 'Request for 2,000 additional FMD vaccine doses for buffer ring', priority: 'High', status: 'Dispatched' },
            ].map((t) => (
              <div key={t.id} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{t.id}: {t.from}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.issue}</div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'user_management' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            User & Official RBAC Management
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Authorize veterinarians, verify MSVC licenses, and assign jurisdictional districts to officers
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Dr. Priya Kulkarni, B.V.Sc', role: 'Taluka Veterinary Officer', license: 'MSVC-18492', status: 'Verified & Active' },
              { name: 'Dr. Amit Deshmukh, M.V.Sc', role: 'Disease Monitoring Officer', license: 'MSVC-16210', status: 'Verified & Active' },
              { name: 'Shri Rajesh Patil', role: 'District Animal Husbandry Officer (DAHO)', license: 'GOVT-PUN-01', status: 'Super Admin' },
            ].map((u, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Role: {u.role} • Credential: {u.license}</div>
                </div>
                <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'system_admin' && (
        <div className="card-glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Platform Infrastructure & Database Health Monitoring
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            PostgreSQL Supabase connection latency, multilingual sync status, and automated backup logs
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>PostgreSQL Database</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginTop: '4px' }}>Connected (14ms)</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Multilingual Localization</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>EN • HI • MR Synced</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Audit Log Verification</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>100% Tamper-Proof</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
