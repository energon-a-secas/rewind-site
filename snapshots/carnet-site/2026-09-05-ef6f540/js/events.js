// ── Event handlers ───────────────────────────────────────────
// All listeners are delegated from stable containers, so render() can replace
// list markup freely without rebinding anything.

import {
  state, addTask, toggleTask, editTask, deleteTask, clearDone, persist,
} from './state.js';
import { render, showAuthError } from './render.js';
import { $, showToast } from './utils.js';
import { signIn, signOut, getUser, load } from './store.js';

/** Every mutation funnels through here: render immediately, then write. */
async function commit() {
  render();
  await persist(render);
}

export function bindEvents() {
  bindCompose();
  bindList();
  bindFilters();
  bindClearDone();
  bindAuth();
}

/* ── Compose ────────────────────────────────────────────────── */

function bindCompose() {
  $('composeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('taskInput');
    if (!addTask(input.value)) return;
    input.value = '';
    input.focus();
    await commit();
  });
}

/* ── Task list ──────────────────────────────────────────────── */

function bindList() {
  const list = $('taskList');

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || btn.type === 'checkbox') return;

    const { action, id } = btn.dataset;

    if (action === 'edit') {
      state.editingId = id;
      render();
      return;
    }
    if (action === 'cancel') {
      state.editingId = null;
      render();
      return;
    }
    if (action === 'save') {
      await commitEdit(id);
      return;
    }
    if (action === 'delete') {
      if (deleteTask(id)) {
        showToast('Task deleted');
        await commit();
      }
    }
  });

  list.addEventListener('change', async (e) => {
    const box = e.target.closest('input[data-action="toggle"]');
    if (!box) return;
    if (toggleTask(box.dataset.id)) await commit();
  });

  // Enter saves, Escape cancels — the inline editor's whole keyboard contract.
  list.addEventListener('keydown', async (e) => {
    const input = e.target.closest('.task__edit');
    if (!input) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      await commitEdit(state.editingId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      state.editingId = null;
      render();
    }
  });

  // Clicking away saves rather than silently discarding the edit.
  list.addEventListener('focusout', async (e) => {
    const input = e.target.closest('.task__edit');
    if (!input || !state.editingId) return;
    // Ignore focus moving to this row's own save/cancel buttons — their
    // click handlers own the outcome.
    if (e.relatedTarget?.closest('.task--editing')) return;
    await commitEdit(state.editingId);
  });
}

async function commitEdit(id) {
  if (!id) return;
  const input = $('taskList').querySelector('.task__edit');
  const text = input ? input.value : '';
  const changed = editTask(id, text);
  state.editingId = null;
  if (changed) await commit();
  else render();
}

/* ── Filters ────────────────────────────────────────────────── */

function bindFilters() {
  for (const btn of document.querySelectorAll('.filter-btn')) {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      state.editingId = null;
      render();
    });
  }
}

function bindClearDone() {
  $('clearDoneBtn').addEventListener('click', async () => {
    const cleared = clearDone();
    if (!cleared.length) return;
    showToast(`Cleared ${cleared.length} task${cleared.length === 1 ? '' : 's'}`);
    await commit();
  });
}

/* ── Auth ───────────────────────────────────────────────────── */

function bindAuth() {
  const toggle = $('authToggle');
  const panel = $('authPanel');

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) showAuthError('');
  });

  // signIn() opens a popup, so it must run inside this click handler —
  // no awaits before it, or the browser treats the popup as unsolicited.
  $('authSignIn').addEventListener('click', async () => {
    const btn = $('authSignIn');
    btn.disabled = true;
    btn.textContent = 'Opening Puter…';
    try {
      await signIn();
      state.user = await getUser();
      state.syncState = 'syncing';
      render();

      // Adopts anything added while signed out, then pulls the cloud list.
      const { tasks, synced } = await load();
      state.tasks = tasks;
      state.syncState = synced ? 'synced' : 'local';
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      render();
      showToast('Signed in: list synced');
    } catch (err) {
      showAuthError(authErrorMessage(err));
      state.syncState = 'local';
      render();
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in with Puter';
    }
  });

  $('authLogout').addEventListener('click', async () => {
    signOut();
    state.user = null;
    state.syncState = 'local';
    // Drop back to whatever this browser holds locally; the cloud copy stays put.
    const { tasks } = await load();
    state.tasks = tasks;
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    render();
    showToast('Signed out: list stays in this browser');
  });
}

function authErrorMessage(err) {
  const code = err?.error?.code || err?.error || err?.code;
  if (code === 'popup_blocked') return 'Your browser blocked the sign-in popup. Allow popups and try again.';
  if (code === 'auth_window_closed') return 'Sign-in was cancelled.';
  return err?.msg || err?.message || 'Sign-in failed. Try again.';
}
