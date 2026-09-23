import { renderDoc, renderToc } from './render.js';
import { initScrollSpy, initDrawer } from './nav.js';
import { initEvents } from './events.js';

renderDoc();
renderToc();
initDrawer();
initEvents();
initScrollSpy();

if (location.hash) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) target.scrollIntoView();
}
