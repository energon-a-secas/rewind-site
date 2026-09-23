'use strict';

/* ── Small shared helpers ────────────────────────────────────────────── */

export function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

export function segmentKey(seg) {
  return seg.key ? seg.key.toUpperCase() : seg.text[0].toUpperCase();
}

/* ── Toast notifications ─────────────────────────────────────────────── */
export function toast(msg, dur = 2500) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 300);
  }, dur);
}

/* ── Confetti ────────────────────────────────────────────────────────── */
export function spawnConfetti(baseColor) {
  const colors = [baseColor, '#ffffff', '#a78bfa', '#60a5fa', '#fcd34d', '#f9a8d4'];
  const count = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 60;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${4 + Math.random() * 8}px;
      height: ${4 + Math.random() * 8}px;
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 4000);
  }
}
