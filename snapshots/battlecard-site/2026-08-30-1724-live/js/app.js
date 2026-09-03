import { renderAll } from './render.js';
import { bindEvents } from './events.js';

function init() {
  renderAll();
  bindEvents();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
