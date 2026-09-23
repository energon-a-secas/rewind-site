import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';
import { checkUrlImport } from './export.js';

function init() {
  loadSaved(state);
  checkUrlImport(state);
  render(state);
  bindEvents(state);
}

init();
