import { CATEGORIES, PROBE_NAMES } from './data.js';
import { getPlaceholderName } from './utils.js';
import { state } from './state.js';

export const SESSION_SCHEMA_VERSION = 1;

const STORAGE_KEY = 'vibe-check-sessions';
const CURRENT_KEY = 'vibe-check-current-id';

export function generateId() {
  return 'vc-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export function getAllQuestionNames() {
  const base = Object.keys(CATEGORIES).reduce((arr, k) => arr.concat(CATEGORIES[k].questions), []);
  return base.concat(PROBE_NAMES);
}

export function createDefaultSession() {
  const scores = {};
  getAllQuestionNames().forEach(name => { scores[name] = 1; });
  return {
    id: generateId(),
    schemaVersion: SESSION_SCHEMA_VERSION,
    name: '',
    role: 'individual-contributor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scores,
    notes: '',
    cheatNotes: '',
    selectedPiece: null,
    timerDuration: 0
  };
}

export function gatherFormState() {
  const scores = {};
  getAllQuestionNames().forEach(name => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    scores[name] = el ? parseInt(el.value) : 1;
  });
  return {
    name: document.getElementById('candidate-name').value.trim(),
    role: document.getElementById('role-select') ? document.getElementById('role-select').value : 'individual-contributor',
    scores,
    notes: document.getElementById('notes').value,
    cheatNotes: document.getElementById('cheat-notes').value,
    selectedPiece: state.selectedPiece,
    timerDuration: window.__timerElapsed || 0
  };
}

export function applyFormState(session) {
  if (!session) return;
  document.getElementById('candidate-name').value = session.name || '';
  const roleEl = document.getElementById('role-select');
  if (roleEl && session.role) roleEl.value = session.role;

  const names = getAllQuestionNames();
  names.forEach(name => {
    const value = session.scores && typeof session.scores[name] === 'number' ? session.scores[name] : 1;
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) radio.checked = true;
  });

  document.getElementById('notes').value = session.notes || '';
  document.getElementById('cheat-notes').value = session.cheatNotes || '';

  state.selectedPiece = session.selectedPiece || null;
  if (typeof window.__setTimerElapsed === 'function') {
    window.__setTimerElapsed(session.timerDuration || 0);
  }
}

export function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load sessions', e);
    return [];
  }
}

export function saveSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export function getCurrentId() {
  try {
    return localStorage.getItem(CURRENT_KEY);
  } catch (e) {
    return null;
  }
}

export function setCurrentId(id) {
  try {
    if (id) localStorage.setItem(CURRENT_KEY, id);
    else localStorage.removeItem(CURRENT_KEY);
  } catch (e) {
    console.error('Failed to set current id', e);
  }
}
