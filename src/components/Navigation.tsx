'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { UserRole } from '@/types/database';
import {
  Home,
  Layers,
  Plus,
  ClipboardList,
  MapPin,
  Bell,
  Sparkles,
  Map,
} from 'lucide-react';

export type ActiveTab = 'home' | 'herd' | 'report' | 'cases' | 'surveillance' | 'alerts';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentRole: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, currentRole }) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
              border: '1px solid var(--primary-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--stable)',
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-hover)', textTransform: 'uppercase' }}>
                {t.roles[currentRole]} Node
              </span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Shirapur Village
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Shirur Block, Pune District
            </div>
          </div>
        </div>

        {/* Navigation items list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <button
            onClick={() => onSelectTab('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'home' ? 'var(--primary-light)' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <Home size={18} />
            <span>{t.nav.home}</span>
          </button>

          <button
            onClick={() => onSelectTab('herd')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: activeTab === 'herd' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'herd' ? 'var(--primary-light)' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <Layers size={18} />
            <span>{currentRole === 'veterinarian' ? 'Farms' : t.nav.herd}</span>
          </button>

          <button
            onClick={() => onSelectTab('cases')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: activeTab === 'cases' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'cases' ? 'var(--primary-light)' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <ClipboardList size={18} />
            <span>{t.nav.cases}</span>
          </button>

          <button
            onClick={() => onSelectTab('surveillance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: activeTab === 'surveillance' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'surveillance' ? 'var(--primary-light)' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <Map size={18} />
            <span>{t.nav.surveillance}</span>
          </button>

          <button
            onClick={() => onSelectTab('alerts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.92rem',
              fontWeight: 600,
              color: activeTab === 'alerts' ? 'var(--primary)' : 'var(--text-muted)',
              background: activeTab === 'alerts' ? 'var(--primary-light)' : 'transparent',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <Bell size={18} />
            <span>{t.nav.alerts}</span>
          </button>
        </nav>

        {/* Quick Report CTA */}
        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button
            onClick={() => onSelectTab('report')}
            className="btn-primary"
            style={{ width: '100%', borderRadius: 'var(--radius-lg)', padding: '14px' }}
          >
            <Plus size={18} />
            <span>{currentRole === 'veterinarian' ? 'Log Clinical Visit' : t.dashboard.quickReport}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Dock */}
      <div className="mobile-nav-dock">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onSelectTab('home')}
        >
          <Home size={20} />
          <span>{t.nav.home}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'herd' ? 'active' : ''}`}
          onClick={() => onSelectTab('herd')}
        >
          <Layers size={20} />
          <span>{currentRole === 'veterinarian' ? 'Farms' : t.nav.herd}</span>
        </button>

        {/* Center Primary Action FAB */}
        <button
          className="nav-fab-btn"
          onClick={() => onSelectTab('report')}
          aria-label={t.reporting.newReport}
        >
          <Plus size={26} strokeWidth={2.8} />
        </button>

        <button
          className={`nav-item ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => onSelectTab('cases')}
        >
          <ClipboardList size={20} />
          <span>{t.nav.cases}</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'surveillance' ? 'active' : ''}`}
          onClick={() => onSelectTab('surveillance')}
        >
          <MapPin size={20} />
          <span>{t.nav.surveillance}</span>
        </button>
      </div>
    </>
  );
};
