// ── Steam price fetching via Convex HTTP proxy ──────────────

const CONVEX_URL = 'https://vivid-ferret-371.convex.site';
const PRICE_CACHE_KEY = 'gamebin_prices';
const CACHE_TTL = 3600000; // 1 hour

function getPriceCache() {
  try { return JSON.parse(localStorage.getItem(PRICE_CACHE_KEY) || '{}'); } catch { return {}; }
}

function setPriceCache(cache) {
  localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
}

export async function fetchPrice(appId, cc = 'cl') {
  if (!appId) return null;

  const cache = getPriceCache();
  const key = `${appId}_${cc}`;
  const cached = cache[key];
  if (cached && (Date.now() - cached._ts) < CACHE_TTL) {
    return cached;
  }

  try {
    const res = await fetch(`${CONVEX_URL}/steam/price?appId=${appId}&cc=${cc}`);
    if (!res.ok) return null;
    const data = await res.json();
    data._ts = Date.now();
    cache[key] = data;
    setPriceCache(cache);
    return data;
  } catch {
    return null;
  }
}

export async function fetchPrices(appIds, cc = 'cl') {
  const results = {};
  const toFetch = [];

  const cache = getPriceCache();
  for (const appId of appIds) {
    const key = `${appId}_${cc}`;
    const cached = cache[key];
    if (cached && (Date.now() - cached._ts) < CACHE_TTL) {
      results[appId] = cached;
    } else {
      toFetch.push(appId);
    }
  }

  const fetches = toFetch.map(appId =>
    fetchPrice(appId, cc).then(data => { if (data) results[appId] = data; })
  );

  await Promise.allSettled(fetches);
  return results;
}

export function formatCLP(amount) {
  if (amount == null) return '';
  const value = typeof amount === 'number' ? amount / 100 : amount;
  return 'CLP$ ' + Math.round(value).toLocaleString('es-CL');
}
