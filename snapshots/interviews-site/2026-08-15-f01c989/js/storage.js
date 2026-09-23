import {
  createDefaultSession,
  gatherFormState,
  loadSessions,
  saveSessions,
  getCurrentId,
  setCurrentId,
  SESSION_SCHEMA_VERSION
} from './session.js';

export function listSessions() {
  return loadSessions().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getSession(id) {
  return loadSessions().find(s => s.id === id) || null;
}

export function saveSession(partial) {
  const sessions = loadSessions();
  const now = new Date().toISOString();
  let session;
  const idx = sessions.findIndex(s => s.id === partial.id);
  if (idx >= 0) {
    session = { ...sessions[idx], ...partial, updatedAt: now };
    sessions[idx] = session;
  } else {
    session = {
      ...createDefaultSession(),
      ...partial,
      createdAt: now,
      updatedAt: now
    };
    sessions.push(session);
  }
  saveSessions(sessions);
  return session;
}

export function deleteSession(id) {
  let sessions = loadSessions();
  sessions = sessions.filter(s => s.id !== id);
  saveSessions(sessions);
  if (getCurrentId() === id) setCurrentId(null);
}

export function renameSession(id, name) {
  const sessions = loadSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx >= 0) {
    sessions[idx].name = name;
    sessions[idx].updatedAt = new Date().toISOString();
    saveSessions(sessions);
  }
}

export function exportSessions() {
  return JSON.stringify({
    app: 'vibe-check',
    schemaVersion: SESSION_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    sessions: loadSessions()
  }, null, 2);
}

export function importSessions(json) {
  const data = JSON.parse(json);
  if (!data || !Array.isArray(data.sessions)) throw new Error('Invalid export file');
  const incoming = data.sessions.map(s => ({
    ...createDefaultSession(),
    ...s,
    schemaVersion: SESSION_SCHEMA_VERSION
  }));
  const existing = loadSessions();
  const existingIds = new Set(existing.map(s => s.id));
  const merged = existing.slice();
  incoming.forEach(s => {
    if (!existingIds.has(s.id)) merged.push(s);
  });
  saveSessions(merged);
  return merged;
}

export function getCurrentSession() {
  const id = getCurrentId();
  if (!id) return null;
  return getSession(id);
}

export function setCurrentSession(id) {
  setCurrentId(id);
}

export function createSession() {
  const session = createDefaultSession();
  saveSession(session);
  setCurrentId(session.id);
  return session;
}

export function snapshotCurrentSession() {
  const id = getCurrentId();
  if (!id) {
    const session = createDefaultSession();
    setCurrentId(session.id);
    return { ...session, ...gatherFormState() };
  }
  return { ...getSession(id), ...gatherFormState() };
}
