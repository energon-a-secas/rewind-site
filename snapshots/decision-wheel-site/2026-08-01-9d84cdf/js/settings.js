'use strict';

import { state, PALETTE, TEMPLATES, DEFAULT_CONFIG, encodeConfig, saveToStorage } from './state.js';
import { deepClone, toast } from './utils.js';
import { drawWheel } from './wheel.js';

/* ── Apply config to visible UI ──────────────────────────────────────── */
export function applyConfigToUI() {
  document.getElementById('display-title').textContent = state.config.title;
  document.getElementById('display-icon').textContent  = state.config.icon;
  document.getElementById('header-title').textContent  = state.config.title;
  drawWheel(state.currentRotation);
}

/* ── Toggle settings drawer ──────────────────────────────────────────── */
export function toggleSettings() {
  state.settingsOpen = !state.settingsOpen;
  const drawer = document.getElementById('settings-drawer');
  drawer.classList.toggle('closed', !state.settingsOpen);
  if (state.settingsOpen) renderSettingsForm();
}

/* ── Render the settings form ────────────────────────────────────────── */
export function renderSettingsForm() {
  /* Populate header fields */
  document.getElementById('cfg-icon').value = state.config.icon || '🎡';
  document.getElementById('cfg-title').value = state.config.title || '';
  document.getElementById('cfg-win-msg').value = state.config.winMessage || '🎉 {emoji} {result}!';

  /* Render segment rows */
  const list = document.getElementById('segments-list');
  list.innerHTML = '';
  state.config.segments.forEach(seg => {
    list.appendChild(buildSegmentRow(seg));
  });
  document.getElementById('seg-count').textContent = state.config.segments.length;
}

/* ── Build a single segment row ──────────────────────────────────────── */
function buildSegmentRow(seg) {
  const wrap = document.createElement('div');
  wrap.dataset.id = seg.id;

  const row = document.createElement('div');
  row.className = 'segment-row';

  const emojiInput = document.createElement('input');
  emojiInput.className = 'seg-emoji-input';
  emojiInput.type = 'text';
  emojiInput.maxLength = 4;
  emojiInput.placeholder = '🎯';
  emojiInput.value = seg.emoji || '';
  emojiInput.title = 'Emoji for this option';
  emojiInput.setAttribute('aria-label', 'Emoji for this option');

  const textInput = document.createElement('input');
  textInput.className = 'seg-text-input form-input';
  textInput.type = 'text';
  textInput.placeholder = 'Option text';
  textInput.value = seg.text || '';
  textInput.setAttribute('aria-label', 'Option text');

  const colorInput = document.createElement('input');
  colorInput.className = 'seg-color-input';
  colorInput.type = 'color';
  colorInput.value = seg.color || '#7c3aed';
  colorInput.title = 'Option color';
  colorInput.setAttribute('aria-label', 'Option color');

  const msgToggle = document.createElement('button');
  msgToggle.className = 'btn-seg-msg-toggle' + (seg.message ? ' has-msg' : '');
  msgToggle.title = 'Set a result message for this option';
  msgToggle.setAttribute('aria-label', 'Set a result message for this option');
  msgToggle.textContent = '💬';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-seg-delete';
  deleteBtn.title = 'Remove option';
  deleteBtn.setAttribute('aria-label', 'Remove option');
  deleteBtn.innerHTML = '×';
  deleteBtn.addEventListener('click', () => {
    if (state.config.segments.length <= 2) { toast('⚠️ The wheel needs at least 2 options'); return; }
    state.config.segments = state.config.segments.filter(s => s.id !== seg.id);
    wrap.remove();
    document.getElementById('seg-count').textContent = state.config.segments.length;
    drawWheel(state.currentRotation);
  });

  row.append(emojiInput, textInput, colorInput, msgToggle, deleteBtn);

  /* Message sub-row */
  const msgRow = document.createElement('div');
  msgRow.className = 'seg-msg-row' + (seg.message ? ' open' : '');
  const msgInput = document.createElement('input');
  msgInput.className = 'seg-msg-input';
  msgInput.type = 'text';
  msgInput.placeholder = 'Message when selected. Use | to separate alternatives';
  msgInput.value = seg.message || '';
  msgRow.appendChild(msgInput);

  msgToggle.addEventListener('click', () => {
    msgRow.classList.toggle('open');
    msgToggle.classList.toggle('has-msg', msgRow.classList.contains('open'));
  });

  /* Live update segment on input */
  [emojiInput, textInput, colorInput, msgInput].forEach(el => {
    el.addEventListener('input', () => {
      seg.emoji   = emojiInput.value.trim();
      seg.text    = textInput.value;
      seg.color   = colorInput.value;
      seg.message = msgInput.value;
      drawWheel(state.currentRotation);
    });
  });

  wrap.append(row, msgRow);
  return wrap;
}

/* ── Add a new segment ───────────────────────────────────────────────── */
export function addSegment() {
  const seg = {
    id: ++state.nextId,
    emoji: '',
    text: 'Option ' + (state.config.segments.length + 1),
    color: PALETTE[state.config.segments.length % PALETTE.length],
    message: '',
  };
  state.config.segments.push(seg);
  const list = document.getElementById('segments-list');
  list.appendChild(buildSegmentRow(seg));
  document.getElementById('seg-count').textContent = state.config.segments.length;
  drawWheel(state.currentRotation);
  /* Scroll to new row */
  list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Apply & save settings ───────────────────────────────────────────── */
export function applySettings() {
  state.config.icon       = document.getElementById('cfg-icon').value.trim() || '🎡';
  state.config.title      = document.getElementById('cfg-title').value.trim() || 'Decision Wheel';
  state.config.winMessage = document.getElementById('cfg-win-msg').value || '🎉 {emoji} {result}!';
  /* Segments are live-updated on input, but re-read for safety */
  document.getElementById('settings-drawer').querySelectorAll('[data-id]').forEach(wrap => {
    const id = parseInt(wrap.dataset.id);
    const seg = state.config.segments.find(s => s.id === id);
    if (!seg) return;
    seg.emoji   = wrap.querySelector('.seg-emoji-input').value.trim();
    seg.text    = wrap.querySelector('.seg-text-input').value;
    seg.color   = wrap.querySelector('.seg-color-input').value;
    seg.message = wrap.querySelector('.seg-msg-input').value;
  });
  applyConfigToUI();
  saveToStorage();
  /* Write URL hash for bookmarking */
  const encoded = encodeConfig(state.config);
  if (encoded) history.replaceState(null, '', '#c=' + encoded);
  toggleSettings();
  toast('✓ Settings saved');
}

/* ── Copy share link ─────────────────────────────────────────────────── */
export function copyShareLink() {
  const encoded = encodeConfig(state.config);
  if (!encoded) return;
  const url = location.origin + location.pathname + '#c=' + encoded;
  navigator.clipboard.writeText(url).then(() => {
    toast('🔗 Share link copied!');
  }).catch(() => {
    toast('⚠️ Copy failed. Select the URL and copy it yourself');
  });
}

/* ── Load a template ─────────────────────────────────────────────────── */
export function loadTemplate(name) {
  if (!TEMPLATES[name]) return;
  state.config = deepClone(TEMPLATES[name]);
  applyConfigToUI();
  saveToStorage();
  renderSettingsForm();
  history.replaceState(null, '', location.pathname);
  toast('✓ Loaded: ' + state.config.title);
}

/* ── Reset to default ────────────────────────────────────────────────── */
export function resetToDefault() {
  if (!confirm('Reset all options to the Blame Game template?')) return;
  state.config = deepClone(DEFAULT_CONFIG);
  applyConfigToUI();
  saveToStorage();
  renderSettingsForm();
  history.replaceState(null, '', location.pathname);
}
