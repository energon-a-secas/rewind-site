'use strict';

import { state } from './state.js';
import { spawnConfetti } from './utils.js';

/* ── Canvas references ───────────────────────────────────────────────── */
const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');

export { canvas };

/* ── Draw the wheel ──────────────────────────────────────────────────── */
export function drawWheel(rotation) {
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const segs = state.config.segments;
  const N = segs.length;
  if (N === 0) return;

  const r = Math.min(cx, cy) - 8;
  const segAngle = (2 * Math.PI) / N;

  ctx.clearRect(0, 0, W, H);

  /* Outer shadow glow */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = '#000';
  ctx.fill();
  ctx.restore();

  /* Segments */
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < N; i++) {
    const seg = segs[i];
    const startAngle = -Math.PI / 2 + i * segAngle;
    const endAngle   = startAngle + segAngle;
    const midAngle   = startAngle + segAngle / 2;

    /* Segment fill */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    /* Radial gradient overlay for depth */
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, startAngle, endAngle);
    ctx.closePath();
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    rg.addColorStop(0.3, 'rgba(255,255,255,0.15)');
    rg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fill();

    /* Edge separator */
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    /* Inner highlight arc */
    ctx.beginPath();
    ctx.arc(0, 0, r - 3, startAngle + 0.04, endAngle - 0.04);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 5;
    ctx.stroke();

    /* Text */
    ctx.save();
    ctx.rotate(midAngle);

    const textR = r * 0.70;
    const fontSize = Math.max(13, Math.min(22, (segAngle * r) / 6));
    ctx.font = `bold ${fontSize}px 'Avenir Next', -apple-system, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;

    const label = (seg.emoji ? seg.emoji + ' ' : '') + seg.text;
    const maxWidth = textR - 28;

    /* Truncate if needed */
    let displayText = label;
    if (ctx.measureText(displayText).width > maxWidth) {
      while (ctx.measureText(displayText + '…').width > maxWidth && displayText.length > 1) {
        displayText = displayText.slice(0, -1);
      }
      displayText += '…';
    }

    ctx.fillText(displayText, textR, 0);
    ctx.restore();
  }

  /* Center hub — outer glow ring */
  const hubR = Math.max(18, r * 0.11);
  ctx.beginPath();
  ctx.arc(0, 0, hubR + 4, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(0,99,229,0.3)';
  ctx.shadowColor = '#0063e5';
  ctx.shadowBlur = 16;
  ctx.fill();
  ctx.shadowBlur = 0;

  /* Hub fill — blue gradient */
  ctx.beginPath();
  ctx.arc(0, 0, hubR, 0, 2 * Math.PI);
  const hg = ctx.createRadialGradient(-hubR*0.2, -hubR*0.2, 0, 0, 0, hubR);
  hg.addColorStop(0, '#4BA3FF');
  hg.addColorStop(0.5, '#0063e5');
  hg.addColorStop(1, '#1E5ACC');
  ctx.fillStyle = hg;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;

  /* Hub border */
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* Hub shine highlight */
  ctx.beginPath();
  ctx.arc(-hubR*0.25, -hubR*0.25, hubR*0.35, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fill();

  /* Hub "?" label */
  ctx.font = `bold ${Math.max(10, hubR * 0.7)}px 'Avenir Next', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 1);

  ctx.restore();
}

/* ── Winner calculation ──────────────────────────────────────────────── */
export function getWinnerIndex(rotation, N) {
  const segAngle = (2 * Math.PI) / N;
  // Pointer is at top (−π/2). In wheel-local space the pointer maps to angle:
  // normalized = (−rotation) mod 2π
  const norm = ((-rotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(norm / segAngle) % N;
}

/* ── Result overlay ──────────────────────────────────────────────────── */
export function showResult(idx) {
  const seg = state.config.segments[idx];
  const overlay = document.getElementById('result-overlay');

  document.getElementById('res-emoji').textContent = seg.emoji || '🎉';
  document.getElementById('res-text').textContent = seg.text;
  document.getElementById('res-color-bar').style.background = seg.color;

  const excusesEl = document.getElementById('res-excuses');
  const msgEl = document.getElementById('res-message');

  if (seg.message && seg.message.includes('|')) {
    /* Pipe-separated: show as excuse cards */
    const parts = seg.message.split('|').map(s => s.trim()).filter(Boolean);
    excusesEl.innerHTML = '';
    parts.forEach(txt => {
      const item = document.createElement('div');
      item.className = 'result-excuse-item';
      item.style.setProperty('--item-color', seg.color);
      item.textContent = txt;
      excusesEl.appendChild(item);
    });
    excusesEl.style.display = 'flex';
    const winMsg = (state.config.winMessage || '🎉 {emoji} {result}!')
      .replace('{emoji}', seg.emoji || '').replace('{result}', seg.text);
    msgEl.textContent = winMsg;
  } else {
    excusesEl.style.display = 'none';
    excusesEl.innerHTML = '';
    const raw = seg.message || state.config.winMessage || '🎉 {emoji} {result}!';
    msgEl.textContent = raw.replace('{emoji}', seg.emoji || '').replace('{result}', seg.text);
  }

  overlay.classList.add('show');
  spawnConfetti(seg.color);
}

export function closeResult() {
  document.getElementById('result-overlay').classList.remove('show');
}

/* ── Spin animation ──────────────────────────────────────────────────── */
function animateSpin(spinAmount) {
  const N = state.config.segments.length;
  const startRotation = state.currentRotation;
  const duration      = 3500 + Math.random() * 500;
  const startTime     = performance.now();
  const btn = document.getElementById('btn-spin');

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    state.currentRotation = startRotation + spinAmount * easeOut(t);
    drawWheel(state.currentRotation);
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      state.currentRotation = startRotation + spinAmount;
      drawWheel(state.currentRotation);
      state.spinning = false;
      btn.disabled = false;
      btn.classList.remove('spinning');
      btn.textContent = 'SPIN';
      const winner = getWinnerIndex(state.currentRotation, N);
      showResult(winner);
    }
  }

  requestAnimationFrame(frame);
}

export function spin() {
  if (state.spinning || state.config.segments.length < 2) return;
  state.spinning = true;
  const btn = document.getElementById('btn-spin');
  btn.disabled = true;
  btn.classList.add('spinning');
  btn.textContent = 'Spinning…';
  const spinAmount = (5 + Math.random() * 4) * 2 * Math.PI;
  animateSpin(spinAmount);
}

export function spinToTarget(targetIdx) {
  if (state.spinning || state.config.segments.length < 2) return;
  state.spinning = true;
  const btn = document.getElementById('btn-spin');
  btn.disabled = true;
  btn.classList.add('spinning');
  btn.textContent = 'Rigged…';

  const N = state.config.segments.length;
  const TAU = 2 * Math.PI;
  const segAngle = TAU / N;
  /* Phase needed so pointer (top) lands in centre of targetIdx's segment */
  const targetPhase = (TAU - (targetIdx * segAngle + segAngle / 2) + TAU) % TAU;
  const deltaToTarget = (targetPhase - (state.currentRotation % TAU) + TAU) % TAU;
  const spinAmount = 5 * TAU + deltaToTarget;
  animateSpin(spinAmount);
}
