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

/** Generate a table of contents from h2 headings inside a container.
 *  Each heading gets an id, and a list of links is returned. */
export function generateTOC(contentEl, tocEl) {
  const headings = contentEl.querySelectorAll('h2');
  if (!headings.length) return;

  const items = [];
  headings.forEach((h, i) => {
    const id = h.id || `section-${i}`;
    h.id = id;
    items.push({ id, text: h.textContent });
  });

  tocEl.innerHTML = `<ul class="toc">${items.map(item =>
    `<li><a href="#${item.id}">${item.text}</a></li>`
  ).join('')}</ul>`;

  // Highlight active TOC item on scroll
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        tocEl.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        const link = tocEl.querySelector(`a[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    }
  }, { rootMargin: '-80px 0px -60% 0px' });

  headings.forEach(h => observer.observe(h));
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
