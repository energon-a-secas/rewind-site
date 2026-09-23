// Raw localStorage throws in private browsing, where the object exists but
// every access raises. These wrappers return a fallback instead. Storage
// keys and formats are unchanged, so existing saved data still loads.
import { safeGet, safeSet } from './neorgon-persist.js';

// ── Shared mutable state + Convex client ─────────────────────────────
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";
import { MEMES } from './data.js';

// ── Convex client ────────────────────────────────────────────────────
const CONVEX_URL = "https://polite-jellyfish-291.convex.cloud";
export const convex = new ConvexHttpClient(CONVEX_URL);

// Function references (strings at runtime — no build step needed)
export const api = {
  memes: { list: "memes:list", getUploadUrl: "memes:getUploadUrl", saveMeme: "memes:saveMeme", deleteMeme: "memes:deleteMeme", organization: "memes:organization", organize: "memes:organize" },
  auth: { isAdmin: "auth:isAdmin" },
  votes: { getVotes: "votes:getVotes", toggleVote: "votes:toggleVote" },
};

// ── Visitor ID (persistent, used for vote dedup) ─────────────────────
function getVisitorId() {
  let id = safeGet('meme-vault-visitor');
  if (!id) {
    id = crypto.randomUUID();
    safeSet('meme-vault-visitor', id);
  }
  return id;
}
export const visitorId = getVisitorId();

// ── Mutable application state ────────────────────────────────────────
export const state = {
  activeCategory: 'all',
  activeLabels: new Set(),
  organization: {},
  authSubject: null,
  sortBy: 'recent',           // 'recent' | 'default' | 'votes'
  convexMemes: [],
  selectedFile: null,
  voteCounts: {},              // { memeKey: number }  (upvotes - downvotes)
  myVotes: new Set(),          // set of memeKey strings I upvoted
  myDownvotes: new Set(),      // set of memeKey strings I downvoted
  authLabel: null,
  isConvexAdmin: false,
};

export function setAuthSession(label, isAdmin, subject = state.authSubject) {
  state.authLabel = label || null;
  state.isConvexAdmin = !!isAdmin;
  state.authSubject = label ? subject : null;
}

export function getLoggedInUser() {
  return state.authLabel;
}

// ── Derived data ─────────────────────────────────────────────────────

/** Merge hardcoded MEMES with dynamically loaded Convex memes. */
export function getAllMemes() {
  const mapped = state.convexMemes.map((m, i) => ({
    _id: m._id,
    name: m.name,
    category: m.category,
    labels: m.labels || [],
    ownerSubject: m.ownerSubject,
    path: m.url,
    ext: m.ext,
    id: MEMES.length + i + 1,
    isNew: true,
    displayName: m.displayName || 'Anon',
    _creationTime: m._creationTime,
  }));
  return [...MEMES.map(meme => ({ ...meme, labels: [], ...state.organization[meme.name] })), ...mapped];
}

export function canOrganize(meme) {
  return !!state.authLabel && (state.isConvexAdmin || !!(meme._id && meme.ownerSubject && meme.ownerSubject === state.authSubject));
}
