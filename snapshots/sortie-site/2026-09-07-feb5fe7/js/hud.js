// ── Section panels ───────────────────────────────────────────
// The six numbered readouts flanking the frame, after the cockpit reference:
// a header bar carrying the section number and an ON/OFF state, then a few
// lines of status beneath it.
//
// Every line reports something real. A panel of invented telemetry would look
// the same and mean nothing, and the console already knows all of this.

import { state } from './state.js';
import { SLOTS, SLOT_KIND, isOverweight, isEnStarved } from './parts.js';
import { FORM_BY_ID } from './layout.js';
import { $, escHtml } from './utils.js';

const pad = (n, w = 4) => String(Math.round(n)).padStart(w, '0');
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

/**
 * @param {object} ctx  { stats, parts, mode, form }
 * @returns {Array<{n:number, title:string, on:boolean, lines:string[]}>}
 */
function sections(ctx) {
  const { stats, parts, mode, form } = ctx;
  const frame = parts.filter((p) => SLOT_KIND[p.slot] === 'frame').length;
  const frameTotal = SLOTS.filter((s) => s.kind === 'frame').length;
  const arms = parts.filter((p) => SLOT_KIND[p.slot] === 'hardpoint');

  return [
    { n: 1, title: 'STRUCTURE', on: frame === frameTotal, lines: [
      `SECTION-A FRAME/${pad(frame, 2)}-${pad(frameTotal, 2)}`,
      `SECTION-B ARMOR/${pad(stats.ap, 3)}`,
      `SECTION-C INTEGRITY/${frame === frameTotal ? 'NOMINAL' : 'PARTIAL'}`,
    ] },
    { n: 2, title: 'GENERATOR', on: !isEnStarved(stats), lines: [
      `SECTION-A OUTPUT/${pad(stats.output)}`,
      `SECTION-B LOAD/${pad(stats.enLoad)}`,
      `SECTION-C MARGIN/${pct(stats.enLoad, stats.output)}PCT`,
      `SECTION-D ${isEnStarved(stats) ? 'DEFICIT/ALERT' : 'SUPPLY/STABLE'}`,
    ] },
    { n: 3, title: 'ARMAMENT', on: arms.length > 0, lines: [
      `SECTION-A HARDPOINT/${pad(arms.length, 2)}-04`,
      `SECTION-B ATTACK/${pad(stats.atk, 3)}`,
      `SECTION-C IMPACT/${pad(stats.imp, 3)}`,
    ] },
    { n: 4, title: 'SENSOR/FCS', on: stats.rng > 0, lines: [
      `SECTION-A RANGE/${pad(stats.rng, 3)}`,
      `SECTION-B LOCK/${stats.rng > 60 ? 'EXTENDED' : 'SHORT'}`,
      `SECTION-C TRACKING/PAR`,
    ] },
    { n: 5, title: 'MOBILITY', on: !isOverweight(stats), lines: [
      `SECTION-A CAPACITY/${pad(stats.capacity, 5)}`,
      `SECTION-B LOAD/${pad(stats.weight, 5)}`,
      `SECTION-C MARGIN/${pct(stats.weight, stats.capacity)}PCT`,
      `SECTION-D ${isOverweight(stats) ? 'OVERLOAD/ALERT' : 'BALANCE/OK'}`,
    ] },
    { n: 6, title: 'CORE SYSTEM', on: true, lines: [
      `SECTION-A FORM/${(form ? form.label : 'FRAME').toUpperCase()}`,
      `SECTION-B MODE/${(mode ? mode.label : 'STANDBY').toUpperCase()}`,
      `SECTION-C DEVICE/SEATED`,
    ] },
  ];
}

function panelHTML(sec) {
  return `<div class="hudp" data-on="${sec.on}">
    <div class="hudp__head">
      <span class="hudp__num">${sec.n}</span>
      <span class="hudp__title">${escHtml(sec.title)}</span>
      <span class="hudp__state">${sec.on ? 'ON' : 'OFF'}</span>
    </div>
    <ul class="hudp__lines">
      ${sec.lines.map((l) => `<li>${escHtml(l)}</li>`).join('')}
    </ul>
  </div>`;
}

/** Panels 4-6 sit left, 1-3 right, matching the cockpit layout. */
export function renderHud(ctx) {
  const left = $('hudLeft');
  const right = $('hudRight');
  if (!left || !right) return;
  const all = sections(ctx);
  right.innerHTML = all.filter((s) => s.n <= 3).map(panelHTML).join('');
  left.innerHTML = all.filter((s) => s.n > 3).map(panelHTML).join('');
}
