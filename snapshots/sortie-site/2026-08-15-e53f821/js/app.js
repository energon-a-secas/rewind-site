// ── Entry point ──────────────────────────────────────────────
// Wires the modules together. Order matters in one place only: settings are
// applied before the first paint so nothing flashes the default accent.

import { state, loadSaved } from './state.js';
import { adoptFromHash } from './share.js';
import { applySettings, initPanel, setPanelListener } from './panel.js';
import { setModeListener, restore as restoreMode } from './modes.js';
import { setTransformListener, restoreForm } from './transform.js';
import { initModal } from './modal.js';
import { initFx } from './fx.js';
import { initForge, setForgeListener } from './forge.js';
import { initBoot } from './boot.js';
import { renderConsole, render } from './render.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  adoptFromHash();

  applySettings();
  restoreForm();
  restoreMode();

  initModal();
  initPanel();
  initForge();
  initFx();
  bindEvents();

  setModeListener(() => render());
  setTransformListener(() => { if (state.screen === 'console') render(); });
  setPanelListener(() => { if (state.screen === 'console') renderConsole({ boot: false }); });
  setForgeListener(() => { if (state.screen === 'console') renderConsole({ boot: false }); });

  initBoot();
}

init();
