export const ch6 = {
  id: 'escalation',
  number: 6,
  title: 'Proper Escalation',
  summary: 'Checklists by layer, and how to hand a problem to someone else without wasting their first twenty minutes.',
  sections: [
    {
      id: 'how-to-use',
      number: '6.1',
      title: 'How to use these checklists',
      blocks: [
        { t: 'p', text: 'These are ordered roughly by how often they are the answer and how cheap they are to check, so working top to bottom is a reasonable default. Do not work top to bottom mechanically if you have a real lead; a lead beats a checklist. Use the list when you have no lead, or to confirm you have not skipped something obvious before escalating.' },
        { t: 'note', label: 'Rule', text: 'Check the layer you own before escalating, and check it honestly. An escalation that turns out to be your own expired config costs you more credibility than the ten minutes it saved.' }
      ]
    },
    {
      id: 'infrastructure',
      number: '6.2',
      title: 'Infrastructure',
      blocks: [
        { t: 'p', text: 'The layer under the application. Suspect it when the application looks fine but cannot reach, resolve, authenticate, or allocate.' },
        {
          t: 'checklist',
          items: [
            { item: 'Network connectivity', how: 'Can the host reach the target at all? Test the specific port, not just the host. A ping succeeding proves almost nothing about whether the port is open.' },
            { item: 'DNS resolution', how: 'Resolve the name from inside the affected host, not your laptop. Check what it resolves *to*, and check TTL. Split-horizon DNS and stale caches make this a repeat offender.' },
            { item: 'Certificates', how: 'Expiry date, the full chain, and the hostname it is actually issued for. An expired intermediate fails in a way that looks nothing like an expired leaf.' },
            { item: 'IAM and permissions', how: 'What role is the workload actually running as, and what does that role currently allow? Check the audit log for recent policy edits, which are invisible from the application side.' },
            { item: 'Resource limits and quotas', how: 'CPU, memory, disk, inodes, file descriptors, connection limits, API rate limits, and cloud account quotas. Inodes and file descriptors are the ones people forget while staring at free disk space.' },
            { item: 'Cloud provider status', how: 'Check the status page, and be aware that it lags real incidents. Multiple unrelated systems degrading in one region is stronger evidence than a green status page is.' },
            { item: 'Load balancer and health checks', how: 'How many targets are healthy? A pool that quietly shrank to one instance behaves exactly like an intermittent application bug.' },
            { item: 'Firewall and security group rules', how: 'Compare against a working environment. Recently tightened rules are a very common cause and never appear in your deploy history.' },
            { item: 'Time and clock skew', how: 'Skewed clocks break token validation, certificate checks, and any correlation you attempt across services.' }
          ]
        }
      ]
    },
    {
      id: 'development',
      number: '6.3',
      title: 'Development',
      blocks: [
        { t: 'p', text: 'The layer you and your team ship. Suspect it when the failure follows a change, or when it is confined to one code path.' },
        {
          t: 'checklist',
          items: [
            { item: 'Recent code changes', how: 'What merged and what deployed near the first failure. These are different lists, and the gap between them is where surprises live.' },
            { item: 'Environment variables and configuration', how: 'Read the config the running process actually has, not the file in the repository. Check for the empty-string case, where a missing variable becomes a silently valid value.' },
            { item: 'Feature flags', how: 'Anything toggled recently, at any rollout percentage. Flags change instantly, are not in git, and are the most common cause of "nothing changed".' },
            { item: 'Dependency versions', how: 'Compare the resolved lockfile between the working and failing build. A rebuild with a floating version constraint changes your code without changing your code.' },
            { item: 'Database migrations', how: 'Did one run? Did it complete? Is it reversible? A partially applied migration is a particularly unpleasant state to discover during a rollback.' },
            { item: 'Error logs, read from the first entry', how: 'Sort ascending and read the earliest error, not the most frequent. Cascades bury the trigger.' },
            { item: 'Build artifacts', how: 'Confirm the running version matches what you think shipped. Failed or partial rollouts leave mixed versions serving traffic simultaneously.' },
            { item: 'Caches', how: 'Application cache, CDN, and build cache. Stale cached data and stale cached artifacts produce failures that survive a correct fix and make you doubt the fix.' },
            { item: 'Background jobs and schedules', how: 'A job that runs at a specific time explains a failure that appears at a specific time and cannot be reproduced in between.' }
          ]
        }
      ]
    },
    {
      id: 'dependencies',
      number: '6.4',
      title: 'Dependencies',
      blocks: [
        { t: 'p', text: 'Services you call but do not control, inside or outside the company. Suspect them when your code is unchanged and your infrastructure is healthy.' },
        {
          t: 'checklist',
          items: [
            { item: 'Third-party service health', how: 'Their status page, plus your own client-side timing. Measure from your side: a provider can be "operational" and still be slow for you specifically.' },
            { item: 'Authentication token expiry', how: 'API keys, OAuth tokens, service account credentials, signing certificates. These fail on a schedule set months ago by someone who has since left.' },
            { item: 'Rate limits', how: 'Check for 429s and for silent throttling, which is worse because it presents as latency rather than error. Your own retry logic may be what pushed you over the limit.' },
            { item: 'Contract changes', how: 'A new required field, a changed enum, a deprecated endpoint, a stricter validator. Read their changelog for the period around your first failure.' },
            { item: 'Internal upstream and downstream services', how: 'Ask the owning team what they deployed. Cross-team change is completely invisible from your repository and your dashboards.' },
            { item: 'Retry and timeout behaviour', how: 'Confirm your timeouts are shorter than your caller\'s, and that retries have backoff. Aggressive retries against a struggling dependency turn a slowdown into an outage.' }
          ]
        }
      ]
    },
    {
      id: 'other-stuff',
      number: '6.5',
      title: 'Other stuff',
      blocks: [
        { t: 'p', text: 'The category that catches what the other three miss. It is short, and it resolves the problems that make people say the system is haunted.' },
        {
          t: 'checklist',
          items: [
            { item: 'Is the monitoring itself broken?', how: 'A metrics pipeline failure looks exactly like a service failure, and a dashboard showing zero looks like an outage. Confirm the signal exists before trusting its shape.' },
            { item: 'Has this happened before?', how: 'Search tickets, chat archives, and old post-mortems. Recurrence is common, and someone has probably written the answer down, possibly you.' },
            { item: 'Do we agree on what the words mean?', how: 'Two teams using "active user", "order", or "timeout" differently produces long arguments about data that is not actually in conflict. Define the term before debugging the discrepancy.' },
            { item: 'Is it actually broken?', how: 'Occasionally the alert threshold is wrong, the dashboard is misconfigured, or the reported behaviour is intended. Confirm the failure is real before spending an afternoon on it.' },
            { item: 'What is different about the affected population?', how: 'If failures cluster on one customer, region, plan tier, locale, or client version, that shared attribute is the shortest path to the cause.' }
          ]
        }
      ]
    },
    {
      id: 'handing-off',
      number: '6.6',
      title: 'How to hand off',
      blocks: [
        { t: 'p', text: 'A bad escalation is "the checkout is broken, can you look?" It forces the next person to redo everything you have done, and it wastes the most expensive twenty minutes in the incident, the ones where a fresh person is at their most useful.' },
        { t: 'p', text: 'A good escalation transfers state. If you kept the notes from 5.2 and the ruled-out list from 4.4, you can write it in two minutes.' },
        {
          t: 'code',
          label: 'Escalation message',
          text: 'WHAT:      Checkout p99 6s (normally 400ms), all regions, since 14:20.\n           Error rate normal. Requests succeed, they are just slow.\n\nIMPACT:    Checkout usable but painful. Conversion down ~8%.\n           Not total. Not getting worse.\n\nRULED OUT: Deploy (none since 11:03) - DB CPU (12%, no slow queries)\n           - Load (RPS flat) - Payment provider (client p99 40ms)\n           - Lock contention (pg_locks clean during spike)\n\nTHEORY:    Connection pool exhaustion. Cannot confirm, we do not\n           export pool metrics. That gap is itself a problem.\n\nNEED:      Someone with DB access to sample pg_stat_activity\n           during a spike, or help adding a pool gauge.\n\nNOTES:     Full log in #inc-4471, timestamps included.'
        },
        { t: 'p', text: 'Five fields, all of which you already know. Notice that it states the theory as unconfirmed and names the gap in observability, which is honest and lets the next person disagree with your theory instead of inheriting it as fact.' },
        { t: 'note', label: 'Field note', text: 'Escalating is not an admission that you failed. The failure mode people should actually worry about is the engineer who stays silent for two hours protecting their pride while customers are down. Nobody remembers who asked for help; they remember how long it took.' }
      ]
    }
  ]
};
