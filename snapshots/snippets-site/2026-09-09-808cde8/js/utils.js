// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, debounce, showToast as kitToast } from './neorgon-dom.js';
export { escHtml, debounce };

// ── Shared utilities ─────────────────────────────────────────

const _els = {};
export function $(id) {
  return _els[id] || (_els[id] = document.getElementById(id));
}


export function searchTerms(query) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** HTML-escapes `text`, wrapping every occurrence of `terms` in a <mark>. */
export function highlight(text, terms) {
  const str = String(text ?? '');
  if (!terms.length) return escHtml(str);
  const pattern = [...terms].sort((a, b) => b.length - a.length).map(escapeRegex).join('|');
  return str
    .split(new RegExp(`(${pattern})`, 'gi'))
    .map((part, i) => (i % 2 ? `<mark>${escHtml(part)}</mark>` : escHtml(part)))
    .join('');
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** This site's own toast contract, rendered by the kit. */
export function showToast(msg) {
  return kitToast(msg, { id: 'app-toast', className: 'toast',
    visibleClass: 'visible', duration: 2000 });
}


