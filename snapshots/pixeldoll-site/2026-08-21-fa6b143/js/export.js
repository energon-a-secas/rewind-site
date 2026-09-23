// export.js: codes, links, PNG. The code is the kit's; the link is this site's #c= contract.
import * as K from './neorgon-avatar.js'
import { state } from './state.js'
import { copyText, downloadBlob, showToast } from './utils.js'

export const code = () => K.specToCode(state.spec)
export function link() {
  const q = state.name ? `&name=${encodeURIComponent(state.name)}` : ''
  return location.origin + location.pathname + '#c=' + encodeURIComponent(code()) + q
}
export function copyCode() { copyText(code()).then(ok => showToast(ok ? 'Code copied. Paste it into Floorplan or any Neorgon site that takes one' : 'Clipboard blocked')) }
export function copyLink() { copyText(link()).then(ok => showToast(ok ? 'Link copied' : 'Clipboard blocked')) }
export function downloadPng(scale = 16) {
  const c = document.createElement('canvas'); c.width = K.SIZE * scale; c.height = K.SIZE * scale
  K.drawSprite(c.getContext('2d'), state.spec, { scale })
  c.toBlob(blob => { if (!blob) { showToast('PNG failed'); return } downloadBlob(blob, `${(state.name || 'character').toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'character'}-${K.SIZE * scale}.png`); showToast(`PNG ${K.SIZE * scale}px downloaded`) }, 'image/png')
}
/** Read #c= (and &name=) from the URL. */
export function fromUrl() {
  const m = location.hash.match(/[#&]c=([^&]+)/)
  if (!m) return null
  const spec = K.codeToSpec(decodeURIComponent(m[1]))
  const n = location.hash.match(/[#&]name=([^&]+)/)
  return spec ? { spec, name: n ? decodeURIComponent(n[1]) : '' } : null
}
