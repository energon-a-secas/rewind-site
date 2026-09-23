export const ch7 = {
  id: 'plan-b',
  number: 7,
  title: 'Plan B',
  summary: 'What to do when you are blocked. Restoring service and finding the cause are different jobs, and you should almost always do them in that order.',
  sections: [
    {
      id: 'two-jobs',
      number: '7.1',
      title: 'Restore first, understand second',
      blocks: [
        { t: 'p', text: 'During an incident there are two separate jobs: make the pain stop, and find out why it happened. They feel like one job and they are not, and conflating them is the most common reason outages run long.' },
        { t: 'p', text: 'Understanding is more satisfying, which is exactly why engineers keep debugging while customers are down. If you can restore service without knowing the cause, do that first. The evidence is preserved in logs, metrics, and the artifact you rolled back from, and you can investigate at your leisure with nobody suffering.' },
        { t: 'note', label: 'Rule', text: 'Ask early: "is there something I can do right now that makes this stop, even if I do not understand it?" If the answer is yes, do it, then investigate. The only reason to delay is if the mitigation would destroy the evidence you need.' }
      ]
    },
    {
      id: 'rollback',
      number: '7.2',
      title: 'Roll back',
      blocks: [
        { t: 'p', text: 'If the failure correlates with a change and the change is reversible, reverse it. You do not need certainty. A rollback that turns out to be unnecessary costs a deploy cycle, and continuing to debug while customers fail costs considerably more.' },
        {
          t: 'ul',
          items: [
            'Roll back to a **known good** state, not to "probably fine". Name the specific version and be sure it was healthy in production.',
            'Check that the rollback is genuinely reversible first. Database migrations, one-way data transformations, and consumed messages are where "roll back" quietly stops being possible.',
            'Roll back one thing. Reverting four changes at once leaves you unable to say which was the problem, which means you cannot safely roll any of them forward.',
            'Watch the metric that alerted, and give it a full observation window. Caches, connection pools, and rolling restarts all delay the effect, and declaring failure too early leads people to roll back the rollback.',
            'If the rollback does **not** fix it, that is significant information. Record it. The change was probably not the cause, as in the worked example in 3.7.'
          ]
        },
        { t: 'note', label: 'Trap', text: 'A rollback that is never tested is a plan, not a capability. This is why 2.3 asks whether you rolled back this quarter. The middle of an outage is a bad time to discover that the migration was one-way.' }
      ]
    },
    {
      id: 'kill-switches',
      number: '7.3',
      title: 'Kill switches and flags',
      blocks: [
        { t: 'p', text: 'A feature flag is faster than a rollback and more precise. It takes seconds, it needs no deploy, and it removes exactly one behaviour rather than reverting everything shipped since the last good version.' },
        {
          t: 'ul',
          items: [
            'Turn off the specific feature rather than the whole release, when you can.',
            'Reduce a rollout percentage instead of disabling outright, if you want to confirm the correlation while limiting harm.',
            'Disable the expensive path. Turning off a recommendation engine, a non-essential enrichment, or an analytics write often restores the critical path immediately.',
            'Remember flags are also a cause. Check what was toggled recently before you assume they are only a remedy.'
          ]
        },
        { t: 'p', text: 'If your system has no kill switch for its risky paths, that is the finding to take out of this incident. Add one for anything you would want to disable at 3am.' }
      ]
    },
    {
      id: 'degrade',
      number: '7.4',
      title: 'Degrade instead of failing',
      blocks: [
        { t: 'p', text: 'Between "working" and "down" there is usually a wide band that nobody has thought about in advance. A checkout that cannot show recommendations is a working checkout. A search that returns slightly stale results is a working search.' },
        {
          t: 'table',
          head: ['Instead of', 'Degrade to'],
          rows: [
            ['Failing when a non-critical dependency is down', 'Skipping that feature and serving the rest'],
            ['Serving errors during a database problem', 'Serving cached or stale data with a notice'],
            ['Timing out under load', 'Shedding load and queueing, or rate limiting the least critical traffic'],
            ['Full outage during a migration', 'Read-only mode'],
            ['Blocking on a slow third party', 'Accepting the request and processing it asynchronously']
          ]
        },
        { t: 'p', text: 'Degradation is far easier to build before you need it, which is why it appears in the preemptive chapter. Mid-incident, the realistic version is usually cruder: disable the feature, extend a timeout, serve from cache, put up a banner. That is fine. Crude and working beats elegant and down.' },
        { t: 'note', label: 'Field note', text: 'Tell people what is degraded, both users and internal teams. Silent degradation generates a second wave of confused reports from people who think they have found a new bug.' }
      ]
    },
    {
      id: 'ask-for-help',
      number: '7.5',
      title: 'Ask for help earlier than feels comfortable',
      blocks: [
        { t: 'p', text: 'The right moment to ask is well before the moment most people ask. Set the trigger in advance, as described in 2.5, because in the moment you will always feel like you are five minutes from solving it. You have felt that way for the last forty minutes.' },
        { t: 'p', text: 'Reasonable triggers:' },
        {
          t: 'ul',
          items: [
            'Thirty minutes with no new information, only new guesses.',
            'You need access or permissions you do not have. Ask immediately, this one has no upside to delaying.',
            'The problem is in a system you do not know, and someone nearby knows it well.',
            'The incident is severe and you are alone. A second person catches the mistake you are about to make.',
            'It is late and you are tired. See 2.2, and note that this is the trigger people ignore most.'
          ]
        },
        { t: 'p', text: 'Knowing when to say you need more resources or more time is not weakness. It is the judgement the role is actually asking for, and it is the difference between a fifteen-minute fix and a two-hour outage where the last ninety minutes were pride.' }
      ]
    },
    {
      id: 'stopping',
      number: '7.6',
      title: 'Stopping',
      blocks: [
        { t: 'p', text: 'Sometimes the correct action is to stop. If service is restored and only the root cause is unknown, the incident is over and an investigation has begun. Those have very different urgency, and treating the second like the first is how people burn out.' },
        { t: 'p', text: 'Before you stop, leave the problem in a state someone else can pick up:' },
        {
          t: 'ol',
          items: [
            'Confirm the current state is stable and say so explicitly, including anything left degraded or any flag left off.',
            'Post the summary from 6.6 where the next person will find it.',
            'Say clearly what is unresolved, so nobody assumes it was fixed. Half-fixed problems that look fixed cause the next incident.',
            'Set a time to continue, and put the follow-ups somewhere real rather than in your memory.'
          ]
        },
        { t: 'note', label: 'Rule', text: 'A mitigated incident with an unknown cause is not finished. Write the follow-up down before you close the channel, because the pressure to investigate evaporates the moment the graphs go green and it does not come back until it happens again.' }
      ]
    },
    {
      id: 'ex-rollback',
      number: '7.7',
      title: 'Worked example: choosing not to understand it yet',
      blocks: [
        {
          t: 'example',
          title: 'Forty minutes of debugging that should have been four minutes of rollback',
          scenario: 'A release goes out at 16:00. At 16:05 the signup error rate climbs to 30%. The engineer who shipped it recognises the area, believes the bug is a null check in the new validation code, and starts writing a fix. Signups stay broken while they work.',
          walk: [
            { step: 'The trap', text: 'The engineer is not being lazy. They are being efficient in the wrong dimension, optimising for a clean forward fix instead of for time with customers broken. This is the most common form the mistake takes: it looks like diligence.' },
            { step: 'What the cost actually was', text: 'The fix took twenty minutes to write, ten to review, and ten to deploy. Signups were broken for forty-five minutes. A rollback would have taken four.' },
            { step: 'The compounding error', text: 'The forward fix was wrong. The null was a symptom; the real cause was a changed field name in the request payload. Error rate dropped to 12% instead of zero, and now there were two changes in production to reason about.' },
            { step: 'What should have happened at 16:06', text: 'Roll back to the previous release. Signups recover in four minutes. The incident is over. The broken artifact still exists, the logs still exist, and the engineer investigates with no time pressure and no customers affected.' },
            { step: 'The diagnosis is better afterwards too', text: 'Investigating calmly, they would have compared the request payload against the schema and found the renamed field in minutes, rather than pattern-matching to a null check while under pressure and while a manager asked for updates.' }
          ],
          lesson: 'Restoring service and finding the cause are different jobs. Doing them in the wrong order cost forty-one minutes of broken signups and produced a wrong fix, because diagnosis under time pressure is worse diagnosis. The correlation was strong and the change was reversible, which is the entire test for rolling back.'
        }
      ]
    }
  ]
};
