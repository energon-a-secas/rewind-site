// ── Event handlers ───────────────────────────────────────────
import { state, save } from './state.js';
import { render } from './render.js';
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

  $('guideGrid').addEventListener('click', e => {
    const card = e.target.closest('.guide-card');
    if (!card) return;
    openGuide(card.dataset.id);
  });

  $('backBtn').addEventListener('click', () => {
    state.view = 'list';
    state.activeGuide = null;
    history.pushState(null, '', location.pathname);
    render();
    window.scrollTo(0, 0);
  });

  $('guideToc').addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('popstate', () => {
    const hash = location.hash.slice(1);
    if (hash) {
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
    }
  });
}

function openGuide(id) {
  state.view = 'detail';
  state.activeGuide = id;
  history.pushState(null, '', `#${id}`);
  render();
  window.scrollTo(0, 0);
}
