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

  // Web Speech API Voice Guidance Engine for Seniors
  let speechSynth = window.speechSynthesis;
  let isSpeaking = false;

  window.speakText = function (text, onEndCallback) {
    if (!('speechSynthesis' in window)) {
      alert("Voice assistance is not supported in this browser.");
      return;
    }

    // Cancel current speech if any
    speechSynth.cancel();

    if (!text || text.trim() === "") return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // Gentle, clear speed for seniors
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN'; // Gentle Indian English pronunciation if available, fallbacks automatically

    utterance.onstart = function () {
      isSpeaking = true;
      updateVoiceButtonsUI(true);
    };

    utterance.onend = function () {
      isSpeaking = false;
      updateVoiceButtonsUI(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = function () {
      isSpeaking = false;
      updateVoiceButtonsUI(false);
    };

    speechSynth.speak(utterance);
  };

  window.stopSpeaking = function () {
    if ('speechSynthesis' in window) {
      speechSynth.cancel();
      isSpeaking = false;
      updateVoiceButtonsUI(false);
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
      speechSynth.speak(u);
    }
  }

  function updateVoiceButtonsUI(speaking) {
    document.querySelectorAll('.btn-voice-toggle, #page-voice-btn').forEach(btn => {
      if (speaking) {
        btn.classList.add('active');
        btn.innerHTML = `<span aria-hidden="true">🔊</span> Stop Voice`;
      } else {
        btn.classList.remove('active');
        btn.innerHTML = `<span aria-hidden="true">🔈</span> Read Aloud`;
      }
    });
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
  });

})();
