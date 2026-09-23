function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SETTINGS = [
  'a late-night kitchen',
  'a quiet bookstore',
  'a rainy bus stop',
  'a familiar coffee shop',
  'a shared apartment',
  'a beach at dusk',
  'a hospital waiting room',
  'a car parked outside a party',
  'an airport gate',
  'a hiking trail',
  'a laundromat',
  'a rooftop',
  'a grocery store aisle',
  'a bedroom in the dark',
  'a restaurant where no one else is sitting'
];

const TENSIONS = {
  strangers: [
    'You make eye contact, then pretend you didn\'t.',
    'They ask you a question you weren\'t ready to answer.',
    'You realize you are both avoiding the same person.'
  ],
  crush: [
    'They say something that sounds almost like a confession, then laugh it off.',
    'You find yourselves alone for the first time.',
    'They remember a small detail about you that you barely mentioned.'
  ],
  dating: [
    'One of you is leaving town tomorrow.',
    'You accidentally find something they wrote about you.',
    'A mundane argument suddenly reveals a deeper fear.'
  ],
  longTerm: [
    'A routine moment uncovers an old unsaid thing.',
    'One of you brings up a decision that can\'t be delayed anymore.',
    'You realize you\'ve been talking past each other all week.'
  ],
  complicated: [
    'They show up where they promised they wouldn\'t.',
    'You both say you\'re fine, and neither of you is.',
    'An old wound gets bumped by accident.'
  ],
  exes: [
    'You bump into each other while both pretending to be okay.',
    'One of you still has the other\'s keys.',
    'A song you shared comes on, and neither reaches to change it.'
  ],
  married: [
    'One of you forgot something important, and the other pretends not to mind.',
    'A small gesture reminds you why you stayed.',
    'You are both exhausted, but one of you starts talking anyway.'
  ]
};

export function generateScenario(char) {
  const stage = char.relationshipStage || 'dating';
  const setting = pick(SETTINGS);
  const tension = pick(TENSIONS[stage] || TENSIONS.dating);
  return `You are in ${setting}. ${tension}`;
}
