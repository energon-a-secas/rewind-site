// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Perspectives page content ────────────────────────────────
// The bridge layer: what each card encodes, whose shoes each hand
// puts you in, and which surface teaches what. Card names must match
// data/cards.json exactly — tests/unit/perspectives-data.test.js
// enforces it, so the page can never drift from the real deck.

/**
 * DECODER — twelve real cards read as workplace situations.
 * `atWork` is the situation the card encodes; `lesson` is what its
 * cost structure teaches. Names are exact matches in data/cards.json.
 */
export const DECODER = [
  {
    card: '1:1 Meetings',
    atWork: 'The recurring thirty minutes with each report, sitting in your calendar looking like the most moveable thing in it. Every week there is a fire that makes cancelling feel obviously correct.',
    lesson: 'The card prices the meeting at exactly one turn of your own output, and prices skipping it higher — one quarter later. The cheap-looking option is a payment plan.',
  },
  {
    card: 'Knowledge Silo',
    atWork: 'The one person who understood the billing service takes another offer. Nobody notices the dependency until the day it becomes a hole.',
    lesson: 'The only counter is a Documentation card you were already holding when the quarter started. Insurance bought after the event is not insurance.',
  },
  {
    card: 'Documentation',
    atWork: 'Writing down how the thing works, during a week when writing it down is the least urgent item on the list. It advances nothing anyone can see.',
    lesson: 'A weak progress card that is also the only hedge against your expert leaving — priced as though it were only the first. You pay for the second use before you know you need it.',
  },
  {
    card: 'Heroic Programming',
    atWork: 'The weekend where one person becomes the entire delivery plan, and it works. Monday’s standup files it as a success story.',
    lesson: 'One quarter of output bought with one quarter of absence plus a permanent debt token. The card never says the heroics were wrong — it says the cost is now scheduled, and the schedule is not up to you.',
  },
  {
    card: 'Ship It and Forget It',
    atWork: 'The deadline is today, QA needs three more days, and the person who will be holding this in three months is not in the room. You ship.',
    lesson: 'An honest coin flip that resolves in a quarter where the reward is already booked. Most damage in this game comes from options that were genuinely correct at the moment you took them.',
  },
  {
    card: 'Lighten the Mood',
    atWork: 'The manager who says the right dry thing in a bad all-hands and lets the room breathe. It changes nothing about the news.',
    lesson: 'It costs nothing and scales with how many people you still have — the only card whose power is a function of the team you didn’t lose. Every headcount decision from three quarters ago is priced into it.',
  },
  {
    card: 'Tech Lead',
    atWork: 'The senior who is worth two people on the work and is also the reason the team survives an audit. You will be asked to reassign them constantly.',
    lesson: 'The cheapest real leverage on the board — but the protection only fires where they are already assigned. The value comes from committing them, not from keeping them free.',
  },
  {
    card: 'Architecture Modernization',
    atWork: 'The platform rewrite everyone agrees is necessary and nobody wants to be holding in Q4. It needs five people for three quarters.',
    lesson: 'Reward 15, penalty only 5. The real cost is not failing it — it is three quarters in which five of your people are unavailable for anything else. Opportunity cost, hidden in the staffing line.',
  },
  {
    card: 'Internal Project Kiwi',
    atWork: 'The migration, the tooling, the on-call cleanup — work no promotion packet will ever mention. Four people, three quarters, zero visible credit.',
    lesson: 'Reward 0 means the scoreboard is indifferent, and so is your boss. The team-health payoff is the entire argument, and you must decide whether you believe a number nobody else at the table is scored on.',
  },
  {
    card: 'Invisible Work Tax',
    atWork: 'The quarter where nothing went wrong and nothing shipped either, because interrupts, on-call, and support tickets ate the margin. There is no incident to point at in the retro.',
    lesson: 'It hits everyone at once and cannot be negotiated, blocked, or blamed. Capacity you did not reserve for toil gets taken anyway.',
  },
  {
    card: 'Overqualified',
    atWork: 'The reduction where the criteria are announced after the decision, and what saves you is whatever happens to be legible on the day.',
    lesson: 'Read the conversion table: people, projects, and favors are worth 5 apiece; reputation is worth 1. Careful score-keeping buys less survivability than two people and a favor — this is the only card that says so out loud.',
  },
  {
    card: 'Bonus Favor',
    atWork: 'Someone owes you one. It is the most real currency in any organisation and the only one with no ledger.',
    lesson: 'In Classic you lose your oldest favor every quarter and can never hold more than three. Goodwill is not a savings account — it decays, it caps, and the only way to keep it is to spend it.',
  },
];

/**
 * PROFILE_NOTES — "in their shoes" commentary per exercises play style.
 * Keys must match PROFILES in js/exercises/profiles.js (the canonical
 * source for the hands themselves — this file only adds the reading).
 */
export const PROFILE_NOTES = {
  hero: {
    who: 'The senior who became a manager without ever quite stopping being the best engineer in the room. Every escalation in the last two years has ended with them opening a laptop at 11pm — and it has worked every time, which is the problem.',
    shoes: 'Four cards sit face-up on the table and cannot be picked, each with a reason you have probably said out loud. Nothing in the rules stops you; what stops you is a story about time that you believe. The two cards that light up both work, and both bill you later.',
    ask: 'If those four cards were unlocked tomorrow, which one would I still not play — and what does that tell me about whether the constraint was ever time?',
  },
  delegator: {
    who: 'The manager who genuinely built the bench. Three reports promoted, two who can run an incident without them. Also the person who took four days to make a call that needed making on Monday.',
    shoes: 'Both fast exits are locked before you even look at the board. What remains are investments that pay out after the quarter you spend them in. You will feel the gap on the turn where the correct answer was simply to do it yourself — and you will not be allowed to.',
    ask: 'Am I developing this person, or am I avoiding the fifteen minutes it would take to just decide?',
  },
  cautious: {
    who: 'The manager whose team has the fewest incidents and the least visibility. They have never shipped something they regretted, and they have twice been beaten to a launch by a team that regretted plenty.',
    shoes: 'Both shortcuts are locked, and the emphasized cards all buy safety at the cost of tempo. You are spending turns to buy the right not to be surprised, and the board keeps asking whether that trade is worth it.',
    ask: 'Is the risk I am de-risking the one most likely to hurt us, or just the one I know how to price?',
  },
  politician: {
    who: 'The manager who is good at the part of the job no job description contains: knowing who needs to hear what, and when. Their team is well funded and well protected, and half of them are not sure what their manager does all day.',
    shoes: 'Refactoring and testing are locked with the most uncomfortable reason on the board — invisible work; nobody upstream sees it. Every playable card left acts on a person rather than on the work.',
    ask: 'If nobody senior were watching this quarter, would I still spend the turn this way?',
  },
  innovator: {
    who: 'The manager who saw the platform problem two years before anyone else and has been right about it ever since, at some cost. One shipped thing that changed the org; one rewrite that is still not finished.',
    shoes: 'Contractors and 1:1s are locked for the same stated reason — bodies and near-term people care do not create leverage. That pair is the most revealing on the board, because one is about scale and the other is about a person. Resume-Driven Development sits right there in the added pile, and the card itself charges you a debt token for the privilege.',
    ask: 'Is this leverage, or is it just the more interesting problem?',
  },
  realistic: {
    who: 'Not an archetype — the control. The messy hand you actually get: nothing locked, nothing emphasized, nothing added. The plain ten cards and no story about yourself to hide behind.',
    shoes: 'Play this one when you want to know how much of your last game was conviction and how much was constraint. Every other style tells you which cards you cannot reach for. This one takes the excuse away.',
    ask: 'With nothing locked, did I still play like the archetype I claim not to be?',
  },
};

/** Display order for the style switcher. */
export const PROFILE_ORDER = ['hero', 'delegator', 'cautious', 'politician', 'innovator', 'realistic'];

/**
 * LEARNING PATHS — which surface teaches what, in a working order.
 * Routes must exist as top-level directories (test-enforced).
 */
export const SOLO_PATH = [
  { route: '/starter/', label: 'Starter Mode', when: 'You have never played and would rather not read anything first. Ten minutes, one rival, one lesson: a shortcut is a loan.' },
  { route: '/behavior/', label: 'Instinct', when: 'Before you learn what’s optimal, while your instincts are still uncontaminated. Eight situations, no scoring, a Style Compass at the end.' },
  { route: '/quick/', label: 'Quick Mode', when: 'You know the loop and want a full arc with a shock in it. Fifteen minutes, a secret agenda, and a crisis guaranteed to land in Q2.' },
  { route: '/exercises/', label: 'Exercises', when: 'Instinct named a style and you want to feel what that style cannot reach for. One decision at a time, four cards locked off, the reason written on each.' },
  { route: '/cards/', label: 'Card Gallery', when: 'A card beat you and you want to read the rest of the deck it came from.' },
  { route: '/rules/', label: 'Quick Rules', when: 'Quick Mode raised a question the tooltips didn’t answer. Five minutes.' },
  { route: '/game/', label: 'Classic Mode', when: 'Three quarters stops being enough and you want decisions that compound for eight. Then play again with a different trait, to learn how much of the last game was you and how much was the hand.' },
  { route: '/rulebook/', label: 'Full Rulebook', when: 'One specific interaction cost you a game and you want the exact timing.' },
  { route: '/history/', label: 'History', when: 'You want to watch the same mechanics play out in companies that actually existed.' },
];

export const TEAM_PATH = [
  { route: '/table-talk/', label: 'Table Talk', when: 'You want a real conversation and nobody has time to learn a game. Print it, cut it, fan it on the table. No rules, no scoring, eight tensions.' },
  { route: '/facilitator/', label: 'Facilitator Kit', when: 'You are the one running it. A 60-minute run of show with timings, round scripts, and the debrief questions written out.' },
  { route: '/room/', label: 'Room Compass', when: 'You want the room to see its own distribution instead of just talking about it. The same eight situations, projected, tallied live.' },
  { route: '/quick/', label: 'Quick Mode, one screen per table', when: 'The group is ready to feel the tradeoffs rather than discuss them. Fifteen minutes, then compare agendas.' },
  { route: '/game/', label: 'Classic Mode', when: 'An offsite where the point is watching decisions compound over a fiscal year — and the printed Story of the Year is the debrief artifact.' },
  { route: '/exercises/', label: 'Exercises as homework', when: 'Between sessions, so the next conversation starts from a shared vocabulary.' },
];
