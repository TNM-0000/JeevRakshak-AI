// Tri-lingual dictionary for JeevRakshak AI (English, Hindi, Marathi)

export interface Translations {
  appName: string;
  tagline: string;
  roles: {
    farmer: string;
    field_worker: string;
    veterinarian: string;
    government: string;
  };
  nav: {
    home: string;
    herd: string;
    report: string;
    cases: string;
    surveillance: string;
    alerts: string;
    more: string;
  };
  dashboard: {
    lookingStable: string;
    animalsMonitored: string;
    criticalIssues: string;
    vaccinationsDue: string;
    weatherRiskTitle: string;
    weatherRiskDesc: string;
    viewAdvisory: string;
    vaccinationAlert: string;
    scheduleVaccination: string;
    nearbyReports: string;
    viewLocalList: string;
    recentActivity: string;
    reportedFever: string;
    underTreatment: string;
    healthy: string;
    affected: string;
    critical: string;
    needAttention: string;
    lastVisit: string;
    nextAction: string;
    roleSwitcher: string;
    switchRoleNotice: string;
    quickReport: string;
  };
  reporting: {
    newReport: string;
    step1Title: string;
    step1Subtitle: string;
    step2Title: string;
    step2Subtitle: string;
    step3Title: string;
    animalSeemsSick: string;
    animalSeemsSickDesc: string;
    animalDied: string;
    animalDiedDesc: string;
    vaccinationIssue: string;
    vaccinationIssueDesc: string;
    treatmentIssue: string;
    treatmentIssueDesc: string;
    multipleAnimalsAffected: string;
    multipleAnimalsAffectedDesc: string;
    sampleNeeded: string;
    sampleNeededDesc: string;
    otherIssue: string;
    selectAnimal: string;
    symptomsCount: string;
    mortalityCount: string;
    additionalNotes: string;
    notesPlaceholder: string;
    source: string;
    continue: string;
    submitReport: string;
    submitting: string;
    preliminaryAssessment: string;
    riskDetected: string;
    confidence: string;
    possibleDiseases: string;
    whyFlagged: string;
    recommendedSteps: string;
    contactVet: string;
    viewDetailed: string;
    reportSuccess: string;
  };
  symptoms: {
    fever: string;
    coughing: string;
    nasalDischarge: string;
    difficultyBreathing: string;
    diarrhea: string;
    lossOfAppetite: string;
    weakness: string;
    skinLesions: string;
    swelling: string;
    abnormalMovement: string;
    suddenDeath: string;
    reducedMilk: string;
  };
  fieldHealth: {
    title: string;
    updatedJustNow: string;
    casesNeedAttention: string;
    new: string;
    review: string;
    pending: string;
    confirmed: string;
    resolved: string;
    reviewCase: string;
    navigate: string;
    urgent: string;
    collectSample: string;
    escalateCase: string;
    sampleType: string;
    sampleCollected: string;
    sendToLab: string;
    confirmSample: string;
    reasonForEscalation: string;
    escalateTo: string;
    confirmEscalate: string;
    escalationNotice: string;
  };
  surveillance: {
    districtStatus: string;
    overallRisk: string;
    cumulativeCases: string;
    mortalityThisWeek: string;
    vaccinationCoverage: string;
    target: string;
    emergingAreas: string;
    activeReports: string;
    casesTrend: string;
    responseCenter: string;
    activeSituations: string;
    containmentRecommended: string;
    monitoring: string;
    affectedFarms: string;
    affectedAnimals: string;
    deaths: string;
    viewFullSituation: string;
    villageTab: string;
    blockTab: string;
    districtTab: string;
    geospatialRiskMap: string;
  };
  animalProfile: {
    tagNumber: string;
    species: string;
    breed: string;
    age: string;
    sex: string;
    herdName: string;
    healthTimeline: string;
    vaccinationHistory: string;
    treatments: string;
    labTests: string;
    veterinaryNotes: string;
    addTreatment: string;
    recordVaccine: string;
    female: string;
    male: string;
  };
  languages: {
    en: string;
    hi: string;
    mr: string;
  };
}

export const translations: Record<'en' | 'hi' | 'mr', Translations> = {
  en: {
    appName: 'JeevRakshak AI',
    tagline: 'Protect every herd. Detect risk before it spreads.',
    roles: {
      farmer: 'Farmer',
      field_worker: 'Field Worker',
      veterinarian: 'Veterinarian',
      government: 'Government Official',
    },
    nav: {
      home: 'Home',
      herd: 'My Herd',
      report: 'Report',
      cases: 'Field Health',
      surveillance: 'Surveillance',
      alerts: 'Alerts',
      more: 'More',
    },
    dashboard: {
      lookingStable: 'Looking stable',
      animalsMonitored: 'animals monitored',
      criticalIssues: 'critical issues',
      vaccinationsDue: 'vaccinations due',
      weatherRiskTitle: 'Rainfall has increased disease risk in your area this week',
      weatherRiskDesc: 'Keep drinking water clean and protect the herd from damp and reduced feeding.',
      viewAdvisory: 'View advisory',
      vaccinationAlert: 'FMD vaccine - due in 4 days',
      scheduleVaccination: 'Schedule',
      nearbyReports: '3 similar reports within 5 km',
      viewLocalList: 'View local list',
      recentActivity: 'Recent activity',
      reportedFever: 'reported fever',
      underTreatment: 'Under treatment',
      healthy: 'Healthy',
      affected: 'Affected',
      critical: 'Critical',
      needAttention: 'Animals needing attention',
      lastVisit: 'Last visit',
      nextAction: 'Next action',
      roleSwitcher: 'Switch Role (Demonstration)',
      switchRoleNotice: 'You are currently viewing as',
      quickReport: 'Report Sick Animal',
    },
    reporting: {
      newReport: 'New Health Report',
      step1Title: 'What are you seeing?',
      step1Subtitle: 'Choose the option that best matches what you notice.',
      step2Title: 'What symptoms are you seeing?',
      step2Subtitle: 'Select all symptoms observed in the animal.',
      step3Title: 'Preliminary AI Triage Assessment',
      animalSeemsSick: 'Animal seems sick',
      animalSeemsSickDesc: 'Fever, weakness, poor appetite',
      animalDied: 'Animal died',
      animalDiedDesc: 'Report a mortality event',
      vaccinationIssue: 'Vaccination issue',
      vaccinationIssueDesc: 'Adverse reaction or query',
      treatmentIssue: 'Treatment issue',
      treatmentIssueDesc: 'Ongoing treatment review',
      multipleAnimalsAffected: 'Multiple animals affected',
      multipleAnimalsAffectedDesc: 'More than one animal showing signs in herd',
      sampleNeeded: 'Sample / test needed',
      sampleNeededDesc: 'Request diagnostic sample collection',
      otherIssue: 'Other health concern',
      selectAnimal: 'Select Animal',
      symptomsCount: 'symptoms selected',
      mortalityCount: 'Mortality Count (if any)',
      additionalNotes: 'Additional observations / Notes',
      notesPlaceholder: 'Describe when symptoms began, behavior, appetite...',
      source: 'Report Source',
      continue: 'Continue',
      submitReport: 'Submit Health Report',
      submitting: 'Processing Triage...',
      preliminaryAssessment: 'PRELIMINARY ASSESSMENT',
      riskDetected: 'Potential health risk detected',
      confidence: 'Confidence',
      possibleDiseases: 'Possible Disease Categories',
      whyFlagged: 'Why this was flagged',
      recommendedSteps: 'Recommended Next Steps',
      contactVet: 'Contact Field Veterinarian',
      viewDetailed: 'View Detailed Assessment',
      reportSuccess: 'Health report registered successfully!',
    },
    symptoms: {
      fever: 'Fever',
      coughing: 'Coughing',
      nasalDischarge: 'Nasal discharge',
      difficultyBreathing: 'Difficulty breathing',
      diarrhea: 'Diarrhea',
      lossOfAppetite: 'Loss of appetite',
      weakness: 'Weakness',
      skinLesions: 'Skin lesions / nodules',
      swelling: 'Swelling',
      abnormalMovement: 'Abnormal movement / Lameness',
      suddenDeath: 'Sudden death',
      reducedMilk: 'Reduced milk production',
    },
    fieldHealth: {
      title: 'Field Health Cases',
      updatedJustNow: 'Updated live',
      casesNeedAttention: 'cases need attention',
      new: 'New',
      review: 'Review',
      pending: 'Pending',
      confirmed: 'Confirmed',
      resolved: 'Resolved',
      reviewCase: 'Review Case',
      navigate: 'Navigate',
      urgent: 'URGENT',
      collectSample: 'Collect Sample',
      escalateCase: 'Escalate Case',
      sampleType: 'Diagnostic Sample Type',
      sampleCollected: 'Sample Collected',
      sendToLab: 'Send to Regional Lab',
      confirmSample: 'Confirm Sample Collection',
      reasonForEscalation: 'Reason for Escalation',
      escalateTo: 'Escalate to Authority',
      confirmEscalate: 'Confirm Escalation',
      escalationNotice: 'Escalation will alert the designated veterinary authority immediately.',
    },
    surveillance: {
      districtStatus: 'DISTRICT HEALTH STATUS',
      overallRisk: 'Overall Risk',
      cumulativeCases: 'Cumulative Cases',
      mortalityThisWeek: 'Mortality this week',
      vaccinationCoverage: 'Vaccination Coverage',
      target: 'Target',
      emergingAreas: 'Emerging High-Risk Clusters',
      activeReports: 'active reports',
      casesTrend: 'Cases Trend (Last 30 Days)',
      responseCenter: 'Response Center',
      activeSituations: 'active situations require coordinated response',
      containmentRecommended: 'Containment Recommended',
      monitoring: 'Active Monitoring',
      affectedFarms: 'Affected Farms',
      affectedAnimals: 'Affected Animals',
      deaths: 'Reported Deaths',
      viewFullSituation: 'Open Response Center',
      villageTab: 'Village',
      blockTab: 'Block',
      districtTab: 'District',
      geospatialRiskMap: 'Geospatial Outbreak Heatmap',
    },
    animalProfile: {
      tagNumber: 'Tag Number',
      species: 'Species',
      breed: 'Breed',
      age: 'Age',
      sex: 'Sex',
      herdName: 'Herd',
      healthTimeline: 'Health & Clinical Timeline',
      vaccinationHistory: 'Vaccination History',
      treatments: 'Treatment Records',
      labTests: 'Diagnostic Lab Tests',
      veterinaryNotes: 'Veterinary Observations',
      addTreatment: 'Prescribe Treatment',
      recordVaccine: 'Record Vaccination',
      female: 'Female',
      male: 'Male',
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी (Hindi)',
      mr: 'मराठी (Marathi)',
    },
  },
  hi: {
    appName: 'जीवरक्षक AI',
    tagline: 'हर पशुधन की सुरक्षा। बीमारी फैलने से पहले पहचान।',
    roles: {
      farmer: 'पशुपालक / किसान',
      field_worker: 'क्षेत्र कार्यकर्ता (फील्ड वर्कर)',
      veterinarian: 'पशु चिकित्सक (डॉक्टर)',
      government: 'शासकीय अधिकारी',
    },
    nav: {
      home: 'होम',
      herd: 'मेरा पशुधन',
      report: 'रिपोर्ट दर्ज करें',
      cases: 'केस ट्रैकिंग',
      surveillance: 'निगरानी',
      alerts: 'अलर्ट',
      more: 'अधिक',
    },
    dashboard: {
      lookingStable: 'स्थिति सामान्य है',
      animalsMonitored: 'निगरानी में पशु',
      criticalIssues: 'गंभीर मामले',
      vaccinationsDue: 'टीकाकरण बाकी',
      weatherRiskTitle: 'इस सप्ताह वर्षा के कारण बीमारी का जोखिम बढ़ा है',
      weatherRiskDesc: 'पीने का पानी स्वच्छ रखें और पशुओं को भीगने और कम चारे से बचाएं।',
      viewAdvisory: 'सलाह देखें',
      vaccinationAlert: 'एफएमडी (खुरपका) टीका - 4 दिनों में देय',
      scheduleVaccination: 'तिथि तय करें',
      nearbyReports: '5 किमी के भीतर 3 समान रिपोर्ट दर्ज',
      viewLocalList: 'स्थानीय सूची देखें',
      recentActivity: 'हालिया गतिविधि',
      reportedFever: 'बुखार की शिकायत',
      underTreatment: 'उपचार जारी',
      healthy: 'स्वस्थ',
      affected: 'लक्षण युक्त',
      critical: 'गंभीर',
      needAttention: 'विशेष ध्यान देने योग्य पशु',
      lastVisit: 'पिछला दौरा',
      nextAction: 'अगला कदम',
      roleSwitcher: 'भूमिका बदलें (डेमो)',
      switchRoleNotice: 'आप इस रूप में देख रहे हैं:',
      quickReport: 'बीमार पशु की रिपोर्ट करें',
    },
    reporting: {
      newReport: 'नई स्वास्थ्य रिपोर्ट',
      step1Title: 'आप क्या देख रहे हैं?',
      step1Subtitle: 'जो लक्षण दिख रहे हैं उसके अनुसार विकल्प चुनें।',
      step2Title: 'पशु में कौन से लक्षण हैं?',
      step2Subtitle: 'पशु में देखे गए सभी लक्षणों का चयन करें।',
      step3Title: 'प्राथमिक AI ट्राइएज मूल्यांकन',
      animalSeemsSick: 'पशु बीमार लग रहा है',
      animalSeemsSickDesc: 'बुखार, कमजोरी, कम भूख लगना',
      animalDied: 'पशु की मृत्यु',
      animalDiedDesc: 'पशु मृत्यु की रिपोर्ट दर्ज करें',
      vaccinationIssue: 'टीकाकरण समस्या',
      vaccinationIssueDesc: 'टीके का असर या प्रश्न',
      treatmentIssue: 'उपचार समस्या',
      treatmentIssueDesc: 'चल रहे उपचार की समीक्षा',
      multipleAnimalsAffected: 'कई पशु प्रभावित हैं',
      multipleAnimalsAffectedDesc: 'झुंड में एक से अधिक पशु बीमार हैं',
      sampleNeeded: 'सैंपल / जांच आवश्यक',
      sampleNeededDesc: 'लैब जांच हेतु नमूना संग्रह अनुरोध',
      otherIssue: 'अन्य स्वास्थ्य समस्या',
      selectAnimal: 'पशु चुनें',
      symptomsCount: 'लक्षण चुने गए',
      mortalityCount: 'मृत्यु संख्या (यदि कोई हो)',
      additionalNotes: 'अतिरिक्त विवरण / नोट्स',
      notesPlaceholder: 'लक्षण कब शुरू हुए, चारा, व्यवहार...',
      source: 'रिपोर्ट स्रोत',
      continue: 'आगे बढ़ें',
      submitReport: 'रिपोर्ट सबमिट करें',
      submitting: 'मूल्यांकन जारी है...',
      preliminaryAssessment: 'प्राथमिक मूल्यांकन',
      riskDetected: 'संभावित स्वास्थ्य जोखिम पाया गया',
      confidence: 'सटीकता',
      possibleDiseases: 'संभावित रोग श्रेणियां',
      whyFlagged: 'इसे क्यों चिह्नित किया गया',
      recommendedSteps: 'सुझाए गए तात्कालिक कदम',
      contactVet: 'पशु चिकित्सक से संपर्क करें',
      viewDetailed: 'विस्तृत रिपोर्ट देखें',
      reportSuccess: 'स्वास्थ्य रिपोर्ट सफलतापूर्वक दर्ज की गई!',
    },
    symptoms: {
      fever: 'बुखार',
      coughing: 'खांसी',
      nasalDischarge: 'नाक से स्राव',
      difficultyBreathing: 'सांस लेने में कठिनाई',
      diarrhea: 'दस्त (डायरिया)',
      lossOfAppetite: 'भूख में कमी',
      weakness: 'कमजोरी व सुस्ती',
      skinLesions: 'त्वचा पर छाले / गांठे',
      swelling: 'सूजन',
      abnormalMovement: 'लंगड़ाना / असामान्य चाल',
      suddenDeath: 'अचानक मृत्यु',
      reducedMilk: 'दूध उत्पादन में कमी',
    },
    fieldHealth: {
      title: 'फील्ड स्वास्थ्य मामले',
      updatedJustNow: 'अभी अपडेट हुआ',
      casesNeedAttention: 'मामलों पर ध्यान देने की आवश्यकता',
      new: 'नया',
      review: 'समीक्षा',
      pending: 'लंबित',
      confirmed: 'पुष्ट',
      resolved: 'समाधान हुआ',
      reviewCase: 'केस समीक्षा',
      navigate: 'मार्गदर्शन',
      urgent: 'अत्यावश्यक',
      collectSample: 'सैंपल लें',
      escalateCase: 'केस अग्रेषित करें',
      sampleType: 'जांच नमूना प्रकार',
      sampleCollected: 'नमूना एकत्रित हुआ',
      sendToLab: 'प्रयोगशाला भेजें',
      confirmSample: 'सैंपल संग्रह की पुष्टि करें',
      reasonForEscalation: 'अग्रेषण का कारण',
      escalateTo: 'जिम्मेदार अधिकारी को भेजें',
      confirmEscalate: 'अग्रेषण की पुष्टि करें',
      escalationNotice: 'यह केस तुरंत उच्च पशु चिकित्सा अधिकारी को भेजा जाएगा।',
    },
    surveillance: {
      districtStatus: 'जिला स्वास्थ्य स्थिति',
      overallRisk: 'कुल जोखिम स्तर',
      cumulativeCases: 'कुल मामले',
      mortalityThisWeek: 'इस सप्ताह मृत्यु',
      vaccinationCoverage: 'टीकाकरण कवरेज',
      target: 'लक्ष्य',
      emergingAreas: 'उभरते हुए जोखिम क्षेत्र',
      activeReports: 'सक्रिय रिपोर्ट',
      casesTrend: 'पिछले 30 दिनों का रुझान',
      responseCenter: 'आपातकालीन नियंत्रण केंद्र',
      activeSituations: 'सक्रिय स्थितियों पर त्वरित कार्रवाई आवश्यक',
      containmentRecommended: 'रोकथाम अनुशंसित',
      monitoring: 'सक्रिय निगरानी',
      affectedFarms: 'प्रभावित फार्म',
      affectedAnimals: 'प्रभावित पशु',
      deaths: 'दर्ज मृत्यु',
      viewFullSituation: 'कंट्रोल रूम देखें',
      villageTab: 'गाँव',
      blockTab: 'तहसील / ब्लॉक',
      districtTab: 'ज़िला',
      geospatialRiskMap: 'भू-स्थानिक प्रकोप नक्शा',
    },
    animalProfile: {
      tagNumber: 'टैग नंबर',
      species: 'प्रजाति',
      breed: 'नस्ल',
      age: 'आयु',
      sex: 'लिंग',
      herdName: 'झुंड / बाड़ा',
      healthTimeline: 'स्वास्थ्य व उपचार टाइमलाइन',
      vaccinationHistory: 'टीकाकरण इतिहास',
      treatments: 'उपचार रिकॉर्ड',
      labTests: 'लैब जांच रिकॉर्ड',
      veterinaryNotes: 'पशु चिकित्सक की टिप्पणी',
      addTreatment: 'उपचार दर्ज करें',
      recordVaccine: 'टीकाकरण दर्ज करें',
      female: 'मादा',
      male: 'नर',
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी (Hindi)',
      mr: 'मराठी (Marathi)',
    },
  },
  mr: {
    appName: 'जीवरक्षक AI',
    tagline: 'प्रत्येक जनावराचे रक्षण. रोग फैलावण्यापूर्वीच नियंत्रण.',
    roles: {
      farmer: 'शेतकरी / पशुपालक',
      field_worker: 'क्षेत्रीय कर्मचारी (फील्ड वर्कर)',
      veterinarian: 'पशुवैद्यकीय अधिकारी (डॉक्टर)',
      government: 'शासकीय अधिकारी',
    },
    nav: {
      home: 'मुख्यपृष्ठ',
      herd: 'माझे पशुधन',
      report: 'तक्रार नोंदवा',
      cases: 'क्षेत्रीय केसेस',
      surveillance: 'पाळत व सर्वेक्षण',
      alerts: 'इशारे व सूचना',
      more: 'अधिक',
    },
    dashboard: {
      lookingStable: 'स्थिती स्थिर आहे',
      animalsMonitored: 'निरीक्षणाखालील जनावरे',
      criticalIssues: 'गंभीर समस्या',
      vaccinationsDue: 'लसीकरण बाकी',
      weatherRiskTitle: 'या आठवड्यात पावसामुळे आजारांचा धोका वाढला आहे',
      weatherRiskDesc: 'पिण्याचे पाणी स्वच्छ ठेवा आणि जनावरांचे ओलाव्यापासून संरक्षण करा.',
      viewAdvisory: 'सल्ला पहा',
      vaccinationAlert: 'लाळ-खुरकूत (FMD) लस - ४ दिवसांत देणे बाकी',
      scheduleVaccination: 'वेळ निश्चित करा',
      nearbyReports: '५ किमी परिसरात ३ आजारांच्या तक्रारी',
      viewLocalList: 'स्थानिक यादी पहा',
      recentActivity: 'अलीकडील हालचाली',
      reportedFever: 'ताप नोंदवला गेला',
      underTreatment: 'उपचार सुरू',
      healthy: 'निरोगी',
      affected: 'लक्षणे असलेले',
      critical: 'गंभीर',
      needAttention: 'लक्ष देण्यासारखी जनावरे',
      lastVisit: 'मागील भेट',
      nextAction: 'पुढील कृती',
      roleSwitcher: 'भूमिका बदला (डेमो)',
      switchRoleNotice: 'तुम्ही सध्या या भूमिकेत आहात:',
      quickReport: 'आजारी जनावराची नोंद करा',
    },
    reporting: {
      newReport: 'नवीन आरोग्य अहवाल',
      step1Title: 'तुम्हाला काय आढळले आहे?',
      step1Subtitle: 'दिसणाऱ्या लक्षणांनुसार योग्य पर्याय निवडा.',
      step2Title: 'जनावरामध्ये कोणती लक्षणे दिसत आहेत?',
      step2Subtitle: 'दिसणारी सर्व लक्षणे निवडा.',
      step3Title: 'प्राथमिक AI ट्राइएज मूल्यांकन',
      animalSeemsSick: 'जनावर आजारी वाटते',
      animalSeemsSickDesc: 'ताप, अशक्तपणा, चारा न खाणे',
      animalDied: 'जनावर दगावले',
      animalDiedDesc: 'मृत्यूची नोंद करा',
      vaccinationIssue: 'लसीकरण समस्या',
      vaccinationIssueDesc: 'लसीचे दुष्परिणाम किंवा शंका',
      treatmentIssue: 'उपचार समस्या',
      treatmentIssueDesc: 'चालू उपचारांचा आढावा',
      multipleAnimalsAffected: 'एकाहून अधिक जनावरे बाधित',
      multipleAnimalsAffectedDesc: 'कळपातील अनेक जनावरांमध्ये लक्षणे',
      sampleNeeded: 'नमुना / चाचणी आवश्यक',
      sampleNeededDesc: 'लॅब तपासणीसाठी नमुना संकलन',
      otherIssue: 'इतर आरोग्य तक्रार',
      selectAnimal: 'जनावर निवडा',
      symptomsCount: 'लक्षणे निवडली',
      mortalityCount: 'मृत्यू संख्या (असल्यास)',
      additionalNotes: 'अधिक निरीक्षणे / नोंदी',
      notesPlaceholder: 'लक्षणे कधी सुरू झाली, जनावराचे वर्तन, खाणे-पिणे...',
      source: 'अहवाल स्त्रोत',
      continue: 'पुढे जा',
      submitReport: 'अहवाल सादर करा',
      submitting: 'मूल्यांकन सुरू आहे...',
      preliminaryAssessment: 'प्राथमिक मूल्यांकन',
      riskDetected: 'संभाव्य आरोग्य धोका आढळला',
      confidence: 'अचूकता',
      possibleDiseases: 'संभाव्य आजारांचे प्रकार',
      whyFlagged: 'हे का सूचित केले गेले',
      recommendedSteps: 'तातडीने करावयाची कृती',
      contactVet: 'पशुवैद्यकांशी संपर्क साधा',
      viewDetailed: 'सविस्तर मूल्यांकन पहा',
      reportSuccess: 'आरोग्य अहवाल यशस्वीरित्या नोंदवला गेला!',
    },
    symptoms: {
      fever: 'ताप',
      coughing: 'खोकला',
      nasalDischarge: 'नाकातून स्राव गळणे',
      difficultyBreathing: 'श्वास घेण्यास त्रास',
      diarrhea: 'हगवण / जुलाब',
      lossOfAppetite: 'चारा कमी खाणे / भूक मंदावणे',
      weakness: 'अशक्तपणा व सुस्ती',
      skinLesions: 'त्वचेवर गाठी / फोड (लम्पी सदृश)',
      swelling: 'सूज येणे',
      abnormalMovement: 'लंगडणे / चालण्यात अडचण',
      suddenDeath: 'अचानक मृत्यू',
      reducedMilk: 'दूध उत्पादनात घट',
    },
    fieldHealth: {
      title: 'क्षेत्रीय आरोग्य केसेस',
      updatedJustNow: 'नुकतेच अपडेट झाले',
      casesNeedAttention: 'केसेसवर तातडीने लक्ष देणे आवश्यक',
      new: 'नवीन',
      review: 'तपासा',
      pending: 'प्रलंबित',
      confirmed: 'निश्चित',
      resolved: 'पूर्ण झाले',
      reviewCase: 'केस तपासा',
      navigate: 'मार्ग पहा',
      urgent: 'तातडीचे',
      collectSample: 'नमुना (सॅम्पल) घ्या',
      escalateCase: 'वरिष्ठांकडे पाठवा',
      sampleType: 'तपासणी नमुना प्रकार',
      sampleCollected: 'नमुना गोळा केला',
      sendToLab: 'विभागीय प्रयोगशाळेत पाठवा',
      confirmSample: 'नमुना संकलनाची पुष्टी करा',
      reasonForEscalation: 'वरिष्ठांकडे पाठवण्याचे कारण',
      escalateTo: 'जबाबदार अधिकाऱ्यास पाठवा',
      confirmEscalate: 'पाठवण्याची पुष्टी करा',
      escalationNotice: 'हा अहवाल त्वरित संबंधित पशुवैद्यकीय अधिकाऱ्यांना पाठवला जाईल.',
    },
    surveillance: {
      districtStatus: 'जिल्हा आरोग्य स्थिती',
      overallRisk: 'एकूण धोका पातळी',
      cumulativeCases: 'एकूण रुग्ण संख्या',
      mortalityThisWeek: 'या आठवड्यातील मृत्यू',
      vaccinationCoverage: 'लसीकरण प्रमाण',
      target: 'उद्दिष्ट',
      emergingAreas: 'उद्भवणारे हॉटस्पॉट भाग',
      activeReports: 'सक्रिय अहवाल',
      casesTrend: 'मागील ३० दिवसांचा कल',
      responseCenter: 'आपत्कालीन प्रतिसाद केंद्र',
      activeSituations: 'सक्रिय परिस्थितीवर तातडीने उपाययोजना आवश्यक',
      containmentRecommended: 'प्रतिबंधात्मक उपाययोजना आवश्यक',
      monitoring: 'सक्रिय देखरेख',
      affectedFarms: 'बाधित गोठे / शेतकरी',
      affectedAnimals: 'बाधित जनावरे',
      deaths: 'नोंद झालेले मृत्यू',
      viewFullSituation: 'प्रतिसाद केंद्र उघडा',
      villageTab: 'गाव',
      blockTab: 'तालुका',
      districtTab: 'जिल्हा',
      geospatialRiskMap: 'भू-स्थानिक उद्रेक नकाशा',
    },
    animalProfile: {
      tagNumber: 'टॅग क्रमांक',
      species: 'प्रजाती',
      breed: 'जात / पैदास',
      age: 'वय',
      sex: 'लिंग',
      herdName: 'कळप / गोठा',
      healthTimeline: 'आरोग्य व उपचार टाइमलाइन',
      vaccinationHistory: 'लसीकरण इतिहास',
      treatments: 'उपचार नोंदी',
      labTests: 'प्रयोगशाळा चाचण्या',
      veterinaryNotes: 'पशुवैद्यकांची निरीक्षणे',
      addTreatment: 'उपचार नोंदवा',
      recordVaccine: 'लस टोचल्याची नोंद करा',
      female: 'मादी',
      male: 'नर',
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी (Hindi)',
      mr: 'मराठी (Marathi)',
    },
  },
};
