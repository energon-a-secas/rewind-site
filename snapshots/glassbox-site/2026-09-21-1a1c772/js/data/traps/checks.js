// ── Final checks ─────────────────────────────────────────────
// The passes to run over a stem before committing to an answer.
// Pure data. No DOM. Rendered by js/labs/traps.js.
//
// Refs: Wn = the 12 worked "Examples of Exam Questions with
// Explanations"; Qn = the 76-question practice test.
//
// Escaping: `body` is rendered RAW (it carries <code> and <em>).
// `title` is escaped - keep it free of markup.
// `beyond: true` means the check comes from third-party question
// banks rather than the official guide; the renderer badges it.

export const CHECKS = [
  {
    id: 'read-the-last-sentence',
    title: 'Read the last sentence of the stem first.',
    body: 'It names the metric that has to improve, and it often carries a constraint that eliminates two options before you weigh any of them - Q28 forbids filtering anything before developers see it, Q52 forbids adding human oversight, Q44 forbids committing credentials. An option that violates the stated constraint is out regardless of how good it otherwise looks.',
  },
  {
    id: 'name-the-root-cause',
    title: 'Name the root cause before you read the options.',
    body: 'Say it in one sentence from the stem alone: "the coordinator decomposed too narrowly", "the descriptions are minimal", "assistant turns are diluting the system prompt". Every explanation in the guide is written as root cause versus symptom, and the correct answer almost always names the same cause you just did.',
  },
  {
    id: 'mechanism-over-wording',
    title: 'Prefer the option that changes the mechanism.',
    body: 'When two options would both plausibly help, the winner makes the failure impossible rather than discouraged: a programmatic precondition over a stronger prompt (W1, Q51), a token-bound tool pair over instructions in the tool description (Q61), a <code>PostToolUse</code> hook over documenting each tool\'s formats in the system prompt (Q59). Hooks and code are deterministic; prompts are probabilistic at best (§3.5).',
  },
  {
    id: 'distrust-new-infrastructure',
    title: 'Distrust any option that adds a component.',
    body: 'Classifiers, dedicated error-handling agents, shared-state buses, intermediate summarization agents, and vector stores are this exam\'s default wrong answers - they get graded as overengineering when a description, a criterion, or an explicit partition would do (Q3, Q11, Q47, Q65). Take the smallest intervention that removes the cause, and scale up only when the stem proves the small one cannot work (Q68).',
  },
  {
    id: 'no-human-workarounds',
    title: 'Never make humans work around the system.',
    body: 'Splitting PRs by hand, filling in an intake form, answering four clarifying questions, or confirming "did that fully resolve your issue?" all move work onto people without improving the system (W12, Q27, Q52, Q74). The one exception is information only the user holds - a single question for a missing identifier or a contradictory preference is the correct answer (Q55, Q63).',
  },
  {
    id: 'invented-flags',
    title: 'If a flag or config file sounds invented, it is.',
    body: 'The guide plants non-existent surfaces routinely: <code>.claude/config.json</code>, <code>.claude/config.yaml</code>, <code>--batch</code>, <code>CLAUDE_HEADLESS=true</code>, <code>override: true</code>, a <code>session_id</code> parameter. If you cannot place it in the real surface - <code>CLAUDE.md</code>, <code>.claude/rules/</code>, <code>.claude/commands/</code>, <code>.claude/skills/</code>, <code>.claude/settings.json</code>, <code>.mcp.json</code>, <code>-p</code>/<code>--print</code>, <code>--output-format json</code>, <code>--json-schema</code> - eliminate it on sight.',
  },
  {
    id: 'numbers-are-the-discriminator',
    title: 'Treat the numbers in the stem as the discriminator.',
    body: 'A statistic is never decoration: 78% versus 93% by keyword points at the system prompt (Q56), an 85/15 split puts a narrow tool in the subagent and leaves the rest with the coordinator (W9, Q15), 8% timeouts against 4% syntax errors forbids uniform retry (Q62), and three months against one session decides retrieval versus in-place structuring (Q68 versus Q65). Find the number and the branch is usually already decided.',
  },
  {
    id: 'most-effective-not-valid',
    title: 'The question asks most effective, not valid.',
    body: 'Expect two or three options that would genuinely help; the guide dismisses them as "adds tokens without addressing the root cause", "overengineering", or "more effort than justified" (W2). Rank the survivors by whether they hit the cause you named, then by effort - lowest effort with highest impact wins.',
  },
  {
    id: 'chk-knobs',
    title: 'A sampling knob is almost never the answer.',
    beyond: true,
    body: '<span data-tip="temperature"><code>temperature</code></span>, <code>top_p</code>, and <code>top_k</code> are real API parameters, which is exactly what makes them good distractors. Across 718 third-party bank questions they appear 64 times and are the credited answer <em>zero</em> times. Consistency comes from few-shot examples, a tool contract, or a schema; determinism comes from code and hooks. "Set temperature to 0" changes how the model samples, not what it was told to do - and it never repairs a structural failure.',
  },
  {
    id: 'chk-real-mechanism',
    title: 'Name the mechanism that actually enforces it.',
    beyond: true,
    body: 'Convention files describe intent; permission surfaces enforce it. <code>.gitignore</code> tells version control what not to track and <code>.claudeignore</code> does not exist at all - neither one denies a read. The enforcing surfaces are <span data-tip="permissions_deny"><code>permissions.deny</code></span> / <code>permissions.allow</code> in <span data-tip="settings_json"><code>.claude/settings.json</code></span> and a <code>PreToolUse</code> hook that exits <code>2</code> to block the call. When an option protects a secret with a file that merely lists paths, it is describing a wish.',
  },
  {
    id: 'chk-model-names',
    title: 'Check the model name is real before you weigh the option.',
    beyond: true,
    body: 'Plausible-but-invented model names are the cheapest distractor in the third-party banks: across 25 appearances a fabricated name is credited <em>zero</em> times. "Claude 3.7 Opus" never shipped - 3.7 was Sonnet only. Recognise the shape of a real <span data-tip="model_tiers">tier name</span> (family, then tier, then version) and an unfamiliar one becomes an elimination rather than a coin flip.',
  },
  {
    id: 'answer-everything',
    title: 'Answer every question.',
    body: 'There is no guessing penalty and the pass mark is 720 on a 100-1000 scale, so a blank is strictly worse than a guess. When stuck, eliminate against the lure catalogue first - classifier, sentiment, self-rated confidence, bigger model, consensus voting, post-hoc filter, sampling knob - and choose from whatever survives.',
  },
];
