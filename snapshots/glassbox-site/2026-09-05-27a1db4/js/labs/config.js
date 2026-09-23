// ── Lab 3: Config Explorer (VS Code-style) ───────────────────
// A repo at four maturity levels, plus the user scope (~/.claude) as a
// second, constant sidebar tree. Pick a level, browse, click a file to
// read it with an annotation on what it changes.

import { CONFIG_LEVELS, CONFIG_FILES, USER_TREE } from '../data/config.js';
import { ANTIPATTERNS } from '../data/antipatterns.js';
import { el, escHtml, flagHtml, highlightCode, copyText } from '../utils.js';

const C = { level: 0, file: null };
const DEFAULT_FILE = { l0: 'readme', l1: 'claudemd', l2: 'rulesApi', l3: 'skill' };

function levelObj() { return CONFIG_LEVELS[C.level]; }

// Display names by file id (the L3 tree is a superset of every level).
const FILE_NAMES = {};
(function collect(ns) {
  ns.forEach((n) => (n.children ? collect(n.children) : n.file && (FILE_NAMES[n.file] = n.name)));
})([...CONFIG_LEVELS[CONFIG_LEVELS.length - 1].tree, ...USER_TREE]);

/** Read-order chip for a file row: session-start files get their number
 *  in `lv.startOrder`; everything else names its trigger. */
function loadChip(id, lv) {
  const ld = id && CONFIG_FILES[id] && CONFIG_FILES[id].load;
  if (!ld) return '';
  if (ld.when === 'start') {
    const n = lv.startOrder.indexOf(id);
    return n === -1 ? '' : `<span class="tree-load tree-load--start" title="${escHtml(ld.title)}">${n + 1}</span>`;
  }
  return `<span class="tree-load tree-load--${ld.when}" title="${escHtml(ld.title)}">${escHtml(ld.chip)}</span>`;
}

function treeHtml(nodes, depth, lv) {
  return nodes.map((n) => {
    const pad = `style="padding-left:${8 + depth * 16}px"`;
    if (n.children) {
      return `<li class="tree-dir"><div class="tree-row tree-row--dir" ${pad}><span class="tree-caret">\u25be</span><span class="tree-ic">${n.ic || '\ud83d\udcc1'}</span>${escHtml(n.name)}</div><ul>${treeHtml(n.children, depth + 1, lv)}</ul></li>`;
    }
    const active = n.file === C.file;
    const dot = n.file ? '' : ' tree-row--plain';
    // Openable rows are keyboard-reachable buttons; plain rows stay inert.
    const press = n.file ? ' tabindex="0" role="button"' : '';
    return `<li><div class="tree-row tree-file${active ? ' is-active' : ''}${dot}" data-file="${n.file || ''}"${press}${active ? ' aria-current="true"' : ''} ${pad}><span class="tree-ic">\ud83d\udcc4</span>${escHtml(n.name)}${loadChip(n.file, lv)}</div></li>`;
  }).join('');
}

function renderTree() {
  const lv = levelObj();
  document.getElementById('cfgTree').innerHTML = `<ul class="tree">${treeHtml(lv.tree, 0, lv)}</ul>`;
}

// \u2500\u2500 Read-order replay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Pulses the session-start files in reading order when a level is
// selected (and on demand). The numbered chips stay put; the pulse
// only draws the eye along them once.
let pulseTimers = [];
function clearPulse() {
  pulseTimers.forEach(clearTimeout);
  pulseTimers = [];
  document.querySelectorAll('.tree-row.is-reading').forEach((r) => r.classList.remove('is-reading'));
}
function replayReadOrder() {
  clearPulse();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  levelObj().startOrder.forEach((id, i) => {
    pulseTimers.push(setTimeout(() => {
      document.querySelectorAll(`.tree-file[data-file="${id}"]`).forEach((r) => {
        r.classList.add('is-reading');
        pulseTimers.push(setTimeout(() => r.classList.remove('is-reading'), 900));
      });
    }, 200 + i * 450));
  });
}

/** Every file id reachable at the current level: project tree, plus the
 *  user scope at levels that show it (see `userScope` in the data). */
function levelFiles() {
  const out = [];
  const walk = (ns) => ns.forEach((n) => (n.children ? walk(n.children) : n.file && out.push(n.file)));
  walk(levelObj().tree);
  if (levelObj().userScope) walk(USER_TREE);
  return out;
}

/** Class/aria toggle only, with no tree re-render, so keyboard focus survives. */
function updateActive() {
  document.querySelectorAll('.tree-file[data-file]').forEach((r) => {
    const on = r.dataset.file === C.file;
    r.classList.toggle('is-active', on);
    if (on) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current');
  });
}

function selectFile(id) {
  C.file = id;
  updateActive();
  renderFile();
}

function renderFile() {
  const view = document.getElementById('cfgView');
  const f = C.file && CONFIG_FILES[C.file];
  if (!f) {
    view.innerHTML = `<div class="cfg-empty">Select a file to read it.</div>`;
    return;
  }
  // "Who wins" renders only when both colliding files exist at this level,
  // so the skill collision appears exactly when the project copy does (L3).
  const wins = f.collision && levelFiles().includes(f.collision.with)
    ? `<div class="cfg-annot cfg-annot--wins"><span class="cfg-annot__tag">who wins</span><p>${f.collision.note}</p></div>` : '';
  const ap = f.flag && ANTIPATTERNS[f.flag];
  const flag = ap ? `<div class="loop-flag">${flagHtml(ap)}</div>` : '';
  view.innerHTML = `
    <div class="code-block">
      <div class="code-block__bar"><span class="code-block__lang">${escHtml(f.lang)}</span><button class="code-copy" type="button" id="cfgCopy">copy</button></div>
      <pre><code>${highlightCode(f.code, f.lang)}</code></pre>
    </div>
    <div class="cfg-annot"><span class="cfg-annot__tag">what it changes</span><p>${f.annotation}</p></div>
    ${wins}${flag}`;
}

function renderMeta() {
  const lv = levelObj();
  document.getElementById('cfgTagline').textContent = lv.tagline;
  document.getElementById('cfgBehavior').innerHTML = `<span class="cfg-behavior__tag">Claude\u2019s behavior</span> ${escHtml(lv.behavior)}`;
  document.querySelectorAll('.cfg-step').forEach((b) => b.classList.toggle('is-active', +b.dataset.i === C.level));
}

function selectLevel(i) {
  C.level = i;
  const lv = levelObj();
  // The user scope only appears once the project has custom skills to
  // collide with (L3); before that, the second tree stays hidden.
  const userScopeEl = document.getElementById('cfgUserScope');
  if (userScopeEl) userScopeEl.hidden = !lv.userScope;
  // keep current file if it still exists at this level, else default
  const files = levelFiles();
  if (!files.includes(C.file)) C.file = DEFAULT_FILE[lv.id] || files[0];
  renderMeta(); renderTree(); updateActive(); renderFile();
  const replay = document.getElementById('cfgReplay');
  if (replay) {
    replay.disabled = !lv.startOrder.length;
    replay.title = lv.startOrder.length ? 'Watch the session-start reads, in order' : 'Nothing auto-loads at this level';
  }
  replayReadOrder();
}

export function mountConfig(root) {
  // Same path stepper as the SDK lab: one component shape for "pick a
  // level" across the site (the old .cfg-lvl cards spent a full row on it).
  const levelTabs = CONFIG_LEVELS.map((lv, i) => `<button class="sdk-step cfg-step" data-i="${i}"><span class="sdk-step__n">${lv.level}</span><span class="sdk-step__label">${escHtml(lv.label)}</span></button>`).join('');

  root.innerHTML = `
    <section class="lab lab-config">
      <header class="lab__head">
        <div>
          <h2 class="lab__title">A repo, from bare to fully outfitted</h2>
          <p class="lab__lead">Step a project through four levels of Claude Code config. Each file you add changes what Claude knows before it types a character. Click a file to read it. At L3, once custom skills exist, a second tree appears: your <span data-tip="user_scope">user scope</span>, where a personal copy of the same skill can silently shadow the team’s.</p>
        </div>
      </header>

      <nav class="sdk-stepper cfg-path" aria-label="Maturity levels">${levelTabs}</nav>
      <p class="cfg-tagline" id="cfgTagline"></p>
      <div class="cfg-behavior" id="cfgBehavior"></div>

      <div class="cfg-legend">
        <span class="cfg-legend__lab">Read order</span>
        <span class="cfg-legend__item"><span class="tree-load tree-load--start">1</span> in context before the first keystroke, broad → specific</span>
        <span class="cfg-legend__item"><span class="tree-load tree-load--path">on edit</span> when a matching file is touched</span>
        <span class="cfg-legend__item"><span class="tree-load tree-load--invoke">/name</span> when you invoke it</span>
        <span class="cfg-legend__item"><span class="tree-load tree-load--never">if asked</span> only if Claude opens it</span>
        <button class="btn btn--ghost btn--sm cfg-legend__replay" type="button" id="cfgReplay">▶ replay</button>
      </div>

      <div class="cfg-ide">
        <aside class="cfg-sidebar">
          <div class="cfg-sidebar__head">Explorer · project</div>
          <div id="cfgTree"></div>
          <div id="cfgUserScope" hidden>
            <div class="cfg-sidebar__head cfg-sidebar__head--user">User scope · ~/.claude</div>
            <p class="cfg-user-sub">follows you, not the repo</p>
            <div id="cfgTreeUser"></div>
          </div>
        </aside>
        <div class="cfg-main" id="cfgView"></div>
      </div>

      <p class="store-rule">Read the tree a second way and it is a set of <strong>context stores</strong>: <code>CLAUDE.md</code> is loaded into every session, a <code>.claude/rules/</code> file only when a matching path is edited, a scratchpad file only when the agent is told to open it. Which fact belongs in which, and what each one survives, is <a href="#context">where the fact lives</a> in the Context lab.</p>
    </section>`;

  // The user scope never changes with the level, so render it once. Its
  // read-order numbers come from the level that shows it (L3).
  const userLevel = CONFIG_LEVELS.find((lv) => lv.userScope);
  root.querySelector('#cfgTreeUser').innerHTML = `<ul class="tree tree--user">${treeHtml(USER_TREE, 0, userLevel)}</ul>`;

  root.querySelector('.cfg-path').addEventListener('click', (e) => {
    const b = e.target.closest('.cfg-step'); if (b) selectLevel(+b.dataset.i);
  });
  // One pair of delegated listeners covers both trees.
  const sidebar = root.querySelector('.cfg-sidebar');
  sidebar.addEventListener('click', (e) => {
    const r = e.target.closest('.tree-file'); if (r && r.dataset.file) selectFile(r.dataset.file);
  });
  sidebar.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const r = e.target.closest('.tree-file');
    if (r && r.dataset.file) { e.preventDefault(); selectFile(r.dataset.file); }
  });
  // The copy button is re-created with every renderFile; delegate instead.
  root.querySelector('#cfgView').addEventListener('click', (e) => {
    if (e.target.closest('#cfgCopy') && C.file) copyText(CONFIG_FILES[C.file].code, `${FILE_NAMES[C.file] || 'File'} copied`);
  });
  root.querySelector('#cfgReplay').addEventListener('click', replayReadOrder);

  selectLevel(C.level);

  // render.js runs this before the next mount: pending pulse timers must
  // not fire against a detached tree.
  return clearPulse;
}
