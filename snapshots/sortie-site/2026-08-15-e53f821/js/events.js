// ── Wiring ───────────────────────────────────────────────────
// Everything the visitor can do lands here. Modules own their behaviour; this
// file only decides what a click means and in what order things re-render.

import { state, save, library } from './state.js';
import { STOCK_PARTS, SLOT_LABEL } from './parts.js';
import { showScreen, render, renderConsole } from './render.js';
import { onMatrixKeydown } from './matrix.js';
import { renderRailInto } from './cards.js';
import { openModal, closeModal, openModalId } from './modal.js';
import { openOverlay, activate } from './modes.js';
import { cycleForm } from './transform.js';
import { submitCode, relock, armHint } from './boot.js';
import { openPanel, closePanel, isPanelOpen, togglePanel, toggleChrome } from './panel.js';
import { copyShareLink } from './share.js';
import { savePoster } from './poster.js';
import { nudge } from './fx.js';
import { blip } from './audio.js';
import { $, showToast } from './utils.js';

let pickerSlot = null;

/** Actions that need the frame online say so instead of failing quietly. */
function requireOnline(fn) {
  return () => {
    if (!state.unlocked) { showToast('System locked. Seat a device first.'); return; }
    fn();
  };
}

// ── Part picker ──────────────────────────────────────────────

function openPicker(slot) {
  pickerSlot = slot;
  const options = library(state, STOCK_PARTS).filter((p) => p.slot === slot);
  const title = $('pickerTitle');
  if (title) title.textContent = `Swap ${SLOT_LABEL[slot] || slot}`;
  renderRailInto($('pickerRail'), options, {
    instant: true,
    empty: 'No parts for this slot. Forge one.',
    activeId: state.loadout[slot],
  });
  openModal('partPicker');
}

function choosePart(id) {
  if (!pickerSlot) return;
  state.loadout[pickerSlot] = id;
  save(state);
  closeModal('partPicker');
  renderConsole({ boot: false });
  blip('online');
}

// ── Keyboard ─────────────────────────────────────────────────

const SHORTCUTS = {
  c: () => goConsole(),
  f: () => goForge(),
  m: () => openOverlay(),
  o: () => togglePanel(),
  h: () => toggleChrome(),
  t: () => cycleForm(),
};

/**
 * Escape unwinds one layer at a time, outermost first: a dialog, then the
 * options drawer, then the console itself. modal.js runs its own Escape
 * handler ahead of this one and calls preventDefault when it consumes the key,
 * which is what stops a single press from closing a dialog *and* the drawer
 * behind it.
 */
function onEscape(e) {
  if (e.defaultPrevented || openModalId()) return;
  if (isPanelOpen()) { closePanel(); return; }
  if (state.unlocked && state.screen !== 'boot') relock();
}

function onKeydown(e) {
  if (e.key === 'Escape') { onEscape(e); return; }

  const el = e.target;
  const typing = el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA');
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

  const key = e.key.toLowerCase();
  const fn = SHORTCUTS[key];
  // 'h' stays live while locked: hiding the header must never be a one-way door.
  if (!fn || (!state.unlocked && key !== 'h')) return;
  e.preventDefault();
  fn();
}

// ── Navigation ───────────────────────────────────────────────

function goConsole() {
  showScreen('console');
  renderConsole({ boot: false });
}

function goForge() {
  showScreen('forge');
  render();
}

// ── Bind ─────────────────────────────────────────────────────

export function bindEvents() {
  // Header
  $('navConsole')?.addEventListener('click', requireOnline(goConsole));
  $('navForge')?.addEventListener('click', requireOnline(goForge));
  $('navModes')?.addEventListener('click', requireOnline(() => openOverlay()));
  $('navShare')?.addEventListener('click', requireOnline(copyShareLink));
  $('navPoster')?.addEventListener('click', requireOnline(savePoster));
  $('navPanel')?.addEventListener('click', togglePanel);
  $('navTransform')?.addEventListener('click', requireOnline(() => cycleForm()));
  $('navLock')?.addEventListener('click', () => { relock(); blip('reject'); });

  // Lock screen
  $('bootForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitCode($('bootCode')?.value);
  });
  $('bootCode')?.addEventListener('input', armHint);

  // Matrix
  $('matrixTiles')?.addEventListener('click', (e) => {
    const tile = e.target.closest?.('.tile');
    if (tile?.dataset.slot) openPicker(tile.dataset.slot);
  });
  $('matrixTiles')?.addEventListener('keydown', onMatrixKeydown);

  // Rail and picker
  $('rail')?.addEventListener('click', (e) => {
    const card = e.target.closest?.('.pcard');
    if (card?.dataset.slot) openPicker(card.dataset.slot);
  });
  $('pickerRail')?.addEventListener('click', (e) => {
    const card = e.target.closest?.('.pcard');
    if (card?.dataset.part) choosePart(card.dataset.part);
  });

  // Burst modes
  $('modePicker')?.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-mode]');
    if (!btn) return;
    activate(btn.dataset.mode || null);
    blip('mode');
  });

  // Global
  document.addEventListener('keydown', onKeydown);
  for (const ev of ['pointerdown', 'keydown', 'wheel']) {
    window.addEventListener(ev, nudge, { passive: true });
  }
}
