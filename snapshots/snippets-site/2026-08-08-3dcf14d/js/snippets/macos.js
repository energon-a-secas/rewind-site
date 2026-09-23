// ── macOS ─────────────────────────────────────────────

export const macos = [
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
  {
    id: 'macos-quarantine',
    title: 'Fix "app is damaged and cannot be opened"',
    description: 'Removes the quarantine flag macOS puts on anything downloaded outside the App Store',
    command: `xattr -dr com.apple.quarantine /Applications/SomeApp.app

# See what attributes a file carries
xattr -l /Applications/SomeApp.app

# Strip every extended attribute from a downloaded script
xattr -c ~/Downloads/install.sh

# Allow it explicitly in Gatekeeper instead
sudo spctl --add /Applications/SomeApp.app`,
    platform: 'macOS',
    tags: ['macos', 'gatekeeper', 'quarantine', 'security', 'troubleshooting'],
    category: 'macos',
  },
  {
    id: 'macos-caffeinate',
    title: 'Stop the Mac sleeping during a long job',
    description: 'Keeps the machine awake only for as long as the command runs',
    command: `caffeinate -i make build            # awake until the command finishes
caffeinate -d                       # keep the DISPLAY awake until Ctrl-C
caffeinate -t 3600                  # awake for one hour
caffeinate -w 12345                 # awake until PID 12345 exits

# Keep it awake while an existing job runs
caffeinate -w $(pgrep -f "long-running-job")`,
    platform: 'macOS',
    tags: ['macos', 'sleep', 'power', 'automation'],
    category: 'macos',
  },
  {
    id: 'macos-mdfind',
    title: 'Search your Mac from the terminal (Spotlight)',
    description: 'mdfind queries the same index Spotlight uses, but pipeable',
    command: `mdfind "quarterly report"
mdfind -name budget.xlsx
mdfind -onlyin ~/Projects "TODO"
mdfind -count -onlyin ~/Downloads "kind:pdf"

# Everything Spotlight knows about one file
mdls ~/Downloads/report.pdf

# Search is returning nothing? Rebuild the index
sudo mdutil -E /`,
    platform: 'macOS',
    tags: ['macos', 'spotlight', 'search', 'files'],
    category: 'macos',
  },
  {
    id: 'macos-screenshot-defaults',
    title: 'Change where screenshots go and what format',
    description: 'Stop screenshots piling up on the Desktop, and drop the giant drop shadow',
    command: `mkdir -p ~/Pictures/Screenshots
defaults write com.apple.screencapture location ~/Pictures/Screenshots
defaults write com.apple.screencapture type jpg          # png | jpg | pdf | heic
defaults write com.apple.screencapture disable-shadow -bool true
defaults write com.apple.screencapture name "shot"
defaults write com.apple.screencapture include-date -bool true
killall SystemUIServer

# Undo any of them
defaults delete com.apple.screencapture disable-shadow`,
    platform: 'macOS',
    tags: ['macos', 'screenshot', 'defaults', 'config'],
    category: 'macos',
  },
  {
    id: 'macos-dock-defaults',
    title: 'Make the Dock instant',
    description: 'Removes the autohide animation delay — the single best macOS tweak',
    command: `defaults write com.apple.dock autohide-delay -float 0
defaults write com.apple.dock autohide-time-modifier -float 0.15
defaults write com.apple.dock show-recents -bool false
defaults write com.apple.dock tilesize -int 42
defaults write com.apple.dock mineffect -string "scale"
killall Dock

# Put it all back
defaults delete com.apple.dock autohide-delay
defaults delete com.apple.dock autohide-time-modifier
killall Dock`,
    platform: 'macOS',
    tags: ['macos', 'dock', 'defaults', 'config', 'performance'],
    category: 'macos',
  },
  {
    id: 'macos-keyboard-repeat',
    title: 'Fast key repeat for terminal and vim',
    description: 'Faster than the System Settings slider allows, plus disabling the accent popup',
    command: `defaults write -g KeyRepeat -int 2              # lower is faster (default 6)
defaults write -g InitialKeyRepeat -int 15     # delay before repeat starts
defaults write -g ApplePressAndHoldEnabled -bool false   # hold key = repeat, not accents
defaults write -g NSAutomaticCapitalizationEnabled -bool false
defaults write -g NSAutomaticDashSubstitutionEnabled -bool false

# Log out and back in to apply`,
    platform: 'macOS',
    tags: ['macos', 'keyboard', 'defaults', 'config', 'vim'],
    category: 'macos',
  },
  {
    id: 'macos-wifi-info',
    title: 'Wi-Fi details and signal from the terminal',
    description: 'The old airport binary was removed in macOS 14.4 — these still work',
    command: `# Full Wi-Fi picture: SSID, channel, signal, security
system_profiler SPAirPortDataType

# Signal strength and link quality
sudo wdutil info

# Just the SSID you are connected to
ipconfig getsummary en0 | awk -F ' SSID : ' '/ SSID : / {print $2}'

# Turn Wi-Fi off and on again
networksetup -setairportpower en0 off && networksetup -setairportpower en0 on`,
    platform: 'macOS',
    tags: ['macos', 'wifi', 'networking', 'troubleshooting'],
    category: 'macos',
  },
  {
    id: 'macos-networksetup',
    title: 'Change DNS servers and network settings',
    description: 'Switch to Cloudflare or Google DNS without opening System Settings',
    command: `networksetup -listallnetworkservices
networksetup -getinfo "Wi-Fi"

networksetup -setdnsservers "Wi-Fi" 1.1.1.1 8.8.8.8
networksetup -getdnsservers "Wi-Fi"

# Back to whatever DHCP hands out
networksetup -setdnsservers "Wi-Fi" Empty

# Proxy on/off
networksetup -setwebproxystate "Wi-Fi" off`,
    platform: 'macOS',
    tags: ['macos', 'dns', 'networking', 'config'],
    category: 'macos',
  },
  {
    id: 'macos-pmset',
    title: 'Find out what is keeping your Mac awake',
    description: 'Battery draining in your bag? assertions tells you exactly which process is guilty',
    command: `pmset -g assertions                 # what is preventing sleep RIGHT NOW
pmset -g                            # current power settings
pmset -g batt                       # battery state and time remaining

# Sleep and wake history
pmset -g log | grep -e "Sleep" -e "Wake" | tail -20

# Change the timers (needs sudo)
sudo pmset -a displaysleep 10 sleep 30
sudo pmset -b disablesleep 0`,
    platform: 'macOS',
    tags: ['macos', 'power', 'battery', 'sleep', 'debug'],
    category: 'macos',
  },
  {
    id: 'macos-system-profiler',
    title: 'Hardware and software inventory',
    description: 'Serial number, chip, RAM, macOS build — everything you need for a support ticket',
    command: `system_profiler SPHardwareDataType     # model, chip, RAM, serial
system_profiler SPSoftwareDataType     # macOS version, build, uptime
system_profiler SPStorageDataType
system_profiler SPDisplaysDataType

# The two-line version
sysctl -n machdep.cpu.brand_string hw.memsize
sw_vers

# Serial number on its own
ioreg -l | awk -F'"' '/IOPlatformSerialNumber/ {print $4}'`,
    platform: 'macOS',
    tags: ['macos', 'hardware', 'inventory', 'system'],
    category: 'macos',
  },
  {
    id: 'macos-brew-cleanup',
    title: 'Deep clean Homebrew',
    description: 'Reclaim gigabytes and see what you actually installed on purpose',
    command: `brew update && brew outdated
brew upgrade
brew autoremove                     # drop dependencies nothing needs anymore
brew cleanup -s --prune=all         # delete old versions and the download cache

# What did I install on purpose (vs pulled in as a dependency)?
brew leaves --installed-on-request
brew deps --tree --installed

# How big is the cache
du -sh "$(brew --cache)"

brew doctor`,
    platform: 'macOS',
    tags: ['macos', 'brew', 'cleanup', 'disk', 'maintenance'],
    category: 'macos',
  },
  {
    id: 'macos-open',
    title: 'Open files, folders and apps from the terminal',
    description: 'The macOS command that replaces switching to Finder',
    command: `open .                              # current folder in Finder
open -a "Visual Studio Code" .      # open in a specific app
open -R ~/Downloads/report.pdf      # reveal the file in Finder
open https://neorgon.com
open -e notes.txt                   # force TextEdit
open -n -a Safari                   # a second, separate instance
open -a Preview *.png               # all matching files in one app

# Which app owns this file type?
duti -x pdf`,
    platform: 'macOS',
    tags: ['macos', 'open', 'finder', 'files', 'workflow'],
    category: 'macos',
  },
  {
    id: 'macos-restart-ui',
    title: 'Restart Finder, Dock and the menu bar',
    description: 'First response when the UI wedges — much faster than rebooting',
    command: `killall Finder
killall Dock
killall SystemUIServer              # menu bar and status icons

# DNS resolution stuck
sudo killall -HUP mDNSResponder

# Bluetooth not seeing devices
sudo pkill bluetoothd

# Audio dead / no output devices
sudo killall coreaudiod`,
    platform: 'macOS',
    tags: ['macos', 'restart', 'finder', 'troubleshooting'],
    category: 'macos',
  },
  {
    id: 'macos-diskutil',
    title: 'Eject a stuck disk and inspect volumes',
    description: 'When Finder says the disk is in use but will not say by what',
    command: `diskutil list
diskutil info /Volumes/MyDrive

# What is holding the volume open?
lsof +D /Volumes/MyDrive

diskutil unmount force /Volumes/MyDrive
diskutil eject /dev/disk4

sudo diskutil verifyVolume /
diskutil apfs list`,
    platform: 'macOS',
    tags: ['macos', 'disk', 'eject', 'troubleshooting'],
    category: 'macos',
  },
  {
    id: 'macos-app-uninstall',
    title: 'Fully uninstall an app and its leftovers',
    description: 'Dragging to Trash leaves preferences, caches and support files behind',
    command: `# Find what the app scattered around your home folder
ls -d ~/Library/Caches/*AppName* \\
      ~/Library/Preferences/*AppName* \\
      ~/Library/Logs/*AppName* \\
      ~/Library/"Application Support"/*AppName* 2>/dev/null

# Remove the app plus the leftovers
sudo rm -rf /Applications/AppName.app
rm -rf ~/Library/"Application Support"/AppName
defaults delete com.vendor.AppName

# Homebrew casks clean up after themselves
brew uninstall --zap --cask appname`,
    platform: 'macOS',
    tags: ['macos', 'uninstall', 'cleanup', 'brew', 'disk'],
    category: 'macos',
  },
  {
    id: 'macos-ds-store',
    title: 'Purge .DS_Store files and stop making them',
    description: 'Clean them out of a repo and stop macOS writing them onto network shares',
    command: `find . -name '.DS_Store' -type f -delete

# Stop creating them on network and USB volumes
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true

# Ignore them in every repo you touch
echo ".DS_Store" >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global`,
    platform: 'macOS',
    tags: ['macos', 'cleanup', 'git', 'files', 'config'],
    category: 'macos',
  },
  {
    id: 'macos-softwareupdate',
    title: 'macOS updates from the terminal',
    description: 'List, install and automate updates without the Settings pane',
    command: `softwareupdate --list
sudo softwareupdate --install --all --restart

# Just the security patches
sudo softwareupdate --install --recommended

# Apple silicon: install Rosetta non-interactively
sudo softwareupdate --install-rosetta --agree-to-license

# Command line tools (git, clang, make)
xcode-select --install
xcode-select -p`,
    platform: 'macOS',
    tags: ['macos', 'update', 'setup', 'maintenance'],
    category: 'macos',
  },
];
