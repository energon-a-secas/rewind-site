export const ch4 = {
  id: 'long-methods',
  number: 4,
  title: 'Long Methods',
  summary: 'When the quick pass fails. Slower techniques that trade time for certainty, and that keep working when intuition has run out.',
  sections: [
    {
      id: 'when-to-switch',
      number: '4.1',
      title: 'Knowing when to switch gears',
      blocks: [
        { t: 'p', text: 'The quick methods in the previous chapter work by pattern matching against a small suspect list. When they fail, the usual reason is that the problem is not in the suspect list, and running the same quick checks a fourth time will not move it.' },
        { t: 'p', text: 'Switch to a long method when you notice any of these:' },
        {
          t: 'ul',
          items: [
            'You have checked the same three things more than twice.',
            'You cannot state your current hypothesis in one sentence.',
            'You have been going for thirty minutes with no new information, only new guesses.',
            'You are making changes to see what happens rather than to test something specific.',
            'You have lost track of what you have already ruled out.'
          ]
        },
        { t: 'p', text: 'The last one is the clearest signal. When you cannot remember what you eliminated, you are going in circles, and the fix is not more effort but more structure.' },
        { t: 'note', label: 'Rule', text: 'Long methods feel slower and are usually faster, because they are the only ones that make monotonic progress. Every step permanently removes possibilities instead of re-searching the same space.' }
      ]
    },
    {
      id: 'bisection',
      number: '4.2',
      title: 'Bisection',
      blocks: [
        { t: 'p', text: 'Bisection is the most reliable debugging technique that exists. It requires no insight, no familiarity with the code, and no theory. It requires only a way to test whether the problem is present, and something ordered to search.' },
        { t: 'p', text: 'Halve the search space, test, discard the half that does not contain the problem, repeat. A thousand candidates fall to ten tests, and a million fall to twenty.' },
        { t: 'p', text: 'What you can bisect over is broader than most people use it for:' },
        {
          t: 'table',
          head: ['Dimension', 'Method'],
          rows: [
            ['Commits', '`git bisect`, with a script that exits non-zero on failure'],
            ['Time', 'Find a good hour and a bad hour, halve the interval, check what changed in each'],
            ['Configuration', 'Halve the difference between a working config and a broken one'],
            ['Data', 'Split the input in half, find which half triggers it, repeat down to one record'],
            ['Request path', 'Bypass components one layer at a time until the failure disappears'],
            ['Dependencies', 'Split a lockfile diff in half and rebuild']
          ]
        },
        {
          t: 'code',
          label: 'Automated commit bisection',
          text: 'git bisect start\ngit bisect bad                 # current commit fails\ngit bisect good v2.4.0         # this tag was fine\ngit bisect run ./check.sh      # exit 0 = good, non-zero = bad\n\n# check.sh must be deterministic and must not depend on\n# state left behind by the previous iteration.'
        },
        { t: 'note', label: 'Trap', text: 'Bisection is only as good as your test. If the check is flaky, bisection converges confidently on an innocent commit. Before you start, run the check three times on a known-bad state and three times on a known-good one. If it ever disagrees with itself, fix the check first.' }
      ]
    },
    {
      id: 'mock-substitute',
      number: '4.3',
      title: 'Mock and substitute',
      blocks: [
        { t: 'p', text: 'When a system has many moving parts, replace parts with something whose behaviour you fully control. Each substitution answers one question: is the problem on this side of the boundary, or the other side?' },
        {
          t: 'ul',
          items: [
            'Replace a downstream service with a stub that returns a known good response. If the failure disappears, it is downstream. If it persists, it is yours.',
            'Replace live data with a fixed fixture. If the failure disappears, it is data-dependent, and you have just converted an intermittent problem into a reproducible one.',
            'Replace the client. Call the endpoint with `curl` instead of the application. If `curl` succeeds, the problem is in the client, its serialisation, or its headers.',
            'Replace the network path. Hit the service directly rather than through the load balancer or proxy, and you will learn in one step whether the proxy is involved.',
            'Replace the identity. Run the same call with a different credential or role to separate authorisation problems from logic problems.'
          ]
        },
        { t: 'p', text: 'Substitution is also how you make an unreproducible problem reproducible. Freeze everything you can control, and the remaining variability is where the bug lives.' }
      ]
    },
    {
      id: 'ruling-out',
      number: '4.4',
      title: 'Rule out, progressively and in writing',
      blocks: [
        { t: 'p', text: 'This is the technique that prevents circling. Maintain an explicit list of candidate causes, and move items from "possible" to "ruled out" with a note on how you ruled each one out.' },
        { t: 'p', text: 'The written part is not bureaucracy. It is what makes the progress permanent, and it is what lets a second person join without repeating your first hour.' },
        {
          t: 'code',
          label: 'A working list, kept in a scratch file',
          text: 'SYMPTOM: checkout p99 6s (was 400ms) since ~14:20, all regions\n\nRULED OUT\n  [x] Deploy         no deploy since 11:03 (change log)\n  [x] Traffic spike  RPS flat, 2% above yesterday (dashboard)\n  [x] DB CPU         12%, no slow query log entries\n  [x] Network        p99 between svc and DB is 1.2ms\n\nSTILL POSSIBLE\n  [ ] Connection pool exhaustion   pool metrics not exported (!)\n  [ ] Payment provider latency     no client-side timing yet\n  [ ] Lock contention              need pg_locks sample during spike\n\nNEXT: add pool gauge + provider client timing, both 10 min\n\nNOTE: "pool metrics not exported" is itself a finding. Log it.'
        },
        { t: 'p', text: 'Two rules make the list trustworthy. Record *how* you ruled something out, not just that you did, because "checked the database" is worthless to the next reader and to you in an hour. And when you rule something out on an assumption rather than evidence, mark it, because assumptions are where wrong conclusions enter.' },
        { t: 'note', label: 'Field note', text: 'Gaps you discover while ruling out are findings in their own right. "We cannot see connection pool usage" is a real problem that outlived this incident, and it belongs in the follow-up list even if it turns out not to be the cause today.' }
      ]
    },
    {
      id: 'scientific-method',
      number: '4.5',
      title: 'The scientific method, written down',
      blocks: [
        { t: 'p', text: 'When a problem resists everything else, formalise. This is slow and it is what works on the genuinely hard ones.' },
        {
          t: 'ol',
          items: [
            '**Observation.** State exactly what you see, with numbers and timestamps, and nothing inferred. "p99 went from 400ms to 6s at 14:20" not "the database is slow".',
            '**Hypothesis.** One specific, falsifiable statement. "The connection pool is exhausted because the payment client holds connections across its HTTP call."',
            '**Prediction.** What must be true if the hypothesis holds, and, importantly, what must be *false*. "Pool wait time will be above zero, and it will correlate with payment call duration."',
            '**Experiment.** The smallest test that could disprove it.',
            '**Result.** What actually happened, recorded before you interpret it.',
            '**Conclusion.** Supported, refuted, or inconclusive. Then the next hypothesis.'
          ]
        },
        { t: 'p', text: 'The discipline that matters most is step three. A hypothesis that cannot be wrong is not a hypothesis, and a prediction written only after seeing the result is not a prediction. Under pressure people naturally look for evidence that confirms what they already suspect, and writing the disconfirming prediction in advance is the cheapest available defence against that.' },
        { t: 'note', label: 'Rule', text: 'Record inconclusive results. They are the ones people silently drop, and they are exactly the ones that cause someone, often you, to repeat the same experiment in an hour.' }
      ]
    },
    {
      id: 'instrument',
      number: '4.6',
      title: 'Instrument instead of guessing',
      blocks: [
        { t: 'p', text: 'At some point in a hard problem you will realise you are speculating about something you could simply measure. Stop and measure it. Adding a metric, a log line, or a trace mid-incident feels like a detour and is usually the shortest path.' },
        {
          t: 'ul',
          items: [
            'Time the suspicious span directly rather than inferring it from two other numbers.',
            'Log the actual value of the thing you are assuming. The assumption is wrong more often than is comfortable.',
            'Count instead of estimating. "It happens sometimes" becomes "it happens on 3.4% of requests, all of them to one instance".',
            'Sample state during the failure rather than after it. Post-incident inspection shows you the recovered system, not the broken one.'
          ]
        },
        { t: 'p', text: 'A blind spot found this way is a permanent improvement. The metric you add during this incident is the metric that makes the next one a five-minute job.' }
      ]
    },
    {
      id: 'ex-bisect',
      number: '4.7',
      title: 'Worked example: bisecting a latency regression',
      blocks: [
        {
          t: 'example',
          title: 'Six seconds, no obvious cause, forty commits',
          scenario: 'Checkout p99 latency went from 400ms to 6s at some point during the week. No single deploy correlates, because there were nine deploys and the degradation looks gradual on the weekly graph. Quick methods produced nothing.',
          walk: [
            { step: 'Get a reliable test first', text: 'Bisection needs a check that is right every time. You write a script that runs the checkout flow against a local instance fifty times and exits non-zero if p99 exceeds 1s. You run it three times on today\'s build and three times on last week\'s, and it agrees with itself every time. Only now is bisection safe.' },
            { step: 'Bisect over time before commits', text: 'The weekly graph is too coarse. Zooming into hourly data, latency is flat at 400ms until Wednesday 16:00, then flat at 6s after. It is not gradual at all, it is a step. The gradual appearance was an artifact of daily averaging, and this single observation removes three days of candidates.' },
            { step: 'Bisect the commits in that window', text: 'Eleven commits sit between the last good deploy and the first bad one. `git bisect run` with the check script takes four iterations and lands on a commit titled "add audit logging to order service".' },
            { step: 'Confirm the mechanism, do not stop at the commit', text: 'Bisection tells you where, never why, and stopping here would produce a wrong fix. Reading the diff: the audit call is awaited inside the order-creation transaction. Every checkout now holds a database connection open across a network call to the audit service.' },
            { step: 'Verify the prediction', text: 'If that is the mechanism, pool wait time should be non-zero and should track audit latency. It is, and it does. The audit service responds in 40ms, which is fine on its own and fatal while holding a pooled connection under load.' },
            { step: 'Fix the cause rather than the symptom', text: 'The tempting fix is a larger connection pool, and it would have worked for about two weeks. The real fix is moving the audit write outside the transaction, which returns p99 to 410ms.' }
          ],
          lesson: 'Three things carried this: fixing the test before trusting the method, bisecting over time first to shrink the commit range almost for free, and refusing to stop at the commit that bisection blamed. Note also that the "gradual" degradation was a measurement artifact. Check the resolution of your graph before you believe its shape.'
        }
      ]
    }
  ]
};
