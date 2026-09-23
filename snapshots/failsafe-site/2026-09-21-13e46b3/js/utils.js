// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml } from './neorgon-dom.js';
export { escHtml };

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}


export function toast(msg, duration = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(el._tid);
  el._tid = setTimeout(() => el.classList.remove('visible'), duration);
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_CYCLE = ['draft', 'active', 'archived'];
export function nextStatus(current) {
  const i = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length];
}

export const PRIORITY_LABELS = {
  immediate: 'Immediate',
  '24h': 'Within 24h',
  week: 'Within a week',
  whenever: 'When possible'
};

export const TRIGGER_TYPES = ['event', 'time', 'manual'];

export const RESOURCE_TYPES = ['account', 'key', 'address', 'credential', 'note'];
