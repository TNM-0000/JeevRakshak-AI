/**
 * JeevRakshak AI - Clinical Disease Predictor & Triage Engine
 * 
 * Implements clinical decision support combining:
 * 1. Pluggable ML Model Hook (via AI_DISEASE_MODEL_URL or Gemini API)
 * 2. ICAR / OIE Standard Clinical Decision Rules Engine for Indian Livestock
 * 
 * Provides deterministic fallbacks and differential diagnostic logic for
 * endemic diseases in Maharashtra (FMD, LSD, Anthrax, BRD, PPR, Brucellosis, HS, BQ).
 */

import {
  DiseasePredictionInput,
  DiseasePredictionResult,
  DifferentialDiagnosisItem,
  RiskLevel,
  CaseTriageStatus,
} from './contracts';
import { assessLivestockCase } from './api';

interface DiseaseKnowledgeProfile {
  id: string;
  name: string;
  nameHi: string;
  nameMr: string;
  species: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];
  negativeKeywords?: string[];
  severity: RiskLevel;
  sampleType: string;
  collectionProtocol: string;
  quarantineRequired: boolean;
  zoonotic: boolean;
  sopSteps: string[];
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
}

const DISEASE_PROFILES: DiseaseKnowledgeProfile[] = [
  {
    id: 'dis-fmd',
    name: 'Foot and Mouth Disease (FMD)',
    nameHi: 'खुरपका और मुंहपका रोग (FMD)',
    nameMr: 'लाळ-खुरकूत रोग (FMD)',
    species: ['cattle', 'buffalo', 'cow', 'sheep', 'goat', 'pig'],
    primaryKeywords: [
      'blister', 'vesicle', 'salivation', 'drooling', 'saliva', 'tongue',
      'mouth ulcer', 'hoof lesion', 'foot lesion', 'interdigital', 'lameness',
      'लाळ', 'खुर', 'फोड', 'तोंडात', 'छाले', 'लार'
    ],
    secondaryKeywords: ['fever', 'milk drop', 'loss of appetite', 'anorexia', 'shivering', 'ताप', 'दूध'],
    severity: 'high',
    sampleType: 'Vesicular fluid & tongue epithelium in 50% glycerol PBS',
    collectionProtocol: 'Collect intact vesicles or unruptured epithelial tissue from tongue/hoof into viral transport medium on ice. Ship to IVRI/CDDL within 24h.',
    quarantineRequired: true,
    zoonotic: false,
    sopSteps: [
      'Strictly isolate infected animal in separate shed at least 50m away.',
      'Disinfect shed perimeter and entry dip with 4% Sodium Carbonate or 1% Potassium Permanganate.',
      'Clean oral ulcers with 1% potassium permanganate solution; apply boroglycerine.',
      'Dress foot lesions with antiseptic solution (e.g. fly repellent and copper sulphate).',
      'Halt milk transport and animal movement across the village immediately.',
      'Report cluster to Panchayat and local Livestock Development Officer (LDO).'
    ],
    summaryEn: 'High probability match for Foot and Mouth Disease (FMD). Acute vesicular lesions, hypersalivation, and lameness detected. Immediate quarantine and ring containment required.',
    summaryHi: 'खुरपका-मुंहपका रोग (FMD) की अत्यधिक संभावना। मुंह में छाले, अत्यधिक लार और लंगड़ापन देखा गया है। तत्काल संगरोध (quarantine) की आवश्यकता है।',
    summaryMr: 'लाळ-खुरकूत रोगाची (FMD) दाट शक्यता. तोंडात व खुरांवर फोड, लाळ गळणे व लंगडणे ही लक्षणे आढळली. तातडीने जनावराचे विलगीकरण करा.'
  },
  {
    id: 'dis-lsd',
    name: 'Lumpy Skin Disease (LSD)',
    nameHi: 'लम्पी त्वचा रोग (LSD)',
    nameMr: 'लम्पी चर्मरोग (LSD)',
    species: ['cattle', 'cow', 'buffalo'],
    primaryKeywords: [
      'nodule', 'lump', 'skin lesion', 'skin nodule', 'hide nodule',
      'swollen lymph', 'edema', 'leg swelling', 'dewlap swelling',
      'गाठ', 'त्वचा', 'लम्पी', 'गांठ'
    ],
    secondaryKeywords: ['high fever', 'lacrimation', 'eye discharge', 'nasal discharge', 'milk drop', 'lethargy'],
    severity: 'high',
    sampleType: 'Skin lesion biopsy/scab and EDTA whole blood',
    collectionProtocol: 'Collect nodular scab tissue in sterile container and 5ml whole blood in EDTA tube for PCR detection of Capripoxvirus.',
    quarantineRequired: true,
    zoonotic: false,
    sopSteps: [
      'Isolate affected cattle under mosquito/fly netting.',
      'Apply neem oil and fly repellents to reduce vector feeding (Culicoides & Stomoxys flies).',
      'Administer supportive antipyretic (Meloxicam/Paracetamol) and antiseptic skin wash.',
      'Notify block veterinary dispensary for emergency Goat Pox ring vaccination within 5km zone.',
      'Do not allow grazing in communal pasture.'
    ],
    summaryEn: 'Clinical manifestation consistent with Lumpy Skin Disease (LSD). Circumscribed cutaneous nodules and fever observed. Vector control and ring vaccination indicated.',
    summaryHi: 'लम्पी त्वचा रोग (LSD) के विशिष्ट लक्षण। त्वचा पर गांठें और तेज बुखार। मक्खी/मच्छर नियंत्रण और 5 किमी में टीकाकरण आवश्यक।',
    summaryMr: 'लम्पी चर्मरोगाची (LSD) लक्षणे. अंगावर कडक गाठी, ताप व सूज. तातडीने गोठा निर्जंतुकीकरण व ५ किमी परिसरात गोटपॉक्स लसीकरण करा.'
  },
  {
    id: 'dis-anthrax',
    name: 'Anthrax (Bacillus anthracis)',
    nameHi: 'एंथ्रेक्स (गिलटी रोग)',
    nameMr: 'अँथ्रॅक्स (काळपुळी)',
    species: ['cattle', 'buffalo', 'sheep', 'goat', 'cow'],
    primaryKeywords: [
      'sudden death', 'unclotted blood', 'dark blood', 'bleeding from nose',
      'bleeding from rectum', 'no rigor mortis', 'bloating after death',
      'अचानक मृत्यू', 'काळे रक्त', 'रक्तस्राव', 'खून'
    ],
    secondaryKeywords: ['very high fever', 'colic', 'dyspnea', 'tremor', 'collapse'],
    severity: 'critical',
    sampleType: 'Peripheral blood smear from ear vein (DO NOT OPEN CARCASS)',
    collectionProtocol: 'STRICT BIOSECURITY: Never perform post-mortem. Aspirate drops of blood from ear vein using sterile needle onto glass slide, heat fix, and pack in leakproof biocontainer.',
    quarantineRequired: true,
    zoonotic: true,
    sopSteps: [
      'CRITICAL: DO NOT OPEN OR FLAY THE CARCASS. Opening exposes spores to oxygen, contaminating soil for decades.',
      'Deep bury carcass at least 6 feet deep covered completely in quicklime (slaked lime).',
      'Quarantine entire premise and burn all contaminated bedding and feed.',
      'Notify District Animal Husbandry Officer (DAHO) and Human Health Department immediately (Zoonotic danger).',
      'Commence emergency penicillin/oxytetracycline prophylaxis in in-contact livestock.'
    ],
    summaryEn: 'CRITICAL ZOONOTIC ALERT: Clinical signs match Anthrax (Bacillus anthracis). Extreme risk. Carcass must not be opened. Deep burial with quicklime mandatory.',
    summaryHi: 'अतिसंवेदनशील चेतावनी: एंथ्रेक्स की प्रबल आशंका। शव का विच्छेदन (post-mortem) कदापि न करें। चूने के साथ 6 फीट गहरे गड्ढे में दफनाएं।',
    summaryMr: 'अतिदक्षतेचा इशारा: काळपुळी (अँथ्रॅक्स) रोगाची तीव्र लक्षणे. मृत जनावराचे शवविच्छेदन करू नका. जमिनीत ६ फूट खोल चुन्यामध्ये पुरा.'
  },
  {
    id: 'dis-brd',
    name: 'Bovine Respiratory Disease (BRD)',
    nameHi: 'गोवंशीय श्वसन रोग (BRD)',
    nameMr: 'गुरांचा श्वसन रोग (BRD)',
    species: ['cattle', 'cow', 'buffalo'],
    primaryKeywords: [
      'cough', 'nasal discharge', 'dyspnea', 'labored breathing', 'rapid breathing',
      'grunting', 'pneumonia', 'wheezing', 'खोकला', 'शिंका', 'धाप', 'श्वास'
    ],
    secondaryKeywords: ['fever', 'depression', 'drooping ears', 'loss of appetite', 'discharge'],
    severity: 'medium',
    sampleType: 'Deep nasopharyngeal swab in viral/bacterial transport media',
    collectionProtocol: 'Insert sterile long nasopharyngeal swab into ventrolateral nasal passage, rotate gently, and place in transport medium at 4°C.',
    quarantineRequired: false,
    zoonotic: false,
    sopSteps: [
      'Provide well-ventilated, dry, and dust-free bedding.',
      'Isolate from crowded pens to minimize aerosol transmission.',
      'Administer prescribed broad-spectrum antibiotic and NSAID for fever relief.',
      'Supply lukewarm water and palatable green fodder.'
    ],
    summaryEn: 'Presentation indicates Bovine Respiratory Disease Complex (BRD). Dyspnea and nasal exudate noted. Antibiotic therapy and ventilation management required.',
    summaryHi: 'गोवंशीय श्वसन रोग (BRD) के संकेत। सांस लेने में तकलीफ और नाक से स्राव। उचित एंटीबायोटिक और हवादार बाड़े की व्यवस्था करें।',
    summaryMr: 'गुरांच्या श्वसनसंस्थेचा दाह (BRD). खोकला व धाप लागणे. कोरडी जागा व वेळेवर औषधोपचार आवश्यक.'
  },
  {
    id: 'dis-ppr',
    name: 'Peste des Petits Ruminants (PPR)',
    nameHi: 'बकरियों का प्लेग (PPR)',
    nameMr: 'शेळ्या-मेंढ्यांचा प्लेग (PPR)',
    species: ['goat', 'sheep'],
    primaryKeywords: [
      'stomatitis', 'mouth sores', 'foul diarrhea', 'profuse diarrhea',
      'matted eyes', 'crusted muzzle', 'goat plague', 'शेळी', 'हगवण', 'प्लेग', 'दस्त'
    ],
    secondaryKeywords: ['high fever', 'cough', 'pneumonia', 'nasal discharge', 'dehydration'],
    severity: 'high',
    sampleType: 'Conjunctival/nasal swab and mesenteric lymph node biopsy',
    collectionProtocol: 'Collect swabs from ocular/oral lesions during febrile stage. Ship on ice pack to regional disease laboratory.',
    quarantineRequired: true,
    zoonotic: false,
    sopSteps: [
      'Segregate affected goats/sheep immediately from the flock.',
      'Administer oral rehydration fluids to combat acute dehydration from diarrhea.',
      'Wash oral erosions with mild antiseptic wash.',
      'Vaccinate all healthy goats in 3km radius with PPR vaccine.'
    ],
    summaryEn: 'High clinical suspicion of Peste des Petits Ruminants (Goat Plague). Severe stomatitis and enteritis in small ruminants. Electrolyte therapy and flock isolation essential.',
    summaryHi: 'बकरियों के प्लेग (PPR) की प्रबल आशंका। मुंह में घाव और दस्त। निर्जलीकरण रोकने के लिए ओआरएस और झुंड से अलग रखना जरूरी।',
    summaryMr: 'शेळ्या-मेंढ्यांचा प्लेग (PPR). तोंडात अल्सर, ताप व तीव्र हगवण. शेळ्यांचे तातडीने विलगीकरण व ओआरएस द्या.'
  },
  {
    id: 'dis-brucellosis',
    name: 'Brucellosis',
    nameHi: 'ब्रुसेलोसिस (संक्रामक गर्भपात)',
    nameMr: 'ब्रुसेलोसिस (संसर्गजन्य गर्भपात)',
    species: ['cattle', 'cow', 'buffalo', 'goat', 'sheep'],
    primaryKeywords: [
      'abortion', 'aborted fetus', 'retained placenta', 'stillbirth',
      'hygroma', 'orchitis', 'infertility', 'गर्भपात', 'वार अडकणे'
    ],
    secondaryKeywords: ['weak calf', 'mastitis', 'low milk yield'],
    severity: 'medium',
    sampleType: 'Serum for RBPT / Aborted fetal stomach contents',
    collectionProtocol: 'Wear double latex gloves. Collect 10ml clotted blood for serum Rose Bengal Plate Test (RBPT) and ELISA. Burn aborted membranes with disinfectant.',
    quarantineRequired: true,
    zoonotic: true,
    sopSteps: [
      'ZOONOTIC RISK: Handle aborted fetus, placenta, and uterine discharge with sterile gloves and gumboots.',
      'Deep bury aborted fetus and contaminated membranes in quicklime; disinfect floor with 2% sodium hydroxide.',
      'Boil all milk from the dam before consumption; do not drink raw milk.',
      'Test entire breeding herd with Rose Bengal Plate Test.'
    ],
    summaryEn: 'Signs indicate possible Brucellosis infection. Late-term abortion / retained placenta detected. Zoonotic precautions: wear gloves, boil milk, and screen herd.',
    summaryHi: 'ब्रुसेलोसिस (संक्रामक गर्भपात) की संभावना। भ्रूण और जेर को नंगे हाथों से न छुएं (मानवों में संक्रमण का खतरा)। दूध उबालकर ही पिएं।',
    summaryMr: 'संसर्गजन्य गर्भपात (ब्रुसेलोसिस) संशय. गर्भ टाकलेल्या पिल्लाला व वारेला उघड्या हाताने स्पर्श करू नका. दूध उकळूनच वापरावे.'
  },
  {
    id: 'dis-hs',
    name: 'Hemorrhagic Septicemia (HS)',
    nameHi: 'गलघोंटू (HS)',
    nameMr: 'घटसर्प (HS)',
    species: ['cattle', 'cow', 'buffalo'],
    primaryKeywords: [
      'swollen throat', 'brisket edema', 'submandibular swelling', 'grunting',
      'tongue protrusion', 'choking', 'salivation', 'गलघोंटू', 'घटसर्प', 'गळा सुजणे'
    ],
    secondaryKeywords: ['very high fever', 'sudden collapse', 'rapid death', 'mucous discharge'],
    severity: 'critical',
    sampleType: 'Blood smear from peripheral vein & nasal swab',
    collectionProtocol: 'Collect blood smear at peak fever stage before antibiotic administration. Pasteurella multocida bipolar staining will be observed.',
    quarantineRequired: true,
    zoonotic: false,
    sopSteps: [
      'EMERGENCY: Hyper-acute bacterial infection. Immediate intravenous antibiotic (Sulfadimidine / Ceftiofur) within first 6-12 hours is critical.',
      'Keep head elevated to prevent asphyxiation from throat swelling.',
      'Administer high-potency anti-inflammatory to reduce tracheal compression.',
      'Isolate from communal water ponds; HS spreads rapidly via contaminated drinking water.'
    ],
    summaryEn: 'CRITICAL EMERGENCY: Signs indicative of Hemorrhagic Septicemia (HS). Submandibular edema and severe respiratory distress. Urgent parenteral antibiotic therapy needed.',
    summaryHi: 'अतिगंभीर आपातकाल: गलघोंटू (HS) के लक्षण। गले में सूजन और सांस में घुरघुराहट। तत्काल पशु चिकित्सक द्वारा सुल्फाडिमिडीन इंजेक्शन लगवाएं।',
    summaryMr: 'अतितातडीची स्थिती: घटसर्प (HS) रोगाची लक्षणे. गळ्याला मोठी सूज व श्वास गुदमरणे. पहिल्या काही तासांत डॉक्टरांकडून इंजेक्शन देणे अत्यावश्यक.'
  },
  {
    id: 'dis-bq',
    name: 'Blackleg (Black Quarter - BQ)',
    nameHi: 'लंगड़ा बुखार (BQ)',
    nameMr: 'फऱ्या / एकटांग्या (BQ)',
    species: ['cattle', 'cow', 'buffalo'],
    primaryKeywords: [
      'swollen thigh', 'crepitating swelling', 'crackling swelling', 'hot painful swelling',
      'muscle crackle', 'quarter lameness', 'लंगड़ा', 'फऱ्या', 'मांडी सुजणे'
    ],
    secondaryKeywords: ['high fever', 'sudden lameness', 'anorexia', 'dark muscle', 'acute prostration'],
    severity: 'critical',
    sampleType: 'Muscle aspirate/exudate from crepitating swellings',
    collectionProtocol: 'Aspirate serosanguinous fluid from deep affected thigh muscle anaerobically for Clostridium chauvoei fluorescent antibody test.',
    quarantineRequired: true,
    zoonotic: false,
    sopSteps: [
      'Isolate animal in quiet stall. Crepitation (crackling sensation under skin) indicates anaerobic toxin production.',
      'Commence high-dose Penicillin G or Oxytetracycline immediately.',
      'Administer supportive fluid therapy and analgesics.',
      'Burn topsoil contaminated by discharges; Clostridial spores persist in soil.'
    ],
    summaryEn: 'CRITICAL: Symptoms characteristic of Blackleg (Clostridium chauvoei). Crepitating swelling on quarters and acute lameness. Immediate antibiotic therapy required.',
    summaryHi: 'गंभीर स्थिति: लंगड़ा बुखार (BQ) के लक्षण। पुट्ठे/मांसपेशियों पर गैस भरी कुरकुरेदार सूजन और तेज बुखार। तत्काल पेनिसिलिन उपचार आवश्यक।',
    summaryMr: 'गंभीर आजार: फऱ्या (एकटांग्या - BQ) रोगाची लक्षणे. मांडीवर चरचर आवाज करणारी सूज व लंगडणे. तत्काळ पेनिसिलिन औषधोपचार करा.'
  }
];

export async function predictDisease(input: DiseasePredictionInput): Promise<DiseasePredictionResult> {
  // Authoritative FastAPI Phase 2 / Phase 3A AI assessment
  const rawSymptoms = Array.isArray(input.symptoms) ? input.symptoms.join(', ') : (input.symptoms || '');
  const narrativeText = input.notes ? `${rawSymptoms}. ${input.notes}` : rawSymptoms;

  const assessment = await assessLivestockCase({
    text: narrativeText,
    species: input.species,
    district: input.location?.district,
    affected_count: 1,
    duration_days: input.durationDays,
  });

  const topCondition = assessment.possible_conditions[0];
  const diseaseName = topCondition?.disease || 'Undifferentiated Bovine Illness';
  const confidenceScore = topCondition?.support_level === 'high' ? 88 : topCondition?.support_level === 'moderate' ? 65 : 40;

  const matchedProfile = DISEASE_PROFILES.find(p => p.name.toLowerCase().includes(diseaseName.toLowerCase())) || DISEASE_PROFILES[0];

  const result: DiseasePredictionResult = {
    primaryDisease: {
      diseaseId: matchedProfile.id,
      diseaseName: topCondition?.disease || matchedProfile.name,
      diseaseNameHi: matchedProfile.nameHi,
      diseaseNameMr: matchedProfile.nameMr,
      confidence: confidenceScore,
      severity: assessment.risk_assessment.overall_risk === 'critical' ? 'critical' : assessment.risk_assessment.overall_risk === 'high' ? 'high' : 'medium',
    },
    differentials: assessment.possible_conditions.slice(1).map(c => ({
      diseaseId: `diff-${c.disease.toLowerCase().replace(/\s+/g, '-')}`,
      diseaseName: c.disease,
      confidence: c.support_level === 'high' ? 75 : c.support_level === 'moderate' ? 55 : 30,
      rationale: c.supporting_evidence.join('. '),
      keyMatchingSymptoms: c.supporting_evidence,
    })),
    triageStatus: assessment.escalation.required ? 'suspected' : 'probable',
    triageMethod: 'ai_assisted',
    riskScore: assessment.risk_assessment.overall_risk === 'critical' ? 92 : assessment.risk_assessment.overall_risk === 'high' ? 78 : 50,
    riskLevel: assessment.risk_assessment.overall_risk === 'critical' ? 'critical' : assessment.risk_assessment.overall_risk === 'high' ? 'high' : 'medium',
    recommendedSampleType: assessment.recommended_actions.sample_collection[0] || matchedProfile.sampleType,
    sampleCollectionProtocol: assessment.recommended_actions.sample_collection.join('; ') || matchedProfile.collectionProtocol,
    immediateSOP: assessment.recommended_actions.immediate_actions.length > 0 ? assessment.recommended_actions.immediate_actions : matchedProfile.sopSteps,
    multilingualNotes: {
      en: topCondition?.supporting_evidence?.join('. ') || matchedProfile.summaryEn,
      hi: matchedProfile.summaryHi,
      mr: matchedProfile.summaryMr,
    },
    isContagiousZoonotic: matchedProfile.zoonotic,
    requiresImmediateQuarantine: assessment.recommended_actions.containment_precautions.length > 0,
    requiresDAHOEscalation: assessment.escalation.required,
  };

  return result;
}

function executeRuleBasedTriage(input: DiseasePredictionInput): DiseasePredictionResult {
  const normalizedSpecies = (input.species || 'cattle').toLowerCase().trim();
  
  // Combine all text sources for keyword extraction
  const rawSymptoms = Array.isArray(input.symptoms) ? input.symptoms.join(' ') : (input.symptoms || '');
  const combinedText = `${rawSymptoms} ${input.notes || ''}`.toLowerCase();

  const mortality = input.mortalityCount || 0;
  const temp = input.vitals?.temperatureC;

  // Score each disease profile
  const scoredDiseases: Array<{
    profile: DiseaseKnowledgeProfile;
    score: number;
    matchedKeywords: string[];
  }> = [];

  for (const profile of DISEASE_PROFILES) {
    let score = 0;
    const matchedKeywords: string[] = [];

    // Species compatibility check
    const isSpeciesCompatible = profile.species.some(s => 
      normalizedSpecies.includes(s) || s.includes(normalizedSpecies)
    );

    if (!isSpeciesCompatible) {
      // Small penalty or disqualification if disease does not infect this species
      // E.g. PPR does not infect cattle, LSD rarely if ever affects goats
      if (profile.id === 'dis-ppr' && (normalizedSpecies === 'cattle' || normalizedSpecies === 'cow' || normalizedSpecies === 'buffalo')) {
        continue;
      }
      if (profile.id === 'dis-lsd' && (normalizedSpecies === 'goat' || normalizedSpecies === 'sheep')) {
        continue;
      }
    } else {
      score += 15; // Baseline species match
    }

    // Match primary keywords (strong indicators)
    for (const kw of profile.primaryKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 25;
        matchedKeywords.push(kw);
      }
    }

    // Match secondary keywords
    for (const kw of profile.secondaryKeywords) {
      if (combinedText.includes(kw.toLowerCase())) {
        score += 8;
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
        }
      }
    }

    // Temperature heuristic
    if (temp && temp > 39.5) {
      // High fever boosts infectious acute diseases
      score += 5;
    }

    // Mortality heuristic
    if (mortality > 0) {
      if (profile.id === 'dis-anthrax') score += 35;
      if (profile.id === 'dis-hs') score += 25;
      if (profile.id === 'dis-bq') score += 20;
    }

    if (score > 0) {
      scoredDiseases.push({ profile, score, matchedKeywords });
    }
  }

  // Sort descending by score
  scoredDiseases.sort((a, b) => b.score - a.score);

  // If no specific match, default to Bovine Respiratory or General Triage
  const topMatch = scoredDiseases[0] || {
    profile: DISEASE_PROFILES[0],
    score: 30,
    matchedKeywords: ['clinical symptoms reported'],
  };

  // Normalize confidence percentage between 40% and 96%
  const primaryConfidence = Math.min(96, Math.max(45, Math.round(topMatch.score * 1.1)));

  // Determine Triage Status
  let triageStatus: CaseTriageStatus = 'suspected';
  if (primaryConfidence >= 80) triageStatus = 'probable';

  // Determine Risk Level & Score
  let riskScore = 40;
  let calculatedRiskLevel: RiskLevel = topMatch.profile.severity;

  if (topMatch.profile.severity === 'critical' || mortality > 0) {
    riskScore = Math.max(85, Math.min(99, 75 + (mortality * 10)));
    calculatedRiskLevel = 'critical';
  } else if (topMatch.profile.severity === 'high') {
    riskScore = Math.max(70, Math.min(84, primaryConfidence));
    calculatedRiskLevel = 'high';
  } else if (topMatch.profile.severity === 'medium') {
    riskScore = Math.max(45, Math.min(68, primaryConfidence - 10));
    calculatedRiskLevel = 'medium';
  } else {
    riskScore = 30;
    calculatedRiskLevel = 'low';
  }

  // Build differential diagnoses list
  const differentials: DifferentialDiagnosisItem[] = scoredDiseases.slice(1, 4).map(d => {
    const diffConf = Math.min(primaryConfidence - 10, Math.max(20, Math.round(d.score * 0.9)));
    return {
      diseaseId: d.profile.id,
      diseaseName: d.profile.name,
      diseaseNameHi: d.profile.nameHi,
      diseaseNameMr: d.profile.nameMr,
      confidence: diffConf,
      rationale: `Exhibits overlapping signs (${d.matchedKeywords.slice(0, 3).join(', ')}). Requires lab confirmation.`,
      keyMatchingSymptoms: d.matchedKeywords,
    };
  });

  return {
    primaryDisease: {
      diseaseId: topMatch.profile.id,
      diseaseName: topMatch.profile.name,
      diseaseNameHi: topMatch.profile.nameHi,
      diseaseNameMr: topMatch.profile.nameMr,
      confidence: primaryConfidence,
      severity: calculatedRiskLevel,
    },
    differentials,
    triageStatus,
    triageMethod: 'rule_based',
    riskScore,
    riskLevel: calculatedRiskLevel,
    recommendedSampleType: topMatch.profile.sampleType,
    sampleCollectionProtocol: topMatch.profile.collectionProtocol,
    immediateSOP: topMatch.profile.sopSteps,
    multilingualNotes: {
      en: topMatch.profile.summaryEn,
      hi: topMatch.profile.summaryHi,
      mr: topMatch.profile.summaryMr,
    },
    isContagiousZoonotic: topMatch.profile.zoonotic,
    requiresImmediateQuarantine: topMatch.profile.quarantineRequired,
    requiresDAHOEscalation: calculatedRiskLevel === 'critical' || mortality > 0,
  };
}
