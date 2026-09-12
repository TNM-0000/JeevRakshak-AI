'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UserRole } from '@/types/database';
import { dataService } from '@/lib/supabase/dataService';
import {
  Home,
  Layers,
  Plus,
  ClipboardList,
  MapPin,
  Bell,
  Sparkles,
  Map,
  Stethoscope,
  Building2,
  Send,
  Activity,
  Syringe,
  AlertTriangle,
  Truck,
  FileText,
  UserCheck,
  Settings as SettingsIcon,
  Phone,
  Pill,
} from 'lucide-react';

export type ActiveTab = 'home' | 'vet_desk' | 'herd' | 'report' | 'cases' | 'prescriptions' | 'surveillance' | 'alerts';

export type GovCleanModule =
  | 'dashboard'
  | 'disease'
  | 'vaccination'
  | 'emergency'
  | 'resources'
  | 'reports'
  | 'users'
  | 'settings'
  | 'ivr';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
  govModule?: GovCleanModule;
  onSelectGovModule?: (mod: GovCleanModule) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  govModule = 'dashboard',
  onSelectGovModule,
}) => {
  const { language, t } = useLanguage();
  const currentUser = dataService.getCurrentUser();

  const nodeName =
    currentRole === 'veterinarian'
      ? currentUser?.hospital_name || (language === 'mr' ? 'तालुका पशुवैद्यकीय सर्वचिकित्सालय' : 'Taluka Polyclinic')
      : currentRole === 'government'
      ? language === 'mr' ? 'पुणे जिल्हा नियंत्रण कक्ष' : language === 'hi' ? 'पुणे ज़िला नियंत्रण कक्ष' : 'Pune District Command'
      : language === 'mr' ? 'शिरापूर गाव केंद्र' : language === 'hi' ? 'शिरापुर गाँव केंद्र' : 'Shirapur Village Node';

  const nodeSub =
    currentRole === 'veterinarian'
      ? `${currentUser?.hospital_block || 'Baramati'}, ${currentUser?.hospital_district || 'Pune'}`
      : currentRole === 'government'
      ? language === 'mr' ? 'पशुसंवर्धन विभाग, महाराष्ट्र शासन' : 'DAHO Office, Pune Division'
      : language === 'mr' ? 'शिरूर तालुका, पुणे जिल्हा' : language === 'hi' ? 'शिरूर ब्लॉक, पुणे ज़िला' : 'Shirur Block, Pune';

  // Role-specific navigation items
  const getNavItems = () => {
    if (currentRole === 'veterinarian') {
      return [
        {
          id: 'vet_desk' as ActiveTab,
          label: language === 'mr' ? 'क्लिनिकल डेस्क' : language === 'hi' ? 'क्लिनिकल डेस्क' : 'Clinical Desk',
          icon: Stethoscope,
        },
        {
          id: 'cases' as ActiveTab,
          label: language === 'mr' ? 'तपासणी प्रतीक्षा सूची' : language === 'hi' ? 'जांच प्रतीक्षा सूची' : 'Clinical Queue',
          icon: ClipboardList,
        },
        {
          id: 'alerts' as ActiveTab,
          label: language === 'mr' ? 'प्रकोप सतर्कता व सूचना' : language === 'hi' ? 'प्रकोप चेतावनी व आदेश' : 'Outbreak Alerts',
          icon: Bell,
        },
      ];
    }

    if (currentRole === 'government') {
      return [
        {
          id: 'dashboard',
          label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
          icon: Building2,
        },
        {
          id: 'disease',
          label: language === 'mr' ? 'रोग पाळत व नियंत्रण' : language === 'hi' ? 'रोग निगरानी' : 'Disease Monitoring',
          icon: Activity,
        },
        {
          id: 'vaccination',
          label: language === 'mr' ? 'लसीकरण' : language === 'hi' ? 'टीकाकरण' : 'Vaccination',
          icon: Syringe,
        },
        {
          id: 'emergency',
          label: language === 'mr' ? 'आणीबाणी १९६२' : language === 'hi' ? 'आपातकालीन सेवा' : 'Emergency Response',
          icon: AlertTriangle,
        },
        {
          id: 'ivr',
          label: language === 'mr' ? 'IVR व्हॉइस पाळत' : language === 'hi' ? 'IVR वॉयस सर्विलांस' : 'IVR Voice Surveillance',
          icon: Phone,
        },
        {
          id: 'resources',
          label: language === 'mr' ? 'संसाधने' : language === 'hi' ? 'संसाधन' : 'Resources',
          icon: Truck,
        },
        {
          id: 'reports',
          label: language === 'mr' ? 'अहवाल' : language === 'hi' ? 'रिपोर्ट्स' : 'Reports',
          icon: FileText,
        },
        {
          id: 'users',
          label: language === 'mr' ? 'वापरकर्ते' : language === 'hi' ? 'उपयोगकर्ता' : 'User Management',
          icon: UserCheck,
        },
        {
          id: 'settings',
          label: language === 'mr' ? 'सेटिंग्ज' : language === 'hi' ? 'सेटिंग्स' : 'Settings',
          icon: SettingsIcon,
        },
      ];
    }

    // Default: Farmer
    return [
      {
        id: 'home' as ActiveTab,
        label: t.nav.home,
        icon: Home,
      },
      {
        id: 'herd' as ActiveTab,
        label: t.nav.herd,
        icon: Layers,
      },
      {
        id: 'prescriptions' as ActiveTab,
        label: language === 'mr' ? 'डॉक्टर प्रिस्क्रिप्शन' : language === 'hi' ? 'डॉक्टर प्रिस्क्रिप्शन' : 'Doctor Prescriptions',
        icon: Pill,
      },
      {
        id: 'cases' as ActiveTab,
        label: language === 'mr' ? 'माझे आरोग्य अहवाल' : language === 'hi' ? 'मेरी स्वास्थ्य रिपोर्ट' : 'My Health Reports',
        icon: ClipboardList,
      },
      {
        id: 'alerts' as ActiveTab,
        label: t.nav.alerts,
        icon: Bell,
      },
    ];
  };

  const navItems = getNavItems();

  const isItemActive = (itemId: string) => {
    if (currentRole === 'government') {
      return (govModule || 'dashboard') === itemId;
    }
    return activeTab === itemId;
  };

  const handleItemClick = (itemId: string) => {
    if (currentRole === 'government') {
      onSelectGovModule?.(itemId as GovCleanModule);
      onSelectTab('surveillance');
    } else {
      onSelectTab(itemId as ActiveTab);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              background:
                currentRole === 'veterinarian'
                  ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                  : currentRole === 'government'
                  ? 'linear-gradient(135deg, #F8FFF9 0%, #E8F5E9 100%)'
                  : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
              border: `1px solid ${
                currentRole === 'veterinarian'
                  ? 'rgba(2, 132, 199, 0.25)'
                  : currentRole === 'government'
                  ? 'rgba(82, 183, 136, 0.3)'
                  : 'var(--primary-border)'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background:
                    currentRole === 'veterinarian'
                      ? '#0284c7'
                      : currentRole === 'government'
                      ? '#2ECC71'
                      : 'var(--stable)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color:
                    currentRole === 'veterinarian'
                      ? '#0369a1'
                      : currentRole === 'government'
                      ? '#2D6A4F'
                      : 'var(--primary-hover)',
                  textTransform: 'uppercase',
                }}
              >
                {t.roles[currentRole]} {language === 'mr' ? 'नोड' : language === 'hi' ? 'नोड' : 'Node'}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nodeName}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              {nodeSub}
            </div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role-Specific Primary Quick Action CTA (Sticky at left bottom corner) */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', position: 'sticky', bottom: 0, background: '#ffffff', zIndex: 10 }}>
          {currentRole === 'farmer' && (
            <button
              onClick={() => onSelectTab('report')}
              className="btn-primary"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', padding: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              title="Report / Add Sick Livestock Animal"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>{language === 'mr' ? 'आजारी पशू नोंदवा' : language === 'hi' ? 'बीमार पशु जोड़ें' : 'Add Sick Animal'}</span>
            </button>
          )}

          {currentRole === 'veterinarian' && (
            <button
              onClick={() => onSelectTab('report')}
              className="btn-primary"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              }}
            >
              <Plus size={18} />
              <span>{language === 'mr' ? 'नवीन तपासणी नोंदवा' : language === 'hi' ? 'नई केस रिपोर्ट' : 'Log Clinical Visit'}</span>
            </button>
          )}

          {currentRole === 'government' && (
            <button
              onClick={() => {
                onSelectGovModule?.('emergency');
                onSelectTab('surveillance');
              }}
              className="btn-primary"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                background: '#2D6A4F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={18} />
              <span>{language === 'mr' ? '१९६२ आणीबाणी केंद्र' : language === 'hi' ? '१९६२ आपातकालीन हब' : '1962 Emergency Hub'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Dock (role tailored) */}
      <div className="mobile-nav-dock">
        {currentRole === 'government' ? (
          <>
            <button
              className={`nav-item ${isItemActive('dashboard') ? 'active' : ''}`}
              onClick={() => handleItemClick('dashboard')}
            >
              <Building2 size={20} />
              <span>{language === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
            </button>
            <button
              className={`nav-item ${isItemActive('disease') ? 'active' : ''}`}
              onClick={() => handleItemClick('disease')}
            >
              <Activity size={20} />
              <span>{language === 'mr' ? 'रोग पाळत' : 'Disease'}</span>
            </button>

            {/* Center Primary Action FAB */}
            <button
              className="nav-fab-btn"
              onClick={() => handleItemClick('emergency')}
              aria-label="1962 Emergency Response"
              style={{ background: '#2D6A4F' }}
            >
              <AlertTriangle size={22} color="#FFFFFF" />
            </button>

            <button
              className={`nav-item ${isItemActive('vaccination') ? 'active' : ''}`}
              onClick={() => handleItemClick('vaccination')}
            >
              <Syringe size={20} />
              <span>{language === 'mr' ? 'लसीकरण' : 'Vaccine'}</span>
            </button>
            <button
              className={`nav-item ${isItemActive('reports') ? 'active' : ''}`}
              onClick={() => handleItemClick('reports')}
            >
              <FileText size={20} />
              <span>{language === 'mr' ? 'अहवाल' : 'Reports'}</span>
            </button>
          </>
        ) : (
          <>
            {navItems.slice(0, 2).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Center Primary Action FAB */}
            <button
              className="nav-fab-btn"
              onClick={() => onSelectTab('report')}
              aria-label="Primary Action"
              style={{
                background:
                  currentRole === 'veterinarian'
                    ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                    : undefined,
              }}
            >
              <Plus size={26} strokeWidth={2.8} />
            </button>

            {navItems.slice(2).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => onSelectTab(item.id as ActiveTab)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};
