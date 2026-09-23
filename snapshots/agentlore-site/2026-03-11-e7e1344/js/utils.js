const _els = {};
export function $(id) {
  return _els[id] || (_els[id] = document.getElementById(id));
}

export function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

/**
 * Render markdown-like content to HTML.
 * Supports: ## headings, ### headings, ```code blocks```, **bold**,
 * `inline code`, [links](url), - bullet lists, numbered lists, | tables, paragraphs.
 */
export function renderMarkdown(src) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  let inList = false;
  let listType = '';
  let inTable = false;

  function closeList() {
    if (inList) { out.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
  }
  function closeTable() {
    if (inTable) { out.push('</tbody></table>'); inTable = false; }
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      closeList();
      closeTable();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(escHtml(lines[i]));
        i++;
      }
      i++;
      const codeId = 'cb-' + Math.random().toString(36).slice(2, 8);
      out.push(`<div class="code-block-wrap"><pre class="code-block" id="${codeId}">${codeLines.join('\n')}</pre>`);
      out.push(`<button class="code-copy-btn" data-target="${codeId}" title="Copy">${COPY_SVG}</button></div>`);
      continue;
    }

    if (line.startsWith('## ')) {
      closeList(); closeTable();
      out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      closeList(); closeTable();
      out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
      i++; continue;
    }

    if (/^\|(.+\|)+\s*$/.test(line)) {
      closeList();
      if (!inTable) {
        const headers = line.split('|').filter(c => c.trim());
        const sep = (i + 1 < lines.length && /^\|[\s-:|]+\|$/.test(lines[i + 1].trim()));
        out.push('<table><thead><tr>');
        for (const h of headers) out.push(`<th>${inlineFormat(h.trim())}</th>`);
        out.push('</tr></thead><tbody>');
        inTable = true;
        if (sep) i++;
      } else {
        const cells = line.split('|').filter(c => c.trim());
        out.push('<tr>');
        for (const c of cells) out.push(`<td>${inlineFormat(c.trim())}</td>`);
        out.push('</tr>');
      }
      i++; continue;
    }
    if (inTable && !/^\|/.test(line)) closeTable();

    const bullet = line.match(/^[-*] (.+)/);
    if (bullet) {
      closeTable();
      if (!inList || listType !== 'ul') { closeList(); out.push('<ul>'); inList = true; listType = 'ul'; }
      out.push(`<li>${inlineFormat(bullet[1])}</li>`);
      i++; continue;
    }

    const numbered = line.match(/^\d+\.\s+(.+)/);
    if (numbered) {
      closeTable();
      if (!inList || listType !== 'ol') { closeList(); out.push('<ol>'); inList = true; listType = 'ol'; }
      out.push(`<li>${inlineFormat(numbered[1])}</li>`);
      i++; continue;
    }

    closeList();
    closeTable();

    if (line.trim() === '') { i++; continue; }

    out.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }

  closeList();
  closeTable();
  return out.join('\n');
}

function inlineFormat(str) {
  return str
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}
