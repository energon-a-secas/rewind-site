// utils.js: the DOM kit plus a few helpers. See js/neorgon-dom.js (vendored).
export { escHtml, debounce, clamp, uid, showToast, copyText, downloadBlob, downloadText } from './neorgon-dom.js'
const _els = {}
export function $(id) { return _els[id] || (_els[id] = document.getElementById(id)) }
export function b64urlEncode(str) { const bytes = new TextEncoder().encode(str); let bin = ''; bytes.forEach(b => { bin += String.fromCharCode(b) }); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') }
export const today = () => new Date().toISOString().slice(0, 10)
