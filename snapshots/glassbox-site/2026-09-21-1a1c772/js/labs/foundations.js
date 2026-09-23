// ── Lab: Foundations ─────────────────────────────────────────
// The layer under every other lab. Two live demos (a heuristic token
// chunker, a temperature slider over fixed logits) plus the prompt
// techniques compared on one shared task.
//
// Escaping contract mirrors data/foundations.js: technique
// gets/wins/differs/exam render raw; everything else is escaped.

import { CHUNKER_SEED, CHUNKER_NOTE, CHUNK_KINDS, CHUNK_STATS, CHUNK_HOVER_HINT, TOKEN_FACTS, PREDICTION, TECHNIQUE_TASK, PROMPT_TECHNIQUES, FOUNDATIONS_NEXT } from '../data/foundations.js';
import { escHtml, highlightCode } from '../utils.js';

// ── Token chunker ────────────────────────────────────────────
// NOT a tokenizer, an imitation of BPE's shape: ordinary words stay whole,
// long ones split ~4 characters, digits ~3, punctuation is its own token.
// data/foundations.js says this to the reader; the lesson is the count and
// the determinism, not the exact boundaries.
//
// Two rules are here because leaving them out made the demo *teach the wrong
// number*. A single space rides along with the chunk after it, as a real BPE
// vocabulary does ("␣refund" is one entry); billing whitespace separately
// put the seed text at 1.9 characters per token against the ¾-of-a-word fact
// card two rows above it. And the split threshold is 8 letters, not 6: at 6
// the demo fragmented "refund", which any real vocabulary has whole, and the
// point is that *rare* words are the expensive ones.
//
// Every chunk carries its `kind` and, when it came from a split, the whole
// word and how many tokens that word cost. That is what the chip colour and
// the hover readout are built from. Colour means kind here, never position.
function chunkText(text) {
  const pieces = text.match(/[ \t]|\s+|[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) || [];
  const out = [];
  let lead = ''; // a single pending space, merged into the next chunk
  const push = (t, kind, word, n = 1, i = 1) => {
    out.push({ t: lead + t, kind, word, n, i, lead: Boolean(lead) });
    lead = '';
  };
  const split = (word, size, kind) => {
    const parts = [];
    for (let i = 0; i < word.length; i += size) parts.push(word.slice(i, i + size));
    parts.forEach((t, i) => push(t, kind, word, parts.length, i + 1));
  };
  for (const p of pieces) {
    if (p === ' ' || p === '\t') { if (lead) push('', 'space', lead); lead = p; }
    else if (/^\s+$/.test(p)) push(p, 'space', p);            // newlines and runs
    else if (/^[A-Za-z]{8,}$/.test(p)) split(p, 4, 'piece');
    else if (/^\d{4,}$/.test(p)) split(p, 3, 'digit');
    else if (/^[A-Za-z]+$/.test(p)) push(p, 'word', p);
    else if (/^\d+$/.test(p)) push(p, 'digit', p);
    else push(p, 'punct', p);
  }
  if (lead) push('', 'space', lead);
  return out;
}

const KIND = Object.fromEntries(CHUNK_KINDS.map((k) => [k.id, k]));

/** The chunk as the reader should see it: a merged space shown as a glyph,
 *  because an HTML leading space collapses and the space is the point. */
function disp(c) {
  if (c.kind === 'space') return /\n/.test(c.t) ? '⏎' : '␣'.repeat(Math.min(c.t.length, 8));
  return c.lead ? `␣${c.t.slice(1)}` : c.t;
}

/** What one chunk cost, and why. The line the hover readout shows. */
function chunkStory(c, idx, total) {
  const k = KIND[c.kind];
  const shown = c.kind === 'space'
    ? (/\n/.test(c.t) ? 'a line break' : `${c.t.length} spaces`)
    : `“${disp(c)}”`;
  const cost = c.n > 1
    ? `part ${c.i} of ${c.n} · “${c.word}” costs ${c.n} tokens`
    : 'costs 1 token';
  return { short: `${shown} · ${k.label} · ${cost}`, hint: k.hint, pos: `${idx + 1}/${total}` };
}

/** Live insight figures. Every one is measured off the typed text. */
function chunkStats(text, chunks) {
  const cost = new Map(); // whole word -> tokens that word cost
  for (const c of chunks) {
    if (c.kind === 'word' || c.kind === 'piece') cost.set(c.word, c.n);
  }
  // Occurrences, not distinct entries: "the the the" is three words that cost
  // three tokens, and a distinct-key count would report one.
  const wordCount = (text.match(/[A-Za-z]+/g) || []).length;
  const n = chunks.length;
  const worst = [...cost.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    tokens: String(n),
    ratio: text.length && n ? (text.length / n).toFixed(1) : '–',
    words: wordCount ? `${wordCount} → ${n}` : '–',
    worst: worst && worst[1] > 1 ? `“${worst[0]}” ×${worst[1]}` : 'none, every word whole',
  };
}

function renderChunks(host, text) {
  const chunks = chunkText(text);
  const total = chunks.length;
  host.innerHTML = chunks.map((c, i) => {
    const s = chunkStory(c, i, total);
    return `<span class="tok-chip tok-chip--${c.kind}" data-kind="${c.kind}" data-i="${i}"
      title="#${s.pos} ${s.short}">${escHtml(disp(c))}</span>`;
  }).join('');
  return chunks;
}

function legend() {
  return CHUNK_KINDS.map((k) => `
    <button class="tok-key" type="button" data-kind-key="${k.id}" title="${escHtml(k.hint)}">
      <span class="tok-chip tok-chip--${k.id}">${escHtml(k.label)}</span>
    </button>`).join('');
}

function statCells() {
  return CHUNK_STATS.map((s) => `
    <div class="fnd-stat" title="${escHtml(s.hint)}">
      <span class="fnd-stat__v" id="fndStat-${s.id}">–</span>
      <span class="fnd-stat__k">${escHtml(s.label)}</span>
    </div>`).join('');
}

// ── Prediction / temperature ─────────────────────────────────
const P = { temp: 1.0, generated: [] };

function probs(temp) {
  const logits = PREDICTION.candidates.map((c) => c.logit / temp);
  const max = Math.max(...logits); // subtract the max before exp: softmax is shift-invariant, floats are not
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function renderPred() {
  const ps = probs(P.temp);
  const rows = PREDICTION.candidates.map((c, i) => {
    const pct = Math.round(ps[i] * 1000) / 10;
    return `
      <div class="pred-row">
        <code class="pred-tok" title="${escHtml(c.note)}">${escHtml(c.token)}</code>
        <div class="pred-track"><div class="pred-fill" style="width:${Math.max(1.5, pct)}%"></div></div>
        <span class="pred-pct">${pct.toFixed(1)}%</span>
      </div>`;
  }).join('');
  const host = document.getElementById('fndPred');
  if (!host) return;
  host.innerHTML = rows;
  const t = document.getElementById('fndTempVal');
  if (t) t.textContent = P.temp.toFixed(2);
  // The nearest preset owns the "use" line. The slider is continuous but
  // the advice comes in three bands.
  const near = PREDICTION.temps.reduce((a, b) => Math.abs(b.v - P.temp) < Math.abs(a.v - P.temp) ? b : a);
  const use = document.getElementById('fndTempUse');
  if (use) use.innerHTML = `<strong>${escHtml(near.label)}.</strong> ${escHtml(near.use)}`;
  const gen = document.getElementById('fndGen');
  if (gen) {
    gen.innerHTML = `<span class="fnd-gen__ctx">${escHtml(PREDICTION.context)}</span><span class="fnd-gen__out">${escHtml(P.generated.join(''))}</span><span class="fnd-gen__caret">▌</span>`;
  }
}

function sampleOne() {
  const ps = probs(P.temp);
  let r = Math.random();
  let i = ps.length - 1;
  for (let k = 0; k < ps.length; k++) { r -= ps[k]; if (r <= 0) { i = k; break; } }
  P.generated.push(PREDICTION.candidates[i].token);
  renderPred();
}

// ── Sections ─────────────────────────────────────────────────
function factCards() {
  return TOKEN_FACTS.map((f) => `
    <div class="prim">
      <h4${f.tip ? ` data-tip="${f.tip}"` : ''}>${escHtml(f.k)}</h4>
      <p>${escHtml(f.v)}</p>
    </div>`).join('');
}

function techniqueCards() {
  return PROMPT_TECHNIQUES.map((t) => `
    <article class="fnd-tech">
      <header class="fnd-tech__head">
        <h4${t.tip ? ` data-tip="${t.tip}"` : ''}>${escHtml(t.name)}</h4>
        <p>${escHtml(t.blurb)}</p>
      </header>
      <div class="code-block code-block--sm">
        <div class="code-block__bar"><span class="code-block__lang">${escHtml(t.exampleLang)}</span></div>
        <pre><code>${highlightCode(t.exampleCode, t.exampleLang === 'json' ? 'js' : 'md')}</code></pre>
      </div>
      <dl class="fnd-tech__grid">
        <div><dt>You get</dt><dd>${escHtml(t.gets)}</dd></div>
        <div><dt>When it wins</dt><dd>${t.wins}</dd></div>
        <div><dt>How it differs</dt><dd>${t.differs}</dd></div>
      </dl>
      <p class="fnd-tech__exam"><span>On the exam</span> ${t.exam}</p>
    </article>`).join('');
}

export function mountFoundations(root) {
  P.temp = 1.0; P.generated = [];

  root.innerHTML = `
    <section class="lab lab-fnd">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">The layer under everything</h2>
          <p class="lab__lead">Every other lab talks about loops, tools, and windows. This one is what they are made of: <span data-tip="token">tokens</span>, one prediction at a time, with <span data-tip="temperature">temperature</span> deciding how brave each pick is. Two live demos, then the prompt techniques one level up.</p>
        </div>
      </header>

      <section class="lab-sub" data-section="Tokens">
        <h3>Tokens: the unit everything is measured in</h3>
        <div class="prim-grid">${factCards()}</div>

        <div class="fnd-chunker">
          <label class="fnd-chunker__lab" for="fndText">Type something, watch it chunk</label>
          <textarea id="fndText" rows="2" spellcheck="false">${escHtml(CHUNKER_SEED)}</textarea>
          <div class="fnd-chips" id="fndChips" aria-live="polite"></div>
          <p class="fnd-read" id="fndRead">${escHtml(CHUNK_HOVER_HINT)}</p>
          <div class="fnd-stats">${statCells()}</div>
          <div class="tok-keys" id="fndKeys">${legend()}</div>
          <p class="fnd-count">${escHtml(CHUNKER_NOTE)}</p>
        </div>
      </section>

      <section class="lab-sub" data-section="Prediction &amp; temperature">
        <h3>Prediction: one token, chosen from a distribution</h3>
        <p class="lab__lead">The model does not look up an answer. It scores every token in its vocabulary for “what comes next” and samples from that distribution. Given the context below, five candidates and their learned logits are fixed; <strong>you</strong> control the temperature.</p>

        <div class="fnd-predbox">
          <div class="fnd-gen" id="fndGen"></div>
          <div class="fnd-pred" id="fndPred"></div>
          <div class="fnd-tempctl">
            <label for="fndTemp">temperature <output id="fndTempVal">1.00</output></label>
            <input type="range" id="fndTemp" min="0.05" max="2.5" step="0.05" value="1">
            <p class="fnd-tempuse" id="fndTempUse"></p>
            <div class="fnd-btns">
              <button class="btn btn--primary btn--sm" id="fndSample" type="button">Sample the next token</button>
              <button class="btn btn--ghost btn--sm" id="fndClear" type="button">Clear</button>
            </div>
          </div>
        </div>
        <ul class="fnd-notes">
          ${PREDICTION.notes.map((n) => `<li>${escHtml(n)}</li>`).join('')}
        </ul>
      </section>

      <section class="lab-sub" data-section="Prompt techniques">
        <h3>Prompt techniques, side by side</h3>
        <p class="lab__lead">One task, <em>${escHtml(TECHNIQUE_TASK)}</em>, solved six ways. The difference is never “wording”; each technique moves a different lever: tokens spent, format guarantees, authority, decomposition.</p>
        <div class="fnd-techs">${techniqueCards()}</div>
      </section>

      <section class="lab-sub" data-section="Where this pays off">
        <h3>Where this pays off next</h3>
        <div class="fnd-next">
          ${FOUNDATIONS_NEXT.map((n) => `<a class="ov-chip" href="#${n.hash}"><b>${escHtml(n.label)}</b>${escHtml(n.why)}</a>`).join('')}
        </div>
      </section>
    </section>`;

  const ta = document.getElementById('fndText');
  const chips = document.getElementById('fndChips');
  const read = document.getElementById('fndRead');
  let chunks = [];
  const update = () => {
    chunks = renderChunks(chips, ta.value);
    const s = chunkStats(ta.value, chunks);
    for (const k of Object.keys(s)) {
      const cell = document.getElementById(`fndStat-${k}`);
      if (cell) cell.textContent = s[k];
    }
  };
  ta.addEventListener('input', update);
  update();

  // Hover (or tap) a chunk for what it cost and why. The chips also carry a
  // `title`, so the explanation survives without pointer events.
  const showChunk = (chip) => {
    const c = chunks[Number(chip.dataset.i)];
    if (!c) return;
    const s = chunkStory(c, Number(chip.dataset.i), chunks.length);
    read.innerHTML = `<b>#${s.pos}</b> ${escHtml(s.short)} · ${escHtml(s.hint)}`;
  };
  chips.addEventListener('pointerover', (e) => {
    const chip = e.target.closest('.tok-chip');
    if (chip) showChunk(chip);
  });
  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.tok-chip');
    if (chip) showChunk(chip);
  });
  chips.addEventListener('pointerleave', () => { read.textContent = CHUNK_HOVER_HINT; });

  // Legend: hovering a kind dims the other kinds, so "which of these cost me
  // three tokens each" is one gesture instead of reading 30 chips.
  const keys = document.getElementById('fndKeys');
  const dim = (kind) => {
    chips.querySelectorAll('.tok-chip').forEach((c) => {
      c.classList.toggle('is-dim', Boolean(kind) && c.dataset.kind !== kind);
    });
  };
  const kindOf = (e) => e.target.closest('[data-kind-key]')?.dataset.kindKey;
  keys.addEventListener('pointerover', (e) => {
    const k = kindOf(e);
    if (!k) return;
    dim(k);
    const meta = KIND[k];
    const cost = chunks.filter((c) => c.kind === k).length;
    read.innerHTML = `<b>${escHtml(meta.label)}</b> · ${cost} of ${chunks.length} tokens · ${escHtml(meta.hint)}`;
  });
  keys.addEventListener('click', (e) => {
    const k = kindOf(e);
    if (k) dim(k);
  });
  keys.addEventListener('pointerleave', () => { dim(null); read.textContent = CHUNK_HOVER_HINT; });

  document.getElementById('fndTemp').addEventListener('input', (e) => {
    P.temp = parseFloat(e.target.value);
    renderPred();
  });
  document.getElementById('fndSample').addEventListener('click', sampleOne);
  document.getElementById('fndClear').addEventListener('click', () => { P.generated = []; renderPred(); });
  renderPred();
}
