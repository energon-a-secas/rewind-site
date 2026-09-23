// ── Lab 0: Overview ──────────────────────────────────────────
// The landing map. Orients a first-time visitor (what the exam tests,
// which lab trains what) and gives a returning one a one-glance path.
// Cards are plain #hash anchors: the shell's hashchange handler mounts
// the target lab, so this file needs no navigation code of its own.
//
// Every count below is derived from the data modules, never hardcoded:
// add a question or a pattern and the tiles update themselves.

import { LABS } from '../state.js';
import { EXAM_BRIEF } from '../data/exam-brief.js';
import { DOMAINS, QUESTIONS, SCENARIOS } from '../data/questions/index.js';
import { RUN_ORDER } from '../data/runs.js';
import { SDK_LEVELS } from '../data/sdk.js';
import { MCP_FLOWS } from '../data/mcp.js';
import { CONFIG_LEVELS } from '../data/config.js';
import { PLANNING_CASES } from '../data/planning.js';
import { CW_SCENARIOS } from '../data/context.js';
import { VERB_GROUPS, DISTINCTIONS } from '../data/vocab.js';
import { PATTERNS } from '../data/patterns.js';
import { LURES, PAIRS } from '../data/traps.js';
import { ANTIPATTERNS } from '../data/antipatterns.js';
import { escHtml } from '../utils.js';

// Editorial card copy, keyed by lab id. Falls back to the rail hint so a
// new lab never renders an empty card.
const CARDS = {
  loop: {
    desc: 'Replay a full agent run node by node: stop_reason, tool_choice, the Task tool, subagents, and the context meter filling as it works.',
    fact: `${RUN_ORDER.length} runs to replay`,
  },
  sdk: {
    desc: 'Build the same agent six times, from a bare stateless call to sessions and subagents. Each level names the config keys it adds and what still breaks without the next one.',
    fact: `${SDK_LEVELS.length} levels + a config bench`,
  },
  mcp: {
    desc: 'The same task twice: an improvised integration, then a defined MCP server. Watch the token cost and the error shape change.',
    fact: `${Object.keys(MCP_FLOWS).length} flows, side by side`,
  },
  config: {
    desc: 'Walk a repo from bare to fully outfitted: CLAUDE.md, rules, skills, hooks, .mcp.json, each file annotated with what it buys.',
    fact: `${CONFIG_LEVELS.length} maturity levels`,
  },
  planning: {
    desc: 'Read the signals in a task and make the call: plan first, or go straight to edits. The console decides from the same signals you were shown.',
    fact: `${PLANNING_CASES.length} cases to call`,
  },
  context: {
    desc: 'The same conversation replayed under different memory strategies: the chat on one side, the request the model actually receives on the other. Watch a window drop the order number, a digest blur $129.99, a persona drift.',
    fact: `${Object.values(CW_SCENARIOS).reduce((a, s) => a + s.strategies.length, 0)} playouts, side by side`,
  },
  patterns: {
    desc: 'The decision patterns that settle most stems: the tell in the question, the winning option shape, the distractor shapes.',
    fact: `${PATTERNS.length} patterns`,
  },
  vocab: {
    desc: 'The exam’s verbs are signals, not synonyms: synthesize means judgment, aggregate means code, enforce means a hook. Each term with its stem-tell, its trap, and the near-miss pairs split apart.',
    fact: `${VERB_GROUPS.reduce((a, g) => a + g.verbs.length, 0)} terms · ${DISTINCTIONS.length} pairs split`,
  },
  traps: {
    desc: 'Distractor lures with their genuine exceptions, near-miss stems with the discriminator stated, and the checks to run before answering.',
    fact: `${LURES.length} lures · ${PAIRS.length} near-misses`,
  },
  antipatterns: {
    desc: 'The failure modes the exam loves, named and flagged. Spot them in stems and in your own configs.',
    fact: `${Object.keys(ANTIPATTERNS).length} named anti-patterns`,
  },
  drill: {
    desc: 'Sit a weighted slice of the bank in exam format, then read the reasoning for every option, right or wrong.',
    fact: `${QUESTIONS.length} questions · ${SCENARIOS.length} scenarios`,
  },
};

// Which labs train each weighted domain. Orientation metadata: DOMAINS
// holds the official weights, this is the site map on top.
const DOMAIN_LABS = {
  d1: ['loop', 'sdk'],
  d2: ['mcp', 'sdk'],
  d3: ['config', 'planning'],
  d4: ['patterns', 'vocab', 'traps'],
  d5: ['context', 'loop', 'antipatterns'],
};

const HALVES = [
  {
    id: 'machinery',
    title: 'See the machinery',
    sub: 'Hand-authored simulations, no live API and no keys. The internals behave the way Claude Code and the Agent SDK actually behave, slowed down so you can inspect each step.',
  },
  {
    id: 'questions',
    title: 'Answer the questions',
    sub: 'The format is a skill by itself: four plausible options, exactly one that removes the cause. These labs teach the shapes questions come in, then score you against them.',
  },
];

const labById = Object.fromEntries(LABS.map((l) => [l.id, l]));

function cardHtml(id) {
  const lab = labById[id];
  const card = CARDS[id];
  if (!lab || !card) return '';
  return `
    <a class="ov-card" href="#${lab.id}">
      <div class="ov-card__top">
        <span class="ov-card__key" title="Press ${lab.key}">${lab.key}</span>
        <h4>${escHtml(lab.label)}</h4>
      </div>
      <p>${card.desc}</p>
      <span class="ov-card__fact">${card.fact}</span>
    </a>`;
}

function halfHtml(half) {
  const ids = LABS.filter((l) => l.half === half.id).map((l) => l.id);
  return `
    <section class="ov-sec">
      <header class="ov-sec__head">
        <h3>${half.title}</h3>
        <p>${half.sub}</p>
      </header>
      <div class="ov-cards">${ids.map(cardHtml).join('')}</div>
    </section>`;
}

function domainHtml(d) {
  const maxPct = Math.max(...DOMAINS.map((x) => x.pct));
  const chips = (DOMAIN_LABS[d.id] || []).map((id) => {
    const lab = labById[id];
    return lab ? `<a class="ov-chip" href="#${lab.id}"><b>${lab.key}</b>${escHtml(lab.label)}</a>` : '';
  }).join('');
  return `
    <div class="ov-domain">
      <div class="ov-domain__meta">
        <span class="ov-domain__label">${escHtml(d.label)}</span>
        <span class="ov-domain__pct">${d.pct}%</span>
      </div>
      <div class="ov-domain__bar"><i style="width:${Math.round((d.pct / maxPct) * 100)}%"></i></div>
      <div class="ov-domain__labs">${chips}</div>
    </div>`;
}

export function mountOverview(root) {
  const tiles = [
    { num: EXAM_BRIEF.stats[0].num, cap: EXAM_BRIEF.stats[0].cap },
    { num: EXAM_BRIEF.stats[2].num, cap: EXAM_BRIEF.stats[2].cap },
    { num: String(QUESTIONS.length), cap: 'practice questions, every option reasoned' },
    { num: String(PATTERNS.length), cap: 'decision patterns that settle most stems' },
  ];

  root.innerHTML = `
    <section class="lab lab-overview">
      <header class="ov-hero">
        <div class="ov-hero__text">
          <span class="ov-eyebrow">Claude Certified Architect (Foundations) · study labs</span>
          <h2>The exam tests two skills. This site trains both.</h2>
          <p>Half the exam is knowing what Claude actually does when a request comes in: what it reads, what it fires, what it waits on. The other half is picking the one option that removes the cause when three would work. The machinery labs make the first visible. The question labs drill the second.</p>
          <p class="ov-start">New here? Press <kbd>1</kbd> for the Agent Loop, or take the Drill cold with <kbd>9</kbd> and let the misses pick your path.</p>
        </div>
        <div class="ov-stats">
          ${tiles.map((t) => `
            <div class="ov-stat">
              <div class="ov-stat__num">${escHtml(t.num)}</div>
              <div class="ov-stat__cap">${escHtml(t.cap)}</div>
            </div>`).join('')}
        </div>
      </header>

      ${HALVES.map(halfHtml).join('')}

      <section class="ov-sec">
        <header class="ov-sec__head">
          <h3>Where the points are</h3>
          <p>Five domains, weighted. Bars are the official weights relative to the biggest; chips are the labs that train each one.</p>
        </header>
        <div class="ov-map">
          ${DOMAINS.map(domainHtml).join('')}
          <p class="ov-map__note">The <a href="#drill">Drill</a> samples all five domains and estimates a scaled score on the 100-1000 scale from these weights.</p>
        </div>
      </section>
    </section>`;
}
