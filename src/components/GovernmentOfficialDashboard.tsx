'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Users,
  Layers,
  Search,
  ArrowRight,
  Radio,
  Truck,
  Syringe,
  ChevronRight,
  TrendingUp,
  MapPin,
  Download,
  Printer,
  Sparkles,
  PhoneCall,
  UserCheck,
  Server,
  Settings as SettingsIcon,
  Calendar,
  Clock,
  ExternalLink,
  MessageSquare,
  BadgeAlert,
  Check,
  Plus,
  Stethoscope,
  Building2,
  FileText,
  Filter,
  Eye,
  Lock,
  Globe,
  Bell,
  RefreshCw,
} from 'lucide-react';
import {
  downloadMonthlyEpidemiologicalBulletinPDF,
  downloadNADCPVaccinationLogExcel,
  download1962EmergencyAuditPDF,
  downloadLivestockCensusRegistryExcel,
} from '@/lib/exportUtils';

export type GovCleanModule =
  | 'dashboard'
  | 'disease'
  | 'vaccination'
  | 'emergency'
  | 'resources'
  | 'reports'
  | 'users'
  | 'settings';

interface GovernmentOfficialDashboardProps {
  activeModule?: GovCleanModule;
  onSelectModule?: (mod: GovCleanModule) => void;
  onSelectCase?: (caseId: string) => void;
  onOpenReport?: () => void;
}

export const GovernmentOfficialDashboard: React.FC<GovernmentOfficialDashboardProps> = ({
  activeModule: controlledModule,
  onSelectModule,
  onSelectCase,
  onOpenReport,
}) => {
  const { language } = useLanguage();
  const [internalModule, setInternalModule] = useState<GovCleanModule>('dashboard');
  const activeModule = controlledModule || internalModule;

  const setActiveModule = (mod: GovCleanModule) => {
    if (onSelectModule) {
      onSelectModule(mod);
    } else {
      setInternalModule(mod);
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter states for detailed modules
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 8 Clean Modules Navigation
  const navItems: { id: GovCleanModule; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'dashboard', label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: Building2 },
    { id: 'disease', label: language === 'mr' ? 'रोग पाळत व नियंत्रण' : language === 'hi' ? 'रोग निगरानी' : 'Disease Monitoring', icon: Activity, badge: 'Active' },
    { id: 'vaccination', label: language === 'mr' ? 'लसीकरण' : language === 'hi' ? 'टीकाकरण' : 'Vaccination', icon: Syringe },
    { id: 'emergency', label: language === 'mr' ? 'आणीबाणी १९६२' : language === 'hi' ? 'आपातकालीन सेवा' : 'Emergency Response', icon: AlertTriangle, badge: '3' },
    { id: 'resources', label: language === 'mr' ? 'संसाधने' : language === 'hi' ? 'संसाधन' : 'Resources', icon: Truck },
    { id: 'reports', label: language === 'mr' ? 'अहवाल' : language === 'hi' ? 'रिपोर्ट्स' : 'Reports', icon: FileText },
    { id: 'users', label: language === 'mr' ? 'वापरकर्ते' : language === 'hi' ? 'उपयोगकर्ता' : 'User Management', icon: UserCheck },
    { id: 'settings', label: language === 'mr' ? 'सेटिंग्ज' : language === 'hi' ? 'सेटिंग्स' : 'Settings', icon: SettingsIcon },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#2D6A4F',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '16px',
            boxShadow: '0 12px 32px rgba(45, 106, 79, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.86rem',
            fontWeight: 700,
            border: '1px solid #52B788',
          }}
        >
          <CheckCircle2 size={18} color="#95D5B2" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Streamlined Government Navigation Bar (8 Clean Modules - Visible on mobile/tablet or as top quick-dock) */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '8px 12px',
          border: '1px solid rgba(82, 183, 136, 0.25)',
          boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveModule(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '16px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 800 : 600,
                background: isActive ? '#2D6A4F' : 'transparent',
                color: isActive ? '#FFFFFF' : '#52796F',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={16} color={isActive ? '#95D5B2' : '#52796F'} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: isActive ? 'rgba(255,255,255,0.25)' : '#FDE8E8',
                    color: isActive ? '#FFFFFF' : '#E63946',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. HOMEPAGE: CLEAN COMMAND CENTER                                         */}
      {/* ========================================================================= */}
      {activeModule === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* SECTION 1 – Welcome Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FFF9 100%)',
              border: '1px solid rgba(82, 183, 136, 0.25)',
              borderRadius: '24px',
              padding: '32px 36px',
              boxShadow: '0 4px 24px rgba(45, 106, 79, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: '680px', zIndex: 1 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(82, 183, 136, 0.15)',
                  color: '#2D6A4F',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  marginBottom: '12px',
                }}
              >
                <Shield size={13} />
                <span>OFFICIAL GOVERNMENT PORTAL</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 1.95rem)',
                  fontWeight: 800,
                  color: '#1B4332',
                  margin: '0 0 10px',
                  lineHeight: 1.25,
                }}
              >
                Government Command Center
              </h1>

              <p style={{ fontSize: '0.92rem', color: '#52796F', margin: 0, lineHeight: 1.55 }}>
                Monitor livestock health, disease outbreaks, vaccination programs, and emergency response activities across your assigned region.
              </p>
            </div>

            {/* Clean Illustration & Jurisdiction Badge Matching Farmer Portal Style */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', zIndex: 1 }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(82, 183, 136, 0.15) 0%, rgba(45, 106, 79, 0.22) 100%)',
                  border: '1.5px solid rgba(82, 183, 136, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2D6A4F',
                  boxShadow: '0 8px 24px rgba(45, 106, 79, 0.08)',
                }}
              >
                <svg width="44" height="44" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4L8 10V22C8 32.5 14.8 42.2 24 44C33.2 42.2 40 32.5 40 22V10L24 4Z" fill="#2D6A4F" fillOpacity="0.12" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 16V30" stroke="#2D6A4F" strokeWidth="2.8" strokeLinecap="round"/>
                  <path d="M17 23H31" stroke="#2D6A4F" strokeWidth="2.8" strokeLinecap="round"/>
                  <circle cx="34" cy="14" r="3" fill="#52B788"/>
                </svg>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#FFFFFF',
                  padding: '14px 20px',
                  borderRadius: '20px',
                  border: '1px solid rgba(82, 183, 136, 0.25)',
                  boxShadow: '0 4px 16px rgba(45, 106, 79, 0.05)',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    background: 'rgba(45, 106, 79, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2D6A4F',
                  }}
                >
                  <MapPin size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#52796F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jurisdiction Node</div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#1B4332' }}>Pune Division (14 Blocks)</div>
                  <div style={{ fontSize: '0.72rem', color: '#2ECC71', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2ECC71', display: 'inline-block' }} />
                    <span>Real-Time Surveillance Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 – Key Overview: Exactly 4 Clean, Large Summary Cards */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
              {/* Card 1: Active Outbreaks */}
              <div
                onClick={() => setActiveModule('disease')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(230, 57, 70, 0.25)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 20px rgba(230, 57, 70, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#52796F' }}>Active Outbreaks</span>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#FDE8E8', color: '#E63946', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={18} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#E63946', lineHeight: 1 }}>
                    2
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#52796F', marginTop: '6px' }}>
                    Shirur & Baramati containment zones
                  </div>
                </div>
              </div>

              {/* Card 2: Pending Investigations */}
              <div
                onClick={() => setActiveModule('disease')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(244, 162, 97, 0.25)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 20px rgba(244, 162, 97, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#52796F' }}>Pending Investigations</span>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#FEF3C7', color: '#F4A261', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#1B4332', lineHeight: 1 }}>
                    14
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#52796F', marginTop: '6px' }}>
                    Awaiting laboratory test confirmation
                  </div>
                </div>
              </div>

              {/* Card 3: Vaccination Progress */}
              <div
                onClick={() => setActiveModule('vaccination')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(82, 183, 136, 0.25)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#52796F' }}>Vaccination Progress</span>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#E8F5E9', color: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Syringe size={18} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#2D6A4F', lineHeight: 1 }}>
                    81.4%
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#52796F', marginTop: '6px' }}>
                    3,12,850 of 3,84,000 cattle covered
                  </div>
                </div>
              </div>

              {/* Card 4: Emergency Cases */}
              <div
                onClick={() => setActiveModule('emergency')}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(230, 57, 70, 0.25)',
                  borderRadius: '24px',
                  padding: '24px 28px',
                  boxShadow: '0 4px 20px rgba(230, 57, 70, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '140px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#52796F' }}>Emergency Cases (1962)</span>
                  <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#FDE8E8', color: '#E63946', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#E63946', lineHeight: 1 }}>
                    3
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#52796F', marginTop: '6px' }}>
                    Rapid response teams dispatched
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3 – Recent Alerts (Clean alert list without cluttered charts) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid rgba(82, 183, 136, 0.25)',
              boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
                  Recent Priority Alerts
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#52796F', margin: '3px 0 0' }}>
                  Live notifications requiring administrative monitoring or intervention
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveModule('disease')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2D6A4F',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>View Full Alert Feed</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                {
                  type: 'outbreak',
                  badge: 'Critical Disease Report',
                  title: 'Suspected Foot & Mouth Disease (FMD) in Shirapur Cluster',
                  desc: 'Dr. Priya Kulkarni reported 4 cattle exhibiting oral vesicles and high fever. 5km buffer ring activated.',
                  time: '35 mins ago',
                  severity: '#E63946',
                  bg: '#FDE8E8',
                },
                {
                  type: 'vaccine',
                  badge: 'Coverage Warning',
                  title: 'Vaccine Inventory Running Low in Haveli Taluka',
                  desc: 'Current stock of FMD Trivalent Oil Adjuvant doses fallen below 1,500 units reserve threshold.',
                  time: '2 hours ago',
                  severity: '#F4A261',
                  bg: '#FEF3C7',
                },
                {
                  type: 'emergency',
                  badge: 'Emergency Response #1962',
                  title: 'Mobile Vet Van MH-12-MV-4412 Deployed to Koregaon Bhima',
                  desc: 'Attending acute bovine recumbency report from farmer Baburao Kale. Response team on-site.',
                  time: '4 hours ago',
                  severity: '#457B9D',
                  bg: '#E0F2FE',
                },
                {
                  type: 'monitoring',
                  badge: 'Surveillance Update',
                  title: 'Monsoon Preventive Health Advisory Broadcasted',
                  desc: 'Dispatched multilingual advisory SMS to 48,920 livestock owners regarding Haemorrhagic Septicaemia.',
                  time: '6 hours ago',
                  severity: '#2D6A4F',
                  bg: '#E8F5E9',
                },
              ].map((alert, aIdx) => (
                <div
                  key={aIdx}
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid rgba(82, 183, 136, 0.2)`,
                    borderLeft: `4px solid ${alert.severity}`,
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ maxWidth: '820px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          background: alert.bg,
                          color: alert.severity,
                          padding: '2px 8px',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                        }}
                      >
                        {alert.badge}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#52796F' }}>• {alert.time}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1B4332' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#52796F', marginTop: '2px', lineHeight: 1.45 }}>
                      {alert.desc}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (alert.type === 'outbreak') setActiveModule('disease');
                      else if (alert.type === 'vaccine') setActiveModule('resources');
                      else if (alert.type === 'emergency') setActiveModule('emergency');
                      else setActiveModule('reports');
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(82, 183, 136, 0.3)',
                      color: '#2D6A4F',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4 – Quick Actions: Large, Clean Buttons */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B4332', marginBottom: '14px' }}>
              Quick Action Center
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {[
                {
                  id: 'disease' as GovCleanModule,
                  title: 'Disease Monitoring',
                  desc: 'Open spatial surveillance & outbreak tracking',
                  icon: Activity,
                },
                {
                  id: 'vaccination' as GovCleanModule,
                  title: 'Vaccination Hub',
                  desc: 'Manage national campaigns & district targets',
                  icon: Syringe,
                },
                {
                  id: 'emergency' as GovCleanModule,
                  title: 'Emergency Response',
                  desc: 'Coordinate 1962 mobile ambulance teams',
                  icon: AlertTriangle,
                },
                {
                  id: 'reports' as GovCleanModule,
                  title: 'Reports Center',
                  desc: 'Generate & export PDF / Excel dossiers',
                  icon: Download,
                },
              ].map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActiveModule(act.id)}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(82, 183, 136, 0.25)',
                      borderRadius: '24px',
                      padding: '24px',
                      boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: '#E8F5E9',
                        color: '#2D6A4F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1B4332' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#52796F', marginTop: '3px', lineHeight: 1.35 }}>
                        {act.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 5 – Recent Activity Timeline */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid rgba(82, 183, 136, 0.25)',
              boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B4332', margin: '0 0 16px' }}>
              Operational Activity Timeline
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { time: '10:45 AM', action: 'Disease Report Submitted', detail: 'Shirur Taluka veterinary officer logged 4 suspected FMD cases with oral lesions.', officer: 'Dr. Priya Kulkarni' },
                { time: '09:20 AM', action: 'Investigation Completed', detail: 'Lab test results received from VIDL Pune confirming Foot & Mouth Disease Type O.', officer: 'VIDL Diagnostic Team' },
                { time: 'Yesterday', action: 'Vaccination Campaign Launched', detail: 'Phase 4 NADCP FMD ring immunization launched for 10,000 bovines in Shirur buffer.', officer: 'State Vaccination Directorate' },
                { time: '2 Days Ago', action: 'Emergency Case Resolved', detail: 'Mobile Vet Clinic Van #1962 stabilized acute respiratory distress in Daund herd.', officer: 'Rapid Response Team B' },
              ].map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#52B788',
                      marginTop: '6px',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, paddingBottom: idx < 3 ? '16px' : '0', borderBottom: idx < 3 ? '1px solid #F1F5F9' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1B4332' }}>{act.action}</span>
                      <span style={{ fontSize: '0.72rem', color: '#52796F', fontWeight: 600 }}>{act.time}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#52796F', marginTop: '2px' }}>{act.detail}</div>
                    <div style={{ fontSize: '0.72rem', color: '#2D6A4F', fontWeight: 700, marginTop: '3px' }}>Logged by: {act.officer}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DEDICATED MODULE: DISEASE MONITORING                                    */}
      {/* ========================================================================= */}
      {activeModule === 'disease' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
                Disease Surveillance & Outbreak Tracking
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
                District-level telemetry, risk classification, and AI prediction insights
              </p>
            </div>

            <button
              type="button"
              onClick={() => showToast('Surveillance radar refreshed with live telemetric field reports.')}
              className="btn-primary"
              style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} />
              <span>Refresh Radar</span>
            </button>
          </div>

          {/* Single, Highly Readable Chart (Maximum 1 per section) */}
          <div style={{ background: '#F8FFF9', borderRadius: '20px', padding: '20px', border: '1px solid rgba(82, 183, 136, 0.2)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1B4332', margin: '0 0 14px' }}>
              Pathogen Distribution in Pune Division (Current Month)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Foot & Mouth Disease (FMD)', cases: 47, pct: 45, color: '#E63946' },
                { name: 'Lumpy Skin Disease (LSD)', cases: 28, pct: 27, color: '#F4A261' },
                { name: 'Clinical Mastitis', cases: 18, pct: 17, color: '#457B9D' },
                { name: 'Haemorrhagic Septicaemia (HS)', cases: 7, pct: 7, color: '#2D6A4F' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1B4332' }}>{item.name}</span>
                    <span style={{ fontWeight: 800, color: item.color }}>{item.cases} cases ({item.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '5px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search taluka, village, or disease..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-input"
              style={{ flex: 1, minWidth: '240px', fontSize: '0.84rem' }}
            />
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', fontSize: '0.84rem' }}
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* District & Taluka Surveillance Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#F8FFF9', borderBottom: '1.5px solid rgba(82, 183, 136, 0.25)', textAlign: 'left' }}>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Taluka / Block</th>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Risk Status</th>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Active Cases</th>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Herds Monitored</th>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Primary Disease Threat</th>
                  <th style={{ padding: '12px', fontWeight: 800, color: '#1B4332' }}>Containment Protocol</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { taluka: 'Shirur', risk: 'Critical', cases: 47, herds: 11, threat: 'Foot & Mouth Disease (FMD)', protocol: '5km Quarantine Ring Active', color: '#E63946' },
                  { taluka: 'Baramati', risk: 'Moderate', cases: 14, herds: 4, threat: 'Clinical Mastitis', protocol: 'Veterinary RRT Mobile Deployed', color: '#F4A261' },
                  { taluka: 'Haveli', risk: 'Low', cases: 5, herds: 2, threat: 'Lumpy Skin (Isolated)', protocol: 'Booster Vaccination Drive', color: '#2ECC71' },
                  { taluka: 'Khed', risk: 'Moderate', cases: 9, herds: 3, threat: 'Black Quarter (BQ)', protocol: 'Antibiotic Buffer Dispatched', color: '#F4A261' },
                  { taluka: 'Daund', risk: 'Low', cases: 3, herds: 1, threat: 'Bovine Babesiosis', protocol: 'Acaricide Dipping Advisory', color: '#2ECC71' },
                ].map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 800, color: '#1B4332' }}>{row.taluka}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ background: `${row.color}15`, color: row.color, padding: '3px 10px', borderRadius: '12px', fontWeight: 800, fontSize: '0.74rem' }}>
                        {row.risk.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 700 }}>{row.cases}</td>
                    <td style={{ padding: '14px 12px', color: '#52796F' }}>{row.herds}</td>
                    <td style={{ padding: '14px 12px', color: '#1B4332', fontWeight: 600 }}>{row.threat}</td>
                    <td style={{ padding: '14px 12px', color: '#2D6A4F', fontWeight: 700 }}>{row.protocol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DEDICATED MODULE: VACCINATION                                          */}
      {/* ========================================================================= */}
      {activeModule === 'vaccination' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
              National Livestock Vaccination Management
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              NADCP campaign tracking, coverage milestones, and upcoming immunization drives
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              { campaign: 'National FMD Control Programme (Phase 4)', target: '3,84,000', achieved: '3,12,850', pct: 81.4, status: 'In Progress' },
              { campaign: 'Lumpy Skin Ring Immunization', target: '1,50,000', achieved: '1,38,000', pct: 92.0, status: 'Near Target' },
              { campaign: 'Brucellosis Calf-Hood Drive', target: '65,000', achieved: '48,200', pct: 74.1, status: 'In Progress' },
              { campaign: 'Peste des Petits Ruminants (PPR)', target: '55,000', achieved: '51,400', pct: 93.4, status: 'Near Target' },
            ].map((c, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FFF9',
                  border: '1px solid rgba(82, 183, 136, 0.25)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1B4332' }}>{c.campaign}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#E8F5E9', color: '#2D6A4F', padding: '2px 8px', borderRadius: '8px' }}>
                    {c.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#52796F', marginTop: '4px' }}>
                  <span>Achieved: {c.achieved} / {c.target}</span>
                  <span style={{ fontWeight: 800, color: '#2D6A4F' }}>{c.pct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: '#2D6A4F', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEDICATED MODULE: EMERGENCY RESPONSE (1962 SOS)                         */}
      {/* ========================================================================= */}
      {activeModule === 'emergency' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(230, 57, 70, 0.25)',
            boxShadow: '0 4px 20px rgba(230, 57, 70, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E63946', margin: 0 }}>
              Emergency Response & 1962 Ambulance Dispatch
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              Real-time critical incident management, rapid response unit deployment and status tracking
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { id: 'SOS-2026-901', animal: 'Bovine Cow (Gir)', farmer: 'Baburao Kale', village: 'Koregaon Bhima', issue: 'Acute recumbency & severe dehydration', van: 'MH-12-MV-4412', status: 'Team On-Site', color: '#2ECC71' },
              { id: 'SOS-2026-902', animal: 'Crossbred Heifer', farmer: 'Pandurang Jagtap', village: 'Nimgaon Mhalungi', issue: 'Suspected organophosphate toxicity', van: 'MH-12-MV-4418', status: 'Dispatched', color: '#F4A261' },
              { id: 'SOS-2026-903', animal: 'Murrah Buffalo', farmer: 'Kishor Shinde', village: 'Shirapur', issue: 'High fever and mouth blisters', van: 'MH-12-MV-4412', status: 'Stabilized', color: '#2D6A4F' },
            ].map((sos) => (
              <div
                key={sos.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #F1F5F9',
                  borderRadius: '18px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#1B4332' }}>{sos.id}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#E63946', background: '#FDE8E8', padding: '2px 8px', borderRadius: '8px' }}>
                      {sos.animal}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#52796F', marginTop: '3px' }}>
                    Farmer: <strong>{sos.farmer}</strong> • {sos.village} • Assigned Van: <strong>{sos.van}</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#E63946', fontWeight: 600, marginTop: '2px' }}>
                    Issue: {sos.issue}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: `${sos.color}15`, color: sos.color, padding: '4px 12px', borderRadius: '12px', fontWeight: 800, fontSize: '0.78rem' }}>
                    {sos.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DEDICATED MODULE: RESOURCES                                            */}
      {/* ========================================================================= */}
      {activeModule === 'resources' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
              Workforce & Resource Inventory Allocation
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              Tracking veterinary staff, mobile vans, cold-chain freezers, and medicine supplies
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              { item: 'Registered Veterinarians on Duty', count: '342 Active', desc: '14 Taluka polyclinics staffed', color: '#2D6A4F' },
              { item: 'Mobile Veterinary Units (1962)', count: '18 / 20 Deployed', desc: 'Active 24/7 field coverage', color: '#0284C7' },
              { item: 'FMD Vaccine Vials (Doses)', count: '3,20,000 in Cold-Chain', desc: 'Reserve buffer nominal (4°C)', color: '#2ECC71' },
              { item: 'Emergency Antibiotic & NSAID Kits', count: '4,500 Kits', desc: 'Dispatched to primary health nodes', color: '#F4A261' },
            ].map((res, idx) => (
              <div key={idx} style={{ background: '#F8FFF9', borderRadius: '20px', padding: '22px', border: '1px solid rgba(82, 183, 136, 0.2)' }}>
                <div style={{ fontSize: '0.82rem', color: '#52796F', fontWeight: 700 }}>{res.item}</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1B4332', margin: '6px 0 2px' }}>{res.count}</div>
                <div style={{ fontSize: '0.74rem', color: '#2D6A4F', fontWeight: 600 }}>{res.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DEDICATED MODULE: REPORTS                                              */}
      {/* ========================================================================= */}
      {activeModule === 'reports' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
              Official Reports & Dossier Center
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              One-click compilation of ministry-compliant epidemiological reports and monthly registers
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              {
                id: 'epidemic_bulletin',
                title: 'Monthly District Epidemiological Bulletin',
                desc: 'Comprehensive incidence report covering all 14 blocks with pathogen breakdown, affected herds, and active containment protocols.',
                format: 'PDF',
                onDownload: () => {
                  showToast('Generating official Epidemiological Bulletin PDF...');
                  const ok = downloadMonthlyEpidemiologicalBulletinPDF();
                  if (ok) showToast('Monthly Epidemiological Bulletin PDF downloaded successfully.');
                },
                secondaryFormat: 'Excel CSV',
                onSecondaryDownload: () => {
                  showToast('Exporting Epidemiological Data to Excel CSV...');
                  const ok = downloadNADCPVaccinationLogExcel();
                  if (ok) showToast('Epidemiological Register (CSV) downloaded successfully.');
                },
              },
              {
                id: 'vaccination_log',
                title: 'NADCP Vaccination Target & Coverage Log',
                desc: 'Complete breakdown of animal vaccinations by species, breed, taluka, batch numbers, and cold chain temperature monitoring.',
                format: 'Excel CSV',
                onDownload: () => {
                  showToast('Exporting NADCP Vaccination Coverage Log to Excel CSV...');
                  const ok = downloadNADCPVaccinationLogExcel();
                  if (ok) showToast('NADCP Vaccination Log (CSV) downloaded successfully.');
                },
                secondaryFormat: 'PDF',
                onSecondaryDownload: () => {
                  showToast('Generating Vaccination Summary PDF...');
                  const ok = downloadMonthlyEpidemiologicalBulletinPDF();
                  if (ok) showToast('Vaccination Summary PDF downloaded successfully.');
                },
              },
              {
                id: 'emergency_audit',
                title: '1962 Ambulatory Response & Case Audit',
                desc: 'Incident response times, mobile veterinary ambulance unit dispatches, on-site treatments, and emergency stabilization rates.',
                format: 'PDF',
                onDownload: () => {
                  showToast('Generating 1962 Emergency Ambulatory Response Audit PDF...');
                  const ok = download1962EmergencyAuditPDF();
                  if (ok) showToast('1962 Ambulatory Response Audit PDF downloaded successfully.');
                },
              },
              {
                id: 'census_registry',
                title: 'Livestock Census & Disease Registry',
                desc: 'Aggregated health records linked with national animal identification tags (INAPH / Pashu Aadhaar), breeds, and owners.',
                format: 'Excel CSV',
                onDownload: () => {
                  showToast('Exporting Livestock Census Registry to Excel CSV...');
                  const ok = downloadLivestockCensusRegistryExcel();
                  if (ok) showToast('Livestock Census Registry (CSV) downloaded successfully.');
                },
              },
            ].map((rep, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FFF9',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid rgba(82, 183, 136, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#1B4332' }}>{rep.title}</div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        background: rep.format === 'PDF' ? '#FDE8E8' : '#E0F2FE',
                        color: rep.format === 'PDF' ? '#E63946' : '#0284C7',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rep.format}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#52796F', marginTop: '6px', lineHeight: 1.45 }}>{rep.desc}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={rep.onDownload}
                    className="btn-primary"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={14} />
                    <span>Download {rep.format}</span>
                  </button>

                  {rep.secondaryFormat && rep.onSecondaryDownload && (
                    <button
                      type="button"
                      onClick={rep.onSecondaryDownload}
                      className="btn-secondary"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '12px',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Download size={14} />
                      <span>{rep.secondaryFormat}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. DEDICATED MODULE: USER MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {activeModule === 'users' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
              User & Role-Based Access Control (RBAC)
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              Manage registered livestock farmers, veterinary doctors, and government officials
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'Dr. Priya Kulkarni, B.V.Sc & A.H.', role: 'Taluka Polyclinic Veterinarian', id: 'MSVC-18492', location: 'Baramati, Pune', status: 'Active' },
              { name: 'Dr. Amit Deshmukh, M.V.Sc', role: 'Disease Monitoring Officer', id: 'MSVC-16210', location: 'Shirur, Pune', status: 'Active' },
              { name: 'Rajesh Patil', role: 'District Animal Husbandry Officer (DAHO)', id: 'MH-DAHD-0412', location: 'Pune Division', status: 'Admin' },
              { name: 'Suresh Rambhau Shinde', role: 'Livestock Owner / Farmer', id: 'FARM-PUN-091', location: 'Shirapur, Shirur', status: 'Verified' },
            ].map((user, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FFF9',
                  border: '1px solid rgba(82, 183, 136, 0.2)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#1B4332' }}>{user.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#52796F', marginTop: '2px' }}>
                    Role: <strong>{user.role}</strong> • ID: {user.id} • {user.location}
                  </div>
                </div>

                <span style={{ background: '#E8F5E9', color: '#2D6A4F', padding: '3px 10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.74rem' }}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DEDICATED MODULE: SETTINGS                                             */}
      {/* ========================================================================= */}
      {activeModule === 'settings' && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(82, 183, 136, 0.25)',
            boxShadow: '0 4px 20px rgba(45, 106, 79, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1B4332', margin: 0 }}>
              System Configuration & Preferences
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#52796F', margin: '4px 0 0' }}>
              Security parameters, notification rules, language catalogs, and automated backups
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div style={{ background: '#F8FFF9', borderRadius: '20px', padding: '22px', border: '1px solid rgba(82, 183, 136, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1B4332', marginBottom: '8px' }}>
                <Lock size={18} color="#2D6A4F" />
                <span>Security & Two-Factor Authentication</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#52796F', lineHeight: 1.45, marginBottom: '14px' }}>
                Mandatory OTP verification for outbreak declaration and state-level directive broadcasts.
              </p>
              <button type="button" onClick={() => showToast('2FA settings updated.')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                Configure 2FA
              </button>
            </div>

            <div style={{ background: '#F8FFF9', borderRadius: '20px', padding: '22px', border: '1px solid rgba(82, 183, 136, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1B4332', marginBottom: '8px' }}>
                <Globe size={18} color="#2D6A4F" />
                <span>Language & Regional Catalogs</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#52796F', lineHeight: 1.45, marginBottom: '14px' }}>
                Active trilingual support: English, Marathi (मराठी), and Hindi (हिन्दी) fully synchronized.
              </p>
              <button type="button" onClick={() => showToast('Language catalog verified: 100% synchronized.')} className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
                Verify Catalogs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
