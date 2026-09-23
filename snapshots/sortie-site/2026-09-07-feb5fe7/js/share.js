// ── Share links ──────────────────────────────────────────────
// The whole frame — forged parts, loadout, console options — packs into the
// URL hash, so a link rebuilds someone else's console exactly. Long libraries
// outgrow a URL; that case is reported rather than silently truncated.

import { state, save, DEFAULT_SETTINGS } from './state.js';
import { SLOT_LABEL } from './parts.js';
import { showToast } from './utils.js';

/*
 * The payload rides in the fragment, which is never sent to a server, so the
 * only real ceiling is what a browser will carry and a person will paste.
 * 1800 was set when a glyph was 36 chars; at 72 it capped a library at three
 * forged parts, which is not a library. 6000 holds about seventeen and is well
 * inside what every current browser accepts in a hash.
 */
const MAX_HASH = 6000;

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const pad = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(pad + '='.repeat((4 - (pad.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeFrame(s = state) {
  return toBase64Url(JSON.stringify({
    v: 1,
    l: s.loadout,
    c: s.custom,
    s: s.settings,
    m: s.mode,
  }));
}

/** @returns {string|null} the shareable URL, or null when it would be too long */
export function shareUrl() {
  const payload = encodeFrame();
  if (payload.length > MAX_HASH) return null;
  const base = `${location.origin}${location.pathname}`;
  return `${base}?key=CORE#f=${payload}`;
}

export async function copyShareLink() {
  const url = shareUrl();
  if (!url) {
    showToast('Frame is too large for a link. Use Export JSON in the forge.');
    return false;
  }
  try {
    await navigator.clipboard.writeText(url);
    showToast('Share link copied');
    return true;
  } catch {
    // Clipboard is blocked on insecure origins and in some embeds; show the
    // link so it can still be copied by hand.
    window.prompt('Copy this link', url);
    return true;
  }
}

/** Read a frame out of location.hash. Returns true when one was applied. */
export function adoptFromHash() {
  const m = /(?:^|[#&])f=([A-Za-z0-9_-]+)/.exec(location.hash || '');
  if (!m) return false;
  try {
    const data = JSON.parse(fromBase64Url(m[1]));
    if (!data || data.v !== 1) return false;
    if (Array.isArray(data.c)) state.custom = data.c.filter((p) => p && SLOT_LABEL[p.slot]);
    if (data.l && typeof data.l === 'object') state.loadout = { ...state.loadout, ...data.l };
    if (data.s && typeof data.s === 'object') state.settings = { ...DEFAULT_SETTINGS, ...data.s };
    state.mode = typeof data.m === 'string' ? data.m : null;
    state.unlocked = true;
    save(state);
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    return true;
  } catch {
    return false;
  }
}
