// ── Event handlers ───────────────────────────────────────────
import { state, convex, api, setQuestsFromConvex, getLoggedInUser, setLoggedInUser, getUserRole, setUserRole } from './state.js';
import { render, renderQuestGrid, renderStats, renderQuestDetail, renderHunterCard, renderRewardOptions } from './render.js';
import { RANKS, POOGIE_OUTFITS, MHR_MONSTER_TIERS, getMonsterIconForRank, randomQuote } from './data.js';
import { $, showToast } from './utils.js';

async function refetchQuests() {
  try {
    const quests = await convex.query(api.quests.list);
    setQuestsFromConvex(quests || []);
  } catch (e) {
    console.warn('Refetch failed', e);
  }
}

export function bindEvents() {
  // ── Auth ────────────────────────────────────────────────
  $('authToggle')?.addEventListener('click', () => {
    const panel = $('authPanel');
    panel?.classList.toggle('open');
    if (panel?.classList.contains('open')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      $('authLoginForm').hidden = !isLogin;
      $('authRegisterForm').hidden = isLogin;
    });
  });

  $('authLoginBtn')?.addEventListener('click', () => handleAuth('login'));
  $('authRegBtn')?.addEventListener('click', () => handleAuth('register'));
  $('authLogout')?.addEventListener('click', () => {
    setLoggedInUser(null);
    setUserRole(null);
    renderAuthState(null);
    showToast('Logged out. See you next hunt!');
  });

  ['authLoginUser', 'authLoginPass'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth('login'); });
  });
  ['authRegUser', 'authRegPass', 'authInviteCode'].forEach(id => {
    $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') handleAuth('register'); });
  });

  const savedUser = getLoggedInUser();
  if (savedUser) renderAuthState(savedUser, getUserRole());

  // ── Rank tabs ──────────────────────────────────────────
  document.querySelectorAll('.rank-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.filterRank = tab.dataset.rank;
      renderQuestGrid();
    });
  });

  // ── Filters ────────────────────────────────────────────
  $('filterStatus')?.addEventListener('change', e => {
    state.filterStatus = e.target.value;
    renderQuestGrid();
  });

  $('filterCategory')?.addEventListener('change', e => {
    state.filterCategory = e.target.value;
    renderQuestGrid();
  });

  // ── Request mission ────────────────────────────────────
  $('requestQuestBtn')?.addEventListener('click', () => {
    if (!getLoggedInUser()) { showToast('Log in to request a mission'); return; }
    fillRequestSublevel();
    document.getElementById('requestModal').classList.add('open');
  });

  $('reqRank')?.addEventListener('change', fillRequestSublevel);
  $('reqCancel')?.addEventListener('click', () => closeModal('requestModal'));
  $('reqSubmit')?.addEventListener('click', submitRequest);

  // ── Post quest (Guildmaster) ────────────────────────────
  $('postQuestBtn')?.addEventListener('click', () => {
    if (!getLoggedInUser()) { showToast('Log in to post quests'); return; }
    if (getUserRole() !== 'guildmaster') { showToast('Only the Guildmaster can post quests'); return; }
    renderRewardOptions();
    document.getElementById('postModal').classList.add('open');
  });

  $('postCancel')?.addEventListener('click', () => closeModal('postModal'));
  $('postSubmit')?.addEventListener('click', submitQuest);
  $('questRank')?.addEventListener('change', updateStarOptions);

  // ── SOS Flare ──────────────────────────────────────────
  $('sosBtn')?.addEventListener('click', () => {
    showToast('SOS Flare launched! Hunters have been alerted!');
    $('sosBtn')?.classList.add('sos-active');
    setTimeout(() => $('sosBtn')?.classList.remove('sos-active'), 2000);
  });

  // ── Poogie ─────────────────────────────────────────────
  $('poogie')?.addEventListener('click', petPoogie);

  // ── Close modals on backdrop click ─────────────────────
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  // ── Keyboard shortcuts ─────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
    }
  });

  // ── Expose to window for onclick handlers ──────────────
  window.openQuest = openQuest;
  window.closeModal = closeModal;
  window.acceptQuest = acceptQuest;
  window.completeQuest = completeQuest;
  window.approveQuest = approveQuest;
  window.saveQuestSuggestions = saveQuestSuggestions;
  window.openHunter = openHunter;
  window.getUserRole = getUserRole;
}

function fillRequestSublevel() {
  const rank = $('reqRank')?.value || 'low';
  const pool = MHR_MONSTER_TIERS[rank] || MHR_MONSTER_TIERS.low;
  const sel = $('reqSublevel');
  if (!sel) return;
  sel.innerHTML = pool.map((filename, i) => {
    const name = filename.replace(/^MHR(ise|S)-|_Icon.*\.svg$/gi, '').replace(/_/g, ' ');
    return `<option value="${filename}">${name}</option>`;
  }).join('');
}

function openQuest(id) {
  renderQuestDetail(id);
}

function openHunter(username) {
  renderHunterCard(username);
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

async function handleAuth(action) {
  const isLogin = action === 'login';
  const userEl = $(isLogin ? 'authLoginUser' : 'authRegUser');
  const passEl = $(isLogin ? 'authLoginPass' : 'authRegPass');
  const username = userEl?.value.trim()?.toLowerCase() ?? '';
  const password = passEl?.value ?? '';
  if (!username || !password) {
    showToast('Enter hunter name and password');
    return;
  }
  if (!isLogin) {
    const inviteEl = $('authInviteCode');
    if (!inviteEl?.value?.trim()) {
      showToast('Enter the invite code to register');
      return;
    }
  }

  try {
    const fn = isLogin ? api.auth.login : api.auth.register;
    const args = isLogin ? { username, password } : { username, password, invitePassword: $('authInviteCode')?.value?.trim() ?? '' };
    const result = await convex.mutation(fn, args);
    if (!result?.ok) {
      showToast(result?.error || 'Failed');
      return;
    }
    const role = result.role || (username === 'guildmaster' ? 'guildmaster' : 'hunter');
    setLoggedInUser(result.username ?? username);
    setUserRole(role);
    renderAuthState(result.username ?? username, role);
    showToast(isLogin ? `Welcome back, ${result.username}!` : `Welcome to the guild, ${result.username}!`);
    if (userEl) userEl.value = '';
    if (passEl) passEl.value = '';
    const inviteEl = $('authInviteCode');
    if (inviteEl) inviteEl.value = '';
    $('authPanel')?.classList.remove('open');
  } catch (e) {
    showToast(e?.message || 'Connection error');
  }
}

function renderAuthState(username, role) {
  const loggedIn = !!username;
  $('authGate').hidden = loggedIn;
  const authUser = $('authUser');
  if (authUser) authUser.hidden = !loggedIn;
  $('authToggle')?.classList.toggle('logged-in', loggedIn);
  if (loggedIn) {
    $('authUsername').textContent = username;
    const roleEl = $('authRole');
    if (roleEl) roleEl.hidden = role !== 'guildmaster';
  }
}

async function submitQuest() {
  const title = $('questTitle')?.value.trim();
  const desc = $('questDesc')?.value.trim();
  const rank = $('questRank')?.value;
  const stars = parseInt($('questStars')?.value, 10) || 1;
  const category = $('questCategory')?.value;
  const repo = $('questRepo')?.value.trim();
  const reward = document.getElementById('questReward')?.value || '';
  const user = getLoggedInUser();
  if (!title) { showToast('Quest needs a name, hunter!'); return; }
  if (!desc) { showToast('Describe the objective'); return; }

  try {
    await convex.mutation(api.quests.create, {
      title,
      description: desc,
      rank,
      stars,
      category,
      repository: repo || undefined,
      reward: reward || undefined,
      postedBy: user || 'Guildmaster',
    });
    await refetchQuests();
    render();
    closeModal('postModal');
    showToast('Quest posted to the board!');
    clearPostForm();
  } catch (e) {
    showToast(e?.message || 'Failed to post');
  }
}

async function submitRequest() {
  const title = $('reqTitle')?.value.trim();
  const desc = $('reqDesc')?.value.trim();
  const rank = $('reqRank')?.value;
  const sublevelSel = $('reqSublevel');
  const monsterIcon = sublevelSel?.value || getMonsterIconForRank(rank, 0);
  const stars = parseInt($('reqStars')?.value, 10) || 0;
  const karma = parseInt($('reqKarma')?.value, 10) || 0;
  const category = $('reqCategory')?.value;
  const rawSuggestions = $('reqSuggestions')?.value?.trim() ?? '';
  const toolSuggestions = rawSuggestions ? rawSuggestions.split(/\n/).map(s => s.trim()).filter(Boolean) : [];
  const user = getLoggedInUser();
  if (!title) { showToast('Objective is required'); return; }

  try {
    await convex.mutation(api.quests.createRequest, {
      title,
      description: desc || title,
      rank,
      stars,
      karma: karma || undefined,
      category,
      toolSuggestions,
      monsterIcon,
      requestedBy: user || 'Hunter',
    });
    await refetchQuests();
    render();
    closeModal('requestModal');
    showToast('Request submitted. The Guildmaster will review it.');
    clearRequestForm();
  } catch (e) {
    showToast(e?.message || 'Failed to submit request');
  }
}

function clearPostForm() {
  if ($('questTitle')) $('questTitle').value = '';
  if ($('questDesc')) $('questDesc').value = '';
  if ($('questRepo')) $('questRepo').value = '';
}

function clearRequestForm() {
  if ($('reqTitle')) $('reqTitle').value = '';
  if ($('reqDesc')) $('reqDesc').value = '';
  if ($('reqStars')) $('reqStars').value = '0';
  if ($('reqKarma')) $('reqKarma').value = '0';
  if ($('reqSuggestions')) $('reqSuggestions').value = '';
}

function updateStarOptions() {
  const rank = $('questRank')?.value;
  const starsEl = $('questStars');
  if (!starsEl || !rank) return;
  const range = RANKS[rank]?.stars || [1, 2, 3];
  starsEl.innerHTML = range.map(s => `<option value="${s}">${s}</option>`).join('');
}

async function acceptQuest(id) {
  const user = getLoggedInUser();
  if (!user) { showToast('Log in first!'); return; }
  const q = state.quests.find(x => x.id === id || x._id?.toString() === id);
  if (!q || (q.acceptedBy || []).includes(user)) return;
  if (q.status === 'requested') { showToast('This request is not approved yet'); return; }

  try {
    const result = await convex.mutation(api.quests.accept, { questId: id, username: user });
    if (!result?.ok) { showToast(result?.error || 'Failed'); return; }
    await refetchQuests();
    renderQuestDetail(id);
    renderQuestGrid();
    renderStats();
    showToast(`Quest accepted! Happy hunting, ${user}!`);
  } catch (e) {
    showToast(e?.message || 'Failed');
  }
}

async function completeQuest(id) {
  const user = getLoggedInUser();
  if (!user) return;
  const q = state.quests.find(x => x.id === id || x._id?.toString() === id);
  if (!q || (q.completedBy || []).includes(user)) return;

  try {
    await convex.mutation(api.quests.complete, { questId: id, username: user });
    await refetchQuests();
    renderQuestDetail(id);
    renderQuestGrid();
    renderStats();
    showQuestComplete();
  } catch (e) {
    showToast(e?.message || 'Failed');
  }
}

async function approveQuest(id) {
  const user = getLoggedInUser();
  if (!user) return;
  try {
    const result = await convex.mutation(api.quests.approveQuest, { questId: id, username: user });
    if (!result?.ok) { showToast(result?.error || 'Failed'); return; }
    await refetchQuests();
    renderQuestDetail(id);
    renderQuestGrid();
    renderStats();
    closeModal('questModal');
    showToast('Request approved and posted to the board!');
  } catch (e) {
    showToast(e?.message || 'Failed');
  }
}

async function saveQuestSuggestions(questId, text) {
  const toolSuggestions = text.split(/\n/).map(s => s.trim()).filter(Boolean);
  try {
    const result = await convex.mutation(api.quests.updateToolSuggestions, { questId, toolSuggestions });
    if (!result?.ok) { showToast('Failed to save'); return; }
    await refetchQuests();
    renderQuestDetail(questId);
    const view = document.getElementById('qdSuggestionsView');
    const edit = document.getElementById('qdSuggestionsEdit');
    const toggle = document.getElementById('qdSuggestionsToggle');
    if (view) view.hidden = false;
    if (edit) edit.hidden = true;
    if (toggle) toggle.textContent = 'Edit suggestions';
    showToast('Suggestions saved');
  } catch (e) {
    showToast(e?.message || 'Failed to save');
  }
}

function showQuestComplete() {
  const overlay = document.createElement('div');
  overlay.className = 'quest-complete-overlay';
  overlay.innerHTML = '<div class="quest-complete-text">QUEST COMPLETE</div>';
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('show'), 10);
  setTimeout(() => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 500);
  }, 2500);
  showToast(randomQuote());
}

let poogieOutfitIdx = 0;
function petPoogie() {
  state.poogiePets++;
  const savePoogie = (n) => { try { localStorage.setItem('guild-hall-poogie', String(n)); } catch {} };
  savePoogie(state.poogiePets);
  const poog = $('poogie');
  if (!poog) return;

  poogieOutfitIdx = (poogieOutfitIdx + 1) % POOGIE_OUTFITS.length;
  const outfit = POOGIE_OUTFITS[poogieOutfitIdx];
  poog.textContent = outfit.emoji;
  poog.classList.add('pet');
  setTimeout(() => poog.classList.remove('pet'), 400);

  if (state.poogiePets === 1) showToast('You pet Poogie! Oink oink!');
  else if (state.poogiePets === 10) showToast("Poogie loves you! Badge unlocked: Palico's Friend!");
  else if (state.poogiePets % 5 === 0) showToast(`Poogie is wearing: ${outfit.name}`);
  else showToast('Oink!');
}
