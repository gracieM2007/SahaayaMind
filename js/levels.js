/* ==========================================================================
   SahaayaMind - 5-Level Cognitive Progression Engine
   Handles Level Unlocking, State Persistence, Rules, Celebrations & Dev Hooks
   Compatible with Faizan's Memory Game & Jay's Attention Game
   ========================================================================== */

(function () {
  'use strict';

  // Level Configurations for both games (5 progressive levels each)
  const LEVEL_CONFIGS = {
    memory: [
      {
        id: 1,
        name: "Gentle Starter",
        subtitle: "Warm up with everyday nature items",
        pairs: 4,
        totalCards: 8,
        cols: 4,
        timeTargetSec: 60,
        symbols: ['🍎', '🌻', '🐘', '🦚'],
        difficulty: "Gentle",
        description: "Find 4 pairs of familiar everyday Indian symbols at a relaxed pace."
      },
      {
        id: 2,
        name: "Mind Warming",
        subtitle: "Reinforce visual retention with sacred symbols",
        pairs: 6,
        totalCards: 12,
        cols: 4,
        timeTargetSec: 90,
        symbols: ['🍎', '🌻', '🐘', '🦚', '🔔', '🪔'],
        difficulty: "Easy",
        description: "Find 6 matching pairs including temple bell and holy diya."
      },
      {
        id: 3,
        name: "Steady Focus",
        subtitle: "Broaden visual-spatial memory pathways",
        pairs: 8,
        totalCards: 16,
        cols: 4,
        timeTargetSec: 120,
        symbols: ['🍎', '🌻', '🐘', '🦚', '🔔', '🪔', '🥥', '🧘'],
        difficulty: "Moderate",
        description: "Find 8 pairs across a 4x4 matrix for deeper cognitive exercise."
      },
      {
        id: 4,
        name: "Sharp Recall",
        subtitle: "Challenge rapid sequence pattern recall",
        pairs: 10,
        totalCards: 20,
        cols: 5,
        timeTargetSec: 150,
        symbols: ['🍎', '🌻', '🐘', '🦚', '🔔', '🪔', '🥥', '🧘', '🕊️', '🍵'],
        difficulty: "Challenging",
        description: "10 matching pairs testing sustained visual concentration."
      },
      {
        id: 5,
        name: "Master Mind",
        subtitle: "The ultimate cognitive wellness mastery",
        pairs: 12,
        totalCards: 24,
        cols: 6,
        timeTargetSec: 180,
        symbols: ['🍎', '🌻', '🐘', '🦚', '🔔', '🪔', '🥥', '🧘', '🕊️', '🍵', '🪷', '☀️'],
        difficulty: "Master",
        description: "Comprehensive 12-pair memory challenge for peak mental agility."
      }
    ],

    attention: [
      {
        id: 1,
        name: "Gentle Focus",
        subtitle: "Notice Golden Stars in a calm field",
        targetSymbol: '⭐',
        targetName: 'Golden Star',
        targetCount: 4,
        totalTiles: 8,
        cols: 4,
        distractors: ['🔷', '🟢'],
        difficulty: "Gentle",
        description: "Find and tap all 4 Golden Stars. Filter out simple shapes."
      },
      {
        id: 2,
        name: "Visual Scout",
        subtitle: "Spot Blue Diamonds among colorful distractors",
        targetSymbol: '🔷',
        targetName: 'Blue Diamond',
        targetCount: 5,
        totalTiles: 12,
        cols: 4,
        distractors: ['🔴', '🟢', '🟡', '🟣'],
        difficulty: "Easy",
        description: "Find 5 Blue Diamonds while filtering varied colored geometric tiles."
      },
      {
        id: 3,
        name: "Pattern Master",
        subtitle: "Distinguish Cherry Blossoms among botanicals",
        targetSymbol: '🌸',
        targetName: 'Cherry Blossom',
        targetCount: 6,
        totalTiles: 16,
        cols: 4,
        distractors: ['🌺', '🌷', '🌼', '🍀'],
        difficulty: "Moderate",
        description: "Find 6 Blossom flowers among subtly similar floral symbols."
      },
      {
        id: 4,
        name: "Keen Concentration",
        subtitle: "Track Bullseye targets in an active set",
        targetSymbol: '🎯',
        targetName: 'Bullseye Target',
        targetCount: 7,
        totalTiles: 20,
        cols: 5,
        distractors: ['🎪', '🎨', '🎲', '🧩', '🎈'],
        difficulty: "Challenging",
        description: "Find 7 Target symbols among diverse playful distractions."
      },
      {
        id: 5,
        name: "Grand Master",
        subtitle: "Peak selective attention with sacred illumination",
        targetSymbol: '🪔',
        targetName: 'Golden Diya',
        targetCount: 8,
        totalTiles: 24,
        cols: 6,
        distractors: ['🕯️', '💡', '🏮', '✨', '☀️', '⭐'],
        difficulty: "Master",
        description: "Find 8 Golden Diyas among glowing lights and luminaries."
      }
    ]
  };

  // Level Progression Storage Manager
  const SahaayaLevels = {
    configs: LEVEL_CONFIGS,

    // Storage Key scoped per user
    getStorageKey: function () {
      let userId = "default";
      try {
        const u = localStorage.getItem('sahaaya_active_user');
        if (u) {
          const parsed = JSON.parse(u);
          if (parsed && parsed.id) userId = parsed.id;
        }
      } catch (e) {}
      return 'sahaaya_levels_' + userId;
    },

    // Retrieve level progression for a game type
    getState: function (gameType) {
      const key = this.getStorageKey();
      let state = null;
      try {
        const raw = localStorage.getItem(key);
        if (raw) state = JSON.parse(raw);
      } catch (e) {}

      if (!state) {
        state = {
          memory: { unlockedLevel: 1, completedLevels: [] },
          attention: { unlockedLevel: 1, completedLevels: [] }
        };
      }

      if (!state[gameType]) {
        state[gameType] = { unlockedLevel: 1, completedLevels: [] };
      }

      // Ensure unlockedLevel is at least 1 and capped at 5
      if (!state[gameType].unlockedLevel || state[gameType].unlockedLevel < 1) {
        state[gameType].unlockedLevel = 1;
      }

      return state[gameType];
    },

    // Save level progression
    saveState: function (gameType, data) {
      const key = this.getStorageKey();
      let all = {};
      try {
        const raw = localStorage.getItem(key);
        if (raw) all = JSON.parse(raw);
      } catch (e) {}

      all[gameType] = data;
      try {
        localStorage.setItem(key, JSON.stringify(all));
      } catch (e) {}
    },

    // Check if a specific level is unlocked
    isUnlocked: function (gameType, levelNum) {
      const state = this.getState(gameType);
      return levelNum <= state.unlockedLevel;
    },

    // Check if level is already completed
    isCompleted: function (gameType, levelNum) {
      const state = this.getState(gameType);
      return state.completedLevels.some(c => c.level === levelNum);
    },

    // Get completion entry for level
    getCompletion: function (gameType, levelNum) {
      const state = this.getState(gameType);
      return state.completedLevels.find(c => c.level === levelNum) || null;
    },

    // Get current level from URL or highest unlocked
    getCurrentLevelFromUrl: function (gameType) {
      const params = new URLSearchParams(window.location.search);
      const lvlParam = parseInt(params.get('level'), 10);
      const state = this.getState(gameType);

      if (lvlParam && lvlParam >= 1 && lvlParam <= 5) {
        if (this.isUnlocked(gameType, lvlParam)) {
          return lvlParam;
        } else {
          // If user tried to jump to a locked level via URL, fallback to highest unlocked
          return state.unlockedLevel;
        }
      }
      // Default to highest unlocked level or level 1
      return Math.min(5, Math.max(1, state.unlockedLevel));
    },

    // Get config for level
    getConfig: function (gameType, levelNum) {
      const list = LEVEL_CONFIGS[gameType] || [];
      return list.find(l => l.id === levelNum) || list[0];
    },

    // Complete a level: Unlocks next level ONLY when this one is completed
    completeLevel: function (gameType, levelNum, accuracy, score) {
      const state = this.getState(gameType);
      const safeAcc = parseInt(accuracy, 10) || 90;
      const safeScore = parseInt(score, 10) || 88;

      // Calculate star rating (1 to 3 stars)
      let stars = 1;
      if (safeAcc >= 85 || safeScore >= 85) stars = 2;
      if (safeAcc >= 95 || safeScore >= 92) stars = 3;

      // Record completion
      const existingIdx = state.completedLevels.findIndex(c => c.level === levelNum);
      const completionData = {
        level: levelNum,
        stars: stars,
        accuracy: safeAcc,
        score: safeScore,
        completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (existingIdx >= 0) {
        // Keep best stars
        if (stars > state.completedLevels[existingIdx].stars) {
          state.completedLevels[existingIdx] = completionData;
        }
      } else {
        state.completedLevels.push(completionData);
      }

      // Unlock next level if this was the highest unlocked level
      let newlyUnlocked = null;
      if (levelNum >= state.unlockedLevel && levelNum < 5) {
        state.unlockedLevel = levelNum + 1;
        newlyUnlocked = levelNum + 1;
      }

      this.saveState(gameType, state);

      // Record latest completed level in temporary session result info
      try {
        localStorage.setItem('sahaaya_last_completed_level', JSON.stringify({
          gameType: gameType,
          level: levelNum,
          nextLevel: newlyUnlocked || (levelNum < 5 ? levelNum + 1 : null),
          stars: stars,
          newlyUnlocked: !!newlyUnlocked
        }));
      } catch (e) {}

      return {
        completedLevel: levelNum,
        newlyUnlocked: newlyUnlocked,
        currentUnlocked: state.unlockedLevel,
        stars: stars
      };
    },

    // Toast Alert for Locked Levels
    showLockedToast: function (levelNum, requiredLevel) {
      let toast = document.getElementById('level-toast-notification');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'level-toast-notification';
        toast.className = 'level-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        document.body.appendChild(toast);
      }

      const req = requiredLevel || (levelNum - 1);
      toast.innerHTML = `
        <span class="level-toast-icon" aria-hidden="true">🔒</span>
        <span><strong>Level ${levelNum} is Locked!</strong> Complete Level ${req} first to unlock.</span>
      `;
      toast.classList.add('show');

      if (window.speakText) {
        window.speakText(`Level ${levelNum} is currently locked. Complete Level ${req} to unlock it.`);
      }

      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    },

    // Render 5-Level Selector Component
    renderLevelSelector: function (containerEl, gameType, currentLevel, onSelectLevel) {
      if (!containerEl) return;
      const state = this.getState(gameType);
      const levels = LEVEL_CONFIGS[gameType] || [];

      const totalUnlocked = state.unlockedLevel;
      const pct = Math.round((totalUnlocked / 5) * 100);

      containerEl.innerHTML = `
        <div class="level-selector-section" role="region" aria-label="Game Difficulty Levels">
          <div class="level-selector-header">
            <div class="level-selector-title">
              <span aria-hidden="true">🏆</span>
              <span>5 Cognitive Levels</span>
              <span style="font-weight: 500; font-size: var(--text-sm); color: var(--text-muted); margin-left: 0.25rem;">
                (Unlocked: ${totalUnlocked} of 5)
              </span>
            </div>
            <div class="level-selector-progress-badge">
              <span aria-hidden="true">⭐</span>
              <span>Progress: ${totalUnlocked}/5 Levels</span>
            </div>
          </div>

          <div class="level-track" role="tablist" aria-label="Levels 1 to 5">
            ${levels.map(lvl => {
              const unlocked = lvl.id <= state.unlockedLevel;
              const isActive = lvl.id === currentLevel;
              const completion = this.getCompletion(gameType, lvl.id);
              const isCompleted = !!completion;

              let cardClasses = ['level-card'];
              if (isActive) cardClasses.push('active');
              if (isCompleted) cardClasses.push('completed');
              if (unlocked) cardClasses.push('unlocked');
              else cardClasses.push('locked');

              let statusText = "Locked 🔒";
              if (isActive) statusText = "Playing Now";
              else if (isCompleted) statusText = `Done (${completion.stars}⭐)`;
              else if (unlocked) statusText = "Ready to Play";

              let starsHtml = '';
              if (isCompleted) {
                const s = completion.stars || 1;
                starsHtml = '★'.repeat(s) + '☆'.repeat(3 - s);
              } else if (unlocked) {
                starsHtml = '☆☆☆';
              } else {
                starsHtml = '🔒';
              }

              const detail = gameType === 'memory' 
                ? `${lvl.pairs} Pairs`
                : `${lvl.targetCount} Targets`;

              return `
                <button type="button" 
                  class="${cardClasses.join(' ')}" 
                  id="level-card-${lvl.id}"
                  role="tab"
                  aria-selected="${isActive}"
                  aria-disabled="${!unlocked}"
                  aria-label="Level ${lvl.id}: ${lvl.name}, ${detail}, ${statusText}"
                  data-level="${lvl.id}">
                  
                  <div class="level-card-number-badge" aria-hidden="true">
                    ${isCompleted ? '✓' : (!unlocked ? '🔒' : lvl.id)}
                  </div>

                  <div class="level-card-name">
                    Level ${lvl.id}
                  </div>

                  <div class="level-card-info">
                    ${detail}
                  </div>

                  <div class="level-card-stars" aria-hidden="true">
                    ${starsHtml}
                  </div>

                  <span class="level-card-status-badge">
                    ${statusText}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Attach click events
      levels.forEach(lvl => {
        const btn = containerEl.querySelector(`#level-card-${lvl.id}`);
        if (!btn) return;

        btn.addEventListener('click', () => {
          const isLvlUnlocked = lvl.id <= state.unlockedLevel;
          if (!isLvlUnlocked) {
            this.showLockedToast(lvl.id, lvl.id - 1);
            return;
          }

          if (lvl.id !== currentLevel && typeof onSelectLevel === 'function') {
            // Update URL without full refresh for clean sharing
            const url = new URL(window.location.href);
            url.searchParams.set('level', lvl.id);
            window.history.replaceState({}, '', url.toString());

            onSelectLevel(lvl.id);
          }
        });
      });
    },

    // Show celebratory in-game level unlocked modal
    showLevelUnlockModal: function (completedLevel, newlyUnlockedLevel, gameType, onNextLevelClick, onViewResultClick) {
      let overlay = document.getElementById('level-completed-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'level-completed-overlay';
        overlay.className = 'level-completed-overlay';
        document.body.appendChild(overlay);
      }

      const nextConfig = newlyUnlockedLevel ? this.getConfig(gameType, newlyUnlockedLevel) : null;
      const gameLabel = gameType === 'memory' ? 'Memory Match' : 'Attention Focus';

      overlay.innerHTML = `
        <div class="level-completed-card" role="dialog" aria-modal="true" aria-labelledby="lvl-comp-title">
          <div class="level-completed-icon" aria-hidden="true">🌟</div>
          
          <h2 class="level-completed-title" id="lvl-comp-title">
            Level ${completedLevel} Completed!
          </h2>

          <p class="level-completed-desc">
            Outstanding mental focus! You successfully cleared all challenges in Level ${completedLevel}.
          </p>

          ${newlyUnlockedLevel && newlyUnlockedLevel <= 5 ? `
            <div class="level-completed-unlock-badge">
              <span aria-hidden="true">🔓</span>
              <span>Level ${newlyUnlockedLevel} (${nextConfig ? nextConfig.name : ''}) Unlocked!</span>
            </div>
          ` : `
            <div class="level-completed-unlock-badge" style="background: #FEF3C7; border-color: #F59E0B; color: #92400E;">
              <span aria-hidden="true">🏆</span>
              <span>You Have Mastered All 5 Levels!</span>
            </div>
          `}

          <div class="level-completed-actions">
            ${newlyUnlockedLevel && newlyUnlockedLevel <= 5 ? `
              <button type="button" class="senior-btn senior-btn-accent senior-btn-block" id="btn-modal-next-level" style="font-size: var(--text-lg); padding: 1rem 2rem;">
                ▶ Play Level ${newlyUnlockedLevel} Now →
              </button>
            ` : ''}

            <button type="button" class="senior-btn senior-btn-primary senior-btn-block" id="btn-modal-view-results" style="font-size: var(--text-base); padding: 0.85rem 1.5rem;">
              📊 View Full Cognitive Results →
            </button>

            <button type="button" class="senior-btn senior-btn-secondary senior-btn-block" id="btn-modal-replay" style="font-size: var(--text-base); padding: 0.75rem 1.5rem;">
              🔄 Replay Level ${completedLevel}
            </button>
          </div>
        </div>
      `;

      overlay.classList.add('active');

      if (window.speakText) {
        if (newlyUnlockedLevel) {
          window.speakText(`Congratulations! You completed Level ${completedLevel}. Level ${newlyUnlockedLevel} is now unlocked!`);
        } else {
          window.speakText(`Congratulations! You have completed all levels!`);
        }
      }

      // Attach button clicks
      const nextBtn = document.getElementById('btn-modal-next-level');
      if (nextBtn) {
        nextBtn.onclick = () => {
          overlay.classList.remove('active');
          if (typeof onNextLevelClick === 'function') onNextLevelClick(newlyUnlockedLevel);
        };
      }

      const resultsBtn = document.getElementById('btn-modal-view-results');
      if (resultsBtn) {
        resultsBtn.onclick = () => {
          overlay.classList.remove('active');
          if (typeof onViewResultClick === 'function') onViewResultClick();
        };
      }

      const replayBtn = document.getElementById('btn-modal-replay');
      if (replayBtn) {
        replayBtn.onclick = () => {
          overlay.classList.remove('active');
          if (typeof onNextLevelClick === 'function') onNextLevelClick(completedLevel);
        };
      }
    },

    // Hydrate Dashboard activity cards with 5-level status
    hydrateDashboardLevels: function () {
      const memState = this.getState('memory');
      const attState = this.getState('attention');

      // Update Memory Card
      const memCard = document.querySelector('.activity-card.memory-theme');
      if (memCard && !memCard.querySelector('.dashboard-level-strip')) {
        const memDots = [1, 2, 3, 4, 5].map(lvl => {
          const isDone = memState.completedLevels.some(c => c.level === lvl);
          const isCurrent = lvl === memState.unlockedLevel;
          const isUnlocked = lvl <= memState.unlockedLevel;
          let cls = 'dashboard-level-dot';
          if (isDone) cls += ' completed';
          else if (isCurrent) cls += ' current';
          else if (isUnlocked) cls += ' unlocked';

          const icon = isDone ? '✓' : (isUnlocked ? lvl : '🔒');
          return `<span class="${cls}" title="Level ${lvl}: ${isUnlocked ? 'Unlocked' : 'Locked'}">${icon}</span>`;
        }).join('');

        const strip = document.createElement('div');
        strip.className = 'dashboard-level-strip';
        strip.innerHTML = `
          <div class="dashboard-level-label">
            🏆 Level ${memState.unlockedLevel} / 5 Unlocked
          </div>
          <div class="dashboard-level-dots">
            ${memDots}
          </div>
        `;
        const startBtn = memCard.querySelector('#btn-start-memory') || memCard.querySelector('.senior-btn');
        if (startBtn) memCard.insertBefore(strip, startBtn);
      }

      // Update Attention Card
      const attCard = document.querySelector('.activity-card.attention-theme');
      if (attCard && !attCard.querySelector('.dashboard-level-strip')) {
        const attDots = [1, 2, 3, 4, 5].map(lvl => {
          const isDone = attState.completedLevels.some(c => c.level === lvl);
          const isCurrent = lvl === attState.unlockedLevel;
          const isUnlocked = lvl <= attState.unlockedLevel;
          let cls = 'dashboard-level-dot';
          if (isDone) cls += ' completed';
          else if (isCurrent) cls += ' current';
          else if (isUnlocked) cls += ' unlocked';

          const icon = isDone ? '✓' : (isUnlocked ? lvl : '🔒');
          return `<span class="${cls}" title="Level ${lvl}: ${isUnlocked ? 'Unlocked' : 'Locked'}">${icon}</span>`;
        }).join('');

        const strip = document.createElement('div');
        strip.className = 'dashboard-level-strip';
        strip.innerHTML = `
          <div class="dashboard-level-label">
            🎯 Level ${attState.unlockedLevel} / 5 Unlocked
          </div>
          <div class="dashboard-level-dots">
            ${attDots}
          </div>
        `;
        const startBtn = attCard.querySelector('#btn-start-attention') || attCard.querySelector('.senior-btn');
        if (startBtn) attCard.insertBefore(strip, startBtn);
      }
    }
  };

  // Expose to window for Faizan, Jay, and all components
  window.SahaayaLevels = SahaayaLevels;

  // Auto-run dashboard hydration if on dashboard
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.activity-card.memory-theme')) {
      SahaayaLevels.hydrateDashboardLevels();
    }
  });

})();
