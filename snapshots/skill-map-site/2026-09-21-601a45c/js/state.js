// Raw localStorage throws in private browsing, where the object exists but
// every access raises. These wrappers return a fallback instead. Storage
// keys and formats are unchanged, so existing saved data still loads.
import { safeRemove, safeSet } from './neorgon-persist.js';

// Convex client and state management
import { ConvexHttpClient } from "https://esm.sh/convex@1.21.0/browser";

// Convex API string references
export const api = {
  auth: {
    register: "auth:register",
    login: "auth:login",
    getRole: "auth:getRole",
    setRole: "auth:setRole",
  },
  roadmaps: {
    list: "roadmaps:list",
    get: "roadmaps:get",
    save: "roadmaps:save",
    delete: "roadmaps:deleteRoadmap",
  },
  shareLinks: {
    create: "shareLinks:create",
    getByToken: "shareLinks:getByToken",
    disable: "shareLinks:disable",
  },
  gamification: {
    addSkill: "gamification:addSkill",
    getSkill: "gamification:getSkill",
    listSkills: "gamification:listSkills",
    updateSkill: "gamification:updateSkill",
    logSession: "gamification:logSession",
    getUserBadges: "gamification:getUserBadges",
    checkAndAwardBadges: "gamification:checkAndAwardBadges",
    // Enhanced with badge progress
    getBadgeProgress: "seedBadges:getBadgeProgress",
  },
  icons: {
    // Category management
    createCategory: "icons:createCategory",
    listCategories: "icons:listCategories",
    deleteCategory: "icons:deleteCategory",
    seedPresetCategories: "icons:seedPresetCategories",
    // Icon management
    getUploadUrl: "icons:getUploadUrl",
    saveIcon: "icons:saveIcon",
    listIcons: "icons:listIcons",
    deleteIcon: "icons:deleteIcon",
    // User picker
    getIconsForPicker: "icons:getIconsForPicker",
  },
};

// Convex client
export const convex = new ConvexHttpClient(
  import.meta.env?.CONVEX_URL || "https://tremendous-spoonbill-534.convex.cloud"
);

// Authentication state
export const auth = {
  username: null,
  role: null,
  isAuthenticated: false,
};

// Local application state (original data model)
export const state = {
  title: "Untitled Map",
  columns: [],
  nodes: [],
  edges: [],
  colorLegend: {
    "#ef4444": "blocks",
    "#0080ff": "informs",
    "#8b5cf6": "enhances",
    "#22c55e": "enables",
    "#f59e0b": "prepares",
  },
  markerLegend: {
    crown: "Milestone",
    star: "Goal",
    flame: "Hot",
    heart: "Fun",
  },
};

// Application UI state
export const ui = {
  connectionMode: null, // { fromNodeId, fromPort, tempLine }
  pointerDrag: null, // { nodeId, ghost, dropColId, dropLaneId, dropBeforeId }
  selectedNode: null,
  activeModal: null,
};

// Gamification state
export const gamification = {
  skills: [], // Array of skill objects with XP, level, streaks
  badges: [], // Array of earned badges
  totalXP: 0, // Global user XP
  userLevel: 1, // Global user level
};

// App state (roadmaps, sharing, etc)
export const app = {
  currentRoadmapId: null, // Currently loaded roadmap ID
};


// ============== LocalStorage Helpers ==============

export function saveState() {
  const data = JSON.stringify({
    title: state.title,
    columns: state.columns,
    nodes: state.nodes,
    edges: state.edges,
    colorLegend: state.colorLegend,
    markerLegend: state.markerLegend,
    version: 2,
  });
  safeSet("skillTreeData", data);
}

export function loadState() {
  const saved = localStorage.getItem("skillTreeData");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(state, migrateState(parsed));
      return true;
    } catch (e) {
      console.error("Failed to load saved state:", e);
    }
  }
  return false;
}

export function clearState() {
  safeRemove("skillTreeData");
}

// ============== State Migration ==============

function migrateState(parsed) {
  const data = { ...parsed };

  // Migration v0 → v1: Add lanes to columns
  if (!data.columns?.[0]?.lanes) {
    data.columns = data.columns.map((col) => ({
      ...col,
      lanes: col.lanes || [{ id: `lane-${col.id}-1`, name: "Path 1" }],
    }));

    // Add laneId to nodes
    data.nodes = data.nodes.map((node, i) => ({
      ...node,
      laneId: node.laneId || data.columns.find((c) => c.id === node.columnId)?.lanes?.[0]?.id || `lane-${node.columnId}-1`,
    }));
  }

  // Migration v1 → v2: Add rowSpan to nodes
  if (data.nodes && !data.nodes[0].hasOwnProperty("rowSpan")) {
    data.nodes = data.nodes.map((node) => ({
      ...node,
      rowSpan: 1,
    }));
  }

  return data;
}

// ============== State Helpers ==============

export function defaultState() {
  return JSON.parse(JSON.stringify(state));
}

export function blankState() {
  return {
    title: "Untitled Map",
    columns: [],
    nodes: [],
    edges: [],
    colorLegend: { ...state.colorLegend },
    markerLegend: { ...state.markerLegend },
    version: 2,
  };
}

export function resetState() {
  Object.assign(state, blankState());
}

// ============== Authentication Helpers ==============

export function saveAuth(username, role) {
  auth.username = username;
  auth.role = role;
  auth.isAuthenticated = true;
  safeSet("skillmap-user", JSON.stringify({ username, role }));
}

export function loadAuth() {
  const saved = localStorage.getItem("skillmap-user");
  if (saved) {
    try {
      const { username, role } = JSON.parse(saved);
      auth.username = username;
      auth.role = role;
      auth.isAuthenticated = !!username;
      return true;
    } catch (e) {
      console.error("Failed to load auth:", e);
    }
  }
  return false;
}

export function clearAuth() {
  auth.username = null;
  auth.role = null;
  auth.isAuthenticated = false;
  safeRemove("skillmap-user");
}

// ============== Data Lookup Helpers ==============

export function getNode(nodeId) {
  return state.nodes.find((n) => n.id === nodeId);
}

export function getColumn(columnId) {
  return state.columns.find((c) => c.id === columnId);
}

export function getLane(columnId, laneId) {
  const col = getColumn(columnId);
  return col?.lanes.find((l) => l.id === laneId);
}

export function nodesInLane(columnId, laneId) {
  return state.nodes.filter((n) => n.columnId === columnId && n.laneId === laneId);
}

export function nodesInColumn(columnId) {
  return state.nodes.filter((n) => n.columnId === columnId);
}

export function getEdge(edgeId) {
  return state.edges.find((e) => e.id === edgeId);
}

export function getEdgesForNode(nodeId) {
  return state.edges.filter((e) => e.from === nodeId || e.to === nodeId);
}

export function getIncomingEdges(nodeId) {
  return state.edges.filter((e) => e.to === nodeId);
}

export function getOutgoingEdges(nodeId) {
  return state.edges.filter((e) => e.from === nodeId);
}

export function getNextNodeId() {
  const maxId = state.nodes.reduce((max, node) => {
    const num = parseInt(node.id.replace("n-", ""));
    return Math.max(max, num);
  }, 0);
  return `n-${maxId + 1}`;
}

export function getNextColumnId() {
  const maxId = state.columns.reduce((max, col) => {
    const num = parseInt(col.id.replace("col-", ""));
    return Math.max(max, num);
  }, 0);
  return `col-${maxId + 1}`;
}

export function getNextEdgeId() {
  const maxId = state.edges.reduce((max, edge) => {
    const num = parseInt(edge.id.replace("edge-", ""));
    return Math.max(max, num);
  }, 0);
  return `edge-${maxId + 1}`;
}

// ============== XP & Leveling Helpers ==============

export function calculateXPForLevel(level) {
  return level * 100 + level * level * 10;
}

export function xpToNextLevel(currentXP, currentLevel) {
  const needed = calculateXPForLevel(currentLevel);
  return Math.max(0, needed - currentXP);
}

export function calculateLevelFromXP(xp) {
  let level = 1;
  while (xp >= calculateXPForLevel(level) && level < 100) {
    level++;
  }
  return level;
}

export function addXPGained(skillId, xpGained) {
  const skill = gamification.skills.find((s) => s.id === skillId);
  if (skill) {
    const oldLevel = skill.level;
    skill.xp += xpGained;
    skill.level = calculateLevelFromXP(skill.xp);

    // Return level up info
    return {
      leveledUp: skill.level > oldLevel,
      oldLevel,
      newLevel: skill.level,
      xpToNext: xpToNextLevel(skill.xp, skill.level),
    };
  }
  return null;
}
