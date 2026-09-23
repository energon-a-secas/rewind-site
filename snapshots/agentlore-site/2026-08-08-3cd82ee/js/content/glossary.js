/**
 * Working definitions — what the term means when you are actually using it,
 * not a dictionary entry. Feeds the command palette so a half-remembered
 * word gets you somewhere useful.
 */

export const GLOSSARY = [
  { term: 'Token', aliases: ['tokens', 'tokenisation'], def: 'The unit models read and bill in. Roughly 4 characters or 0.75 words of English — but that ratio shifts by tokenizer, so two models can charge different amounts for identical text at the same headline price.', see: 'check-ai-costs' },
  { term: 'Context window', aliases: ['context length'], def: 'The maximum tokens a model can consider at once — system prompt, conversation, files, tool output, and the response. A larger window is permission to include more, not an instruction to.', see: 'context-management' },
  { term: 'Prompt caching', aliases: ['cache', 'caching'], def: 'Reusing already-processed input across calls. A cache hit costs about a tenth of fresh input, which makes it the single biggest lever on an agentic bill, since those loops re-send the same context every turn.', see: 'keep-ai-costs-low' },
  { term: 'Cache hit rate', aliases: ['hit rate'], def: 'The share of your input tokens served from cache. Below 50% on an agentic workload means you are leaving most of the available saving on the table.' },
  { term: 'Batch API', aliases: ['batch processing'], def: 'Submit work asynchronously for roughly half price. Free money for anything not interactive — backfills, migrations, bulk classification, eval runs.' },
  { term: 'Agentic loop', aliases: ['agent loop', 'tool loop'], def: 'The cycle of model → tool call → result → model, repeated until the task is done. Each turn re-sends the accumulated context, which is why caching and context discipline dominate the cost.' },
  { term: 'Tool calling', aliases: ['function calling'], def: 'The model emitting a structured request to run something — read a file, query a database — and receiving the result as new input. What separates an agent from a chatbot.' },
  { term: 'MCP', aliases: ['model context protocol'], def: 'A protocol for exposing tools and data to an agent through a server. Reach for it when the agent needs to touch a system it otherwise cannot.', see: 'what-is-mcp' },
  { term: 'Skill', aliases: ['agent skill', 'SKILL.md'], def: 'A folder with a SKILL.md that the agent loads when its description matches the situation. Expertise that applies automatically, without being invoked.', see: 'create-skill' },
  { term: 'Slash command', aliases: ['custom command'], def: 'A prompt template you invoke explicitly, usually with arguments. Use it when you want the action on demand rather than applied automatically.', see: 'write-slash-command' },
  { term: 'Subagent', aliases: ['sub-agent', 'agent delegation'], def: 'A separate agent run with its own context window. The point is isolation — a large search or analysis finishes without flooding the main conversation with its intermediate work.', see: 'parallel-agents-pattern' },
  { term: 'Compaction', aliases: ['compact', 'summarisation'], def: 'Summarising an over-long conversation so work can continue. Cheaper than a fresh session, lossier than you expect — anything load-bearing should live in a file, not in the history.', see: 'context-management' },
  { term: 'Progressive disclosure', aliases: [], def: 'Structuring instructions so only a stub is always loaded and detail is read on demand. The reason a short SKILL.md pointing at references beats one long file.', see: 'progressive-disclosure-docs' },
  { term: 'Grounding', aliases: ['grounded'], def: 'Anchoring output to something checkable — a bundled reference, real command output, a validator that fails loudly — rather than to the model\'s recollection.' },
  { term: 'Eval', aliases: ['evals', 'golden set'], def: 'A fixed set of cases with known-good answers, run against a model or prompt to measure whether a change helped. The only honest way to pick the cheapest model that still works.' },
  { term: 'Hallucination', aliases: ['confabulation'], def: 'Confidently stated output with no basis in fact or context. Not random: it clusters where the model lacks grounding, which is exactly where a reference file or validator belongs.' },
  { term: 'Frontier model', aliases: ['frontier'], def: 'The most capable tier a provider offers. Correct for ambiguous, high-stakes, or genuinely novel work — wasteful for anything you can already specify exactly.' },
  { term: 'Blended price', aliases: ['blended'], def: 'Input and output prices combined into one comparable number. This site weights them 3:1, roughly the shape of agentic coding, because headline input price alone ranks models misleadingly.' },
  { term: 'Quantization', aliases: ['quantisation', 'Q4', 'GGUF'], def: 'Storing model weights at lower precision to cut memory. Q4 roughly quarters the VRAM against 16-bit for a modest quality cost — what makes a 30B model fit on a consumer GPU.', see: 'lmstudio-quantization' },
  { term: 'VRAM', aliases: ['video memory', 'GPU memory'], def: 'GPU memory, the binding constraint on local models. Rough estimate: parameters × bits ÷ 8, plus headroom for the KV cache. A 30B model at Q4 needs about 20 GB.', see: 'local-ai-hardware' },
  { term: 'Inference', aliases: [], def: 'Running a trained model to produce output. Distinct from training — everything on this site is inference.' },
  { term: 'System prompt', aliases: [], def: 'The standing instructions sent ahead of the conversation. Re-sent on every call, so it is both the most influential text you write and a permanent line item on your bill. Cache it.' },
  { term: 'RAG', aliases: ['retrieval augmented generation'], def: 'Fetching relevant documents and putting them in context before the model answers. Beats stuffing everything in when the corpus is larger than the window — or when most of it is irrelevant to this question.' },
  { term: 'Embeddings', aliases: ['vector', 'embedding'], def: 'Text mapped to vectors so similar meanings land near each other. The retrieval half of RAG.', see: 'ollama-embeddings' },
  { term: 'Tokenizer', aliases: [], def: 'The component splitting text into tokens. Changing it changes how many tokens the same text costs — newer Claude models emit roughly 30% more, so compare cost per finished task rather than per token.' },
  { term: 'Model routing', aliases: ['routing'], def: 'Sending each task to the cheapest tier that handles it, escalating only on failure. The spread between tiers is far larger than between providers, which makes this the highest-leverage cost decision available.', see: 'model-selection' },
  { term: 'CLAUDE.md', aliases: ['claude md', 'project context'], def: 'A file of standing project context loaded on every request. Powerful and expensive for exactly the same reason — keep it to what is true for every task, and push the rest into skills.', see: 'write-effective-claude-md' },
  { term: 'Context engineering', aliases: [], def: 'Deciding deliberately what occupies the window: what to include, what to summarise, what to leave in a file the agent can fetch. The skill that most separates effective agent use from frustrating agent use.' },
];
