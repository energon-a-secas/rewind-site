// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml } from './neorgon-dom.js';
export { escHtml };

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };


export function inline(str) {
  return escHtml(str)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function plain(str) {
  return String(str)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
    .replace(/[`*]/g, '');
}

export function blockText(block) {
  switch (block.t) {
    case 'p': return block.text;
    case 'ul':
    case 'ol': return block.items.join(' ');
    case 'defs': return block.items.map(i => `${i.term} ${i.text}`).join(' ');
    case 'checklist': return block.items.map(i => `${i.item} ${i.how}`).join(' ');
    case 'note': return `${block.label} ${block.text}`;
    case 'code': return `${block.label || ''} ${block.text}`;
    case 'table': return [...block.head, ...block.rows.flat()].join(' ');
    case 'example': return [block.title, block.scenario, ...block.walk.map(w => `${w.step} ${w.text}`), block.lesson].join(' ');
    default: return '';
  }
}

export function sectionText(section) {
  return plain([section.number, section.title, ...section.blocks.map(blockText)].join(' ')).toLowerCase();
}

function blockToMarkdown(block) {
  switch (block.t) {
    case 'p':
      return block.text;
    case 'ul':
      return block.items.map(i => `- ${i}`).join('\n');
    case 'ol':
      return block.items.map((i, n) => `${n + 1}. ${i}`).join('\n');
    case 'defs':
      return block.items.map(i => `**${i.term}**\n: ${i.text}`).join('\n\n');
    case 'checklist':
      return block.items.map(i => `- [ ] **${i.item}**\n      ${i.how}`).join('\n');
    case 'note':
      return `> **${block.label}.** ${block.text}`;
    case 'code':
      return `${block.label ? `*${block.label}*\n\n` : ''}\`\`\`\n${block.text}\n\`\`\``;
    case 'table': {
      const head = `| ${block.head.join(' | ')} |`;
      const rule = `| ${block.head.map(() => '---').join(' | ')} |`;
      const rows = block.rows.map(r => `| ${r.join(' | ')} |`).join('\n');
      return `${head}\n${rule}\n${rows}`;
    }
    case 'example': {
      const walk = block.walk.map((w, n) => `${n + 1}. **${w.step}.** ${w.text}`).join('\n');
      return `**${block.title}**\n\n*Scenario.* ${block.scenario}\n\n${walk}\n\n*Takeaway.* ${block.lesson}`;
    }
    default:
      return '';
  }
}

export function chapterToMarkdown(chapter) {
  const heading = chapter.front || chapter.appendix
    ? `# ${chapter.title}`
    : `# ${chapter.number}. ${chapter.title}`;
  const body = chapter.sections.map(section => {
    const blocks = section.blocks.map(blockToMarkdown).filter(Boolean).join('\n\n');
    return `## ${section.number} ${section.title}\n\n${blocks}`;
  }).join('\n\n');
  return `${heading}\n\n*${chapter.summary}*\n\n${body}\n\n---\nField Manual for Troubleshooting, https://runbook.neorgon.com/#${chapter.id}\n`;
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function toast(message) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}
