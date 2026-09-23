import { state } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';

function init() {
  render(state);
  bindEvents(state);
}

init();
