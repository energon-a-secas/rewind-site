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
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
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

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n);
}

/** Compact token counts: 200000 → "200K", 1000000 → "1M". */
export function formatTokens(n) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

/**
 * Follows the convention providers use in their own pricing tables: whole
 * dollars stay whole ($5), fractions keep at least two places ($0.50), and a
 * third place survives only when it carries information ($0.125).
 */
export function formatUSD(n, { precise = false } = {}) {
  if (n === 0) return '$0';
  if (!precise && n >= 10) return `$${Math.round(n).toLocaleString('en-US')}`;
  if (Number.isInteger(n)) return `$${n.toLocaleString('en-US')}`;

  const body = n.toFixed(n < 1 ? 3 : 2).replace(/(\.\d{2}\d*?)0+$/, '$1');
  const [whole, fraction] = body.split('.');
  return `$${Number(whole).toLocaleString('en-US')}.${fraction}`;
}

export function daysSince(isoDate) {
  const then = Date.parse(isoDate + 'T00:00:00Z');
  if (Number.isNaN(then)) return Infinity;
  return Math.floor((Date.now() - then) / 86_400_000);
}

const COPY_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

const CALLOUTS = {
  note:   { label: 'Note',        icon: 'i' },
  tip:    { label: 'Tip',         icon: '★' },
  warn:   { label: 'Watch out',   icon: '!' },
  danger: { label: 'Do not',      icon: '✕' },
  cost:   { label: 'Cost impact', icon: '$' },
};

/**
 * Render markdown-like content to HTML. Deliberately small — no dependency,
 * no build step — but the block set is fixed by what the content needs:
 * headings, fenced code, tables, nested lists, blockquotes, callouts, rules.
 *
 * Code-block ids are positional, not random, so generated pages are stable
 * across builds.
 */
export function renderMarkdown(src) {
  const lines = String(src).split('\n');
  const out = [];
  let i = 0;
  let codeCount = 0;

  const listStack = [];
  function closeLists(toDepth = 0) {
    while (listStack.length > toDepth) out.push(listStack.pop() === 'ul' ? '</li></ul>' : '</li></ol>');
  }

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      closeLists();
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      const codeId = `cb-${++codeCount}`;
      out.push(`<div class="code-block-wrap"${lang ? ` data-lang="${escHtml(lang)}"` : ''}>`);
      out.push(`<pre class="code-block" id="${codeId}">${escHtml(codeLines.join('\n'))}</pre>`);
      out.push(`<button class="code-copy-btn" data-target="${codeId}" title="Copy" aria-label="Copy code" type="button">${COPY_SVG}</button></div>`);
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      closeLists();
      const level = heading[1].length;
      const text = heading[2].trim();
      out.push(`<h${level} id="${slugify(text)}">${inlineFormat(text)}</h${level}>`);
      i++; continue;
    }

    if (/^(---+|\*\*\*+)\s*$/.test(line)) {
      closeLists();
      out.push('<hr>');
      i++; continue;
    }

    if (line.startsWith('>')) {
      closeLists();
      const quote = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      const tag = quote[0].match(/^\[!(\w+)\]\s*(.*)$/);
      if (tag && CALLOUTS[tag[1].toLowerCase()]) {
        const kind = tag[1].toLowerCase();
        const meta = CALLOUTS[kind];
        const title = tag[2].trim() || meta.label;
        const body = quote.slice(1).filter(l => l.trim()).map(l => `<p>${inlineFormat(l)}</p>`).join('');
        out.push(`<aside class="callout callout--${kind}"><p class="callout-title"><span class="callout-icon" aria-hidden="true">${meta.icon}</span>${escHtml(title)}</p>${body}</aside>`);
      } else {
        const body = quote.filter(l => l.trim()).map(l => `<p>${inlineFormat(l)}</p>`).join('');
        out.push(`<blockquote>${body}</blockquote>`);
      }
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line)) {
      closeLists();
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const hasHeader = rows.length > 1 && rows[1].every(c => /^:?-{2,}:?$/.test(c.trim()));
      const bodyRows = hasHeader ? rows.slice(2) : rows.slice(1);
      out.push('<div class="table-wrap"><table>');
      out.push('<thead><tr>' + rows[0].map(c => `<th>${inlineFormat(c)}</th>`).join('') + '</tr></thead>');
      out.push('<tbody>' + bodyRows.map(r => '<tr>' + r.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>').join('') + '</tbody>');
      out.push('</table></div>');
      continue;
    }

    const item = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
    if (item) {
      const depth = Math.floor(item[1].length / 2) + 1;
      const type = item[2] === '-' || item[2] === '*' ? 'ul' : 'ol';

      if (depth > listStack.length) {
        out.push(`<${type}>`);
        listStack.push(type);
      } else {
        closeLists(depth);
        if (listStack.length === depth) out.push('</li>');
        if (listStack[depth - 1] !== type) {
          out.push(listStack.pop() === 'ul' ? '</ul>' : '</ol>');
          out.push(`<${type}>`);
          listStack.push(type);
        }
      }
      out.push(`<li>${inlineFormat(item[3])}`);
      i++; continue;
    }

    closeLists();

    if (line.trim() === '') { i++; continue; }

    out.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }

  closeLists();
  return out.join('\n');
}

function splitRow(line) {
  const cells = line.trim().split('|');
  if (cells[0].trim() === '') cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === '') cells.pop();
  return cells.map(c => c.trim());
}

/** Headings for a page outline. Shares slugify() with the renderer so ids match. */
export function extractHeadings(src) {
  const out = [];
  let inCode = false;
  for (const line of String(src).split('\n')) {
    if (line.startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(#{2,3})\s+(.+)$/);
    if (m) out.push({ level: m[1].length, text: m[2].trim(), id: slugify(m[2].trim()) });
  }
  return out;
}

function inlineFormat(str) {
  return escHtml(str)
    .replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) =>
      /^https?:\/\//.test(url)
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<a href="${url}">${text}</a>`);
}
