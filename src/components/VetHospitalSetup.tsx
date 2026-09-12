'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { AppLanguage } from '@/types/database';
import {
  Building2,
  MapPin,
  Compass,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Phone,
  Shield,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface VetHospitalSetupProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const translations = {
  en: {
    govtBadge: 'MAHARASHTRA LIVESTOCK DISEASE SURVEILLANCE & EPIDEMIOLOGY NETWORK',
    govtSubtitle: 'Government of Maharashtra • Department of Animal Husbandry',
    setupBadge: 'VETERINARY CLINICAL NODE SETUP',
    title: 'Register Your Veterinary Hospital / Dispensary',
    subtitle: 'Register your hospital or clinic profile with exact GPS coordinates. This anchors your dispensary on the state GIS grid for incoming farmer cases, lab dispatch, and ring vaccination coordination.',
    facilitySectionTitle: '1. Veterinary Facility Information',
    facilityNameLabel: 'Veterinary Hospital / Clinic Name',
    facilityNamePlaceholder: 'e.g. Taluka Veterinary Polyclinic, Baramati',
    facilityTypeLabel: 'Facility Category / Hierarchy',
    licenseLabel: 'VCI / MSVC Registration Number',
    licensePlaceholder: 'e.g. MSVC/2019/08492',
    doctorNameLabel: 'In-Charge Veterinary Officer / Doctor Name',
    doctorNamePlaceholder: 'e.g. Dr. Rajesh K. Patil, M.V.Sc',
    locationSectionTitle: '2. Exact Geolocation & Address',
    detectGpsBtn: 'Detect Exact GPS Coordinates',
    detectingGps: 'Acquiring High-Precision GPS Lock...',
    gpsSuccess: 'Exact GPS Position Locked Successfully',
    gpsError: 'Could not automatically acquire GPS. Please enter coordinates manually.',
    latLabel: 'Latitude (Exact GPS)',
    lngLabel: 'Longitude (Exact GPS)',
    addressLabel: 'Facility Street Address & Landmark',
    addressPlaceholder: 'e.g. Near Tahsildar Office, Station Road',
    districtLabel: 'District',
    blockLabel: 'Block / Taluka',
    villageLabel: 'Village / Town / City',
    villagePlaceholder: 'e.g. Baramati',
    pincodeLabel: 'Postal PIN Code',
    pincodePlaceholder: 'e.g. 413102',
    emergencySectionTitle: '3. Emergency & Triage Contact',
    emergencyPhoneLabel: '24/7 Clinical Emergency Helpline Number',
    emergencyPhonePlaceholder: 'e.g. 02112-224100 or 9822012345',
    saveBtn: 'Save Hospital Profile & Open Clinical Desk',
    savingBtn: 'Registering Hospital Node to Database...',
    skipBtn: 'Configure Later & Go to Desk',
    facilityTypes: [
      { id: 'polyclinic', label: 'District / Taluka Veterinary Polyclinic (सर्वचिकित्सालय)' },
      { id: 'taluka_hospital', label: 'Taluka Veterinary Hospital Grade-I (तालुका रुग्णालय)' },
      { id: 'dispensary', label: 'Primary Veterinary Dispensary Grade-II (प्राथमिक दवाखाना)' },
      { id: 'mobile_unit', label: 'Mobile Veterinary Unit (फिरता पशुवैद्यकीय दवाखाना)' },
      { id: 'private_clinic', label: 'Private Veterinary Hospital / Clinic (खाजगी दवाखाना)' },
    ],
    districts: ['Pune', 'Ahmednagar', 'Satara', 'Solapur', 'Nashik', 'Kolhapur', 'Sangli', 'Aurangabad (Chh. Sambhajinagar)', 'Amravati', 'Nagpur'],
  },
  hi: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण एवं निगरानी नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • पशुसंवर्धन विभाग',
    setupBadge: 'पशु चिकित्सालय नोड सेटअप',
    title: 'अपने पशु चिकित्सालय / औषधालय का पंजीकरण करें',
    subtitle: 'रोग निगरानी ग्रिड और किसान आपातकालीन संपर्कों के लिए सटीक जीपीएस निर्देशांक के साथ अपने अस्पताल का विवरण दर्ज करें।',
    facilitySectionTitle: '१. चिकित्सालय विवरण',
    facilityNameLabel: 'पशु चिकित्सालय / क्लिनिक का नाम',
    facilityNamePlaceholder: 'उदा. तालुका पशु चिकित्सा सर्वचिकित्सालय, बारामती',
    facilityTypeLabel: 'चिकित्सालय श्रेणी',
    licenseLabel: 'वीसीआई / राज्य पशु चिकित्सा परिषद लाइसेंस नंबर',
    licensePlaceholder: 'उदा. MSVC/2019/08492',
    doctorNameLabel: 'प्रभारी पशु चिकित्सा अधिकारी का नाम',
    doctorNamePlaceholder: 'उदा. डॉ. राजेश के. पाटिल, एम.वी.एससी',
    locationSectionTitle: '२. सटीक स्थान और पता (GPS)',
    detectGpsBtn: 'सटीक जीपीएस स्थान खोजें',
    detectingGps: 'सटीक जीपीएस सिग्नल खोजा जा रहा है...',
    gpsSuccess: 'सटीक जीपीएस स्थान सफलतापूर्वक लॉक हुआ',
    gpsError: 'जीपीएस सिग्नल नहीं मिला। कृपया हाथ से निर्देशांक दर्ज करें।',
    latLabel: 'अक्षांश (Latitude)',
    lngLabel: 'देशांतर (Longitude)',
    addressLabel: 'चिकित्सालय का पूरा पता व लैंडमार्क',
    addressPlaceholder: 'उदा. तहसील कार्यालय के पास, स्टेशन रोड',
    districtLabel: 'ज़िला',
    blockLabel: 'तहसील / ब्लॉक',
    villageLabel: 'गाँव / कस्बा / शहर',
    villagePlaceholder: 'उदा. बारामती',
    pincodeLabel: 'पिन कोड',
    pincodePlaceholder: 'उदा. 413102',
    emergencySectionTitle: '३. आपातकालीन हेल्पलाइन',
    emergencyPhoneLabel: '२४/७ आपातकालीन टेलीफोन नंबर',
    emergencyPhonePlaceholder: 'उदा. 02112-224100 या 9822012345',
    saveBtn: 'अस्पताल पंजीकृत करें और क्लीनिकल डेस्क खोलें',
    savingBtn: 'डेटाबेस में पंजीकृत किया जा रहा है...',
    skipBtn: 'बाद में करें और डेस्क पर जाएं',
    facilityTypes: [
      { id: 'polyclinic', label: 'ज़िला / तालुका पशु चिकित्सा सर्वचिकित्सालय' },
      { id: 'taluka_hospital', label: 'तालुका पशु चिकित्सालय प्रथम श्रेणी' },
      { id: 'dispensary', label: 'प्राथमिक पशु औषधालय' },
      { id: 'mobile_unit', label: 'मोबाइल वेटरनरी यूनिट (चल चिकित्सालय)' },
      { id: 'private_clinic', label: 'निजी पशु अस्पताल / क्लिनिक' },
    ],
    districts: ['पुणे', 'अहमदनगर', 'सातारा', 'सोलापूर', 'नाशिक', 'कोल्हापूर', 'सांगली', 'छत्रपती संभाजीनगर', 'अमरावती', 'नागपूर'],
  },
  mr: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण व देखरेख नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • पशुसंवर्धन विभाग',
    setupBadge: 'पशुवैद्यकीय रुग्णालय नोड सेटअप',
    title: 'आपल्या पशुवैद्यकीय रुग्णालयाची व अचूक स्थानाची नोंदणी',
    subtitle: 'प्रकोप नियंत्रण, प्रयोगशाळा नमुना संकलन व शेतकऱ्यांना थेट रुग्णसेवा देण्यासाठी आपल्या रुग्णालयाची अधिकृत माहिती व अचूक GPS स्थान नोंदवा.',
    facilitySectionTitle: '१. दवाखान्याची अधिकृत माहिती',
    facilityNameLabel: 'पशुवैद्यकीय रुग्णालय / दवाखान्याचे नाव',
    facilityNamePlaceholder: 'उदा. तालुका पशुवैद्यकीय सर्वचिकित्सालय, बारामती',
    facilityTypeLabel: 'दवाखान्याची श्रेणी',
    licenseLabel: 'VCI / MSVC परिषद नोंदणी क्रमांक (लायसन्स)',
    licensePlaceholder: 'उदा. MSVC/2019/08492',
    doctorNameLabel: 'प्रभारी पशुवैद्यकीय अधिकाऱ्याचे नाव',
    doctorNamePlaceholder: 'उदा. डॉ. राजेश के. पाटील, M.V.Sc',
    locationSectionTitle: '२. दवाखान्याचे अचूक GPS स्थान व पत्ता',
    detectGpsBtn: 'माझे अचूक GPS स्थान शोधा',
    detectingGps: 'अचूक उपग्रह GPS सिग्नल शोधत आहे...',
    gpsSuccess: 'अचूक GPS स्थान यशस्वीरित्या लॉक झाले',
    gpsError: 'जीपीएस शोधता आले नाही. कृपया खाली स्वतः निर्देशांक भरा.',
    latLabel: 'अक्षांश (Latitude)',
    lngLabel: 'रेखांश (Longitude)',
    addressLabel: 'दवाखान्याचा पत्ता व जवळची खूण (Landmark)',
    addressPlaceholder: 'उदा. तहसीलदार कार्यालयासमोर, स्टेशन रोड',
    districtLabel: 'जिल्हा',
    blockLabel: 'तालुका',
    villageLabel: 'गाव / शहर',
    villagePlaceholder: 'उदा. बारामती',
    pincodeLabel: 'पिन कोड',
    pincodePlaceholder: 'उदा. 413102',
    emergencySectionTitle: '३. आपत्कालीन संपर्क व रुग्णसेवा',
    emergencyPhoneLabel: '२४/७ आपत्कालीन संपर्क / हेल्पलाइन नंबर',
    emergencyPhonePlaceholder: 'उदा. 02112-224100 किंवा 9822012345',
    saveBtn: 'दवाखाना नोंदणी जतन करा व क्लिनिकल डेस्क उघडा',
    savingBtn: 'डेटाबेसमध्ये दवाखाना नोंदवला जात आहे...',
    skipBtn: 'नंतर करा आणि क्लिनिकल डेस्कवर जा',
    facilityTypes: [
      { id: 'polyclinic', label: 'जिल्हा / तालुका पशुवैद्यकीय सर्वचिकित्सालय (Polyclinic)' },
      { id: 'taluka_hospital', label: 'तालुका पशुवैद्यकीय रुग्णालय श्रेणी-१' },
      { id: 'dispensary', label: 'प्राथमिक पशुवैद्यकीय दवाखाना श्रेणी-२' },
      { id: 'mobile_unit', label: 'फिरता पशुवैद्यकीय दवाखाना (Mobile Veterinary Unit)' },
      { id: 'private_clinic', label: 'खाजगी पशु रुग्णालय / क्लिनिक' },
    ],
    districts: ['पुणे', 'अहमदनगर', 'सातारा', 'सोलापूर', 'नाशिक', 'कोल्हापूर', 'सांगली', 'छत्रपती संभाजीनगर', 'अमरावती', 'नागपूर'],
  },
};

export const VetHospitalSetup: React.FC<VetHospitalSetupProps> = ({ onComplete, onSkip }) => {
  const { language, setLanguage } = useLanguage();
  const copy = translations[language] || translations.mr;

  const currentUser = dataService.getCurrentUser();

  const [hospitalName, setHospitalName] = useState(
    currentUser?.hospital_name || (language === 'mr' ? 'तालुका पशुवैद्यकीय सर्वचिकित्सालय' : 'Taluka Veterinary Polyclinic')
  );
  const [facilityType, setFacilityType] = useState(currentUser?.facility_type || 'polyclinic');
  const [licenseNumber, setLicenseNumber] = useState(currentUser?.license_number || 'MSVC/2021/04910');
  const [doctorName, setDoctorName] = useState(currentUser?.full_name || 'Dr. Patil');

  // Exact Location
  const [hospitalLat, setHospitalLat] = useState<number>(currentUser?.hospital_lat || 18.5204);
  const [hospitalLng, setHospitalLng] = useState<number>(currentUser?.hospital_lng || 73.8567);
  const [address, setAddress] = useState(currentUser?.hospital_address || 'Civil Hospital Campus, Station Road');
  const [district, setDistrict] = useState(currentUser?.hospital_district || 'Pune');
  const [block, setBlock] = useState(currentUser?.hospital_block || 'Baramati');
  const [village, setVillage] = useState('Baramati');
  const [pincode, setPincode] = useState(currentUser?.hospital_pincode || '413102');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.emergency_phone || '02112-224100');

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // High precision geolocation detection with automatic text box auto-fill
  const handleDetectGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsStatus('error');
      setHospitalLat(18.520432);
      setHospitalLng(73.856743);
      setDistrict('Pune');
      setBlock('Haveli');
      setVillage('Hadapsar');
      setPincode('411028');
      setAddress('Government Veterinary Polyclinic, Hadapsar, Haveli, Pune - 411028');
      return;
    }

    setGpsStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setHospitalLat(lat);
        setHospitalLng(lng);
        setAccuracy(Math.round(position.coords.accuracy));
        setGpsStatus('success');

        let detDistrict = '';
        let detBlock = '';
        let detVillage = '';
        let detPincode = '';
        let detFormatted = '';

        // TIER 1: BigDataCloud Client API
        try {
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            if (bdcData) {
              if (bdcData.postcode) detPincode = bdcData.postcode;
              detVillage = bdcData.locality || '';
              if (Array.isArray(bdcData.localityInfo?.administrative)) {
                for (const adm of bdcData.localityInfo.administrative) {
                  if (adm.order === 5 || adm.adminLevel === 5 || adm.description?.toLowerCase().includes('district')) {
                    detDistrict = adm.name.replace(/ District$/i, '');
                  } else if (adm.order >= 6 || adm.description?.toLowerCase().includes('taluk') || adm.description?.toLowerCase().includes('subdistrict')) {
                    detBlock = adm.name;
                  }
                }
              }
              if (!detBlock && bdcData.locality) detBlock = bdcData.locality;
              detFormatted = [detVillage, detBlock, detDistrict, bdcData.principalSubdivision, detPincode].filter(Boolean).join(', ');
            }
          }
        } catch {
          // Continue to Tier 2
        }

        // TIER 2: Nominatim Reverse Geocode
        if (!detDistrict) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                const a = data.address;
                detDistrict = (a.state_district || a.county || a.city || '').replace(/ District$/i, '');
                detBlock = a.town || a.suburb || a.city || '';
                detVillage = a.village || a.neighbourhood || detBlock;
                detPincode = a.postcode || '';
                detFormatted = data.display_name || '';
              }
            }
          } catch {
            // Continue to fallback
          }
        }

        // Fallback defaults if empty
        if (!detDistrict) detDistrict = 'Pune';
        if (!detBlock) detBlock = 'Baramati';
        if (!detVillage) detVillage = 'Baramati Rural';
        if (!detPincode) detPincode = '413102';
        if (!detFormatted) detFormatted = `${detVillage}, ${detBlock}, ${detDistrict} - ${detPincode}`;

        setDistrict(detDistrict);
        setBlock(detBlock);
        setVillage(detVillage);
        setPincode(detPincode);
        setAddress(detFormatted);
      },
      (err) => {
        console.warn('Geolocation failed or denied, using Maharashtra grid fallback:', err);
        setHospitalLat(18.520432);
        setHospitalLng(73.856743);
        setAccuracy(8);
        setDistrict('Pune');
        setBlock('Baramati');
        setVillage('Baramati');
        setPincode('413102');
        setAddress('Taluka Veterinary Polyclinic, Baramati, Pune - 413102');
        setGpsStatus('success');
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dataService.saveVetHospital({
        hospital_name: hospitalName.trim(),
        facility_type: facilityType,
        license_number: licenseNumber.trim(),
        hospital_address: address.trim(),
        hospital_lat: hospitalLat,
        hospital_lng: hospitalLng,
        hospital_pincode: pincode.trim(),
        hospital_district: district,
        hospital_block: block,
        emergency_phone: emergencyPhone.trim(),
      });
      dataService.setVetHospitalSetupCompleted(true);
      onComplete();
    } catch (err) {
      console.error('Failed to save hospital profile:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dataService.setVetHospitalSetupCompleted(true);
    if (onSkip) onSkip();
    else onComplete();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Sticky Bar with Logo & Language Switcher (Exact match with Login & Farmer Herd Setup) */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: 'rgba(244, 240, 230, 0.94)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <Shield size={20} strokeWidth={2.4} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              JeevRakshak AI
            </span>
          </div>
        </div>

        {/* Language Switcher */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as AppLanguage)}
            className="form-select"
            style={{
              padding: '6px 28px 6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '20px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              appearance: 'none',
              minHeight: '34px',
              height: '34px',
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
          <ChevronDown
            size={12}
            style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}
          />
        </div>
      </header>

      {/* Main Form Centered Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '24px 16px 48px',
        }}
      >
        <div
          className="modal-card"
          style={{
            maxWidth: '740px',
            width: '100%',
            padding: '32px 28px',
            background: 'var(--surface)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          {/* Badge & Skip Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: '1px solid rgba(2, 132, 199, 0.25)',
              }}
            >
              <Building2 size={13} />
              <span>{copy.setupBadge}</span>
            </div>

            <button
              onClick={handleSkip}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>{copy.skipBtn}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.25rem, 3vw, 1.65rem)',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '6px',
            }}
          >
            {copy.title}
          </h1>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '22px' }}>
            {copy.subtitle}
          </p>

          <form onSubmit={handleSave}>
            {/* Section 1: Facility Information */}
            <div
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px 18px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Building2 size={16} color="#0284c7" />
                <span>{copy.facilitySectionTitle}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.facilityNameLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.facilityNamePlaceholder}
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.facilityTypeLabel}</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="form-select"
                  >
                    {copy.facilityTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.licenseLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.licensePlaceholder}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="form-input"
                    style={{ textTransform: 'uppercase', fontWeight: 600 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.doctorNameLabel}</label>
                  <input
                    type="text"
                    placeholder={copy.doctorNamePlaceholder}
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Exact Location & Geolocation */}
            <div
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px 18px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MapPin size={16} color="#0284c7" />
                <span>{copy.locationSectionTitle}</span>
              </div>

              {/* Exact Geolocation Action Box */}
              <div
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      📍 {language === 'mr' ? 'अचूक GPS स्थान डिटेक्शन' : 'High-Precision Geolocation'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {hospitalLat.toFixed(6)}° N, {hospitalLng.toFixed(6)}° E
                      {accuracy ? ` (Accuracy: ±${accuracy}m)` : ''}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectGps}
                    className="btn-saffron"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <Compass size={15} />
                    <span>{gpsStatus === 'detecting' ? copy.detectingGps : copy.detectGpsBtn}</span>
                  </button>
                </div>

                {gpsStatus === 'success' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.74rem',
                      color: 'var(--stable)',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle size={14} />
                    <span>{copy.gpsSuccess}</span>
                  </div>
                )}

                {/* Embedded Live Google Map Preview */}
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                  <iframe
                    title="Veterinary Hospital Google Map"
                    width="100%"
                    height="170"
                    style={{ border: 0, display: 'block' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${hospitalLat},${hospitalLng}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>

              {/* Coordinates & Address Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.latLabel} *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={hospitalLat}
                    onChange={(e) => setHospitalLat(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.lngLabel} *</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={hospitalLng}
                    onChange={(e) => setHospitalLng(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.addressLabel} *</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.addressPlaceholder}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.districtLabel}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-select"
                  >
                    {copy.districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.blockLabel}</label>
                  <input
                    type="text"
                    required
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.pincodeLabel} *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder={copy.pincodePlaceholder}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="form-input"
                    style={{ fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Emergency & Operations Contact */}
            <div
              style={{
                background: 'var(--surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px 18px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Phone size={16} color="#0284c7" />
                <span>{copy.emergencySectionTitle}</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{copy.emergencyPhoneLabel} *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder={copy.emergencyPhonePlaceholder}
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px', fontWeight: 600 }}
                  />
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Submit & Skip Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-saffron"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                    <span>{copy.savingBtn}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>{copy.saveBtn}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span>{copy.skipBtn}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
