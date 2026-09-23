// ── Shared utilities ─────────────────────────────────────────

const _els = {};
export function $(id) {
  return _els[id] || (_els[id] = document.getElementById(id));
}

export function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
