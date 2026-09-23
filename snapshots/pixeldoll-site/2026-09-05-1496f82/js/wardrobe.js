// ════════════════════════════════════════════════════════════
//  wardrobe.js: how rare parts are earned. Six unlock ids, each with a
//  hint and a trigger: a shuffle streak, a named save, the old console
//  code, or a word typed into the secret field. Unlocks persist in the
//  neo_unlocks cookie (kit), so Floorplan and any future site see them.
//  Nothing here gates rendering: a locked part still draws if a spec
//  carries it; only the picker refuses to select it.
// ════════════════════════════════════════════════════════════
import * as K from './neorgon-avatar.js'
import { ui } from './state.js'

export const UNLOCKS = [
  { id: 'style', name: 'Restless', hint: 'Shuffle ten times in one sitting.', how: 'shuffle' },
  { id: 'charm', name: 'Charming', hint: 'Give your character a name and save it as yours.', how: 'save' },
  { id: 'quest', name: 'Questing', hint: 'An old code from an older console: up, up, down, down, left, right, left, right, B, A.', how: 'konami' },
  { id: 'royal', name: 'Royal', hint: 'The family name, typed into the secret field.', how: 'code' },
  { id: 'spectral', name: 'Spectral', hint: 'Type what a ghost says.', how: 'code' },
  { id: 'visitor', name: 'Visitor', hint: 'Three letters every sky-watcher knows.', how: 'code' },
]
const CODES = { neorgon: 'royal', boo: 'spectral', ufo: 'visitor', konami: 'quest', 'up up down down left right left right b a': 'quest' }

export const partsOf = id => K.SLOTS.flatMap(slot => K.CATALOG[slot].filter(p => p.unlock === id).map(p => ({ slot, ...p })))
export const isUnlocked = id => ui.unlocked.has(id)
export const unlockedCount = () => UNLOCKS.filter(u => ui.unlocked.has(u.id)).length

/** Grant an unlock; returns true when it was new. */
export function grant(id) {
  if (!K.UNLOCK_IDS.includes(id) || ui.unlocked.has(id)) return false
  ui.unlocked.add(id)
  K.writeUnlocks(ui.unlocked)
  ui.freshUnlock = id
  return true
}
export function tryCode(text) {
  const t = String(text || '').trim().toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ')
  const id = CODES[t]
  return id ? { id, fresh: grant(id) } : null
}
export function onShuffle() { ui.shuffles++; return ui.shuffles >= 10 ? grant('style') : false }
export function onNamedSave(name) { return name && name.trim() ? grant('charm') : false }

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
let pos = 0
export function konamiKey(key) {
  const k = key.length === 1 ? key.toLowerCase() : key
  pos = k === KONAMI[pos] ? pos + 1 : (k === KONAMI[0] ? 1 : 0)
  if (pos === KONAMI.length) { pos = 0; return grant('quest') || 'already' }
  return false
}
