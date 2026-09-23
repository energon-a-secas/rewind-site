export const localAi = [

  {
    id: 'local-ai-landscape',
    title: 'Local AI Landscape',
    description: 'Map the self-hosted AI stack before you pick your first tool',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## Why run AI locally?

Cloud AI is fast and capable, but it sends your code, prompts, and data to someone else's server. Local AI keeps everything on your machine: private, offline, and with no per-token bill. It is also the cheapest way to experiment aggressively.

## The three local stacks

| Stack | Best for | Entry point |
|-------|----------|-------------|
| **LM Studio** | GUI-first chat, quick experiments, OpenAI-compatible server | Download app |
| **Ollama** | Terminal-first workflows, automation, Modelfiles | One-line install |
| **Image generation** | Creative assets, thumbnails, dataset generation | ComfyUI |

## Key concepts

- **Model weights** are the trained files (several GB each).
- **Quantization** shrinks weights to trade a little quality for a lot of speed.
- **VRAM** on your GPU decides how large a model fits without slowing down.
- **CPU offload** lets slower machines run big models using system RAM.

## Choose your first stack

- Want a chat UI today? Start with **LM Studio**.
- Want scripts and terminal control? Start with **Ollama**.
- Want images? Start with **ComfyUI**.

You can mix them later. LM Studio and Ollama can both expose the same local model through an API.`,
  },

  {
    id: 'local-ai-hardware',
    title: 'Local AI Hardware Check',
    description: 'Estimate what your machine can run before downloading models',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## What matters

Three numbers decide your local AI experience:

1. **VRAM** on your GPU — the fast memory models live in.
2. **System RAM** — used when a model does not fit in VRAM.
3. **Storage** — model weights are 4 GB to 30 GB each.

## Quick checks

### macOS

\`\`\`bash
system_profiler SPDisplaysDataType | grep "VRAM"
\`\`\`

Apple Silicon uses unified memory. Check total RAM:

\`\`\`bash
sysctl hw.memsize
\`\`\`

### Windows

Open Task Manager → Performance → GPU. Look at "Dedicated GPU memory".

### Linux

\`\`\`bash
nvidia-smi
free -h
\`\`\`

## Rule of thumb

| Model size | Quantization | VRAM needed | Good for |
|------------|--------------|-------------|----------|
| 7B | Q4 | 4–6 GB | Fast chat, simple coding |
| 13B | Q4 | 8–10 GB | Better reasoning |
| 70B | Q4 | 40+ GB | Near-frontier quality |

## If you do not have a GPU

Modern CPUs can run small quantized models. It will be slower, but it works. Use **Ollama** or **LM Studio** and set GPU offload to 0 layers.

## Storage tip

Keep models on an SSD. Loading a 10 GB weight file from a spinning disk is painful.`,
  },

  {
    id: 'lmstudio-install',
    title: 'Install LM Studio',
    description: 'Download, install, and run your first local model with a GUI',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## What is LM Studio?

LM Studio is a desktop app for running local LLMs. It wraps download, chat, and server modes behind a clean interface. It is the fastest way to go from zero to a working local model.

Official site: [lmstudio.ai](https://lmstudio.ai/)

## Install

1. Download LM Studio from the official site: [lmstudio.ai](https://lmstudio.ai/)
2. Open the installer
3. Launch LM Studio

Available for macOS, Windows, and Linux.

## Download your first model

Open the **Search** tab and pick a starter model:

- **Qwen 2.5 7B** — fast, capable coding helper
- **Llama 3.1 8B** — general purpose, well supported
- **DeepSeek-R1-Distill-Qwen 7B** — reasoning model

Click **Download**. Models are stored under:

\`\`\`
macOS:   ~/.cache/lm-studio/models/
Windows: %USERPROFILE%\.cache\lm-studio\models\
Linux:   ~/.cache/lm-studio/models/
\`\`\`

## Send your first prompt

1. Go to the **Chat** tab
2. Select your downloaded model from the dropdown
3. Type: 

\`\`\`
Write a Python function that reverses a string.
\`\`\`

You should see a response generated entirely on your machine.

## Verify it is local

Disconnect from the internet and send another prompt. If it still works, your model is truly local.`,
  },

  {
    id: 'lmstudio-first-chat',
    title: 'Chat with Local Models',
    description: 'Use the built-in chat UI, compare models, and manage memory',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## The chat controls

After loading a model in LM Studio, the right panel shows:

- **System prompt** — persistent instructions for every turn
- **Temperature** — lower for code, higher for creativity
- **Max tokens** — cap the response length
- **Context length** — how much conversation history to keep

## Recommended starter settings for coding

\`\`\`
System prompt: You are a terse, expert coding assistant.
Temperature: 0.2
Max tokens: 2048
Context length: 4096
\`\`\`

## Compare models side by side

Open two chat tabs, load different models, and ask them the same question. This is the fastest way to learn which model fits your workflow.

## Manage GPU offload

In **Model Configuration**, adjust **GPU offload layers**. More layers = faster, but uses more VRAM. Start with the maximum your hardware allows. If generation is slow or crashes, reduce layers.

## Save chats

LM Studio saves conversation history automatically. You can export a chat from the menu if you want to keep a record outside the app.`,
  },

  {
    id: 'lmstudio-server-mode',
    title: 'Use LM Studio as an OpenAI-Compatible Server',
    description: 'Expose local models to Claude Code, Cursor, or scripts via API',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## Why server mode matters

Server mode turns LM Studio into a drop-in replacement for the OpenAI API. Any tool that accepts a custom base URL can talk to your local model.

## Start the server

1. Go to the **Developer** tab
2. Click **Start Server**
3. Note the URL, usually 

\`\`\`
http://localhost:1234/v1
\`\`\`

## Test with curl

\`\`\`bash
curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-model",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
\`\`\`

## Connect Claude Code

\`\`\`bash
claude --api-url http://localhost:1234/v1
\`\`\`

## Connect Cursor

Open Settings → Models → OpenAI API. Set the base URL to:

\`\`\`
http://localhost:1234/v1
\`\`\`

Use any non-empty string for the API key.

## Keep the server running

Server mode only works while LM Studio is open. For headless automation, prefer **Ollama**.`,
  },

  {
    id: 'lmstudio-tool-calling',
    title: 'Tool Calling with Local Models',
    description: 'Give local models access to files, search, and shell commands',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## What is tool calling?

Tool calling lets the model ask your program to run a function, then uses the result in its answer. It is how agents read files, search code, or call APIs.

## Which local models support it?

Tool calling works best on models trained for it:

- Qwen 2.5
- Llama 3.1+
- Mistral Nemo
- Hermes 3

Check LM Studio's **Tool Calling** template in the model settings.

## Minimal Python example

\`\`\`python
import requests, json

def read_file(path):
    with open(path) as f:
        return f.read()

tools = [{
    "type": "function",
    "function": {
        "name": "read_file",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    }
}]

r = requests.post("http://localhost:1234/v1/chat/completions", json={
    "model": "local-model",
    "messages": [{"role": "user", "content": "Summarize main.py"}],
    "tools": tools
}).json()

msg = r["choices"][0]["message"]
if msg.get("tool_calls"):
    args = json.loads(msg["tool_calls"][0]["function"]["arguments"])
    content = read_file(args["path"])
    print(content)
\`\`\`

## Expect imperfections

Local models are less reliable at tool calling than Claude. Always validate arguments and handle missing parameters gracefully.`,
  },

  {
    id: 'lmstudio-quantization',
    title: 'Pick the Right Quantization',
    description: 'Balance speed, quality, and VRAM for your hardware',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## What is quantization?

Quantization reduces the precision of model weights. A 16-bit weight becomes 4-bit or 5-bit. The model shrinks dramatically and runs faster, but loses a small amount of quality.

## Common formats

| Format | Size vs FP16 | Quality | Speed |
|--------|--------------|---------|-------|
| Q4_K_M | ~25% | Good | Fastest |
| Q5_K_M | ~31% | Very good | Fast |
| Q8_0   | ~50% | Excellent | Moderate |
| FP16   | 100% | Best | Slowest |

## Picking a format

- **Q4_K_M** for quick drafts and machines with 8 GB VRAM.
- **Q5_K_M** for daily coding help on 12 GB VRAM.
- **Q8_0** when quality matters more than speed.
- **FP16** only if you have plenty of VRAM and want full fidelity.

## Estimate VRAM

Rough formula for a Q4 model:

\`\`\`
VRAM ≈ (params in billions × 1.2) + 1 GB overhead
\`\`\`

So a 7B Q4 model needs about 9–10 GB total during generation.

## Find quantized models

Search Hugging Face for 

\`\`\`
GGUF Q4_K_M
\`\`\`

Download the ".gguf" file and load it directly in LM Studio.`,
  },

  {
    id: 'lmstudio-advanced-workflow',
    title: 'Build a Local Agent Workflow',
    description: 'Chain reasoning + tool calls into a repeatable local pipeline',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'advanced',
    content: `## The agent loop

A minimal agent repeats this cycle:

1. Plan
2. Call a tool
3. Observe the result
4. Answer or plan again

## Build it in Python

\`\`\`python
import requests, json

def ask_llm(messages, tools=None):
    payload = {"model": "local-model", "messages": messages}
    if tools:
        payload["tools"] = tools
    r = requests.post("http://localhost:1234/v1/chat/completions", json=payload)
    return r.json()["choices"][0]["message"]

def read_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        return "File not found"

tools = [{
    "type": "function",
    "function": {
        "name": "read_file",
        "parameters": {
            "type": "object",
            "properties": {"path": {"type": "string"}},
            "required": ["path"]
        }
    }
}]

messages = [{"role": "user", "content": "What does main.py do?"}]
msg = ask_llm(messages, tools)

if msg.get("tool_calls"):
    args = json.loads(msg["tool_calls"][0]["function"]["arguments"])
    result = read_file(args["path"])
    messages.append(msg)
    messages.append({"role": "tool", "content": result, "tool_call_id": msg["tool_calls"][0]["id"]})
    final = ask_llm(messages)
    print(final["content"])
\`\`\`

## When local agents win

- Private or air-gapped environments
- High-volume tasks where API costs add up
- Tight feedback loops with local files

## When cloud agents win

- Complex multi-step reasoning
- Reliable tool calling
- Tasks requiring the strongest models`,
  },

  {
    id: 'ollama-install',
    title: 'Install Ollama',
    description: 'Get Ollama running on macOS, Linux, or Windows',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## What is Ollama?

Ollama is a command-line tool for running local LLMs. It handles downloads, model files, and an OpenAI-compatible API in one package. It is the best choice for terminal-first workflows and automation.

Official site: [ollama.com](https://ollama.com/)

## Install

### macOS and Linux

\`\`\`bash
curl -fsSL https://ollama.com/install.sh | sh
\`\`\`

### Windows

Download the installer from the official site: [ollama.com](https://ollama.com/).

## Verify

\`\`\`bash
ollama --version
\`\`\`

You should see a version number.

## Start the service

On macOS and Windows, Ollama starts automatically. On Linux:

\`\`\`bash
ollama serve
\`\`\`

## Pull a starter model

\`\`\`bash
ollama pull llama3.2
\`\`\`

This downloads the model weights. They are stored in:

\`\`\`
~/.ollama/models/
\`\`\`

## Run your first prompt

\`\`\`bash
ollama run llama3.2 "Write a bash script that backs up a directory"
\`\`\`

Ollama prints the response directly in your terminal.`,
  },

  {
    id: 'ollama-first-model',
    title: 'Pull and Run Your First Model',
    description: 'Use ollama run for quick terminal chat',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## Interactive chat

Run a model in chat mode:

\`\`\`bash
ollama run llama3.2
\`\`\`

Type prompts and press Enter. Type 

\`\`\`
/bye
\`\`\`

to exit.

## One-shot prompts

For single questions, pass the prompt as an argument:

\`\`\`bash
ollama run llama3.2 "Explain this regex: ^[a-z]+$"
\`\`\`

## List installed models

\`\`\`bash
ollama list
\`\`\`

## Remove a model

\`\`\`bash
ollama rm llama3.2
\`\`\`

## Try different sizes

Ollama supports tags for model variants:

\`\`\`bash
ollama pull llama3.2:1b   # tiny, fast
ollama pull llama3.2      # default 3B
ollama pull llama3.1:8b   # larger, smarter
\`\`\`

Pick the smallest model that solves your task.`,
  },

  {
    id: 'ollama-modelfile',
    title: 'Customize Models with Modelfiles',
    description: 'Build reusable model configs with system prompts and parameters',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## What is a Modelfile?

A Modelfile is Ollama's recipe for a model. It sets the base model, system prompt, temperature, and other parameters. Create a custom model once, reuse it everywhere.

## Create a coding assistant

Save this as 

\`\`\`
Modelfile
\`\`\`

\`\`\`dockerfile
FROM llama3.2

SYSTEM """You are a terse Python expert.
Always include type hints.
Prefer standard library over dependencies."""

PARAMETER temperature 0.2
PARAMETER num_ctx 4096
\`\`\`

## Build and run

\`\`\`bash
ollama create mycoder -f ./Modelfile
ollama run mycoder
\`\`\`

## Use cases

- **Coding persona** with strict style rules
- **Review bot** that only finds bugs
- **Formatter** that rewrites code to match conventions
- **Spec writer** that turns bullet points into tickets

## Iterate quickly

Edit the Modelfile, rebuild, and test:

\`\`\`bash
ollama create mycoder -f ./Modelfile
ollama run mycoder "Refactor this function to use list comprehensions"
\`\`\`

Keep versioned Modelfiles in your repo to share personas with your team.`,
  },

  {
    id: 'ollama-api-integration',
    title: 'Call Ollama from Code',
    description: 'Use the REST API from Python, Node.js, or curl',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## Start the API server

\`\`\`bash
ollama serve
\`\`\`

The API is available at:

\`\`\`
http://localhost:11434
\`\`\`

## Generate with curl

\`\`\`bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Write a Python function that reverses a string",
  "stream": false
}'
\`\`\`

## Generate with Python

\`\`\`python
import requests

r = requests.post("http://localhost:11434/api/generate", json={
    "model": "llama3.2",
    "prompt": "Write a Python function that reverses a string",
    "stream": False
})
print(r.json()["response"])
\`\`\`

## Streaming responses

Set 

\`\`\`
"stream": true
\`\`\`

and iterate over response chunks for real-time output.

## Chat endpoint

For multi-turn conversations, use the chat API:

\`\`\`bash
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": false
}'
\`\`\`

## Connect your IDE

Both Claude Code and Cursor accept a custom OpenAI-compatible URL. Point them to:

\`\`\`
http://localhost:11434/v1
\`\`\`
  `,
  },

  {
    id: 'ollama-embeddings',
    title: 'Generate Local Embeddings',
    description: 'Run embedding models for RAG without sending data to the cloud',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## What are embeddings?

Embeddings turn text into lists of numbers. Similar text gets similar numbers. They power search, recommendations, and retrieval-augmented generation (RAG).

## Pull an embedding model

\`\`\`bash
ollama pull nomic-embed-text
\`\`\`

## Generate an embedding

\`\`\`bash
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "How do I reset my password?"
}'
\`\`\`

## Build a tiny RAG pipeline in Python

\`\`\`python
import requests, numpy as np

def embed(text):
    r = requests.post("http://localhost:11434/api/embeddings", json={
        "model": "nomic-embed-text",
        "prompt": text
    })
    return np.array(r.json()["embedding"])

def similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

docs = [
    "Reset your password on the settings page.",
    "Our API supports OAuth2 authentication.",
    "Deploy with docker compose up."
]

vectors = [embed(d) for d in docs]
query = embed("How do I change my password?")
scores = [similarity(query, v) for v in vectors]
best = docs[np.argmax(scores)]
print(best)
\`\`\`

## Why local embeddings matter

- Private documents stay on your machine
- No per-token embedding charges
- Fast for small-to-medium document sets

For larger collections, move vectors to a local vector database like Chroma or pgvector.`,
  },

  {
    id: 'ollama-production-tips',
    title: 'Run Ollama Reliably',
    description: 'Keep models loaded, monitor resources, and deploy on a server',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'advanced',
    content: `## Keep models in memory

By default, Ollama unloads a model after a few minutes of inactivity. Keep it loaded with:

\`\`\`bash
export OLLAMA_KEEP_ALIVE=24h
\`\`\`

Or set it per request:

\`\`\`bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hello",
  "keep_alive": "24h"
}'
\`\`\`

## Set GPU layers and context

In a Modelfile or API call:

\`\`\`dockerfile
PARAMETER num_ctx 8192
PARAMETER num_gpu 35
\`\`\`

Match num_gpu to your GPU's layer capacity.

## Run as a service

### macOS (launchd)

Ollama already runs as a launch agent. To customize:

\`\`\`
~/Library/LaunchAgents/com.ollama.olama.plist
\`\`\`

### Linux (systemd)

Create 

\`\`\`
/etc/systemd/system/ollama.service
\`\`\`

\`\`\`ini
[Unit]
Description=Ollama
After=network.target

[Service]
ExecStart=/usr/local/bin/ollama serve
Environment="OLLAMA_KEEP_ALIVE=24h"
Restart=always

[Install]
WantedBy=default.target
\`\`\`

Then:

\`\`\`bash
sudo systemctl enable --now ollama
\`\`\`

## Docker Compose for a small team

\`\`\`yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama:
\`\`\`

## Monitor

\`\`\`bash
ollama ps
nvidia-smi
\`\`\`

Watch memory usage and unload models if you run multiple services on the same GPU.`,
  },

  {
    id: 'imagegen-landscape',
    title: 'Local Image Generation Landscape',
    description: 'Understand models, UIs, and hardware requirements',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## What is diffusion?

Diffusion models learn to turn random noise into images matching a text description. You provide a prompt, the model denoises step by step, and an image appears.

## Popular local tools

| Tool | Best for | Complexity |
|------|----------|------------|
| **ComfyUI** | Control, workflows, automation | High |
| **Automatic1111 / Forge** | Quick prototyping | Medium |
| **Fooocus** | Simple, good defaults | Low |
| **InvokeAI** | Clean UX, artists | Medium |

## Model families

- **SD 1.5** — old, fast, lots of community models
- **SDXL** — better quality, needs more VRAM
- **Flux** — current open-source leader, very capable
- **Stable Diffusion 3** — strong text rendering

## Hardware primer

| Task | Minimum VRAM | Comfortable VRAM |
|------|--------------|------------------|
| SD 1.5 | 4 GB | 6 GB |
| SDXL | 6 GB | 8 GB |
| Flux | 12 GB | 16+ GB |

## Pick your first stack

- Want maximum control? Start with **ComfyUI**.
- Want one-click good results? Start with **Fooocus**.
- Want to script generation? Use **ComfyUI in server mode**.`,
  },

  {
    id: 'imagegen-comfyui-first',
    title: 'First Image with ComfyUI',
    description: 'Install ComfyUI and generate your first image',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## Install ComfyUI

ComfyUI is a node-based interface for Stable Diffusion and Flux. Official site: [comfy.org](https://www.comfy.org/)

### Option 1: Portable (Windows)

Download the portable release from [comfyanonymous.github.io](https://comfyanonymous.github.io/ComfyUI_examples/). Extract and run 

\`\`\`
run_nvidia_gpu.bat
\`\`\`

### Option 2: Git clone

\`\`\`bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
python main.py
\`\`\`

## Download a base model

Place a checkpoint in:

\`\`\`
ComfyUI/models/checkpoints/
\`\`\`

Good starters:

- **SDXL Base** for general use
- **Flux.1 [dev]** for high quality

## Default workflow

When ComfyUI opens, you see a node graph:

\`\`\`
Load Checkpoint → CLIP Text Encode → KSampler → VAE Decode → Save Image
\`\`\`

1. Select your checkpoint in **Load Checkpoint**
2. Enter a positive prompt in the top **CLIP Text Encode**
3. Enter a negative prompt in the bottom one
4. Click **Queue Prompt**

## First prompt

\`\`\`
a small robot reading a book in a sunny library, digital art
\`\`\`

## Common first-run errors

- **CUDA out of memory** — reduce image size or use a smaller model
- **Model not found** — check the checkpoint path
- **Black output** — ensure the VAE is loaded correctly`,
  },

  {
    id: 'imagegen-prompting',
    title: 'Prompting for Photoreal and Art',
    description: 'Write prompts and negative prompts that actually work',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'beginner',
    content: `## Anatomy of a good prompt

A strong prompt has layers:

\`\`\`
Subject → Style → Lighting → Camera → Quality
\`\`\`

Example:

\`\`\`
a red fox sitting in a meadow at golden hour, oil painting style, warm side lighting, 85mm lens, highly detailed, 8k
\`\`\`

## Negative prompts

Tell the model what to avoid:

\`\`\`
blurry, low quality, deformed hands, extra fingers, watermark, text
\`\`\`

## Before and after

**Weak:**

\`\`\`
a cat
\`\`\`

**Strong:**

\`\`\`
a fluffy orange tabby cat sitting on a windowsill, soft morning light, shallow depth of field, photorealistic, 4k
\`\`\`

## Prompting tips

- Start simple, add one modifier at a time
- Place the most important words near the start
- Use commas to separate concepts
- Mention quality tags last: 

\`\`\`
masterpiece, best quality, highly detailed
\`\`\`

## Save presets

Store working prompts in a text file. Reuse them as starting points and iterate faster.`,
  },

  {
    id: 'imagegen-flux',
    title: 'Run Flux Locally',
    description: 'Download and run Flux.1 [dev/schnell] on consumer hardware',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## What is Flux?

Flux.1 is an open-source image generation model from Black Forest Labs. It produces high-quality images with excellent prompt following and text rendering.

Official site: [blackforestlabs.ai](https://blackforestlabs.ai/)

## Variants

| Variant | License | Quality | Speed |
|---------|---------|---------|-------|
| Flux.1 [dev] | Non-commercial | Highest | Slower |
| Flux.1 [schnell] | Apache 2.0 | Very high | Fastest |

## Minimum requirements

- **FP16**: 16+ GB VRAM
- **NF4/GGUF quantized**: 8–12 GB VRAM
- **CPU offload**: works on less VRAM, much slower

## Download Flux for ComfyUI

You need three files:

1. **UNET** → 

\`\`\`
ComfyUI/models/unet/flux1-dev.safetensors
\`\`\`

2. **CLIP** → 

\`\`\`
ComfyUI/models/clip/flux_clip.safetensors
\`\`\`

3. **VAE** → 

\`\`\`
ComfyUI/models/vae/flux_vae.safetensors
\`\`\`

Search Hugging Face for ComfyUI-compatible Flux checkpoints.

## Quantized versions

If you lack VRAM, download NF4 or GGUF versions of the UNET. Load them in ComfyUI with the corresponding loader nodes.

## Prompt

Flux understands natural language well:

\`\`\`
a futuristic Tokyo street at night, neon signs, wet pavement reflecting lights, cinematic
\`\`\`

## Tip

Schnell needs only 4 sampling steps. Dev needs 20–28. Adjust the KSampler accordingly.`,
  },

  {
    id: 'imagegen-workflows',
    title: 'Build Reusable ComfyUI Workflows',
    description: 'Save, parameterize, and automate image pipelines',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'intermediate',
    content: `## Save a workflow

In ComfyUI, click **Save** to export the current node graph as JSON. Load it later with **Load**.

## Parameterize prompts

Replace hard-coded prompt text with widgets or exposed inputs. Save the workflow as a template and change only the prompt each time.

## Batch size and seeds

- **Batch size** generates multiple images in one run
- **Seed** controls randomness; reuse a seed to refine an image
- **ControlNet** adds pose, depth, or edge guidance

## Upscale workflow

Chain an upscaler after the VAE Decode:

\`\`\`
KSampler → VAE Decode → Upscale Model → Save Image
\`\`\`

Good upscalers include 4x-UltraSharp and ESRGAN.

## Automate from a script

Enable server mode:

\`\`\`bash
python main.py --listen
\`\`\`

Then queue workflows via the API. See the "Generate Images from Code" tutorial for a full example.`,
  },

  {
    id: 'imagegen-api-batch',
    title: 'Generate Images from Code',
    description: 'Batch-generate images via API and integrate into apps',
    category: 'local-ai',
    tools: ['local'],
    difficulty: 'advanced',
    content: `## Enable ComfyUI server mode

\`\`\`bash
python main.py --listen --port 8188
\`\`\`

## Queue a prompt from Python

\`\`\`python
import requests, json

with open("workflow.json") as f:
    prompt = json.load(f)

# Update the positive prompt node (node IDs depend on your workflow)
prompt["3"]["inputs"]["text"] = "a cyberpunk cat wearing goggles"

r = requests.post("http://127.0.0.1:8188/prompt", json={"prompt": prompt})
print(r.json())
\`\`\`

## Wait for completion

ComfyUI is asynchronous. Poll the history endpoint:

\`\`\`python
import time

prompt_id = r.json()["prompt_id"]
while True:
    history = requests.get(f"http://127.0.0.1:8188/history/{prompt_id}").json()
    if history:
        break
    time.sleep(1)
\`\`\`

## Batch generation

Loop over a list of prompts and queue them:

\`\`\`python
prompts = ["a red car", "a blue car", "a green car"]
for p in prompts:
    prompt["3"]["inputs"]["text"] = p
    requests.post("http://127.0.0.1:8188/prompt", json={"prompt": prompt})
\`\`\`

## Use cases

- Generate app assets and icons
- Create synthetic training datasets
- Produce thumbnails and marketing images
- Build internal image-generation tools

## Tip

Save your ComfyUI workflow JSON with the API format option so node IDs are stable.`,
  },

];
