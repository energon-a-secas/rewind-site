const CATEGORIES = [
  { id: 'comm',  name: 'Communication & Clarity',    short: 'Communication' },
  { id: 'story', name: 'Story Consistency',          short: 'Consistency' },
  { id: 'tech',  name: 'Technical Credibility',      short: 'Technical' },
  { id: 'own',   name: 'Ownership & Accountability', short: 'Ownership' },
  { id: 'solve', name: 'Problem-Solving & Pressure', short: 'Problem-Solving' },
  { id: 'vibe',  name: 'The Vibe',                   short: 'Vibe' }
];

const LABELS = {
  1: 'Concern', 2: 'Below average', 3: 'Solid', 4: 'Strong', 5: 'Excellent'
};

const FOLLOW_UP = {
  comm:  'Ask for a recent example of explaining a complex decision to a non-technical stakeholder.',
  story: 'Revisit a project from earlier in the interview and ask for one new detail.',
  tech:  'Pick a tool they rated highly and ask about a time it failed in production.',
  own:   'Ask which decisions in their last project were theirs vs. the team\'s.',
  solve: 'Present a constraint change mid-problem and watch how they adapt.',
  vibe:  'Schedule a short casual call with a future teammate to confirm culture fit.'
};

const READING = {
  comm:  'Playbook: Writing technical decisions clearly',
  story: 'Playbook: Telling your career story without exaggeration',
  tech:  'Agent Lore: Deep-dive prompts for technical interviews',
  own:   'Playbook: How to scope your real contributions',
  solve: 'Agent Lore: Structured debugging recipes',
  vibe:  'Playbook: Remote-team communication habits'
};

function scoreLabel(n) { return LABELS[n] || 'Solid'; }

function buildPack() {
  const name = document.getElementById('candidateName').value.trim() || 'Candidate';
  const role = document.getElementById('role').value.trim() || 'the role';
  const notes = document.getElementById('notes').value.trim();

  const scores = {};
  let total = 0;
  CATEGORIES.forEach(c => {
    const v = parseInt(document.getElementById(c.id + 'Score').value, 10);
    scores[c.id] = v;
    total += v;
  });
  const avg = (total / CATEGORIES.length).toFixed(1);

  const strengths = CATEGORIES.filter(c => scores[c.id] >= 4).map(c => `- ${c.name}: ${scoreLabel(scores[c.id])}`);
  const gaps = CATEGORIES.filter(c => scores[c.id] <= 2).map(c => `- ${c.name}: ${scoreLabel(scores[c.id])}`);
  const middling = CATEGORIES.filter(c => scores[c.id] === 3).map(c => `- ${c.name}: solid, no red flags`);

  const resumeBullets = [
    `-${name.replace(/\s+/g, '-').toLowerCase()}-${role.replace(/\s+/g, '-').toLowerCase()}:`,
    `- Demonstrated ${scoreLabel(scores.comm).toLowerCase()} communication and ${scoreLabel(scores.solve).toLowerCase()} problem-solving in a behavioral interview.`,
    `- Showed ${scoreLabel(scores.tech).toLowerCase()} technical credibility and ${scoreLabel(scores.own).toLowerCase()} ownership accountability.`,
    `- ${scores.vibe >= 4 ? 'Strong' : scores.vibe >= 3 ? 'Positive' : 'Mixed'} team-fit signals; recommended ${avg >= 3.5 ? 'move forward' : avg >= 2.5 ? 'proceed with follow-up' : 'additional screening'}.`
  ];

  const followUps = CATEGORIES.filter(c => scores[c.id] <= 3).map(c => `- ${FOLLOW_UP[c.id]}`);
  const readingList = CATEGORIES.filter(c => scores[c.id] <= 3).map(c => `- ${READING[c.id]}`);

  const lines = [
    `# Hiring Pack: ${name}`,
    `Role: ${role}`,
    `Average score: ${avg} / 5`,
    '',
    '## Snapshot',
    avg >= 4.0 ? 'Strong overall signal. Move forward with reference checks.' :
    avg >= 3.0 ? 'Solid candidate with some areas to validate before an offer.' :
    'Multiple concerns surfaced. Add a focused follow-up round or pass.',
    ''
  ];

  if (strengths.length) {
    lines.push('## Strengths', ...strengths, '');
  }
  if (gaps.length) {
    lines.push('## Gaps', ...gaps, '');
  } else if (middling.length) {
    lines.push('## Solid areas', ...middling, '');
  }

  lines.push('## Suggested resume bullets', ...resumeBullets, '');

  if (followUps.length) {
    lines.push('## Follow-up questions / exercises', ...followUps, '');
  }

  if (readingList.length) {
    lines.push('', '## Recommended reading for the candidate', ...readingList);
  }

  if (notes) {
    lines.push('', '## Interviewer notes', notes);
  }

  document.getElementById('output').value = lines.join('\n');
}

function init() {
  CATEGORIES.forEach(c => {
    const input = document.getElementById(c.id + 'Score');
    const val = document.getElementById(c.id + 'ScoreVal');
    input.addEventListener('input', () => {
      val.textContent = input.value;
      buildPack();
    });
  });

  ['candidateName', 'role', 'notes'].forEach(id => {
    document.getElementById(id).addEventListener('input', buildPack);
  });

  document.getElementById('copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById('output').value);
      const btn = document.getElementById('copyBtn');
      const orig = btn.textContent;
      btn.textContent = 'Copied';
      setTimeout(() => btn.textContent = orig, 1500);
    } catch (e) {
      alert('Unable to copy. Select the pack manually.');
    }
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    const blob = new Blob([document.getElementById('output').value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hiring-pack.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Seed from URL params
  const params = new URLSearchParams(location.search);
  if (params.has('name')) document.getElementById('candidateName').value = decodeURIComponent(params.get('name'));
  if (params.has('role')) document.getElementById('role').value = decodeURIComponent(params.get('role'));
  CATEGORIES.forEach(c => {
    if (params.has(c.id)) {
      const v = parseInt(params.get(c.id), 10);
      if (v >= 1 && v <= 5) {
        document.getElementById(c.id + 'Score').value = v;
        document.getElementById(c.id + 'ScoreVal').textContent = v;
      }
    }
  });
  if (params.has('notes')) document.getElementById('notes').value = decodeURIComponent(params.get('notes'));

  buildPack();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
