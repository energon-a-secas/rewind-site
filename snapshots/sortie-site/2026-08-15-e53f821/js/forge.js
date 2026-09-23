// ── Forge ────────────────────────────────────────────────────
// Paint a 16x16 glyph, attach a slot and a stat spread, save it into the
// visitor's own library. Forged parts are ordinary parts from that point on —
// the matrix, the rail and the picker do not special-case them beyond a tag.

import { state, save } from './state.js';
import {
  GLYPH_SIZE, LEVELS, SLOTS, SLOT_LABEL, STATS, STOCK_PARTS, EMPTY_GLYPH,
  cellsFromHex, hexFromCells, glyphSvgInner, mirrorGlyph, invertGlyph,
  flattenGlyph, keyline,
} from './parts.js';
import { partCardHTML, renderRailInto } from './cards.js';
import { $, escHtml, showToast, clamp, download } from './utils.js';
import { blip } from './audio.js';

const CELLS = GLYPH_SIZE * GLYPH_SIZE;

let cells = cellsFromHex(EMPTY_GLYPH);
let painting = null;   // the level being painted during a drag
let ink = 3;           // currently selected ink level
let onChange = null;   // app.js hands us the console re-render

export const INKS = [
  { level: 0, label: 'Erase' },
  { level: 1, label: 'Cut' },
  { level: 2, label: 'Shade' },
  { level: 3, label: 'Light' },
];

export function setForgeListener(fn) { onChange = fn; }

// ── Draft ────────────────────────────────────────────────────

function draft() {
  return {
    id: state.editing || `fx-${Date.now().toString(36)}`,
    name: ($('forgeName')?.value || '').trim() || 'Untitled unit',
    cls: ($('forgeClass')?.value || '').trim() || 'Frame',
    slot: $('forgeSlot')?.value || SLOTS[0].id,
    glyph: hexFromCells(cells),
    stats: {
      ...Object.fromEntries(STATS.map(({ key }) => [
        key, clamp(Number($(`stat-${key}`)?.value) || 0, 0, 100),
      ])),
      wgt: clamp(Number($('stat-wgt')?.value) || 0, 0, 6000),
      en: clamp(Number($('stat-en')?.value) || 0, 0, 1200),
    },
    stock: false,
  };
}

function loadDraft(part) {
  state.editing = part?.id && !part.stock ? part.id : null;
  cells = cellsFromHex(part?.glyph || EMPTY_GLYPH);
  if ($('forgeName')) $('forgeName').value = part?.name || '';
  if ($('forgeClass')) $('forgeClass').value = part?.cls || '';
  if ($('forgeSlot')) $('forgeSlot').value = part?.slot || SLOTS[0].id;
  for (const { key } of STATS) {
    const el = $(`stat-${key}`);
    if (el) el.value = part?.stats?.[key] ?? 50;
  }
  for (const [key, fallback] of [['wgt', 1000], ['en', 200]]) {
    const el = $(`stat-${key}`);
    if (el) el.value = part?.stats?.[key] ?? fallback;
  }
  syncStatOutputs();
  const del = $('forgeDelete');
  if (del) del.hidden = !state.editing;
  renderPaint();
  renderPreview();
}

export function newDraft() { loadDraft(null); }

// ── Painter ──────────────────────────────────────────────────

const INK_NAME = ['empty', 'cut', 'shade', 'light'];

function renderPaint() {
  const grid = $('paintGrid');
  if (!grid) return;
  if (grid.childElementCount !== CELLS) {
    grid.innerHTML = Array.from({ length: CELLS }, (_, i) => {
      const r = Math.floor(i / GLYPH_SIZE) + 1;
      const c = (i % GLYPH_SIZE) + 1;
      return `<button type="button" class="paint__cell" data-cell="${i}"
        data-level="0" aria-label="Row ${r} column ${c}, empty"></button>`;
    }).join('');
  }
  const nodes = grid.children;
  for (let i = 0; i < CELLS; i++) setCellUi(nodes[i], cells[i]);
}

function setCellUi(node, level) {
  node.dataset.level = String(level);
  const label = node.getAttribute('aria-label') || '';
  node.setAttribute('aria-label', label.replace(/,\s*\w+$/, '') + ', ' + INK_NAME[level]);
}

function paintAt(target, level) {
  const idx = Number(target?.dataset?.cell);
  if (!Number.isInteger(idx) || idx < 0 || idx >= CELLS) return;
  const next = clamp(level, 0, LEVELS - 1);
  if (cells[idx] === next) return;
  cells[idx] = next;
  setCellUi(target, next);
  renderPreview();
}

function renderInks() {
  const el = $('paintInks');
  if (!el) return;
  el.innerHTML = INKS.map((i) => `
    <button type="button" class="ink" data-ink="${i.level}" data-level="${i.level}"
      aria-pressed="${ink === i.level}" title="${i.label}"><span>${i.label}</span></button>`).join('');
}

function onPointerDown(e) {
  const cell = e.target.closest?.('.paint__cell');
  if (!cell) return;
  e.preventDefault();
  // Painting the selected ink, except on a cell that already holds it, where
  // the stroke erases instead. Saves reaching for the eraser to fix one pixel.
  painting = cells[Number(cell.dataset.cell)] === ink ? 0 : ink;
  paintAt(cell, painting);
  blip('tick');
}

function onPointerMove(e) {
  if (painting === null) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el?.closest?.('.paint__cell');
  if (cell) paintAt(cell, painting);
}

function onPointerUp() { painting = null; }

/** Keyboard: space/enter on a focused cell flips it. */
function onGridKeydown(e) {
  if (e.key !== ' ' && e.key !== 'Enter') return;
  const cell = e.target.closest?.('.paint__cell');
  if (!cell) return;
  e.preventDefault();
  paintAt(cell, cells[Number(cell.dataset.cell)] === ink ? 0 : ink);
}

function applyGlyph(hex) {
  cells = cellsFromHex(hex);
  renderPaint();
  renderPreview();
}

const TOOLS = {
  paintClear: () => applyGlyph(EMPTY_GLYPH),
  paintFill: () => applyGlyph(invertGlyph(EMPTY_GLYPH)),
  paintInvert: () => applyGlyph(invertGlyph(hexFromCells(cells))),
  paintMirror: () => applyGlyph(mirrorGlyph(hexFromCells(cells))),
  paintFlat: () => applyGlyph(flattenGlyph(hexFromCells(cells), 3)),
  // The same dark contour the stock parts carry, so a forged part sits next to
  // them with the same hard edge instead of melting into its tile.
  paintShade: () => applyGlyph(keyline(hexFromCells(cells))),
  paintRandom: () => {
    // Mirrored noise reads as a machine part rather than static.
    const next = new Uint8Array(CELLS);
    for (let r = 0; r < GLYPH_SIZE; r++) {
      for (let c = 0; c < GLYPH_SIZE / 2; c++) {
        const v = Math.random() > 0.55 ? 3 : 0;
        next[r * GLYPH_SIZE + c] = v;
        next[r * GLYPH_SIZE + (GLYPH_SIZE - 1 - c)] = v;
      }
    }
    applyGlyph(keyline(hexFromCells(next)));
  },
};

// ── Preview & library ────────────────────────────────────────

function syncStatOutputs() {
  for (const key of [...STATS.map((s) => s.key), 'wgt', 'en']) {
    const out = $(`out-${key}`);
    const el = $(`stat-${key}`);
    if (out && el) out.textContent = el.value;
  }
}

function renderPreview() {
  const el = $('forgePreview');
  if (!el) return;
  const p = draft();
  el.innerHTML = `
    <span class="preview-tile"><svg viewBox="0 0 16 16" aria-hidden="true">${glyphSvgInner(p.glyph)}</svg></span>
    ${partCardHTML(p, 0, { as: 'div', tag: 'Forged' })}`;
}

export function renderLibrary() {
  renderRailInto($('libraryRail'), state.custom, {
    instant: true,
    empty: 'No forged parts yet. Paint one and save it.',
    activeId: state.editing,
    tagFor: () => 'Forged',
  });
}

// ── Persistence ──────────────────────────────────────────────

function commit() {
  const p = draft();
  const i = state.custom.findIndex((c) => c.id === p.id);
  if (i >= 0) state.custom[i] = p;
  else state.custom.push(p);
  state.editing = p.id;
  save(state);
  const del = $('forgeDelete');
  if (del) del.hidden = false;
  renderLibrary();
  onChange?.();
  return p;
}

export function saveDraft() {
  const p = commit();
  blip('online');
  showToast(`Saved ${p.name}`);
}

export function saveAndEquip() {
  const p = commit();
  state.loadout[p.slot] = p.id;
  save(state);
  blip('online');
  showToast(`${p.name} equipped to ${SLOT_LABEL[p.slot] || p.slot}`);
  onChange?.();
}

export function deleteDraft() {
  if (!state.editing) return;
  const id = state.editing;
  const part = state.custom.find((c) => c.id === id);
  state.custom = state.custom.filter((c) => c.id !== id);
  // A deleted part cannot stay equipped; fall back to the slot's stock unit.
  for (const [slot, pid] of Object.entries(state.loadout)) {
    if (pid === id) {
      const stock = STOCK_PARTS.find((s) => s.slot === slot);
      if (stock) state.loadout[slot] = stock.id;
    }
  }
  save(state);
  newDraft();
  renderLibrary();
  onChange?.();
  showToast(`Deleted ${part?.name || 'part'}`);
}

export function editPart(id) {
  const part = state.custom.find((c) => c.id === id);
  if (!part) return;
  loadDraft(part);
  renderLibrary();
}

// ── Import / export ──────────────────────────────────────────

export function exportLibrary() {
  const blob = new Blob([JSON.stringify({
    format: 'sortie-parts@1',
    parts: state.custom,
    loadout: state.loadout,
  }, null, 2)], { type: 'application/json' });
  download(blob, 'sortie-parts.json');
  showToast('Exported sortie-parts.json');
}

export async function importLibrary(file) {
  try {
    const data = JSON.parse(await file.text());
    const incoming = Array.isArray(data?.parts) ? data.parts : [];
    const valid = incoming.filter((p) => p && typeof p.glyph === 'string' && SLOT_LABEL[p.slot]);
    if (!valid.length) { showToast('No parts found in that file'); return; }
    const byId = new Map(state.custom.map((p) => [p.id, p]));
    for (const p of valid) byId.set(p.id, { ...p, stock: false });
    state.custom = [...byId.values()];
    save(state);
    renderLibrary();
    onChange?.();
    showToast(`Imported ${valid.length} part${valid.length === 1 ? '' : 's'}`);
  } catch {
    showToast('That file is not valid JSON');
  }
}

// ── Wiring ───────────────────────────────────────────────────

export function initForge() {
  const slot = $('forgeSlot');
  if (slot) slot.innerHTML = SLOTS.map((s) => `<option value="${s.id}">${escHtml(s.label)}</option>`).join('');

  const sliders = $('forgeSliders');
  if (sliders) {
    const rows = [
      ...STATS.map(({ key, label }) => ({ key, label, max: 100, step: 1, value: 50 })),
      { key: 'wgt', label: 'WEIGHT', max: 6000, step: 20, value: 1000 },
      { key: 'en', label: 'EN LOAD', max: 1200, step: 10, value: 200 },
    ];
    sliders.innerHTML = rows.map((r) => `
      <label for="stat-${r.key}">${r.label}
        <input class="slider" id="stat-${r.key}" type="range" min="0" max="${r.max}" step="${r.step}" value="${r.value}">
        <output for="stat-${r.key}" id="out-${r.key}">${r.value}</output>
      </label>`).join('');
    sliders.addEventListener('input', (e) => {
      const key = e.target.id?.replace('stat-', '');
      const out = $(`out-${key}`);
      if (out) out.textContent = e.target.value;
      renderPreview();
    });
  }

  renderInks();
  $('paintInks')?.addEventListener('click', (e) => {
    const btn = e.target.closest?.('[data-ink]');
    if (!btn) return;
    ink = Number(btn.dataset.ink);
    renderInks();
  });

  const grid = $('paintGrid');
  if (grid) {
    grid.addEventListener('pointerdown', onPointerDown);
    grid.addEventListener('keydown', onGridKeydown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  }

  for (const [id, fn] of Object.entries(TOOLS)) $(id)?.addEventListener('click', fn);

  $('forgeName')?.addEventListener('input', renderPreview);
  $('forgeClass')?.addEventListener('input', renderPreview);
  $('forgeSlot')?.addEventListener('change', renderPreview);

  $('forgeSave')?.addEventListener('click', saveDraft);
  $('forgeEquip')?.addEventListener('click', saveAndEquip);
  $('forgeNew')?.addEventListener('click', () => { newDraft(); renderLibrary(); });
  $('forgeDelete')?.addEventListener('click', deleteDraft);

  $('forgeExport')?.addEventListener('click', exportLibrary);
  $('forgeImport')?.addEventListener('click', () => $('forgeFile')?.click());
  $('forgeFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) importLibrary(file);
    e.target.value = '';
  });

  $('libraryRail')?.addEventListener('click', (e) => {
    const card = e.target.closest?.('.pcard');
    if (card) editPart(card.dataset.part);
  });

  newDraft();
  renderLibrary();
}
