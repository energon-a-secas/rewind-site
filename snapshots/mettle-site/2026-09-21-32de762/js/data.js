// ── Content: virtues, ranks, themes, rubric markers ──────────
// The probe library. Themes expand into chained rungs (the "shame
// ladder"); the scorer classifies each free-text answer into a rung
// level using the heuristic markers below. See future/tools/maturity-mapper/SPEC.md.

/** The five virtue axes (light abstraction of Royal Virtues). */
export const VIRTUES = [
  { key: 'courage',     label: 'Courage',     blurb: 'Facing hard truths and confronting failure.' },
  { key: 'wisdom',      label: 'Wisdom',      blurb: 'Depth of reasoning; seeing through deceit.' },
  { key: 'tolerance',   label: 'Tolerance',   blurb: 'Empathy; reading and accepting diverse people.' },
  { key: 'eloquence',   label: 'Eloquence',   blurb: 'Articulating and persuading under pressure.' },
  { key: 'imagination', label: 'Imagination', blurb: 'Vision; envisioning a better future state.' },
];

/** Maturity ranks by overall score (0-100). Sovereign = the Royal mastery tier. */
export const RANKS = [
  { key: 'dormant',   label: 'Dormant',   min: 0,  blurb: 'Reasoning runs on borrowed authority. The model is not yet your own.' },
  { key: 'awakening', label: 'Awakening', min: 21, blurb: 'Surface causes named. The first cracks of a self-owned model.' },
  { key: 'adept',     label: 'Adept',     min: 41, blurb: 'Cause and effect held with named tradeoffs. Solid working judgment.' },
  { key: 'realized',  label: 'Realized',  min: 66, blurb: 'Second-order effects and self-ownership. You see the system, not the step.' },
  { key: 'sovereign', label: 'Sovereign', min: 86, blurb: 'Principles transfer across domains, uncertainty held openly. The uncompromised Self.' },
];

/**
 * Fast-mode options per rung kind. Each option maps to a rung level so the
 * casual multiple-choice path still produces a meaningful (non-rigorous)
 * estimate. Fast mode is exploration only — it never updates the real rank.
 */
export const FAST_OPTIONS = {
  trigger: [
    { level: 0, text: 'It just happened and I moved on.' },
    { level: 1, text: 'I felt bad about it for a while.' },
    { level: 2, text: 'I traced what led to it and why.' },
    { level: 3, text: 'I saw it as part of a pattern I own.' },
  ],
  recovery: [
    { level: 0, text: 'I would handle it the same way.' },
    { level: 1, text: 'I would try to feel less bad about it.' },
    { level: 2, text: 'I would change the specific thing that failed.' },
    { level: 3, text: 'I would change the system so it cannot recur.' },
  ],
  durability: [
    { level: 0, text: 'I have not really thought about it.' },
    { level: 1, text: 'I hope I would not repeat it.' },
    { level: 2, text: 'I know the trigger now, so probably not.' },
    { level: 3, text: 'I own the root, so it would not hold over time.' },
  ],
  root: [
    { level: 0, text: 'It is just how things are.' },
    { level: 1, text: 'It is good to handle these things well.' },
    { level: 2, text: 'Because the cost of not doing it is real.' },
    { level: 3, text: 'Because my integrity is the root others rely on.' },
  ],
  transfer: [
    { level: 0, text: 'It only applies to that situation.' },
    { level: 1, text: 'Maybe it shows up elsewhere too.' },
    { level: 2, text: 'It applies to a few related situations.' },
    { level: 4, text: 'The same principle transfers across domains.' },
  ],
};

/** Rung rubric: marker phrases per level (0 External → 4 Integrated). */
export const RUBRIC = [
  { level: 0, name: 'External',   markers: ['because i was told', 'they said', 'the rules', 'supposed to', 'my boss', 'everyone says', 'just how it is', 'told me'] },
  { level: 1, name: 'Surface',    markers: ['good for', 'bad for', 'it helps', 'makes sense', 'obviously', 'common sense', 'i guess', 'it just'] },
  { level: 2, name: 'Causal',     markers: ['because if', 'leads to', 'so that', 'in order to', 'tradeoff', 'trade-off', 'the cost is', 'which means', 'as a result'] },
  { level: 3, name: 'Systemic',   markers: ['everything fails', 'over time', 'second-order', 'downstream', 'the system', 'compounds', 'feedback', 'long run', 'root cause', 'i own', 'my responsibility'] },
  { level: 4, name: 'Integrated', markers: ['same principle', 'transfers to', 'in other domains', 'i could be wrong', 'i am not certain', 'depends on', 'the deeper pattern', 'across contexts', 'unless', 'how i would find out'] },
];

/**
 * Theme library. Each theme tags 1-2 virtues and expands into a chain
 * of rungs anchored on failure & recovery, not success.
 */
export const THEMES = [
  {
    id: 'shame-leadership',
    title: "Couldn't answer in front of leadership",
    virtues: ['courage', 'eloquence'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Recall a moment you could not answer a question in front of people who held power over you. What happened, and what did you feel?' },
      { id: 'R1', kind: 'recovery',   prompt: 'Could you exit that situation more gracefully now. A more dignified, even neutral, loss? Describe exactly how.' },
      { id: 'R2', kind: 'durability', prompt: 'Do you believe you would fall to it again? Why, or why not?' },
      { id: 'R3', kind: 'root',       prompt: 'What has to be true about you for that answer to hold?' },
      { id: 'R4', kind: 'transfer',   prompt: 'Where else does that same root show up in your life?' },
    ],
  },
  {
    id: 'public-mistake',
    title: 'Owning a public mistake',
    virtues: ['courage', 'wisdom'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Describe a mistake of yours that others saw. What was your first instinct in that moment?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How would you own it now in a way that costs you less and earns more respect?' },
      { id: 'R2', kind: 'durability', prompt: 'What stops you from repeating the original instinct next time?' },
      { id: 'R3', kind: 'root',       prompt: 'Why does owning it matter to you: beyond looking good?' },
    ],
  },
  {
    id: 'flawed-plan',
    title: 'Spotting a flawed plan everyone endorsed',
    virtues: ['wisdom', 'eloquence'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Recall a time you sensed a plan was wrong while everyone around you approved it. What did you do?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How would you raise the concern now so it lands instead of getting dismissed?' },
      { id: 'R2', kind: 'durability', prompt: 'Would you speak up next time, or stay quiet again? Be honest about why.' },
      { id: 'R3', kind: 'root',       prompt: 'What belief about yourself decides whether you speak or stay silent?' },
    ],
  },
  {
    id: 'values-clash',
    title: 'Working with someone whose values clash with yours',
    virtues: ['tolerance', 'wisdom'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Think of someone whose values genuinely clash with yours. What is hardest about working with them?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How could you work with them well without abandoning what you believe?' },
      { id: 'R2', kind: 'durability', prompt: 'Could you hold that stance under stress, or would you slip back into judgment?' },
      { id: 'R3', kind: 'root',       prompt: 'What would you have to understand about them for the friction to ease?' },
    ],
  },
  {
    id: 'hostile-room',
    title: 'Defending a decision in a hostile room',
    virtues: ['eloquence', 'courage'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Recall defending a decision to people who wanted it to fail. Where did it go wrong?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How would you hold the room now: a more dignified, even neutral, outcome?' },
      { id: 'R2', kind: 'durability', prompt: 'Do you believe you would crack under that pressure again? Why?' },
      { id: 'R3', kind: 'root',       prompt: 'What has to be true about your preparation for you to stay composed?' },
      { id: 'R4', kind: 'transfer',   prompt: 'Where else does staying composed under pressure decide your outcomes?' },
    ],
  },
  {
    id: 'unheard-voice',
    title: 'Being talked over and unheard',
    virtues: ['eloquence', 'tolerance'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Recall being repeatedly talked over while you had something real to say. What did you feel?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How would you reclaim the floor now without escalating?' },
      { id: 'R2', kind: 'durability', prompt: 'Would the same thing happen again, or have you changed how you hold space?' },
      { id: 'R3', kind: 'root',       prompt: 'What does being heard actually mean to you, at the root?' },
    ],
  },
  {
    id: 'better-future',
    title: 'Describing the better version of your work',
    virtues: ['imagination', 'wisdom'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Describe what your work or team looks like at its best, if nothing held it back.' },
      { id: 'R1', kind: 'recovery',   prompt: 'What is the first real constraint between today and that picture, and how would you move it?' },
      { id: 'R2', kind: 'durability', prompt: 'Is that vision durable, or does it dissolve the moment pressure returns? Why?' },
      { id: 'R3', kind: 'root',       prompt: 'Why does that better version matter to you specifically?' },
    ],
  },
  {
    id: 'comfort-stagnation',
    title: 'Choosing comfort over growth',
    virtues: ['courage', 'imagination'],
    rungs: [
      { id: 'R0', kind: 'trigger',    prompt: 'Recall a time you chose the safe, comfortable option and quietly knew you were avoiding something. What was it?' },
      { id: 'R1', kind: 'recovery',   prompt: 'How would you make the braver choice now without being reckless?' },
      { id: 'R2', kind: 'durability', prompt: 'Will you default to comfort again next time? Be honest about the pull.' },
      { id: 'R3', kind: 'root',       prompt: 'What fear sits underneath the comfort you reach for?' },
    ],
  },
];
