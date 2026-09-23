// ── Config / Setup ─────────────────────────────────────────────

export const config = [
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
  {
    id: 'python-venv',
    title: 'Create and activate a Python virtualenv',
    description: 'The per-project isolation that stops pip installs from fighting each other',
    command: String.raw`python3 -m venv .venv
source .venv/bin/activate          # macOS / Linux
.\.venv\Scripts\Activate.ps1       # Windows PowerShell

pip install -r requirements.txt
deactivate

# Which python am I actually running?
which python && python -V

# Start over
rm -rf .venv && python3 -m venv .venv

echo ".venv/" >> .gitignore`,
    platform: 'bash',
    tags: ['python', 'venv', 'setup', 'config', 'install'],
    category: 'config',
  },
  {
    id: 'uv-quickstart',
    title: 'Python projects with uv',
    description: 'Drop-in replacement for pip/venv/pyenv that resolves in milliseconds',
    command: `curl -LsSf https://astral.sh/uv/install.sh | sh

uv init myproject && cd myproject
uv add requests pandas
uv add --dev pytest ruff
uv run python main.py
uv run pytest

uv sync                     # install exactly what uv.lock pins
uv python install 3.12      # manage interpreters too
uv pip install -r requirements.txt   # pip-compatible mode

# One-off tool without installing it into the project
uvx ruff check .`,
    platform: 'bash',
    tags: ['python', 'uv', 'setup', 'config', 'install', 'dependencies'],
    category: 'config',
  },
  {
    id: 'python-pip-freeze',
    title: 'Pin and restore Python dependencies',
    description: 'Freeze what you actually depend on, not every transitive package',
    command: `pip freeze > requirements.txt
pip install -r requirements.txt

# Only the packages you asked for, not their dependencies
pip install pipreqs && pipreqs . --force

# What depends on what
pip install pipdeptree && pipdeptree

pip list --outdated
pip install --upgrade package-name

# Wipe every installed package in the current env
pip freeze | xargs pip uninstall -y`,
    platform: 'bash',
    tags: ['python', 'pip', 'dependencies', 'setup', 'config'],
    category: 'config',
  },
  {
    id: 'node-nvm',
    title: 'Install and switch Node versions',
    description: 'Per-project Node versions with nvm, plus the .nvmrc that makes it automatic',
    command: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

nvm install --lts
nvm install 20
nvm use 20
nvm alias default 20
nvm ls

# Pin the version for a project
node -v > .nvmrc
nvm use            # reads .nvmrc

# Move your global packages to a new version
nvm install 22 --reinstall-packages-from=20`,
    platform: 'bash',
    tags: ['node', 'nvm', 'nodejs', 'version', 'setup', 'config'],
    category: 'config',
  },
  {
    id: 'node-clean-reinstall',
    title: 'Nuke node_modules properly',
    description: 'The full reset for when a dependency problem makes no sense',
    command: `rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# pnpm / yarn
rm -rf node_modules pnpm-lock.yaml && pnpm install
rm -rf node_modules yarn.lock && yarn install

# Reproduce CI exactly — respects the lockfile, fails if it is out of date
npm ci

# Find every node_modules eating your disk
find ~ -name "node_modules" -type d -prune -exec du -sh {} + | sort -rh | head`,
    platform: 'bash',
    tags: ['node', 'npm', 'cleanup', 'dependencies', 'troubleshooting'],
    category: 'config',
  },
  {
    id: 'npm-global-list',
    title: 'See and clean up global npm packages',
    description: 'The tools you installed globally two years ago and forgot about',
    command: `npm ls -g --depth=0
npm outdated -g
npm update -g
npm uninstall -g package-name

# Where do globals live?
npm root -g
npm config get prefix

# Same for pnpm / yarn
pnpm ls -g --depth 0
yarn global list`,
    platform: 'bash',
    tags: ['node', 'npm', 'cleanup', 'setup', 'config'],
    category: 'config',
  },
  {
    id: 'ssh-copy-id',
    title: 'Set up passwordless SSH login',
    description: 'Push your public key to a server so it stops asking for a password',
    command: `ssh-copy-id user@server.example.com
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.example.com

# No ssh-copy-id available (macOS without brew, or a restricted host)
cat ~/.ssh/id_ed25519.pub | ssh user@server 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys'

# Permissions the server insists on, or it silently refuses the key
ssh user@server 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys'

# Why is it still asking? This tells you exactly which key was offered
ssh -v user@server 2>&1 | grep -i "offering\\|authentications"`,
    platform: 'bash',
    tags: ['ssh', 'keys', 'setup', 'config', 'security'],
    category: 'config',
  },
  {
    id: 'ssh-proxyjump',
    title: 'Reach a server through a bastion host',
    description: 'ProxyJump handles the hop for you — no nested ssh commands, and scp works too',
    command: `# ~/.ssh/config
Host bastion
  HostName bastion.example.com
  User ops
  IdentityFile ~/.ssh/id_ed25519

Host app-prod
  HostName 10.0.4.17
  User deploy
  ProxyJump bastion

# Now this transparently hops through the bastion
ssh app-prod
scp report.csv app-prod:/tmp/
rsync -avz ./dist/ app-prod:/srv/app/

# One-off, without editing the config
ssh -J ops@bastion.example.com deploy@10.0.4.17`,
    platform: 'bash',
    tags: ['ssh', 'bastion', 'proxyjump', 'config', 'setup', 'networking'],
    category: 'config',
  },
];
