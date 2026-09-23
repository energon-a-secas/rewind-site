// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card browser rendering ───────────────────────────────────
import { typeColor, cardImagePath } from '../shared/cards-data.js';
import { renderCardHTML, TYPE_ICON, costSymbol } from '../shared/card-component.js';
import { icon, iconForEmoji } from '../shared/icons.js';
import { state } from './state.js';

const grid = () => document.getElementById('card-grid');
const countEl = () => document.getElementById('card-count');
const modal = () => document.getElementById('card-modal');

/** Render filtered cards into the grid. */
export function renderGrid() {
  const el = grid();
  const cardSize = state.printView ? 'xl' : 'md';
  el.classList.toggle('print-view', state.printView);
  el.innerHTML = state.filtered.map(card => {
    const color = typeColor(card.type);
    return `
      <div class="card-item" data-name="${escAttr(card.name)}" style="--card-accent:${color}" tabindex="0" role="button" aria-label="${escAttr(card.name)}, ${escAttr(card.type)} card">
        ${renderCardHTML(card, { size: cardSize })}
      </div>`;
  }).join('');

  // Click + keyboard handlers
  el.querySelectorAll('.card-item').forEach(item => {
    const handler = () => {
      const name = item.dataset.name;
      const card = state.allCards.find(c => c.name === name);
      if (card) renderDetail(card);
    };
    item.addEventListener('click', handler);
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });

  updateCount();
}

/** Render full card detail in modal. */
export function renderDetail(card) {
  const el = modal();
  const color = typeColor(card.type);

  // Facts panel echoes the glyphs shown on the card itself so users can
  // associate the fields between the two views. [icon, label, value].
  const statItems = [];
  if (card.value)    statItems.push([costSymbol(card.type), 'Value', card.value]);
  if (card.deadline) statItems.push(['Q', 'Deadline', `Q${card.deadline}`]);
  if (card.members)  statItems.push([icon('users'), 'Members', card.members]);
  if (card.reward)   statItems.push([icon('star'), 'Reward', `+${card.reward}`]);
  if (card.penalty)  statItems.push([icon('triangle-alert'), 'Penalty', `-${card.penalty}`]);
  if (card.minQuarter) statItems.push(['▶', 'Earliest', `Q${card.minQuarter}+`]);
  if (card.quantity) statItems.push(['#', 'Qty in deck', card.quantity]);
  if (card.deck)             statItems.push([icon('layers'), 'Deck', card.deck]);
  if (card.complexity)       statItems.push([icon('settings'), 'Complexity', card.complexity]);

  // Type badge uses the same icon/emoji shown on the card face.
  const typeIcon = card.emoji ? iconForEmoji(card.emoji) : icon(TYPE_ICON[card.type] || 'square-asterisk');

  el.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${escHtml(card.name)}</h3>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="card-detail">
        <div class="card-detail-img">
          ${renderCardHTML(card, { size: 'lg' })}
        </div>
        <div class="card-detail-body">
          <span class="type-badge" style="background:${color}22;color:${color}">${typeIcon ? `<span class="type-badge-icon">${typeIcon}</span> ` : ''}${escHtml(card.type)}</span>
          ${card.skill ? `<p class="skill-text">${escHtml(card.skill)}</p>` : ''}
          ${card.flavorText ? `<p class="flavor">"${escHtml(card.flavorText)}"</p>` : ''}
          <div class="stat-grid">
            ${statItems.map(([icon, label, val]) =>
              `<div class="stat-item"><span class="stat-icon">${icon}</span><span class="stat-label">${label}</span><span class="stat-value">${escHtml(String(val))}</span></div>`
            ).join('')}
          </div>
        </div>
      </div>
    </div>`;

  el.classList.remove('hidden');

  // Close handlers
  el.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  el.addEventListener('click', e => {
    if (e.target === el) closeModal();
  });
}

function closeModal() {
  const el = modal();
  el.classList.add('hidden');
  el.innerHTML = '';
}

/** Update the card count display. */
function updateCount() {
  const el = countEl();
  if (el) el.textContent = `${state.filtered.length} card${state.filtered.length !== 1 ? 's' : ''}`;
}

// ── Helpers ──────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
