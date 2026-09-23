import { chapters } from './content/index.js';
import { escHtml, inline } from './utils.js';

function renderBlock(block) {
  switch (block.t) {
    case 'p':
      return `<p>${inline(block.text)}</p>`;

    case 'ul':
      return `<ul class="doc-list">${block.items.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`;

    case 'ol':
      return `<ol class="doc-list doc-list--ordered">${block.items.map(i => `<li>${inline(i)}</li>`).join('')}</ol>`;

    case 'defs':
      return `<dl class="defs">${block.items.map(i => `
        <div class="def">
          <dt>${inline(i.term)}</dt>
          <dd>${inline(i.text)}</dd>
        </div>`).join('')}</dl>`;

    case 'note':
      return `<aside class="note" data-label="${escHtml(block.label)}">
        <p class="note-label">${escHtml(block.label)}</p>
        <p class="note-text">${inline(block.text)}</p>
      </aside>`;

    case 'checklist':
      return `<ul class="checks">${block.items.map(i => `
        <li class="check">
          <span class="check-mark" aria-hidden="true"></span>
          <div class="check-body">
            <p class="check-item">${inline(i.item)}</p>
            <p class="check-how">${inline(i.how)}</p>
          </div>
        </li>`).join('')}</ul>`;

    case 'code':
      return `<figure class="code">
        ${block.label ? `<figcaption>${escHtml(block.label)}</figcaption>` : ''}
        <pre><code>${escHtml(block.text)}</code></pre>
      </figure>`;

    case 'table':
      return `<div class="table-wrap"><table>
        <thead><tr>${block.head.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead>
        <tbody>${block.rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div>`;

    case 'example':
      return `<section class="example">
        <h4 class="example-title">${inline(block.title)}</h4>
        <p class="example-scenario">${inline(block.scenario)}</p>
        <ol class="walk">${block.walk.map(w => `
          <li class="walk-step">
            <p class="walk-label">${inline(w.step)}</p>
            <p class="walk-text">${inline(w.text)}</p>
          </li>`).join('')}</ol>
        <p class="example-lesson"><span class="example-lesson-label">Takeaway</span> ${inline(block.lesson)}</p>
      </section>`;

    default:
      return '';
  }
}

function renderSection(section) {
  return `<section class="sec" id="${escHtml(section.id)}" data-section="${escHtml(section.id)}">
    <h3 class="sec-head">
      <span class="sec-num">${escHtml(section.number)}</span>
      <span class="sec-title">${inline(section.title)}</span>
      <a class="sec-anchor" href="#${escHtml(section.id)}" aria-label="Link to section ${escHtml(section.number)}">#</a>
    </h3>
    <div class="sec-body">${section.blocks.map(renderBlock).join('')}</div>
  </section>`;
}

function renderChapter(chapter) {
  const label = chapter.front ? 'Front matter' : chapter.appendix ? 'Appendix' : 'Chapter';
  const display = chapter.front ? '' : `<span class="ch-num">${escHtml(String(chapter.number))}</span>`;
  return `<article class="ch" id="${escHtml(chapter.id)}" data-chapter="${escHtml(chapter.id)}">
    <header class="ch-head">
      <div class="ch-eyebrow">
        <span class="ch-label">${label}</span>
        <button class="ch-copy" type="button" data-copy-chapter="${escHtml(chapter.id)}">Copy as Markdown</button>
      </div>
      <h2 class="ch-title">${display}<span class="ch-name">${escHtml(chapter.title)}</span></h2>
      <p class="ch-summary">${inline(chapter.summary)}</p>
    </header>
    ${chapter.sections.map(renderSection).join('')}
  </article>`;
}

export function renderDoc() {
  document.getElementById('doc').innerHTML = chapters.map(renderChapter).join('');
}

export function renderToc() {
  const html = chapters.map(chapter => {
    const num = chapter.front ? '' : `<span class="toc-ch-num">${escHtml(String(chapter.number))}</span>`;
    return `<li class="toc-ch" data-toc-chapter="${escHtml(chapter.id)}">
      <a class="toc-ch-link" href="#${escHtml(chapter.id)}">${num}<span>${escHtml(chapter.title)}</span></a>
      <ul class="toc-secs">
        ${chapter.sections.map(s => `
          <li class="toc-sec" data-toc-section="${escHtml(s.id)}">
            <a class="toc-sec-link" href="#${escHtml(s.id)}">
              <span class="toc-sec-num">${escHtml(s.number)}</span>
              <span class="toc-sec-title">${escHtml(s.title)}</span>
            </a>
          </li>`).join('')}
      </ul>
    </li>`;
  }).join('');
  document.getElementById('tocList').innerHTML = html;
}
