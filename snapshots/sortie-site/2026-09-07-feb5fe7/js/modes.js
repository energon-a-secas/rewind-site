// ── Burst modes ──────────────────────────────────────────────
// A mode is data: a palette, a stat multiplier, four corner readouts and a
// banner. Activating one repaints every token the console reads through, so
// nothing here has to know which elements exist.

import { state, save } from './state.js';
import { applyAccent } from './theme.js';
import { FORM_BY_ID } from './layout.js';
import { openModal, closeModal } from './modal.js';
import { $ } from './utils.js';

export const MODES = {
  burst: {
    id: 'burst', label: 'Burst', banner: 'Burst mode operation',
    color: '#22d3ee', rgb: '34, 211, 238',
    mult: { atk: 1.4, imp: 1.15, ap: 0.95, rng: 1 },
    quads: ['SRT/SYS/CORE', 'PWR/GEN/MAX', 'MAP/SYS/LOCK', 'WEP/SYS/FREE'],
  },
  siege: {
    id: 'siege', label: 'Siege', banner: 'Siege mode operation',
    color: '#f5a524', rgb: '245, 165, 36',
    mult: { atk: 1.1, imp: 1.3, ap: 1.55, rng: 1.05 },
    quads: ['SRT/SYS/HOLD', 'PWR/GEN/CTRL', 'MAP/SYS/ANCH', 'WEP/SYS/HEAV'],
  },
  recon: {
    id: 'recon', label: 'Recon', banner: 'Recon mode operation',
    color: '#a78bfa', rgb: '167, 139, 250',
    mult: { atk: 0.85, imp: 0.8, ap: 0.8, rng: 1.6 },
    quads: ['SRT/SYS/QUIT', 'PWR/GEN/LOW', 'MAP/SYS/SNSR', 'WEP/SYS/MARK'],
  },
  sprint: {
    id: 'sprint', label: 'Sprint', banner: 'Sprint mode operation',
    color: '#f0439c', rgb: '240, 67, 156',
    mult: { atk: 0.95, imp: 1.7, ap: 0.75, rng: 0.9 },
    quads: ['SRT/SYS/RUSH', 'PWR/GEN/BURN', 'MAP/SYS/PATH', 'WEP/SYS/SLCT'],
  },
};

export const MODE_LIST = Object.values(MODES);

let listener = null;
/** app.js registers the re-render here so this module never imports render.js. */
export function setModeListener(fn) { listener = fn; }
function notify() { listener?.(); }

/**
 * The single accent authority. Precedence: an active burst mode outranks an
 * active transformation, which outranks the visitor's chosen accent. Anything
 * that changes one of those three calls this rather than painting itself.
 */
export function repaint() {
  const m = MODES[state.mode];
  if (m) { applyAccent(m.color); return; }
  const f = FORM_BY_ID[state.form];
  applyAccent(f ? f.color : state.settings.accent);
}

const paint = repaint;

function renderPicker() {
  const el = $('modePicker');
  if (!el) return;
  el.innerHTML = MODE_LIST.map((m) => `
    <button type="button" class="chip" data-mode="${m.id}" aria-pressed="${state.mode === m.id}">${m.label}</button>
  `).join('') + `<button type="button" class="chip" data-mode="" aria-pressed="${!state.mode}">Standby</button>`;
}

function renderOverlay() {
  const m = state.mode ? MODES[state.mode] : null;
  const banner = $('modeBannerText');
  if (banner) banner.textContent = m ? m.banner : 'Standby';
  const quads = m ? m.quads : ['SRT/SYS/IDLE', 'PWR/GEN/IDLE', 'MAP/SYS/IDLE', 'WEP/SYS/IDLE'];
  ['q1', 'q2', 'q3', 'q4'].forEach((id, i) => { const el = $(id); if (el) el.textContent = quads[i]; });
  renderPicker();

  // Re-trigger the banner slam and the ring charge on every change.
  const overlay = $('modeOverlay');
  const bannerEl = $('modeBanner');
  if (bannerEl) { bannerEl.style.animation = 'none'; void bannerEl.offsetWidth; bannerEl.style.animation = ''; }
  if (overlay) {
    overlay.classList.remove('is-charged');
    void overlay.offsetWidth;
    overlay.classList.add('is-charged');
  }
}

function set(id, persist) {
  state.mode = id && MODES[id] ? id : null;
  if (persist) save(state);
  paint();
  renderOverlay();
  notify();
  return state.mode;
}

/** Toggle: selecting the live mode powers it down. */
export function activate(id) {
  return set(state.mode === id ? null : id, true);
}

/**
 * Switch without persisting or toggling — the attract loop cycles through
 * every mode and should not leave that in the visitor's saved state.
 */
export function preview(id) { return set(id, false); }

export function deactivate() {
  if (state.mode) set(null, true);
}

export function openOverlay() {
  renderOverlay();
  openModal('modeOverlay');
}

export function closeOverlay() { closeModal('modeOverlay'); }

/**
 * Re-apply on load so a saved mode survives a reload. A mode id can arrive from
 * localStorage or a share link, so an unknown one is dropped here rather than
 * left to throw the first time something reads its multiplier.
 */
export function restore() {
  if (state.mode && !MODES[state.mode]) state.mode = null;
  paint();
}
