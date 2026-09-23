// ── Events ───────────────────────────────────────────────────
// Single delegated listener on #app. Every state mutation is
// followed by save + hash-sync + full re-render.

import { state, applyRecipe, applyStrategy, setPick, save, writeHash } from './state.js';
import { renderApp } from './render.js';
import { buildPrompt } from './prompt.js';
import { copyToClipboard, downloadFile, showToast, $ } from './utils.js';

function update() {
  save();
  writeHash();
  renderApp();
}

const actions = {
  strategy(el) {
    applyStrategy(el.dataset.strategy);
    update();
    showToast(el.dataset.strategy === 'oss' ? 'Swapped to the open-source stack' : 'Swapped to the managed stack');
  },
  'toggle-cat'(el) {
    const cat = el.dataset.cat;
    state.ui.openCat = state.ui.openCat === cat ? null : cat;
    renderApp(); // panel toggle only — no persist
  },
  pick(el) {
    setPick(el.dataset.cat, el.dataset.opt);
    update();
  },
  frontend(el) {
    state.frontend = el.dataset.frontend;
    update();
  },
  tier(el) {
    state.tier = el.dataset.tier;
    update();
  },
  async 'copy-prompt'() {
    const ok = await copyToClipboard(buildPrompt());
    showToast(ok ? 'Prompt copied — go cook' : 'Copy failed — select the text manually');
  },
  'download-prompt'() {
    downloadFile(`doorman-${state.recipe}-recipe.md`, buildPrompt());
    showToast('Recipe downloaded');
  },
  async 'share-link'() {
    writeHash();
    const ok = await copyToClipboard(location.href);
    showToast(ok ? 'Share link copied' : 'Copy failed — grab the URL from the address bar');
  },
};

export function bindEvents() {
  $('app').addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el);
  });
  $('app').addEventListener('change', (e) => {
    const el = e.target.closest('select[data-action="recipe-select"]');
    if (!el) return;
    applyRecipe(el.value);
    state.ui.openCat = null;
    update();
  });
}
