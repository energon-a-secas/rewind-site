import { state, setActivePath } from './state.js';
import { renderLearningPath, renderModal } from './render.js';
import { bindPathEvents } from './events.js';

state.view = 'path';

function init() {
  renderLearningPath(state);
  renderModal(state);
  bindPathEvents(state);
  bindTrackSelector();
}

function bindTrackSelector() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.path-track-btn');
    if (!btn) return;
    const id = btn.dataset.path;
    if (!id || id === state.activePath) return;
    setActivePath(id);
    renderLearningPath(state);
  });
}

init();
