// ── Homepage entry point ─────────────────────────────────────
import { state, loadSaved } from './state.js';
import { renderCards, renderHeroTopics } from './render.js';
import { setupLangToggle } from './events.js';

async function init() {
  loadSaved(state);
  setupLangToggle();

  try {
    const res = await fetch('/data/posts.json');
    state.posts = await res.json();
    renderCards(state.posts.cards, state.lang);
    renderHeroTopics(state.posts.cards, state.lang);
  } catch {
    const grid = document.getElementById('posts-grid');
    if (grid) grid.innerHTML = '<p class="load-error">Could not load posts.</p>';
  }
}

document.addEventListener('langchange', () => {
  if (state.posts?.cards) {
    renderCards(state.posts.cards, state.lang);
    renderHeroTopics(state.posts.cards, state.lang);
  }
});

init();
