// ── Poster export ────────────────────────────────────────────
// Redraws the assembled frame onto a canvas so a build can be posted as an
// image. Reuses the same layout and glyph paths the live matrix uses, so the
// poster cannot drift from what is on screen.

import { state, equipped } from './state.js';
import { SLOTS, STOCK_PARTS, STATS, glyphPath, GLYPH_SIZE, LEVELS, frameRating } from './parts.js';
import { layoutFor } from './layout.js';
import { MODES } from './modes.js';
import { currentStats } from './render.js';
import { hexToRgb, download, showToast } from './utils.js';

const W = 1200;
const H = 630;
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

function accentHex() {
  return state.mode ? MODES[state.mode].color : state.settings.accent;
}

function drawFrame(ctx, accent, fg) {
  const L = layoutFor(state.settings.layout);
  const boxW = 470;
  const boxH = 470;
  const cx = 300;
  const cy = H / 2 + 6;
  const pitch = Math.min(boxW / L.spanX, boxH / L.spanY) * 0.84;
  const tile = pitch * 0.9;

  // Traces from the core to each slot
  ctx.strokeStyle = `rgba(${hexToRgb(accent).join(',')}, 0.24)`;
  ctx.lineWidth = 1;
  for (const slot of SLOTS) {
    const p = L.pos[slot.id];
    if (!p) continue;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (p.x + L.offsetX) * pitch, cy + (p.y + L.offsetY) * pitch);
    ctx.stroke();
  }

  // Tiles
  for (const slot of SLOTS) {
    const p = L.pos[slot.id];
    const part = equipped(state, STOCK_PARTS, slot.id);
    if (!p || !part) continue;
    const x = cx + (p.x + L.offsetX) * pitch - tile / 2;
    const y = cy + (p.y + L.offsetY) * pitch - tile / 2;

    ctx.fillStyle = accent;
    ctx.fillRect(x, y, tile, tile);

    ctx.save();
    ctx.translate(x + tile * 0.09, y + tile * 0.09);
    ctx.scale((tile * 0.82) / GLYPH_SIZE, (tile * 0.82) / GLYPH_SIZE);
    // One pass per ink, matching the live tile: dark contour, then the fills.
    const inks = [null, { c: 'rgba(255,255,255,.92)', a: 1 }, { c: fg, a: 0.62 }, { c: fg, a: 1 }];
    for (let level = 1; level < LEVELS; level++) {
      const d = glyphPath(part.glyph, level);
      if (!d) continue;
      ctx.globalAlpha = inks[level].a;
      ctx.fillStyle = inks[level].c;
      ctx.fill(new Path2D(d));
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // The core mark
  ctx.save();
  ctx.translate(cx - tile * 0.4, cy - tile * 0.4);
  ctx.scale((tile * 0.8) / 100, (tile * 0.8) / 100);
  ctx.fillStyle = accent;
  ctx.fill(new Path2D('M40 4 H60 L96 96 H74 L50 30 L26 96 H4 Z M17.3 62 H82.7 L88.2 76 H11.8 Z'));
  ctx.restore();
}

function drawReadout(ctx, accent) {
  const { shown } = currentStats();
  const x = 660;
  let y = 150;

  ctx.fillStyle = accent;
  ctx.font = `600 20px ${MONO}`;
  ctx.fillText('SORTIE / FRAME REPORT', x, y);

  y += 62;
  ctx.fillStyle = '#f9f9f9';
  ctx.font = `700 68px ${MONO}`;
  ctx.fillText(String(frameRating(shown)).padStart(4, '0'), x, y);

  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.font = `400 16px ${MONO}`;
  ctx.fillText('FRAME RATING', x + 210, y - 8);

  y += 34;
  ctx.fillStyle = accent;
  ctx.font = `600 18px ${MONO}`;
  ctx.fillText(state.mode ? `MODE / ${MODES[state.mode].label.toUpperCase()}` : 'MODE / STANDBY', x, y);

  y += 46;
  for (const { key, label } of STATS) {
    const v = shown[key];
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.font = `400 15px ${MONO}`;
    ctx.fillText(label, x, y);
    ctx.fillStyle = '#f9f9f9';
    ctx.fillText(String(v).padStart(3, '0'), x + 430, y);

    ctx.fillStyle = 'rgba(255,255,255,.09)';
    ctx.fillRect(x + 80, y - 11, 330, 8);
    ctx.fillStyle = accent;
    ctx.fillRect(x + 80, y - 11, 330 * (v / 100), 8);
    y += 42;
  }

  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.font = `400 15px ${MONO}`;
  ctx.fillText('sortie.neorgon.com', x, H - 70);
}

export function buildPoster() {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const accent = accentHex();
  const rgb = hexToRgb(accent) || [6, 182, 212];
  const fg = '#030616';   // glyph body: the ground, matching --glyph-ink

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0b1236');
  bg.addColorStop(1, '#030616');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(300, H / 2, 20, 300, H / 2, 420);
  glow.addColorStop(0, `rgba(${rgb.join(',')}, .18)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = `rgba(${rgb.join(',')}, .35)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  drawFrame(ctx, accent, fg);
  drawReadout(ctx, accent);
  return canvas;
}

export function savePoster() {
  buildPoster().toBlob((blob) => {
    if (!blob) { showToast('Could not render the poster'); return; }
    download(blob, 'sortie-frame.png');
    showToast('Poster saved');
  }, 'image/png');
}
