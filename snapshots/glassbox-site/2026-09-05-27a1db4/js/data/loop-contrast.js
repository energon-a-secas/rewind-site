// ── Loop lab: steer-vs-enforce contrast ──────────────────────
// The static comparison at the bottom of the Agent Loop lab: the same
// rule held two ways: asked for in the prompt, or enforced in code.
// Not a replayable run; runs.js owns that shape. The wording of every
// reliability claim matches the single-sourced copy in antipatterns.js
// (prompt-not-hook) and data/sdk.js L3. Do not let them drift apart.
//
// Escaping: sides[].claim, sides[].rel.text, levers[].text and
// `counterfactual` render RAW (inline <code>, data-tip spans).
// sides[].code goes through highlightCode. Every other field is
// plain text via escHtml.

export const LOOP_CONTRAST = {
  heading: 'Two ways to hold a rule',
  lead: 'The loop you just watched is autonomous by design: the model decides each next step. And yet the $89.99 refund passed through a guard no prompt can talk past. That is the split every architecture question turns on: the prompt asks, code enforces.',
  sides: [
    {
      id: 'prompt',
      tone: 'warn',
      title: 'Steer with the prompt, and the loop decides',
      claim: 'Every rule lives in the system prompt. The model reads it, weighs it, and follows it… usually. Nothing in the runtime stops a step that ignores it.',
      lang: 'py',
      codeLabel: 'system prompt · a request',
      code: `SYSTEM = (
    "You are a customer support agent. "
    "Verify the customer before any "
    "order operation. Never issue a "
    "refund over $500."
)
# every line above is advice the model
# follows most of the time - no guarantee`,
      rel: { tone: 'warn', text: 'Probabilistic. A prompt instruction lands roughly 90-something percent of the time, never 100.' },
    },
    {
      id: 'code',
      tone: 'ok',
      title: 'Enforce in code, and the runtime decides',
      claim: 'The rule runs as code at a lifecycle point. The model can propose anything it likes; the hook fires before the tool does, every single time.',
      lang: 'py',
      codeLabel: 'PreToolUse hook · a guarantee',
      code: `@hook("PreToolUse")
def enforce_refund_limit(call):
    if (call.name == "process_refund"
            and call.args["amount"] > 500):
        # blocks in code - the call
        # never reaches the tool
        return escalate_to_human(call)
    return call`,
      rel: { tone: 'ok', text: 'Deterministic. The hook fires 100% of the time, because it runs in code rather than in the prompt.' },
    },
  ],
  // The code-level levers beyond hooks, each hoverable via TIPS.
  levers: [
    { tip: 'hook', name: 'Hooks', text: '<code>PreToolUse</code> blocks or redirects a call before the tool runs. Money, identity, legality, safety: their rules live here, never in the prompt.' },
    { tip: 'allowed_tools', name: 'allowed_tools', text: 'The whitelist. An agent cannot call a tool outside its list: least privilege enforced by the runtime, not requested politely.' },
    { tip: 'tool_choice', name: 'tool_choice', text: '<code>auto</code> lets the model decide; <code>any</code> or a named tool makes a tool call mandatory, the guarantee behind structured output.' },
  ],
  counterfactual: 'Replay the support run above and imagine a $900 refund: the hook blocks <code>process_refund</code> and forces <code>escalate_to_human</code> with a structured handoff. No prompt wording could override it.',
  // Anti-pattern rendered by id from data/antipatterns.js; never copied.
  flag: 'prompt-not-hook',
  xref: { hash: 'sdk', level: 'l3', label: 'See it in the code you write: Agent SDK lab · L3 Hooks + the config bench →' },
};
