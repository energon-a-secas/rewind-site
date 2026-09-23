// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Room Compass rendering. Projector-first: large type, high contrast, a live
 * horizontal bar compass that reuses the same label + track + fill visual
 * language as the solo Instinct compass (js/behavior/render.js renderCompass),
 * but for group counts instead of one person's picks.
 */
import { PROFILES } from '../exercises/profiles.js';
import {
  state, STYLE_KEYS, currentSituation, situationStyles,
  countOf, roundTally, roundTotal, cumulativeTally, sessionTotal, roundsCounted,
} from './state.js';

const ROOT = () => document.getElementById('room-app');

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const NO_WRONG = `<div class="room-banner" role="note">
  <span class="room-banner-dot"></span>
  A mirror, not a scorecard. No pick is wrong; the room is mapping instincts, not grading them.
</div>`;

/**
 * A set of compass bars from a tally. `keys` fixes the order and which
 * archetypes are shown (round view shows only the hand's four; cumulative
 * shows all six so blind spots read as zeros).
 */
function compassBars(tally, keys, total) {
  const max = Math.max(1, ...keys.map((k) => tally[k] || 0));
  const denom = total || 1;
  return keys.map((key) => {
    const p = PROFILES[key];
    const n = tally[key] || 0;
    const pct = Math.round((n / max) * 100);
    const share = Math.round((n / denom) * 100);
    return `<div class="room-compass-row">
      <div class="room-compass-label" style="color:${esc(p.color)}">${esc(p.name)}</div>
      <div class="room-compass-track">
        <div class="room-compass-fill" style="width:${pct}%;background:${esc(p.color)}"></div>
      </div>
      <div class="room-compass-value">${n}<span class="room-compass-of"> · ${share}%</span></div>
    </div>`;
  }).join('');
}

// ── Landing ──────────────────────────────────────────────────
export function renderLanding() {
  ROOT().innerHTML = `
    <section class="room-landing">
      <h2 class="room-heading">Room Compass</h2>
      <p class="room-lede">
        Solo Instinct maps one person. <strong>Room Compass maps the room.</strong>
        Project a situation, let everyone pick the card their gut reaches for
        (raise the physical card, or a show of hands), then tap the counters to
        tally each archetype. The picks aggregate into a live group compass, and
        after the rounds you get the cohort's collective lean and its blind spots.
      </p>
      ${NO_WRONG}
      <div class="room-facts">
        <div class="room-fact"><span class="room-fact-num">${state.deck.length}</span> situations to project</div>
        <div class="room-fact"><span class="room-fact-num">${STYLE_KEYS.length}</span> archetypes on the compass</div>
        <div class="room-fact"><span class="room-fact-num">0</span> setup — no login, no backend</div>
      </div>
      <div class="room-start-row">
        <button class="room-btn" onclick="_roomStart()">Start the session →</button>
      </div>
      <p class="room-hint">Session is in-memory only. Reset any time to start a fresh room.</p>
    </section>`;
}

// ── Round (projected prompt + cards + counters + live compass) ─
export function renderRound() {
  const sit = currentSituation();
  if (!sit) return;

  const styles = situationStyles(sit);
  const rTotal = roundTotal(sit.id);

  const cardsHtml = sit.hand.map((h) => {
    const p = PROFILES[h.style] || {};
    return `<div class="room-card" style="--style-color:${esc(p.color || 'var(--accent)')}">
      <div class="room-card-top">
        <span class="room-card-name">${esc(h.card)}</span>
        <span class="room-card-lean" style="color:${esc(p.color)}">${esc(p.name || h.style)}</span>
      </div>
      <p class="room-card-move">${esc(h.move || '')}</p>
    </div>`;
  }).join('');

  const countersHtml = styles.map((key) => {
    const p = PROFILES[key];
    const n = countOf(sit.id, key);
    const safe = esc(key);
    return `<div class="room-counter" style="--style-color:${esc(p.color)}">
      <div class="room-counter-name" style="color:${esc(p.color)}">${esc(p.name)}</div>
      <div class="room-counter-controls">
        <button class="room-step" aria-label="Remove a hand from ${esc(p.name)}"
          onclick="_roomBump('${safe}',-1)">−</button>
        <span class="room-counter-num" aria-live="polite"
          aria-label="${esc(p.name)}: ${n} hands">${n}</span>
        <button class="room-step" aria-label="Add a hand to ${esc(p.name)}"
          onclick="_roomBump('${safe}',1)">+</button>
      </div>
    </div>`;
  }).join('');

  const roundBars = compassBars(roundTally(sit), styles, rTotal);
  const isLast = state.index >= state.deck.length - 1;

  ROOT().innerHTML = `
    <section class="room-round">
      <div class="room-round-head">
        <div class="room-progress">Situation ${state.index + 1} of ${state.deck.length}</div>
        <div class="room-round-nav">
          <button class="room-nav-btn" onclick="_roomPrev()" ${state.index === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="room-nav-btn" onclick="_roomNext()">${isLast ? 'Finish → Room Compass' : 'Next situation →'}</button>
        </div>
      </div>

      <div class="room-prompt">${esc(sit.prompt)}</div>
      ${NO_WRONG}

      <div class="room-cards">${cardsHtml}</div>

      <div class="room-tally-block">
        <div class="room-tally-head">
          <h3 class="room-subhead">Tap hands raised</h3>
          <span class="room-round-total" aria-live="polite">${rTotal} hand${rTotal === 1 ? '' : 's'} counted this round</span>
        </div>
        <div class="room-counters">${countersHtml}</div>
      </div>

      <div class="room-compass-block">
        <h3 class="room-subhead">This round</h3>
        <div class="room-compass-bars" aria-live="polite">${roundBars}</div>
      </div>

      ${renderCumulativeStrip()}

      <div class="room-facilitator">
        <div class="room-facilitator-head">Facilitator note</div>
        <p class="room-facilitator-note">${esc(sit.facilitatorNote || '')}</p>
        <div class="room-discussion-title">Discussion</div>
        <ul class="room-discussion">
          ${(sit.discussion || []).map((q) => `<li>${esc(q)}</li>`).join('')}
        </ul>
      </div>

      <div class="room-reset-row">
        <button class="room-btn room-btn--ghost" onclick="_roomReset()">Reset session</button>
      </div>
    </section>`;
}

/** A compact cumulative compass shown under each round so the group sees the running whole. */
function renderCumulativeStrip() {
  const total = sessionTotal();
  if (total === 0) return '';
  const bars = compassBars(cumulativeTally(), STYLE_KEYS, total);
  return `<div class="room-compass-block room-compass-block--cumulative">
    <h3 class="room-subhead">Session so far
      <span class="room-cumulative-meta">${total} hands · ${roundsCounted()} of ${state.deck.length} rounds</span>
    </h3>
    <div class="room-compass-bars" aria-live="polite">${bars}</div>
  </div>`;
}

// ── Final Room Compass ───────────────────────────────────────
export function renderFinal() {
  const total = sessionTotal();
  const tally = cumulativeTally();
  const ordered = STYLE_KEYS.map((k) => [k, tally[k]]).sort((a, b) => b[1] - a[1]);
  const topKey = ordered[0][0];
  const topProfile = PROFILES[topKey];
  const zeroKeys = ordered.filter(([, n]) => n === 0).map(([k]) => k);

  const bars = compassBars(tally, STYLE_KEYS, total || 1);

  let readPara;
  if (total === 0) {
    readPara = `No hands were counted, so there's nothing to read yet. Run the
      rounds again and tap a counter for each show of hands.`;
  } else {
    readPara = `As a room, you leaned most toward
      <strong style="color:${esc(topProfile.color)}">${esc(topProfile.name)}</strong>
      — ${esc(topProfile.strength.toLowerCase())}. That collective instinct is a
      real strength. The shadow the room shares to watch:
      ${esc(topProfile.weakness.toLowerCase())}.`;
  }

  let blindSpotHtml = '';
  if (total > 0 && zeroKeys.length) {
    const names = zeroKeys.map((k) => `<strong style="color:${esc(PROFILES[k].color)}">${esc(PROFILES[k].name)}</strong>`);
    const list = names.length === 1 ? names[0]
      : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    blindSpotHtml = `<div class="room-blindspot">
      <span class="room-blindspot-icon">◍</span>
      Blind spot: not one hand in the room reached for ${list}. Not wrong, but
      worth asking together when that instinct would have served you.
    </div>`;
  }

  ROOT().innerHTML = `
    <section class="room-final">
      <h2 class="room-heading">The Room Compass</h2>
      <p class="room-final-sub">${sessionTotal()} hands across ${roundsCounted()} of ${state.deck.length} rounds. A mirror, not a scorecard.</p>
      <div class="room-compass-bars room-compass-bars--final">${bars}</div>
      <p class="room-final-read">${readPara}</p>
      ${blindSpotHtml}
      <div class="room-final-actions">
        <button class="room-btn room-btn--ghost" onclick="_roomReview()">← Back to rounds</button>
        <button class="room-btn" onclick="_roomReset()">Run a fresh room</button>
      </div>
    </section>`;
}
