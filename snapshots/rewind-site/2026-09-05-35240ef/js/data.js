// ── Data access ──────────────────────────────────────────────
// The committed archive comes from data/manifest.json (written by
// tools/capture.py). Browser captures persist in IndexedDB so a
// multi-megabyte page never touches localStorage.

const DB_NAME = 'rewind';
const STORE = 'snapshots';

export async function loadManifest() {
  try {
    const res = await fetch('data/manifest.json', { cache: 'no-cache' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode, op) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = op(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function localAll() {
  const db = await idbOpen();
  const rows = await tx(db, 'readonly', (s) => s.getAll());
  db.close();
  return rows || [];
}

export async function localPut(snap) {
  const db = await idbOpen();
  await tx(db, 'readwrite', (s) => s.put(snap));
  db.close();
}

export async function localDelete(id) {
  const db = await idbOpen();
  await tx(db, 'readwrite', (s) => s.delete(id));
  db.close();
}
