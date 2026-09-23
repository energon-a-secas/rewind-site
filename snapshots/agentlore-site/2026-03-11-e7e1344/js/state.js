const STORAGE_KEY = 'agentlore-completed';

function loadCompleted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export const state = {
  searchQuery: '',
  activeCategory: '',
  activeTool: '',
  modalId: null,
  view: 'browse',
  completed: loadCompleted(),
};


export function toggleCompleted(id) {
  if (state.completed.has(id)) {
    state.completed.delete(id);
  } else {
    state.completed.add(id);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
}

export function markCompleted(id) {
  if (state.completed.has(id)) return false;
  state.completed.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
  return true;
}
