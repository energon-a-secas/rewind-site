// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml } from './neorgon-dom.js';
export { escHtml };

// ── Utilities ─────────────────────────────────────────────────

/** Stable URL fragment from category label (uses Spanish key for consistency). */
export function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}


export function toast(msg, duration = 2200) {
  const el = Object.assign(document.createElement('div'), {
    className: 'toast',
    textContent: msg,
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, duration);
}

/** Estimate reading time in minutes from text or a word count. */
export function readTime(textOrWords) {
  const words = typeof textOrWords === 'number'
    ? textOrWords
    : textOrWords.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
