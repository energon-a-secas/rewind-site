// ── Events ────────────────────────────────────────────────────
import { state, save } from './state.js';

/** Set up EN/ES language toggle buttons. */
export function setupLangToggle() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    const lang = btn.dataset.lang;
    if (lang === state.lang) return;
    state.lang = lang;
    save(state);
    updateLangButtons();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
  });
  updateLangButtons();
}

/** Reflect current lang in button active states. */
export function updateLangButtons() {
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === state.lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === state.lang);
  });
}
