import { renderLayoutNav, renderMockup, renderBrowser, renderHeroBgPicker } from './render.js';
import { initEvents } from './events.js';
import { state } from './state.js';
import { LAYOUTS } from './data.js';

function init() {
  // Phase 5: URL sharing — read ?layout= param
  const params = new URLSearchParams(window.location.search);
  const urlLayout = params.get('layout');
  if (urlLayout && LAYOUTS.some(l => l.id === urlLayout)) {
    state.activeLayout = urlLayout;
    const layout = LAYOUTS.find(l => l.id === urlLayout);
    if (layout?.category === 'basic') state.lastBasicType = urlLayout;
    else if (layout?.parentType) state.lastBasicType = layout.parentType;
  }

  renderLayoutNav();
  renderMockup();
  renderBrowser();
  renderHeroBgPicker();
  initEvents();

  // Set initial button states based on default state
  document.getElementById('browserToggle').classList.add('active');
  document.getElementById('outlinesToggle').classList.add('active');
  document.getElementById('dummyToggle').classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);
