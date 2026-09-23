// ── Options drawer ───────────────────────────────────────────
// Every control writes to state.settings, persists, and repaints. The accent
// sliders are the reason theme.js derives --on-accent from luminance: a
// visitor can land anywhere on the wheel, including on a color white text
// disappears into.

import { state, save, DEFAULT_SETTINGS } from './state.js';
import { applyAccent, applyFx, resolveMotion } from './theme.js';
import { PRESETS } from './layout.js';
import { $, hexToRgb, rgbToHsl, hslToRgb, rgbToHex, clamp, showToast } from './utils.js';
import { syncFx } from './fx.js';

const SWATCHES = [
  '#06b6d4', '#22d3ee', '#38bdf8', '#818cf8',
  '#a78bfa', '#f0439c', '#f5a524', '#4ade80',
];

const FX_TOGGLES = [
  { key: 'scanlines', label: 'Scanlines' },
  { key: 'bloom', label: 'Bloom' },
  { key: 'particles', label: 'Particles' },
  { key: 'aberration', label: 'Chromatic shift' },
  { key: 'curve', label: 'Screen curve' },
  { key: 'sound', label: 'Sound' },
  { key: 'attract', label: 'Idle attract mode' },
  { key: 'chrome', label: 'Header and footer' },
];

const MOTIONS = [
  { id: 'auto', label: 'Auto' },
  { id: 'full', label: 'Full' },
  { id: 'reduced', label: 'Reduced' },
  { id: 'off', label: 'Off' },
];

let onChange = null;
export function setPanelListener(fn) { onChange = fn; }

// ── Rendering ────────────────────────────────────────────────

function renderSwatches() {
  const el = $('accentSwatches');
  if (!el) return;
  el.innerHTML = SWATCHES.map((hex) => `
    <button type="button" class="swatch" data-accent="${hex}"
      style="background:${hex};color:${hex}"
      aria-pressed="${state.settings.accent.toLowerCase() === hex}"
      aria-label="Accent ${hex}"></button>`).join('');
}

function renderChips(el, items, active, attr) {
  if (!el) return;
  el.innerHTML = items.map((it) => `
    <button type="button" class="chip" data-${attr}="${it.id}"
      aria-pressed="${active === it.id}">${it.label}</button>`).join('');
}

function renderSwitches() {
  const el = $('fxSwitches');
  if (!el) return;
  el.innerHTML = FX_TOGGLES.map(({ key, label }) => {
    // Chrome is kit state (NeoKeys owns H and the cookie), not a setting.
    const on = key === 'chrome' ? !window.NeoKeys?.chrome.isHidden() : !!state.settings[key];
    return `
    <button type="button" class="switch" data-fx="${key}" aria-pressed="${on}">
      <span>${label}</span><span class="switch__led"></span>
    </button>`;
  }).join('');
}

function renderMotionNote() {
  const el = $('motionNote');
  if (!el) return;
  const resolved = resolveMotion(state.settings.motion);
  el.textContent = state.settings.motion === 'auto'
    ? `Auto follows your system setting. Right now that is ${resolved}.`
    : `Overriding your system setting with ${state.settings.motion}.`;
}

function syncSliders() {
  const rgb = hexToRgb(state.settings.accent);
  if (!rgb) return;
  const [h, s] = rgbToHsl(...rgb);
  if ($('accentHue')) $('accentHue').value = Math.round(h);
  if ($('accentSat')) $('accentSat').value = Math.round(clamp(s, 35, 100));
}

export function renderPanel() {
  renderSwatches();
  renderChips($('layoutChips'), PRESETS, state.settings.layout, 'layout');
  renderChips($('motionChips'), MOTIONS, state.settings.motion, 'motion');
  renderSwitches();
  renderMotionNote();
  syncSliders();
}

// ── Applying ─────────────────────────────────────────────────

/** Push settings into the DOM. Skips the accent while a burst mode owns it. */
export function applySettings() {
  applyFx(state.settings);
  if (!state.mode) applyAccent(state.settings.accent);
  syncFx();
}

function commit() {
  save(state);
  applySettings();
  renderPanel();
  onChange?.();
}

function setAccent(hex) {
  state.settings.accent = hex;
  commit();
}

function fromSliders() {
  const h = Number($('accentHue')?.value ?? 187);
  const s = Number($('accentSat')?.value ?? 94);
  // Lightness tracks saturation so a low-intensity accent does not go muddy,
  // and the top end stops short of white.
  const l = clamp(64 - (s - 35) * 0.12, 46, 66);
  setAccent(rgbToHex(...hslToRgb(h, s, l)));
}

export function resetSettings() {
  state.settings = { ...DEFAULT_SETTINGS };
  commit();
}

// ── Drawer ───────────────────────────────────────────────────

// Tracked explicitly rather than read off `hidden`: the attribute only flips
// when the slide-out transition ends, so for 600ms after a close the drawer
// still reports itself open and swallows the next Escape.
let panelOpen = false;

export function openPanel() {
  const el = $('panel');
  if (!el) return;
  panelOpen = true;
  el.hidden = false;
  // Reflow rather than a frame callback: rAF does not fire in a backgrounded
  // tab, which would leave the drawer parked off-screen while focus moved into it.
  void el.offsetWidth;
  el.classList.add('is-open');
  $('panelClose')?.focus();
}

export function closePanel() {
  const el = $('panel');
  if (!el || !panelOpen) return;
  panelOpen = false;
  el.classList.remove('is-open');
  const done = () => { el.hidden = true; el.removeEventListener('transitionend', done); };
  el.addEventListener('transitionend', done);
  setTimeout(done, 600);   // transitionend does not fire when motion is off
  $('navPanel')?.focus();
}

export function isPanelOpen() { return panelOpen; }

export function togglePanel() { isPanelOpen() ? closePanel() : openPanel(); }

export function initPanel() {
  renderPanel();
  // The kit's H (or its cookie restore) moves chrome state under the drawer's
  // feet; repaint so the switch never lies about what is on screen.
  document.addEventListener('neo-chrome', () => renderPanel());

  $('panelClose')?.addEventListener('click', closePanel);
  $('panelReset')?.addEventListener('click', resetSettings);
  $('accentHue')?.addEventListener('input', fromSliders);
  $('accentSat')?.addEventListener('input', fromSliders);

  $('accentSwatches')?.addEventListener('click', (e) => {
    const hex = e.target.closest?.('[data-accent]')?.dataset.accent;
    if (hex) setAccent(hex);
  });

  $('layoutChips')?.addEventListener('click', (e) => {
    const id = e.target.closest?.('[data-layout]')?.dataset.layout;
    if (!id) return;
    state.settings.layout = id;
    commit();
  });

  $('motionChips')?.addEventListener('click', (e) => {
    const id = e.target.closest?.('[data-motion]')?.dataset.motion;
    if (!id) return;
    state.settings.motion = id;
    commit();
  });

  $('fxSwitches')?.addEventListener('click', (e) => {
    const key = e.target.closest?.('[data-fx]')?.dataset.fx;
    if (!key) return;
    if (key === 'chrome') {
      // Kit-owned: toggling writes the cookie and toasts; neo-chrome repaints.
      window.NeoKeys?.chrome.toggle();
      return;
    }
    state.settings[key] = !state.settings[key];
    commit();
  });
}
