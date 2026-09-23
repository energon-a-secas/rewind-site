const COMPLETED_KEY = 'agentlore-completed';
const PATH_KEY = 'agentlore-path';

function loadCompleted() {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function loadPath() {
  try {
    return localStorage.getItem(PATH_KEY) || 'core';
  } catch { return 'core'; }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore private-browsing / quota errors.
  }
}

export const state = {
  searchQuery: '',
  activeCategory: '',
  activeTool: '',
  activePath: loadPath(),
  modalId: null,
  view: 'browse',
  completed: loadCompleted(),
};

export function setActivePath(id) {
  state.activePath = id;
  store(PATH_KEY, id);
}

export function toggleCompleted(id) {
  if (state.completed.has(id)) {
    state.completed.delete(id);
  } else {
    state.completed.add(id);
  }
  store(COMPLETED_KEY, JSON.stringify([...state.completed]));
}

export function markCompleted(id) {
  if (state.completed.has(id)) return false;
  state.completed.add(id);
  store(COMPLETED_KEY, JSON.stringify([...state.completed]));
  return true;
}
