/* ==========================================================================
   SahaayaMind — Result Page (js/result.js)
   --------------------------------------------------------------------------
   Owner  : Jai  (branch: jai-attention)  — shared by all games
   Page   : pages/result.html

   Shows the session that was just completed. Data comes from:
     1. URL parameters  (result.html?game=attention&score=80&...)   — first
     2. localStorage    (SM.sessionStore.getLastSession())          — fallback

   Works for ANY game type: attention, memory, ... (see session-store.js).
   ========================================================================== */
(function (root) {
  'use strict';

  root.SM = root.SM || {};

  var RING_CIRCUMFERENCE = 2 * Math.PI * 54; /* r=54 in the SVG viewBox */

  var GAME_META = {
    attention: { title: 'Attention Game', icon: '🎯', againHref: 'attention.html', againLabel: 'Play Again' },
    memory:    { title: 'Memory Game',    icon: '🧠', againHref: 'memory.html',    againLabel: 'Play Again' },
    generic:   { title: 'Game',           icon: '🧩', againHref: 'dashboard.html', againLabel: 'Back to Dashboard' }
  };

  var el = {};
  function byId(id) { return document.getElementById(id); }

  /* ------------------------- helpers ------------------------- */

  function clampNum(v, lo, hi) {
    v = Number(v);
    if (!isFinite(v)) { v = 0; }
    return Math.min(hi, Math.max(lo, v));
  }

  function numFrom(query, key) {
    var v = parseInt(query.get(key), 10);
    return isFinite(v) ? v : 0;
  }

  /** Build a session object from URL parameters (returns null if absent). */
  function fromParams(query) {
    var game = query.get('game');
    if (game !== 'attention' && game !== 'memory') { return null; }

    var ts = parseInt(query.get('ts'), 10);
    return {
      gameType: game,
      score: clampNum(numFrom(query, 'score'), 0, 100),
      accuracy: clampNum(numFrom(query, 'accuracy'), 0, 100),
      correct: numFrom(query, 'correct'),
      incorrect: numFrom(query, 'incorrect'),
      missed: numFrom(query, 'missed'),
      totalTargets: numFrom(query, 'targets'),
      difficulty: numFrom(query, 'level') || null,
      rounds: numFrom(query, 'rounds') || null,
      durationSec: numFrom(query, 'duration') || null,
      dateTime: isFinite(ts) ? new Date(ts).toISOString() : null
    };
  }

  function feedbackFor(score) {
    if (score >= 80) {
      return { band: 'high', text: 'Great focus! You spotted the targets very well.' };
    }
    if (score >= 50) {
      return { band: 'medium', text: 'Good effort! Keep practicing.' };
    }
    return { band: 'low', text: 'Let’s try an easier round.' };
  }

  function fmtDate(iso) {
    if (!iso) { return ''; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return ''; }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }

  function fmtDuration(sec) {
    if (!sec || sec <= 0) { return '—'; }
    var m = Math.floor(sec / 60);
    var s = Math.round(sec % 60);
    return m > 0 ? (m + 'm ' + s + 's') : (s + 's');
  }

  function statCard(value, label, cls) {
    return '<div class="sm-stat' + (cls ? ' sm-stat--' + cls : '') + '">' +
      '<div class="sm-stat-value">' + value + '</div>' +
      '<div class="sm-stat-label">' + label + '</div></div>';
  }

  /* ------------------------- rendering ------------------------- */

  function render(session) {
    if (!el.main) { return; }
    var meta = GAME_META[session.gameType] || GAME_META.generic;
    var score = clampNum(session.score, 0, 100);

    el.title.textContent = meta.icon + ' ' + meta.title + ' — Result';
    el.date.textContent = fmtDate(session.dateTime) || 'Session finished';

    el.score.textContent = score;
    el.ringFg.setAttribute(
      'stroke-dasharray',
      (RING_CIRCUMFERENCE * score / 100) + ' ' + RING_CIRCUMFERENCE
    );

    var fb = feedbackFor(score);
    el.feedback.className = 'sm-feedback sm-feedback--' + fb.band;
    el.feedback.textContent = fb.text;

    var acc = clampNum(session.accuracy, 0, 100);
    el.stats.innerHTML =
      statCard(session.correct, 'Correct picks', 'good') +
      statCard(session.incorrect, 'Wrong picks', 'bad') +
      statCard(session.missed, 'Missed targets', 'warn') +
      statCard(acc + '%', 'Accuracy', 'primary') +
      statCard(session.difficulty ? 'Level ' + session.difficulty : '—', 'Difficulty') +
      statCard(fmtDuration(session.durationSec), 'Time taken');

    el.again.setAttribute('href', meta.againHref);
    el.again.textContent = meta.againLabel;

    el.main.hidden = false;
    el.empty.hidden = true;
  }

  function showEmpty() {
    if (!el.main) { return; }
    el.main.hidden = true;
    el.empty.hidden = false;
  }

  /* ------------------------- init ------------------------- */

  function init() {
    el.main = byId('res-main');
    el.empty = byId('res-empty');
    if (!el.main) { return; }

    el.title = byId('res-title');
    el.date = byId('res-date');
    el.ringFg = byId('res-ring-fg');
    el.score = byId('res-score');
    el.feedback = byId('res-feedback');
    el.stats = byId('res-stats');
    el.again = byId('res-again');

    var session = fromParams(new URLSearchParams(root.location.search));
    if (!session) {
      var store = root.SM && root.SM.sessionStore;
      if (store) { session = store.getLastSession(); }
    }
    if (session) { render(session); } else { showEmpty(); }
  }

  root.SM.result = {
    init: init,
    render: render,
    showEmpty: showEmpty,
    fromParams: fromParams,
    feedbackFor: feedbackFor
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
