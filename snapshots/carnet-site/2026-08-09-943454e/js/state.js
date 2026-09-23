// ── State management ─────────────────────────────────────────
// Shared mutable state. Persistence lives in store.js — this module owns the
// in-memory shape and the task mutations.

import { save } from './store.js';

export const state = {
  /** All tasks including tombstones; filter with visibleTasks() to render. */
  tasks: [],
  /** 'all' | 'open' | 'done' */
  filter: 'all',
  /** 'local' | 'syncing' | 'synced' | 'error' — drives the header badge. */
  syncState: 'local',
  user: null,
  /** id of the task currently being edited inline, or null. */
  editingId: null,
};

/** Tasks the user should see: tombstones excluded, sorted for display. */
export function visibleTasks(s = state) {
  const live = s.tasks.filter((t) => !t.deletedAt);
  const byFilter = {
    open: () => live.filter((t) => !t.done),
    done: () => live.filter((t) => t.done),
    all: () => live,
  };
  return (byFilter[s.filter] ?? byFilter.all)().sort(sortForDisplay);
}

/** Open tasks first, then most recently created. */
function sortForDisplay(a, b) {
  if (a.done !== b.done) return a.done ? 1 : -1;
  return b.createdAt - a.createdAt;
}

export function counts(s = state) {
  const live = s.tasks.filter((t) => !t.deletedAt);
  const done = live.filter((t) => t.done).length;
  return { total: live.length, done, open: live.length - done };
}

function newId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `t${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Mutations ──────────────────────────────────────────────── */
// Each mutation returns the affected task (or null when it was a no-op) and
// leaves persistence to the caller via persist(), so one user action produces
// exactly one write.

export function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const now = Date.now();
  const task = {
    id: newId(),
    text: trimmed,
    done: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: 0,
  };
  state.tasks.push(task);
  return task;
}

export function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id && !t.deletedAt);
  if (!task) return null;
  task.done = !task.done;
  task.updatedAt = Date.now();
  return task;
}

export function editTask(id, text) {
  const trimmed = text.trim();
  const task = state.tasks.find((t) => t.id === id && !t.deletedAt);
  if (!task || !trimmed || trimmed === task.text) return null;
  task.text = trimmed;
  task.updatedAt = Date.now();
  return task;
}

/** Soft delete — a tombstone, so the delete propagates instead of being re-synced away. */
export function deleteTask(id) {
  const task = state.tasks.find((t) => t.id === id && !t.deletedAt);
  if (!task) return null;
  const now = Date.now();
  task.deletedAt = now;
  task.updatedAt = now;
  return task;
}

export function clearDone() {
  const now = Date.now();
  const cleared = state.tasks.filter((t) => t.done && !t.deletedAt);
  for (const task of cleared) {
    task.deletedAt = now;
    task.updatedAt = now;
  }
  return cleared;
}

/** Write through to whichever backend is active and reflect the result in syncState. */
export async function persist(onChange) {
  const cloudBacked = state.syncState !== 'local';
  if (cloudBacked) {
    state.syncState = 'syncing';
    onChange?.();
  }
  const { synced } = await save(state.tasks);
  state.syncState = synced ? 'synced' : cloudBacked ? 'error' : 'local';
  onChange?.();
}
