// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
import { state } from './state.js';
import { SITUATIONS } from './data.js';
import { renderCardHTML } from '../shared/card-component.js';
import { PROFILES } from '../exercises/profiles.js';

const ROOT = () => document.getElementById('instinct-app');

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Look up a live card object by name for renderCardHTML. */
function cardByName(name) {
  return state.allCards.find(c => c.name === name)
    || { name, type: 'Soft', skill: '' };
}

const NO_WRONG = `<div class="instinct-banner" role="note">
  <span class="instinct-banner-dot"></span>
  No wrong answers — this maps your instincts, it does not grade them.
</div>`;

// ── Landing ──────────────────────────────────────────────────
export function renderLanding() {
  ROOT().innerHTML = `
    <section class="instinct-landing">
      <h2 class="instinct-heading">Instinct</h2>
      <p class="instinct-lede">
        Eight sharp workplace tensions. Each deals you four real Rush Q cards.
        Pick the one your gut reaches for — then see which management archetype
        that instinct leans toward. After eight rounds, your picks become a
        <strong>Style Compass</strong>.
      </p>
      ${NO_WRONG}
      <div class="instinct-modes">
        <button class="instinct-mode-card" onclick="_startInstinct('solo')">
          <div class="instinct-mode-icon">🧭</div>
          <div class="instinct-mode-title">Solo</div>
          <div class="instinct-mode-desc">Eight quick rounds, under ten minutes. Reflect on your own instincts and read your compass.</div>
        </button>
        <button class="instinct-mode-card" onclick="_startInstinct('facilitated')">
          <div class="instinct-mode-icon">👥</div>
          <div class="instinct-mode-title">Facilitated</div>
          <div class="instinct-mode-desc">Same rounds, no auto-advance. Discussion prompts and a facilitator note per situation. You control the pace.</div>
        </button>
      </div>
    </section>`;
}

// ── Round (prompt + hand) ────────────────────────────────────
export function renderRound() {
  const sit = state.deck[state.round];
  if (!sit) return;

  // If a pick was made this round, show the reflection instead.
  if (state.pickedThisRound) return renderReflection();

  const facilitated = state.mode === 'facilitated';
  const handHtml = sit.hand.map(h => {
    const card = cardByName(h.card);
    const moveHtml = h.move
      ? `<p class="instinct-hand-move">${esc(h.move)}</p>`
      : '';
    return `<div class="instinct-hand-card" onclick="_pickCard('${esc(h.card).replace(/'/g, "\\'")}')">
      ${renderCardHTML(card, { variant: 'mini' })}
      ${moveHtml}
    </div>`;
  }).join('');

  const facilitatorHtml = facilitated ? `
    <div class="instinct-facilitator">
      <div class="instinct-facilitator-head">Facilitator</div>
      <p class="instinct-facilitator-note">${esc(sit.facilitatorNote)}</p>
      <div class="instinct-discussion-title">Discussion</div>
      <ul class="instinct-discussion">
        ${sit.discussion.map(q => `<li>${esc(q)}</li>`).join('')}
      </ul>
    </div>` : '';

  ROOT().innerHTML = `
    <section class="instinct-round">
      <div class="instinct-progress">Situation ${state.round + 1} of ${state.deck.length}
        <span class="instinct-mode-tag">${facilitated ? 'Facilitated' : 'Solo'}</span>
      </div>
      <div class="instinct-prompt">${esc(sit.prompt)}</div>
      ${NO_WRONG}
      <div class="instinct-hand">${handHtml}</div>
      ${facilitatorHtml}
    </section>`;
}

// ── Reflection (after a pick) ────────────────────────────────
export function renderReflection() {
  const sit = state.deck[state.round];
  const pick = state.pickedThisRound;
  if (!sit || !pick) return;

  const profile = PROFILES[pick.style] || {};
  const reflection = sit.reflections[pick.style] || '';
  const facilitated = state.mode === 'facilitated';
  const card = cardByName(pick.card);
  const handEntry = sit.hand.find(h => h.card === pick.card);
  const moveHtml = handEntry?.move
    ? `<p class="instinct-reflect-move">You reached for: <span>${esc(handEntry.move)}</span></p>`
    : '';
  const isLast = state.round >= state.deck.length - 1;

  const facilitatorHtml = facilitated ? `
    <div class="instinct-facilitator">
      <div class="instinct-facilitator-head">Discussion</div>
      <ul class="instinct-discussion">
        ${sit.discussion.map(q => `<li>${esc(q)}</li>`).join('')}
      </ul>
      <p class="instinct-facilitator-note">${esc(sit.facilitatorNote)}</p>
    </div>` : '';

  ROOT().innerHTML = `
    <section class="instinct-reflection">
      <div class="instinct-progress">Situation ${state.round + 1} of ${state.deck.length}</div>
      <div class="instinct-prompt instinct-prompt--sm">${esc(sit.prompt)}</div>
      <div class="instinct-reflect-body">
        <div class="instinct-reflect-card">
          ${renderCardHTML(card, { variant: 'mini' })}
        </div>
        <div class="instinct-reflect-panel" style="--style-color:${esc(profile.color || 'var(--accent)')}">
          ${moveHtml}
          <div class="instinct-reflect-lean">
            Leans <strong>${esc(profile.name || pick.style)}</strong>
          </div>
          <p class="instinct-reflect-text">${esc(reflection)}</p>
          <div class="instinct-reflect-traits">
            <div class="instinct-trait instinct-trait--strength">
              <span class="instinct-trait-label">Strength</span>
              <span>${esc(profile.strength || '')}</span>
            </div>
            <div class="instinct-trait instinct-trait--shadow">
              <span class="instinct-trait-label">Shadow</span>
              <span>${esc(profile.weakness || '')}</span>
            </div>
          </div>
        </div>
      </div>
      ${facilitatorHtml}
      <div class="instinct-next-row">
        <button class="instinct-next" onclick="_nextRound()">
          ${isLast ? 'See your Style Compass →' : 'Next situation →'}
        </button>
      </div>
    </section>`;
}

// ── Compass (after 8 rounds) ─────────────────────────────────
export function renderCompass() {
  const tally = {};
  for (const key of Object.keys(PROFILES)) tally[key] = 0;
  for (const p of state.picks) {
    if (tally[p.style] != null) tally[p.style]++;
  }

  const max = Math.max(1, ...Object.values(tally));
  const total = state.picks.length || 1;

  // Ordered high → low for the bars.
  const ordered = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const topKey = ordered[0][0];
  const topProfile = PROFILES[topKey];
  const zeroKeys = ordered.filter(([, n]) => n === 0).map(([k]) => k);

  const barsHtml = ordered.map(([key, n]) => {
    const p = PROFILES[key];
    const pct = Math.round((n / max) * 100);
    return `<div class="instinct-compass-row">
      <div class="instinct-compass-label" style="color:${esc(p.color)}">${esc(p.name)}</div>
      <div class="instinct-compass-track">
        <div class="instinct-compass-fill" style="width:${pct}%;background:${esc(p.color)}"></div>
      </div>
      <div class="instinct-compass-value">${n}<span class="instinct-compass-of">/${total}</span></div>
    </div>`;
  }).join('');

  const readPara = `Your instincts lean most toward <strong style="color:${esc(topProfile.color)}">${esc(topProfile.name)}</strong>
    — ${esc(topProfile.strength.toLowerCase())}. That's a real strength. Its shadow to watch:
    ${esc(topProfile.weakness.toLowerCase())}.`;

  let blindSpotHtml = '';
  if (zeroKeys.length) {
    const names = zeroKeys.map(k => `<strong style="color:${esc(PROFILES[k].color)}">${esc(PROFILES[k].name)}</strong>`);
    const list = names.length === 1 ? names[0]
      : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    blindSpotHtml = `<div class="instinct-blindspot">
      <span class="instinct-blindspot-icon">◍</span>
      Blind spot: you never once reached for ${list}. Not wrong — but worth asking when that instinct would have served you.
    </div>`;
  }

  ROOT().innerHTML = `
    <section class="instinct-compass">
      <h2 class="instinct-heading">Your Style Compass</h2>
      <p class="instinct-compass-sub">Eight instincts, mapped. This is a mirror, not a scorecard.</p>
      <div class="instinct-compass-bars">${barsHtml}</div>
      <p class="instinct-compass-read">${readPara}</p>
      ${blindSpotHtml}
      <div class="instinct-compass-actions">
        <button class="instinct-btn instinct-btn--ghost" onclick="_copySummary()">Copy as text handout</button>
        <button class="instinct-btn" onclick="_restart()">Run again</button>
      </div>
    </section>`;
}

/** Compute the tally for persistence / text export. */
export function computeTally() {
  const tally = {};
  for (const key of Object.keys(PROFILES)) tally[key] = 0;
  for (const p of state.picks) if (tally[p.style] != null) tally[p.style]++;
  return tally;
}
