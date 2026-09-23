// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Nav link rewriting + active-state highlighting ───────────
// Rewrites absolute hrefs (/cards/, /game/, etc.) to work from
// any base path (local dev server, subdirectory deploy, etc.)
// Then highlights the current page's nav tab.
//
// Secondary pages live in a "More" dropdown that this module injects
// on every page, so the primary nav stays at a fixed set of tabs and
// discoverability is identical everywhere without editing each HTML file.

const SUBPAGE_SEGMENTS = [
  'game', 'quick', 'cards', 'rules', 'rulebook', 'balance', 'analysis',
  'exercises', 'simulation', 'faq', 'history', 'campaign', 'behavior',
  'mechanics', 'assessment', 'facilitator', 'table-talk', 'room',
];

// Pages reachable only through the "More" menu, grouped for scannability.
// Routes here are pulled out of the inline primary nav if present.
const MORE_GROUPS = [
  {
    label: 'Learn',
    items: [
      { route: '/rulebook/', label: 'Full Rulebook' },
      { route: '/faq/', label: 'FAQ' },
      { route: '/history/', label: 'History' },
    ],
  },
  {
    label: 'Analyze',
    items: [
      { route: '/balance/', label: 'Card Balance' },
      { route: '/analysis/', label: 'Expert Analysis' },
      { route: '/simulation/', label: 'Simulator' },
    ],
  },
  {
    label: 'Facilitate',
    items: [
      { route: '/facilitator/', label: 'Facilitator Kit' },
      { route: '/room/', label: 'Room Compass' },
      { route: '/table-talk/', label: 'Table Talk' },
    ],
  },
  {
    label: 'Play',
    items: [
      { route: '/campaign/', label: 'Campaign' },
    ],
  },
];

const MORE_ROUTES = new Set(MORE_GROUPS.flatMap((g) => g.items.map((i) => i.route)));

function getBasePath() {
  const path = location.pathname;
  for (const seg of SUBPAGE_SEGMENTS) {
    const idx = path.indexOf('/' + seg + '/');
    if (idx !== -1) return path.slice(0, idx + 1);
  }
  return path.replace(/index\.html$/, '');
}

function resolve(base, route) {
  return route === '/' ? base : base + route.slice(1);
}

function isActiveRoute(base, path, route) {
  if (route === '/') return path === base || path === base + 'index.html';
  return path.startsWith(base + route.slice(1));
}

function buildMoreDropdown(base, path) {
  const activeInMore = [...MORE_ROUTES].some((r) => isActiveRoute(base, path, r));

  const wrap = document.createElement('div');
  wrap.className = 'nav-more';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-more-btn' + (activeInMore ? ' active' : '');
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = 'More <span class="nav-more-caret" aria-hidden="true">▾</span>';

  const menu = document.createElement('div');
  menu.className = 'nav-more-menu';
  menu.setAttribute('role', 'menu');
  menu.hidden = true;

  for (const group of MORE_GROUPS) {
    const gl = document.createElement('div');
    gl.className = 'nav-more-group';
    gl.textContent = group.label;
    menu.appendChild(gl);
    for (const item of group.items) {
      const a = document.createElement('a');
      a.href = resolve(base, item.route);
      a.textContent = item.label;
      a.setAttribute('role', 'menuitem');
      if (isActiveRoute(base, path, item.route)) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
      menu.appendChild(a);
    }
  }

  const setOpen = (open) => {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(menu.hidden);
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      menu.querySelector('a')?.focus();
    }
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setOpen(false); btn.focus(); }
  });
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) setOpen(false);
  });

  wrap.append(btn, menu);
  return wrap;
}

export function initNav() {
  const base = getBasePath();
  const path = location.pathname;

  const routeLinks = document.querySelectorAll('a[data-route]');
  for (const link of routeLinks) {
    const route = link.dataset.route;
    // Pull any secondary route that was hardcoded inline out of the primary
    // row — the "More" dropdown owns those.
    if (MORE_ROUTES.has(route)) { link.remove(); continue; }
    link.href = resolve(base, route);
    const active = isActiveRoute(base, path, route);
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
  }

  const nav = document.querySelector('nav.header-nav');
  if (nav && !nav.querySelector('.nav-more')) {
    nav.appendChild(buildMoreDropdown(base, path));
  }

  const hubCards = document.querySelectorAll('.hub-card[href^="/"]');
  for (const card of hubCards) {
    card.href = base + card.getAttribute('href').slice(1);
  }
}

// Auto-init on load (wrap in try-catch to prevent blocking)
try {
  initNav();
} catch (e) {
  console.warn('Nav initialization failed:', e);
}
