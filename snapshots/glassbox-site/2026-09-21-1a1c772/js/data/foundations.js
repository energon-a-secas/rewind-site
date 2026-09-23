// ── Foundations lab data ─────────────────────────────────────
// The layer under every other lab: what a token is, how text becomes
// tokens, how the model picks the next one, what temperature actually
// changes, and the prompt techniques that sit one level above.
//
// Escaping contract: PROMPT_TECHNIQUES[].differs/wins/exam render RAW
// (inline <code>/<em> allowed). exampleCode goes through highlightCode.
// Everything else is plain text via escHtml.

// ── Tokenizer demo ───────────────────────────────────────────
// The starter text for the chunker. The demo itself is a heuristic
// splitter in the lab; honest copy about that lives in CHUNKER_NOTE.
//
// The seed is chosen to make the insight land on first paint: ordinary words,
// one order ID, one price, and exactly one genuinely rare word. Change it and
// check the readouts still tell the truth. A seed whose priciest word is a
// common one teaches the opposite of the lesson.
export const CHUNKER_SEED = 'The refund for order B-2041 is $129.99. Flag it as unreconcilable and notify Priya.';

export const CHUNKER_NOTE = 'An approximation. The real tokenizer is a learned table (byte-pair encoding) that keeps common words whole and splits rare ones; this demo imitates that shape with a word-length rule, and (like a real vocabulary) lets a single space ride along with the chunk after it. The properties that matter are real, though: the same text always chunks the same way, and the count is what billing, rate limits, and the context window are all measured in.';

export const TOKEN_FACTS = [
  { k: 'What it is', v: 'The atom the model reads and writes. A chunk of text drawn from a fixed vocabulary, and it can be a whole word, a word piece, a single character, or a space.', tip: 'token' },
  { k: 'Rough size', v: 'About 4 characters or ¾ of a word in English prose. Code, dense JSON, and non-English text tokenize worse, sometimes 2–3× more tokens for the same meaning.' },
  { k: 'Why you care', v: 'Everything is measured in tokens: the price of a call, the rate limit, and the context window. “How much can it see” and “how much did that cost” are the same unit.', tip: 'context_window' },
  { k: 'The stateless part', v: 'Tokens are the whole story of every request; the model keeps nothing between calls. A fact that is not in this request’s tokens does not exist for this turn.' },
];

// Chip legend for the chunker. The colour of a chip means its KIND, not its
// position. That is the whole insight the demo carries: the expensive chunks
// are the ones a real vocabulary had no single entry for. Keys match the
// `kind` values classified in labs/foundations.js.
export const CHUNK_KINDS = [
  { id: 'word', label: 'whole word', hint: 'Common enough that the vocabulary has an entry for it. One word, one token: the cheapest text you can write.' },
  { id: 'piece', label: 'word piece', hint: 'Too rare for its own entry, so it is spelled out in fragments. This is the expensive kind: unusual words, names, identifiers and non-English text arrive in pieces.' },
  { id: 'digit', label: 'digits', hint: 'Numbers are cut into short groups, so a long figure costs more than a word of the same length, and the model sees fragments, not a value. It is also why arithmetic is a tool call, not a talent.' },
  { id: 'punct', label: 'punctuation', hint: 'Its own token nearly every time. JSON braces, quotes, commas and Markdown syntax are all billed like words.' },
  { id: 'space', label: 'whitespace', hint: 'Not free. A real tokenizer usually attaches one space to the word after it and gives runs of spaces and newlines their own tokens. Either way, the indentation in a pasted file is paid for.' },
];

// Live readouts under the chunker. `id` is filled in by the lab; `hint`
// explains what the number is for, which is the part a bare figure never says.
export const CHUNK_STATS = [
  { id: 'tokens', label: 'tokens', hint: 'What billing, the rate limit and the context window are all counted in.' },
  { id: 'ratio', label: 'chars / token', hint: 'English prose lands near 4. Below 3 means the text is fragmenting: code, IDs, or another language.' },
  { id: 'words', label: 'words → tokens', hint: 'The ¾-of-a-word rule of thumb, measured on what you actually typed instead of assumed.' },
  { id: 'worst', label: 'priciest word', hint: 'The word that cost the most tokens. Rename an identifier like this one and a long prompt gets measurably cheaper.' },
];

export const CHUNK_HOVER_HINT = 'Hover or tap a chunk to see what it cost and why.';

// ── Prediction demo ──────────────────────────────────────────
// Fixed candidate tokens with hand-set logits; the lab recomputes
// softmax(logit / T) live as the temperature slider moves. The numbers
// are illustrative, not measured; the *shape* of the effect is the lesson.
export const PREDICTION = {
  context: 'The refund for order B-2041 comes to',
  candidates: [
    { token: ' $', logit: 2.4, note: 'the pattern the whole conversation points at' },
    { token: ' the', logit: 1.1, note: 'grammatical, dodges the question' },
    { token: ' about', logit: 0.4, note: 'what a summary-happy model says' },
    { token: ' zero', logit: -0.6, note: 'a real possibility the policy has to rule out' },
    { token: ' zebra', logit: -2.8, note: 'legal English, nonsense here' },
  ],
  temps: [
    { v: 0.2, label: '0.2 · nearly greedy', use: 'Extraction, classification, tool arguments: tasks with one right continuation.' },
    { v: 1.0, label: '1.0 · the trained balance', use: 'Open conversation and drafting, where some variety reads as natural.' },
    { v: 2.0, label: '2.0 · flattened', use: 'Brainstorming fodder. Long-shot tokens become likely; so do bad ones.' },
  ],
  notes: [
    'Temperature reweights the distribution the prompt already built; it cannot add a candidate. If “$129.99” is not in the context, no temperature setting will produce it.',
    'At the low end the top token wins almost every time; at temperature 0 the model is effectively argmax. Deterministic-ish output comes from the knob, not from asking nicely.',
    'Do not combine temperature with top-p in one request. Pick one knob. And remember what it is not: a correctness dial. That is why exam stems that offer “lower the temperature” as a fix for wrong facts or wrong format are bait.',
  ],
};

// ── Prompt techniques, side by side ──────────────────────────
// One task run six ways, so the differences are visible instead of
// definitional. `exampleCode` is the prompt (or prompts) as shipped.
export const TECHNIQUE_TASK = 'Get the refund amount out of a customer message.';

export const PROMPT_TECHNIQUES = [
  {
    id: 'zeroshot', name: 'Zero-shot instruction', tip: null,
    blurb: 'Just say what you want. No examples, no scaffolding.',
    exampleLang: 'text',
    exampleCode: `Extract the refund amount from this message.
Reply with the amount only.

"The hoodie from A-1188 was $42.50, please refund it."`,
    gets: '“$42.50”, usually. Format and edge cases drift because “amount only” means whatever the model thinks it means.',
    wins: 'Capable models on ordinary tasks. Always the baseline: if zero-shot is already reliable, every further technique is overhead.',
    differs: 'The cheapest prompt and the least controlled. Every other technique below is a way of buying reliability with tokens.',
    exam: 'When a stem complains about inconsistent output from a plain instruction, the fix is one of the techniques below, not “reword the instruction more firmly”.',
  },
  {
    id: 'fewshot', name: 'Few-shot examples', tip: 'few_shot',
    blurb: 'Show 2–4 input/output pairs instead of describing the format.',
    exampleLang: 'text',
    exampleCode: `Extract the refund amount. Reply with the amount only.

Message: "Order B-2041, keyboard DOA, $129.99 please."
Amount: $129.99

Message: "No refund needed, A-1188 arrived fine."
Amount: none

Message: "The hoodie from A-1188 was $42.50, please refund it."
Amount:`,
    gets: '“$42.50”, in the demonstrated format, including the hard case (“none”) the instruction never mentioned.',
    wins: 'Format-sensitive tasks, and any task where the boundary is easier to show than to define: “flag a comment only when it contradicts the code” comes with one example of each side.',
    differs: 'Teaches by pattern instead of by rule. Beats adjectives (“be precise”) because the example carries the decision logic, not just the shape.',
    exam: 'The guide’s standard pairing is few-shot + explicit criteria: a testable definition for the boundary, examples showing both sides of it.',
  },
  {
    id: 'cot', name: 'Chain-of-thought', tip: null,
    blurb: 'Let the model reason in writing before committing to the answer.',
    exampleLang: 'text',
    exampleCode: `A customer bought three items: $42.50, $129.99, $259.00.
The $129.99 one arrived dead; the rest are fine.
Work out the refund. Think step by step, then give
the final amount on the last line as "Amount: $X".`,
    gets: 'A visible derivation, then the answer. Multi-step arithmetic and logic stop being one fragile leap.',
    wins: 'Anything with intermediate steps: totals, eligibility rules, multi-constraint scheduling. Also makes the reasoning inspectable when the answer is wrong.',
    differs: 'Spends output tokens to buy accuracy, the opposite trade from zero-shot. For extraction-class tasks it is overkill; few-shot is cheaper.',
    exam: 'Distinct from asking for a longer answer: the value is the ordered steps, not the word count. Pairs naturally with a structured final line the app can parse.',
  },
  {
    id: 'structured', name: 'Structured output', tip: 'structured_outputs',
    blurb: 'Constrain the reply to a schema instead of hoping to parse prose.',
    exampleLang: 'json',
    exampleCode: `// the request carries an output format
output_config: {
  format: {
    type: "json_schema",
    schema: {
      type: "object",
      properties: {
        amount:   { type: ["number", "null"] },
        currency: { type: "string" },
        order_id: { type: "string" }
      },
      required: ["amount", "order_id"]
    }
  }
}`,
    gets: 'Parseable JSON every time: no “Sure! The amount is…” preamble, no regex, no retry loop.',
    wins: 'Anything another program consumes. Extraction, routing, form-filling; the extraction scenario is a whole exam domain.',
    differs: 'Enforcement instead of encouragement: the constraint lives in the request, not in the wording. A tool with an input_schema does the same job for a tool call.',
    exam: '“Reply in JSON” in prose still parses-against-hope; the schema surface is what removes the retry-and-reparse loop. Required fields cut both ways: they push the model to fabricate when the source lacks a value.',
  },
  {
    id: 'role', name: 'Role & system framing', tip: 'system_prompt',
    blurb: 'Move the standing rules out of the user message and into the system prompt.',
    exampleLang: 'text',
    exampleCode: `system: You are Riley, a refunds agent. Verify the order
  before quoting. Quote exact amounts, never rounded.
  If the message names no amount, answer "none".

user: "The hoodie from A-1188 was $42.50, please refund it."`,
    gets: 'The same answer, plus behaviour that survives topic changes, because the rules outrank and outlast any single user turn.',
    wins: 'Persona, policy, tone, hard constraints: anything that should hold for the whole conversation rather than one message.',
    differs: 'Authority, not content: a rule in the system prompt outranks the same rule buried mid-conversation. It still dilutes as history piles up, which is the Context lab’s story.',
    exam: 'A mid-conversation system-role message updates instructions for the turns that follow; later ones take precedence.',
  },
  {
    id: 'chain', name: 'Prompt chaining', tip: null,
    blurb: 'Split the job into two calls, each with one job.',
    exampleLang: 'text',
    exampleCode: `Call 1 · classify:  "Does this message request a refund?
                       Answer yes or no."
Call 2 · extract:   only if yes, run the extraction prompt
                       from the few-shot card.

Each call gets a fresh, focused context.`,
    gets: 'Two easy prompts instead of one prompt that must classify, extract, and format simultaneously. Each step is testable on its own.',
    wins: 'Pipelines with a genuine fork: classify then extract, draft then critique, gather then summarize. Also caps the blast radius of a bad step.',
    differs: 'Engineering, not wording: the improvement comes from the decomposition, not from any single prompt. The cost is latency and the glue code between calls.',
    exam: 'When one prompt keeps failing at two jobs, “split into focused calls” beats “add more instructions to the prompt”, the same judgement as coordinator/subagent splits, one level down.',
  },
];

// ── Where to go next ─────────────────────────────────────────
export const FOUNDATIONS_NEXT = [
  { hash: 'loop', label: 'Agent Loop', why: 'Prediction is one turn; the loop is what happens between turns.' },
  { hash: 'context', label: 'Context', why: 'The window these tokens fill, and the strategies for fitting a long conversation into it.' },
  { hash: 'patterns', label: 'Playbook', why: 'The exam\'s version of this: which technique the stem is really asking for.' },
];
