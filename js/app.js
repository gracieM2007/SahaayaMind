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
    completeGameSession: function (gameType, score, accuracyStr, durationStr, customFeedback, telemetryPayload, levelInfo) {
      const activeUser = this.getActiveUser();
      const isMemory = gameType === 'memory';

      // 0. Resolve level progression info
      let lastLvl = null;
      try {
        lastLvl = JSON.parse(localStorage.getItem('sahaaya_last_completed_level') || 'null');
      } catch (e) {}

      const completedLvlNum = (levelInfo && levelInfo.level) || (telemetryPayload && telemetryPayload.level) || (lastLvl && lastLvl.gameType === gameType ? lastLvl.level : 1);
      const nextLvlNum = (levelInfo && levelInfo.nextLevel) || (lastLvl && lastLvl.gameType === gameType ? lastLvl.nextLevel : (completedLvlNum < 5 ? completedLvlNum + 1 : null));
      const isNewlyUnlocked = levelInfo && typeof levelInfo.newlyUnlocked !== 'undefined'
        ? levelInfo.newlyUnlocked
        : (lastLvl && lastLvl.gameType === gameType ? !!lastLvl.newlyUnlocked : false);

      const gameBaseTitle = isMemory ? "Memory Recall & Match" : "Attention & Pattern Focus";
      const gameTitle = `${gameBaseTitle} (Level ${completedLvlNum})`;

      // 1. Fetch user history for longitudinal comparison
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem('sahaaya_history') || '[]');
      } catch (e) {
        history = [];
      }

      // 2. Perform 3-factor cognitive calculation & continuous device streak update
      let perfReport = null;
      let streakRecord = null;
      if (typeof window.MemoryLogistics !== 'undefined') {
        const timeSec = telemetryPayload && telemetryPayload.timeSeconds ? telemetryPayload.timeSeconds : (parseInt(durationStr, 10) || 45);
        const attempts = telemetryPayload && telemetryPayload.attempts ? telemetryPayload.attempts : (telemetryPayload && telemetryPayload.moves ? telemetryPayload.moves : 5);
        const matches = telemetryPayload && telemetryPayload.matches ? telemetryPayload.matches : 4;
        const pairs = telemetryPayload && telemetryPayload.totalPairs ? telemetryPayload.totalPairs : 4;

        perfReport = window.MemoryLogistics.calculatePerformance(timeSec, attempts, matches, pairs);

        // Record activity continuously on this device forever
        const rec = window.MemoryLogistics.recordGameActivity({
          score: perfReport.overallScore,
          accuracyPct: perfReport.accuracyPct,
          durationSec: perfReport.timeSeconds,
          attempts: perfReport.attempts,
          gameType: gameType,
          gameName: gameTitle
        });
        streakRecord = rec.streak;
      }

      // 3. Perform AI analysis with fallback
      let aiAnalysis = null;
      if (typeof window.SahaayaAI !== 'undefined' && typeof window.SahaayaAI.analyzeSession === 'function') {
        try {
          aiAnalysis = window.SahaayaAI.analyzeSession({
            gameType: gameType,
            gameName: gameTitle,
            score: perfReport ? perfReport.overallScore : score,
            accuracy: perfReport ? perfReport.accuracyStr : accuracyStr,
            duration: perfReport ? perfReport.durationStr : durationStr,
            customFeedback: customFeedback,
            telemetry: telemetryPayload
          }, history, activeUser);
        } catch (aiErr) {
          console.warn('[SahaayaMind] AI Cognitive Engine fallback active:', aiErr);
        }
      }

      // 4. Construct rich session result
      const finalScore = perfReport ? perfReport.overallScore : (aiAnalysis ? aiAnalysis.overallScore : (score || (isMemory ? 94 : 88)));
      const finalAccuracy = perfReport ? perfReport.accuracyStr : (accuracyStr || (aiAnalysis ? aiAnalysis.accuracyStr : "95%"));
      const finalDuration = perfReport ? perfReport.durationStr : (durationStr || (aiAnalysis ? aiAnalysis.durationStr : "3m 15s"));
      const finalAttempts = perfReport ? perfReport.attempts : (telemetryPayload && telemetryPayload.moves ? telemetryPayload.moves : 5);

      const sessionResult = {
        gameName: gameTitle,
        gameType: gameType,
        completedLevel: completedLvlNum,
        nextLevelUnlocked: nextLvlNum,
        newlyUnlocked: isNewlyUnlocked,
        score: finalScore,
        maxScore: 100,
        accuracy: finalAccuracy,
        duration: finalDuration,
        attempts: finalAttempts,
        perfReport: perfReport,
        deviceStreak: streakRecord || (typeof window.MemoryLogistics !== 'undefined' ? window.MemoryLogistics.getDeviceStreak() : null),
        memoryScore: aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.memory.score : (isMemory ? finalScore : 84),
        attentionScore: aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.attention.score : (isMemory ? 88 : (score || 90)),
        speedScore: perfReport ? perfReport.timeEfficiencyPct : (aiAnalysis && aiAnalysis.domainScores ? aiAnalysis.domainScores.processingSpeed.score : 89),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        feedback: (perfReport && perfReport.seniorFeedback) || ((aiAnalysis && aiAnalysis.seniorFeedback) ? aiAnalysis.seniorFeedback : (customFeedback || (isMemory 
          ? "Exceptional memory recall today! You quickly identified matching patterns with high precision." 
          : "Fantastic concentration and speed! You sustained steady attention across all visual targets."))),
        recommendation: (perfReport && perfReport.recommendation) || ((aiAnalysis && aiAnalysis.recommendation) ? aiAnalysis.recommendation : (isMemory 
          ? "Great morning exercise. Next, relax your eyes and drink water to consolidate memory." 
          : "Superb focus! Rest for 10 minutes and enjoy your daily tea.")),
        // Rich AI metadata
        aiReport: aiAnalysis,
        confidence: aiAnalysis ? aiAnalysis.confidence : 0.88,
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
          completedLevel: completedLvlNum,
          date: sessionResult.date,
          time: sessionResult.timestamp,
          score: sessionResult.score,
          accuracy: sessionResult.accuracy,
          duration: sessionResult.duration,
          attempts: sessionResult.attempts,
          speedRating: (perfReport && perfReport.pacingStyle) || ((aiAnalysis && aiAnalysis.pacingSummary) ? aiAnalysis.pacingSummary.style : "Steady & Confident"),
          status: "Completed",
          memoryScore: sessionResult.memoryScore,
          attentionScore: sessionResult.attentionScore,
          speedScore: sessionResult.speedScore
        });
        localStorage.setItem('sahaaya_history', JSON.stringify(history.slice(0, 20)));

        // Update active user statistics
        activeUser.sessionsCompleted = (activeUser.sessionsCompleted || 0) + 1;
        activeUser.lastSession = "Just now (" + sessionResult.timestamp + ")";
        const prevScore = (typeof activeUser.overallScore === 'number' && activeUser.overallScore > 0) ? activeUser.overallScore : null;
        activeUser.overallScore = prevScore === null ? sessionResult.score : Math.min(99, Math.round((prevScore * 4 + sessionResult.score) / 5));
        activeUser.cognitiveLevel = `Level ${completedLvlNum}`;
        if (streakRecord) {
          activeUser.streakDays = streakRecord.currentStreak;
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

      // Synchronize persistent device streak
      const streakObj = window.MemoryLogistics ? window.MemoryLogistics.getDeviceStreak() : null;
      const currentStreak = (streakObj && typeof streakObj.currentStreak === 'number') 
        ? streakObj.currentStreak 
        : (user && typeof user.streakDays === 'number' ? user.streakDays : 0);
      document.querySelectorAll('.js-user-streak, .js-streak-days').forEach(el => {
        el.textContent = `${currentStreak} Days`;
      });

      // Update progress bar width
      document.querySelectorAll('.stat-tile .progress-bar-fill').forEach(el => {
        if (el.closest('.stat-tile')) {
          el.style.width = (user.overallScore || 0) + '%';
        }
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

      // Retrieve device streak
      let streakObj = null;
      let streakPerf = null;
      if (typeof window.MemoryLogistics !== 'undefined') {
        streakObj = window.MemoryLogistics.getDeviceStreak();
        streakPerf = window.MemoryLogistics.getStreakPerformanceSummary();
      }

      const resScore = document.getElementById('res-score');
      if (resScore) resScore.textContent = resultData.score;

      const resGameName = document.getElementById('res-game-name');
      if (resGameName) resGameName.textContent = resultData.gameName;

      const resAccuracy = document.getElementById('res-accuracy');
      if (resAccuracy) resAccuracy.textContent = resultData.accuracy;

      const resDuration = document.getElementById('res-duration');
      if (resDuration) resDuration.textContent = resultData.duration;

      // Attempts Stat Tile
      const resAttempts = document.getElementById('res-attempts-val');
      if (resAttempts) {
        resAttempts.textContent = `${resultData.attempts || 5} Moves`;
      }

      // Continuous Device Streak Stat Tile
      const resStreak = document.getElementById('res-streak-val');
      if (resStreak) {
        const streakDays = (streakObj && typeof streakObj.currentStreak === 'number') 
          ? streakObj.currentStreak 
          : (user && typeof user.streakDays === 'number' ? user.streakDays : 0);
        resStreak.textContent = `🔥 ${streakDays} Days`;
      }
      const resStreakCaption = document.getElementById('res-streak-caption');
      if (resStreakCaption && streakObj) {
        const avgScoreVal = streakPerf && typeof streakPerf.avgScore === 'number' ? streakPerf.avgScore : 0;
        resStreakCaption.textContent = `Best: ${streakObj.bestStreak || 0} Days • Streak Avg: ${avgScoreVal}/100`;
      }

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

      // Render 3-Factor Breakdown if element exists
      const factorsEl = document.getElementById('res-3factor-breakdown');
      if (factorsEl && resultData.perfReport) {
        const p = resultData.perfReport;
        factorsEl.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div style="background: rgba(13, 148, 136, 0.08); padding: 0.9rem; border-radius: 8px; border-left: 4px solid var(--accent-teal);">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-teal-dark);">1. ACCURACY RATE (45%)</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary-navy);">${p.accuracyStr}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">+${p.pointsBreakdown.accuracyPoints} score points</div>
            </div>
            <div style="background: rgba(37, 99, 235, 0.08); padding: 0.9rem; border-radius: 8px; border-left: 4px solid var(--accent-blue);">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--accent-blue);">2. ATTEMPTS TAKEN (30%)</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary-navy);">${p.attempts} moves</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">Optimal: ${p.optimalAttempts} • +${p.pointsBreakdown.attemptsPoints} pts</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.08); padding: 0.9rem; border-radius: 8px; border-left: 4px solid var(--warning-amber);">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--warning-amber);">3. TIME PACING (25%)</div>
              <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary-navy);">${p.durationStr}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${p.pacingStyle} • +${p.pointsBreakdown.timePoints} pts</div>
            </div>
          </div>
        `;
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

      // 5-Level Progression Banner & Next-Level CTA
      const currentLvl = resultData.completedLevel || 1;
      const nextLvl = resultData.nextLevelUnlocked;
      const gameType = resultData.gameType || 'memory';
      const gamePage = gameType === 'attention' ? 'attention.html' : 'memory.html';
      const nextSlot = document.getElementById('result-next-level-slot');

      if (nextSlot) {
        if (nextLvl && nextLvl <= 5) {
          const nextConfig = window.SahaayaLevels ? window.SahaayaLevels.getConfig(gameType, nextLvl) : null;
          const nextName = nextConfig ? nextConfig.name : `Level ${nextLvl}`;
          nextSlot.innerHTML = `
            <div class="result-level-unlocked-banner" role="region" aria-label="Next Level Unlocked">
              <div class="result-level-unlocked-info">
                <span class="badge badge-teal" style="background: rgba(94, 234, 212, 0.25); color: #5EEAD4; border: 1px solid #5EEAD4;">
                  🔓 Progression Unlocked!
                </span>
                <h3>Level ${nextLvl}: ${nextName} is Ready!</h3>
                <p>Outstanding job clearing Level ${currentLvl}. Level ${nextLvl} has been unlocked for your cognitive training.</p>
              </div>
              <div>
                <a href="${gamePage}?level=${nextLvl}" class="senior-btn senior-btn-accent" id="btn-next-level-banner" style="font-size: var(--text-lg); padding: 0.95rem 2rem; white-space: nowrap;">
                  ▶ Play Level ${nextLvl} Now →
                </a>
              </div>
            </div>
          `;
        } else if (currentLvl >= 5) {
          nextSlot.innerHTML = `
            <div class="result-level-unlocked-banner" style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%); border-color: #A5B4FC;">
              <div class="result-level-unlocked-info">
                <span class="badge badge-teal" style="background: rgba(165, 180, 252, 0.25); color: #C7D2FE; border: 1px solid #A5B4FC;">
                  🏆 Cognitive Mastery
                </span>
                <h3 style="color: #FFFFFF !important;">All 5 Levels Conquered!</h3>
                <p style="color: #E0E7FF !important;">Tremendous dedication! You have successfully completed all 5 levels of ${gameType === 'attention' ? 'Attention' : 'Memory'} challenges.</p>
              </div>
              <div>
                <a href="${gamePage}?level=5" class="senior-btn senior-btn-accent" style="font-size: var(--text-lg); padding: 0.95rem 2rem;">
                  🔄 Replay Master Level 5
                </a>
              </div>
            </div>
          `;
        }
      }

      // Update primary next-level CTA button
      const playNextBtn = document.getElementById('btn-play-next-level');
      if (playNextBtn) {
        if (nextLvl && nextLvl <= 5) {
          playNextBtn.style.display = 'block';
          playNextBtn.href = `${gamePage}?level=${nextLvl}`;
          playNextBtn.innerHTML = `▶ Play Next Level (Level ${nextLvl}) →`;
        } else {
          playNextBtn.style.display = 'block';
          playNextBtn.href = `${gamePage}?level=${currentLvl}`;
          playNextBtn.innerHTML = `🔄 Replay Level ${currentLvl} →`;
        }
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

      // Device Streak & Streak Performance
      if (typeof window.MemoryLogistics !== 'undefined') {
        const streakPerf = window.MemoryLogistics.getStreakPerformanceSummary();
        const streakCountEl = document.getElementById('progress-streak-count');
        if (streakCountEl) streakCountEl.textContent = `${streakPerf.currentStreak} Days`;

        const streakBestEl = document.getElementById('progress-streak-best');
        if (streakBestEl) streakBestEl.textContent = `${streakPerf.bestStreak} Days Best`;

        const streakAvgScoreEl = document.getElementById('progress-streak-avg-score');
        if (streakAvgScoreEl) streakAvgScoreEl.textContent = `${streakPerf.avgScore}/100`;

        const streakAvgAccEl = document.getElementById('progress-streak-avg-acc');
        if (streakAvgAccEl) streakAvgAccEl.textContent = `${streakPerf.avgAccuracy}%`;

        const streakMilestoneEl = document.getElementById('progress-streak-milestone');
        if (streakMilestoneEl) {
          streakMilestoneEl.innerHTML = `<span style="font-size:1.4rem;">${streakPerf.milestone.icon}</span> <strong>${streakPerf.milestone.title}</strong> — ${streakPerf.milestone.desc}`;
        }
      }

      // History Table render
      const tbody = document.getElementById('progress-history-tbody');
      if (tbody) {
        tbody.innerHTML = '';
        if (!history || history.length === 0) {
          const emptyTr = document.createElement('tr');
          emptyTr.innerHTML = `
            <td colspan="7" style="padding: 2.75rem 1rem; text-align: center; color: var(--text-muted); font-size: 1.05rem;">
              🌱 No activity sessions recorded yet. Play your first Memory or Attention game to begin tracking your progress!
            </td>
          `;
          tbody.appendChild(emptyTr);
        } else {
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
                ${item.attempts || 0} moves
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
