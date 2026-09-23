export const ch5 = {
  id: 'understanding',
  number: 5,
  title: 'Understanding Is Half the Battle',
  summary: 'Techniques for getting the problem out of your head and into a form you can actually reason about.',
  sections: [
    {
      id: 'working-memory',
      number: '5.1',
      title: 'Why this chapter exists',
      blocks: [
        { t: 'p', text: 'A hard problem exceeds what you can hold in your head, and stress shrinks the amount you can hold. That combination is why competent engineers go in circles during incidents: not from lack of skill, but because the problem no longer fits in working memory and every new fact pushes an old one out.' },
        { t: 'p', text: 'Every technique here does the same thing. It moves the problem out of your head and onto something external that does not forget, so your attention can go to reasoning instead of remembering.' },
        { t: 'note', label: 'Rule', text: 'If you are ten minutes into a problem and you have written nothing down, you are already relying on memory you do not have.' }
      ]
    },
    {
      id: 'notes',
      number: '5.2',
      title: 'Notes are a debugging tool, not paperwork',
      blocks: [
        { t: 'p', text: 'Keep a running log while you work. Not a formal document, a scratch file with timestamps. It costs a few seconds per entry and pays for itself several times in any investigation over twenty minutes.' },
        { t: 'p', text: 'What it buys you:' },
        {
          t: 'ul',
          items: [
            'You stop repeating checks you already did, which is the single largest source of wasted time in long incidents.',
            'You can hand over instantly. A colleague joining at hour two reads the file instead of asking you to narrate, and you keep working while they catch up.',
            'The timeline for the post-mortem writes itself, while the details are still true. Reconstructing it the next day produces a tidier and less accurate story.',
            'Writing forces you to state things precisely, and imprecision is where wrong assumptions hide. "The database is slow" survives in your head; it does not survive being typed next to a number.'
          ]
        },
        {
          t: 'code',
          label: 'Incident scratch log',
          text: '14:22  Paged. checkout p99 6s, was 400ms. All regions. Not climbing.\n14:24  No deploy since 11:03. Change log clean.\n14:27  DB CPU 12%, slow query log empty. Not the DB itself.\n14:31  RPS flat vs yesterday. Not load.\n14:35  ?? pool metrics not exported. Cannot see saturation. ADD LATER\n14:41  Payment client p99 = 40ms (added timing). Not the provider.\n14:52  pg_locks sample during spike: nothing waiting. Not locks.\n15:04  Theory: conn held across audit call inside txn. Testing.\n15:12  CONFIRMED. Pool wait tracks audit duration exactly.'
        },
        { t: 'note', label: 'Field note', text: 'Mark open questions distinctly, with `??` or similar, so you can find them later. Half of them turn out to be findings worth fixing regardless of whether they caused today\'s incident.' }
      ]
    },
    {
      id: 'draw-it',
      number: '5.3',
      title: 'Draw the path the request takes',
      blocks: [
        { t: 'p', text: 'Sketch the system, on paper or a whiteboard, following one request from entry to response. Not an architecture diagram for a document, a rough box-and-arrow drawing that exists for ten minutes.' },
        { t: 'p', text: 'The value is in what the drawing exposes:' },
        {
          t: 'ul',
          items: [
            '**Hops you forgot.** The proxy, the sidecar, the cache layer, the DNS lookup, the load balancer. Components you never think about are exactly the ones you never suspect.',
            '**Boundaries.** Every arrow crossing a network, a process, or a trust boundary is a candidate for failure, and each one is a place you can cut with the substitution technique in 4.3.',
            '**Where you have visibility and where you do not.** Mark each hop with whether you can see its timing. The unmarked stretches are where the problem is allowed to hide.',
            '**Disagreement.** Draw it in front of a colleague and there is a good chance they correct one of your arrows. That correction is often the bug.'
          ]
        },
        { t: 'p', text: 'For latency problems specifically, write the expected time next to each hop before you measure. Comparing your expectation against reality finds the anomalous hop immediately, and it also finds the places where your mental model of the system was simply wrong.' }
      ]
    },
    {
      id: 'rubber-duck',
      number: '5.4',
      title: 'Explain it out loud',
      blocks: [
        { t: 'p', text: 'Rubber duck debugging is well known and widely underused, mostly because it feels silly and because people reach for it too late. Explain the problem, out loud, in complete sentences, to a colleague or to an inanimate object.' },
        { t: 'p', text: 'It works because explanation and understanding use different machinery. You can hold a vague sense of how something works, but you cannot *say* it vaguely without noticing. The moment you hear yourself say "and then it obviously reconnects" is the moment you realise you have never verified that it reconnects.' },
        {
          t: 'ul',
          items: [
            'Explain from the beginning, including what you consider obvious. The bug lives in the obvious part, because the obvious part is the part you never checked.',
            'Say what you *know* separately from what you *assume*. Force the distinction out loud.',
            'If you are explaining to a person, ask them not to solve it. You want their attention, not their theory, and a premature theory from a fresh mind can anchor you as badly as your own.'
          ]
        },
        { t: 'note', label: 'Field note', text: 'Writing a detailed help request works the same way and produces an artifact. A significant fraction of carefully written questions get answered by the person writing them, halfway through writing. Send it anyway if you still need it.' }
      ]
    },
    {
      id: 'name-unknowns',
      number: '5.5',
      title: 'Name what you do not know',
      blocks: [
        { t: 'p', text: 'Unexamined assumptions are the main reason smart people stay stuck. Every assumption silently removes a region of the search space, and if the bug is in that region you will never find it, no matter how carefully you search everywhere else.' },
        { t: 'p', text: 'Periodically stop and list what you are treating as true without having checked it in this incident. Then check the cheapest ones.' },
        {
          t: 'table',
          head: ['Assumption', 'How it is usually wrong'],
          rows: [
            ['The config in the repo is the config that is running', 'Overridden by environment, secret manager, an emergency edit, or a stale deploy'],
            ['The deployed version is the version I think', 'A failed rollout left mixed versions, or the tag moved'],
            ['This code path runs', 'A flag, a cache, or an early return means it never executes'],
            ['The error I am reading is the first error', 'It is the loudest one, three layers downstream of the trigger'],
            ['The health check proves health', 'It returns 200 without touching any dependency'],
            ['Retries are helping', 'They are amplifying load against an already-saturated dependency'],
            ['The clocks agree', 'They do not, and your correlation across services is off by seconds'],
            ['Nothing changed', 'Time changed. Certificates, tokens, quotas, and disks all expire without anyone acting']
          ]
        },
        { t: 'note', label: 'Rule', text: 'When genuinely stuck, the useful question is not "what else could be broken?" but "what have I not questioned?" The first searches the space you already believe in. The second widens it.' }
      ]
    },
    {
      id: 'ex-diagram',
      number: '5.6',
      title: 'Worked example: the drawing found it',
      blocks: [
        {
          t: 'example',
          title: 'An intermittent 502 that nobody could reproduce',
          scenario: 'Roughly one request in two hundred returns 502. Never reproducible on demand. Application logs show no errors at all for the failing requests, which is the part everyone finds maddening. Two engineers have spent a day on it.',
          walk: [
            { step: 'The absence of logs is the clue', text: 'Written down plainly, the observation is: the gateway reports an upstream failure and the application has no record of the request. Stated that way it is obvious that the request may never have reached the application, but nobody had stated it that way, because everyone was inside the application looking for a bug.' },
            { step: 'Draw the path', text: 'On the whiteboard: client, CDN, load balancer, ingress, service mesh sidecar, application. Six hops. The team had been treating it as two, because the middle four are managed by another team and had become invisible through familiarity.' },
            { step: 'Mark visibility per hop', text: 'They have application logs and load balancer logs. The sidecar has metrics nobody has looked at. The ingress logs to a place two of them did not know existed. Two of the six hops are effectively unobserved, and the failure is by definition in an unobserved one, since the observed ones show nothing.' },
            { step: 'Look where the light was not', text: 'Sidecar metrics show connection resets, ~0.5% of requests, matching the failure rate closely enough to be the same population.' },
            { step: 'Find the mechanism', text: 'The sidecar idle timeout is 60s. The application keep-alive timeout is also 60s. When both expire together, the application closes a connection at the same moment the sidecar sends a request on it, and the request is lost before it is ever logged. A textbook race, invisible from either side alone.' },
            { step: 'Fix', text: 'Set the application keep-alive above the sidecar idle timeout so the sidecar always closes first. 502s go to zero.' }
          ],
          lesson: 'The drawing did not reveal a new fact. It revealed that four of six hops had been mentally deleted, and that two had no observability. "No logs for the failing request" was evidence pointing outside the application from the start, and it read as a mystery only while the diagram in everyone\'s head was missing the components that were failing.'
        }
      ]
    }
  ]
};
