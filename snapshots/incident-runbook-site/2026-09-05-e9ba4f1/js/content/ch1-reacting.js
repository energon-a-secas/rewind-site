export const ch1 = {
  id: 'reacting',
  number: 1,
  title: 'Reacting to a Problem',
  summary: 'Diagnose before you act. The first five minutes decide whether the next two hours are useful.',
  sections: [
    {
      id: 'three-questions',
      number: '1.1',
      title: 'Ask three questions before you touch anything',
      blocks: [
        { t: 'p', text: 'The instinct when something breaks is to start fixing. Resist it for sixty seconds. An engineer who understands the shape of the problem solves it faster than one who started typing immediately, and they do it without making a second problem.' },
        { t: 'p', text: 'Three questions cover most of what you need:' },
        {
          t: 'defs',
          items: [
            { term: 'How bad is it?', text: 'Production down is not the same as a staging deploy failing, which is not the same as a flaky test. The answer sets your budget: how much risk you may take, how fast you must move, and whether you are allowed to think.' },
            { term: 'Who is blocked?', text: 'One engineer, one team, or every customer. This is the number that goes to management, and it is the number that decides whether you keep debugging or reach for **Plan B**.' },
            { term: 'Can it wait?', text: 'Some problems are genuinely fine until Tuesday. Saying so out loud, early, is one of the highest-value things a responder does. It converts a fire into a ticket.' }
          ]
        },
        { t: 'note', label: 'Rule', text: 'Severity is a decision, not an observation. Someone has to make it. If nobody else has, you have, whether you said it out loud or not, so say it out loud.' }
      ]
    },
    {
      id: 'scope',
      number: '1.2',
      title: 'Establish scope and blast radius',
      blocks: [
        { t: 'p', text: 'Scope is the cheapest information you can buy, and it eliminates whole categories of cause for free. Before forming any theory, find the edges of the problem.' },
        {
          t: 'ul',
          items: [
            '**Who is affected?** One user, one tenant, one region, everyone. If it is one user, stop looking at the deploy and start looking at that user\'s data.',
            '**Where does it work?** If staging is fine and production is not, the difference between them is your suspect list, and that list is finite.',
            '**When did it start?** Not "today". The timestamp of the first failure. Everything that changed before it is a candidate, everything after is noise.',
            '**Is it total or partial?** Every request failing points at config, credentials, or a dead dependency. One request in twenty failing points at a bad instance, a race, or a resource limit.',
            '**Is it getting worse?** A flat error rate and a climbing one demand different responses. Climbing means you are on a clock.'
          ]
        },
        { t: 'note', label: 'Field note', text: 'Partial failure is the most commonly misdiagnosed shape. When one node in a pool is broken, the symptom is intermittent and every theory seems to half-fit. If a problem reproduces only sometimes and you cannot find a pattern, check whether you are hitting more than one instance.' }
      ]
    },
    {
      id: 'usual-suspects',
      number: '1.3',
      title: 'The four usual suspects',
      blocks: [
        { t: 'p', text: 'Most incidents are not exotic. Before you go looking for a subtle concurrency bug, rule out the four things that cause an unreasonable share of real outages.' },
        {
          t: 'defs',
          items: [
            { term: 'Naming', text: 'A resource is referenced by a name that no longer resolves to what you think. A renamed bucket, a recreated queue with the same name and different permissions, a service discovery entry pointing at a dead pod, an environment prefix that is right in one place and wrong in another. The code is correct and the name is a lie.' },
            { term: 'Hardcoded paths and values', text: 'A path, endpoint, region, or account ID written into the source instead of configuration. These break silently and often much later than the change that doomed them, which is what makes them expensive. They usually surface when something moves.' },
            { term: 'Version mismatch', text: 'Library, runtime, container base image, API version, schema version, client and server disagreeing. Often introduced by a rebuild rather than a code change, which is why "we did not deploy anything" is not the same as "nothing changed".' },
            { term: 'Infrastructure changed outside a deploy', text: 'An IAM policy tightened, a firewall or security group rule edited, a certificate rotated, a quota lowered, a DNS record updated, a node pool replaced. No commit, no deploy, no trace in the place you usually look. This is the one that wastes the most hours, because your instinct sends you into the application code.' }
          ]
        },
        { t: 'note', label: 'Trap', text: '"Nothing changed" is almost never true. It usually means "nothing *I* changed" or "nothing in the repository I am looking at". Certificates expire on their own. Disks fill on their own. Tokens reach their expiry on their own. Time is a change.' }
      ]
    },
    {
      id: 'talking-points',
      number: '1.4',
      title: 'What leadership actually needs from you',
      blocks: [
        { t: 'p', text: 'You will be asked for a status update while you are mid-investigation, and it will feel like an interruption. It is cheaper to pre-empt it. A manager who is kept informed stops asking, and a manager who is not will keep asking, at increasing frequency, which costs you far more time than the update would have.' },
        { t: 'p', text: 'They need four things, and none of them is a root cause:' },
        {
          t: 'ol',
          items: [
            '**Impact.** Who cannot do what, right now.',
            '**Status.** What you are doing at this moment, in one sentence.',
            '**Next checkpoint.** When you will speak again. Give a time, not "soon".',
            '**What you need.** Access, a second person, a decision about rolling back, permission to degrade a feature.'
          ]
        },
        { t: 'p', text: 'Notice what is absent: the cause, the fix, and the ETA for resolution. You usually do not have those yet, and inventing them creates a commitment you will have to walk back. "I do not know the cause yet, next update at 10:30" is a complete and professional answer.' },
        {
          t: 'code',
          label: 'Status update template',
          text: 'Impact:  Checkout failing for ~15% of users since 09:14.\nStatus:  Correlating with the 09:12 config change. Rollback prepared.\nNext:    Update at 10:30, sooner if I roll back.\nNeed:    Decision on rolling back the pricing flag.'
        },
        { t: 'note', label: 'Rule', text: 'Understanding scope reduces your own stress as much as it informs anyone else. Half of incident panic is not knowing how bad it is, and that half is entirely curable with five minutes of looking.' }
      ]
    },
    {
      id: 'ex-first-page',
      number: '1.5',
      title: 'Worked example: the 09:14 page',
      blocks: [
        {
          t: 'example',
          title: 'Checkout error rate above threshold',
          scenario: 'You are paged at 09:14. The alert says checkout 5xx rate is above 5%. You have no other information. It is your first day carrying the pager for this service.',
          walk: [
            { step: 'Ask how bad', text: 'Open the dashboard. Error rate is 15% and flat, not climbing. Checkout is failing for roughly one user in seven. That is severe but not total, and it is not accelerating. You have time to think, and you do not have time for lunch.' },
            { step: 'Ask who is blocked', text: 'Checkout means revenue and customers. This is a real incident, not a ticket. You post an initial impact note before doing anything else, because you know you will be asked in ten minutes anyway.' },
            { step: 'Find the edges', text: 'Staging is healthy. The failures are not confined to one region and not confined to one customer. Every failing request returns 500, and 85% of requests still succeed. Partial failure, evenly spread.' },
            { step: 'Fix the start time', text: 'The first failure is 09:12, not 09:14. The alert lagged by two minutes, which is normal, and using the alert time instead of the first-failure time would have made you dismiss the real cause as "after the problem started".' },
            { step: 'Look at what changed at 09:12', text: 'No deploy. But the change log shows a pricing feature flag moved to 20% rollout at 09:11. Fifteen percent failure against a twenty percent rollout is close enough to be a strong lead, and the small gap is explained by users who never reach checkout.' },
            { step: 'Act on the lead, not the certainty', text: 'You do not yet know why the flag breaks checkout, and you do not need to. You set the flag back to 0%. Error rate returns to baseline within a minute. Now you have an outage that lasted twelve minutes instead of an investigation that lasts two hours with customers failing throughout it.' }
          ],
          lesson: 'The cause was found by scope and time correlation alone, with no code read and no log dived. Note also the two-minute alert lag: if you had searched for changes at 09:14 you would have found nothing and concluded that nothing changed.'
        }
      ]
    }
  ]
};
