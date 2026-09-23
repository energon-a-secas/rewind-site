// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// Quick Mode — data loading + agenda/directive definitions

import { shuffle, genId } from './utils.js';

let _cardsData = null;

export async function loadCards() {
  if (_cardsData) return _cardsData;
  const resp = await fetch('../data/cards.json');
  const data = await resp.json();
  _cardsData = Array.isArray(data) ? data : (data.cards || []);
  _cardsData = _cardsData.filter(c => c.quantity > 0);
  return _cardsData;
}

function expandCards(defs) {
  const cards = [];
  for (const def of defs) {
    for (let i = 0; i < (def.quantity || 1); i++) {
      cards.push({ ...def, id: genId() });
    }
  }
  return cards;
}

export function buildQuickDecks(defs) {
  const expanded = expandCards(defs);
  const decks = {
    projects: [],
    action: [],
    people: [],
    crisis: [],
    directives: [],
  };

  for (const card of expanded) {
    const t = card.type;
    const d = card.deck;

    if (t === 'Project Queue' || t === 'Bonus Project') {
      decks.projects.push(card);
    } else if (t === 'Talent' || (d === 'Starter' && t === 'Team') || (d === 'Event' && t === 'Team')) {
      // Talent and starter Team cards go to people pool deck
      if (t === 'Talent' || (d === 'Starter' && t === 'Team')) {
        decks.people.push(card);
      }
    } else if (t === 'Layoff') {
      decks.crisis.push(card);
    } else if (d === 'Skill' || t === 'Soft' || t === 'Hard' || t === 'Power' || t === 'Favor') {
      decks.action.push(card);
    }
    // Starter projects go to project deck too
    if (d === 'Starter' && t === 'Project') {
      decks.projects.push(card);
    }
  }

  // Cap Favor cards at 6 to prevent free-rep dominance
  let favorCount = 0;
  decks.action = decks.action.filter(c => {
    if (c.type === 'Favor') {
      favorCount++;
      return favorCount <= 6;
    }
    return true;
  });

  // Budget cards go to a separate side deck
  decks.budget = generateBudgetCards();
  shuffle(decks.budget);

  // Add directive cards
  decks.directives = generateDirectives();

  // Shuffle 3 crisis cards into the project deck, keep 1 for Q2
  shuffle(decks.crisis);
  const crisisForProjects = decks.crisis.splice(0, Math.min(3, decks.crisis.length));
  for (const c of crisisForProjects) {
    c._isCrisis = true;
    decks.projects.push(c);
  }

  // Shuffle all
  shuffle(decks.projects);
  shuffle(decks.action);
  shuffle(decks.people);
  shuffle(decks.directives);

  return decks;
}

function generateBudgetCards() {
  const templates = [
    { symbols: ['tri', 'tri'], label: '2 Triangles' },
    { symbols: ['tri', 'tri'], label: '2 Triangles' },
    { symbols: ['tri', 'tri'], label: '2 Triangles' },
    { symbols: ['tri', 'tri'], label: '2 Triangles' },
    { symbols: ['tri', 'tri'], label: '2 Triangles' },
    { symbols: ['sq', 'sq'], label: '2 Squares' },
    { symbols: ['sq', 'sq'], label: '2 Squares' },
    { symbols: ['sq', 'sq'], label: '2 Squares' },
    { symbols: ['sq', 'sq'], label: '2 Squares' },
    { symbols: ['sq'], label: '1 Square' },
    { symbols: ['sq'], label: '1 Square' },
    { symbols: ['tri'], label: '1 Triangle' },
    { symbols: ['tri'], label: '1 Triangle' },
    { symbols: ['tri'], label: '1 Triangle' },
    { symbols: ['tri'], label: '1 Triangle' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'sq'], label: '1 Triangle + 1 Square' },
    { symbols: ['tri', 'tri', 'sq'], label: '2 Triangles + 1 Square' },
    { symbols: ['tri', 'tri', 'sq'], label: '2 Triangles + 1 Square' },
    { symbols: ['tri', 'tri', 'sq'], label: '2 Triangles + 1 Square' },
  ];
  return templates.map(t => ({
    id: genId(),
    name: t.label,
    type: 'budget',
    deck: 'Budget',
    symbols: t.symbols,
    value: 0,
    _isBudget: true,
  }));
}

function generateDirectives() {
  const defs = [
    { name: 'Board Wants a Big Win', desc: 'First to complete a project worth 5+ reward', reward: 10 },
    { name: 'Cost-Cutting Initiative', desc: 'First to complete a project using 0 pushed cards', reward: 8 },
    { name: 'Talent Showcase', desc: 'First with 4+ people on their field', reward: 8 },
    { name: 'Ship Fast', desc: 'First to complete 2 projects total', reward: 10 },
    { name: 'Innovation Push', desc: 'First to complete a Bonus Project', reward: 8 },
    { name: 'Reliability Mandate', desc: 'First to complete 2 projects without failing any', reward: 8 },
    { name: 'Cross-Team Excellence', desc: 'First to lend a person that helps complete a project', reward: 8 },
    { name: 'Resource Efficiency', desc: 'First to complete a project using exactly the minimum people', reward: 10 },
  ];
  return defs.map(d => ({ ...d, id: genId(), _isDirective: true, claimed: false }));
}

export const AGENDAS = [
  // Tier A — Action-based
  { name: 'Speed Demon', desc: 'Complete 2 projects total', tier: 'A', check: (p) => p.completedProjects.length >= 2 },
  { name: 'Double Down', desc: 'Complete 2 projects in the same quarter', tier: 'A', check: (p) => {
    for (let q = 1; q <= 3; q++) {
      if (p.completedProjects.filter(c => c._completedQ === q).length >= 2) return true;
    }
    return false;
  }},
  { name: 'Poacher', desc: 'Successfully poach a person from another player', tier: 'A', check: (p) => (p._poachCount || 0) >= 1 },
  { name: 'Dealmaker', desc: 'Complete 3 trades across the game', tier: 'A', check: (p) => (p.trades || 0) >= 3 },
  { name: 'Lean Machine', desc: 'Complete a project with 0 square cost', tier: 'A', check: (p) => p.completedProjects.some(c => (c.opExCost || 0) === 0) },
  { name: 'Clutch Player', desc: 'Complete a project you committed to in Q3', tier: 'A', check: (p) => p.completedProjects.some(c => c._committedQ === 3 && c._completedQ === 3) },
  // Tier B — Board-state
  { name: 'Empire Builder', desc: 'Have 5+ people on your field at game end', tier: 'B', check: (p) => p.people.length >= 5 },
  { name: 'Big Fish', desc: 'Complete a project worth 5+ reward', tier: 'B', check: (p) => p.completedProjects.some(c => (c.reward || 0) >= 5) },
  { name: 'Specialist', desc: 'Complete a project using a "counts as 2" person', tier: 'B', check: (p) => p.completedProjects.some(c => c._usedPremium) },
  { name: 'Full House', desc: 'Have people committed to 2+ projects simultaneously', tier: 'B', check: (p) => (p._peakCommittedProjects || 0) >= 2 },
  { name: 'Jack of All Trades', desc: 'Have 3+ different role types on your field', tier: 'B', check: (p) => {
    const types = new Set(p.people.map(pe => pe.type));
    return types.size >= 3;
  }},
  // Tier C — Social
  { name: 'Networker', desc: 'Trade with every other player at least once', tier: 'C', check: (p, s) => {
    const others = s.players.filter(o => o !== p);
    return others.every(o => (p._tradedWith || []).includes(o.name));
  }},
  { name: 'Generous Leader', desc: 'Lend a person to another player\'s project', tier: 'C', check: (p) => (p._lendCount || 0) >= 1 },
  { name: 'Survivor', desc: 'Be the only player to complete a project in any single quarter', tier: 'C', check: (p, s) => (p._soloCompleteQ || false) },
  { name: 'Opportunist', desc: 'Claim a management directive', tier: 'C', check: (p, s) => s.claimedDirectives.some(d => d.playerId === s.players.indexOf(p)) },
];

export function getHireCost(person) {
  const name = (person.name || '').toLowerCase();
  if (name.includes('tech lead') || name.includes('specialist')) return 4;
  if (name.includes('junior') || name.includes('intern') || name.includes('ai companion')) return 1;
  return 2;
}

export function isPremium(person) {
  const name = (person.name || '').toLowerCase();
  return name.includes('tech lead') || name.includes('specialist');
}

export function getSquareCost(project) {
  const raw = project.opExCost || 0;
  // Quick Mode caps square cost at 3 to keep budget decisions tight
  return Math.min(raw, 3);
}

export function getMembersNeeded(project) {
  const raw = project.members || 1;
  if (raw <= 2) return raw;
  return 2;
}
