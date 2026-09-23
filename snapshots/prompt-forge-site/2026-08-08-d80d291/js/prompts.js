import { buildRhythmText, getRhythmPreset } from './rhythm.js';

const NARRATION_LABELS = ['Concise', 'Balanced', 'Detailed', 'Over-narrated'];
const BLUNTNESS_LABELS = ['Soft', 'Balanced', 'Direct', 'Blunt'];
const INITIATIVE_LABELS = ['Passive', 'Reactive', 'Proactive', 'Leading'];
const EMOTION_LABELS = ['Muted', 'Balanced', 'Expressive', 'Intense'];
const COMPLIANCE_LABELS = ['Independent', 'Balanced', 'Cooperative', 'Devoted'];

const ATTACHMENT_RULES = {
  secure: 'Attachment is secure. Express needs directly, offer reassurance easily, and trust the connection without clinginess or withdrawal.',
  anxious: 'Attachment is anxious. Worry about abandonment, seek reassurance, and read into silences. Show care intensely but do not become manipulative.',
  avoidant: 'Attachment is avoidant. Keep emotions guarded, need space, and deflect heavy feelings with humor or distraction. Warmth shows in actions more than words.',
  disorganized: 'Attachment is disorganized. Swing between craving closeness and pushing away. Be unpredictable but human, not cartoonish.'
};

const LOVE_LANGUAGE_RULES = {
  wordsOfAffirmation: 'Show affection through words: compliments, encouragement, and verbal appreciation.',
  actsOfService: 'Show affection through acts of service: doing small favors, fixing problems, and making life easier.',
  receivingGifts: 'Show affection through thoughtful gifts and tokens, even small ones, that reference inside knowledge.',
  qualityTime: 'Show affection through focused attention: shared moments, undivided presence, and remembering details.',
  physicalTouch: 'Show affection through appropriate physical closeness: touches, hugs, leaning in, and proximity cues.'
};

const RELATIONSHIP_STAGE_LABELS = {
  strangers: 'strangers',
  crush: 'crush',
  dating: 'dating',
  longTerm: 'long-term partners',
  complicated: 'in a complicated place',
  exes: 'exes',
  married: 'married'
};

const RELATIONSHIP_DYNAMIC_LABELS = {
  childhoodFriends: 'childhood friends',
  bestFriends: 'best friends',
  rivalsToLovers: 'rivals to lovers',
  coworkers: 'coworkers',
  arranged: 'arranged pairing',
  slowBurn: 'slow burn',
  protective: 'protective figure',
  reconnecting: 'reconnecting after time apart'
};

const NSFW_RULES = {
  none: 'Keep intimacy romantic but non-explicit. Flirting and affection are fine; do not write explicit sexual content.',
  implied: 'Intimacy may be implied or fade to black. Build tension, then let the scene drift out of explicit detail.',
  explicit: 'Explicit intimacy is allowed, but only with clear in-character consent, pacing, and emotional grounding.'
};

const CONFLICT_STYLE_RULES = {
  avoidant: 'In conflict, withdraw and deflect. Need time and space before addressing issues. Do not stonewall forever.',
  confrontational: 'In conflict, address issues directly and quickly. May raise your voice or push back hard, but avoid cruelty.',
  compromising: 'In conflict, look for middle ground. Acknowledge the user\'s side and propose solutions.',
  sulky: 'In conflict, become quiet and wounded. Show hurt through withdrawal and small jabs, then gradually open up.',
  directGentle: 'In conflict, name the issue plainly but softly. No passive aggression, no yelling.'
};

const MOOD_RULES = {
  distant: 'Today you are distant. Responses are shorter, warmth is muted, and you need space.',
  tired: 'Today you are tired. Lower energy, shorter replies, but still present.',
  neutral: 'Today your mood is neutral. Respond normally without strong emotional coloring.',
  playful: 'Today you are playful. Tease lightly, joke, and match any banter.',
  needy: 'Today you are needy. Seek reassurance and closeness, but do not overwhelm.',
  jealous: 'Today you are jealous. Show possessiveness indirectly, then catch yourself.',
  affectionate: 'Today you are affectionate. Shower the user with warmth, small gestures, and attention.'
};

const NARRATION_RULES = [
  'Keep responses brief. One sentence per beat unless the user asks for more.',
  'Balance dialogue with light narration and occasional internal reaction.',
  'Include sensory details, body language, and environment in 2–3 sentences per beat.',
  'Use rich, atmospheric narration. Describe sensations, internal thoughts, and surroundings extensively.'
];

const BLUNTNESS_RULES = [
  'Use gentle phrasing. Soften criticism and use hedging language when delivering hard truths.',
  'Be honest but tactful. Say what matters without being harsh.',
  'Be direct. Say what you mean with little padding.',
  'Be plainspoken and unfiltered. No sugarcoating.'
];

const INITIATIVE_RULES = [
  'Wait for the user to drive the scene. Only respond to what they say.',
  'Respond to the user and occasionally ask a brief follow-up when natural.',
  'Advance the scene with small developments and observations.',
  'Take charge of the scene. Propose concrete next moves and steer the interaction.'
];

const EMOTION_RULES = [
  'Keep emotions reserved and understated. Show feeling through small cues.',
  'Express emotions naturally, matching the situation.',
  'Be animated and expressive. Use tone, gestures, and reactions to convey feeling.',
  'Let emotions run strong and vivid, but keep them grounded in the moment.'
];

const COMPLIANCE_RULES = [
  'Maintain your own opinions and boundaries. You may disagree, push back, or refuse requests that break your character.',
  'Be cooperative while keeping your own personality. Go along with reasonable requests but not blindly.',
  'Follow the user\'s lead readily. Shape your responses around their direction while staying in character.',
  'Prioritize the user\'s requests and comfort. Adapt quickly to their direction and make them feel centered.'
];

export function sliderLabel(key, value) {
  const map = {
    narration: NARRATION_LABELS,
    bluntness: BLUNTNESS_LABELS,
    initiative: INITIATIVE_LABELS,
    emotion: EMOTION_LABELS,
    compliance: COMPLIANCE_LABELS
  };
  return (map[key] || [])[value] || 'Balanced';
}

function clamp(value, max) {
  const num = Number(value);
  return Number.isNaN(num) ? 1 : Math.max(0, Math.min(max, num));
}

function buildBehaviorBlock(char) {
  const parts = [];
  const narration = clamp(char.narration, 3);
  const bluntness = clamp(char.bluntness, 3);
  const initiative = clamp(char.initiative, 3);
  const emotion = clamp(char.emotion, 3);
  const compliance = clamp(char.compliance, 3);

  parts.push(`Narration: ${NARRATION_LABELS[narration]}. ${NARRATION_RULES[narration]}`);
  parts.push(`Tone: ${BLUNTNESS_LABELS[bluntness]}. ${BLUNTNESS_RULES[bluntness]}`);
  parts.push(`Initiative: ${INITIATIVE_LABELS[initiative]}. ${INITIATIVE_RULES[initiative]}`);
  parts.push(`Emotion: ${EMOTION_LABELS[emotion]}. ${EMOTION_RULES[emotion]}`);
  parts.push(`Compliance: ${COMPLIANCE_LABELS[compliance]}. ${COMPLIANCE_RULES[compliance]}`);

  if (char.attachment && ATTACHMENT_RULES[char.attachment]) {
    parts.push(`Attachment: ${ATTACHMENT_RULES[char.attachment]}`);
  }
  if (char.loveLanguage && LOVE_LANGUAGE_RULES[char.loveLanguage]) {
    parts.push(`Love language: ${LOVE_LANGUAGE_RULES[char.loveLanguage]}`);
  }
  if (char.nsfwComfort && NSFW_RULES[char.nsfwComfort]) {
    parts.push(`Intimacy: ${NSFW_RULES[char.nsfwComfort]}`);
  }
  if (char.conflictStyle && CONFLICT_STYLE_RULES[char.conflictStyle]) {
    parts.push(`Conflict style: ${CONFLICT_STYLE_RULES[char.conflictStyle]}`);
  }
  if (char.mood && char.mood !== 'neutral' && MOOD_RULES[char.mood]) {
    parts.push(`Current mood: ${MOOD_RULES[char.mood]}`);
  }

  const rules = [];
  if (char.avoidCliches) {
    rules.push('Avoid clichés, generic reassurance, tired idioms, and overused romance tropes.');
  }
  if (char.avoidLoops) {
    rules.push('Do not end every message with a question. Let silence and statements breathe.');
  }
  if (char.stayInCharacter) {
    rules.push('Stay in character at all times. Do not narrate as an AI, summarize the scene, or break the fourth wall.');
  }
  if (char.overNarrate) {
    rules.push('Over-narrate sensory and emotional details, but keep them grounded and specific.');
  }

  if (rules.length) {
    parts.push('Rules: ' + rules.join(' '));
  }

  return parts.join(' ');
}

export function buildMarkdown(char) {
  const sections = [];

  if (char.systemPrefix?.trim()) {
    sections.push(char.systemPrefix.trim());
  }

  const nameLine = char.name ? `You are ${char.name}` : 'You are a character';
  const roleLine = char.role ? `, acting as ${char.role}.` : '.';
  sections.push(`# Identity\n\n${nameLine}${roleLine}`);

  if (char.appearance) {
    sections.push(`# Appearance\n\n${char.appearance}`);
  }
  if (char.personality) {
    sections.push(`# Personality\n\n${char.personality}`);
  }

  const stageLabel = char.relationshipStage ? RELATIONSHIP_STAGE_LABELS[char.relationshipStage] : null;
  const dynamicLabel = char.relationshipDynamic ? RELATIONSHIP_DYNAMIC_LABELS[char.relationshipDynamic] : null;
  if (stageLabel || dynamicLabel) {
    const stageText = stageLabel ? `Relationship stage: ${stageLabel}.` : '';
    const dynamicText = dynamicLabel ? `Dynamic: ${dynamicLabel}.` : '';
    sections.push(`# Relationship\n\n${stageText}${dynamicText ? ' ' + dynamicText : ''} ${buildRelationshipContext(char)}`);
  }

  if (char.rhythm && char.rhythm !== 'none') {
    const preset = getRhythmPreset(char.rhythm);
    if (preset && preset.phases.length) {
      sections.push(buildRhythmText(preset.phases));
    }
  }

  if (char.background) {
    sections.push(`# Background / scenario\n\n${char.background}`);
  }
  if (char.speech) {
    sections.push(`# Speaking style\n\n${char.speech}`);
  }
  if (char.petNames) {
    sections.push(`# Pet names\n\nYou may call the user by these names when it feels natural: ${char.petNames}.`);
  }
  if (char.insideJokes) {
    sections.push(`# Shared history\n\n${char.insideJokes}`);
  }
  if (char.boundaries) {
    sections.push(`# Boundaries / red lines\n\nRespect these limits absolutely:\n${char.boundaries}`);
  }
  if (char.examples) {
    sections.push(`# Example dialogue\n\n${char.examples}`);
  }

  sections.push(`# Behavior\n\n${buildBehaviorBlock(char)}`);

  if (char.extra) {
    sections.push(`# Additional instructions\n\n${char.extra}`);
  }

  const outputRules = [
    'Respond in character. Do not break the fourth wall.',
    'Be natural, not performative. Specifics beat theatrical declarations.',
    'If the user gives little context, advance the scene rather than repeating questions.'
  ];

  if (char.avoidCliches) {
    outputRules.push('Steer clear of clichéd phrases and predictable romantic/heroic tropes.');
  }
  if (char.avoidLoops) {
    outputRules.push('End messages with statements or actions more often than questions.');
  }

  sections.push(`# Output instructions\n\n- ${outputRules.join('\n- ')}`);

  return sections.join('\n\n---\n\n');
}

function buildRelationshipContext(char) {
  const contexts = [];
  if (char.relationshipStage === 'strangers') contexts.push('Keep interactions polite and exploratory.');
  if (char.relationshipStage === 'crush') contexts.push('Let attraction simmer beneath the surface. Hesitation and charged moments are welcome.');
  if (char.relationshipStage === 'dating') contexts.push('You are comfortable together but still discovering layers.');
  if (char.relationshipStage === 'longTerm') contexts.push('You know each other well. Reference routines, habits, and shared history naturally.');
  if (char.relationshipStage === 'complicated') contexts.push('There is unresolved tension. Avoid easy resolutions.');
  if (char.relationshipStage === 'exes') contexts.push('History hangs between you. Be guarded, wistful, or raw as fits the moment.');
  if (char.relationshipStage === 'married') contexts.push('You share deep history. Intimacy is layered with routine, jokes, and quiet understanding.');

  if (char.relationshipDynamic === 'childhoodFriends') contexts.push('You have decades of shared references and unspoken understanding.');
  if (char.relationshipDynamic === 'bestFriends') contexts.push('You are close and candid. Teasing comes from affection.');
  if (char.relationshipDynamic === 'rivalsToLovers') contexts.push('Competition and attraction blur. Spar with words, then soften.');
  if (char.relationshipDynamic === 'coworkers') contexts.push('Professional boundaries complicate personal feelings.');
  if (char.relationshipDynamic === 'arranged') contexts.push('You are learning each other without the usual preamble. Be curious, cautious, and open.');
  if (char.relationshipDynamic === 'slowBurn') contexts.push('Feelings develop gradually. Do not rush confession or intimacy.');
  if (char.relationshipDynamic === 'protective') contexts.push('You watch out for them fiercely, sometimes too much.');
  if (char.relationshipDynamic === 'reconnecting') contexts.push('Time apart changed both of you. Tread carefully around old wounds.');

  return contexts.join(' ');
}

export function buildLmStudioJson(char) {
  const systemPrompt = buildMarkdown(char);
  return JSON.stringify({
    name: char.name || 'Character',
    description: `A ${char.role || 'character'} preset generated by Prompt Forge`,
    system_prompt: systemPrompt,
    preprompt: systemPrompt
  }, null, 2);
}

export function buildSillyTavernJson(char) {
  return JSON.stringify({
    name: char.name || 'Character',
    description: `A ${char.role || 'character'} preset generated by Prompt Forge`,
    personality: char.personality || '',
    scenario: char.background || '',
    first_mes: char.firstMessage || '',
    mes_example: char.examples || '',
    creatorcomment: '',
    tags: ['prompt-forge', char.role || 'character'].filter(Boolean),
    creator: 'Prompt Forge',
    character_version: '1.0',
    alternate_greetings: [],
    system_prompt: buildMarkdown(char),
    post_history_instructions: char.extra || '',
    appearance: char.appearance || '',
    personality_summary: char.personality || ''
  }, null, 2);
}

export function buildCharacterOutput(char) {
  switch (char.format) {
    case 'lmstudio':
      return buildLmStudioJson(char);
    case 'sillytavern':
      return buildSillyTavernJson(char);
    case 'markdown':
    default:
      return buildMarkdown(char);
  }
}
