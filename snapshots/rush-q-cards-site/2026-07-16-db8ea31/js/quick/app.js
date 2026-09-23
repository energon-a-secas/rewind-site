// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — entry point

import { state } from './state.js';
import { render } from './render.js';
import { bindEvents, showTutorial } from './events.js';
import { initGlobalErrorHandlers } from '../shared/error-boundary.js';
import { applyAllSettings, initSettingsUI } from '../shared/settings.js';

function init() {
  initGlobalErrorHandlers(); // Initialize error handling first
  applyAllSettings();        // Apply saved settings before the first render
  render(state);
  bindEvents();
  initSettingsUI();          // Wire the header settings gear
  showTutorial();
}

init();
