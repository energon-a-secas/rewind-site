// ── State management + Convex client ─────────────────────────────────
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";

const CONVEX_URL = "https://good-fly-718.convex.cloud";
export const convex = new ConvexHttpClient(CONVEX_URL);

export const api = {
  quests: {
    list: "quests:list",
    create: "quests:create",
    createRequest: "quests:createRequest",
    approveQuest: "quests:approveQuest",
    updateToolSuggestions: "quests:updateToolSuggestions",
    accept: "quests:accept",
    complete: "quests:complete",
    seedIfEmpty: "quests:seedIfEmpty",
  },
  auth: { register: "auth:register", login: "auth:login" },
};

const AUTH_USER_KEY = "guild-hall-user";
const AUTH_ROLE_KEY = "guild-hall-role";
const POOGIE_KEY = "guild-hall-poogie";
const VISIT_KEY = "guild-hall-visits";

export const state = {
  quests: [],
  filterRank: "all",
  filterStatus: "all",
  filterCategory: "all",
  poogiePets: 0,
  visits: 0,
  convexReady: false,
};

export function loadSaved(s) {
  try {
    s.poogiePets = parseInt(localStorage.getItem(POOGIE_KEY) || "0", 10);
    s.visits = parseInt(localStorage.getItem(VISIT_KEY) || "0", 10) + 1;
    localStorage.setItem(VISIT_KEY, String(s.visits));
  } catch { /* ignore */ }
}

export function setQuestsFromConvex(quests) {
  state.quests = (quests || []).map((q) => ({
    ...q,
    id: q._id,
  }));
  state.convexReady = true;
}

export function savePoogie(count) {
  localStorage.setItem(POOGIE_KEY, String(count));
}

export function getLoggedInUser() {
  return localStorage.getItem(AUTH_USER_KEY) || null;
}

export function setLoggedInUser(username) {
  if (username) localStorage.setItem(AUTH_USER_KEY, username);
  else localStorage.removeItem(AUTH_USER_KEY);
}

export function getUserRole() {
  return localStorage.getItem(AUTH_ROLE_KEY) || "hunter";
}

export function setUserRole(role) {
  if (role && role !== "hunter") localStorage.setItem(AUTH_ROLE_KEY, role);
  else localStorage.removeItem(AUTH_ROLE_KEY);
}
