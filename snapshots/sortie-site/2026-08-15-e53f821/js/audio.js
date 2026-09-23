// ── Console blips ────────────────────────────────────────────
// Synthesized, so the site ships no audio files. Off until the visitor turns
// it on in the options drawer, and every call is a no-op while off.

import { state } from './state.js';

let ctx = null;

const VOICES = {
  unlock: { type: 'sawtooth', from: 180, to: 880, dur: 0.55, gain: 0.16 },
  reject: { type: 'square', from: 220, to: 70, dur: 0.28, gain: 0.14 },
  online: { type: 'triangle', from: 660, to: 990, dur: 0.09, gain: 0.05 },
  mode: { type: 'sawtooth', from: 320, to: 1180, dur: 0.42, gain: 0.13 },
  tick: { type: 'sine', from: 880, to: 880, dur: 0.04, gain: 0.05 },
};

function audio() {
  if (ctx) return ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try { ctx = new Ctx(); } catch { ctx = null; }
  return ctx;
}

/** @param {keyof VOICES} name */
export function blip(name) {
  if (!state.settings.sound) return;
  const v = VOICES[name];
  const ac = v && audio();
  if (!ac) return;
  if (ac.state === 'suspended') ac.resume?.();

  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = v.type;
  osc.frequency.setValueAtTime(v.from, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, v.to), t + v.dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(v.gain, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + v.dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + v.dur + 0.02);
}
