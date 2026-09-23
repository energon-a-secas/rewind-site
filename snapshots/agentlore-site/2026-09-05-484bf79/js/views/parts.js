import { CATEGORY_META, TOOLS, LEVEL_META } from '../content/index.js';
import { escHtml } from '../utils.js';

export function toolBadges(tools) {
  return tools.map(tool =>
    `<span class="badge badge-tool ${tool}">${escHtml(TOOLS[tool] || tool)}</span>`
  ).join('');
}

export function categoryBadge(category) {
  const meta = CATEGORY_META[category];
  if (!meta) return '';
  return `<span class="badge badge-category" style="--badge-accent:${meta.accent}">${escHtml(meta.label)}</span>`;
}

export function difficultyBadge(difficulty) {
  return `<span class="badge badge-difficulty ${difficulty}">${escHtml(LEVEL_META[difficulty].label)}</span>`;
}

export function tutorialCard(t, s) {
  const done = s.completed.has(t.id);
  return `<a class="tutorial-card${done ? ' is-done' : ''}" href="/t/${t.id}/" data-cat="${t.category}" style="--card-cat:${CATEGORY_META[t.category].accent}">
  <div class="tutorial-header">
    <h3 class="tutorial-title">${escHtml(t.title)}</h3>
    ${done ? `<span class="card-done" title="Completed" aria-label="Completed">${checkIcon()}</span>` : ''}
  </div>
  <p class="tutorial-desc">${escHtml(t.description)}</p>
  <div class="tutorial-badges">
    ${categoryBadge(t.category)}
    ${toolBadges(t.tools)}
    ${difficultyBadge(t.difficulty)}
  </div>
</a>`;
}

export function progressBar(done, total, label) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return `<div class="progress">
  <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}" aria-label="${escHtml(label || 'Progress')}">
    <div class="progress-fill" style="width:${pct}%"></div>
  </div>
  <span class="progress-label">${done} / ${total}</span>
</div>`;
}

export function pageHead(title, subtitle, eyebrow) {
  return `<header class="page-head">
  ${eyebrow ? `<p class="page-eyebrow">${escHtml(eyebrow)}</p>` : ''}
  <h2 class="page-title">${escHtml(title)}</h2>
  ${subtitle ? `<p class="page-sub">${escHtml(subtitle)}</p>` : ''}
</header>`;
}

export function emptyState(message, actionLabel, actionAttr) {
  return `<div class="empty-state">
  <p>${escHtml(message)}</p>
  ${actionLabel ? `<button class="btn-secondary" ${actionAttr} type="button">${escHtml(actionLabel)}</button>` : ''}
</div>`;
}

export function checkIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
}

export function circleIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/></svg>';
}

export function arrowIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
}
