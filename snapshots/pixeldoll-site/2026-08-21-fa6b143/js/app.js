// ── Entry point ──────────────────────────────────────────────
import * as K from './neorgon-avatar.js'
import { ui, load, setSpec, setName, save } from './state.js'
import { render } from './render.js'
import { bindEvents } from './events.js'
import { fromUrl } from './export.js'
import { $ } from './utils.js'

function init() {
  bindEvents()
  const restored = load()
  const shared = fromUrl()
  if (shared) {
    if (!restored) { setSpec(shared.spec); if (shared.name) setName(shared.name); save() }
    else {   // a link over an existing draft: offer, do not overwrite
      ui.shared = shared
      const bar = $('sharedBar'); if (bar) { bar.hidden = false; $('sharedImg').src = K.spriteDataUrl(shared.spec, 1); $('sharedName').textContent = shared.name || 'a character' }
    }
  }
  render()
  window.addEventListener('hashchange', () => { const s = fromUrl(); if (s) { setSpec(s.spec); if (s.name) setName(s.name); save(); render() } })
}
init()
