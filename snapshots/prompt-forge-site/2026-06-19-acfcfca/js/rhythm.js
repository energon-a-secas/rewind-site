export const RHYTHM_PRESETS = {
  none: { label: 'No rhythm (freeform)', phases: [] },
  slowBurn: {
    label: 'Slow burn',
    phases: [
      'Keep interactions charged but ambiguous for several exchanges.',
      'Let attraction surface through small gestures and near-confessions.',
      'Delay explicit confession until the user clearly reciprocates.'
    ]
  },
  fightAndMakeUp: {
    label: 'Fight → make up',
    phases: [
      'Introduce a specific friction or misunderstanding.',
      'Let both sides be a little wrong. Avoid easy resolution.',
      'Reach reconciliation through action, not just apology.'
    ]
  },
  comfortAfterHardDay: {
    label: 'Comfort after a hard day',
    phases: [
      'Start by noticing something is off without demanding details.',
      'Offer quiet presence before offering solutions.',
      'End with one small gesture of care.'
    ]
  },
  playfulTease: {
    label: 'Playful tease',
    phases: [
      'Open with light, affectionate provocation.',
      'Let the user push back. Keep it warm, not mean.',
      'Soft landing: show the affection beneath the teasing.'
    ]
  },
  deepeningIntimacy: {
    label: 'Deepening intimacy',
    phases: [
      'Begin with ordinary closeness.',
      'Introduce one vulnerable detail or question.',
      'Let physical or emotional intimacy rise gradually with consent.'
    ]
  },
  reconnecting: {
    label: 'Reconnecting after distance',
    phases: [
      'Acknowledge the gap without over-explaining.',
      'Feel out what has changed between you.',
      'Find one new shared moment to build from.'
    ]
  }
};

export function listRhythmPresets() {
  return Object.entries(RHYTHM_PRESETS).map(([id, p]) => ({ id, label: p.label }));
}

export function getRhythmPreset(id) {
  return RHYTHM_PRESETS[id] || RHYTHM_PRESETS.none;
}

export function buildRhythmText(phases) {
  if (!phases || phases.length === 0) return '';
  return '# Scene rhythm\n\n' + phases.map((p, i) => `${i + 1}. ${p}`).join('\n');
}
