// ── Lock screen ──────────────────────────────────────────────
// The device ID is theatre: it gates the ceremony, not any data. Everything
// this page holds is already in the visitor's own browser.

import { state, save } from './state.js';
import { showScreen, renderConsole } from './render.js';
import { resolveMotion } from './theme.js';
import { $ } from './utils.js';
import { blip } from './audio.js';

export const DEVICE_ID = 'CORE';
const HINT_AFTER_MS = 6000;
const HINT = `Device ID: ${DEVICE_ID[0]} _ _ ${DEVICE_ID[3]}`;

let hintTimer = null;

function motion() { return resolveMotion(state.settings.motion); }

/** Beat one: the mark ignites in its socket. */
function igniteMs() {
  const m = motion();
  return m === 'off' ? 0 : (m === 'reduced' ? 160 : 520);
}

/** Beat two: the socket, ring and all, descends onto the frame's core. */
function descendMs() {
  const m = motion();
  return m === 'off' ? 0 : (m === 'reduced' ? 240 : 1150);
}

/** Beat three: it seats. A short hold so the landing registers as an event. */
function placeMs() {
  const m = motion();
  return m === 'off' ? 0 : (m === 'reduced' ? 120 : 340);
}

export function armHint() {
  clearTimeout(hintTimer);
  const el = $('bootHint');
  if (!el) return;
  el.hidden = true;
  hintTimer = setTimeout(() => {
    if (state.unlocked) return;
    el.textContent = HINT;
    el.hidden = false;
  }, HINT_AFTER_MS);
}

function reject() {
  const status = $('bootStatus');
  if (status) status.textContent = 'Handshake rejected';
  document.body.dataset.boot = 'reject';
  blip('reject');
  setTimeout(() => { delete document.body.dataset.boot; }, 600);
  const input = $('bootCode');
  if (input) { input.value = ''; input.focus(); }
}

/** Play the accept sequence, then hand over to the console. */
export function unlock({ ceremony = true } = {}) {
  clearTimeout(hintTimer);
  state.unlocked = true;
  save(state);

  const status = $('bootStatus');
  if (status) status.textContent = 'Handshake accepted';

  if (!ceremony) {
    document.body.dataset.phase = 'online';
    showScreen('console');
    renderConsole({ boot: false });
    return;
  }

  document.body.dataset.boot = 'accept';
  blip('unlock');

  /*
   * Three beats, and the order is the point.
   *
   * The console is brought up underneath first, with the lock screen still
   * overlaying it, so the socket can be measured against the frame's real core
   * position. Then the whole socket travels down as one object, ring included,
   * and seats. Only then do the components run out of it.
   *
   * The earlier version moved the console's core tile up to meet the socket and
   * cut the lock screen instantly, which read as the mech's mark arriving from
   * somewhere off-screen rather than as the device being placed into it.
   */
  const descend = descendMs();
  const place = placeMs();

  setTimeout(() => {
    // 'overlay' lifts the lock screen out of flow without moving anything yet.
    // Measuring has to happen in this state: the section goes from in-flow to
    // position:fixed, which re-centres it, so a rect taken beforehand is off by
    // the difference and the mark lands a few pixels short.
    document.body.dataset.boot = 'overlay';
    document.body.dataset.phase = 'online';
    showScreen('console');
    // Frame laid out but holding: the tiles wait for the socket to seat.
    renderConsole({ boot: true, holdMs: descend + place });

    // showScreen just set `hidden` here, and the template carries
    // `[hidden] { display: none !important }`, which no CSS override can beat.
    // The attribute is cleared outright instead: the lock screen has to stay on
    // screen through the descent, and it is measured in the next few lines.
    const bootSection = document.getElementById('screenBoot');
    if (bootSection) bootSection.hidden = false;

    const socket = document.querySelector('.boot__stage');
    const target = document.querySelector('.matrix__core');
    // Now that both are in their final positioning contexts.
    const markBefore = document.querySelector('.boot__socket .core-a')?.getBoundingClientRect();
    const stageBefore = socket?.getBoundingClientRect();

    if (socket && target && descend && markBefore?.width) {
      const to = target.getBoundingClientRect();
      if (to.width && stageBefore?.width) {
        // The whole stage moves, so the ring travels with the mark, but the
        // numbers come from the mark: it is what has to land on the frame's
        // core at the frame's size.
        //
        // The scale pivots on the stage's centre, not the mark's, and the two
        // are about ten pixels apart. Solving for the translate that puts the
        // mark on target after that pivot is what closes the gap:
        //   final = C + s(mark - C) + t   =>   t = target - C - s(mark - C)
        const s = to.width / markBefore.width;
        const cx = stageBefore.left + stageBefore.width / 2;
        const cy = stageBefore.top + stageBefore.height / 2;
        const mx = markBefore.left + markBefore.width / 2;
        const my = markBefore.top + markBefore.height / 2;
        const tx = (to.left + to.width / 2) - cx - s * (mx - cx);
        const ty = (to.top + to.height / 2) - cy - s * (my - cy);
        socket.style.setProperty('--drop-x', `${tx}px`);
        socket.style.setProperty('--drop-y', `${ty}px`);
        socket.style.setProperty('--drop-scale', `${s}`);
        socket.style.setProperty('--drop-ms', `${descend}ms`);
      }
    }

    // Vars in place, transform armed: flipping the phase starts the travel.
    document.body.dataset.boot = 'descend';

    setTimeout(() => { document.body.dataset.boot = 'seated'; blip('online'); }, descend);
    setTimeout(() => {
      delete document.body.dataset.boot;
      if (bootSection) bootSection.hidden = true;
    }, descend + place);
  }, igniteMs());
}

/** Send the console back to the lock screen so the ceremony can replay. */
export function relock() {
  state.unlocked = false;
  save(state);
  document.body.dataset.phase = 'locked';
  const status = $('bootStatus');
  if (status) status.textContent = '';
  const input = $('bootCode');
  if (input) input.value = '';
  showScreen('boot');
  armHint();
  input?.focus();
}

export function submitCode(raw) {
  const code = String(raw || '').trim().toUpperCase();
  if (code === DEVICE_ID) unlock();
  else reject();
}

/** Decide the opening screen: ?key=, a remembered unlock, or the gate. */
export function initBoot() {
  const key = new URLSearchParams(location.search).get('key');
  if (key && key.trim().toUpperCase() === DEVICE_ID) {
    unlock({ ceremony: false });
    return;
  }
  if (state.unlocked) {
    document.body.dataset.phase = 'online';
    showScreen('console');
    renderConsole({ boot: false });
    return;
  }
  document.body.dataset.phase = 'locked';
  showScreen('boot');
  armHint();
}
