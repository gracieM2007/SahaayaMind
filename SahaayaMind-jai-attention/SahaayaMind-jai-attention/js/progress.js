/* ==========================================================================
   SahaayaMind — Progress Page (js/progress.js)
   --------------------------------------------------------------------------
   Owner  : Jai  (branch: jai-attention)
   Page   : pages/progress.html

   Shows basic performance over time, read from localStorage via
   SM.sessionStore (see the contract in js/session-store.js).

   Attention section (always shown when data exists):
     latest score · average score · best score · sessions · latest accuracy
     + trend indicator (Improving ↑ / Stable → / Needs practice ↓)
     + simple bar chart of recent sessions

   A compact Memory section appears automatically once the Memory Game
   (Faizan's module) saves sessions with gameType 'memory'.
   ========================================================================== */
(function (root) {
  'use strict';

  root.SM = root.SM || {};

  var el = {};
  function byId(id) { return document.getElementById(id); }

  /* ------------------------- helpers ------------------------- */

  function avg(values) {
    if (!values.length) { return 0; }
    var sum = 0;
    for (var i = 0; i < values.length; i++) { sum += values[i]; }
    return Math.round(sum / values.length);
  }

  function scoreOf(session) {
    return (session && typeof session.score === 'number') ? session.score : 0;
  }

  function bandOf(score) {
    if (score >= 80) { return 'high'; }
    if (score >= 50) { return 'medium'; }
    return 'low';
  }

  /** Compare the two latest scores. >= +5 improving, <= -5 needs practice. */
  function trendOf(list) {
    if (list.length < 2) { return { cls: 'first', label: 'First session' }; }
    var diff = scoreOf(list[list.length - 1]) - scoreOf(list[list.length - 2]);
    if (diff >= 5) { return { cls: 'up', label: 'Improving ↑' }; }
    if (diff <= -5) { return { cls: 'down', label: 'Needs practice ↓' }; }
    return { cls: 'stable', label: 'Stable →' };
  }

  function statCard(value, label, cls) {
    return '<div class="sm-stat' + (cls ? ' sm-stat--' + cls : '') + '">' +
      '<div class="sm-stat-value">' + value + '</div>' +
      '<div class="sm-stat-label">' + label + '</div></div>';
  }

  function fmtDate(iso) {
    if (!iso) { return '—'; }
    var d = new Date(iso);
    if (isNaN(d.getTime())) { return '—'; }
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ------------------------- rendering ------------------------- */

  function renderAttention(list) {
    if (!el.attentionSection) { return; }

    if (!list.length) {
      el.attentionSection.hidden = true;
      el.empty.hidden = false;
      return;
    }
    el.attentionSection.hidden = false;
    el.empty.hidden = true;

    var latest = list[list.length - 1];
    var scores = list.map(scoreOf);

    /* Stat cards */
    el.stats.innerHTML =
      statCard(scoreOf(latest), 'Latest score', 'primary') +
      statCard(avg(scores), 'Average score') +
      statCard(Math.max.apply(null, scores), 'Best score', 'good') +
      statCard(list.length, 'Sessions completed') +
      statCard(
        (typeof latest.accuracy === 'number' ? latest.accuracy : 0) + '%',
        'Latest accuracy'
      );

    /* Trend indicator */
    var trend = trendOf(list);
    el.trend.className = 'sm-trend sm-trend--' + trend.cls;
    el.trend.textContent = trend.label;

    /* Bar chart — last 10 sessions, oldest on the left. */
    el.chart.innerHTML = list.slice(-10).map(function (s) {
      var sc = scoreOf(s);
      var barHeight = Math.max(8, Math.round(sc * 1.5)); /* 100 -> 150px */
      var d = s.dateTime ? new Date(s.dateTime) : null;
      var when = (d && !isNaN(d.getTime()))
        ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : '';
      return '<div class="sm-bar-col" title="' + when + ' · Level ' + (s.difficulty || '—') +
        ' · Score ' + sc + '/100">' +
        '<span class="sm-bar-val">' + sc + '</span>' +
        '<div class="sm-bar sm-bar--' + bandOf(sc) + '" style="height:' + barHeight + 'px"></div>' +
        '<span class="sm-bar-lab">L' + (s.difficulty || '–') + '</span>' +
        '</div>';
    }).join('');

    /* Recent sessions list — newest first. */
    var rows = ['<div class="sm-row sm-row--head"><span>Date</span><span>Level</span><span>Score</span><span>Accuracy</span></div>'];
    list.slice(-5).reverse().forEach(function (s) {
      rows.push(
        '<div class="sm-row">' +
        '<span>' + fmtDate(s.dateTime) + '</span>' +
        '<span>Level ' + (s.difficulty || '—') + '</span>' +
        '<span><strong>' + scoreOf(s) + '</strong>/100</span>' +
        '<span>' + (typeof s.accuracy === 'number' ? s.accuracy : 0) + '%</span>' +
        '</div>'
      );
    });
    el.rows.innerHTML = rows.join('');
  }

  function renderMemory(list) {
    if (!el.memory) { return; }
    if (!list.length) {
      el.memory.hidden = true;
      return;
    }
    el.memory.hidden = false;
    var scores = list.map(scoreOf);
    el.memoryStats.innerHTML =
      statCard(list.length, 'Sessions') +
      statCard(scoreOf(list[list.length - 1]), 'Latest score', 'primary') +
      statCard(Math.max.apply(null, scores), 'Best score', 'good') +
      statCard(avg(scores), 'Average score');
  }

  /* ------------------------- init ------------------------- */

  function init() {
    el.attentionSection = byId('prog-attention');
    el.empty = byId('prog-empty');
    if (!el.attentionSection) { return; }

    el.stats = byId('prog-stats');
    el.trend = byId('prog-trend');
    el.chart = byId('prog-chart');
    el.rows = byId('prog-rows');
    el.memory = byId('prog-memory');
    el.memoryStats = byId('prog-memory-stats');
    el.note = byId('prog-note');
    el.clear = byId('prog-clear');

    var store = root.SM && root.SM.sessionStore;
    renderAttention(store ? store.getSessions('attention') : []);
    renderMemory(store ? store.getSessions('memory') : []);

    if (el.note) {
      el.note.textContent = store && store.isPersistent()
        ? 'Your progress is saved locally on this device — no account, no server.'
        : 'Preview mode: local storage is unavailable here, so data is not saved. Open the page in a normal browser tab for full saving.';
    }

    if (el.clear) {
      el.clear.onclick = function () {
        if (!root.confirm('Delete all SahaayaMind progress data saved on this device? This also removes memory game sessions.')) {
          return;
        }
        if (store) { store.clearAll(); }
        init();
      };
    }
  }

  root.SM.progress = {
    init: init,
    renderAttention: renderAttention,
    renderMemory: renderMemory
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
