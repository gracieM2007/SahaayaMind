/* ==========================================================================
   SahaayaMind - Senior Accessibility Engine
   Text Sizing, High Contrast, and Web Speech API Voice Guidance
   ========================================================================== */

(function () {
  'use strict';

  // State keys
  const FONT_SIZE_KEY = 'sahaaya_font_size';
  const HIGH_CONTRAST_KEY = 'sahaaya_high_contrast';
  
  // Apply saved accessibility preferences immediately
  function applySavedPreferences() {
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) || 'normal';
    setFontSize(savedFontSize, false);

    const isHighContrast = localStorage.getItem(HIGH_CONTRAST_KEY) === 'true';
    setHighContrast(isHighContrast, false);
  }

  // Set font size
  window.setFontSize = function (size, announce = true) {
    document.body.classList.remove('font-large', 'font-xlarge');
    
    if (size === 'large') {
      document.body.classList.add('font-large');
    } else if (size === 'xlarge') {
      document.body.classList.add('font-xlarge');
    }
    
    localStorage.setItem(FONT_SIZE_KEY, size);
    updateFontSizeButtons(size);
    
    if (announce && size !== 'normal') {
      speakAccessibilityNote(`Text size changed to ${size === 'xlarge' ? 'Extra Large' : 'Large'}`);
    }
  };

  function updateFontSizeButtons(currentSize) {
    document.querySelectorAll('[data-font-size]').forEach(btn => {
      if (btn.getAttribute('data-font-size') === currentSize) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  // Set high contrast
  window.toggleHighContrast = function () {
    const currentlyActive = document.body.classList.contains('high-contrast-mode');
    setHighContrast(!currentlyActive, true);
  };

  window.setHighContrast = function (enable, announce = true) {
    if (enable) {
      document.body.classList.add('high-contrast-mode');
      localStorage.setItem(HIGH_CONTRAST_KEY, 'true');
    } else {
      document.body.classList.remove('high-contrast-mode');
      localStorage.setItem(HIGH_CONTRAST_KEY, 'false');
    }
    
    const toggleBtn = document.getElementById('contrast-toggle-btn');
    if (toggleBtn) {
      if (enable) {
        toggleBtn.classList.add('active');
        toggleBtn.setAttribute('aria-pressed', 'true');
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-pressed', 'false');
      }
    }

    if (announce) {
      speakAccessibilityNote(enable ? "High contrast mode turned on" : "High contrast mode turned off");
    }
  };

  // Web Speech API Multilingual Voice Guidance Engine for Seniors
  let speechSynth = window.speechSynthesis;
  let isSpeaking = false;
  let availableVoices = [];

  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = speechSynth.getVoices() || [];
    }
  }
  loadVoices();
  if ('speechSynthesis' in window && speechSynth.onvoiceschanged !== undefined) {
    speechSynth.onvoiceschanged = loadVoices;
  }

  // Find best matching voice for target language
  function findBestVoice(langCode) {
    if (!availableVoices || availableVoices.length === 0) {
      loadVoices();
    }
    const voices = availableVoices;
    const target = langCode || (window.SahaayaI18N ? window.SahaayaI18N.getLanguage() : 'en');

    // 1. Exact language prefix match
    let match = null;
    if (target === 'hi') {
      match = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));
    } else if (target === 'mr') {
      match = voices.find(v => v.lang.toLowerCase().startsWith('mr') || v.name.toLowerCase().includes('marathi'));
      // Fallback to Hindi voice which accurately pronounces Devanagari script of Marathi
      if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    } else if (target === 'as') {
      match = voices.find(v => v.lang.toLowerCase().startsWith('as') || v.name.toLowerCase().includes('assamese'));
      // Fallback to Bengali voice (Eastern Nagari script) or Hindi
      if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith('bn'));
      if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    } else if (target === 'brx') {
      match = voices.find(v => v.lang.toLowerCase().startsWith('brx') || v.name.toLowerCase().includes('bodo'));
      // Fallback to Hindi voice for Devanagari phonetics
      if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
    } else {
      // English (prefers Indian English)
      match = voices.find(v => v.lang.toLowerCase().includes('en-in') || v.name.toLowerCase().includes('india'));
      if (!match) match = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    }

    return match || null;
  }

  // Clean markdown and symbols from text for senior speech
  function cleanTextForSpeech(rawText) {
    if (!rawText) return '';
    return rawText
      .replace(/\|\|(.*?)\|\|/g, '$1') // Reveal riddle answer in speech smoothly
      .replace(/[*#_~`>]/g, '')        // Strip markdown decorators
      .replace(/-\s+/g, '')            // Strip bullet dashes
      .replace(/\d+\.\s+/g, '')        // Strip numbered list digits
      .replace(/\n+/g, '. ')           // Convert line breaks to gentle pauses
      .trim();
  }

  window.speakText = function (text, onEndCallback, langCode) {
    if (!('speechSynthesis' in window)) {
      alert("Voice assistance is not supported in this browser.");
      return;
    }

    // Cancel current speech if any
    speechSynth.cancel();

    if (!text || text.trim() === "") return;

    const cleaned = cleanTextForSpeech(text);
    const activeLang = langCode || (window.SahaayaI18N ? window.SahaayaI18N.getLanguage() : 'en');
    const utterance = new SpeechSynthesisUtterance(cleaned);

    // Warm, respectful pace for seniors
    utterance.rate = (activeLang === 'en') ? 0.88 : 0.85;
    utterance.pitch = 1.0;

    // Set voice & BCP-47 tag
    const langTags = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
      as: 'as-IN',
      brx: 'hi-IN'
    };
    utterance.lang = langTags[activeLang] || 'en-IN';

    const selectedVoice = findBestVoice(activeLang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = function () {
      isSpeaking = true;
      updateVoiceButtonsUI(true);
      document.body.classList.add('ai-speaking-active');
    };

    utterance.onend = function () {
      isSpeaking = false;
      updateVoiceButtonsUI(false);
      document.body.classList.remove('ai-speaking-active');
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = function () {
      isSpeaking = false;
      updateVoiceButtonsUI(false);
      document.body.classList.remove('ai-speaking-active');
      if (onEndCallback) onEndCallback();
    };

    speechSynth.speak(utterance);
  };

  window.stopSpeaking = function () {
    if ('speechSynthesis' in window) {
      speechSynth.cancel();
      isSpeaking = false;
      updateVoiceButtonsUI(false);
      document.body.classList.remove('ai-speaking-active');
    }
  };

  window.toggleVoiceRead = function (textToRead) {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const text = textToRead || getDefaultPageSpeech();
      speakText(text);
    }
  };

  function speakAccessibilityNote(note) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(note);
      u.rate = 1.0;
      const lang = window.SahaayaI18N ? window.SahaayaI18N.getLanguage() : 'en';
      const voice = findBestVoice(lang);
      if (voice) u.voice = voice;
      speechSynth.speak(u);
    }
  }

  function updateVoiceButtonsUI(speaking) {
    const lang = window.SahaayaI18N ? window.SahaayaI18N.getLanguage() : 'en';
    const stopText = (window.SahaayaI18N) ? window.SahaayaI18N.t('stopVoice') : 'Stop Voice';
    const readText = (window.SahaayaI18N) ? window.SahaayaI18N.t('readAloud') : 'Read Aloud';

    document.querySelectorAll('.btn-voice-toggle, #page-voice-btn').forEach(btn => {
      if (speaking) {
        btn.classList.add('active');
        btn.innerHTML = `<span aria-hidden="true">🔊</span> ${stopText}`;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `<span aria-hidden="true">🔈</span> ${readText}`;
      }
    });

    // Update message listen buttons if speaking stopped
    if (!speaking) {
      document.querySelectorAll('.btn-msg-listen.speaking').forEach(b => {
        b.classList.remove('speaking');
        b.innerHTML = '<span>🔊</span> <span>Listen</span>';
      });
    }
  }

  function getDefaultPageSpeech() {
    const mainHeading = document.querySelector('h1')?.innerText || "SahaayaMind Platform";
    const subHeading = document.querySelector('h2')?.innerText || "";
    const primaryText = document.querySelector('.main-content p, .activity-desc')?.innerText || "";
    return `${mainHeading}. ${subHeading}. ${primaryText}`;
  }

  // Initialize after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    applySavedPreferences();

    // Attach listeners for font buttons
    document.querySelectorAll('[data-font-size]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const size = e.currentTarget.getAttribute('data-font-size');
        setFontSize(size);
      });
    });

    // Attach listener for contrast toggle
    const contrastBtn = document.getElementById('contrast-toggle-btn');
    if (contrastBtn) {
      contrastBtn.addEventListener('click', toggleHighContrast);
    }

    // Attach listener for voice read
    const voiceBtn = document.getElementById('page-voice-btn');
    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => toggleVoiceRead());
    }

    // Attach listener for language switcher buttons if present
    document.querySelectorAll('.js-lang-btn, .lang-select-btn, .lang-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        if (lang && window.SahaayaI18N) {
          window.SahaayaI18N.setLanguage(lang, true);
        }
      });
    });

    // Attach listener for language select dropdowns
    document.querySelectorAll('.js-language-select').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const lang = e.target.value;
        if (lang && window.SahaayaI18N) {
          window.SahaayaI18N.setLanguage(lang, true);
        }
      });
    });
  });

})();
