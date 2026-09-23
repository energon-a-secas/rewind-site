// ── Git ─────────────────────────────────────────────

export const git = [
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
  {
    id: 'git-amend-author',
    title: 'Fix the author on the last commit',
    description: 'You committed with the wrong name or email — re-stamp the commit you just made',
    command: `# Set an explicit author on the last commit
git commit --amend --author="Luciano Adonis <luciano@example.com>" --no-edit

# Or fix the repo identity first, then re-stamp from config
git config user.name "Luciano Adonis"
git config user.email "luciano@example.com"
git commit --amend --reset-author --no-edit

# Confirm it took
git log -1 --format='%an <%ae>  |  committer: %cn <%ce>'`,
    platform: 'bash',
    tags: ['git', 'amend', 'author', 'identity', 'commit', 'fix'],
    category: 'git',
  },
  {
    id: 'git-amend-author-history',
    title: 'Rewrite author and email across all commits',
    description: 'Work email leaked into a personal repo (or the reverse) — rewrite every matching commit',
    command: `# --- Preferred: git-filter-repo (brew install git-filter-repo) ---
# Run on a fresh clone. Create mailmap.txt with one line per identity:
#   Correct Name <correct@email>  <wrong@email>
git filter-repo --mailmap mailmap.txt

# --- Built-in fallback, no extra tooling ---
git filter-branch --env-filter '
OLD_EMAIL="wrong@example.com"
NEW_NAME="Luciano Adonis"
NEW_EMAIL="luciano@example.com"
if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]; then
  export GIT_COMMITTER_NAME="$NEW_NAME"
  export GIT_COMMITTER_EMAIL="$NEW_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]; then
  export GIT_AUTHOR_NAME="$NEW_NAME"
  export GIT_AUTHOR_EMAIL="$NEW_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

# Every hash changed. Collaborators must re-clone, not pull.
git push --force-with-lease --all
git push --force-with-lease --tags`,
    platform: 'bash',
    tags: ['git', 'author', 'identity', 'history', 'rewrite', 'filter-repo', 'fix'],
    category: 'git',
  },
  {
    id: 'git-author-audit',
    title: 'Check which identities are in your history',
    description: 'Run this before pushing a personal repo — catches commits made with the wrong email',
    command: `# Every distinct author in this repo
git log --format='%an <%ae>' | sort -u

# Every commit that is NOT yours
git log --format='%h %an <%ae> %s' | grep -v 'luciano@example.com'

# Authors with commit counts
git shortlog -sne

# Committer differs from author (usually a rebase or a cherry-pick)
git log --format='%h  A:%ae  C:%ce' | awk '$2 != $3'`,
    platform: 'bash',
    tags: ['git', 'author', 'identity', 'audit', 'history'],
    category: 'git',
  },
  {
    id: 'git-fix-commit-message',
    title: 'Change a commit message',
    description: 'Reword the last commit, or any older one, then push safely',
    command: `# Last commit
git commit --amend -m "feat(api): pagination on /items"

# Last commit, open the editor instead
git commit --amend

# An older commit — mark it 'reword' in the todo list
git rebase -i HEAD~5

# Already pushed? force-with-lease refuses if someone else pushed meanwhile
git push --force-with-lease`,
    platform: 'bash',
    tags: ['git', 'commit', 'amend', 'message', 'rebase', 'fix'],
    category: 'git',
  },
  {
    id: 'git-wrong-branch',
    title: 'Move commits made on the wrong branch',
    description: 'You committed to main instead of a feature branch — rescue the work without losing it',
    command: `# Not pushed yet: bookmark the commits, then rewind main
git branch feature/my-work        # feature/my-work now points at your commits
git reset --hard origin/main      # main back to where the remote is
git switch feature/my-work        # your work is safe here

# Keep the changes as uncommitted edits instead
git reset --soft HEAD~3

# Already pushed to a shared main? Do not rewrite — revert forward
git revert --no-commit HEAD~3..HEAD
git commit -m "revert: move work to feature branch"`,
    platform: 'bash',
    tags: ['git', 'branches', 'reset', 'undo', 'fix', 'rescue'],
    category: 'git',
  },
  {
    id: 'git-reflog-recover',
    title: 'Recover a lost commit or branch',
    description: 'Git almost never really deletes anything — reflog is the undo history for HEAD',
    command: `# Every position HEAD has been in (kept ~90 days)
git reflog

# Recreate a branch at a commit you thought you lost
git switch -c rescue abc1234

# Undo a bad reset, rebase or merge
git reset --hard HEAD@{2}

# Reflog for one specific branch
git reflog show feature/my-work

# Commits with no reflog entry at all (last resort)
git fsck --lost-found`,
    platform: 'bash',
    tags: ['git', 'reflog', 'recover', 'undo', 'rescue', 'history'],
    category: 'git',
  },
  {
    id: 'git-untrack-file',
    title: 'Stop tracking a file you already committed',
    description: 'Added .env or node_modules by accident — untrack it without deleting it from disk',
    command: `echo ".env" >> .gitignore
git rm --cached .env                  # untrack, keep the file on disk
git rm -r --cached node_modules
git commit -m "chore: stop tracking local env file"

# Which tracked files SHOULD be ignored?
git ls-files -i -c --exclude-standard

# Purge it from all history too (secrets already pushed)
git filter-repo --path .env --invert-paths
# ...then rotate the secret. It is in every existing clone.`,
    platform: 'bash',
    tags: ['git', 'gitignore', 'untrack', 'secrets', 'cleanup', 'fix'],
    category: 'git',
  },
  {
    id: 'git-undo-pushed',
    title: 'Undo a commit that is already pushed',
    description: 'Shared branch vs your own branch — two different answers, do not mix them up',
    command: `# Shared branch: never rewrite. Add an inverse commit.
git revert abc1234
git revert -m 1 MERGE_SHA             # reverting a merge picks a parent

# Revert a range without one commit per revert
git revert --no-commit abc1234..def5678
git commit -m "revert: roll back the pagination change"

# Your own branch, nobody else pulled it: rewind and force safely
git reset --hard HEAD~1
git push --force-with-lease`,
    platform: 'bash',
    tags: ['git', 'revert', 'undo', 'push', 'fix'],
    category: 'git',
  },
  {
    id: 'git-prune-remote',
    title: 'Clean up branches deleted on the remote',
    description: 'Your local list still shows branches that were merged and deleted months ago',
    command: `git fetch --prune

# Delete local branches whose remote is gone
git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -D

# See what would go first
git branch -vv | grep ': gone]'

# Prune remote-tracking refs only
git remote prune origin --dry-run`,
    platform: 'bash',
    tags: ['git', 'branches', 'cleanup', 'prune', 'remote'],
    category: 'git',
  },
  {
    id: 'git-worktree',
    title: 'Work on two branches at once (worktrees)',
    description: 'Review a PR or fix a hotfix without stashing what you are in the middle of',
    command: `# Check out an existing branch into a sibling folder
git worktree add ../myrepo-hotfix hotfix/urgent

# New branch from origin/main, in its own folder
git worktree add -b review/pr-42 ../myrepo-pr42 origin/main

git worktree list
git worktree remove ../myrepo-hotfix
git worktree prune                    # clean up folders you deleted by hand`,
    platform: 'bash',
    tags: ['git', 'worktree', 'branches', 'workflow'],
    category: 'git',
  },
  {
    id: 'git-restore-file',
    title: 'Restore one file from another branch or commit',
    description: 'Pull a single file back without merging or checking out the whole branch',
    command: `git restore --source=main -- path/to/file.ts
git restore --source=HEAD~3 -- src/config.json

# Discard your local edits to one file
git restore path/to/file.ts

# Older syntax, same effect
git checkout main -- path/to/file.ts

# Just look at it without touching your tree
git show main:path/to/file.ts | less`,
    platform: 'bash',
    tags: ['git', 'restore', 'checkout', 'undo', 'files'],
    category: 'git',
  },
  {
    id: 'git-change-remote',
    title: 'Change the remote URL (HTTPS to SSH)',
    description: 'Switch how you authenticate, or repoint a repo after a rename or transfer',
    command: `git remote -v
git remote set-url origin git@github.com:user/repo.git
git remote set-url origin https://github.com/user/repo.git

# Track the original repo you forked from
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git remote rename origin old-origin`,
    platform: 'bash',
    tags: ['git', 'remote', 'ssh', 'config', 'github'],
    category: 'git',
  },
  {
    id: 'git-rename-branch',
    title: 'Rename a branch locally and on the remote',
    description: 'Renaming locally is one command; the remote needs the delete-and-push dance',
    command: `git branch -m new-name                # rename the branch you are on
git branch -m old-name new-name       # rename another branch

# Push the new one and delete the old one on the remote
git push origin -u new-name
git push origin --delete old-name

# One-shot version
git push origin :old-name new-name`,
    platform: 'bash',
    tags: ['git', 'branches', 'rename', 'remote'],
    category: 'git',
  },
  {
    id: 'git-clean-untracked',
    title: 'Delete untracked files safely',
    description: 'git clean is irreversible — the dry run is not optional',
    command: `git clean -nd            # DRY RUN. Always run this first.
git clean -fd            # delete untracked files and directories
git clean -fdx           # also delete ignored files (node_modules, .env, dist)
git clean -fdi           # interactive, pick what goes

# Only inside one folder
git clean -nd -- src/`,
    platform: 'bash',
    tags: ['git', 'clean', 'cleanup', 'untracked', 'files'],
    category: 'git',
  },
  {
    id: 'git-interactive-rebase',
    title: 'Interactive rebase decoder',
    description: 'What each keyword in the rebase todo list actually does, and how to get unstuck',
    command: `git rebase -i HEAD~5          # last 5 commits
git rebase -i abc1234         # everything AFTER this commit

#  pick    keep the commit as is
#  reword  keep the changes, edit the message
#  edit    stop here so you can amend or split it
#  squash  fold into the previous commit, combine both messages
#  fixup   fold into the previous commit, throw this message away
#  drop    delete the commit entirely
#  (reordering the lines reorders the commits)

git rebase --continue        # after resolving / amending
git rebase --skip            # drop the commit being applied
git rebase --abort           # put everything back the way it was`,
    platform: 'bash',
    tags: ['git', 'rebase', 'squash', 'history', 'reference'],
    category: 'git',
  },
  {
    id: 'git-fixup-autosquash',
    title: 'Fix an earlier commit without a manual rebase',
    description: 'Mark a follow-up as belonging to an older commit and let git fold it in for you',
    command: `# Stage the fix, then attach it to the commit it belongs to
git add -p
git commit --fixup=abc1234

# Fold every fixup into its target automatically
git rebase -i --autosquash abc1234~1

# Same idea but lets you edit the combined message
git commit --squash=abc1234

# Make --autosquash the default
git config --global rebase.autosquash true`,
    platform: 'bash',
    tags: ['git', 'rebase', 'fixup', 'squash', 'commit', 'workflow'],
    category: 'git',
  },
  {
    id: 'git-diff-staged',
    title: 'See exactly what you are about to commit',
    description: 'The difference between git diff and git diff --staged, and staging hunk by hunk',
    command: `git diff                 # edits you have NOT staged
git diff --staged        # exactly what the next commit will contain
git diff HEAD            # both combined

# Summary against the point you branched off main
git diff --stat main...

# Stage interactively, one hunk at a time
git add -p

# Which files changed, without the noise
git diff --name-status main...`,
    platform: 'bash',
    tags: ['git', 'diff', 'staging', 'commit', 'review'],
    category: 'git',
  },
  {
    id: 'git-large-files-history',
    title: 'Find the big files bloating your repo',
    description: 'Clone taking forever? These are the blobs still sitting in your history',
    command: `git rev-list --objects --all |
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' |
  awk '/^blob/ {print $3, $4}' | sort -rn | head -20 |
  numfmt --to=iec --field=1

# Repo size on disk, human readable
git count-objects -vH

# Remove one offender from all history, then force-push
git filter-repo --path path/to/huge.zip --invert-paths`,
    platform: 'bash',
    tags: ['git', 'size', 'cleanup', 'history', 'performance'],
    category: 'git',
  },
  {
    id: 'git-apply-patch',
    title: 'Create and apply patches',
    description: 'Move changes between clones or machines without a remote',
    command: `# One .patch file per commit, with author and message preserved
git format-patch -1 HEAD
git format-patch main..feature -o /tmp/patches

# Apply them as real commits
git am /tmp/patches/*.patch

# Plain diff, no commit metadata
git diff > changes.patch
git apply changes.patch

# Check whether it will apply cleanly first
git apply --check changes.patch
git apply -3 changes.patch      # fall back to a 3-way merge on conflict`,
    platform: 'bash',
    tags: ['git', 'patch', 'diff', 'transfer', 'workflow'],
    category: 'git',
  },
  {
    id: 'git-sign-commits',
    title: 'Sign commits with your SSH key',
    description: 'Get the Verified badge on GitHub without touching GPG',
    command: `git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true

git commit -S -m "feat: signed commit"
git log --show-signature -1

# Different thing: a Signed-off-by trailer (DCO), no cryptography involved
git commit -s -m "fix: handle empty payload"`,
    platform: 'bash',
    tags: ['git', 'security', 'ssh', 'signing', 'github', 'setup'],
    category: 'git',
  },
];
