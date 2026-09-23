// ── Reference ────────────────────────────────────────────────
// Cheat sheets rather than runnable one-liners: the syntax you look
// up once a month and never quite memorise.

export const ref = [
  {
    id: 'ref-chmod',
    title: 'chmod and permission bits',
    description: 'What 644 and 755 actually mean, and the permissions ssh insists on',
    command: `chmod 644 file.txt              rw- r-- r--   normal file
chmod 755 script.sh            rwx r-x r-x   executable, and every directory
chmod 600 ~/.ssh/id_ed25519    rw- --- ---   private key (ssh refuses anything looser)
chmod 700 ~/.ssh               rwx --- ---

#  4 read    2 write    1 execute        digits are owner, group, other
#  7 rwx   6 rw-   5 r-x   4 r--   0 ---

chmod +x script.sh                     # make executable, keep the rest
chmod -R u+rwX,go+rX,go-w dir/         # capital X = execute on directories only
chmod --reference=good.txt bad.txt     # copy another file's mode (GNU)

chown user:group file
chown -R "$(whoami)" dir/
umask 022                              # default: files 644, dirs 755`,
    platform: 'bash',
    tags: ['reference', 'chmod', 'permissions', 'security', 'files'],
    category: 'ref',
  },
  {
    id: 'ref-regex',
    title: 'Regex cheat sheet',
    description: 'The metacharacters, plus which ones BSD grep on macOS does not support',
    command: String.raw`.         any single character
*         0 or more of the previous       +  1 or more       ?  0 or 1
{2,5}     between 2 and 5 times
[abc]     any one of these                [^abc]  none of these
[a-z0-9]  ranges
^  $      start / end of line
(a|b)     alternation
(...)     capture group, reuse as \1      (?:...)  group without capturing
(?=...)   lookahead                       (?!...)  negative lookahead

\d \w \s  digit / word char / whitespace   -- PCRE only
\D \W \S  the negated versions
\b        word boundary

# BSD grep (macOS) has no \d. Use POSIX classes, or grep -E, or ripgrep:
[0-9]  [A-Za-z0-9_]  [[:space:]]  [[:alpha:]]  [[:digit:]]

# + ? | ( ) need -E in grep, or backslashes without it
echo "order-1234" | grep -E '^order-[0-9]{4}$'
rg -o '\b[A-Z]{2,}\b' notes.txt
sed -E 's/([0-9]{4})-([0-9]{2})/\2-\1/' dates.txt`,
    platform: 'any',
    tags: ['reference', 'regex', 'grep', 'sed', 'text', 'search'],
    category: 'ref',
  },
  {
    id: 'ref-http-status',
    title: 'HTTP status codes that matter',
    description: 'Including the pairs everyone mixes up: 401 vs 403, and 502 vs 504',
    command: `200 OK                      201 Created            204 No Content
206 Partial Content         304 Not Modified

301 Moved Permanently       302 Found (temporary)
307 / 308                   same as 302 / 301 but the method is preserved

400 Bad Request             401 Unauthorized       403 Forbidden
404 Not Found               405 Method Not Allowed 409 Conflict
410 Gone                    413 Payload Too Large  415 Unsupported Media Type
422 Unprocessable Entity    429 Too Many Requests

500 Internal Server Error   501 Not Implemented
502 Bad Gateway             503 Service Unavailable
504 Gateway Timeout

# 401 vs 403 — 401 is "I do not know who you are" (send credentials),
#              403 is "I know who you are, and no" (do not retry with auth)
# 502 vs 504 — 502 the upstream answered with garbage,
#              504 the upstream did not answer in time
# 429        — read the Retry-After header before retrying`,
    platform: 'any',
    tags: ['reference', 'http', 'api', 'status', 'debug'],
    category: 'ref',
  },
  {
    id: 'ref-tar',
    title: 'tar flags decoded',
    description: 'The flags nobody remembers, and why f always comes last',
    command: `tar -czf out.tar.gz dir/       create
tar -xzf out.tar.gz            extract
tar -tzf out.tar.gz            list, extract nothing

#  c create    x extract    t list (table of contents)
#  z gzip .tar.gz    j bzip2 .tar.bz2    J xz .tar.xz
#  f FILE  — must be the LAST flag, immediately before the filename
#  v verbose    C DIR  change into DIR first    -p keep permissions

tar -xzf archive.tar.gz -C /tmp/out              # extract somewhere else
tar -xzf archive.tar.gz path/inside/one.txt      # just one file
tar --exclude='.git' --exclude='node_modules' -czf src.tar.gz .

# Modern tar detects the compression, so -z/-j/-J are optional on extract
tar -xf whatever.tar.xz

# Mnemonic: eXtract Ze File / Create Ze File`,
    platform: 'bash',
    tags: ['reference', 'tar', 'archive', 'compress', 'files'],
    category: 'ref',
  },
  {
    id: 'ref-vim',
    title: 'Vim survival kit',
    description: 'Enough to escape, edit and save when git drops you into an editor',
    command: `Esc        back to normal mode — do this first when confused
:w         save            :q    quit          :wq  or  ZZ   save and quit
:q!        quit, discard everything            :x   save only if changed
:e!        reload from disk, discard changes

i  a  o    insert before cursor / after cursor / new line below
dd  yy  p  delete line / copy line / paste
u   Ctrl-r undo / redo
x   D      delete character / to end of line

/text      search forward    ?text  backward    n / N  next / previous
:%s/old/new/g      replace in the whole file
:%s/old/new/gc     ...asking for confirmation each time

gg  G      top of file / bottom of file        :42  jump to line 42
0   $      start / end of line                 w  b   next / previous word
Ctrl-v     visual block, then I to type on every selected line

:set number      :set paste      :noh      (clear search highlight)`,
    platform: 'any',
    tags: ['reference', 'vim', 'editor', 'git'],
    category: 'ref',
  },
  {
    id: 'ref-tmux',
    title: 'tmux survival kit',
    description: 'Sessions that survive a dropped SSH connection, and the prefix keys',
    command: `tmux new -s work           start a named session
tmux ls                    list sessions
tmux attach -t work        reattach after disconnecting
tmux kill-session -t work

# Everything below is prefixed with Ctrl-b (release, then press the key)
Ctrl-b d      detach, leave everything running
Ctrl-b c      new window          Ctrl-b n / p   next / previous window
Ctrl-b ,      rename window       Ctrl-b 0-9     jump to a window
Ctrl-b w      window picker

Ctrl-b %      split left/right    Ctrl-b "       split top/bottom
Ctrl-b arrow  move between panes  Ctrl-b z       zoom this pane in/out
Ctrl-b x      kill this pane      Ctrl-b [       scroll mode (q to exit)
Ctrl-b space  cycle pane layouts

tmux new -s deploy -d 'npm run build'    start detached, running a command`,
    platform: 'bash',
    tags: ['reference', 'tmux', 'ssh', 'terminal', 'workflow'],
    category: 'ref',
  },
  {
    id: 'ref-bash-params',
    title: 'Bash parameter expansion',
    description: 'Defaults, substrings and the string surgery that saves calling sed',
    command: `\${VAR:-default}     use default if VAR is unset or empty
\${VAR:=default}     ...and assign it back to VAR
\${VAR:?message}     abort with an error message if unset
\${VAR:+alt}         use alt ONLY if VAR is set

\${#VAR}             length
\${VAR:2:5}          substring: from index 2, 5 characters

\${VAR%.txt}         strip shortest match from the END      file.txt -> file
\${VAR%%.*}          strip longest match from the end       a.b.c    -> a
\${VAR#*/}           strip shortest match from the START
\${VAR##*/}          basename: strip everything up to the last slash
\${VAR%/*}           dirname

\${VAR/old/new}      replace the first occurrence
\${VAR//old/new}     replace every occurrence
\${VAR^^}  \${VAR,,}  uppercase / lowercase (bash 4+)

$0 $1 $@ $#         script name, first arg, all args, arg count
$?                  exit status of the last command
$$   $!             PID of this shell / of the last background job`,
    platform: 'bash',
    tags: ['reference', 'bash', 'shell', 'scripting', 'text'],
    category: 'ref',
  },
  {
    id: 'ref-signals',
    title: 'Kill signals and exit codes',
    description: 'Why -9 should be the last resort, and what exit code 137 is telling you',
    command: `kill -TERM PID    15   polite "please shut down" — the default
kill -INT  PID     2   what Ctrl-C sends
kill -HUP  PID     1   reload config without restarting
kill -QUIT PID     3   quit and dump core
kill -KILL PID     9   unblockable, no cleanup, no flush — last resort
kill -STOP PID    19   freeze          kill -CONT PID  18   resume

kill -l                        # every signal on this system
pkill -HUP nginx
pkill -f "node.*worker"
killall -9 "Google Chrome"

# Exit codes
0    success
1    general error            2    misuse of a shell builtin
126  found but not executable 127  command not found
130  Ctrl-C        (128 + 2 SIGINT)
137  killed        (128 + 9 SIGKILL) — in a container this is almost always OOM
143  terminated    (128 + 15 SIGTERM)`,
    platform: 'bash',
    tags: ['reference', 'kill', 'signals', 'process', 'debug', 'exit-codes'],
    category: 'ref',
  },
  {
    id: 'ref-find',
    title: 'find recipes decoded',
    description: 'Predicates worth memorising, and why -exec {} + beats -exec {} \\;',
    command: String.raw`find . -name "*.log"           by name, case sensitive
find . -iname "*.LOG"          case insensitive
find . -type f                 files only        -type d  directories only
find . -mtime -7               modified in the last 7 days
find . -mmin -30               modified in the last 30 minutes
find . -size +100M             larger than 100MB
find . -empty                  empty files and directories
find . -maxdepth 2             do not recurse forever
find . -newer reference.txt    changed more recently than this file

# Skip a directory entirely (much faster than filtering afterwards)
find . -path "*/node_modules" -prune -o -name "*.ts" -print

find . -name "*.tmp" -delete
find . -name "*.js" -exec grep -l "TODO" {} +     # + batches args, one process
find . -name "*.js" -exec chmod 644 {} \;         # \; runs once per file, slow

# Filenames with spaces or newlines
find . -type f -print0 | xargs -0 grep -l "TODO"`,
    platform: 'bash',
    tags: ['reference', 'find', 'files', 'search', 'bash'],
    category: 'ref',
  },
  {
    id: 'ref-date-format',
    title: 'date formatting and arithmetic',
    description: 'ISO timestamps, epoch conversion, and the macOS vs GNU differences',
    command: `date                                  # now, local time
date -u +"%Y-%m-%dT%H:%M:%SZ"         # UTC ISO 8601 — usually the one you want
date +%s                              # unix epoch seconds
date +%F                              # 2026-08-03

#  %Y 2026   %m 08   %d 03      %H 14  %M 05  %S 09
#  %y 26     %b Aug  %B August  %a Mon %A Monday
#  %F = %Y-%m-%d     %T = %H:%M:%S     %j day of year   %z +0000

# Epoch to human — the flag differs by platform
date -r 1735689600                    # macOS / BSD
date -d @1735689600                   # GNU / Linux

# Date arithmetic
date -v-7d +%F                        # macOS: 7 days ago
date -d "7 days ago" +%F              # GNU: 7 days ago
date -v+1m -v1d +%F                   # macOS: first day of next month

TZ=America/Santiago date              # in another timezone`,
    platform: 'bash',
    tags: ['reference', 'date', 'timestamps', 'epoch', 'format'],
    category: 'ref',
  },
  {
    id: 'ref-curl-flags',
    title: 'curl flags decoded',
    description: 'Every flag you reach for, including the ones that make curl scriptable',
    command: String.raw`-X POST              method
-H "Header: value"   add a header (repeatable)
-d '{"a":1}'         request body (implies POST)
-d @body.json        body from a file
--data-urlencode     form-encode a value
-F file=@photo.png   multipart upload

-o out.zip           save to this filename      -O   keep the remote filename
-L                   follow redirects
-I                   headers only (HEAD)        -i   headers AND body
-s                   silent                     -S   but still print errors
-f                   exit non-zero on HTTP >= 400  <- use this in scripts
-k                   skip TLS verification (debugging only, never in prod)
-u user:pass         basic auth
--max-time 10        total timeout   --connect-timeout 3   connect only
-C -                 resume a partial download
-w "%{http_code}"    print a response variable
-v                   full request/response trace

# The combination worth memorising for scripts
curl -sSfL https://api.example.com/health -w "\n%{http_code} in %{time_total}s\n"`,
    platform: 'any',
    tags: ['reference', 'curl', 'http', 'api', 'debug'],
    category: 'ref',
  },
  {
    id: 'ref-semver',
    title: 'Semantic versioning and range syntax',
    description: 'What ^ and ~ actually allow, and the 0.x rule that surprises people',
    command: `1.2.3          MAJOR . MINOR . PATCH
               MAJOR  breaking change
               MINOR  new feature, backwards compatible
               PATCH  bug fix, backwards compatible

1.2.3-beta.1   pre-release — sorts BEFORE 1.2.3
1.2.3+build.5  build metadata — ignored when comparing versions

# npm / node ranges
^1.2.3    >=1.2.3 <2.0.0     minor + patch    (npm's default when you install)
~1.2.3    >=1.2.3 <1.3.0     patch only
1.2.x     >=1.2.0 <1.3.0
>=1.2.3 <2                   explicit range
*                            anything

# The 0.x exception: pre-1.0, minor bumps ARE allowed to break.
# ^0.2.3 means >=0.2.3 <0.3.0, not <1.0.0.

# Python / pip
~=1.2.3   >=1.2.3 <1.3.0     "compatible release"
==1.2.*   any patch of 1.2
>=1.2,<2`,
    platform: 'any',
    tags: ['reference', 'semver', 'version', 'npm', 'dependencies'],
    category: 'ref',
  },
  {
    id: 'ref-glob',
    title: 'Glob patterns (and how .gitignore differs)',
    description: 'Shell globs are not regex — and gitignore is not quite a shell glob either',
    command: `*         any run of characters, but never crosses a /
?         exactly one character
[abc]     one of these        [^abc] / [!abc]   none of these
[a-z]     a range
{a,b}     brace expansion — a bash feature, not part of globbing
**        any depth  (bash needs: shopt -s globstar; zsh has it by default)

ls *.txt
ls **/*.ts                        # every .ts at any depth
cp notes.{txt,bak}                # expands to two arguments
mkdir -p src/{api,web}/{js,css}

shopt -s nullglob                 # an unmatched glob vanishes instead of staying literal
shopt -s dotglob                  # * also matches dotfiles

# .gitignore looks similar but has its own rules
build/            directory only
/root-only.txt    only at the repo root
**/tmp            at any depth
!keep.txt         negate a previous rule
# Trailing spaces matter; a leading ! must be escaped as \\! to match a literal one`,
    platform: 'bash',
    tags: ['reference', 'glob', 'bash', 'gitignore', 'files'],
    category: 'ref',
  },
];
