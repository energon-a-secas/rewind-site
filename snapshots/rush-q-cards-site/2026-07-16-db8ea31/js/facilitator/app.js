// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Facilitator Kit — entry point ────────────────────────────
// Renders the round-by-round playbook from real Instinct situations,
// wires the round timer, and lets any "Start N min" button in the
// page drive the timer and scroll it into view.

import '../shared/nav.js';
import { initTimer } from './timer.js';
import { renderPlaybook } from './playbook.js';

const timerEl = document.getElementById('round-timer');
const timer = timerEl ? initTimer(timerEl) : null;

const roundsEl = document.getElementById('playbook-rounds');
if (roundsEl) renderPlaybook(roundsEl);

// Any element with data-start-min starts the timer for that phase.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-start-min]');
  if (!btn || !timer) return;
  const min = Number(btn.dataset.startMin);
  const label = btn.dataset.label || '';
  timer.startMinutes(min, label);
  timerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Print the one-page cheat-sheet.
window._printSessionGuide = () => window.print();
