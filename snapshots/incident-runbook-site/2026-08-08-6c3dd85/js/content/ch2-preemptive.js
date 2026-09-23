export const ch2 = {
  id: 'preemptive',
  number: 2,
  title: 'Preemptive Strategies',
  summary: 'The work that makes an incident survivable happens before the incident. Most of it is asking questions while nothing is on fire.',
  sections: [
    {
      id: 'negative-thinking',
      number: '2.1',
      title: 'Negative thinking',
      blocks: [
        { t: 'p', text: 'Negative thinking is the deliberate habit of asking how a system fails rather than how it works. It is unpopular in planning meetings and it is the single highest-return habit in operations.' },
        { t: 'p', text: 'Applied to a design, it sounds like: what happens when this dependency is slow rather than down? What happens if this runs twice? What happens if this queue is never drained? What is the state of the system if this process dies exactly here?' },
        { t: 'p', text: 'Applied to yourself, it sounds like: what would make me unable to fix this at 3am? The usual answers are no access, no documentation, no idea who owns it, and no way to roll back. Every one of those is fixable on a calm Tuesday and unfixable during the incident.' },
        {
          t: 'ul',
          items: [
            'Run a pre-mortem before a risky launch. Assume it failed, then write down why. People will say things in that framing that they will not say when asked "any concerns?"',
            'For each dependency, name what your system does when it is unavailable. If the answer is "I do not know", that is the finding.',
            'Ask which failure would be invisible. Silent failures are worse than loud ones, and they are found only by looking for them on purpose.'
          ]
        }
      ]
    },
    {
      id: 'bounds',
      number: '2.2',
      title: 'Set your bounds while you are rested',
      blocks: [
        { t: 'p', text: 'Fatigue does not announce itself. It shows up as a series of small, reasonable-feeling decisions that you would not have made at 10am. The defence is a rule you set in advance, because a rule made in advance does not need to be argued for at 2am by a tired person who wants to keep going.' },
        {
          t: 'defs',
          items: [
            { term: 'The 23:00 rule', text: 'Do not troubleshoot past 23:00 unless production is genuinely down. The error rate of a tired engineer exceeds the cost of waiting until morning. A non-critical problem you stop working on at midnight is usually solved in twenty minutes at 09:00, and the twenty minutes are safer.' },
            { term: 'Slow down on destructive operations', text: 'Deleting, dropping, truncating, force-pushing, terminating, and scaling to zero deserve a pause and, when possible, a second pair of eyes. Almost every incident that got dramatically worse got worse at exactly this step. Ask whether the operation is reversible before running it, not after.' },
            { term: 'Do not compound the incident', text: 'Making three changes at once during an outage means you will not know which one helped, and if things get worse you cannot cleanly undo. One change, observe, then decide.' },
            { term: 'Hand over rather than push through', text: 'If someone else is fresh and competent, the handover costs fifteen minutes and buys a working brain. That is a good trade far earlier than most people accept.' }
          ]
        },
        { t: 'note', label: 'Rule', text: 'Write your bounds down and tell your team about them. A boundary that only exists in your head will be negotiated away by your own tired judgement.' }
      ]
    },
    {
      id: 'questions',
      number: '2.3',
      title: 'Questions worth answering while things are calm',
      blocks: [
        { t: 'p', text: 'These are cheap to answer today and very expensive to answer during an outage. Work through them for any system you are on call for.' },
        {
          t: 'checklist',
          items: [
            { item: 'What breaks when my service goes down?', how: 'Name the downstream teams and features by name. If you cannot, you do not know your own blast radius, and you will underestimate severity when it matters.' },
            { item: 'What does my service do when each dependency is unavailable?', how: 'Test it, do not assume. Graceful degradation that has never been exercised is a hypothesis, not a feature.' },
            { item: 'Which failures would page me, and which would be silent?', how: 'Compare your alert list against your failure list. The gap is the set of outages a customer will report before you notice.' },
            { item: 'Do I have a health or diagnostic endpoint, and does it check anything real?', how: 'A health check that returns 200 without touching the database or downstream dependencies will report healthy through an entire outage.' },
            { item: 'How do I roll back, and has it been tested this quarter?', how: 'Rollback paths rot. Migrations make them one-way, and nobody notices until the day it matters.' },
            { item: 'Do I have the access I need, right now?', how: 'Check the production console, the logging stack, the cloud account, the runbook repository. Discovering that your permissions expired is a terrible way to start an incident.' },
            { item: 'Who owns each thing I depend on, and how do I reach them out of hours?', how: 'A name and an escalation path. "The platform team" is not a name, and their Slack channel is not staffed at 3am.' }
          ]
        }
      ]
    },
    {
      id: 'ask-around',
      number: '2.4',
      title: 'Ask around and find out',
      blocks: [
        { t: 'p', text: 'The most valuable documentation in most companies is undocumented and lives in people. Somebody already knows that the reporting job locks a table every night at 02:00, that the payments client was never upgraded because the vendor library breaks on the new runtime, and that this exact alert has fired four times before and was DNS every time.' },
        { t: 'p', text: 'Find those people before you need them.' },
        {
          t: 'defs',
          items: [
            { term: 'QA', text: 'They know the edge cases, the flaky areas, and which parts of the product behave differently under load. They have often reproduced your bug already in a form nobody escalated.' },
            { term: 'Long-tenured developers', text: 'They carry the history: why a thing is written the way it is, which module is load-bearing, and what previous attempts to change it broke. This is the knowledge that is nowhere in the repository.' },
            { term: 'Your manager and other managers', text: 'They know the technical debt that was consciously accepted, what is currently being migrated, which vendor contract is in dispute, and what other teams are shipping this week. Cross-team change is invisible from inside your own repo.' },
            { term: 'Support and account teams', text: 'They see failure before your monitoring does, and they see the pattern across customers that looks like noise in your metrics.' }
          ]
        },
        { t: 'note', label: 'Field note', text: 'Ask "what usually breaks around here, and what did the last person on call get paged for?" It is a better question than any architecture diagram, and people enjoy answering it.' }
      ]
    },
    {
      id: 'ladder',
      number: '2.5',
      title: 'Know the ladder before you climb it',
      blocks: [
        { t: 'p', text: 'Escalation is a sequence, not a panic. Learn the order while you are calm so that during an incident you are choosing a rung rather than inventing a process.' },
        {
          t: 'table',
          head: ['Rung', 'You own', 'Escalate when'],
          rows: [
            ['Infrastructure', 'Network, DNS, certificates, permissions, capacity, the platform itself', 'The application is fine but cannot reach, resolve, authenticate, or allocate'],
            ['Development', 'Code, config, migrations, flags, dependencies you ship', 'The failure follows a change you or your team made'],
            ['Other teams', 'Services inside the company that you call or that call you', 'Their contract, their latency, or their deploy is the trigger'],
            ['External dependencies', 'Vendors, APIs, payment providers, identity providers', 'Their status page, their rate limits, or their expired credential explains it'],
            ['Cloud provider', 'The substrate under all of the above', 'Multiple unrelated systems degrade at once in one region']
          ]
        },
        { t: 'p', text: 'Two failure modes are common here. Escalating too early burns other people\'s time and your credibility. Escalating too late is worse, because it turns a fifteen-minute fix into a two-hour outage where the last ninety minutes were you being stubborn. The second mistake is far more expensive than the first, so bias toward asking.' },
        { t: 'note', label: 'Rule', text: 'Set an escalation trigger before you start, not during. "If I have no working theory by 10:00, I page the platform team." A pre-committed trigger survives contact with your own optimism.' }
      ]
    },
    {
      id: 'ex-premortem',
      number: '2.6',
      title: 'Worked example: a pre-mortem that paid for itself',
      blocks: [
        {
          t: 'example',
          title: 'Pre-mortem before a payment provider migration',
          scenario: 'Your team is switching payment providers next month. The plan is a flag-controlled cutover: flip to the new provider, watch, flip back if needed. Everyone is comfortable. You run a thirty-minute pre-mortem anyway, framed as "it is six weeks from now and this went badly, why?"',
          walk: [
            { step: 'The framing does its job', text: 'Asked for concerns directly, the room said none. Asked to explain a failure that already happened, the room produced nine causes in twenty minutes. The framing is the whole technique.' },
            { step: 'A finding nobody had considered', text: 'Someone points out that flipping back does not un-charge a customer. In-flight transactions on the new provider would be invisible to the old one, so a rollback would leave charged customers with no order.' },
            { step: 'A second finding about credentials', text: 'The new provider credentials are set to expire in ninety days, and nobody owns the renewal. That is comfortably after launch, which is exactly when everyone will have stopped watching.' },
            { step: 'A third, about visibility', text: 'The dashboard tracks payment success rate but not payment *latency*. If the new provider is slow rather than broken, the flag stays on, checkout conversion quietly falls, and nobody is paged.' },
            { step: 'The work that resulted', text: 'A reconciliation job for in-flight transactions, a calendar owner for the credential, and a p95 latency panel with an alert. Three days of work, agreed a month in advance, done calmly.' }
          ],
          lesson: 'None of the three would have been found by asking "any concerns?", and all three would have been found the hard way during the cutover. The rollback gap in particular would have been discovered at the worst possible moment, while deciding whether to roll back.'
        }
      ]
    }
  ]
};
