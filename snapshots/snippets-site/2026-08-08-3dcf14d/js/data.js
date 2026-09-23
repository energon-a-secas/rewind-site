// ── Snippet catalogue ────────────────────────────────────────
// Each snippet lives in js/snippets/<category>.js and has the shape:
//   { id, title, description, command, platform, tags[], category }
// This module concatenates them in CATEGORIES order — the order the
// category rail and the default grid use.

import { shell } from './snippets/shell.js';
import { macos } from './snippets/macos.js';
import { windows } from './snippets/windows.js';
import { git } from './snippets/git.js';
import { data } from './snippets/data.js';
import { text } from './snippets/text.js';
import { media } from './snippets/media.js';
import { config } from './snippets/config.js';
import { devops } from './snippets/devops.js';
import { docker } from './snippets/docker.js';
import { k8s } from './snippets/k8s.js';
import { claude } from './snippets/claude.js';
import { ref } from './snippets/ref.js';

export const CATEGORIES = [
  'shell', 'macos', 'windows', 'git', 'data', 'text', 'media',
  'config', 'devops', 'docker', 'k8s', 'claude', 'ref',
];

export const CATEGORY_LABELS = {
  shell: 'Shell / Bash',
  macos: 'macOS',
  windows: 'Windows',
  git: 'Git',
  data: 'Data Extraction',
  text: 'Text Processing',
  media: 'Media & Files',
  config: 'Config / Setup',
  devops: 'DevOps',
  docker: 'Docker',
  k8s: 'Kubernetes',
  claude: 'Claude Code',
  ref: 'Reference',
};

const BY_CATEGORY = {
  shell, macos, windows, git, data, text, media,
  config, devops, docker, k8s, claude, ref,
};

export const snippets = CATEGORIES.flatMap(c => BY_CATEGORY[c]);
