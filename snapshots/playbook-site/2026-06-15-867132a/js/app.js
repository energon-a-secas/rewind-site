// ── Homepage entry point ─────────────────────────────────────
import { state, loadSaved } from './state.js';
import { renderCards, renderHeroTopics } from './render.js';
import { setupLangToggle } from './events.js';

async function init() {
  loadSaved(state);
  setupLangToggle();
  renderHeroCopy(state.lang);

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

const HERO_COPY = {
  es: {
    title: 'Consejos que no te hacen perder el tiempo',
    desc: 'Notas sobre carreras tech: cómo entrar, cómo entrevistar en inglés y qué hace cada rol por dentro.',
    hint: 'Lecturas largas · bilingüe · índice en cada artículo',
  },
  en: {
    title: "Advice that doesn't waste your time",
    desc: 'Notes on tech careers: how to get in, how to interview in English, and what each job actually looks like from the inside.',
    hint: 'Long-form guides · bilingual · table of contents on every article',
  },
};

function renderHeroCopy(lang) {
  const copy = HERO_COPY[lang] || HERO_COPY.es;
  const title = document.getElementById('hero-title');
  const desc = document.getElementById('hero-desc');
  const hint = document.getElementById('hero-hint');
  if (title) title.textContent = copy.title;
  if (desc) desc.textContent = copy.desc;
  if (hint) hint.textContent = copy.hint;
}

document.addEventListener('langchange', () => {
  renderHeroCopy(state.lang);
  if (state.posts?.cards) {
    renderCards(state.posts.cards, state.lang);
    renderHeroTopics(state.posts.cards, state.lang);
  }
});

init();
