// ── State ────────────────────────────────────────────────────
// Shared app shell state. Per-lab ephemeral state lives inside
// each lab module. Only cross-session preferences are persisted.

const STORAGE_KEY = 'glassbox-state';

// key: the digit that jumps to the lab (0 = overview). half: which skill the
// lab trains, used by the overview map. "machinery" labs simulate Claude's
// internals, "questions" labs train the exam format itself. The id stays
// "machinery"; the overview renders it as "See how it works", which is the
// wording a first-time reader actually parses.
export const LABS = [
  { id: 'overview', key: '0', half: 'map', label: 'Overview', hint: 'The exam, mapped to the labs that train it' },
  { id: 'foundations', key: 'f', half: 'machinery', label: 'Foundations', hint: 'Tokens, prediction, temperature: the layer under every other lab' },
  { id: 'loop', key: '1', half: 'machinery', label: 'Agent Loop', hint: 'Watch a coordinator spin subagents, step by step' },
  { id: 'sdk', key: '2', half: 'machinery', label: 'Agent SDK', hint: 'Build one yourself: six levels of setup and their caveats' },
  { id: 'mcp', key: '3', half: 'machinery', label: 'MCP', hint: 'Improvised integration vs a defined MCP server' },
  { id: 'config', key: '4', half: 'machinery', label: 'Config Explorer', hint: 'A repo from bare to fully outfitted' },
  { id: 'planning', key: '5', half: 'machinery', label: 'Plan vs Direct', hint: 'When Claude should plan before it edits' },
  // Digits 0-9 were taken when this lab landed; 'c' for context.
  { id: 'context', key: 'c', half: 'machinery', label: 'Context', hint: 'Sliding window, digests, case facts: what ships in the next request' },
  { id: 'patterns', key: '6', half: 'questions', label: 'Playbook', hint: 'The decision patterns that settle most questions' },
  { id: 'vocab', key: 'v', half: 'questions', label: 'Lexicon', hint: 'The exam’s verbs decoded: synthesize ≠ aggregate ≠ consolidate' },
  { id: 'traps', key: '7', half: 'questions', label: 'Traps', hint: 'Distractor lures and near-miss stems, side by side' },
  { id: 'antipatterns', key: '8', half: 'questions', label: 'Anti-patterns', hint: 'The traps the exam loves to test' },
  { id: 'drill', key: '9', half: 'questions', label: 'Drill', hint: 'Answer the question bank and score yourself' },
];

export const state = {
  activeLab: 'overview',
  examMode: false,
  // Rail view for the *current* lab: 'auto' shows its declared sections when
  // it has more than one, 'labs' is the reader having climbed back out. Never
  // persisted, so a new visit starts on the lab list.
  railView: 'auto',
};

function labFromHash() {
  const h = (location.hash || '').replace('#', '');
  return LABS.some((l) => l.id === h) ? h : null;
}

export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(s, JSON.parse(raw));
  } catch { /* ignore corrupted data */ }
  const h = labFromHash();
  if (h) s.activeLab = h;
}

export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ examMode: s.examMode, activeLab: s.activeLab }));
  } catch { /* quota or private mode */ }
}
