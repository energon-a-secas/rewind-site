import { state } from './state.js';
import { tutorials, CATEGORIES, TOOLS, LEVEL_META, LEARNING_PATH } from './data.js';
import { $, escHtml, renderMarkdown } from './utils.js';

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced'];

export function render(s) {
  renderDropdowns();
  renderSections(s);
  renderModal(s);
}

function renderDropdowns() {
  renderDropdown('dd-category-menu', CATEGORIES, state.activeCategory);
  renderDropdown('dd-tool-menu', TOOLS, state.activeTool);
}

function renderDropdown(menuId, items, activeVal) {
  const menu = $(menuId);
  if (!menu) return;
  let html = `<li class="dropdown-item${!activeVal ? ' selected' : ''}" data-value="">All</li>`;
  for (const [key, label] of Object.entries(items)) {
    html += `<li class="dropdown-item${activeVal === key ? ' selected' : ''}" data-value="${key}">${escHtml(label)}</li>`;
  }
  menu.innerHTML = html;
}

function matchesFilters(t, s) {
  if (s.activeCategory && t.category !== s.activeCategory) return false;
  if (s.activeTool && !t.tools.includes(s.activeTool)) return false;
  if (s.searchQuery) {
    const q = s.searchQuery.toLowerCase();
    const haystack = (t.title + ' ' + t.description + ' ' + t.category + ' ' + t.tools.join(' ') + ' ' + t.difficulty).toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function renderSections(s) {
  const container = $('tutorials-content');
  const empty = $('empty-state');
  if (!container) return;

  const filtered = tutorials.filter(t => matchesFilters(t, s));

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (empty) empty.hidden = false;
    updateCount(0);
    return;
  }

  if (empty) empty.hidden = true;

  const groups = {};
  for (const level of LEVEL_ORDER) groups[level] = [];
  for (const t of filtered) groups[t.difficulty].push(t);

  let html = '';
  for (const level of LEVEL_ORDER) {
    const items = groups[level];
    if (items.length === 0) continue;
    const meta = LEVEL_META[level];
    html += `<section class="level-section" data-level="${level}">
  <div class="level-header">
    <span class="level-number">${meta.icon}</span>
    <div>
      <h2 class="level-title">${meta.label}</h2>
      <p class="level-subtitle">${meta.subtitle}</p>
    </div>
  </div>
  <div class="level-grid">
    ${items.map(t => renderCard(t)).join('')}
  </div>
</section>`;
  }

  container.innerHTML = html;
  updateCount(filtered.length);
}

function renderCard(t) {
  const toolBadges = t.tools.map(tool =>
    `<span class="badge badge-tool ${tool}">${tool === 'claude' ? 'Claude' : 'Cursor'}</span>`
  ).join('');

  return `<article class="tutorial-card" data-id="${t.id}" data-cat="${t.category}" tabindex="0" role="button" aria-label="Open ${escHtml(t.title)}">
  <div class="tutorial-header">
    <h3 class="tutorial-title">${escHtml(t.title)}</h3>
  </div>
  <p class="tutorial-desc">${escHtml(t.description)}</p>
  <div class="tutorial-badges">
    <span class="badge badge-category">${escHtml(CATEGORIES[t.category])}</span>
    ${toolBadges}
  </div>
</article>`;
}

export function renderModal(s) {
  const overlay = $('tutorial-modal');
  if (!overlay) return;

  if (!s.modalId) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    return;
  }

  const t = tutorials.find(x => x.id === s.modalId);
  if (!t) {
    overlay.classList.remove('open');
    return;
  }

  $('modal-title').textContent = t.title;
  $('modal-desc').textContent = t.description;
  $('modal-body').innerHTML = renderMarkdown(t.content);

  const toolBadges = t.tools.map(tool =>
    `<span class="badge badge-tool ${tool}">${tool === 'claude' ? 'Claude' : 'Cursor'}</span>`
  ).join('');
  $('modal-badges').innerHTML = `<span class="badge badge-category">${escHtml(CATEGORIES[t.category])}</span>${toolBadges}<span class="badge badge-difficulty ${t.difficulty}">${escHtml(LEVEL_META[t.difficulty].label)}</span>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Merged learning path ────────────────────────────────── */

export function renderLearningPath(s) {
  const container = $('learning-path');
  if (!container) return;

  const allIds = new Set();
  for (const row of LEARNING_PATH) {
    if (row.shared) allIds.add(row.shared);
    if (row.claude) allIds.add(row.claude);
    if (row.cursor) allIds.add(row.cursor);
  }
  const total = allIds.size;
  const done = [...allIds].filter(id => s.completed.has(id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  let html = `<div class="path-intro">
  <h2 class="path-heading">Your Learning Paths</h2>
  <p class="path-desc">Two tracks for Claude Code and Cursor. Shared tutorials connect both. Check off steps as you go.</p>
  <div class="path-overall">
    <span class="path-overall-label">${done} / ${total} completed</span>
    <div class="path-progress-bar path-progress-bar--overall"><div class="path-progress-fill path-progress-fill--overall" style="width:${pct}%"></div></div>
  </div>
</div>`;

  html += '<div class="path-col-headers"><div class="path-col-label path-col-label--claude">' + terminalIcon() + ' Claude Code</div><div class="path-col-label path-col-label--cursor">' + editorIcon() + ' Cursor</div></div>';

  html += '<div class="path-grid">';

  for (const row of LEARNING_PATH) {
    if (row.shared) {
      html += renderSharedRow(row, s);
    } else {
      html += renderPairRow(row, s);
    }
  }

  html += '</div>';
  container.innerHTML = html;
}

function renderSharedRow(row, s) {
  const t = tutorials.find(x => x.id === row.shared);
  if (!t) return '';
  const isDone = s.completed.has(t.id);
  const why = row.why || t.description;

  return `<div class="path-row path-row--shared${isDone ? ' path-row--done' : ''}">
  <button class="path-check" data-id="${t.id}" aria-label="Mark ${escHtml(t.title)} ${isDone ? 'incomplete' : 'complete'}">${isDone ? checkIcon() : circleIcon()}</button>
  <div class="path-step-body" data-id="${t.id}">
    <h4 class="path-step-title">${escHtml(t.title)}</h4>
    <p class="path-step-why">${escHtml(why)}</p>
  </div>
</div>`;
}

function renderPairRow(row, s) {
  let html = '<div class="path-row path-row--pair">';
  html += renderToolCell(row.claude, 'claude', s);
  html += renderToolCell(row.cursor, 'cursor', s);
  html += '</div>';
  return html;
}

function renderToolCell(id, tool, s) {
  if (!id) return '<div class="path-cell path-cell--empty"></div>';
  const t = tutorials.find(x => x.id === id);
  if (!t) return '<div class="path-cell path-cell--empty"></div>';
  const isDone = s.completed.has(t.id);

  return `<div class="path-cell path-cell--${tool}${isDone ? ' path-cell--done' : ''}">
  <button class="path-check" data-id="${t.id}" aria-label="Mark ${escHtml(t.title)} ${isDone ? 'incomplete' : 'complete'}">${isDone ? checkIcon() : circleIcon()}</button>
  <div class="path-step-body" data-id="${t.id}">
    <h4 class="path-step-title">${escHtml(t.title)}</h4>
    <p class="path-step-why">${escHtml(t.description)}</p>
  </div>
</div>`;
}

function terminalIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
}

function editorIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
}

function checkIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
}

function circleIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
}

function updateCount(n) {
  const count = $('result-count');
  if (count) count.textContent = `${n} of ${tutorials.length}`;
}
