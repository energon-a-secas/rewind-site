// ── Lab rail: the lab list, and the drill-down into one lab's sections ──
// Two views in the same container (#labRailInner), so the sidebar (≥1024px)
// and the horizontal strip (below it) share every style:
//
//   labs · every lab, plus a "N sections" drill button under the active one
//   lab  · that lab's sections, headed by "All labs" to climb back out
//
// A lab opts a block in by putting data-section="Short label" on it. The
// scan runs after mount, in DOM order, and assigns an id when the element
// has none, so a lab declares a label and nothing else. Nothing here is
// hardcoded per lab: a lab with fewer than two declared sections simply
// never shows the drill-down.
//
// Centring the active tab is `keepInScroller` (utils.js), shared with the SDK
// lab's stepper: `scrollIntoView` scrolls the *page* when the strip is out of
// sight, which threw the reader to the top on reaching a lab's last section.

import { LABS, state } from './state.js';
import { $, el, escHtml, keepInScroller } from './utils.js';

const HOUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';

/** Sections the mounted lab declared, in DOM order. Ids are minted here. */
export function scanSections() {
  const mount = $('labMount');
  if (!mount) return [];
  return [...mount.querySelectorAll('[data-section]')].map((node, i) => {
    if (!node.id) node.id = `sec-${state.activeLab}-${i + 1}`;
    return { id: node.id, label: node.dataset.section };
  });
}

function labTab(lab) {
  const btn = el('button', 'lab-tab');
  btn.type = 'button';
  btn.dataset.lab = lab.id;
  const chip = lab.id === 'overview' ? HOUSE : lab.key;
  btn.innerHTML = `<span class="lab-tab__num">${chip}</span><span class="lab-tab__label">${lab.label}</span>`;
  btn.title = `${lab.hint} (${lab.key})`;
  return btn;
}

function renderLabList(sections) {
  const inner = $('labRailInner');
  if (!inner) return;
  inner.innerHTML = '';
  LABS.forEach((lab) => {
    inner.appendChild(labTab(lab));
    if (lab.id === state.activeLab && sections.length > 1) {
      const drill = el('button', 'rail-drill');
      drill.type = 'button';
      drill.dataset.railSections = '';
      drill.innerHTML = `<span>${sections.length} sections</span>${CHEV}`;
      drill.title = `Jump inside ${lab.label}`;
      inner.appendChild(drill);
    }
  });
}

function renderSubList(sections) {
  const inner = $('labRailInner');
  if (!inner) return;
  const lab = LABS.find((l) => l.id === state.activeLab);
  inner.innerHTML = '';

  const back = el('button', 'rail-back');
  back.type = 'button';
  back.dataset.railBack = '';
  back.innerHTML = `${BACK}<span>All labs</span>`;
  inner.appendChild(back);

  const head = el('div', 'rail-head');
  head.textContent = lab ? lab.label : '';
  inner.appendChild(head);

  sections.forEach((s) => {
    const btn = el('button', 'lab-tab lab-tab--sub');
    btn.type = 'button';
    btn.dataset.jump = s.id;
    btn.innerHTML = `<span class="lab-tab__dot"></span><span class="lab-tab__label">${escHtml(s.label)}</span>`;
    btn.title = s.label;
    inner.appendChild(btn);
  });
}

/** Where the content starts, taken from the one place that already knows:
 *  `html { scroll-padding-top }` is what the browser itself subtracts when it
 *  lands a jump, so reading it keeps the highlight line and the landing spot
 *  the same number at every breakpoint. The fallback measures the chrome. */
function topOffset() {
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
  if (Number.isFinite(pad)) return pad;
  const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
  const r = document.querySelector('.lab-rail')?.getBoundingClientRect();
  if (r && r.width > r.height * 3) return Math.max(headerH, r.bottom);
  return headerH;
}

/** The scroll position at which a section is "the one you are reading":
 *  its top under the chrome, clamped to what the page can actually scroll.
 *  The jump and the highlight both go through here, which is what makes them
 *  agree: the last section sits inside the final viewport and can never reach
 *  the top of the page, so anything comparing raw offsets leaves its tab unlit
 *  no matter how far down the reader goes. */
function sectionTarget(node) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const abs = window.scrollY + node.getBoundingClientRect().top - topOffset();
  return Math.max(0, Math.min(abs, max));
}

/** Highlight the section the reader is actually looking at. */
function trackSections(sections) {
  if (!sections.length) return null;
  let raf = 0;
  let last = null;
  const pick = () => {
    raf = 0;
    // The line must be the same number a jump lands on, or the tab for the
    // previous section stays lit after every jump. topOffset() reads the
    // browser's own scroll-padding, so the two cannot drift apart.
    // The 32px slack is not cosmetic: `scrollHeight - innerHeight` is not
    // always reachable (this viewport stops 15px short of it, and a mobile
    // browser with a collapsing toolbar is worse), so a clamped target for the
    // last section can sit just beyond where the page will actually stop.
    let active = sections[0].id;
    for (const s of sections) {
      const node = document.getElementById(s.id);
      if (node && window.scrollY >= sectionTarget(node) - 32) active = s.id;
    }
    if (active === last) return;
    last = active;
    document.querySelectorAll('.lab-tab--sub').forEach((b) => {
      const on = b.dataset.jump === active;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
    });
    keepInScroller(document.querySelector('.lab-tab--sub.is-active'));
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  pick();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}

/** Reflect the active lab on the rail (lab view only). */
export function syncRail(s) {
  document.querySelectorAll('.lab-tab[data-lab]').forEach((b) => {
    const on = b.dataset.lab === s.activeLab;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-current', on ? 'page' : 'false');
  });
  // 13 tabs overflow the strip below ~1300px; keep the active one inside
  // the fade mask (the rail's scroller only, never the page).
  keepInScroller(document.querySelector('.lab-tab.is-active'));
}

let stopTracking = null;
let sections = [];

/** Rebuild the rail for the lab that was just mounted. */
export function refreshRail(s) {
  if (typeof stopTracking === 'function') stopTracking();
  stopTracking = null;
  sections = scanSections();
  const sub = s.railView !== 'labs' && sections.length > 1;
  document.body.dataset.railView = sub ? 'lab' : 'labs';
  if (sub) {
    renderSubList(sections);
    stopTracking = trackSections(sections);
  } else {
    renderLabList(sections);
    syncRail(s);
  }
}

/** "All labs" / "N sections": switch view without remounting the lab. */
export function setRailView(view) {
  state.railView = view;
  refreshRail(state);
}

export function jumpToSection(id) {
  const node = document.getElementById(id);
  if (node) window.scrollTo({ top: sectionTarget(node), behavior: 'smooth' });
}
