/* ── Learning paths ─────────────────────────────────────────
 * Each path is a self-contained track. The core path covers
 * Claude Code and Cursor side-by-side. The local-ai path covers
 * self-hosted LLMs and image generation.
 *
 * Path row shapes:
 *   { shared: id, why }            → centered spanning both columns
 *   { claude: id, cursor: id }     → side by side
 *   { claude: id }                 → left column only
 *   { cursor: id }                 → right column only
 * "why" on tool-specific entries is pulled from the tutorial description.
 */

export const PATHS = {
  core: {
    id: 'core',
    label: 'Core Agent Skills',
    subtitle: 'Claude Code and Cursor fundamentals, from install to advanced workflows.',
    steps: [
      { claude: 'install-claude-code',    cursor: 'install-cursor' },
      { claude: 'claude-custom-models',  why: 'Route Claude Code to Moonshot, Bedrock, or a local model.' },
      { shared: 'check-ai-costs',        why: 'Know where to monitor spending before you burn tokens.' },
      { claude: 'session-cost-report',   why: 'Track per-session costs and set budget alerts.' },
      { shared: 'keep-ai-costs-low',     why: 'Build cost-awareness habits from day one.' },
      { shared: 'context-management',    why: 'Compact conversations to save tokens and stay focused.' },
      { shared: 'model-selection',       why: 'Pick the right model for the task to save time and money.' },
      { shared: 'write-effective-claude-md', why: 'Give the AI context so it works effectively.' },
      { shared: 'ignore-files',          why: 'Exclude irrelevant files to reduce token waste.' },
      { claude: 'essential-cli-flags',    cursor: 'setup-cursorrules' },
      { claude: 'session-management',     cursor: 'cursor-at-references' },
      { shared: 'git-ai-workflows',      why: 'Use AI for commits, reviews, and branch management.' },
      { shared: 'create-skill',          why: 'Write your first reusable agent skill.' },
      { shared: 'install-skills-registry', why: 'Expand with community-built skills.' },
      { shared: 'explore-unfamiliar-codebase', why: 'Jump into unfamiliar repos without wasting time.' },
      { shared: 'mermaid-flowchart-basics', why: 'Visualize architecture with text-based diagrams.' },
      { shared: 'what-is-mcp',           why: 'Understand the plugin system for AI agents.' },
      { claude: 'write-slash-command',    cursor: 'cursor-notepads' },
      { claude: 'configure-mcp-claude',   cursor: 'configure-mcp-cursor' },
      { claude: 'use-arguments-commands' },
      { claude: 'claude-hooks' },
      { claude: 'auth-options' },
      { shared: 'skill-discovery-differences', why: 'Understand how each tool finds and loads skills.' },
      { shared: 'progressive-disclosure-docs', why: 'Structure docs for minimal token cost.' },
      { shared: 'parallel-agents-pattern', why: 'Speed up work by running agents concurrently.' },
      { shared: 'generate-architecture-svg', why: 'Generate version-controlled diagrams.' },
      { claude: 'chain-commands-agents' },
      { shared: 'c4-diagrams-mermaid',   why: 'Model systems at multiple zoom levels.' },
    ],
  },
  local: {
    id: 'local',
    label: 'Local AI',
    subtitle: 'Run LLMs and image generation on your own hardware. Private, offline, and cost-controlled.',
    steps: [
      { shared: 'local-ai-landscape',    why: 'Map the local AI stack before you pick tools.' },
      { shared: 'local-ai-hardware',     why: 'Check your machine can handle the models you want.' },
      { lmstudio: 'lmstudio-install',    ollama: 'ollama-install' },
      { lmstudio: 'lmstudio-first-chat', ollama: 'ollama-first-model' },
      { lmstudio: 'lmstudio-server-mode', ollama: 'ollama-modelfile' },
      { lmstudio: 'lmstudio-tool-calling', ollama: 'ollama-api-integration' },
      { lmstudio: 'lmstudio-quantization', ollama: 'ollama-embeddings' },
      { lmstudio: 'lmstudio-advanced-workflow', ollama: 'ollama-production-tips' },
      { shared: 'imagegen-landscape',    why: 'Understand diffusion models, UIs, and VRAM needs.' },
      { shared: 'imagegen-comfyui-first', why: 'Generate your first image with ComfyUI.' },
      { shared: 'imagegen-prompting',    why: 'Write prompts and negative prompts that deliver.' },
      { shared: 'imagegen-flux',         why: 'Run Flux locally on consumer hardware.' },
      { shared: 'imagegen-workflows',    why: 'Save, parameterize, and automate image pipelines.' },
      { shared: 'imagegen-api-batch',    why: 'Generate images from scripts and apps.' },
    ],
  },
  cost: {
    id: 'cost',
    label: 'Cost & Efficiency',
    subtitle: 'Find out what you are spending, then cut it without giving up capability.',
    steps: [
      { shared: 'check-ai-costs',            why: 'Find the number before you try to change it.' },
      { shared: 'session-cost-report',       why: 'Track per-session spend and set a budget alert.' },
      { shared: 'what-fills-context',        why: 'Two thirds of your bill is file reads and tool output.' },
      { shared: 'prompt-caching-economics',  why: 'The single biggest lever: hits cost a tenth of fresh input.' },
      { shared: 'output-token-discipline',   why: 'Output costs 5–6× input, and you control it directly.' },
      { shared: 'model-selection',           why: 'The spread between tiers dwarfs the spread between providers.' },
      { shared: 'batch-api-savings',         why: 'Halve the bill on anything that is not interactive.' },
      { shared: 'ignore-files',              why: 'Stop paying for build output and vendored code.' },
      { shared: 'subagent-cost-model',       why: 'Fan-out buys clean context and multiplies tokens.' },
      { shared: 'keep-ai-costs-low',         why: 'The habits that keep the number down day to day.' },
      { shared: 'local-vs-api-breakeven',    why: 'Run the hardware arithmetic honestly before you buy.' },
    ],
  },
  reliable: {
    id: 'reliable',
    label: 'Reliable Agents',
    subtitle: 'Move from "it produced something plausible" to "I can show that it is right".',
    steps: [
      { shared: 'verify-agent-output',        why: 'Cheap checks that separate belief from evidence.' },
      { shared: 'write-effective-claude-md',  why: 'Standing context that is true for every task.' },
      { shared: 'compaction-vs-fresh-session', why: 'Durable state belongs in files, not in history.' },
      { shared: 'create-skill',               why: 'Package expertise so it applies without being asked.' },
      { shared: 'progressive-disclosure-docs', why: 'A short stub that points at references beats one long file.' },
      { shared: 'golden-task-set',            why: 'Thirty cases turn model choice into evidence.' },
      { shared: 'regression-prompts',         why: 'Catch drift that happens when nothing on your side changed.' },
      { shared: 'single-agent-vs-subagents',  why: 'Isolate work that generates output you do not want to keep.' },
      { shared: 'retrieval-vs-stuffing',      why: 'Long windows made this a real decision, not a foregone one.' },
      { shared: 'agent-pipeline-patterns',    why: 'Four shapes for composing steps, and when each holds up.' },
      { shared: 'claude-hooks',               why: 'Enforce the rules mechanically instead of hoping.' },
    ],
  },
};
