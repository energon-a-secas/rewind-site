// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, showToast as kitToast } from './neorgon-dom.js';
export { escHtml };

// ── Shared utilities ─────────────────────────────────────────
// Small, pure helper functions used across multiple modules.

/** Cached element lookup by ID (stable shell elements only). */
const _els = {};
export function $(id) {
  return _els[id] || (_els[id] = document.getElementById(id));
}


/** Show a temporary toast notification. */
/** This site's own toast contract, rendered by the kit. */
export function showToast(msg) {
  return kitToast(msg, { id: 'app-toast', className: 'toast',
    visibleClass: 'visible', duration: 2000 });
}


/** Format a token count compactly (e.g. 45000 → "45k"). */
export function fmtTokens(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
  if (n >= 1000) return Math.round(n / 1000) + 'k';
  return String(n);
}

/** Format a USD monthly cost: 0 → "Free", small → cents, large → rounded. */
export function fmtUsd(n) {
  if (!Number.isFinite(n) || n <= 0) return 'Free';
  if (n < 1) return '$' + n.toFixed(2);
  if (n < 100) return '$' + (Number.isInteger(n) ? n : n.toFixed(2));
  return '$' + Math.round(n).toLocaleString('en-US');
}

/** Clamp a number into [min, max], returning fallback for non-numeric input. */
export function clamp(value, min, max, fallback = min) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Copy text to the clipboard, resolving true on success. Falls back gracefully. */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through to legacy path */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Download a string as a file. */
export function downloadFile(name, text, type = 'text/markdown') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
