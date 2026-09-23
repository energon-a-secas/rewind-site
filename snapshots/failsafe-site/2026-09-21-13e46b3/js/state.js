// Raw localStorage throws in private browsing, where the object exists but
// every access raises. These wrappers return a fallback instead. Storage
// keys and formats are unchanged, so existing saved data still loads.
import { safeSet } from './neorgon-persist.js';

const STORAGE_KEY = 'failsafe-v1';

export const state = {
  protocols: [],
  activeProtocolId: null,
  activeStepId: null,
  view: 'dashboard'
};

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.protocols) s.protocols = saved.protocols;
    }
  } catch { /* ignore corrupt data */ }
}

export function save(s) {
  safeSet(STORAGE_KEY, JSON.stringify({ protocols: s.protocols }));
}

export function getProtocol(s) {
  return s.protocols.find(p => p.id === s.activeProtocolId) || null;
}

export function getStep(s) {
  const proto = getProtocol(s);
  if (!proto) return null;
  return proto.steps.find(st => st.id === s.activeStepId) || null;
}
