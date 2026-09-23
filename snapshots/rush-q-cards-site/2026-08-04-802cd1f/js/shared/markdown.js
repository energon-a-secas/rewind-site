// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.
// ── Markdown renderer ────────────────────────────────────────
// Fetches .md file and renders via marked.js CDN.
// marked.js must be loaded before this module runs.

/** Fetch a markdown file and render it into a container element.
 *  Returns the rendered HTML string for further processing. */
export async function renderMarkdown(url, containerEl) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    const md = await resp.text();
    const html = marked.parse(md);
    containerEl.innerHTML = html;
    return html;
  } catch (err) {
    containerEl.innerHTML = `<p style="color:#ef4444">Error loading content: ${err.message}</p>`;
    return '';
  }
}

/** Turn a heading's text into a stable, readable URL fragment. */
function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') || 'section';
}

/** Drop an inline index that the sidebar contents now replaces.
 *  Keeping both means the first screen of the page is a list of links to
 *  the same list of links. */
export function stripInlineIndex(contentEl) {
  for (const el of [...contentEl.children]) {
    if (el.tagName !== 'P') continue;
    if (el.textContent.trim().toLowerCase() !== 'index') continue;
    const list = el.nextElementSibling;
    el.remove();
    if (list && (list.tagName === 'UL' || list.tagName === 'OL')) {
      const rule = list.nextElementSibling;
      list.remove();
      if (rule && rule.tagName === 'HR') rule.remove();
    }
    return;
  }
}

/** Build a two-level table of contents (h2 + h3) with scroll-spy.
 *  A single-level list is useless on a document this long — you need to see
 *  the shape of a section before deciding to jump into it. */
export function generateTOC(contentEl, tocEl) {
  const headings = [...contentEl.querySelectorAll('h2, h3')];
  if (!headings.length) return;

  const seen = new Set();
  for (const h of headings) {
    let id = h.id || slugify(h.textContent);
    let n = 2;
    while (seen.has(id)) id = `${slugify(h.textContent)}-${n++}`;
    seen.add(id);
    h.id = id;

    const anchor = document.createElement('a');
    anchor.className = 'heading-anchor';
    anchor.href = `#${id}`;
    anchor.textContent = '#';
    anchor.setAttribute('aria-label', `Link to ${h.textContent}`);
    h.appendChild(anchor);
  }

  const list = document.createElement('ul');
  list.className = 'toc';
  let sub = null;

  for (const h of headings) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.firstChild?.textContent?.trim() || h.textContent.replace(/#$/, '').trim();
    li.appendChild(a);

    if (h.tagName === 'H2') {
      list.appendChild(li);
      sub = null;
    } else {
      if (!sub) {
        sub = document.createElement('ul');
        sub.className = 'toc-sub';
        (list.lastElementChild || list).appendChild(sub);
      }
      sub.appendChild(li);
    }
  }

  tocEl.innerHTML = '<p class="toc-title">On this page</p>';
  tocEl.appendChild(list);

  const links = new Map([...tocEl.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));

  // Track the topmost heading that has passed the header, so the highlight
  // never blanks out between sections or lags on a fast scroll.
  let ticking = false;
  const offset = 120;
  function spy() {
    ticking = false;
    let current = headings[0];
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= offset) current = h;
      else break;
    }
    for (const [id, a] of links) a.classList.toggle('active', id === current.id);
    const active = links.get(current.id);
    if (active && tocEl.scrollHeight > tocEl.clientHeight) {
      const box = active.getBoundingClientRect();
      const wrap = tocEl.getBoundingClientRect();
      if (box.top < wrap.top || box.bottom > wrap.bottom) {
        active.scrollIntoView({ block: 'nearest' });
      }
    }
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(spy); }
  }, { passive: true });
  spy();
}

/** Make table columns sortable by click. */
export function makeSortable(tableEl) {
  const headers = tableEl.querySelectorAll('th');
  const tbody = tableEl.querySelector('tbody') || tableEl;

  headers.forEach((th, colIdx) => {
    let asc = true;
    th.innerHTML += ' <span class="sort-icon">\u2195</span>';
    th.addEventListener('click', () => {
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const aVal = a.cells[colIdx]?.textContent.trim() || '';
        const bVal = b.cells[colIdx]?.textContent.trim() || '';
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return asc ? aNum - bNum : bNum - aNum;
        }
        return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
      rows.forEach(r => tbody.appendChild(r));
      asc = !asc;
    });
  });
}
