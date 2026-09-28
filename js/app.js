/* ==========================================================================
   SahaayaMind - Core Application Logic
   User Profile, State Persistence, Game Integration Handlers & UI Hydration
   ========================================================================== */

(function () {
  'use strict';

  // State Accessors
  window.SahaayaApp = {
    getActiveUser: function () {
      try {
        const raw = localStorage.getItem('sahaaya_active_user');
        return raw ? JSON.parse(raw) : SAHAAYA_DEFAULT_PROFILES[0];
      } catch (e) {
        return SAHAAYA_DEFAULT_PROFILES[0];
      }
    },

    setActiveUser: function (userObj) {
      localStorage.setItem('sahaaya_active_user', JSON.stringify(userObj));
      this.hydrateUserUI();
    },

    loginAs: function (profileId) {
      const profiles = JSON.parse(localStorage.getItem('sahaaya_profiles') || JSON.stringify(SAHAAYA_DEFAULT_PROFILES));
      const target = profiles.find(p => p.id === profileId) || profiles[0];
      this.setActiveUser(target);
      window.location.href = 'pages/dashboard.html';
    },

    loginCustomUser: function (name, age) {
      const trimmedName = name && name.trim() ? name.trim() : "Elderly Senior";
      const userAge = parseInt(age, 10) || 70;
      const initials = trimmedName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || "ES";
      
      const customProfile = {
        id: "user_" + Date.now(),
        name: trimmedName,
        age: userAge,
        location: "Home Care",
        cognitiveLevel: "Gentle Pace (Level 2)",
        lastSession: "First Session Today",
        streakDays: 1,
        overallScore: 82,
        weeklyImprovement: "+4%",
        sessionsCompleted: 1,
        avatarInitials: initials,
        statusNote: "Welcome to SahaayaMind"
      };

      this.setActiveUser(customProfile);
      window.location.href = 'pages/dashboard.html';
    },

    logout: function () {
      // Return to landing screen
      const isInnerPage = window.location.pathname.includes('/pages/');
      window.location.href = isInnerPage ? '../index.html' : 'index.html';
    },

    // Record a completed game session and redirect to result.html
    completeGameSession: function (gameType, score, accuracyStr, durationStr, customFeedback, telemetryPayload) {
      const activeUser = this.getActiveUser();
      const isMemory = gameType === 'memory';
      const gameTitle = isMemory ? "Memory Recall & Match" : "Attention & Pattern Focus";

      // 1. Fetch user history for longitudinal comparison
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem('sahaaya_history') || '[]');
      } catch (e) {
        history = [];
      }

      // 2. Perform intelligent multi-dimensional analysis with self-verification pass
      let aiAnalysis = null;
      if (typeof window.SahaayaAI !== 'undefined' && typeof window.SahaayaAI.analyzeSession === 'function') {
        try {
          aiAnalysis = window.SahaayaAI.analyzeSession({
            gameType: gameType,
            gameName: gameTitle,
            score: score,
            accuracy: accuracyStr,
            duration: durationStr,
            customFeedback: customFeedback,
            telemetry: telemetryPayload
          }, history, activeUser);
        } catch (aiErr) {
          console.warn('[SahaayaMind] AI Cognitive Engine fallback active:', aiErr);
        }
      }

      // 3. Construct rich, backward-compatible session result
      const sessionResult = {
        gameName: gameTitle,
        gameType: gameType,
        score: aiAnalysis ? aiAnalysis.overallScore : (score || (isMemory ? 94 : 88)),
        maxScore: 100,
        accuracy: accuracyStr || (aiAnalysis ? aiAnalysis.accuracyStr : "95%"),
        duration: durationStr || (aiAnalysis ? aiAnalysis.durationStr : "3m 15s"),
        memoryScore: aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.memory.score : (isMemory ? (score || 94) : 84),
        attentionScore: aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.attention.score : (isMemory ? 88 : (score || 90)),
        speedScore: aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.processingSpeed.score : 89,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        feedback: (aiAnalysis && aiAnalysis.seniorFeedback) ? aiAnalysis.seniorFeedback : (customFeedback || (isMemory 
          ? "Exceptional memory recall today! You quickly identified matching patterns with 95% precision." 
          : "Fantastic concentration and speed! You sustained steady attention across all visual targets.")),
        recommendation: (aiAnalysis && aiAnalysis.recommendation) ? aiAnalysis.recommendation : (isMemory 
          ? "Great morning exercise. Next, relax your eyes and practice the Attention Game tomorrow." 
          : "Superb focus! Rest for 10 minutes and enjoy your daily tea."),
        // Rich AI metadata
        aiReport: aiAnalysis,
        confidence: aiAnalysis ? aiAnalysis.confidence : 0.85,
        suggestedDifficulty: aiAnalysis ? aiAnalysis.suggestedDifficulty : 2,
        caregiverNote: aiAnalysis ? aiAnalysis.caregiverNote : null
      };

      // Save latest result
      localStorage.setItem('sahaaya_latest_result', JSON.stringify(sessionResult));

      // Append to history
      try {
        history.unshift({
          id: "sess_" + Date.now(),
          gameName: sessionResult.gameName,
          gameType: sessionResult.gameType,
          date: sessionResult.date,
          time: sessionResult.timestamp,
          score: sessionResult.score,
          accuracy: sessionResult.accuracy,
          duration: sessionResult.duration,
          speedRating: (aiAnalysis && aiAnalysis.pacingSummary) ? aiAnalysis.pacingSummary.style : "Steady & Confident",
          status: "Completed",
          memoryScore: sessionResult.memoryScore,
          attentionScore: sessionResult.attentionScore,
          speedScore: sessionResult.speedScore
        });
        localStorage.setItem('sahaaya_history', JSON.stringify(history.slice(0, 15)));

        // Update active user statistics
        activeUser.sessionsCompleted = (activeUser.sessionsCompleted || 0) + 1;
        activeUser.lastSession = "Just now (" + sessionResult.timestamp + ")";
        activeUser.overallScore = Math.min(99, Math.round(((activeUser.overallScore || 85) * 4 + sessionResult.score) / 5));
        if (aiAnalysis && aiAnalysis.suggestedDifficulty) {
          activeUser.cognitiveLevel = `Level ${aiAnalysis.suggestedDifficulty}`;
        }
        localStorage.setItem('sahaaya_active_user', JSON.stringify(activeUser));
      } catch (err) {
        console.error("Error updating history", err);
      }

      // Navigate to common result screen
      window.location.href = 'result.html';
    },

    // Hydrate dynamic UI elements across pages
    hydrateUserUI: function () {
      const user = this.getActiveUser();
      if (!user) return;

      // Header user initials and name
      document.querySelectorAll('.js-user-name').forEach(el => {
        el.textContent = user.name;
      });

      document.querySelectorAll('.js-user-first-name').forEach(el => {
        el.textContent = user.name.split(' ')[0] || user.name;
      });

      document.querySelectorAll('.js-user-age').forEach(el => {
        el.textContent = user.age + " Years";
      });

      document.querySelectorAll('.js-user-level').forEach(el => {
        el.textContent = user.cognitiveLevel;
      });

      document.querySelectorAll('.js-user-last-session').forEach(el => {
        el.textContent = user.lastSession;
      });

      document.querySelectorAll('.js-user-score').forEach(el => {
        el.textContent = user.overallScore + "/100";
      });

      document.querySelectorAll('.js-user-progress-rate').forEach(el => {
        el.textContent = user.weeklyImprovement;
      });

      document.querySelectorAll('.js-user-sessions').forEach(el => {
        el.textContent = user.sessionsCompleted + " Completed";
      });

      document.querySelectorAll('.js-user-avatar').forEach(el => {
        el.textContent = user.avatarInitials;
      });
    },

    // Hydrate Result Screen
    hydrateResultPage: function () {
      let resultData;
      try {
        resultData = JSON.parse(localStorage.getItem('sahaaya_latest_result')) || SAHAAYA_DEFAULT_LATEST_RESULT;
      } catch (e) {
        resultData = SAHAAYA_DEFAULT_LATEST_RESULT;
      }

      const user = this.getActiveUser();

      const resScore = document.getElementById('res-score');
      if (resScore) resScore.textContent = resultData.score;

      const resGameName = document.getElementById('res-game-name');
      if (resGameName) resGameName.textContent = resultData.gameName;

      const resAccuracy = document.getElementById('res-accuracy');
      if (resAccuracy) resAccuracy.textContent = resultData.accuracy;

      const resDuration = document.getElementById('res-duration');
      if (resDuration) resDuration.textContent = resultData.duration;

      const resFeedback = document.getElementById('res-feedback');
      if (resFeedback) resFeedback.textContent = resultData.feedback;

      const resRecommendation = document.getElementById('res-recommendation');
      if (resRecommendation) resRecommendation.textContent = resultData.recommendation;

      const resMemScore = document.getElementById('res-mem-score');
      if (resMemScore) {
        const memVal = resultData.memoryScore || 92;
        resMemScore.textContent = memVal + "%";
        const memBar = resMemScore.closest?.('.breakdown-row')?.querySelector('.progress-bar-fill');
        if (memBar) memBar.style.width = memVal + "%";
      }

      const resAttScore = document.getElementById('res-att-score');
      if (resAttScore) {
        const attVal = resultData.attentionScore || 88;
        resAttScore.textContent = attVal + "%";
        const attBar = resAttScore.closest?.('.breakdown-row')?.querySelector('.progress-bar-fill');
        if (attBar) attBar.style.width = attVal + "%";
      }

      const resSpdScore = document.getElementById('res-spd-score');
      if (resSpdScore) {
        const spdVal = resultData.speedScore || 90;
        resSpdScore.textContent = spdVal + "%";
        const spdBar = resSpdScore.closest?.('.breakdown-row')?.querySelector('.progress-bar-fill');
        if (spdBar) spdBar.style.width = spdVal + "%";
      }

      const resConfidenceVal = document.getElementById('res-confidence-val');
      if (resConfidenceVal) {
        const confPct = Math.round(((resultData.aiReport && resultData.aiReport.confidence) || resultData.confidence || 0.88) * 100);
        resConfidenceVal.textContent = confPct + "%";
      }

      const resDifficultyReason = document.getElementById('res-difficulty-reason');
      if (resDifficultyReason) {
        resDifficultyReason.textContent = (resultData.aiReport && resultData.aiReport.difficultyReason) ||
          (resultData.suggestedDifficulty ? `Continuing on Level ${resultData.suggestedDifficulty} (Gentle Pace).` : "Continuing comfortably on Level 2 (Gentle Pace).");
      }
    },

    // Hydrate Progress Page
    hydrateProgressPage: function () {
      const user = this.getActiveUser();
      let history;
      try {
        history = JSON.parse(localStorage.getItem('sahaaya_history')) || SAHAAYA_DEFAULT_HISTORY;
      } catch (e) {
        history = SAHAAYA_DEFAULT_HISTORY;
      }

      // History Table render
      const tbody = document.getElementById('progress-history-tbody');
      if (tbody) {
        tbody.innerHTML = '';
        history.forEach(item => {
          const tr = document.createElement('tr');
          tr.className = 'progress-table-row';
          tr.innerHTML = `
            <td style="padding: 1.1rem 1rem; font-weight: 600; color: var(--primary-navy);">
              <div style="font-size: var(--text-base); font-weight: 700;">${item.gameName}</div>
              <div style="font-size: 0.9rem; color: var(--text-muted);">${item.date} • ${item.time}</div>
            </td>
            <td style="padding: 1.1rem 1rem;">
              <span class="badge ${item.gameType === 'memory' ? 'badge-teal' : 'badge-blue'}">
                ${item.gameType === 'memory' ? 'Memory' : 'Attention'}
              </span>
            </td>
            <td style="padding: 1.1rem 1rem; font-weight: 800; font-size: 1.25rem; color: var(--primary-navy);">
              ${item.score}/100
            </td>
            <td style="padding: 1.1rem 1rem; font-weight: 600; color: var(--text-secondary);">
              ${item.accuracy}
            </td>
            <td style="padding: 1.1rem 1rem; font-weight: 600; color: var(--text-secondary);">
              ${item.duration}
            </td>
            <td style="padding: 1.1rem 1rem;">
              <span class="badge badge-green">✔ ${item.status}</span>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }

      // Real-time AI Caregiver Summary Briefing
      const caregiverNoteEl = document.getElementById('caregiver-summary-text') || 
                              document.querySelector('.feedback-ai-box p');
      if (caregiverNoteEl && window.SahaayaAI && typeof window.SahaayaAI.getCaregiverSummary === 'function') {
        const liveCaregiverSummary = window.SahaayaAI.getCaregiverSummary(history, user);
        if (liveCaregiverSummary) {
          caregiverNoteEl.innerHTML = `<strong>Senior Note:</strong> ${liveCaregiverSummary}`;
        }
      }
    }
  };

  // Voice Assistance Modal Control
  window.openHelpModal = function () {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      if (window.speakText) {
        window.speakText("Welcome to Sahaaya Support. You can choose a cognitive activity, check your daily progress, or ask for voice assistance.");
      }
    }
  };

  window.closeHelpModal = function () {
    const modal = document.getElementById('help-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      if (window.stopSpeaking) window.stopSpeaking();
    }
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    window.SahaayaApp.hydrateUserUI();

    // Specific page initializers
    if (document.getElementById('res-score')) {
      window.SahaayaApp.hydrateResultPage();
    }

    if (document.getElementById('progress-history-tbody')) {
      window.SahaayaApp.hydrateProgressPage();
    }

    // Modal background close
    const modal = document.getElementById('help-modal');
    if (modal && typeof modal.addEventListener === 'function') {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeHelpModal();
        }
      });
    }
  });

})();
