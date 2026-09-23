// ── Event handlers ───────────────────────────────────────────
import { state, save } from './state.js';
import { render } from './render.js';
import { guides } from './guides.js';
import { $, debounce } from './utils.js';

export function bindEvents() {
  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'es' : 'en';
    save(state);
    render();
  });

  $('searchInput').addEventListener('input', debounce(e => {
    state.search = e.target.value.trim();
    render();
  }, 150));

  $('categoryPills').addEventListener('click', e => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    const cat = btn.dataset.cat || null;
    state.category = cat;
    render();
  });

  $('backBtn').addEventListener('click', () => {
    state.view = 'list';
    state.activeGuide = null;
    history.pushState(null, '', location.pathname);
    render();
    window.scrollTo(0, 0);
    if ($('searchInput')) $('searchInput').focus({ preventScroll: true });
  });

  $('guideToc').addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  });

  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    if (hash && guides.find(g => g.id === hash)) {
      state.view = 'detail';
      state.activeGuide = hash;
    } else {
      state.view = 'list';
      state.activeGuide = null;
    }
    render();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.view === 'detail') {
      state.view = 'list';
      state.activeGuide = null;
      history.pushState(null, '', location.pathname);
      render();
      window.scrollTo(0, 0);
      if ($('searchInput')) $('searchInput').focus({ preventScroll: true });
    }
  });
}
