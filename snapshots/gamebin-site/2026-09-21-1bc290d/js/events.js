// ── Event handlers ───────────────────────────────────────────

import { state, save } from './state.js';
import { render } from './render.js';
import { showToast, copyToClipboard, LIST_COLORS, DEFAULT_CATEGORIES, escHtml, debounce } from './utils.js';
import { extractSteamAppId, buildSteamInfoFromUrl, searchLocalGames, getSteamCoverUrl, fetchSteamTags } from './steam.js';
import { renderAvatarSvg, AVATARS, AVATAR_COLORS, BANNER_PRESETS, CURRENCIES, getBannerGradient } from './profile.js';
import { fetchPrices } from './prices.js';
import * as api from './api.js';

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h = ((h << 5) - h) + ch;
    h = h & h;
  }
  return 'h_' + Math.abs(h).toString(36);
}

function bindEvents(s) {
  const authToggle = document.getElementById('authToggle');
  const authPanel = document.getElementById('authPanel');

  authToggle?.addEventListener('click', () => {
    authPanel.classList.toggle('open');
  });

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('authLoginForm').hidden = target !== 'login';
      document.getElementById('authRegisterForm').hidden = target !== 'register';
      document.getElementById('authLoginError').hidden = true;
      document.getElementById('authRegError').hidden = true;
    });
  });

  document.getElementById('authLoginBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('authLoginUser')?.value.trim();
    const password = document.getElementById('authLoginPass')?.value || '';
    if (!username || !password) return;

    try {
      const user = await api.login(username, hashStr(password));
      if (user) {
        state.user = { username, id: user._id };
        const profile = await api.getProfile(username);
        state.profile = profile || { username, avatar: 'warrior', bio: '', banner: 'midnight', currency: 'cl', joinedAt: Date.now() };
        localStorage.setItem('gamebin_session', JSON.stringify({ username }));
        document.getElementById('authUsername').textContent = username;
        document.getElementById('authUser').hidden = false;
        document.getElementById('authGate').hidden = true;
        document.body.classList.add('logged-in');
        authPanel.classList.remove('open');
        showToast('Welcome back, ' + username);
        await loadMyLists();
        render(state);
        return;
      }
    } catch { /* fall through */ }

    const errEl = document.getElementById('authLoginError');
    errEl.textContent = 'Incorrect username or password';
    errEl.hidden = false;
  });

  document.getElementById('authRegBtn')?.addEventListener('click', async () => {
    const username = document.getElementById('authRegUser')?.value.trim();
    const password = document.getElementById('authRegPass')?.value || '';
    if (!username || !password) return;
    if (username.length < 3) {
      const errEl = document.getElementById('authRegError');
      errEl.textContent = 'Username must be at least 3 characters';
      errEl.hidden = false;
      return;
    }

    try {
      await api.register(username, hashStr(password));
    } catch (e) {
      const errEl = document.getElementById('authRegError');
      errEl.textContent = e.message.includes('taken') ? 'Username already taken' : 'Registration failed';
      errEl.hidden = false;
      return;
    }

    state.user = { username, id: 'local_' + username };
    const profile = { username, avatar: 'warrior', bio: '', banner: 'midnight', currency: 'cl', joinedAt: Date.now() };
    await api.saveProfile(profile);
    state.profile = profile;
    localStorage.setItem('gamebin_session', JSON.stringify({ username }));
    document.getElementById('authUsername').textContent = username;
    document.getElementById('authUser').hidden = false;
    document.getElementById('authGate').hidden = true;
    document.body.classList.add('logged-in');
    authPanel.classList.remove('open');
    showToast('Account created!');
    state.categories = [];
    await loadMyLists();
    render(state);
  });

  document.getElementById('authLogout')?.addEventListener('click', () => {
    state.user = null;
    state.profile = null;
    localStorage.removeItem('gamebin_session');
    document.getElementById('authUser').hidden = true;
    document.getElementById('authGate').hidden = false;
    document.body.classList.remove('logged-in');
    state.currentView = 'mylists';
    state.lists = [];
    state.games = [];
    state.categories = [];
    save(state);
    showToast('Logged out');
    render(state);
  });

  // ── Nav ───────────────────────────────────────────────────
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentView = btn.dataset.view;
      document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      save(state);
      render(state);
    });
  });

  // ── Body logged-in class ──────────────────────────────────
  if (state.user) document.body.classList.add('logged-in');

  // ── Delegated events on #appContent ───────────────────────
  const appContent = document.getElementById('appContent');
  if (appContent) {
    appContent.addEventListener('click', (e) => {
      const target = e.target;

      const carouselPrev = target.closest('.carousel-prev');
      if (carouselPrev) {
        const track = document.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: -300, behavior: 'smooth' });
        return;
      }
      const carouselNext = target.closest('.carousel-next');
      if (carouselNext) {
        const track = document.querySelector('.carousel-track');
        if (track) track.scrollBy({ left: 300, behavior: 'smooth' });
        return;
      }

      const viewBtn = target.closest('[data-view]');
      if (viewBtn) {
        state.currentView = viewBtn.dataset.view;
        document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-view="${viewBtn.dataset.view}"]`).forEach(b => b.classList.add('active'));
        save(state);
        render(state);
        return;
      }

      if (target.id === 'btnLandingCta' || target.closest('#btnLandingCta')) {
        document.getElementById('authPanel')?.classList.add('open');
        return;
      }

      if (target.id === 'btnNewList' || target.closest('#btnNewList')) { openNewListModal(); return; }

      const listItem = target.closest('[data-list-id]');
      if (listItem) {
        state.activeListId = listItem.dataset.listId;
        state.filterCategory = '';
        save(state);
        loadGamesForActiveList();
        return;
      }

      const modeBtn = target.closest('[data-mode]');
      if (modeBtn) {
        state.viewMode = modeBtn.dataset.mode;
        save(state);
        render(state);
        return;
      }

      if (target.id === 'btnClearFilter' || target.closest('#btnClearFilter')) {
        state.filterCategory = '';
        save(state);
        render(state);
        return;
      }

      const filterChip = target.closest('[data-filter-cat]');
      if (filterChip) {
        state.filterCategory = state.filterCategory === filterChip.dataset.filterCat ? '' : filterChip.dataset.filterCat;
        save(state);
        render(state);
        return;
      }

      const quickCat = target.closest('[data-quick-cat]');
      if (quickCat && !quickCat.disabled) {
        addQuickCategory(quickCat.dataset.quickCat);
        return;
      }

      const delCat = target.closest('[data-delete-cat]');
      if (delCat) {
        removeCategoryById(delCat.dataset.deleteCat);
        return;
      }

      if (target.id === 'btnAddCategory' || target.closest('#btnAddCategory')) {
        openAddCategory();
        return;
      }

      if (target.id === 'btnEditList' || target.closest('#btnEditList')) { openEditListModal(); return; }
      if (target.id === 'btnDeleteList' || target.closest('#btnDeleteList')) {
        handleDeleteList();
        return;
      }
      if (target.id === 'btnShareList' || target.closest('#btnShareList')) {
        shareList();
        return;
      }
      if (target.id === 'btnLike' || target.closest('#btnLike')) {
        handleToggleLike();
        return;
      }
      if (target.id === 'btnCopyLink' || target.closest('#btnCopyLink')) {
        copyToClipboard(window.location.href);
        return;
      }
      if (target.id === 'btnAddGame' || target.closest('#btnAddGame')) { openAddGameModal(); return; }
      if (target.id === 'btnEditProfile' || target.closest('#btnEditProfile')) { openEditProfileModal(); return; }
      if (target.id === 'btnBackHome' || target.closest('#btnBackHome')) {
        e.preventDefault();
        state.currentView = 'mylists';
        save(state);
        render(state);
        return;
      }

      const sharedCard = target.closest('[data-shared-list]');
      if (sharedCard) {
        state.currentView = 'shared';
        state.activeListId = sharedCard.dataset.sharedList;
        loadSharedList(sharedCard.dataset.sharedList);
        return;
      }

      if (target.closest('.game-card-store')) return;

      if (target.id === 'btnManageVoters' || target.closest('#btnManageVoters')) {
        openManageVotersModal();
        return;
      }

      const sortChip = target.closest('[data-sort]');
      if (sortChip) {
        state.sortMode = sortChip.dataset.sort;
        save(state);
        render(state);
        return;
      }

      const voteBtn = target.closest('[data-vote-inline]');
      if (voteBtn) {
        const dir = parseInt(voteBtn.dataset.voteInline);
        const gid = voteBtn.dataset.voteGame;
        handleVote(gid, dir);
        return;
      }

      const gameCard = target.closest('[data-game-id]');
      if (gameCard) {
        if (state.currentView === 'shared' && !isListOwner(state.activeListId)) {
          openGameDetailModal(gameCard.dataset.gameId);
        } else {
          openEditGameModal(gameCard.dataset.gameId);
        }
        return;
      }
    });

    appContent.addEventListener('input', (e) => {
      if (e.target.id === 'searchInput') {
        state.searchQuery = e.target.value;
        save(state);
        debounceRender();
      }
    });
  }
}

const debounceRender = debounce(() => render(state), 200);

// ── Helpers ─────────────────────────────────────────────────────

function isListOwner(listId) {
  if (!state.user) return false;
  const list = state.lists.find(l => l._id === listId);
  if (!list && state.sharedList) return state.sharedList.list.userId === state.user.username;
  return list && list.userId === state.user.username;
}

function canVoteOnList(listId) {
  if (!state.user) return false;
  if (isListOwner(listId)) return true;
  return state._allowedVoters.includes(state.user.username);
}

// ── Async actions ───────────────────────────────────────────────

async function loadGamesForActiveList() {
  if (!state.activeListId) return;
  try {
    state.games = await api.getGamesByList(state.activeListId);
    render(state);
    loadPricesForGames(state.games);
  } catch { render(state); }
}

async function addQuickCategory(name) {
  if (!state.user) return;
  const def = DEFAULT_CATEGORIES.find(d => d.name === name);
  if (state.categories.find(c => c.name === name)) return;
  try {
    await api.createCategory({ userId: state.user.username, name, color: def ? def.color : '#666' });
    state.categories = await api.getCategories(state.user.username);
    render(state);
    showToast('Category added');
  } catch { showToast('Failed to add category'); }
}

async function removeCategoryById(catId) {
  try {
    await api.deleteCategory(catId);
    state.categories = state.categories.filter(c => c._id !== catId);
    render(state);
    showToast('Category removed');
  } catch { showToast('Failed to remove category'); }
}

async function handleDeleteList() {
  if (!confirm('Delete this list and all its games?')) return;
  try {
    await api.deleteList(state.activeListId);
    state.lists = state.lists.filter(l => l._id !== state.activeListId);
    state.activeListId = state.lists.length > 0 ? state.lists[0]._id : null;
    state.games = [];
    save(state);
    render(state);
    showToast('List deleted');
  } catch { showToast('Failed to delete list'); }
}

async function handleToggleLike() {
  if (!state.user) { showToast('Log in to like lists'); return; }
  try {
    const result = await api.toggleLike(state.activeListId, state.user.username);
    state._likedList = result.liked;
    await loadSharedList(state.activeListId);
  } catch { showToast('Failed to toggle like'); }
}

async function handleVote(gameId, direction) {
  if (!canVoteOnList(state.activeListId)) { showToast('You need permission to vote'); return; }
  try {
    await api.vote({ listId: state.activeListId, gameId, username: state.user.username, direction });
    state._votes = await api.getVotesForList(state.activeListId);
    render(state);
  } catch { showToast('Vote failed'); }
}

// ── Modals ───────────────────────────────────────────────────

function openNewListModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>New List</h2>
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="newListName" placeholder="e.g. Co-op Secrets, RPG Hall of Fame" maxlength="50">
      </div>
      <div class="form-group">
        <label>Color</label>
        <div class="color-grid">
          ${LIST_COLORS.map((c, i) => `<div class="color-picker-item ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
        </div>
      </div>
      <label class="toggle-row">
        <input type="checkbox" id="newListPublic" checked>
        <span>Public (visible in Discover)</span>
      </label>
      <button class="btn btn-primary btn-full" id="btnCreateList">Create List</button>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('newListName')?.focus(), 50);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  let selectedColor = LIST_COLORS[0];
  overlay.querySelectorAll('.color-picker-item').forEach(el => {
    el.addEventListener('click', () => {
      overlay.querySelectorAll('.color-picker-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedColor = el.dataset.color;
    });
  });

  overlay.querySelector('#btnCreateList').addEventListener('click', async () => {
    const name = document.getElementById('newListName')?.value.trim();
    if (!name) return;

    const isPublic = document.getElementById('newListPublic')?.checked !== false;
    try {
      const id = await api.createList({
        name, userId: state.user.username, coverColor: selectedColor, isPublic,
      });
      state.lists = await api.getMyLists(state.user.username);
      state.activeListId = id;
      state.games = [];
      save(state);
      render(state);
      overlay.remove();
      showToast('List created');
    } catch { showToast('Failed to create list'); }
  });
}

function openEditListModal() {
  const list = state.lists.find(l => l._id === state.activeListId);
  if (!list) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>Edit List</h2>
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="editListName" value="${escHtml(list.name)}" maxlength="50">
      </div>
      <div class="form-group">
        <label>Color</label>
        <div class="color-grid">
          ${LIST_COLORS.map(c => `<div class="color-picker-item ${c === list.coverColor ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
        </div>
      </div>
      <label class="toggle-row">
        <input type="checkbox" id="editListPublic" ${list.isPublic !== false ? 'checked' : ''}>
        <span>Public (visible in Discover)</span>
      </label>
      <button class="btn btn-primary btn-full" id="btnSaveList">Save</button>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('editListName')?.focus(), 50);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  let selectedColor = list.coverColor;
  overlay.querySelectorAll('.color-picker-item').forEach(el => {
    el.addEventListener('click', () => {
      overlay.querySelectorAll('.color-picker-item').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedColor = el.dataset.color;
    });
  });

  overlay.querySelector('#btnSaveList').addEventListener('click', async () => {
    const name = document.getElementById('editListName')?.value.trim();
    if (!name) return;
    const isPublic = document.getElementById('editListPublic')?.checked !== false;
    try {
      await api.updateList({ listId: state.activeListId, name, coverColor: selectedColor, isPublic });
      state.lists = await api.getMyLists(state.user.username);
      render(state);
      overlay.remove();
      showToast('List updated');
    } catch { showToast('Failed to update list'); }
  });
}

function openAddGameModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const catChips = state.categories.map(c =>
    `<button class="category-chip" data-cat-chip="${escHtml(c.name)}">
      <span class="category-chip-dot" style="background:${escHtml(c.color)}"></span>
      ${escHtml(c.name)}
    </button>`
  ).join('');

  overlay.innerHTML = `
    <div class="modal modal-add-game">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>Add Game</h2>
      <div class="form-group">
        <label>Search or paste Steam URL</label>
        <div class="steam-search-wrap">
          <input type="text" id="gameSearchInput" placeholder="Game name or Steam store URL..." maxlength="200" autocomplete="off">
          <div class="steam-search-results" id="steamResults" hidden></div>
        </div>
        <div class="steam-preview" id="steamPreview" hidden>
          <img id="steamPreviewImg" alt="">
          <div class="steam-preview-info">
            <div id="steamPreviewName"></div>
            <div id="steamPreviewDesc"></div>
          </div>
          <button class="btn btn-sm" id="steamPreviewClear">Clear</button>
        </div>
      </div>
      <div class="form-group">
        <label>Game name</label>
        <input type="text" id="gameName" placeholder="e.g. Phasmophobia" maxlength="100">
      </div>
      <div class="form-group">
        <label>Cover image URL</label>
        <input type="text" id="gameCover" placeholder="Auto-filled from Steam, or paste URL" maxlength="500">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="gameNotes" placeholder="Your thoughts, tips, or recommendation..." maxlength="500"></textarea>
      </div>
      <div class="form-group" id="steamTagsGroup" hidden>
        <label>Steam Tags</label>
        <div class="category-selector" id="steamTagsDisplay"></div>
      </div>
      ${state.categories.length > 0
        ? `<div class="form-group">
            <label>Custom Tags</label>
            <div class="category-selector" id="gameCategories">
              ${catChips}
            </div>
          </div>`
        : ''
      }
      <button class="btn btn-primary btn-full" id="btnAddGameSubmit">Add to List</button>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('gameSearchInput')?.focus(), 50);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  let steamAppId = null;
  let steamTags = [];

  const searchInput = overlay.querySelector('#gameSearchInput');
  const resultsEl = overlay.querySelector('#steamResults');
  const previewEl = overlay.querySelector('#steamPreview');
  const steamTagsGroup = overlay.querySelector('#steamTagsGroup');
  const steamTagsDisplay = overlay.querySelector('#steamTagsDisplay');

  const doSearch = debounce((query) => {
    const info = buildSteamInfoFromUrl(query);
    if (info) {
      resultsEl.hidden = true;
      resultsEl.innerHTML = '';
      applySteamInfo(info, overlay);
      steamAppId = info.appId;
      return;
    }

    if (query.length < 2) { resultsEl.hidden = true; return; }
    const results = searchLocalGames(query);
    if (results.length === 0) { resultsEl.hidden = true; return; }

    resultsEl.innerHTML = results.map(r => `
      <div class="steam-result-item" data-appid="${r.appId}" data-name="${escHtml(r.name)}">
        <img src="${r.headerUrl}" alt="" class="steam-result-thumb">
        <span>${escHtml(r.name)}</span>
      </div>
    `).join('');
    resultsEl.hidden = false;
  }, 150);

  searchInput.addEventListener('input', () => doSearch(searchInput.value.trim()));

  resultsEl.addEventListener('click', async (e) => {
    const item = e.target.closest('[data-appid]');
    if (!item) return;
    resultsEl.hidden = true;
    const appId = item.dataset.appid;
    const name = item.dataset.name || 'Steam Game ' + appId;
    const info = { appId, name, coverUrl: getSteamCoverUrl(appId), headerUrl: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg` };
    applySteamInfo(info, overlay);
    steamAppId = appId;
    searchInput.value = '';

    steamTags = await fetchSteamTags(appId);
    if (steamTags.length > 0 && steamTagsDisplay) {
      steamTagsDisplay.innerHTML = steamTags.map(t =>
        `<span class="steam-tag-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>${escHtml(t)}</span>`
      ).join('');
      steamTagsGroup.hidden = false;
    }
  });

  overlay.querySelector('#steamPreviewClear')?.addEventListener('click', () => {
    previewEl.hidden = true;
    steamAppId = null;
    steamTags = [];
    if (steamTagsGroup) steamTagsGroup.hidden = true;
    if (steamTagsDisplay) steamTagsDisplay.innerHTML = '';
    overlay.querySelector('#gameName').value = '';
    overlay.querySelector('#gameCover').value = '';
  });

  const selectedCats = new Set();
  overlay.querySelectorAll('[data-cat-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const name = chip.dataset.catChip;
      if (selectedCats.has(name)) selectedCats.delete(name);
      else selectedCats.add(name);
    });
  });

  overlay.querySelector('#btnAddGameSubmit').addEventListener('click', async () => {
    const name = overlay.querySelector('#gameName')?.value.trim();
    if (!name) { showToast('Enter a game name'); return; }

    try {
      await api.addGame({
        listId: state.activeListId,
        name,
        coverUrl: overlay.querySelector('#gameCover')?.value.trim() || '',
        notes: overlay.querySelector('#gameNotes')?.value.trim() || '',
        categories: [...selectedCats],
        steamAppId: steamAppId || undefined,
        steamTags: steamTags.length > 0 ? steamTags : undefined,
      });
      if (state.currentView === 'shared') {
        overlay.remove();
        await loadSharedList(state.activeListId);
      } else {
        state.games = await api.getGamesByList(state.activeListId);
        render(state);
        overlay.remove();
      }
      showToast(name + ' added');
    } catch { showToast('Failed to add game'); }
  });
}

function applySteamInfo(info, overlay) {
  const previewEl = overlay.querySelector('#steamPreview');
  previewEl.hidden = false;
  previewEl.querySelector('#steamPreviewImg').src = info.headerUrl || info.coverUrl;
  previewEl.querySelector('#steamPreviewName').textContent = info.name;
  previewEl.querySelector('#steamPreviewDesc').textContent = '';
  overlay.querySelector('#gameName').value = info.name;
  overlay.querySelector('#gameCover').value = info.coverUrl;
}

function openEditGameModal(gameId) {
  const game = state.games.find(g => g._id === gameId);
  if (!game) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const catChips = state.categories.map(c =>
    `<button class="category-chip ${game.categories && game.categories.includes(c.name) ? 'selected' : ''}" data-cat-chip="${escHtml(c.name)}">
      <span class="category-chip-dot" style="background:${escHtml(c.color)}"></span>
      ${escHtml(c.name)}
    </button>`
  ).join('');

  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>Edit Game</h2>
      ${game.coverUrl ? `<img src="${escHtml(game.coverUrl)}" class="modal-game-preview" alt="">` : ''}
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="editGameName" value="${escHtml(game.name)}" maxlength="100">
      </div>
      <div class="form-group">
        <label>Cover URL</label>
        <input type="text" id="editGameCover" value="${escHtml(game.coverUrl || '')}" placeholder="https://..." maxlength="500">
      </div>
      <div class="form-group">
        <label>Notes</label>
        <textarea id="editGameNotes" maxlength="500">${escHtml(game.notes || '')}</textarea>
      </div>
      ${game.steamTags && game.steamTags.length > 0
        ? `<div class="form-group">
            <label>Steam Tags</label>
            <div class="category-selector">${game.steamTags.map(t => `<span class="steam-tag-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>${escHtml(t)}</span>`).join('')}</div>
          </div>`
        : ''
      }
      ${state.categories.length > 0
        ? `<div class="form-group">
            <label>Custom Tags</label>
            <div class="category-selector">${catChips}</div>
          </div>`
        : ''
      }
      <div class="modal-actions">
        <button class="btn btn-primary" id="btnSaveGame" style="flex:1;">Save</button>
        <button class="btn btn-danger" id="btnDeleteGame">Delete</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  const selectedCats = new Set(game.categories || []);
  overlay.querySelectorAll('[data-cat-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const name = chip.dataset.catChip;
      if (selectedCats.has(name)) selectedCats.delete(name);
      else selectedCats.add(name);
    });
  });

  overlay.querySelector('#btnSaveGame').addEventListener('click', async () => {
    const name = overlay.querySelector('#editGameName')?.value.trim();
    if (!name) return;
    try {
      await api.updateGame({
        gameId: game._id,
        name,
        coverUrl: overlay.querySelector('#editGameCover')?.value.trim() || '',
        notes: overlay.querySelector('#editGameNotes')?.value.trim() || '',
        categories: [...selectedCats],
        steamAppId: game.steamAppId || undefined,
        steamTags: game.steamTags || undefined,
      });
      state.games = await api.getGamesByList(state.activeListId);
      render(state);
      overlay.remove();
      showToast('Game updated');
    } catch { showToast('Failed to update game'); }
  });

  overlay.querySelector('#btnDeleteGame').addEventListener('click', async () => {
    if (!confirm('Remove this game?')) return;
    try {
      await api.deleteGame(game._id);
      state.games = state.games.filter(g => g._id !== gameId);
      render(state);
      overlay.remove();
      showToast('Game removed');
    } catch { showToast('Failed to remove game'); }
  });
}

function openGameDetailModal(gameId) {
  const games = state.sharedList ? state.sharedList.games : state.games;
  const game = games.find(g => g._id === gameId);
  if (!game) return;

  const listId = state.activeListId;
  const canVote = canVoteOnList(listId);
  const votes = state._votes[gameId] || {};
  const userVote = state.user ? (votes[state.user.username] || 0) : 0;
  const score = Object.values(votes).reduce((s, v) => s + v, 0);

  let priceHtml = '';
  if (game.steamAppId && state._prices) {
    const p = state._prices[game.steamAppId];
    if (p) {
      if (p.free) priceHtml = `<div class="detail-price free">Free to Play</div>`;
      else if (p.formatted) {
        priceHtml = `<div class="detail-price${p.discount ? ' discount' : ''}">${escHtml(p.formatted)}${p.discount ? `<span class="detail-discount">-${p.discount}%</span>` : ''}</div>`;
      }
    }
  }

  const steamTagsHtml = (game.steamTags && game.steamTags.length > 0)
    ? `<div class="detail-steam-tags">
        <span class="detail-section-label">Steam Tags</span>
        <div class="detail-tags-wrap">${game.steamTags.map(t =>
          `<span class="steam-tag-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>${escHtml(t)}</span>`
        ).join('')}</div>
      </div>`
    : (game.steamAppId ? `<div class="detail-steam-tags"><span class="detail-section-label">Steam Tags</span><div class="detail-tags-wrap detail-tags-loading" id="detailSteamTags">Loading...</div></div>` : '');

  const categoriesHtml = (game.categories && game.categories.length > 0)
    ? `<div class="detail-categories">
        <span class="detail-section-label">Tags</span>
        <div class="detail-tags-wrap">${game.categories.map(c => `<span class="category-badge" style="background:rgba(102,192,244,.15);color:var(--accent-bright);border:1px solid rgba(102,192,244,.2)">${escHtml(c)}</span>`).join('')}</div>
      </div>`
    : '';

  const storeBtn = game.steamAppId
    ? `<a class="btn btn-sm detail-store-btn" href="https://store.steampowered.com/app/${escHtml(game.steamAppId)}/" target="_blank" rel="noopener">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
        View on Steam
       </a>`
    : '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-detail">
      <button class="modal-close" aria-label="Close">&times;</button>
      ${game.coverUrl ? `<img src="${escHtml(game.coverUrl)}" class="detail-cover" alt="${escHtml(game.name)}">` : ''}
      <h2 class="detail-name">${escHtml(game.name)}</h2>
      ${priceHtml}
      ${game.notes ? `<p class="detail-notes">${escHtml(game.notes)}</p>` : ''}
      ${steamTagsHtml}
      ${categoriesHtml}
      <div class="detail-actions">
        ${storeBtn}
        ${canVote ? `
          <div class="vote-controls">
            <button class="vote-btn vote-up ${userVote === 1 ? 'active' : ''}" data-vote="1" data-game="${escHtml(gameId)}" aria-label="Upvote">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </button>
            <span class="vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}">${score}</span>
            <button class="vote-btn vote-down ${userVote === -1 ? 'active' : ''}" data-vote="-1" data-game="${escHtml(gameId)}" aria-label="Downvote">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </button>
          </div>
        ` : (score !== 0 ? `<span class="vote-score-readonly">${score > 0 ? '+' : ''}${score}</span>` : '')}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.vote);
      handleVote(btn.dataset.game, dir);
      overlay.remove();
    });
  });

  if (game.steamAppId && (!game.steamTags || game.steamTags.length === 0)) {
    fetchSteamTags(game.steamAppId).then(tags => {
      const el = overlay.querySelector('#detailSteamTags');
      if (!el || !document.body.contains(overlay)) return;
      if (tags.length > 0) {
        el.classList.remove('detail-tags-loading');
        el.innerHTML = tags.map(t =>
          `<span class="steam-tag-chip"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>${escHtml(t)}</span>`
        ).join('');
      } else {
        el.closest('.detail-steam-tags')?.remove();
      }
    });
  }
}

async function openManageVotersModal() {
  const listId = state.activeListId;
  if (!listId || !isListOwner(listId)) return;

  let voters = [];
  try { voters = await api.getAllowedVoters(listId); } catch { /* empty */ }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>Manage Voters</h2>
      <p class="modal-desc">Allow other users to upvote or downvote games in this list.</p>
      <div class="form-group">
        <label>Add username</label>
        <div class="voter-add-row">
          <input type="text" id="newVoterName" placeholder="Username" maxlength="20">
          <button class="btn btn-primary btn-sm" id="btnAddVoter">Add</button>
        </div>
      </div>
      <div class="voter-list" id="voterList">
        ${voters.length === 0
          ? '<div class="empty-state-text" style="padding:12px 0;">No voters added yet</div>'
          : voters.map(v => `
            <div class="voter-row">
              <span class="voter-name">${escHtml(v)}</span>
              <button class="btn btn-sm btn-ghost btn-danger-text" data-remove-voter="${escHtml(v)}">Remove</button>
            </div>
          `).join('')
        }
      </div>
      <button class="btn btn-full" id="btnCloseVoters" style="margin-top:14px;">Done</button>
    </div>`;

  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('newVoterName')?.focus(), 50);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#btnCloseVoters').addEventListener('click', () => overlay.remove());

  overlay.querySelector('#btnAddVoter').addEventListener('click', async () => {
    const name = document.getElementById('newVoterName')?.value.trim();
    if (!name) return;
    try {
      const exists = await api.userExists(name);
      if (!exists) { showToast('User not found'); return; }
      if (voters.includes(name)) { showToast('Already added'); return; }
      voters.push(name);
      await api.setAllowedVoters(listId, voters);
      state._allowedVoters = voters;
      showToast(name + ' can now vote');
      overlay.remove();
      openManageVotersModal();
    } catch { showToast('Failed to add voter'); }
  });

  overlay.querySelectorAll('[data-remove-voter]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const name = btn.dataset.removeVoter;
      voters = voters.filter(v => v !== name);
      try {
        await api.setAllowedVoters(listId, voters);
        state._allowedVoters = voters;
        showToast(name + ' removed');
        overlay.remove();
        openManageVotersModal();
      } catch { showToast('Failed to remove voter'); }
    });
  });
}

function openEditProfileModal() {
  if (!state.user || !state.profile) return;
  const p = state.profile;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal modal-profile">
      <button class="modal-close" aria-label="Close">&times;</button>
      <h2>Edit Profile</h2>
      <div class="form-group">
        <label>Avatar</label>
        <div class="avatar-grid">
          ${AVATARS.map(a => `
            <div class="avatar-option ${a === p.avatar ? 'selected' : ''}" data-avatar="${a}" title="${a}">
              ${renderAvatarSvg(a, 36)}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Banner</label>
        <div class="banner-grid">
          ${BANNER_PRESETS.map(b => `
            <div class="banner-option ${b.id === p.banner ? 'selected' : ''}" data-banner="${b.id}" style="background:${b.gradient}"></div>
          `).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Currency</label>
        <select id="profileCurrency" class="form-select">
          ${CURRENCIES.map(c => `<option value="${c.code}" ${c.code === (p.currency || 'cl') ? 'selected' : ''}>${c.label} (${c.symbol})</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Bio</label>
        <textarea id="profileBio" maxlength="160" placeholder="A short bio about your gaming taste...">${escHtml(p.bio || '')}</textarea>
      </div>
      <button class="btn btn-primary btn-full" id="btnSaveProfile">Save Profile</button>
    </div>`;

  document.body.appendChild(overlay);

  overlay.querySelector('.modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  let selectedAvatar = p.avatar;
  let selectedBanner = p.banner;

  overlay.querySelectorAll('.avatar-option').forEach(el => {
    el.addEventListener('click', () => {
      overlay.querySelectorAll('.avatar-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedAvatar = el.dataset.avatar;
    });
  });

  overlay.querySelectorAll('.banner-option').forEach(el => {
    el.addEventListener('click', () => {
      overlay.querySelectorAll('.banner-option').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedBanner = el.dataset.banner;
    });
  });

  overlay.querySelector('#btnSaveProfile').addEventListener('click', async () => {
    state.profile.avatar = selectedAvatar;
    state.profile.banner = selectedBanner;
    state.profile.bio = overlay.querySelector('#profileBio')?.value.trim() || '';
    state.profile.currency = overlay.querySelector('#profileCurrency')?.value || 'cl';
    try {
      await api.saveProfile({
        username: state.user.username,
        avatar: state.profile.avatar,
        bio: state.profile.bio,
        banner: state.profile.banner,
        currency: state.profile.currency,
        joinedAt: state.profile.joinedAt || Date.now(),
      });
      render(state);
      overlay.remove();
      showToast('Profile saved');
    } catch { showToast('Failed to save profile'); }
  });
}

function openAddCategory() {
  const name = document.getElementById('newCategoryName')?.value.trim();
  const color = document.getElementById('newCategoryColor')?.value || '#66c0f4';
  if (!name || !state.user) return;

  if (state.categories.find(c => c.name === name)) {
    showToast('Category already exists');
    return;
  }

  api.createCategory({ userId: state.user.username, name, color }).then(async () => {
    state.categories = await api.getCategories(state.user.username);
    render(state);
    showToast('Category added');
  }).catch(() => showToast('Failed to add category'));
}

// ── Share via URL hash ──────────────────────────────────────────

function shareList() {
  const list = state.lists.find(l => l._id === state.activeListId);
  if (!list) return;
  const games = state.games.filter(g => g.listId === state.activeListId);
  const profile = state.profile || { username: 'Anonymous', avatar: 'warrior', banner: 'midnight' };

  const payload = {
    l: { name: list.name, color: list.coverColor, id: list._id },
    g: games.map(g => ({
      n: g.name,
      c: g.coverUrl || '',
      t: g.notes || '',
      s: g.steamAppId || '',
      k: g.categories || [],
      id: g._id,
    })),
    u: { name: profile.username, avatar: profile.avatar, banner: profile.banner },
  };

  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  const url = window.location.origin + window.location.pathname + '#s=' + encoded;
  copyToClipboard(url);
}

// ── Data loading ────────────────────────────────────────────────

async function loadMyLists() {
  if (!state.user) return;
  state.lists = await api.getMyLists(state.user.username);
  state.categories = await api.getCategories(state.user.username);
  if (state.categories.length === 0) {
    for (const c of DEFAULT_CATEGORIES) {
      await api.createCategory({ userId: state.user.username, name: c.name, color: c.color });
    }
    state.categories = await api.getCategories(state.user.username);
  }
  if (state.activeListId) {
    const validList = state.lists.find(l => l._id === state.activeListId);
    if (validList) {
      state.games = await api.getGamesByList(state.activeListId);
    } else {
      state.activeListId = state.lists.length > 0 ? state.lists[0]._id : null;
      if (state.activeListId) {
        state.games = await api.getGamesByList(state.activeListId);
      }
    }
  } else if (state.lists.length > 0) {
    state.activeListId = state.lists[0]._id;
    state.games = await api.getGamesByList(state.activeListId);
  }
}

async function loadSharedList(listId) {
  try {
    const data = await api.getSharedList(listId);
    if (!data) {
      state.sharedList = null;
      render(state);
      return;
    }

    state.sharedList = data;
    state._votes = await api.getVotesForList(listId);
    state._allowedVoters = await api.getAllowedVoters(listId);

    if (state.user) {
      state._likedList = await api.hasLiked(listId, state.user.username);
    }

    const ownerProfile = await api.getProfile(data.list.userId);
    state._sharedProfile = ownerProfile || { username: data.list.userId, avatar: 'warrior', banner: 'midnight' };

    render(state);
    loadPricesForGames(data.games);
  } catch {
    state.sharedList = null;
    render(state);
  }
}

async function loadPricesForGames(games) {
  const appIds = games.filter(g => g.steamAppId).map(g => g.steamAppId);
  if (appIds.length === 0) return;

  const cc = (state.profile && state.profile.currency) || 'cl';
  const prices = await fetchPrices(appIds, cc);
  state._prices = prices;
  render(state);
}

function loadFromShareHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#s=')) return false;

  try {
    const encoded = hash.slice(3);
    const json = decodeURIComponent(atob(encoded));
    const payload = JSON.parse(json);

    const list = { _id: payload.l.id || 'shared', name: payload.l.name, coverColor: payload.l.color, userId: payload.u.name };
    const games = payload.g.map((g, i) => ({
      _id: g.id || 'sg_' + i,
      name: g.n,
      coverUrl: g.c,
      notes: g.t,
      steamAppId: g.s || null,
      categories: g.k || [],
    }));

    state.currentView = 'shared';
    state.activeListId = list._id;
    state.sharedList = { list, games, likesCount: 0 };
    state._sharedProfile = { username: payload.u.name, avatar: payload.u.avatar, banner: payload.u.banner };
    state._votes = {};
    state._allowedVoters = [];

    // If we have a real Convex list ID, load fresh data
    if (payload.l.id && payload.l.id !== 'shared') {
      loadSharedList(payload.l.id);
    } else {
      loadPricesForGames(games);
    }
    return true;
  } catch {
    return false;
  }
}

async function loadPublicLists() {
  try {
    state._publicLists = await api.getPublicLists();
  } catch {
    state._publicLists = [];
  }
}

async function loadData() {
  if (loadFromShareHash()) return;

  const params = new URLSearchParams(window.location.search);
  const sharedListId = params.get('list');

  const profilePromise = state.user
    ? api.getProfile(state.user.username).then(p => { state.profile = p || state.profile; }).catch(() => {})
    : Promise.resolve();

  const publicPromise = loadPublicLists();

  await profilePromise;

  if (sharedListId) {
    state.currentView = 'shared';
    state.activeListId = sharedListId;
    render(state);
    await loadSharedList(sharedListId);
    return;
  }

  if (state.user) {
    try {
      await loadMyLists();
    } catch { /* ignore */ }
  }

  await publicPromise;

  if (state.activeListId && state.user && state.games.length > 0) {
    loadPricesForGames(state.games);
  }

  render(state);
}

export { bindEvents, loadData };
