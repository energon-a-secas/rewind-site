import { renderLayoutNav, renderMockup, renderBrowser, renderHeroBgPicker,
         showTooltip, syncBrowserHighlight } from './render.js';
import { initEvents } from './events.js';
import { state } from './state.js';
import { LAYOUTS, LAYOUT_COMPONENTS, COMPONENTS } from './data.js';
import { prefersReducedMotion } from './utils.js';

function layoutIdForComponent(compId) {
  if (!COMPONENTS[compId]) return null;
  for (const [layoutId, ids] of Object.entries(LAYOUT_COMPONENTS)) {
    if (ids.includes(compId)) return layoutId;
  }
  return null;
}

function isSafeCompParam(id) {
  return typeof id === 'string' && /^[a-z][a-z0-9-]*$/.test(id);
}

function syncUrlLayoutAndComp(compId) {
  const url = new URL(window.location.href);
  url.searchParams.set('layout', state.activeLayout);
  if (compId) url.searchParams.set('comp', compId);
  history.replaceState(null, '', url);
}

function focusComponentFromUrl(compId) {
  const el = document.querySelector(`#mockupFrame [data-comp="${CSS.escape(compId)}"]`);
  if (!el) return;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    block: 'center',
  });
  state.pinnedComp = compId;
  state.activeComp = compId;
  showTooltip(compId, el);
  syncBrowserHighlight(compId);
}

function init() {
  const params = new URLSearchParams(window.location.search);
  const urlLayout = params.get('layout');
  if (urlLayout && LAYOUTS.some(l => l.id === urlLayout)) {
    state.activeLayout = urlLayout;
    const layout = LAYOUTS.find(l => l.id === urlLayout);
    if (layout?.category === 'basic') state.lastBasicType = urlLayout;
    else if (layout?.parentType) state.lastBasicType = layout.parentType;
  }

  const compParam = params.get('comp');
  if (compParam && isSafeCompParam(compParam) && COMPONENTS[compParam]) {
    const lid = layoutIdForComponent(compParam);
    if (lid) {
      state.activeLayout = lid;
      const layout = LAYOUTS.find(l => l.id === lid);
      if (layout?.category === 'basic') state.lastBasicType = lid;
      else if (layout?.parentType) state.lastBasicType = layout.parentType;
    }
  }

  renderLayoutNav();
  renderMockup();
  renderBrowser();
  renderHeroBgPicker();
  initEvents();

  document.getElementById('browserToggle').classList.add('active');
  document.getElementById('outlinesToggle').classList.add('active');
  document.getElementById('dummyToggle').classList.add('active');

  if (compParam && isSafeCompParam(compParam) && COMPONENTS[compParam] && layoutIdForComponent(compParam)) {
    syncUrlLayoutAndComp(compParam);
    requestAnimationFrame(() => {
      setTimeout(() => focusComponentFromUrl(compParam), 100);
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
