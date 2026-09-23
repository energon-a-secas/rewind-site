// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Card legend ──────────────────────────────────────────────
// Every card face carries a cost symbol, a timing symbol, an effect tag and a
// stat footer, and until now nothing anywhere said what any of them meant. This
// is the key: an annotated example card beside a definition list.
//
// The example is a real render through renderCardHTML, so the legend cannot
// drift away from the cards it explains.

import { renderCardHTML, costGlyph } from './card-component.js';

const EXAMPLE_CARD = {
  name: 'Architecture Modernization',
  type: 'Project',
  deck: 'Business',
  value: 5,
  members: 5,
  deadline: 3,
  reward: 15,
  penalty: 9,
  minQuarter: 2,
  triggerTiming: 'when completed',
  effectType: 'progress',
  flavorText: 'Nobody remembers who shipped it. Everybody remembers who broke it.',
  skill: 'Needs 5 people held for 3 quarters. Complete it to earn the reward; leave it unfinished past its deadline and you pay the penalty.',
};

const REGIONS = [
  ['Title bar', 'The card name, and a category badge on the right saying what the card <em>does</em> — Deliver, Recruit, Boost.'],
  ['Trigger row', 'Cost, timing, earliest playable quarter, and the effect tag. Everything you need to decide whether you can play it now.'],
  ['Art panel', 'The type glyph, tinted with the card type colour. Decorative — it repeats the border colour.'],
  ['Flavour line', 'Italic. Never rules text; it is only there for tone.'],
  ['Effect box', 'What the card actually does. This is the binding text.'],
  ['Stat footer', 'The numbers: people, quarters, reward, penalty.'],
];

// Tinted with the same tokens the cards use, so the legend teaches the
// colour association as well as the shape.
const COST = [
  [`<span class="cl-tint cl-tint--opex">${costGlyph('opex')}</span>`, 'OpEx — a coin',
   'Money that leaves every quarter. Soft skills and people.'],
  [`<span class="cl-tint cl-tint--capex">${costGlyph('capex')}</span>`, 'CapEx — a block',
   'Bought once and kept. Hard skills and tooling.'],
  [`<span class="cl-tint cl-tint--value">${costGlyph('value')}</span>`, 'Value — a gem',
   'Generic cost, when the card is neither OpEx nor CapEx.'],
];

const TIMING = [
  ['▸', 'On Play', 'Resolves the moment you play it.'],
  ['✓', 'On Finish', 'Resolves when the project completes.'],
  ['∞', 'Passive', 'Stays in effect while the card is on your board.'],
  ['◷', 'Quarter End', 'Resolves during quarter resolution, not on your turn.'],
  ['↺', 'Reactive', 'Played out of turn, in response to something else.'],
  ['Q<i>n</i>+', 'Timing gate', 'Cannot be played before that quarter.'],
];

const STATS = [
  ['people', 'People needed', 'How many team members the project must hold to count as staffed.'],
  ['quarters', 'Deadline', 'Quarters of <em>sustained</em> staffing to finish. Piling on extra people does not finish it faster.'],
  ['reward', 'Reward', 'Reputation gained on completion.'],
  ['penalty', 'Penalty', 'Reputation lost if the deadline passes unfinished.'],
  ['negation', 'Severance / shock value', 'How hard this card bites: severance owed on a Layoff, reputation lost on a Rush Quarter. It is not a price anyone can pay to cancel the card.'],
];

const EFFECTS = [
  ['Draw', 'Puts cards in your hand.'],
  ['Progress', 'Advances a project without staffing it.'],
  ['Block / Negate', 'Cancels a card. Reaction cards are held in hand and fire when a rival targets you.'],
  ['Shield', 'Absorbs the next Event drawn for you. Only Defensive Maneuver also stops a rival’s play.'],
  ['Steal', 'Takes a person or project from another player.'],
  ['Freeze', 'Stops progress or blocks an action for a quarter.'],
  ['Boost', 'Multiplies or adds to an existing gain.'],
  ['Rep+ / Rep−', 'Direct reputation change.'],
  ['Risk', 'A gamble — read the effect box before playing.'],
];

const row = (a, b, c) => `<div class="cl-row">
  <span class="cl-sym">${a}</span>
  <span class="cl-def"><b>${b}</b>${c ? `<span>${c}</span>` : ''}</span>
</div>`;

export function showCardLegend() {
  if (document.querySelector('.card-legend-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'card-legend-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'card-legend-title');

  overlay.innerHTML = `
    <div class="card-legend">
      <header class="cl-header">
        <h2 id="card-legend-title">Reading a card</h2>
        <button class="cl-close" type="button" aria-label="Close card legend">&times;</button>
      </header>

      <div class="cl-body">
        <div class="cl-example">
          ${renderCardHTML(EXAMPLE_CARD, { size: 'lg' })}
          <p class="cl-example-note">A worked example. Every symbol below appears on this card.</p>
        </div>

        <div class="cl-defs">
          <section class="cl-group">
            <h3>Regions, top to bottom</h3>
            ${REGIONS.map(([a, b]) => row('', a, b)).join('')}
          </section>

          <section class="cl-group">
            <h3>Cost</h3>
            ${COST.map(([a, b, c]) => row(a, b, c)).join('')}
          </section>

          <section class="cl-group">
            <h3>Timing</h3>
            ${TIMING.map(([a, b, c]) => row(a, b, c)).join('')}
          </section>

          <section class="cl-group">
            <h3>Stat footer</h3>
            ${STATS.map(([a, b, c]) => row(`<span class="cl-stat cl-stat--${a}"></span>`, b, c)).join('')}
          </section>

          <section class="cl-group">
            <h3>Effect tags</h3>
            ${EFFECTS.map(([a, b]) => row('', a, b)).join('')}
          </section>
        </div>
      </div>
    </div>`;

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  function onKey(e) { if (e.key === 'Escape') close(); }

  overlay.querySelector('.cl-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
  overlay.querySelector('.cl-close').focus();
}

window._showCardLegend = showCardLegend;
