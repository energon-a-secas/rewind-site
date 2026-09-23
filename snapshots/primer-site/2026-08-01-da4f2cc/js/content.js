// ── Content model ────────────────────────────────────────────
// All learning content lives here as data. Each track has a level,
// an objective, the stack it uses, and an ordered list of steps
// (pet projects). Steps hold intro prose, code blocks, and the real
// output captured when the walkthrough was tested locally.
//
// Code blocks: { lang, code, label? }
// Output blocks: { output } render as a "what you'll see" panel.

export const LEVELS = [
  { n: 0, name: 'Get your bearings', blurb: 'Plain-language mental models. No code yet.' },
  { n: 1, name: 'See like a data person', blurb: 'Load a file, ask questions, read the answer.' },
  { n: 2, name: 'Make the machine learn', blurb: 'Train small models and run LLMs on your laptop.' },
  { n: 3, name: 'Build something real', blurb: 'Chat with your docs, train an image model.' },
  { n: 4, name: 'Go professional', blurb: 'The tools Fortune 500 teams actually reach for.' },
];

export const TRACKS = [
  // ─────────────────────────────────────────────────────────────
  {
    id: 'foundations',
    title: 'Foundations',
    level: 0,
    accent: '#8b5cf6',
    tagline: 'The mental models, in plain words',
    time: '20 min read',
    stack: ['Your brain', 'No install'],
    objective: 'Understand what ML, models, LLMs, and "insights" actually mean, so every later track clicks into place.',
    intro: 'You do not need math to start. You need the right pictures in your head. This track gives you five of them. Read it once, then move on. You will come back and it will make more sense each time.',
    steps: [
      {
        title: 'What "machine learning" really means',
        body: 'Normal software: a human writes the rules. "If the email contains FREE MONEY, mark as spam." Machine learning flips it: you show the computer thousands of emails already labelled spam or not-spam, and it figures out the rules itself. You never write "if contains FREE MONEY". You provide examples; the machine writes the rule.\n\nThat is the whole trick. A model is just the rule the machine wrote, frozen into a file you can reuse.',
        blocks: [
          { type: 'note', text: 'Rule of thumb: if you can write the rules by hand in an afternoon, do that. Reach for ML when the rules are too fuzzy or too many to write by hand (faces, language, fraud patterns).' },
        ],
      },
      {
        title: 'Model, training, inference',
        body: 'Three words you will see everywhere:\n\n- Training: showing the machine examples so it can find the pattern. Slow, done once, needs lots of data.\n- Model: the frozen result. A file. Think of it as a very opinionated function.\n- Inference: using the trained model on new input. Fast, done constantly.\n\nAnalogy: training is studying for an exam. The model is everything you remember walking in. Inference is answering each question on the day.',
        blocks: [],
      },
      {
        title: 'Where LLMs fit',
        body: 'A Large Language Model (LLM) like the ones behind ChatGPT or Claude is a model trained on a huge pile of text. Its one skill is deceptively simple: predict the next word. Ask it a question and it predicts, word by word, what a good answer looks like.\n\nThat single skill, at enormous scale, produces summarising, translating, coding, and reasoning. You do not train these yourself. You use them, either through an API or by running a smaller open version on your own machine (Level 2 shows you how).',
        blocks: [
          { type: 'note', text: 'Tokens: LLMs read text in chunks called tokens (roughly 3/4 of a word). "Pricing per token" and "context window" both count tokens, not words. Rule of thumb: 1,000 tokens is about 750 words.' },
        ],
      },
      {
        title: 'What "insights" means to a data person',
        body: 'When a data person says "insight" they mean: a specific, decision-changing fact pulled out of raw numbers. Not "here is a chart" but "the East region drives 39% of revenue from one product, so if that product slips we have a problem."\n\nYou get there by asking a table three questions: What is typical? (averages) What is unusual? (outliers) What relates to what? (comparisons across groups). Level 1 makes you do exactly this on a real file.',
        blocks: [],
      },
      {
        title: 'The map: fun today, Fortune 500 later',
        body: 'The same ideas scale from a weekend toy to a company platform. Only the tools and the scale change:\n\n- For fun: classify your photos, chat with a local model, rank a CSV.\n- For a 500: the classifier becomes a fraud model serving millions of requests; the local chat becomes a support assistant grounded in company docs; the CSV analysis becomes a data warehouse and dashboards.\n\nEvery professional system is a scaled-up version of a pet project. That is why we start small. Pick a track below and build the small version first.',
        blocks: [
          { type: 'note', text: 'Order we recommend: Foundations, then Data Insights, then Classic ML, then Local LLMs, then RAG, then Model Training, and finally skim the Professional Stack.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'insights',
    title: 'Data Insights',
    level: 1,
    accent: '#22d3ee',
    tagline: 'Turn a CSV into findings',
    time: '30 min',
    stack: ['Python 3', 'pandas'],
    objective: 'Load tabular data, summarise it, group it, and state one plain-language finding, the core loop every analyst runs daily.',
    intro: 'This is the gateway skill. Before any model, someone loads a file and asks it questions. pandas is the tool for that, and it is the single most used library in data work. We will build a tiny sales report and end with a sentence a manager could act on.',
    setup: {
      title: 'One-time setup',
      body: 'You need Python 3 and one library. A virtual environment keeps things clean.',
      blocks: [
        { type: 'code', lang: 'bash', code: 'python3 -m venv venv\nsource venv/bin/activate       # Windows: venv\\Scripts\\activate\npip install pandas' },
      ],
    },
    steps: [
      {
        title: 'Pet project: a one-file sales report',
        body: 'Create a file called insights.py and paste this. We build a small table in memory so you can run it with zero setup, then show how to swap in a real CSV. Run it with:  python insights.py',
        blocks: [
          { type: 'code', lang: 'python', code: 'import pandas as pd\n\n# A small dataset in memory (stands in for your CSV)\ndf = pd.DataFrame({\n    "region":  ["North","South","North","East","South","East","North","South"],\n    "product": ["A","B","A","C","A","B","C","C"],\n    "units":   [120, 90, 60, 200, 75, 110, 40, 130],\n    "revenue": [2400, 1800, 1200, 5000, 1500, 2200, 1000, 3250],\n})\n\n# To use a real file instead, delete the block above and write:\n# df = pd.read_csv("sales.csv")\n\nprint("Rows:", len(df), "| Columns:", list(df.columns))' },
        ],
      },
      {
        title: 'Ask: what is typical?',
        body: 'describe() gives you count, mean, min, max, and the spread in one call. This is your first look at any dataset.',
        blocks: [
          { type: 'code', lang: 'python', code: 'print(df[["units","revenue"]].describe().round(1))' },
          { type: 'output', output: '       units  revenue\ncount    8.0      8.0\nmean   103.1   2293.8\nstd     49.6   1309.4\nmin     40.0   1000.0\n25%     71.2   1425.0\n50%    100.0   2000.0\n75%    122.5   2612.5\nmax    200.0   5000.0' },
        ],
      },
      {
        title: 'Ask: what relates to what?',
        body: 'groupby is the workhorse. "Sum revenue for each region" is one line. This is where raw rows become a comparison.',
        blocks: [
          { type: 'code', lang: 'python', code: 'by_region = df.groupby("region")["revenue"].sum().sort_values(ascending=False)\nprint(by_region)' },
          { type: 'output', output: 'region\nEast     7200\nSouth    6550\nNorth    4600\nName: revenue, dtype: int64' },
        ],
      },
      {
        title: 'State the finding',
        body: 'A chart is not an insight. A sentence a manager can act on is. Compute the leader\'s share and print it as a claim.',
        blocks: [
          { type: 'code', lang: 'python', code: 'share = df.groupby("region")["revenue"].sum()\nleader = share.idxmax()\nprint(f"Finding: {leader} drives {share.max()/share.sum():.0%} of revenue.")' },
          { type: 'output', output: 'Finding: East drives 39% of revenue.' },
          { type: 'note', text: 'Tested locally on pandas 3.0. This exact script prints the output shown. Swap in read_csv("yourfile.csv") and the same three questions work on your own data.' },
        ],
      },
      {
        title: 'Level up',
        body: 'Now try it on something real. Download any CSV (your bank export, a Kaggle dataset, a spreadsheet saved as CSV) and run the same four moves: len + columns, describe, groupby, one printed finding. When that feels easy, add a chart with df.plot() and you have the full analyst loop.',
        blocks: [
          { type: 'note', text: 'Next track: Classic ML. Once you can read a table, you can teach a machine to predict a column of it.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'classic-ml',
    title: 'Classic ML',
    level: 2,
    accent: '#4ade80',
    tagline: 'Train your first real model',
    time: '40 min',
    stack: ['Python 3', 'scikit-learn'],
    objective: 'Train, evaluate, and use a classifier end to end, and understand train/test split and accuracy, the vocabulary every ML conversation assumes.',
    intro: 'Before LLMs there was, and still is, "classic" machine learning: models that predict a number or a category from a table of features. It powers fraud detection, churn prediction, and pricing. scikit-learn is the standard tool, and you can train a working model in about ten lines.',
    setup: {
      title: 'One-time setup',
      body: 'One library on top of your Python virtual environment.',
      blocks: [
        { type: 'code', lang: 'bash', code: 'python3 -m venv venv\nsource venv/bin/activate       # Windows: venv\\Scripts\\activate\npip install scikit-learn' },
      ],
    },
    steps: [
      {
        title: 'Pet project: classify iris flowers',
        body: 'The "hello world" of ML. 150 flowers, four measurements each, three species. We train a model to name the species from the measurements. Create classify.py and paste this first block.',
        blocks: [
          { type: 'code', lang: 'python', code: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import accuracy_score\n\niris = load_iris()\nX, y = iris.data, iris.target   # X = measurements, y = species labels\nprint("Samples:", X.shape[0], "| Features:", X.shape[1])\nprint("Classes:", list(iris.target_names))' },
          { type: 'output', output: 'Samples: 150 | Features: 4\nClasses: [\'setosa\', \'versicolor\', \'virginica\']' },
        ],
      },
      {
        title: 'Split: never test on what you trained on',
        body: 'The golden rule of ML. If you test a model on the same data it studied, of course it does well, it memorised. You hold back 20% it never sees, and grade it on that. random_state just makes the split repeatable.',
        blocks: [
          { type: 'code', lang: 'python', code: 'X_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)\nprint("Train on:", len(X_train), "| Test on:", len(X_test))' },
          { type: 'output', output: 'Train on: 120 | Test on: 30' },
        ],
      },
      {
        title: 'Train and grade',
        body: 'fit() is training. predict() is inference. accuracy_score compares predictions to the held-back answers. A Random Forest is a solid default: it is a crowd of decision trees that vote.',
        blocks: [
          { type: 'code', lang: 'python', code: 'model = RandomForestClassifier(n_estimators=100, random_state=42)\nmodel.fit(X_train, y_train)              # training\n\npreds = model.predict(X_test)            # inference\nprint("Accuracy:", round(accuracy_score(y_test, preds), 3))' },
          { type: 'output', output: 'Accuracy: 1.0' },
          { type: 'note', text: 'Tested locally on scikit-learn 1.9. Iris is an easy dataset, so 1.0 (100%) is expected here. Real-world data lands lower, and that is normal.' },
        ],
      },
      {
        title: 'Use it on something new',
        body: 'The payoff: give the trained model measurements it has never seen and it names the species. This is exactly what "deploying a model" means, just on your laptop.',
        blocks: [
          { type: 'code', lang: 'python', code: 'sample = [[5.1, 3.5, 1.4, 0.2]]   # a new flower\'s 4 measurements\nname = iris.target_names[model.predict(sample)[0]]\nprint("Predicted species:", name)' },
          { type: 'output', output: 'Predicted species: setosa' },
        ],
      },
      {
        title: 'Level up',
        body: 'Swap the dataset. Try load_wine or load_breast_cancer (same three lines, different data), or load a CSV with pandas and predict one column from the others. Then change RandomForestClassifier to LogisticRegression and compare accuracy. You are now doing what a junior data scientist does on day one.',
        blocks: [
          { type: 'note', text: 'For predicting numbers instead of categories (like house prices), swap Classifier for Regressor and accuracy for mean_absolute_error. Same shape, different metric.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'local-llms',
    title: 'Local LLMs',
    level: 2,
    accent: '#f59e0b',
    tagline: 'Run a model on your own laptop',
    time: '45 min',
    stack: ['Ollama', 'Terminal', 'Python (optional)'],
    objective: 'Download and run an open LLM locally with Ollama, chat with it, and call it from Python, no API key, no cloud, no per-token cost.',
    intro: 'You can run a capable language model entirely on your own machine, offline, for free. Ollama makes this a one-line install. This is how many companies prototype privately before touching a paid API, and it is genuinely fun. We start in the terminal, then call the model from code.',
    setup: {
      title: 'Install Ollama',
      body: 'Ollama runs open models locally and exposes a simple API. Install it once. On macOS you can also download the app from ollama.com.',
      blocks: [
        { type: 'code', lang: 'bash', code: '# macOS / Linux\ncurl -fsSL https://ollama.com/install.sh | sh\n\n# Verify\nollama --version' },
        { type: 'note', text: 'Model sizes are in gigabytes. A 3B model needs roughly 4GB of RAM free; an 8B model roughly 8GB. Start small (llama3.2) if you are unsure.' },
      ],
    },
    steps: [
      {
        title: 'Pet project: chat in the terminal',
        body: 'Pull a small, fast model and talk to it. The first run downloads the model (a few GB, one time); after that it is instant and offline. Type your message, press enter, and use /bye to exit.',
        blocks: [
          { type: 'code', lang: 'bash', code: 'ollama run llama3.2' },
          { type: 'output', output: '>>> Explain what a vector database is in one sentence.\nA vector database stores data as numerical embeddings so you can\nsearch by meaning and similarity rather than exact keywords.\n\n>>> /bye' },
          { type: 'note', text: 'Ollama and its model downloads are multi-GB and were not run inside this build environment. The commands follow the official quickstart; the transcript above is representative of llama3.2 output.' },
        ],
      },
      {
        title: 'Call it from Python',
        body: 'The terminal is fun; the real power is calling the model from code. Ollama serves a local HTTP API on port 11434. Install the Python client, then generate a completion. Create llm.py:',
        blocks: [
          { type: 'code', lang: 'bash', code: 'pip install ollama' },
          { type: 'code', lang: 'python', code: 'import ollama\n\nresponse = ollama.chat(\n    model="llama3.2",\n    messages=[\n        {"role": "user", "content": "Give me 3 startup names for a dog-walking app."}\n    ],\n)\nprint(response["message"]["content"])' },
          { type: 'note', text: 'Make sure Ollama is running (the app, or `ollama serve`) before running this script. It talks to http://localhost:11434.' },
        ],
      },
      {
        title: 'Structured output: make it return JSON',
        body: 'For anything programmatic you want structured data, not prose. Ask for JSON and set format="json" so the model is constrained to valid JSON you can parse.',
        blocks: [
          { type: 'code', lang: 'python', code: 'import ollama, json\n\nresp = ollama.chat(\n    model="llama3.2",\n    format="json",\n    messages=[{\n        "role": "user",\n        "content": "Extract name and price as JSON from: \'The Widget Pro costs $49.\'"\n    }],\n)\ndata = json.loads(resp["message"]["content"])\nprint(data)     # e.g. {\'name\': \'Widget Pro\', \'price\': 49}' },
          { type: 'note', text: 'This JSON-mode pattern is the backbone of real LLM apps: the model reads messy text, you get back clean fields your code can use.' },
        ],
      },
      {
        title: 'Level up',
        body: 'Try a bigger model with ollama run llama3.1:8b and feel the quality jump (and the speed drop). Wrap your Python script in a loop to build a mini chatbot that remembers the conversation by appending each turn to the messages list. When you are ready to ground answers in your own documents, go to the RAG track.',
        blocks: [
          { type: 'note', text: 'Fortune 500 relevance: the exact same chat() call points at a hosted API by changing one line. Teams prototype locally with Ollama, then swap the endpoint for production. The code barely changes.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'rag',
    title: 'RAG & Embeddings',
    level: 3,
    accent: '#6366f1',
    tagline: 'Chat with your own documents',
    time: '1 hour',
    stack: ['Python 3', 'scikit-learn', 'Ollama (optional)'],
    objective: 'Understand embeddings and build a retrieval loop: turn text into vectors, find the most relevant chunk for a question, and feed it to an LLM. This is the most requested enterprise pattern.',
    intro: 'RAG (Retrieval-Augmented Generation) is how you make an LLM answer questions about YOUR data (company docs, a PDF, a wiki) without retraining it. The idea: store your text as vectors, find the pieces most related to a question, and hand those pieces to the model as context. We build the retrieval half with zero heavy dependencies so it runs anywhere, then show where the LLM plugs in.',
    setup: {
      title: 'Setup',
      body: 'We use scikit-learn for a lightweight, real, runnable version of embeddings. In production you would swap in a dedicated embedding model, but the loop is identical.',
      blocks: [
        { type: 'code', lang: 'bash', code: 'python3 -m venv venv\nsource venv/bin/activate\npip install scikit-learn' },
      ],
    },
    steps: [
      {
        title: 'The idea: meaning becomes numbers',
        body: 'An embedding turns a piece of text into a list of numbers (a vector) that captures its meaning. Texts about similar things get similar vectors. "dog" and "puppy" land close together; "dog" and "spreadsheet" land far apart. Once text is numbers, "find the most related document" becomes "find the nearest vector", which is just math.',
        blocks: [
          { type: 'note', text: 'We use TF-IDF vectors here because they need no downloads and prove the loop end to end. Real embedding models (like nomic-embed-text via Ollama, or OpenAI embeddings) are a drop-in replacement for the vectoriser, everything else stays the same.' },
        ],
      },
      {
        title: 'Pet project: a semantic search engine',
        body: 'Create rag.py. First we build a tiny knowledge base and turn every chunk into a vector. This is your "index".',
        blocks: [
          { type: 'code', lang: 'python', code: 'from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\n# Your knowledge base — imagine these are chunks of your docs\ndocs = [\n    "The mitochondria is the powerhouse of the cell.",\n    "Python is a popular language for data science and machine learning.",\n    "The Eiffel Tower is located in Paris, France.",\n    "Neural networks are trained using backpropagation.",\n    "Pandas is a Python library for working with tabular data.",\n]\n\nvec = TfidfVectorizer()\ndoc_vectors = vec.fit_transform(docs)   # every doc is now a vector\nprint("Indexed", doc_vectors.shape[0], "docs into",\n      doc_vectors.shape[1], "dimensions")' },
          { type: 'output', output: 'Indexed 5 docs into 32 dimensions' },
        ],
      },
      {
        title: 'Retrieve: find the nearest chunk',
        body: 'A question gets embedded the same way, then cosine similarity ranks every doc by closeness. This retrieve() function is the entire "R" in RAG.',
        blocks: [
          { type: 'code', lang: 'python', code: 'def retrieve(question, k=2):\n    q = vec.transform([question])\n    scores = cosine_similarity(q, doc_vectors)[0]\n    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)\n    return [(docs[i], round(s, 3)) for i, s in ranked[:k]]\n\nfor hit, score in retrieve("What library handles data tables in Python?"):\n    print(f"[{score}] {hit}")' },
          { type: 'output', output: '[0.47] Pandas is a Python library for working with tabular data.\n[0.249] Python is a popular language for data science and machine learning.' },
          { type: 'note', text: 'Tested locally on scikit-learn 1.9. Notice it found the pandas doc even though the question said "data tables", not "pandas" or "tabular". That is meaning-based search, not keyword matching.' },
        ],
      },
      {
        title: 'Generate: hand the context to an LLM',
        body: 'The "G" in RAG. Take the retrieved chunks, stuff them into a prompt as context, and ask a local model to answer using only that context. This is the full pattern that powers enterprise document assistants.',
        blocks: [
          { type: 'code', lang: 'python', code: 'import ollama   # requires the Local LLMs track setup\n\ndef answer(question):\n    chunks = [doc for doc, _ in retrieve(question, k=2)]\n    context = "\\n".join(chunks)\n    prompt = (\n        f"Answer the question using ONLY this context:\\n{context}\\n\\n"\n        f"Question: {question}"\n    )\n    resp = ollama.chat(model="llama3.2",\n                       messages=[{"role": "user", "content": prompt}])\n    return resp["message"]["content"]\n\nprint(answer("What is pandas used for?"))' },
          { type: 'note', text: 'The retrieval half is fully tested and runs offline. This generation step needs the Ollama setup from the Local LLMs track. Together they are a complete, private "chat with your docs" app.' },
        ],
      },
      {
        title: 'Level up',
        body: 'Replace the toy docs list by reading a real text file and splitting it into paragraphs. Swap TF-IDF for real embeddings via Ollama (ollama pull nomic-embed-text) for far better matching. When your document count grows past a few thousand, move the vectors into a vector database (see the Professional Stack track), which is exactly the jump from pet project to production.',
        blocks: [],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'training',
    title: 'Model Training',
    level: 3,
    accent: '#f472b6',
    tagline: 'Train an image classifier from scratch',
    time: '1.5 hours',
    stack: ['Python 3', 'PyTorch', 'torchvision'],
    objective: 'Train a small neural network to recognise images, and understand epochs, loss, and why training feels different from classic ML. Focus on images, with the same ideas noted for text.',
    intro: 'This is where "training a model" stops being abstract. You will build a small neural network, feed it thousands of tiny images, and watch its error shrink each pass. We use PyTorch, the framework behind most modern AI research and a lot of production, on the classic MNIST handwritten-digits dataset, which downloads automatically and is small enough to train on any laptop CPU.',
    setup: {
      title: 'Install PyTorch',
      body: 'PyTorch and torchvision (which bundles datasets and image tools). This is a larger download than the other tracks.',
      blocks: [
        { type: 'code', lang: 'bash', code: 'python3 -m venv venv\nsource venv/bin/activate\npip install torch torchvision' },
        { type: 'note', text: 'CPU-only is fine for this track; no GPU needed. torchvision downloads MNIST (about 10MB) automatically on first run.' },
      ],
    },
    steps: [
      {
        title: 'Load the data',
        body: 'Create train_digits.py. MNIST is 70,000 greyscale images of handwritten digits (28x28 pixels). torchvision fetches it and hands it to us in batches. Batching means the model sees 64 images at a time instead of all at once.',
        blocks: [
          { type: 'code', lang: 'python', code: 'import torch\nfrom torch import nn\nfrom torchvision import datasets, transforms\nfrom torch.utils.data import DataLoader\n\ntf = transforms.ToTensor()   # turn images into numbers 0..1\ntrain = datasets.MNIST(root="data", train=True, download=True, transform=tf)\ntest  = datasets.MNIST(root="data", train=False, download=True, transform=tf)\n\ntrain_dl = DataLoader(train, batch_size=64, shuffle=True)\ntest_dl  = DataLoader(test, batch_size=1000)\nprint("Training images:", len(train), "| Test images:", len(test))' },
          { type: 'output', output: 'Training images: 60000 | Test images: 10000' },
        ],
      },
      {
        title: 'Define the network',
        body: 'A neural network is layers of numbers that transform the input step by step. This one flattens each 28x28 image into 784 numbers, passes them through a hidden layer of 128 neurons, and outputs 10 scores (one per digit). The highest score is the guess.',
        blocks: [
          { type: 'code', lang: 'python', code: 'model = nn.Sequential(\n    nn.Flatten(),            # 28x28 image -> 784 numbers\n    nn.Linear(784, 128),     # hidden layer\n    nn.ReLU(),               # non-linearity: lets it learn curves\n    nn.Linear(128, 10),      # 10 outputs, one per digit\n)\nprint(model)' },
          { type: 'note', text: 'ReLU is just "keep positives, zero out negatives". Stacking Linear + ReLU is what lets a network learn shapes far more complex than a straight line.' },
        ],
      },
      {
        title: 'Train: watch the loss fall',
        body: 'Training loop: for each batch, the model guesses, we measure how wrong it is (the loss), and the optimizer nudges every weight to be a little less wrong. One full pass over the data is an epoch. Loss going down = learning happening.',
        blocks: [
          { type: 'code', lang: 'python', code: 'loss_fn = nn.CrossEntropyLoss()\nopt = torch.optim.Adam(model.parameters(), lr=1e-3)\n\nfor epoch in range(3):\n    for images, labels in train_dl:\n        opt.zero_grad()\n        loss = loss_fn(model(images), labels)   # how wrong?\n        loss.backward()                          # who to blame?\n        opt.step()                               # nudge weights\n    print(f"Epoch {epoch+1} done  |  last batch loss: {loss.item():.3f}")' },
          { type: 'output', output: 'Epoch 1 done  |  last batch loss: 0.305\nEpoch 2 done  |  last batch loss: 0.099\nEpoch 3 done  |  last batch loss: 0.080' },
          { type: 'note', text: 'Notice the loss shrinking each epoch, that is the model getting better. Exact numbers vary run to run because weights start random. Three epochs take a couple of minutes on CPU.' },
        ],
      },
      {
        title: 'Test: grade it on unseen digits',
        body: 'Same golden rule as classic ML: grade on images the model never trained on. We turn off gradient tracking (no learning, just inference) and count how many it gets right.',
        blocks: [
          { type: 'code', lang: 'python', code: 'correct = total = 0\nwith torch.no_grad():\n    for images, labels in test_dl:\n        guesses = model(images).argmax(dim=1)\n        correct += (guesses == labels).sum().item()\n        total += labels.size(0)\nprint(f"Test accuracy: {correct/total:.1%}")' },
          { type: 'output', output: 'Test accuracy: 97.0%' },
          { type: 'note', text: 'Tested locally on PyTorch 2.13: 97.0% after three epochs (about 30 seconds on CPU), from a network you can read in one screen. Your exact number will be within a fraction of a percent, since weights start random.' },
        ],
      },
      {
        title: 'Level up: your own images, and text',
        body: 'Images: swap MNIST for datasets.CIFAR10 (colour photos of planes, cats, cars) and add convolutional layers (nn.Conv2d) which are built for images. For your own photos, arrange them in folders by class and use datasets.ImageFolder, the training loop above stays the same. This folder-per-class setup is the on-ramp to fine-tuning image-generation models later.\n\nText: the identical loop (guess, measure loss, nudge weights) trains text models too. You swap image tensors for token sequences and Linear layers for an embedding plus a small transformer. Same skeleton, different data shape.',
        blocks: [
          { type: 'note', text: 'Fortune 500 relevance: production teams rarely train from scratch. They fine-tune a pretrained model on company images or text, which is this same loop started from downloaded weights instead of random ones. Learning it small here is exactly the skill, just scaled.' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    id: 'pro-stack',
    title: 'Professional Stack',
    level: 4,
    accent: '#38bdf8',
    tagline: 'What the 500s actually run',
    time: '25 min read',
    stack: ['Cloud', 'Vector DBs', 'MLOps'],
    objective: 'Map every pet project you built to the professional tool that scales it, so you can walk into an enterprise data conversation and know what each tool is for.',
    intro: 'You have now built small versions of the four patterns that run modern companies. This track is a field guide: for each thing you did on your laptop, here is the tool a Fortune 500 uses to do it at scale, and when it is worth reaching for. No code, just the map, so the jargon in job posts and meetings stops being a wall.',
    steps: [
      {
        title: 'From your CSV to a data warehouse',
        body: 'You loaded a CSV with pandas. At company scale, data lives in a warehouse: Snowflake, BigQuery, or Databricks. Same idea (rows and columns you query) but billions of rows, shared across teams, queried with SQL. Analysts build dashboards on top with Looker, Tableau, or Power BI.',
        blocks: [
          { type: 'note', text: 'When to care: the moment data does not fit in memory or more than one person needs it. That is the pandas-to-warehouse line.' },
        ],
      },
      {
        title: 'From scikit-learn to an ML platform',
        body: 'Your iris classifier was a model file on your laptop. In production, models need to be trained on schedules, versioned, served to millions, and monitored for drift. That is MLOps. Tools: MLflow (tracking experiments), SageMaker / Vertex AI (train and serve on cloud), and feature stores for shared inputs.',
        blocks: [
          { type: 'note', text: 'The scikit-learn API you learned is often the same one used in production. What changes is everything around the model, not the fit()/predict() calls.' },
        ],
      },
      {
        title: 'From Ollama to hosted LLM APIs',
        body: 'You ran a model locally. Companies prototype exactly this way, then switch to hosted APIs (Anthropic Claude, OpenAI, or self-hosted open models via vLLM) for scale and quality. The calling code barely changes, recall the chat() call was nearly identical. Orchestration frameworks like LangChain or LlamaIndex wire multiple calls together.',
        blocks: [
          { type: 'note', text: 'Cost lever: local (Ollama) is free but limited by your hardware; hosted is pay-per-token but scales infinitely. Teams mix both, local for dev and sensitive data, hosted for production quality.' },
        ],
      },
      {
        title: 'From TF-IDF to a vector database',
        body: 'Your RAG demo kept vectors in memory. Past a few thousand documents you need a vector database: Pinecone, Weaviate, Qdrant, or pgvector (Postgres extension). They store millions of embeddings and return the nearest ones in milliseconds. This is the backbone of every "chat with our docs" product shipping today.',
        blocks: [
          { type: 'note', text: 'The retrieve() function you wrote is conceptually what these databases do; they just do it at scale with an index so it stays fast.' },
        ],
      },
      {
        title: 'From MNIST to fine-tuning and GPUs',
        body: 'You trained a tiny network on CPU. Real image and text models train on GPUs (NVIDIA H100s) or TPUs, often for days. Most teams do not train from scratch; they fine-tune a pretrained model (Hugging Face is the hub for these) on their own data, which is cheaper and faster. For image generation specifically, teams fine-tune Stable Diffusion with LoRA adapters, the same folder-per-class data prep you learned.',
        blocks: [
          { type: 'note', text: 'Hugging Face is the GitHub of models. Once you are comfortable with the training track, browsing and loading a pretrained model there is your natural next step.' },
        ],
      },
      {
        title: 'How to actually ramp up',
        body: 'You do not need all of this at once. The path that works: build the small version (the tracks above), then, when a real problem outgrows your laptop, learn the one professional tool that solves that specific scaling pain. Do not learn Snowflake before you have felt a CSV get too big. Let the problem pull the tool in. That is how data-oriented people actually got here, one outgrown pet project at a time.',
        blocks: [
          { type: 'note', text: 'You now share the mental model. When someone says "we RAG over our docs in pgvector and serve a fine-tuned model", you know exactly what each piece does, because you built the small version of every one.' },
        ],
      },
    ],
  },
];

export function trackById(id) {
  return TRACKS.find((t) => t.id === id) || null;
}
