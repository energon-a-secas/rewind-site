export const ch3 = {
  id: 'quick-methods',
  number: 3,
  title: 'Quick Methods',
  summary: 'The first fifteen minutes. Six techniques that resolve most problems before any deep investigation begins.',
  sections: [
    {
      id: 'what-changed',
      number: '3.1',
      title: 'What changed?',
      blocks: [
        { t: 'p', text: 'This is the highest-yield question in troubleshooting. Systems that worked yesterday and fail today were changed, and the change is usually recent, usually small, and usually findable in under five minutes.' },
        { t: 'p', text: 'The technique is time correlation: fix the moment the failure began, then enumerate everything that happened near that moment.' },
        {
          t: 'ol',
          items: [
            'Find the **first** failure, not the alert. Alerts lag by their evaluation window, often several minutes. Searching around the alert time will make you miss the actual trigger and conclude nothing changed.',
            'Widen slightly. Look at a window from about thirty minutes before the first failure. Some changes take effect on the next restart, next cache expiry, or next scheduled run rather than immediately.',
            'Enumerate every change source, not just the one you own.',
            'Rank candidates by how close they are in time and how plausibly they touch the failing path.'
          ]
        },
        { t: 'p', text: 'Change sources people forget:' },
        {
          t: 'ul',
          items: [
            'Feature flag and remote config changes, which deploy instantly and are not in your git history',
            'Infrastructure edits made in a console: IAM, security groups, quotas, DNS',
            'Dependency updates pulled in by a rebuild with no source change',
            'Scheduled jobs, batch runs, and cron that only execute at certain times',
            'Data changes: a bulk import, a migration, one customer\'s record hitting an unexpected shape',
            'Certificate, token, and credential expiry, which is a change that happens with nobody acting',
            'Another team\'s deploy, upstream or downstream of you'
          ]
        },
        { t: 'note', label: 'Trap', text: 'Correlation is a lead, not a verdict. Two things happening at the same time is a reason to investigate one of them first, not a reason to announce a root cause. Say "correlates with" until you can explain the mechanism.' }
      ]
    },
    {
      id: 'reproduce',
      number: '3.2',
      title: 'Can you reproduce it?',
      blocks: [
        { t: 'p', text: 'A reliable reproduction is worth more than any amount of log reading, because it converts debugging from archaeology into experiment. You can test a fix instead of deploying a guess and waiting.' },
        { t: 'p', text: 'Work toward the smallest reproduction you can get:' },
        {
          t: 'ol',
          items: [
            'Reproduce it at all, by any means, even if it takes the full application and a specific user.',
            'Reproduce it deterministically. Same input, same failure, every time.',
            'Shrink it. Remove steps, data, and components until removing anything else makes it stop failing. What remains is very close to the bug.'
          ]
        },
        { t: 'p', text: 'When it will not reproduce, that itself is evidence. Something differs between where it fails and where it does not, and naming that difference is often the whole investigation. Common answers: data, permissions, timing and concurrency, cached state, environment configuration, or which instance you hit.' },
        { t: 'note', label: 'Field note', text: 'If a bug reproduces only in production, resist the urge to debug in production forever. Spend a little time making production-like conditions available somewhere safer. That investment usually pays back inside the same incident.' }
      ]
    },
    {
      id: 'differential',
      number: '3.3',
      title: 'Compare against something that works',
      blocks: [
        { t: 'p', text: 'Differential diagnosis is the fastest way to narrow a large search space. You almost always have a working reference: another environment, another region, another tenant, another endpoint, or the same system an hour ago.' },
        { t: 'p', text: 'The method is mechanical. Put the working case and the broken case side by side, list every difference you can observe, then eliminate differences until the failure moves.' },
        {
          t: 'table',
          head: ['Compare', 'What it isolates'],
          rows: [
            ['Staging vs production', 'Configuration, credentials, data volume, scale, network policy'],
            ['Working region vs failing region', 'Regional infrastructure, quotas, provider incidents, replica lag'],
            ['Working user vs failing user', 'Data shape, permissions, feature flags, plan tier, locale'],
            ['Working endpoint vs failing endpoint', 'The specific code path, its dependencies, its query'],
            ['Now vs an hour ago', 'Anything time correlation missed, including load and expiry'],
            ['Your machine vs CI', 'Environment variables, versions, cached artifacts, clean-checkout assumptions']
          ]
        },
        { t: 'p', text: 'Be systematic about what counts as a difference. Version numbers, environment variables, resource limits, network paths, IAM roles, data volume, and clock skew are all fair game. The difference that matters is frequently one nobody thought to mention, because it has been true for so long that it stopped being visible.' }
      ]
    },
    {
      id: 'read-the-error',
      number: '3.4',
      title: 'Read the whole error',
      blocks: [
        { t: 'p', text: 'Errors are read badly under pressure. People skim the first line, recognise a familiar shape, and act on the recognition rather than the message. The message usually contains the answer.' },
        {
          t: 'ul',
          items: [
            'Read to the **end**. The wrapping exception is the least informative part; the innermost cause is usually the real one. Look for "caused by" and follow it down.',
            'Read the values, not just the words. A path, host, port, or identifier in the message tells you what the code actually tried to do, which is often not what you assumed it would do.',
            'Notice what the error does **not** say. "Connection refused" means something answered and declined; a timeout means nothing answered at all. Those point at very different layers.',
            'Check the timestamp and the source. An error in your log may have originated three services away.',
            'Distinguish the first error from the loudest. Cascading failures bury the trigger under thousands of downstream complaints. Sort ascending and read the first one.'
          ]
        },
        { t: 'note', label: 'Rule', text: 'Accept known warnings. Every mature system logs alarming things that are entirely normal. Learn which ones are background noise in your system, or you will spend an hour chasing a deprecation warning that has been printing since 2023.' }
      ]
    },
    {
      id: 'one-variable',
      number: '3.5',
      title: 'Change one variable at a time',
      blocks: [
        { t: 'p', text: 'This is the rule people break first when they are stressed, and breaking it is what turns a solvable incident into a confusing one.' },
        { t: 'p', text: 'If you change three things and the problem goes away, you have not fixed it. You have four new questions: which change fixed it, do the other two need reverting, did any of them introduce something you have not seen yet, and what do you write in the post-mortem. If the problem gets *worse*, you cannot cleanly step back.' },
        {
          t: 'ol',
          items: [
            'Form one hypothesis.',
            'Make the smallest change that tests it.',
            'Observe, and give it long enough to actually show. Caches, pools, and rolling restarts have lag.',
            'Write down the result, including "no effect", which is real information.',
            'Revert the change if it did nothing, before making the next one. Unreverted no-op changes accumulate into a system nobody understands.'
          ]
        },
        { t: 'note', label: 'Trap', text: 'The exception is genuine emergency mitigation. If revenue is stopped, throw everything you have at restoring service and sort out attribution afterwards. Just be honest that you are mitigating, not diagnosing, and that you will have to come back and find the real cause.' }
      ]
    },
    {
      id: 'search',
      number: '3.6',
      title: 'Search like you mean it',
      blocks: [
        { t: 'p', text: 'Searching well is a skill, and most people search badly by pasting an entire error including their own identifiers, which matches nothing.' },
        {
          t: 'ul',
          items: [
            'Strip the specifics. Remove your hostnames, UUIDs, paths, timestamps, and line numbers. Keep the stable part of the message.',
            'Search the **exact** stable phrase in quotes, plus the library or product name.',
            'Include the version. Behaviour that is a bug in 4.2 is a documented feature in 4.4.',
            'Search the project\'s own issue tracker before the wider web. Closed issues are the best source, because they contain the resolution.',
            'Search your own history too: internal tickets, chat archives, previous post-mortems. There is a real chance your company has already solved this, possibly by you, eighteen months ago.',
            'Read the release notes and changelog between the version that worked and the version that does not. This is underused and frequently answers the question outright.'
          ]
        },
        { t: 'note', label: 'Field note', text: 'When you find a promising answer, check its date and the version it applies to before acting on it. Confidently applying a fix for a five-year-old version of the library is a reliable way to create a second, more interesting problem.' }
      ]
    },
    {
      id: 'ex-deploy',
      number: '3.7',
      title: 'Worked example: 500s that were not the deploy',
      blocks: [
        {
          t: 'example',
          title: 'The obvious suspect was innocent',
          scenario: 'An API starts returning 500s on one endpoint. A deploy went out twelve minutes earlier. Everyone assumes the deploy. The team rolls back. The 500s continue.',
          walk: [
            { step: 'Rollback did not help, so update the theory', text: 'The deploy correlated in time and was still not the cause. This is exactly the trap in 3.1: proximity in time is a lead, not a verdict. The rollback was still the right first move, because it was cheap and reversible.' },
            { step: 'Read the whole error', text: 'The log line everyone had been reading was "Internal server error". Following the chain to the innermost cause gives "permission denied" against an object storage bucket, with the bucket name in the message.' },
            { step: 'Note what the error is not', text: 'Not "not found", not a timeout. Something answered and refused. That points at authorisation, not networking and not a missing object.' },
            { step: 'Ask what changed, more broadly', text: 'No application change explains it, but the failure is a permission. The cloud audit log shows an IAM policy on that bucket was edited at 09:58, four minutes before the first 500 and eight minutes before the deploy. A different team was tightening permissions across the account.' },
            { step: 'Explain the gap', text: 'The four-minute delay was credential caching. The running instances held valid cached credentials until refresh, which is why the failure appeared to start after the deploy rather than after the policy change.' },
            { step: 'Fix and confirm', text: 'The policy is corrected to include the service role. Errors stop. The deploy is rolled forward again with no issue, confirming it was never involved.' }
          ],
          lesson: 'Three techniques did the work: read to the innermost cause, notice which failure mode the error is, and widen the change search past your own repository. The credential cache also explains why the naive timeline pointed at the wrong suspect, which is a good argument for widening the window in 3.1 rather than looking only at the exact minute.'
        }
      ]
    }
  ]
};
