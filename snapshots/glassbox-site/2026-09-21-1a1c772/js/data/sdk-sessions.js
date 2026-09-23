// ── L5: resume vs fork, as two continuations of one session ──
// One investigation, then two approaches tried from the same point. The
// only difference between the two requests is `fork_session`, so the
// demo runs both branches under each mode and shows what the second one
// receives. Under --resume the second branch inherits the first one's
// edits (the honest failure: one transcript, two attempts, interleaved);
// under fork_session neither can see the other and the parent is left
// where it was.
//
// Pure data. No DOM. Rendered by js/labs/sdk-sessions.js.
//
// Escaping: `turns[].text`, `reply`, `after.body` and `exam` render RAW;
// inline <code>/<em>/<strong> and data-tip glossary spans (keys in
// js/tips.js). Every other field is plain text via escHtml.

/** The shared prefix. Both branches start from exactly this. */
export const SESS_TRUNK = {
  id: 'cart-flicker',
  messages: 4,
  tokens: 18400,
  label: 'The investigation both approaches start from',
  transcript: [
    { role: 'You', text: 'The cart total flickers to <code>$0</code> for one frame when a line item is removed. Find out why.' },
    { role: 'Claude', text: 'Read 14 files. <code>CartProvider</code> recomputes <code>total</code> in a <code>useEffect</code> that runs <em>after</em> the item-list state commits, so one render pairs the new list with the cleared total. Two consumers depend on it: <code>MiniCart</code>, <code>CheckoutSummary</code>.' },
    { role: 'You', text: 'Before changing anything, what are the two ways out?' },
    { role: 'Claude', text: 'Either derive the total during render and drop the effect (Context API, 3 files), or move cart state into a store and read it through a selector (Redux Toolkit, ~5 files).' },
  ],
};

/**
 * The two continuations. `reply.clean` is what the branch says when it can
 * only see the trunk; `reply.tainted` is what it says when it ran second
 * inside the *same* session and can see the other branch's work.
 */
export const SESS_BRANCHES = [
  {
    id: 'a',
    label: 'Approach A · Redux Toolkit',
    prompt: 'Implement the Redux Toolkit version.',
    reply: {
      clean: 'Added <code>cartSlice</code> with a <code>selectTotal</code> selector, wired <code>&lt;Provider&gt;</code> in <code>App.tsx</code>, replaced <code>CartProvider</code> in 5 files. The flicker is gone: the total is derived in the selector, never in an effect.',
      tainted: 'This session already removed the effect and computes <code>total</code> inline in <code>CartProvider</code>. Adding the slice on top of that leaves two sources of truth, so I reverted the inline version first, and the provider is now a thin wrapper around the store.',
    },
  },
  {
    id: 'b',
    label: 'Approach B · Context API',
    prompt: 'Implement the Context API version.',
    reply: {
      clean: 'Kept <code>CartProvider</code>, deleted the <code>useEffect</code>, computed <code>total</code> during render behind a <code>useMemo</code>. Three files, no new dependency, flicker gone.',
      tainted: 'This session already added <code>cartSlice</code> and a <code>&lt;Provider&gt;</code>. A context version would shadow the store, so I deleted <code>selectTotal</code> and moved the maths back into the provider. The slice is still imported in two files.',
    },
  },
];

/** What the two modes cost, read off the session afterwards. */
export const SESS_AFTER = {
  resume: {
    tone: 'gap',
    title: 'One session, eight messages, two attempts interleaved',
    body: 'Whichever branch ran second reasoned about files the first one had already rewritten, and said so. There is no diff between the two approaches because there is only one transcript, and the working tree now carries half of each.',
  },
  fork: {
    tone: 'ok',
    title: 'Parent untouched at 4 messages, one child per approach',
    body: 'Each child inherited the investigation and nothing else, so both replies answer the question you actually asked. Compare them, keep one, delete the other, and the branch point is still there for a third attempt.',
  },
};

export const SESS_ORDER_NOTE = {
  resume: 'Order decides which branch gets contaminated: the second one inherits the first one\'s edits.',
  fork: 'Order is irrelevant. Neither branch can see the other, so the two requests could run at the same time.',
};

export const SESS_EXAM = 'Two candidate approaches from one good starting point is the <code data-tip="fork_session">fork_session</code> tell. <code>--resume</code> is for carrying <em>one</em> line of work forward. When the stem says something changed in the world since the session ran (files refactored, a dependency upgraded, days passed) the answer is neither: start fresh with a written summary of the findings.';
