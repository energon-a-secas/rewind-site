'use strict';

import { state } from './state.js';
import { escHtml, segmentKey, toast } from './utils.js';
import { canvas, spin, spinToTarget, closeResult } from './wheel.js';
import { toggleSettings } from './settings.js';

/* ── Help menu ───────────────────────────────────────────────────────── */
function renderHelpShortcuts() {
  const container = document.getElementById('help-rig-rows');
  container.innerHTML = '';
  state.config.segments.forEach(seg => {
    const row = document.createElement('div');
    row.className = 'help-row';
    row.innerHTML = `<span>${escHtml(seg.emoji || '')} ${escHtml(seg.text)}</span><kbd class="help-key">${escHtml(segmentKey(seg))}</kbd>`;
    container.appendChild(row);
  });
}

export function toggleHelpMenu() {
  state.helpOpen = !state.helpOpen;
  const menu = document.getElementById('help-menu');
  menu.classList.toggle('show', state.helpOpen);
  if (state.helpOpen) {
    renderHelpShortcuts();
    /* Close on next outside click */
    setTimeout(() => {
      document.addEventListener('click', function closeHelp(e) {
        if (!menu.contains(e.target) && !e.target.closest('.help-button')) {
          state.helpOpen = false;
          menu.classList.remove('show');
        }
        document.removeEventListener('click', closeHelp);
      });
    }, 0);
  }
}

/* ── Explosion easter egg ────────────────────────────────────────────── */
export function triggerExplosion() {
  const overlay = document.getElementById('explosion-overlay');
  const container = document.getElementById('explosion-particles');
  container.innerHTML = '';
  const colors = ['#0063e5','#4BA3FF','#8A4FFF','#00A8E1','#ffffff','#a78bfa'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const dist  = 100 + Math.random() * 300;
    p.style.cssText = `
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
      animation-delay: ${Math.random() * 0.1}s;
      width: ${4 + Math.random() * 10}px;
      height: ${4 + Math.random() * 10}px;
    `;
    container.appendChild(p);
  }
  overlay.classList.add('show');
}

export function closeExplosion() {
  document.getElementById('explosion-overlay').classList.remove('show');
}

/* ── Bind all event listeners ────────────────────────────────────────── */
export function bindEvents() {
  /* Canvas click/touch → spin */
  canvas.addEventListener('click', () => spin());
  canvas.style.cursor = 'pointer';

  /* Keyboard: Space/Enter = spin, 8 = explosion, letter keys = rig spin */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    /* Close explosion on any key */
    const explosionOverlay = document.getElementById('explosion-overlay');
    if (explosionOverlay.classList.contains('show')) { closeExplosion(); return; }
    if (e.key === '8') { triggerExplosion(); return; }
    if (e.key === '?') { toggleHelpMenu(); return; }
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); spin(); return; }
    const k = e.key.toUpperCase();
    const idx = state.config.segments.findIndex(s => segmentKey(s) === k);
    if (idx !== -1) { toast('🎯 Rigging: ' + state.config.segments[idx].text); spinToTarget(idx); }
  });

  /* Inline onclick handlers — expose functions to global scope */
  window.spin = spin;
  window.toggleSettings = toggleSettings;
  window.closeResult = closeResult;
  window.toggleHelpMenu = toggleHelpMenu;
  window.closeExplosion = closeExplosion;
}
