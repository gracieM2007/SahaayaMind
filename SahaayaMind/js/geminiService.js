/**
 * ============================================================================
 * SahaayaMind - Original Google Gemini AI Integration Engine
 * Smart India Hackathon 2026 (SIH26003) | Team Arbalest
 * ============================================================================
 * Connects directly to Google Generative Language API (Gemini 2.5 Flash / 3.7 Flash)
 * with robust multilingual generation (Hindi, Marathi, English, Bodo, Assamese),
 * geriatric empathetic prompt engineering, and offline safe fallback.
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  const instance = factory();
  if (typeof root !== 'undefined') root.GeminiService = instance;
  if (typeof window !== 'undefined') window.GeminiService = instance;
  if (typeof module === 'object' && module.exports) module.exports = instance;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const STORAGE_KEY_API_KEY = 'sahaaya_gemini_api_key';
  const DEFAULT_MODEL = 'gemini-3.8-flash';
  const DEFAULT_API_KEY = 'AQ.Ab8RN6KU6d46a-jagUMWcg_SDDMqwTR_mNAF84Qq36pup3Ajvg';

  // System Prompt Builder for SahaayaMind
  function buildSystemInstruction(language, activeUser, sessionHistory) {
    const langNames = {
      en: 'English (Indian English context)',
      hi: 'Hindi (हिन्दी)',
      mr: 'Marathi (मराठी)',
      as: 'Assamese (অসমীয়া)',
      brx: 'Bodo (बर’)'
    };
    const targetLang = langNames[language] || 'English';

    const userName = (activeUser && activeUser.name) ? activeUser.name : 'Ramesh Sharma';
    const userAge = (activeUser && activeUser.age) ? activeUser.age : 72;
    const userLevel = (activeUser && activeUser.cognitiveLevel) ? activeUser.cognitiveLevel : 'Gentle Pace (Level 2)';

    let latestSummary = 'Memory Recall & Match score: 94/100, Accuracy: 96%';
    if (Array.isArray(sessionHistory) && sessionHistory.length > 0) {
      const s = sessionHistory[0];
      latestSummary = `${s.gameName || 'Cognitive Game'} score: ${s.score || 90}/100, Accuracy: ${s.accuracy || '92%'}`;
    }

    return `You are Sahaaya Companion, an empathetic, scientifically grounded, and warm AI Cognitive Wellness & Geriatric Assistant in the "SahaayaMind" platform (Smart India Hackathon 2026, Problem Statement: SIH26003).

CORE MISSION & CLINICAL GUIDELINES:
1. Target User: Senior citizen named ${userName}, aged ${userAge}, participating in daily cognitive stimulation at ${userLevel}. Their latest session was: "${latestSummary}".
2. Language Directive: You MUST respond purely in ${targetLang}. Use natural, grammatically accurate, and respectful vocabulary suitable for an elderly native speaker.
   - For Hindi (हिन्दी) & Marathi (मराठी): Address the elder with deep respect using the honorific "जी" (ji) and respectful verbs (आप / आपण).
   - For Assamese (অসমীয়া): Address respectfully using "ডাঙৰীয়া" / "আপুনি".
   - For Bodo (बर’): Use respectful elder addressing and genuine Bodo phrasing.
   - For English: Use warm, gentle, patient Indian English.
3. Clinical Boundaries:
   - You are strictly a supportive cognitive wellness assistant, NOT a medical doctor.
   - NEVER provide a clinical diagnosis of dementia, Alzheimer's, or severe pathology. Frame all advice as daily neuro-wellness, hydration, nutrition, and routine stimulation.
   - Advise consulting a qualified physician or geriatrician if clinical red flags or sudden acute confusion arise.
4. Response Content:
   - Provide accurate, scientifically backed advice on memory preservation, the MIND diet (berries, walnuts, leafy greens, hydration), sleep hygiene, and gentle brain exercises.
   - If asked for a riddle or mental puzzle, provide an uplifting gentle riddle and HIDE the answer inside double-pipe spoiler tags like ||answer|| so the senior can guess!
   - Keep answers readable and structured with short paragraphs, friendly bullet points, and cheerful encouragement.
5. Voice Optimization:
   - Seniors will often listen to your reply via Text-to-Speech (TTS). Write fluid, conversational sentences that sound pleasant when spoken aloud.`;
  }

  // Retrieve stored API Key
  function getApiKey() {
    try {
      return localStorage.getItem(STORAGE_KEY_API_KEY) || (window.SAHAAYA_GEMINI_KEY || '') || DEFAULT_API_KEY;
    } catch (e) {
      return DEFAULT_API_KEY;
    }
  }

  function setApiKey(key) {
    try {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_API_KEY);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function getModel() {
    try {
      return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
    } catch (e) {
      return DEFAULT_MODEL;
    }
  }

  function setModel(modelName) {
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, modelName || DEFAULT_MODEL);
    } catch (e) {}
  }

  function isConfigured() {
    return Boolean(getApiKey() && getApiKey().trim().length > 5);
  }

  /**
   * Test API Key connection
   */
  async function testConnection(customKey) {
    const key = (customKey || getApiKey() || '').trim();
    if (!key) {
      return { success: false, message: 'Please enter a valid Gemini API key.' };
    }

    const model = getModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Say "Namaste from Gemini AI! Connected successfully."' }]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        return { success: false, message: msg };
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Connected!';
      return { success: true, message: reply };
    } catch (err) {
      return { success: false, message: `Network error: ${err.message}` };
    }
  }

  /**
   * Primary method: Generate multi-turn response from Gemini
   */
  async function generateResponse(userMessage, conversationHistory, activeUser, sessionHistory, langCode) {
    const apiKey = getApiKey();
    const currentLang = langCode || (window.SahaayaI18N ? window.SahaayaI18N.getLanguage() : 'en');
    const model = getModel();

    // If no API key configured, return null to signal fallback to built-in knowledge base
    if (!apiKey) {
      return null;
    }

    const systemInstruction = buildSystemInstruction(currentLang, activeUser, sessionHistory);

    // Format conversation history for Gemini API
    const contents = [];

    // Append prior dialogue turns (up to last 6 turns to keep context fast & optimal)
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-6);
      recent.forEach(msg => {
        if (msg.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: msg.text }]
          });
        } else if (msg.role === 'ai' || msg.role === 'model') {
          contents.push({
            role: 'model',
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.65,
        topP: 0.95,
        maxOutputTokens: 800
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('[GeminiService] API error response:', errorData);
        // Fall back gracefully
        return null;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const replyRaw = candidate?.content?.parts?.[0]?.text;

      if (!replyRaw || replyRaw.trim() === '') {
        return null;
      }

      // Generate speech text by stripping markdown asterisks and spoiler tags
      let speechClean = replyRaw
        .replace(/\|\|(.*?)\|\|/g, '$1') // Reveal answer in speech or say "The answer is"
        .replace(/[*#_~`]/g, '')
        .replace(/\n\n+/g, '. ')
        .trim();

      // If speech is too long, trim gently to ~2 sentences for friendly senior speech
      const sentences = speechClean.split(/(?<=[.?!।])/);
      if (sentences.length > 3) {
        speechClean = sentences.slice(0, 3).join(' ');
      }

      // Produce dynamic suggested chips tailored for the language
      const suggestions = generateSuggestedChips(currentLang);

      return {
        replyText: replyRaw,
        speechText: speechClean,
        suggestions: suggestions,
        source: 'gemini',
        model: model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

    } catch (networkErr) {
      console.warn('[GeminiService] Network call failed, falling back:', networkErr);
      return null;
    }
  }

  // Localized quick prompts for seniors
  function generateSuggestedChips(lang) {
    const chipsMap = {
      en: [
        'How was my memory today? 🧠',
        'Doctor advice: What should caregivers avoid? ⚠️',
        'Give me a gentle brain riddle 💡',
        'Best foods for brain health 🥗',
        'Tips for better sleep 🌙'
      ],
      hi: [
        'आज मेरी याददाश्त कैसी रही? 🧠',
        'देखभाल करने वालों को क्या नहीं करना चाहिए? ⚠️',
        'मुझे एक दिमागी पहेली पूछें 💡',
        'दिमाग के लिए उत्तम भोजन 🥗',
        'अच्छी नींद के उपाय 🌙'
      ],
      mr: [
        'आज माझी स्मरणशक्ती कशी होती? 🧠',
        'काळजीवाहूंनी काय टाळावे? ⚠️',
        'मला एक मेंदूचे कोडे सांगा 💡',
        'मेंदूच्या आरोग्यासाठी उत्तम आहार 🥗',
        'शांत झोपेसाठी सोपे उपाय 🌙'
      ],
      as: [
        'আজি মোৰ স্মৃতিশক্তি কেনে আছিল? 🧠',
        'যত্ন লওঁতাসকলে কি এৰাই চলিব লাগে? ⚠️',
        'মোক এটা মগজুৰ সাঁথৰ সোধক 💡',
        'মগজুৰ স্বাস্থ্যৰ বাবে উপযোগী খাদ্য 🥗',
        'ভাল টোপনিৰ বাবে সহজ দিহা 🌙'
      ],
      brx: [
        'दिनै आंनि गोसोखांनाय शक्ति माबोरैमोन? 🧠',
        'नायगिरिफोरा मा मा गारनो नांगौ? ⚠️',
        'आंनो एसेल’ फाग्ला बाथ्रा (सॉथोर) सों 💡',
        'मेधिनि थाखाय मोजां आदार 🥗',
        'मोजां उन्दुनायनि थाखाय बोसोन 🌙'
      ]
    };

    return chipsMap[lang] || chipsMap.en;
  }

  return {
    getApiKey,
    setApiKey,
    getModel,
    setModel,
    isConfigured,
    testConnection,
    generateResponse,
    generateSuggestedChips
  };
});
