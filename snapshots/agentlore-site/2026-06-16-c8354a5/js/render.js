import { state } from './state.js';
import { tutorials, CATEGORIES, TOOLS, LEVEL_META, PATHS } from './data.js';
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
  let html = `<li class="dropdown-item${!activeVal ? ' selected' : ''}" data-value="" role="option" aria-selected="${!activeVal}">All</li>`;
  for (const [key, label] of Object.entries(items)) {
    html += `<li class="dropdown-item${activeVal === key ? ' selected' : ''}" data-value="${key}" role="option" aria-selected="${activeVal === key}">${escHtml(label)}</li>`;
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

function toolLabel(tool) {
  if (tool === 'claude') return 'Claude';
  if (tool === 'cursor') return 'Cursor';
  if (tool === 'local') return 'Local AI';
  return TOOLS[tool] || tool;
}

function renderToolBadges(tools) {
  return tools.map(tool =>
    `<span class="badge badge-tool ${tool}">${escHtml(toolLabel(tool))}</span>`
  ).join('');
}

function renderCard(t) {
  return `<article class="tutorial-card" data-id="${t.id}" data-cat="${t.category}" tabindex="0" role="button" aria-label="Open ${escHtml(t.title)}">
  <div class="tutorial-header">
    <h3 class="tutorial-title">${escHtml(t.title)}</h3>
  </div>
  <p class="tutorial-desc">${escHtml(t.description)}</p>
  <div class="tutorial-badges">
    <span class="badge badge-category">${escHtml(CATEGORIES[t.category])}</span>
    ${renderToolBadges(t.tools)}
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

  $('modal-badges').innerHTML = `<span class="badge badge-category">${escHtml(CATEGORIES[t.category])}</span>${renderToolBadges(t.tools)}<span class="badge badge-difficulty ${t.difficulty}">${escHtml(LEVEL_META[t.difficulty].label)}</span>`;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Learning paths ──────────────────────────────────────── */

const PATH_TOOL_META = {
  claude:  { label: 'Claude Code',  class: 'claude',  icon: terminalIcon },
  cursor:  { label: 'Cursor',       class: 'cursor',  icon: editorIcon },
  lmstudio:{ label: 'LM Studio',    class: 'lmstudio',icon: chipIcon },
  ollama:  { label: 'Ollama',       class: 'ollama',  icon: terminalIcon },
};

export function renderLearningPath(s) {
  const container = $('learning-path');
  if (!container) return;

  const pathId = s.activePath || 'core';
  const path = PATHS[pathId] || PATHS.core;

  const allIds = new Set();
  for (const row of path.steps) {
    for (const key of Object.keys(row)) {
      if (key !== 'why') allIds.add(row[key]);
    }
  }
  const total = allIds.size;
  const done = [...allIds].filter(id => s.completed.has(id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  let html = `<div class="path-intro">
  <h2 class="path-heading">${escHtml(path.label)}</h2>
  <p class="path-desc">${escHtml(path.subtitle)}</p>
  <div class="path-track-selector" role="tablist" aria-label="Learning path tracks">`;

  for (const [key, p] of Object.entries(PATHS)) {
    const active = key === pathId;
    html += `<button class="path-track-btn${active ? ' active' : ''}" data-path="${key}" role="tab" aria-selected="${active}" tabindex="${active ? '0' : '-1'}">${escHtml(p.label)}</button>`;
  }

  html += `</div>
  <div class="path-overall">
    <span class="path-overall-label" aria-live="polite">${done} / ${total} completed</span>
    <div class="path-progress-bar path-progress-bar--overall" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="Overall path progress"><div class="path-progress-fill path-progress-fill--overall" style="width:${pct}%"></div></div>
  </div>
</div>`;

  const pairKeys = detectPairKeys(path.steps);
  html += renderPathHeaders(pairKeys);

  html += '<div class="path-grid">';
  for (const row of path.steps) {
    if (row.shared) {
      html += renderSharedRow(row, s);
    } else {
      html += renderPairRow(row, s, pairKeys);
    }
  }
  html += '</div>';

  container.innerHTML = html;
}

function detectPairKeys(steps) {
  const counts = {};
  for (const row of steps) {
    if (row.shared) continue;
    for (const key of Object.keys(row)) {
      if (key !== 'why') counts[key] = (counts[key] || 0) + 1;
    }
  }
  const keys = Object.keys(counts);
  if (keys.length === 0) return [];
  // Prefer known order, then any extras
  const order = ['claude', 'cursor', 'lmstudio', 'ollama'];
  const sorted = [];
  for (const k of order) if (counts[k]) sorted.push(k);
  for (const k of keys) if (!order.includes(k)) sorted.push(k);
  return sorted;
}

function renderPathHeaders(pairKeys) {
  if (pairKeys.length === 0) return '';
  let html = '<div class="path-col-headers">';
  for (const key of pairKeys) {
    const meta = PATH_TOOL_META[key] || { label: toolLabel(key), class: key, icon: circleIcon };
    html += `<div class="path-col-label path-col-label--${meta.class}">${meta.icon()} ${escHtml(meta.label)}</div>`;
  }
  html += '</div>';
  return html;
}

function renderSharedRow(row, s) {
  const t = tutorials.find(x => x.id === row.shared);
  if (!t) return '';
  const isDone = s.completed.has(t.id);
  const why = row.why || t.description;

  return `<div class="path-row path-row--shared${isDone ? ' path-row--done' : ''}">
  <button class="path-check" data-id="${t.id}" aria-label="Mark ${escHtml(t.title)} ${isDone ? 'incomplete' : 'complete'}">${isDone ? checkIcon() : circleIcon()}</button>
  <div class="path-step-body" data-id="${t.id}" tabindex="0" role="button" aria-label="Open ${escHtml(t.title)}">
    <h4 class="path-step-title">${escHtml(t.title)}</h4>
    <p class="path-step-why">${escHtml(why)}</p>
  </div>
</div>`;
}

function renderPairRow(row, s, pairKeys) {
  let html = '<div class="path-row path-row--pair">';
  for (const key of pairKeys) {
    const meta = PATH_TOOL_META[key] || { class: key };
    html += renderToolCell(row[key], meta.class, s);
  }
  html += '</div>';
  return html;
}

function renderToolCell(id, toolClass, s) {
  if (!id) return '<div class="path-cell path-cell--empty"></div>';
  const t = tutorials.find(x => x.id === id);
  if (!t) return '<div class="path-cell path-cell--empty"></div>';
  const isDone = s.completed.has(t.id);

  return `<div class="path-cell path-cell--${toolClass}${isDone ? ' path-cell--done' : ''}">
  <button class="path-check" data-id="${t.id}" aria-label="Mark ${escHtml(t.title)} ${isDone ? 'incomplete' : 'complete'}">${isDone ? checkIcon() : circleIcon()}</button>
  <div class="path-step-body" data-id="${t.id}" tabindex="0" role="button" aria-label="Open ${escHtml(t.title)}">
    <h4 class="path-step-title">${escHtml(t.title)}</h4>
    <p class="path-step-why">${escHtml(t.description)}</p>
  </div>
</div>`;
}

function terminalIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>';
}

function editorIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
}

function chipIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M1 9h3M20 15h3M1 15h3"/></svg>';
}

function checkIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
}

function circleIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/></svg>';
}

function updateCount(n) {
  const count = $('result-count');
  if (count) count.textContent = `Showing ${n} of ${tutorials.length}`;
}
