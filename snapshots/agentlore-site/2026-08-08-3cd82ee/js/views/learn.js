import { PATHS, tutorialById } from '../content/index.js';
import { escHtml } from '../utils.js';
import { pageHead, progressBar, checkIcon, circleIcon } from './parts.js';

const TOOL_META = {
  claude:   { label: 'Claude Code', icon: terminalIcon },
  cursor:   { label: 'Cursor',      icon: editorIcon },
  lmstudio: { label: 'LM Studio',   icon: chipIcon },
  ollama:   { label: 'Ollama',      icon: terminalIcon },
};

const stepIds = (steps) => {
  const ids = new Set();
  for (const row of steps) {
    for (const [key, value] of Object.entries(row)) if (key !== 'why') ids.add(value);
  }
  return ids;
};

/** Column keys are inferred from the track's own rows, so a new track needs no wiring. */
function detectPairKeys(steps) {
  const counts = {};
  for (const row of steps) {
    if (row.shared) continue;
    for (const key of Object.keys(row)) if (key !== 'why') counts[key] = (counts[key] || 0) + 1;
  }
  const preferred = ['claude', 'cursor', 'lmstudio', 'ollama'];
  const keys = Object.keys(counts);
  return [...preferred.filter(k => counts[k]), ...keys.filter(k => !preferred.includes(k))];
}

function stepBody(t, s, why) {
  const done = s.completed.has(t.id);
  return `<button class="path-check" data-toggle="${t.id}" aria-pressed="${done}" aria-label="Mark ${escHtml(t.title)} ${done ? 'incomplete' : 'complete'}" type="button">${done ? checkIcon() : circleIcon()}</button>
  <a class="path-step-body" href="/t/${t.id}/">
    <h4 class="path-step-title">${escHtml(t.title)}</h4>
    <p class="path-step-why">${escHtml(why || t.description)}</p>
  </a>`;
}

function sharedRow(row, s) {
  const t = tutorialById(row.shared);
  if (!t) return '';
  const done = s.completed.has(t.id);
  return `<div class="path-row path-row--shared${done ? ' path-row--done' : ''}">${stepBody(t, s, row.why)}</div>`;
}

function pairRow(row, s, keys) {
  const cells = keys.map(key => {
    const t = row[key] ? tutorialById(row[key]) : null;
    if (!t) return '<div class="path-cell path-cell--empty"></div>';
    const done = s.completed.has(t.id);
    return `<div class="path-cell path-cell--${key}${done ? ' path-cell--done' : ''}">${stepBody(t, s, t.description)}</div>`;
  }).join('');
  return `<div class="path-row path-row--pair">${cells}</div>`;
}

export function renderLearn(s) {
  const track = PATHS[s.activePath] || PATHS.core;
  const ids = stepIds(track.steps);
  const done = [...ids].filter(id => s.completed.has(id)).length;
  const keys = detectPairKeys(track.steps);

  const tabs = Object.values(PATHS).map(p => {
    const active = p.id === track.id;
    const pIds = stepIds(p.steps);
    const pDone = [...pIds].filter(id => s.completed.has(id)).length;
    return `<a class="track-tab${active ? ' active' : ''}" href="#/learn/${p.id}" role="tab" aria-selected="${active}">
      <span>${escHtml(p.label)}</span><span class="track-tab-count">${pDone}/${pIds.size}</span>
    </a>`;
  }).join('');

  const headers = keys.length
    ? `<div class="path-col-headers">${keys.map(key => {
        const meta = TOOL_META[key] || { label: key, icon: circleIcon };
        return `<div class="path-col-label path-col-label--${key}">${meta.icon()} ${escHtml(meta.label)}</div>`;
      }).join('')}</div>`
    : '';

  return `${pageHead(track.label, track.subtitle, 'The Path')}

<div class="track-tabs" role="tablist" aria-label="Learning tracks">${tabs}</div>

<div class="track-progress">${progressBar(done, ids.size, `${track.label} progress`)}</div>

${headers}
<div class="path-grid">
  ${track.steps.map(row => (row.shared ? sharedRow(row, s) : pairRow(row, s, keys))).join('')}
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
