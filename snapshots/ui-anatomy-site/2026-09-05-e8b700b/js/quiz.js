// ── Quiz mode: recall practice over the live wireframe ──────────────────────
// Two question types alternate at random:
//   name — a component pulses in the mockup, pick its name from 4 choices
//   find — a name is shown, click that component in the mockup
// Tooltips are suppressed while active (they would leak answers). Stats
// persist in localStorage, following the checklist's precedent.

import { state } from './state.js';
import { COMPONENTS } from './data.js';
import { hideTooltip } from './render.js';
import { escHtml } from './utils.js';

const STATS_KEY = 'quizStats';

let question = null;      // { type: 'name'|'find', compId, choices?: string[] }
let locked = false;       // feedback on screen, next question pending
let advanceTimer = null;

// ── Stats ───────────────────────────────────────────────────────────────────
function loadStats() {
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY));
    if (s) {
      state.quizStats = {
        answered: s.answered | 0,
        correct:  s.correct | 0,
        streak:   s.streak | 0,
        best:     s.best | 0,
      };
    }
  } catch { /* corrupted or absent storage → fresh stats */ }
}

function saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(state.quizStats)); } catch { /* private mode */ }
}

function recordAnswer(right) {
  const s = state.quizStats;
  s.answered++;
  if (right) {
    s.correct++;
    s.streak++;
    s.best = Math.max(s.best, s.streak);
  } else {
    s.streak = 0;
  }
  saveStats();
}

// ── Question pool: the components actually rendered, in page order ──────────
function currentPool() {
  const ids = [...document.querySelectorAll('#mockupFrame [data-comp]')].map(el => el.dataset.comp);
  return [...new Set(ids)].filter(id => COMPONENTS[id]);
}

// ── Target marking ──────────────────────────────────────────────────────────
function targetEls(compId) {
  return [...document.querySelectorAll(`#mockupFrame [data-comp="${CSS.escape(compId)}"]`)];
}

function clearQuizMarks() {
  document.querySelectorAll('#mockupFrame .quiz-target, #mockupFrame .quiz-flash-right, #mockupFrame .quiz-flash-wrong')
    .forEach(el => el.classList.remove('quiz-target', 'quiz-flash-right', 'quiz-flash-wrong'));
}

// ── Question construction ───────────────────────────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Distractors: same-category names first (plausible), then pool mates, then anything
function buildChoices(compId, pool) {
  const cat = COMPONENTS[compId].category;
  const cand = [];
  for (const id of Object.keys(COMPONENTS)) {
    if (id !== compId && COMPONENTS[id].category === cat) cand.push(id);
  }
  for (const id of pool) {
    if (id !== compId && !cand.includes(id)) cand.push(id);
  }
  for (const id of Object.keys(COMPONENTS)) {
    if (id !== compId && !cand.includes(id)) cand.push(id);
  }
  return shuffle([compId, ...shuffle(cand).slice(0, 3)]);
}

function nextQuestion() {
  clearTimeout(advanceTimer);
  locked = false;
  clearQuizMarks();

  const pool = currentPool();
  const panel = document.getElementById('quizPanel');
  if (pool.length < 4) {
    question = null;
    panel.innerHTML = `
      <div class="quiz-head"><span class="quiz-score">Quiz</span></div>
      <p class="quiz-prompt">This layout has too few components to quiz. Switch to a richer layout (Landing, SaaS, Ecommerce…) and the quiz will pick up there.</p>
      <button type="button" class="quiz-skip" id="quizEndBtn">End quiz</button>`;
    return;
  }

  const compId = pool[Math.floor(Math.random() * pool.length)];
  const type = Math.random() < 0.5 ? 'name' : 'find';
  question = { type, compId };
  if (type === 'name') {
    question.choices = buildChoices(compId, pool);
    targetEls(compId).forEach(el => el.classList.add('quiz-target'));
  }
  renderPanel();
}

// ── Panel rendering ─────────────────────────────────────────────────────────
function renderPanel() {
  const panel = document.getElementById('quizPanel');
  const comp = COMPONENTS[question.compId];

  const body = question.type === 'name'
    ? `<p class="quiz-prompt">What is the highlighted component called?</p>
       <div class="quiz-choices">
         ${question.choices.map(id => `<button type="button" class="quiz-choice" data-choice="${escHtml(id)}">${escHtml(COMPONENTS[id].name)}</button>`).join('')}
       </div>`
    : `<p class="quiz-prompt">Click the <strong>${escHtml(comp.name)}</strong> in the mockup.
       ${comp.also?.length ? `<span class="quiz-aka">Also called: ${escHtml(comp.also[0])}</span>` : ''}</p>`;

  panel.innerHTML = `
    <div class="quiz-head">
      <span class="quiz-score" id="quizScore"></span>
      <button type="button" class="quiz-end" id="quizEndBtn">End quiz</button>
    </div>
    ${body}
    <p class="quiz-feedback" id="quizFeedback" aria-live="polite"></p>
    <button type="button" class="quiz-skip" id="quizSkipBtn">Skip, show answer</button>`;
  renderScore();
}

function renderScore() {
  const el = document.getElementById('quizScore');
  if (!el) return;
  const s = state.quizStats;
  el.textContent = `Score ${s.correct}/${s.answered} · Streak ${s.streak} · Best ${s.best}`;
}

function feedback(msg) {
  const el = document.getElementById('quizFeedback');
  if (el) el.textContent = msg;
}

// ── Answers ─────────────────────────────────────────────────────────────────
export function answerChoice(btn) {
  if (!question || locked || question.type !== 'name') return;
  locked = true;
  const right = btn.dataset.choice === question.compId;
  recordAnswer(right);

  document.querySelectorAll('#quizPanel .quiz-choice').forEach(b => {
    b.disabled = true;
    if (b.dataset.choice === question.compId) b.classList.add('correct');
    else if (b === btn) b.classList.add('wrong');
  });

  const name = COMPONENTS[question.compId].name;
  feedback(right ? `Correct: that's the ${name}.` : `Not quite: the highlight is the ${name}.`);
  renderScore();
  advanceTimer = setTimeout(nextQuestion, 1500);
}

export function answerFind(compId, el) {
  if (!question || locked || question.type !== 'find') return;
  locked = true;
  const right = compId === question.compId;
  recordAnswer(right);

  const name = COMPONENTS[question.compId].name;
  if (right) {
    targetEls(compId).forEach(t => t.classList.add('quiz-flash-right'));
    feedback(`Correct: that's the ${name}.`);
  } else {
    el.classList.add('quiz-flash-wrong');
    targetEls(question.compId).forEach(t => t.classList.add('quiz-target'));
    feedback(`That's the ${COMPONENTS[compId].name}: the ${name} is now highlighted.`);
  }
  renderScore();
  advanceTimer = setTimeout(nextQuestion, 1700);
}

export function skipQuestion() {
  if (!question || locked) return;
  locked = true;
  if (question.type === 'name') {
    document.querySelectorAll('#quizPanel .quiz-choice').forEach(b => {
      b.disabled = true;
      if (b.dataset.choice === question.compId) b.classList.add('correct');
    });
  } else {
    targetEls(question.compId).forEach(t => t.classList.add('quiz-target'));
  }
  feedback(`That's the ${COMPONENTS[question.compId].name}.`);
  advanceTimer = setTimeout(nextQuestion, 1300);
}

// True while a find question awaits a mockup click (used by events.js routing)
export function quizExpectsClick() {
  return state.quizMode && question && question.type === 'find' && !locked;
}

// ── Mode lifecycle ──────────────────────────────────────────────────────────
export function startQuiz() {
  state.quizMode = true;
  state.pinnedComp = null;
  state.activeComp = null;
  hideTooltip();

  document.getElementById('compBrowser').classList.add('hidden');
  document.getElementById('quizPanel').classList.remove('hidden');

  const toggle = document.getElementById('quizToggle');
  toggle.classList.add('active');
  toggle.setAttribute('aria-pressed', 'true');
  document.getElementById('browserToggle').disabled = true;

  nextQuestion();
}

export function stopQuiz() {
  state.quizMode = false;
  clearTimeout(advanceTimer);
  question = null;
  locked = false;
  clearQuizMarks();

  document.getElementById('quizPanel').classList.add('hidden');
  document.getElementById('compBrowser').classList.toggle('hidden', !state.browserOpen);

  const toggle = document.getElementById('quizToggle');
  toggle.classList.remove('active');
  toggle.setAttribute('aria-pressed', 'false');
  document.getElementById('browserToggle').disabled = false;
}

// Layout/dummy switches re-render the mockup; the pool changes with it
export function onMockupChanged() {
  if (state.quizMode) nextQuestion();
}

loadStats();
