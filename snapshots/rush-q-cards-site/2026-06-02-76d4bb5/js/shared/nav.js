// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Nav link rewriting + active-state highlighting ───────────
// Rewrites absolute hrefs (/cards/, /game/, etc.) to work from
// any base path (local dev server, subdirectory deploy, etc.)
// Then highlights the current page's nav tab.

function getBasePath() {
  const path = location.pathname;
  // Known subpage dirs — if we're inside one, base is one level up
  const segments = ['game', 'quick', 'cards', 'rules', 'rulebook', 'balance', 'analysis', 'exercises'];
  for (const seg of segments) {
    const idx = path.indexOf('/' + seg + '/');
    if (idx !== -1) return path.slice(0, idx + 1);
  }
  // We're at the root index — strip trailing index.html if present
  return path.replace(/index\.html$/, '');
}

export function initNav() {
  const base = getBasePath();
  const path = location.pathname;

  // Rewrite all links with data-route (nav tabs)
  const routeLinks = document.querySelectorAll('a[data-route]');
  for (const link of routeLinks) {
    const route = link.dataset.route;           // e.g. "/cards/" or "/"
    const relative = route === '/' ? base : base + route.slice(1);
    link.href = relative;

    // Active state
    if (route === '/') {
      const isHome = path === base || path === base + 'index.html';
      link.classList.toggle('active', isHome);
    } else {
      link.classList.toggle('active', path.startsWith(base + route.slice(1)));
    }
  }

  // Rewrite hub-card links on the home page (href="/game/" etc.)
  const hubCards = document.querySelectorAll('.hub-card[href^="/"]');
  for (const card of hubCards) {
    const route = card.getAttribute('href');     // e.g. "/game/"
    card.href = base + route.slice(1);
  }
}

// Auto-init on load (wrap in try-catch to prevent blocking)
if (typeof initNav === 'function') {
  try {
    initNav();
  } catch (e) {
    console.warn('Nav initialization failed:', e);
  }
}
