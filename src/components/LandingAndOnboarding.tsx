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
  Check,
  Home,
  AlertOctagon,
  UserPlus,
} from 'lucide-react';
import { GoogleMapLocationPicker, LocationData } from './GoogleMapLocationPicker';

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
      'A unified, real-time platform for dairy farmers and veterinarians to report symptoms, trigger AI triage, and contain animal health outbreaks across Maharashtra.',
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
      government: {
        title: 'Government Official (शासकीय अधिकारी)',
        desc: 'District & block surveillance, outbreak heatmap, and containment SOPs',
      },
    },
    step3Title: 'Set Your Location',
    step3Sub: 'Search or enter your village, taluka, or district for disease surveillance and monitoring.',
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
    passwordPlaceholder: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol',
    livestockCount: 'Approximate Number of Livestock',
    livestockPlaceholder: 'e.g. 10',
    finishBtn: 'Finish Setup & Launch',
    authenticating: 'Signing in...',
    signInTitle: 'Sign in to JeevRakshak',
    signInSub: 'Enter your registered mobile number or email and password.',
    loginLabel: 'Mobile Number or Email',
    loginPlaceholder: 'e.g. 9823012345 or user@email.com',
    passwordLabel: 'Password',
    noAccount: "Don't have an account yet?",
    registerHere: 'Register here',
    fillRequired: 'Please fill in Full Name, Phone Number, and Password.',
    enterLoginPass: 'Please enter your Phone or Email, and Password.',
    invalidMobile: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
    invalidEmail: 'Please enter a valid email address (e.g. user@domain.com).',
    passwordStrengthError: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
    invalidPasswordSignIn: 'Password must be at least 6 characters.',
    pwReqMinLength: 'At least 8 characters',
    pwReqUpper: 'One uppercase letter (A-Z)',
    pwReqLower: 'One lowercase letter (a-z)',
    pwReqNumber: 'One number (0-9)',
    pwReqSpecial: 'One special symbol (!@#$...)',
    pwStrengthWeak: 'Weak password',
    pwStrengthMedium: 'Medium strength',
    pwStrengthStrong: 'Strong password',
    authErrorBadge: 'Authentication Failed',
    authErrorTitle: 'Wrong Login Details Entered',
    authErrorSub: 'The mobile number, email, or password you entered is incorrect and does not match our registered records.',
    authErrorDetailLabel: 'Entered Identifier:',
    authErrorStatus: 'Access Denied • Invalid Credentials',
    authErrorReasonsTitle: 'Possible reasons for this error:',
    authErrorReason1: 'The 10-digit mobile number or email was mistyped.',
    authErrorReason2: 'The password entered does not match your registered password.',
    authErrorReason3: 'Your account is not registered yet on JeevRakshak AI.',
    backToHomeBtn: 'Go Back to Home Page',
    trySignInAgainBtn: 'Try Signing In Again',
    createNewAccountBtn: 'Create a New Account',
    invalidCreds: 'Wrong credentials entered. Please verify your mobile number/email and password.',
    stepperLang: 'Language',
    stepperRole: 'Role',
    stepperLoc: 'Location',
    stepperAccount: 'Create Account',
    step4Badge: 'NATIONAL LIVESTOCK REGISTRY • SECURE PROFILE CREATION',
    personalInfoTitle: 'Personal & Contact Information',
    personalInfoSub: 'Official contact points for veterinary triage, health alerts, and verified records',
    roleInfoTitle: 'Role-Specific Credentials',
    roleInfoSub: 'Official accreditation and herd management parameters',
    securityTitle: 'Account Security & Password',
    securitySub: 'Protect your portal access with government-grade credentials',
    jurisdictionCardTitle: 'Operational Location & Jurisdiction',
    jurisdictionCardSub: 'Configured in Step 3 • Geospatially linked',
    editLocationBtn: 'Change Location',
    rolePrivilegesTitle: 'Role Privileges & Access Scope',
    govSecurityTitle: 'National Animal Disease Security',
    govSecurityDesc: 'Protected by 256-bit encryption under National Animal Disease Control Programme (NADCP) and State Animal Husbandry Guidelines.',
    alreadyHaveAccount: 'Already registered on JeevRakshak?',
    signInLink: 'Sign In here',
    signInRoleSelectTitle: 'Select Your Role to Sign In',
    signInRoleFarmer: 'Farmer (पशुपालक)',
    signInRoleVet: 'Veterinary Doctor (पशुवैद्यक)',
    signInRoleGov: 'Government Official (शासकीय अधिकारी)',
    signInRoleFarmerSub: 'Access herd management, symptom triage & alerts',
    signInRoleVetSub: 'Access clinical cases, prescriptions & lab orders',
    signInRoleGovSub: 'Access state surveillance, heatmaps & containment',
    signInFarmerIdentifier: 'Farmer Mobile Number or Email',
    signInVetIdentifier: 'Veterinary Mobile, MSVC License No. or Email',
    signInGovIdentifier: 'Official Mobile, Employee ID or Govt Email',
    signInFarmerPlaceholder: 'e.g. 9823012345 or farmer@email.com',
    signInVetPlaceholder: 'e.g. MSVC-18492 or 9823011111',
    signInGovPlaceholder: 'e.g. MH-DAHD-0412 or 9823099999',
    quickFillDemo: 'Quick Fill Demo',
    signInAsRolePrefix: 'Sign In to',
    selectedRoleCardTitle: 'Selected Registration Role',
    changeRoleBtn: 'Change Role',
  },
  hi: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण एवं निगरानी नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • समस्या #26128',
    heroTitle1: 'हर पशुधन की सुरक्षा।',
    heroTitle2: 'बीमारी फैलने से पहले पहचान।',
    heroSub:
      'महाराष्ट्र में पशुपालकों और पशु चिकित्सकों के लिए लक्षण रिपोर्टिंग, एआई जांच और बीमारी नियंत्रण का एकीकृत मंच।',
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
      government: {
        title: 'शासकीय अधिकारी (Government)',
        desc: 'जिला और ब्लॉक निगरानी, प्रकोप मानचित्र और रोकथाम एसओपी',
      },
    },
    step3Title: 'अपना स्थान निर्धारित करें',
    step3Sub: 'रोग निगरानी और सतर्कता के लिए अपना गाँव, तहसील या ज़िला चुनें या दर्ज करें।',
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
    passwordPlaceholder: 'कम से कम 8 अक्षर, बड़ा/छोटा अक्षर, अंक व विशेष वर्ण',
    livestockCount: 'कुल पशुओं की संख्या',
    livestockPlaceholder: 'उदा. 10',
    finishBtn: 'पंजीकरण पूरा करें और शुरू करें',
    authenticating: 'प्रमाणित किया जा रहा है...',
    signInTitle: 'जीवरक्षक में साइन इन करें',
    signInSub: 'अपना पंजीकृत मोबाइल नंबर या ईमेल और पासवर्ड दर्ज करें।',
    loginLabel: 'मोबाइल नंबर या ईमेल',
    loginPlaceholder: 'उदा. 9823012345 या user@email.com',
    passwordLabel: 'पासवर्ड',
    noAccount: 'खाता नहीं है?',
    registerHere: 'यहां रजिस्टर करें',
    fillRequired: 'कृपया पूरा नाम, मोबाइल नंबर और पासवर्ड भरें।',
    enterLoginPass: 'कृपया अपना फोन या ईमेल, और पासवर्ड दर्ज करें।',
    invalidMobile: 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू होने वाला)।',
    invalidEmail: 'कृपया एक वैध ईमेल पता दर्ज करें (उदा. user@domain.com)।',
    passwordStrengthError: 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए और उसमें बड़ा अक्षर, छोटा अक्षर, संख्या और विशेष वर्ण होना आवश्यक है।',
    invalidPasswordSignIn: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
    pwReqMinLength: 'कम से कम 8 अक्षर',
    pwReqUpper: 'एक बड़ा अक्षर (A-Z)',
    pwReqLower: 'एक छोटा अक्षर (a-z)',
    pwReqNumber: 'एक अंक (0-9)',
    pwReqSpecial: 'एक विशेष वर्ण (!@#$...)',
    pwStrengthWeak: 'कमजोर पासवर्ड',
    pwStrengthMedium: 'मध्यम पासवर्ड',
    pwStrengthStrong: 'मजबूत पासवर्ड',
    authErrorBadge: 'प्रमाणीकरण विफल',
    authErrorTitle: 'आपने गलत विवरण दर्ज किया है',
    authErrorSub: 'आपके द्वारा दर्ज किया गया मोबाइल नंबर, ईमेल या पासवर्ड गलत है और हमारे पंजीकृत रिकॉर्ड से मेल नहीं खाता है।',
    authErrorDetailLabel: 'दर्ज किया गया विवरण:',
    authErrorStatus: 'प्रवेश अस्वीकृत • गलत विवरण',
    authErrorReasonsTitle: 'संभावित कारण:',
    authErrorReason1: '10 अंकों का मोबाइल नंबर या ईमेल गलत टाइप किया गया हो।',
    authErrorReason2: 'दर्ज किया गया पासवर्ड आपके पंजीकृत पासवर्ड से मेल नहीं खाता।',
    authErrorReason3: 'आपका खाता अभी तक जीवरक्षक एआई पर पंजीकृत नहीं है।',
    backToHomeBtn: 'मुख्य पृष्ठ पर जाएं',
    trySignInAgainBtn: 'पुनः साइन इन करने का प्रयास करें',
    createNewAccountBtn: 'नया खाता बनाएं',
    invalidCreds: 'गलत क्रेडेंशियल दर्ज किए गए। कृपया अपना मोबाइल नंबर/ईमेल और पासवर्ड जांचें।',
    stepperLang: 'भाषा',
    stepperRole: 'भूमिका',
    stepperLoc: 'स्थान',
    stepperAccount: 'खाता बनाएं',
    step4Badge: 'राष्ट्रीय पशुधन रजिस्ट्री • सुरक्षित प्रोफ़ाइल निर्माण',
    personalInfoTitle: 'व्यक्तिगत एवं संपर्क विवरण',
    personalInfoSub: 'रोग चेतावनी, अधिसूचना और आधिकारिक रिकॉर्ड के लिए वैध संपर्क',
    roleInfoTitle: 'भूमिका-विशिष्ट क्रेडेंशियल',
    roleInfoSub: 'पशुधन स्वामित्व और आधिकारिक पद विवरण',
    securityTitle: 'खाता सुरक्षा एवं पासवर्ड',
    securitySub: 'सुरक्षित प्रमाणीकरण के लिए मजबूत पासवर्ड बनाएं',
    jurisdictionCardTitle: 'निर्धारित स्थान एवं क्षेत्राधिकार',
    jurisdictionCardSub: 'चरण 3 में जीआईएस द्वारा मैप किया गया स्थान',
    editLocationBtn: 'स्थान बदलें',
    rolePrivilegesTitle: 'भूमिका विशेषाधिकार एवं उपकरण',
    govSecurityTitle: 'राष्ट्रीय पशुधन स्वास्थ्य सुरक्षा मानक',
    govSecurityDesc: '256-बिट एन्क्रिप्शन और राष्ट्रीय पशु रोग नियंत्रण कार्यक्रम (NADCP) के तहत डेटा पूरी तरह सुरक्षित।',
    alreadyHaveAccount: 'क्या आपका पहले से खाता है?',
    signInLink: 'यहां साइन इन करें',
    signInRoleSelectTitle: 'साइन इन करने के लिए अपनी भूमिका चुनें',
    signInRoleFarmer: 'पशुपालक (Farmer)',
    signInRoleVet: 'पशु चिकित्सक (Veterinarian)',
    signInRoleGov: 'शासकीय अधिकारी (Government)',
    signInRoleFarmerSub: 'पशु प्रबंधन, एआई लक्षण जांच और रोग चेतावनियां',
    signInRoleVetSub: 'क्लिनिकल केस, पर्चे और लैब जांच विवरण',
    signInRoleGovSub: 'राज्य रोग निगरानी, हीटमैप और नियंत्रण एसओपी',
    signInFarmerIdentifier: 'पशुपालक मोबाइल नंबर या ईमेल',
    signInVetIdentifier: 'पशु चिकित्सक मोबाइल, MSVC लाइसेंस या ईमेल',
    signInGovIdentifier: 'शासकीय मोबाइल, कर्मचारी आईडी या ईमेल',
    signInFarmerPlaceholder: 'उदा. 9823012345 या farmer@email.com',
    signInVetPlaceholder: 'उदा. MSVC-18492 या 9823011111',
    signInGovPlaceholder: 'उदा. MH-DAHD-0412 या 9823099999',
    quickFillDemo: 'डेमो क्रेडेंशियल भरें',
    signInAsRolePrefix: 'साइन इन करें -',
    selectedRoleCardTitle: 'चयनित पंजीकरण भूमिका',
    changeRoleBtn: 'भूमिका बदलें',
  },
  mr: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण व सर्वेक्षण प्रणाली',
    govtSubtitle: 'महाराष्ट्र शासन • समस्या #26128',
    heroTitle1: 'प्रत्येक पशुधनाचे रक्षण.',
    heroTitle2: 'प्रादुर्भाव पसरण्यापूर्वीच प्रतिबंध.',
    heroSub:
      'महाराष्ट्रातील शेतकरी आणि पशुवैद्यकांसाठी लक्षण नोंदणी, एआय निदान आणि साथरोग नियंत्रणाचे एकात्मिक व्यासपीठ.',
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
      government: {
        title: 'शासकीय अधिकारी (Government - DAHO)',
        desc: 'जिल्हा व तालुका साथरोग सर्वेक्षण, उद्रेक नकाशा आणि प्रतिबंधात्मक SOP अंमलबजावणी',
      },
    },
    step3Title: 'आपले स्थान निश्चित करा',
    step3Sub: 'रोग नियंत्रण व सर्वेक्षणासाठी आपले गाव, तालुका किंवा जिल्हा निवडा किंवा शोधा.',
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
    passwordPlaceholder: 'किमान ८ अक्षरे, मोठे/लहान अक्षर, अंक व विशेष चिन्ह',
    livestockCount: 'एकूण पशुधन संख्या',
    livestockPlaceholder: 'उदा. 10',
    finishBtn: 'नोंदणी पूर्ण करा आणि सुरू करा',
    authenticating: 'प्रमाणीकरण सुरू आहे...',
    signInTitle: 'जीवरक्षक मध्ये लॉग इन करा',
    signInSub: 'आपला नोंदणीकृत मोबाईल नंबर किंवा ईमेल आणि पासवर्ड टाका.',
    loginLabel: 'मोबाईल नंबर किंवा ईमेल',
    loginPlaceholder: 'उदा. 9823012345 किंवा email@domain.com',
    passwordLabel: 'पासवर्ड',
    noAccount: 'अद्याप खाते नाही का?',
    registerHere: 'येथे नोंदणी करा',
    fillRequired: 'कृपया पूर्ण नाव, मोबाईल क्रमांक आणि पासवर्ड भरा.',
    enterLoginPass: 'कृपया आपला फोन किंवा ईमेल, आणि पासवर्ड टाका.',
    invalidMobile: 'कृपया १० अंकांचा वैध मोबाईल क्रमांक प्रविष्ट करा (६, ७, ८ किंवा ९ ने सुरू होणारा).',
    invalidEmail: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा (उदा. user@domain.com).',
    passwordStrengthError: 'पासवर्ड किमान ८ अक्षरांचा असावा आणि त्यात मोठे अक्षर, लहान अक्षर, अंक व विशेष चिन्ह असणे आवश्यक आहे.',
    invalidPasswordSignIn: 'पासवर्ड किमान ६ अक्षरांचा असावा.',
    pwReqMinLength: 'किमान ८ अक्षरे',
    pwReqUpper: 'एक मोठे अक्षर (A-Z)',
    pwReqLower: 'एक लहान अक्षर (a-z)',
    pwReqNumber: 'एक अंक (0-9)',
    pwReqSpecial: 'एक विशेष चिन्ह (!@#$...)',
    pwStrengthWeak: 'कमकुवत पासवर्ड',
    pwStrengthMedium: 'मध्यम पासवर्ड',
    pwStrengthStrong: 'मजबूत पासवर्ड',
    authErrorBadge: 'प्रमाणीकरण अयशस्वी',
    authErrorTitle: 'आपण चुकीची माहिती प्रविष्ट केली आहे',
    authErrorSub: 'आपण प्रविष्ट केलेला मोबाईल क्रमांक, ईमेल किंवा पासवर्ड चुकीचा असून आमच्या नोंदणीकृत नोंदींशी जुळत नाही.',
    authErrorDetailLabel: 'प्रविष्ट केलेली माहिती:',
    authErrorStatus: 'प्रवेश नाकारला • चुकीची माहिती',
    authErrorReasonsTitle: 'संभाव्य कारणे:',
    authErrorReason1: '१० अंकी मोबाईल नंबर किंवा ईमेल चुकीचा टाईप झाला असावा.',
    authErrorReason2: 'प्रविष्ट केलेला पासवर्ड आपल्या नोंदणीकृत पासवर्डशी जुळत नाही.',
    authErrorReason3: 'आपले खाते अद्याप जीवरक्षक एआय प्रणालीवर नोंदणीकृत नाही.',
    backToHomeBtn: 'मुख्य पृष्ठावर जा',
    trySignInAgainBtn: 'पुन्हा साइन इन करण्याचा प्रयत्न करा',
    createNewAccountBtn: 'नवीन खाते तयार करा',
    invalidCreds: 'चुकीची माहिती प्रविष्ट केली आहे. कृपया आपला मोबाईल क्रमांक/ईमेल आणि पासवर्ड तपासा.',
    stepperLang: 'भाषा',
    stepperRole: 'भूमिका',
    stepperLoc: 'स्थान',
    stepperAccount: 'खाते तयार करा',
    step4Badge: 'राष्ट्रीय पशुधन नोंदणी प्रणाली • सुरक्षित प्रोफाइल निर्मिती',
    personalInfoTitle: 'वैयक्तिक व संपर्क माहिती',
    personalInfoSub: 'आरोग्य सूचना, सतर्कता आणि शासकीय नोंदींसाठी अधिकृत संपर्क',
    roleInfoTitle: 'भूमिका-विशिष्ट माहिती',
    roleInfoSub: 'आपल्या भूमिकेनुसार विशेष नोंदणी तपशील',
    securityTitle: 'खाते सुरक्षा व पासवर्ड',
    securitySub: 'शासकीय सुरक्षा मानकांनुसार सुरक्षित पासवर्ड निश्चित करा',
    jurisdictionCardTitle: 'निश्चित केलेले स्थान व कार्यक्षेत्र',
    jurisdictionCardSub: 'पायरी ३ मध्ये जीआयएसद्वारे मॅप केलेले स्थान',
    editLocationBtn: 'स्थान बदला',
    rolePrivilegesTitle: 'भूमिका अधिकार व कार्यप्रणाली',
    govSecurityTitle: 'राष्ट्रीय पशुधन आरोग्य सुरक्षा मानक',
    govSecurityDesc: '२५६-बिट एन्क्रिप्शन व राष्ट्रीय प्राणी रोग नियंत्रण कार्यक्रम (NADCP) मानकांनुसार संपूर्ण डेटा सुरक्षित.',
    alreadyHaveAccount: 'आपले आधीच खाते आहे का?',
    signInLink: 'येथे साइन इन करा',
    signInRoleSelectTitle: 'साइन इन करण्यासाठी आपली भूमिका निवडा',
    signInRoleFarmer: 'पशुपालक / शेतकरी (Farmer)',
    signInRoleVet: 'पशुवैद्यक (Veterinarian)',
    signInRoleGov: 'शासकीय अधिकारी (Government)',
    signInRoleFarmerSub: 'गोठा व्यवस्थापन, एआई लक्षण तपासणी व सूचना',
    signInRoleVetSub: 'क्लिनिकल केसेस, औषधोपचार व लॅब तपासण्या',
    signInRoleGovSub: 'राज्य साथरोग सर्वेक्षण, उद्रेक नकाशे व एसओपी',
    signInFarmerIdentifier: 'शेतकरी मोबाईल क्रमांक किंवा ईमेल',
    signInVetIdentifier: 'पशुवैद्यक मोबाईल, MSVC परवाना क्र. किंवा ईमेल',
    signInGovIdentifier: 'शासकीय मोबाईल, कर्मचारी ओळख क्रमांक किंवा ईमेल',
    signInFarmerPlaceholder: 'उदा. 9823012345 किंवा farmer@email.com',
    signInVetPlaceholder: 'उदा. MSVC-18492 किंवा 9823011111',
    signInGovPlaceholder: 'उदा. MH-DAHD-0412 किंवा 9823099999',
    quickFillDemo: 'डेमो माहिती भरा',
    signInAsRolePrefix: 'लॉग इन करा -',
    selectedRoleCardTitle: 'नोंदणीसाठी निवडलेली भूमिका',
    changeRoleBtn: 'भूमिका बदला',
  },
};

export const LandingAndOnboarding: React.FC<LandingAndOnboardingProps> = ({ onComplete }) => {
  const { language, setLanguage } = useLanguage();
  const copy = ONBOARDING_I18N[language] || ONBOARDING_I18N.en;

  // View modes: 'hero' | 'onboarding' | 'signin' | 'auth_error'
  const [viewMode, setViewMode] = useState<'hero' | 'onboarding' | 'signin' | 'auth_error'>('hero');
  const [lastAttemptedLogin, setLastAttemptedLogin] = useState('');
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [locationData, setLocationData] = useState<LocationData>({
    state: 'Maharashtra',
    district: 'Pune',
    block: 'Shirur',
    village: 'Shirapur',
    pincode: '412210',
    latitude: 18.8120,
    longitude: 74.3910,
    formattedAddress: 'Shirapur, Shirur, Pune, Maharashtra, India',
  });
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedBlock, setSelectedBlock] = useState('Shirur');
  const [selectedVillage, setSelectedVillage] = useState('Shirapur');
  const [farmName, setFarmName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [herdSize, setHerdSize] = useState('');
  const [vetLicense, setVetLicense] = useState('');
  const [vetHospitalName, setVetHospitalName] = useState('');
  const [govtEmployeeId, setGovtEmployeeId] = useState('');
  const [govtDesignation, setGovtDesignation] = useState('District Animal Husbandry Officer (DAHO)');

  // Field touched states for inline validation warnings
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Sign In states
  const [signInRole, setSignInRole] = useState<UserRole>('farmer');
  const [signInLogin, setSignInLogin] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation functions
  const isValidMobile = (val: string): boolean => {
    const clean = val.replace(/[\s\-\(\)]/g, '');
    return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(clean);
  };

  const isValidEmail = (val: string): boolean => {
    if (!val.trim()) return true;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim());
  };

  const pwStrength = {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
  const pwCriteriaMet = Object.values(pwStrength).filter(Boolean).length;
  const isPwStrong = pwCriteriaMet === 5;

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phone.trim() || !password.trim() || !fullName.trim()) {
      setErrorMsg(copy.fillRequired);
      return;
    }

    if (!isValidMobile(phone)) {
      setErrorMsg(copy.invalidMobile);
      return;
    }

    if (email.trim() && !isValidEmail(email)) {
      setErrorMsg(copy.invalidEmail);
      return;
    }

    if (!isPwStrong) {
      setErrorMsg(copy.passwordStrengthError);
      return;
    }

    const cleanBlock = (locationData.block || selectedBlock || 'shirur').toLowerCase().replace(/\s+/g, '_');
    const cleanDist = (locationData.district || selectedDistrict || 'pune').toLowerCase().replace(/\s+/g, '_');
    const cleanState = (locationData.state || 'maharashtra').toLowerCase().replace(/\s+/g, '_');
    const locationId = `loc-${cleanState}-${cleanDist}-${cleanBlock}`;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    setLoading(true);
    const res = await dataService.registerUser({
      full_name: fullName.trim(),
      phone: cleanPhone,
      email: email.trim() || undefined,
      password: password.trim(),
      role: selectedRole,
      location_id: locationId,
      farm_name: selectedRole === 'farmer' ? (farmName.trim() || `${fullName.trim()}'s Farm`) : undefined,
      district: locationData.district || selectedDistrict || 'Pune',
      block: locationData.block || selectedBlock || 'Shirur',
      village: locationData.village || selectedVillage || 'Shirapur',
      state: locationData.state || 'Maharashtra',
      herd_size: herdSize ? parseInt(herdSize, 10) : undefined,
      hospital_name: selectedRole === 'veterinarian' ? (vetHospitalName.trim() || 'Taluka Veterinary Polyclinic') : undefined,
      license_number: selectedRole === 'veterinarian' ? (vetLicense.trim() || 'MSVC-18492') : undefined,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      onComplete(selectedRole);
    }
  };

  // Quick Demo Auto-Fill by Role
  const handleQuickFillDemo = (role: UserRole) => {
    setSignInRole(role);
    if (role === 'farmer') {
      setSignInLogin('9823012345');
      setSignInPassword('Farmer@123');
    } else if (role === 'veterinarian') {
      setSignInLogin('MSVC-18492');
      setSignInPassword('Vet@12345');
    } else {
      setSignInLogin('MH-DAHD-0412');
      setSignInPassword('Govt@12345');
    }
    setErrorMsg(null);
  };

  // Handle Sign In (supports Farmer, Veterinarian & Government Official)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const loginVal = signInLogin.trim();
    const passVal = signInPassword.trim();
    setLastAttemptedLogin(loginVal || 'N/A');

    if (!loginVal || !passVal) {
      setErrorMsg(copy.enterLoginPass);
      setViewMode('auth_error');
      return;
    }

    if (passVal.length < 5) {
      setErrorMsg(copy.invalidPasswordSignIn);
      setViewMode('auth_error');
      return;
    }

    const isEmailInput = loginVal.includes('@');
    const isPureDigits = /^\d+$/.test(loginVal.replace(/[\s\-\(\)]/g, ''));

    if (isEmailInput) {
      if (!isValidEmail(loginVal)) {
        setErrorMsg(copy.invalidEmail);
        setViewMode('auth_error');
        return;
      }
    } else if (isPureDigits) {
      if (!isValidMobile(loginVal)) {
        setErrorMsg(copy.invalidMobile);
        setViewMode('auth_error');
        return;
      }
    } else {
      // License number or Employee ID (e.g. MSVC-18492 or MH-DAHD-0412)
      if (loginVal.length < 3) {
        setErrorMsg('Please enter a valid credential identifier.');
        setViewMode('auth_error');
        return;
      }
    }

    setLoading(true);

    const res = await dataService.signInUser({
      login: loginVal,
      password: passVal,
      role: signInRole,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(copy.invalidCreds);
      setViewMode('auth_error');
    } else {
      const assignedRole = (res.profile as any)?.role || dataService.getCurrentRole() || signInRole;
      onComplete(assignedRole);
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
            </div>
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
                marginBottom: '40px',
                letterSpacing: '-0.02em',
              }}
            >
              {copy.heroTitle1} <br />
              <span style={{ color: 'var(--primary)' }}>{copy.heroTitle2}</span>
            </h1>



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

      {/* VIEW 2: ONBOARDING WIZARD (STEPS 1, 2) */}
      {viewMode === 'onboarding' && onboardingStep <= 2 && (
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
                  onClick={() => setOnboardingStep(4)}
                  className="btn-primary"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '13px' }}
                >
                  <span>{copy.continue}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2 (STEP 3): FULL WEB PAGE LOCATION SETUP */}
      {viewMode === 'onboarding' && onboardingStep === 3 && (
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <GoogleMapLocationPicker
            initialLocation={locationData}
            selectedRole={selectedRole}
            onBack={() => {
              setOnboardingStep(2);
              setErrorMsg(null);
            }}
            onContinue={() => {
              setOnboardingStep(4);
              setErrorMsg(null);
            }}
            onChange={(loc) => {
              setLocationData(loc);
              setSelectedDistrict(loc.district);
              setSelectedBlock(loc.block);
              setSelectedVillage(loc.village);
            }}
          />
        </div>
      )}

      {/* VIEW 2 (STEP 4): FULL WEB PAGE REGISTRATION & PROFILE CREATION */}
      {viewMode === 'onboarding' && onboardingStep === 4 && (
        <div style={{ width: '100%', minHeight: 'calc(100vh - 65px)', background: '#F8FFF9', display: 'flex', flexDirection: 'column' }}>
          {/* 1. TOP SUB-HEADER APPLICATION BAR */}
          <div
            style={{
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              padding: '12px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Back Button to Step 2 */}
            <button
              type="button"
              onClick={() => {
                setOnboardingStep(2);
                setErrorMsg(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <ArrowLeft size={16} />
              <span>{copy.back}</span>
            </button>

            {/* 3-Step Breadcrumb Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#2D6A4F',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {copy.stepperLang || 'Language'}
                </span>
              </div>

              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>/</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#2D6A4F',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {copy.stepperRole || 'Role'}
                </span>
              </div>

              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>/</span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(45, 106, 79, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1.5px solid rgba(45, 106, 79, 0.35)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#2D6A4F',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '0.8rem', color: '#2D6A4F', fontWeight: 800 }}>
                  {copy.stepperAccount || 'Create Account'}
                </span>
              </div>
            </div>

            {/* Active Role Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <span>{selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'veterinarian' ? '🩺' : '🏛️'}</span>
              <span>
                {selectedRole === 'farmer' ? 'Farmer Portal' : selectedRole === 'veterinarian' ? 'Veterinarian Portal' : 'Government Official'}
              </span>
            </div>
          </div>

          {/* 2. HERO PAGE HEADER */}
          <div style={{ maxWidth: '1280px', width: '100%', margin: '28px auto 0', padding: '0 24px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(45, 106, 79, 0.08)',
                color: '#2D6A4F',
                padding: '5px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: '10px',
                border: '1px solid rgba(45, 106, 79, 0.25)',
                letterSpacing: '0.04em',
              }}
            >
              <Shield size={14} />
              <span>{copy.step4Badge || 'NATIONAL LIVESTOCK REGISTRY • SECURE PROFILE CREATION'}</span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.2,
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              {copy.step4Title}
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, maxWidth: '820px' }}>
              {copy.step4Sub}
            </p>
          </div>

          {/* 3. TWO-COLUMN RESPONSIVE LAYOUT */}
          <div
            style={{
              maxWidth: '1280px',
              width: '100%',
              margin: '24px auto 60px',
              padding: '0 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '28px',
              alignItems: 'flex-start',
            }}
          >
            {/* LEFT COLUMN: COMPREHENSIVE REGISTRATION FORM */}
            <div
              style={{
                flex: '1 1 680px',
                minWidth: '320px',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '36px 36px',
                boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              }}
            >
              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--critical-bg)',
                    color: 'var(--critical)',
                    border: '1px solid var(--critical-border)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    marginBottom: '24px',
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
                {/* SECTION 1: PERSONAL & CONTACT INFORMATION */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(45, 106, 79, 0.1)',
                        color: '#2D6A4F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <User size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {copy.personalInfoTitle || 'Personal & Contact Information'}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                        {copy.personalInfoSub || 'Official contact points for veterinary triage, health alerts, and verified records'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Full Name */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">
                        {copy.fullName} <span style={{ color: 'var(--critical)' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          required
                          placeholder={copy.fullNamePlaceholder}
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          className="form-input"
                          style={{ paddingLeft: '38px', height: '44px', borderRadius: '10px' }}
                        />
                        <User size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>
                          {copy.mobile} <span style={{ color: 'var(--critical)' }}>*</span>
                        </label>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: 'rgba(45, 106, 79, 0.1)',
                            color: '#2D6A4F',
                            padding: '1px 8px',
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
                          onBlur={() => setPhoneTouched(true)}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          className="form-input"
                          style={{
                            paddingLeft: '38px',
                            height: '44px',
                            borderRadius: '10px',
                            borderColor: phoneTouched && phone.trim() && !isValidMobile(phone) ? 'var(--critical)' : undefined,
                          }}
                        />
                        <Phone size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      </div>
                      {phoneTouched && phone.trim() && !isValidMobile(phone) && (
                        <div style={{ color: 'var(--critical)', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                          {copy.invalidMobile}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
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
                          padding: '1px 8px',
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
                        onBlur={() => setEmailTouched(true)}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="form-input"
                        style={{
                          paddingLeft: '38px',
                          height: '44px',
                          borderRadius: '10px',
                          borderColor: emailTouched && email.trim() && !isValidEmail(email) ? 'var(--critical)' : undefined,
                        }}
                      />
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    </div>
                    {emailTouched && email.trim() && !isValidEmail(email) && (
                      <div style={{ color: 'var(--critical)', fontSize: '0.74rem', marginTop: '4px', fontWeight: 500 }}>
                        {copy.invalidEmail}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 2: ROLE-SPECIFIC CREDENTIALS */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(45, 106, 79, 0.1)',
                        color: '#2D6A4F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {selectedRole === 'veterinarian' ? <Stethoscope size={18} /> : selectedRole === 'government' ? <Building2 size={18} /> : <Home size={18} />}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {copy.roleInfoTitle || 'Role-Specific Credentials'}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                        {copy.roleInfoSub || 'Official accreditation and herd management parameters'}
                      </p>
                    </div>
                  </div>

                  {selectedRole === 'farmer' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label className="form-label" style={{ marginBottom: 0 }}>{copy.farmName}</label>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: 'var(--text-muted)',
                              padding: '1px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {copy.optionalBadge}
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder={copy.farmNamePlaceholder}
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          className="form-input"
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label className="form-label" style={{ marginBottom: 0 }}>{copy.livestockCount}</label>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: 'var(--text-muted)',
                              padding: '1px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {copy.optionalBadge}
                          </span>
                        </div>
                        <input
                          type="number"
                          min="1"
                          placeholder={copy.livestockPlaceholder}
                          value={herdSize}
                          onChange={(e) => setHerdSize(e.target.value)}
                          className="form-input"
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'veterinarian' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          MSVC Veterinary Council License Number <span style={{ color: 'var(--critical)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MSVC-18492"
                          value={vetLicense}
                          onChange={(e) => setVetLicense(e.target.value)}
                          className="form-input"
                          style={{ textTransform: 'uppercase', fontWeight: 600, height: '44px', borderRadius: '10px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          Assigned Veterinary Hospital / Polyclinic <span style={{ color: 'var(--critical)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Taluka Veterinary Polyclinic, Baramati"
                          value={vetHospitalName}
                          onChange={(e) => setVetHospitalName(e.target.value)}
                          className="form-input"
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'government' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">
                          Department Official Employee ID <span style={{ color: 'var(--critical)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MH-DAHD-0412"
                          value={govtEmployeeId}
                          onChange={(e) => setGovtEmployeeId(e.target.value)}
                          className="form-input"
                          style={{ textTransform: 'uppercase', fontWeight: 600, height: '44px', borderRadius: '10px' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Government Official Designation</label>
                        <select
                          value={govtDesignation}
                          onChange={(e) => setGovtDesignation(e.target.value)}
                          className="form-select"
                          style={{ height: '44px', borderRadius: '10px' }}
                        >
                          <option value="District Animal Husbandry Officer (DAHO)">District Animal Husbandry Officer (DAHO)</option>
                          <option value="State Animal Husbandry Officer">State Animal Husbandry Officer</option>
                          <option value="Taluka / Block Veterinary Officer">Taluka / Block Veterinary Officer</option>
                          <option value="Disease Monitoring & Surveillance Officer">Disease Monitoring & Surveillance Officer</option>
                          <option value="National Vaccination Program Officer">National Vaccination Program Officer</option>
                          <option value="Emergency 1962 Response Commander">Emergency 1962 Response Commander</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: ACCOUNT SECURITY & PASSWORD */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'rgba(45, 106, 79, 0.1)',
                        color: '#2D6A4F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {copy.securityTitle || 'Account Security & Password'}
                      </h3>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                        {copy.securitySub || 'Protect your portal access with government-grade credentials'}
                      </p>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        {copy.password} <span style={{ color: 'var(--critical)' }}>*</span>
                      </label>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(45, 106, 79, 0.1)',
                          color: '#2D6A4F',
                          padding: '1px 8px',
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
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className="form-input"
                        style={{ paddingLeft: '38px', paddingRight: '42px', height: '44px', borderRadius: '10px' }}
                      />
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '12px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Interactive Password Strength Meter & Checklist */}
                    {password.length > 0 && (
                      <div
                        style={{
                          marginTop: '12px',
                          padding: '14px 16px',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {pwCriteriaMet <= 2 ? copy.pwStrengthWeak : pwCriteriaMet <= 4 ? copy.pwStrengthMedium : copy.pwStrengthStrong}
                          </span>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              color: pwCriteriaMet <= 2 ? 'var(--critical)' : pwCriteriaMet <= 4 ? '#d97706' : 'var(--stable)',
                            }}
                          >
                            {pwCriteriaMet} / 5 Criteria Met
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '12px',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${(pwCriteriaMet / 5) * 100}%`,
                              background: pwCriteriaMet <= 2 ? 'var(--critical)' : pwCriteriaMet <= 4 ? '#d97706' : 'var(--stable)',
                              transition: 'all 0.3s ease',
                            }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                          {[
                            { label: copy.pwReqMinLength, met: pwStrength.hasMinLength },
                            { label: copy.pwReqUpper, met: pwStrength.hasUpper },
                            { label: copy.pwReqLower, met: pwStrength.hasLower },
                            { label: copy.pwReqNumber, met: pwStrength.hasNumber },
                            { label: copy.pwReqSpecial, met: pwStrength.hasSpecial },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.74rem',
                                color: item.met ? 'var(--stable)' : 'var(--text-muted)',
                                fontWeight: item.met ? 700 : 400,
                              }}
                            >
                              <div
                                style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '50%',
                                  background: item.met ? 'var(--stable)' : '#cbd5e1',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '9px',
                                  flexShrink: 0,
                                }}
                              >
                                {item.met ? '✓' : '•'}
                              </div>
                              <span>{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '14px 20px',
                      height: '50px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                    }}
                  >
                    <span>{loading ? copy.authenticating : copy.finishBtn}</span>
                    <ArrowRight size={18} />
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>{copy.alreadyHaveAccount || 'Already registered on JeevRakshak?'} </span>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('signin');
                        setOnboardingStep(1);
                        setErrorMsg(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      {copy.signInLink || 'Sign In here'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: PROFILE DOSSIER & JURISDICTION SUMMARY */}
            <div style={{ flex: '1 1 360px', maxWidth: '440px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* CARD 1: SELECTED ROLE & ACCOUNT PROFILE */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 4px 15px -2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'veterinarian' ? '🩺' : '🏛️'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {selectedRole === 'farmer'
                          ? copy.roles.farmer.title
                          : selectedRole === 'veterinarian'
                          ? copy.roles.veterinarian.title
                          : copy.roles.government.title}
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                        {copy.selectedRoleCardTitle || 'Selected Registration Role'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOnboardingStep(2);
                      setErrorMsg(null);
                    }}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {copy.changeRoleBtn || 'Change Role'}
                  </button>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.45,
                  }}
                >
                  {selectedRole === 'farmer'
                    ? copy.roles.farmer.desc
                    : selectedRole === 'veterinarian'
                    ? copy.roles.veterinarian.desc
                    : copy.roles.government.desc}
                </div>
              </div>

              {/* CARD 2: ROLE ENTITLEMENTS & UNLOCKED TOOLS */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  padding: '24px',
                  boxShadow: '0 4px 15px -2px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                    }}
                  >
                    {selectedRole === 'farmer' ? '👨‍🌾' : selectedRole === 'veterinarian' ? '🩺' : '🏛️'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                      {copy.rolePrivilegesTitle || 'Role Privileges & Access Scope'}
                    </h4>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: 0 }}>
                      {selectedRole.toUpperCase()} • Immediate system entitlements
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedRole === 'farmer'
                    ? [
                        { icon: '🩺', title: 'AI Symptom Scanner', desc: 'Instant disease risk triage in English, Hindi & Marathi' },
                        { icon: '📍', title: '15km Outbreak Alert', desc: 'Real-time contagious alerts in your taluka' },
                        { icon: '📋', title: 'Livestock Health Passport', desc: 'Digital vaccination tracker & medical history' },
                        { icon: '📞', title: '1962 Veterinary SOS', desc: 'One-touch emergency mobile clinic dispatch' },
                      ]
                    : selectedRole === 'veterinarian'
                    ? [
                        { icon: '🏥', title: 'Clinical Triage Queue', desc: 'Review, prioritize and respond to incoming livestock cases' },
                        { icon: '🔬', title: 'Diagnostic Lab Orders', desc: 'Digital requisition and specimen tracking' },
                        { icon: '💊', title: 'Prescription Records', desc: 'Standardized pharmacological regimens' },
                        { icon: '⚡', title: 'Surveillance Escalation', desc: 'Direct alert channel to DAHO & state epidemiologists' },
                      ]
                    : [
                        { icon: '🗺️', title: 'Geospatial Outbreak Heatmaps', desc: 'Village and taluka-level clustering at 50m resolution' },
                        { icon: '📊', title: 'Surveillance Analytics', desc: 'Prevalence rates, mortality indices & vaccine coverage' },
                        { icon: '📄', title: 'Official PDF Reports', desc: 'Exportable clinical dossiers and audit records' },
                        { icon: '🛡️', title: 'Containment SOPs', desc: 'Quarantine zones, checkpoints & ring vaccination protocols' },
                      ]
                  ).map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                      }}
                    >
                      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>{feat.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{feat.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: REGULATORY COMPLIANCE & DATA SECURITY */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderRadius: '20px',
                  border: '1px solid #bbf7d0',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#166534' }}>
                  <Shield size={18} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>
                    {copy.govSecurityTitle || 'National Animal Disease Security'}
                  </span>
                </div>
                <p style={{ fontSize: '0.74rem', color: '#166534', lineHeight: 1.4, margin: 0 }}>
                  {copy.govSecurityDesc || 'Protected by 256-bit encryption under National Animal Disease Control Programme (NADCP) and State Animal Husbandry Guidelines.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SIGN IN SCREEN (MULTI-ROLE: FARMER, VET, GOV) */}
      {viewMode === 'signin' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 16px', minHeight: 'calc(100vh - 80px)' }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '32px 28px',
              borderRadius: '24px',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
            }}
          >
            {/* Top Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('hero');
                  setErrorMsg(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <ArrowLeft size={16} />
                <span>{copy.back}</span>
              </button>

              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#065f46',
                  background: '#ecfdf5',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid #a7f3d0',
                }}
              >
                🔒 SECURE PORTAL AUTH
              </div>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {copy.signInTitle}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
              {copy.signInRoleSelectTitle || 'Select your role and enter your registered credentials to access your dedicated workspace.'}
            </p>

            {/* 3-ROLE SELECTOR CARDS */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  {
                    id: 'farmer' as UserRole,
                    label: copy.signInRoleFarmer || 'Farmer',
                    sub: 'पशुपालक',
                    badge: '👨‍🌾',
                  },
                  {
                    id: 'veterinarian' as UserRole,
                    label: copy.signInRoleVet || 'Doctor',
                    sub: 'पशुवैद्यक',
                    badge: '🩺',
                  },
                  {
                    id: 'government' as UserRole,
                    label: copy.signInRoleGov || 'Official',
                    sub: 'शासकीय',
                    badge: '🏛️',
                  },
                ].map((r) => {
                  const isSel = signInRole === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {
                        setSignInRole(r.id);
                        setErrorMsg(null);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '12px 8px',
                        borderRadius: '14px',
                        border: isSel ? '2px solid #2D6A4F' : '1.5px solid #e2e8f0',
                        background: isSel ? '#ecfdf5' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSel ? '0 4px 12px rgba(45, 106, 79, 0.12)' : 'none',
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{r.badge}</span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: isSel ? 800 : 700,
                          color: isSel ? '#065f46' : 'var(--text-main)',
                          textAlign: 'center',
                          marginTop: '2px',
                        }}
                      >
                        {r.id === 'farmer' ? 'Farmer' : r.id === 'veterinarian' ? 'Vet Doctor' : 'Govt Official'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: isSel ? '#047857' : 'var(--text-muted)' }}>{r.sub}</span>
                      {isSel && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-6px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#2D6A4F',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 800,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROLE SUMMARY BANNER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '9px 12px',
                marginBottom: '18px',
                fontSize: '0.76rem',
              }}
            >
              <div style={{ color: 'var(--text-muted)', lineHeight: 1.3 }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {signInRole === 'farmer'
                    ? '👨‍🌾 Farmer Portal: '
                    : signInRole === 'veterinarian'
                    ? '🩺 Veterinary Portal: '
                    : '🏛️ Government Portal: '}
                </span>
                <span>
                  {signInRole === 'farmer'
                    ? (copy.signInRoleFarmerSub || 'AI Triage, Vaccination Ledger & Outbreak Alerts')
                    : signInRole === 'veterinarian'
                    ? (copy.signInRoleVetSub || 'Clinical Cases, Prescriptions & Lab Requisitions')
                    : (copy.signInRoleGovSub || 'State Surveillance, Heatmaps & Containment SOPs')}
                </span>
              </div>

              {/* Quick Fill Demo Button */}
              <button
                type="button"
                onClick={() => handleQuickFillDemo(signInRole)}
                style={{
                  background: 'rgba(45, 106, 79, 0.08)',
                  border: '1px solid rgba(45, 106, 79, 0.25)',
                  color: '#2D6A4F',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '8px',
                  whiteSpace: 'nowrap',
                }}
                title="Fill demo credentials for instant testing"
              >
                ⚡ {copy.quickFillDemo || 'Demo Fill'}
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  background: 'var(--critical-bg)',
                  color: 'var(--critical)',
                  border: '1px solid var(--critical-border)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* CREDENTIAL IDENTIFIER INPUT */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  {signInRole === 'farmer'
                    ? (copy.signInFarmerIdentifier || 'Farmer Mobile Number or Email')
                    : signInRole === 'veterinarian'
                    ? (copy.signInVetIdentifier || 'Veterinary Mobile, MSVC License No. or Email')
                    : (copy.signInGovIdentifier || 'Official Mobile, Employee ID or Govt Email')}
                  <span style={{ color: 'var(--critical)' }}> *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder={
                      signInRole === 'farmer'
                        ? (copy.signInFarmerPlaceholder || 'e.g. 9823012345 or farmer@email.com')
                        : signInRole === 'veterinarian'
                        ? (copy.signInVetPlaceholder || 'e.g. MSVC-18492 or 9823011111')
                        : (copy.signInGovPlaceholder || 'e.g. MH-DAHD-0412 or 9823099999')
                    }
                    value={signInLogin}
                    onChange={(e) => {
                      setSignInLogin(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="form-input"
                    style={{ paddingLeft: '38px', height: '46px', borderRadius: '12px' }}
                  />
                  <div style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }}>
                    {signInRole === 'farmer' ? <User size={17} /> : signInRole === 'veterinarian' ? <Stethoscope size={17} /> : <Building2 size={17} />}
                  </div>
                </div>
              </div>

              {/* PASSWORD INPUT */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 700 }}>
                    {copy.passwordLabel}
                    <span style={{ color: 'var(--critical)' }}> *</span>
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Demo: {signInRole === 'farmer' ? 'Farmer@123' : signInRole === 'veterinarian' ? 'Vet@12345' : 'Govt@12345'}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="form-input"
                    style={{ paddingLeft: '38px', paddingRight: '40px', height: '46px', borderRadius: '12px' }}
                  />
                  <Lock size={17} style={{ position: 'absolute', left: '12px', top: '15px', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '14px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                    aria-label="Toggle password visibility"
                  >
                    {showSignInPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* SUBMIT SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  height: '48px',
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '4px',
                }}
              >
                <span>
                  {loading
                    ? copy.authenticating
                    : `${copy.signInAsRolePrefix || 'Sign In to'} ${
                        signInRole === 'farmer'
                          ? 'Farmer Portal'
                          : signInRole === 'veterinarian'
                          ? 'Veterinarian Portal'
                          : 'Government Portal'
                      }`}
                </span>
                <ArrowRight size={17} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>{copy.noAccount} </span>
              <button
                type="button"
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
                  textDecoration: 'underline',
                }}
              >
                {copy.registerHere}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: WRONG DETAILS / AUTH ERROR SCREEN */}
      {viewMode === 'auth_error' && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px 16px' }}>
          <div
            className="modal-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '34px 26px',
              boxShadow: '0 20px 45px -12px rgba(220, 38, 38, 0.18), var(--shadow-lg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
            }}
          >
            {/* Warning Shield Icon */}
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                border: '4px solid #fecaca',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.2)',
              }}
            >
              <AlertOctagon size={34} strokeWidth={2.4} />
            </div>

            {/* Error Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <AlertTriangle size={13} />
              <span>{copy.authErrorBadge}</span>
            </div>

            {/* Main Headline stating user has entered wrong details */}
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-main)',
                lineHeight: 1.25,
                marginBottom: '10px',
              }}
            >
              {copy.authErrorTitle}
            </h2>

            {/* Subtitle / explanation */}
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginBottom: '20px',
              }}
            >
              {copy.authErrorSub}
            </p>

            {/* Detail snippet box showing entered details */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: '18px',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{copy.authErrorDetailLabel}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#dc2626',
                    background: '#fef2f2',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #fecaca',
                  }}
                >
                  {copy.authErrorStatus}
                </span>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {lastAttemptedLogin || signInLogin || 'N/A'}
              </div>
              {errorMsg && (
                <div style={{ color: '#b91c1c', fontSize: '0.76rem', marginTop: '6px', fontWeight: 600 }}>
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>

            {/* Tips / Checklist */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.06)',
                border: '1px dashed #fcd34d',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                textAlign: 'left',
                marginBottom: '22px',
                fontSize: '0.78rem',
                color: '#92400e',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>{copy.authErrorReasonsTitle}</div>
              <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.5 }}>
                <li>{copy.authErrorReason1}</li>
                <li>{copy.authErrorReason2}</li>
                <li>{copy.authErrorReason3}</li>
              </ul>
            </div>

            {/* Action Buttons: 1. Primary "Go Back to Home Page", 2. "Try Signing In Again", 3. "Register" */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* MANDATORY: Option to go back to the home page, redirecting to landing page */}
              <button
                onClick={() => {
                  setViewMode('hero');
                  setErrorMsg(null);
                  setSignInPassword('');
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '13px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                  cursor: 'pointer',
                }}
              >
                <Home size={18} />
                <span>{copy.backToHomeBtn}</span>
              </button>

              {/* Try Signing In Again */}
              <button
                onClick={() => {
                  setViewMode('signin');
                  setErrorMsg(null);
                  setSignInPassword('');
                }}
                className="btn-outline"
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>{copy.trySignInAgainBtn}</span>
              </button>

              {/* Register New Account */}
              <button
                onClick={() => {
                  setViewMode('onboarding');
                  setOnboardingStep(1);
                  setErrorMsg(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px',
                  marginTop: '4px',
                }}
              >
                <UserPlus size={15} />
                <span>{copy.createNewAccountBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
