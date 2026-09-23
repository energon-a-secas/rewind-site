// ════════════════════════════════════════════════════════════
//  render.js: the studio. Hero preview at 8x plus the sizes other sites
//  use, the wardrobe (one tab per slot, tiles drawn as the current
//  character wearing each part, locked tiles badged by tier), colour rows,
//  the actions column and the secrets panel.
// ════════════════════════════════════════════════════════════
import * as K from './neorgon-avatar.js'
import { state, ui, myCharacter, isMine } from './state.js'
import { $, escHtml } from './utils.js'
import { UNLOCKS, partsOf, isUnlocked, unlockedCount } from './wardrobe.js'
import { code } from './export.js'

const SLOT_LABELS = { kind: 'Kind', hair: 'Hair', eyes: 'Eyes', face: 'Face', outfit: 'Outfit', head: 'Head', accessory: 'Extras', held: 'Held', pet: 'Pet' }
const TIER_LABEL = { rare: 'Rare', legendary: 'Legendary' }

export function render() {
  renderHero(); renderTabs(); renderGrid(); renderColors(); renderActions(); renderSecrets()
  document.title = (state.name ? state.name + ' · ' : '') + 'Pixeldoll | Pixel Character Builder'
}

export function renderHero() {
  const c = $('hero'); if (c) { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); K.drawSprite(ctx, state.spec, { scale: 8 }) }
  const url = K.spriteDataUrl(state.spec, 1)
  $('size64').src = url; $('size32').src = url; $('size16').src = url
  const name = $('charName'); if (name && document.activeElement !== name) name.value = state.name
  const seatName = $('seatName'); if (seatName) seatName.textContent = state.name || 'You'
  const codeEl = $('codeOut'); if (codeEl) codeEl.textContent = code()
}

export function renderTabs() {
  const el = $('tabs'); if (!el) return
  el.innerHTML = K.SLOTS.map(slot => {
    const locked = K.CATALOG[slot].filter(p => p.unlock && !isUnlocked(p.unlock)).length
    return `<button type="button" role="tab" class="tab${ui.tab === slot ? ' is-active' : ''}" data-tab="${slot}" aria-selected="${ui.tab === slot}">${SLOT_LABELS[slot]}${locked ? `<i class="tab-lock" title="${locked} locked">${locked}</i>` : ''}</button>`
  }).join('')
}

export function renderGrid() {
  const el = $('grid'); if (!el) return
  const slot = ui.tab
  const parts = K.CATALOG[slot]
  el.innerHTML = parts.map(p => {
    const variant = { ...state.spec, [slot]: p.id }
    if (slot === 'kind') { /* kinds show in their own skin */ }
    const locked = p.unlock && !isUnlocked(p.unlock)
    const active = state.spec[slot] === p.id
    return `<button type="button" class="tile${active ? ' is-active' : ''}${locked ? ' is-locked' : ''} tier-${p.tier}" data-part="${slot}:${p.id}" title="${escHtml(p.name)}${locked ? ' (locked)' : ''}" aria-pressed="${active}">
      <img src="${K.spriteDataUrl(variant, 1)}" width="48" height="48" alt="" class="px">
      <span class="tile-name">${escHtml(p.name)}</span>
      ${p.tier !== 'common' ? `<span class="tier-badge tier-badge--${p.tier}">${TIER_LABEL[p.tier]}</span>` : ''}
      ${locked ? '<span class="lock" aria-hidden="true">🔒</span>' : ''}
    </button>`
  }).join('')
  const hint = $('gridHint'); if (hint) {
    const lockedHere = parts.filter(p => p.unlock && !isUnlocked(p.unlock))
    hint.textContent = lockedHere.length ? `${lockedHere.length} locked here. Secrets opens the how.` : ''
  }
}

export function renderColors() {
  const el = $('colors'); if (!el) return
  const s = state.spec
  const sw = (key, colors, cur) => colors.map(c => `<button type="button" class="swatch${cur === c ? ' is-active' : ''}" data-color="${key}:${c}" style="--sw:${c}" aria-label="${key} ${c}" title="${c}"></button>`).join('')
  const rows = []
  if (s.kind === 'person' || s.kind === 'alien') rows.push(`<div class="crow"><span>Skin</span>${sw('skin', K.SKIN, s.skin)}</div>`)
  if (s.kind === 'person') rows.push(`<div class="crow"><span>Hair</span>${sw('hairColor', K.HAIR_COLORS, s.hairColor)}</div>`)
  if (s.kind === 'cat' || s.kind === 'dog') rows.push(`<div class="crow"><span>Coat</span>${sw('coat', K.COAT, s.coat)}</div>`)
  rows.push(`<div class="crow"><span>Shirt</span>${sw('shirt', ['#64748b', '#ec4899', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f97316', '#2dd4bf', '#f43f5e', '#e5e7eb', '#111827'], s.shirt)}<input type="color" id="shirtColor" value="${escHtml(s.shirt)}" aria-label="Any shirt colour" title="Any colour"></div>`)
  el.innerHTML = rows.join('')
}

export function renderActions() {
  const mine = myCharacter()
  const status = $('mineStatus'); if (status) {
    status.innerHTML = mine
      ? (isMine() ? `<img src="${K.spriteDataUrl(mine, 1)}" width="24" height="24" alt="" class="px"> This is your character across Neorgon${state.savedAt ? ` · saved ${escHtml(state.savedAt.slice(0, 10))}` : ''}.`
        : `<img src="${K.spriteDataUrl(mine, 1)}" width="24" height="24" alt="" class="px"> Your saved character differs from this draft. <button type="button" class="linkish" data-action="load-mine">Load it</button> or save this one.`)
      : 'No character saved yet. Save one and Floorplan (and every Neorgon site) can use it.'
  }
  const saveBtn = $('saveMine'); if (saveBtn) saveBtn.textContent = mine && isMine() ? 'Saved as my character ✓' : 'Save as my character'
  const badge = $('secretsBadge'); if (badge) badge.textContent = `${unlockedCount()}/${UNLOCKS.length}`
}

export function renderSecrets() {
  const el = $('secrets'); if (!el) return
  el.hidden = !ui.secretsOpen
  $('secretsBtn')?.setAttribute('aria-pressed', String(ui.secretsOpen))
  const list = $('secretsList'); if (!list) return
  list.innerHTML = UNLOCKS.map(u => {
    const got = isUnlocked(u.id)
    const parts = partsOf(u.id)
    return `<li class="secret${got ? ' is-got' : ''}${ui.freshUnlock === u.id ? ' is-fresh' : ''}">
      <div class="secret-head"><strong>${escHtml(u.name)}</strong><span class="secret-state">${got ? 'unlocked' : 'locked'}</span></div>
      <div class="secret-parts">${parts.map(p => `<img src="${K.spriteDataUrl({ ...state.spec, kind: p.slot === 'kind' ? p.id : (state.spec.kind === 'ghost' || state.spec.kind === 'alien' ? 'person' : state.spec.kind), [p.slot]: p.id }, 1)}" width="32" height="32" alt="${escHtml(p.name)}" title="${escHtml(p.name)}" class="px${got ? '' : ' is-dim'}">`).join('')}</div>
      <div class="secret-hint">${got ? parts.map(p => p.name).join(', ') : escHtml(u.hint)}</div>
    </li>`
  }).join('')
}
