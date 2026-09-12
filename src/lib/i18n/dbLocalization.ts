import { AppLanguage } from '@/types/database';

/**
 * Universal helper to resolve localized text from any database entity supporting multilingual columns (_en, _hi, _mr).
 * Priority: field_{lang} -> field_en -> field (default fallback)
 */
export function getLocalizedField<T extends Record<string, any>>(
  entity: T | null | undefined,
  field: string,
  lang: AppLanguage = 'en'
): string {
  if (!entity) return '';

  const localizedKey = `${field}_${lang}`;
  if (entity[localizedKey] && typeof entity[localizedKey] === 'string' && entity[localizedKey].trim() !== '') {
    return entity[localizedKey];
  }

  const enKey = `${field}_en`;
  if (entity[enKey] && typeof entity[enKey] === 'string' && entity[enKey].trim() !== '') {
    return entity[enKey];
  }

  if (entity[field] && typeof entity[field] === 'string' && entity[field].trim() !== '') {
    return entity[field];
  }

  return '';
}

/**
 * Species translations (Database values to active language)
 */
export const SPECIES_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  Cattle: { en: 'Cattle (Cow / Bull)', hi: 'गाय / बैल (Cattle)', mr: 'गाय / बैल (Cattle)' },
  Buffalo: { en: 'Buffalo', hi: 'भैंस (Buffalo)', mr: 'म्हैस (Buffalo)' },
  Goat: { en: 'Goat', hi: 'बकरी (Goat)', mr: 'शेळी (Goat)' },
  Sheep: { en: 'Sheep', hi: 'भेड़ (Sheep)', mr: 'मेंढी (Sheep)' },
  Camel: { en: 'Camel', hi: 'ऊंट (Camel)', mr: 'उंट (Camel)' },
  Horse: { en: 'Horse / Equine', hi: 'घोड़ा / खच्चर (Horse)', mr: 'घोडा / खच्चर (Horse)' },
  Pig: { en: 'Pig / Swine', hi: 'सूअर (Pig)', mr: 'डुक्कर (Pig)' },
  Poultry: { en: 'Poultry (Chicken / Duck)', hi: 'मुर्गी / कुक्कुट (Poultry)', mr: 'कुक्कुट / कोंबडी (Poultry)' },
  Yak: { en: 'Yak / Mithun', hi: 'याक / मिथुन (Yak)', mr: 'याक / मिथुन (Yak)' },
  Donkey: { en: 'Donkey', hi: 'गधा (Donkey)', mr: 'गाढव (Donkey)' },
};

export function localizeSpecies(species: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!species) return '';
  const match = Object.keys(SPECIES_TRANSLATIONS).find(
    (k) => k.toLowerCase() === species.toLowerCase()
  );
  if (match) return SPECIES_TRANSLATIONS[match][lang];
  return species;
}

/**
 * Breed translations
 */
export const BREED_TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  Gir: { en: 'Gir', hi: 'गीर', mr: 'गीर' },
  Murrah: { en: 'Murrah', hi: 'मुर्रा', mr: 'मुर्रा' },
  Khillari: { en: 'Khillari', hi: 'खिल्लारी', mr: 'खिल्लारी' },
  'Holstein Friesian': { en: 'Holstein Friesian', hi: 'होल्स्टीन फ्रीजियन', mr: 'होल्स्टीन फ्रिजीयन' },
  Sahiwal: { en: 'Sahiwal', hi: 'साहीवाल', mr: 'साहिवाल' },
  Osmanabadi: { en: 'Osmanabadi', hi: 'उस्मानाबादी', mr: 'उस्मानाबादी' },
  Sirohi: { en: 'Sirohi Goat', hi: 'सिरोही बकरी', mr: 'सिरोही शेळी' },
  Deccani: { en: 'Deccani Sheep', hi: 'दक्कनी भेड़', mr: 'दख्खनी मेंढी' },
  Kachchhi: { en: 'Kachchhi Camel', hi: 'कच्छी ऊंट', mr: 'कच्छी उंट' },
  Marwari: { en: 'Marwari Horse/Sheep', hi: 'मारवाड़ी', mr: 'मारवाडी' },
  Kadaknath: { en: 'Kadaknath Poultry', hi: 'कड़कनाथ मुर्गा', mr: 'कडकनाथ कोंबडी' },
  'Yorkshire Pig': { en: 'Large White Yorkshire', hi: 'यॉर्कशायर सूअर', mr: 'यॉर्कशायर डुक्कर' },
  Indigenous: { en: 'Indigenous Desi', hi: 'देसी नस्ल', mr: 'गावरान / देशी जात' },
};

export function localizeBreed(breed: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!breed) return '';
  const match = Object.keys(BREED_TRANSLATIONS).find(
    (k) => k.toLowerCase() === breed.toLowerCase()
  );
  if (match) return BREED_TRANSLATIONS[match][lang];
  return breed;
}

/**
 * Symptoms translations (comma separated in database)
 */
export const SYMPTOM_DICT: Record<string, Record<AppLanguage, string>> = {
  Fever: { en: 'Fever', hi: 'बुखार', mr: 'ताप' },
  Coughing: { en: 'Coughing', hi: 'खांसी', mr: 'खोकला' },
  'Nasal discharge': { en: 'Nasal discharge', hi: 'नाक से स्राव', mr: 'नाकातून स्राव' },
  'Difficulty breathing': { en: 'Difficulty breathing', hi: 'सांस लेने में कठिनाई', mr: 'श्वास घेण्यास त्रास' },
  Diarrhea: { en: 'Diarrhea', hi: 'दस्त (डायरिया)', mr: 'हगवण / जुलाब' },
  'Loss of appetite': { en: 'Loss of appetite', hi: 'भूख में कमी', mr: 'चारा कमी खाणे' },
  Weakness: { en: 'Weakness', hi: 'कमजोरी', mr: 'अशक्तपणा' },
  'Skin lesions': { en: 'Skin lesions', hi: 'त्वचा पर छाले / गांठें', mr: 'त्वचेवर गाठी / फोड' },
  Swelling: { en: 'Swelling', hi: 'सूजन', mr: 'सूज' },
  'Abnormal movement': { en: 'Abnormal movement', hi: 'लंगड़ाना', mr: 'लंगडणे' },
  'Sudden death': { en: 'Sudden death', hi: 'अचानक मृत्यु', mr: 'अचानक मृत्यू' },
  'Reduced milk production': { en: 'Reduced milk production', hi: 'दूध उत्पादन में कमी', mr: 'दूध उत्पादनात घट' },
  'General health complaint': { en: 'General health complaint', hi: 'सामान्य स्वास्थ्य शिकायत', mr: 'सामान्य आरोग्य तक्रार' },
};

export function localizeSymptoms(symptomsString: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!symptomsString) return '';
  const parts = symptomsString.split(',').map((s) => s.trim());
  const translated = parts.map((part) => {
    for (const [key, map] of Object.entries(SYMPTOM_DICT)) {
      if (
        part.toLowerCase() === key.toLowerCase() ||
        part.toLowerCase() === map.en.toLowerCase() ||
        part.toLowerCase() === map.hi.toLowerCase() ||
        part.toLowerCase() === map.mr.toLowerCase()
      ) {
        return map[lang];
      }
    }
    return part;
  });
  return translated.join(', ');
}

/**
 * Common treatments translations
 */
export const TREATMENT_DICT: Record<string, Record<AppLanguage, string>> = {
  Ceftiofur: { en: 'Ceftiofur Antibiotic (IM)', hi: 'सेफ्टियोफुर एंटीबायोटिक (IM)', mr: 'सेफ्टियोफुर अँटीबायोटिक (IM)' },
  Meloxicam: { en: 'Meloxicam Anti-inflammatory', hi: 'मेलोक्सिकैम दर्द निवारक', mr: 'मेलोक्सिकॅम वेदनाशामक' },
  'Fluid Therapy': { en: 'Fluid & Electrolyte Therapy', hi: 'इलेक्ट्रोलाइट व फ्लुइड थेरेपी', mr: 'इलेक्ट्रोलाइट व सलाईन उपचार' },
};

export function localizeTreatment(name: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!name) return '';
  for (const [key, map] of Object.entries(TREATMENT_DICT)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return map[lang];
    }
  }
  return name;
}

/**
 * Common vaccines translations
 */
export const VACCINE_DICT: Record<string, Record<AppLanguage, string>> = {
  FMD: { en: 'FMD Quadrivalent Vaccine', hi: 'खुरपका-मुंहपका (FMD) लस', mr: 'लाळ-खुरकूत (FMD) लस' },
  LSD: { en: 'Lumpy Skin Disease (LSD) Vaccine', hi: 'लम्पी त्वचा रोग (LSD) टीका', mr: 'लम्पी चर्मरोग (LSD) लस' },
  Anthrax: { en: 'Anthrax Spore Vaccine', hi: 'एंथ्रेक्स स्पोर टीका', mr: 'अँथ्रॅक्स (काळपुळी) लस' },
  HS: { en: 'Hemorrhagic Septicemia (HS) Vaccine', hi: 'गलाघोंटू (HS) टीका', mr: 'घटसर्प (HS) लस' },
};

export function localizeVaccine(name: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!name) return '';
  for (const [key, map] of Object.entries(VACCINE_DICT)) {
    if (name.toUpperCase().includes(key.toUpperCase())) {
      return map[lang];
    }
  }
  return name;
}

/**
 * Status translations (healthy, treatment, affected, critical)
 */
export const STATUS_DICT: Record<string, Record<AppLanguage, string>> = {
  healthy: { en: 'Healthy', hi: 'स्वस्थ / निरोग', mr: 'निरोगी' },
  treatment: { en: 'Under Treatment', hi: 'उपचाराधीन', mr: 'उपचार सुरू' },
  affected: { en: 'Affected', hi: 'लक्षणे असलेले', mr: 'लक्षणे असलेले' },
  critical: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' },
  suspected: { en: 'Suspected', hi: 'संदिग्ध', mr: 'संशयित' },
  probable: { en: 'Probable', hi: 'संभावित', mr: 'संभाव्य' },
  confirmed: { en: 'Confirmed', hi: 'पुष्ट', mr: 'निश्चित' },
  ruled_out: { en: 'Ruled Out', hi: 'खारिज', mr: 'फेटाळले' },
  open: { en: 'Open', hi: 'खुला', mr: 'प्रलंबित' },
  in_progress: { en: 'In Progress', hi: 'प्रक्रियाधीन', mr: 'प्रगतीपथावर' },
  resolved: { en: 'Resolved', hi: 'समाधान हुआ', mr: 'सोडवले' },
  active: { en: 'Active', hi: 'सक्रिय', mr: 'सक्रिय' },
  contained: { en: 'Contained', hi: 'नियंत्रित', mr: 'नियंत्रित' },
};

export function localizeStatus(status: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!status) return '';
  const lower = status.toLowerCase();
  if (STATUS_DICT[lower]) return STATUS_DICT[lower][lang];
  return status;
}

/**
 * Diagnostic sample types & status translations
 */
export const SAMPLE_DICT: Record<string, Record<AppLanguage, string>> = {
  'Nasal swab': { en: 'Nasal swab', hi: 'नेजल स्वैब (नाक का स्राव)', mr: 'नाकातील स्त्राव (Nasal swab)' },
  Blood: { en: 'Whole Blood', hi: 'रक्त नमूना', mr: 'रक्त नमुना' },
  Saliva: { en: 'Oral/Saliva swab', hi: 'लार का नमूना', mr: 'लाळ नमुना' },
  Serum: { en: 'Serum', hi: 'सीरम', mr: 'सीरम' },
  Tissue: { en: 'Tissue biopsy', hi: 'ऊतक बायोप्सी', mr: 'उती बायोप्सी' },
  collected: { en: 'Collected', hi: 'एकत्रित', mr: 'संकलित' },
  sent: { en: 'In Transit / Sent', hi: 'भेजा गया', mr: 'पाठवले' },
  received: { en: 'Lab Received', hi: 'प्रयोगशाला प्राप्त', mr: 'प्रयोगशाळेत प्राप्त' },
  tested: { en: 'Tested & Verified', hi: 'परीक्षण पूर्ण', mr: 'चाचणी पूर्ण' },
};

export function localizeSampleType(type: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!type) return '';
  for (const [key, map] of Object.entries(SAMPLE_DICT)) {
    if (type.toLowerCase().includes(key.toLowerCase())) {
      return map[lang];
    }
  }
  return type;
}

export function localizeSampleStatus(status: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!status) return '';
  const lower = status.toLowerCase();
  if (SAMPLE_DICT[lower]) return SAMPLE_DICT[lower][lang];
  return status;
}

/**
 * Talukas / Blocks translations
 */
export const BLOCK_DICT: Record<string, Record<AppLanguage, string>> = {
  Shirur: { en: 'Shirur', hi: 'शिरूर', mr: 'शिरूर' },
  Baramati: { en: 'Baramati', hi: 'बारामती', mr: 'बारामती' },
  Haveli: { en: 'Haveli', hi: 'हवेली', mr: 'हवेली' },
  Khed: { en: 'Khed', hi: 'खेड', mr: 'खेड' },
  Ambegaon: { en: 'Ambegaon', hi: 'आंबेगाव', mr: 'आंबेगाव' },
  Pune: { en: 'Pune', hi: 'पुणे', mr: 'पुणे' },
};

export function localizeBlock(block: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!block) return '';
  if (BLOCK_DICT[block]) return BLOCK_DICT[block][lang];
  return block;
}

/**
 * Villages translations
 */
export const VILLAGE_DICT: Record<string, Record<AppLanguage, string>> = {
  Shirapur: { en: 'Shirapur', hi: 'शिरापुर', mr: 'शिरापूर' },
  'Koregaon Bhima': { en: 'Koregaon Bhima', hi: 'कोरेगांव भीमा', mr: 'कोरेगाव भीमा' },
  Kavathe: { en: 'Kavathe', hi: 'कवठे', mr: 'कवठे' },
  'Nimgaon Mhalungi': { en: 'Nimgaon Mhalungi', hi: 'निमगांव म्हाळुंगी', mr: 'निमगाव म्हाळुंगी' },
  Baburdi: { en: 'Baburdi', hi: 'बाबुर्डी', mr: 'बाबुर्डी' },
  Malegaon: { en: 'Malegaon', hi: 'मालेगांव', mr: 'मालेगाव' },
  Songaon: { en: 'Songaon', hi: 'सोनगांव', mr: 'सोनगाव' },
  Morgaon: { en: 'Morgaon', hi: 'मोरगांव', mr: 'मोरगाव' },
  Wagholi: { en: 'Wagholi', hi: 'वाघोली', mr: 'वाघोली' },
  'Loni Kalbhor': { en: 'Loni Kalbhor', hi: 'लोणी काळभोर', mr: 'लोणी काळभोर' },
  'Uruli Kanchan': { en: 'Uruli Kanchan', hi: 'उरुळी कांचन', mr: 'उरुळी कांचन' },
  Chakan: { en: 'Chakan', hi: 'चाकण', mr: 'चाकण' },
  Rajgurunagar: { en: 'Rajgurunagar', hi: 'राजगुरुनगर', mr: 'राजगुरुनगर' },
  Alandi: { en: 'Alandi', hi: 'आळंदी', mr: 'आळंदी' },
  Manchar: { en: 'Manchar', hi: 'मंचर', mr: 'मंचर' },
  Ghodegaon: { en: 'Ghodegaon', hi: 'घोडेगांव', mr: 'घोडेगाव' },
};

export function localizeVillage(village: string | null | undefined, lang: AppLanguage = 'en'): string {
  if (!village) return '';
  if (VILLAGE_DICT[village]) return VILLAGE_DICT[village][lang];
  return village;
}

/**
 * Localizes an administrative location's name.
 */
export function getLocalizedLocationName(
  location: { name: string; name_en?: string; name_hi?: string; name_mr?: string } | null | undefined,
  lang: AppLanguage = 'en'
): string {
  return getLocalizedField(location, 'name', lang) || location?.name || '';
}

/**
 * Localizes a disease item's title/name.
 */
export function getLocalizedDiseaseName(
  disease: { name: string; name_en?: string; name_hi?: string; name_mr?: string } | null | undefined,
  lang: AppLanguage = 'en'
): string {
  return getLocalizedField(disease, 'name', lang) || disease?.name || '';
}

/**
 * Localizes a disease item's clinical description.
 */
export function getLocalizedDiseaseDescription(
  disease: { description: string | null; description_en?: string | null; description_hi?: string | null; description_mr?: string | null } | null | undefined,
  lang: AppLanguage = 'en'
): string {
  return getLocalizedField(disease, 'description', lang) || disease?.description || '';
}

/**
 * Localizes weather observation condition text.
 */
export function getLocalizedWeatherDescription(
  weather: { description: string | null; description_en?: string | null; description_hi?: string | null; description_mr?: string | null } | null | undefined,
  lang: AppLanguage = 'en'
): string {
  return getLocalizedField(weather, 'description', lang) || weather?.description || '';
}

/**
 * Localizes outbreak event title and description.
 */
export function getLocalizedOutbreak(
  outbreak: {
    title: string;
    title_en?: string;
    title_hi?: string;
    title_mr?: string;
    description: string | null;
    description_en?: string | null;
    description_hi?: string | null;
    description_mr?: string | null;
  } | null | undefined,
  lang: AppLanguage = 'en'
): { title: string; description: string } {
  return {
    title: getLocalizedField(outbreak, 'title', lang) || outbreak?.title || '',
    description: getLocalizedField(outbreak, 'description', lang) || outbreak?.description || '',
  };
}

/**
 * Localizes notification title and message.
 */
export function getLocalizedNotification(
  notif: {
    title: string;
    title_en?: string;
    title_hi?: string;
    title_mr?: string;
    message: string;
    message_en?: string;
    message_hi?: string;
    message_mr?: string;
  } | null | undefined,
  lang: AppLanguage = 'en'
): { title: string; message: string } {
  return {
    title: getLocalizedField(notif, 'title', lang) || notif?.title || '',
    message: getLocalizedField(notif, 'message', lang) || notif?.message || '',
  };
}
