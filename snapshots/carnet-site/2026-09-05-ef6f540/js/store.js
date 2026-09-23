// ── Storage layer ────────────────────────────────────────────
// Two backends behind one interface:
//
//   signed out → localStorage (this browser only)
//   signed in  → puter.kv     (follows the user to any browser)
//
// The whole list is one KV entry rather than one entry per task. A list of a
// few thousand tasks sits far under the 400 KB value cap, and a single write
// keeps the list internally consistent — no half-applied batch.
//
// GOTCHA: Puter auto-authenticates on any kv call, which opens a popup. Browsers
// block popups outside a user gesture, so every kv call here is gated behind
// isSignedIn() — otherwise a page load while signed out fires a blocked popup.

const LOCAL_KEY = 'carnet:tasks';
const KV_KEY = 'carnet:tasks';

/** Tombstones older than this are dropped — long enough for any offline device. */
const TOMBSTONE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** True when puter.js loaded and a Puter session is active. */
export function isSignedIn() {
  try {
    return Boolean(window.puter?.auth?.isSignedIn?.());
  } catch {
    return false;
  }
}

/** The signed-in user, or null. */
export async function getUser() {
  if (!isSignedIn()) return null;
  try {
    return await window.puter.auth.getUser();
  } catch {
    return null;
  }
}

/** Opens the Puter sign-in popup. Must be called from a user gesture. */
export async function signIn() {
  return window.puter.auth.signIn();
}

export function signOut() {
  try {
    window.puter.auth.signOut();
  } catch { /* already gone */ }
}

/* ── Serialization ──────────────────────────────────────────── */

/** Accepts anything the store might hand back and returns a clean task array. */
function normalize(raw) {
  let payload = raw;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch { return []; }
  }
  const list = Array.isArray(payload) ? payload : payload?.tasks;
  if (!Array.isArray(list)) return [];

  return list
    .filter((t) => t && typeof t.id === 'string')
    .map((t) => ({
      id: t.id,
      text: typeof t.text === 'string' ? t.text : '',
      done: Boolean(t.done),
      createdAt: Number(t.createdAt) || 0,
      updatedAt: Number(t.updatedAt) || Number(t.createdAt) || 0,
      deletedAt: Number(t.deletedAt) || 0,
    }));
}

function serialize(tasks) {
  return { version: 1, tasks: pruneTombstones(tasks) };
}

function pruneTombstones(tasks) {
  const cutoff = Date.now() - TOMBSTONE_TTL_MS;
  return tasks.filter((t) => !t.deletedAt || t.deletedAt > cutoff);
}

/* ── Merge ──────────────────────────────────────────────────── */

/**
 * Union two lists by id, keeping whichever copy of a task was written last.
 * Deletes survive because they are tombstones with an `updatedAt`, so a delete
 * on one device beats an older edit on another instead of being resurrected.
 */
export function mergeTasks(a, b) {
  const byId = new Map();
  for (const task of [...a, ...b]) {
    const existing = byId.get(task.id);
    if (!existing || task.updatedAt >= existing.updatedAt) byId.set(task.id, task);
  }
  return pruneTombstones([...byId.values()]);
}

/* ── Local backend ──────────────────────────────────────────── */

export function readLocal() {
  try {
    return normalize(localStorage.getItem(LOCAL_KEY));
  } catch {
    return [];
  }
}

export function writeLocal(tasks) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(serialize(tasks)));
  } catch { /* quota exceeded or private browsing */ }
}

/* ── Cloud backend ──────────────────────────────────────────── */

export async function readCloud() {
  if (!isSignedIn()) return [];
  const raw = await window.puter.kv.get(KV_KEY);
  return normalize(raw);
}

export async function writeCloud(tasks) {
  if (!isSignedIn()) return false;
  await window.puter.kv.set(KV_KEY, serialize(tasks));
  return true;
}

/**
 * Load the list for the current session.
 *
 * Signed in, this merges the cloud copy with whatever this browser accumulated
 * while signed out, so a list started anonymously is adopted on first sign-in
 * rather than discarded. The merged result is pushed back up.
 */
export async function load() {
  const local = readLocal();
  if (!isSignedIn()) return { tasks: local, synced: false };

  const cloud = await readCloud();
  const merged = mergeTasks(cloud, local);
  writeLocal(merged);
  // Only write back when the merge actually changed the cloud copy.
  if (merged.length !== cloud.length || hasNewerThan(merged, cloud)) {
    await writeCloud(merged);
  }
  return { tasks: merged, synced: true };
}

function hasNewerThan(merged, cloud) {
  const cloudById = new Map(cloud.map((t) => [t.id, t]));
  return merged.some((t) => (cloudById.get(t.id)?.updatedAt ?? -1) !== t.updatedAt);
}

/**
 * Persist the list. localStorage is written first and synchronously so the UI
 * survives a refresh even if the network call fails; the cloud write is then
 * attempted and its success reported back to the caller.
 */
export async function save(tasks) {
  writeLocal(tasks);
  if (!isSignedIn()) return { synced: false };
  try {
    await writeCloud(tasks);
    return { synced: true };
  } catch (err) {
    return { synced: false, error: err };
  }
}
