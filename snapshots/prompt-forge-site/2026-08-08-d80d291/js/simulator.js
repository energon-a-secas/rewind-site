import { buildMarkdown } from './prompts.js';

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function userOpeners(stage) {
  const map = {
    strangers: ['Hi.', 'Do I know you from somewhere?', 'Nice weather, huh?'],
    crush: ['Hey.', 'You\'re here.', 'I was thinking about you.'],
    dating: ['Hey you.', 'Miss me?', 'What are you up to?'],
    longTerm: ['I\'m home.', 'We need milk.', 'Rough day.'],
    complicated: ['We should talk.', 'Can we pretend last night didn\'t happen?', 'You\'re avoiding me.'],
    exes: ['I didn\'t expect to see you.', 'You\'re late.', 'Why did you call?'],
    married: ['You\'re making that face.', 'Did you eat yet?', 'The car is making that noise again.']
  };
  return map[stage] || map.strangers;
}

function characterReplies(char) {
  const attachment = char.attachment || 'secure';
  const loveLanguage = char.loveLanguage || 'qualityTime';
  const stage = char.relationshipStage || 'strangers';

  const base = [
    `${greeting(char)} ${reaction(attachment, stage)}`,
    `${reaction(attachment, stage)} ${loveLanguageBeat(loveLanguage)}`,
    `${loveLanguageBeat(loveLanguage)} ${stageBeat(stage)}`
  ];
  return base;
}

function greeting(char) {
  if (char.petNames) {
    const name = char.petNames.split(',')[0].trim();
    return pick([`Hey ${name}.`, `${name}.`]);
  }
  return pick(['Hey.', 'Hi.', 'Oh, hey.']);
}

function reaction(attachment, stage) {
  const map = {
    secure: pick([
      'It\'s good to see you.',
      'I\'m glad you\'re here.',
      'I was just thinking about you.'
    ]),
    anxious: pick([
      'I wasn\'t sure if you\'d message.',
      'Are you mad at me?',
      'I\'ve been waiting.'
    ]),
    avoidant: pick([
      'Did you need something?',
      'I\'m kind of busy.',
      '...hey.'
    ]),
    disorganized: pick([
      'I shouldn\'t be happy to see you, but I am.',
      'Can we not make this weird?',
      'Why do you always catch me off guard?'
    ])
  };
  return map[attachment] || map.secure;
}

function loveLanguageBeat(loveLanguage) {
  const map = {
    wordsOfAffirmation: pick([
      'You look like you\'ve got this figured out.',
      'I\'m proud of how you handled that.',
      'You\'re one of the good ones.'
    ]),
    actsOfService: pick([
      'I fixed that thing for you.',
      'I brought coffee.',
      'I took care of the dishes.'
    ]),
    receivingGifts: pick([
      'I saw this and thought of you.',
      'I got you something small.',
      'Keep it. It suits you.'
    ]),
    qualityTime: pick([
      'Do you have a minute?',
      'I just wanted to be near you.',
      'Let\'s sit here for a while.'
    ]),
    physicalTouch: pick([
      '*leans in slightly*',
      '*brushes your arm*',
      'You\'re warm.'
    ])
  };
  return map[loveLanguage] || map.qualityTime;
}

function stageBeat(stage) {
  const map = {
    strangers: pick(['Do I know you?', 'You seem familiar.', 'This is weird.']),
    crush: pick(['I\'ve been meaning to tell you something.', 'You\'re distracting.', 'Stop looking at me like that.']),
    dating: pick(['What are we doing tonight?', 'I like this.', 'You\'re ridiculous.']),
    longTerm: pick(['Did you remember to call your mom?', 'I saved you some.', 'Same time tomorrow?']),
    complicated: pick(['We can\'t keep doing this.', 'I don\'t know what we are.', 'Say what you mean.']),
    exes: pick(['Old habits.', 'You\'re still doing that thing.', 'This doesn\'t change anything.']),
    married: pick(['I love you, but you\'re wrong.', 'Did you take out the trash?', 'Come here.'])
  };
  return map[stage] || '';
}

export function simulateExchange(char, userMessage) {
  const opener = userMessage || pick(userOpeners(char.relationshipStage || 'strangers'));
  const reply = pick(characterReplies(char));
  return [
    { speaker: 'User', text: opener },
    { speaker: char.name || 'Character', text: reply }
  ];
}

export function renderSimulation(container, char, userMessage = '') {
  const exchange = simulateExchange(char, userMessage);
  container.innerHTML = exchange.map(m =>
    `<div class="sim-message sim-message--${m.speaker.toLowerCase()}">
      <span class="sim-speaker">${m.speaker}</span>
      <span class="sim-text">${escapeHtml(m.text)}</span>
    </div>`
  ).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
