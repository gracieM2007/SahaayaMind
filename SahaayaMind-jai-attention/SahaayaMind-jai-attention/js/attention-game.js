/* ==========================================================================
   SahaayaMind — Attention Game (js/attention-game.js)
   --------------------------------------------------------------------------
   Owner  : Jai  (branch: jai-attention)
   Page   : pages/attention.html
   Flow   : Choose level -> 3 rounds -> Scoring -> result.html -> progress.html

   Game idea (elderly-friendly attention exercise):
     A grid of objects is shown with an instruction such as
     "Select all the 🍎 apples". The user must focus on the target,
     ignore distractors and respond accurately. 3 rounds per session.

   Difficulty:
     Level 1 (Easy)   : 9 objects,  3 targets, clearly different distractors
     Level 2 (Medium) : 12 objects, 4-5 targets, more distractors
     Level 3 (Hard)   : 16 objects, 5-6 targets, lookalike distractors

   Scoring (simple, transparent, non-medical):
     accuracy = correct / (correct + incorrect) * 100          (precision)
     score    = (correct - 0.5 * incorrect) / totalTargets * 100, capped 0-100
     -> each correct find earns full credit, a wrong pick cancels half a
        credit, and a missed target simply earns nothing.

   Pure logic is exposed as SM.AttentionGame so it can be tested/reused.
   ========================================================================== */
(function (root) {
  'use strict';

  root.SM = root.SM || {};

  var GAME_TYPE = 'attention';

  /* ------------------------------------------------------------------ *
   *  Configuration
   * ------------------------------------------------------------------ */
  var LEVELS = {
    1: {
      key: 1, name: 'Level 1', tagline: 'Easy',
      desc: '9 objects · 3 to find · clearly different',
      cols: 3, cells: 9, targetsByRound: [3, 3, 3], rounds: 3, mode: 'distinct'
    },
    2: {
      key: 2, name: 'Level 2', tagline: 'Medium',
      desc: '12 objects · 4–5 to find · more distractions',
      cols: 4, cells: 12, targetsByRound: [4, 5, 4], rounds: 3, mode: 'distinct'
    },
    3: {
      key: 3, name: 'Level 3', tagline: 'Hard',
      desc: '16 objects · 5–6 to find · lookalike distractors',
      cols: 4, cells: 16, targetsByRound: [5, 6, 5], rounds: 3, mode: 'similar'
    }
  };

  /* Target banks. 'pool' = distractors that look clearly DIFFERENT. */
  var DISTINCT_SETS = [
    { emoji: '🍎', plural: 'apples',   pool: ['🚗', '🌸', '🏠', '⭐', '🎈', '🌙', '⚽', '☂️', '🍌', '📘'] },
    { emoji: '🚗', plural: 'cars',     pool: ['🍎', '🌸', '🏠', '⭐', '🎈', '🌙', '⚽', '☂️', '🍌', '📘'] },
    { emoji: '⭐', plural: 'stars',    pool: ['🍎', '🚗', '🌸', '🏠', '🎈', '🌙', '⚽', '☂️', '🍌', '📘'] },
    { emoji: '🌸', plural: 'flowers',  pool: ['🍎', '🚗', '🏠', '⭐', '🎈', '🌙', '⚽', '☂️', '🍌', '📘'] },
    { emoji: '🏠', plural: 'houses',   pool: ['🍎', '🚗', '🌸', '⭐', '🎈', '🌙', '⚽', '☂️', '🍌', '📘'] },
    { emoji: '🎈', plural: 'balloons', pool: ['🍎', '🚗', '🌸', '🏠', '⭐', '🌙', '⚽', '☂️', '🍌', '📘'] }
  ];

  /* Level 3 uses a "lookalike" distractor (similar-looking, but different). */
  var SIMILAR_SETS = [
    { emoji: '🍎', plural: 'apples',  lookalike: '🍅' },
    { emoji: '🚗', plural: 'cars',    lookalike: '🚙' },
    { emoji: '🌸', plural: 'flowers', lookalike: '🌼' },
    { emoji: '🍊', plural: 'oranges', lookalike: '🍑' }
  ];

  var NEUTRAL_EMOJIS = ['⭐', '📘', '🌙', '🎈', '🧦', '☂️'];

  /* ------------------------------------------------------------------ *
   *  Small helpers
   * ------------------------------------------------------------------ */
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* Pick n items from a pool, avoiding repeats until the pool runs out. */
  function takeFrom(pool, n) {
    var out = [];
    var bag = [];
    for (var i = 0; i < n; i++) {
      if (!bag.length) { bag = shuffle(pool); }
      out.push(bag.pop());
    }
    return out;
  }

  function clampNum(v, lo, hi) {
    v = Number(v);
    if (!isFinite(v)) { v = 0; }
    return Math.min(hi, Math.max(lo, v));
  }

  /* ------------------------------------------------------------------ *
   *  Pure game logic (no DOM) — exposed for testing / integration
   * ------------------------------------------------------------------ */

  /** Create a session plan: level config + shuffled target order. */
  function createSessionPlan(levelKey) {
    var cfg = LEVELS[levelKey] || LEVELS[1];
    var bank = cfg.mode === 'similar' ? SIMILAR_SETS : DISTINCT_SETS;
    return { cfg: cfg, sets: shuffle(bank) };
  }

  /** Build one round: a shuffled list of { emoji, isTarget } cells. */
  function buildRound(plan, roundIndex) {
    var cfg = plan.cfg;
    var set = plan.sets[roundIndex % plan.sets.length];
    var targetCount = cfg.targetsByRound[roundIndex % cfg.targetsByRound.length];

    var cells = [];
    var i;

    for (i = 0; i < targetCount; i++) {
      cells.push({ emoji: set.emoji, isTarget: true });
    }

    var needed = cfg.cells - targetCount;

    if (cfg.mode === 'similar') {
      /* Half lookalikes (the real attention challenge) + half neutrals. */
      var lookalikes = Math.ceil(needed / 2);
      for (i = 0; i < lookalikes; i++) {
        cells.push({ emoji: set.lookalike, isTarget: false });
      }
      var neutrals = takeFrom(NEUTRAL_EMOJIS, needed - lookalikes);
      for (i = 0; i < neutrals.length; i++) {
        cells.push({ emoji: neutrals[i], isTarget: false });
      }
    } else {
      var distractors = takeFrom(set.pool, needed);
      for (i = 0; i < distractors.length; i++) {
        cells.push({ emoji: distractors[i], isTarget: false });
      }
    }

    return { target: set, targetCount: targetCount, cells: shuffle(cells) };
  }

  /**
   * Turn session totals into the final result.
   * totals = { correct, incorrect, missed, targets }
   */
  function computeSessionResults(totals) {
    var correct = totals.correct || 0;
    var incorrect = totals.incorrect || 0;
    var missed = totals.missed || 0;
    var targets = totals.targets || 0;

    var accuracy = (correct + incorrect) > 0
      ? Math.round((correct / (correct + incorrect)) * 100)
      : 0;

    var raw = targets > 0 ? ((correct - 0.5 * incorrect) / targets) * 100 : 0;
    var score = clampNum(Math.round(raw), 0, 100);

    var band, feedback;
    if (score >= 80) {
      band = 'high';
      feedback = 'Great focus! You spotted the targets very well.';
    } else if (score >= 50) {
      band = 'medium';
      feedback = 'Good effort! Keep practicing.';
    } else {
      band = 'low';
      feedback = 'Let’s try an easier round.';
    }

    return {
      correct: correct,
      incorrect: incorrect,
      missed: missed,
      targets: targets,
      accuracy: accuracy,
      score: score,
      band: band,
      feedback: feedback
    };
  }

  /* ------------------------------------------------------------------ *
   *  DOM wiring (browser only)
   * ------------------------------------------------------------------ */
  var state = null;
  var el = {};

  function byId(id) { return document.getElementById(id); }

  function cacheElements() {
    el.screenLevels = byId('screen-levels');
    el.screenGame = byId('screen-game');
    el.screenComplete = byId('screen-complete');
    el.levelTip = byId('attn-level-tip');
    el.rounds = byId('attn-rounds');
    el.roundLive = byId('attn-round-live');
    el.levelChip = byId('attn-level-chip');
    el.instruction = byId('attn-instruction');
    el.toFind = byId('attn-tofind');
    el.selectedCount = byId('attn-selected');
    el.grid = byId('attn-grid');
    el.checkBtn = byId('attn-check');
    el.clearBtn = byId('attn-clear');
    el.review = byId('attn-review');
    el.reviewText = byId('attn-review-text');
    el.nextBtn = byId('attn-next');
    el.finalStats = byId('attn-final-stats');
    el.finalFeedback = byId('attn-final-feedback');
    el.viewResultBtn = byId('attn-view-result');
    el.playAgainBtn = byId('attn-play-again');
  }

  function showScreen(name) {
    el.screenLevels.hidden = (name !== 'levels');
    el.screenGame.hidden = (name !== 'game');
    el.screenComplete.hidden = (name !== 'complete');
  }

  /* ---------------- Level select screen ---------------- */

  function renderLevelTip() {
    if (!el.levelTip) { return; }
    el.levelTip.hidden = true;
    var store = root.SM && root.SM.sessionStore;
    if (!store) { return; }

    var prev = store.getSessions(GAME_TYPE).pop();
    if (prev &&
        typeof prev.score === 'number' &&
        prev.score >= 85 &&
        typeof prev.difficulty === 'number') {
      if (prev.difficulty < 3) {
        var next = LEVELS[prev.difficulty + 1];
        el.levelTip.textContent =
          'Tip: you scored ' + prev.score + '/100 last time — try ' +
          next.name + ' (' + next.tagline + ') today.';
      } else {
        el.levelTip.textContent =
          'Excellent! You are performing very well at the hardest level.';
      }
      el.levelTip.hidden = false;
    }
  }

  function startLevel(levelKey) {
    var cfg = LEVELS[levelKey];
    if (!cfg) { return; }

    state = {
      levelKey: cfg.key,
      plan: createSessionPlan(cfg.key),
      roundIndex: 0,
      roundsTotal: cfg.rounds,
      cells: [],
      selected: {},
      checked: false,
      totals: { correct: 0, incorrect: 0, missed: 0, targets: 0 },
      startedAt: Date.now(),
      saved: false,
      results: null
    };

    if (el.levelChip) {
      el.levelChip.textContent = cfg.name + ' · ' + cfg.tagline;
    }
    showScreen('game');
    renderRound();
  }

  /* ---------------- Game screen ---------------- */

  function renderRound() {
    var round = buildRound(state.plan, state.roundIndex);
    var cfg = state.plan.cfg;

    state.cells = round.cells;
    state.selected = {};
    state.checked = false;

    /* Round dots */
    if (el.rounds) {
      var dots = '';
      for (var i = 0; i < state.roundsTotal; i++) {
        var cls = 'sm-round-dot';
        if (i < state.roundIndex) { cls += ' is-done'; }
        if (i === state.roundIndex) { cls += ' is-active'; }
        dots += '<span class="' + cls + '">' + (i + 1) + '</span>';
      }
      el.rounds.innerHTML = dots;
    }
    if (el.roundLive) {
      el.roundLive.textContent = 'Round ' + (state.roundIndex + 1) + ' of ' + state.roundsTotal;
    }

    /* Instruction */
    el.instruction.innerHTML =
      'Select all the <strong>' + round.target.emoji + ' ' + round.target.plural + '</strong>';
    el.toFind.textContent = round.targetCount + ' to find';

    /* Grid */
    el.grid.classList.remove('is-result');
    el.grid.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', minmax(0, 1fr))';
    el.grid.innerHTML = round.cells.map(function (cell, i) {
      return '<button type="button" class="sm-cell" data-index="' + i + '"' +
        ' aria-pressed="false" aria-label="Object ' + (i + 1) + '">' +
        '<span class="sm-cell-check" aria-hidden="true">✓</span>' +
        cell.emoji + '</button>';
    }).join('');

    /* Controls */
    el.checkBtn.disabled = false;
    el.clearBtn.disabled = false;
    el.review.hidden = true;
    updateSelectedCount();
  }

  function updateSelectedCount() {
    var n = Object.keys(state.selected).length;
    el.selectedCount.textContent = 'Selected: ' + n;
  }

  function onGridClick(event) {
    var btn = event.target && event.target.closest ? event.target.closest('.sm-cell') : null;
    if (!btn || !state || state.checked) { return; }

    var idx = btn.getAttribute('data-index');
    if (idx === null) { return; }

    if (state.selected[idx]) {
      delete state.selected[idx];
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      state.selected[idx] = true;
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
    }
    updateSelectedCount();
  }

  function clearSelections() {
    if (!state || state.checked) { return; }
    state.selected = {};
    var cells = el.grid.querySelectorAll('.sm-cell');
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('is-selected');
      cells[i].setAttribute('aria-pressed', 'false');
    }
    updateSelectedCount();
  }

  function setCellTag(btn, label, kind, description, index) {
    btn.insertAdjacentHTML(
      'beforeend',
      '<span class="sm-tag sm-tag--' + kind + '" aria-hidden="true">' + label + '</span>'
    );
    btn.setAttribute('aria-label', 'Object ' + (index + 1) + ': ' + description);
  }

  function checkAnswers() {
    if (!state || state.checked) { return; }
    state.checked = true;

    var roundTargets = 0, hits = 0, wrong = 0, missed = 0;
    var plural = state.plan.sets[state.roundIndex % state.plan.sets.length].plural;

    el.grid.classList.add('is-result');

    state.cells.forEach(function (cell, idx) {
      var btn = el.grid.children[idx];
      var isSelected = !!state.selected[idx];
      btn.disabled = true;
      btn.classList.remove('is-selected');
      btn.setAttribute('aria-pressed', 'false');

      if (cell.isTarget) {
        roundTargets++;
        if (isSelected) {
          hits++;
          btn.classList.add('is-correct');
          setCellTag(btn, '✓', 'good', 'found correctly', idx);
        } else {
          missed++;
          btn.classList.add('is-missed');
          setCellTag(btn, 'Missed', 'warn', 'missed target', idx);
        }
      } else if (isSelected) {
        wrong++;
        btn.classList.add('is-incorrect');
        setCellTag(btn, '✗', 'bad', 'wrong selection', idx);
      }
    });

    state.totals.correct += hits;
    state.totals.incorrect += wrong;
    state.totals.missed += missed;
    state.totals.targets += roundTargets;

    /* Round summary (supportive, non-medical language). */
    var msg;
    if (hits === roundTargets && wrong === 0) {
      msg = 'Perfect round! You found all ' + roundTargets + ' ' + plural + '.';
    } else {
      msg = 'You found <strong>' + hits + ' of ' + roundTargets + '</strong> ' + plural + '.';
      if (wrong > 0) { msg += ' ' + wrong + (wrong === 1 ? ' wrong pick.' : ' wrong picks.'); }
      if (missed > 0) { msg += ' ' + missed + (missed === 1 ? ' target was missed.' : ' targets were missed.'); }
    }
    el.reviewText.innerHTML = msg;
    el.nextBtn.textContent = (state.roundIndex + 1 < state.roundsTotal)
      ? 'Next Round'
      : 'See Final Score';

    el.checkBtn.disabled = true;
    el.clearBtn.disabled = true;
    el.review.hidden = false;
  }

  function nextStep() {
    if (!state) { return; }
    state.roundIndex++;
    if (state.roundIndex < state.roundsTotal) {
      renderRound();
    } else {
      finishSession();
    }
  }

  /* ---------------- Completion ---------------- */

  function finishSession() {
    var results = computeSessionResults(state.totals);
    state.results = results;
    var durationSec = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000));

    /* Save the session once (shared contract, see session-store.js). */
    if (!state.saved) {
      state.saved = true;
      var store = root.SM && root.SM.sessionStore;
      if (store) {
        store.addSession({
          gameType: GAME_TYPE,
          score: results.score,
          accuracy: results.accuracy,
          correct: results.correct,
          incorrect: results.incorrect,
          missed: results.missed,
          totalTargets: results.targets,
          difficulty: state.levelKey,
          rounds: state.roundsTotal,
          durationSec: durationSec,
          dateTime: new Date().toISOString()
        });
      }
    }

    /* Summary cards on the completion screen. */
    el.finalStats.innerHTML =
      statCard(results.score, 'Score', 'primary') +
      statCard(results.accuracy + '%', 'Accuracy') +
      statCard(results.correct, 'Correct picks', 'good') +
      statCard(results.incorrect, 'Wrong picks');

    el.finalFeedback.className = 'sm-feedback sm-feedback--' + results.band;
    el.finalFeedback.textContent = results.feedback;

    /* Result page gets the data via URL params AND localStorage. */
    var q = new URLSearchParams({
      game: GAME_TYPE,
      score: results.score,
      accuracy: results.accuracy,
      correct: results.correct,
      incorrect: results.incorrect,
      missed: results.missed,
      targets: results.targets,
      level: state.levelKey,
      rounds: state.roundsTotal,
      duration: durationSec,
      ts: Date.now()
    });
    el.viewResultBtn.setAttribute('href', 'result.html?' + q.toString());

    showScreen('complete');
    try { root.scrollTo(0, 0); } catch (e) { /* ignore */ }
  }

  function statCard(value, label, cls) {
    return '<div class="sm-stat' + (cls ? ' sm-stat--' + cls : '') + '">' +
      '<div class="sm-stat-value">' + value + '</div>' +
      '<div class="sm-stat-label">' + label + '</div></div>';
  }

  function playAgain() {
    renderLevelTip();
    showScreen('levels');
    try { root.scrollTo(0, 0); } catch (e) { /* ignore */ }
  }

  /* ---------------- Init ---------------- */

  function init() {
    cacheElements();
    if (!el.screenLevels || !el.grid) { return; } /* not on this page */

    var levelBtns = document.querySelectorAll('#screen-levels [data-level]');
    for (var i = 0; i < levelBtns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          startLevel(parseInt(btn.getAttribute('data-level'), 10) || 1);
        });
      })(levelBtns[i]);
    }

    el.grid.addEventListener('click', onGridClick);
    el.checkBtn.addEventListener('click', checkAnswers);
    el.clearBtn.addEventListener('click', clearSelections);
    el.nextBtn.addEventListener('click', nextStep);
    if (el.playAgainBtn) { el.playAgainBtn.addEventListener('click', playAgain); }

    renderLevelTip();
  }

  /* Expose for tests / other modules (naming kept simple on purpose). */
  root.SM.AttentionGame = {
    GAME_TYPE: GAME_TYPE,
    LEVELS: LEVELS,
    createSessionPlan: createSessionPlan,
    buildRound: buildRound,
    computeSessionResults: computeSessionResults,
    init: init
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
