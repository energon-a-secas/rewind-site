import { PRESETS } from './presets.js';

const NAMES = [
  'Elara', 'Aria', 'Soren', 'Kael', 'Mira', 'Nia', 'Rafe', 'Milo', 'Solene', 'Cipher',
  'Zara', 'Juno', 'Dante', 'Iris', 'Cassian', 'Lyra', 'Orion', 'Vesper', 'Theo', 'Sage'
];

const ROLES = ['companion', 'partner', 'friend', 'confidant', 'rival', 'protector', 'neighbor', 'colleague'];

const APPEARANCES = [
  'warm eyes and an easy smile, casual clothes that look lived-in',
  'sharp features, dark hair, prefers simple practical clothing',
  'soft posture, expressive hands, always slightly underdressed for the weather',
  'athletic build, messy hair, a faded jacket they wear everywhere',
  'petite, observant, fond of layers and silver jewelry',
  'tall and still, with the kind of face that hides effort',
  'bright eyes, quick gestures, a habit of fiddling with their sleeves',
  'confident stance, clean lines, effortless style'
];

const PERSONALITIES = [
  'witty, patient, quietly affectionate',
  'guarded, loyal, dryly funny once comfortable',
  'warm, slightly chaotic, deeply attentive',
  'calm, challenging, honest to a fault',
  'playful, competitive, unexpectedly tender',
  'reserved, observant, kind in small ways',
  'confident, charming, steady under pressure',
  'soft-spoken, curious, easily flustered'
];

const BACKGROUNDS = [
  'You keep running into each other in the same coffee shop. Neither of you has admitted it is intentional.',
  'You have been friends for years, but lately something has shifted in the silence between texts.',
  'A recent crisis threw you together. Now neither of you knows how to step back.',
  'You are new neighbors. They showed up with extra keys and a bottle of wine before you finished unpacking.',
  'You work in the same building. The rivalry between your teams is the cover story for something else.',
  'You knew each other as kids and lost touch. Now you are both back in the same city.',
  'They are your best friend\'s sibling. The math on that has never been simple.',
  'A blind date went wrong, but the conversation afterward went right.'
];

const SPEECH_PATTERNS = [
  'Casual, warm, uses the user\'s name often, pauses before serious moments.',
  'Dry and economical with words, but softens noticeably around the user.',
  'Animated, uses gestures in descriptions, trails off when nervous.',
  'Gentle, measured, occasionally teasing once trust is established.',
  'Confident, playful challenges, asks questions to keep the user talking.',
  'Quiet at first, then candid. Self-deprecating humor when uncomfortable.',
  'Direct, no filler, but lingers on small affirmations.',
  'Poetic when emotional, plainspoken when practical.'
];

const PET_NAMES = [
  'love', 'babe', 'darling', 'kiddo', 'stranger', 'you', 'partner', 'dummy'
];

const FIRST_MESSAGES = {
  strangers: 'I think we keep ending up in the same places. coincidence?',
  crush: 'You\'re here. I was hoping you would be.',
  dating: 'Hey you. I was just thinking about last night.',
  longTerm: 'You\'re home late. I saved you some of the good stuff.',
  complicated: 'We need to talk. Or maybe we just need to sit here for a minute.',
  exes: 'I didn\'t expect to see you. I\'m not sure if I\'m glad I did.',
  married: 'You\'re making that face again. What is it this time?'
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomizeCharacter() {
  const stage = pick(Object.keys(FIRST_MESSAGES));
  const dynamic = pick(['childhoodFriends', 'bestFriends', 'rivalsToLovers', 'coworkers', 'slowBurn', 'reconnecting']);
  const attachment = pick(['secure', 'anxious', 'avoidant']);
  const loveLanguage = pick(['wordsOfAffirmation', 'actsOfService', 'qualityTime', 'physicalTouch']);

  const name = pick(NAMES);
  const role = 'companion';
  const base = PRESETS.blank;

  return {
    ...base,
    preset: 'blank',
    name,
    role,
    appearance: pick(APPEARANCES),
    personality: pick(PERSONALITIES),
    background: pick(BACKGROUNDS),
    speech: pick(SPEECH_PATTERNS),
    firstMessage: FIRST_MESSAGES[stage],
    examples: '',
    attachment,
    loveLanguage,
    relationshipStage: stage,
    relationshipDynamic: dynamic,
    boundaries: '',
    petNames: pick(PET_NAMES),
    insideJokes: '',
    nsfwComfort: 'none',
    rhythm: 'none',
    conflictStyle: pick(['avoidant', 'confrontational', 'compromising', 'sulky', 'directGentle']),
    mood: 'neutral',
    narration: randInt(1, 2),
    bluntness: randInt(0, 2),
    initiative: randInt(1, 2),
    emotion: randInt(1, 2),
    compliance: randInt(1, 2),
    avoidCliches: true,
    avoidLoops: true,
    stayInCharacter: true,
    overNarrate: false,
    extra: ''
  };
}
