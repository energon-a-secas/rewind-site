// ── Event handlers ───────────────────────────────────────────
// Hash routing, copy-to-clipboard, and step completion toggles.

import { parseRoute, toggleDone } from './state.js';
import { render } from './render.js';
import { showToast } from './utils.js';

export function bindEvents(state) {
  // Hash routing
  const applyRoute = () => {
    state.route = parseRoute();
    render(state);
  };
  window.addEventListener('hashchange', applyRoute);
  applyRoute(); // initial route

  // Delegated clicks: copy buttons + step toggles
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      const code = copyBtn.closest('.code-block')?.querySelector('code');
      if (code) copyText(code.textContent, copyBtn);
      return;
    }

    const toggle = e.target.closest('[data-toggle-step]');
    if (toggle && state.route.name === 'track') {
      const i = parseInt(toggle.dataset.toggleStep, 10);
      toggleDone(state, state.route.trackId, i);
      render(state);
    }
  });
}

function copyText(text, btn) {
  const done = () => {
    const original = btn.textContent;
    btn.textContent = 'Copied';
    btn.classList.add('code-block__copy--done');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('code-block__copy--done');
    }, 1400);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); }
  catch { showToast('Copy failed, select the code manually'); }
  document.body.removeChild(ta);
}
