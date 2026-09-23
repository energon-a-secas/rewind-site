'use strict';

import { state, DEFAULT_CONFIG, loadFromURL, loadFromStorage } from './state.js';
import { applyConfigToUI, toggleSettings, addSegment, applySettings, copyShareLink, loadTemplate, resetToDefault } from './settings.js';
import { bindEvents, toggleHelpMenu, closeExplosion } from './events.js';

/* ── Init ────────────────────────────────────────────────────────────── */
(function init() {
  /* Priority: URL hash > localStorage (if version matches) > default */
  const fromURL     = loadFromURL();
  const fromStorage = !fromURL && loadFromStorage();
  if (fromURL) state.config = fromURL;
  else if (fromStorage && fromStorage.version === DEFAULT_CONFIG.version) state.config = fromStorage;

  /* Assign unique IDs if missing */
  state.config.segments.forEach((s) => { if (!s.id) s.id = ++state.nextId; });

  applyConfigToUI();
  bindEvents();

  /* Expose remaining onclick handlers to global scope */
  window.addSegment    = addSegment;
  window.applySettings = applySettings;
  window.copyShareLink = copyShareLink;
  window.loadTemplate  = loadTemplate;
  window.resetToDefault = resetToDefault;

  /* ?settings in URL → open settings */
  if (new URLSearchParams(location.search).has('settings')) toggleSettings();
})();
