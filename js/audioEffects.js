/* ==========================================================================
   SahaayaMind - Zero-Dependency Web Audio Synthesizer
   Gentle, Accessible Chimes & Audio Cues for Seniors
   ========================================================================== */

(function () {
  'use strict';

  let audioCtx = null;
  let soundEnabled = true;

  // Read sound preference from localStorage
  try {
    const saved = localStorage.getItem('sahaaya_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch (e) {}

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  const SahaayaAudio = {
    isEnabled: function () {
      return soundEnabled;
    },

    setSoundEnabled: function (enabled) {
      soundEnabled = !!enabled;
      try {
        localStorage.setItem('sahaaya_sound_enabled', String(soundEnabled));
      } catch (e) {}
      this.updateToggleButtons();
    },

    toggleSound: function () {
      this.setSoundEnabled(!soundEnabled);
      if (soundEnabled) {
        this.playMatch();
      }
      return soundEnabled;
    },

    updateToggleButtons: function () {
      document.querySelectorAll('.js-sound-toggle-btn').forEach(btn => {
        btn.setAttribute('aria-pressed', String(soundEnabled));
        btn.innerHTML = soundEnabled 
          ? '<span aria-hidden="true">🔊</span> Sound: ON'
          : '<span aria-hidden="true">🔇</span> Sound: OFF';
        btn.title = soundEnabled ? "Game Sound: Active (Click to mute)" : "Game Sound: Muted (Click to turn on)";
      });
    },

    // 1. Soft Wooden Tactile Click (Card Flip)
    playFlip: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    },

    // 2. Harmonious Gentle Two-Tone Chime (Pair Matched / Target Found)
    playMatch: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Note 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: G5 (783.99 Hz) with slight delay for musical melody
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.1);
      gain2.gain.setValueAtTime(0.2, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.52);
    },

    // 3. Gentle Low Bubble Tone (Distractor / Missed Match - Non-punitive)
    playMiss: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(170, now + 0.14);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    },

    // 4. Celebratory Chord Fanfare (Level Completed & Unlocked)
    playLevelClear: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const start = now + (idx * 0.11);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.68);
      });
    }
  };

  // Expose globally
  window.SahaayaAudio = SahaayaAudio;

  // Initialize toggle buttons if present on page load
  document.addEventListener('DOMContentLoaded', () => {
    SahaayaAudio.updateToggleButtons();

    // Auto-bind clicks to audio resume
    const resumeOnInteraction = () => {
      getAudioContext();
      window.removeEventListener('click', resumeOnInteraction);
      window.removeEventListener('touchstart', resumeOnInteraction);
    };
    window.addEventListener('click', resumeOnInteraction, { once: true });
    window.addEventListener('touchstart', resumeOnInteraction, { once: true });
  });

})();
