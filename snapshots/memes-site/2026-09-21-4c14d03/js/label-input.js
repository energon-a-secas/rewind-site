import { MAX_LABELS, MAX_LABEL_LENGTH, normalizeLabel } from './organization.js';

/** Small, keyboard-friendly editor shared by uploads and the meme organizer. */
export function createLabelInput(root, { id, suggestions = () => [] }) {
  let labels = [];
  root.innerHTML = `<div class="label-input-wrap"><div class="label-input-tokens"></div><input type="text" id="${id}" placeholder="Type a label, then press Enter" autocomplete="off" maxlength="264" aria-describedby="${id}Hint ${id}Error" list="${id}Suggestions"></div><datalist id="${id}Suggestions"></datalist><p class="field-hint" id="${id}Hint">Enter or comma to add. Up to 8 labels.</p><p class="field-error" id="${id}Error" role="status"></p>`;
  const input = root.querySelector('input');
  const tokens = root.querySelector('.label-input-tokens');
  const error = root.querySelector('.field-error');
  const datalist = root.querySelector('datalist');

  function render() {
    tokens.replaceChildren();
    labels.forEach(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'label-token';
      button.textContent = `${label} ×`;
      button.setAttribute('aria-label', `Remove label ${label}`);
      button.addEventListener('click', () => {
        labels = labels.filter(item => item !== label);
        error.textContent = '';
        render();
        input.focus();
      });
      tokens.append(button);
    });
    datalist.replaceChildren(...suggestions().filter(label => !labels.includes(label)).map(label => new Option(label, label)));
  }

  function commit() {
    const added = input.value.split(',').map(normalizeLabel).filter(Boolean);
    const next = [...new Set([...labels, ...added])];
    let message = '';
    if (next.length > MAX_LABELS) message = 'Use up to 8 labels per meme.';
    if (next.some(label => label.length > MAX_LABEL_LENGTH)) message = 'Keep each label to 32 characters or fewer.';
    error.textContent = message;
    input.setAttribute('aria-invalid', String(!!message));
    if (message) { input.focus(); return false; }
    labels = next;
    input.value = '';
    render();
    return true;
  }

  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); commit(); }
    if (event.key === 'Backspace' && !input.value && labels.length) { labels.pop(); render(); }
  });
  input.addEventListener('input', () => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
  input.addEventListener('focus', render);
  render();
  return {
    commit,
    getLabels: () => [...labels],
    setLabels(value = []) { labels = [...value]; input.value = ''; error.textContent = ''; input.removeAttribute('aria-invalid'); render(); },
  };
}
