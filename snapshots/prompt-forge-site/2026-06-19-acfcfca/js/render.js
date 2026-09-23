import { state } from './state.js';
import { listPresets, getPreset } from './presets.js';
import { sliderLabel, buildCharacterOutput } from './prompts.js';
import { formatTags, formatNegative } from './tags.js';
import { detectCliches, severityClass } from './cliche-detector.js';

export function render() {
  renderMode();
  renderPresets();
  renderProfileList();
  renderCharacterFields();
  renderCharacterOutput();
  renderTagFields();
  renderTagOutput();
  updateTagQualityVisibility();
  renderFooterVisibility();
}

export function renderMode() {
  const characterPanel = document.getElementById('characterPanel');
  const tagsPanel = document.getElementById('tagsPanel');
  const navCharacter = document.getElementById('navCharacter');
  const navTags = document.getElementById('navTags');

  if (state.mode === 'tags') {
    characterPanel.hidden = true;
    tagsPanel.hidden = false;
    navCharacter.classList.remove('active');
    navTags.classList.add('active');
  } else {
    characterPanel.hidden = false;
    tagsPanel.hidden = true;
    navCharacter.classList.add('active');
    navTags.classList.remove('active');
  }
}

export function renderPresets() {
  const select = document.getElementById('charPreset');
  if (!select || select.dataset.rendered) return;

  select.innerHTML = '';
  listPresets().forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = p.label;
    select.appendChild(option);
  });
  select.dataset.rendered = 'true';
}

export function renderProfileList() {
  const select = document.getElementById('loadProfile');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">Load saved profile...</option>';
  Object.keys(state.profiles || {}).sort().forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  if (current && state.profiles[current]) {
    select.value = current;
  }
}

export function renderCharacterFields() {
  const c = state.character;
  setValue('charPreset', c.preset);
  setValue('charName', c.name);
  setValue('charRole', c.role);
  setValue('charAppearance', c.appearance);
  setValue('charPersonality', c.personality);
  setValue('charBackground', c.background);
  setValue('charSpeech', c.speech);
  setValue('charExamples', c.examples);
  setValue('charFirstMessage', c.firstMessage);
  setValue('charSystemPrefix', c.systemPrefix);

  setValue('charAttachment', c.attachment);
  setValue('charLoveLanguage', c.loveLanguage);
  setValue('charRelationshipStage', c.relationshipStage);
  setValue('charRelationshipDynamic', c.relationshipDynamic);
  setValue('charNsfwComfort', c.nsfwComfort);
  setValue('charConflictStyle', c.conflictStyle);
  setValue('charMood', c.mood);
  setValue('charBoundaries', c.boundaries);
  setValue('charPetNames', c.petNames);
  setValue('charInsideJokes', c.insideJokes);
  setValue('charRhythm', c.rhythm);

  setValue('charExtra', c.extra);

  setValue('narration', c.narration);
  setValue('bluntness', c.bluntness);
  setValue('initiative', c.initiative);
  setValue('emotion', c.emotion);
  setValue('compliance', c.compliance);

  setLabel('narrationLabel', sliderLabel('narration', c.narration));
  setLabel('bluntnessLabel', sliderLabel('bluntness', c.bluntness));
  setLabel('initiativeLabel', sliderLabel('initiative', c.initiative));
  setLabel('emotionLabel', sliderLabel('emotion', c.emotion));
  setLabel('complianceLabel', sliderLabel('compliance', c.compliance));

  setChecked('avoidCliches', c.avoidCliches);
  setChecked('avoidLoops', c.avoidLoops);
  setChecked('stayInCharacter', c.stayInCharacter);
  setChecked('overNarrate', c.overNarrate);

  setValue('charFormat', c.format);
}

export function renderCharacterOutput() {
  const output = document.getElementById('charOutput');
  if (!output) return;
  output.value = buildCharacterOutput(state.character);
  renderClicheWarnings(output.value);
}

export function renderClicheWarnings(text) {
  const panel = document.getElementById('clichePanel');
  const list = document.getElementById('clicheList');
  if (!panel || !list) return;

  const warnings = detectCliches(text);
  if (warnings.length === 0) {
    panel.hidden = true;
    list.innerHTML = '';
    return;
  }

  panel.hidden = false;
  list.innerHTML = warnings.map(w =>
    `<li class="${severityClass(w.severity)}" data-severity="${w.severity}">${w.message}</li>`
  ).join('');
}

export function renderTagFields() {
  const t = state.tags;
  setValue('tagInput', t.input);
  setChecked('tagNormalize', t.normalize);
  setChecked('tagDedupe', t.dedupe);
  setChecked('tagQuality', t.quality);
  setChecked('tagUncensored', t.uncensored);
  setValue('tagQualityList', t.qualityList);
  setValue('tagNegative', t.negative);
}

export function renderTagOutput() {
  const tagsOut = document.getElementById('tagsOutput');
  const negOut = document.getElementById('negOutput');
  if (tagsOut) {
    tagsOut.value = formatTags(state.tags.input, state.tags);
  }
  if (negOut) {
    negOut.value = formatNegative(state.tags.negative, state.tags);
  }
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') {
    el.checked = Boolean(value);
  } else {
    el.value = value ?? '';
  }
}

function setChecked(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(checked);
}

function setLabel(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

const RELATIONSHIP_DEFAULTS = {
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
  mood: 'neutral'
};

export function applyPreset(id) {
  const preset = getPreset(id);
  state.character = { ...state.character, ...RELATIONSHIP_DEFAULTS, ...preset, preset: id };
  renderCharacterFields();
  renderCharacterOutput();
}

export function updateTagQualityVisibility() {
  const qualityToggle = document.getElementById('tagQuality');
  const qualityField = document.getElementById('tagQualityList')?.closest('.field-row');
  if (!qualityToggle || !qualityField) return;
  qualityField.hidden = !qualityToggle.checked;
}

export function renderFooterVisibility() {
  const btn = document.getElementById('toggleFooter');
  if (!btn) return;
  const hidden = state.ui?.hideFooter ?? false;
  document.body.classList.toggle('footer-hidden', hidden);
  btn.setAttribute('aria-pressed', String(hidden));
  btn.title = hidden ? 'Show footer' : 'Hide footer';
}
