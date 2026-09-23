export const appendixA = {
  id: 'failure-modes',
  number: 'A',
  appendix: true,
  title: 'Failure-Mode Reference',
  summary: 'Twelve common alerts, each with the signal to read first, the moves that usually pay, and the misdiagnosis that usually costs an hour.',
  sections: [
    {
      id: 'how-to-read',
      number: 'A.0',
      title: 'How to read this appendix',
      blocks: [
        { t: 'p', text: 'These are not scripts to follow blindly. Each entry gives you a strong prior: what the symptom usually means, what to check first, and the wrong turn people commonly take. Techniques from the chapters are referenced by number so you can go back to the method rather than only the answer.' },
        { t: 'note', label: 'Rule', text: 'The **misdiagnosis** line in each entry is the most valuable part. It is the failure that looks solved and is not, which is the one that pages you again in four hours.' }
      ]
    },
    {
      id: 'fm-5xx',
      number: 'A.1',
      title: '5xx error spike',
      blocks: [
        { t: 'p', text: '**Signal.** Server error rate above baseline, customers affected. Read the shape first: total or partial, flat or climbing. Total and immediate points at config, credentials, or a dead dependency. Partial and steady points at one bad instance, a specific code path, or a data-dependent case.' },
        {
          t: 'checklist',
          items: [
            { item: 'Find the first failure and the affected endpoints', how: 'Not the alert time (3.1). Note whether every endpoint is failing or one.' },
            { item: 'Read the innermost error, not the wrapper', how: '"Internal server error" is never the cause. Follow "caused by" to the bottom (3.4).' },
            { item: 'Check deploys, flags, and config in the preceding thirty minutes', how: 'Include other teams and infrastructure edits, not only your repository.' },
            { item: 'If a change correlates and is reversible, roll it back now', how: 'Restore first, diagnose after (7.1). You do not need certainty.' },
            { item: 'Check whether errors cluster on one instance', how: 'Group the error rate by pod or host. A single bad instance is a common cause of partial 5xx.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Blaming the nearest deploy without confirming a mechanism. Rolling back is still the right first move, but if the rollback does not help, that is evidence and you should widen the change search rather than roll back further. See the worked example in 3.7, where the real cause was an IAM edit eight minutes earlier.' },
        { t: 'p', text: 'Related: [debugging commands](https://snippets.neorgon.com/#cat=devops), [break-fix practice](https://infradrills.neorgon.com/).' }
      ]
    },
    {
      id: 'fm-latency',
      number: 'A.2',
      title: 'Latency spike',
      blocks: [
        { t: 'p', text: '**Signal.** p95 or p99 climbing while error rate stays normal. Requests succeed, they are just slow. Check whether the median moved too: median plus tail means everything is slower, tail only means a subset of requests hit something the rest do not.' },
        {
          t: 'checklist',
          items: [
            { item: 'Confirm the shape at fine resolution', how: 'Zoom in to per-minute data. A step change and a genuine ramp mean different things, and daily averaging fakes ramps (4.7).' },
            { item: 'Walk the request path and find the slow hop', how: 'Draw it (5.3), write expected times next to each hop, then measure. The anomalous hop is usually obvious once written down.' },
            { item: 'Check saturation, not just utilisation', how: 'Connection pools, thread pools, and queue depth. Pool exhaustion presents as latency with healthy CPU and no errors.' },
            { item: 'Check downstream dependency timing from your side', how: 'A provider can report operational and still be slow for you. Measure at your client (6.4).' },
            { item: 'Look for retries amplifying load', how: 'Retries without backoff turn a small slowdown into a self-sustaining one.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Enlarging the connection pool or raising the timeout. Both make the symptom disappear for a week and neither addresses why connections are held so long. If a resource limit is the fix, confirm the consumption rate is legitimate before raising the limit.' },
        { t: 'p', text: 'Related: [performance commands](https://snippets.neorgon.com/#q=latency).' }
      ]
    },
    {
      id: 'fm-cpu',
      number: 'A.3',
      title: 'CPU saturation and throttling',
      blocks: [
        { t: 'p', text: '**Signal.** CPU pinned near the limit, latency rising. The first question is which kind of CPU: user time means your code is working hard, system time means syscall or kernel overhead, I/O wait means the CPU is idle waiting for disk or network and is not the actual problem. Throttling in a container is different again, and shows as latency with CPU apparently below the limit.' },
        {
          t: 'checklist',
          items: [
            { item: 'Split user, system, steal, and I/O wait', how: 'High I/O wait means look at storage or a downstream call, not at CPU. High steal means a noisy neighbour on shared hardware.' },
            { item: 'Identify the top consumers', how: 'By process, container, and thread. One runaway thread is a very different problem from uniformly high load.' },
            { item: 'Check for throttling specifically', how: 'In containers, CFS throttling causes latency while average CPU looks acceptable. Check the throttled-periods counter, not just usage.' },
            { item: 'Correlate with traffic and with schedules', how: 'If request volume is flat, suspect a batch job, a cron run, or a retry storm rather than genuine demand.' },
            { item: 'Check for a recent dependency or runtime change', how: 'A rebuild can change performance with no source change (3.1).' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Scaling out on high I/O wait. The CPU was never the bottleneck, so more instances add load to the saturated resource downstream and make it worse.' },
        { t: 'p', text: 'Related: [process and load commands](https://snippets.neorgon.com/#cat=shell).' }
      ]
    },
    {
      id: 'fm-oom',
      number: 'A.4',
      title: 'Memory leak and OOMKill',
      blocks: [
        { t: 'p', text: '**Signal.** Processes killed by the OOM killer, or memory climbing steadily between restarts. The distinguishing question is whether memory grows with time or with traffic. Growth with time is a leak. Growth with traffic that returns to baseline afterwards is normal, and it means your limit is too low for peak, not that anything is leaking.' },
        {
          t: 'checklist',
          items: [
            { item: 'Confirm it was the OOM killer', how: 'Check kernel messages and container exit codes. Exit 137 is a kill, not a crash, and it means something else decided to end the process.' },
            { item: 'Plot memory against restarts and against traffic', how: 'A sawtooth that always reaches the same ceiling before dying is a leak. A curve tracking request volume is capacity.' },
            { item: 'Capture a heap profile before the next restart', how: 'The restart destroys your evidence. Sample during the failure, not after (4.6).' },
            { item: 'Check what changed at the point the growth rate changed', how: 'The slope changes on a deploy or a dependency bump far more often than it changes on its own.' },
            { item: 'Look for unbounded collections', how: 'Caches with no eviction, request-scoped data attached to a long-lived object, and accumulating listeners are the recurring causes.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Raising the memory limit and calling it resolved. That converts a crash every two hours into a crash every eight and removes the pressure to fix it. It is a legitimate mitigation and it is not a fix, so record it as one (7.6).' },
        { t: 'p', text: 'Related: [container and pod commands](https://snippets.neorgon.com/#cat=k8s).' }
      ]
    },
    {
      id: 'fm-disk',
      number: 'A.5',
      title: 'Disk full and storage pressure',
      blocks: [
        { t: 'p', text: '**Signal.** A volume above its threshold, or writes failing. Note that a filesystem can be full in two independent ways, and one of them shows plenty of free space: running out of inodes, which happens with very large numbers of small files.' },
        {
          t: 'checklist',
          items: [
            { item: 'Check free space and free inodes', how: 'Both. An inode-exhausted filesystem reports free bytes and refuses to create files, which is deeply confusing if you only check one.' },
            { item: 'Find the largest directories, then the largest files', how: 'Work down the tree rather than searching globally. Faster, and it shows you the shape of the growth.' },
            { item: 'Check for deleted-but-open files', how: 'A deleted file held open by a running process still occupies space and is invisible to directory listings. This is why deleting a log sometimes frees nothing.' },
            { item: 'Verify log rotation is actually running', how: 'Failed rotation is the most common single cause. Check the rotation timestamps, not just the config.' },
            { item: 'Clean safely before resizing', how: 'Temp files, old logs, unused images and build caches. Confirm nothing is actively reading a file before removing it (2.2).' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Deleting a large log file with `rm` while a process holds it open, seeing no space return, and concluding the disk reporting is broken. Truncate the file in place, or restart the holder.' },
        { t: 'p', text: 'Related: [disk and filesystem commands](https://snippets.neorgon.com/#cat=shell).' }
      ]
    },
    {
      id: 'fm-db',
      number: 'A.6',
      title: 'Database slow queries',
      blocks: [
        { t: 'p', text: '**Signal.** Queries piling up, response times degrading. Separate three cases before investigating: the database is genuinely working hard, the database is idle but the application cannot get a connection, or one query is blocking others. They look identical from the application and have nothing in common.' },
        {
          t: 'checklist',
          items: [
            { item: 'Check database CPU and I/O first', how: 'Low CPU with slow application queries means the problem is connections or locks, not the database engine.' },
            { item: 'Look at active sessions and what they are waiting on', how: 'Sample during the incident. The wait event names the problem far faster than reading query plans.' },
            { item: 'Check for lock contention', how: 'One long transaction can block many short ones. The blocked queries are the symptom and the blocker is what you want.' },
            { item: 'Check connection pool saturation', how: 'On both sides. Pool exhaustion is the most common cause of "the database is slow" when the database is fine (4.7).' },
            { item: 'Check replication lag if reads are served from a replica', how: 'Lag presents as stale data and, when the application waits for consistency, as latency.' },
            { item: 'Look for a missing index only after the above', how: 'Query plans are where people start and they are rarely what changed today, unless data volume just crossed a threshold.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Killing the slowest query. It is often the victim rather than the cause, and the blocker keeps running. Find what the slow query is waiting on before ending anything.' },
        { t: 'p', text: 'Related: [database commands](https://snippets.neorgon.com/#cat=data).' }
      ]
    },
    {
      id: 'fm-network',
      number: 'A.7',
      title: 'Network partition and connectivity loss',
      blocks: [
        { t: 'p', text: '**Signal.** Services cannot reach each other or an external dependency. The error type narrows this immediately: connection refused means something answered and declined, so routing works and the listener does not. A timeout means nothing answered, which points at routing, firewall, or a black hole. Name resolution failure is DNS, not connectivity.' },
        {
          t: 'checklist',
          items: [
            { item: 'Establish scope: one pod, one node, one zone, or global', how: 'This single answer eliminates most of the candidate space (1.2).' },
            { item: 'Resolve the name from the affected host', how: 'Not from your laptop. Check what it resolves to and the TTL. DNS is the most frequent cause in this category by a wide margin.' },
            { item: 'Test the specific port, not just the host', how: 'A successful ping and a refused port are a common combination and they mean the network is fine.' },
            { item: 'Check firewall and security group rules against a working environment', how: 'Recently tightened rules leave no trace in your deploy history (6.2).' },
            { item: 'Check the provider status page and recent infrastructure changes', how: 'Several unrelated systems degrading in one zone is stronger evidence than a green status page.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Treating intermittent connection failures as a network problem when one instance in a pool is unhealthy. If a fixed fraction of requests fail and the fraction matches one over the number of instances, it is not the network.' },
        { t: 'p', text: 'Related: [network diagnostics](https://snippets.neorgon.com/#q=dns).' }
      ]
    },
    {
      id: 'fm-tls',
      number: 'A.8',
      title: 'TLS certificate expiry',
      blocks: [
        { t: 'p', text: '**Signal.** TLS handshake failures, or a certificate expiring soon. This is the cleanest example of a change nobody made (9.2), so it is worth checking early whenever "nothing changed" is being said confidently.' },
        {
          t: 'checklist',
          items: [
            { item: 'Confirm expiry, chain, and hostname', how: 'Check the full chain, not just the leaf. An expired intermediate produces a confusing error that does not mention expiry clearly.' },
            { item: 'Check what the client actually trusts', how: 'Failures often come from the client trust store, not the server certificate. Test from the affected client, not from your machine.' },
            { item: 'Find out why auto-renewal did not work', how: 'Renewal frequently succeeds while nothing reloads the new certificate. Check both the renewal and the reload.' },
            { item: 'Check client certificates and signing keys too', how: 'Mutual TLS has two expiry dates and monitoring usually covers one.' },
            { item: 'Add expiry alerts at 30, 14, and 7 days', how: 'One alert is not enough, because the first one fires while everyone is busy.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Renewing the certificate, seeing no improvement, and looking elsewhere. The process is very likely still holding the old certificate in memory. Confirm the served certificate changed before concluding the renewal was not the fix.' },
        { t: 'p', text: 'Related: [TLS commands](https://snippets.neorgon.com/#q=openssl), [external scan](https://lockdown.neorgon.com/).' }
      ]
    },
    {
      id: 'fm-pipeline',
      number: 'A.9',
      title: 'CI/CD pipeline failure',
      blocks: [
        { t: 'p', text: '**Signal.** Builds or deployments failing, release train blocked. First question: did anything in the repository change, or did the same commit stop working? The same commit failing today and passing yesterday means the environment changed, not the code, and that is a different investigation entirely.' },
        {
          t: 'checklist',
          items: [
            { item: 'Read the first error in the log, not the summary', how: 'The final "build failed" line is never informative. Search upward for the first genuine error (3.4).' },
            { item: 'Determine whether it is flaky, environmental, or real', how: 'Re-run the same commit. Passing on retry means flake or a resource issue, failing consistently means a real change.' },
            { item: 'Compare the resolved dependency versions against the last good build', how: 'A floating constraint changes your build with no commit (6.3). This is the most common cause of "it broke on its own".' },
            { item: 'Check runner resources and disk', how: 'Out-of-space and out-of-memory on runners produce errors that look like compilation or test failures.' },
            { item: 'Check credentials and tokens used by the pipeline', how: 'Registry credentials and deploy tokens expire, and the resulting error is often reported as a network problem.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Re-running until it passes and moving on. That is a legitimate unblock and it leaves a flaky test that will now be ignored by everyone, including during the incident where it was telling the truth.' },
        { t: 'p', text: 'Related: [CI commands](https://snippets.neorgon.com/#cat=devops), [pipeline break-fix labs](https://infradrills.neorgon.com/).' }
      ]
    },
    {
      id: 'fm-secrets',
      number: 'A.10',
      title: 'Secrets leaked in a repository or logs',
      blocks: [
        { t: 'p', text: '**Signal.** An API key, token, or credential is exposed where it should not be. Treat it as compromised from the moment of exposure, not from the moment someone proves it was used. Rotation comes first and everything else is secondary, because every minute of investigation is a minute the credential is still valid.' },
        {
          t: 'checklist',
          items: [
            { item: 'Rotate the credential first', how: 'Before scoping, before scrubbing, before telling anyone. Rotation is the only step that stops the bleeding.' },
            { item: 'Scope the exposure', how: 'Public or internal, how long, and who could read it. A public repository and an internal log store are very different risks.' },
            { item: 'Audit for actual use', how: 'Check the credential access logs for calls you cannot account for, from addresses you do not recognise, in the window it was exposed.' },
            { item: 'Scrub the secret from history and logs where possible', how: 'Do this after rotation, and know that scrubbing a public repository does not undo exposure. Assume it was collected.' },
            { item: 'Add prevention', how: 'Pre-commit scanning and secret scanning on the repository, so the next one is caught before it lands.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Rewriting git history first and rotating afterwards. History rewriting is slow, disruptive, and does not invalidate the credential. It is the visible action, not the effective one.' },
        { t: 'p', text: 'Related: [git commands](https://snippets.neorgon.com/#cat=git), [hardening guides](https://safeguard.neorgon.com/).' }
      ]
    },
    {
      id: 'fm-login',
      number: 'A.11',
      title: 'Suspicious login or account takeover',
      blocks: [
        { t: 'p', text: '**Signal.** Anomalous sign-in location, unfamiliar device, or a brute-force pattern. Contain before you investigate. Unlike most entries in this appendix, the cost of being wrong about containment is low, and the cost of being slow is not.' },
        {
          t: 'checklist',
          items: [
            { item: 'Suspend the account or force a credential reset', how: 'Containment first. An inconvenienced user is cheaper than an active intruder.' },
            { item: 'Revoke active sessions and application tokens', how: 'A password reset alone often leaves existing sessions and issued tokens valid, which means the reset changes nothing for the attacker.' },
            { item: 'Review login history, MFA status, and audit logs', how: 'Look for the first anomalous event, not the one that triggered the alert (3.4).' },
            { item: 'Check for privilege changes and new credentials', how: 'New API keys, added recovery addresses, altered forwarding rules, and new role grants are the usual persistence mechanisms.' },
            { item: 'Check whether other accounts show the same pattern', how: 'One compromised account is an incident. Several is a campaign, and the response is different.' },
            { item: 'Notify the user and your security owner, and record indicators', how: 'Addresses, user agents, and timestamps, so the same actor is recognisable next time.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Resetting the password and closing the ticket. Without revoking sessions and tokens, and without checking for added persistence, access frequently survives the reset entirely.' },
        { t: 'p', text: 'Related: [account hardening](https://safeguard.neorgon.com/).' }
      ]
    },
    {
      id: 'fm-vuln',
      number: 'A.12',
      title: 'Dependency vulnerability',
      blocks: [
        { t: 'p', text: '**Signal.** A CVE flagged in a library or base image. This is the one entry here that is usually not an emergency, and treating every advisory as one is how teams learn to ignore them. The question that decides urgency is whether the vulnerable code path is reachable in your deployment, and with what input.' },
        {
          t: 'checklist',
          items: [
            { item: 'Identify the exact package, version, and whether you use it directly', how: 'Transitive dependencies you never call are a different risk from something on your request path.' },
            { item: 'Determine reachability', how: 'Is the vulnerable function called, and can an untrusted input reach it? An unreachable CVE is a scheduled upgrade, not an incident.' },
            { item: 'Check the severity score against your context', how: 'A remote code execution in a parser you expose to the internet and the same score in a build-time tool are not comparable.' },
            { item: 'Upgrade in a branch and run the full test suite', how: 'Security patches introduce breaking changes often enough that shipping one straight to production is its own risk (2.2).' },
            { item: 'Re-scan after deploying and confirm it is gone', how: 'Lockfiles, caches, and base images all conspire to leave the old version in place after an apparently successful upgrade.' }
          ]
        },
        { t: 'note', label: 'Misdiagnosis', text: 'Upgrading the direct dependency while the vulnerable transitive version stays pinned somewhere else in the tree. Always re-scan rather than trusting that the upgrade propagated.' },
        { t: 'p', text: 'Related: [dependency commands](https://snippets.neorgon.com/#cat=devops), [external scan](https://lockdown.neorgon.com/).' }
      ]
    }
  ]
};
