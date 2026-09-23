// ── Global events ────────────────────────────────────────────
import { state, save, LABS } from './state.js';
import { mountLab } from './render.js';
import { setRailView, jumpToSection } from './rail.js';
import { $ } from './utils.js';
import { closeInspector, initTooltips } from './ui.js';

function setLab(id) {
  if (!id || id === state.activeLab) return;
  state.activeLab = id;
  // Entering a lab offers its sections again, even if the reader climbed
  // back out of the previous one.
  state.railView = 'auto';
  save(state);
  if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
  mountLab(state);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setExam(on) {
  state.examMode = on;
  document.body.classList.toggle('exam-mode', on);
  const btn = $('examToggle');
  if (btn) btn.setAttribute('aria-pressed', String(on));
  save(state);
  mountLab(state); // re-render so exam notes appear/disappear
}

export function bindEvents() {
  // Lab rail: labs, the drill-down into one lab's sections, and back out
  $('labRail')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-rail-back]')) { setRailView('labs'); return; }
    if (e.target.closest('[data-rail-sections]')) { setRailView('auto'); return; }
    const sub = e.target.closest('.lab-tab--sub');
    if (sub) { jumpToSection(sub.dataset.jump); return; }
    const tab = e.target.closest('.lab-tab');
    if (tab) setLab(tab.dataset.lab);
  });

  // Exam mode toggle
  $('examToggle')?.addEventListener('click', () => setExam(!state.examMode));

  // Inspector close (backdrop / close buttons)
  $('inspector')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-inspector-close]')) closeInspector();
  });

  // Keyboard: Esc closes inspector; digits jump to a lab
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeInspector(); return; }
    if (e.target.matches('input, textarea, select')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // A running drill claims the digit keys to answer questions.
    if (document.body.dataset.capture === 'keys') return;
    const lab = LABS.find((l) => l.key === e.key);
    if (lab) setLab(lab.id);
  });

  // Back/forward hash nav
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id && id !== state.activeLab && LABS.some((l) => l.id === id)) {
      state.activeLab = id;
      state.railView = 'auto';
      save(state);
      mountLab(state);
    }
  });

  // Apply persisted exam mode on load
  if (state.examMode) {
    document.body.classList.add('exam-mode');
    $('examToggle')?.setAttribute('aria-pressed', 'true');
  }

  initTooltips();
}
