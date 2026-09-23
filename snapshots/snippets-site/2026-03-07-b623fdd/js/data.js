// ── Snippet data ─────────────────────────────────────────────
// Static collection of curated snippets. Each snippet has:
//   id, title, description, command, platform, tags[], category

export const CATEGORIES = ['shell', 'macos', 'data', 'text', 'git', 'config', 'docker', 'k8s', 'devops', 'claude'];

export const CATEGORY_LABELS = {
  shell: 'Shell / Bash',
  macos: 'macOS',
  data: 'Data Extraction',
  text: 'Text Processing',
  git: 'Git',
  config: 'Config / Setup',
  docker: 'Docker',
  k8s: 'Kubernetes',
  devops: 'DevOps',
  claude: 'Claude Code',
};

export const snippets = [
  // ── Shell / Bash ────────────────────────────────────────────
  {
    id: 'find-duplicates',
    title: 'Find duplicate files by checksum',
    description: 'Scans a directory tree and groups files with identical MD5 hashes',
    command: `find . -type f -exec md5 -r {} + | sort | uniq -d -w32`,
    platform: 'macOS',
    tags: ['bash', 'files', 'duplicates', 'macos'],
    category: 'shell',
  },
  {
    id: 'bulk-rename',
    title: 'Bulk rename files with pattern',
    description: 'Renames all .txt files to .md in the current directory',
    command: `for f in *.txt; do mv "$f" "\${f%.txt}.md"; done`,
    platform: 'bash',
    tags: ['bash', 'files', 'rename', 'bulk'],
    category: 'shell',
  },
  {
    id: 'large-files',
    title: 'Find large files eating disk space',
    description: 'Lists the 20 largest files under the current directory, sorted by size',
    command: `find . -type f -exec du -h {} + | sort -rh | head -20`,
    platform: 'bash',
    tags: ['bash', 'files', 'disk', 'cleanup'],
    category: 'shell',
  },
  {
    id: 'kill-by-name',
    title: 'Kill processes by name pattern',
    description: 'Finds and kills all processes matching a name without grep noise',
    command: `pgrep -f "process_name" | xargs kill -9`,
    platform: 'bash',
    tags: ['bash', 'process', 'kill'],
    category: 'shell',
  },
  {
    id: 'kill-port',
    title: 'Kill process using a specific port',
    description: 'Finds and kills whatever is occupying a port — no more "address already in use"',
    command: `lsof -ti :PORT | xargs kill -9`,
    platform: 'bash',
    tags: ['bash', 'process', 'kill', 'ports', 'network'],
    category: 'shell',
  },
  {
    id: 'watch-directory',
    title: 'Watch a directory for changes',
    description: 'Prints a line every time a file changes in the target directory',
    command: `fswatch -o /path/to/dir | while read; do echo "Changed at $(date)"; done`,
    platform: 'macOS',
    tags: ['bash', 'files', 'watch', 'macos'],
    category: 'shell',
  },

  {
    id: 'random-password',
    title: 'Generate a random password',
    description: 'Creates a 32-character random alphanumeric password from /dev/urandom',
    command: `LC_ALL=C tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 32; echo`,
    platform: 'bash',
    tags: ['bash', 'password', 'random', 'security'],
    category: 'shell',
  },
  {
    id: 'parallel-xargs',
    title: 'Run commands in parallel with xargs',
    description: 'Executes a command on each line of input using 4 parallel processes',
    command: `cat urls.txt | xargs -P4 -I{} curl -sL -o /dev/null -w "%{http_code} {}\\n" {}`,
    platform: 'bash',
    tags: ['bash', 'parallel', 'xargs', 'performance'],
    category: 'shell',
  },
  {
    id: 'diff-directories',
    title: 'Compare two directories for differences',
    description: 'Shows files that differ or exist only in one directory — great for deploy diffs',
    command: `diff -rq dir1/ dir2/ | sort`,
    platform: 'bash',
    tags: ['bash', 'diff', 'files', 'compare'],
    category: 'shell',
  },
  {
    id: 'delete-empty-dirs',
    title: 'Find and delete empty directories',
    description: 'Recursively removes all empty directories from the tree',
    command: `find . -type d -empty -delete`,
    platform: 'bash',
    tags: ['bash', 'files', 'cleanup', 'directories'],
    category: 'shell',
  },
  {
    id: 'tar-progress',
    title: 'Create tar.gz with progress indicator',
    description: 'Compresses a directory while showing file count progress using pv',
    command: `tar cf - directory/ | pv -s $(du -sb directory/ | awk '{print $1}') | gzip > archive.tar.gz`,
    platform: 'bash',
    tags: ['bash', 'tar', 'compress', 'archive', 'progress'],
    category: 'shell',
  },
  {
    id: 'http-server-quick',
    title: 'One-liner HTTP server (any language)',
    description: 'Serve the current directory over HTTP — pick whichever runtime you have',
    command: `# Python 3
python3 -m http.server 8000

# Node.js
npx serve .

# Ruby
ruby -run -e httpd . -p 8000

# PHP
php -S localhost:8000`,
    platform: 'bash',
    tags: ['bash', 'http', 'server', 'python', 'node'],
    category: 'shell',
  },
  {
    id: 'repeat-until-fail',
    title: 'Run a command until it fails',
    description: 'Repeats a flaky command until it exits non-zero — useful for finding intermittent test failures',
    command: `while true; do YOUR_COMMAND || { echo "Failed on attempt $n"; break; }; ((n++)); done`,
    platform: 'bash',
    tags: ['bash', 'loop', 'test', 'debug', 'flaky'],
    category: 'shell',
  },

  // ── macOS Specific ──────────────────────────────────────────
  {
    id: 'pbcopy-file',
    title: 'Copy file contents to clipboard',
    description: 'Pipes any file straight into the macOS clipboard',
    command: `pbcopy < filename.txt`,
    platform: 'macOS',
    tags: ['macos', 'clipboard', 'pbcopy'],
    category: 'macos',
  },
  {
    id: 'toggle-hidden',
    title: 'Toggle hidden files in Finder',
    description: 'Shows or hides dotfiles in Finder, then restarts it',
    command: `defaults write com.apple.finder AppleShowAllFiles -bool true && killall Finder`,
    platform: 'macOS',
    tags: ['macos', 'finder', 'hidden', 'defaults'],
    category: 'macos',
  },
  {
    id: 'flush-dns',
    title: 'Flush DNS cache',
    description: 'Clears the local DNS resolver cache on macOS',
    command: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`,
    platform: 'macOS',
    tags: ['macos', 'dns', 'network'],
    category: 'macos',
  },
  {
    id: 'listening-ports',
    title: 'List all listening ports',
    description: 'Shows every process with an open listening TCP port',
    command: `lsof -iTCP -sTCP:LISTEN -n -P`,
    platform: 'macOS',
    tags: ['macos', 'network', 'ports', 'debug'],
    category: 'macos',
  },
  {
    id: 'quicklook',
    title: 'Quick Look a file from terminal',
    description: 'Opens the macOS Quick Look preview for any file without launching an app',
    command: `qlmanage -p filename.png`,
    platform: 'macOS',
    tags: ['macos', 'preview', 'quicklook'],
    category: 'macos',
  },

  {
    id: 'sips-resize',
    title: 'Batch resize images with sips',
    description: 'Resizes all PNGs in the current directory to a max width of 800px — no ImageMagick needed',
    command: `for f in *.png; do sips --resampleWidth 800 "$f"; done`,
    platform: 'macOS',
    tags: ['macos', 'images', 'resize', 'sips', 'bulk'],
    category: 'macos',
  },
  {
    id: 'heic-to-png',
    title: 'Convert HEIC photos to PNG',
    description: 'Converts all iPhone HEIC photos in the current directory to PNG using the built-in sips tool',
    command: `for f in *.HEIC; do sips -s format png "$f" --out "\${f%.HEIC}.png"; done`,
    platform: 'macOS',
    tags: ['macos', 'images', 'heic', 'convert', 'sips'],
    category: 'macos',
  },
  {
    id: 'battery-info',
    title: 'Get battery and power info from CLI',
    description: 'Shows charge percentage, cycle count, condition, and power source',
    command: `pmset -g batt && system_profiler SPPowerDataType | grep -E "Cycle|Condition|Charge"`,
    platform: 'macOS',
    tags: ['macos', 'battery', 'power', 'hardware'],
    category: 'macos',
  },
  {
    id: 'say-text',
    title: 'Text-to-speech from terminal',
    description: 'Reads text aloud using the macOS speech synthesizer — great for long-running task notifications',
    command: `say "Build complete"`,
    platform: 'macOS',
    tags: ['macos', 'tts', 'speech', 'notification'],
    category: 'macos',
  },
  {
    id: 'wifi-password',
    title: 'Show saved Wi-Fi password',
    description: 'Retrieves the stored password for a saved Wi-Fi network from the macOS keychain',
    command: `security find-generic-password -wa "NETWORK_NAME"`,
    platform: 'macOS',
    tags: ['macos', 'wifi', 'password', 'keychain'],
    category: 'macos',
  },
  {
    id: 'macos-screenshot-window',
    title: 'Screenshot a specific window to file',
    description: 'Takes a screenshot of the front window with shadow — press Space after running to select',
    command: `screencapture -W screenshot.png`,
    platform: 'macOS',
    tags: ['macos', 'screenshot', 'capture'],
    category: 'macos',
  },

  // ── Data Extraction ─────────────────────────────────────────
  {
    id: 'csv-headers',
    title: 'Extract and list CSV headers',
    description: 'Reads the first line of a CSV file and prints each field on its own line, numbered',
    command: `head -1 data.csv | tr ',' '\\n' | nl`,
    platform: 'bash',
    tags: ['csv', 'headers', 'data', 'extract'],
    category: 'data',
  },
  {
    id: 'csv-unique-values',
    title: 'Unique values from a CSV column',
    description: 'Extracts distinct values from column N (1-indexed), skipping the header',
    command: `awk -F',' 'NR>1 {print $2}' data.csv | sort -u`,
    platform: 'bash',
    tags: ['csv', 'unique', 'data', 'awk'],
    category: 'data',
  },
  {
    id: 'json-keys',
    title: 'List top-level JSON keys',
    description: 'Extracts all top-level keys from a JSON file or object',
    command: `cat data.json | python3 -c "import sys,json; print('\\n'.join(json.load(sys.stdin).keys()))"`,
    platform: 'bash',
    tags: ['json', 'keys', 'data', 'python'],
    category: 'data',
  },
  {
    id: 'extract-emails',
    title: 'Extract email addresses from text',
    description: 'Pulls all email addresses from a file using grep regex',
    command: `grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' file.txt | sort -u`,
    platform: 'bash',
    tags: ['regex', 'email', 'extract', 'grep'],
    category: 'data',
  },
  {
    id: 'csv-count-per-value',
    title: 'Count occurrences per field value',
    description: 'Groups and counts how often each value appears in a CSV column',
    command: `awk -F',' 'NR>1 {count[$3]++} END {for (k in count) print count[k], k}' data.csv | sort -rn`,
    platform: 'bash',
    tags: ['csv', 'count', 'data', 'awk', 'aggregate'],
    category: 'data',
  },

  {
    id: 'csv-to-json',
    title: 'Convert CSV to JSON',
    description: 'Turns a CSV file into a JSON array of objects using only Python stdlib — no pandas needed',
    command: `python3 -c "
import csv, json, sys
with open('data.csv') as f:
    print(json.dumps(list(csv.DictReader(f)), indent=2))
"`,
    platform: 'bash',
    tags: ['csv', 'json', 'convert', 'python', 'data'],
    category: 'data',
  },
  {
    id: 'extract-urls',
    title: 'Extract all URLs from a file',
    description: 'Pulls every http/https URL from a text file using grep regex',
    command: `grep -oE 'https?://[^ ]+' file.txt | sort -u`,
    platform: 'bash',
    tags: ['regex', 'url', 'extract', 'grep', 'data'],
    category: 'data',
  },
  {
    id: 'merge-csvs',
    title: 'Merge multiple CSVs with same headers',
    description: 'Concatenates CSV files keeping only one header row — works with any number of files',
    command: `head -1 file1.csv > merged.csv && tail -n +2 -q *.csv >> merged.csv`,
    platform: 'bash',
    tags: ['csv', 'merge', 'concatenate', 'data'],
    category: 'data',
  },
  {
    id: 'jq-nested-extract',
    title: 'Extract nested JSON values with jq',
    description: 'Drills into nested JSON arrays and objects — outputs flat TSV for easy piping',
    command: `cat data.json | jq -r '.items[] | [.id, .metadata.name, .status.phase] | @tsv'`,
    platform: 'bash',
    tags: ['json', 'jq', 'nested', 'extract', 'data'],
    category: 'data',
  },
  {
    id: 'xml-to-json',
    title: 'Convert XML to JSON',
    description: 'Quick XML-to-JSON conversion using Python xmltodict — install with pip if missing',
    command: `python3 -c "
import xmltodict, json, sys
with open('data.xml') as f:
    print(json.dumps(xmltodict.parse(f.read()), indent=2))
"`,
    platform: 'bash',
    tags: ['xml', 'json', 'convert', 'python', 'data'],
    category: 'data',
  },

  // ── Text Processing ─────────────────────────────────────────
  {
    id: 'remove-duplicate-lines',
    title: 'Remove duplicate lines preserving order',
    description: 'Strips duplicate lines from a file without sorting it first',
    command: `awk '!seen[$0]++' file.txt`,
    platform: 'bash',
    tags: ['text', 'duplicates', 'awk', 'unique'],
    category: 'text',
  },
  {
    id: 'grep-context',
    title: 'Find pattern with surrounding context',
    description: 'Shows 3 lines before and after each match for quick orientation',
    command: `grep -n -B3 -A3 "pattern" file.txt`,
    platform: 'bash',
    tags: ['grep', 'search', 'context', 'text'],
    category: 'text',
  },
  {
    id: 'replace-in-files',
    title: 'Replace text across multiple files',
    description: 'Recursively replaces a string in all matching files using sed',
    command: `find . -name "*.py" -exec sed -i '' 's/old_text/new_text/g' {} +`,
    platform: 'macOS',
    tags: ['sed', 'replace', 'bulk', 'text', 'macos'],
    category: 'text',
  },
  {
    id: 'extract-columns',
    title: 'Extract columns from delimited data',
    description: 'Pulls specific columns from tab or comma delimited files',
    command: `cut -d',' -f1,3,5 data.csv`,
    platform: 'bash',
    tags: ['cut', 'columns', 'data', 'csv', 'text'],
    category: 'text',
  },
  {
    id: 'sort-numeric',
    title: 'Sort file by numeric column',
    description: 'Sorts lines by the second column as numbers in descending order',
    command: `sort -t',' -k2 -rn data.csv`,
    platform: 'bash',
    tags: ['sort', 'numeric', 'data', 'text'],
    category: 'text',
  },

  {
    id: 'remove-blank-lines',
    title: 'Remove all blank lines from a file',
    description: 'Strips empty and whitespace-only lines in place',
    command: `sed -i '' '/^[[:space:]]*$/d' file.txt`,
    platform: 'macOS',
    tags: ['sed', 'text', 'blank', 'cleanup', 'macos'],
    category: 'text',
  },
  {
    id: 'word-frequency',
    title: 'Count word frequency in a file',
    description: 'Lists every word and how many times it appears — sorted by count descending',
    command: `tr -cs 'A-Za-z' '\\n' < file.txt | tr 'A-Z' 'a-z' | sort | uniq -c | sort -rn | head -30`,
    platform: 'bash',
    tags: ['text', 'frequency', 'count', 'words', 'analysis'],
    category: 'text',
  },
  {
    id: 'json-pretty-print',
    title: 'Pretty-print JSON (with or without jq)',
    description: 'Format minified JSON into readable indented output',
    command: `# With jq
cat data.json | jq .

# Without jq (Python)
python3 -m json.tool data.json`,
    platform: 'bash',
    tags: ['json', 'format', 'pretty', 'jq', 'text'],
    category: 'text',
  },
  {
    id: 'diff-highlight',
    title: 'Side-by-side colorized file diff',
    description: 'Shows differences between two files in a two-column layout with color',
    command: `diff --color -y --width=120 file1.txt file2.txt`,
    platform: 'bash',
    tags: ['diff', 'compare', 'text', 'files'],
    category: 'text',
  },
  {
    id: 'tabs-to-spaces',
    title: 'Convert tabs to spaces across files',
    description: 'Replaces all tabs with 2 spaces in every matching file — adjustable width',
    command: `find . -name "*.py" -exec sed -i '' 's/\\t/  /g' {} +`,
    platform: 'macOS',
    tags: ['sed', 'tabs', 'spaces', 'format', 'macos'],
    category: 'text',
  },

  // ── Git ────────────────────────────────────────────────────
  {
    id: 'git-undo-commit',
    title: 'Undo last commit, keep changes staged',
    description: 'Moves HEAD back one commit but keeps all changes in the staging area — safe undo',
    command: `git reset --soft HEAD~1`,
    platform: 'bash',
    tags: ['git', 'undo', 'reset', 'commit'],
    category: 'git',
  },
  {
    id: 'git-squash',
    title: 'Squash last N commits into one',
    description: 'Combines the last 3 commits into a single commit — change the number as needed',
    command: `git reset --soft HEAD~3 && git commit -m "Combined commit message"`,
    platform: 'bash',
    tags: ['git', 'squash', 'rebase', 'commit', 'cleanup'],
    category: 'git',
  },
  {
    id: 'git-changed-between-branches',
    title: 'Files changed between two branches',
    description: 'Lists every file that differs between the current branch and main — useful before PRs',
    command: `git diff --name-only main...HEAD`,
    platform: 'bash',
    tags: ['git', 'diff', 'branches', 'files', 'pr'],
    category: 'git',
  },
  {
    id: 'git-cleanup-merged',
    title: 'Delete all merged local branches',
    description: 'Removes every local branch already merged into main — keeps main and current branch',
    command: `git branch --merged main | grep -v "main\\|\\*" | xargs git branch -d`,
    platform: 'bash',
    tags: ['git', 'branches', 'cleanup', 'merged'],
    category: 'git',
  },
  {
    id: 'git-stash-unstaged',
    title: 'Stash only unstaged changes',
    description: 'Keeps your staged work in place and stashes everything else — perfect for partial commits',
    command: `git stash --keep-index`,
    platform: 'bash',
    tags: ['git', 'stash', 'staging'],
    category: 'git',
  },
  {
    id: 'git-blame-lines',
    title: 'Blame a specific line range',
    description: 'Shows who last modified lines 10-20 of a file with commit info',
    command: `git blame -L 10,20 path/to/file.js`,
    platform: 'bash',
    tags: ['git', 'blame', 'history', 'debug'],
    category: 'git',
  },
  {
    id: 'git-commits-per-author',
    title: 'Commits per author stats',
    description: 'Shows how many commits each person has made — quick team activity overview',
    command: `git shortlog -sn --all --no-merges`,
    platform: 'bash',
    tags: ['git', 'stats', 'authors', 'log'],
    category: 'git',
  },
  {
    id: 'git-search-commits',
    title: 'Search commit messages for a keyword',
    description: 'Finds all commits whose message contains a string — faster than scrolling through git log',
    command: `git log --all --oneline --grep="keyword"`,
    platform: 'bash',
    tags: ['git', 'search', 'log', 'commits'],
    category: 'git',
  },
  {
    id: 'git-find-deleted-file',
    title: 'Find when a file was deleted',
    description: 'Locates the commit that removed a specific file and shows its last contents',
    command: `git log --all --full-history -- path/to/deleted-file.js`,
    platform: 'bash',
    tags: ['git', 'deleted', 'history', 'recover'],
    category: 'git',
  },
  {
    id: 'git-bisect-quick',
    title: 'Find the commit that broke something',
    description: 'Binary search through commits to pinpoint which one introduced a bug',
    command: `git bisect start
git bisect bad          # current commit is broken
git bisect good abc123  # this older commit was fine
# Git checks out middle commits — test each one, then:
git bisect good   # or: git bisect bad
# When done:
git bisect reset`,
    platform: 'bash',
    tags: ['git', 'bisect', 'debug', 'history', 'bug'],
    category: 'git',
  },
  {
    id: 'git-cherry-pick',
    title: 'Cherry-pick a commit to current branch',
    description: 'Applies a specific commit from another branch without merging the whole branch',
    command: `git cherry-pick COMMIT_SHA`,
    platform: 'bash',
    tags: ['git', 'cherry-pick', 'branches', 'commit'],
    category: 'git',
  },

  // ── Config / Setup ─────────────────────────────────────────
  {
    id: 'aws-config-view',
    title: 'View current AWS config and identity',
    description: 'Shows your configured region, account ID, and IAM user/role — verify before running anything destructive',
    command: `# Who am I?
aws sts get-caller-identity

# Current config
aws configure list

# All profiles
aws configure list-profiles`,
    platform: 'bash',
    tags: ['aws', 'config', 'identity', 'iam', 'setup'],
    category: 'config',
  },
  {
    id: 'aws-config-set',
    title: 'Set up AWS CLI profile',
    description: 'Configures a named AWS profile with region and credentials — avoids polluting the default profile',
    command: `# Interactive setup for a named profile
aws configure --profile my-project

# Or set individual values directly
aws configure set region us-east-1 --profile my-project
aws configure set aws_access_key_id AKIAIOSFODNN7EXAMPLE --profile my-project
aws configure set aws_secret_access_key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY --profile my-project

# Use the profile
export AWS_PROFILE=my-project`,
    platform: 'bash',
    tags: ['aws', 'config', 'profile', 'credentials', 'setup'],
    category: 'config',
  },
  {
    id: 'git-config-identity',
    title: 'Set git user name and email',
    description: 'Configure your git identity globally or per-repo — essential before your first commit',
    command: `# Global (all repos)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Per-repo only (run inside the repo)
git config user.name "Work Name"
git config user.email "you@company.com"

# Verify current settings
git config --list --show-origin | grep user`,
    platform: 'bash',
    tags: ['git', 'config', 'email', 'user', 'identity', 'setup'],
    category: 'config',
  },
  {
    id: 'git-config-useful',
    title: 'Useful git config defaults',
    description: 'Quality-of-life git settings you should set once and forget',
    command: `# Auto-prune deleted remote branches on fetch
git config --global fetch.prune true

# Default branch name for new repos
git config --global init.defaultBranch main

# Better diff algorithm
git config --global diff.algorithm histogram

# Rebase on pull instead of merge
git config --global pull.rebase true

# Auto-stash before rebase
git config --global rebase.autoStash true

# Push current branch only
git config --global push.default current`,
    platform: 'bash',
    tags: ['git', 'config', 'defaults', 'setup', 'quality'],
    category: 'config',
  },
  {
    id: 'asdf-set-version',
    title: 'Set tool version with asdf (latest syntax)',
    description: 'Install and set a runtime version with asdf — uses the current "set" command instead of the deprecated "global"',
    command: `# List all installable versions of a plugin
asdf list all nodejs

# Install the latest stable version
asdf install nodejs latest

# Set it as your default (replaces the old "asdf global")
asdf set --home nodejs latest

# Set it for the current project only
asdf set nodejs latest

# Verify
asdf current nodejs`,
    platform: 'bash',
    tags: ['asdf', 'version', 'nodejs', 'python', 'ruby', 'setup'],
    category: 'config',
  },
  {
    id: 'asdf-common-plugins',
    title: 'Install common asdf plugins',
    description: 'Add and install the most-used runtimes with asdf in one go',
    command: `# Add plugins
asdf plugin add nodejs
asdf plugin add python
asdf plugin add ruby
asdf plugin add golang
asdf plugin add java
asdf plugin add terraform

# Install latest of each
asdf install nodejs latest
asdf install python latest
asdf install ruby latest

# Set all as home defaults
asdf set --home nodejs latest
asdf set --home python latest
asdf set --home ruby latest`,
    platform: 'bash',
    tags: ['asdf', 'plugins', 'install', 'nodejs', 'python', 'setup'],
    category: 'config',
  },
  {
    id: 'ssh-keygen-setup',
    title: 'Generate SSH key and add to agent',
    description: 'Creates an Ed25519 SSH key pair and loads it into the macOS keychain agent',
    command: `# Generate key
ssh-keygen -t ed25519 -C "you@example.com"

# Start agent and add key (macOS stores in Keychain)
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# Copy public key to clipboard (paste into GitHub/GitLab)
pbcopy < ~/.ssh/id_ed25519.pub`,
    platform: 'macOS',
    tags: ['ssh', 'keygen', 'github', 'setup', 'macos', 'security'],
    category: 'config',
  },
  {
    id: 'ssh-config-hosts',
    title: 'SSH config for quick host aliases',
    description: 'Add entries to ~/.ssh/config so you can just type "ssh prod" instead of the full command',
    command: `# Add to ~/.ssh/config
Host prod
  HostName 10.0.1.50
  User deploy
  IdentityFile ~/.ssh/id_ed25519
  Port 22

Host staging
  HostName 10.0.1.51
  User deploy
  IdentityFile ~/.ssh/id_ed25519

# Then just:
# ssh prod
# ssh staging
# scp file.txt prod:/tmp/`,
    platform: 'bash',
    tags: ['ssh', 'config', 'hosts', 'alias', 'setup'],
    category: 'config',
  },
  {
    id: 'npm-config-defaults',
    title: 'Set npm/yarn defaults',
    description: 'Configure package manager defaults so you stop typing the same flags',
    command: `# Set default author for npm init
npm config set init-author-name "Your Name"
npm config set init-author-email "you@example.com"
npm config set init-license "MIT"

# Save exact versions (no ^ or ~)
npm config set save-exact true

# View all config
npm config list`,
    platform: 'bash',
    tags: ['npm', 'config', 'yarn', 'setup', 'node'],
    category: 'config',
  },
  {
    id: 'brew-essentials',
    title: 'Homebrew essential dev tools',
    description: 'Install a curated set of CLI tools you will actually use daily on macOS',
    command: `brew install \\
  git gh jq yq tree wget curl \\
  ripgrep fd bat eza \\
  htop watch tldr \\
  asdf direnv \\
  docker colima \\
  awscli kubectl helm`,
    platform: 'macOS',
    tags: ['brew', 'install', 'macos', 'tools', 'setup'],
    category: 'config',
  },

  // ── curl ───────────────────────────────────────────────────
  {
    id: 'curl-post-json',
    title: 'POST JSON with curl',
    description: 'Sends a JSON payload and shows the response — the curl call you write 10 times a day',
    command: `curl -s -X POST https://api.example.com/endpoint \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"key": "value", "count": 42}' | jq .`,
    platform: 'bash',
    tags: ['curl', 'http', 'json', 'post', 'api'],
    category: 'devops',
  },
  {
    id: 'curl-follow-redirects',
    title: 'Follow redirects and show the chain',
    description: 'Traces every redirect hop with status codes — debug DNS, CDN, or load balancer routing',
    command: `curl -sL -o /dev/null -w "%{url_effective}\\n" https://example.com
# Full redirect chain:
curl -sIL https://example.com 2>&1 | grep -E "^HTTP/|^location:"`,
    platform: 'bash',
    tags: ['curl', 'http', 'redirect', 'debug', 'dns'],
    category: 'devops',
  },
  {
    id: 'curl-download-resume',
    title: 'Download a file with resume support',
    description: 'Downloads a large file and can resume if interrupted — shows progress bar',
    command: `curl -L -C - -o output.tar.gz https://example.com/large-file.tar.gz`,
    platform: 'bash',
    tags: ['curl', 'download', 'resume', 'files'],
    category: 'devops',
  },
  {
    id: 'curl-timing-breakdown',
    title: 'curl with full timing breakdown',
    description: 'Shows DNS lookup, TCP connect, TLS handshake, and transfer times — find what is slow',
    command: `curl -s -o /dev/null -w "\\
DNS:        %{time_namelookup}s\\n\\
Connect:    %{time_connect}s\\n\\
TLS:        %{time_appconnect}s\\n\\
Start:      %{time_starttransfer}s\\n\\
Total:      %{time_total}s\\n\\
Status:     %{http_code}\\n\\
Size:       %{size_download} bytes\\n" https://example.com`,
    platform: 'bash',
    tags: ['curl', 'http', 'performance', 'timing', 'debug'],
    category: 'devops',
  },
  {
    id: 'curl-upload-form',
    title: 'Upload a file with curl (multipart form)',
    description: 'Sends a file as multipart form data — works with most upload endpoints',
    command: `curl -X POST https://api.example.com/upload \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@/path/to/document.pdf" \\
  -F "name=my-upload"`,
    platform: 'bash',
    tags: ['curl', 'http', 'upload', 'form', 'files'],
    category: 'devops',
  },
  {
    id: 'curl-headers-only',
    title: 'Show response headers only',
    description: 'Fetch just the headers without downloading the body — check cache, CORS, content-type',
    command: `curl -sI https://example.com`,
    platform: 'bash',
    tags: ['curl', 'http', 'headers', 'debug'],
    category: 'devops',
  },

  // ── DNS ───────────────────────────────────────────────────
  {
    id: 'dns-lookup-cname',
    title: 'Look up CNAME records for a domain',
    description: 'Shows the CNAME chain — verify your custom domain points to the right CDN or hosting provider',
    command: `dig CNAME example.com +short

# Full chain with TTL
dig CNAME example.com +noall +answer

# Query a specific DNS server
dig @8.8.8.8 CNAME example.com +short`,
    platform: 'bash',
    tags: ['dns', 'cname', 'dig', 'networking', 'domain'],
    category: 'devops',
  },
  {
    id: 'dns-all-records',
    title: 'Show all DNS records for a domain',
    description: 'Queries A, AAAA, CNAME, MX, TXT, and NS records in one shot',
    command: `for type in A AAAA CNAME MX TXT NS; do
  echo "=== $type ==="
  dig +short $type example.com
done`,
    platform: 'bash',
    tags: ['dns', 'dig', 'records', 'networking', 'domain'],
    category: 'devops',
  },
  {
    id: 'dns-propagation-check',
    title: 'Check DNS propagation across resolvers',
    description: 'Queries multiple public DNS servers to see if a change has propagated everywhere',
    command: `for ns in 8.8.8.8 1.1.1.1 9.9.9.9 208.67.222.222; do
  echo "$ns: $(dig +short @$ns A example.com)"
done`,
    platform: 'bash',
    tags: ['dns', 'propagation', 'dig', 'networking', 'domain'],
    category: 'devops',
  },
  {
    id: 'dns-reverse-lookup',
    title: 'Reverse DNS lookup (IP to hostname)',
    description: 'Finds the hostname associated with an IP address',
    command: `dig -x 8.8.8.8 +short`,
    platform: 'bash',
    tags: ['dns', 'reverse', 'dig', 'networking', 'ip'],
    category: 'devops',
  },

  // ── jq ────────────────────────────────────────────────────
  {
    id: 'jq-filter-by-field',
    title: 'jq: filter array items by field value',
    description: 'Selects objects from a JSON array where a field matches a condition',
    command: `# Exact match
cat data.json | jq '.items[] | select(.status == "active")'

# Contains string
cat data.json | jq '.items[] | select(.name | contains("prod"))'

# Numeric comparison
cat data.json | jq '.items[] | select(.count > 100)'`,
    platform: 'bash',
    tags: ['jq', 'json', 'filter', 'query', 'data'],
    category: 'data',
  },
  {
    id: 'jq-reshape-objects',
    title: 'jq: reshape objects (pick/rename fields)',
    description: 'Transform JSON objects by selecting, renaming, or computing new fields',
    command: `# Pick specific fields
cat data.json | jq '.[] | {name, email}'

# Rename fields
cat data.json | jq '.[] | {user_name: .name, mail: .email}'

# Computed fields
cat data.json | jq '.[] | {name, full: (.first + " " + .last)}'`,
    platform: 'bash',
    tags: ['jq', 'json', 'transform', 'reshape', 'data'],
    category: 'data',
  },
  {
    id: 'jq-group-count',
    title: 'jq: group by and count',
    description: 'Groups JSON array items by a field and counts occurrences — the SQL GROUP BY of jq',
    command: `cat data.json | jq 'group_by(.status) | map({status: .[0].status, count: length})'`,
    platform: 'bash',
    tags: ['jq', 'json', 'group', 'count', 'aggregate', 'data'],
    category: 'data',
  },
  {
    id: 'jq-flatten-merge',
    title: 'jq: flatten nested arrays and merge objects',
    description: 'Common jq transforms for deeply nested JSON structures',
    command: `# Flatten nested arrays
cat data.json | jq '[.teams[].members[]]'

# Merge two objects
echo '{"a":1}' | jq '. + {"b":2, "c":3}'

# Flatten one level
cat data.json | jq '.nested | flatten(1)'

# Collect all values of a key at any depth
cat data.json | jq '.. | .id? // empty'`,
    platform: 'bash',
    tags: ['jq', 'json', 'flatten', 'merge', 'nested', 'data'],
    category: 'data',
  },
  {
    id: 'jq-csv-output',
    title: 'jq: convert JSON array to CSV',
    description: 'Outputs a JSON array as comma-separated values with a header row',
    command: `cat data.json | jq -r '
  (.[0] | keys_unsorted) as $keys |
  ($keys | @csv),
  (.[] | [.[$keys[]]] | @csv)
'`,
    platform: 'bash',
    tags: ['jq', 'json', 'csv', 'convert', 'export', 'data'],
    category: 'data',
  },
  {
    id: 'jq-update-in-place',
    title: 'jq: modify values in a JSON file',
    description: 'Update specific fields and write back — jq has no in-place flag so pipe through sponge or a temp file',
    command: `# Update a field
jq '.version = "2.0.0"' package.json > tmp.json && mv tmp.json package.json

# Delete a field
jq 'del(.devDependencies)' package.json > tmp.json && mv tmp.json package.json

# Add to an array
jq '.tags += ["new-tag"]' data.json > tmp.json && mv tmp.json data.json`,
    platform: 'bash',
    tags: ['jq', 'json', 'edit', 'update', 'modify'],
    category: 'data',
  },

  // ── yq ────────────────────────────────────────────────────
  {
    id: 'yq-read-value',
    title: 'yq: read values from YAML',
    description: 'Extract specific values from YAML files — same dot-path syntax as jq',
    command: `# Read a value
yq '.metadata.name' deployment.yaml

# Read nested array item
yq '.spec.containers[0].image' pod.yaml

# Read all image fields
yq '.spec.containers[].image' pod.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'read', 'query', 'k8s'],
    category: 'data',
  },
  {
    id: 'yq-edit-yaml',
    title: 'yq: edit YAML files in place',
    description: 'Modify YAML values without breaking formatting or comments — essential for CI/CD pipelines',
    command: `# Update a value in place
yq -i '.spec.replicas = 3' deployment.yaml

# Update image tag
yq -i '.spec.containers[0].image = "app:v2.1.0"' deployment.yaml

# Add a new field
yq -i '.metadata.labels.env = "production"' deployment.yaml

# Delete a field
yq -i 'del(.metadata.annotations)' deployment.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'edit', 'update', 'k8s', 'cicd'],
    category: 'data',
  },
  {
    id: 'yq-convert-formats',
    title: 'yq: convert between YAML, JSON, and XML',
    description: 'Translate between formats using yq — handy for piping YAML into jq or generating configs',
    command: `# YAML to JSON
yq -o=json deployment.yaml

# JSON to YAML
yq -P data.json

# YAML to CSV (for tabular data)
yq -o=csv '.items[]' data.yaml

# Multiple YAML docs to JSON array
yq -o=json -s '.' multi-doc.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'json', 'convert', 'format'],
    category: 'data',
  },
  {
    id: 'yq-merge-yamls',
    title: 'yq: merge multiple YAML files',
    description: 'Combine base and overlay YAML files — like Kustomize but simpler',
    command: `# Merge overlay into base (overlay wins)
yq '. *= load("overlay.yaml")' base.yaml

# Merge and write to new file
yq eval-all 'select(fileIndex == 0) * select(fileIndex == 1)' base.yaml overlay.yaml > merged.yaml

# Append arrays instead of replacing
yq '. *+ load("extra.yaml")' base.yaml`,
    platform: 'bash',
    tags: ['yq', 'yaml', 'merge', 'overlay', 'k8s'],
    category: 'data',
  },

  // ── Docker ─────────────────────────────────────────────────
  {
    id: 'docker-debug-tools-debian',
    title: 'Install debug tools in a minimal container (Debian)',
    description: 'Drop into a container missing curl, dig, ping, traceroute, netcat, vim, strace, and install them all',
    command: `apt-get update && apt-get install -y \\
  curl wget dnsutils iputils-ping traceroute \\
  netcat-openbsd vim strace tcpdump procps \\
  net-tools lsof jq less htop`,
    platform: 'bash',
    tags: ['docker', 'debug', 'networking', 'install', 'troubleshooting'],
    category: 'docker',
  },
  {
    id: 'docker-debug-tools-alpine',
    title: 'Install debug tools in Alpine container',
    description: 'Same toolkit but for Alpine-based images using apk',
    command: `apk add --no-cache \\
  curl wget bind-tools iputils busybox-extras \\
  vim strace tcpdump procps net-tools \\
  lsof jq less htop netcat-openbsd`,
    platform: 'bash',
    tags: ['docker', 'alpine', 'debug', 'install', 'troubleshooting'],
    category: 'docker',
  },
  {
    id: 'docker-ephemeral-debug',
    title: 'Attach a debug sidecar to a running container',
    description: 'Starts a temporary container sharing the network and PID namespace of a running one — full toolkit without modifying the original',
    command: `docker run -it --rm \\
  --network container:TARGET_CONTAINER \\
  --pid container:TARGET_CONTAINER \\
  nicolaka/netshoot`,
    platform: 'bash',
    tags: ['docker', 'debug', 'networking', 'netshoot', 'sidecar'],
    category: 'docker',
  },
  {
    id: 'docker-cleanup',
    title: 'Deep clean Docker: images, volumes, networks',
    description: 'Removes all stopped containers, dangling images, unused volumes, and orphaned networks in one shot',
    command: `docker system prune -a --volumes -f`,
    platform: 'bash',
    tags: ['docker', 'cleanup', 'disk', 'images', 'volumes'],
    category: 'docker',
  },
  {
    id: 'docker-disk-usage',
    title: 'Show Docker disk usage breakdown',
    description: 'See exactly where Docker is eating disk: images, containers, volumes, build cache',
    command: `docker system df -v`,
    platform: 'bash',
    tags: ['docker', 'disk', 'monitoring', 'debug'],
    category: 'docker',
  },
  {
    id: 'docker-stats-oneliner',
    title: 'Live container resource usage (sorted)',
    description: 'Shows CPU, memory, network I/O for all running containers — refreshes live',
    command: `docker stats --format "table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.NetIO}}\\t{{.PIDs}}"`,
    platform: 'bash',
    tags: ['docker', 'monitoring', 'cpu', 'memory', 'stats'],
    category: 'docker',
  },
  {
    id: 'docker-log-since',
    title: 'Tail container logs with timestamp filter',
    description: 'Shows only logs from the last hour with timestamps — useful for incident triage',
    command: `docker logs --since 1h --timestamps CONTAINER_NAME 2>&1 | tail -100`,
    platform: 'bash',
    tags: ['docker', 'logs', 'debug', 'timestamps'],
    category: 'docker',
  },
  {
    id: 'docker-copy-from',
    title: 'Copy files from a running container',
    description: 'Extracts a config file or log from inside a container to your host for inspection',
    command: `docker cp CONTAINER_NAME:/app/config.yaml ./config-backup.yaml`,
    platform: 'bash',
    tags: ['docker', 'files', 'extract', 'backup'],
    category: 'docker',
  },
  {
    id: 'docker-inspect-network',
    title: 'Show container IP and network details',
    description: 'Extracts the IP address and network settings from a running container',
    command: `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' CONTAINER_NAME`,
    platform: 'bash',
    tags: ['docker', 'networking', 'ip', 'inspect'],
    category: 'docker',
  },

  {
    id: 'docker-exec-root',
    title: 'Enter a container as root',
    description: 'Shells into a running container with root privileges — useful when the default user has no permissions',
    command: `docker exec -it --user root CONTAINER_NAME bash`,
    platform: 'bash',
    tags: ['docker', 'exec', 'root', 'debug', 'shell'],
    category: 'docker',
  },
  {
    id: 'docker-compose-one-service',
    title: 'Restart a single Docker Compose service',
    description: 'Stops, rebuilds, and restarts just one service without touching the rest of the stack',
    command: `docker compose up -d --no-deps --build SERVICE_NAME`,
    platform: 'bash',
    tags: ['docker', 'compose', 'restart', 'build', 'service'],
    category: 'docker',
  },
  {
    id: 'docker-image-layers',
    title: 'Show image layer sizes',
    description: 'Lists every layer in an image with its size — find what is making your image fat',
    command: `docker history --human --no-trunc IMAGE_NAME`,
    platform: 'bash',
    tags: ['docker', 'images', 'layers', 'size', 'optimize'],
    category: 'docker',
  },

  // ── Kubernetes ────────────────────────────────────────────
  {
    id: 'k8s-not-running',
    title: 'Find all pods NOT in Running state',
    description: 'Quickly surfaces CrashLoopBackOff, Pending, Evicted, and other unhealthy pods across all namespaces',
    command: `kubectl get pods -A --field-selector=status.phase!=Running --no-headers`,
    platform: 'bash',
    tags: ['k8s', 'pods', 'debug', 'status'],
    category: 'k8s',
  },
  {
    id: 'k8s-events-recent',
    title: 'Recent cluster events sorted by time',
    description: 'Shows the last 30 cluster events — fastest way to spot scheduling failures, OOM kills, and pull errors',
    command: `kubectl get events -A --sort-by='.lastTimestamp' | tail -30`,
    platform: 'bash',
    tags: ['k8s', 'events', 'debug', 'cluster'],
    category: 'k8s',
  },
  {
    id: 'k8s-crash-logs',
    title: 'Get logs from a crashed/restarting pod',
    description: 'Fetches logs from the previous container instance — essential for CrashLoopBackOff debugging',
    command: `kubectl logs POD_NAME --previous -n NAMESPACE`,
    platform: 'bash',
    tags: ['k8s', 'logs', 'crash', 'debug'],
    category: 'k8s',
  },
  {
    id: 'k8s-resource-usage',
    title: 'Node resource usage (CPU & memory)',
    description: 'Shows actual vs allocatable resources per node — find overcommitted nodes instantly',
    command: `kubectl top nodes --sort-by=cpu`,
    platform: 'bash',
    tags: ['k8s', 'nodes', 'cpu', 'memory', 'monitoring'],
    category: 'k8s',
  },
  {
    id: 'k8s-pod-resources',
    title: 'Top resource-consuming pods',
    description: 'Ranks pods by CPU usage across all namespaces — find the noisy neighbors',
    command: `kubectl top pods -A --sort-by=cpu | head -20`,
    platform: 'bash',
    tags: ['k8s', 'pods', 'cpu', 'monitoring', 'resources'],
    category: 'k8s',
  },
  {
    id: 'k8s-debug-pod',
    title: 'Spin up a temporary debug pod',
    description: 'Launches an ephemeral pod with common tools in a specific namespace for network or DNS testing',
    command: `kubectl run debug-pod --rm -it --restart=Never \\
  --image=nicolaka/netshoot -n NAMESPACE -- bash`,
    platform: 'bash',
    tags: ['k8s', 'debug', 'networking', 'ephemeral'],
    category: 'k8s',
  },
  {
    id: 'k8s-secret-decode',
    title: 'Decode a Kubernetes secret',
    description: 'Extracts and base64-decodes a secret value — no more piping through base64 manually',
    command: `kubectl get secret SECRET_NAME -n NAMESPACE -o jsonpath='{.data.password}' | base64 -d`,
    platform: 'bash',
    tags: ['k8s', 'secrets', 'decode', 'extract'],
    category: 'k8s',
  },
  {
    id: 'k8s-restart-deployment',
    title: 'Rolling restart a deployment',
    description: 'Triggers a zero-downtime rolling restart without changing the spec',
    command: `kubectl rollout restart deployment/DEPLOYMENT_NAME -n NAMESPACE`,
    platform: 'bash',
    tags: ['k8s', 'deployment', 'restart', 'rollout'],
    category: 'k8s',
  },
  {
    id: 'k8s-all-images',
    title: 'List all container images in the cluster',
    description: 'Extracts every unique image:tag running across all pods — useful for audits and CVE checks',
    command: `kubectl get pods -A -o jsonpath='{range .items[*]}{range .spec.containers[*]}{.image}{"\\n"}{end}{end}' | sort -u`,
    platform: 'bash',
    tags: ['k8s', 'images', 'audit', 'security'],
    category: 'k8s',
  },

  {
    id: 'k8s-port-forward',
    title: 'Port-forward to a pod or service',
    description: 'Exposes a pod or service port to your local machine — access remote services at localhost',
    command: `kubectl port-forward svc/SERVICE_NAME 8080:80 -n NAMESPACE`,
    platform: 'bash',
    tags: ['k8s', 'port-forward', 'networking', 'debug', 'service'],
    category: 'k8s',
  },
  {
    id: 'k8s-copy-files',
    title: 'Copy files to/from a pod',
    description: 'Transfer files between your local machine and a running pod',
    command: `# Copy local file to pod
kubectl cp local-file.txt NAMESPACE/POD_NAME:/tmp/file.txt

# Copy from pod to local
kubectl cp NAMESPACE/POD_NAME:/app/logs/error.log ./error.log`,
    platform: 'bash',
    tags: ['k8s', 'files', 'copy', 'transfer', 'debug'],
    category: 'k8s',
  },
  {
    id: 'k8s-pods-by-label',
    title: 'Get pods by label selector',
    description: 'Filters pods using label queries — essential for microservice debugging',
    command: `kubectl get pods -n NAMESPACE -l app=my-service,env=production -o wide`,
    platform: 'bash',
    tags: ['k8s', 'pods', 'labels', 'selector', 'filter'],
    category: 'k8s',
  },
  {
    id: 'k8s-exec-into-pod',
    title: 'Shell into a running pod',
    description: 'Opens an interactive shell inside a pod — falls back to sh if bash is unavailable',
    command: `kubectl exec -it POD_NAME -n NAMESPACE -- bash || kubectl exec -it POD_NAME -n NAMESPACE -- sh`,
    platform: 'bash',
    tags: ['k8s', 'exec', 'shell', 'debug'],
    category: 'k8s',
  },

  // ── DevOps Utilities ──────────────────────────────────────
  {
    id: 'devops-top-ips-nginx',
    title: 'Top 20 IPs hitting your server',
    description: 'Parses nginx/apache access logs to find the most active IP addresses — good for spotting abuse',
    command: `awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -20`,
    platform: 'bash',
    tags: ['devops', 'logs', 'nginx', 'ip', 'security'],
    category: 'devops',
  },
  {
    id: 'devops-http-status-counts',
    title: 'Count HTTP status codes from access logs',
    description: 'Groups and counts every HTTP status code — instant health check from logs',
    command: `awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn`,
    platform: 'bash',
    tags: ['devops', 'logs', 'http', 'monitoring', 'nginx'],
    category: 'devops',
  },
  {
    id: 'devops-slow-requests',
    title: 'Find slow requests from access logs',
    description: 'Extracts requests that took longer than 2 seconds (assumes $request_time is the last field)',
    command: `awk '$NF > 2.0 {print $0}' /var/log/nginx/access.log | tail -20`,
    platform: 'bash',
    tags: ['devops', 'logs', 'performance', 'slow', 'nginx'],
    category: 'devops',
  },
  {
    id: 'devops-json-logs-jq',
    title: 'Parse JSON logs: filter errors with jq',
    description: 'Extracts error-level entries from JSON-formatted logs and shows timestamp + message',
    command: `cat app.log | jq -r 'select(.level == "error") | "\\(.timestamp) \\(.message)"'`,
    platform: 'bash',
    tags: ['devops', 'json', 'logs', 'jq', 'errors'],
    category: 'devops',
  },
  {
    id: 'devops-epoch-to-human',
    title: 'Convert epoch timestamps to human readable',
    description: 'Inline replace epoch seconds in a log stream with ISO dates as you tail',
    command: `tail -f app.log | perl -pe 's/(\\d{10})/localtime($1)/ge'`,
    platform: 'bash',
    tags: ['devops', 'timestamps', 'epoch', 'logs', 'convert'],
    category: 'devops',
  },
  {
    id: 'devops-healthcheck',
    title: 'Quick HTTP health check with timing',
    description: 'Hits an endpoint and reports status code, total time, and content type in one call',
    command: `curl -s -o /dev/null -w "status: %{http_code}\\ntime: %{time_total}s\\nsize: %{size_download} bytes\\n" https://example.com/health`,
    platform: 'bash',
    tags: ['devops', 'http', 'healthcheck', 'curl', 'monitoring'],
    category: 'devops',
  },
  {
    id: 'devops-port-check',
    title: 'Test if a remote port is open',
    description: 'Quick TCP connectivity check without telnet or nmap — timeout after 3 seconds',
    command: `timeout 3 bash -c '</dev/tcp/HOST/PORT && echo "OPEN" || echo "CLOSED"'`,
    platform: 'bash',
    tags: ['devops', 'networking', 'ports', 'debug', 'connectivity'],
    category: 'devops',
  },
  {
    id: 'devops-disk-alert',
    title: 'One-liner disk usage alert',
    description: 'Prints partitions over 80% usage — pipe to mail or Slack webhook for alerts',
    command: `df -h | awk 'NR>1 && int($5)>80 {printf "ALERT: %s is %s full (%s)\\n", $6, $5, $1}'`,
    platform: 'bash',
    tags: ['devops', 'disk', 'monitoring', 'alert'],
    category: 'devops',
  },
  {
    id: 'devops-ssl-expiry',
    title: 'Check SSL certificate expiry date',
    description: 'Shows when a remote SSL cert expires — useful for monitoring before Let\'s Encrypt renewals fail',
    command: `echo | openssl s_client -servername DOMAIN -connect DOMAIN:443 2>/dev/null | openssl x509 -noout -dates`,
    platform: 'bash',
    tags: ['devops', 'ssl', 'certificate', 'security', 'monitoring'],
    category: 'devops',
  },
  {
    id: 'devops-watch-connections',
    title: 'Count TCP connections by state',
    description: 'Shows ESTABLISHED, TIME_WAIT, CLOSE_WAIT counts — find connection leaks fast',
    command: `ss -tan | awk 'NR>1 {print $1}' | sort | uniq -c | sort -rn`,
    platform: 'bash',
    tags: ['devops', 'networking', 'tcp', 'connections', 'debug'],
    category: 'devops',
  },
  {
    id: 'devops-multi-ssh',
    title: 'Run a command on multiple servers',
    description: 'Loops through a server list and runs the same command on each via SSH',
    command: `for host in server1 server2 server3; do
  echo "=== $host ==="
  ssh "$host" 'uptime && df -h / | tail -1'
done`,
    platform: 'bash',
    tags: ['devops', 'ssh', 'servers', 'automation', 'bulk'],
    category: 'devops',
  },

  {
    id: 'devops-self-signed-cert',
    title: 'Generate a self-signed SSL certificate',
    description: 'Creates a cert + key pair valid for 365 days — perfect for local dev or internal services',
    command: `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem \\
  -days 365 -nodes -subj "/CN=localhost"`,
    platform: 'bash',
    tags: ['devops', 'ssl', 'certificate', 'openssl', 'security'],
    category: 'devops',
  },
  {
    id: 'devops-benchmark-url',
    title: 'Benchmark a URL with ab',
    description: 'Sends 1000 requests with 10 concurrent connections and shows latency stats',
    command: `ab -n 1000 -c 10 https://example.com/`,
    platform: 'bash',
    tags: ['devops', 'benchmark', 'performance', 'http', 'load'],
    category: 'devops',
  },
  {
    id: 'devops-top-memory',
    title: 'Top 10 memory-consuming processes',
    description: 'Quickly find what is eating your RAM — sorted by resident memory',
    command: `ps aux --sort=-%mem | head -11`,
    platform: 'bash',
    tags: ['devops', 'memory', 'process', 'monitoring', 'debug'],
    category: 'devops',
  },
  {
    id: 'devops-cron-reference',
    title: 'Crontab schedule quick reference',
    description: 'Common cron expressions you always have to look up — copy and adjust',
    command: `# Every 5 minutes
*/5 * * * * /path/to/command

# Every hour at minute 0
0 * * * * /path/to/command

# Daily at 2:30 AM
30 2 * * * /path/to/command

# Every Monday at 9 AM
0 9 * * 1 /path/to/command

# First day of every month at midnight
0 0 1 * * /path/to/command

# Format: minute hour day-of-month month day-of-week`,
    platform: 'bash',
    tags: ['devops', 'cron', 'schedule', 'reference', 'automation'],
    category: 'devops',
  },
  {
    id: 'devops-aws-s3-sync',
    title: 'AWS S3 sync with dry run',
    description: 'Preview what would be uploaded/deleted before actually syncing — avoids accidents',
    command: `# Dry run first
aws s3 sync ./dist/ s3://BUCKET_NAME/ --dryrun --delete

# Actually sync
aws s3 sync ./dist/ s3://BUCKET_NAME/ --delete`,
    platform: 'bash',
    tags: ['devops', 'aws', 's3', 'sync', 'deploy'],
    category: 'devops',
  },
  {
    id: 'devops-env-diff',
    title: 'Compare two .env files',
    description: 'Shows which keys exist in one env file but not the other — catch missing config before deploy',
    command: `diff <(cut -d= -f1 .env.production | sort) <(cut -d= -f1 .env.staging | sort)`,
    platform: 'bash',
    tags: ['devops', 'env', 'config', 'diff', 'deploy'],
    category: 'devops',
  },

  // ── Claude Code ───────────────────────────────────────────
  {
    id: 'claude-settings-permissions',
    title: 'settings.json — skip permission prompts',
    description: 'Allowlist for common tools so Claude Code stops asking for confirmation on every read, edit, bash, and glob call',
    command: `{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(cd *)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(rm *)",
      "Bash(find *)",
      "Bash(grep *)",
      "Bash(rg *)",
      "Bash(head *)",
      "Bash(tail *)",
      "Bash(wc *)",
      "Bash(sort *)",
      "Bash(uniq *)",
      "Bash(diff *)",
      "Bash(echo *)",
      "Bash(which *)",
      "Bash(python3 *)",
      "Bash(node *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(make *)",
      "Bash(open *)",
      "Bash(curl *)",
      "Bash(jq *)",
      "Bash(sed *)",
      "Bash(awk *)",
      "Bash(chmod *)",
      "Bash(touch *)",
      "Bash(kill *)",
      "Bash(lsof *)",
      "Bash(pgrep *)",
      "Bash(brew *)",
      "Bash(du *)",
      "Bash(df *)",
      "Read",
      "Edit",
      "Write",
      "Glob",
      "Grep",
      "Agent",
      "WebFetch",
      "NotebookEdit",
      "mcp__*"
    ],
    "deny": []
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'settings', 'permissions', 'config'],
    category: 'claude',
  },
  {
    id: 'claude-suggested-skills',
    title: 'Useful Claude Code skills to install',
    description: 'Curated list of /slash skills that extend Claude Code — run each install command to add them',
    command: `# Commit helper — smart staging + conventional commits
claude skill install commit-work

# Code review — checks uncommitted changes
claude skill install code-review

# SEO & GEO optimization
claude skill install seo-geo

# Web design review — accessibility + visual audit
claude skill install web-design-reviewer

# Visual verification — screenshot-based testing
claude skill install visual-verification

# Brand voice enforcement
claude skill install brand-voice

# Interaction design — microinteractions + motion
claude skill install interaction-design

# Web performance — Core Web Vitals + Lighthouse
claude skill install web-perf

# Dependency updater — safe auto-updates
claude skill install dependency-updater

# Marp slides — presentation generator
claude skill install marp-slide`,
    platform: 'Claude Code',
    tags: ['claude', 'skills', 'plugins', 'install'],
    category: 'claude',
  },
  {
    id: 'claude-md-starter',
    title: 'CLAUDE.md project starter',
    description: 'Minimal CLAUDE.md template with sections Claude Code actually uses — drop this in any project root',
    command: `# CLAUDE.md

## Run
\`python3 -m http.server 8000\` from project root.

## Architecture
Single-page app: \`index.html\` shell + \`css/style.css\` + \`js/*.js\` (ES modules).

## Key conventions
- No build step, no npm dependencies
- Mutable state via \`export const state = {}\` in state.js
- No JS file over 500 lines; app.js under 50 lines
- Use \`<script type="module">\` (requires HTTP server)

## Testing
Open in browser, check console for errors.

## Do not
- Add npm/build tooling
- Create files unless strictly needed
- Modify files you haven't read first`,
    platform: 'Claude Code',
    tags: ['claude', 'config', 'project', 'template'],
    category: 'claude',
  },
  {
    id: 'claude-task-prompt',
    title: 'Structured task prompt for Claude Code',
    description: 'Copy this template when starting a complex task — forces Claude to plan before coding',
    command: `/task
## Goal
[One sentence describing the end state]

## Context
- File: [path]
- Current behavior: [what happens now]
- Desired behavior: [what should happen]

## Constraints
- Do not modify [files/patterns to preserve]
- Follow existing patterns in [reference file]
- No new dependencies

## Acceptance
- [ ] [Testable criteria 1]
- [ ] [Testable criteria 2]`,
    platform: 'Claude Code',
    tags: ['claude', 'prompt', 'workflow', 'template'],
    category: 'claude',
  },
  {
    id: 'claude-api-key-setup',
    title: 'Set up Claude with Anthropic API key',
    description: 'Configure Claude Code to use a direct Anthropic API token — the simplest auth method',
    command: `# Option 1: Environment variable (add to ~/.zshrc or ~/.bashrc)
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Option 2: Claude Code login (opens browser)
claude login

# Verify it works
claude --version
claude "say hello"`,
    platform: 'Claude Code',
    tags: ['claude', 'api', 'token', 'auth', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-aws-bedrock',
    title: 'Configure Claude Code with AWS Bedrock',
    description: 'Use Claude via AWS Bedrock instead of direct API — set credentials, region, and enable Bedrock mode',
    command: `# 1. Set AWS credentials (if not already configured)
aws configure
# Or export directly:
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"

# 2. Tell Claude Code to use Bedrock
export CLAUDE_CODE_USE_BEDROCK=1

# 3. Optionally pin a specific model
export ANTHROPIC_MODEL="us.anthropic.claude-sonnet-4-20250514-v1:0"

# 4. For cross-account access via assumed role
export AWS_ROLE_ARN="arn:aws:iam::123456789:role/BedrockAccess"

# Add these to ~/.zshrc to persist across sessions`,
    platform: 'Claude Code',
    tags: ['claude', 'aws', 'bedrock', 'credentials', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-vertex-ai',
    title: 'Configure Claude Code with Google Vertex AI',
    description: 'Use Claude via Google Cloud Vertex AI — authenticate with gcloud and set project',
    command: `# 1. Authenticate with Google Cloud
gcloud auth application-default login

# 2. Set project and region
export CLOUD_ML_REGION="us-east5"
export ANTHROPIC_VERTEX_PROJECT_ID="your-gcp-project-id"

# 3. Tell Claude Code to use Vertex
export CLAUDE_CODE_USE_VERTEX=1

# 4. Optionally pin a model
export ANTHROPIC_MODEL="claude-sonnet-4-20250514"

# Add to ~/.zshrc to persist`,
    platform: 'Claude Code',
    tags: ['claude', 'gcp', 'vertex', 'credentials', 'setup'],
    category: 'claude',
  },
  {
    id: 'claude-mcp-config',
    title: 'Add MCP servers to Claude Code',
    description: 'Configure external tool servers (Playwright, Slack, GitHub, etc.) in Claude Code settings',
    command: `// File: ~/.claude/settings.json (global)
// or: .claude/settings.json (per-project)
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    }
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'mcp', 'plugins', 'config', 'playwright'],
    category: 'claude',
  },
  {
    id: 'claude-flags',
    title: 'Useful Claude Code CLI flags',
    description: 'Flags you can pass when launching Claude Code for different workflows',
    command: `# Resume last conversation
claude --resume

# Continue most recent session (no prompt needed)
claude --continue

# Run a one-shot command (non-interactive)
claude -p "explain this error" < error.log

# Pipe output to stdout (for scripts)
claude -p "list TODOs in this repo" --output-format text

# Use a specific model
claude --model claude-sonnet-4-20250514

# Start with a system prompt
claude --system-prompt "You are a Python expert"

# Print only (no file edits, no commands)
claude -p "review this code" --allowedTools ""

# Verbose mode (see tool calls)
claude --verbose`,
    platform: 'Claude Code',
    tags: ['claude', 'cli', 'flags', 'options', 'workflow'],
    category: 'claude',
  },
  {
    id: 'claude-hooks',
    title: 'Claude Code hooks for automation',
    description: 'Run shell commands automatically before/after Claude takes actions — add to settings.json or .claude/settings.json',
    command: `{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'About to modify: $CLAUDE_FILE_PATH'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH 2>/dev/null || true"
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "say 'Claude needs your attention'"
          }
        ]
      }
    ]
  }
}`,
    platform: 'Claude Code',
    tags: ['claude', 'hooks', 'automation', 'config', 'prettier'],
    category: 'claude',
  },
  {
    id: 'claude-claudeignore',
    title: '.claudeignore for excluding files',
    description: 'Prevent Claude from reading large, sensitive, or irrelevant files — same syntax as .gitignore',
    command: `# Dependencies
node_modules/
vendor/
venv/

# Build output
dist/
build/
.next/

# Sensitive files
.env
.env.*
*.pem
credentials.json

# Large binaries
*.wasm
*.sqlite
*.db

# Logs
*.log
logs/

# IDE / OS
.DS_Store
.idea/
.vscode/`,
    platform: 'Claude Code',
    tags: ['claude', 'ignore', 'config', 'security', 'performance'],
    category: 'claude',
  },
  {
    id: 'claude-api-curl',
    title: 'Call Claude API with curl',
    description: 'Send a message to the Claude API directly from the terminal — useful for scripting and testing',
    command: `curl https://api.anthropic.com/v1/messages \\
  -H "content-type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Explain this error in one sentence"}
    ]
  }' | jq '.content[0].text'`,
    platform: 'bash',
    tags: ['claude', 'api', 'curl', 'rest', 'scripting'],
    category: 'claude',
  },
  {
    id: 'claude-memory',
    title: 'Claude Code memory files explained',
    description: 'Where Claude stores persistent memory across sessions and how to manage it',
    command: `# Claude reads these automatically every session:
# 1. Project instructions (checked into repo)
cat CLAUDE.md

# 2. User-level instructions (applies to all projects)
cat ~/.claude/CLAUDE.md

# 3. Auto-memory (Claude writes here to remember things)
ls ~/.claude/projects/*/memory/

# Tell Claude to remember something:
# "Remember: always use bun instead of npm in this project"

# Tell Claude to forget:
# "Forget the rule about using bun"

# Manually edit memory files:
code ~/.claude/projects/*/memory/MEMORY.md`,
    platform: 'Claude Code',
    tags: ['claude', 'memory', 'context', 'persistence', 'config'],
    category: 'claude',
  },
  {
    id: 'claude-custom-slash',
    title: 'Create a custom slash command',
    description: 'Add reusable commands to .claude/commands/ that show up as /project:command-name in Claude Code',
    command: `# Create the commands directory
mkdir -p .claude/commands

# Create a command file (markdown with a prompt)
cat > .claude/commands/deploy-check.md << 'EOF'
Run a pre-deploy checklist:

1. Check for uncommitted changes
2. Run the test suite
3. Verify no TODO or FIXME in staged files
4. Check that .env.example matches .env keys
5. Report any issues found
EOF

# Now use it in Claude Code:
# /project:deploy-check`,
    platform: 'Claude Code',
    tags: ['claude', 'commands', 'slash', 'custom', 'workflow'],
    category: 'claude',
  },
];
