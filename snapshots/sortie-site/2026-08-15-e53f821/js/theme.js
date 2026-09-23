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
 * Show or hide the header bar.
 *
 * Done with an inline style rather than a stylesheet rule, because the fleet
 * forbids site-local header CSS and the kit's own `.header-hidden` class is
 * owned by its scroll handler, which would put the bar back on the next scroll
 * up. An inline display beats both and leaves the kit's rules untouched.
 */
export function applyChrome(on) {
  for (const sel of ['.header-bar', '.neo-footer']) {
    const el = document.querySelector(sel);
    if (el) el.style.display = on ? '' : 'none';
  }
  document.body.dataset.chrome = on ? 'on' : 'off';
}

/** Mirror the settings object onto <body> data-attributes for the CSS to read. */
export function applyFx(settings) {
  const b = document.body;
  for (const key of FX_KEYS) b.dataset[key] = settings[key] ? 'on' : 'off';
  applyChrome(settings.chrome !== false);
  if (!settings.motion || settings.motion === 'auto') delete b.dataset.motion;
  else b.dataset.motion = settings.motion;
}
