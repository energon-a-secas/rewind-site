'use strict';

import { deepClone } from './utils.js';

/* ── Color palette ───────────────────────────────────────────────────── */
export const PALETTE = [
  '#7c3aed','#0063e5','#059669','#dc2626','#d97706',
  '#0891b2','#be185d','#65a30d','#9333ea','#f59e0b',
  '#1d4ed8','#15803d','#b45309','#7e22ce','#0e7490',
];

/* ── Preset templates ────────────────────────────────────────────────── */
export const TEMPLATES = {
  blameGame: {
    title: 'Blame Game', icon: '🎯', version: 2,
    winMessage: '🎯 {result} is to blame today!',
    segments: [
      { id:1,  emoji:'', text:'INFRA', color:'#0063e5', key:'I', message:"They took down prod with a config change|Their deployment pipeline is broken again|Their staging environment doesn't match prod" },
      { id:2,  emoji:'', text:'DBAs',  color:'#1E5ACC', key:'D', message:"Their ETL job failed silently for 3 days|They changed the schema without telling anyone|Their database is locked and nobody knows why" },
      { id:3,  emoji:'', text:'QA',    color:'#4BA3FF', key:'Q', message:"They found a critical bug 10 minutes before release|Their test environment has been down all week|They're still waiting on a test case from last sprint" },
      { id:4,  emoji:'', text:'DEVS',  color:'#8A4FFF', key:'V', message:"Their code works on their machine, nobody else's|They built something nobody asked for|They can't fix the bug because they can't reproduce it" },
      { id:5,  emoji:'', text:'PM',    color:'#5E3AA0', key:'P', message:"They scheduled a 4-hour retrospective during crunch|They want to stop and re-estimate the entire backlog|They blocked everyone waiting for a 1-line approval" },
      { id:6,  emoji:'', text:'CLOUD', color:'#00A8E1', key:'C', message:"Their service mesh decided to drop 30% of requests|They hit the rate limit on a free tier in production|Their load balancer routed all traffic to one dead pod" },
    ],
  },
  pizza: {
    title: 'What should we eat?', icon: '🍽️',
    winMessage: '🎉 {emoji} {result}!',
    segments: [
      { id:11, emoji:'🍕', text:'Pizza',   color:'#dc2626', message:'Pizza night! 🎊' },
      { id:12, emoji:'🍔', text:'Burgers', color:'#d97706', message:'' },
      { id:13, emoji:'🌮', text:'Tacos',   color:'#059669', message:'Taco Tuesday! 🌮' },
      { id:14, emoji:'🍜', text:'Ramen',   color:'#0891b2', message:'' },
      { id:15, emoji:'🍣', text:'Sushi',   color:'#9333ea', message:'' },
      { id:16, emoji:'🥗', text:'Salad',   color:'#65a30d', message:'Healthy choice! 💪' },
    ],
  },
};

export const DEFAULT_CONFIG = deepClone(TEMPLATES.blameGame);

/* ── Mutable shared state ────────────────────────────────────────────── */
export const state = {
  config: deepClone(DEFAULT_CONFIG),
  currentRotation: 0,
  spinning: false,
  nextId: 100,
  settingsOpen: false,
  helpOpen: false,
};

/* ── Serialization / sharing ─────────────────────────────────────────── */
export function encodeConfig(cfg) {
  try { return btoa(encodeURIComponent(JSON.stringify(cfg))); }
  catch { return null; }
}

export function decodeConfig(str) {
  try { return JSON.parse(decodeURIComponent(atob(str))); }
  catch { return null; }
}

export function saveToStorage() {
  try { localStorage.setItem('wheelConfig', JSON.stringify(state.config)); } catch {}
}

export function loadFromStorage() {
  try {
    const raw = localStorage.getItem('wheelConfig');
    if (raw) { const c = JSON.parse(raw); if (isValidConfig(c)) return c; }
  } catch {}
  return null;
}

export function isValidConfig(c) {
  return c && typeof c.title === 'string' && Array.isArray(c.segments) && c.segments.length >= 2;
}

export function loadFromURL() {
  const hash = location.hash;
  if (hash.startsWith('#c=')) {
    const decoded = decodeConfig(hash.slice(3));
    if (isValidConfig(decoded)) return decoded;
  }
  return null;
}

export function nextPaletteColor() {
  return PALETTE[state.config.segments.length % PALETTE.length];
}
