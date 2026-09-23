// events.js: every interaction, delegated on document. Mutations go through state.js, then render().
import * as K from './neorgon-avatar.js'
import { state, ui, setPart, setColor, setSpec, setName, save, debouncedSave, saveMyCharacter, myCharacter } from './state.js'
import { render, renderHero, renderActions, renderSecrets, renderTabs, renderGrid } from './render.js'
import { $, showToast } from './utils.js'
import { UNLOCKS, grant, tryCode, onShuffle, onNamedSave, konamiKey, isUnlocked } from './wardrobe.js'
import { copyCode, copyLink, downloadPng } from './export.js'

export function bindEvents() {
  document.addEventListener('click', onClick)
  document.addEventListener('input', onInput)
  document.addEventListener('keydown', onKeydown)
  $('secretForm')?.addEventListener('submit', e => { e.preventDefault(); submitCode() })
}

function onClick(e) {
  const t = e.target
  const tab = t.closest('[data-tab]'); if (tab) { ui.tab = tab.dataset.tab; renderTabs(); renderGrid(); return }
  const tile = t.closest('[data-part]')
  if (tile) {
    const [slot, id] = tile.dataset.part.split(':')
    const part = K.partOf(slot, id)
    if (part.unlock && !isUnlocked(part.unlock)) {
      const u = UNLOCKS.find(x => x.id === part.unlock)
      ui.secretsOpen = true; renderSecrets()
      showToast(`${part.name} is ${part.tier}. ${u ? u.hint : 'Locked.'}`)
      return
    }
    setPart(slot, id); debouncedSave(); render(); return
  }
  const sw = t.closest('[data-color]')
  if (sw) { const [key, hex] = sw.dataset.color.split(':'); setColor(key, hex); debouncedSave(); render(); return }
  const act = t.closest('[data-action]')
  if (act) runAction(act.dataset.action, act)
}

function runAction(action, el) {
  switch (action) {
    case 'shuffle': { setSpec(K.randomSpec(Math.random, ui.unlocked)); const fresh = onShuffle(); debouncedSave(); render(); if (fresh) celebrate('style'); break }
    case 'save-mine': { saveMyCharacter(); const fresh = onNamedSave(state.name); render(); showToast(state.name ? `${state.name} is now your character across Neorgon` : 'Saved as your character across Neorgon'); if (fresh) celebrate('charm'); break }
    case 'load-mine': { const m = myCharacter(); if (m) { setSpec(m); save(); render(); showToast('Loaded your saved character') } break }
    case 'copy-code': copyCode(); break
    case 'copy-link': copyLink(); break
    case 'png': downloadPng(Number(el.dataset.scale) || 16); break
    case 'reset': setSpec(K.seededSpec(state.name || 'pixeldoll', { shirt: '#ec4899' })); save(); render(); showToast('Back to the seeded look'); break
    case 'toggle-secrets': ui.secretsOpen = !ui.secretsOpen; renderSecrets(); if (ui.secretsOpen) $('secretCode')?.focus(); break
    case 'use-shared': if (ui.shared) { setSpec(ui.shared.spec); if (ui.shared.name) setName(ui.shared.name); ui.shared = null; $('sharedBar').hidden = true; save(); render(); showToast('Now editing the shared character') } break
    case 'dismiss-shared': ui.shared = null; $('sharedBar').hidden = true; break
    default: break
  }
}

function onInput(e) {
  const t = e.target
  if (t.id === 'charName') { setName(t.value); debouncedSave(); renderHero(); renderActions(); return }
  if (t.id === 'shirtColor') { setColor('shirt', t.value); debouncedSave(); render(); return }
}

function submitCode() {
  const inp = $('secretCode'); const v = inp?.value || ''
  const r = tryCode(v)
  if (!r) { showToast('Nothing opened. Keep looking.'); return }
  inp.value = ''
  if (r.fresh) celebrate(r.id); else showToast('Already unlocked.')
}

function onKeydown(e) {
  const src = e.target instanceof Element ? e.target : document.body
  if (src.closest('input, textarea, select')) return
  const r = konamiKey(e.key)
  if (r === true) celebrate('quest')
  else if (r === 'already') showToast('The quest wardrobe is already open.')
}

function celebrate(id) {
  const u = UNLOCKS.find(x => x.id === id)
  ui.secretsOpen = true
  render()
  showToast(`Unlocked: ${u ? u.name : id}. New parts are in the wardrobe.`, { duration: 3200 })
  setTimeout(() => { ui.freshUnlock = null; renderSecrets() }, 4000)
}
