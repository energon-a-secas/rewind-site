// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Round timer ──────────────────────────────────────────────
// A quiet, room-friendly countdown for a facilitated session.
// No auto-playing audio: the "done" cue is visual + an aria-live
// announcement, so it never startles a room mid-conversation.
// Timestamp-driven so it stays accurate even if a tab is backgrounded.

function fmt(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function initTimer(el) {
  const timeEl = el.querySelector('[data-timer-time]');
  const phaseEl = el.querySelector('[data-timer-phase]');
  const barEl = el.querySelector('[data-timer-bar]');
  const statusEl = el.querySelector('[data-timer-status]');
  const startBtn = el.querySelector('[data-timer-start]');
  const resetBtn = el.querySelector('[data-timer-reset]');
  const presetBtns = el.querySelectorAll('[data-timer-min]');

  let duration = 5 * 60;
  let remaining = duration;
  let running = false;
  let intervalId = null;
  let endTs = 0;

  function paint() {
    const shown = Math.max(0, remaining);
    timeEl.textContent = fmt(shown);
    const pct = duration > 0 ? Math.max(0, Math.min(100, (shown / duration) * 100)) : 0;
    barEl.style.width = `${pct}%`;
    startBtn.textContent = running ? 'Pause' : 'Start';
    startBtn.setAttribute('aria-pressed', String(running));
  }

  function stopTick() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }

  function tick() {
    remaining = (endTs - Date.now()) / 1000;
    if (remaining <= 0) {
      remaining = 0;
      running = false;
      stopTick();
      el.classList.add('is-done');
      statusEl.textContent = phaseEl.textContent
        ? `Time is up for: ${phaseEl.textContent}`
        : 'Time is up';
    }
    paint();
  }

  function play() {
    if (remaining <= 0) return;
    running = true;
    el.classList.remove('is-done');
    statusEl.textContent = phaseEl.textContent
      ? `Timing: ${phaseEl.textContent}`
      : 'Timer running';
    endTs = Date.now() + remaining * 1000;
    stopTick();
    intervalId = setInterval(tick, 250);
    paint();
  }

  function pause() {
    running = false;
    stopTick();
    statusEl.textContent = 'Paused';
    paint();
  }

  function toggle() {
    if (running) pause(); else play();
  }

  function setDuration(seconds, label) {
    stopTick();
    running = false;
    duration = seconds;
    remaining = seconds;
    if (typeof label === 'string') phaseEl.textContent = label;
    el.classList.remove('is-done');
    statusEl.textContent = `Set to ${fmt(seconds)}${label ? `, ${label}` : ''}`;
    paint();
  }

  function reset() {
    stopTick();
    running = false;
    remaining = duration;
    el.classList.remove('is-done');
    statusEl.textContent = 'Reset';
    paint();
  }

  // Public: set a duration from a phase and start immediately.
  function startMinutes(minutes, label) {
    setDuration(Math.round(minutes * 60), label);
    play();
  }

  startBtn.addEventListener('click', toggle);
  resetBtn.addEventListener('click', reset);
  for (const b of presetBtns) {
    b.addEventListener('click', () => {
      const min = Number(b.dataset.timerMin);
      setDuration(min * 60, `${min} min`);
    });
  }

  paint();
  return { startMinutes, setDuration, play, pause, reset };
}
