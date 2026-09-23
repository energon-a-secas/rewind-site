import { state, saveState } from './state.js';
import { sliderLabel } from './prompts.js';
import { renderMode, renderCharacterFields, renderCharacterOutput, renderTagOutput, applyPreset, updateTagQualityVisibility, renderFooterVisibility, renderProfileList } from './render.js';
import { copyShareLink } from './share.js';
import { randomizeCharacter } from './random.js';
import { renderSimulation } from './simulator.js';
import { generateScenario } from './scenarios.js';
import { NEGATIVE_PRESETS } from './tags.js';

function bindInput(id, path, callback) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setPath(state, path, value);
    saveState();
    if (callback) callback();
  });
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  let target = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (typeof target[last] === 'number') {
    target[last] = Number(value);
  } else {
    target[last] = value;
  }
}

function hasCharacterEdits() {
  const c = state.character;
  return ['name', 'role', 'appearance', 'personality', 'background', 'speech', 'examples', 'firstMessage', 'boundaries', 'petNames', 'insideJokes', 'extra']
    .some(key => String(c[key] || '').trim() !== '');
}

function announce(message) {
  let region = document.getElementById('aria-live');
  if (!region) {
    region = document.createElement('div');
    region.id = 'aria-live';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'visually-hidden';
    document.body.appendChild(region);
  }
  region.textContent = message;
}

async function copyTextarea(id, buttonId, doneText = 'Copied') {
  const textarea = document.getElementById(id);
  const button = buttonId ? document.getElementById(buttonId) : null;
  try {
    await navigator.clipboard.writeText(textarea.value);
    if (button) {
      const original = button.textContent;
      button.textContent = doneText;
      announce(doneText);
      setTimeout(() => button.textContent = original, 1200);
    }
  } catch (e) {
    textarea.select();
    if (button) {
      button.textContent = 'Select & copy';
      announce('Copy failed. Text is selected.');
    }
  }
}

function downloadTextarea(id, filename) {
  const textarea = document.getElementById(id);
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setMode(mode) {
  state.mode = mode;
  saveState();
  renderMode();
  updateUrlHash(mode);
}

function updateUrlHash(mode) {
  try {
    history.replaceState(null, '', mode === 'tags' ? '#tags' : '#character');
  } catch (e) {
    // ignore
  }
}

export function bindEvents() {
  // Mode nav
  document.getElementById('navCharacter').addEventListener('click', () => setMode('character'));
  document.getElementById('navTags').addEventListener('click', () => setMode('tags'));

  // Footer visibility toggle
  const footerToggle = document.getElementById('toggleFooter');
  if (footerToggle) {
    footerToggle.addEventListener('click', () => {
      state.ui.hideFooter = !state.ui.hideFooter;
      saveState();
      renderFooterVisibility();
    });
  }

  // Preset selector
  const presetSelect = document.getElementById('charPreset');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const presetId = presetSelect.value;
      if (presetId !== 'blank' && hasCharacterEdits()) {
        const confirmed = confirm('Loading a preset will replace your current character fields. Continue?');
        if (!confirmed) {
          presetSelect.value = state.character.preset;
          return;
        }
      }
      applyPreset(presetId);
      saveState();
    });
  }

  // Randomize partner
  const randomizeBtn = document.getElementById('randomizeCharBtn');
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      if (hasCharacterEdits()) {
        const confirmed = confirm('Randomize will replace your current character. Continue?');
        if (!confirmed) return;
      }
      Object.assign(state.character, randomizeCharacter());
      saveState();
      renderCharacterFields();
      renderCharacterOutput();
    });
  }

  // Generate scenario
  const scenarioBtn = document.getElementById('generateScenarioBtn');
  if (scenarioBtn) {
    scenarioBtn.addEventListener('click', () => {
      state.character.background = generateScenario(state.character);
      saveState();
      renderCharacterFields();
      renderCharacterOutput();
    });
  }

  // Saved profiles
  const profileNameInput = document.getElementById('profileName');
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  const loadProfileSelect = document.getElementById('loadProfile');
  const loadProfileBtn = document.getElementById('loadProfileBtn');
  const deleteProfileBtn = document.getElementById('deleteProfileBtn');

  if (saveProfileBtn && profileNameInput) {
    saveProfileBtn.addEventListener('click', () => {
      const name = profileNameInput.value.trim();
      if (!name) return;
      state.profiles[name] = { ...state.character };
      saveState();
      renderProfileList();
      setTimeout(() => { loadProfileSelect.value = name; }, 0);
      profileNameInput.value = '';
    });
  }

  if (loadProfileBtn && loadProfileSelect) {
    loadProfileBtn.addEventListener('click', () => {
      const name = loadProfileSelect.value;
      if (!name || !state.profiles[name]) return;
      if (hasCharacterEdits()) {
        const confirmed = confirm(`Load profile "${name}"? This will replace your current character.`);
        if (!confirmed) return;
      }
      Object.assign(state.character, state.profiles[name]);
      saveState();
      renderCharacterFields();
      renderCharacterOutput();
    });
  }

  if (deleteProfileBtn && loadProfileSelect) {
    deleteProfileBtn.addEventListener('click', () => {
      const name = loadProfileSelect.value;
      if (!name || !state.profiles[name]) return;
      const confirmed = confirm(`Delete profile "${name}"?`);
      if (!confirmed) return;
      delete state.profiles[name];
      saveState();
      renderProfileList();
    });
  }

  // Character fields
  const charFields = [
    { id: 'charName', path: 'character.name' },
    { id: 'charRole', path: 'character.role' },
    { id: 'charAppearance', path: 'character.appearance' },
    { id: 'charPersonality', path: 'character.personality' },
    { id: 'charBackground', path: 'character.background' },
    { id: 'charSpeech', path: 'character.speech' },
    { id: 'charExamples', path: 'character.examples' },
    { id: 'charFirstMessage', path: 'character.firstMessage' },
    { id: 'charSystemPrefix', path: 'character.systemPrefix' },
    { id: 'charAttachment', path: 'character.attachment' },
    { id: 'charLoveLanguage', path: 'character.loveLanguage' },
    { id: 'charRelationshipStage', path: 'character.relationshipStage' },
    { id: 'charRelationshipDynamic', path: 'character.relationshipDynamic' },
    { id: 'charNsfwComfort', path: 'character.nsfwComfort' },
    { id: 'charConflictStyle', path: 'character.conflictStyle' },
    { id: 'charMood', path: 'character.mood' },
    { id: 'charBoundaries', path: 'character.boundaries' },
    { id: 'charPetNames', path: 'character.petNames' },
    { id: 'charInsideJokes', path: 'character.insideJokes' },
    { id: 'charRhythm', path: 'character.rhythm' },
    { id: 'charExtra', path: 'character.extra' },
    { id: 'narration', path: 'character.narration' },
    { id: 'bluntness', path: 'character.bluntness' },
    { id: 'initiative', path: 'character.initiative' },
    { id: 'emotion', path: 'character.emotion' },
    { id: 'compliance', path: 'character.compliance' },
    { id: 'avoidCliches', path: 'character.avoidCliches' },
    { id: 'avoidLoops', path: 'character.avoidLoops' },
    { id: 'stayInCharacter', path: 'character.stayInCharacter' },
    { id: 'overNarrate', path: 'character.overNarrate' },
    { id: 'charFormat', path: 'character.format' }
  ];
  charFields.forEach(f => bindInput(f.id, f.path, () => {
    if (f.path.startsWith('character.narration') ||
        f.path.startsWith('character.bluntness') ||
        f.path.startsWith('character.initiative') ||
        f.path.startsWith('character.emotion') ||
        f.path.startsWith('character.compliance')) {
      renderCharacterOutput();
      const c = state.character;
      document.getElementById('narrationLabel').textContent = sliderLabel('narration', c.narration);
      document.getElementById('bluntnessLabel').textContent = sliderLabel('bluntness', c.bluntness);
      document.getElementById('initiativeLabel').textContent = sliderLabel('initiative', c.initiative);
      document.getElementById('emotionLabel').textContent = sliderLabel('emotion', c.emotion);
      document.getElementById('complianceLabel').textContent = sliderLabel('compliance', c.compliance);
    } else {
      renderCharacterOutput();
    }
  }));

  // Tag fields
  const tagFields = [
    { id: 'tagInput', path: 'tags.input' },
    { id: 'tagNormalize', path: 'tags.normalize' },
    { id: 'tagDedupe', path: 'tags.dedupe' },
    { id: 'tagQuality', path: 'tags.quality' },
    { id: 'tagUncensored', path: 'tags.uncensored' },
    { id: 'tagQualityList', path: 'tags.qualityList' },
    { id: 'tagNegative', path: 'tags.negative' }
  ];
  tagFields.forEach(f => bindInput(f.id, f.path, () => {
    if (f.path === 'tags.quality') {
      updateTagQualityVisibility();
    }
    renderTagOutput();
  }));

  const negPreset = document.getElementById('negPreset');
  if (negPreset) {
    negPreset.addEventListener('change', () => {
      const preset = NEGATIVE_PRESETS[negPreset.value];
      if (preset !== undefined) {
        state.tags.negative = preset;
        document.getElementById('tagNegative').value = preset;
        saveState();
        renderTagOutput();
      }
    });
  }

  // Copy / download / share / test actions
  document.getElementById('copyCharBtn').addEventListener('click', () => copyTextarea('charOutput', 'copyCharBtn'));
  document.getElementById('shareCharBtn').addEventListener('click', () => copyShareLink(document.getElementById('shareCharBtn')));

  const simPanel = document.getElementById('simPanel');
  const simConversation = document.getElementById('simConversation');
  const simUserInput = document.getElementById('simUserInput');
  const simSendBtn = document.getElementById('simSendBtn');

  document.getElementById('testFlightBtn').addEventListener('click', () => {
    simPanel.hidden = false;
    renderSimulation(simConversation, state.character, simUserInput.value.trim());
    simUserInput.value = '';
  });

  if (simSendBtn) {
    simSendBtn.addEventListener('click', () => {
      renderSimulation(simConversation, state.character, simUserInput.value.trim());
      simUserInput.value = '';
    });
  }

  if (simUserInput) {
    simUserInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        renderSimulation(simConversation, state.character, simUserInput.value.trim());
        simUserInput.value = '';
      }
    });
  }

  document.getElementById('downloadCharBtn').addEventListener('click', () => {
    const ext = state.character.format === 'markdown' ? 'md' : 'json';
    const name = state.character.name || 'character';
    downloadTextarea('charOutput', `${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`);
  });
  document.getElementById('copyTagsBtn').addEventListener('click', () => copyTextarea('tagsOutput', 'copyTagsBtn'));
  document.getElementById('downloadTagsBtn').addEventListener('click', () => downloadTextarea('tagsOutput', 'tags.txt'));
  document.getElementById('copyNegBtn').addEventListener('click', () => copyTextarea('negOutput', 'copyNegBtn'));
}
