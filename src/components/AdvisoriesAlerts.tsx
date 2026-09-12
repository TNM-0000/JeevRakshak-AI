'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import {
  HealthAdvisory,
  WeatherObservation,
  AppNotification,
} from '@/types/database';
import {
  Bell,
  CloudRain,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';

interface AdvisoriesAlertsProps {
  onOpenReport?: () => void;
  onOpenSurveillance?: () => void;
}

export const AdvisoriesAlerts: React.FC<AdvisoriesAlertsProps> = ({
  onOpenReport,
  onOpenSurveillance,
}) => {
  const { t, language } = useLanguage();
  const [advisories, setAdvisories] = useState<HealthAdvisory[]>([]);
  const [weather, setWeather] = useState<WeatherObservation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'advisories' | 'weather' | 'notifications'>('all');
  const [markedReadMessage, setMarkedReadMessage] = useState<string | null>(null);

  const loadData = () => {
    dataService.getAdvisories(language).then(setAdvisories);
    dataService.getWeather().then(setWeather);
    dataService.getNotifications().then(setNotifications);
  };

  useEffect(() => {
    loadData();
  }, [language]);

  const handleMarkAsRead = async (notifId: string) => {
    await dataService.markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    setMarkedReadMessage('Notification marked as read');
    setTimeout(() => setMarkedReadMessage(null), 2500);
  };

  const currentWeather = weather.length > 0 ? weather[0] : null;
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Alert */}
      {markedReadMessage && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '24px',
            background: 'var(--primary-deep)',
            color: '#fff',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} color="var(--stable)" />
          <span>{markedReadMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: 'var(--info-bg)',
                color: 'var(--info)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
            >
              Real-Time Advisories & Alerts
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Maharashtra Animal Disease Surveillance
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Alerts & Clinical Advisories</h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Weather epidemiological indices, preventative veterinary guidelines, and urgent field notices
          </p>
        </div>

        {/* Filter Pills */}
        <div className="horizontal-scroll-strip" style={{ background: '#f1f5f9', padding: '4px', borderRadius: 'var(--radius-full)' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === 'all' ? '#fff' : 'transparent',
              color: filter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            All ({advisories.length + notifications.length})
          </button>
          <button
            onClick={() => setFilter('advisories')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === 'advisories' ? '#fff' : 'transparent',
              color: filter === 'advisories' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: filter === 'advisories' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Advisories ({advisories.length})
          </button>
          <button
            onClick={() => setFilter('notifications')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: filter === 'notifications' ? '#fff' : 'transparent',
              color: filter === 'notifications' ? 'var(--critical)' : 'var(--text-muted)',
              boxShadow: filter === 'notifications' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Notices {unreadNotifs > 0 && `(${unreadNotifs} unread)`}
          </button>
        </div>
      </div>

      {/* Weather Epidemic Risk Card (Matching Wireframe Screen 6 & 15) */}
      {(filter === 'all' || filter === 'weather') && currentWeather && (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative glow */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                EPIDEMIOLOGICAL WEATHER INDEX • PUNE DISTRICT
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
                {t.dashboard.weatherRiskTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#d1fae5', marginTop: '4px', maxWidth: '680px', lineHeight: 1.5 }}>
                {currentWeather.description}
              </p>
            </div>

            {/* Weather Metrics */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6ee7b7' }}>
                  <Thermometer size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Temp</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {currentWeather.temperature_c}°C
                </div>
              </div>

              <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6ee7b7' }}>
                  <Droplets size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Humidity</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {currentWeather.humidity_percent}%
                </div>
              </div>

              <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6ee7b7' }}>
                  <CloudRain size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Rain</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {currentWeather.rainfall_mm} mm
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Advisories on left, Urgent Notifications on right */}
      <div className="alerts-columns-grid">
        {/* Health Advisories Column */}
        {(filter === 'all' || filter === 'advisories') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Veterinary Advisories ({language.toUpperCase()})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Issued by State Veterinary Authority
              </span>
            </div>

            {advisories.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)' }}>No advisories currently active for this region.</p>
              </div>
            ) : (
              advisories.map((adv) => (
                <div
                  key={adv.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderLeft: '4px solid var(--primary)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge-stable">ADVISORY</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(adv.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-hover)' }}>
                      Language: {adv.language.toUpperCase()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {adv.title}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {adv.message}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Sign-off: Dr. Sunita Patil, DAHO</span>
                    <button
                      onClick={onOpenReport}
                      style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Report Related Symptoms <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Emergency Helplines Card */}
            <div
              className="glass-card"
              style={{
                background: '#f8fafc',
                border: '1px dashed var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PhoneCall size={16} color="var(--primary)" />
                Maharashtra Veterinary Toll-Free Helplines
              </h4>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                • State Animal Disease Diagnostic Lab (Pune): <strong>020-25651234</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                • Shirur Taluka Veterinary Polyclinic: <strong>02138-222110</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                • National Livestock Mission Support (1962 Emergency Animal Ambulance)
              </div>
            </div>
          </div>
        )}

        {/* Urgent Notifications Inbox */}
        {(filter === 'all' || filter === 'notifications') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Live Alerts & System Notifications
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {unreadNotifs} Unread
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)' }}>No notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: notif.is_read ? '#ffffff' : '#fffdf5',
                    borderLeft: `4px solid ${
                      notif.notification_type === 'outbreak_alert'
                        ? 'var(--critical)'
                        : notif.notification_type === 'health_alert'
                        ? 'var(--warning)'
                        : 'var(--info)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        className={
                          notif.notification_type === 'outbreak_alert'
                            ? 'badge-critical'
                            : notif.notification_type === 'health_alert'
                            ? 'badge-warning'
                            : 'badge-info'
                        }
                      >
                        {notif.notification_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!notif.is_read && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--critical)',
                            display: 'inline-block',
                          }}
                        />
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {notif.title}
                  </h4>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    {!notif.is_read ? (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={13} />
                        Mark as read
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Read</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
