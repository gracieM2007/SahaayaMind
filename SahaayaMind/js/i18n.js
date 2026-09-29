/**
 * ============================================================================
 * SahaayaMind - Multilingual Engine & Internationalization (i18n)
 * Supported Languages: English, Hindi (हिन्दी), Marathi (मराठी), 
 *                      Assamese (অসমীয়া), Bodo (बर’)
 * Smart India Hackathon 2026 (SIH26003) | Team Arbalest
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  const instance = factory();
  if (typeof root !== 'undefined') root.SahaayaI18N = instance;
  if (typeof window !== 'undefined') window.SahaayaI18N = instance;
  if (typeof module === 'object' && module.exports) module.exports = instance;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const STORAGE_KEY = 'sahaaya_language';

  // Language Configurations & Metadata
  const LANGUAGES = {
    en: {
      code: 'en',
      name: 'English',
      native: 'English',
      flag: '🇬🇧',
      script: 'Latn',
      voiceCode: 'en-IN',
      speechCode: 'en-IN',
      speechRate: 0.88,
      fallbackVoice: 'en-US'
    },
    hi: {
      code: 'hi',
      name: 'Hindi',
      native: 'हिन्दी',
      flag: '🇮🇳',
      script: 'Deva',
      voiceCode: 'hi-IN',
      speechCode: 'hi-IN',
      speechRate: 0.86,
      fallbackVoice: 'hi'
    },
    mr: {
      code: 'mr',
      name: 'Marathi',
      native: 'मराठी',
      flag: '🇮🇳',
      script: 'Deva',
      voiceCode: 'mr-IN',
      speechCode: 'mr-IN',
      speechRate: 0.86,
      fallbackVoice: 'hi-IN' // High-quality Devanagari phonetic fallback
    },
    as: {
      code: 'as',
      name: 'Assamese',
      native: 'অসমীয়া',
      flag: '🇮🇳',
      script: 'Beng',
      voiceCode: 'as-IN',
      speechCode: 'as-IN',
      speechRate: 0.86,
      fallbackVoice: 'bn-IN' // Eastern Nagari phonetic fallback
    },
    brx: {
      code: 'brx',
      name: 'Bodo',
      native: 'बर’',
      flag: '🇮🇳',
      script: 'Deva',
      voiceCode: 'brx-IN',
      speechCode: 'brx-IN',
      speechRate: 0.86,
      fallbackVoice: 'hi-IN' // Devanagari phonetic fallback
    }
  };

  // UI Translation Dictionaries for All 5 Languages
  const TRANSLATIONS = {
    en: {
      appName: 'SahaayaMind',
      appTagline: 'AI-Powered Cognitive Wellness Platform',
      seniorAccessibility: 'Senior Accessibility',
      normalFont: 'Normal A',
      largeFont: 'Large A+',
      xlargeFont: 'Extra Large A++',
      highContrast: 'High Contrast',
      readAloud: 'Read Aloud',
      stopVoice: 'Stop Voice',
      language: 'Language',
      selectLang: 'Choose Language',

      // Navigation
      navDashboard: 'Dashboard',
      navProgress: 'My Progress',
      navDoctor: 'AI Doctor Advisory',
      navCompanion: 'AI Companion',
      navSwitch: 'Switch',
      navHowItWorks: 'How it works',

      // Start / Menu Page
      welcomeTitle: 'Welcome to SahaayaMind',
      welcomeSubtitle: 'Gentle, scientifically designed cognitive activities to stimulate memory, attention, and mental clarity every single day.',
      simpleSenior: 'Simple & Senior-Friendly',
      safeNonDiagnostic: 'Safe & Non-Diagnostic',
      voiceSupported: 'Voice Supported in 5 Languages',
      whoIsPlaying: 'Who is playing today?',
      whoIsPlayingSubtitle: 'Select your profile below with a single tap, or type your name.',
      choosePreferredLang: 'Select Your Preferred Language',
      choosePreferredLangSub: 'Voice and chat will converse with you naturally in your chosen mother tongue.',
      startDailySession: 'Start Daily Session →',
      noPasswordNote: 'No complicated passwords required. All your activity progress is automatically saved on this device.',
      orEnterName: 'Or Enter a New Senior Name',
      seniorNameLabel: 'Senior Name',
      seniorAgeLabel: 'Age',

      // Chat Interface
      chatHeaderTitle: 'Sahaaya Cognitive Companion',
      chatHeaderSubtitle: 'Empathetic Geriatric AI & Clinical Wellness Guide',
      autoReadReplies: 'Auto-read replies',
      clearChat: 'Clear',
      geminiSettings: 'Gemini AI Settings',
      geminiActiveBadge: 'Gemini 2.5 Live',
      geminiBuiltinBadge: 'Sahaaya AI Engine',
      typeMessagePlaceholder: 'Type your question or click the microphone to speak...',
      listeningMic: 'Listening to your voice... please speak clearly',
      sendBtn: 'Send',
      seniorTip: 'Senior Tip: Tap 🎙️ to talk or tap 🔊 Listen on any message to hear it spoken in a warm voice.',
      doctorAdvisoryLink: 'View Full Doctor Advisory & Caregiver Protocols →',

      // Suggested Chips
      chipMemory: 'How was my memory today? 🧠',
      chipDoctor: 'Doctor advice: What to avoid? ⚠️',
      chipRiddle: 'Give me a gentle brain riddle 💡',
      chipDiet: 'Best foods for brain health 🥗',
      chipSleep: 'Tips for better sleep 🌙',

      // Voice announcements
      langSwitchedVoice: 'Language changed to English. You can speak and listen in English.'
    },

    hi: {
      appName: 'सहायमाइन्ड',
      appTagline: 'एआई-संचालित वरिष्ठ मानसिक स्वास्थ्य मंच',
      seniorAccessibility: 'वरिष्ठ सुविधाएँ',
      normalFont: 'सामान्य A',
      largeFont: 'बड़ा A+',
      xlargeFont: 'बहुत बड़ा A++',
      highContrast: 'हाई कंट्रास्ट',
      readAloud: 'बोलकर सुनाएं',
      stopVoice: 'आवाज़ रोकें',
      language: 'भाषा',
      selectLang: 'भाषा चुनें',

      // Navigation
      navDashboard: 'डैशबोर्ड',
      navProgress: 'मेरी प्रगति',
      navDoctor: 'एआई डॉक्टर सलाह',
      navCompanion: 'एआई साथी',
      navSwitch: 'बदलें',
      navHowItWorks: 'कैसे काम करता है',

      // Start / Menu Page
      welcomeTitle: 'सहायमाइन्ड (SahaayaMind) में आपका स्वागत है',
      welcomeSubtitle: 'वरिष्ठ नागरिकों की स्मृति, एकाग्रता और मानसिक स्वास्थ्य के लिए विशेष रूप से तैयार की गई सरल व दैनिक मानसिक कसरतें।',
      simpleSenior: 'सरल व वरिष्ठ-अनुकूल',
      safeNonDiagnostic: 'सुरक्षित व सम्मानजनक',
      voiceSupported: '5 भाषाओं में आवाज़ की सुविधा',
      whoIsPlaying: 'आज कौन खेल रहा है?',
      whoIsPlayingSubtitle: 'नीचे एक टैप से अपनी प्रोफ़ाइल चुनें, या नया नाम दर्ज करें।',
      choosePreferredLang: 'अपनी पसंदीदा भाषा चुनें',
      choosePreferredLangSub: 'एआई आपसे आपकी चुनी हुई भाषा में आवाज़ और चैट द्वारा बातचीत करेगा।',
      startDailySession: 'दैनिक अभ्यास शुरू करें →',
      noPasswordNote: 'किसी पासवर्ड की आवश्यकता नहीं है। आपकी सारी प्रगति इसी डिवाइस पर सुरक्षित रहती है।',
      orEnterName: 'या नया नाम दर्ज करें',
      seniorNameLabel: 'वरिष्ठ नागरिक का नाम',
      seniorAgeLabel: 'उम्र',

      // Chat Interface
      chatHeaderTitle: 'सहाय कॉग्निटिव साथी (Sahaaya Companion)',
      chatHeaderSubtitle: 'आदरपूर्ण व संवेदनशील एआई मानसिक स्वास्थ्य परामर्शदाता',
      autoReadReplies: 'जवाब अपने-आप बोलें',
      clearChat: 'मिटाएं',
      geminiSettings: 'जेमिनी एआई सेटिंग्स',
      geminiActiveBadge: 'जेमिनी 2.5 सक्रिय',
      geminiBuiltinBadge: 'सहाय एआई इंजन',
      typeMessagePlaceholder: 'अपना प्रश्न लिखें या बोलने के लिए माइक 🎙️ दबाएं...',
      listeningMic: 'आपकी आवाज़ सुन रहे हैं... कृपया स्पष्ट बोलें',
      sendBtn: 'भेजें',
      seniorTip: 'सुझाव: बोलने के लिए 🎙️ दबाएं या किसी भी संदेश को आवाज़ में सुनने के लिए 🔊 सुनें पर टैप करें।',
      doctorAdvisoryLink: 'डॉक्टर की पूरी सलाह व देखभाल नियम देखें →',

      // Suggested Chips
      chipMemory: 'आज मेरी याददाश्त कैसी रही? 🧠',
      chipDoctor: 'देखभाल करने वालों को क्या नहीं करना चाहिए? ⚠️',
      chipRiddle: 'मुझे एक दिमागी पहेली पूछें 💡',
      chipDiet: 'दिमाग के लिए उत्तम भोजन 🥗',
      chipSleep: 'अच्छी नींद के उपाय 🌙',

      // Voice announcements
      langSwitchedVoice: 'भाषा बदलकर हिन्दी कर दी गई है। अब आप हिन्दी में बात कर सकते हैं।'
    },

    mr: {
      appName: 'सहायामाइन्ड',
      appTagline: 'एआय-संचलित ज्येष्ठ नागरिक मानसिक आरोग्य मंच',
      seniorAccessibility: 'ज्येष्ठ नागरिक सुविधा',
      normalFont: 'सामान्य A',
      largeFont: 'मोठे A+',
      xlargeFont: 'अति मोठे A++',
      highContrast: 'हाय कॉन्ट्रास्ट',
      readAloud: 'वाचून दाखवा',
      stopVoice: 'आवाज थांबवा',
      language: 'भाषा',
      selectLang: 'भाषा निवडा',

      // Navigation
      navDashboard: 'डॅशबोर्ड',
      navProgress: 'माझी प्रगती',
      navDoctor: 'एआय डॉक्टर सल्ला',
      navCompanion: 'एआय सोबती',
      navSwitch: 'बदला',
      navHowItWorks: 'कसे कार्य करते',

      // Start / Menu Page
      welcomeTitle: 'सहायामाइन्ड (SahaayaMind) मध्ये आपले स्वागत आहे',
      welcomeSubtitle: 'ज्येष्ठ नागरिकांची स्मरणशक्ती, एकाग्रता आणि मानसिक स्पष्टता टिकवून ठेवण्यासाठी सुलभ व शास्त्रीय खेळ.',
      simpleSenior: 'सुलभ व ज्येष्ठ-अनुकूल',
      safeNonDiagnostic: 'सुरक्षित व आदरयुक्त',
      voiceSupported: '५ भाषांमध्ये व्हॉइस सुविधा',
      whoIsPlaying: 'आज कोण खेळत आहे?',
      whoIsPlayingSubtitle: 'एका टॅपने आपले नाव निवडा किंवा नवीन नाव प्रविष्ट करा.',
      choosePreferredLang: 'आपली आवडती भाषा निवडा',
      choosePreferredLangSub: 'एआय आपल्याशी थेट मराठीत आवाज व चॅटद्वारे संवाद साधेल.',
      startDailySession: 'दैनिक सराव सुरू करा →',
      noPasswordNote: 'कोणत्याही पासवर्डची गरज नाही. तुमची सर्व प्रगती या उपकरणावर सुरक्षित सेव्ह होते.',
      orEnterName: 'किंवा नवीन नाव नोंदवा',
      seniorNameLabel: 'ज्येष्ठांचे नाव',
      seniorAgeLabel: 'वय',

      // Chat Interface
      chatHeaderTitle: 'सहाया कॉग्निटिव्ह सोबती (Sahaaya Companion)',
      chatHeaderSubtitle: 'काळजीवाहू व आदरयुक्त एआय मानसिक आरोग्य मार्गदर्शक',
      autoReadReplies: 'उत्तरे आपोआप वाचा',
      clearChat: 'साफ करा',
      geminiSettings: 'जेमिनी एआय सेटिंग्स',
      geminiActiveBadge: 'जेमिनी २.५ थेट सुरू',
      geminiBuiltinBadge: 'सहाया एआय इंजिन',
      typeMessagePlaceholder: 'प्रश्न विचारा किंवा बोलण्यासाठी माइक 🎙️ दाबा...',
      listeningMic: 'तुमचा आवाज ऐकत आहे... कृपया स्पष्ट बोला',
      sendBtn: 'पाठवा',
      seniorTip: 'सल्ला: बोलण्यासाठी 🎙️ दाबा किंवा संदेश आवाजात ऐकण्यासाठी 🔊 ऐका वर टॅप करा.',
      doctorAdvisoryLink: 'डॉक्टरांचे सल्ले व काळजीवाहू नियम पहा →',

      // Suggested Chips
      chipMemory: 'आज माझी स्मरणशक्ती कशी होती? 🧠',
      chipDoctor: 'काळजीवाहूंनी काय टाळावे? ⚠️',
      chipRiddle: 'मला एक छान मेंदूचे कोडे सांगा 💡',
      chipDiet: 'मेंदूच्या आरोग्यासाठी उत्तम आहार 🥗',
      chipSleep: 'शांत झोपेसाठी सोपे उपाय 🌙',

      // Voice announcements
      langSwitchedVoice: 'भाषा मराठी निवडली गेली आहे. आता आपण मराठीत बोलू आणि ऐकू शकता.'
    },

    as: {
      appName: 'সহায়মাইণ্ড',
      appTagline: 'কৃত্ৰিম বুদ্ধিমত্তা-চালিত জেষ্ঠ্য মানসিক স্বাস্থ্য মঞ্চ',
      seniorAccessibility: 'জেষ্ঠ্য নাগৰিক সুবিধা',
      normalFont: 'সাধাৰণ A',
      largeFont: 'ডাঙৰ A+',
      xlargeFont: 'অতি ডাঙৰ A++',
      highContrast: 'উচ্চ কনট্ৰাষ্ট',
      readAloud: 'পঢ়ি শুনক',
      stopVoice: 'মাত বন্ধ কৰক',
      language: 'ভাষা',
      selectLang: 'ভাষা বাছক',

      // Navigation
      navDashboard: 'ডেশ্ববৰ্ড',
      navProgress: 'মোৰ অগ্ৰগতি',
      navDoctor: 'AI চিকিৎসক পৰামৰ্শ',
      navCompanion: 'AI সংগী',
      navSwitch: 'সলাওক',
      navHowItWorks: 'কেনেকৈ কাম কৰে',

      // Start / Menu Page
      welcomeTitle: 'সহায়মাইণ্ডলৈ (SahaayaMind) আপোনাক স্বাগতম',
      welcomeSubtitle: 'জেষ্ঠ্য নাগৰিকসকলৰ স্মৃতিশক্তি, মনোযোগ আৰু মানসিক সুস্থতা অটুট ৰাখিবলৈ বৈজ্ঞানিকভাৱে প্ৰস্তুত কৰা সৰল অনুশীলন।',
      simpleSenior: 'সহজ আৰু জেষ্ঠ্য-অনুকূল',
      safeNonDiagnostic: 'সুৰক্ষিত আৰু সন্মানজনক',
      voiceSupported: '৫ টা ভাষাত মাতৰ সুবিধা',
      whoIsPlaying: 'আজি কোনে খেলিছে?',
      whoIsPlayingSubtitle: 'তলত এটা স্পৰ্শৰে আপোনাৰ প্ৰফাইল বাছক, বা নতুন নাম লিখক।',
      choosePreferredLang: 'আপোনাৰ পছন্দৰ ভাষা বাছক',
      choosePreferredLangSub: 'AI-এ আপোনাৰ সৈতে মাত আৰু বাৰ্তাৰে অসমীয়া ভাষাত সহজভাৱে কথা পাতিব।',
      startDailySession: 'দৈনিক অনুশীলন আৰম্ভ কৰক →',
      noPasswordNote: 'কোনো পাছৱৰ্ডৰ প্ৰয়োজন নাই। আপোনাৰ সকলো অগ্ৰগতি এই ডিভাইচতেই সুৰক্ষিত হৈ থাকে।',
      orEnterName: 'বা নতুন জেষ্ঠ্য নাগৰিকৰ নাম দিয়ক',
      seniorNameLabel: 'নাম',
      seniorAgeLabel: 'বয়স',

      // Chat Interface
      chatHeaderTitle: 'সহায় কগনিটিভ সংগী (Sahaaya Companion)',
      chatHeaderSubtitle: 'স্নেহশীল আৰু সহানুভূতিশীল AI মানসিক স্বাস্থ্য সহায়ক',
      autoReadReplies: 'উত্তৰ নিজে নিজে পঢ়ক',
      clearChat: 'মচক',
      geminiSettings: 'Gemini AI ছেটিংছ',
      geminiActiveBadge: 'Gemini 2.5 সক্ৰিয়',
      geminiBuiltinBadge: 'সহায় AI ইঞ্জিন',
      typeMessagePlaceholder: 'প্ৰশ্ন সোধক বা কথা ক’বলৈ মাইক 🎙️ টিপক...',
      listeningMic: 'আপোনাৰ কথা শুনি আছোঁ... অনুগ্ৰহ কৰি স্পষ্টকৈ কওক',
      sendBtn: 'প্ৰেৰণ কৰক',
      seniorTip: 'পৰামৰ্শ: ক’বলৈ 🎙️ টিপক অথবা উত্তৰ শুনিবলৈ 🔊 শুনক বুটামত স্পৰ্শ কৰক।',
      doctorAdvisoryLink: 'সম্পূৰ্ণ চিকিৎসক পৰামৰ্শ আৰু যত্ন লোৱাৰ নিয়ম চাওক →',

      // Suggested Chips
      chipMemory: 'আজি মোৰ স্মৃতিশক্তি কেনে আছিল? 🧠',
      chipDoctor: 'যত্ন লওঁতাসকলে কি এৰাই চলিব লাগে? ⚠️',
      chipRiddle: 'মোক এটা মগজুৰ সাঁথৰ সোধক 💡',
      chipDiet: 'মগজুৰ স্বাস্থ্যৰ বাবে উপযোগী খাদ্য 🥗',
      chipSleep: 'ভাল টোপনিৰ বাবে সহজ দিহা 🌙',

      // Voice announcements
      langSwitchedVoice: 'ভাষা অসমীয়া নিৰ্বাচন কৰা হ’ল। আপুনি এতিয়া অসমীয়াত কথা পাতিব পাৰিব।'
    },

    brx: {
      appName: 'सहायामाइन्ड',
      appTagline: 'गोसोनि सावस्रि आरो गोसोखांनाय शक्तिनि AI मञ्च',
      seniorAccessibility: 'गोजौ मानसिफोरनि थाखाय',
      normalFont: 'मोजां A',
      largeFont: 'गेदेर A+',
      xlargeFont: 'जोबोद गेदेर A++',
      highContrast: 'गोजों Contrast',
      readAloud: 'खोनासंनाय',
      stopVoice: 'राव बन्द खालाम',
      language: 'राव',
      selectLang: 'राव सायख’',

      // Navigation
      navDashboard: 'डेशबर्ड',
      navProgress: 'आंनि जौगानाय',
      navDoctor: 'AI डाक्टरनि बोसोन',
      navCompanion: 'AI लोगो',
      navSwitch: 'सोलाय',
      navHowItWorks: 'माबोरै खामानि मावो',

      // Start / Menu Page
      welcomeTitle: 'सहायामाइन्डाव (SahaayaMind) बरायबाय',
      welcomeSubtitle: 'बैसो जानाय मानसिफोरनि गोसोखांनाय शक्ति आरो गोसोखौ मोजां लाखिनो थाखाय गोरलै दिन्थिफुल।',
      simpleSenior: 'गोरलै आरो बैसो गोनांफोरनि थाखाय',
      safeNonDiagnostic: 'उदां आरो मान गोनां',
      voiceSupported: '५ रावजों सोदोबनि हेफाजाब',
      whoIsPlaying: 'दिनै सोर गेलेगोन?',
      whoIsPlayingSubtitle: 'गाहायाव नोंथांनि मुंखौ सायख’ एबा गोदान मुं लिर।',
      choosePreferredLang: 'नोंथांनि मोजां मोननाय राव सायख’',
      choosePreferredLangSub: 'AI आ नोंथांनि लोगोआव बर’ रावजों सोदोब आरो बाथ्राजों रायलायगोन।',
      startDailySession: 'दिनैनि गेलेनाय जागाय →',
      noPasswordNote: 'पासवार्डनि गोनांथि गैया। गासैबो दिन्थिफुला नोंथांनि डिभाइसावनो दोनथुम जायो।',
      orEnterName: 'एबा गोदान मुं लिर',
      seniorNameLabel: 'मुं',
      seniorAgeLabel: 'बैसो',

      // Chat Interface
      chatHeaderTitle: 'सहाया गोसोनि AI लोगो (Sahaaya Companion)',
      chatHeaderSubtitle: 'अननाय गोनां बैसो गोनांफोरनि AI सावस्रि हेफाजाबगिरि',
      autoReadReplies: 'गावनो गाव खोनासं',
      clearChat: 'गोजावहो',
      geminiSettings: 'Gemini AI सेटिं',
      geminiActiveBadge: 'Gemini 2.5 सोलिदों',
      geminiBuiltinBadge: 'सहाया AI इन्जिन',
      typeMessagePlaceholder: 'सोंनाय सों एबा बुंनो थाखाय माइक 🎙️ थु...',
      listeningMic: 'नोंथांनि बाथ्रा खोनासंदों... दया खालामना मोजाङै बुं',
      sendBtn: 'थिनहर',
      seniorTip: 'बोसोन: बुंनो थाखाय 🎙️ थु एबा राव खोनासंनो थाखाय 🔊 खोनासं आव थु।',
      doctorAdvisoryLink: 'डाक्टरनि गासै बोसोन आरो नेमफोरखौ नाय →',

      // Suggested Chips
      chipMemory: 'दिनै आंनि गोसोखांनाय शक्ति माबोरैमोन? 🧠',
      chipDoctor: 'नायगिरिफोरा मा मा गारनो नांगौ? ⚠️',
      chipRiddle: 'आंनो एसेल’ फाग्ला बाथ्रा (सॉथोर) सों 💡',
      chipDiet: 'मेधिनि थाखाय मोजां आदार 🥗',
      chipSleep: 'मोजां उन्दुनायनि थाखाय बोसोन 🌙',

      // Voice announcements
      langSwitchedVoice: 'राव बर’ सायख’बाय। नोंथाङा दायो बर’ रावजों रायलायनो हागोन।'
    }
  };

  // State Management
  let currentLang = 'en';

  function init() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES[saved]) {
        currentLang = saved;
      }
    } catch (e) {
      currentLang = 'en';
    }
    updateDocumentLang();
  }

  function updateDocumentLang() {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = currentLang;
      document.documentElement.setAttribute('data-lang', currentLang);
    }
  }

  function getLanguage() {
    return currentLang;
  }

  function getLanguageConfig(code) {
    const c = code || currentLang;
    return LANGUAGES[c] || LANGUAGES.en;
  }

  function setLanguage(code, announce = true) {
    if (!LANGUAGES[code]) {
      console.warn(`[SahaayaI18N] Unsupported language code: ${code}`);
      return false;
    }

    currentLang = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {}

    updateDocumentLang();
    translatePageElements();
    updateSelectorActiveStates();

    // Notify listeners
    if (typeof window !== 'undefined') {
      const evt = new CustomEvent('sahaaya:language-changed', {
        detail: {
          language: currentLang,
          config: LANGUAGES[currentLang]
        }
      });
      window.dispatchEvent(evt);

      // Announce via voice if requested and speech is enabled
      if (announce && typeof window.speakText === 'function') {
        const announcement = t('langSwitchedVoice');
        if (announcement) {
          window.speakText(announcement, null, currentLang);
        }
      }
    }

    return true;
  }

  function t(key, params = {}) {
    const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
    let str = dict[key] || TRANSLATIONS.en[key] || key;

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        str = str.replace(new RegExp(`{${p}}`, 'g'), params[p]);
      });
    }

    return str;
  }

  function getAllLanguages() {
    return Object.values(LANGUAGES);
  }

  // Translates elements having [data-i18n] or [data-i18n-placeholder]
  function translatePageElements(root = document) {
    if (!root) return;

    // InnerText / HTML translations
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const text = t(key);
        if (text) {
          // If element has icon children with aria-hidden, preserve them
          const icon = el.querySelector('[aria-hidden="true"]');
          if (icon) {
            const iconHtml = icon.outerHTML;
            el.innerHTML = iconHtml + ' ' + text;
          } else {
            el.textContent = text;
          }
        }
      }
    });

    // Placeholders
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = t(key);
      }
    });

    // Titles / aria-labels
    root.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = t(key);
    });

    root.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', t(key));
    });
  }

  function updateSelectorActiveStates() {
    document.querySelectorAll('.lang-select-btn, .lang-pill-btn, .lang-card').forEach(btn => {
      const lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Update select dropdowns if any
    document.querySelectorAll('.js-language-select').forEach(sel => {
      sel.value = currentLang;
    });
  }

  // Auto-init on script evaluation
  init();

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      translatePageElements();
      updateSelectorActiveStates();
    });
  }

  return {
    LANGUAGES,
    TRANSLATIONS,
    getLanguage,
    setLanguage,
    getLanguageConfig,
    getAllLanguages,
    t,
    translatePageElements,
    updateSelectorActiveStates
  };
});
