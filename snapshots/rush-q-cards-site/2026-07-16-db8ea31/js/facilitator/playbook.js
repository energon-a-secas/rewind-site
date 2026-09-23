// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Playbook renderer ────────────────────────────────────────
// Builds the round-by-round facilitator script from the real
// Instinct situations (js/behavior/data.js). Each round card shows
// the prompt, the four hands with their concrete moves, the
// pre-written discussion prompts, and the facilitator note — the
// content a facilitator reads aloud and works from live.

import { SITUATIONS } from '../behavior/data.js';

// Which situations to run in a 60-minute session. Four is the sweet
// spot: enough range to reveal a Style Compass, short enough to debrief
// each one properly. These four span crisis, greenfield risk, people
// calls, and tech-debt — a broad instinct map.
const SESSION_ROUNDS = ['outage', 'deadline-slip', 'design-stalemate', 'fragile-legacy'];

const STYLE_LABELS = {
  hero: 'Hero',
  cautious: 'Cautious',
  delegator: 'Delegator',
  politician: 'Politician',
  realistic: 'Realistic',
  innovator: 'Innovator',
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderHand(hand) {
  const rows = hand.map((h) => `
    <li class="pb-move">
      <span class="pb-style pb-style-${esc(h.style)}">${esc(STYLE_LABELS[h.style] || h.style)}</span>
      <span class="pb-move-text"><strong>${esc(h.card)}</strong> — ${esc(h.move)}</span>
    </li>`).join('');
  return `<ul class="pb-moves">${rows}</ul>`;
}

function renderDiscussion(list) {
  const items = list.map((d) => `<li>${esc(d)}</li>`).join('');
  return `<ul class="pb-discussion">${items}</ul>`;
}

function renderRound(sit, idx, minutes) {
  const behaviorHref = '../behavior/';
  return `
  <article class="pb-round" id="round-${esc(sit.id)}">
    <header class="pb-round-head">
      <span class="pb-round-num">Round ${idx + 1}</span>
      <button type="button" class="pb-time-btn" data-start-min="${minutes}"
        data-label="Round ${idx + 1} — discussion">
        Start ${minutes} min for this round
      </button>
    </header>
    <p class="pb-prompt">${esc(sit.prompt)}</p>

    <h4 class="pb-sub">The four moves on the table</h4>
    ${renderHand(sit.hand)}

    <div class="pb-note">
      <h4 class="pb-sub">Facilitator note</h4>
      <p>${esc(sit.facilitatorNote)}</p>
    </div>

    <h4 class="pb-sub">Discussion prompts</h4>
    ${renderDiscussion(sit.discussion)}

    <p class="pb-run"><a href="${behaviorHref}">Run this round live in Instinct &rarr;</a></p>
  </article>`;
}

export function renderPlaybook(container) {
  const byId = Object.fromEntries(SITUATIONS.map((s) => [s.id, s]));
  const rounds = SESSION_ROUNDS
    .map((id) => byId[id])
    .filter(Boolean);

  // Two minutes for the table to pick, three to discuss — five per round.
  const perRound = 5;
  const html = rounds.map((sit, i) => renderRound(sit, i, perRound)).join('');
  container.innerHTML = html;
  return rounds.length;
}

export { SESSION_ROUNDS };
