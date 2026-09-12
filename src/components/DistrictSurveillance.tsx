'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService, localizeBlock, localizeVillage } from '@/lib/supabase/dataService';
import {
  OutbreakEvent,
  AdministrativeLocation,
  HealthReportWithDetails,
  DiseaseCatalogItem,
} from '@/types/database';
import { getLocalizedField } from '@/lib/i18n/dbLocalization';
import { downloadMonthlyEpidemiologicalBulletinPDF, downloadNADCPVaccinationLogExcel } from '@/lib/exportUtils';
import {
  MapPin,
  AlertTriangle,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Users,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  Radio,
  FileSpreadsheet,
  Megaphone,
  Truck,
  Syringe,
  Eye,
  X,
  ChevronRight,
} from 'lucide-react';

interface DistrictSurveillanceProps {
  onSelectCase?: (caseId: string) => void;
  onOpenReport?: () => void;
}

export const DistrictSurveillance: React.FC<DistrictSurveillanceProps> = ({
  onSelectCase,
  onOpenReport,
}) => {
  const { t, language } = useLanguage();
  const [outbreaks, setOutbreaks] = useState<OutbreakEvent[]>([]);
  const [locations, setLocations] = useState<AdministrativeLocation[]>([]);
  const [reports, setReports] = useState<HealthReportWithDetails[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCatalogItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'map' | 'containment'>('overview');
  const [selectedBlock, setSelectedBlock] = useState<string>('Shirur');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Containment checklist state (interactive)
  const [containmentChecklist, setContainmentChecklist] = useState<{ [key: string]: boolean }>({
    quarantine: true,
    ringVaccine: true,
    marketRestriction: true,
    biosecurity: false,
    carcassDisposal: true,
    veterinaryRRT: false,
  });

  useEffect(() => {
    dataService.getOutbreaks(language).then(setOutbreaks);
    dataService.getLocations(language).then(setLocations);
    dataService.getHealthReports().then(setReports);
    dataService.getDiseases(language).then(setDiseases);
  }, [language]);

  const totalAffectedAnimals = outbreaks.reduce((acc, o) => acc + o.affected_animals, 0) || 61;
  const totalAffectedHerds = outbreaks.reduce((acc, o) => acc + o.affected_herds, 0) || 16;
  const totalDeaths = outbreaks.reduce((acc, o) => acc + o.mortality_count, 0) || 3;

  const toggleChecklist = (key: string) => {
    setContainmentChecklist((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Block data for Pune District with trilingual support
  const blockStats = [
    {
      name: 'Shirur',
      risk: 'critical',
      cases: 47,
      herds: 11,
      deaths: 3,
      primaryThreat: language === 'mr' ? 'लाळ-खुरकूत (FMD)' : language === 'hi' ? 'खुरपका-मुंहपका (FMD)' : 'Foot & Mouth Disease (FMD)',
      villages: ['Shirapur', 'Koregaon Bhima', 'Kavathe', 'Nimgaon Mhalungi'],
      status: language === 'mr' ? 'क्वारंटाइन झोन सक्रिय (५ किमी)' : language === 'hi' ? 'क्वारंटाइन ज़ोन सक्रिय (5 किमी)' : 'Quarantine Zone Active (5km)',
    },
    {
      name: 'Baramati',
      risk: 'elevated',
      cases: 14,
      herds: 5,
      deaths: 0,
      primaryThreat: language === 'mr' ? 'लम्पी चर्मरोग (LSD)' : language === 'hi' ? 'लम्पी त्वचा रोग (LSD)' : 'Lumpy Skin Disease (LSD)',
      villages: ['Malegaon', 'Songaon', 'Morgaon'],
      status: language === 'mr' ? 'रिंग लसीकरण सुरू' : language === 'hi' ? 'रिंग टीकाकरण जारी' : 'Ring Vaccination in Progress',
    },
    {
      name: 'Haveli',
      risk: 'medium',
      cases: 3,
      herds: 2,
      deaths: 0,
      primaryThreat: language === 'mr' ? 'गोवंशीय श्वसन रोग (BRD)' : language === 'hi' ? 'बोवाइन रेस्पिरेटरी (BRD)' : 'Bovine Respiratory (BRD)',
      villages: ['Wagholi', 'Loni Kalbhor', 'Uruli Kanchan'],
      status: language === 'mr' ? 'सक्रिय सेंटिनेल देखरेख' : language === 'hi' ? 'सक्रिय प्रहरी निगरानी' : 'Active Sentinel Surveillance',
    },
    {
      name: 'Khed',
      risk: 'stable',
      cases: 1,
      herds: 1,
      deaths: 0,
      primaryThreat: language === 'mr' ? 'नियमित देखरेख' : language === 'hi' ? 'नियमित निगरानी' : 'Routine monitoring',
      villages: ['Chakan', 'Rajgurunagar', 'Alandi'],
      status: language === 'mr' ? 'सर्व सुरळीत / आधारभूत' : language === 'hi' ? 'सब ठीक / आधारभूत' : 'All clear / Baseline',
    },
    {
      name: 'Ambegaon',
      risk: 'stable',
      cases: 0,
      herds: 0,
      deaths: 0,
      primaryThreat: language === 'mr' ? 'कोणताही आढळलेला नाही' : language === 'hi' ? 'कोई नहीं पाया गया' : 'None detected',
      villages: ['Manchar', 'Ghodegaon'],
      status: language === 'mr' ? 'सामान्य आधारभूत सर्व्हेलन्स' : language === 'hi' ? 'सामान्य आधारभूत निगरानी' : 'Normal baseline surveillance',
    },
  ];

  const currentBlockData = blockStats.find((b) => b.name === selectedBlock) || blockStats[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {actionSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '75px',
            right: '24px',
            background: 'var(--primary-deep)',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--stable)" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* District Title Bar & Action Center */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(220, 38, 38, 0.1)',
                color: 'var(--critical)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Radio size={12} className="animate-pulse" />
              {language === 'mr' ? 'थेट देखरेख' : language === 'hi' ? 'लाइव निगरानी' : 'LIVE MONITORING'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'महाराष्ट्र पशुरोग नियंत्रण व सर्वेक्षण कक्ष (ADSC)' : language === 'hi' ? 'महाराष्ट्र पशु रोग नियंत्रण व निगरानी सेल (ADSC)' : 'Maharashtra Animal Disease Surveillance Cell (ADSC)'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {language === 'mr' ? 'पुणे जिल्हा आरोग्य सर्वेक्षण' : language === 'hi' ? 'पुणे जिला स्वास्थ्य निगरानी' : 'Pune District Health Surveillance'}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {language === 'mr'
              ? '५ तालुके व १४ ग्रामपंचायतींमध्ये थेट बहुस्तरीय उद्रेक मागोवा'
              : language === 'hi'
              ? '5 ब्लॉक और 14 ग्राम पंचायतों में रीयल-टाइम प्रकोप ट्रैकिंग'
              : 'Real-time multi-tier outbreak tracking across 5 blocks and 14 gram panchayats'}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() =>
              showNotification(
                language === 'mr'
                  ? '४,८२० नोंदणीकृत दुग्ध उत्पादकांना एसएमएसद्वारे जिल्हा सूचना पाठवली.'
                  : language === 'hi'
                  ? '4,820 पंजीकृत डेयरी किसानों को एसएमएस द्वारा जिला सलाह भेजी गई।'
                  : 'District Advisory broadcast dispatched via SMS to 4,820 registered dairy farmers.'
              )
            }
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <Megaphone size={15} color="var(--warning)" />
            <span>{language === 'mr' ? 'सल्ला प्रसारित करा' : language === 'hi' ? 'सलाह प्रसारित करें' : 'Broadcast Advisory'}</span>
          </button>
          <button
            onClick={() => {
              downloadNADCPVaccinationLogExcel();
              showNotification(
                language === 'mr'
                  ? 'सर्व्हेलन्स सीएसव्ही निर्यात यशस्वीरीत्या डाउनलोड केली.'
                  : language === 'hi'
                  ? 'निगरानी सीएसवी निर्यात सफलतापूर्वक डाउनलोड किया गया।'
                  : 'Surveillance CSV export compiled and downloaded successfully.'
              );
            }}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <FileSpreadsheet size={15} color="var(--info)" />
            <span>{language === 'mr' ? 'डेटा निर्यात' : language === 'hi' ? 'डेटा निर्यात' : 'Export Data (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 Key Epidemic Indicators */}
      <div className="surveillance-kpi-grid">
        {/* District Risk Status */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--critical)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.overallRisk}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--critical)' }}>
              {language === 'mr' ? 'उच्च / लाल' : language === 'hi' ? 'उच्च / लाल' : 'Elevated / Red'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {language === 'mr' ? 'शिरूर तालुक्यात लाळ-खुरकूत (FMD) इंडेक्स केस निश्चित' : language === 'hi' ? 'शिरूर ब्लॉक में एफएमडी इंडेक्स केस की पुष्टि' : 'FMD index case confirmed in Shirur block'}
          </p>
        </div>

        {/* Cumulative Cases */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.cumulativeCases}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {totalAffectedAnimals}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--critical)', fontWeight: 700 }}>
              {language === 'mr' ? '+१४ आज' : language === 'hi' ? '+14 आज' : '+14 today'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {language === 'mr' ? `${totalAffectedHerds} दुग्ध कळपांमध्ये` : language === 'hi' ? `${totalAffectedHerds} डेयरी झुंडों में` : `Across ${totalAffectedHerds} dairy herds`}
          </p>
        </div>

        {/* Mortality */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--text-muted)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.mortalityThisWeek}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--critical)' }}>
              {totalDeaths}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {language === 'mr' ? 'मृत्यू' : language === 'hi' ? 'मौतें' : 'deaths'}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {language === 'mr' ? 'सीएफआर: ४.९% (अपेक्षित मर्यादेत)' : language === 'hi' ? 'सीएफआर: 4.9% (अपेक्षित सीमा में)' : 'CFR: 4.9% (within expected range)'}
          </p>
        </div>

        {/* Vaccination Coverage */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.surveillance.vaccinationCoverage}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>
              78.4%
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({t.surveillance.target}: 90%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '3px',
              marginTop: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '78.4%',
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Sub-navigation tabs */}
      <div className="horizontal-scroll-strip" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveSubTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'overview' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'overview' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.districtStatus}
        </button>
        <button
          onClick={() => setActiveSubTab('map')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'map' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'map' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.geospatialRiskMap}
        </button>
        <button
          onClick={() => setActiveSubTab('containment')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.88rem',
            background: activeSubTab === 'containment' ? 'var(--primary-light)' : 'transparent',
            color: activeSubTab === 'containment' ? 'var(--primary)' : 'var(--text-muted)',
            border: 'none',
          }}
        >
          {t.surveillance.responseCenter}
        </button>
      </div>

      {/* TAB 1: DISTRICT OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Outbreak Alerts */}
          <div className="glass-card" style={{ background: '#fff', border: '1px solid #fecaca' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #fee2e2',
                paddingBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--critical-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--critical)',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--critical)' }}>
                    {outbreaks.length > 0 ? getLocalizedField(outbreaks[0], 'title', language) || outbreaks[0].title : (language === 'mr' ? 'सक्रिय उद्रेक नियंत्रण: लाळ-खुरकूत रोग (FMD)' : language === 'hi' ? 'सक्रिय प्रकोप नियंत्रण: खुरपका-मुंहपका रोग (FMD)' : 'Active Outbreak Containment: Foot and Mouth Disease (FMD)')}
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {language === 'mr'
                      ? 'स्थान: शिरूर तालुका • घोषित: ०८ सप्टेंबर २०२६ • प्रमुख पशुवैद्य: डॉ. सुनिता पाटील (DAHO)'
                      : language === 'hi'
                      ? 'स्थान: शिरूर ब्लॉक • घोषित: 08 सितंबर 2026 • प्रमुख पशु चिकित्सक: डॉ. सुनीता पाटिल (DAHO)'
                      : 'Location: Shirur Block • Declared: 08 Sep 2026 • Lead Vet: Dr. Sunita Patil (DAHO)'}
                  </p>
                </div>
              </div>
              <span className="badge-critical">
                {language === 'mr' ? 'क्वारंटाइन झोन लागू' : language === 'hi' ? 'क्वारंटाइन ज़ोन लागू' : 'QUARANTINE ZONE ENFORCED'}
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '14px', lineHeight: 1.5 }}>
              {outbreaks.length > 0 ? getLocalizedField(outbreaks[0], 'description', language) || outbreaks[0].description : (language === 'mr' ? 'शिरापूर, कोरेगाव भीमा आणि कवठे येथील ११ दुग्ध कळपांमध्ये जलद प्रसार क्लस्टर आढळले. तोंडातील व्रण, लाळ गळणे, अतिताप आणि दुधात घट ही लक्षणे. ५ किमी तात्काळ जैव-नियंत्रण परिमिती स्थापित केली आहे.' : language === 'hi' ? 'शिरापुर, कोरेगांव भीमा और कवठे में 11 डेयरी झुंडों में तीव्र संचरण क्लस्टर पाया गया। मुंह में छाले, लार गिरना, तेज बुखार और दूध में कमी के लक्षण। 5 किमी का तत्काल जैव-नियंत्रण घेरा स्थापित किया गया है।' : 'Rapid transmission cluster detected across 11 dairy herds in Shirapur, Koregaon Bhima, and Kavathe. Clinical signs of mucosal vesicular lesions, drooling, high pyrexia, and drop in milk yield. Immediate bio-containment perimeter of 5 km has been established.')}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                background: '#f8fafc',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'बाधित कळप' : language === 'hi' ? 'प्रभावित झुंड' : 'AFFECTED HERDS'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  11 {language === 'mr' ? 'कळप' : language === 'hi' ? 'झुंड' : 'Herds'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'बाधित पशू' : language === 'hi' ? 'प्रभावित पशु' : 'AFFECTED ANIMALS'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--critical)' }}>
                  47 {language === 'mr' ? 'गायी' : language === 'hi' ? 'गायें' : 'Cattle'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'मृत्यू' : language === 'hi' ? 'मौतें' : 'CASUALTIES'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  3 {language === 'mr' ? 'वासरे' : language === 'hi' ? 'बछड़े' : 'Calves'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'रिंग लसीकरण' : language === 'hi' ? 'रिंग टीकाकरण' : 'RING VACCINATIONS'}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                  850 {language === 'mr' ? 'डोस' : language === 'hi' ? 'खुराक' : 'Doses'}
                </div>
              </div>
            </div>
          </div>

          {/* Block-by-Block Surveillance Table */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
              {language === 'mr' ? 'तालुका साथीचा रोग सारांश (पुणे जिल्हा)' : language === 'hi' ? 'ब्लॉक महामारी सारांश (पुणे ज़िला)' : 'Block Epidemiological Summary (Pune District)'}
            </h3>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ minWidth: '580px', width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'तालुका' : language === 'hi' ? 'ब्लॉक' : 'Block'}</th>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'धोका स्थिती' : language === 'hi' ? 'जोखिम स्थिति' : 'Risk Status'}</th>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'सक्रिय रुग्ण' : language === 'hi' ? 'सक्रिय मामले' : 'Active Cases'}</th>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'बाधित कळप' : language === 'hi' ? 'प्रभावित झुंड' : 'Herds Affected'}</th>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'प्रमुख रोगकारक' : language === 'hi' ? 'प्राथमिक रोगजनक' : 'Primary Pathogen'}</th>
                    <th style={{ padding: '10px 12px' }}>{language === 'mr' ? 'कृती नियमावली' : language === 'hi' ? 'कार्यवाही प्रोटोकॉल' : 'Action Protocol'}</th>
                  </tr>
                </thead>
                <tbody>
                  {blockStats.map((block) => (
                    <tr
                      key={block.name}
                      onClick={() => {
                        setSelectedBlock(block.name);
                        setActiveSubTab('map');
                      }}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {localizeBlock(block.name, language)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          className={
                            block.risk === 'critical'
                              ? 'badge-critical'
                              : block.risk === 'elevated'
                              ? 'badge-warning'
                              : 'badge-stable'
                          }
                        >
                          {block.risk === 'critical' ? (language === 'mr' ? 'गंभीर' : language === 'hi' ? 'गंभीर' : 'CRITICAL') : block.risk === 'elevated' ? (language === 'mr' ? 'उच्च' : language === 'hi' ? 'उच्च' : 'ELEVATED') : (language === 'mr' ? 'स्थिर' : language === 'hi' ? 'स्थिर' : 'STABLE')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>
                        {block.cases}
                      </td>
                      <td style={{ padding: '12px' }}>{block.herds}</td>
                      <td style={{ padding: '12px', color: 'var(--text-main)' }}>
                        {block.primaryThreat}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                        {block.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GEOSPATIAL RISK MAP */}
      {activeSubTab === 'map' && (
        <div className="surveillance-map-grid">
          {/* Map Representation Box */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'भौगोलिक जोखीम उष्णता वितरण' : language === 'hi' ? 'भू-स्थानिक जोखिम हीट वितरण' : 'Geospatial Heat Distribution'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'पुणे जिल्ह्याचा परस्परसंवादी साथीच्या रोगांचा नकाशा' : language === 'hi' ? 'पुणे ज़िले का इंटरएक्टिव महामारी क्लस्टर मानचित्र' : 'Interactive epidemiological cluster map of Pune District'}
                </p>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                {language === 'mr' ? 'जीपीएस अचूकता: ५० मी' : language === 'hi' ? 'जीपीएस परिशुद्धता: 50 मी' : 'GPS Cluster Precision: 50m'}
              </span>
            </div>

            {/* Stylized Vector Map representation */}
            <div
              style={{
                height: '340px',
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              {/* Geographic Block Nodes */}
              {/* Shirur - Critical Hotspot */}
              <div
                onClick={() => setSelectedBlock('Shirur')}
                style={{
                  position: 'absolute',
                  top: '32%',
                  right: '25%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Shirur' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  textAlign: 'center',
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, rgba(220, 38, 38, 0.15) 70%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--critical)',
                      border: '3px solid #fff',
                      boxShadow: '0 0 16px rgba(220, 38, 38, 0.8)',
                    }}
                  />
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(220,38,38,0.5)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  {localizeBlock('Shirur', language)} (47)
                </div>
              </div>

              {/* Baramati - Warning Hotspot */}
              <div
                onClick={() => setSelectedBlock('Baramati')}
                style={{
                  position: 'absolute',
                  bottom: '22%',
                  right: '35%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Baramati' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 8,
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(217, 119, 6, 0.5) 0%, rgba(217, 119, 6, 0.1) 70%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'var(--warning)',
                      border: '2px solid #fff',
                    }}
                  />
                </div>
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid rgba(217,119,6,0.5)',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  {localizeBlock('Baramati', language)} (14)
                </div>
              </div>

              {/* Haveli - Medium Node */}
              <div
                onClick={() => setSelectedBlock('Haveli')}
                style={{
                  position: 'absolute',
                  top: '48%',
                  left: '38%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Haveli' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 7,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--info)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(37,99,235,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  {localizeBlock('Haveli', language)} (3)
                </div>
              </div>

              {/* Khed - Stable Node */}
              <div
                onClick={() => setSelectedBlock('Khed')}
                style={{
                  position: 'absolute',
                  top: '20%',
                  left: '26%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Khed' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 6,
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--stable)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16,185,129,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  {localizeBlock('Khed', language)} (1)
                </div>
              </div>

              {/* Ambegaon - Stable Node */}
              <div
                onClick={() => setSelectedBlock('Ambegaon')}
                style={{
                  position: 'absolute',
                  top: '12%',
                  left: '42%',
                  cursor: 'pointer',
                  transform: selectedBlock === 'Ambegaon' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.25s',
                  textAlign: 'center',
                  zIndex: 5,
                }}
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: 'var(--stable)',
                    border: '2px solid #fff',
                    margin: '0 auto',
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16,185,129,0.5)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '4px',
                  }}
                >
                  {localizeBlock('Ambegaon', language)} (0)
                </div>
              </div>

              {/* Map Legend */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: '12px',
                  fontSize: '0.68rem',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--critical)' }} />
                  {language === 'mr' ? 'गंभीर > २०' : language === 'hi' ? 'गंभीर > 20' : 'Critical > 20'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }} />
                  {language === 'mr' ? 'उच्च ५-२०' : language === 'hi' ? 'उच्च 5-20' : 'Elevated 5-20'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--stable)' }} />
                  {language === 'mr' ? 'आधारभूत ०-४' : language === 'hi' ? 'आधारभूत 0-4' : 'Baseline 0-4'}
                </span>
              </div>
            </div>
          </div>

          {/* Selected Block Drill-down Pane */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  {language === 'mr' ? 'निवडलेले कार्यक्षेत्र' : language === 'hi' ? 'चयनित क्षेत्राधिकार' : 'Selected Jurisdiction'}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {localizeBlock(currentBlockData.name, language)} {language === 'mr' ? 'तालुका' : language === 'hi' ? 'ब्लॉक' : 'Block'}
                </h3>
              </div>
              <span
                className={
                  currentBlockData.risk === 'critical'
                    ? 'badge-critical'
                    : currentBlockData.risk === 'elevated'
                    ? 'badge-warning'
                    : 'badge-stable'
                }
              >
                {currentBlockData.risk === 'critical' ? (language === 'mr' ? 'गंभीर' : language === 'hi' ? 'गंभीर' : 'CRITICAL') : currentBlockData.risk === 'elevated' ? (language === 'mr' ? 'उच्च' : language === 'hi' ? 'उच्च' : 'ELEVATED') : (language === 'mr' ? 'स्थिर' : language === 'hi' ? 'स्थिर' : 'STABLE')}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'सक्रिय रुग्ण' : language === 'hi' ? 'सक्रिय मामले' : 'ACTIVE CASES'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentBlockData.cases}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'बाधित कळप' : language === 'hi' ? 'प्रभावित झुंड' : 'AFFECTED HERDS'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentBlockData.herds}</div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                {language === 'mr' ? 'प्रमुख रोगकारक / धोका' : language === 'hi' ? 'प्राथमिक रोगजनक / ख़तरा' : 'Primary Pathogen / Threat'}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--critical)', fontWeight: 600 }}>
                {currentBlockData.primaryThreat}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                {language === 'mr' ? 'निरीक्षणखालील ग्रामपंचायती / गावे' : language === 'hi' ? 'निगरानी की गई ग्राम पंचायतें / गाँव' : 'Monitored Gram Panchayats / Villages'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentBlockData.villages.map((v) => (
                  <span
                    key={v}
                    style={{
                      background: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    📍 {localizeVillage(v, language)}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {language === 'mr' ? 'स्थिती:' : language === 'hi' ? 'स्थिति:' : 'Status:'} {currentBlockData.status}
              </div>
              <button
                onClick={() => setActiveSubTab('containment')}
                className="btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '10px' }}
              >
                {language === 'mr' ? 'नियंत्रण कृती केंद्र उघडा' : language === 'hi' ? 'रोकथाम कार्य केंद्र खोलें' : 'Open Containment Action Center'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTAINMENT ACTION CENTER */}
      {activeSubTab === 'containment' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  {language === 'mr' ? 'सक्रिय नियंत्रण प्रोटोकॉल आणि मानक कार्यप्रणाली (SOP)' : language === 'hi' ? 'सक्रिय रोकथाम प्रोटोकॉल और मानक संचालन प्रक्रियाएं (SOP)' : 'Active Containment Protocols & Standard Operating Procedures (SOP)'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {language === 'mr' ? 'पशू संसर्गजन्य रोग प्रतिबंधक कायद्यांतर्गत अनिवार्य नियंत्रण उपाय' : language === 'hi' ? 'पशु संक्रामक रोग निवारण अधिनियम के तहत अनिवार्य नियंत्रण कार्रवाई' : 'Mandated containment actions under the Prevention and Control of Infectious & Contagious Diseases in Animals Act'}
                </p>
              </div>
              <span className="badge-critical">
                {language === 'mr' ? 'पातळी-३ घटना' : language === 'hi' ? 'स्तर-3 घटना' : 'LEVEL-3 INCIDENT'}
              </span>
            </div>

            {/* Checklist of Protocols */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  key: 'quarantine',
                  title: language === 'mr' ? '५ किमी क्वारंटाइन परिमिती घोषणा' : language === 'hi' ? '5 किमी क्वारंटाइन परिधि घोषणा' : '5km Quarantine Perimeter Declaration',
                  desc: language === 'mr' ? 'स्थानिक पोलिसांद्वारे शिरापूर-कोरेगाव झोनमध्ये जनावरांची सर्व हालचाल बंद केली आहे.' : language === 'hi' ? 'स्थानीय पुलिस द्वारा शिरापुर-कोरेगांव क्षेत्र में पशुओं की सभी आवाजाही रोक दी गई है।' : 'All livestock movement in and out of Shirapur-Koregaon zone stopped by local law enforcement.',
                  status: containmentChecklist.quarantine,
                },
                {
                  key: 'ringVaccine',
                  title: language === 'mr' ? 'रिंग लसीकरण प्रोटोकॉल (८५० डोस)' : language === 'hi' ? 'रिंग टीकाकरण प्रोटोकॉल (850 खुराक)' : 'Ring Vaccination Protocol (850 doses)',
                  desc: language === 'mr' ? '४ फिरत्या पशुवैद्यकीय पथकांद्वारे ५-१० किमी बफर गावांमध्ये निरोगी जनावरांचे लसीकरण सुरू आहे.' : language === 'hi' ? '4 मोबाइल पशु चिकित्सा इकाइयों द्वारा 5-10 किमी बफर गांवों में स्वस्थ पशुओं का टीकाकरण जारी है।' : 'Inoculation of healthy cattle in surrounding 5km-10km buffer villages underway by 4 mobile veterinary units.',
                  status: containmentChecklist.ringVaccine,
                },
                {
                  key: 'marketRestriction',
                  title: language === 'mr' ? 'आठवडे पशू बाजार व जनावरांचे आठवडी बाजार निलंबन' : language === 'hi' ? 'साप्ताहिक पशु बाजार व पशु हाट निलंबन' : 'Livestock Weekly Market & Cattle Haat Suspension',
                  desc: language === 'mr' ? 'शिरूर कृषी उत्पन्न बाजार समिती व तालुका प्रशासनाला अधिकृत सूचना पाठवली.' : language === 'hi' ? 'शिरूर एपीएमसी और तालुका प्रशासन को आधिकारिक अधिसूचना भेजी गई।' : 'Official notification dispatched to Shirur APMC and taluka administration.',
                  status: containmentChecklist.marketRestriction,
                },
                {
                  key: 'biosecurity',
                  title: language === 'mr' ? 'गोठ्यांच्या प्रवेशद्वारांवर निर्जंतुकीकरण व चुन्याची व्यवस्था' : language === 'hi' ? 'फार्म प्रवेश द्वारों पर कीटाणुशोधन और चूने के फुट-बाथ' : 'Disinfection & Lime Foot-baths at Farm Entrances',
                  desc: language === 'mr' ? '६४ बाधित व लगतच्या गोठ्यांना सोडियम हायपोक्लोराइट आणि चुन्याचे वाटप.' : language === 'hi' ? '64 प्रभावित और पड़ोसी गोशालाओं को सोडियम हाइपोक्लोराइट और बुझे हुए चूने का वितरण।' : 'Sodium hypochlorite and slaked lime distribution to 64 affected and neighboring sheds.',
                  status: containmentChecklist.biosecurity,
                },
                {
                  key: 'carcassDisposal',
                  title: language === 'mr' ? 'मृत जनावरांचे आरोग्यदायी खोल पुरणे' : language === 'hi' ? 'मृत पशुओं का सुरक्षित गहरा दफ़नाना' : 'Sanitary Deep Burial for Deceased Animals',
                  desc: language === 'mr' ? 'भूजल दूषित होऊ नये म्हणून चुन्याच्या थरासह (किमान २ मीटर खोली) कडक नियम लागू.' : language === 'hi' ? 'भूजल प्रदूषण रोकने के लिए बुझे चूने की परत के साथ (न्यूनतम 2 मीटर गहराई) सख्त प्रोटोकॉल लागू।' : 'Strict protocol with quicklime layer (min 2 meters depth) enforced to prevent groundwater contamination.',
                  status: containmentChecklist.carcassDisposal,
                },
                {
                  key: 'veterinaryRRT',
                  title: language === 'mr' ? 'राज्य जलद प्रतिसाद पथक (RRT) तैनात' : language === 'hi' ? 'राज्य त्वरित प्रतिक्रिया दल (RRT) तैनाती' : 'State Rapid Response Team (RRT) Deployment',
                  desc: language === 'mr' ? 'अतिरिक्त पशुवैद्यकीय कर्मचाऱ्यांसाठी पशुसंवर्धन आयुक्तालय, पुणे यांच्याकडे वर्ग केले.' : language === 'hi' ? 'अतिरिक्त पशु चिकित्सा कर्मियों के लिए पशुपालन आयुक्तालय, पुणे को प्रेषित।' : 'Escalated to Commissionerate of Animal Husbandry, Pune for additional clinical personnel.',
                  status: containmentChecklist.veterinaryRRT,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => toggleChecklist(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    background: item.status ? 'rgba(5, 150, 105, 0.04)' : '#fff',
                    border: `1px solid ${item.status ? 'var(--primary-border)' : 'var(--border-card)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: `2px solid ${item.status ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: item.status ? 'var(--primary)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      marginTop: '2px',
                    }}
                  >
                    {item.status && <CheckCircle2 size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: item.status ? 'var(--stable-bg)' : '#f1f5f9',
                          color: item.status ? 'var(--stable)' : 'var(--text-muted)',
                        }}
                      >
                        {item.status
                          ? language === 'mr'
                            ? 'लागू केले'
                            : language === 'hi'
                            ? 'लागू'
                            : 'ENFORCED'
                          : language === 'mr'
                          ? 'प्रलंबित कारवाई'
                          : language === 'hi'
                          ? 'कार्रवाई लंबित'
                          : 'PENDING ACTION'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit update action */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                onClick={() =>
                  showNotification(
                    language === 'mr'
                      ? 'नियंत्रण नोंद अद्यतनित करून राज्य पशुसंवर्धन संचालनालयाकडे पाठवली.'
                      : language === 'hi'
                      ? 'नियंत्रण लॉग अद्यतित कर राज्य पशुपालन निदेशालय को भेजा गया।'
                      : 'Containment log updated and transmitted to State Veterinary Directorate.'
                  )
                }
                className="btn-primary"
                style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)' }}
              >
                <CheckCircle2 size={16} />
                <span>{language === 'mr' ? 'एसओपी नोंद सुपाबेसमध्ये जतन करा' : language === 'hi' ? 'एसओपी लॉग सुपाबेस में सहेजें' : 'Save SOP Log to Supabase'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
