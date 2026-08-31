/**
 * SahaayaMind - Cognitive Gaming & Memory Assistance Platform
 * Smart India Hackathon (SIH 2026) - Problem Statement: SIH26003
 * Team: Arbalest (AI006)
 * Module: Memory Match with Rule-Based Adaptive Difficulty & Voice Assistance
 */

(() => {
  'use strict';

  // Global namespace for SahaayaMind platform interoperability
  window.SahaayaMind = window.SahaayaMind || {};

  // ==========================================================================
  // 1. LOCAL STORAGE & DATA CONTRACT KEYS
  // ==========================================================================
  const STORAGE_KEYS = {
    DIFFICULTY: 'sahaayamind_memory_difficulty',
    SOUND_FX: 'sahaayamind_sound_fx_enabled',
    VOICE_GUIDE: 'sahaayamind_voice_guide_enabled',
    LANGUAGE: 'sahaayamind_preferred_language',
    HIGH_SCORE: 'sahaayamind_memory_highscore',
    GAMES_PLAYED: 'sahaayamind_memory_games_count',
    GAMEPLAY_HISTORY: 'sahaayamind_gameplay_history',
    COGNITIVE_PROFILE: 'sahaayamind_cognitive_profile'
  };

  // ==========================================================================
  // 2. MULTILINGUAL DICTIONARY (NER & NATIONAL ACCESSIBILITY)
  // ==========================================================================
  const I18N = {
    en: {
      langName: 'English',
      gameTitle: 'Card Memory Challenge',
      gameSubtitle: 'Strengthen your visual memory and cognitive recall by finding matching pairs of familiar objects at your own comfortable pace.',
      instructionsHeading: 'How to Play · Step-by-Step Guide',
      readInstructions: 'Listen to Guide',
      difficultyLabel: 'Current Difficulty Setting',
      adjustLevel: 'Adjust Level:',
      step1Title: '1. Flip Two Cards',
      step1Desc: 'Tap any face-down card to reveal its picture. The voice assistant will read the object aloud.',
      step2Title: '2. Spot the Match',
      step2Desc: 'Find its twin! Matching pairs stay face up with a friendly chime and emerald glow.',
      step3Title: '3. Adaptive Challenge',
      step3Desc: 'Scoring ≥80% accuracy automatically unlocks higher challenge levels for continuous brain wellness.',
      step4Title: '4. Gentle Pace',
      step4Desc: 'No strict countdowns. Take all the time you need to comfortably exercise your memory.',
      startBtn: 'Start Memory Game',
      highScoreLabel: 'High Score',
      gamesPlayedLabel: 'Games Played',
      levelLabel: 'Level',
      pairsFoundLabel: 'Pairs Found',
      movesLabel: 'Moves',
      timeLabel: 'Time',
      avgLatencyLabel: 'Avg Reaction',
      backToMenu: 'Back to Menu',
      restartLevel: 'Restart Level',
      congrats: 'Congratulations!',
      summaryHigh: 'Superb precision and focus! Your visual recall is sharp.',
      summaryMed: 'Well done! You solved the puzzle with steady concentration.',
      summaryLow: 'Good effort! Regular practice helps build memory strength.',
      totalScoreLabel: 'Total Score',
      accuracyLabel: 'Accuracy Rate',
      correctLabel: 'Correct Matches',
      incorrectLabel: 'Incorrect Misses',
      totalMovesLabel: 'Total Moves',
      timeTakenLabel: 'Time Taken',
      avgResponseLabel: 'Avg Decision Time',
      adaptiveHeading: 'Adaptive Difficulty Progression',
      playNextBtn: 'Play Next Round',
      replayBtn: 'Replay Level',
      mainMenuBtn: 'Main Menu',
      soundOn: 'Sound: ON',
      soundOff: 'Sound: OFF',
      voiceOn: 'Voice: ON',
      voiceOff: 'Voice: OFF',
      caregiverInsightTitle: 'Caregiver & Backend Telemetry Payload',
      voiceGuideSpoken: 'Welcome to SahaayaMind Memory Challenge. Step 1: Tap any card to reveal its picture. Step 2: Find the matching card. Matching cards will stay open. Step 3: Achieve 80 percent accuracy to advance difficulty. Enjoy the game at your own comfortable pace.'
    },
    hi: {
      langName: 'हिन्दी (Hindi)',
      gameTitle: 'कार्ड स्मृति खेल (Memory Challenge)',
      gameSubtitle: 'अपनी स्मृति और ध्यान को मजबूत करने के लिए कार्ड्स का मिलान करें।',
      instructionsHeading: 'खेलने का तरीका · चरण-दर-चरण निर्देश',
      readInstructions: 'निर्देश सुनें',
      difficultyLabel: 'वर्तमान कठिनाई स्तर',
      adjustLevel: 'स्तर बदलें:',
      step1Title: '1. दो कार्ड पलटें',
      step1Desc: 'छिपी तस्वीर देखने के लिए कार्ड छुएं। सहायक आवाज द्वारा नाम पढ़कर सुनाया जाएगा।',
      step2Title: '2. सही जोड़ी खोजें',
      step2Desc: 'समान तस्वीर खोजें। सही जोड़ी मिलने पर कार्ड खुले रहेंगे और ध्वनि बजेगी।',
      step3Title: '3. अनुकूली प्रगति',
      step3Desc: '80% या अधिक सटीकता पर खेल का स्तर अपने आप बढ़ जाएगा।',
      step4Title: '4. शांत गति',
      step4Desc: 'कोई समय का दबाव नहीं है। अपने आराम और गति से खेल का आनंद लें।',
      startBtn: 'खेल शुरू करें',
      highScoreLabel: 'उच्चतम स्कोर',
      gamesPlayedLabel: 'कुल खेल',
      levelLabel: 'स्तर',
      pairsFoundLabel: 'जोड़ियां मिलीं',
      movesLabel: 'प्रयास (Moves)',
      timeLabel: 'समय',
      avgLatencyLabel: 'औसत गति',
      backToMenu: 'मेनू पर जाएं',
      restartLevel: 'पुनः प्रारंभ करें',
      congrats: 'बहुत बढ़िया! बधाई हो!',
      summaryHigh: 'शानदार एकाग्रता! आपकी स्मृति बहुत तेज है।',
      summaryMed: 'शाबाश! आपने बहुत अच्छे से खेल पूरा किया।',
      summaryLow: 'अच्छा प्रयास! रोज़ाना अभ्यास करने से याददाश्त बेहतर होती है।',
      totalScoreLabel: 'कुल स्कोर',
      accuracyLabel: 'सटीकता (Accuracy)',
      correctLabel: 'सही जोड़ियां',
      incorrectLabel: 'गलत प्रयास',
      totalMovesLabel: 'कुल प्रयास',
      timeTakenLabel: 'लिया गया समय',
      avgResponseLabel: 'औसत निर्णय समय',
      adaptiveHeading: 'कठिनाई स्तर का समायोजन',
      playNextBtn: 'अगला राउंड खेलें',
      replayBtn: 'दोबारा खेलें',
      mainMenuBtn: 'मुख्य मेनू',
      soundOn: 'ध्वनि: चालू',
      soundOff: 'ध्वनि: बंद',
      voiceOn: 'आवाज: चालू',
      voiceOff: 'आवाज: बंद',
      caregiverInsightTitle: 'देखभालकर्ता अंतर्दृष्टि (Caregiver Payload)',
      voiceGuideSpoken: 'सहाय माइंड मेमोरी गेम में आपका स्वागत है। पहला कदम: तस्वीर देखने के लिए कार्ड पर टैप करें। दूसरा कदम: मिलती-जुलती जोड़ी खोजें। तीसरा कदम: अच्छा प्रदर्शन करने पर कठिनाई स्तर अपने आप बढ़ेगा। आराम से खेलें।'
    },
    as: {
      langName: 'অসমীয়া (Assamese - NER)',
      gameTitle: 'স্মৃতি পৰীক্ষা খেল (Memory Match)',
      gameSubtitle: 'আপোনাৰ স্মৃতিশক্তি বৃদ্ধিৰ বাবে কাৰ্ডবোৰ মিলাওক।',
      instructionsHeading: 'খেলৰ নিয়ম · সহজ নিৰ্দেশনা',
      readInstructions: 'নিৰ্দেশনা শুনক',
      difficultyLabel: 'বৰ্তমান কঠিনতা স্তৰ',
      adjustLevel: 'স্তৰ সলনি কৰক:',
      step1Title: '১. কাৰ্ড লুটিয়ক',
      step1Desc: 'ছবি চাবলৈ কাৰ্ডখনত টিপক। মুখেৰে বস্তুৰ নাম শুনোৱা হ’ব।',
      step2Title: '২. জোৰা মিলাওক',
      step2Desc: 'একে ছবি বিচাৰি পালে কাৰ্ডবোৰ খোলা থাকিব আৰু শব্দ বাজিব।',
      step3Title: '৩. অনুকূল প্ৰগতি',
      step3Desc: '৮০% বা ততোধিক সঠিকতা পালে স্তৰ স্বয়ংক্ৰিয়ভাৱে বৃদ্ধি পাব।',
      step4Title: '৪. আৰামদায়ক গতি',
      step4Desc: 'কোনো তাড়াহুড়া নাই। আপোনাৰ সুবিধামতে শান্তভাৱে খেলক।',
      startBtn: 'খেল আৰম্ভ কৰক',
      highScoreLabel: 'সৰ্বোচ্চ স্ক’ৰ',
      gamesPlayedLabel: 'মুঠ খেল',
      levelLabel: 'স্তৰ',
      pairsFoundLabel: 'জোৰা মিলিল',
      movesLabel: 'প্ৰচেষ্টা',
      timeLabel: 'সময়',
      avgLatencyLabel: 'গড় সময়',
      backToMenu: 'মেনুলৈ উভতি যাওক',
      restartLevel: 'পুনৰ আৰম্ভ কৰক',
      congrats: 'অভিনন্দন! বহুত ভাল খেলিলে!',
      summaryHigh: 'চমৎকাৰ স্মৃতিশক্তি আৰু মনোযোগ!',
      summaryMed: 'খুব ভাল! আপুনি মনোযোগেৰে খেলিলে।',
      summaryLow: 'ভাল প্ৰয়াস! নিয়মিত খেলে স্মৃতিশক্তি বাঢ়িব।',
      totalScoreLabel: 'মুঠ স্ক’ৰ',
      accuracyLabel: 'সঠিকতাৰ হাৰ',
      correctLabel: 'সঠিক জোৰা',
      incorrectLabel: 'ভুল জোৰা',
      totalMovesLabel: 'মুঠ চাল',
      timeTakenLabel: 'লোৱা সময়',
      avgResponseLabel: 'গড় সিদ্ধান্ত সময়',
      adaptiveHeading: 'স্তৰৰ স্বয়ংক্ৰিয় সমন্বয়',
      playNextBtn: 'পৰৱৰ্তী স্তৰ খেলক',
      replayBtn: 'পুনৰ খেলক',
      mainMenuBtn: 'মূল মেনু',
      soundOn: 'শব্দ: অন',
      soundOff: 'শব্দ: অফ',
      voiceOn: 'মাত: অন',
      voiceOff: 'মাত: অফ',
      caregiverInsightTitle: 'কেয়াৰগিভাৰ অন্তৰ্দৃষ্টি (Caregiver Payload)',
      voiceGuideSpoken: 'সহায় মাইণ্ড মেমৰি খেললৈ স্বাগতম। কাৰ্ডত টিপি ছবি চাওক আৰু একে ছবি মিলাই খেল উপভোগ কৰক।'
    }
  };

  // ==========================================
  // 3. DIFFICULTY DEFINITIONS
  // ==========================================
  const DIFFICULTY_CONFIG = {
    easy: {
      id: 'easy',
      name: { en: 'Easy', hi: 'सरल (Easy)', as: 'সহজ (Easy)' },
      badgeClass: 'badge-easy',
      pairs: 4,
      gridCols: 4,
      timeTarget: 60,
      multiplier: 1.0,
      description: {
        en: '4 Pairs (8 Cards) · Relaxed Pace',
        hi: '4 जोड़ियां (8 कार्ड) · आराम से खेलें',
        as: '৪ টা জোৰা (৮ খন কাৰ্ড) · সহজ গতি'
      }
    },
    medium: {
      id: 'medium',
      name: { en: 'Medium', hi: 'मध्यम (Medium)', as: 'মধ্যম (Medium)' },
      badgeClass: 'badge-medium',
      pairs: 6,
      gridCols: 4,
      timeTarget: 90,
      multiplier: 1.5,
      description: {
        en: '6 Pairs (12 Cards) · Balanced Focus',
        hi: '6 जोड़ियां (12 कार्ड) · संतुलित ध्यान',
        as: '৬ টা জোৰা (১২ খন কাৰ্ড) · মধ্যম স্তৰ'
      }
    },
    hard: {
      id: 'hard',
      name: { en: 'Hard', hi: 'कठिन (Hard)', as: 'কঠিন (Hard)' },
      badgeClass: 'badge-hard',
      pairs: 8,
      gridCols: 4,
      timeTarget: 120,
      multiplier: 2.0,
      description: {
        en: '8 Pairs (16 Cards) · High Focus',
        hi: '8 जोड़ियां (16 कार्ड) · उच्च एकाग्रता',
        as: '৮ টা জোৰা (১৬ খন কাৰ্ড) · গভীৰ মনোযোগ'
      }
    },
    expert: {
      id: 'expert',
      name: { en: 'Expert', hi: 'विशेषज्ञ (Expert)', as: 'অভিজ্ঞ (Expert)' },
      badgeClass: 'badge-expert',
      pairs: 10,
      gridCols: 5,
      timeTarget: 150,
      multiplier: 2.5,
      description: {
        en: '10 Pairs (20 Cards) · Master Challenge',
        hi: '10 जोड़ियां (20 कार्ड) · मास्टर स्तर',
        as: '১০ টা জোৰা (২০ খন কাৰ্ড) · বিশেষজ্ঞ স্তৰ'
      }
    }
  };

  const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert'];

  const EMOJI_BANK = [
    { symbol: '🍎', names: { en: 'Apple', hi: 'सेब (Apple)', as: 'আপেল (Apple)' } },
    { symbol: '🚗', names: { en: 'Car', hi: 'गाड़ी (Car)', as: 'গাড়ী (Car)' } },
    { symbol: '🏠', names: { en: 'House', hi: 'घर (House)', as: 'ঘৰ (House)' } },
    { symbol: '🐶', names: { en: 'Puppy', hi: 'कुत्ता (Dog)', as: 'কুকুৰ (Dog)' } },
    { symbol: '⭐', names: { en: 'Star', hi: 'तारा (Star)', as: 'তৰা (Star)' } },
    { symbol: '🌻', names: { en: 'Sunflower', hi: 'सूरजमुखी (Flower)', as: 'সূৰ্যমুখী (Flower)' } },
    { symbol: '🐱', names: { en: 'Cat', hi: 'बिल्ली (Cat)', as: 'মেকুৰী (Cat)' } },
    { symbol: '🎈', names: { en: 'Balloon', hi: 'गुब्बारा (Balloon)', as: 'বেলুন (Balloon)' } },
    { symbol: '🔔', names: { en: 'Bell', hi: 'घंटी (Bell)', as: 'ঘণ্টা (Bell)' } },
    { symbol: '🍓', names: { en: 'Strawberry', hi: 'स्ट्रॉबेरी (Berry)', as: 'ষ্ট্ৰবেৰী (Berry)' } },
    { symbol: '🚲', names: { en: 'Bicycle', hi: 'साइकिल (Cycle)', as: 'চাইকেল (Cycle)' } },
    { symbol: '✈️', names: { en: 'Aeroplane', hi: 'हवाई जहाज (Plane)', as: 'উৰাজাহাজ (Plane)' } },
    { symbol: '☀️', names: { en: 'Sun', hi: 'सूरज (Sun)', as: 'সূৰ্য (Sun)' } },
    { symbol: '🎨', names: { en: 'Color Palette', hi: 'रंग (Colors)', as: 'ৰং পেলেট (Colors)' } },
    { symbol: '🍕', names: { en: 'Pizza', hi: 'पिज़्ज़ा (Pizza)', as: 'পিজ্জা (Pizza)' } },
    { symbol: '💎', names: { en: 'Diamond', hi: 'हीरा (Diamond)', as: 'হীৰা (Diamond)' } }
  ];

  // ==========================================
  // 4. SOUND & VOICE ENGINES
  // ==========================================
  class SoundSynthesizer {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setMuted(muted) {
      this.isMuted = muted;
    }

    playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1, delay = 0) {
      if (this.isMuted) return;
      try {
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(gainVal, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      } catch (e) {}
    }

    playFlip() {
      this.playTone(480, 'sine', 0.08, 0.15);
    }

    playMatch() {
      this.playTone(523.25, 'triangle', 0.22, 0.18, 0.0);   // C5
      this.playTone(659.25, 'triangle', 0.22, 0.18, 0.08);  // E5
      this.playTone(783.99, 'triangle', 0.32, 0.20, 0.16);  // G5
    }

    playMismatch() {
      this.playTone(349.23, 'sine', 0.18, 0.12, 0.0);   // F4
      this.playTone(293.66, 'sine', 0.22, 0.12, 0.12);  // D4
    }

    playVictory() {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', 0.35, 0.18, idx * 0.12);
      });
    }

    playButtonClick() {
      this.playTone(600, 'sine', 0.05, 0.08);
    }
  }

  class VoiceAssistant {
    constructor() {
      this.enabled = true;
      this.lang = 'en-IN';
    }

    setEnabled(val) {
      this.enabled = val;
    }

    setLanguage(langCode) {
      if (langCode === 'hi') this.lang = 'hi-IN';
      else if (langCode === 'as') this.lang = 'as-IN';
      else this.lang = 'en-IN';
    }

    speak(text) {
      if (!this.enabled || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.lang;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  // ==========================================
  // 5. CORE GAME ENGINE
  // ==========================================
  class MemoryGameEngine {
    constructor() {
      this.sound = new SoundSynthesizer();
      this.voice = new VoiceAssistant();

      this.state = {
        currentLang: 'en',
        currentDifficulty: 'medium',
        cards: [],
        flippedIndices: [],
        matchedPairsCount: 0,
        totalPairsCount: 6,
        movesCount: 0,
        isLocked: false,
        startTime: null,
        lastFlipTime: null,
        responseLatencies: [],
        elapsedSeconds: 0,
        timerIntervalId: null,
        soundEnabled: true,
        voiceEnabled: true,
        highScore: 0,
        totalGamesPlayed: 0,
        lastTelemetry: null
      };

      this.elements = {};
    }

    init() {
      this.cacheDOMElements();
      this.loadStoredData();
      this.bindEvents();
      this.applyLocalization();
      this.updateStartScreenStats();
      this.showScreen('start-screen');
      this.registerGlobalSDK();
    }

    cacheDOMElements() {
      this.elements = {
        // Screens
        startScreen: document.getElementById('start-screen'),
        playScreen: document.getElementById('play-screen'),
        resultScreen: document.getElementById('result-screen'),

        // Header controls
        soundToggleBtn: document.getElementById('sound-toggle-btn'),
        voiceToggleBtn: document.getElementById('voice-toggle-btn'),
        langSelect: document.getElementById('lang-select'),

        // Start screen
        readInstructionsBtn: document.getElementById('read-instructions-btn'),
        startDifficultyBadge: document.getElementById('start-difficulty-badge'),
        startDifficultyDesc: document.getElementById('start-difficulty-desc'),
        startBtn: document.getElementById('start-game-btn'),
        difficultySelect: document.getElementById('difficulty-select'),
        statBestScore: document.getElementById('stat-best-score'),
        statTotalGames: document.getElementById('stat-total-games'),

        // Play screen
        playDifficultyBadge: document.getElementById('play-difficulty-badge'),
        remainingPairsText: document.getElementById('remaining-pairs-text'),
        movesCounterText: document.getElementById('moves-counter-text'),
        timerText: document.getElementById('timer-text'),
        avgLatencyText: document.getElementById('avg-latency-text'),
        gameGrid: document.getElementById('game-grid'),
        restartLevelBtn: document.getElementById('restart-level-btn'),
        playBackMenuBtn: document.getElementById('play-back-menu-btn'),

        // Result screen
        resultTitle: document.getElementById('result-title'),
        resultSummaryText: document.getElementById('result-summary-text'),
        resultTotalScore: document.getElementById('result-total-score'),
        resultAccuracy: document.getElementById('result-accuracy'),
        resultCorrectAnswers: document.getElementById('result-correct-answers'),
        resultIncorrectAnswers: document.getElementById('result-incorrect-answers'),
        resultTimeTaken: document.getElementById('result-time-taken'),
        resultTotalMoves: document.getElementById('result-total-moves'),
        resultAvgLatency: document.getElementById('result-avg-latency'),
        
        // Adaptive feedback
        adaptiveRuleBadge: document.getElementById('adaptive-rule-badge'),
        adaptiveMessageText: document.getElementById('adaptive-message-text'),
        adaptiveNextDiffBadge: document.getElementById('adaptive-next-diff-badge'),
        caregiverTelemetryJson: document.getElementById('caregiver-telemetry-json'),

        // Action buttons
        playNextBtn: document.getElementById('play-next-btn'),
        replayLevelBtn: document.getElementById('replay-level-btn'),
        resultMenuBtn: document.getElementById('result-menu-btn'),

        // Confetti canvas
        confettiCanvas: document.getElementById('confetti-canvas')
      };
    }

    loadStoredData() {
      const storedLang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (storedLang && I18N[storedLang]) {
        this.state.currentLang = storedLang;
      }
      if (this.elements.langSelect) {
        this.elements.langSelect.value = this.state.currentLang;
      }
      this.voice.setLanguage(this.state.currentLang);

      const storedDiff = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
      if (storedDiff && DIFFICULTY_CONFIG[storedDiff]) {
        this.state.currentDifficulty = storedDiff;
      } else {
        this.state.currentDifficulty = 'medium';
        localStorage.setItem(STORAGE_KEYS.DIFFICULTY, 'medium');
      }

      this.state.soundEnabled = localStorage.getItem(STORAGE_KEYS.SOUND_FX) !== 'false';
      this.sound.setMuted(!this.state.soundEnabled);
      this.updateSoundButtonUI();

      this.state.voiceEnabled = localStorage.getItem(STORAGE_KEYS.VOICE_GUIDE) !== 'false';
      this.voice.setEnabled(this.state.voiceEnabled);
      this.updateVoiceButtonUI();

      const storedScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      this.state.highScore = storedScore ? parseInt(storedScore, 10) : 0;

      const storedGames = localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED);
      this.state.totalGamesPlayed = storedGames ? parseInt(storedGames, 10) : 0;
    }

    bindEvents() {
      // Language Change
      if (this.elements.langSelect) {
        this.elements.langSelect.addEventListener('change', (e) => {
          this.setLanguage(e.target.value);
        });
      }

      // Audio & Voice Toggles
      if (this.elements.soundToggleBtn) {
        this.elements.soundToggleBtn.addEventListener('click', () => this.toggleSound());
      }
      if (this.elements.voiceToggleBtn) {
        this.elements.voiceToggleBtn.addEventListener('click', () => this.toggleVoice());
      }

      // Read Instructions Audio Button
      if (this.elements.readInstructionsBtn) {
        this.elements.readInstructionsBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          const strings = I18N[this.state.currentLang] || I18N.en;
          this.voice.speak(strings.voiceGuideSpoken);
        });
      }

      // Start Screen
      if (this.elements.startBtn) {
        this.elements.startBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.startNewGame();
        });
      }

      if (this.elements.difficultySelect) {
        this.elements.difficultySelect.value = this.state.currentDifficulty;
        this.elements.difficultySelect.addEventListener('change', (e) => {
          this.setDifficulty(e.target.value, false);
          this.sound.playButtonClick();
        });
      }

      // Play Screen
      if (this.elements.restartLevelBtn) {
        this.elements.restartLevelBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.restartCurrentLevel();
        });
      }

      if (this.elements.playBackMenuBtn) {
        this.elements.playBackMenuBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.stopTimer();
          this.updateStartScreenStats();
          this.showScreen('start-screen');
        });
      }

      // Result Screen
      if (this.elements.playNextBtn) {
        this.elements.playNextBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.startNewGame();
        });
      }

      if (this.elements.replayLevelBtn) {
        this.elements.replayLevelBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.restartCurrentLevel();
        });
      }

      if (this.elements.resultMenuBtn) {
        this.elements.resultMenuBtn.addEventListener('click', () => {
          this.sound.playButtonClick();
          this.updateStartScreenStats();
          this.showScreen('start-screen');
        });
      }

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key === 'm' || e.key === 'M') this.toggleSound();
        if (e.key === 'v' || e.key === 'V') this.toggleVoice();
      });
    }

    setLanguage(langCode) {
      if (!I18N[langCode]) return;
      this.state.currentLang = langCode;
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, langCode);
      this.voice.setLanguage(langCode);
      this.applyLocalization();
      this.updateDifficultyDisplay();
    }

    applyLocalization() {
      const strings = I18N[this.state.currentLang] || I18N.en;
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (strings[key]) {
          el.textContent = strings[key];
        }
      });
      this.updateSoundButtonUI();
      this.updateVoiceButtonUI();
    }

    showScreen(screenId) {
      const screens = [
        this.elements.startScreen,
        this.elements.playScreen,
        this.elements.resultScreen
      ];

      screens.forEach(screen => {
        if (!screen) return;
        if (screen.id === screenId) {
          screen.classList.remove('hidden');
          screen.setAttribute('aria-hidden', 'false');
          const firstFocusable = screen.querySelector('button, select, [tabindex="0"]');
          if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 60);
          }
        } else {
          screen.classList.add('hidden');
          screen.setAttribute('aria-hidden', 'true');
        }
      });
    }

    setDifficulty(diffKey, triggerUpdate = true) {
      if (!DIFFICULTY_CONFIG[diffKey]) return;
      this.state.currentDifficulty = diffKey;
      localStorage.setItem(STORAGE_KEYS.DIFFICULTY, diffKey);
      
      if (this.elements.difficultySelect) {
        this.elements.difficultySelect.value = diffKey;
      }
      this.updateDifficultyDisplay();

      window.dispatchEvent(new CustomEvent('sahaayamind:difficulty_changed', {
        detail: { game: 'memory_match', difficulty: diffKey }
      }));
    }

    updateDifficultyDisplay() {
      const config = DIFFICULTY_CONFIG[this.state.currentDifficulty];
      if (!config) return;

      const lang = this.state.currentLang;
      const name = config.name[lang] || config.name.en;
      const desc = config.description[lang] || config.description.en;

      if (this.elements.startDifficultyBadge) {
        this.elements.startDifficultyBadge.textContent = name;
        this.elements.startDifficultyBadge.className = `difficulty-badge ${config.badgeClass}`;
      }
      if (this.elements.startDifficultyDesc) {
        this.elements.startDifficultyDesc.textContent = desc;
      }
      if (this.elements.playDifficultyBadge) {
        this.elements.playDifficultyBadge.textContent = name;
        this.elements.playDifficultyBadge.className = `difficulty-badge ${config.badgeClass}`;
      }
    }

    updateStartScreenStats() {
      this.updateDifficultyDisplay();
      if (this.elements.statBestScore) {
        this.elements.statBestScore.textContent = this.state.highScore.toLocaleString();
      }
      if (this.elements.statTotalGames) {
        this.elements.statTotalGames.textContent = this.state.totalGamesPlayed.toString();
      }
    }

    toggleSound() {
      this.state.soundEnabled = !this.state.soundEnabled;
      this.sound.setMuted(!this.state.soundEnabled);
      localStorage.setItem(STORAGE_KEYS.SOUND_FX, this.state.soundEnabled.toString());
      this.updateSoundButtonUI();
      if (this.state.soundEnabled) this.sound.playButtonClick();
    }

    updateSoundButtonUI() {
      if (!this.elements.soundToggleBtn) return;
      const strings = I18N[this.state.currentLang] || I18N.en;
      const isMuted = !this.state.soundEnabled;
      this.elements.soundToggleBtn.setAttribute('aria-pressed', isMuted ? 'false' : 'true');
      this.elements.soundToggleBtn.innerHTML = isMuted 
        ? `<span class="icon" aria-hidden="true">🔇</span> ${strings.soundOff}`
        : `<span class="icon" aria-hidden="true">🔊</span> ${strings.soundOn}`;
      this.elements.soundToggleBtn.classList.toggle('muted', isMuted);
    }

    toggleVoice() {
      this.state.voiceEnabled = !this.state.voiceEnabled;
      this.voice.setEnabled(this.state.voiceEnabled);
      localStorage.setItem(STORAGE_KEYS.VOICE_GUIDE, this.state.voiceEnabled.toString());
      this.updateVoiceButtonUI();
      if (this.state.voiceEnabled) {
        const welcome = this.state.currentLang === 'hi' 
          ? 'आवाज मार्गदर्शन चालू है' 
          : this.state.currentLang === 'as' 
            ? 'মাত মাৰ্গদৰ্শন অন হ’ল' 
            : 'Voice guide activated.';
        this.voice.speak(welcome);
      }
    }

    updateVoiceButtonUI() {
      if (!this.elements.voiceToggleBtn) return;
      const strings = I18N[this.state.currentLang] || I18N.en;
      const isMuted = !this.state.voiceEnabled;
      this.elements.voiceToggleBtn.setAttribute('aria-pressed', isMuted ? 'false' : 'true');
      this.elements.voiceToggleBtn.innerHTML = isMuted 
        ? `<span class="icon" aria-hidden="true">🤐</span> ${strings.voiceOff}`
        : `<span class="icon" aria-hidden="true">🗣️</span> ${strings.voiceOn}`;
      this.elements.voiceToggleBtn.classList.toggle('muted', isMuted);
    }

    // ==========================================
    // 6. GAMEPLAY & GRID MANAGEMENT
    // ==========================================

    startNewGame() {
      const config = DIFFICULTY_CONFIG[this.state.currentDifficulty];
      this.state.totalPairsCount = config.pairs;
      this.state.matchedPairsCount = 0;
      this.state.movesCount = 0;
      this.state.flippedIndices = [];
      this.state.isLocked = false;
      this.state.elapsedSeconds = 0;
      this.state.responseLatencies = [];
      this.state.lastFlipTime = Date.now();

      this.stopTimer();
      this.updatePlayHeader();
      this.buildCardDeck(config.pairs);
      this.renderGrid(config);

      this.showScreen('play-screen');
      this.startTimer();

      const startPrompt = this.state.currentLang === 'hi'
        ? `खेल शुरू! ${config.pairs} जोड़ियां खोजें।`
        : this.state.currentLang === 'as'
          ? `খেল আৰম্ভ! ${config.pairs} টা জোৰা মিলাওক।`
          : `Game started. Find ${config.pairs} matching pairs.`;
      this.voice.speak(startPrompt);
    }

    restartCurrentLevel() {
      this.startNewGame();
    }

    buildCardDeck(pairsCount) {
      const shuffledBank = [...EMOJI_BANK].sort(() => 0.5 - Math.random());
      const selectedEmojis = shuffledBank.slice(0, pairsCount);
      const lang = this.state.currentLang;

      let deck = [];
      selectedEmojis.forEach((item, pairIndex) => {
        const cardName = item.names[lang] || item.names.en;
        deck.push({
          id: `card-${pairIndex}-a`,
          pairId: pairIndex,
          symbol: item.symbol,
          name: cardName,
          spokenName: item.names.en,
          isFlipped: false,
          isMatched: false
        });
        deck.push({
          id: `card-${pairIndex}-b`,
          pairId: pairIndex,
          symbol: item.symbol,
          name: cardName,
          spokenName: item.names.en,
          isFlipped: false,
          isMatched: false
        });
      });

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      this.state.cards = deck;
    }

    renderGrid(config) {
      const grid = this.elements.gameGrid;
      if (!grid) return;

      grid.innerHTML = '';
      grid.className = 'game-grid';
      grid.dataset.difficulty = config.id;
      grid.dataset.cards = this.state.cards.length;

      this.state.cards.forEach((card, index) => {
        const cardBtn = document.createElement('button');
        cardBtn.type = 'button';
        cardBtn.className = 'memory-card';
        cardBtn.id = `card-elem-${index}`;
        cardBtn.dataset.index = index;
        cardBtn.setAttribute('aria-label', `Card ${index + 1}, Hidden`);
        cardBtn.setAttribute('role', 'button');
        cardBtn.tabIndex = 0;

        cardBtn.innerHTML = `
          <div class="card-inner">
            <div class="card-back" aria-hidden="true">
              <span class="card-back-crest">✨</span>
              <span class="card-back-text">Match</span>
            </div>
            <div class="card-front" aria-hidden="true">
              <span class="card-emoji">${card.symbol}</span>
              <span class="card-label">${card.name}</span>
            </div>
          </div>
        `;

        cardBtn.addEventListener('click', () => this.handleCardClick(index));
        grid.appendChild(cardBtn);
      });
    }

    handleCardClick(index) {
      if (this.state.isLocked) return;

      const card = this.state.cards[index];
      const cardElem = document.getElementById(`card-elem-${index}`);

      if (!card || card.isFlipped || card.isMatched) return;

      const now = Date.now();
      if (this.state.lastFlipTime && this.state.flippedIndices.length === 0) {
        const latency = (now - this.state.lastFlipTime) / 1000;
        this.state.responseLatencies.push(latency);
      }
      this.state.lastFlipTime = now;

      card.isFlipped = true;
      this.state.flippedIndices.push(index);

      if (cardElem) {
        cardElem.classList.add('flipped');
        cardElem.setAttribute('aria-label', `Card ${index + 1}, ${card.name}`);
      }

      this.sound.playFlip();
      this.voice.speak(card.name);

      if (this.state.flippedIndices.length === 2) {
        this.state.movesCount++;
        this.updatePlayHeader();
        this.evaluatePair();
      }
    }

    evaluatePair() {
      this.state.isLocked = true;
      const [firstIdx, secondIdx] = this.state.flippedIndices;
      const cardA = this.state.cards[firstIdx];
      const cardB = this.state.cards[secondIdx];

      const elemA = document.getElementById(`card-elem-${firstIdx}`);
      const elemB = document.getElementById(`card-elem-${secondIdx}`);

      const isMatch = cardA.pairId === cardB.pairId;

      if (isMatch) {
        cardA.isMatched = true;
        cardB.isMatched = true;
        this.state.matchedPairsCount++;

        setTimeout(() => {
          if (elemA) elemA.classList.add('matched');
          if (elemB) elemB.classList.add('matched');
          
          this.sound.playMatch();
          this.updatePlayHeader();

          this.state.flippedIndices = [];
          this.state.isLocked = false;

          if (this.state.matchedPairsCount === this.state.totalPairsCount) {
            this.handleGameWin();
          }
        }, 320);

      } else {
        setTimeout(() => {
          if (elemA) elemA.classList.add('mismatch');
          if (elemB) elemB.classList.add('mismatch');
          this.sound.playMismatch();

          setTimeout(() => {
            if (elemA) elemA.classList.remove('flipped', 'mismatch');
            if (elemB) elemB.classList.remove('flipped', 'mismatch');
            
            cardA.isFlipped = false;
            cardB.isFlipped = false;

            this.state.flippedIndices = [];
            this.state.isLocked = false;
          }, 950);
        }, 380);
      }
    }

    updatePlayHeader() {
      if (this.elements.remainingPairsText) {
        this.elements.remainingPairsText.textContent = `${this.state.matchedPairsCount} / ${this.state.totalPairsCount}`;
      }
      if (this.elements.movesCounterText) {
        this.elements.movesCounterText.textContent = this.state.movesCount.toString();
      }
      if (this.elements.avgLatencyText) {
        const avg = this.computeAverageLatency();
        this.elements.avgLatencyText.textContent = `${avg}s`;
      }
    }

    computeAverageLatency() {
      if (this.state.responseLatencies.length === 0) return '0.0';
      const sum = this.state.responseLatencies.reduce((a, b) => a + b, 0);
      return (sum / this.state.responseLatencies.length).toFixed(1);
    }

    startTimer() {
      this.state.startTime = Date.now();
      this.state.elapsedSeconds = 0;
      this.updateTimerDisplay();

      this.state.timerIntervalId = setInterval(() => {
        this.state.elapsedSeconds++;
        this.updateTimerDisplay();
      }, 1000);
    }

    stopTimer() {
      if (this.state.timerIntervalId) {
        clearInterval(this.state.timerIntervalId);
        this.state.timerIntervalId = null;
      }
    }

    updateTimerDisplay() {
      if (!this.elements.timerText) return;
      const mins = Math.floor(this.state.elapsedSeconds / 60);
      const secs = this.state.elapsedSeconds % 60;
      this.elements.timerText.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // ==========================================
    // 7. SCORING & ADAPTIVE DIFFICULTY
    // ==========================================

    handleGameWin() {
      this.stopTimer();
      this.sound.playVictory();
      this.triggerConfetti();

      const config = DIFFICULTY_CONFIG[this.state.currentDifficulty];
      const totalPairs = this.state.totalPairsCount;
      const moves = Math.max(totalPairs, this.state.movesCount);

      const rawAccuracy = (totalPairs / moves) * 100;
      const accuracy = Math.min(100, Math.max(1, Math.round(rawAccuracy)));

      const correctAnswers = totalPairs;
      const incorrectAnswers = Math.max(0, moves - totalPairs);
      const avgLatencySec = parseFloat(this.computeAverageLatency());

      const baseScore = totalPairs * 200;
      const accuracyBonus = Math.round(accuracy * 15);
      const timeBonus = Math.max(0, Math.round((config.timeTarget - this.state.elapsedSeconds) * 8));
      const totalScore = Math.round((baseScore + accuracyBonus + timeBonus) * config.multiplier);

      const adaptiveResult = this.computeAdaptiveProgression(accuracy);
      this.setDifficulty(adaptiveResult.nextDifficulty, false);

      this.state.totalGamesPlayed++;
      if (totalScore > this.state.highScore) {
        this.state.highScore = totalScore;
        localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, totalScore.toString());
      }
      localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED, this.state.totalGamesPlayed.toString());

      const telemetryRecord = {
        platform: 'SahaayaMind',
        team_id: 'AI006-Arbalest',
        game_type: 'memory_match',
        session_id: `sess_${Date.now()}`,
        timestamp: new Date().toISOString(),
        language: this.state.currentLang,
        difficulty_level: this.state.currentDifficulty,
        next_difficulty_level: adaptiveResult.nextDifficulty,
        metrics: {
          accuracy_percentage: accuracy,
          response_time_seconds: avgLatencySec,
          attempts: moves,
          errors: incorrectAnswers,
          correct_matches: correctAnswers,
          completion_rate: 100,
          total_duration_seconds: this.state.elapsedSeconds,
          score: totalScore
        },
        adaptive_decision: {
          rule_applied: accuracy >= 80 ? 'accuracy >= 80%' : accuracy < 50 ? 'accuracy < 50%' : '50% <= accuracy < 80%',
          action: adaptiveResult.actionType,
          reason: adaptiveResult.explanation
        }
      };

      this.state.lastTelemetry = telemetryRecord;
      this.persistTelemetry(telemetryRecord);

      this.renderResultScreen({
        totalScore,
        accuracy,
        correctAnswers,
        incorrectAnswers,
        moves,
        timeSeconds: this.state.elapsedSeconds,
        avgLatencySec,
        adaptiveResult,
        telemetryRecord
      });

      const voiceResult = this.state.currentLang === 'hi'
        ? `बधाई हो! सटीकता ${accuracy} प्रतिशत। स्कोर ${totalScore}।`
        : this.state.currentLang === 'as'
          ? `অভিনন্দন! সঠিকতা ${accuracy} শতাংশ। স্ক’ৰ ${totalScore}।`
          : `Great job! Accuracy ${accuracy} percent. Total score ${totalScore}.`;
      this.voice.speak(voiceResult);

      setTimeout(() => {
        this.showScreen('result-screen');
      }, 500);
    }

    computeAdaptiveProgression(accuracy) {
      const currentDiff = this.state.currentDifficulty;
      const currentIndex = DIFFICULTY_ORDER.indexOf(currentDiff);
      const lang = this.state.currentLang;
      let nextDifficulty = currentDiff;
      let actionType = 'stay';
      let badgeText = '● Steady Pace';
      let explanation = '';

      if (accuracy >= 80) {
        if (currentIndex < DIFFICULTY_ORDER.length - 1) {
          nextDifficulty = DIFFICULTY_ORDER[currentIndex + 1];
          actionType = 'promoted';
          badgeText = '▲ Level Up!';
          explanation = lang === 'hi'
            ? `उच्च सटीकता (${accuracy}% ≥ 80%) के कारण कठिनाई का स्तर बढ़ाकर ${DIFFICULTY_CONFIG[nextDifficulty].name[lang]} कर दिया गया है!`
            : lang === 'as'
              ? `উচ্চ সঠিকতাৰ বাবে (${accuracy}% ≥ 80%) পৰৱৰ্তী স্তৰ ${DIFFICULTY_CONFIG[nextDifficulty].name[lang]} লৈ বৃদ্ধি কৰা হ’ল!`
              : `High accuracy of ${accuracy}% (≥ 80%) unlocked ${DIFFICULTY_CONFIG[nextDifficulty].name.en} (${DIFFICULTY_CONFIG[nextDifficulty].pairs} pairs) for your next round!`;
        } else {
          actionType = 'max_tier';
          badgeText = '★ Master Level';
          explanation = `Outstanding ${accuracy}% accuracy! You have reached the peak Expert tier.`;
        }
      } else if (accuracy < 50) {
        if (currentIndex > 0) {
          nextDifficulty = DIFFICULTY_ORDER[currentIndex - 1];
          actionType = 'demoted';
          badgeText = '▼ Calibrating';
          explanation = lang === 'hi'
            ? `सटीकता ${accuracy}% रही। आत्मविश्वास और सरलता के लिए स्तर ${DIFFICULTY_CONFIG[nextDifficulty].name[lang]} पर सेट किया गया है।`
            : lang === 'as'
              ? `সঠিকতা ${accuracy}% আছিল। সহজ আৰু সুবিধাজনক কৰিবলৈ স্তৰ ${DIFFICULTY_CONFIG[nextDifficulty].name[lang]} কৰা হ’ল।`
              : `Accuracy was ${accuracy}% (< 50%). Difficulty adjusted to ${DIFFICULTY_CONFIG[nextDifficulty].name.en} (${DIFFICULTY_CONFIG[nextDifficulty].pairs} pairs) for smooth practice.`;
        } else {
          actionType = 'min_tier';
          badgeText = '● Comfort Zone';
          explanation = `Continuing on Easy level to build confidence and steady visual recall.`;
        }
      } else {
        actionType = 'stay';
        badgeText = '● Steady Pace';
        explanation = lang === 'hi'
          ? `सटीकता ${accuracy}% (50%–79%) रही। वर्तमान स्तर ${DIFFICULTY_CONFIG[currentDiff].name[lang]} पर अभ्यास जारी रहेगा।`
          : lang === 'as'
            ? `সঠিকতা ${accuracy}% (৫০%–৭৯%) আছিল। বৰ্তমান স্তৰ ${DIFFICULTY_CONFIG[currentDiff].name[lang]} ত বাহাল ৰখা হ’ল।`
            : `Balanced accuracy of ${accuracy}% (50%–79%). Maintaining ${DIFFICULTY_CONFIG[currentDiff].name.en} to reinforce steady memory.`;
      }

      return {
        currentDifficulty: currentDiff,
        nextDifficulty: nextDifficulty,
        actionType: actionType,
        badgeText: badgeText,
        explanation: explanation
      };
    }

    persistTelemetry(record) {
      try {
        let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.GAMEPLAY_HISTORY) || '[]');
        history.unshift(record);
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.GAMEPLAY_HISTORY, JSON.stringify(history));

        let profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.COGNITIVE_PROFILE) || '{}');
        profile.total_sessions = (profile.total_sessions || 0) + 1;
        profile.last_accuracy = record.metrics.accuracy_percentage;
        profile.last_response_time = record.metrics.response_time_seconds;
        profile.current_difficulty = record.next_difficulty_level;
        profile.last_played = record.timestamp;
        localStorage.setItem(STORAGE_KEYS.COGNITIVE_PROFILE, JSON.stringify(profile));

        window.dispatchEvent(new CustomEvent('sahaayamind:gameplay_recorded', {
          detail: record
        }));
      } catch (err) {}
    }

    renderResultScreen(data) {
      const strings = I18N[this.state.currentLang] || I18N.en;
      const lang = this.state.currentLang;

      if (this.elements.resultTitle) {
        this.elements.resultTitle.textContent = strings.congrats;
      }
      if (this.elements.resultSummaryText) {
        this.elements.resultSummaryText.textContent = data.accuracy >= 80 
          ? strings.summaryHigh 
          : data.accuracy >= 50 
            ? strings.summaryMed 
            : strings.summaryLow;
      }

      if (this.elements.resultTotalScore) {
        this.elements.resultTotalScore.textContent = data.totalScore.toLocaleString();
      }
      if (this.elements.resultAccuracy) {
        this.elements.resultAccuracy.textContent = `${data.accuracy}%`;
      }
      if (this.elements.resultCorrectAnswers) {
        this.elements.resultCorrectAnswers.textContent = `${data.correctAnswers} pairs`;
      }
      if (this.elements.resultIncorrectAnswers) {
        this.elements.resultIncorrectAnswers.textContent = `${data.incorrectAnswers} misses`;
      }
      if (this.elements.resultTotalMoves) {
        this.elements.resultTotalMoves.textContent = `${data.moves} moves`;
      }
      if (this.elements.resultAvgLatency) {
        this.elements.resultAvgLatency.textContent = `${data.avgLatencySec}s`;
      }
      if (this.elements.resultTimeTaken) {
        const mins = Math.floor(data.timeSeconds / 60);
        const secs = data.timeSeconds % 60;
        this.elements.resultTimeTaken.textContent = `${mins}m ${secs}s`;
      }

      const adapt = data.adaptiveResult;
      const nextConfig = DIFFICULTY_CONFIG[adapt.nextDifficulty];
      const nextName = nextConfig.name[lang] || nextConfig.name.en;

      if (this.elements.adaptiveRuleBadge) {
        this.elements.adaptiveRuleBadge.textContent = adapt.badgeText;
        this.elements.adaptiveRuleBadge.className = `adaptive-badge ${adapt.actionType}`;
      }
      if (this.elements.adaptiveMessageText) {
        this.elements.adaptiveMessageText.textContent = adapt.explanation;
      }
      if (this.elements.adaptiveNextDiffBadge && nextConfig) {
        this.elements.adaptiveNextDiffBadge.textContent = `Next Round: ${nextName} (${nextConfig.pairs} Pairs)`;
        this.elements.adaptiveNextDiffBadge.className = `next-diff-badge ${nextConfig.badgeClass}`;
      }

      if (this.elements.caregiverTelemetryJson) {
        this.elements.caregiverTelemetryJson.textContent = JSON.stringify(data.telemetryRecord, null, 2);
      }
    }

    triggerConfetti() {
      const canvas = this.elements.confettiCanvas;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.display = 'block';

      const particles = [];
      const colors = ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#8b5cf6', '#ffffff'];

      for (let i = 0; i < 60; i++) {
        particles.push({
          x: canvas.width * 0.5 + (Math.random() * 200 - 100),
          y: canvas.height * 0.3 + (Math.random() * 100 - 50),
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * -10 - 4,
          size: Math.random() * 10 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      let frame = 0;
      const maxFrames = 90;

      function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.35;
          p.rotation += p.rotSpeed;
          p.opacity -= 0.012;

          if (p.opacity > 0) {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.opacity);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
          }
        });

        frame++;
        if (frame < maxFrames) {
          requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.style.display = 'none';
        }
      }

      render();
    }

    registerGlobalSDK() {
      window.SahaayaMind.MemoryGame = {
        getInstance: () => this,
        getHistory: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.GAMEPLAY_HISTORY) || '[]'),
        getCognitiveProfile: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.COGNITIVE_PROFILE) || '{}'),
        getLastTelemetry: () => this.state.lastTelemetry,
        setDifficulty: (level) => this.setDifficulty(level),
        setLanguage: (lang) => this.setLanguage(lang),
        getDifficulty: () => this.state.currentDifficulty
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.MemoryGameApp = new MemoryGameEngine();
    window.MemoryGameApp.init();
  });

})();
