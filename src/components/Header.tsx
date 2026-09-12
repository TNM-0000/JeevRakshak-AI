'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole, AppLanguage, AppNotification } from '@/types/database';
import { Shield, Bell, ChevronDown, User, LogOut, Phone } from 'lucide-react';
import { IVRPhoneSimulator } from '@/components/IVRPhoneSimulator';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenNotifications: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onOpenNotifications, onSignOut }) => {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showIVRSimulator, setShowIVRSimulator] = useState(false);
  const currentUser = dataService.getCurrentUser();

  useEffect(() => {
    dataService.getNotifications().then(setNotifications);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
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
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {language === 'mr' ? 'महाराष्ट्र शासन • #२६१२८' : language === 'hi' ? 'महाराष्ट्र सरकार • #26128' : 'Govt. of Maharashtra • #26128'}
            </p>
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

          {/* Toll-Free 1800-120-JEEV IVR Hotline Button */}
          <button
            type="button"
            onClick={() => setShowIVRSimulator(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.74rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(45, 106, 79, 0.25)',
              whiteSpace: 'nowrap',
              height: '34px',
            }}
            title="Toll-Free 1800-120-JEEV IVR Hotline (No internet required)"
          >
            <Phone size={13} color="#95d5b2" />
            <span>1800-120-JEEV</span>
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
            aria-label={language === 'mr' ? 'सूचना' : language === 'hi' ? 'सूचनाएं' : 'Notifications'}
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
              title={
                currentUser
                  ? language === 'mr'
                    ? `प्रोफाइल: ${currentUser.full_name} (${currentUser.phone}). लॉग आउट करा`
                    : language === 'hi'
                    ? `प्रोफ़ाइल: ${currentUser.full_name} (${currentUser.phone}). लॉग आउट करें`
                    : `Profile: ${currentUser.full_name} (${currentUser.phone}). Click to Sign Out.`
                  : language === 'mr'
                  ? 'लॉग आउट'
                  : language === 'hi'
                  ? 'लॉग आउट'
                  : 'Sign Out'
              }
            >
              <User size={13} color="var(--primary)" />
              <span style={{ display: 'none', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="desktop-user-label">
                {currentUser?.full_name?.split(' ')[0] || (language === 'mr' ? 'वापरकर्ता' : language === 'hi' ? 'उपयोगकर्ता' : 'User')}
              </span>
              <span
                style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  background: 'var(--primary-light)',
                  color: 'var(--primary-hover)',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  border: '1px solid var(--primary-border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.roles[currentRole]}
              </span>
              <LogOut size={12} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      </header>

      {/* Toll-Free IVR Phone Simulator Modal */}
      {showIVRSimulator && (
        <IVRPhoneSimulator
          isOpen={showIVRSimulator}
          onClose={() => setShowIVRSimulator(false)}
        />
      )}
    </>
  );
};
