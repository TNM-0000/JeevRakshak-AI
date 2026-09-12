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
  getLocalizedField,
  getLocalizedWeatherDescription,
} from '@/lib/i18n/dbLocalization';
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
    dataService.getWeather(language).then(setWeather);
    dataService.getNotifications(undefined, language).then(setNotifications);
  };

  useEffect(() => {
    loadData();
  }, [language]);

  const handleMarkAsRead = async (notifId: string) => {
    await dataService.markNotificationRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    setMarkedReadMessage(
      language === 'mr'
        ? 'सूचना वाचली म्हणून नोंदवली'
        : language === 'hi'
        ? 'सूचना पढ़ी गई के रूप में चिह्नित'
        : 'Notification marked as read'
    );
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
              {language === 'mr' ? 'थेट सूचना आणि सतर्कता' : language === 'hi' ? 'रीयल-टाइम परामर्श एवं अलर्ट' : 'Real-Time Advisories & Alerts'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'महाराष्ट्र प्राणी रोग नियंत्रण व देखरेख' : language === 'hi' ? 'महाराष्ट्र पशु रोग निगरानी' : 'Maharashtra Animal Disease Surveillance'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {language === 'mr' ? 'सतर्कता आणि पशुवैद्यकीय सूचना' : language === 'hi' ? 'अलर्ट एवं नैदानिक परामर्श' : 'Alerts & Clinical Advisories'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {language === 'mr'
              ? 'हवामान रोग निर्देशांक, प्रतिबंधात्मक पशुवैद्यकीय मार्गदर्शक तत्त्वे आणि तातडीच्या क्षेत्रीय सूचना'
              : language === 'hi'
              ? 'मौसम महामारी संबंधी सूचकांक, निवारक पशु चिकित्सा दिशानिर्देश और तत्काल क्षेत्रीय नोटिस'
              : 'Weather epidemiological indices, preventative veterinary guidelines, and urgent field notices'}
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
            {language === 'mr' ? 'सर्व' : language === 'hi' ? 'सभी' : 'All'} ({advisories.length + notifications.length})
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
            {language === 'mr' ? 'सल्ले व मार्गदर्शक' : language === 'hi' ? 'परामर्श' : 'Advisories'} ({advisories.length})
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
            {language === 'mr' ? 'सूचना' : language === 'hi' ? 'नोटिस' : 'Notices'} {unreadNotifs > 0 && `(${unreadNotifs} ${language === 'mr' ? 'नवीन' : language === 'hi' ? 'अपठित' : 'unread'})`}
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
                {language === 'mr' ? 'हवामान रोग प्रादुर्भाव निर्देशांक • पुणे जिल्हा' : language === 'hi' ? 'मौसम महामारी संबंधी जोखिम सूचकांक • पुणे जिला' : 'EPIDEMIOLOGICAL WEATHER INDEX • PUNE DISTRICT'}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: '#fff' }}>
                {t.dashboard.weatherRiskTitle}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#d1fae5', marginTop: '4px', maxWidth: '680px', lineHeight: 1.5 }}>
                {getLocalizedWeatherDescription(currentWeather, language)}
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
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{language === 'mr' ? 'तापमान' : language === 'hi' ? 'तापमान' : 'Temp'}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {currentWeather.temperature_c}°C
                </div>
              </div>

              <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6ee7b7' }}>
                  <Droplets size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{language === 'mr' ? 'आर्द्रता' : language === 'hi' ? 'आर्द्रता' : 'Humidity'}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>
                  {currentWeather.humidity_percent}%
                </div>
              </div>

              <div style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#6ee7b7' }}>
                  <CloudRain size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{language === 'mr' ? 'पाऊस' : language === 'hi' ? 'वर्षा' : 'Rain'}</span>
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
                {language === 'mr' ? 'पशुवैद्यकीय मार्गदर्शक सूचना' : language === 'hi' ? 'पशु चिकित्सा परामर्श' : 'Veterinary Advisories'} ({language.toUpperCase()})
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'mr' ? 'राज्य पशुसंवर्धन विभागाकडून जारी' : language === 'hi' ? 'राज्य पशुपालन विभाग द्वारा जारी' : 'Issued by State Veterinary Authority'}
              </span>
            </div>

            {advisories.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'या भागासाठी सध्या कोणतीही सक्रिय सूचना नाही.' : language === 'hi' ? 'इस क्षेत्र के लिए वर्तमान में कोई परामर्श सक्रिय नहीं है।' : 'No advisories currently active for this region.'}
                </p>
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
                      <span className="badge-stable">{language === 'mr' ? 'सल्ला' : language === 'hi' ? 'परामर्श' : 'ADVISORY'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(adv.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-hover)' }}>
                      {language === 'mr' ? 'भाषा:' : language === 'hi' ? 'भाषा:' : 'Language:'} {adv.language.toUpperCase()}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                    {getLocalizedField(adv, 'title', language) || adv.title}
                  </h4>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {getLocalizedField(adv, 'message', language) || adv.message}
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
                    <span style={{ color: 'var(--text-muted)' }}>
                      {language === 'mr' ? 'स्वाक्षरी: डॉ. सुनीता पाटील, DAHO' : language === 'hi' ? 'हस्ताक्षर: डॉ. सुनीता पाटिल, DAHO' : 'Sign-off: Dr. Sunita Patil, DAHO'}
                    </span>
                    <button
                      onClick={onOpenReport}
                      style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {language === 'mr' ? 'संबंधित लक्षणे नोंदवा' : language === 'hi' ? 'संबंधित लक्षण रिपोर्ट करें' : 'Report Related Symptoms'} <ChevronRight size={14} />
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
                {language === 'mr' ? 'महाराष्ट्र पशुवैद्यकीय टोल-फ्री हेल्पलाइन' : language === 'hi' ? 'महाराष्ट्र पशु चिकित्सा टोल-फ्री हेल्पलाइन' : 'Maharashtra Veterinary Toll-Free Helplines'}
              </h4>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {language === 'mr' ? '• राज्य प्राणी रोग निदान प्रयोगशाळा (पुणे):' : language === 'hi' ? '• राज्य पशु रोग निदान प्रयोगशाला (पुणे):' : '• State Animal Disease Diagnostic Lab (Pune):'} <strong>020-25651234</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {language === 'mr' ? '• शिरूर तालुका पशुवैद्यकीय पॉलीक्लिनिक:' : language === 'hi' ? '• शिरूर तालुका पशु चिकित्सा पॉलीक्लिनिक:' : '• Shirur Taluka Veterinary Polyclinic:'} <strong>02138-222110</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {language === 'mr' ? '• राष्ट्रीय पशुधन मिशन (१९६२ आपत्कालीन प्राणी रुग्णवाहिका)' : language === 'hi' ? '• राष्ट्रीय पशुधन मिशन सहायता (1962 आपातकालीन पशु एम्बुलेंस)' : '• National Livestock Mission Support (1962 Emergency Animal Ambulance)'}
              </div>
            </div>
          </div>
        )}

        {/* Urgent Notifications Inbox */}
        {(filter === 'all' || filter === 'notifications') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {language === 'mr' ? 'थेट सूचना आणि प्रणाली अलर्ट' : language === 'hi' ? 'लाइव अलर्ट और सिस्टम सूचनाएं' : 'Live Alerts & System Notifications'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {unreadNotifs} {language === 'mr' ? 'न वाचलेले' : language === 'hi' ? 'अपठित' : 'Unread'}
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                <p style={{ color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'सध्या कोणतीही सूचना नाही.' : language === 'hi' ? 'फिलहाल कोई सूचना नहीं है।' : 'No notifications right now.'}
                </p>
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
                        {notif.notification_type === 'outbreak_alert'
                          ? (language === 'mr' ? 'रोग प्रादुर्भाव अलर्ट' : language === 'hi' ? 'प्रकोप चेतावनी' : 'OUTBREAK ALERT')
                          : notif.notification_type === 'health_alert'
                          ? (language === 'mr' ? 'आरोग्य सतर्कता' : language === 'hi' ? 'स्वास्थ्य चेतावनी' : 'HEALTH ALERT')
                          : (language === 'mr' ? 'माहिती सूचना' : language === 'hi' ? 'सूचना' : 'SYSTEM INFO')}
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
                    {getLocalizedField(notif, 'title', language) || notif.title}
                  </h4>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {getLocalizedField(notif, 'message', language) || notif.message}
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
                        {language === 'mr' ? 'वाचले म्हणून खूण करा' : language === 'hi' ? 'पढ़ा हुआ चिह्नित करें' : 'Mark as read'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {language === 'mr' ? 'वाचले' : language === 'hi' ? 'पढ़ा गया' : 'Read'}
                      </span>
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
