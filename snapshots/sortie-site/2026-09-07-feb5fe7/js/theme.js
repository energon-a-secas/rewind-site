// ── Live theming ─────────────────────────────────────────────
// One place writes --accent, so the options drawer and an active burst mode
// can never disagree about what color the console currently is.

import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, onColor, prefersReducedMotion, clamp } from './utils.js';

const FALLBACK = '#06b6d4';

/** One Tailwind-ish step lighter, used for hover states. */
function brighten(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [h, s, l] = rgbToHsl(...rgb);
  return rgbToHex(...hslToRgb(h, clamp(s + 4, 0, 100), clamp(l + 11, 0, 96)));
}

/**
 * Paint an accent onto :root. The foreground that sits on top of it is derived
 * from luminance rather than fixed, because the visitor picks the accent and a
 * pale one would swallow white label text.
 */
export function applyAccent(hex) {
  const rgb = hexToRgb(hex) || hexToRgb(FALLBACK);
  const s = document.documentElement.style;
  s.setProperty('--accent', hex);
  s.setProperty('--accent-rgb', rgb.join(', '));
  s.setProperty('--accent-bright', brighten(hex));
  s.setProperty('--on-accent', onColor(rgb));
}

/** Effective motion level: 'auto' defers to the OS setting. */
export function resolveMotion(setting) {
  if (setting && setting !== 'auto') return setting;
  return prefersReducedMotion() ? 'reduced' : 'full';
}

const FX_KEYS = ['scanlines', 'bloom', 'aberration', 'curve'];

/**
 * Mirror the settings object onto <body> data-attributes for the CSS to read.
 * The chrome (header/footer) toggle is NOT here any more: the NeoKeys kit
 * owns H, the html[data-chrome] state and the neo_chrome cookie.
 */
export function applyFx(settings) {
  const b = document.body;
  for (const key of FX_KEYS) b.dataset[key] = settings[key] ? 'on' : 'off';
  if (!settings.motion || settings.motion === 'auto') delete b.dataset.motion;
  else b.dataset.motion = settings.motion;
}
