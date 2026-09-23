// ── Component matrix ─────────────────────────────────────────
// Tiles are absolutely positioned from the core outward. Geometry is
// recomputed on resize; the boot stagger is pure CSS (animation-delay driven
// by --i) so 22 parts coming online costs one reflow, not 22 timers.

import { SLOTS, BOOT_ORDER, glyphSvgInner, SLOT_LABEL } from './parts.js';
import { layoutFor } from './layout.js';

export const BOOT_STEP_MS = 80;

/** Dead air between the frame wave and the accessory wave. */
export const BOOT_WAVE_GAP_MS = 560;

/*
 * Boot indices, computed once. Each wave numbers its own members from zero, so
 * the CSS delay is `wave * gap + index * step` and the two waves read as two
 * separate events rather than one long ramp. Within a wave the order is radial
 * distance from the core, which is what makes the frame appear to power
 * outward in every direction at once instead of sweeping across.
 */
const BOOT_POS = (() => {
  const counters = new Map();
  const map = new Map();
  for (const slot of BOOT_ORDER) {
    const n = counters.get(slot.wave) || 0;
    counters.set(slot.wave, n + 1);
    map.set(slot.id, { wave: slot.wave, index: n });
  }
  // A wave starts after the previous one has finished dealing, not after a
  // fixed offset from zero. Computing `wave * gap` in CSS overlapped them:
  // wave 1 opened at 560ms while wave 0 was still placing tiles until 800ms,
  // which is precisely the separation the two waves exist to show.
  const waves = [...new Set(BOOT_ORDER.map((s) => s.wave))].sort((a, b) => a - b);
  let offset = 0;
  const start = new Map();
  for (const w of waves) {
    start.set(w, offset);
    offset += counters.get(w) * BOOT_STEP_MS + BOOT_WAVE_GAP_MS;
  }
  for (const [id, pos] of map) {
    map.set(id, { ...pos, delay: start.get(pos.wave) + pos.index * BOOT_STEP_MS });
  }
  return map;
})();

const TOTAL_BOOT_MS = Math.max(...[...BOOT_POS.values()].map((p) => p.delay));

let current = { stage: null, tiles: null, traces: null, preset: 'frame' };
let observer = null;

function tileHTML(slot, part, i, online) {
  const name = part ? part.name : 'Empty';
  const custom = part && !part.stock ? ' is-custom' : '';
  const boot = BOOT_POS.get(slot.id) || { wave: 0, index: 0 };
  return `<button type="button" class="tile${custom}${online ? ' is-online' : ''}"
      style="--i:${boot.index};--wave:${boot.wave};--delay:${boot.delay}ms" data-slot="${slot.id}"
      tabindex="${i === 0 ? '0' : '-1'}"
      role="gridcell" aria-label="${SLOT_LABEL[slot.id]}: ${name}. Swap part.">
    <span class="tile__flash"></span>
    <svg class="tile__glyph" viewBox="0 0 16 16" aria-hidden="true">${part ? glyphSvgInner(part.glyph) : ''}</svg>
    <span class="tile__tip">${SLOT_LABEL[slot.id]} &middot; ${name}</span>
  </button>`;
}

/**
 * Build the tiles and traces.
 * @param {{stage: HTMLElement, tiles: HTMLElement, traces: SVGElement}} els
 * @param {(slotId: string) => object|null} resolve
 * @param {{preset: string, boot: boolean}} opts
 */
export function renderMatrix(els, resolve, { preset = 'frame', boot = false, holdMs = 0 } = {}) {
  const { stage, tiles, traces } = els;
  if (!stage || !tiles || !traces) return;
  current = { stage, tiles, traces, preset, resolve };

  // Replacing innerHTML detaches the focused tile. A part swap and every
  // attract-mode cycle re-render, so without this a keyboard user loses their
  // place mid-navigation.
  const focusedSlot = document.activeElement?.closest?.('.tile')?.dataset.slot || null;
  const rovingSlot = tiles.querySelector('.tile[tabindex="0"]')?.dataset.slot || null;

  stage.classList.toggle('is-instant', !boot);
  tiles.innerHTML = SLOTS.map((slot, i) => tileHTML(slot, resolve(slot.id), i, !boot)).join('');
  traces.innerHTML = SLOTS.map((slot) => {
    const boot = BOOT_POS.get(slot.id) || { wave: 0, index: 0 };
    return `<line data-slot="${slot.id}" style="--i:${boot.index};--wave:${boot.wave};--delay:${boot.delay}ms"/>`;
  }).join('');

  if (rovingSlot) {
    for (const t of tiles.querySelectorAll('.tile')) t.tabIndex = t.dataset.slot === rovingSlot ? 0 : -1;
  }
  if (focusedSlot) tiles.querySelector(`.tile[data-slot="${focusedSlot}"]`)?.focus();

  observe(stage);
  measure();

  if (boot) {
    // Commit the start state with a forced reflow, then flip the class in the
    // same task. This used to wait two animation frames, which never arrive
    // while the tab is backgrounded — switching away during the handshake left
    // every tile parked at opacity 0 and the frame came back empty.
    // The socket seats first, then the frame grows out of it. Without the hold
    // the tiles would arrive at a core that is still descending.
    stage.style.setProperty('--boot-offset', `${holdMs}ms`);

    void tiles.offsetWidth;
    tiles.querySelectorAll('.tile').forEach((t) => t.classList.add('is-online'));
    traces.querySelectorAll('line').forEach((l) => l.classList.add('is-drawn'));
  } else {
    stage.style.setProperty('--boot-offset', '0ms');
    traces.querySelectorAll('line').forEach((l) => l.classList.add('is-drawn'));
  }
}

/**
 * measure() cannot place anything while the stage has no size, which happens
 * whenever it is laid out late or in a collapsed pane. Watching the element
 * itself means the tiles settle as soon as it gains a size, instead of staying
 * stacked on the core until the next window resize.
 */
function observe(stage) {
  if (!('ResizeObserver' in window)) return;
  if (observer) observer.disconnect();
  observer = new ResizeObserver(() => measure());
  observer.observe(stage);
}

/** Recompute pitch and offsets against the stage's current pixel size. */
export function measure() {
  const { stage, tiles, traces, preset } = current;
  if (!stage) return;
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (!w || !h) return;

  const L = layoutFor(preset);
  // 0.9 leaves a hairline gutter. Tighter than it was: the frame is one machine,
  // and at 0.84 the tiles read as scattered chips rather than a body.
  const pitch = Math.max(18, Math.min(w / L.spanX, h / L.spanY) * 0.9);
  stage.style.setProperty('--pitch', `${pitch}px`);
  traces.setAttribute('viewBox', `0 0 ${w} ${h}`);

  const cx = w / 2;
  const cy = h / 2;

  for (const slot of SLOTS) {
    const p = L.pos[slot.id];
    if (!p) continue;
    const tx = (p.x + L.offsetX) * pitch;
    const ty = (p.y + L.offsetY) * pitch;

    const tile = tiles.querySelector(`.tile[data-slot="${slot.id}"]`);
    if (tile) {
      tile.style.setProperty('--tx', `${tx}px`);
      tile.style.setProperty('--ty', `${ty}px`);
    }

    const line = traces.querySelector(`line[data-slot="${slot.id}"]`);
    if (line) {
      const len = Math.hypot(tx, ty) || 1;
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + tx);
      line.setAttribute('y2', cy + ty);
      line.style.setProperty('--len', len.toFixed(1));
    }
  }
}

/**
 * Retarget the tiles at a different layout without touching the DOM.
 *
 * This is what makes the transformation a morph rather than a cut: the tiles
 * keep their identity and their CSS transform transition carries them to the
 * new positions. Re-rendering would replace the elements and the frame would
 * simply blink into its new shape.
 */
export function setPreset(preset) {
  if (!current.stage || current.preset === preset) return;
  current.preset = preset;
  current.stage.classList.add('is-morphing');
  measure();
  clearTimeout(setPreset._t);
  setPreset._t = setTimeout(() => current.stage?.classList.remove('is-morphing'), 900);
}

/** How long the full boot stagger runs, so callers can time the announcement. */
export function bootDuration() {
  return TOTAL_BOOT_MS + 700;
}

/**
 * Roving tabindex: arrows move to the geometrically nearest tile in that
 * direction, which works for every layout preset without a per-preset map.
 */
export function onMatrixKeydown(e) {
  const from = e.target.closest?.('.tile');
  if (!from || !current.tiles) return;
  const dirs = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] };
  const dir = dirs[e.key];
  if (!dir) return;
  e.preventDefault();

  const all = [...current.tiles.querySelectorAll('.tile')];
  const rect = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const [fx, fy] = rect(from);

  let best = null;
  let bestScore = Infinity;
  for (const el of all) {
    if (el === from) continue;
    const [x, y] = rect(el);
    const dx = x - fx;
    const dy = y - fy;
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 4) continue;                       // not in that direction
    const across = Math.abs(dx * dir[1] - dy * dir[0]);
    const score = along + across * 2.2;             // prefer straight ahead
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (!best) return;
  all.forEach((el) => { el.tabIndex = -1; });
  best.tabIndex = 0;
  best.focus();
}
