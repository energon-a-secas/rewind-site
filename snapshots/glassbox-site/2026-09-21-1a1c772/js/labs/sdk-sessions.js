// ── L5 demo: resume vs fork (partial of labs/sdk.js) ─────────
// Two continuations of one investigation, side by side, under a mode the
// reader flips. The only difference between the two requests is one
// boolean, so the demo puts both requests on screen and lets the replies
// carry the consequence: under --resume the branch that ran second can
// see the first one's edits and says so; under fork_session neither can,
// and the parent stays at the branch point.
//
// Escaping contract in data/sdk-sessions.js: transcript text, replies,
// `after.body` and the exam note render RAW; labels and prompts are plain
// text via escHtml.

import { SESS_TRUNK, SESS_BRANCHES, SESS_AFTER, SESS_ORDER_NOTE, SESS_EXAM } from '../data/sdk-sessions.js';
import { escHtml, highlightCode } from '../utils.js';

const S = { mode: 'resume', first: 'a' };

const fmt = (n) => n.toLocaleString('en-US');

/** The context the branch is handed: the trunk, plus the other branch's
 *  exchange when they share one session and this one ran second. */
function seen(tainted) {
  return tainted
    ? { messages: SESS_TRUNK.messages + 2, tokens: 26100 }
    : { messages: SESS_TRUNK.messages, tokens: SESS_TRUNK.tokens };
}

function request(branch) {
  const opts = S.mode === 'fork'
    ? `    options={"resume": "${SESS_TRUNK.id}", "fork_session": True},`
    : `    options={"resume": "${SESS_TRUNK.id}"},`;
  return ['query(', `    prompt="${branch.prompt}"`, opts, ')'].join('\n');
}

function seg(name, options) {
  return `<div class="seg-group" data-sess="${name}">${options.map((o) =>
    `<button class="seg${S[name] === o.v ? ' is-active' : ''}" type="button" data-v="${o.v}">${escHtml(o.label)}</button>`).join('')}</div>`;
}

function branchHtml(branch, i) {
  const tainted = S.mode === 'resume' && S.first !== branch.id;
  const ctx = seen(tainted);
  const sid = S.mode === 'resume' ? SESS_TRUNK.id : `${SESS_TRUNK.id}-fork-${i + 1}`;
  const order = S.mode === 'fork'
    ? 'independent'
    : S.first === branch.id ? 'ran first' : 'ran second';
  return `
    <article class="sess-branch${tainted ? ' is-tainted' : ''}">
      <header class="sess-branch__head">
        <h5>${escHtml(branch.label)}</h5>
        <span class="sess-sid"><code>${escHtml(sid)}</code>${S.mode === 'fork' ? 'new session' : 'same session'}</span>
      </header>
      <div class="code-block code-block--sm">
        <div class="code-block__bar"><span class="code-block__lang">request</span><span class="sess-order">${order}</span></div>
        <pre><code>${highlightCode(request(branch), 'py')}</code></pre>
      </div>
      <div class="sess-reply">
        <span class="sess-reply__who">Claude</span>
        <p>${tainted ? branch.reply.tainted : branch.reply.clean}</p>
      </div>
      <footer class="sess-branch__meta">
        Context handed to it: ${ctx.messages} messages · ${fmt(ctx.tokens)} tokens
        ${tainted ? '<b>· including the other branch’s edits</b>' : ''}
      </footer>
    </article>`;
}

export function sessionsHtml() {
  const after = SESS_AFTER[S.mode];
  return `
    <div class="sess">
      <div class="sess__controls">
        <div class="sess__ctl"><span>Continue the session with</span>${seg('mode', [
    { v: 'resume', label: '--resume' }, { v: 'fork', label: 'fork_session' },
  ])}</div>
        <div class="sess__ctl"><span>Ran first</span>${seg('first', [
    { v: 'a', label: 'Approach A' }, { v: 'b', label: 'Approach B' },
  ])}</div>
      </div>
      <p class="sess__note sess__note--${S.mode}">${escHtml(SESS_ORDER_NOTE[S.mode])}</p>

      <section class="sess-trunk">
        <header class="sess-trunk__head">
          <code>${escHtml(SESS_TRUNK.id)}</code>
          <span>${SESS_TRUNK.messages} messages · ${fmt(SESS_TRUNK.tokens)} tokens</span>
          <em>${escHtml(SESS_TRUNK.label)}</em>
        </header>
        <ol class="sess-turns">
          ${SESS_TRUNK.transcript.map((t) => `
            <li class="sess-turn sess-turn--${t.role === 'You' ? 'you' : 'claude'}">
              <span>${escHtml(t.role)}</span><p>${t.text}</p>
            </li>`).join('')}
        </ol>
      </section>

      <div class="sess-fork" aria-hidden="true"><span class="sess-fork__tag">${
  S.mode === 'fork' ? 'two children, one boolean apart' : 'one session, two continuations'
}</span></div>

      <div class="sess-split">${SESS_BRANCHES.map(branchHtml).join('')}</div>

      <div class="sess-after sess-after--${after.tone}">
        <h5>${escHtml(after.title)}</h5>
        <p>${after.body}</p>
      </div>
      <div class="sdk-exam"><span>On the exam</span><p>${SESS_EXAM}</p></div>
    </div>`;
}

/** Returns true when it consumed the click. The demo lives inside the
 *  level view, which is re-rendered wholesale, so state lives here and
 *  the caller re-renders; nothing is bound per node. */
export function sessionsClick(e) {
  const btn = e.target.closest('.sess [data-v]');
  const group = btn?.closest('[data-sess]');
  if (!btn || !group) return false;
  S[group.dataset.sess] = btn.dataset.v;
  return true;
}
