// ── Rendering ────────────────────────────────────────────────
// Screen routing plus the console's own readouts. Every module that changes
// something calls render(); nothing renders itself piecemeal.

import { state, equipped } from './state.js';
import { SLOTS, STOCK_PARTS, STATS, frameStats, applyMultiplier, frameRating,
         isOverweight, isEnStarved } from './parts.js';
import { renderMatrix, bootDuration } from './matrix.js';
import { renderRailInto } from './cards.js';
import { PRESETS, FORMS, FORM_BY_ID } from './layout.js';
import { MODES } from './modes.js';
import { $ } from './utils.js';
import { renderHud } from './hud.js';

const SCREENS = { boot: 'screenBoot', console: 'screenConsole', forge: 'screenForge' };

export function showScreen(name) {
  state.screen = SCREENS[name] ? name : 'console';
  for (const [key, id] of Object.entries(SCREENS)) {
    const el = document.getElementById(id);
    if (el) el.hidden = key !== state.screen;
  }
  document.body.dataset.screen = state.screen;
}

/** The parts currently filling each slot, in slot order. */
export function equippedParts() {
  return SLOTS.map((s) => equipped(state, STOCK_PARTS, s.id)).filter(Boolean);
}

/** Base stats, and the same stats after the active mode's multiplier. */
export function currentStats() {
  const base = frameStats(equippedParts());
  const mode = state.mode ? MODES[state.mode] : null;
  const form = FORM_BY_ID[state.form] || null;
  // Form first, then mode: the frame changes shape, then overdrives.
  let shown = form ? applyMultiplier(base, form.mult) : base;
  if (mode) shown = applyMultiplier(shown, mode.mult);
  return { base, shown, mode, form };
}

export function renderReadouts() {
  const { shown, mode } = currentStats();
  const parts = equippedParts();
  const preset = PRESETS.find((p) => p.id === state.settings.layout) || PRESETS[0];

  const roMode = $('roMode');
  if (roMode) {
    roMode.textContent = mode ? mode.label : 'Standby';
    roMode.classList.toggle('is-live', !!mode);
  }
  const roRating = $('roRating');
  if (roRating) roRating.textContent = String(frameRating(shown)).padStart(4, '0');
  const roOnline = $('roOnline');
  if (roOnline) roOnline.textContent = `${String(parts.length).padStart(2, '0')} / ${SLOTS.length}`;

  // Weight and EN are budgets, not bars: what matters is the ratio and whether
  // it is blown, so they read as "used / available" and flag when over.
  const roLoad = $('roLoad');
  if (roLoad) {
    roLoad.textContent = `${shown.weight} / ${shown.capacity}`;
    roLoad.classList.toggle('is-over', isOverweight(shown));
  }
  const roEn = $('roEn');
  if (roEn) {
    roEn.textContent = `${shown.enLoad} / ${shown.output}`;
    roEn.classList.toggle('is-over', isEnStarved(shown));
  }
  const roLayout = $('roLayout');
  if (roLayout) {
    const form = FORM_BY_ID[state.form];
    roLayout.textContent = form ? form.label : preset.label;
    roLayout.classList.toggle('is-live', !!form);
  }
}

export function renderStats() {
  const el = $('frameStats');
  if (!el) return;
  const { base, shown } = currentStats();
  el.innerHTML = STATS.map(({ key, label }) => {
    const v = shown[key];
    const up = v > base[key];
    return `<div class="stat">
      <div class="stat__row">
        <span class="stat__k">${label}</span>
        <span class="stat__v${up ? ' is-up' : ''}">${String(v).padStart(3, '0')}${up ? ' &uarr;' : ''}</span>
      </div>
      <div class="stat__track"><div class="stat__bar" style="width:${v}%"></div></div>
    </div>`;
  }).join('');
}

/** @param {{boot?: boolean}} [opts] */
export function renderConsole(opts = {}) {
  const boot = !!opts.boot;

  renderMatrix(
    { stage: $('matrixStage'), tiles: $('matrixTiles'), traces: $('matrixTraces') },
    (slotId) => equipped(state, STOCK_PARTS, slotId),
    { preset: state.form || state.settings.layout, boot, holdMs: opts.holdMs },
  );

  renderRailInto($('rail'), equippedParts(), {
    instant: !boot,
    empty: 'No components equipped',
  });

  renderReadouts();
  renderStats();
  const cs = currentStats();
  renderHud({ stats: cs.shown, parts: equippedParts(), mode: cs.mode, form: cs.form });

  // One announcement for the whole sequence — 22 separate ones would be noise.
  const status = $('matrixStatus');
  if (status) {
    const say = () => { status.textContent = `${equippedParts().length} components online`; };
    if (boot) setTimeout(say, bootDuration());
    else say();
  }
}

export function render(opts = {}) {
  if (state.screen === 'console') renderConsole(opts);
}
