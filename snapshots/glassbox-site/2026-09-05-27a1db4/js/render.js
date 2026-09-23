// ── Shell render + lab router ────────────────────────────────
import { $ } from './utils.js';
import { refreshRail } from './rail.js';

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
import { mountFoundations } from './labs/foundations.js';

const LAB_MOUNT = {
  overview: mountOverview,
  foundations: mountFoundations,
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

/** Mount the active lab into #labMount.
 *  A lab's mount(root) may return a teardown function; it runs before the
 *  next mount (lab switch or exam-mode re-render) so timers and observers
 *  never outlive their DOM. The rail is rebuilt *after* the mount, because
 *  its subsection view is scanned out of the markup the lab just wrote. */
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
  refreshRail(s);
}

export function render(s) {
  mountLab(s);
}
