import { loadCatalog } from './data.js';
import { bindEvents } from './events.js';
import { render } from './render.js';

async function init() {
  bindEvents();
  await loadCatalog();
  render();
}

init();
