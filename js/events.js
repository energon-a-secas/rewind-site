// ── Event handlers ───────────────────────────────────────────
// All event listeners and user interaction handlers.

import { state, save, timelineFor, snapById, WIDTHS } from './state.js';
import { render, layoutStages, srcFor, dropBlobUrl } from './render.js';
import { localPut, localDelete } from './data.js';
import { captureLive, exportCapture, normalizeUrl } from './capture.js';
import { $, escHtml, showToast, debounce } from './utils.js';

/** @param {HTMLElement} root */
function getFocusable(root) {
  const sel = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(root.querySelectorAll(sel)).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
    return el.getClientRects().length > 0;
  });
}

let _modalLastFocus = null;

/** @param {string} id */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  _modalLastFocus = /** @type {HTMLElement} */ (document.activeElement);
  modal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  const dialog = modal.querySelector('.modal__dialog');
  const list = dialog ? getFocusable(dialog) : [];
  const closeBtn = modal.querySelector('.modal__header [data-modal-close]');
  const toFocus = closeBtn && list.includes(closeBtn) ? closeBtn : list[0];
  if (toFocus) toFocus.focus();
}

/** @param {string} id */
export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.classList.remove('modal-open');
  if (_modalLastFocus && typeof _modalLastFocus.focus === 'function') {
    _modalLastFocus.focus();
  }
  _modalLastFocus = null;
}

function getOpenModal() {
  return document.querySelector('.modal:not([hidden])');
}

function onDocumentKeydown(e) {
  const modal = getOpenModal();
  if (modal && modal.id) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal(modal.id);
      return;
    }
    if (e.key !== 'Tab') return;
    const dialog = modal.querySelector('.modal__dialog');
    const list = dialog ? getFocusable(dialog) : [];
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    return;
  }
  // Timeline navigation (skip while typing in a field)
  if (/^(input|select|textarea)$/i.test(document.activeElement?.tagName || '')) return;
  if (e.key === 'ArrowLeft') step(-1);
  else if (e.key === 'ArrowRight') step(1);
  else if (e.key.toLowerCase() === 'c') toggleCompare();
}

/** Clicks on backdrop / [data-modal-close] close the modal. */
function onModalClick(e) {
  const modal = /** @type {HTMLElement | null} */ (e.target.closest('.modal'));
  if (!modal || modal.hasAttribute('hidden')) return;
  const t = /** @type {HTMLElement} */ (e.target);
  if (t.closest('[data-modal-close]')) closeModal(modal.id);
}

// ── App state transitions ────────────────────────────────────

function update() {
  render(state);
  save(state);
  const snap = state.snapId ? snapById(state, state.snapId) : null;
  history.replaceState(null, '', snap && snap.source !== 'browser' ? `#${snap.id}` : (state.site ? `#${state.site}` : ' '));
}

export function applyHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  if (!h) return;
  const snap = snapById(state, h);
  if (snap) {
    state.site = snap.site;
    state.snapId = snap.id;
  } else if (timelineFor(state, h).length || state.manifest.sites[h]) {
    state.site = h;
    state.snapId = null;
  }
}

function step(dir) {
  if (state.compare.on || !state.site) return;
  const timeline = timelineFor(state, state.site);
  const idx = timeline.findIndex((t) => t.id === state.snapId);
  const next = timeline[idx + dir];
  if (!next) return;
  state.snapId = next.id;
  update();
}

function toggleCompare() {
  if (!state.site) return;
  const timeline = timelineFor(state, state.site);
  if (timeline.length < 2) return;
  if (state.compare.on) {
    state.compare.on = false;
  } else {
    const idx = Math.max(1, timeline.findIndex((t) => t.id === state.snapId));
    state.compare = { on: true, aId: timeline[idx - 1].id, bId: timeline[idx].id };
  }
  update();
}

// ── Browser capture flow ─────────────────────────────────────

function siteIdForUrl(url) {
  const host = new URL(url).hostname;
  for (const [id, info] of Object.entries(state.manifest.sites)) {
    if (info.domain === host) return id;
  }
  return host.replace(/\./g, '-');
}

function stampNow() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

async function addLocalSnap(snap) {
  await localPut(snap);
  state.local.push(snap);
  state.site = snap.site;
  state.snapId = snap.id;
  state.compare.on = false;
}

async function runCapture() {
  const input = /** @type {HTMLInputElement} */ ($('captureUrl'));
  const status = $('captureStatus');
  const btn = $('captureRun');
  const url = normalizeUrl(input.value);
  if (!url) {
    status.textContent = 'Enter a domain or URL first.';
    return;
  }
  btn.disabled = true;
  status.textContent = 'Starting…';
  try {
    const got = await captureLive(url, (msg) => { status.textContent = msg; });
    const site = siteIdForUrl(got.url);
    const snap = {
      id: `${site}/${stampNow()}-browser`,
      site,
      date: new Date().toISOString(),
      source: 'browser',
      kind: 'single',
      subject: `Browser capture of ${got.url}`,
      bytes: got.html.length,
      html: got.html,
    };
    await addLocalSnap(snap);
    closeModal('captureModal');
    showToast(`Captured ${site} (${got.assets} assets inlined${got.tethered ? `, ${got.tethered} tethered` : ''})`);
    update();
  } catch (err) {
    status.textContent = `Capture failed: ${err.message}. Sites outside GitHub Pages often block cross-origin reads; use "python3 tools/capture.py live <url>" for those.`;
  } finally {
    btn.disabled = false;
  }
}

async function importFile(file) {
  const html = await file.text();
  const m = html.match(/Rewind (?:browser )?capture of (\S+) on/);
  const site = m ? siteIdForUrl(m[1]) : 'imported';
  const snap = {
    id: `${site}/${stampNow()}-browser`,
    site,
    date: new Date(file.lastModified || Date.now()).toISOString(),
    source: 'browser',
    kind: 'single',
    subject: `Imported ${file.name}`,
    bytes: html.length,
    html,
  };
  await addLocalSnap(snap);
  closeModal('captureModal');
  showToast(`Imported ${file.name}`);
  update();
}

async function deleteLocal(snap) {
  if (!window.confirm(`Delete the browser capture from ${new Date(snap.date).toLocaleString()}? This cannot be undone.`)) return;
  await localDelete(snap.id);
  dropBlobUrl(snap.id);
  state.local = state.local.filter((s) => s.id !== snap.id);
  if (state.snapId === snap.id) state.snapId = null;
  showToast('Capture deleted');
  update();
}

// ── Stage / rail / filmstrip delegation ──────────────────────

function onMainClick(e) {
  const railBtn = e.target.closest('.rw-rail-btn');
  if (railBtn) {
    state.site = railBtn.dataset.site;
    state.snapId = null;
    state.compare.on = false;
    update();
    return;
  }
  const card = e.target.closest('.rw-card[data-snap]');
  if (card) {
    state.snapId = card.dataset.snap;
    state.compare.on = false;
    update();
    return;
  }
  const widthBtn = e.target.closest('[data-width]');
  if (widthBtn && widthBtn.dataset.width in WIDTHS) {
    state.width = widthBtn.dataset.width;
    update();
    return;
  }
  const act = e.target.closest('[data-act]');
  if (!act) return;
  const snap = state.snapId ? snapById(state, state.snapId) : null;
  switch (act.dataset.act) {
    case 'prev': step(-1); break;
    case 'next': step(1); break;
    case 'compare':
    case 'compare-close': toggleCompare(); break;
    case 'export': if (snap) exportCapture(snap); break;
    case 'delete': if (snap) deleteLocal(snap); break;
    case 'open':
      if (snap && snap.source === 'browser') {
        act.setAttribute('href', srcFor(snap));
      }
      break;
    default: break;
  }
}

function onCompareSelect(e) {
  const sel = e.target.closest('.rw-pane-pick[data-slot]');
  if (!sel) return;
  state.compare[sel.dataset.slot === 'a' ? 'aId' : 'bId'] = sel.value;
  update();
}

function fillCaptureDatalist() {
  const dl = $('captureDomains');
  if (!dl) return;
  const domains = [...new Set(Object.values(state.manifest.sites).map((s) => s.domain).filter(Boolean))];
  dl.innerHTML = domains.map((d) => `<option value="${escHtml(d)}"></option>`).join('');
}

/** Bind all event listeners. Call once from app.js after render. */
export function bindEvents(_state) {
  document.addEventListener('keydown', onDocumentKeydown);
  document.addEventListener('click', onModalClick);
  document.getElementById('main').addEventListener('click', onMainClick);
  document.getElementById('main').addEventListener('change', onCompareSelect);

  $('captureBtn')?.addEventListener('click', () => {
    fillCaptureDatalist();
    $('captureStatus').textContent = '';
    openModal('captureModal');
  });
  $('helpBtn')?.addEventListener('click', () => openModal('helpModal'));
  $('captureRun')?.addEventListener('click', runCapture);
  $('captureUrl')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runCapture();
  });
  $('importInput')?.addEventListener('change', (e) => {
    const file = /** @type {HTMLInputElement} */ (e.target).files?.[0];
    if (file) importFile(file);
    /** @type {HTMLInputElement} */ (e.target).value = '';
  });

  window.addEventListener('hashchange', () => {
    applyHash();
    render(_state);
  });
  window.addEventListener('resize', debounce(() => layoutStages(_state), 150));
}
