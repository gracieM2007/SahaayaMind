/**
 * ============================================================================
 * SahaayaMind - Memory & Cognitive Performance Logistics Engine
 * Smart India Hackathon 2026 (SIH26003) | Team Arbalest
 * ============================================================================
 * 
 * CORE ARCHITECTURAL PRINCIPLES:
 * 1. Zero Login / Pure Device-Local Persistence:
 *    - All progress, streaks, and cognitive metrics are preserved continuously
 *      and permanently on the user's device via localStorage.
 * 2. Continuous Device Streak System:
 *    - Automatically tracks consecutive days, best streak, total active days,
 *      and detailed performance across the active streak.
 * 3. 3-Factor Cognitive Performance Formula:
 *    - Overall Performance (0 - 100) is mathematically calculated using:
 *      a) Accuracy Rate (45% weight): High precision raises the score.
 *      b) Attempts Taken (30% weight): Extra attempts penalize the score.
 *      c) Time Taken (25% weight): Excessive time/hesitation lowers the score,
 *         while steady, calm pacing achieves peak performance.
 * 4. Senior & Neurological Impairment Optimization:
 *    - Specially calibrated for elderly users with neurological/cognitive concerns
 *      (e.g., mild cognitive decline, slower visual search, working memory fatigue).
 *    - Dignity-preserving, uplifting feedback with clear cognitive reinforcement.
 * ============================================================================
 */

(function (root, factory) {
  'use strict';
  const instance = factory();
  if (typeof root !== 'undefined') root.MemoryLogistics = instance;
  if (typeof window !== 'undefined') window.MemoryLogistics = instance;
  if (typeof module === 'object' && module.exports) module.exports = instance;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const STORAGE_KEY_STREAK = 'sahaaya_device_streak';
  const STORAGE_KEY_SESSIONS = 'sahaaya_memory_sessions';

  // Geriatric Cognitive Norms & Targets for 4-Pair (8 Cards) Memory Match
  const MEMORY_NORMS = {
    DEFAULT_PAIRS: 4,
    OPTIMAL_MIN_TIME_SEC: 28,  // Faster than this may indicate guessing
    TARGET_RELAXED_TIME_SEC: 42, // Baseline comfortable time for seniors
    MAX_PACING_TIME_SEC: 180,  // Latency decay ceiling
    ACCURACY_WEIGHT: 0.45,     // 45% of score from accuracy
    ATTEMPTS_WEIGHT: 0.30,     // 30% of score from attempt efficiency
    TIME_WEIGHT: 0.25          // 25% of score from pacing stability
  };

  /**
   * Helper: Get current date in local YYYY-MM-DD format
   */
  function getLocalDateString(d) {
    const date = d || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper: Calculate difference in calendar days between two YYYY-MM-DD strings
   */
  function daysBetweenDates(d1Str, d2Str) {
    if (!d1Str || !d2Str) return 999;
    const date1 = new Date(d1Str + 'T00:00:00');
    const date2 = new Date(d2Str + 'T00:00:00');
    const diffTime = Math.abs(date2 - date1);
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Helper: Format seconds into readable string (e.g., "1m 15s")
   */
  function formatDuration(seconds) {
    const s = Math.max(0, Math.round(seconds || 0));
    const mins = Math.floor(s / 60);
    const remSecs = s % 60;
    if (mins === 0) return `${remSecs}s`;
    return `${mins}m ${remSecs < 10 ? '0' : ''}${remSecs}s`;
  }

  // ==========================================================================
  // 1. THREE-FACTOR COGNITIVE PERFORMANCE CALCULATION
  // ==========================================================================

  /**
   * Calculates overall performance score (0-100) based strictly on:
   * 1. Accuracy Rate (Higher accuracy increases score)
   * 2. Attempts Taken (More attempts decrease score)
   * 3. Time Taken (More time decreases score)
   * 
   * @param {number} timeSeconds   - Time taken in seconds
   * @param {number} attempts      - Number of move turns attempted (e.g. 5, 8)
   * @param {number} matchesFound  - Number of matching pairs found (e.g. 4)
   * @param {number} totalPairs    - Total pairs in the game (default: 4)
   * @returns {Object} Comprehensive performance report with sub-scores & clinical feedback
   */
  function calculatePerformance(timeSeconds, attempts, matchesFound, totalPairs) {
    const pairs = totalPairs || MEMORY_NORMS.DEFAULT_PAIRS;
    const actualMatches = matchesFound !== undefined ? matchesFound : pairs;
    const actualAttempts = Math.max(actualMatches, parseInt(attempts, 10) || pairs);
    const actualTime = Math.max(5, parseFloat(timeSeconds) || MEMORY_NORMS.TARGET_RELAXED_TIME_SEC);

    // --- Factor 1: Accuracy Percentage (0 - 100%) ---
    // Accuracy = (Matches / Attempts) * 100
    const rawAccuracyPct = Math.round((actualMatches / actualAttempts) * 100);
    const accuracyPct = Math.min(100, Math.max(10, rawAccuracyPct));
    const accuracyScore = (accuracyPct / 100) * (MEMORY_NORMS.ACCURACY_WEIGHT * 100);

    // --- Factor 2: Attempt Efficiency (0 - 100%) ---
    // Optimal attempts is equal to the number of pairs (e.g., 4 attempts for 4 pairs).
    // The more extra attempts taken, the lower this efficiency score drops.
    const extraAttempts = Math.max(0, actualAttempts - pairs);
    // Every extra attempt above optimal deducts 15% efficiency points
    const attemptsEfficiencyPct = Math.max(15, Math.min(100, 100 - (extraAttempts * 15)));
    const attemptsScore = (attemptsEfficiencyPct / 100) * (MEMORY_NORMS.ATTEMPTS_WEIGHT * 100);

    // --- Factor 3: Time & Pacing Efficiency (0 - 100%) ---
    // For seniors with cognitive challenges, up to 40 seconds for 4 pairs is optimal.
    // Beyond 40 seconds, time score gently decreases, reflecting working memory search latency.
    let timeEfficiencyPct = 100;
    if (actualTime > MEMORY_NORMS.TARGET_RELAXED_TIME_SEC) {
      const overTimeSec = actualTime - MEMORY_NORMS.TARGET_RELAXED_TIME_SEC;
      // Gentle decay: 1.2% per extra second over baseline
      timeEfficiencyPct = Math.max(15, Math.min(100, Math.round(100 - (overTimeSec * 1.2))));
    }
    const timeScore = (timeEfficiencyPct / 100) * (MEMORY_NORMS.TIME_WEIGHT * 100);

    // --- Overall Performance Score (0 - 100) ---
    const overallScore = Math.min(99, Math.max(20, Math.round(accuracyScore + attemptsScore + timeScore)));

    // --- Clinical Senior Feedback Generation ---
    let feedback = '';
    let pacingStyle = 'Steady & Thoughtful';
    let neuroRecommendation = '';

    if (overallScore >= 90) {
      pacingStyle = 'Exceptional & Sharp';
      feedback = `Outstanding visual memory recall! You achieved ${accuracyPct}% accuracy in just ${actualAttempts} attempts (${formatDuration(actualTime)}). Your working memory retrieved card locations with remarkable stability.`;
      neuroRecommendation = 'Your memory retention pathways are in peak shape today. Maintain this daily morning rhythm!';
    } else if (overallScore >= 80) {
      pacingStyle = 'Steady & Confident';
      feedback = `Great cognitive workout! You maintained ${accuracyPct}% accuracy. Taking ${actualAttempts} attempts allowed steady visual scanning without rushing.`;
      neuroRecommendation = 'Solid performance. Taking a 5-minute breather and drinking a glass of water helps consolidate today’s memory workout.';
    } else if (overallScore >= 70) {
      pacingStyle = 'Calm & Deliberate';
      feedback = `Good focus today. You completed all ${pairs} pairs in ${formatDuration(actualTime)}. Taking slightly fewer attempts next time will sharpen your immediate recall score even higher.`;
      neuroRecommendation = 'Gentle repetition stimulates neuroplasticity. Try pausing for 2 seconds before flipping the second card.';
    } else {
      pacingStyle = 'Patient & Practicing';
      feedback = `Well done for completing the full session! Your determination helps activate memory centers. With regular daily practice, your recognition speed and accuracy will naturally improve.`;
      neuroRecommendation = 'Rest your eyes, hydrate well, and try again tomorrow morning when your mental clarity is freshest.';
    }

    return {
      overallScore: overallScore,
      maxScore: 100,
      accuracyPct: accuracyPct,
      accuracyStr: `${accuracyPct}%`,
      attempts: actualAttempts,
      optimalAttempts: pairs,
      attemptsEfficiencyPct: attemptsEfficiencyPct,
      timeSeconds: actualTime,
      durationStr: formatDuration(actualTime),
      timeEfficiencyPct: timeEfficiencyPct,
      weights: {
        accuracyWeight: '45%',
        attemptsWeight: '30%',
        timeWeight: '25%'
      },
      pointsBreakdown: {
        accuracyPoints: Math.round(accuracyScore * 10) / 10,
        attemptsPoints: Math.round(attemptsScore * 10) / 10,
        timePoints: Math.round(timeScore * 10) / 10
      },
      pacingStyle: pacingStyle,
      seniorFeedback: feedback,
      recommendation: neuroRecommendation,
      factorsSummary: `Accuracy contributed ${Math.round(accuracyScore)} pts, attempt efficiency ${Math.round(attemptsScore)} pts, and pacing ${Math.round(timeScore)} pts.`
    };
  }

  // ==========================================================================
  // 2. DEVICE STREAK SYSTEM (PERSISTENT & CONTINUOUS FOREVER)
  // ==========================================================================

  /**
   * Retrieves the device streak state from localStorage.
   * If non-existent, initializes with default or clean continuous device state.
   */
  function getDeviceStreak() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STREAK);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[MemoryLogistics] Failed reading streak from storage', e);
    }

    // Default initial clean state starting at 0
    const defaultStreak = {
      currentStreak: 0,
      bestStreak: 0,
      totalDaysPlayed: 0,
      totalGamesPlayed: 0,
      lastPlayedDate: null,
      streakStartDate: null,
      recentHistory: []
    };

    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(defaultStreak));
    } catch (e) {}

    return defaultStreak;
  }

  /**
   * Records a completed game session into the device streak system.
   * Maintains continuous consecutive day records permanently on this device.
   * 
   * @param {Object} session - { score, accuracyPct, durationSec, attempts, gameType, gameName }
   * @returns {Object} Updated streak information
   */
  function recordGameActivity(session) {
    const streak = getDeviceStreak();
    const todayStr = getLocalDateString();
    const lastDate = streak.lastPlayedDate;

    let isNewDay = false;
    let streakIncremented = false;

    if (!lastDate) {
      // First game ever recorded
      streak.currentStreak = 1;
      streak.bestStreak = 1;
      streak.totalDaysPlayed = 1;
      streak.streakStartDate = todayStr;
      streak.lastPlayedDate = todayStr;
      isNewDay = true;
      streakIncremented = true;
    } else if (lastDate === todayStr) {
      // User already played today! Streak is already active for today.
      // We keep currentStreak intact, but update total games played.
      streak.totalGamesPlayed = (streak.totalGamesPlayed || 0) + 1;
    } else {
      // Different day: calculate difference
      const diffDays = daysBetweenDates(lastDate, todayStr);

      if (diffDays === 1) {
        // Consecutive day! Streak extends!
        streak.currentStreak = (streak.currentStreak || 0) + 1;
        streak.bestStreak = Math.max(streak.bestStreak || 0, streak.currentStreak);
        streak.totalDaysPlayed = (streak.totalDaysPlayed || 0) + 1;
        streak.lastPlayedDate = todayStr;
        isNewDay = true;
        streakIncremented = true;
      } else {
        // Missed one or more days: Streak resets to 1, but bestStreak is kept forever!
        streak.currentStreak = 1;
        streak.streakStartDate = todayStr;
        streak.totalDaysPlayed = (streak.totalDaysPlayed || 0) + 1;
        streak.lastPlayedDate = todayStr;
        isNewDay = true;
      }
    }

    streak.totalGamesPlayed = Math.max(streak.totalGamesPlayed || 0, (streak.totalGamesPlayed || 0) + 1);

    // Record session entry in recentHistory
    if (!Array.isArray(streak.recentHistory)) {
      streak.recentHistory = [];
    }

    streak.recentHistory.unshift({
      date: todayStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      score: session.score || 90,
      accuracy: session.accuracyPct || 92,
      durationSec: session.durationSec || 45,
      attempts: session.attempts || 5,
      game: session.gameName || (session.gameType === 'attention' ? 'Attention Focus' : 'Memory Recall')
    });

    // Keep history clean (up to 30 recent streak entries)
    streak.recentHistory = streak.recentHistory.slice(0, 30);

    // Save permanently to device localStorage
    try {
      localStorage.setItem(STORAGE_KEY_STREAK, JSON.stringify(streak));
    } catch (e) {
      console.error('[MemoryLogistics] Failed saving updated streak to localStorage', e);
    }

    // Sync with active user profile if available
    try {
      const activeUserRaw = localStorage.getItem('sahaaya_active_user');
      if (activeUserRaw) {
        const user = JSON.parse(activeUserRaw);
        user.streakDays = streak.currentStreak;
        localStorage.setItem('sahaaya_active_user', JSON.stringify(user));
      }
    } catch (e) {}

    // Dispatch custom event for UI components to re-render streak instantly
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('sahaaya:streak-updated', {
          detail: { streak, isNewDay, streakIncremented }
        }));
      } catch (e) {}
    }

    return {
      streak,
      isNewDay,
      streakIncremented
    };
  }

  // ==========================================================================
  // 3. STREAK PERFORMANCE ANALYTICS
  // ==========================================================================

  /**
   * Generates a performance summary across the active streak.
   * Shows how the senior's memory and cognitive scores have evolved.
   */
  function getStreakPerformanceSummary() {
    const streak = getDeviceStreak();
    const history = Array.isArray(streak.recentHistory) ? streak.recentHistory : [];

    const streakCount = streak.currentStreak || 0;
    const streakSessions = streakCount > 0 ? history.slice(0, streakCount) : [];

    let avgScore = 0;
    let avgAccuracy = 0;
    let avgTime = 0;
    let avgAttempts = 0;

    if (streakSessions.length > 0) {
      const sumScore = streakSessions.reduce((acc, s) => acc + (s.score || 0), 0);
      const sumAcc = streakSessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
      const sumTime = streakSessions.reduce((acc, s) => acc + (s.durationSec || 0), 0);
      const sumAtt = streakSessions.reduce((acc, s) => acc + (s.attempts || 0), 0);

      avgScore = Math.round(sumScore / streakSessions.length);
      avgAccuracy = Math.round(sumAcc / streakSessions.length);
      avgTime = Math.round(sumTime / streakSessions.length);
      avgAttempts = Math.round((sumAtt / streakSessions.length) * 10) / 10;
    }

    // Milestone Badge Determination
    let milestoneBadge = {
      level: 'New',
      title: 'Ready to Begin',
      icon: '🌱',
      color: '#0D9488',
      desc: 'Complete your first memory session to activate your daily streak!'
    };

    if (streakCount >= 30) {
      milestoneBadge = {
        level: 'Diamond',
        title: '30-Day Master Mind',
        icon: '💎',
        color: '#7C3AED',
        desc: 'Unprecedented habit formation! Cognitive pathways are exceptionally fortified.'
      };
    } else if (streakCount >= 14) {
      milestoneBadge = {
        level: 'Gold',
        title: '14-Day Neuro Pillar',
        icon: '🥇',
        color: '#D97706',
        desc: 'Two full weeks of uninterrupted daily memory stimulation.'
      };
    } else if (streakCount >= 7) {
      milestoneBadge = {
        level: 'Silver',
        title: '7-Day Memory Champion',
        icon: '🥈',
        color: '#2563EB',
        desc: 'One solid week! Working memory retrieval shows steady speed improvements.'
      };
    } else if (streakCount >= 3) {
      milestoneBadge = {
        level: 'Bronze',
        title: '3-Day Consistency Spark',
        icon: '🥉',
        color: '#0D9488',
        desc: '3 continuous days of active brain training.'
      };
    } else if (streakCount >= 1) {
      milestoneBadge = {
        level: 'Spark',
        title: 'Daily Streak Active',
        icon: '🔥',
        color: '#0D9488',
        desc: 'Active daily mental exercise.'
      };
    }

    return {
      currentStreak: streakCount,
      bestStreak: streak.bestStreak || 0,
      totalDaysPlayed: streak.totalDaysPlayed || 0,
      totalGamesPlayed: streak.totalGamesPlayed || 0,
      avgScore: avgScore,
      avgAccuracy: avgAccuracy,
      avgDuration: avgTime > 0 ? formatDuration(avgTime) : '0s',
      avgTimeSec: avgTime,
      avgAttempts: avgAttempts,
      milestone: milestoneBadge,
      statusMessage: streakCount > 0 
        ? `🔥 ${streakCount} Day Continuous Streak • Average Score: ${avgScore}/100` 
        : `🌱 Ready to Begin • Play your first game today!`,
      recentSessions: streakSessions
    };
  }

  // ==========================================================================
  // PUBLIC EXPORTS
  // ==========================================================================
  return {
    NORMS: MEMORY_NORMS,
    calculatePerformance: calculatePerformance,
    getDeviceStreak: getDeviceStreak,
    recordGameActivity: recordGameActivity,
    getStreakPerformanceSummary: getStreakPerformanceSummary,
    formatDuration: formatDuration,
    getLocalDateString: getLocalDateString
  };
});
