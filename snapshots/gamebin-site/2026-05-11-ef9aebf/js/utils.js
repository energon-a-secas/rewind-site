// ── Shared utilities ─────────────────────────────────────────

export function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2400);
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
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
