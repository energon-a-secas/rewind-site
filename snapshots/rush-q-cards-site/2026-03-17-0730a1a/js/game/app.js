// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Game entry point ─────────────────────────────────────────

import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { trapFocus, releaseFocus } from './utils.js';
import { initGlobalErrorHandlers } from '../shared/error-boundary.js';

function init() {
  initGlobalErrorHandlers(); // Initialize error handling first
  const hasSave = loadSaved(state);

  if (hasSave && state.players.length && state.turnPhase !== 'setup') {
    // Show resume option
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) resumeBtn.classList.remove('hidden');
  }

  render(state);
  bindEvents(state);

  for (const id of ['modal', 'game-over-modal', 'debrief-modal']) {
    const el = document.getElementById(id);
    if (!el) continue;
    new MutationObserver(() => {
      if (!el.classList.contains('hidden')) {
        requestAnimationFrame(() => trapFocus(el));
      } else {
        releaseFocus(el);
      }
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM is already ready
}
