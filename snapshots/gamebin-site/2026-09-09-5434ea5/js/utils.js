// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, debounce, showToast as kitToast } from './neorgon-dom.js';
export { escHtml, debounce };

// ── Shared utilities ─────────────────────────────────────────


/** This site's own toast contract, rendered by the kit. */
export function showToast(msg) {
  return kitToast(msg, { id: 'app-toast', className: 'toast',
    visibleClass: 'visible', duration: 2400 });
}



export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    showToast('Link copied');
  }).catch(() => {
    showToast('Failed to copy');
  });
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 30) return days + 'd ago';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const LIST_COLORS = [
  '#66c0f4', '#5ee6a8', '#e85d5d', '#c084fc',
  '#5bc0de', '#f472b6', '#eab308', '#14b8a6',
  '#f97316', '#3b82f6', '#a3a3a3', '#f43f5e',
];

export const DEFAULT_CATEGORIES = [
  { name: 'Bought', color: '#5ee6a8', _id: 'cat_default_0' },
  { name: 'Wishlist', color: '#eab308', _id: 'cat_default_1' },
  { name: 'Playing', color: '#66c0f4', _id: 'cat_default_2' },
  { name: 'Backlog', color: '#c084fc', _id: 'cat_default_3' },
  { name: 'Dropped', color: '#e85d5d', _id: 'cat_default_4' },
  { name: 'Co-op', color: '#f472b6', _id: 'cat_default_5' },
];
