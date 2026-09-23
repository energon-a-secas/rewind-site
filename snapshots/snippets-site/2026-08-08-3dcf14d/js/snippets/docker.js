// ── Docker ─────────────────────────────────────────────

export const docker = [
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
];
