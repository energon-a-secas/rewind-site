// ── DevOps ─────────────────────────────────────────────

export const devops = [
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
  {
    id: 'ssh-tunnel-local',
    title: 'Reach a remote database on localhost',
    description: 'Local port forward — the safe way to use a GUI client against a private database',
    command: `# localhost:5432 now goes to db.internal:5432, via the bastion
ssh -L 5432:db.internal:5432 user@bastion.example.com

# Background, no shell, exits when the tunnel dies
ssh -fN -L 5432:db.internal:5432 user@bastion.example.com

# Several at once
ssh -fN -L 5432:db.internal:5432 -L 6379:cache.internal:6379 user@bastion

# Is it up? And how do I close it?
lsof -i :5432
pkill -f "ssh -fN -L 5432"`,
    platform: 'bash',
    tags: ['ssh', 'tunnel', 'networking', 'database', 'devops', 'debug'],
    category: 'devops',
  },
  {
    id: 'ssh-tunnel-remote',
    title: 'Expose a local service to a remote server',
    description: 'Reverse tunnel — let a remote machine reach the app running on your laptop',
    command: `# Port 8080 on the server now reaches port 3000 on this machine
ssh -R 8080:localhost:3000 user@server.example.com

# Let other hosts hit it, not just the server itself
# (needs GatewayPorts yes in the server's sshd_config)
ssh -R 0.0.0.0:8080:localhost:3000 user@server.example.com

# Keep it alive across a flaky connection
ssh -fN -R 8080:localhost:3000 -o ServerAliveInterval=30 -o ExitOnForwardFailure=yes user@server`,
    platform: 'bash',
    tags: ['ssh', 'tunnel', 'reverse', 'networking', 'devops'],
    category: 'devops',
  },
  {
    id: 'rsync-sync',
    title: 'Sync folders over SSH with rsync',
    description: 'Resumable, incremental, and it only sends what actually changed',
    command: `rsync -avz --progress ./dist/ user@server:/srv/app/

# The trailing slash matters: dist/ copies the CONTENTS, dist copies the folder

# Dry run first, especially with --delete
rsync -avzn --delete ./dist/ user@server:/srv/app/
rsync -avz --delete ./dist/ user@server:/srv/app/

# Skip the noise
rsync -avz --exclude '.git' --exclude 'node_modules' ./ user@server:/srv/app/

# Resume a big transfer over a bad link
rsync -avzP --partial big.iso user@server:/backup/

# Local to local works too, and beats cp for large trees
rsync -a --info=progress2 /Volumes/Old/ ~/Archive/`,
    platform: 'bash',
    tags: ['rsync', 'ssh', 'sync', 'backup', 'transfer', 'devops'],
    category: 'devops',
  },
  {
    id: 'scp-copy',
    title: 'Copy files to and from a server',
    description: 'scp for one-off transfers; note the direction and the recursive flag',
    command: `scp report.csv user@server:/tmp/                  # local  -> remote
scp user@server:/var/log/app.log ./                # remote -> local
scp -r ./dist user@server:/srv/app/                # a whole directory

# Non-standard port (capital P, unlike ssh)
scp -P 2222 file.txt user@server:/tmp/

# Between two remote hosts, routed through your machine
scp user@host1:/data/file.txt user@host2:/data/

# Better for anything large or repeated
rsync -avzP ./dist/ user@server:/srv/app/`,
    platform: 'bash',
    tags: ['scp', 'ssh', 'transfer', 'files', 'devops'],
    category: 'devops',
  },
];
