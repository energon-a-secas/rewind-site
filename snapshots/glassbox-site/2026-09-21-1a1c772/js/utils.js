// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, showToast as kitToast } from './neorgon-dom.js';
export { escHtml };

// ── Shared utilities ─────────────────────────────────────────

export function $(id) { return document.getElementById(id); }


/**
 * Escape, then promote `backticked` spans to <code>. The question bank writes
 * identifiers in markdown style because the stems read as prose; escaping runs
 * first, so the markup can only ever be the <code> tags added here.
 */
export function codeify(str) {
  return escHtml(str).replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Create an element with class + innerHTML in one call. */
export function el(tag, cls, html) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

/**
 * Centre an element inside its own scrolling parent, and *only* there.
 * `scrollIntoView` is the wrong tool for a strip of tabs: with the strip out
 * of sight it scrolls the *page* to reveal the tab, so a control the reader
 * clicked far below (a language toggle, a rail tab) throws them back up to
 * the strip. Deltas off `getBoundingClientRect`, not `offsetLeft`, so this
 * does not care which ancestor is positioned; it no-ops when the parent is
 * not scrollable, which is the common case at wide widths.
 */
export function keepInScroller(node) {
  const box = node?.parentElement;
  if (!node || !box) return;
  const b = node.getBoundingClientRect();
  const c = box.getBoundingClientRect();
  if (box.scrollWidth > box.clientWidth + 1) {
    box.scrollLeft += (b.left - c.left) - (c.width - b.width) / 2;
  } else if (box.scrollHeight > box.clientHeight + 1) {
    box.scrollTop += (b.top - c.top) - (c.height - b.height) / 2;
  }
}

/** Show a temporary toast. */
/** This site's own toast contract, rendered by the kit. */
export function showToast(msg) {
  return kitToast(msg, { id: 'app-toast', className: 'toast',
    visibleClass: 'visible', duration: 1800 });
}


/**
 * Very light code "highlighter", intentionally not a real parser.
 * One combined alternation per lang (built once, cached), applied in a
 * single left-to-right pass: a `#` inside a string is consumed by the
 * string alternative, a quote inside a comment by the comment
 * alternative, so nothing ever matches inside an already-styled token.
 * Input is escHtml'd FIRST, so patterns match entities (&quot;), and a
 * double-quoted string tolerates &amp;/&lt;/&gt; inside it.
 */
const HL_KEYWORDS = {
  py: 'import|from|def|return|if|elif|else|while|for|in|not|and|or|is|with|as|class|try|except|finally|raise|pass|break|continue|lambda|yield|assert|async|await|True|False|None',
  js: 'const|let|var|function|return|if|else|for|while|switch|case|class|extends|new|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|of|delete|void|true|false|null|undefined',
};
const HL_CLASSES = { str3: 'tok-str', str: 'tok-str', sstr: 'tok-str', com: 'tok-com', dec: 'tok-dec', kw: 'tok-kw', num: 'tok-num' };
const hlRegexes = new Map();

function hlRegex(lang) {
  if (hlRegexes.has(lang)) return hlRegexes.get(lang);
  const alts = [];
  // Triple-quoted (f-)strings first so a """...""" is one token, not a
  // pair of empty strings around unstyled text.
  if (lang === 'py') alts.push('(?<str3>[frbu]?(?:&quot;){3}[\\s\\S]*?(?:&quot;){3})');
  // Comments: inline for py/bash; md/yaml stay line-start-only so the
  // Config Explorer's markdown headings keep rendering as comments
  // without swallowing mid-prose # characters; // for everything else.
  if (lang === 'py' || lang === 'bash') alts.push('(?<com>#[^\\n]*)');
  else if (lang === 'md' || lang === 'yaml') alts.push('(?<com>(?<=^|\\n)#[^\\n]*)');
  else alts.push('(?<com>\\/\\/[^\\n]*)');
  alts.push('(?<str>&quot;(?:[^&\\n]|&(?:amp|lt|gt);)*&quot;)');
  if (lang === 'py' || lang === 'bash' || lang === 'js') alts.push("(?<sstr>'[^'\\n]*')");
  if (lang === 'py') alts.push('(?<dec>@\\w+)');
  alts.push(`(?<kw>\\b(?:${HL_KEYWORDS[lang] || 'true|false|null'})\\b)`);
  // Numbers read as data everywhere except prose-shaped langs.
  if (lang !== 'md' && lang !== 'yaml') alts.push('(?<num>\\b\\d+(?:\\.\\d+)?\\b)');
  const re = new RegExp(alts.join('|'), 'g');
  hlRegexes.set(lang, re);
  return re;
}

export function highlightCode(code, lang) {
  return escHtml(code).replace(hlRegex(lang), (...args) => {
    const groups = args[args.length - 1];
    for (const g in groups) {
      if (groups[g] !== undefined) return `<span class="${HL_CLASSES[g]}">${args[0]}</span>`;
    }
    return args[0];
  });
}

/**
 * Anti-pattern Don't/Do strip: the inner markup of a .loop-flag box.
 * Shared by the Loop and Config labs so the strip renders identically
 * wherever a `flag` id appears. Contract (documented in
 * data/antipatterns.js): `bad` is plain text (escaped), `fix` is raw.
 */
export function flagHtml(ap) {
  return `
    <div class="flag__head"><span class="flag__badge">anti-pattern</span> ${escHtml(ap.title)}</div>
    <div class="flag__cols">
      <div class="flag__bad"><span>Don’t</span>${escHtml(ap.bad)}</div>
      <div class="flag__fix"><span>Do</span>${ap.fix}</div>
    </div>`;
}

/** Copy text to clipboard, with a toast. */
export function copyText(text, label) {
  navigator.clipboard?.writeText(text).then(
    () => showToast(label || 'Copied'),
    () => showToast('Copy failed'),
  );
}
