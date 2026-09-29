/* ==========================================================================
   SahaayaMind - Audio Manager (Sound Effects Removed as Requested)
   Zero audio emissions; preserves API surface for backward compatibility.
   ========================================================================== */

(function () {
  'use strict';

  const SahaayaAudio = {
    isEnabled: function () {
      return false;
    },
    setSoundEnabled: function () {},
    toggleSound: function () {
      return false;
    },
    updateToggleButtons: function () {
      document.querySelectorAll('.js-sound-toggle-btn').forEach(btn => {
        btn.style.display = 'none';
      });
    },
    playFlip: function () {},
    playMatch: function () {},
    playMiss: function () {},
    playLevelClear: function () {}
  };

  window.SahaayaAudio = SahaayaAudio;

  document.addEventListener('DOMContentLoaded', () => {
    SahaayaAudio.updateToggleButtons();
  });
})();
