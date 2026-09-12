'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { AnimalWithDetails, HealthReportWithDetails, WeatherObservation } from '@/types/database';
import {
  getLocalizedWeatherDescription,
  localizeSpecies,
  localizeBreed,
} from '@/lib/i18n/dbLocalization';
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  CloudRain,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Stethoscope,
} from 'lucide-react';

interface FarmerDashboardProps {
  onSelectAnimal: (animalId: string) => void;
  onOpenReport: () => void;
  onOpenAdvisory: () => void;
  onOpenCases: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  onSelectAnimal,
  onOpenReport,
  onOpenAdvisory,
  onOpenCases,
}) => {
  const { t, language } = useLanguage();
  const [animals, setAnimals] = useState<AnimalWithDetails[]>([]);
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [weather, setWeather] = useState<WeatherObservation | null>(null);
  const [farmName, setFarmName] = useState<string>('');
  const currentUser = dataService.getCurrentUser();

  const defaultFarmName =
    language === 'mr'
      ? (currentUser?.full_name ? `${currentUser.full_name} यांचे फार्म` : 'माझे पशुधन फार्म')
      : language === 'hi'
      ? (currentUser?.full_name ? `${currentUser.full_name} का फार्म` : 'मेरा पशुधन फार्म')
      : (currentUser?.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm');

  useEffect(() => {
    dataService.getHerds().then((herds) => {
      if (herds.length > 0 && herds[0].name) {
        setFarmName(herds[0].name);
      } else {
        setFarmName(defaultFarmName);
      }
    });
    dataService.getAnimals().then(setAnimals);
    dataService.getHealthReports().then(setReports);
    dataService.getWeather(language).then((wx) => {
      if (wx.length > 0) setWeather(wx[0]);
    });
  }, [currentUser, language, defaultFarmName]);

  const totalMonitored = animals.length;
  const criticalCount = animals.filter((a) => a.currentStatus === 'critical').length;
  const underTreatmentCount = animals.filter((a) => a.currentStatus === 'treatment').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Farm Location Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            <MapPin size={14} />
            <span>{language === 'mr' ? 'महाराष्ट्र • पुणे जिल्हा' : language === 'hi' ? 'महाराष्ट्र • पुणे जिला' : 'Maharashtra • Pune District'}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{farmName || defaultFarmName}</h2>
        </div>
        <button
          onClick={onOpenReport}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
        >
          {t.dashboard.quickReport}
        </button>
      </div>

      {/* Main Stability Status Card (Matching Wireframe Screen 6) */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1.5px solid var(--primary-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={18} strokeWidth={2.6} />
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-deep)' }}>
            {t.dashboard.lookingStable}
          </span>
        </div>

        <div className="status-metric-grid">
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '10px 10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: 'var(--text-main)' }}>{totalMonitored}</div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.animalsMonitored}</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '10px 10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: criticalCount > 0 ? 'var(--critical)' : 'var(--text-main)' }}>
              {criticalCount}
            </div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.criticalIssues}</div>
          </div>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '10px 10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: 'var(--warning)' }}>2</div>
            <div style={{ fontSize: 'clamp(0.65rem, 2.5vw, 0.75rem)', fontWeight: 600, color: 'var(--text-muted)' }}>{t.dashboard.vaccinationsDue}</div>
          </div>
        </div>
      </div>

      {/* Weather & Seasonal Disease Alert Card */}
      <div
        className="glass-card"
        style={{
          borderLeft: '4px solid #0284c7',
          background: 'linear-gradient(to right, #f0f9ff 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CloudRain size={20} color="#0284c7" />
          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0369a1' }}>
            {t.dashboard.weatherRiskTitle}
          </span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {getLocalizedWeatherDescription(weather, language) || weather?.description || t.dashboard.weatherRiskDesc}
        </p>
        <div>
          <button
            onClick={onOpenAdvisory}
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#0284c7',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{t.dashboard.viewAdvisory}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Two-column Widgets on tablet/desktop: Vaccinations Due & Nearby Reports */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '16px' }}>
        {/* Vaccination Alert */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d97706',
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{t.dashboard.vaccinationAlert}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                COW-023 • {language === 'mr' ? 'बूस्टर डोस' : language === 'hi' ? 'बूस्टर खुराक' : 'Booster dose'}
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectAnimal('anim-1')}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {t.dashboard.scheduleVaccination}
          </button>
        </div>

        {/* Nearby Reports */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{t.dashboard.nearbyReports}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'mr'
                  ? 'शिरूर तालुका संसर्ग क्लस्टर नोंदवले'
                  : language === 'hi'
                  ? 'शिरूर ब्लॉक संक्रमण क्लस्टर चिह्नित'
                  : 'Shirur block cluster flagged'}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenCases}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {t.dashboard.viewLocalList}
          </button>
        </div>
      </div>

      {/* Animals Needing Attention (Wireframe Screen 13 & 6) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{t.dashboard.needAttention}</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {animals.length} {t.dashboard.animalsMonitored}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {animals.length === 0 ? (
            <div className="glass-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                }}
              >
                <Activity size={22} />
              </div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-main)' }}>
                {language === 'mr'
                  ? 'या कळपात अद्याप कोणतेही पशुधन नोंदणीकृत नाही'
                  : language === 'hi'
                  ? 'इस झुंड में अभी तक कोई पशुधन पंजीकृत नहीं है'
                  : 'No livestock registered in this herd yet'}
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 14px auto', lineHeight: 1.4 }}>
                {language === 'mr'
                  ? 'स्वयंचलित आरोग्य तपासणी, लसीकरण स्मरणपत्र आणि एआय ट्रायज सुरू करण्यासाठी कळप टॅबमध्ये तुमच्या जनावरांची नोंदणी करा.'
                  : language === 'hi'
                  ? 'स्वचालित स्वास्थ्य ट्रैकिंग, टीकाकरण उलटी गिनती और एआई ट्राइएज शुरू करने के लिए हर्ड टैब में अपनी गाय, भैंस या बकरियों को पंजीकृत करें।'
                  : 'Register your cattle, buffalo, or goats in the Herd tab to start automated health tracking, vaccination countdowns, and AI triage.'}
              </p>
              <button
                onClick={onOpenReport}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: 'var(--radius-full)', margin: '0 auto' }}
              >
                {language === 'mr'
                  ? 'आजारी जनावराची नोंद / ट्रायज सुरू करा'
                  : language === 'hi'
                  ? 'बीमार पशु की रिपोर्ट / ट्राइएज शुरू करें'
                  : 'Report Animal / Start Triage'}
              </button>
            </div>
          ) : (
            animals.slice(0, 3).map((animal) => {
              const isCrit = animal.currentStatus === 'critical';
              const isTreat = animal.currentStatus === 'treatment';

              return (
                <div
                  key={animal.id}
                  className="glass-card"
                  onClick={() => onSelectAnimal(animal.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>{animal.tag_number}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {localizeSpecies(animal.species, language)} • {localizeBreed(animal.breed, language)}
                      </span>
                      <span
                        className={`badge ${
                          isCrit ? 'badge-critical' : isTreat ? 'badge-warning' : 'badge-stable'
                        }`}
                      >
                        {isCrit ? t.dashboard.critical : isTreat ? t.dashboard.underTreatment : t.dashboard.healthy}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      {isCrit
                        ? (language === 'mr' ? 'श्वास घेण्यास तीव्र त्रास + अशक्तपणा आढळला' : language === 'hi' ? 'सांस लेने में कठिनाई + कमजोरी देखी गई' : 'Difficulty breathing + weakness observed')
                        : isTreat
                        ? (language === 'mr' ? 'ताप + कमी भूक • प्रतिजैविक (अँटीबायोटिक) उपचार सुरू' : language === 'hi' ? 'बुखार + भूख में कमी • एंटीबायोटिक खुराक जारी' : 'Fever + reduced appetite • Antibiotic course active')
                        : (language === 'mr' ? 'नियमित चरत आहे, सामान्य दूध उत्पादन' : language === 'hi' ? 'नियमित रूप से चर रहा है, सामान्य दूध उत्पादन' : 'Routine grazing, normal lactation')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>{t.dashboard.nextAction}:</strong>{' '}
                      {isCrit
                        ? (language === 'mr' ? 'पशुवैद्यकीय अधिकारी आज भेट देणार' : language === 'hi' ? 'पशु चिकित्सक आज दौरा करेंगे' : 'Field veterinarian visiting today')
                        : isTreat
                        ? (language === 'mr' ? 'उद्या तपासणी व पाठपुरावा' : language === 'hi' ? 'कल पुनः जांच व फॉलो-अप' : 'Follow-up tomorrow')
                        : (language === 'mr' ? 'नियोजित बूस्टर लसीकरण' : language === 'hi' ? 'बूस्टर खुराक निर्धारित' : 'Booster scheduled')}
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--text-light)" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
