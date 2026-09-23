// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Perspectives page rendering ──────────────────────────────
// Decoder grid (card ↔ situation), the hands-as-people explorer
// built on the exercises PROFILES system, and the learning paths.

import { renderCardHTML, galleryLink } from '../shared/card-component.js';
import { PROFILES, BASELINE_HAND, buildProfileHand } from '../exercises/profiles.js';
import { DECODER, PROFILE_NOTES, PROFILE_ORDER, SOLO_PATH, TEAM_PATH } from './data.js';

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let cardsByName = new Map();

export function setCards(cards) {
  cardsByName = new Map(cards.map((c) => [c.name, c]));
}

// ── Decoder ──────────────────────────────────────────────────

export function renderDecoder() {
  const host = document.getElementById('decoder-grid');
  if (!host) return;

  const rows = DECODER.map(({ card, atWork, lesson }) => {
    const data = cardsByName.get(card);
    if (!data) {
      console.error(`[perspectives] Decoder card not found in cards.json: "${card}"`);
      return '';
    }
    return `<article class="pv-decode">
      <div class="pv-decode-card">${renderCardHTML(data, { size: 'md' })}</div>
      <div class="pv-decode-text">
        <h3 class="pv-decode-name">${escHtml(card)}</h3>
        <p class="pv-decode-label">At work, this is</p>
        <p>${escHtml(atWork)}</p>
        <p class="pv-decode-label">What the card prices</p>
        <p>${escHtml(lesson)}</p>
        ${galleryLink(card, 'Open in Card Gallery')}
      </div>
    </article>`;
  }).join('');

  host.innerHTML = rows;
}

// ── Hands-as-people explorer ─────────────────────────────────

function handCardHTML(name, { locked, emphasized, added, lockedReason, addedReason }) {
  const data = cardsByName.get(name);
  const inner = data
    ? renderCardHTML(data, { variant: 'mini' })
    : `<span class="rush-card-chip">${escHtml(name)}</span>`;

  const stateClass = locked ? 'is-locked' : emphasized ? 'is-emphasized' : added ? 'is-added' : '';
  const reason = locked ? lockedReason : added ? addedReason : '';
  const badge = locked
    ? '<span class="pv-hand-badge pv-badge-locked" aria-hidden="true">Locked</span>'
    : emphasized
      ? '<span class="pv-hand-badge pv-badge-emph" aria-hidden="true">Reaches for</span>'
      : added
        ? '<span class="pv-hand-badge pv-badge-added" aria-hidden="true">Adds</span>'
        : '';
  const reasonHtml = reason ? `<p class="pv-hand-reason">${escHtml(reason)}</p>` : '';
  const srState = locked ? `Locked: ${reason}` : emphasized ? 'Emphasized' : added ? `Added: ${reason}` : '';

  return `<li class="pv-hand-card ${stateClass}">
    ${badge}
    <div class="pv-hand-face"${srState ? ` aria-label="${escHtml(name)}. ${escHtml(srState)}"` : ''}>${inner}</div>
    ${reasonHtml}
  </li>`;
}

export function renderProfileTabs() {
  const host = document.getElementById('profile-tabs');
  if (!host) return;
  host.innerHTML = PROFILE_ORDER.map((key) => {
    const p = PROFILES[key];
    const label = key === 'realistic' ? `${p.name} (control)` : p.name;
    return `<button type="button" class="pv-tab" data-profile="${key}" aria-pressed="false" style="--tab-hue:${p.color}">${escHtml(label)}</button>`;
  }).join('');
}

export function renderProfile(key) {
  const profile = PROFILES[key];
  const notes = PROFILE_NOTES[key];
  const host = document.getElementById('profile-view');
  if (!profile || !notes || !host) return;

  for (const btn of document.querySelectorAll('.pv-tab')) {
    const active = btn.dataset.profile === key;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  }

  const { hand, lockedSet, addedSet, emphasizedSet, lockedReasons, addedReasons } = buildProfileHand(key);
  const cards = hand.map((name) => handCardHTML(name, {
    locked: lockedSet.has(name),
    emphasized: emphasizedSet.has(name),
    added: addedSet.has(name),
    lockedReason: lockedReasons[name],
    addedReason: addedReasons[name],
  })).join('');

  host.innerHTML = `
    <header class="pv-profile-head" style="--profile-hue:${profile.color}">
      <h3>${escHtml(profile.name)}</h3>
      <p class="pv-profile-philosophy">&ldquo;${escHtml(profile.philosophy)}&rdquo;</p>
    </header>
    <p class="pv-profile-who">${escHtml(notes.who)}</p>
    <ul class="pv-hand" aria-label="The hand ${escHtml(profile.name)} plays with">${cards}</ul>
    <p>${escHtml(notes.shoes)}</p>
    <div class="callout callout-tip">
      <span class="callout-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
      <div>
        <div class="callout-title">Ask yourself</div>
        <div class="callout-body">${escHtml(notes.ask)}</div>
      </div>
    </div>
    <p class="pv-profile-cta"><a href="/exercises/">Play a scenario in this style in Exercises &rarr;</a></p>
  `;
}

export function initProfileEvents() {
  const tabs = document.getElementById('profile-tabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.pv-tab');
    if (btn) renderProfile(btn.dataset.profile);
  });
}

// ── Learning paths ───────────────────────────────────────────

function pathHTML(steps) {
  return steps.map(({ route, label, when }, i) => `
    <li class="pv-step">
      <span class="pv-step-num" aria-hidden="true">${i + 1}</span>
      <div>
        <a href="${route}" class="pv-step-link">${escHtml(label)}</a>
        <p class="pv-step-when">${escHtml(when)}</p>
      </div>
    </li>`).join('');
}

export function renderPaths() {
  const solo = document.getElementById('path-solo');
  const team = document.getElementById('path-team');
  if (solo) solo.innerHTML = pathHTML(SOLO_PATH);
  if (team) team.innerHTML = pathHTML(TEAM_PATH);
}

/** The shared ten baseline cards, shown before any style is applied. */
export function renderBaselineStrip() {
  const host = document.getElementById('baseline-strip');
  if (!host) return;
  host.innerHTML = BASELINE_HAND.map((name) => {
    const data = cardsByName.get(name);
    return `<li>${data ? renderCardHTML(data, { variant: 'chip' }) : escHtml(name)}</li>`;
  }).join('');
}
