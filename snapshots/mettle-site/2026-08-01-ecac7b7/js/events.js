// ── Event handlers ───────────────────────────────────────────
// Delegated listeners drive the three views. The probe runner is
// forward-only: once a rung is submitted it cannot be edited (prevents
// reverse-engineering the rubric).

import { $, showToast, downloadFile } from './utils.js';
import { state, save, wipe } from './state.js';
import { THEMES, FAST_OPTIONS } from './data.js';
import { scoreTheme } from './scorer.js';
import { render, recompute, showResult } from './render.js';

/** Start a probe run for a theme, in the currently selected mode. */
function beginProbe(themeId) {
  const mode = state.settings.mode || 'slow';
  state.active = { themeId, rungIndex: 0, mode };
  state.lastResult = null;
  // Fresh slate when rehearsing or when switching the recorded mode.
  if (state.settings.rehearsalMode || (state.results[themeId] && state.results[themeId].mode !== mode)) {
    state.drafts[themeId] = {};
  }
  render(state);
}

/** Capture the current rung's answer into drafts. Returns true if valid. */
function captureRung() {
  const theme = THEMES.find((t) => t.id === state.active.themeId);
  const rung = theme.rungs[state.active.rungIndex];
  state.drafts[theme.id] = state.drafts[theme.id] || {};

  if (state.active.mode === 'fast') {
    const chosen = document.querySelector('.fast-opt.is-chosen');
    if (!chosen) return false;
    const level = Number(chosen.dataset.level);
    state.drafts[theme.id][rung.id] = { level, optionText: chosen.textContent.trim() };
    return true;
  }

  const answer = (document.getElementById('probeAnswer')?.value || '').trim();
  if (!answer) return false;
  const confidence = Number(document.getElementById('probeConf')?.value ?? 50);
  state.drafts[theme.id][rung.id] = { answer, confidence };
  return true;
}

/** Advance to the next rung, or finish + score the theme. */
function advanceProbe() {
  if (!captureRung()) {
    showToast(state.active.mode === 'fast' ? 'Pick an option to continue.' : 'Write something before continuing.');
    return;
  }

  const theme = THEMES.find((t) => t.id === state.active.themeId);
  if (state.active.rungIndex < theme.rungs.length - 1) {
    state.active.rungIndex += 1;
    render(state);
    return;
  }

  const res = scoreTheme(theme, state.drafts[theme.id], state.active.mode);
  state.results[theme.id] = res;
  recompute(state);
  save(state);
  showResult(state, theme.id);
}

function goCompass() {
  state.active = null;
  state.lastResult = null;
  render(state);
}

/* ── Modal helpers (virtues explainer) ───────────────────────── */
function openModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.removeAttribute('hidden');
  document.body.classList.add('modal-open');
}
function closeModal(m) {
  m.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
}

/** Bind all event listeners once. */
export function bindEvents(_state) {
  const view = $('view');

  view.addEventListener('click', (e) => {
    // Mode toggle.
    const modeBtn = e.target.closest('.mode-btn');
    if (modeBtn) {
      state.settings.mode = modeBtn.dataset.mode;
      save(state);
      render(state);
      return;
    }

    // Virtues popup.
    if (e.target.closest('#openVirtues')) { openModal('virtuesModal'); return; }
    const closer = e.target.closest('[data-modal-close]');
    if (closer) { const m = closer.closest('.modal'); if (m) closeModal(m); return; }

    // Fast-mode option pick (toggle selection within the rung).
    const opt = e.target.closest('.fast-opt');
    if (opt) {
      document.querySelectorAll('.fast-opt').forEach((b) => b.classList.remove('is-chosen'));
      opt.classList.add('is-chosen');
      return;
    }

    // Theme start / retake.
    const themeBtn = e.target.closest('[data-theme]');
    if (themeBtn && (themeBtn.classList.contains('theme-card') || themeBtn.id === 'resultRetry')) {
      beginProbe(themeBtn.dataset.theme);
      return;
    }
    if (e.target.closest('#probeNext')) { advanceProbe(); return; }
    if (e.target.closest('#probeExit') || e.target.closest('#resultBack')) { goCompass(); return; }
  });

  view.addEventListener('input', (e) => {
    if (e.target.id === 'probeConf') {
      const out = document.getElementById('confVal');
      if (out) out.textContent = e.target.value;
    }
    if (e.target.id === 'rehearseToggle') {
      state.settings.rehearsalMode = e.target.checked;
      save(state);
    }
  });

  // Escape closes the virtues popup.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const m = document.querySelector('.modal:not([hidden])');
    if (m) closeModal(m);
  });

  $('exportBtn')?.addEventListener('click', () => {
    const out = { version: state.version, results: state.results, drafts: state.drafts, scores: state.scores };
    downloadFile('mettle-profile.json', JSON.stringify(out, null, 2));
  });
  $('wipeBtn')?.addEventListener('click', () => {
    if (confirm('Wipe all answers and scores? This cannot be undone.')) {
      wipe(state);
      save(state);
      goCompass();
      showToast('Profile wiped.');
    }
  });
}
