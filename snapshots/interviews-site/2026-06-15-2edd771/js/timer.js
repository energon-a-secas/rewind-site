let elapsed = 0;
let interval = null;
let running = false;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateDisplay() {
  const el = document.getElementById('timer-display');
  if (el) el.textContent = formatTime(elapsed);
}

export function getElapsed() {
  return elapsed;
}

export function setElapsed(value) {
  elapsed = Math.max(0, Math.floor(value || 0));
  updateDisplay();
}

function start() {
  if (running) return;
  running = true;
  interval = setInterval(() => {
    elapsed += 1;
    updateDisplay();
  }, 1000);
  updateButtons();
}

function pause() {
  running = false;
  if (interval) clearInterval(interval);
  interval = null;
  updateButtons();
}

function reset() {
  pause();
  elapsed = 0;
  updateDisplay();
}

function updateButtons() {
  const startBtn = document.getElementById('timer-start');
  const pauseBtn = document.getElementById('timer-pause');
  if (startBtn) startBtn.disabled = running;
  if (pauseBtn) pauseBtn.disabled = !running;
}

export function insertTimestamp(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return;
  const timestamp = `[${formatTime(elapsed)}] `;
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const before = el.value.substring(0, start);
  const after = el.value.substring(end);
  el.value = before + timestamp + after;
  const pos = start + timestamp.length;
  el.setSelectionRange(pos, pos);
  el.focus();
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function initTimer() {
  updateDisplay();
  updateButtons();

  document.getElementById('timer-start').addEventListener('click', start);
  document.getElementById('timer-pause').addEventListener('click', pause);
  document.getElementById('timer-reset').addEventListener('click', reset);

  document.querySelectorAll('.timestamp-btn').forEach(btn => {
    btn.addEventListener('click', () => insertTimestamp(btn.getAttribute('data-target')));
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
      const active = document.activeElement;
      if (active && (active.id === 'notes' || active.id === 'cheat-notes')) {
        e.preventDefault();
        insertTimestamp(active.id);
      }
    }
  });

  window.__timerElapsed = elapsed;
  window.__setTimerElapsed = setElapsed;
}
