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

  // Define balanced mobile 5-slot tabs (2 left, 1 center FAB, 2 right)
  const getMobileTabs = () => {
    if (currentRole === 'veterinarian') {
      return {
        left: [
          {
            id: 'vet_desk',
            label: language === 'mr' ? 'क्लिनिकल' : language === 'hi' ? 'क्लिनिकल' : 'Clinic',
            icon: Stethoscope,
          },
          {
            id: 'cases',
            label: language === 'mr' ? 'प्रतीक्षा' : language === 'hi' ? 'प्रतीक्षा' : 'Queue',
            icon: ClipboardList,
          },
        ],
        center: {
          id: 'report',
          label: language === 'mr' ? 'तपासणी' : language === 'hi' ? 'तपासणी' : 'Log Visit',
          icon: Plus,
        },
        right: [
          {
            id: 'surveillance',
            label: language === 'mr' ? 'पाळत' : language === 'hi' ? 'निगरानी' : 'Survey',
            icon: Activity,
          },
          {
            id: 'alerts',
            label: language === 'mr' ? 'अलर्ट' : language === 'hi' ? 'अलर्ट' : 'Alerts',
            icon: Bell,
          },
        ],
      };
    }

    if (currentRole === 'government') {
      return {
        left: [
          {
            id: 'dashboard',
            label: language === 'mr' ? 'डॅशबोर्ड' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard',
            icon: Building2,
          },
          {
            id: 'disease',
            label: language === 'mr' ? 'रोग पाळत' : language === 'hi' ? 'रोग निगरानी' : 'Disease',
            icon: Activity,
          },
        ],
        center: {
          id: 'emergency',
          label: language === 'mr' ? '१९६२' : language === 'hi' ? '१९६२' : '1962 SOS',
          icon: AlertTriangle,
        },
        right: [
          {
            id: 'vaccination',
            label: language === 'mr' ? 'लसीकरण' : language === 'hi' ? 'टीकाकरण' : 'Vaccine',
            icon: Syringe,
          },
          {
            id: 'reports',
            label: language === 'mr' ? 'अहवाल' : language === 'hi' ? 'रिपोर्ट्स' : 'Reports',
            icon: FileText,
          },
        ],
      };
    }

    // Default: Farmer
    return {
      left: [
        {
          id: 'home',
          label: language === 'mr' ? 'मुख्य' : language === 'hi' ? 'होम' : 'Home',
          icon: Home,
        },
        {
          id: 'herd',
          label: language === 'mr' ? 'कळप' : language === 'hi' ? 'पशु' : 'Herd',
          icon: Layers,
        },
      ],
      center: {
        id: 'report',
        label: language === 'mr' ? 'आजारी पशू' : language === 'hi' ? 'बीमार पशु' : 'Report',
        icon: Plus,
      },
      right: [
        {
          id: 'prescriptions',
          label: language === 'mr' ? 'औषधे' : language === 'hi' ? 'दवाइयां' : 'Rx',
          icon: Pill,
        },
        {
          id: 'cases',
          label: language === 'mr' ? 'केसेस' : language === 'hi' ? 'केस' : 'Cases',
          icon: ClipboardList,
        },
      ],
    };
  };

  const mobileTabs = getMobileTabs();

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
                  ? 'linear-gradient(135deg, #edf6f2 0%, #f7faf8 100%)'
                  : currentRole === 'government'
                  ? 'linear-gradient(135deg, #edf6f2 0%, #f5f8f6 100%)'
                  : 'linear-gradient(135deg, #fbf7ef 0%, #f4eee1 100%)',
              border: '1px solid var(--border-subtle)',
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
                      ? 'var(--primary)'
                      : currentRole === 'government'
                      ? '#2d6a4f'
                      : 'var(--accent)',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color:
                    currentRole === 'veterinarian'
                      ? 'var(--primary)'
                      : currentRole === 'government'
                      ? '#2d6a4f'
                      : 'var(--accent-deep)',
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
        <div style={{ marginTop: 'auto', paddingTop: '16px', position: 'sticky', bottom: 0, background: '#faf8f2', zIndex: 10 }}>
          {currentRole === 'farmer' && (
            <button
              onClick={() => onSelectTab('report')}
              className="btn-saffron"
              style={{ width: '100%', padding: '12px' }}
              title="Report / Add Sick Livestock Animal"
            >
              <Plus size={18} strokeWidth={2.6} />
              <span>{language === 'mr' ? 'आजारी पशू नोंदवा' : language === 'hi' ? 'बीमार पशु जोड़ें' : 'Add Sick Animal'}</span>
            </button>
          )}

          {currentRole === 'veterinarian' && (
            <button
              onClick={() => onSelectTab('report')}
              className="btn-earth"
              style={{ width: '100%', padding: '12px' }}
            >
              <Plus size={18} strokeWidth={2.6} />
              <span>{language === 'mr' ? 'नवीन तपासणी नोंदवा' : language === 'hi' ? 'नई केस रिपोर्ट' : 'Log Clinical Visit'}</span>
            </button>
          )}

          {currentRole === 'government' && (
            <button
              onClick={() => {
                onSelectGovModule?.('emergency');
                onSelectTab('surveillance');
              }}
              className="btn-earth"
              style={{
                width: '100%',
                padding: '12px',
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

      {/* Mobile Bottom Navigation Dock (Balanced 5-slot grid with mathematically centered action FAB) */}
      <div className="mobile-nav-dock" role="navigation" aria-label="Mobile Navigation">
        {/* Left 2 items */}
        {mobileTabs.left.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.id);
          return (
            <button
              key={item.id}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              aria-label={item.label}
            >
              <div className="nav-icon-container">
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
              </div>
              <span>{item.label}</span>
              {active && <span className="nav-active-dot" />}
            </button>
          );
        })}

        {/* Center Primary Action FAB (Slot 3 - exactly 50% screen center) */}
        <div className="nav-fab-wrap">
          <button
            className={`nav-fab-btn ${isItemActive(mobileTabs.center.id) ? 'active' : ''}`}
            onClick={() => handleItemClick(mobileTabs.center.id)}
            aria-label={mobileTabs.center.label}
            style={{
              background:
                currentRole === 'government'
                  ? 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)'
                  : currentRole === 'farmer'
                  ? 'linear-gradient(135deg, #1b5e4b 0%, #2d6a4f 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            }}
          >
            {mobileTabs.center.icon === Plus ? (
              <Plus size={24} strokeWidth={3} />
            ) : (
              <AlertTriangle size={20} color="#FFFFFF" />
            )}
          </button>
          <span className="nav-fab-label">{mobileTabs.center.label}</span>
        </div>

        {/* Right 2 items */}
        {mobileTabs.right.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.id);
          return (
            <button
              key={item.id}
              className={`nav-item ${active ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
              aria-label={item.label}
            >
              <div className="nav-icon-container">
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
              </div>
              <span>{item.label}</span>
              {active && <span className="nav-active-dot" />}
            </button>
          );
        })}
      </div>
    </>
  );
};
