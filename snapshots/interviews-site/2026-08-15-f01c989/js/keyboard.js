export function initKeyboard() {
  const groups = document.querySelectorAll('.control-group');
  groups.forEach(g => {
    if (g.querySelector('input[type="radio"]')) {
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'radiogroup');
      g.setAttribute('aria-label', g.querySelector('.control-label')?.textContent || 'Question');
    }
  });

  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT')) {
      return;
    }

    if (e.key === '/') {
      e.preventDefault();
      const nameInput = document.getElementById('candidate-name');
      if (nameInput) nameInput.focus();
      return;
    }

    const group = active && active.closest ? active.closest('.control-group') : null;
    if (!group) return;

    const radio = group.querySelector('input[type="radio"]');
    if (!radio) return;

    if (e.key === '?' || (e.shiftKey && e.key === '?')) {
      e.preventDefault();
      if (window.showHelp) window.showHelp(radio.name);
      return;
    }

    const map = { '1': '2', '2': '1', '3': '0' };
    if (map[e.key]) {
      e.preventDefault();
      const target = group.querySelector(`input[type="radio"][value="${map[e.key]}"]`);
      if (target && !target.checked) {
        target.checked = true;
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}
