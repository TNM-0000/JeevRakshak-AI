'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dataService } from '@/lib/supabase/dataService';
import { AppLanguage } from '@/types/database';
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Info,
  Tag,
  Heart,
  Calendar,
  ShieldCheck,
  Shield,
  X,
} from 'lucide-react';

interface AnimalEntry {
  id: string;
  tag_number: string;
  name: string;
  species: string;
  breed: string;
  sex: 'female' | 'male';
  date_of_birth: string;
  is_milking: boolean;
  milking_status: 'lactating' | 'dry' | 'heifer' | 'calving';
  vaccination_status: 'vaccinated' | 'due' | 'not_vaccinated';
  notes: string;
}

interface FarmerHerdSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const translations = {
  en: {
    govtBadge: 'MAHARASHTRA LIVESTOCK DISEASE SURVEILLANCE & EPIDEMIOLOGY NETWORK',
    govtSubtitle: 'Government of Maharashtra • Department of Animal Husbandry',
    setupBadge: 'FARMER HERD SETUP',
    title: 'Register Your Livestock Herd',
    subtitle: 'Enter your herd details, animal count, names, and species to enable early disease alerts and health tracking. You can always edit or add more later.',
    skipNotice: 'You can skip this step and enter animal records anytime from the Herd Hub.',
    herdDetailsHeader: '1. Farm & Herd Details',
    farmNameLabel: 'Farm / Herd Name',
    farmNamePlaceholder: 'e.g. Shinde Dairy Farm',
    animalCountLabel: 'Number of Animals to Register Now',
    livestockListHeader: '2. Animal Profiles',
    addAnimalBtn: 'Add Another Animal',
    animalCardTitle: 'Animal',
    tagNumberLabel: 'Ear Tag / INAPH ID',
    tagPlaceholder: 'e.g. MH-PUN-0101',
    autoTagBtn: 'Generate ID',
    animalNameLabel: 'Animal Name ( टोपणनाव )',
    animalNamePlaceholder: 'e.g. Gauri, Kapila, Lakshmi',
    speciesLabel: 'Livestock Type (Species)',
    breedLabel: 'Breed',
    sexLabel: 'Sex',
    female: 'Female (मादी)',
    male: 'Male (नर)',
    dobLabel: 'Approximate Age / Date of Birth',
    milkingStatusLabel: 'Lactation / Milking Status',
    lactating: 'Lactating / Milking (दुभती)',
    dry: 'Dry / Pregnant (गाभण / आटलेली)',
    heifer: 'Heifer / Calf (कालवड)',
    calving: 'Recent Calving (विलेली)',
    vaccinationLabel: 'Vaccination Status',
    vaccinated: 'Vaccinated (लसीकरण पूर्ण)',
    dueSoon: 'Vaccination Due (लस बाकी)',
    notVaccinated: 'Not Vaccinated (लस टोचलेली नाही)',
    notesLabel: 'Notes / Identification Mark (Optional)',
    notesPlaceholder: 'e.g. White patch on forehead, high milk yield',
    saveBtn: 'Save Herd & Launch Dashboard',
    savingBtn: 'Saving Herd & Animals to Database...',
    skipBtn: 'Skip for now & Go to Dashboard',
    skipConfirmTitle: 'Skip Herd Setup?',
    skipConfirmDesc: 'You can register your livestock anytime from the Herd Hub menu.',
    speciesOptions: [
      { id: 'Cattle', label: 'Cattle (गाय)' },
      { id: 'Buffalo', label: 'Buffalo (म्हैस)' },
      { id: 'Goat', label: 'Goat (शेळी)' },
      { id: 'Sheep', label: 'Sheep (मेंढी)' },
      { id: 'Poultry', label: 'Poultry (कोंबडी)' },
      { id: 'Swine', label: 'Swine (डुक्कर)' },
    ],
    breedsBySpecies: {
      Cattle: ['Gir', 'Sahiwal', 'Red Sindhi', 'Khillari', 'Deoni', 'Dangi', 'HF Cross', 'Jersey Cross'],
      Buffalo: ['Murrah', 'Jaffarabadi', 'Pandharpuri', 'Mehsana', 'Surti', 'Nagpuri'],
      Goat: ['Osmanabadi', 'Boer', 'Sirohi', 'Jamnapari', 'Sangamneri', 'Beetal'],
      Sheep: ['Deccani', 'Madgyal', 'Nellore', 'Marwari'],
      Poultry: ['Aseel', 'Kadaknath', 'Gramapriya', 'Broiler', 'Layer'],
      Swine: ['Large White Yorkshire', 'Landrace', 'Desi indigenous'],
    } as Record<string, string[]>,
  },
  hi: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण एवं निगरानी नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • पशुसंवर्धन विभाग',
    setupBadge: 'पशुपालक झुंड सेटअप',
    title: 'अपने पशुधन और झुंड की जानकारी भरें',
    subtitle: 'रोग की प्रारंभिक पहचान और स्वास्थ्य ट्रैकिंग के लिए अपने झुंड का नाम, पशुओं की संख्या, नाम व नस्ल दर्ज करें। इसे बाद में भी बदला जा सकता है।',
    skipNotice: 'आप इस चरण को छोड़ सकते हैं और बाद में हर्ड हब से पशु जोड़ सकते हैं।',
    herdDetailsHeader: '१. गोशाला / झुंड का विवरण',
    farmNameLabel: 'गोशाला / झुंड का नाम',
    farmNamePlaceholder: 'उदा. आनंद डेयरी फार्म',
    animalCountLabel: 'अभी पंजीकृत करने के लिए पशुओं की संख्या',
    livestockListHeader: '२. पशुओं का विवरण',
    addAnimalBtn: 'अन्य पशु जोड़ें',
    animalCardTitle: 'पशु क्रमांक',
    tagNumberLabel: 'कान का टैग / इनाफ आईडी',
    tagPlaceholder: 'उदा. MH-PUN-0101',
    autoTagBtn: 'आईडी बनाएं',
    animalNameLabel: 'पशु का नाम',
    animalNamePlaceholder: 'उदा. गौरी, कपिला, लक्ष्मी',
    speciesLabel: 'पशु का प्रकार',
    breedLabel: 'नस्ल',
    sexLabel: 'लिंग',
    female: 'मादा',
    male: 'नर',
    dobLabel: 'अनुमानित आयु / जन्म तिथि',
    milkingStatusLabel: 'दूध उत्पादन स्थिति',
    lactating: 'दूध देने वाली',
    dry: 'सूखी / गाभिन',
    heifer: 'बछिया / कालवड',
    calving: 'नवप्रसूता',
    vaccinationLabel: 'टीकाकरण स्थिति',
    vaccinated: 'टीकाकरण पूर्ण',
    dueSoon: 'टीका लगना बाकी',
    notVaccinated: 'टीका नहीं लगा',
    notesLabel: 'पहचान चिह्न / टिप्पणी (वैकल्पिक)',
    notesPlaceholder: 'उदा. माथे पर सफेद टीका, अधिक दूध उत्पादन',
    saveBtn: 'झुंड सहेजें और डॅशबोर्ड शुरू करें',
    savingBtn: 'डेटाबेस में सहेजा जा रहा है...',
    skipBtn: 'अभी छोड़ें और डॅशबोर्ड पर जाएं',
    skipConfirmTitle: 'सेटअप छोड़ें?',
    skipConfirmDesc: 'आप कभी भी हर्ड हब से पशुधन जोड़ सकते हैं।',
    speciesOptions: [
      { id: 'Cattle', label: 'गाय (Cattle)' },
      { id: 'Buffalo', label: 'भैंस (Buffalo)' },
      { id: 'Goat', label: 'बकरी (Goat)' },
      { id: 'Sheep', label: 'भेड़ (Sheep)' },
      { id: 'Poultry', label: 'मुर्गी (Poultry)' },
      { id: 'Swine', label: 'सूअर (Swine)' },
    ],
    breedsBySpecies: {
      Cattle: ['गीर', 'साहिवाल', 'लाल सिंधी', 'खिलारी', 'देवणी', 'डांगी', 'एचएफ क्रॉस', 'जर्सी क्रॉस'],
      Buffalo: ['मुर्रा', 'जाफराबादी', 'पंढरपुरी', 'मेहसाणा', 'सुरती', 'नागपुरी'],
      Goat: ['उस्मानाबादी', 'बोअर', 'सिरोही', 'जमनापारी', 'संगमनेरी', 'बीटल'],
      Sheep: ['दक्कनी', 'माडग्याळ', 'नेल्लोर', 'मारवाड़ी'],
      Poultry: ['असील', 'कड़कनाथ', 'ग्रामप्रिया', 'ब्रायलर', 'लेयर'],
      Swine: ['लार्ज व्हाइट यॉर्कशायर', 'लैंडरेस', 'देशी'],
    } as Record<string, string[]>,
  },
  mr: {
    govtBadge: 'महाराष्ट्र राज्य पशुधन रोग नियंत्रण व देखरेख नेटवर्क',
    govtSubtitle: 'महाराष्ट्र शासन • पशुसंवर्धन विभाग',
    setupBadge: 'पशुपालक गोठा सेटअप',
    title: 'आपल्या पशू कळपाची व जनावरांची नोंदणी',
    subtitle: 'आजारांची पूर्वसूचना, लसीकरण आठवण व आरोग्य व्यवस्थापनासाठी आपल्या गोठ्याचे नाव, जनावरांची संख्या, नावे व जात नोंदवा. आपण हे नंतरही बदलू शकता.',
    skipNotice: 'आपण हा टप्पा आता वगळू शकता व नंतर हर्ड हबमधून जनावरे जोडू शकता.',
    herdDetailsHeader: '१. गोठा व शेतीची प्राथमिक माहिती',
    farmNameLabel: 'गोठ्याचे / डेअरीचे नाव',
    farmNamePlaceholder: 'उदा. शिंदे गोकुळ डेअरी',
    animalCountLabel: 'आता नोंदवायची जनावरांची संख्या',
    livestockListHeader: '२. जनावरांची वैयक्तिक माहिती',
    addAnimalBtn: 'आणखी जनावर जोडा',
    animalCardTitle: 'जनावर क्रमांक',
    tagNumberLabel: 'कानपट्टी / टॅग क्रमांक (INAPH ID)',
    tagPlaceholder: 'उदा. MH-PUN-0101',
    autoTagBtn: 'टॅग तयार करा',
    animalNameLabel: 'जनावराचे नाव (टोपणनाव)',
    animalNamePlaceholder: 'उदा. गौरी, कपिला, लक्ष्मी, सुंदर',
    speciesLabel: 'पशू प्रकार',
    breedLabel: 'जात / नस्ल',
    sexLabel: 'लिंग',
    female: 'मादी',
    male: 'नर',
    dobLabel: 'अंदाजे वय / जन्मतारीख',
    milkingStatusLabel: 'दुधाची व वेताची स्थिती',
    lactating: 'दुभती (दूध देणारी)',
    dry: 'आटलेली / गाभण',
    heifer: 'कालवड / पाडी',
    calving: 'विलेली',
    vaccinationLabel: 'लसीकरण स्थिती',
    vaccinated: 'सर्व लसीकरण पूर्ण',
    dueSoon: 'लस देण्याची वेळ आली',
    notVaccinated: 'लसीकरण झालेले नाही',
    notesLabel: 'ओळख खूण / विशेष माहिती (ऐच्छिक)',
    notesPlaceholder: 'उदा. कपाळावर पांढरा डाग, १५ लिटर दूध क्षमता',
    saveBtn: 'माझा गोठा जतन करा व डॅशबोर्ड उघडा',
    savingBtn: 'डेटाबेसमध्ये गोठा जतन होत आहे...',
    skipBtn: 'आता वगळा आणि थेट डॅशबोर्डवर जा',
    skipConfirmTitle: 'सेटअप आता वगळायचे आहे का?',
    skipConfirmDesc: 'आपण नंतरही हर्ड हबमधून आपल्या जनावरांची नोंदणी करू शकता.',
    speciesOptions: [
      { id: 'Cattle', label: 'गाय (Cattle)' },
      { id: 'Buffalo', label: 'म्हैस (Buffalo)' },
      { id: 'Goat', label: 'शेळी (Goat)' },
      { id: 'Sheep', label: 'मेंढी (Sheep)' },
      { id: 'Poultry', label: 'कोंबडी (Poultry)' },
      { id: 'Swine', label: 'डुक्कर (Swine)' },
    ],
    breedsBySpecies: {
      Cattle: ['गीर (Gir)', 'साहिवाल (Sahiwal)', 'खिलारी (Khillari)', 'देवणी (Deoni)', 'डांगी (Dangi)', 'एच.एफ. क्रॉस', 'जर्सी क्रॉस'],
      Buffalo: ['मुर्रा (Murrah)', 'जाफराबादी (Jaffarabadi)', 'पंढरपुरी (Pandharpuri)', 'मेहसाणा (Mehsana)', 'सुरती (Surti)', 'नागपुरी (Nagpuri)'],
      Goat: ['उस्मानाबादी (Osmanabadi)', 'बोअर (Boer)', 'सिरोही (Sirohi)', 'संगमनेरी (Sangamneri)', 'जमनापारी (Jamnapari)', 'बीटल (Beetal)'],
      Sheep: ['दख्खनी (Deccani)', 'माडग्याळ (Madgyal)', 'नेल्लोर (Nellore)', 'मारवाडी (Marwari)'],
      Poultry: ['असील (Aseel)', 'कडकनाथ (Kadaknath)', 'ग्रामप्रिया (Gramapriya)', 'ब्रॉयलर (Broiler)', 'लेयर (Layer)'],
      Swine: ['लार्ज व्हाईट यॉर्कशायर', 'लँडरेस', 'देशी स्थानिक'],
    } as Record<string, string[]>,
  },
};

export const FarmerHerdSetup: React.FC<FarmerHerdSetupProps> = ({ onComplete, onSkip }) => {
  const { language, setLanguage } = useLanguage();
  const copy = translations[language] || translations.mr;

  const currentUser = dataService.getCurrentUser();
  const defaultFarmName = currentUser?.full_name
    ? (language === 'mr' ? `${currentUser.full_name} यांचे फार्म` : language === 'hi' ? `${currentUser.full_name} का फार्म` : `${currentUser.full_name}'s Farm`)
    : '';

  const [farmName, setFarmName] = useState(defaultFarmName);
  const [loading, setLoading] = useState(false);

  // Initial list with 2 animal slots
  const [animals, setAnimals] = useState<AnimalEntry[]>([
    {
      id: 'anim-1',
      tag_number: 'MH-12-1042',
      name: language === 'mr' ? 'गौरी' : language === 'hi' ? 'गौरी' : 'Gauri',
      species: 'Cattle',
      breed: 'Gir',
      sex: 'female',
      date_of_birth: '2022-06-15',
      is_milking: true,
      milking_status: 'lactating',
      vaccination_status: 'vaccinated',
      notes: '',
    },
    {
      id: 'anim-2',
      tag_number: 'MH-12-2085',
      name: language === 'mr' ? 'लक्ष्मी' : language === 'hi' ? 'लक्ष्मी' : 'Lakshmi',
      species: 'Buffalo',
      breed: 'Murrah',
      sex: 'female',
      date_of_birth: '2023-01-10',
      is_milking: true,
      milking_status: 'lactating',
      vaccination_status: 'due',
      notes: '',
    },
  ]);

  const handleAnimalCountChange = (count: number) => {
    const validCount = Math.max(1, Math.min(20, count));
    if (validCount > animals.length) {
      const added: AnimalEntry[] = [];
      for (let i = animals.length; i < validCount; i++) {
        added.push({
          id: `anim-${Date.now()}-${i}`,
          tag_number: `MH-12-${Math.floor(1000 + Math.random() * 9000)}`,
          name: '',
          species: 'Cattle',
          breed: 'Gir',
          sex: 'female',
          date_of_birth: '2023-01-01',
          is_milking: true,
          milking_status: 'lactating',
          vaccination_status: 'vaccinated',
          notes: '',
        });
      }
      setAnimals([...animals, ...added]);
    } else if (validCount < animals.length) {
      setAnimals(animals.slice(0, validCount));
    }
  };

  const handleAddAnimal = () => {
    setAnimals([
      ...animals,
      {
        id: `anim-${Date.now()}`,
        tag_number: `MH-12-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        species: 'Cattle',
        breed: 'Gir',
        sex: 'female',
        date_of_birth: '2023-01-01',
        is_milking: true,
        milking_status: 'lactating',
        vaccination_status: 'vaccinated',
        notes: '',
      },
    ]);
  };

  const handleRemoveAnimal = (index: number) => {
    if (animals.length <= 1) return;
    setAnimals(animals.filter((_, i) => i !== index));
  };

  const updateAnimal = (index: number, field: keyof AnimalEntry, value: any) => {
    const updated = [...animals];
    updated[index] = { ...updated[index], [field]: value };

    // If species changed, auto-update breed to first of that species
    if (field === 'species') {
      const breeds = copy.breedsBySpecies[value as string] || ['Crossbreed'];
      updated[index].breed = breeds[0];
    }
    setAnimals(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const finalHerdName = farmName.trim() || (currentUser?.full_name ? `${currentUser.full_name}'s Farm` : 'My Livestock Farm');
      await dataService.saveHerdWithAnimals({
        herdName: finalHerdName,
        animals: animals.map((a) => ({
          tag_number: a.tag_number.trim() || `TAG-${Date.now()}`,
          name: a.name.trim(),
          species: a.species,
          breed: a.breed,
          sex: a.sex,
          date_of_birth: a.date_of_birth || null,
          is_milking: a.is_milking,
          milking_status: a.milking_status,
          vaccination_status: a.vaccination_status,
          notes: a.notes.trim() || undefined,
        })),
      });
      dataService.setHerdSetupCompleted(true);
      onComplete();
    } catch (err) {
      console.error('Error saving herd setup:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    dataService.setHerdSetupCompleted(true);
    onSkip();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar matching Login Page */}
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

        {/* Trilingual Language Selector */}
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

      {/* Main Container Card (matching login & onboarding modal design) */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px 16px 48px' }}>
        <div
          className="modal-card"
          style={{
            maxWidth: '720px',
            width: '100%',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 'var(--radius-xl)',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Card Top Pill Badge & Skip Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(5, 150, 105, 0.1)',
                color: 'var(--primary)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.74rem',
                fontWeight: 700,
                border: '1px solid var(--primary-border)',
              }}
            >
              <Sparkles size={13} />
              <span>{copy.setupBadge}</span>
            </div>

            {/* Prominent Skip Button */}
            <button
              onClick={handleSkip}
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = 'var(--text-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = 'var(--text-muted)';
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
            {/* Section 1: Herd Metadata */}
            <div
              style={{
                background: '#f8fafc',
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
                <Layers size={16} color="var(--primary)" />
                <span>{copy.herdDetailsHeader}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.farmNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={copy.farmNamePlaceholder}
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{copy.animalCountLabel}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleAnimalCountChange(animals.length - 1)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: '#fff',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={animals.length}
                      onChange={(e) => handleAnimalCountChange(parseInt(e.target.value) || 1)}
                      className="form-input"
                      style={{ textAlign: 'center', fontWeight: 700, width: '70px' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAnimalCountChange(animals.length + 1)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: '#fff',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {language === 'mr' ? 'एकूण जनावरे' : language === 'hi' ? 'कुल पशु' : 'total animals'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Dynamic Livestock Profiles */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={16} color="var(--primary)" />
                  <span>{copy.livestockListHeader} ({animals.length})</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddAnimal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid var(--primary-border)',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>{copy.addAnimalBtn}</span>
                </button>
              </div>

              {/* Animal Cards Roster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {animals.map((animal, idx) => (
                  <div
                    key={animal.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      position: 'relative',
                    }}
                  >
                    {/* Animal Card Header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                        paddingBottom: '10px',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {copy.animalCardTitle} #{idx + 1}
                          {animal.name ? ` • ${animal.name}` : ''}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '1px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                          }}
                        >
                          {animal.species}
                        </span>
                      </div>

                      {animals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAnimal(idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--critical)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            padding: '4px 6px',
                            borderRadius: '4px',
                          }}
                          title="Remove animal"
                        >
                          <Trash2 size={14} />
                          <span>{language === 'mr' ? 'काढा' : language === 'hi' ? 'हटाएं' : 'Remove'}</span>
                        </button>
                      )}
                    </div>

                    {/* Animal Fields Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {/* 1. Animal Name */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.animalNameLabel}
                        </label>
                        <input
                          type="text"
                          placeholder={copy.animalNamePlaceholder}
                          value={animal.name}
                          onChange={(e) => updateAnimal(idx, 'name', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        />
                      </div>

                      {/* 2. Ear Tag Number */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: 0 }}>
                            {copy.tagNumberLabel} *
                          </label>
                          <button
                            type="button"
                            onClick={() => updateAnimal(idx, 'tag_number', `MH-12-${Math.floor(1000 + Math.random() * 9000)}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '0.68rem',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            ⚡ {copy.autoTagBtn}
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder={copy.tagPlaceholder}
                          value={animal.tag_number}
                          onChange={(e) => updateAnimal(idx, 'tag_number', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.84rem', padding: '8px 10px', textTransform: 'uppercase', fontWeight: 600 }}
                        />
                      </div>

                      {/* 3. Livestock Species */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.speciesLabel}
                        </label>
                        <select
                          value={animal.species}
                          onChange={(e) => updateAnimal(idx, 'species', e.target.value)}
                          className="form-select"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        >
                          {copy.speciesOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 4. Breed */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.breedLabel}
                        </label>
                        <select
                          value={animal.breed}
                          onChange={(e) => updateAnimal(idx, 'breed', e.target.value)}
                          className="form-select"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        >
                          {(copy.breedsBySpecies[animal.species] || ['Crossbreed', 'Indigenous']).map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 5. Sex */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.sexLabel}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => updateAnimal(idx, 'sex', 'female')}
                            style={{
                              flex: 1,
                              padding: '7px 8px',
                              borderRadius: '6px',
                              border: animal.sex === 'female' ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: animal.sex === 'female' ? 'var(--primary-light)' : '#fff',
                              color: animal.sex === 'female' ? 'var(--primary)' : 'var(--text-muted)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            {copy.female}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateAnimal(idx, 'sex', 'male')}
                            style={{
                              flex: 1,
                              padding: '7px 8px',
                              borderRadius: '6px',
                              border: animal.sex === 'male' ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: animal.sex === 'male' ? 'var(--primary-light)' : '#fff',
                              color: animal.sex === 'male' ? 'var(--primary)' : 'var(--text-muted)',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                            }}
                          >
                            {copy.male}
                          </button>
                        </div>
                      </div>

                      {/* 6. Date of Birth */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.dobLabel}
                        </label>
                        <input
                          type="date"
                          value={animal.date_of_birth}
                          onChange={(e) => updateAnimal(idx, 'date_of_birth', e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        />
                      </div>

                      {/* 7. Milking / Lactation Status */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.milkingStatusLabel}
                        </label>
                        <select
                          value={animal.milking_status}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            updateAnimal(idx, 'milking_status', val);
                            updateAnimal(idx, 'is_milking', val === 'lactating');
                          }}
                          className="form-select"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        >
                          <option value="lactating">{copy.lactating}</option>
                          <option value="dry">{copy.dry}</option>
                          <option value="heifer">{copy.heifer}</option>
                          <option value="calving">{copy.calving}</option>
                        </select>
                      </div>

                      {/* 8. Vaccination Status */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>
                          {copy.vaccinationLabel}
                        </label>
                        <select
                          value={animal.vaccination_status}
                          onChange={(e) => updateAnimal(idx, 'vaccination_status', e.target.value)}
                          className="form-select"
                          style={{ fontSize: '0.84rem', padding: '8px 10px' }}
                        >
                          <option value="vaccinated">{copy.vaccinated}</option>
                          <option value="due">{copy.dueSoon}</option>
                          <option value="not_vaccinated">{copy.notVaccinated}</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Identification Notes */}
                    <div style={{ marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder={copy.notesPlaceholder}
                        value={animal.notes}
                        onChange={(e) => updateAnimal(idx, 'notes', e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.78rem', padding: '6px 10px', background: '#fafafa' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
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
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <span>{copy.skipBtn}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
