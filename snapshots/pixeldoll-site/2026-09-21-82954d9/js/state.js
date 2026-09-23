// ════════════════════════════════════════════════════════════
//  state.js: the draft character (spec + name) and the transient ui.
//  The draft lives in localStorage; "my character" lives in the fleet
//  cookie (kit), which is what every other Neorgon site reads.
// ════════════════════════════════════════════════════════════
import * as K from './neorgon-avatar.js'
import { debounce } from './utils.js'

export const STORAGE_KEY = 'pixeldoll-v1'
export const state = { spec: K.seededSpec('pixeldoll', { shirt: '#ec4899' }), name: '', savedAt: null }
export const ui = { tab: 'kind', unlocked: K.readUnlocks(), shuffles: 0, secretsOpen: false, freshUnlock: null, shared: null }

export function setPart(slot, id) { if (K.CATALOG[slot]?.some(p => p.id === id)) { state.spec = K.normalizeSpec({ ...state.spec, [slot]: id }) } }
export function setColor(key, hex) { state.spec = K.normalizeSpec({ ...state.spec, [key]: hex }) }
export function setSpec(spec) { state.spec = K.normalizeSpec(spec) }
export function setName(n) { state.name = String(n ?? '').trim().slice(0, 40) }

export function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ spec: state.spec, name: state.name, savedAt: state.savedAt, shuffles: ui.shuffles })) } catch { /* fine */ } }
export const debouncedSave = debounce(save, 250)
export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return false
    const d = JSON.parse(raw)
    if (d.spec) state.spec = K.normalizeSpec(d.spec)
    state.name = String(d.name || '').slice(0, 40)
    state.savedAt = d.savedAt || null
    ui.shuffles = Number(d.shuffles) || 0
    return true
  } catch { return false }
}

/** Make the draft the visitor's character everywhere on *.neorgon.com. */
export function saveMyCharacter() { K.writeCharacter(state.spec); state.savedAt = new Date().toISOString(); save() }
export function myCharacter() { return K.readCharacter() }
export function isMine() { const m = K.readCharacter(); return !!m && K.specToCode(m) === K.specToCode(state.spec) }
