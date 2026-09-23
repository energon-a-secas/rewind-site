// ── DOM rendering ────────────────────────────────────────────
// Rebuilds the list from state. Everything is derived from `state` — handlers
// mutate state then call render(), so there is one source of truth for the UI.

import { state, visibleTasks, counts } from './state.js';
import { $, escHtml } from './utils.js';

const EMPTY_COPY = {
  all: 'Nothing here yet. Add your first task above.',
  open: 'No open tasks. Everything is done.',
  done: 'Nothing finished yet.',
};

const BADGE_COPY = {
  local: { label: 'Local', title: 'Saved in this browser only: sign in to sync' },
  syncing: { label: 'Syncing…', title: 'Saving to your Puter account' },
  synced: { label: 'Synced', title: 'Saved to your Puter account' },
  error: { label: 'Sync failed', title: 'Saved locally, but the cloud write failed' },
};

export function render() {
  renderList();
  renderSummary();
  renderFilters();
  renderSyncBadge();
  renderAuth();
}

function renderList() {
  const list = $('taskList');
  const tasks = visibleTasks();

  list.innerHTML = tasks.map(taskRow).join('');

  const empty = $('emptyState');
  empty.textContent = EMPTY_COPY[state.filter] ?? EMPTY_COPY.all;
  empty.hidden = tasks.length > 0;

  // Inline editor: focus and select once the row is in the DOM.
  if (state.editingId) {
    const input = list.querySelector(`[data-edit-input="${cssEscape(state.editingId)}"]`);
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function taskRow(task) {
  const id = escHtml(task.id);

  if (state.editingId === task.id) {
    return `
      <li class="task task--editing" data-id="${id}">
        <input
          type="text"
          class="task__edit"
          data-edit-input="${id}"
          value="${escHtml(task.text)}"
          maxlength="280"
          aria-label="Edit task">
        <div class="task__actions">
          <button type="button" class="icon-btn" data-action="save" data-id="${id}" title="Save (Enter)" aria-label="Save task">${ICON.check}</button>
          <button type="button" class="icon-btn" data-action="cancel" data-id="${id}" title="Cancel (Esc)" aria-label="Cancel editing">${ICON.close}</button>
        </div>
      </li>`;
  }

  return `
    <li class="task${task.done ? ' task--done' : ''}" data-id="${id}">
      <label class="task__check">
        <input type="checkbox" data-action="toggle" data-id="${id}"${task.done ? ' checked' : ''}>
        <span class="task__box" aria-hidden="true">${ICON.check}</span>
        <span class="task__text">${escHtml(task.text)}</span>
      </label>
      <div class="task__actions">
        <button type="button" class="icon-btn" data-action="edit" data-id="${id}" title="Edit" aria-label="Edit task">${ICON.pencil}</button>
        <button type="button" class="icon-btn icon-btn--danger" data-action="delete" data-id="${id}" title="Delete" aria-label="Delete task">${ICON.trash}</button>
      </div>
    </li>`;
}

function renderSummary() {
  const { total, open, done } = counts();
  const summary = $('listSummary');

  if (total === 0) {
    summary.textContent = 'No tasks yet';
  } else if (open === 0) {
    summary.textContent = `All ${total} done`;
  } else {
    summary.textContent = `${open} open · ${done} done`;
  }

  $('clearDoneBtn').disabled = done === 0;
}

function renderFilters() {
  for (const btn of document.querySelectorAll('.filter-btn')) {
    const active = btn.dataset.filter === state.filter;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  }
}

function renderSyncBadge() {
  const badge = $('syncBadge');
  const copy = BADGE_COPY[state.syncState] ?? BADGE_COPY.local;
  badge.textContent = copy.label;
  badge.title = copy.title;
  badge.dataset.state = state.syncState;
}

function renderAuth() {
  const signedIn = Boolean(state.user);
  $('authGate').hidden = signedIn;
  $('authUser').hidden = !signedIn;
  if (signedIn) {
    const name = state.user.username || 'Signed in';
    $('authUsername').textContent = state.user.is_temp ? `${name} (temporary account)` : name;
  }
}

/** Surface an auth failure in the panel rather than a toast — it belongs next to the button. */
export function showAuthError(msg) {
  const el = $('authError');
  el.textContent = msg;
  el.hidden = !msg;
}

/** CSS.escape with a fallback for the attribute selector above. */
function cssEscape(value) {
  return window.CSS?.escape ? window.CSS.escape(value) : value.replace(/["\\]/g, '\\$&');
}

const ICON = {
  check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
};
