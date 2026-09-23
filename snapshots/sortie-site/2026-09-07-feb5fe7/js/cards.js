// ── Part cards ───────────────────────────────────────────────
// Pure rendering. The rail below the matrix, the picker dialog, and the forge
// preview all use the same card so a part looks identical everywhere.

import { STATS, glyphSvgInner, SLOT_LABEL } from './parts.js';
import { escHtml } from './utils.js';

function statRows(part) {
  return STATS.map(({ key, label }) => {
    const v = Math.max(0, Math.min(100, Number(part.stats?.[key]) || 0));
    return `<div class="pcard__stat"><span>${label}</span><i style="--w:${v}%"></i></div>`;
  }).join('');
}

/**
 * @param {object} part
 * @param {number} i stagger index — drives the deal-in delay
 * @param {{pressed?: boolean, tag?: string, as?: string}} [opts]
 */
export function partCardHTML(part, i = 0, opts = {}) {
  const { pressed, tag, as = 'button' } = opts;
  const attrs = as === 'button'
    ? ` type="button" aria-pressed="${pressed ? 'true' : 'false'}"`
    : '';
  return `<${as} class="pcard" style="--i:${i}" data-part="${escHtml(part.id)}" data-slot="${escHtml(part.slot)}"${attrs}>
    <span class="pcard__chip"><svg viewBox="0 0 16 16" aria-hidden="true">${glyphSvgInner(part.glyph)}</svg></span>
    <span class="pcard__body">
      <span class="pcard__slot">${escHtml(SLOT_LABEL[part.slot] || part.slot)}</span>
      <span class="pcard__name">${escHtml(part.name)}</span>
      <span class="pcard__cls">${escHtml(part.cls || 'Frame')}</span>
      <span class="pcard__stats">${statRows(part)}</span>
    </span>
    ${tag ? `<span class="pcard__tag">${escHtml(tag)}</span>` : ''}
  </${as}>`;
}

/**
 * @param {HTMLElement} el
 * @param {Array} parts
 * @param {{instant?: boolean, empty?: string, activeId?: string, tagFor?: (p) => string}} [opts]
 */
export function renderRailInto(el, parts, opts = {}) {
  if (!el) return;
  const { instant, empty = 'Nothing here yet', activeId, tagFor } = opts;
  el.classList.toggle('is-instant', !!instant);
  if (!parts.length) {
    el.innerHTML = `<p class="rail-empty">${escHtml(empty)}</p>`;
    return;
  }
  el.innerHTML = parts
    .map((p, i) => partCardHTML(p, i, {
      pressed: activeId === p.id,
      tag: tagFor ? tagFor(p) : (p.stock ? '' : 'Forged'),
    }))
    .join('');
}
