// ── Shell / Bash ─────────────────────────────────────────────

export const shell = [
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
];
