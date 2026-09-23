// ── Ambient effects ──────────────────────────────────────────
// A drifting particle field behind the console, plus the idle attract loop.
// Both are decorative: motion 'off' stops them, and the canvas is torn down
// rather than left spinning when particles are switched off.

import { state } from './state.js';
import { resolveMotion } from './theme.js';
import { MODE_LIST, preview } from './modes.js';
import { openModalId } from './modal.js';

const ATTRACT_IDLE_MS = 60000;
const ATTRACT_STEP_MS = 5200;

let canvas = null;
let raf = 0;
let dots = [];
let dpr = 1;

function sizeCanvas() {
  if (!canvas) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  seed();
}

function seed() {
  const n = Math.round((canvas.clientWidth * canvas.clientHeight) / 26000);
  dots = Array.from({ length: Math.min(140, Math.max(24, n)) }, () => ({
    x: Math.random(), y: Math.random(),
    vy: 0.00006 + Math.random() * 0.00022,
    r: 0.4 + Math.random() * 1.5,
    a: 0.12 + Math.random() * 0.4,
  }));
}

function accent() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim();
  return v || '6, 182, 212';
}

function frame() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  const rgb = accent();
  for (const d of dots) {
    d.y -= d.vy;
    if (d.y < -0.02) { d.y = 1.02; d.x = Math.random(); }
    ctx.beginPath();
    ctx.arc(d.x * w, d.y * h, d.r * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb}, ${d.a})`;
    ctx.fill();
  }
  raf = requestAnimationFrame(frame);
}

function stopParticles() {
  cancelAnimationFrame(raf);
  raf = 0;
  if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
}

/** Start or stop the field to match the current settings. */
export function syncFx() {
  const on = state.settings.particles && resolveMotion(state.settings.motion) === 'full';
  if (!canvas) return;
  canvas.style.display = on ? '' : 'none';
  if (on && !raf) { sizeCanvas(); frame(); }
  if (!on && raf) stopParticles();
}

// ── Attract mode ─────────────────────────────────────────────

let idleTimer = null;
let stepTimer = null;
let attracting = false;
let modeBeforeAttract = null;

function stopAttract() {
  clearInterval(stepTimer);
  stepTimer = null;
  if (attracting) {
    attracting = false;
    document.body.classList.remove('is-attracting');
    preview(modeBeforeAttract);   // put back whatever the visitor left running
  }
}

function startAttract() {
  if (attracting) return;
  if (!state.settings.attract) return;
  if (resolveMotion(state.settings.motion) !== 'full') return;
  if (!state.unlocked || state.screen !== 'console' || openModalId()) return;

  attracting = true;
  modeBeforeAttract = state.mode;
  document.body.classList.add('is-attracting');
  let i = 0;
  const cycle = () => {
    preview(MODE_LIST[i % MODE_LIST.length].id);
    i++;
  };
  cycle();
  stepTimer = setInterval(cycle, ATTRACT_STEP_MS);
}

/** Any real input resets the idle clock and cancels an attract loop in progress. */
export function nudge() {
  stopAttract();
  clearTimeout(idleTimer);
  idleTimer = setTimeout(startAttract, ATTRACT_IDLE_MS);
}

export function initFx() {
  canvas = document.getElementById('fxCanvas');
  window.addEventListener('resize', () => { if (raf) sizeCanvas(); });
  syncFx();
  nudge();
}
