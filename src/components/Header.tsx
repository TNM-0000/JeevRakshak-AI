'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole, AppLanguage, AppNotification } from '@/types/database';
import { Shield, Bell, ChevronDown, User, LogOut, Plus, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  onOpenNotifications: () => void;
  onRegisterAnimal?: () => void;
  onBack?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange, onOpenNotifications, onRegisterAnimal, onBack, onSignOut }) => {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
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
        {/* Back Button & Brand */}
        <div className="header-brand">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                height: '34px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={language === 'mr' ? 'मागे जा' : language === 'hi' ? 'पीछे जाएं' : 'Go Back'}
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              <span>{language === 'mr' ? 'मागे' : language === 'hi' ? 'पीछे' : 'Back'}</span>
            </button>
          )}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(27, 94, 75, 0.25)',
              flexShrink: 0,
            }}
          >
            <Shield size={18} strokeWidth={2.4} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              {t.appName}
            </h1>
          </div>
        </div>

        {/* Actions: Register Animal, Sign Out Profile, Language Dropdown (Right-Most) */}
        <div className="header-actions">

          {/* Top Register Animal Button */}
          {currentRole === 'farmer' && onRegisterAnimal && (
            <button
              type="button"
              onClick={onRegisterAnimal}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                height: '34px',
                whiteSpace: 'nowrap',
              }}
              title="Register New Livestock Animal"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>{language === 'mr' ? 'पशू नोंदणी' : language === 'hi' ? 'पशु पंजीकरण' : 'Register Animal'}</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'var(--surface-raised)',
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
              <LogOut size={12} color="var(--text-muted)" style={{ marginLeft: '2px' }} />
            </button>
          )}

          {/* Language Selector (Positioned at the Right-Most Corner) */}
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
              title={language === 'mr' ? 'भाषा निवडा' : language === 'hi' ? 'भाषा चुनें' : 'Select Language'}
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
        </div>
      </div>

      </header>
    </>
  );
};
