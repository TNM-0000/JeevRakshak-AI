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
  Phone,
  Plus,
  X,
} from 'lucide-react';
import { IVRPhoneSimulator } from '@/components/IVRPhoneSimulator';

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
  const [showPhoneSimulator, setShowPhoneSimulator] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regTagNumber, setRegTagNumber] = useState('');
  const [regSpecies, setRegSpecies] = useState('Cattle');
  const [regBreed, setRegBreed] = useState('Gir');
  const [regSex, setRegSex] = useState<'female' | 'male'>('female');
  const [regDob, setRegDob] = useState('2023-01-01');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleRegisterAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regTagNumber.trim()) return;
    setRegSubmitting(true);

    try {
      const userHerds = await dataService.getHerds();
      let targetHerdId = userHerds[0]?.id;
      if (!targetHerdId && currentUser) {
        const newHerd = await dataService.createHerd({
          name: currentUser.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm',
          owner_profile_id: currentUser.id,
          location_id: currentUser.location_id || '1',
        });
        targetHerdId = newHerd.id;
      }

      await dataService.createAnimal({
        herd_id: targetHerdId || (currentUser ? `herd-${currentUser.id}` : 'herd-default'),
        tag_number: regTagNumber.trim().toUpperCase(),
        species: regSpecies,
        breed: regBreed,
        sex: regSex,
        date_of_birth: regDob,
      });

      const updatedAnimals = await dataService.getAnimals();
      setAnimals(updatedAnimals);
      setShowRegisterModal(false);
      setRegTagNumber('');
    } catch (err) {
      console.error('Failed to register animal:', err);
    } finally {
      setRegSubmitting(false);
    }
  };
  const currentUser = dataService.getCurrentUser();

  // The name of the farmer should be displayed at [Farmer Name]'s Farm
  const defaultFarmName =
    language === 'mr'
      ? (currentUser?.full_name ? `${currentUser.full_name} यांचे फार्म` : 'माझे पशुधन फार्म')
      : language === 'hi'
      ? (currentUser?.full_name ? `${currentUser.full_name} का फार्म` : 'मेरा पशुधन फार्म')
      : (currentUser?.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm');

  useEffect(() => {
    dataService.getHerds().then((herds) => {
      // Prioritize the farmer's name entered during signup: "[Farmer's Name]'s Farm"
      if (currentUser?.full_name) {
        setFarmName(defaultFarmName);
      } else if (herds.length > 0 && herds[0].name) {
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

  const locationLabel = currentUser?.district
    ? `${currentUser.state || (language === 'mr' ? 'महाराष्ट्र' : language === 'hi' ? 'महाराष्ट्र' : 'Maharashtra')} • ${currentUser.district}${currentUser.block ? ` (${currentUser.block})` : ''}`
    : language === 'mr'
    ? 'महाराष्ट्र • पुणे जिल्हा'
    : language === 'hi'
    ? 'महाराष्ट्र • पुणे जिला'
    : 'Maharashtra • Pune District';

  const totalMonitored = animals.length;
  const criticalCount = animals.filter((a) => a.currentStatus === 'critical').length;
  const underTreatmentCount = animals.filter((a) => a.currentStatus === 'treatment').length;
  const vaccinationsDue = animals.reduce((acc, a) => {
    const dueFromRecords = a.vaccinations?.filter((v) => !!v.next_due_date).length || 0;
    const dueFromStatus = a.vaccination_status === 'due' ? 1 : 0;
    return acc + (dueFromRecords || dueFromStatus);
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Farm Location Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            <MapPin size={14} />
            <span>{locationLabel}</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{farmName || defaultFarmName}</h2>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary"
          style={{
            padding: "8px 18px",
            fontSize: "0.85rem",
            borderRadius: "var(--radius-full)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: 700,
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{language === 'mr' ? 'पशू नोंदणी करा' : language === 'hi' ? 'पशु पंजीकृत करें' : 'Register Animal'}</span>
        </button>
      </div>

      {/* Rural Alternative Access Channel - Toll Free IVR */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 15px rgba(45, 106, 79, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#95d5b2',
              flexShrink: 0,
            }}
          >
            <Phone size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>
                {language === 'mr'
                  ? 'मोफत फोन सुविधा: १८००-१२०-५३३८ (JEEV)'
                  : language === 'hi'
                  ? 'टोल-फ्री फोन सुविधा: 1800-120-5338 (JEEV)'
                  : 'Toll-Free Helpline: 1800-120-JEEV (5338)'}
              </span>
              <span
                style={{
                  background: 'rgba(149, 213, 178, 0.25)',
                  color: '#95d5b2',
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}
              >
                24x7 • No Internet Needed
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#d8f3dc', margin: '4px 0 0' }}>
              {language === 'mr'
                ? 'स्मार्टफोन किंवा इंटरनेट नसतानाही जनावरांच्या आजारांची नोंद, डॉक्टरांचा सल्ला व १९६२ रुग्णवाहिकेसाठी कॉल करा.'
                : language === 'hi'
                ? 'बिना इंटरनेट या स्मार्टफोन के पशु रोग रिपोर्ट, डॉक्टर सलाह व 1962 एम्बुलेंस हेतु कॉल करें।'
                : 'Report diseases, request vet callback & emergency 1962 ambulance via voice call in 9 Indian languages.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPhoneSimulator(true)}
          style={{
            background: '#52b788',
            color: '#081c15',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(82, 183, 136, 0.4)',
          }}
        >
          <Phone size={15} />
          <span>{language === 'mr' ? 'फोन डायल करा' : language === 'hi' ? 'कॉल लगाएं' : 'Dial Helpline Now'}</span>
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
            {totalMonitored === 0
              ? (language === 'mr' ? 'पशुधन नोंदणी आवश्यक' : language === 'hi' ? 'पशुधन पंजीकरण आवश्यक' : 'Livestock Registration Pending')
              : t.dashboard.lookingStable}
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
            <div style={{ fontSize: 'clamp(1.2rem, 5vw, 1.6rem)', fontWeight: 800, color: vaccinationsDue > 0 ? 'var(--warning)' : 'var(--text-main)' }}>
              {vaccinationsDue}
            </div>
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
                {animals.length > 0 ? (
                  `${animals[0].tag_number} • ${language === 'mr' ? 'बूस्टर डोस' : language === 'hi' ? 'बूस्टर खुराक' : 'Booster dose'}`
                ) : (
                  language === 'mr' ? 'कोणतेही प्रलंबित लसीकरण नाही' : language === 'hi' ? 'कोई लंबित टीकाकरण नहीं' : 'No pending vaccinations'
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (animals.length > 0) {
                onSelectAnimal(animals[0].id);
              } else {
                onOpenReport();
              }
            }}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {animals.length > 0 ? t.dashboard.scheduleVaccination : (language === 'mr' ? 'नोंदणी करा' : language === 'hi' ? 'पंजीकरण करें' : 'Register Livestock')}
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

      {/* Register Animal Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px", width: "100%", borderRadius: "24px", padding: "28px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                  {language === 'mr' ? 'नवीन पशू नोंदणी' : language === 'hi' ? 'नया पशु पंजीकृत करें' : 'Register Animal'}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {language === 'mr' ? 'आपल्या कळपात नवीन पशुधन जोडा' : language === 'hi' ? 'अपने झुंड में नया पशु जोड़ें' : 'Add livestock to your personal herd registry'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterAnimal} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                  {language === 'mr' ? 'टॅग क्रमांक (RFID / INAPH)' : language === 'hi' ? 'टैग नंबर (RFID / INAPH)' : 'Ear Tag Number (RFID / INAPH)'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IN-9824-7102"
                  value={regTagNumber}
                  onChange={(e) => setRegTagNumber(e.target.value)}
                  className="form-input"
                  style={{ height: "44px", borderRadius: "12px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {language === 'mr' ? 'प्रजाती' : language === 'hi' ? 'प्रजाति' : 'Species'}
                  </label>
                  <select
                    value={regSpecies}
                    onChange={(e) => setRegSpecies(e.target.value)}
                    className="form-select"
                    style={{ height: "44px", borderRadius: "12px" }}
                  >
                    <option value="Cattle">{language === 'mr' ? 'गाय / बैल (Cattle)' : language === 'hi' ? 'गाय / बैल (Cattle)' : 'Cattle (Cow / Bull)'}</option>
                    <option value="Buffalo">{language === 'mr' ? 'म्हैस (Buffalo)' : language === 'hi' ? 'भैंस (Buffalo)' : 'Buffalo'}</option>
                    <option value="Goat">{language === 'mr' ? 'शेळी (Goat)' : language === 'hi' ? 'बकरी (Goat)' : 'Goat'}</option>
                    <option value="Sheep">{language === 'mr' ? 'मेंढी (Sheep)' : language === 'hi' ? 'भेड़ (Sheep)' : 'Sheep'}</option>
                    <option value="Camel">{language === 'mr' ? 'उंट (Camel)' : language === 'hi' ? 'ऊंट (Camel)' : 'Camel'}</option>
                    <option value="Horse">{language === 'mr' ? 'घोडा / खच्चर (Horse / Equine)' : language === 'hi' ? 'घोड़ा / खच्चर (Horse / Equine)' : 'Horse / Equine'}</option>
                    <option value="Pig">{language === 'mr' ? 'डुक्कर (Pig / Swine)' : language === 'hi' ? 'सूअर (Pig / Swine)' : 'Pig / Swine'}</option>
                    <option value="Poultry">{language === 'mr' ? 'कुक्कुट / कोंबडी (Poultry)' : language === 'hi' ? 'मुर्गी / कुक्कुट (Poultry)' : 'Poultry (Chicken / Duck)'}</option>
                    <option value="Yak">{language === 'mr' ? 'याक / मिथुन (Yak / Mithun)' : language === 'hi' ? 'याक / मिथुन (Yak / Mithun)' : 'Yak / Mithun'}</option>
                    <option value="Donkey">{language === 'mr' ? 'गाढव (Donkey)' : language === 'hi' ? 'गधा (Donkey)' : 'Donkey'}</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {language === 'mr' ? 'जात' : language === 'hi' ? 'नस्ल' : 'Breed'}
                  </label>
                  <input
                    type="text"
                    value={regBreed}
                    onChange={(e) => setRegBreed(e.target.value)}
                    placeholder="e.g. Gir, Murrah"
                    className="form-input"
                    style={{ height: "44px", borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {language === 'mr' ? 'लिंग' : language === 'hi' ? 'लिंग' : 'Sex'}
                  </label>
                  <select
                    value={regSex}
                    onChange={(e) => setRegSex(e.target.value as 'female' | 'male')}
                    className="form-select"
                    style={{ height: "44px", borderRadius: "12px" }}
                  >
                    <option value="female">{language === 'mr' ? 'मादी (Female)' : language === 'hi' ? 'मादा (Female)' : 'Female'}</option>
                    <option value="male">{language === 'mr' ? 'नर (Male)' : language === 'hi' ? 'नर (Male)' : 'Male'}</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {language === 'mr' ? 'जन्म तारीख' : language === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}
                  </label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="form-input"
                    style={{ height: "44px", borderRadius: "12px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, height: "44px", borderRadius: "12px" }}
                >
                  {language === 'mr' ? 'रद्द करा' : language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting || !regTagNumber.trim()}
                  className="btn-primary"
                  style={{ flex: 1.5, height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>{regSubmitting ? '...' : (language === 'mr' ? 'पशू नोंदणी करा' : language === 'hi' ? 'पशु पंजीकृत करें' : 'Register Animal')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IVR Phone Simulator Modal */}
      {showPhoneSimulator && (
        <IVRPhoneSimulator
          isOpen={showPhoneSimulator}
          onClose={() => setShowPhoneSimulator(false)}
        />
      )}
    </div>
  );
};
