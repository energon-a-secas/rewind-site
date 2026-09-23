export const ch9 = {
  id: 'classics',
  number: 9,
  title: 'The Classics',
  summary: 'The small set of causes that account for an unreasonable share of real incidents. Check these before anything clever.',
  sections: [
    {
      id: 'why-classics',
      number: '9.1',
      title: 'Why the same things keep winning',
      blocks: [
        { t: 'p', text: 'The causes in this chapter are famous jokes among engineers, and they keep being the answer. They persist for a structural reason, not because people are careless: each one fails in a way that produces a symptom pointing somewhere else.' },
        { t: 'p', text: 'They are also cheap to check. Ruling out all six takes about ten minutes, and that is a good trade against the chance that one of them is the whole incident.' }
      ]
    },
    {
      id: 'the-list',
      number: '9.2',
      title: 'The list',
      blocks: [
        {
          t: 'defs',
          items: [
            { term: 'It is the cache', text: 'Application cache, CDN, DNS cache, build cache, browser cache, or a stale artifact registry. Caching failures are hard because the system is behaving correctly and serving the wrong reality. The tell is a fix that does not take effect, or a change that works for you and not for others. Ask what is cached, where, and for how long, then check whether you are looking at data or at a memory of data.' },
            { term: 'It is DNS', text: 'Resolution, propagation, TTL, split-horizon differences between networks, stale entries in a resolver you did not know existed, or a service discovery record pointing at something that is gone. DNS earns its reputation because the failure appears in the application, several layers from the actual problem, and because it resolves correctly from your laptop while failing inside the cluster. Always resolve from the affected host.' },
            { term: 'The certificate expired', text: 'A leaf, an intermediate, a client certificate, or a signing key. This is the purest example of a change that happens with nobody acting, which is why "nothing changed" is so often wrong. Auto-renewal fails silently far more often than anyone expects, usually because the renewal succeeded and nothing reloaded it. Check the expiry date, the chain, and the hostname it is issued for.' },
            { term: 'Someone changed an IAM policy', text: 'A permission tightened, a role edited, a trust policy narrowed, a key rotated. It leaves no trace in your repository, your deploys, or your dashboards, and it commonly happens during an unrelated security cleanup by a team you have never spoken to. Credential caching often delays the symptom by minutes, which makes the timeline point at the wrong suspect. The cloud audit log is the place to look.' },
            { term: 'It works in development', text: 'Almost always configuration, data, scale, permissions, or network policy. Your machine has different environment variables, a smaller and cleaner dataset, broader permissions, no network restrictions, and a single instance with no concurrency. Rather than arguing about it, enumerate the differences as in 3.3, because one of them is the answer and the list is shorter than it feels.' },
            { term: 'Nobody uses that feature in production', text: 'A code path that has never really been exercised, a config option that has been wrong since it was written, a fallback that has never been triggered, an alert that has never fired. It works until the day something makes it run, and then it fails in a way that surprises everyone because it has been "working" for two years. Untested paths are not working paths. They are unobserved ones.' }
          ]
        }
      ]
    },
    {
      id: 'ten-minute-pass',
      number: '9.3',
      title: 'The ten minute pass',
      blocks: [
        { t: 'p', text: 'When you have no lead and no theory, run this. It is deliberately shallow and it resolves a surprising number of incidents outright.' },
        {
          t: 'checklist',
          items: [
            { item: 'What is the first failure timestamp, precisely?', how: 'Not the alert time. Everything else depends on getting this right.' },
            { item: 'What changed in the thirty minutes before it?', how: 'Deploys, flags, config, infrastructure, other teams. All five sources, not just your repository.' },
            { item: 'Does it work anywhere?', how: 'Another environment, region, user, or endpoint. A working reference makes the rest of the investigation a comparison.' },
            { item: 'What does the innermost error actually say?', how: 'Follow the causes to the bottom. Read the values, not just the words.' },
            { item: 'Any certificate or credential expiring around now?', how: 'Free to check, and it is a genuine change even though nobody acted.' },
            { item: 'Is anything cached between me and the truth?', how: 'CDN, application cache, DNS, build artifacts. Check before concluding a fix did not work.' },
            { item: 'Is the monitoring telling me the truth?', how: 'A broken metrics pipeline looks exactly like a broken service.' }
          ]
        },
        { t: 'note', label: 'Rule', text: 'If the ten minute pass produces nothing, stop guessing and switch to a long method from chapter 4. The pass is designed to catch the common cases fast. When it misses, running it again more carefully is not the answer, and structure is.' }
      ]
    }
  ]
};
