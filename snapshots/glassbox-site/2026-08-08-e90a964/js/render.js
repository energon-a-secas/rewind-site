// ── Shell render + lab router ────────────────────────────────
import { LABS, state } from './state.js';
import { $, el } from './utils.js';

import { mountLoop } from './labs/loop.js';
import { mountSdk } from './labs/sdk.js';
import { mountMcp } from './labs/mcp.js';
import { mountConfig } from './labs/config.js';
import { mountPlanning } from './labs/planning.js';
import { mountPatterns } from './labs/patterns.js';
import { mountTraps } from './labs/traps.js';
import { mountAntipatterns } from './labs/antipatterns.js';
import { mountDrill } from './labs/drill.js';
import { mountOverview } from './labs/overview.js';
import { mountContext } from './labs/context.js';
import { mountVocab } from './labs/vocab.js';

const LAB_MOUNT = {
  overview: mountOverview,
  loop: mountLoop,
  sdk: mountSdk,
  mcp: mountMcp,
  config: mountConfig,
  planning: mountPlanning,
  context: mountContext,
  patterns: mountPatterns,
  vocab: mountVocab,
  traps: mountTraps,
  antipatterns: mountAntipatterns,
  drill: mountDrill,
};

/** Build the sticky lab tab rail once. */
export function buildRail() {
  const inner = $('labRailInner');
  if (!inner) return;
  inner.innerHTML = '';
  LABS.forEach((lab) => {
    const btn = el('button', 'lab-tab');
    btn.type = 'button';
    btn.dataset.lab = lab.id;
    // Overview gets a house glyph; the labs keep their digit key.
    const chip = lab.id === 'overview'
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
      : lab.key;
    btn.innerHTML = `<span class="lab-tab__num">${chip}</span><span class="lab-tab__label">${lab.label}</span>`;
    btn.title = `${lab.hint} (${lab.key})`;
    inner.appendChild(btn);
  });
}

/** Reflect the active lab on the rail. */
export function syncRail(s) {
  document.querySelectorAll('.lab-tab').forEach((b) => {
    b.classList.toggle('is-active', b.dataset.lab === s.activeLab);
    b.setAttribute('aria-current', b.dataset.lab === s.activeLab ? 'page' : 'false');
  });
  // 10 tabs overflow the rail below ~1300px; keep the active one inside
  // the fade mask (horizontal only, never moves the page).
  document.querySelector('.lab-tab.is-active')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

/** Mount the active lab into #labMount.
 *  A lab's mount(root) may return a teardown function; it runs before the
 *  next mount (lab switch or exam-mode re-render) so timers and observers
 *  never outlive their DOM. */
let unmount = null;
export function mountLab(s) {
  const mount = $('labMount');
  if (!mount) return;
  if (typeof unmount === 'function') unmount();
  unmount = null;
  mount.innerHTML = '';
  document.body.dataset.lab = s.activeLab;
  document.body.dataset.capture = ''; // labs opt back in on mount (drill does)
  const ret = (LAB_MOUNT[s.activeLab] || (() => {}))(mount);
  unmount = typeof ret === 'function' ? ret : null;
  syncRail(s);
}

export function render(s) {
  buildRail();
  mountLab(s);
}
