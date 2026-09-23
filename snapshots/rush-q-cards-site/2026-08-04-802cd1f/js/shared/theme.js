// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Day / Night theme ────────────────────────────────────────
// The resolved theme is already on <html> before first paint — see the inline
// bootstrap in each page's <head>. This module owns the *control*: the header
// switch, the system-preference subscription, and persistence.
//
// Three states, because "auto" is a real user intent and not a fallback:
//   auto  — follow the OS, and keep following it as the OS changes
//   light — pinned Day
//   dark  — pinned Night

const STORAGE_KEY = 'rq-theme';
const MODES = ['auto', 'light', 'dark'];

const ICONS = {
  auto: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none"/></svg>',
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.4M12 19v2.4M21.4 12H19M5 12H2.6M18.7 5.3l-1.7 1.7M7 17l-1.7 1.7M18.7 18.7 17 17M7 7 5.3 5.3"/></svg>',
  dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8z"/></svg>',
};

const LABELS = { auto: 'Match system', light: 'Day', dark: 'Night' };

const mqDark = window.matchMedia('(prefers-color-scheme: dark)');

function readMode() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

function resolve(mode) {
  return mode === 'auto' ? (mqDark.matches ? 'dark' : 'light') : mode;
}

/** Applies a mode to the document and persists it. */
export function setTheme(mode, { animate = true } = {}) {
  const next = MODES.includes(mode) ? mode : 'auto';
  const root = document.documentElement;

  if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 300);
  }

  root.dataset.themePref = next;
  root.dataset.theme = resolve(next);

  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode */ }

  syncMetaColor();
  document.dispatchEvent(new CustomEvent('themechange', {
    detail: { mode: next, resolved: root.dataset.theme },
  }));
  return next;
}

export function getTheme() {
  return { mode: readMode(), resolved: document.documentElement.dataset.theme || 'dark' };
}

/** Keeps the mobile browser chrome in step with the page. */
function syncMetaColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) return;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if (bg) meta.setAttribute('content', bg);
}

function buildSwitch() {
  const mode = readMode();

  const wrap = document.createElement('div');
  wrap.className = 'theme-switch';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-switch-btn';
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('div');
  menu.className = 'theme-switch-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  const opts = MODES.map((m) => {
    const o = document.createElement('button');
    o.type = 'button';
    o.className = 'theme-switch-opt';
    o.setAttribute('role', 'menuitemradio');
    o.dataset.mode = m;
    o.innerHTML = `${ICONS[m]}<span>${LABELS[m]}</span>`;
    o.addEventListener('click', () => {
      setTheme(m);
      paint(m);
      setOpen(false);
      btn.focus();
    });
    menu.appendChild(o);
    return o;
  });

  function paint(current) {
    btn.innerHTML = ICONS[current];
    btn.title = `Theme: ${LABELS[current]}`;
    btn.setAttribute('aria-label', `Theme: ${LABELS[current]}. Change theme`);
    for (const o of opts) o.setAttribute('aria-checked', String(o.dataset.mode === current));
  }

  function setOpen(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  }

  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      menu.querySelector('.theme-switch-opt')?.focus();
    }
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });

  paint(mode);
  wrap.append(btn, menu);
  return wrap;
}

/** Mounts the switch at [data-theme-switch], else just left of the hub link. */
function mount() {
  if (document.querySelector('.theme-switch')) return;
  const slot = document.querySelector('[data-theme-switch]');
  const control = buildSwitch();

  if (slot) { slot.appendChild(control); return; }

  const header = document.querySelector('.header-bar');
  if (!header) return;
  const anchor = header.querySelector('.settings-gear') || header.querySelector('.header-home');
  if (anchor) header.insertBefore(control, anchor);
  else header.appendChild(control);
}

export function initTheme() {
  mount();
  syncMetaColor();

  // An OS flip should move the page only while the user is on "auto".
  mqDark.addEventListener('change', () => {
    if (readMode() !== 'auto') return;
    document.documentElement.dataset.theme = resolve('auto');
    syncMetaColor();
    document.dispatchEvent(new CustomEvent('themechange', {
      detail: { mode: 'auto', resolved: document.documentElement.dataset.theme },
    }));
  });
}

try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme, { once: true });
  } else {
    initTheme();
  }
} catch (e) {
  console.warn('Theme initialization failed:', e);
}
