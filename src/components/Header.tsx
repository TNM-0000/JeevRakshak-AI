'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole, AppLanguage, AppNotification } from '@/types/database';
import { Shield, Bell, Database, CheckCircle2, ChevronDown, User, LogOut } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNotifications: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onOpenNotifications, onSignOut }) => {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    dataService.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedMessage(null);
    const res = await dataService.seedSupabaseMaster();
    setSeedMessage(res.message);
    setSeeding(false);
    setTimeout(() => setSeedMessage(null), 4000);
  };

  return (
    <header className="top-header">
      {/* Primary Top Row: Brand & Actions */}
      <div className="header-primary-row">
        {/* Brand & Govt Badge */}
        <div className="header-brand">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
              flexShrink: 0,
            }}
          >
            <Shield size={18} strokeWidth={2.4} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                {t.appName}
              </h1>
            </div>
          </div>
        </div>

        {/* Actions: Language, Sync, Notification Bell */}
        <div className="header-actions">
          {/* Language Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="form-select"
              style={{
                padding: '4px 22px 4px 8px',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: '20px',
                background: '#f1f5f9',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                appearance: 'none',
                width: 'auto',
                minHeight: '34px',
                height: '34px',
              }}
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
            <ChevronDown
              size={12}
              style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: 'var(--text-muted)' }}
            />
          </div>

          {/* Supabase Master Sync Button */}
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="btn-secondary"
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              borderRadius: '20px',
              minHeight: '34px',
              height: '34px',
            }}
            title="Seed master locations and disease catalog to connected Supabase database"
          >
            <Database size={13} color="var(--primary)" />
            <span style={{ display: 'none' }} className="desktop-sync-label">
              {seeding ? 'Syncing...' : 'Sync'}
            </span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)',
              flexShrink: 0,
            }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: 'var(--critical)',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Account Profile & Sign Out / Landing */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="btn-secondary"
              style={{
                padding: '4px 8px',
                fontSize: '0.74rem',
                borderRadius: '20px',
                minHeight: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title={currentUser ? `Profile: ${currentUser.full_name} (${currentUser.phone}). Click to Sign Out / Switch.` : 'Sign Out / Switch'}
            >
              <User size={13} color="var(--primary)" />
              <span style={{ display: 'none', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="desktop-user-label">
                {currentUser?.full_name?.split(' ')[0] || 'User'}
              </span>
              <LogOut size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Role Switcher Row: Horizontally swipeable on mobile */}
      <div className="header-role-row">
        <div className="role-pill-group" title={t.dashboard.switchRoleNotice}>
          {(['farmer', 'field_worker', 'veterinarian', 'government'] as UserRole[]).map((r) => (
            <button
              key={r}
              className={`role-pill ${currentRole === r ? 'active' : ''}`}
              onClick={() => onRoleChange(r)}
            >
              {t.roles[r]}
            </button>
          ))}
        </div>
      </div>

      {seedMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            background: '#064e3b',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 9999,
          }}
        >
          <CheckCircle2 size={16} />
          <span>{seedMessage}</span>
        </div>
      )}
    </header>
  );
};
