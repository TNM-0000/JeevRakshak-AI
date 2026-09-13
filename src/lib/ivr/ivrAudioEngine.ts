/**
 * JeevRakshak AI - IVR Audio & Prompt Engine
 * Multi-lingual IVR prompts (9 Indian languages), Web Audio DTMF tone generator,
 * Speech Synthesis (TTS), and Speech-to-Text (STT) transcription helper.
 */

import { IVRLanguage } from '@/types/database';

export interface IVRPromptCatalog {
  welcome: string;
  select_language: string;
  main_menu: string;
  disease_select_animal: string;
  disease_select_symptom: string;
  disease_record_prompt: string;
  disease_success: string;
  vaccination_info: string;
  doctor_consult_menu: string;
  doctor_callback_success: string;
  emergency_prompt: string;
  emergency_dispatched: string;
  announcements_prompt: string;
  feedback_prompt: string;
  feedback_success: string;
  invalid_input: string;
  call_ended: string;
}

export const IVR_LANGUAGES: { code: IVRLanguage; name: string; nativeName: string; bcp47: string }[] = [
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
];

export const IVR_PROMPTS: Record<IVRLanguage, IVRPromptCatalog> = {
  mr: {
    welcome: 'नमस्कार! जीवरक्षक AI पशु आरोग्य हेल्पलाईन १८००-१२०-५३३८ मध्ये आपले स्वागत आहे.',
    select_language: 'मराठीसाठी १ दाबा, हिंदीसाठी २ दाबा, इंग्रजीसाठी ३ दाबा.',
    main_menu: 'पशुरोगाची तक्रार नोंदवण्यासाठी १ दाबा. लस टोचणी व शिबिरांच्या माहितीसाठी २ दाबा. पशुवैद्यकीय डॉक्टरांशी सल्लामसलतीसाठी ३ दाबा. तात्काळ आणीबाणी १९६२ रुग्णवाहिकेसाठी ४ दाबा. शासकीय रोग सतर्कता व सूचनांसाठी ५ दाबा. तक्रार किंवा सूचना नोंदवण्यासाठी ६ दाबा. पुन्हा ऐकण्यासाठी शून्य दाबा.',
    disease_select_animal: 'गाईसाठी १ दाबा, म्हशीसाठी २ दाबा, शेळीसाठी ३ दाबा, मेंढीसाठी ४ दाबा, कुक्कुटपालनासाठी ५ दाबा, इतर प्राण्यांसाठी ६ दाबा.',
    disease_select_symptom: 'तीव्र ताप असल्यास १ दाबा. तोंडात व खुरांमध्ये फोड किंवा लाळ असल्यास २ दाबा. त्वचेवर गाठी असल्यास ३ दाबा. चारा न खाणे किंवा सुस्तपणा असल्यास ४ दाबा. श्वास घेण्यास त्रास असल्यास ५ दाबा. इतर लक्षणांसाठी ६ दाबा.',
    disease_record_prompt: 'कृपया बीपच्या आवाजानंतर आपल्या जनावराची लक्षणे आणि गावाचे नाव स्पष्टपणे सांगा. रेकॉर्डिंग संपल्यावर हॅश बटण दाबा.',
    disease_success: 'आपली तक्रार यशस्वीपणे नोंदवली गेली आहे. आपला केस क्रमांक {caseId} आहे. नजीकच्या पशुवैद्यकीय अधिकाऱ्यांना अलर्ट पाठवण्यात आला असून एसएमएस प्राप्त होईल.',
    vaccination_info: 'पुणे व शिरूर तालुक्यात लाळ-खुरकत (FMD) लसीकरण मोहीम १५ सप्टेंबरपासून सुरू होत आहे. गोट पॉक्स लसीकरण शिबिर २२ सप्टेंबर रोजी ग्रामपंचायत आवारात आहे. अधिक माहितीसाठी आपल्या पशुसंवर्धन केंद्राशी संपर्क साधा.',
    doctor_consult_menu: 'आपल्या परिसरातील उपलब्ध पशुवैद्यकीय डॉक्टरांशी संपर्क जोडला जात आहे. तातडीने डॉक्टर कॉलबॅकसाठी १ दाबा. जुन्या केसची सद्यस्थिती तपासण्यासाठी २ दाबा.',
    doctor_callback_success: 'डॉक्टर कॉलबॅक विनंती नोंदवली गेली आहे. डॉ. राहुल कुलकर्णी पुढील २० मिनिटांत आपल्या मोबाइलवर संपर्क करतील.',
    emergency_prompt: '१९६२ पशु आणीबाणी सेवा! आपल्या जनावराला गंभीर धोका असल्यास तात्काळ व्हॅन पाठवली जाईल. आणीबाणी निश्चित करण्यासाठी १ दाबा किंवा मागे जाण्यासाठी ० दाबा.',
    emergency_dispatched: 'आणीबाणी निश्चित झाली आहे! रुग्णवाहिका व्हॅन {code} आपल्या गावाच्या दिशेने रवाना झाली आहे. संपर्क क्रमांक डॉक्टरांना पाठवला आहे. जनावरा जवळ सावलीत थांबा.',
    announcements_prompt: 'शासकीय रोग सतर्कता: लंपी स्कीन रोगाचा प्रादुर्भाव रोखण्यासाठी १० किमी परिसरामध्ये रिंग व्हॅक्सिनेशन सुरू आहे. जनावरांची वाहतूक थांबवा व गोठ्यामध्ये जंतुनाशक फवारणी करा.',
    feedback_prompt: 'पशुवैद्यकीय सेवेविषयी आपली तक्रार किंवा सूचना बीप नंतर रेकॉर्ड करा. पूर्ण झाल्यावर हॅश दाबा.',
    feedback_success: 'आपली तक्रार क्रमांक {ticketId} म्हणून नोंदवली गेली आहे. पशुसंवर्धन आयुक्तालय यावर २४ तासांत कार्यवाही करेल.',
    invalid_input: 'चुकीचा पर्याय निवडला आहे. कृपया पुन्हा प्रयत्न करा.',
    call_ended: 'जीवरक्षक AI पशु हेल्पलाईनशी संपर्क साधल्याबद्दल धन्यवाद. आपला दिवस शुभ जावो. जय हिंद, जय महाराष्ट्र.',
  },
  hi: {
    welcome: 'नमस्ते! जीवरक्षक AI पशु स्वास्थ्य टोल-फ्री हेल्पलाइन १८००-१२०-५३३८ में आपका स्वागत है।',
    select_language: 'मराठी के लिए १ दबाएं, हिन्दी के लिए २ दबाएं, अंग्रेजी के लिए ३ दबाएं।',
    main_menu: 'पशु रोग की रिपोर्ट दर्ज करने के लिए १ दबाएं। टीकाकरण शिविर की जानकारी के लिए २ दबाएं। पशु चिकित्सक से परामर्श के लिए ३ दबाएं। आपातकालीन १९६२ एम्बुलेंस के लिए ४ दबाएं। सरकारी रोग चेतावनी के लिए ५ दबाएं। शिकायत या सुझाव दर्ज करने के लिए ६ दबाएं। पुनः सुनने के लिए शून्य दबाएं।',
    disease_select_animal: 'गाय के लिए १, भैंस के लिए २, बकरी के लिए ३, भेड़ के लिए ४, मुर्गी के लिए ५, अन्य पशु के लिए ६ दबाएं।',
    disease_select_symptom: 'तेज बुखार के लिए १, मुंह या खुर में छाले के लिए २, त्वचा पर गांठों के लिए ३, चारा न खाने के लिए ४, सांस लेने में परेशानी के लिए ५, अन्य के लिए ६ दबाएं।',
    disease_record_prompt: 'कृपया बीप के बाद अपने पशु के लक्षण और गांव का नाम विस्तार से बताएं। समाप्त करने के लिए हैश (#) दबाएं।',
    disease_success: 'आपकी रिपोर्ट दर्ज कर ली गई है। केस आईडी {caseId} है। नजदीकी पशु चिकित्सक को सूचित कर दिया गया है। एसएमएस प्राप्त होगा।',
    vaccination_info: 'आपके जिले में एफएमडी टीकाकरण अभियान १५ सितंबर से शुरू हो रहा है। गोट पॉक्स शिविर २२ सितंबर को आयोजित है। विवरण आपके फोन पर भेज दिया गया है।',
    doctor_consult_menu: 'नजदीकी पशु चिकित्सक से संपर्क किया जा रहा है। कॉलबैक अनुरोध के लिए १ दबाएं, केस स्थिति जानने के लिए २ दबाएं।',
    doctor_callback_success: 'कॉलबैक अनुरोध दर्ज कर लिया गया है। डॉक्टर जल्द ही आपके नंबर पर संपर्क करेंगे।',
    emergency_prompt: '१९६२ पशु आपातकालीन सेवा! तत्काल सचल पशु चिकित्सा वैन भेजने के लिए १ दबाएं या रद्द करने के लिए ० दबाएं।',
    emergency_dispatched: 'आपातकालीन वैन {code} रवाना कर दी गई है। कृपया पशु के पास शांत रहकर प्रतीक्षा करें।',
    announcements_prompt: 'सरकारी एडवाइजरी: लंपी त्वचा रोग के फैलाव को रोकने के लिए पशुओं का स्थानांतरण रोकें और बाड़े में कीटाणुनाशक छिड़कें।',
    feedback_prompt: 'कृपया बीप के बाद अपनी शिकायत या सुझाव रिकॉर्ड करें। समाप्त होने पर हैश दबाएं।',
    feedback_success: 'आपकी शिकायत टिकट संख्या {ticketId} के रूप में पंजीकृत हो गई है। धन्यवाद।',
    invalid_input: 'अमान्य विकल्प। कृपया पुनः प्रयास करें।',
    call_ended: 'जीवरक्षक AI पशु हेल्पलाइन पर कॉल करने के लिए धन्यवाद। नमस्कार।',
  },
  en: {
    welcome: 'Welcome to JeevRakshak AI Livestock Health Hotline 1800-120-JEEV (5338).',
    select_language: 'For Marathi press 1, for Hindi press 2, for English press 3.',
    main_menu: 'Press 1 to report an animal disease. Press 2 for vaccination schedule and camps. Press 3 for veterinary doctor consultation. Press 4 for emergency 1962 animal ambulance. Press 5 for government disease alerts. Press 6 to register a complaint. Press 0 to repeat.',
    disease_select_animal: 'Press 1 for Cow, 2 for Buffalo, 3 for Goat, 4 for Sheep, 5 for Poultry, 6 for Other.',
    disease_select_symptom: 'Press 1 for high fever, 2 for blisters in mouth or feet, 3 for skin nodules, 4 for loss of appetite, 5 for respiratory distress, 6 for other.',
    disease_record_prompt: 'Please describe the symptoms, number of affected animals, and your village after the beep. Press hash when finished.',
    disease_success: 'Your disease report has been registered. Your Case ID is {caseId}. A local veterinarian has been alerted and an SMS confirmation sent.',
    vaccination_info: 'FMD Vaccination Round 4 starts September 15. Goat Pox camp on September 22 at Gram Panchayat center. SMS sent to your mobile.',
    doctor_consult_menu: 'Connecting to taluka veterinary officer. Press 1 to request an urgent doctor callback, or 2 to check existing case status.',
    doctor_callback_success: 'Doctor callback queued. Dr. Rahul Kulkarni will call your mobile within 20 minutes.',
    emergency_prompt: '1962 Animal Emergency Hotline! Press 1 to dispatch an emergency mobile veterinary unit to your GPS location, or 0 to go back.',
    emergency_dispatched: 'Emergency unit {code} dispatched! Priority flagged as Critical. Stay with the animal in a shaded area.',
    announcements_prompt: 'Department of Animal Husbandry Advisory: LSD ring vaccination active in a 10 km zone. Restrict cattle movement and disinfect sheds.',
    feedback_prompt: 'Please record your feedback or grievance regarding livestock services after the beep. Press hash when done.',
    feedback_success: 'Your feedback has been logged under Ticket ID {ticketId}. The commissionerate will review within 24 hours.',
    invalid_input: 'Invalid input. Please try again.',
    call_ended: 'Thank you for calling JeevRakshak AI Livestock Helpline. Have a great day.',
  },
  gu: {
    welcome: 'નમસ્તે! જીવરક્ષક AI પશુ આરોગ્ય ટોલ-ફ્રી હેલ્પલાઇન ૧૮૦૦-૧૨૦-૫૩૩૮ માં આપનું સ્વાગત છે.',
    select_language: 'ગુજરાતી માટે ૪ દબાવો.',
    main_menu: 'પશુ રોગની જાણ કરવા ૧ દબાવો. રસીકરણની માહિતી માટે ૨ દબાવો. પશુચિકિત્સક સાથે વાત કરવા ૩ દબાવો. ઇમરજન્સી ૧૯૬૨ એમ્બ્યુલન્સ માટે ૪ દબાવો. સરકારી ચેતવણી માટે ૫ દબાવો. ફરિયાદ માટે ૬ દબાવો. ફરી સાંભળવા ૦ દબાવો.',
    disease_select_animal: 'ગાય માટે ૧, ભેંસ માટે ૨, બકરી માટે ૩, ઘેટાં માટે ૪, મરઘાં માટે ૫, અન્ય માટે ૬ દબાવો.',
    disease_select_symptom: 'તાવ માટે ૧, મોઢામાં કે પગમાં ફોલ્લા માટે ૨, ચામડી પર ગાંઠો માટે ૩, શ્વાસની તકલીફ માટે ૫ દબાવો.',
    disease_record_prompt: 'કૃપા કરીને બીપ પછી તમારા પશુના લક્ષણો જણાવો. પૂર્ણ કરવા માટે હેશ (#) દબાવો.',
    disease_success: 'આપનો રિપોર્ટ નોંધાયો છે. કેસ આઈડી {caseId} છે. પશુ ચિકિત્સકને જાણ કરી દેવાઈ છે.',
    vaccination_info: 'તમારા જિલ્લામાં ખરવા-મોવાસા રસીકરણ ૧૫ સપ્ટેમ્બરથી શરૂ થશે. વિગત SMS દ્વારા મોકલેલ છે.',
    doctor_consult_menu: 'પશુચિકિત્સક કોલબેક માટે ૧ દબાવો.',
    doctor_callback_success: 'કોલબેક વિનંતી નોંધાઈ છે. ડોક્ટર ટૂંક સમયમાં સંપર્ક કરશે.',
    emergency_prompt: '૧૯૬૨ પશુ ઇમરજન્સી સેવા! એમ્બ્યુલન્સ મોકલવા ૧ દબાવો.',
    emergency_dispatched: 'ઇમરજન્સી વાન {code} રવાના કરવામાં આવી છે.',
    announcements_prompt: 'સરકારી ચેતવણી: લમ્પી ત્વચા રોગ અટકાવવા પશુઓની હેરફેર રોકો અને ગમાણમાં દવા છાંટો.',
    feedback_prompt: 'બીપ પછી તમારો પ્રતિસાદ રેકોર્ડ કરો. સમાપ્ત કરવા હેશ દબાવો.',
    feedback_success: 'આપની ફરિયાદ નોંધાઈ ગઈ છે. ટિકિટ {ticketId}. આભાર.',
    invalid_input: 'અમાન્ય વિકલ્પ. કૃપા કરીને ફરી પ્રયાસ કરો.',
    call_ended: 'જીવરક્ષક AI હેલ્પલાઇન પર કોલ કરવા બદલ આભાર.',
  },
  pa: {
    welcome: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਜੀਵਰੱਖਿਅਕ AI ਪਸ਼ੂ ਸਿਹਤ ਹੈਲਪਲਾਈਨ 1800-120-5338 ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।',
    select_language: 'ਪੰਜਾਬੀ ਲਈ 5 ਦਬਾਓ।',
    main_menu: 'ਬਿਮਾਰੀ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਲਈ 1 ਦਬਾਓ। ਟੀਕਾਕਰਨ ਜਾਣਕਾਰੀ ਲਈ 2 ਦਬਾਓ। ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲਈ 3 ਦਬਾਓ। ਐਮਰਜੈਂਸੀ 1962 ਲਈ 4 ਦਬਾਓ। ਸਰਕਾਰੀ ਚੇਤਾਵਨੀ ਲਈ 5 ਦਬਾਓ। ਸ਼ਿਕਾਇਤ ਲਈ 6 ਦਬਾਓ।',
    disease_select_animal: 'ਗਾਂ ਲਈ 1, ਮੱਝ ਲਈ 2, ਬੱਕਰੀ ਲਈ 3, ਭੇਡ ਲਈ 4 ਦਬਾਓ।',
    disease_select_symptom: 'ਤੇਜ਼ ਬੁਖਾਰ ਲਈ 1, ਮੂੰਹ ਖੁਰ ਦੇ ਛਾਲਿਆਂ ਲਈ 2, ਚਮੜੀ ਦੀਆਂ ਗੰਢਾਂ ਲਈ 3 ਦਬਾਓ।',
    disease_record_prompt: 'ਬੀਪ ਤੋਂ ਬਾਅਦ ਆਪਣੇ ਪਸ਼ੂ ਦੇ ਲੱਛਣ ਦੱਸੋ। ਖ਼ਤਮ ਕਰਨ ਲਈ ਹੈਸ਼ ਦਬਾਓ।',
    disease_success: 'ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਦਰਜ ਹੋ ਗਈ ਹੈ। ਕੇਸ ਆਈਡੀ {caseId} ਹੈ।',
    vaccination_info: 'ਮੂੰਹ-ਖੁਰ ਦਾ ਟੀਕਾਕਰਨ 15 ਸਤੰਬਰ ਤੋਂ ਸ਼ੁਰੂ ਹੈ। ਐਸ.ਐਮ.ਐਸ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ।',
    doctor_consult_menu: 'ਡਾਕਟਰ ਕਾਲਬੈਕ ਲਈ 1 ਦਬਾਓ।',
    doctor_callback_success: 'ਕਾਲਬੈਕ ਬੇਨਤੀ ਦਰਜ ਹੋ ਗਈ ਹੈ। ਡਾਕਟਰ ਜਲਦੀ ਸੰਪਰਕ ਕਰਨਗੇ।',
    emergency_prompt: '1962 ਐਮਰਜੈਂਸੀ ਐਂਬੂਲੈਂਸ ਲਈ 1 ਦਬਾਓ।',
    emergency_dispatched: 'ਐਮਰਜੈਂਸੀ ਵੈਨ {code} ਰਵਾਨਾ ਹੋ ਚੁੱਕੀ ਹੈ।',
    announcements_prompt: 'ਸਰਕਾਰੀ ਸਲਾਹ: ਲੰਪੀ ਸਕਿਨ ਬਿਮਾਰੀ ਰੋਕਣ ਲਈ ਪਸ਼ੂਆਂ ਦੀ ਆਵਾਜਾਈ ਰੋਕੋ।',
    feedback_prompt: 'ਬੀਪ ਤੋਂ ਬਾਅਦ ਆਪਣੀ ਰਾਏ ਦੱਸੋ। ਹੈਸ਼ ਦਬਾਓ।',
    feedback_success: 'ਤੁਹਾਡੀ ਸ਼ਿਕਾਇਤ ਦਰਜ ਹੋ ਗਈ ਹੈ: {ticketId}',
    invalid_input: 'ਗਲਤ ਚੋਣ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    call_ended: 'ਜੀਵਰੱਖਿਅਕ AI ਹੈਲਪਲਾਈਨ ਤੇ ਕਾਲ ਕਰਨ ਲਈ ਧੰਨਵਾਦ।',
  },
  ta: {
    welcome: 'வணக்கம்! ஜீவரக்ஷக் AI கால்நடை சுகாதார உதவி எண் 1800-120-5338க்கு வரவேற்கிறோம்.',
    select_language: 'தமிழுக்கு 6 அழுத்தவும்.',
    main_menu: 'நோய் புகார் அளிக்க 1 அழுத்தவும். தடுப்பூசி விபரங்களுக்கு 2 அழுத்தவும். மருத்துவ ஆலோசனைக்கு 3 அழுத்தவும். அவசர 1962 ஆம்புலன்சுக்கு 4 அழுத்தவும். அரசு அறிவிப்புகளுக்கு 5 அழுத்தவும். புகார்களுக்கு 6 அழுத்தவும்.',
    disease_select_animal: 'பசுவிற்கு 1, எருமைக்கு 2, ஆட்டிற்கு 3 அழுத்தவும்.',
    disease_select_symptom: 'காய்ச்சலுக்கு 1, வாய் புண்களுக்கு 2, தோல் கட்டிகளுக்கு 3 அழுத்தவும்.',
    disease_record_prompt: 'பீப் சத்தத்திற்கு பிறகு உங்கள் கால்நடை அறிகுறிகளை கூறவும். முடிக்க # அழுத்தவும்.',
    disease_success: 'உங்கள் புகார் பதிவானது. வழக்கு எண் {caseId}. மருத்துவர் தகவல் அனுப்பப்பட்டது.',
    vaccination_info: 'கோமாரி நோய் தடுப்பூசி முகாம் செப்டம்பர் 15 அன்று துவங்குகிறது.',
    doctor_consult_menu: 'மருத்துவர் திரும்ப அழைக்க 1 அழுத்தவும்.',
    doctor_callback_success: 'மருத்துவர் விரைவில் தொடர்பு கொள்வார்.',
    emergency_prompt: '1962 அவசர சேவைக்கு 1 அழுத்தவும்.',
    emergency_dispatched: 'அவசர ஊர்தி {code} புறப்பட்டது.',
    announcements_prompt: 'அரசு எச்சரிக்கை: தோல் கழலை நோய் தடுப்பு நடவடிக்கைகள் தீவிரப்படுத்தப்பட்டுள்ளன.',
    feedback_prompt: 'உங்கள் புகாரை பீப்பிற்கு பின் கூறவும்.',
    feedback_success: 'புகார் எண்: {ticketId}. நன்றி.',
    invalid_input: 'தவறான தேர்வு.',
    call_ended: 'ஜீவரக்ஷக் AI உதவிக்கு அழைத்தமைக்கு நன்றி.',
  },
  te: {
    welcome: 'నమస్కారం! జీవరక్షక్ AI పశు ఆరోగ్య హెల్ప్‌లైన్ 1800-120-5338 కు స్వాగతం.',
    select_language: 'తెలుగు కోసం 7 నొక్కండి.',
    main_menu: 'వ్యాధి నివేదిక కోసం 1, టీకా వివరాలకు 2, వైద్యుని సంప్రదింపులకు 3, అత్యవసర 1962 అంబులెన్స్ కోసం 4 నొక్కండి.',
    disease_select_animal: 'ఆవు కోసం 1, గేదె కోసం 2, మేక కోసం 3 నొక్కండి.',
    disease_select_symptom: 'తీవ్ర జ్వరం కోసం 1, పుండ్లు లేదా బొబ్బల కోసం 2, చర్మ గడ్డల కోసం 3 నొక్కండి.',
    disease_record_prompt: 'బీప్ శబ్దం తర్వాత మీ పశువు లక్షణాలను చెప్పండి. ముగించడానికి # నొక్కండి.',
    disease_success: 'మీ నివేదిక నమోదైంది. కేస్ ఐడీ {caseId}. వైద్యుడికి సమాచారం అందించబడింది.',
    vaccination_info: 'గాలికుంటు వ్యాధి టీకా శిబిరం సెప్టెంబర్ 15 నుండి ప్రారంభమవుతుంది.',
    doctor_consult_menu: 'డాక్టర్ కాల్‌బ్యాక్ కోసం 1 నొక్కండి.',
    doctor_callback_success: 'కాల్‌బ్యాక్ అభ్యర్థన నమోదైంది.',
    emergency_prompt: '1962 అత్యవసర అంబులెన్స్ కోసం 1 నొక్కండి.',
    emergency_dispatched: 'అత్యవసర వాహనం {code} బయలుదేరింది.',
    announcements_prompt: 'ప్రభుత్వ సలహా: లంపీ స్కిన్ వ్యాధి నివారణకు పశువుల రవాణా నిరోధించండి.',
    feedback_prompt: 'మీ ఫిర్యాదును రికార్డ్ చేయండి.',
    feedback_success: 'ఫిర్యాదు ఐడీ: {ticketId}',
    invalid_input: 'చెల్లని ఎంపిక.',
    call_ended: 'జీవరక్షక్ AI హెల్ప్‌లైన్ కు కాల్ చేసినందుకు ధన్యవాదాలు.',
  },
  kn: {
    welcome: 'ನಮಸ್ಕಾರ! ಜೀವರಕ್ಷಕ್ AI ಜಾನುವಾರು ಆರೋಗ್ಯ ಸಹಾಯವಾಣಿ 1800-120-5338 ಗೆ ಸ್ವಾಗತ.',
    select_language: 'ಕನ್ನಡಕ್ಕಾಗಿ 8 ಒತ್ತಿರಿ.',
    main_menu: 'ರೋಗ ವರದಿ ಮಾಡಲು 1, ಲಸಿಕೆ ಮಾಹಿತಿಗೆ 2, ವೈದ್ಯರ ಸಲಹೆಗೆ 3, ತುರ್ತು 1962 ಗೆ 4 ಒತ್ತಿರಿ.',
    disease_select_animal: 'ಹಸುವಿಗೆ 1, ಎಮ್ಮೆಗೆ 2, ಕುರಿ/ಮೇಕೆಗೆ 3 ಒತ್ತಿರಿ.',
    disease_select_symptom: 'ಜ್ವರಕ್ಕೆ 1, ಬಾಯಿ ಹುಣ್ಣಿಗೆ 2, ಚರ್ಮದ ಗಂಟುಗಳಿಗೆ 3 ಒತ್ತಿರಿ.',
    disease_record_prompt: 'ಬೀಪ್ ನಂತರ ಜಾನುವಾರಿನ ಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ. ಮುಗಿಸಲು # ಒತ್ತಿರಿ.',
    disease_success: 'ವರದಿ ದಾಖಲಾಗಿದೆ. ಕೇಸ್ ಐಡಿ {caseId}. ವೈದ್ಯರಿಗೆ ಮಾಹಿತಿ ನೀಡಲಾಗಿದೆ.',
    vaccination_info: 'ಕಾಲುಬಾಯಿ ರೋಗ ಲಸಿಕೆ ಸೆಪ್ಟೆಂಬರ್ 15 ರಿಂದ ಆರಂಭ.',
    doctor_consult_menu: 'ವೈದ್ಯರ ಕಾಲ್‌ಬ್ಯಾಕ್‌ಗಾಗಿ 1 ಒತ್ತಿರಿ.',
    doctor_callback_success: 'ಕಾಲ್‌ಬ್ಯಾಕ್ ವಿನಂತಿ ದಾಖಲಾಗಿದೆ.',
    emergency_prompt: '1962 ತುರ್ತು ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ 1 ಒತ್ತಿರಿ.',
    emergency_dispatched: 'ತುರ್ತು ವಾಹನ {code} ಹೊರಟಿದೆ.',
    announcements_prompt: 'ಸರ್ಕಾರಿ ಎಚ್ಚರಿಕೆ: ಚರ್ಮ ಗಂಟು ರೋಗ ತಡೆಗಟ್ಟಲು ಜಾನುವಾರು ಸ್ಥಳಾಂತರ ನಿಲ್ಲಿಸಿ.',
    feedback_prompt: 'ನಿಮ್ಮ ಅಭಿಪ್ರಾಯವನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ.',
    feedback_success: 'ದೂರು ಸಂಖ್ಯೆ: {ticketId}',
    invalid_input: 'ತಪ್ಪು ಆಯ್ಕೆ.',
    call_ended: 'ಜೀವರಕ್ಷಕ್ AI ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.',
  },
  bn: {
    welcome: 'নমস্কার! জীভরক্ষক AI পশু স্বাস্থ্য হেল্পলাইনে আপনাকে স্বাগতম (১৮০০-১২০-৫৩৩৮)।',
    select_language: 'বাংলার জন্য ৯ টিপুন।',
    main_menu: 'পশুর রোগের রিপোর্ট করতে ১ টিপুন। টিকাদানের তথ্যের জন্য ২ টিপুন। ডাক্তারের পরামর্শের জন্য ৩ টিপুন। জরুরি ১৯৩ অ্যাম্বুলেন্সের জন্য ৪ টিপুন। সরকারি সতর্কতার জন্য ৫ টিপুন। অভিযোগ জানাতে ৬ টিপুন।',
    disease_select_animal: 'গরুর জন্য ১, মোষের জন্য ২, ছাগলের জন্য ৩ টিপুন।',
    disease_select_symptom: 'জ্বরের জন্য ১, মুখের ক্ষতের জন্য ২, চামড়ার গুটির জন্য ৩ টিপুন।',
    disease_record_prompt: 'বীপের পরে আপনার পশুর লক্ষণগুলি বলুন। শেষ করতে হ্যাশ (#) টিপুন।',
    disease_success: 'আপনার রিপোর্ট জমা হয়েছে। কেস আইডি {caseId}। ডাক্তারকে জানানো হয়েছে।',
    vaccination_info: 'খুরারোগের টিকাদান কর্মসূচি আগামী ১৫ সেপ্টেম্বর থেকে শুরু হচ্ছে।',
    doctor_consult_menu: 'ডাক্তারের কলব্যাকের জন্য ১ টিপুন।',
    doctor_callback_success: 'কলব্যাকের অনুরোধ গৃহীত হয়েছে।',
    emergency_prompt: 'জরুরি ১৯৩ পরিষেবার জন্য ১ টিপুন।',
    emergency_dispatched: 'জরুরি অ্যাম্বুলেন্স {code} রওনা হয়েছে।',
    announcements_prompt: 'সরকারি সতর্কতা: লাম্পি স্কিন ডিজিজ প্রতিরোধে সতর্কতা অবলম্বন করুন।',
    feedback_prompt: 'বীপের পরে আপনার অভিযোগ জানান।',
    feedback_success: 'অভিযোগ আইডি: {ticketId}',
    invalid_input: 'ভুল ইনপুট।',
    call_ended: 'জীভরক্ষক AI তে কল করার জন্য ধন্যবাদ।',
  },
};

// DTMF Frequencies (Dual-Tone Multi-Frequency ITU-T standard)
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play authentic dual-frequency DTMF tone for telecom keypad feedback
 */
export function playDTMFTone(key: string, durationMs = 180): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = DTMF_FREQS[key];
    if (!freqs) return;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    // Smooth attack and release to avoid audio click
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gainNode.gain.setValueAtTime(0.15, now + (durationMs / 1000) - 0.02);
    gainNode.gain.linearRampToValueAtTime(0.001, now + (durationMs / 1000));

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationMs / 1000);
    osc2.stop(now + durationMs / 1000);
  } catch (err) {
    console.warn('DTMF audio error:', err);
  }
}

/**
 * Play standard IVR recording beep
 */
export function playBeep(frequency = 1000, durationMs = 450): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gain.gain.setValueAtTime(0.2, now + (durationMs / 1000) - 0.02);
    gain.gain.linearRampToValueAtTime(0.001, now + (durationMs / 1000));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationMs / 1000);
  } catch (err) {
    console.warn('Beep error:', err);
  }
}

/**
 * Play telecom dialtone or ringing sound
 */
export function playRingtone(durationSeconds = 2): () => void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return () => {};

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    // Standard Indian/UK ringback: 400Hz + 450Hz modulated
    osc1.frequency.value = 400;
    osc2.frequency.value = 450;
    gain.gain.value = 0.08;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSeconds);
    osc2.stop(now + durationSeconds);

    return () => {
      try {
        osc1.stop();
        osc2.stop();
      } catch {
        // already stopped
      }
    };
  } catch {
    return () => {};
  }
}

/**
 * Text-to-Speech prompt player using Web Speech API
 */
export function speakIVRPrompt(
  text: string,
  lang: IVRLanguage = 'mr',
  onEnd?: () => void,
  onStart?: () => void
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onStart) onStart();
    const timer = setTimeout(() => {
      if (onEnd) onEnd();
    }, 2000);
    return () => clearTimeout(timer);
  }

  // Cancel any prior speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langConfig = IVR_LANGUAGES.find((l) => l.code === lang) || IVR_LANGUAGES[0];
  utterance.lang = langConfig.bcp47;
  utterance.rate = 0.95; // Slightly slower for clarity in rural IVR
  utterance.pitch = 1.0;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.startsWith(langConfig.bcp47) || v.lang.startsWith(lang)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error/cancelled:', e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

/**
 * Stop any running speech synthesis
 */
export function stopIVRSpeech(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Realistic simulated vernacular audio scripts for rural farmers
 */
export const SAMPLE_FARMER_TRANSCRIPTS: Record<
  string,
  { transcript_mr: string; transcript_hi: string; transcript_en: string; suspected: string; severity: 'low' | 'medium' | 'high' | 'critical' }
> = {
  cow_lumpy: {
    transcript_mr: 'माझ्या ५ वर्षांच्या गाईच्या संपूर्ण अंगावर मोठ्या गाठी आल्या आहेत. ती कालपासून चारा खात नाही आणि खूप ताप आहे. डोळ्यांतून आणि नाकातून पाणी वाहत आहे. कृपया लवकर मदत पाठवा.',
    transcript_hi: 'मेरी ५ साल की गाय के पूरे शरीर पर बड़ी-बड़ी गांठें हो गई हैं। वह कल से चारा नहीं खा रही और तेज बुखार है। आंखों और नाक से पानी बह रहा है। कृपया जल्द डॉक्टर भेजें।',
    transcript_en: 'My 5-year-old cow has developed large nodules all over the body. She stopped eating fodder since yesterday and has high fever. Water discharge from eyes and nose.',
    suspected: 'Lumpy Skin Disease (LSD)',
    severity: 'high',
  },
  buffalo_fmd: {
    transcript_mr: 'म्हशीच्या तोंडात आणि जिभेवर मोठे फोड झाले आहेत आणि लाळ गळत आहे. खुरांमध्ये जखमा झाल्यामुळे ती लंगडत चालते. इतर दोन म्हशींनाही हाच त्रास सुरू झाला आहे.',
    transcript_hi: 'भैंस के मुंह और जीभ पर छाले हो गए हैं और लगातार लार गिर रही है। खुरों में घाव होने से वह लंगड़ा कर चल रही है।',
    transcript_en: 'Excessive salivation and large vesicles inside mouth and tongue of buffalo. Limping due to interdigital lesions. Highly contagious.',
    suspected: 'Foot and Mouth Disease (FMD)',
    severity: 'critical',
  },
  goat_pox: {
    transcript_mr: 'शेळीच्या कानावर आणि पोटावर पुरळ आणि लहान फोड उठले आहेत. खोकला आणि धाप लागत आहे. दुपारपासून पाला खात नाही.',
    transcript_hi: 'बकरी के कान और पेट पर दाने और छाले निकल आए हैं। खांसी और सांस लेने में कठिनाई है।',
    transcript_en: 'Small pox-like papules on ears and ventral abdomen of goat. Accompanied by nasal discharge and mild coughing.',
    suspected: 'Goat Pox / PPR',
    severity: 'medium',
  },
  general_fever: {
    transcript_mr: 'गाईला काल संध्याकाळपासून अंग गरम आहे आणि रवंथ करणे थांबवले आहे. सुस्त होऊन एका कोपऱ्यात बसली आहे.',
    transcript_hi: 'गाय को कल शाम से तेज बुखार है और जुगाली बंद कर दी है। सुस्त होकर बैठी है।',
    transcript_en: 'Cow has elevated body temperature since yesterday evening, cessation of rumination and lethargy.',
    suspected: 'Bovine Pyrexia / Indigestion',
    severity: 'medium',
  },
};
