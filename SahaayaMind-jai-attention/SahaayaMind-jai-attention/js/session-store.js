/* ==========================================================================
   SahaayaMind — Session Store (js/session-store.js)
   --------------------------------------------------------------------------
   Owner  : Jai  (branch: jai-attention)
   Purpose: One tiny, shared data layer for ALL games (Attention, Memory, ...)
            Used by: attention-game.js, result.js, progress.js

   ------------------------- TEAM CONTRACT ----------------------------------
   localStorage keys:
     sahaayamind_sessions      -> JSON array of session objects (oldest first)
     sahaayamind_last_session  -> JSON object, the most recent session

   Session object fields (please keep consistent):
     gameType     : 'attention' | 'memory' | ...
     score        : 0-100
     accuracy     : 0-100 (percentage)
     correct      : number of correct selections
     incorrect    : number of wrong selections
     missed       : number of missed targets
     totalTargets : number of targets that were shown
     difficulty   : 1 | 2 | 3
     rounds       : number of rounds played
     durationSec  : number (optional)
     dateTime     : ISO date-time string

   Usage from any game module:
     SM.sessionStore.addSession({ gameType:'memory', score: 80, ... });
     window.location.href = 'result.html';
   --------------------------------------------------------------------------
   Falls back to in-memory storage when localStorage is unavailable
   (sandboxed previews / private mode). Data then lasts for the page visit.
   ========================================================================== */
(function (root) {
  'use strict';

  root.SM = root.SM || {};

  var SESSIONS_KEY = 'sahaayamind_sessions';
  var LAST_KEY = 'sahaayamind_last_session';

  /* Detect a usable localStorage once. Simply *accessing* localStorage can
     throw inside sandboxed iframes, so everything below is guarded. */
  var ls = (function () {
    try {
      var probe = '__sm_probe__';
      root.localStorage.setItem(probe, '1');
      root.localStorage.removeItem(probe);
      return root.localStorage;
    } catch (e) {
      return null;
    }
  })();

  /* In-memory fallback (only used when localStorage is not available). */
  var memSessions = null;
  var memLast = null;

  function readSessions() {
    if (ls) {
      try {
        var raw = ls.getItem(SESSIONS_KEY);
        var val = raw ? JSON.parse(raw) : [];
        return Array.isArray(val) ? val : [];
      } catch (e) {
        return [];
      }
    }
    if (!memSessions) { memSessions = []; }
    return memSessions;
  }

  function writeSessions(list) {
    memSessions = list;
    if (ls) {
      try { ls.setItem(SESSIONS_KEY, JSON.stringify(list)); } catch (e) { /* ignore */ }
    }
  }

  root.SM.sessionStore = {

    keys: { sessions: SESSIONS_KEY, last: LAST_KEY },

    /** true when data persists in localStorage on this device. */
    isPersistent: function () {
      return !!ls;
    },

    /** All sessions (oldest first), optionally filtered by gameType. */
    getSessions: function (gameType) {
      var all = readSessions();
      if (!gameType) { return all.slice(); }
      return all.filter(function (s) {
        return s && s.gameType === gameType;
      });
    },

    /** Save a session. Also becomes the "last session" for result.html. */
    addSession: function (session) {
      if (!session || typeof session !== 'object' || !session.gameType) {
        return null;
      }
      var list = readSessions();
      list.push(session);
      writeSessions(list);
      memLast = session;
      if (ls) {
        try { ls.setItem(LAST_KEY, JSON.stringify(session)); } catch (e) { /* ignore */ }
      }
      return session;
    },

    /** The most recent session (any game type), or null. */
    getLastSession: function () {
      if (ls) {
        try {
          var raw = ls.getItem(LAST_KEY);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      }
      return memLast;
    },

    /** Removes ALL SahaayaMind progress data on this device. */
    clearAll: function () {
      memSessions = [];
      memLast = null;
      if (ls) {
        try {
          ls.removeItem(SESSIONS_KEY);
          ls.removeItem(LAST_KEY);
        } catch (e) { /* ignore */ }
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
