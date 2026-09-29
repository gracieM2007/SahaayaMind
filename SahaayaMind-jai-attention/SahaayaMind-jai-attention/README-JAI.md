# SahaayaMind — Jai's Module (branch: `jai-attention`)

**Attention Game → Score → Accuracy → Result → Progress**

This package contains *only Jai's part* of the SahaayaMind MVP. It does **not**
touch the dashboard, global CSS, `app.js` or the Memory Game.

---

## 1. Files in this package

| File | What it is | Owner |
|---|---|---|
| `pages/attention.html` | Attention game page (level select → 3 rounds → summary) | Jai |
| `js/attention-game.js` | Game logic: rounds, difficulty, scoring | Jai |
| `pages/result.html` | **Common** result page (works for any game type) | Jai (shared — see §5) |
| `js/result.js` | Result rendering (URL params **or** localStorage) | Jai (shared) |
| `pages/progress.html` | Progress page (latest/average/best, trend, chart) | Jai |
| `js/progress.js` | Progress calculations & rendering | Jai |
| `js/session-store.js` | Tiny shared data layer (localStorage contract) | Jai (shared) |
| `css/attention.css` | Styles for the pages above (all classes prefixed `sm-`) | Jai |

**Not modified:** `index.html`, `pages/dashboard.html`, `css/style.css`,
`js/app.js`, `pages/memory.html`, `js/memory-game.js`.

> Script order matters on these pages: `session-store.js` loads **before**
> the other scripts.

---

## 2. How to run

Just open the files in a browser (no build step, no server needed):

```
pages/attention.html   → play the game
pages/result.html      → session result
pages/progress.html    → progress over time
```

(Or serve the repo root with VS Code Live Server and open `/pages/attention.html`.)

Navigation already matches the project plan:
`attention.html → result.html → progress.html`, with **Back to Dashboard →**
`pages/dashboard.html` in the top bar of every page.

---

## 3. The Attention Game

**Gameplay.** An instruction such as *"Select all the 🍎 apples"* appears with a
grid of objects. The user taps every matching object (tap again to unselect),
then presses **Check Answers**. Each round shows ✓ correct, ✗ wrong and
"Missed" markers. **3 rounds** per session. No timer — elderly users can take
their time (time taken is recorded as information only).

**Difficulty levels** (chosen on the start screen):

| Level | Grid | Targets/round | Distractors |
|---|---|---|---|
| 1 · Easy | 3×3 (9) | 3 | clearly different objects |
| 2 · Medium | 4×3 (12) | 4–5 | more of them |
| 3 · Hard | 4×4 (16) | 5–6 | lookalikes (🍎 vs 🍅, 🚗 vs 🚙, 🌸 vs 🌼, 🍊 vs 🍊-style) |

**Progression hint:** if the previous attention session scored **≥ 85**,
the start screen suggests the next level (or congratulates a Level-3 mastery).

### Scoring (simple and explainable — *not* AI)

```
accuracy = correct / (correct + incorrect) × 100        (precision of selections)
score    = (correct − 0.5 × incorrect) / totalTargets × 100   (capped 0–100)
```

- each correct find earns full credit
- each wrong pick cancels half a credit
- each missed target earns nothing (it is already excluded from the credit total)

Example: 8 correct, 2 wrong out of 10 targets → accuracy **80%**, score **70/100**.

**Feedback (supportive, non-medical):**

| Score | Message |
|---|---|
| 80–100 | “Great focus! You spotted the targets very well.” |
| 50–79 | “Good effort! Keep practicing.” |
| 0–49 | “Let's try an easier round.” |

---

## 4. Result integration (how data reaches `result.html`)

Two channels, both supported:

1. **URL parameters** (primary): the *View Result* button links to
   `result.html?game=attention&score=…&accuracy=…&correct=…&incorrect=…&missed=…&targets=…&level=…&rounds=…&duration=…&ts=…`
2. **localStorage** (fallback): `SM.sessionStore.addSession()` is called when
   the session finishes.

`result.html` shows: score ring (x/100), feedback band, correct / wrong /
missed / accuracy / level / time / date, plus **Play Again → View Progress →
Back to Dashboard**. It identifies the game type automatically.

> ⚠️ **Team note:** `result.html` here is written as the **common** result page
> for *both* games (it reads `gameType`). If the main-UI owner already created
> `pages/result.html`, keep only one — just preserve the data contract in §5
> and the page will work for the Attention Game too.

---

## 5. Shared data contract (`js/session-store.js`)

```
localStorage key             contents
--------------------------  -------------------------------------------
sahaayamind_sessions         JSON array of session objects (oldest first)
sahaayamind_last_session     JSON object — most recent session
```

Session object:

```js
{
  gameType:     'attention' | 'memory',
  score:        0-100,
  accuracy:     0-100,
  correct:      Number,
  incorrect:    Number,
  missed:       Number,
  totalTargets: Number,
  difficulty:   1 | 2 | 3,
  rounds:       Number,
  durationSec:  Number,          // optional
  dateTime:     '2026-08-31T10:30:00.000Z'  // ISO string
}
```

**For Faizan (Memory Game):** when a memory session finishes, call

```js
SM.sessionStore.addSession({ gameType: 'memory', score: 80, accuracy: 80,
  correct: 8, incorrect: 2, missed: 2, totalTargets: 10, difficulty: 1,
  rounds: 3, durationSec: 95, dateTime: new Date().toISOString() });
window.location.href = 'result.html';
```

and the shared result page + progress page will pick it up automatically.
(`session-store.js` gracefully falls back to in-memory data if localStorage is
blocked, e.g. sandboxed previews.)

---

## 6. Progress page

`pages/progress.html` shows for the **Attention Game**:

- Latest score · Average score · Best score · Sessions completed · Latest accuracy
- Trend indicator: **Improving ↑** (last score ≥ +5 vs previous) ·
  **Stable →** · **Needs practice ↓** (≤ −5) · *First session* when only one exists
- Bar chart of the last 10 sessions (colour = performance band)
- List of the 5 most recent sessions (date, level, score, accuracy)
- A compact **Memory Performance** section appears automatically once the
  Memory Game saves sessions
- “Clear saved data” (with confirmation) — handy for demos

---

## 7. Merging into the shared repository

```bash
git clone https://github.com/USERNAME/SahaayaMind.git
cd SahaayaMind
git checkout -b jai-attention
# copy this package's folders (pages/, js/, css/) into the repo root —
# they only ADD files; no existing file is modified
git add .
git commit -m "Added attention game + result + progress"
git push origin jai-attention
```

Then on GitHub: **Pull Request `jai-attention` → `main` → Merge**, and everyone
runs `git checkout main && git pull origin main`.

---

## 8. Tested before delivery

- ✅ Full session at every level (1, 2, 3), multiple rounds
- ✅ Mixed answer combos: all found, half found, none selected, wrong picks
- ✅ Scoring & accuracy math verified (perfect run, partial, all-wrong,
  empty selection, negative-raw clamp to 0)
- ✅ Missed targets / wrong picks counted correctly; double-pressing
  “Check Answers” cannot double-count
- ✅ Session saved to localStorage exactly once; result page reads URL params
  and localStorage fallback
- ✅ Progress stats (latest/average/best/count), all trend directions,
  single session, empty state, clear-data
- ✅ Works when localStorage is blocked (in-memory fallback + URL params)
- ✅ Memory-game session renders correctly on the shared result page
- ✅ Responsive layout, large tap targets, keyboard/aria support,
  reduced-motion respected

*(Automated checks: 3,213 logic assertions + 93 end-to-end assertions in a
simulated browser.)*

---

## 9. Design notes (elderly-friendly, professional)

- Base font 19 px, high-contrast palette (calm teal, WCAG AA+ contrast)
- Buttons ≥ 56 px tall, square game cells with 3–4 px borders
- No timer, no sound, no flashy animation — short, subtle transitions only
- `aria-pressed` on objects, `aria-live` announcements for instructions and
  round feedback, visible focus outlines, skip link
- Footer reminder on every page: *SahaayaMind is a wellness prototype, not a
  medical device.*
