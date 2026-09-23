// ── Transformation ───────────────────────────────────────────
// The frame folds into an alternate configuration. Same 21 parts, rearranged:
// the tiles slide to new positions rather than being redrawn, which is the
// difference between a machine transforming and a picture being swapped.

import { state, save } from './state.js';
import { FORMS, FORM_BY_ID } from './layout.js';
import { setPreset } from './matrix.js';
import { repaint } from './modes.js';
import { showToast } from './utils.js';
import { blip } from './audio.js';

let listener = null;
export function setTransformListener(fn) { listener = fn; }

/** The layout the matrix should currently be showing. */
export function activePreset() {
  return state.form || state.settings.layout;
}

/** Toggle a form on, or back to the resting frame. Returns the new form. */
export function transform(id) {
  const next = id && FORM_BY_ID[id] && state.form !== id ? id : null;
  state.form = next;
  save(state);

  setPreset(activePreset());
  repaint();
  blip(next ? 'mode' : 'tick');
  showToast(next ? FORM_BY_ID[next].banner : 'Frame restored');
  listener?.();
  return next;
}

/** Cycle: frame -> flight -> siege -> frame. Bound to the T key. */
export function cycleForm() {
  const order = [null, ...FORMS.map((f) => f.id)];
  const i = order.indexOf(state.form ?? null);
  return transform(order[(i + 1) % order.length]);
}

/** Re-apply a saved form on load. */
export function restoreForm() {
  if (state.form && !FORM_BY_ID[state.form]) state.form = null;
}
