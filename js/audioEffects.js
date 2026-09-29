/* ==========================================================================
   SahaayaMind - Advanced High-Fidelity Web Audio Synthesizer
   Vibrant, punchy, arcade-grade chimes & tactile sound effects
   Engineered with FM Synthesis, Harmonics & Dynamic Compression
   ========================================================================== */

(function () {
  'use strict';

  let audioCtx = null;
  let masterGain = null;
  let compressor = null;
  let soundEnabled = true;

  // Persisted audio volume preference (Loud & crisp by default: 0.85)
  let masterVolume = 0.85;

  try {
    const saved = localStorage.getItem('sahaaya_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
  } catch (e) {}

  function initAudioNodes() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if (!masterGain) {
        // Dynamics compressor makes sound loud, punchy, and prevents distortion
        compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
        compressor.knee.setValueAtTime(8, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.18, audioCtx.currentTime);

        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(soundEnabled ? masterVolume : 0, audioCtx.currentTime);

        compressor.connect(masterGain);
        masterGain.connect(audioCtx.destination);
      }
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

      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(soundEnabled ? masterVolume : 0, audioCtx.currentTime);
      }
      this.updateToggleButtons();
    },

    toggleSound: function () {
      initAudioNodes();
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

    /* =========================================================================
       1. CRISP TACTILE CARD FLIP (Hearthstone / Casino Snap & Swish)
       Combines highpass paper friction with snappy wooden transient pop
       ========================================================================= */
    playFlip: function () {
      if (!soundEnabled) return;
      const ctx = initAudioNodes();
      if (!ctx || !compressor) return;

      const now = ctx.currentTime;

      // 1. Friction Paper Swish (High-pass filtered noise burst)
      const bufferSize = ctx.sampleRate * 0.045; // 45ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1800, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(compressor);
      noise.start(now);

      // 2. Snappy Click Pop Transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();

      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(950, now);
      clickOsc.frequency.exponentialRampToValueAtTime(220, now + 0.038);

      clickGain.gain.setValueAtTime(0.42, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      clickOsc.connect(clickGain);
      clickGain.connect(compressor);

      clickOsc.start(now);
      clickOsc.stop(now + 0.045);
    },

    /* =========================================================================
       2. SPARKLING CRYSTAL MATCH CHIME (Duolingo / Candy Crush Style)
       Ascending rich 4-bell arpeggio (G5 -> C6 -> E6 -> G6) with harmonic sparkle
       ========================================================================= */
    playMatch: function () {
      if (!soundEnabled) return;
      const ctx = initAudioNodes();
      if (!ctx || !compressor) return;

      const now = ctx.currentTime;
      // Rising major triad arpeggio: G5, C6, E6, G6
      const notes = [
        { freq: 783.99, time: 0.00, dur: 0.38 }, // G5
        { freq: 1046.50, time: 0.08, dur: 0.42 }, // C6
        { freq: 1318.51, time: 0.16, dur: 0.48 }, // E6
        { freq: 1567.98, time: 0.24, dur: 0.65 }  // G6 (High Bell Ring)
      ];

      notes.forEach((note, idx) => {
        const start = now + note.time;

        // Fundamental Bell Tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, start);

        gain.gain.setValueAtTime(0.48, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.dur);

        osc.connect(gain);
        gain.connect(compressor);
        osc.start(start);
        osc.stop(start + note.dur);

        // Harmonic Metallic Shimmer (2.76x frequency for physical chime resonance)
        const shimmer = ctx.createOscillator();
        const shimmerGain = ctx.createGain();

        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(note.freq * 2.76, start);

        shimmerGain.gain.setValueAtTime(0.22, start);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, start + (note.dur * 0.55));

        shimmer.connect(shimmerGain);
        shimmerGain.connect(compressor);
        shimmer.start(start);
        shimmer.stop(start + note.dur * 0.6);
      });

      // Extra high glitter sparkle on peak
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.setValueAtTime(2093.00, now + 0.3); // C7 sparkle
      sparkleGain.gain.setValueAtTime(0.28, now + 0.3);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      sparkle.connect(sparkleGain);
      sparkleGain.connect(compressor);
      sparkle.start(now + 0.3);
      sparkle.stop(now + 0.7);
    },

    /* =========================================================================
       3. PLAYFUL DOUBLE MARIMBA BONK (Distractor / Missed Match)
       Quirky, soft wooden bounce instead of a dull beep
       ========================================================================= */
    playMiss: function () {
      if (!soundEnabled) return;
      const ctx = initAudioNodes();
      if (!ctx || !compressor) return;

      const now = ctx.currentTime;
      // Double marimba tap: 440 Hz -> 330 Hz
      const drops = [
        { freq: 440, time: 0.00, dur: 0.12 },
        { freq: 330, time: 0.08, dur: 0.15 }
      ];

      drops.forEach(d => {
        const start = now + d.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(d.freq, start);
        osc.frequency.exponentialRampToValueAtTime(d.freq * 0.75, start + d.dur);

        gain.gain.setValueAtTime(0.40, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + d.dur);

        osc.connect(gain);
        gain.connect(compressor);
        osc.start(start);
        osc.stop(start + d.dur + 0.01);
      });
    },

    /* =========================================================================
       4. ROYAL VICTORY FANFARE (Level Completed & Unlocked)
       Full triumphant orchestral fanfare with sparkling glockenspiel run & sustained brass chord
       ========================================================================= */
    playLevelClear: function () {
      if (!soundEnabled) return;
      const ctx = initAudioNodes();
      if (!ctx || !compressor) return;

      const now = ctx.currentTime;

      // 1. Rapid upward glockenspiel sweep
      const run = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 -> E5 -> G5 -> C6 -> E6
      run.forEach((freq, idx) => {
        const start = now + (idx * 0.075);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.42, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(compressor);
        osc.start(start);
        osc.stop(start + 0.36);
      });

      // 2. Full Triumphant Major Brass & Bell Chord (C5 + G5 + C6 + E6)
      const chordStart = now + 0.42;
      const chordNotes = [
        { f: 523.25, type: 'sawtooth', vol: 0.18 },
        { f: 783.99, type: 'triangle', vol: 0.32 },
        { f: 1046.50, type: 'sine', vol: 0.45 },
        { f: 1318.51, type: 'triangle', vol: 0.35 }
      ];

      chordNotes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = n.type;
        osc.frequency.setValueAtTime(n.f, chordStart);

        gain.gain.setValueAtTime(n.vol, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.25);

        osc.connect(gain);
        gain.connect(compressor);
        osc.start(chordStart);
        osc.stop(chordStart + 1.3);
      });
    }
  };

  // Expose globally
  window.SahaayaAudio = SahaayaAudio;

  // Initialize toggle buttons and resume audio on first user touch/click
  document.addEventListener('DOMContentLoaded', () => {
    SahaayaAudio.updateToggleButtons();

    const resumeOnInteraction = () => {
      initAudioNodes();
      window.removeEventListener('click', resumeOnInteraction);
      window.removeEventListener('touchstart', resumeOnInteraction);
    };
    window.addEventListener('click', resumeOnInteraction, { once: true });
    window.addEventListener('touchstart', resumeOnInteraction, { once: true });
  });

})();
