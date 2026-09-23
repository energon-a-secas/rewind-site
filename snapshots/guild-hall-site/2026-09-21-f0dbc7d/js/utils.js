// Shared utilities

const _els = {};

function $(id) {
  return _els[id] || (_els[id] = document.getElementById(id));
}

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let _toastTimer = null;

function showToast(msg) {
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

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function starsHtml(count, rank) {
  if (count == null || count === 0) return '<span class="star star-tbd">TBD</span>';
  const cls = `star star-${rank}`;
  return Array.from({ length: count }, () => `<span class="${cls}">\u2605</span>`).join('');
}

function rewardsDisplay(q) {
  const stars = q.stars ?? 0;
  const karma = q.karma ?? 0;
  if (stars === 0 && karma === 0) return 'To Define';
  const parts = [];
  if (stars > 0) parts.push(`${stars} Stars`);
  if (karma > 0) parts.push(`${karma} Karma`);
  return parts.join(' · ') || 'To Define';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export { $, escHtml, showToast, debounce, starsHtml, rewardsDisplay, timeAgo };
