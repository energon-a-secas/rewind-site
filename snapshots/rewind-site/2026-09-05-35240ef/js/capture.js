// ── Browser capture engine ───────────────────────────────────
// Fetches a live page and inlines what it can (stylesheets, images,
// classic scripts, icons) into one self-contained HTML string. Works
// against hosts that send open CORS headers — GitHub Pages does, so
// the whole fleet is capturable. Assets that refuse to be fetched are
// left as absolute URLs ("tethered"): the capture still renders, it
// just leans on the live site for those pieces.
//
// ES-module scripts are always tethered: their import graphs cannot be
// inlined into a single file, so they get absolute URLs instead. The
// CLI (tools/capture.py live) mirrors trees and has no such limit.

const MAX_ASSETS = 150;
const MAX_BYTES = 25 * 1024 * 1024;
const CSS_URL_RE = /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g;
const CSS_IMPORT_RE = /@import\s+(['"])([^'"]+)\1/g;
const SKIP = /^(data:|blob:|mailto:|javascript:|tel:|#)/;

class Budget {
  constructor() { this.assets = 0; this.bytes = 0; this.tethered = 0; }
  spend(n) { this.assets += 1; this.bytes += n; }
  get blown() { return this.assets >= MAX_ASSETS || this.bytes >= MAX_BYTES; }
}

export function normalizeUrl(input) {
  const v = input.trim();
  if (!v) return null;
  try {
    return new URL(/^https?:\/\//.test(v) ? v : `https://${v}`).href;
  } catch {
    return null;
  }
}

async function fetchBlob(url, budget) {
  if (budget.blown) throw new Error('budget');
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  budget.spend(blob.size);
  return blob;
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function toDataURL(url, budget) {
  return blobToDataURL(await fetchBlob(url, budget));
}

/** Inline url()/@import refs inside CSS text. Depth-limited recursion. */
async function inlineCss(css, baseUrl, budget, depth = 0) {
  const jobs = new Map();
  const collect = (re) => {
    for (const m of css.matchAll(re)) {
      const raw = m[2];
      if (!SKIP.test(raw) && !jobs.has(raw)) jobs.set(raw, null);
    }
  };
  collect(CSS_URL_RE);
  collect(CSS_IMPORT_RE);
  for (const raw of jobs.keys()) {
    try {
      const abs = new URL(raw, baseUrl).href;
      if (raw.split('?')[0].endsWith('.css') && depth < 2) {
        const text = await (await fetchBlob(abs, budget)).text();
        jobs.set(raw, `data:text/css;base64,${btoa(unescape(encodeURIComponent(
          await inlineCss(text, abs, budget, depth + 1))))}`);
      } else {
        jobs.set(raw, await toDataURL(abs, budget));
      }
    } catch {
      budget.tethered += 1;
      try { jobs.set(raw, new URL(raw, baseUrl).href); } catch { jobs.set(raw, raw); }
    }
  }
  return css.replace(CSS_URL_RE, (all, q, raw) => (jobs.get(raw) ? `url(${q}${jobs.get(raw)}${q})` : all))
    .replace(CSS_IMPORT_RE, (all, q, raw) => (jobs.get(raw) ? `@import ${q}${jobs.get(raw)}${q}` : all));
}

async function swallow(el, fn, budget) {
  try {
    await fn();
  } catch {
    budget.tethered += 1;
    for (const attr of ['src', 'href']) {
      const v = el.getAttribute(attr);
      if (v && !SKIP.test(v)) {
        try { el.setAttribute(attr, new URL(v, el.baseURI).href); } catch { /* leave as-is */ }
      }
    }
  }
}

/**
 * Capture a live page into a single self-contained HTML string.
 * @param {string} input  domain or URL
 * @param {(msg: string) => void} onStep  progress reporter
 * @returns {Promise<{url: string, html: string, assets: number, tethered: number}>}
 */
export async function captureLive(input, onStep) {
  const url = normalizeUrl(input);
  if (!url) throw new Error('That does not look like a URL');
  const budget = new Budget();

  onStep('Fetching page…');
  const pageRes = await fetch(url, { mode: 'cors' });
  if (!pageRes.ok) throw new Error(`The page answered HTTP ${pageRes.status}`);
  const doc = new DOMParser().parseFromString(await pageRes.text(), 'text/html');
  const abs = (v) => new URL(v, url).href;

  const sheets = [...doc.querySelectorAll('link[rel~="stylesheet"i][href]')];
  onStep(`Inlining ${sheets.length} stylesheets…`);
  for (const link of sheets) {
    await swallow(link, async () => {
      const cssUrl = abs(link.getAttribute('href'));
      const css = await (await fetchBlob(cssUrl, budget)).text();
      const style = doc.createElement('style');
      style.textContent = await inlineCss(css, cssUrl, budget);
      link.replaceWith(style);
    }, budget);
  }

  const media = [...doc.querySelectorAll('img[src], video[poster], input[type="image"i][src]')];
  onStep(`Inlining ${media.length} images…`);
  for (const el of media) {
    el.removeAttribute('srcset');
    el.removeAttribute('crossorigin');
    const attr = el.hasAttribute('poster') ? 'poster' : 'src';
    const raw = el.getAttribute(attr);
    if (!raw || SKIP.test(raw)) continue;
    await swallow(el, async () => {
      el.setAttribute(attr, await toDataURL(abs(raw), budget));
    }, budget);
  }
  for (const el of doc.querySelectorAll('picture source')) el.remove();

  for (const link of doc.querySelectorAll('link[rel~="icon"i][href], link[rel="apple-touch-icon"i][href]')) {
    await swallow(link, async () => {
      link.setAttribute('href', await toDataURL(abs(link.getAttribute('href')), budget));
    }, budget);
  }

  const scripts = [...doc.querySelectorAll('script[src]')];
  onStep(`Handling ${scripts.length} scripts…`);
  for (const sc of scripts) {
    const raw = sc.getAttribute('src');
    if (sc.type === 'module') {                    // tether: import graphs cannot inline
      sc.setAttribute('src', abs(raw));
      budget.tethered += 1;
      continue;
    }
    await swallow(sc, async () => {
      const text = await (await fetchBlob(abs(raw), budget)).text();
      const inline = doc.createElement('script');
      if (sc.defer || sc.hasAttribute('defer')) inline.setAttribute('data-was-defer', '');
      inline.textContent = text.replace(/<\/script/gi, '<\\/script');
      sc.replaceWith(inline);
    }, budget);
  }
  for (const style of doc.querySelectorAll('style')) {
    style.textContent = await inlineCss(style.textContent, url, budget);
  }

  // Navigation keeps pointing at the live site; preload hints are stale now.
  for (const a of doc.querySelectorAll('a[href], area[href], form[action]')) {
    const attr = a.hasAttribute('action') ? 'action' : 'href';
    const v = a.getAttribute(attr);
    if (v && !SKIP.test(v)) {
      try { a.setAttribute(attr, abs(v)); } catch { /* malformed href */ }
    }
  }
  for (const l of doc.querySelectorAll('link[rel="preload"i], link[rel="modulepreload"i], link[rel="dns-prefetch"i], link[rel="preconnect"i]')) l.remove();
  doc.querySelectorAll('[integrity]').forEach((el) => el.removeAttribute('integrity'));

  onStep('Serializing…');
  const html = `<!DOCTYPE html>\n<!-- Rewind browser capture of ${url} on ${new Date().toISOString()} -->\n${doc.documentElement.outerHTML}`;
  return { url, html, assets: budget.assets, tethered: budget.tethered };
}

/** Trigger a download of a capture as a standalone .html file. */
export function exportCapture(snap) {
  const blob = new Blob([snap.html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${snap.id.replace(/[/:]/g, '-')}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
