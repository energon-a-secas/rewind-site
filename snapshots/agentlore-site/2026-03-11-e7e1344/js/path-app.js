import { state } from './state.js';
import { renderLearningPath, renderModal } from './render.js';
import { bindPathEvents } from './events.js';

state.view = 'path';

function init() {
  renderLearningPath(state);
  renderModal(state);
  bindPathEvents(state);
}

init();
