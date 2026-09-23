// ── Windows ──────────────────────────────────────────────────
// Commands containing backslashes use String.raw so Windows paths
// survive the template literal (a plain `.\app.log` would lose its slash).

export const windows = [
  {
    id: 'win-kill-port',
    title: 'Kill the process using a port',
    description: 'The Windows answer to "address already in use" — find the owning PID and stop it',
    command: String.raw`Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object -ExpandProperty OwningProcess |
  ForEach-Object { Stop-Process -Id $_ -Force }

# One-liner to just see who is holding it
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# cmd.exe fallback
netstat -ano | findstr :3000
taskkill /PID 12345 /F`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'ports', 'kill', 'process'],
    category: 'windows',
  },
  {
    id: 'win-listening-ports',
    title: 'List listening ports with owning process',
    description: 'Every port that is open on this machine and which program opened it',
    command: String.raw`Get-NetTCPConnection -State Listen |
  Select-Object LocalAddress, LocalPort,
    @{Name='Process'; Expression={ (Get-Process -Id $_.OwningProcess).ProcessName }} |
  Sort-Object LocalPort | Format-Table -AutoSize

# cmd.exe
netstat -ano -p tcp | findstr LISTENING`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'ports', 'networking', 'debug'],
    category: 'windows',
  },
  {
    id: 'win-flush-dns',
    title: 'Flush DNS cache on Windows',
    description: 'First thing to try when a domain resolves to the wrong IP after a DNS change',
    command: String.raw`ipconfig /flushdns          # works in cmd and PowerShell
Clear-DnsClientCache        # PowerShell native
Get-DnsClientCache          # inspect what is actually cached
Resolve-DnsName example.com -Server 1.1.1.1   # bypass the cache entirely`,
    platform: 'Windows',
    tags: ['windows', 'dns', 'networking', 'cache', 'troubleshooting'],
    category: 'windows',
  },
  {
    id: 'win-unblock-files',
    title: 'Unblock files downloaded from the internet',
    description: 'Clears the Mark of the Web that makes Windows refuse to run downloaded scripts and DLLs',
    command: String.raw`Unblock-File -Path .\setup.ps1

# A whole folder, recursively
Get-ChildItem -Path .\Downloads -Recurse | Unblock-File

# See whether a file is still marked
Get-Item .\setup.ps1 -Stream Zone.Identifier -ErrorAction SilentlyContinue`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'security', 'files', 'download'],
    category: 'windows',
  },
  {
    id: 'win-large-files',
    title: 'Find the largest files on a drive',
    description: 'Sorted list of the 20 biggest files under a path, with sizes in MB',
    command: String.raw`Get-ChildItem -Path C:\Users\me -Recurse -File -ErrorAction SilentlyContinue |
  Sort-Object Length -Descending |
  Select-Object -First 20 @{N='Size(MB)';E={[math]::Round($_.Length / 1MB, 1)}}, FullName |
  Format-Table -AutoSize`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'disk', 'files', 'cleanup'],
    category: 'windows',
  },
  {
    id: 'win-grep',
    title: 'Search text inside files (grep for Windows)',
    description: 'Select-String is PowerShell grep — pattern search with context and file lists',
    command: String.raw`Select-String -Path .\*.log -Pattern 'ERROR'

# Recursive, with 2 lines of context either side
Get-ChildItem -Recurse -Filter *.log | Select-String -Pattern 'timeout' -Context 2,2

# Only the names of files that matched  (grep -l)
Select-String -Path .\src\*.ts -Pattern 'TODO' -List | Select-Object -ExpandProperty Path

# Case-sensitive, regex, count only
Select-String -Path .\app.log -Pattern 'FATAL' -CaseSensitive | Measure-Object -Line`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'grep', 'search', 'text'],
    category: 'windows',
  },
  {
    id: 'win-tail',
    title: 'Tail a log file live (tail -f for Windows)',
    description: 'Follow a file as it grows, optionally filtering to the lines you care about',
    command: String.raw`Get-Content .\app.log -Tail 50 -Wait

# Follow and filter at the same time
Get-Content .\app.log -Wait | Select-String 'ERROR|WARN'

# Last 100 lines, no follow
Get-Content .\app.log -Tail 100`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'logs', 'tail', 'debug'],
    category: 'windows',
  },
  {
    id: 'win-which',
    title: 'Find where a command comes from',
    description: 'The Windows equivalent of which — resolves the real executable on PATH',
    command: String.raw`Get-Command node | Select-Object -ExpandProperty Source
where.exe python              # shows every match on PATH, in order
Get-Command git -All          # aliases, functions and executables that resolve
Get-Command *docker*          # discover what is available`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'path', 'debug'],
    category: 'windows',
  },
  {
    id: 'win-env-var',
    title: 'Set an environment variable permanently',
    description: 'Session-only vs persisted for your user — the distinction that trips everyone up',
    command: String.raw`# Current session only, gone when you close the terminal
$env:API_KEY = 'secret'

# Persisted for your user — reopen the terminal to pick it up
[Environment]::SetEnvironmentVariable('API_KEY', 'secret', 'User')

# Read it back, then remove it
[Environment]::GetEnvironmentVariable('API_KEY', 'User')
[Environment]::SetEnvironmentVariable('API_KEY', $null, 'User')

# Machine-wide needs an elevated terminal
[Environment]::SetEnvironmentVariable('API_KEY', 'secret', 'Machine')`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'env', 'config', 'setup'],
    category: 'windows',
  },
  {
    id: 'win-path-add',
    title: 'Add a folder to PATH permanently',
    description: 'Appends to the user PATH without clobbering what is already there',
    command: String.raw`$new = 'C:\tools\bin'
$old = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($old -notlike "*$new*") {
  [Environment]::SetEnvironmentVariable('Path', "$old;$new", 'User')
}

# Apply to the current session too, without restarting
$env:Path = "$env:Path;$new"

# Inspect PATH one entry per line
$env:Path -split ';'`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'path', 'env', 'setup'],
    category: 'windows',
  },
  {
    id: 'win-services',
    title: 'Inspect and restart Windows services',
    description: 'Find a running service, restart it, and change whether it starts at boot',
    command: String.raw`Get-Service | Where-Object Status -eq 'Running' | Sort-Object DisplayName
Get-Service -Name 'W32Time' | Select-Object Name, Status, StartType

Restart-Service -Name 'Spooler' -Force
Stop-Service -Name 'Spooler' ; Start-Service -Name 'Spooler'

Set-Service -Name 'W32Time' -StartupType Automatic

# Services that failed to start
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' }`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'service', 'restart', 'troubleshooting'],
    category: 'windows',
  },
  {
    id: 'win-eventlog',
    title: 'Read recent errors from the Event Log',
    description: 'Last 24 hours of system errors — where Windows hides the reason something crashed',
    command: String.raw`Get-WinEvent -FilterHashtable @{
  LogName   = 'System'
  Level     = 2                      # 1 Critical, 2 Error, 3 Warning
  StartTime = (Get-Date).AddHours(-24)
} | Select-Object -First 20 TimeCreated, Id, ProviderName, Message | Format-List

# Application log instead
Get-WinEvent -LogName Application -MaxEvents 50 |
  Where-Object LevelDisplayName -in 'Error','Critical'

# Unexpected shutdowns
Get-WinEvent -FilterHashtable @{ LogName='System'; Id=6008 } -MaxEvents 10`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'logs', 'errors', 'debug'],
    category: 'windows',
  },
  {
    id: 'win-uptime',
    title: 'System uptime and last boot time',
    description: 'How long this machine has been up, and when it last restarted',
    command: String.raw`(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
Get-Uptime                                      # PowerShell 6+
(Get-CimInstance Win32_OperatingSystem).LastBootUpTime

# cmd.exe
systeminfo | findstr /C:"System Boot Time"`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'uptime', 'monitoring'],
    category: 'windows',
  },
  {
    id: 'win-hash',
    title: 'Hash a file and compare two files',
    description: 'Verify a download against a published checksum, or prove two files are identical',
    command: String.raw`Get-FileHash .\ubuntu.iso -Algorithm SHA256

# Are these two files the same?
(Get-FileHash .\a.zip).Hash -eq (Get-FileHash .\b.zip).Hash

# Compare against a published value
(Get-FileHash .\ubuntu.iso -Algorithm SHA256).Hash -eq 'ABC123...'

# Works in cmd.exe too
certutil -hashfile .\file.exe SHA256`,
    platform: 'Windows',
    tags: ['windows', 'powershell', 'hash', 'checksum', 'security'],
    category: 'windows',
  },
  {
    id: 'win-robocopy',
    title: 'Mirror a folder with robocopy',
    description: 'Fast, resumable, multi-threaded folder sync — always dry run with /L first',
    command: String.raw`# DRY RUN first — /MIR deletes files in the destination that are not in the source
robocopy "D:\projects" "E:\backup\projects" /MIR /L

# Real run: 16 threads, 1 retry, skip noisy folders, quiet output
robocopy "D:\projects" "E:\backup\projects" /MIR /MT:16 /R:1 /W:1 /XD node_modules .git /NFL /NDL

# Copy only, never delete
robocopy "D:\src" "E:\dst" /E /XO

#  /MIR mirror   /E include empty dirs   /XO skip older   /MT threads
#  /R retries    /W wait secs            /XD exclude dir  /L list only`,
    platform: 'Windows',
    tags: ['windows', 'robocopy', 'backup', 'sync', 'files'],
    category: 'windows',
  },
  {
    id: 'win-winget-essentials',
    title: 'Install essential dev tools with winget',
    description: 'Bootstrap a fresh Windows machine from the terminal, no installers to click',
    command: String.raw`winget install --id Git.Git -e
winget install --id Microsoft.PowerShell -e
winget install --id Microsoft.WindowsTerminal -e
winget install --id Microsoft.VisualStudioCode -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id 7zip.7zip -e
winget install --id jqlang.jq -e
winget install --id GnuWin32.Grep -e

# Find the exact id for anything else
winget search "docker desktop"`,
    platform: 'Windows',
    tags: ['windows', 'winget', 'install', 'setup', 'tools'],
    category: 'windows',
  },
  {
    id: 'win-winget-upgrade',
    title: 'Upgrade every installed app at once',
    description: 'The Windows equivalent of brew upgrade',
    command: String.raw`winget list --upgrade-available
winget upgrade --all --include-unknown

# Skip one package you want to pin
winget upgrade --all --exclude Oracle.JavaRuntimeEnvironment

# Pin a version so it stops being upgraded
winget pin add --id Node.js --version 20.*`,
    platform: 'Windows',
    tags: ['windows', 'winget', 'upgrade', 'setup'],
    category: 'windows',
  },
  {
    id: 'win-wsl',
    title: 'WSL essentials: install, reset, back up',
    description: 'Manage Linux distros on Windows, including the export/import trick for backups',
    command: String.raw`wsl --list --verbose
wsl --install -d Ubuntu
wsl --set-default Ubuntu
wsl --shutdown                      # fixes most "WSL is being weird" problems

# Back up and restore a distro
wsl --export Ubuntu D:\backup\ubuntu.tar
wsl --import Ubuntu-copy D:\wsl\ubuntu-copy D:\backup\ubuntu.tar

# Start over
wsl --unregister Ubuntu-copy

# Reclaim disk space the virtual disk is still holding
wsl --manage Ubuntu --set-sparse true`,
    platform: 'Windows',
    tags: ['windows', 'wsl', 'linux', 'setup', 'backup'],
    category: 'windows',
  },
  {
    id: 'win-wsl-interop',
    title: 'Move between WSL and Windows',
    description: 'Paths, clipboard and tools crossing the WSL boundary in both directions',
    command: String.raw`# Windows drives, from inside WSL
cd /mnt/c/Users/me/projects

# Open the current WSL folder in Explorer, or in VS Code
explorer.exe .
code .

# Pipe WSL output into the Windows clipboard
cat notes.txt | clip.exe

# Reach WSL files from Windows Explorer or PowerShell
\\wsl$\Ubuntu\home\me

# Run a Linux command from PowerShell without entering the shell
wsl ls -la /var/log`,
    platform: 'Windows',
    tags: ['windows', 'wsl', 'linux', 'clipboard', 'files'],
    category: 'windows',
  },
  {
    id: 'win-archives',
    title: 'Zip and unzip from the terminal',
    description: 'Create and extract archives without installing anything',
    command: String.raw`Compress-Archive -Path .\dist\* -DestinationPath .\dist.zip -Force
Expand-Archive -Path .\dist.zip -DestinationPath .\out -Force

# Append to an existing zip
Compress-Archive -Path .\extra.txt -Update -DestinationPath .\dist.zip

# tar ships with Windows 10+ and handles tar.gz that Compress-Archive cannot
tar -czf site.tar.gz site
tar -xzf site.tar.gz -C .\out`,
    platform: 'Windows',
    tags: ['windows', 'powershell', 'archive', 'zip', 'files'],
    category: 'windows',
  },
  {
    id: 'win-http-requests',
    title: 'HTTP requests from PowerShell (curl equivalent)',
    description: 'GET, POST JSON, auth headers and file downloads without curl',
    command: String.raw`Invoke-RestMethod https://api.example.com/items

# POST a JSON body
$body = @{ name = 'demo'; count = 3 } | ConvertTo-Json
Invoke-RestMethod -Uri https://api.example.com/items -Method Post -ContentType 'application/json' -Body $body

# Bearer token
Invoke-RestMethod -Uri https://api.example.com/me -Headers @{ Authorization = 'Bearer TOKEN' }

# Download a file
Invoke-WebRequest -Uri https://example.com/file.zip -OutFile .\file.zip

# Note: in Windows PowerShell 5, "curl" is an alias for Invoke-WebRequest.
# Use curl.exe when you want the real curl.`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'http', 'api', 'curl'],
    category: 'windows',
  },
  {
    id: 'win-top-processes',
    title: 'Top memory and CPU consuming processes',
    description: 'Task Manager from the terminal — find what is eating the machine',
    command: String.raw`Get-Process | Sort-Object WS -Descending |
  Select-Object -First 10 Name, Id, @{N='RAM(MB)';E={[math]::Round($_.WS / 1MB)}}

Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, Id, CPU

# Kill everything matching a name
Stop-Process -Name 'chrome' -Force

# Live-ish view, refreshing every 2 seconds
while ($true) { Get-Process | Sort-Object CPU -Desc | Select -First 10; Start-Sleep 2; Clear-Host }`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'process', 'memory', 'cpu', 'monitoring'],
    category: 'windows',
  },
  {
    id: 'win-disk-usage',
    title: 'Disk space by drive and by folder',
    description: 'Free space per drive, then the biggest folders under a path',
    command: String.raw`Get-PSDrive -PSProvider FileSystem |
  Select-Object Name,
    @{N='Used(GB)';E={[math]::Round($_.Used / 1GB, 1)}},
    @{N='Free(GB)';E={[math]::Round($_.Free / 1GB, 1)}}

# Biggest folders one level down
Get-ChildItem C:\Users\me -Directory | ForEach-Object {
  [PSCustomObject]@{
    Folder = $_.Name
    GB = [math]::Round((Get-ChildItem $_.FullName -Recurse -File -EA SilentlyContinue |
         Measure-Object Length -Sum).Sum / 1GB, 2)
  }
} | Sort-Object GB -Descending`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'disk', 'cleanup', 'monitoring'],
    category: 'windows',
  },
  {
    id: 'win-network-info',
    title: 'IP, gateway, DNS and connectivity in one place',
    description: 'Everything you normally open four different windows to find',
    command: String.raw`Get-NetIPConfiguration
Get-NetIPAddress -AddressFamily IPv4 | Select-Object InterfaceAlias, IPAddress
Get-DnsClientServerAddress -AddressFamily IPv4

# Ping plus port check plus route trace, in one cmdlet
Test-NetConnection example.com -Port 443
Test-NetConnection example.com -TraceRoute

# Public IP
Invoke-RestMethod https://ifconfig.me/ip

# The old reliable
ipconfig /all`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'networking', 'dns', 'ip', 'debug'],
    category: 'windows',
  },
  {
    id: 'win-repair-system',
    title: 'Repair corrupted Windows system files',
    description: 'The standard sfc + DISM sequence for a machine behaving strangely',
    command: String.raw`# Run these from an elevated (Administrator) terminal, in this order
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
sfc /scannow                                  # re-run after DISM repairs the store

# Reclaim space used by superseded component versions
DISM /Online /Cleanup-Image /StartComponentCleanup

# Check the disk without a reboot
chkdsk C: /scan`,
    platform: 'Windows',
    tags: ['windows', 'repair', 'troubleshooting', 'maintenance'],
    category: 'windows',
  },
  {
    id: 'win-scheduled-task',
    title: 'Create a scheduled task from the terminal',
    description: 'Cron for Windows — register, inspect and remove a recurring job',
    command: String.raw`$action  = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument '-File C:\scripts\backup.ps1'
$trigger = New-ScheduledTaskTrigger -Daily -At 3am
Register-ScheduledTask -TaskName 'NightlyBackup' -Action $action -Trigger $trigger -Description 'Backs up projects'

Get-ScheduledTask -TaskName 'NightlyBackup' | Get-ScheduledTaskInfo
Start-ScheduledTask -TaskName 'NightlyBackup'      # run it now to test
Unregister-ScheduledTask -TaskName 'NightlyBackup' -Confirm:$false`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'schedule', 'cron', 'automation'],
    category: 'windows',
  },
  {
    id: 'win-installed-apps',
    title: 'List every installed application',
    description: 'Registry-based list that catches apps winget does not know about',
    command: String.raw`winget list

$paths = @(
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*'
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
Get-ItemProperty $paths |
  Where-Object DisplayName |
  Select-Object DisplayName, DisplayVersion, Publisher |
  Sort-Object DisplayName

# Store apps
Get-AppxPackage | Select-Object Name, Version`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'apps', 'inventory', 'audit'],
    category: 'windows',
  },
  {
    id: 'win-profile',
    title: 'PowerShell profile with useful aliases',
    description: 'Your .bashrc equivalent — aliases, functions and history-based autocomplete',
    command: String.raw`$PROFILE                                   # where the file lives
New-Item -ItemType File -Path $PROFILE -Force
notepad $PROFILE

# --- worth putting inside it ---
Set-Alias ll Get-ChildItem
Set-Alias which Get-Command
Set-Alias grep Select-String
function .. { Set-Location .. }
function gs { git status -sb }
function gl { git log --oneline --graph --decorate -20 }
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -EditMode Emacs

# Reload without restarting the terminal
. $PROFILE`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'alias', 'config', 'setup'],
    category: 'windows',
  },
  {
    id: 'win-ssh-key',
    title: 'Generate an SSH key on Windows',
    description: 'Key, agent as a service, and the public key straight to your clipboard',
    command: String.raw`ssh-keygen -t ed25519 -C "you@example.com"

# Start the agent and keep it starting at boot
Get-Service ssh-agent | Set-Service -StartupType Automatic
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\id_ed25519

# Copy the public key ready to paste into GitHub
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard

ssh -T git@github.com          # verify`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'ssh', 'keygen', 'github', 'setup'],
    category: 'windows',
  },
  {
    id: 'win-clipboard',
    title: 'Pipe to and from the Windows clipboard',
    description: 'Get file contents or command output into the clipboard without selecting text',
    command: String.raw`Get-Content .\notes.md | Set-Clipboard
Get-ChildItem | Out-String | Set-Clipboard
Get-Clipboard | Out-File .\pasted.txt

# Copy the current path
(Get-Location).Path | Set-Clipboard

# cmd.exe
type notes.md | clip`,
    platform: 'PowerShell',
    tags: ['windows', 'powershell', 'clipboard', 'files'],
    category: 'windows',
  },
];
