import { state } from './state.js';

let sections = [];
let tocPanel = null;
let pending = false;

function readingLine() {
  const header = document.querySelector('.header-bar');
  return (header ? header.getBoundingClientRect().height : 0) + 28;
}

function setActive(id) {
  if (id === state.activeSection) return;
  state.activeSection = id;

  document.querySelectorAll('.toc-sec.is-active').forEach(el => el.classList.remove('is-active'));
  document.querySelectorAll('.toc-ch.is-current').forEach(el => el.classList.remove('is-current'));

  const item = document.querySelector(`[data-toc-section="${id}"]`);
  if (!item) return;
  item.classList.add('is-active');

  const chapter = item.closest('.toc-ch');
  if (chapter) chapter.classList.add('is-current');

  keepVisible(item);
}

function keepVisible(item) {
  if (!tocPanel) return;
  const itemTop = item.offsetTop;
  const itemBottom = itemTop + item.offsetHeight;
  const viewTop = tocPanel.scrollTop;
  const viewBottom = viewTop + tocPanel.clientHeight;

  if (itemTop < viewTop) tocPanel.scrollTop = itemTop - 16;
  else if (itemBottom > viewBottom) tocPanel.scrollTop = itemBottom - tocPanel.clientHeight + 16;
}

function update() {
  pending = false;
  const line = readingLine();
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line) current = section;
    else break;
  }
  if (current) setActive(current.dataset.section);
}

function onScroll() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(update);
}

export function initScrollSpy() {
  sections = Array.from(document.querySelectorAll('.sec'));
  tocPanel = document.getElementById('tocPanel');
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

export function stepSection(delta) {
  const index = sections.findIndex(s => s.dataset.section === state.activeSection);
  const next = sections[Math.min(sections.length - 1, Math.max(0, index + delta))];
  if (!next) return;
  next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  history.replaceState(null, '', `#${next.dataset.section}`);
}

export function setDrawer(open) {
  state.drawerOpen = open;
  document.body.classList.toggle('drawer-open', open);
  const toggle = document.getElementById('tocToggle');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
}

export function initDrawer() {
  const toggle = document.getElementById('tocToggle');
  const scrim = document.getElementById('tocScrim');

  if (toggle) toggle.addEventListener('click', () => setDrawer(!state.drawerOpen));
  if (scrim) scrim.addEventListener('click', () => setDrawer(false));

  document.getElementById('tocList').addEventListener('click', event => {
    if (event.target.closest('a') && window.matchMedia('(max-width: 1000px)').matches) setDrawer(false);
  });
}
