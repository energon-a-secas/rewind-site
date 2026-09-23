// ── Convex HTTP API client ───────────────────────────────────────

const CONVEX_URL = 'https://vivid-ferret-371.convex.cloud';

async function query(path, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Query ${path} failed: ${text}`);
  }
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.errorMessage || 'Query failed');
  return data.value;
}

async function mutate(path, args = {}) {
  const res = await fetch(`${CONVEX_URL}/api/mutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, args, format: 'json' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mutation ${path} failed: ${text}`);
  }
  const data = await res.json();
  if (data.status === 'error') throw new Error(data.errorMessage || 'Mutation failed');
  return data.value;
}

// ── Auth ─────────────────────────────────────────────────────────
export async function login(username, passwordHash) {
  return query('auth:login', { username, passwordHash });
}

export async function register(username, passwordHash) {
  return mutate('auth:register', { username, passwordHash });
}

export async function userExists(username) {
  return query('voters:userExists', { username });
}

// ── Profiles ─────────────────────────────────────────────────────
export async function getProfile(username) {
  return query('profiles:getProfile', { username });
}

export async function saveProfile(profile) {
  return mutate('profiles:saveProfile', profile);
}

// ── Lists ────────────────────────────────────────────────────────
export async function getMyLists(userId) {
  return query('lists:getMyLists', { userId });
}

export async function getPublicLists() {
  return query('lists:getPublicLists', {});
}

export async function createList(args) {
  return mutate('lists:createList', args);
}

export async function updateList(args) {
  return mutate('lists:updateList', args);
}

export async function deleteList(listId) {
  return mutate('lists:deleteList', { listId });
}

export async function getSharedList(listId) {
  return query('lists:getSharedList', { listId });
}

// ── Games ────────────────────────────────────────────────────────
export async function getGamesByList(listId) {
  return query('lists:getGamesByList', { listId });
}

export async function addGame(args) {
  return mutate('lists:addGame', args);
}

const CONVEX_SITE_URL = 'https://vivid-ferret-371.convex.site';

export async function fetchSteamTags(appId) {
  if (!appId) return [];
  try {
    const res = await fetch(`${CONVEX_SITE_URL}/steam/tags?appId=${appId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags || [];
  } catch {
    return [];
  }
}

export async function updateGame(args) {
  return mutate('lists:updateGame', args);
}

export async function deleteGame(gameId) {
  return mutate('lists:deleteGame', { gameId });
}

// ── Categories ───────────────────────────────────────────────────
export async function getCategories(userId) {
  return query('lists:getCategories', { userId });
}

export async function createCategory(args) {
  return mutate('lists:createCategory', args);
}

export async function deleteCategory(categoryId) {
  return mutate('lists:deleteCategory', { categoryId });
}

// ── Likes ────────────────────────────────────────────────────────
export async function toggleLike(listId, userId) {
  return mutate('lists:toggleLike', { listId, userId });
}

export async function hasLiked(listId, userId) {
  return query('lists:hasLiked', { listId, userId });
}

// ── Votes ────────────────────────────────────────────────────────
export async function vote(args) {
  return mutate('votes:vote', args);
}

export async function getVotesForList(listId) {
  return query('votes:getVotesForList', { listId });
}

// ── Allowed Voters ───────────────────────────────────────────────
export async function getAllowedVoters(listId) {
  return query('voters:getAllowedVoters', { listId });
}

export async function setAllowedVoters(listId, voters) {
  return mutate('voters:setAllowedVoters', { listId, voters });
}
