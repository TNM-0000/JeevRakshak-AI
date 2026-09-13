'use client';

import React, { useState, useEffect } from 'react';
import { X, Bell, Smartphone, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { NotificationPreferences } from '@/types/notificationSystem';
import { notificationService } from '@/lib/notifications/notificationService';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  userId,
  onClose,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    user_id: userId,
    sms_enabled: true,
    email_enabled: true,
    vaccination_reminders: true,
    disease_alerts: true,
    regional_risk_alerts: true,
    vaccination_campaigns: true,
    health_announcements: true,
    updated_at: new Date().toISOString(),
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userId) {
      const current = notificationService.getPreferences(userId);
      setPrefs(current);
    }
  }, [userId]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    await notificationService.updatePreferences(userId, prefs);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          border: '1px solid #CBD5E1',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} />
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800 }}>
              Notification Preferences
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {saved && (
            <div
              style={{
                background: '#DCFCE7',
                color: '#166534',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>Preferences saved successfully!</span>
            </div>
          )}

          {/* Delivery Channels */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              Active Delivery Channels
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleToggle('sms_enabled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1.5px solid ${prefs.sms_enabled ? '#059669' : '#CBD5E1'}`,
                  background: prefs.sms_enabled ? '#ECFDF5' : '#F8FAFC',
                  cursor: 'pointer',
                  color: prefs.sms_enabled ? '#065F46' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                }}
              >
                <Smartphone size={16} />
                <span>SMS Notifications</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggle('email_enabled')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  border: `1.5px solid ${prefs.email_enabled ? '#059669' : '#CBD5E1'}`,
                  background: prefs.email_enabled ? '#ECFDF5' : '#F8FAFC',
                  cursor: 'pointer',
                  color: prefs.email_enabled ? '#065F46' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                }}
              >
                <Mail size={16} />
                <span>Email Alerts</span>
              </button>
            </div>
          </div>

          {/* Notification Categories */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
              Notification Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'vaccination_reminders', label: 'Vaccination Reminders & Overdue countdowns' },
                { key: 'disease_alerts', label: 'Regional Disease Outbreak Alerts' },
                { key: 'regional_risk_alerts', label: 'Seasonal Health Advisories & Risk Updates' },
                { key: 'vaccination_campaigns', label: 'Government Vaccination Campaigns (NADCP)' },
                { key: 'health_announcements', label: 'Important Animal Husbandry Announcements' },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#1E293B',
                  }}
                >
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(prefs as any)[item.key]}
                    onChange={() => handleToggle(item.key as keyof NotificationPreferences)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.74rem',
              color: '#1E40AF',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>
              Critical bio-containment alerts are automatically delivered for public safety even if regular notifications are paused.
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            background: '#F8FAFC',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#059669',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
