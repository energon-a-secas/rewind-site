const STORAGE_KEY = 'prompt-forge-state';
const STORAGE_VERSION = 2;

function createDefaultState() {
  return {
    mode: 'character',
    character: {
      preset: 'blank',
      name: '',
      role: '',
      appearance: '',
      personality: '',
      background: '',
      speech: '',
      examples: '',
      firstMessage: '',
      narration: 1,
      bluntness: 1,
      initiative: 1,
      emotion: 1,
      compliance: 1,
      avoidCliches: true,
      avoidLoops: true,
      stayInCharacter: true,
      overNarrate: false,
      systemPrefix: '',
      attachment: 'secure',
      loveLanguage: 'qualityTime',
      relationshipStage: 'dating',
      relationshipDynamic: 'childhoodFriends',
      boundaries: '',
      petNames: '',
      insideJokes: '',
      nsfwComfort: 'none',
      rhythm: 'none',
      conflictStyle: 'compromising',
      mood: 'neutral',
      extra: '',
      format: 'markdown'
    },
    tags: {
      input: '',
      normalize: true,
      dedupe: true,
      quality: true,
      uncensored: false,
      qualityList: 'masterpiece, best quality, highly detailed',
      negative: ''
    },
    ui: {
      hideFooter: false
    },
    profiles: {},
    version: STORAGE_VERSION
  };
}

function validateUi(ui) {
  const defaults = createDefaultState().ui;
  return {
    ...defaults,
    ...ui,
    hideFooter: Boolean(ui?.hideFooter ?? defaults.hideFooter)
  };
}

function validateProfiles(profiles) {
  if (!profiles || typeof profiles !== 'object') return {};
  const valid = {};
  for (const [key, value] of Object.entries(profiles)) {
    if (value && typeof value === 'object') {
      valid[key] = value;
    }
  }
  return valid;
}

function clampInt(value, min, max, fallback) {
  const num = Number(value);
  if (!Number.isInteger(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

function validateCharacter(char) {
  const defaults = createDefaultState().character;
  return {
    ...defaults,
    ...char,
    preset: typeof char?.preset === 'string' ? char.preset : defaults.preset,
    name: String(char?.name ?? defaults.name),
    role: String(char?.role ?? defaults.role),
    appearance: String(char?.appearance ?? defaults.appearance),
    personality: String(char?.personality ?? defaults.personality),
    background: String(char?.background ?? defaults.background),
    speech: String(char?.speech ?? defaults.speech),
    examples: String(char?.examples ?? defaults.examples),
    firstMessage: String(char?.firstMessage ?? defaults.firstMessage),
    extra: String(char?.extra ?? defaults.extra),
    narration: clampInt(char?.narration, 0, 3, defaults.narration),
    bluntness: clampInt(char?.bluntness, 0, 3, defaults.bluntness),
    initiative: clampInt(char?.initiative, 0, 3, defaults.initiative),
    emotion: clampInt(char?.emotion, 0, 3, defaults.emotion),
    compliance: clampInt(char?.compliance, 0, 3, defaults.compliance),
    avoidCliches: Boolean(char?.avoidCliches ?? defaults.avoidCliches),
    avoidLoops: Boolean(char?.avoidLoops ?? defaults.avoidLoops),
    stayInCharacter: Boolean(char?.stayInCharacter ?? defaults.stayInCharacter),
    overNarrate: Boolean(char?.overNarrate ?? defaults.overNarrate),
    systemPrefix: String(char?.systemPrefix ?? defaults.systemPrefix),
    attachment: ['secure', 'anxious', 'avoidant', 'disorganized'].includes(char?.attachment) ? char.attachment : defaults.attachment,
    loveLanguage: ['wordsOfAffirmation', 'actsOfService', 'receivingGifts', 'qualityTime', 'physicalTouch'].includes(char?.loveLanguage) ? char.loveLanguage : defaults.loveLanguage,
    relationshipStage: ['strangers', 'crush', 'dating', 'longTerm', 'complicated', 'exes', 'married'].includes(char?.relationshipStage) ? char.relationshipStage : defaults.relationshipStage,
    relationshipDynamic: ['childhoodFriends', 'rivalsToLovers', 'coworkers', 'arranged', 'slowBurn', 'protective', 'bestFriends', 'reconnecting'].includes(char?.relationshipDynamic) ? char.relationshipDynamic : defaults.relationshipDynamic,
    boundaries: String(char?.boundaries ?? defaults.boundaries),
    petNames: String(char?.petNames ?? defaults.petNames),
    insideJokes: String(char?.insideJokes ?? defaults.insideJokes),
    nsfwComfort: ['none', 'implied', 'explicit'].includes(char?.nsfwComfort) ? char.nsfwComfort : defaults.nsfwComfort,
    rhythm: ['none', 'slowBurn', 'fightAndMakeUp', 'comfortAfterHardDay', 'playfulTease', 'deepeningIntimacy', 'reconnecting'].includes(char?.rhythm) ? char.rhythm : defaults.rhythm,
    conflictStyle: ['avoidant', 'confrontational', 'compromising', 'sulky', 'directGentle'].includes(char?.conflictStyle) ? char.conflictStyle : defaults.conflictStyle,
    mood: ['distant', 'tired', 'neutral', 'playful', 'needy', 'jealous', 'affectionate'].includes(char?.mood) ? char.mood : defaults.mood,
    format: ['markdown', 'lmstudio', 'sillytavern'].includes(char?.format) ? char.format : defaults.format
  };
}

function validateTags(tags) {
  const defaults = createDefaultState().tags;
  return {
    ...defaults,
    ...tags,
    input: String(tags?.input ?? defaults.input),
    qualityList: String(tags?.qualityList ?? defaults.qualityList),
    negative: String(tags?.negative ?? defaults.negative),
    normalize: Boolean(tags?.normalize ?? defaults.normalize),
    dedupe: Boolean(tags?.dedupe ?? defaults.dedupe),
    quality: Boolean(tags?.quality ?? defaults.quality),
    uncensored: Boolean(tags?.uncensored ?? defaults.uncensored)
  };
}

export const state = createDefaultState();

export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);

    // Reset if the saved schema is too old or missing version
    if (!saved || typeof saved !== 'object' || (saved.version && saved.version < STORAGE_VERSION - 2)) {
      return;
    }

    if (saved.mode === 'tags' || saved.mode === 'character') {
      state.mode = saved.mode;
    }
    if (saved.character) {
      state.character = validateCharacter(saved.character);
    }
    if (saved.tags) {
      state.tags = validateTags(saved.tags);
    }
    if (saved.ui) {
      state.ui = validateUi(saved.ui);
    }
    if (saved.profiles) {
      state.profiles = validateProfiles(saved.profiles);
    }
    state.version = STORAGE_VERSION;
  } catch (e) {
    // ignore corrupt storage and keep defaults
  }
}

export function saveState() {
  try {
    state.version = STORAGE_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
}
