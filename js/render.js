// ── DOM rendering ────────────────────────────────────────────
// Everything visual: the site rail, the filmstrip timeline, and the
// stage (single snapshot or A/B compare). Snapshots render inside
// iframes at a fixed design width, scaled down to fit the viewport.

import { WIDTHS, sitesList, timelineFor, snapById } from './state.js';
import { $, escHtml, fmtDate, fmtBytes } from './utils.js';

const blobUrls = new Map();               // browser-capture id -> object URL

export function srcFor(snap) {
  if (snap.source !== 'browser') return snap.path;
  if (!blobUrls.has(snap.id)) {
    blobUrls.set(snap.id, URL.createObjectURL(new Blob([snap.html], { type: 'text/html' })));
  }
  return blobUrls.get(snap.id);
}

export function dropBlobUrl(id) {
  if (blobUrls.has(id)) {
    URL.revokeObjectURL(blobUrls.get(id));
    blobUrls.delete(id);
  }
}

function badge(snap) {
  const label = snap.source === 'git' ? snap.commit : snap.source;
  return `<span class="rw-badge rw-badge--${escHtml(snap.source)}">${escHtml(label)}</span>`;
}

function thumb(snap) {
  if (snap.shot) {
    const gif = snap.gif ? ` data-gif="${escHtml(snap.gif)}" data-still="${escHtml(snap.shot)}"` : '';
    return `<img src="${escHtml(snap.shot)}" alt="" loading="lazy" decoding="async"${gif}>`;
  }
  const initial = (snap.site[0] || '?').toUpperCase();
  return `<span class="rw-thumb-ph" aria-hidden="true"><b>${escHtml(initial)}</b>${escHtml(fmtDate(snap.date))}</span>`;
}

// ── Rail ─────────────────────────────────────────────────────

function renderRail(state) {
  const sites = sitesList(state);
  $('railEl').innerHTML = sites.map((s) => `
    <button type="button" class="rw-rail-btn${s.id === state.site ? ' active' : ''}" data-site="${escHtml(s.id)}">
      <span class="rw-rail-name">${escHtml(s.title)}</span>
      <span class="rw-rail-sub">${escHtml(s.domain || 'browser captures')}</span>
      <span class="rw-rail-count">${s.count}</span>
    </button>`).join('') || '<p class="rw-rail-empty">No sites yet</p>';
}

// ── Timeline filmstrip ───────────────────────────────────────

function renderFilmstrip(state, timeline) {
  return `
  <div class="rw-filmstrip" id="filmstripEl" role="listbox" aria-label="Snapshots">
    ${timeline.map((snap) => `
      <button type="button" class="rw-card${snap.id === state.snapId ? ' active' : ''}" role="option"
              aria-selected="${snap.id === state.snapId}" data-snap="${escHtml(snap.id)}"
              title="${escHtml(snap.subject || '')}">
        <span class="rw-thumb">${thumb(snap)}</span>
        <span class="rw-card-meta">
          <span class="rw-card-date">${escHtml(fmtDate(snap.date))}</span>
          ${badge(snap)}
        </span>
      </button>`).join('')}
  </div>`;
}

// ── Stage ────────────────────────────────────────────────────

function widthSeg(state) {
  return `<span class="rw-seg" role="group" aria-label="Viewport width">
    ${Object.keys(WIDTHS).map((w) => `
      <button type="button" class="rw-seg-btn${state.width === w ? ' active' : ''}" data-width="${w}"
              aria-pressed="${state.width === w}">${w[0].toUpperCase() + w.slice(1)}</button>`).join('')}
  </span>`;
}

function pane(snap, slot, timeline) {
  const picker = slot ? `
    <select class="rw-pane-pick" data-slot="${slot}" aria-label="Snapshot ${slot.toUpperCase()}">
      ${timeline.map((t) => `<option value="${escHtml(t.id)}"${t.id === snap.id ? ' selected' : ''}>
        ${escHtml(fmtDate(t.date))} · ${escHtml(t.source === 'git' ? t.commit : t.source)}</option>`).join('')}
    </select>` : '';
  return `
  <div class="rw-pane">
    ${slot ? `<div class="rw-pane-head">${picker}${badge(snap)}</div>` : ''}
    <div class="rw-viewport">
      <iframe class="rw-frame" src="${escHtml(srcFor(snap))}" title="Snapshot ${escHtml(snap.id)}"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms" loading="lazy"></iframe>
    </div>
  </div>`;
}

function stageSingle(state, timeline, snap) {
  const idx = timeline.findIndex((t) => t.id === snap.id);
  const isLocal = snap.source === 'browser';
  const openHref = isLocal ? '#' : escHtml(snap.path);
  return `
  <div class="rw-stage-bar">
    <div class="rw-stage-info">
      <strong>${escHtml(fmtDate(snap.date))}</strong>
      ${badge(snap)}
      <span class="rw-stage-sub" title="${escHtml(snap.subject || '')}">${escHtml(snap.subject || '')}</span>
      ${snap.bytes ? `<span class="rw-stage-size">${escHtml(fmtBytes(snap.bytes))}${snap.files ? ` · ${snap.files} files` : ''}</span>` : ''}
    </div>
    <div class="toolbar rw-stage-tools">
      <button type="button" class="btn btn--ghost btn--sm" data-act="prev" ${idx <= 0 ? 'disabled' : ''} aria-label="Older snapshot">←</button>
      <span class="rw-stage-pos">${idx + 1}/${timeline.length}</span>
      <button type="button" class="btn btn--ghost btn--sm" data-act="next" ${idx >= timeline.length - 1 ? 'disabled' : ''} aria-label="Newer snapshot">→</button>
      ${widthSeg(state)}
      <button type="button" class="btn btn--secondary btn--sm" data-act="compare" ${timeline.length < 2 ? 'disabled' : ''}>Compare</button>
      ${isLocal
        ? `<button type="button" class="btn btn--ghost btn--sm" data-act="export">Export</button>
           <button type="button" class="btn btn--danger btn--sm" data-act="delete">Delete</button>`
        : `<a class="btn btn--ghost btn--sm" data-act="open" href="${openHref}" target="_blank" rel="noopener">Open ↗</a>`}
    </div>
  </div>
  ${pane(snap, null, timeline)}`;
}

function stageCompare(state, timeline) {
  const a = snapById(state, state.compare.aId) || timeline[0];
  const b = snapById(state, state.compare.bId) || timeline[timeline.length - 1];
  return `
  <div class="rw-stage-bar">
    <div class="rw-stage-info"><strong>Compare</strong>
      <span class="rw-stage-sub">${escHtml(fmtDate(a.date))} vs ${escHtml(fmtDate(b.date))}</span>
    </div>
    <div class="toolbar rw-stage-tools">
      ${widthSeg(state)}
      <button type="button" class="btn btn--secondary btn--sm" data-act="compare-close">Single view</button>
    </div>
  </div>
  <div class="rw-compare">${pane(a, 'a', timeline)}${pane(b, 'b', timeline)}</div>`;
}

// ── Content column ───────────────────────────────────────────

function emptyState() {
  return `
  <section class="section rw-empty">
    <div class="card">
      <h2 class="section__title">No snapshots yet</h2>
      <p class="section__lead">Rewind renders the archive in <code>data/manifest.json</code>.
        Build it from any project's git history, or mirror the live page:</p>
      <pre class="rw-code">python3 tools/capture.py git neorgon-site --shots
python3 tools/capture.py live neorgon.com --shots</pre>
      <p class="section__lead">Or press <strong>Capture</strong> in the header to grab a live
        page right here in the browser. It stays in this browser until you export it.</p>
    </div>
  </section>`;
}

function renderContent(state) {
  const el = $('contentEl');
  const sites = sitesList(state);
  if (sites.length === 0) {
    el.innerHTML = emptyState();
    return;
  }
  if (!state.site || !sites.some((s) => s.id === state.site)) state.site = sites[0].id;
  const timeline = timelineFor(state, state.site);
  if (!state.snapId || !timeline.some((t) => t.id === state.snapId)) {
    state.snapId = timeline.length ? timeline[timeline.length - 1].id : null;
  }
  const info = state.manifest.sites[state.site] || {};
  const snap = snapById(state, state.snapId);
  const range = timeline.length > 1
    ? `${fmtDate(timeline[0].date)} → ${fmtDate(timeline[timeline.length - 1].date)}`
    : fmtDate(timeline[0].date);
  el.innerHTML = `
    <div class="rw-sitehead">
      <div>
        <h2 class="rw-sitehead-title">${escHtml(info.title || state.site)}</h2>
        <p class="rw-sitehead-sub">
          ${info.domain ? `<a href="https://${escHtml(info.domain)}/" target="_blank" rel="noopener">${escHtml(info.domain)}</a> · ` : ''}
          ${timeline.length} snapshot${timeline.length === 1 ? '' : 's'} · ${escHtml(range)}
        </p>
      </div>
    </div>
    ${renderFilmstrip(state, timeline)}
    <div class="rw-stage" id="stageEl">
      ${state.compare.on && timeline.length > 1 ? stageCompare(state, timeline) : (snap ? stageSingle(state, timeline, snap) : '')}
    </div>`;
  const active = el.querySelector('.rw-card.active');
  if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// ── Iframe scaling ───────────────────────────────────────────

export function layoutStages(state) {
  const designW = WIDTHS[state.width];
  document.querySelectorAll('.rw-viewport').forEach((vp) => {
    const frame = vp.querySelector('.rw-frame');
    if (!frame) return;
    const scale = Math.min(1, vp.clientWidth / designW);
    frame.style.width = `${designW}px`;
    frame.style.height = `${Math.round(vp.clientHeight / scale)}px`;
    frame.style.transform = `scale(${scale})`;
    frame.style.marginLeft = `${Math.max(0, Math.round((vp.clientWidth - designW * scale) / 2))}px`;
  });
}

export function render(state) {
  renderRail(state);
  renderContent(state);
  layoutStages(state);
}
