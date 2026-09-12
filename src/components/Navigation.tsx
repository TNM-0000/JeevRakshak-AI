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
} from 'lucide-react';

export type ActiveTab = 'home' | 'vet_desk' | 'herd' | 'report' | 'cases' | 'surveillance' | 'alerts';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, currentRole }) => {
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
          id: 'surveillance' as ActiveTab,
          label: language === 'mr' ? 'प्रकोप नियंत्रण कक्ष' : language === 'hi' ? 'प्रकोप नियंत्रण कक्ष' : 'Outbreak Command',
          icon: Map,
        },
        {
          id: 'cases' as ActiveTab,
          label: language === 'mr' ? 'जिल्हा रुग्ण सूची' : language === 'hi' ? 'ज़िला केस सूची' : 'District Caseload',
          icon: ClipboardList,
        },
        {
          id: 'alerts' as ActiveTab,
          label: language === 'mr' ? 'सरकारी सूचना प्रसारण' : language === 'hi' ? 'सरकारी आदेश प्रसारण' : 'Broadcast Advisory',
          icon: Bell,
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
                  ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                  : 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
              border: `1px solid ${
                currentRole === 'veterinarian'
                  ? 'rgba(2, 132, 199, 0.25)'
                  : currentRole === 'government'
                  ? 'rgba(239, 68, 68, 0.25)'
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
                      ? '#ef4444'
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
                      ? '#b91c1c'
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
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role-Specific Primary Quick Action CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          {currentRole === 'farmer' && (
            <button
              onClick={() => onSelectTab('report')}
              className="btn-primary"
              style={{ width: '100%', borderRadius: 'var(--radius-lg)', padding: '14px' }}
            >
              <Plus size={18} />
              <span>{t.dashboard.quickReport}</span>
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
              onClick={() => onSelectTab('alerts')}
              className="btn-primary"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                padding: '14px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              }}
            >
              <Send size={18} />
              <span>{language === 'mr' ? 'सरकारी आदेश जारी करा' : language === 'hi' ? 'आदेश जारी करें' : 'Broadcast Order'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Dock (role tailored) */}
      <div className="mobile-nav-dock">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Center Primary Action FAB */}
        <button
          className="nav-fab-btn"
          onClick={() => onSelectTab(currentRole === 'government' ? 'alerts' : 'report')}
          aria-label="Primary Action"
          style={{
            background:
              currentRole === 'veterinarian'
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : currentRole === 'government'
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : undefined,
          }}
        >
          {currentRole === 'government' ? <Send size={22} /> : <Plus size={26} strokeWidth={2.8} />}
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
