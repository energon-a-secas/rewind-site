// ── Shared mutable state + Convex client ─────────────────────────────
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";
import { EMOJIS, CATEGORIES } from './data.js';

// ── Convex client ────────────────────────────────────────────────────
const CONVEX_URL = "https://majestic-rooster-231.convex.cloud";
export const convex = new ConvexHttpClient(CONVEX_URL);

// Function references (strings at runtime — no build step needed)
export const api = {
  emojis: { list: "emojis:list", getUploadUrl: "emojis:getUploadUrl", saveEmoji: "emojis:saveEmoji" },
  auth:   { checkPassword: "auth:checkPassword" },
};

// ── Mutable application state ────────────────────────────────────────
export const state = {
  activeCategory: 'all',
  convexEmojis: [],
  selectedFile: null,
};

// ── Derived data ─────────────────────────────────────────────────────

/** Merge hardcoded EMOJIS with dynamically loaded Convex emojis. */
export function getAllEmojis() {
  const mapped = state.convexEmojis.map((e, i) => ({
    name: e.name,
    category: e.category,
    path: e.url,
    ext: e.ext,
    id: EMOJIS.length + i + 1,
    isNew: true,
  }));
  return [...EMOJIS, ...mapped];
}
