'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { UserRole, AppLanguage } from '@/types/database';
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  User,
  MapPin,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Globe,
  Radio,
  ChevronDown,
  Building2,
  Stethoscope,
  ClipboardList,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LandingAndOnboardingProps {
  onComplete: (role: UserRole) => void;
}

const ONBOARDING_I18N = {
  en: {
    govtBadge: 'Maharashtra State Livestock Disease Surveillance Network',
    govtSubtitle: 'Govt. of Maharashtra • Problem #26128',
    heroTitle1: 'Protect Every Herd.',
    heroTitle2: 'Detect Risk Before It Spreads.',
    heroSub:
      'A unified, real-time platform for dairy farmers, field workers, and veterinarians to report symptoms, trigger AI triage, and contain animal health outbreaks across Maharashtra.',
    getStarted: 'Get Started',
    signIn: 'Sign In',
    skipGuest: 'Skip setup & explore live demo as Guest',
    pillar1Title: 'AI Triage Engine',
    pillar1Desc: 'Immediate preliminary diagnosis and risk classification from farmer symptoms.',
    pillar2Title: 'GIS Outbreak Map',
    pillar2Desc: 'Block and village cluster heatmap with 50m precision to halt disease spread.',
    pillar3Title: 'Herd Health Ledger',
    pillar3Desc: 'Complete animal profiles, vaccination countdowns, treatments, and lab tests.',
    pillar4Title: 'Tri-lingual Alerts',
    pillar4Desc: 'Monsoon weather observations and veterinary advisories in Marathi, Hindi & English.',
    stat1Label: 'Herds Monitored',
    stat2Label: 'Early Warning Accuracy',
    stat3Label: 'Pune Talukas Active',
    stat4Label: 'Vet Escalation SLA',
    step1Title: 'Choose Your Preferred Language',
    step1Sub: 'You can change this anytime from the top bar or settings.',
    continue: 'Continue',
    back: 'Back',
    step2Title: 'Select Your Role',
    step2Sub: 'This configures your tools, permissions, and default view.',
    roles: {
      farmer: {
        title: 'Farmer (पशुपालक)',
        desc: 'Manage your herd, track vaccinations, and report symptoms for immediate advice',
      },
      veterinarian: {
        title: 'Veterinarian (पशुवैद्यक)',
        desc: 'Review clinical cases, prescribe treatments, and order lab tests',
      },
      field_worker: {
        title: 'Field Worker (क्षेत्रीय कार्यकर्ता)',
        desc: 'Support village reporting, diagnostic sample collection, and farmer outreach',
      },
      government: {
        title: 'Government Official (शासकीय अधिकारी)',
        desc: 'District & block surveillance, outbreak heatmap, and containment SOPs',
      },
    },
    step3Title: 'Set Your Location',
    step3Sub: 'Links your profile to Maharashtra administrative boundaries for early outbreak alerts.',
    district: 'District',
    block: 'Block / Taluka',
    village: 'Village / Gram Panchayat',
    gpsNode: 'GPS Node: 18.8120° N, 74.3910° E • Shirur Taluka, Pune',
    step4Title: 'Create Account & Setup Profile',
    step4Sub: 'Saved securely to Supabase PostgreSQL under Government of Maharashtra security policies.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Suresh Rambhau Shinde',
    farmName: 'Farm / Herd Name',
    farmNamePlaceholder: 'e.g. Shinde Dairy Farm',
    mobile: 'Mobile Number',
    mobilePlaceholder: '10-digit mobile number (e.g. 9823012345)',
    compulsoryBadge: 'Compulsory',
    email: 'Email Address',
    emailPlaceholder: 'Optional (leave blank if you do not use email)',
    optionalBadge: 'Optional',
    password: 'Password',
    passwordPlaceholder: 'Create password (min 6 characters)',
    livestockCount: 'Approximate Number of Livestock',
    finishBtn: 'Finish Setup & Launch',
    authenticating: 'Authenticating with Supabase...',
    signInTitle: 'Sign in to JeevRakshak',
    signInSub: 'Enter your registered mobile number or email and password.',
    loginLabel: 'Mobile Number or Email',
    loginPlaceholder: 'e.g. 9823012345 or user@email.com',
    passwordLabel: 'Password',
    noAccount: "Don't have an account yet?",
    registerHere: 'Register here',
    fillRequired: 'Please fill in Full Name, Phone Number, and Password.',
    enterLoginPass: 'Please enter your Phone or Email, and Password.',
  },
  hi: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण एवं निगरानी नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • समस्या #26128',
    heroTitle1: 'हर पशुधन की सुरक्षा।',
    heroTitle2: 'बीमारी फैलने से पहले पहचान।',
    heroSub:
      'महाराष्ट्र में पशुपालकों, क्षेत्रीय कार्यकर्ताओं और पशु चिकित्सकों के लिए लक्षण रिपोर्टिंग, एआई जांच और बीमारी नियंत्रण का एकीकृत मंच।',
    getStarted: 'शुरू करें',
    signIn: 'साइन इन करें',
    skipGuest: 'सेटअप छोड़ें और अतिथि के रूप में डेमो देखें',
    pillar1Title: 'एआई जांच इंजन',
    pillar1Desc: 'लक्षणों के आधार पर तत्काल प्रारंभिक रोग पहचान और जोखिम वर्गीकरण।',
    pillar2Title: 'जीआईएस प्रकोप नक्शा',
    pillar2Desc: 'तहसील और गांव स्तर पर बीमारी प्रसार रोकने के लिए 50 मीटर सटीक हीटमैप।',
    pillar3Title: 'पशुधन स्वास्थ्य बहीखाता',
    pillar3Desc: 'पशु प्रोफाइल, टीकाकरण उलटी गिनती, उपचार और प्रयोगशाला परीक्षण।',
    pillar4Title: 'त्रिभाषी स्वास्थ्य अलर्ट',
    pillar4Desc: 'मानसून मौसम और पशु चिकित्सा सलाह हिंदी, मराठी और अंग्रेजी में।',
    stat1Label: 'निगरानी में गोशालाएं',
    stat2Label: 'पूर्व चेतावनी सटीकता',
    stat3Label: 'सक्रिय तालुकाएं',
    stat4Label: 'पशु चिकित्सक प्रतिक्रिया',
    step1Title: 'अपनी पसंदीदा भाषा चुनें',
    step1Sub: 'आप इसे बाद में कभी भी ऊपर से बदल सकते हैं।',
    continue: 'आगे बढ़ें',
    back: 'पीछे जाएं',
    step2Title: 'अपनी भूमिका चुनें',
    step2Sub: 'आपके कार्य के अनुसार उपकरण और अनुमतियां निर्धारित की जाती हैं।',
    roles: {
      farmer: {
        title: 'पशुपालक (Farmer)',
        desc: 'पशु प्रबंधन, टीकाकरण ट्रैकिंग और तत्काल सलाह के लिए बीमारी लक्षण रिपोर्टिंग',
      },
      veterinarian: {
        title: 'पशु चिकित्सक (Veterinarian)',
        desc: 'क्लिनिकल मामलों की जांच, उपचार परामर्श और लैब परीक्षण आदेश',
      },
      field_worker: {
        title: 'क्षेत्रीय कार्यकर्ता (Field Worker)',
        desc: 'गांव में लक्षण रिपोर्टिंग, नमूना संग्रह और किसान सहायता',
      },
      government: {
        title: 'शासकीय अधिकारी (Government)',
        desc: 'जिला और ब्लॉक निगरानी, प्रकोप मानचित्र और रोकथाम एसओपी',
      },
    },
    step3Title: 'अपना स्थान चुनें',
    step3Sub: 'स्थानीय बीमारी अलर्ट के लिए अपना प्रशासनिक क्षेत्र चुनें।',
    district: 'जिला (District)',
    block: 'तहसील / तालुका (Block)',
    village: 'गांव / ग्राम पंचायत (Village)',
    gpsNode: 'जीपीएस नोड: 18.8120° N, 74.3910° E • शिरूर तालुका, पुणे',
    step4Title: 'खाता बनाएं और प्रोफाइल सेट करें',
    step4Sub: 'महाराष्ट्र सरकार के सुरक्षा मानकों के तहत सुरक्षित डेटाबेस में सहेजा जाएगा।',
    fullName: 'पूरा नाम',
    fullNamePlaceholder: 'उदा. सुरेश रामभाऊ शिंदे',
    farmName: 'डेयरी / फार्म का नाम',
    farmNamePlaceholder: 'उदा. शिंदे डेयरी फार्म',
    mobile: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर (उदा. 9823012345)',
    compulsoryBadge: 'अनिवार्य',
    email: 'ईमेल पता',
    emailPlaceholder: 'ऐच्छिक (ईमेल नहीं है तो खाली छोड़ सकते हैं)',
    optionalBadge: 'ऐच्छिक',
    password: 'पासवर्ड',
    passwordPlaceholder: 'पासवर्ड बनाएं (कम से कम 6 अक्षर)',
    livestockCount: 'कुल पशुओं की संख्या',
    finishBtn: 'पंजीकरण पूरा करें और शुरू करें',
    authenticating: 'सुपाबेस से प्रमाणित किया जा रहा है...',
    signInTitle: 'जीवरक्षक में साइन इन करें',
    signInSub: 'अपना पंजीकृत मोबाइल नंबर या ईमेल और पासवर्ड दर्ज करें।',
    loginLabel: 'मोबाइल नंबर या ईमेल',
    loginPlaceholder: 'उदा. 9823012345 या user@email.com',
    passwordLabel: 'पासवर्ड',
    noAccount: 'खाता नहीं है?',
    registerHere: 'यहां रजिस्टर करें',
    fillRequired: 'कृपया पूरा नाम, मोबाइल नंबर और पासवर्ड भरें।',
    enterLoginPass: 'कृपया अपना फोन या ईमेल, और पासवर्ड दर्ज करें।',
  },
  mr: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण व सर्वेक्षण प्रणाली',
    govtSubtitle: 'महाराष्ट्र शासन • समस्या #26128',
    heroTitle1: 'प्रत्येक पशुधनाचे रक्षण.',
    heroTitle2: 'प्रादुर्भाव पसरण्यापूर्वीच प्रतिबंध.',
    heroSub:
      'महाराष्ट्रातील शेतकरी, क्षेत्रीय कार्यकर्ते आणि पशुवैद्यकांसाठी लक्षण नोंदणी, एआय निदान आणि साथरोग नियंत्रणाचे एकात्मिक व्यासपीठ.',
    getStarted: 'प्रारंभ करा',
    signIn: 'साइन इन करा',
    skipGuest: 'थेट अतिथी म्हणून प्रणाली पहा',
    pillar1Title: 'एआय निदान प्रणाली',
    pillar1Desc: 'शेतकऱ्यांनी नोंदवलेल्या लक्षणांवरून तात्काळ प्राथमिक आजार निदान व जोखीम वर्गीकरण.',
    pillar2Title: 'जीआयएस उद्रेक नकाशा',
    pillar2Desc: 'तालुका व गाव पातळीवर ५० मीटर अचूकतेसह रोग प्रसार रोखण्यासाठी थेट नकाशा.',
    pillar3Title: 'पशुधन आरोग्य नोंदवही',
    pillar3Desc: 'संपूर्ण जनावरांची प्रोफाइल, लसीकरण वेळापत्रक, उपचार आणि प्रयोगशाळा तपासण्या.',
    pillar4Title: 'त्रिभाषिक हवामान सल्ला',
    pillar4Desc: 'मान्सून हवामान नोंदी आणि पशुवैद्यकीय सूचना मराठी, हिंदी आणि इंग्रजीत.',
    stat1Label: 'निरीक्षणाखालील गोठे',
    stat2Label: 'पूर्वसूचना अचूकता',
    stat3Label: 'पुणे जिल्ह्यातील तालुके',
    stat4Label: 'पशुवैद्यकीय प्रतिसाद',
    step1Title: 'आपली पसंतीची भाषा निवडा',
    step1Sub: 'तुम्ही हे नंतर कधीही वरच्या पट्टीवरून बदलू शकता.',
    continue: 'पुढे जा',
    back: 'मागे जा',
    step2Title: 'तुमची भूमिका निवडा',
    step2Sub: 'तुमच्या दैनंदिन कामकाजानुसार साधने आणि परवानग्या उपलब्ध होतील.',
    roles: {
      farmer: {
        title: 'पशुपालक / शेतकरी (Farmer)',
        desc: 'गोठ्यातील जनावरांचे व्यवस्थापन, लसीकरण ट्रॅकिंग आणि आजार लक्षण नोंदणी',
      },
      veterinarian: {
        title: 'पशुवैद्यक (Veterinarian)',
        desc: 'क्लिनिकल केसेस तपासणे, औषधोपचार नोंदवणे आणि लॅब टेस्ट पाठवणे',
      },
      field_worker: {
        title: 'पशुधन पर्यवेक्षक (Field Worker)',
        desc: 'गावातील लक्षण नोंदणी, नमुने संकलन (Swab/Blood) आणि शेतकरी संपर्क',
      },
      government: {
        title: 'शासकीय अधिकारी (Government - DAHO)',
        desc: 'जिल्हा व तालुका साथरोग सर्वेक्षण, उद्रेक नकाशा आणि प्रतिबंधात्मक SOP अंमलबजावणी',
      },
    },
    step3Title: 'आपले कार्यक्षेत्र / स्थान निवडा',
    step3Sub: 'स्थानिक साथरोग सतर्कतेसाठी तुमचे खाते महाराष्ट्र प्रशासकीय कार्यक्षेत्राशी जोडले जाईल.',
    district: 'जिल्हा (District)',
    block: 'तालुका (Taluka)',
    village: 'गाव / ग्रामपंचायत (Village)',
    gpsNode: 'जीपीएस नोड: 18.8120° N, 74.3910° E • शिरूर तालुका, पुणे',
    step4Title: 'खाते तयार करा आणि नोंदणी पूर्ण करा',
    step4Sub: 'महाराष्ट्र शासनाच्या मानकांनुसार सुरक्षित सुपाबेस डेटाबेसमध्ये साठवले जाईल.',
    fullName: 'पूर्ण नाव',
    fullNamePlaceholder: 'उदा. सुरेश रामभाऊ शिंदे',
    farmName: 'गोठ्याचे / डेअरीचे नाव',
    farmNamePlaceholder: 'उदा. शिंदे डेअरी फार्म',
    mobile: 'मोबाईल क्रमांक',
    mobilePlaceholder: '१० अंकी मोबाईल नंबर (उदा. 9823012345)',
    compulsoryBadge: 'अनिवार्य',
    email: 'ईमेल पत्ता',
    emailPlaceholder: 'ऐच्छिक (ईमेल नसल्यास रिकामे ठेवावे)',
    optionalBadge: 'ऐच्छिक',
    password: 'पासवर्ड',
    passwordPlaceholder: 'पासवर्ड तयार करा (किमान ६ अक्षरे)',
    livestockCount: 'एकूण पशुधन संख्या',
    finishBtn: 'नोंदणी पूर्ण करा आणि सुरू करा',
    authenticating: 'सुपाबेस द्वारे प्रमाणीकरण सुरू आहे...',
    signInTitle: 'जीवरक्षक मध्ये लॉग इन करा',
    signInSub: 'आपला नोंदणीकृत मोबाईल नंबर किंवा ईमेल आणि पासवर्ड टाका.',
    loginLabel: 'मोबाईल नंबर किंवा ईमेल',
    loginPlaceholder: 'उदा. 9823012345 किंवा email@domain.com',
    passwordLabel: 'पासवर्ड',
    noAccount: 'अद्याप खाते नाही का?',
    registerHere: 'येथे नोंदणी करा',
    fillRequired: 'कृपया पूर्ण नाव, मोबाईल क्रमांक आणि पासवर्ड भरा.',
    enterLoginPass: 'कृपया आपला फोन किंवा ईमेल, आणि पासवर्ड टाका.',
  },
};

export const LandingAndOnboarding: React.FC<LandingAndOnboardingProps> = ({ onComplete }) => {
  const { language, setLanguage } = useLanguage();
  const copy = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

  // View modes: 'hero' | 'onboarding' | 'signin'
  const [viewMode, setViewMode] = useState<'hero' | 'onboarding' | 'signin'>('hero');
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedBlock, setSelectedBlock] = useState('Shirur');
  const [selectedVillage, setSelectedVillage] = useState('Shirapur');
  const [farmName, setFarmName] = useState('Shinde Dairy Farm');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [herdSize, setHerdSize] = useState('18');

  // Sign In states
  const [signInLogin, setSignInLogin] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim() || !fullName.trim()) {
      setErrorMsg(copy.fillRequired);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(language === 'mr' ? 'पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे.' : language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const locationId = `loc-${selectedBlock.toLowerCase()}`;
    const res = await dataService.registerUser({
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password.trim(),
      role: selectedRole,
      location_id: locationId,
      farm_name: selectedRole === 'farmer' ? farmName.trim() : undefined,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onComplete(selectedRole);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInLogin.trim() || !signInPassword.trim()) {
      setErrorMsg(copy.enterLoginPass);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await dataService.signInUser({
      login: signInLogin.trim(),
      password: signInPassword.trim(),
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onComplete(dataService.getCurrentRole());
    }
  };

  // Quick Demo Guest Bypass
  const handleGuestDemo = () => {
    dataService.setOnboardingCompleted(true);
    onComplete('farmer');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
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
            <Shield size={20} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
                JeevRakshak AI
              </span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  background: '#fef3c7',
                  color: '#92400e',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  border: '1px solid #fde68a',
                }}
              >
                MH-GOVT
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {copy.govtSubtitle}
            </p>
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
              background: '#f1f5f9',
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

      {/* VIEW 1: HERO LANDING PAGE */}
      {viewMode === 'hero' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px 40px' }}>
          <div style={{ maxWidth: '860px', width: '100%', textAlign: 'center', margin: '0 auto' }}>
            {/* Govt Initiative Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--primary)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '18px',
                border: '1px solid var(--primary-border)',
              }}
            >
              <Radio size={14} className="animate-pulse" />
              <span>{copy.govtBadge}</span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 5vw, 3.1rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                color: 'var(--text-main)',
                marginBottom: '14px',
                letterSpacing: '-0.02em',
              }}
            >
              {copy.heroTitle1} <br />
              <span style={{ color: 'var(--primary)' }}>{copy.heroTitle2}</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(0.92rem, 2.5vw, 1.1rem)',
                color: 'var(--text-muted)',
                maxWidth: '680px',
                margin: '0 auto 28px auto',
                lineHeight: 1.55,
              }}
            >
              {copy.heroSub}
            </p>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button
                onClick={() => {
                  setViewMode('onboarding');
                  setOnboardingStep(1);
                  setErrorMsg(null);
                }}
                className="btn-primary"
                style={{ padding: '14px 30px', fontSize: '1rem', borderRadius: 'var(--radius-full)', gap: '8px' }}
              >
                <span>{copy.getStarted}</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => {
                  setViewMode('signin');
                  setErrorMsg(null);
                }}
                className="btn-secondary"
                style={{ padding: '14px 26px', fontSize: '0.95rem', borderRadius: 'var(--radius-full)' }}
              >
                <span>{copy.signIn}</span>
              </button>
            </div>

            {/* Real-time State Stats Counter Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                gap: '10px',
                marginBottom: '32px',
                padding: '14px 16px',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>1,420+</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{copy.stat1Label}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>98.4%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{copy.stat2Label}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>13</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{copy.stat3Label}</div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>&lt; 2 hrs</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{copy.stat4Label}</div>
              </div>
            </div>

            {/* 4 Pillars Feature Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
                gap: '14px',
                textAlign: 'left',
              }}
            >
              <div className="glass-card" style={{ padding: '18px 16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '12px' }}>
                  <Activity size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{copy.pillar1Title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {copy.pillar1Desc}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '18px 16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '12px' }}>
                  <MapPin size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{copy.pillar2Title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {copy.pillar2Desc}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '18px 16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '12px' }}>
                  <Layers size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{copy.pillar3Title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {copy.pillar3Desc}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '18px 16px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '12px' }}>
                  <Globe size={20} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px' }}>{copy.pillar4Title}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {copy.pillar4Desc}
                </p>
              </div>
            </div>

            {/* Quick Demo Bypass */}
            <div style={{ marginTop: '32px' }}>
              <button
                onClick={handleGuestDemo}
                style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                {copy.skipGuest}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ONBOARDING WIZARD */}
      {viewMode === 'onboarding' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 14px' }}>
          <div className="modal-card" style={{ maxWidth: '520px', width: '100%', padding: '24px 20px', boxShadow: 'var(--shadow-lg)' }}>
            {/* Step Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <button
                onClick={() => {
                  if (onboardingStep === 1) setViewMode('hero');
                  else setOnboardingStep((onboardingStep - 1) as any);
                  setErrorMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>{copy.back}</span>
              </button>

              {/* Step indicator dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
                  {onboardingStep} / 4
                </span>
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    style={{
                      width: s === onboardingStep ? '20px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: s <= onboardingStep ? 'var(--primary)' : '#e2e8f0',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'var(--critical-bg)',
                  color: 'var(--critical)',
                  border: '1px solid var(--critical-border)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* STEP 1: CHOOSE LANGUAGE */}
            {onboardingStep === 1 && (
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {copy.step1Title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {copy.step1Sub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {[
                    { id: 'en', title: 'English', desc: 'Administrative & clinical reporting standard' },
                    { id: 'hi', title: 'हिंदी (Hindi)', desc: 'किसानों और पशुपालकों के लिए सरल व सहज भाषा' },
                    { id: 'mr', title: 'मराठी (Marathi)', desc: 'महाराष्ट्र शासन अधिकृत राज्यभाषा' },
                  ].map((lang) => (
                    <div
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as AppLanguage)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-md)',
                        border: language === lang.id ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                        background: language === lang.id ? 'var(--primary-light)' : '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                          {lang.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{lang.desc}</div>
                      </div>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          border: `2px solid ${language === lang.id ? 'var(--primary)' : '#cbd5e1'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: language === lang.id ? 'var(--primary)' : 'transparent',
                        }}
                      >
                        {language === lang.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setOnboardingStep(2)}
                  className="btn-primary"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px' }}
                >
                  <span>{copy.continue}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: SELECT ROLE */}
            {onboardingStep === 2 && (
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {copy.step2Title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  {copy.step2Sub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {[
                    {
                      id: 'farmer',
                      title: copy.roles.farmer.title,
                      desc: copy.roles.farmer.desc,
                      icon: User,
                    },
                    {
                      id: 'veterinarian',
                      title: copy.roles.veterinarian.title,
                      desc: copy.roles.veterinarian.desc,
                      icon: Stethoscope,
                    },
                    {
                      id: 'field_worker',
                      title: copy.roles.field_worker.title,
                      desc: copy.roles.field_worker.desc,
                      icon: ClipboardList,
                    },
                    {
                      id: 'government',
                      title: copy.roles.government.title,
                      desc: copy.roles.government.desc,
                      icon: Building2,
                    },
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id as UserRole)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                          background: isSelected ? 'var(--primary-light)' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--primary)' : '#f1f5f9',
                            color: isSelected ? '#fff' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                            {r.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {r.desc}
                          </div>
                        </div>
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: `2px solid ${isSelected ? 'var(--primary)' : '#cbd5e1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelected ? 'var(--primary)' : 'transparent',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setOnboardingStep(3)}
                  className="btn-primary"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px' }}
                >
                  <span>{copy.continue}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 3: SET LOCATION */}
            {onboardingStep === 3 && (
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {copy.step3Title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  {copy.step3Sub}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div className="form-group">
                    <label className="form-label">{copy.district}</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="form-select"
                    >
                      <option value="Pune">Pune (पुणे)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{copy.block}</label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      className="form-select"
                    >
                      <option value="Shirur">Shirur (शिरूर)</option>
                      <option value="Baramati">Baramati (बारामती)</option>
                      <option value="Haveli">Haveli (हवेली)</option>
                      <option value="Khed">Khed (खेड)</option>
                      <option value="Ambegaon">Ambegaon (आंबेगाव)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{copy.village}</label>
                    <select
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="form-select"
                    >
                      <option value="Shirapur">Shirapur (शिरापूर)</option>
                      <option value="Koregaon Bhima">Koregaon Bhima (कोरेगाव भीमा)</option>
                      <option value="Kavathe">Kavathe (कवठे)</option>
                      <option value="Nimgaon Mhalungi">Nimgaon Mhalungi (निमगाव म्हाळुंगी)</option>
                      <option value="Malegaon">Malegaon (माळेगाव)</option>
                    </select>
                  </div>

                  {/* Detected GPS Coordinates Card */}
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <MapPin size={14} color="var(--primary)" />
                    <span>{copy.gpsNode}</span>
                  </div>
                </div>

                <button
                  onClick={() => setOnboardingStep(4)}
                  className="btn-primary"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px' }}
                >
                  <span>{copy.continue}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 4: AUTHENTICATION & PROFILE CREATION */}
            {onboardingStep === 4 && (
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
                  {copy.step4Title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  {copy.step4Sub}
                </p>

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label">
                      {copy.fullName} <span style={{ color: 'var(--critical)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        required
                        placeholder={copy.fullNamePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px' }}
                      />
                      <User size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  {selectedRole === 'farmer' && (
                    <div className="form-group">
                      <label className="form-label">{copy.farmName}</label>
                      <input
                        type="text"
                        required
                        placeholder={copy.farmNamePlaceholder}
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        {copy.mobile} <span style={{ color: 'var(--critical)' }}>*</span>
                      </label>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(5, 150, 105, 0.1)',
                          color: 'var(--primary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {copy.compulsoryBadge}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="tel"
                        required
                        placeholder={copy.mobilePlaceholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px' }}
                      />
                      <Phone size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        {copy.email}
                      </label>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: 'var(--text-muted)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {copy.optionalBadge}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        placeholder={copy.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px' }}
                      />
                      <Mail size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        {copy.password} <span style={{ color: 'var(--critical)' }}>*</span>
                      </label>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(5, 150, 105, 0.1)',
                          color: 'var(--primary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {copy.compulsoryBadge}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder={copy.passwordPlaceholder}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '34px', paddingRight: '36px' }}
                      />
                      <Lock size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {selectedRole === 'farmer' && (
                    <div className="form-group">
                      <label className="form-label">{copy.livestockCount}</label>
                      <input
                        type="number"
                        min="1"
                        value={herdSize}
                        onChange={(e) => setHerdSize(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px', marginTop: '12px' }}
                  >
                    <span>{loading ? copy.authenticating : copy.finishBtn}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: SIGN IN SCREEN */}
      {viewMode === 'signin' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px 14px' }}>
          <div className="modal-card" style={{ maxWidth: '440px', width: '100%', padding: '28px 22px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <button
                onClick={() => {
                  setViewMode('hero');
                  setErrorMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>{copy.back}</span>
              </button>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
              {copy.signInTitle}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {copy.signInSub}
            </p>

            {errorMsg && (
              <div
                style={{
                  background: 'var(--critical-bg)',
                  color: 'var(--critical)',
                  border: '1px solid var(--critical-border)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">{copy.loginLabel}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder={copy.loginPlaceholder}
                    value={signInLogin}
                    onChange={(e) => setSignInLogin(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px' }}
                  />
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{copy.passwordLabel}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '34px', paddingRight: '36px' }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showSignInPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px', marginTop: '12px' }}
              >
                <span>{loading ? copy.authenticating : copy.signIn}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {copy.noAccount}{' '}
              <button
                onClick={() => {
                  setViewMode('onboarding');
                  setOnboardingStep(1);
                  setErrorMsg(null);
                }}
                style={{
                  color: 'var(--primary)',
                  fontWeight: 700,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {copy.registerHere}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
