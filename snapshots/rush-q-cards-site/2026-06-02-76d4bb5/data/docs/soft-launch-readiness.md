# Rush Q Cards -- Soft Launch Readiness Report

**Date:** 2026-03-08
**Assessed by:** Product/QA audit (automated)
**Scope:** Browser game at `/game/index.html`, hub at `/index.html`, supporting pages

---

## Executive Summary

The game is in surprisingly good shape for a soft launch. The core gameplay loop (setup, play cards, assign people, trade, end turn, AI turns, quarter progression, game over) is fully implemented and functional. The codebase is well-structured across 12 JS modules with clear separation of concerns. There are no hard blockers that prevent collecting useful feedback, but several high-priority items would significantly improve the quality of that feedback.

**Verdict: Ready for soft launch with the high-priority items addressed (1-2 days of work).**

---

## 1. Launch Blockers (must fix before any users see it)

### 1.1 Convex URL hardcoded in client-side code
- **File:** `js/game/state.js:9`
- **Issue:** The Convex deployment URL (`https://resilient-vole-425.convex.cloud`) is hardcoded in the source. This is a public-facing endpoint. While Convex queries are read-only and the data is just card definitions, the URL is also in `.env.local` which is gitignored but the JS file ships to the browser regardless. This is not a security risk per se (the data is public), but it means the game depends on a live Convex backend on every load.
- **Impact:** If the Convex deployment is paused, rate-limited, or deleted, the game still works (fallback to `data/cards.json` exists in `data.js:27-39`). However, the `esm.sh` CDN import of the Convex client (`import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser"`) adds a network dependency and ~50-100ms latency on first load even when falling back to static JSON.
- **Recommendation:** For soft launch, consider removing the Convex dependency from the game module entirely and loading exclusively from `data/cards.json`. The Convex backend adds no value for a single-player browser game. Keep Convex for the card browser or admin tools if desired.
- **Effort:** S (remove 1 import, simplify `loadCards` in `data.js`)

### 1.2 No global error boundary
- **File:** `js/game/app.js`
- **Issue:** If any async operation in the game engine throws (card effect handler, AI turn, Convex query timeout), the error is unhandled and the game silently breaks. The `try/catch` in `advanceToNextPlayer` (engine.js:158-178) catches errors during AI turns and sets `state.animating = false`, which is good. But errors during `playCard`, `resolveEvent`, or `showChoiceDialog` bubble up unhandled.
- **Impact:** A player could get stuck mid-turn with no way to recover except resetting.
- **Recommendation:** Add a `window.onerror` / `window.onunhandledrejection` handler that: (a) logs the error, (b) sets `state.animating = false`, (c) shows a toast with "Something went wrong -- try ending your turn or resetting", (d) re-renders.
- **Effort:** S

---

## 2. High Priority (fix before gathering feedback)

### 2.1 card images gitignored -- deployment will be empty
- **File:** `.gitignore` line 2: `assets/cards/`
- **Issue:** The 126 card PNG images (34 MB total) are gitignored. Any deployment from git (GitHub Pages, Netlify, Cloudflare Pages) will have an empty `assets/cards/` directory. The game itself does NOT depend on these images for gameplay (it uses the HTML-rendered `renderCardHTML` component), but the card browser page (`/cards/`) renders card images, and the project detail modal shows person images via `cardImg()`.
- **Impact:** Card browser page broken on deployed version. Game itself works fine since it uses the CSS card component.
- **Recommendation:** Either (a) remove `assets/cards/` from `.gitignore` and commit the images (34MB is manageable for git LFS), or (b) host images on a CDN and update `cardImagePath()`, or (c) for soft launch, accept that card browser shows broken images and focus feedback on the game page only.
- **Effort:** S (option a or c), M (option b)

### 2.2 `esm.sh` CDN dependency for Convex client
- **File:** `js/game/state.js:4`
- **Issue:** `import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser"` loads the Convex client from a third-party CDN on every page load. If esm.sh is down or slow, the game module fails to load entirely (ES module imports are blocking).
- **Impact:** Complete game failure if CDN is unavailable. Even when Convex falls back to static JSON, the import must succeed first.
- **Recommendation:** Either vendor the Convex browser bundle locally or remove the import entirely (see 1.1).
- **Effort:** S

### 2.3 No feedback mechanism
- **Issue:** There is no way for soft launch testers to report bugs, confusion, or suggestions from within the game.
- **Recommendation:** Add a minimal floating feedback button that opens a form (Google Form, Tally, or even a mailto link). Capture: (a) what happened, (b) what they expected, (c) current game state snapshot (quarter, rep, hand size). A simple `JSON.stringify` of key state fields attached to the form would be invaluable for debugging.
- **Effort:** S (mailto link), M (embedded form with state snapshot)

### 2.4 `color-mix()` and `oklch` CSS compatibility
- **Files:** `css/game.css` (37 uses of `color-mix`), `css/card-component.css` (8 uses), `css/shared.css` (1 use of `oklch`)
- **Issue:** `color-mix(in srgb, ...)` requires Chrome 111+, Firefox 113+, Safari 16.2+. `oklch` in gradients requires Chrome 111+, Safari 15.4+. Users on older browsers will see broken colors (transparent instead of tinted backgrounds, no header gradient).
- **Impact:** Visual degradation only, not functional. Most soft launch testers will be on modern browsers. But project rows, badges, and AI panels all use `color-mix` for their tinted backgrounds -- without it, many UI elements appear invisible.
- **Recommendation:** For soft launch, add fallback `background` declarations before each `color-mix` usage on critical elements (project rows, badges, action buttons). Or accept the limitation and document "Chrome 111+ / Safari 16.2+ required" in the feedback invite.
- **Effort:** M (fallbacks for ~45 declarations) or S (document requirement)

### 2.5 Mobile experience is functional but cramped
- **Files:** `css/game.css:1137-1204`
- **Assessment:** Responsive CSS exists and covers 768px and 480px breakpoints. The layout correctly stacks to single-column on mobile. Touch targets meet 44px minimum on action buttons. Card fan adjusts width (120px at 768px, 105px at 480px). Hover previews are disabled on mobile. Drag-and-drop for assigning people does NOT work on touch (no touch event handlers).
- **Impact:** Players cannot drag people to projects on mobile -- they must use the Assign modal button instead. This works but is not discoverable.
- **Recommendation:** For soft launch, add a brief note in the tutorial hint about using the Assign button on mobile. Touch drag support can wait.
- **Effort:** S (tutorial text), L (touch drag implementation)

### 2.6 Resume game has no state validation
- **File:** `js/game/state.js:75-85`, `js/game/app.js:11-17`
- **Issue:** `loadSaved` does a raw `Object.assign(s, saved)` from localStorage. If the saved state was from a different code version (e.g., missing `quarterFlags.noBonusProject`, missing `pendingEffects` on players), the game will crash on first access of the missing property. There is no schema version check.
- **Impact:** After any code update that changes state shape, all existing saved games become ticking time bombs.
- **Recommendation:** Add a `stateVersion` field. On load, if versions don't match, discard the save and show "Your saved game is from an older version and has been cleared." This is critical for a soft launch where code changes are frequent.
- **Effort:** S

---

## 3. Nice to Have (can launch without)

### 3.1 No undo / back button
- Players can accidentally play the wrong card or assign the wrong person. There is no undo. The confirm-before-action pattern only exists for Reset (window.confirm). Playing a card is immediate on click.
- **Recommendation:** Add a confirmation step for high-impact actions (playing Power cards, trading), or implement a 1-step undo buffer. Low priority for soft launch.
- **Effort:** M

### 3.2 Game log is not exportable
- The game log (last 200 entries, capped in `state.js:99`) is viewable in the right panel but cannot be copied or downloaded. For bug reports, this data would be useful.
- **Recommendation:** Add a "Copy Log" button in the log panel header.
- **Effort:** S

### 3.3 AI delay slows down testing
- AI turns have a fixed 400ms delay per action (`ai.js:12`). With 4 AI opponents doing multiple actions each, end-of-turn can take 5-10 seconds. For playtesting, this is tedious.
- **Recommendation:** Add a speed toggle (1x / 2x / instant) in the top bar.
- **Effort:** S

### 3.4 No game statistics / history
- After game over, there is no summary of what happened (projects completed, cards played, events survived). Just a final reputation scoreboard.
- **Recommendation:** Track basic stats during play (projects completed, cards played by type, events negated) and show them on the game over screen.
- **Effort:** M

### 3.5 Keyboard shortcuts not documented in UI
- Shortcuts exist (A=assign, T=trade, E=end turn, P/Enter=play, V=view, Escape=close) but are only visible as small `<kbd>` tags on action buttons. No help overlay.
- **Recommendation:** Add a "?" shortcut that shows a keyboard shortcut overlay.
- **Effort:** S

### 3.6 Card effect resolution can be opaque
- Some skill cards resolve via substring matching on `effectType` or `skill` text (effects.js, rules.js). If a card's text doesn't match any pattern, it falls through to a generic "Played X" message with no actual effect. Players may not realize their card did nothing.
- **Recommendation:** Audit all 125 active cards to ensure every card with `quantity > 0` has a matching handler. Add a warning log entry when a card falls through to the default handler.
- **Effort:** M

### 3.7 Accessibility improvements
- Good foundations: skip link, ARIA roles on log and modals, focus-visible outlines, keyboard navigation on hand cards and market strips, focus trapping in modals, prefers-reduced-motion and prefers-contrast media queries.
- Missing: screen reader announcements for game state changes (quarter transitions, AI actions). The `aria-live="polite"` on the game log is a good start but the log text uses emoji markers that screen readers will read verbosely.
- **Effort:** M

### 3.8 The 7 navigation pages are a lot for a game
- The hub page links to 7 sections (Play, Cards, Rules, Rulebook, Balance, Analysis, Exercises). For soft launch, consider hiding Balance, Analysis, and Exercises from the nav -- they are design reference material, not player-facing content.
- **Effort:** S

---

## 4. Feedback Collection Plan

### Minimum viable feedback (do this)
1. **Add a floating feedback button** on the game page that links to a Google Form or Tally form with fields:
   - What were you trying to do?
   - What happened instead?
   - How confusing was the game? (1-5 scale)
   - Any other thoughts?
   - Auto-filled hidden field: browser user agent

2. **Add a game state snapshot** to the feedback form as a hidden field:
   ```
   Q${quarter} | Rep: ${rep} | Hand: ${handSize} | Projects: ${activeCount} | Phase: ${turnPhase}
   ```

3. **Structured playtest questions** to send alongside the link:
   - Did you understand what to do on your first turn without reading the rules?
   - At what point (if any) did you feel stuck or confused?
   - Did you feel like you had meaningful choices, or was the game playing itself?
   - How long did a full game take? Did it feel too long, too short, or about right?
   - Did you notice any bugs or visual glitches?
   - Would you play again? Why or why not?

### Nice to have for feedback
- Session recording (e.g., PostHog, LogRocket) -- overkill for soft launch
- Analytics events (game started, game completed, game abandoned at quarter X) -- useful but adds complexity
- Replay system (serialize all game actions) -- significant effort, defer

### What to watch for in early feedback
- **Drop-off point:** Do players finish games or abandon mid-way? At which quarter?
- **Confusion signals:** Do players understand the assign/trade mechanics? Do they use markets?
- **Balance signals:** Are AI opponents too easy/hard? Do certain cards feel overpowered or useless?
- **Engagement:** Do players start a second game?

---

## 5. Deployment Recommendation

### Simplest path: Netlify or Cloudflare Pages

**Why not GitHub Pages:** The nav links use `data-route` attributes with absolute paths (`/game/`, `/cards/`). The `nav.js` script rewrites these at runtime based on `location.pathname`. This works on any server where the site is at the root, but GitHub Pages projects deploy to `username.github.io/repo-name/` which breaks the path detection unless the base path is configured. Netlify and Cloudflare Pages serve at the root by default.

**Deployment steps (Netlify):**
1. Remove `assets/cards/` from `.gitignore` (or accept broken card browser images)
2. Push to a GitHub/GitLab repo
3. Connect repo to Netlify, set publish directory to `/` (root)
4. No build command needed -- it is all static files
5. Set custom domain if desired

**Deployment steps (Cloudflare Pages):**
1. Same as Netlify but use Cloudflare Pages dashboard
2. Publish directory: `/` (root)
3. No build command

**Pre-deployment checklist:**
- [ ] Remove or vendor the `esm.sh` Convex import (blocker 1.1 / 2.2)
- [ ] Add error boundary (blocker 1.2)
- [ ] Decide on card images: commit to git, host on CDN, or accept broken card browser (2.1)
- [ ] Add state version check for saved games (2.6)
- [ ] Add feedback button/form (2.3)
- [ ] Test on Chrome, Firefox, Safari latest
- [ ] Test on mobile (iPhone Safari, Android Chrome)

**CORS considerations:** None. The game is fully static with no API calls (once Convex is removed). The `esm.sh` import is the only cross-origin request currently.

**Size budget:**
- HTML + CSS + JS (game): ~120 KB uncompressed
- `data/cards.json`: 140 KB
- Card images (if included): 34 MB (126 PNGs)
- Logo + OG image: ~300 KB
- Total without card images: ~560 KB (excellent)
- Total with card images: ~34.5 MB (acceptable, images load on demand)

---

## 6. Estimated Effort Summary

| # | Item | Priority | Effort | Notes |
|---|------|----------|--------|-------|
| 1.1 | Remove Convex dependency from game | Blocker | S | Remove import, simplify loadCards |
| 1.2 | Global error boundary | Blocker | S | window.onerror + toast + state recovery |
| 2.1 | Card images gitignored | High | S | Remove from .gitignore or accept broken card browser |
| 2.2 | esm.sh CDN dependency | High | S | Covered by 1.1 |
| 2.3 | Feedback mechanism | High | S-M | Google Form link + state snapshot |
| 2.4 | CSS color-mix fallbacks | High | S-M | Document browser requirement or add fallbacks |
| 2.5 | Mobile assign hint | High | S | Add note to tutorial |
| 2.6 | State version for saves | High | S | Add version field, clear on mismatch |
| 3.1 | Undo / confirmation | Nice | M | Defer to post-launch |
| 3.2 | Exportable game log | Nice | S | Copy to clipboard button |
| 3.3 | AI speed toggle | Nice | S | Configurable delay |
| 3.4 | Game statistics | Nice | M | Track and display on game over |
| 3.5 | Keyboard shortcut help | Nice | S | "?" overlay |
| 3.6 | Card effect audit | Nice | M | Verify all 125 cards resolve correctly |
| 3.7 | Accessibility polish | Nice | M | Screen reader improvements |
| 3.8 | Simplify nav for players | Nice | S | Hide design-reference pages |

**Estimated total for blockers + high priority: 1-2 days.**

---

## Technical Assessment Details

### What works well
- **Architecture:** Clean 12-module ES module split with clear responsibilities. State management is simple and effective.
- **Game engine:** Complete turn loop with proper phase management. Quarter progression, project completion, failed project cleanup, innovation tax, favor decay, Rush Q events, layoffs -- all implemented.
- **AI:** Competent opponents that prioritize staffing, play skill cards strategically, trade at markets, and manage favors when behind. Not brilliant but functional.
- **Save/resume:** localStorage persistence works. Resume button appears correctly.
- **Visual design:** Professional dark theme with good card type color coding. Card fan animation with parabolic spread is polished. Card play projection animation, Rush Q reveal with flip animation, and effect dialogs are well-executed.
- **Drag and drop:** People can be dragged to projects on desktop. Visual feedback on drag-over.
- **Keyboard shortcuts:** Full keyboard navigation for core actions.
- **Accessibility foundations:** Skip link, ARIA roles, focus trapping, reduced motion support, high contrast support.
- **Budget mode:** Optional CapEx/OpEx system is fully implemented as a toggleable variant. Good for advanced players.
- **Content:** 125 cards with rich data (skill text, flavor text, emoji, stats, effect types). Quick rules page is clear and well-written.

### Potential risks
- **State corruption:** The `Object.assign` save/load pattern means any accidental mutation of nested objects in state (arrays, assignments object) could cause subtle bugs. This is a known pattern risk with mutable shared state.
- **Card effect fallthrough:** The effect resolution chain (named handler -> subcategory handler -> effectType substring match -> default) is fragile. A typo in card data could cause a card to silently do nothing.
- **Memory:** Game log capped at 200 entries (good). No other unbounded growth detected. Card data cached after first load (good).
- **Performance:** No obvious bottlenecks. Full DOM rebuild on every `render()` call is fine for this scale. No virtual DOM or diffing needed.
