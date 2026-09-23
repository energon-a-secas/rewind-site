// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Table Talk deck renderer ─────────────────────────────────
// Turns the verified behavior SITUATIONS into pure discussion-prompt
// cards (no game mechanics). Screen and print share the same markup;
// the layout difference lives entirely in css/table-talk.css.

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Editorial kickers: a short spoken title for each tension so a fanned
// deck reads like cards, not a numbered list. These frame the existing
// prompt; they are not new game content.
export const KICKERS = {
  outage: 'The 2am Page',
  greenfield: 'The Blank Slate',
  'junior-ownership': 'The Stretch Assignment',
  'deadline-slip': 'The Slipping Deadline',
  'slow-ramp': 'The Slow Ramp',
  'design-stalemate': 'The Deadlock',
  'fragile-legacy': 'The Creaky Service',
  'stolen-credit': 'The Stolen Credit',
};

/** One discussion card. */
function renderCard(situation, index) {
  const num = String(index + 1).padStart(2, '0');
  const kicker = KICKERS[situation.id] || 'Table Talk';
  const questions = (situation.discussion || [])
    .map((q) => `<li>${escHtml(q)}</li>`)
    .join('');
  const note = situation.facilitatorNote
    ? `<div class="tt-card-note">
         <span class="tt-note-label">Facilitator</span>
         <span class="tt-note-text">${escHtml(situation.facilitatorNote)}</span>
       </div>`
    : '';

  return `<article class="tt-card" aria-labelledby="tt-prompt-${situation.id}">
    <header class="tt-card-head">
      <span class="tt-card-num" aria-hidden="true">${num}</span>
      <span class="tt-card-kicker">${escHtml(kicker)}</span>
    </header>
    <h3 class="tt-card-prompt" id="tt-prompt-${situation.id}">${escHtml(situation.prompt)}</h3>
    <div class="tt-card-body">
      <p class="tt-card-cue">Talk it through</p>
      <ol class="tt-card-questions">${questions}</ol>
    </div>
    ${note}
    <footer class="tt-card-foot" aria-hidden="true">Rush Q &middot; Table Talk</footer>
  </article>`;
}

/** Render the full deck of cards. */
export function renderDeck(situations) {
  if (!Array.isArray(situations) || !situations.length) {
    return '<p class="tt-empty">No prompts available.</p>';
  }
  return situations.map((s, i) => renderCard(s, i)).join('');
}
