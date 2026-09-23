export const ch8 = {
  id: 'after',
  number: 8,
  title: 'Experience and Sharing',
  summary: 'How troubleshooting skill compounds, and how to make it compound for other people instead of only for you.',
  sections: [
    {
      id: 'pattern-recognition',
      number: '8.1',
      title: 'What experience actually is',
      blocks: [
        { t: 'p', text: 'Engineers who resolve incidents quickly are rarely doing anything the rest of the team could not do. They are recognising a shape they have seen before, which lets them skip most of the search space and start with a strong prior.' },
        { t: 'p', text: 'That is good news, because pattern recognition is learnable and it does not require you to have caused the outages personally. It requires exposure and reflection: reading post-mortems, sitting in on incidents you are not leading, and asking the person who fixed it what the signal was that pointed them there.' },
        { t: 'p', text: 'What experience buys you specifically:' },
        {
          t: 'ul',
          items: [
            '**A better first guess.** You start three steps in rather than at the beginning.',
            '**Better question ordering.** You check the cheap, high-yield thing first, without deliberating about it.',
            '**Calibration.** You know when something is genuinely unusual, which is the signal that tells you to slow down and stop pattern matching.',
            '**Escalation judgement.** You know which problems are yours and which will still be yours in three hours if you do not ask now.',
            '**Knowing when to stop.** Recognising an unproductive line of investigation early is most of the speed difference between a senior and a junior responder.'
          ]
        },
        { t: 'note', label: 'Trap', text: 'Experience also produces false confidence. "I have seen this before" is a hypothesis, not a diagnosis, and a familiar shape with an unfamiliar cause is exactly the incident that runs the longest, because the responder stops looking. Verify even when you are sure. Especially when you are sure.' }
      ]
    },
    {
      id: 'write-runbook',
      number: '8.2',
      title: 'Write the runbook while it is fresh',
      blocks: [
        { t: 'p', text: 'The best time to write a runbook is immediately after the incident, while you still remember which dashboard was useful and which query you had to look up. A week later you will remember the story and not the details, and the details are the entire value.' },
        { t: 'p', text: 'A runbook that is worth having:' },
        {
          t: 'ul',
          items: [
            'Starts with the **symptom**, because that is what the reader has. Not the cause, which is what you have.',
            'Names the exact dashboard, query, log location, or command. Links, not descriptions. "Check the metrics" helps nobody at 3am.',
            'States what a healthy value looks like. A number with no baseline is not actionable.',
            'Says what to do, in order, including the mitigation before the diagnosis.',
            'Says who to escalate to and when.',
            'Records what it is **not**, if you spent time ruling something out. That saves the next person the same hour.'
          ]
        },
        { t: 'note', label: 'Field note', text: 'Runbooks rot. Add the date and review them when they are used. A confidently wrong runbook is worse than none, because it is trusted at exactly the moment nobody has capacity to question it.' }
      ]
    },
    {
      id: 'post-mortems',
      number: '8.3',
      title: 'Post-mortems that people are willing to write',
      blocks: [
        { t: 'p', text: 'A post-mortem exists to change the system, not to establish who was at fault. The moment it becomes about fault, people stop volunteering the details that make it useful, and you lose the only real source of information you had.' },
        {
          t: 'ul',
          items: [
            '**Timeline first, with real timestamps.** This is why you kept notes during the incident. Reconstructed timelines are tidier and less true.',
            '**Ask why the system allowed it,** not why the person did it. "A single unreviewed config change could take down checkout" is actionable. "Ana pushed a bad config" is not.',
            '**Record what made it hard to diagnose,** separately from what caused it. Missing metrics, misleading alerts, and unclear ownership are findings that will outlive this specific bug.',
            '**Note what went well.** If the rollback was fast, say why, so it stays fast.',
            '**Assign follow-ups to a person and a date,** or they will not happen. An unowned action item is a wish.',
            '**Keep it short enough to be read.** Nobody reads twelve pages, and an unread post-mortem changes nothing.'
          ]
        },
        { t: 'p', text: 'Be careful with counterfactuals. "They should have noticed" is not analysis; it is hindsight. The question worth answering is what information was available at the time, and what would have had to be different for the right action to be the obvious one.' }
      ]
    },
    {
      id: 'spof',
      number: '8.4',
      title: 'Do not be a single point of failure',
      blocks: [
        { t: 'p', text: 'Being the only person who can fix something feels like security and is not. It means you are called on holiday, you cannot be promoted off the system, and the organisation has an outage risk with your name on it.' },
        {
          t: 'ul',
          items: [
            'Write down what you know, especially the parts that feel too obvious to write. Those are precisely the parts nobody else knows.',
            'Let someone else drive the next similar incident while you watch and stay quiet. Watching is how the knowledge transfers; narrating is how it does not.',
            'Rotate the pager honestly, without quietly handling everything yourself in the background.',
            'When you answer a question in chat, put the answer somewhere durable afterwards. Chat is where knowledge goes to be unfindable.'
          ]
        },
        { t: 'note', label: 'Field note', text: 'The most common beneficiary of your documentation is you, in eight months, with no memory of having solved this. Write for that person. They are the most reliably grateful audience you will ever have.' }
      ]
    }
  ]
};
