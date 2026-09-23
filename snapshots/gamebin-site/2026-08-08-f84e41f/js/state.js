// ── State management ─────────────────────────────────────────

const STORAGE_KEY = 'gamebin-state';

export const state = {
  user: null,
  profile: null,
  currentView: 'mylists', // mylists | categories | profile | discover | shared
  activeListId: null,
  lists: [],
  games: [],
  categories: [],
  viewMode: 'grid',
  searchQuery: '',
  filterCategory: '',
  sortMode: 'votes', // votes | sale | price-asc | price-desc | name
  loading: false,
  sharedList: null,
  _likedList: false,
  _prices: null,
  _sharedProfile: null,
  _votes: {},
  _allowedVoters: [],
  _publicLists: [],
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.viewMode) s.viewMode = saved.viewMode;
      if (saved.activeListId) s.activeListId = saved.activeListId;
      if (saved.searchQuery) s.searchQuery = saved.searchQuery;
      if (saved.filterCategory) s.filterCategory = saved.filterCategory;
      if (saved.currentView) s.currentView = saved.currentView;
      if (saved.sortMode) s.sortMode = saved.sortMode;
    }

    const session = localStorage.getItem('gamebin_session');
    if (session) {
      const data = JSON.parse(session);
      if (data.username) {
        s.user = { username: data.username, id: 'local_' + data.username };
        document.getElementById('authUsername').textContent = data.username;
        document.getElementById('authUser').hidden = false;
        document.getElementById('authGate').hidden = true;
      }
    }
  } catch { /* ignore */ }
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      viewMode: s.viewMode,
      activeListId: s.activeListId,
      searchQuery: s.searchQuery,
      filterCategory: s.filterCategory,
      currentView: s.currentView,
      sortMode: s.sortMode,
    }));
  } catch { /* quota */ }
}
