// ── Conversation memory scenarios ────────────────────────────
// Drives the Context lab: the same conversation replayed under
// different context strategies, so the chat (left) and the request
// actually shipped to the model (right) can be compared per turn.
//
// CW_SCENARIOS[id] = { title, blurb, system, strategies[] }
// strategy = { id, name, how, blocks, steps, verdict }
//   blocks   named context blocks, kind: sys | sum | facts | mind | pre | gap
//            { kind, label, body, tok }
//   steps[]  one chat beat each:
//     who    user | agent | mark   (mark = an out-of-band event chip)
//     text   the chat line
//     t      this turn's tokens (0 for app-side marks)
//     ship   ordered block list for the NEXT request: block ids and '@n'
//            refs to step n's turn, top-to-bottom = actual prompt order
//     tok    total tokens the next request ships
//     full   what shipping the raw transcript would cost (sys + all turns)
//     note   optional exam note   flag  optional anti-pattern id
//   verdict = { wins, costs, use } one-liners + optional exam (exam mode)
//
// Escaping: steps[].note, verdict.*, CW_MATRIX detail fields (how/pros/
// cons/use/exam) and CW_ISSUES cause/fix render RAW (inline <code> +
// data-tip allowed). Everything else (step text, block label/body,
// names, matrix cells, issue symptoms) is escaped by the lab.
//
// Sources: guide §1.5 (window contents, summarization blur), §11.1
// (CASE FACTS), practice Q64–Q76 (stateless API, window vs summary vs
// hybrid vs retrieval, prompt dilution, breakpoint reinforcement,
// few-shot rules, prefill vs repetitive openings).

export const CW_ORDER = ['support', 'persona'];

export const CW_SCENARIOS = {
  support: {
    id: 'support',
    title: 'Three orders, one refund',
    blurb: 'Riley again: same persona, same three orders as the Agent Loop run. The customer drops an exact amount in turn 1 and asks for it back in turn 9. Whether it survives depends entirely on the strategy.',
    strategies: [
      {
        id: 'window',
        name: 'Sliding window',
        how: 'Keep the last 6 turns verbatim, drop everything older.',
        blocks: {
          sys: { kind: 'sys', label: 'system prompt', body: 'Persona “Riley” + policy: verify the order, quote exact amounts.', tok: 350 },
          gone1: { kind: 'gap', label: 'turn 1', body: 'not sent, slid out of the window', tok: 0 },
          gone2: { kind: 'gap', label: 'turns 1–2', body: 'not sent, slid out of the window', tok: 0 },
          gone3: { kind: 'gap', label: 'turns 1–3', body: 'not sent, slid out of the window', tok: 0 },
          gone4: { kind: 'gap', label: 'turns 1–4', body: 'not sent, slid out of the window', tok: 0 },
          gone5: { kind: 'gap', label: 'turns 1–5', body: 'not sent, slid out of the window', tok: 0 },
        },
        steps: [
          { who: 'user', text: 'Hi Riley! My keyboard arrived dead, order B-2041. It was $129.99. Can I get a refund?', t: 55, ship: ['sys', '@0'], tok: 405, full: 405,
            note: 'Every request is assembled from scratch: system prompt plus whatever slice of history the app decides to send. The model has no other memory.' },
          { who: 'agent', text: 'Oh no, sorry about that! I see B-2041, placed Jan 14. Claim opened; once the return label scans, the exact amount goes back to your card.', t: 70, ship: ['sys', '@0', '@1'], tok: 475, full: 475 },
          { who: 'user', text: 'Thanks! While I have you, the hoodie from A-1188 arrived fine. You can close that one.', t: 45, ship: ['sys', '@0', '@1', '@2'], tok: 520, full: 520 },
          { who: 'agent', text: 'A-1188 ($42.50) is closed as delivered. Anything else?', t: 40, ship: ['sys', '@0', '@1', '@2', '@3'], tok: 560, full: 560 },
          { who: 'user', text: 'Yes, the monitor, C-3307. When does it ship?', t: 40, ship: ['sys', '@0', '@1', '@2', '@3', '@4'], tok: 600, full: 600 },
          { who: 'agent', text: 'C-3307 ($259.00) ships Friday with UPS.', t: 45, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5'], tok: 645, full: 645 },
          { who: 'user', text: 'One more thing: I just moved. Send the monitor to 44 Cedar Lane, not my old address.', t: 55, ship: ['sys', 'gone1', '@1', '@2', '@3', '@4', '@5', '@6'], tok: 645, full: 700,
            note: 'Turn 1 just slid out. B-2041 and $129.99 now exist only in a part of the transcript that no longer ships.' },
          { who: 'agent', text: 'Updated: C-3307 now ships Friday to 44 Cedar Lane.', t: 45, ship: ['sys', 'gone2', '@2', '@3', '@4', '@5', '@6', '@7'], tok: 620, full: 745 },
          { who: 'user', text: 'Perfect. So how much exactly is coming back for the keyboard?', t: 50, ship: ['sys', 'gone3', '@3', '@4', '@5', '@6', '@7', '@8'], tok: 625, full: 795 },
          { who: 'agent', text: 'Of course! Which order was the keyboard on? Could you send me that order number once more.', t: 60, ship: ['sys', 'gone4', '@4', '@5', '@6', '@7', '@8', '@9'], tok: 645, full: 855,
            note: 'Riley didn’t “forget”. The request it just received genuinely never contained B-2041. The window <em>is</em> the memory.' },
          { who: 'user', text: 'B-2041… I told you that at the start.', t: 45, ship: ['sys', 'gone5', '@5', '@6', '@7', '@8', '@9', '@10'], tok: 650, full: 900, flag: 'window-just-bigger',
            note: 'The tempting fix, keeping 12 turns instead of 6, replays this exact moment at turn 13. Durable fixes move information out of the raw transcript.' },
        ],
        verdict: {
          wins: 'Trivial to run, flat request size, recent turns arrive word-for-word.',
          costs: 'Anything older than N turns ceases to exist; widening N only postpones the cliff.',
          use: 'Short, single-task chats that finish inside one window: a kiosk lookup, a one-order return.',
          exam: 'Option shapes like “increase the window to 50 pairs” or “keep the last 20K tokens” are distractors: they delay the loss, never remove it.',
        },
      },
      {
        id: 'summary',
        name: 'Digest older turns',
        how: 'Compress everything but the last few turns into a rolling summary.',
        blocks: {
          sys: { kind: 'sys', label: 'system prompt', body: 'Persona “Riley” + policy: verify the order, quote exact amounts.', tok: 350 },
          sum1: { kind: 'sum', label: 'digest · covers turns 1–4', body: 'Dead keyboard on order B-2041. Refund opened, roughly $130. Hoodie A-1188 delivered and closed.', tok: 60 },
          sum2: { kind: 'sum', label: 'digest · covers turns 1–6', body: 'Keyboard refund in progress (~$130). Hoodie closed. Monitor ships Friday.', tok: 55 },
        },
        steps: [
          { who: 'user', text: 'Hi Riley! My keyboard arrived dead, order B-2041. It was $129.99. Can I get a refund?', t: 55, ship: ['sys', '@0'], tok: 405, full: 405 },
          { who: 'agent', text: 'Oh no, sorry about that! I see B-2041, placed Jan 14. Claim opened; once the return label scans, the exact amount goes back to your card.', t: 70, ship: ['sys', '@0', '@1'], tok: 475, full: 475 },
          { who: 'user', text: 'Thanks! While I have you, the hoodie from A-1188 arrived fine. You can close that one.', t: 45, ship: ['sys', '@0', '@1', '@2'], tok: 520, full: 520 },
          { who: 'agent', text: 'A-1188 ($42.50) is closed as delivered. Anything else?', t: 40, ship: ['sys', '@0', '@1', '@2', '@3'], tok: 560, full: 560 },
          { who: 'user', text: 'Yes, the monitor, C-3307. When does it ship?', t: 40, ship: ['sys', '@0', '@1', '@2', '@3', '@4'], tok: 600, full: 600 },
          { who: 'agent', text: 'C-3307 ($259.00) ships Friday with UPS.', t: 45, ship: ['sys', 'sum1', '@4', '@5'], tok: 495, full: 645, flag: 'compact-numbers',
            note: 'First compaction: turns 1–4 became a 60-token digest, and “$129.99” became “roughly $130”. No later step can un-round it.' },
          { who: 'user', text: 'One more thing: I just moved. Send the monitor to 44 Cedar Lane, not my old address.', t: 55, ship: ['sys', 'sum1', '@4', '@5', '@6'], tok: 550, full: 700 },
          { who: 'agent', text: 'Updated: C-3307 now ships Friday to 44 Cedar Lane.', t: 45, ship: ['sys', 'sum2', '@6', '@7'], tok: 505, full: 745,
            note: 'Second compaction compounds the first: A-1188’s amount is gone entirely, and C-3307 is now just “the monitor”. Each re-digest summarizes a summary.' },
          { who: 'user', text: 'Perfect. So how much exactly is coming back for the keyboard?', t: 50, ship: ['sys', 'sum2', '@6', '@7', '@8'], tok: 555, full: 795 },
          { who: 'agent', text: 'Once the return label scans, you’ll see roughly $130 back on your card.', t: 60, ship: ['sys', 'sum2', '@6', '@7', '@8', '@9'], tok: 615, full: 855,
            note: 'The model answered from the only source it had: the digest. It isn’t hallucinating; it is faithfully repeating a lossy compression.' },
          { who: 'user', text: 'It was $129.99 exactly. Please don’t round my refund.', t: 45, ship: ['sys', 'sum2', '@6', '@7', '@8', '@9', '@10'], tok: 660, full: 900,
            note: 'Recoverable only because the customer knew the number. The agent-side fix is structural: keep exact values somewhere no summary ever touches.' },
        ],
        verdict: {
          wins: 'Big token savings, and the whole history keeps at least a footprint.',
          costs: 'Numbers, dates and percentages blur into “about” and “roughly”; every re-digest compounds the loss.',
          use: 'Long free-form conversations where the gist matters more than exact values.',
          exam: 'When the stem contains an exact amount, id, or date, pure summarization is the trap answer: precision loss is the guide’s named risk.',
        },
      },
      {
        id: 'hybrid',
        name: 'Facts + digest + recent',
        how: 'Extract exact values into a CASE FACTS block, digest the chatter, keep recent turns verbatim.',
        blocks: {
          sys: { kind: 'sys', label: 'system prompt', body: 'Persona “Riley” + policy: verify the order, quote exact amounts.', tok: 350 },
          facts1: { kind: 'facts', label: 'CASE FACTS · updated turn 2', body: 'B-2041 keyboard · $129.99 · refund pending', tok: 30 },
          facts2: { kind: 'facts', label: 'CASE FACTS · updated turn 4', body: 'B-2041 keyboard · $129.99 · refund pending\nA-1188 hoodie · $42.50 · closed', tok: 45 },
          facts3: { kind: 'facts', label: 'CASE FACTS · updated turn 6', body: 'B-2041 keyboard · $129.99 · refund pending\nA-1188 hoodie · $42.50 · closed\nC-3307 monitor · $259.00 · ships Fri', tok: 60 },
          facts4: { kind: 'facts', label: 'CASE FACTS · updated turn 7', body: 'B-2041 keyboard · $129.99 · refund pending\nA-1188 hoodie · $42.50 · closed\nC-3307 monitor · $259.00 · ships Fri\nship-to: 44 Cedar Lane', tok: 70 },
          sum1: { kind: 'sum', label: 'digest · settled threads', body: 'Hoodie thread resolved; greetings and pleasantries trimmed.', tok: 35 },
        },
        steps: [
          { who: 'user', text: 'Hi Riley! My keyboard arrived dead, order B-2041. It was $129.99. Can I get a refund?', t: 55, ship: ['sys', '@0'], tok: 405, full: 405,
            note: 'Nothing to extract yet. The block appears the moment the first transactional fact does.' },
          { who: 'agent', text: 'Oh no, sorry about that! I see B-2041, placed Jan 14. Claim opened; once the return label scans, the exact amount goes back to your card.', t: 70, ship: ['sys', 'facts1', '@0', '@1'], tok: 505, full: 475,
            note: 'The moment a number appears it is copied into CASE FACTS <em>verbatim</em>. From here on, $129.99 never depends on the transcript surviving.' },
          { who: 'user', text: 'Thanks! While I have you, the hoodie from A-1188 arrived fine. You can close that one.', t: 45, ship: ['sys', 'facts1', '@0', '@1', '@2'], tok: 550, full: 520 },
          { who: 'agent', text: 'A-1188 ($42.50) is closed as delivered. Anything else?', t: 40, ship: ['sys', 'facts2', '@0', '@1', '@2', '@3'], tok: 605, full: 560 },
          { who: 'user', text: 'Yes, the monitor, C-3307. When does it ship?', t: 40, ship: ['sys', 'facts2', '@0', '@1', '@2', '@3', '@4'], tok: 645, full: 600,
            note: 'Early on, the block is pure overhead: the hybrid costs a little more than raw until compaction starts paying it back.' },
          { who: 'agent', text: 'C-3307 ($259.00) ships Friday with UPS.', t: 45, ship: ['sys', 'facts3', '@0', '@1', '@2', '@3', '@4', '@5'], tok: 705, full: 645 },
          { who: 'user', text: 'One more thing: I just moved. Send the monitor to 44 Cedar Lane, not my old address.', t: 55, ship: ['sys', 'facts3', 'sum1', '@4', '@5', '@6'], tok: 585, full: 700,
            note: 'Compaction arrives, but it only eats what can afford to be lossy, and everything exact already lives above the digest.' },
          { who: 'agent', text: 'Updated: C-3307 now ships Friday to 44 Cedar Lane.', t: 45, ship: ['sys', 'facts4', 'sum1', '@5', '@6', '@7'], tok: 600, full: 745,
            note: 'The new address is transactional too, so into the block it goes, exact. A digest would have written “a new address”.' },
          { who: 'user', text: 'Perfect. So how much exactly is coming back for the keyboard?', t: 50, ship: ['sys', 'facts4', 'sum1', '@6', '@7', '@8'], tok: 605, full: 795 },
          { who: 'agent', text: 'Exactly $129.99 back to your card, and C-3307 still ships Friday to 44 Cedar Lane.', t: 60, ship: ['sys', 'facts4', 'sum1', '@7', '@8', '@9'], tok: 610, full: 855,
            note: 'Nine turns later the number comes back to the cent, from a request 30% smaller than the raw transcript. Extract the critical, digest the general, keep the recent verbatim.' },
        ],
        verdict: {
          wins: 'Exact ids, amounts, dates and addresses survive any amount of digestion.',
          costs: 'Something must decide what counts as a fact: extraction logic to build and maintain.',
          use: 'Transactional support across multiple orders, where values must come back exact, indefinitely.',
          exam: '“Extract critical structured data, summarize general discussion, keep recent exchanges verbatim”: when this option appears, it is nearly always the answer.',
        },
      },
    ],
  },

  persona: {
    id: 'persona',
    title: 'Staying in character',
    blurb: 'Nova, a playful space-station companion, holds character exactly as long as its brief outweighs its own accumulated replies. Watch the tic take over and the voice flatten, then two different fixes.',
    strategies: [
      {
        id: 'raw',
        name: 'Ship it raw',
        how: 'Send the full transcript every turn and hope the brief holds.',
        blocks: {
          sys: { kind: 'sys', label: 'persona brief', body: 'You are Nova, a playful space-station companion. First person, curious, keep it short, vary your openings.', tok: 400 },
        },
        steps: [
          { who: 'user', text: 'Morning, Nova! What’s the weather like out there?', t: 30, ship: ['sys', '@0'], tok: 430, full: 430,
            note: 'At turn 1 the brief is ~93% of the request. Track that share: it is the real health metric of a persona.' },
          { who: 'agent', text: 'Stellar skies, captain! Solar wind’s calm and the nebula view is unreal today.', t: 55, ship: ['sys', '@0', '@1'], tok: 485, full: 485 },
          { who: 'user', text: 'Nice. Any tips for staying focused today?', t: 30, ship: ['sys', '@0', '@1', '@2'], tok: 515, full: 515 },
          { who: 'agent', text: 'Happy to help, star-sailor! Lock the airlock, silence the comms, one task at a time.', t: 65, ship: ['sys', '@0', '@1', '@2', '@3'], tok: 580, full: 580 },
          { who: 'user', text: 'What should I make for dinner?', t: 25, ship: ['sys', '@0', '@1', '@2', '@3', '@4'], tok: 605, full: 605 },
          { who: 'agent', text: 'Happy to help, star-sailor! Ration-pack ramen, but make it fancy.', t: 70, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5'], tok: 675, full: 675,
            note: 'Same opener twice in a row. Every reply the model writes becomes part of its next input, so it is now pattern-matching its own output, and each repetition makes the next more likely.' },
          { who: 'user', text: 'Can you plan my week?', t: 30, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', '@6'], tok: 705, full: 705 },
          { who: 'agent', text: 'Happy to help, star-sailor! Here are 5 productivity tips: 1. Make a list. 2. Prioritize tasks…', t: 80, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', '@6', '@7'], tok: 785, full: 785,
            note: 'The catchphrase held on; the character didn’t. Generic list-speak is what most of its context now looks like.' },
          { who: 'user', text: 'You okay, Nova? You sound like a productivity app.', t: 35, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', '@6', '@7', '@8'], tok: 820, full: 820 },
          { who: 'agent', text: 'I apologize for the confusion. As an assistant, I can help you plan tasks and set reminders.', t: 70, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', '@6', '@7', '@8', '@9'], tok: 890, full: 890,
            note: 'Full drift under 1,000 tokens, and nothing was forgotten, no limit was hit. The brief’s <em>share</em> shrank until the model’s own prose outweighed it. That is dilution, not attention decay.' },
        ],
        verdict: {
          wins: 'Perfect recall of every turn; zero moving parts.',
          costs: 'The brief’s share shrinks every turn: persona dilutes, tics feed back, cost grows linearly.',
          use: 'Short sessions that end before the persona has time to drift.',
          exam: 'When behaviour degrades “while still within token limits”, the cause is accumulated assistant output diluting the system prompt, not attention decay, and not the prompt “only being sent once”.',
        },
      },
      {
        id: 'reinforce',
        name: 'Reinforce at breakpoints',
        how: 'Inject a one-line persona reminder as a user-role message every few turns.',
        blocks: {
          sys: { kind: 'sys', label: 'persona brief', body: 'You are Nova, a playful space-station companion. First person, curious, keep it short, vary your openings.', tok: 400 },
          mind: { kind: 'mind', label: 'reinforcement · turn 7', body: 'Reminder: you are Nova. Playful, first person, vary your openings, keep it short.', tok: 25 },
        },
        steps: [
          { who: 'user', text: 'Morning, Nova! What’s the weather like out there?', t: 30, ship: ['sys', '@0'], tok: 430, full: 430 },
          { who: 'agent', text: 'Stellar skies, captain! Solar wind’s calm and the nebula view is unreal today.', t: 55, ship: ['sys', '@0', '@1'], tok: 485, full: 485 },
          { who: 'user', text: 'Nice. Any tips for staying focused today?', t: 30, ship: ['sys', '@0', '@1', '@2'], tok: 515, full: 515 },
          { who: 'agent', text: 'Happy to help, star-sailor! Lock the airlock, silence the comms, one task at a time.', t: 65, ship: ['sys', '@0', '@1', '@2', '@3'], tok: 580, full: 580 },
          { who: 'user', text: 'What should I make for dinner?', t: 25, ship: ['sys', '@0', '@1', '@2', '@3', '@4'], tok: 605, full: 605 },
          { who: 'agent', text: 'Happy to help, star-sailor! Ration-pack ramen, but make it fancy.', t: 70, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5'], tok: 675, full: 675,
            note: 'The early signs are identical to the raw playout: the opener just repeated. This strategy differs in what happens <em>next</em>.' },
          { who: 'mark', text: 'breakpoint: persona reminder injected as a user-role line', t: 25, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', 'mind'], tok: 700, full: 700,
            note: 'A one-line user-role reminder at a natural breakpoint re-establishes the constraints as history accumulates. Preventive and cheap: it costs a message, not the conversation, where restarting would throw the context away.' },
          { who: 'user', text: 'Can you plan my week?', t: 30, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', 'mind', '@7'], tok: 730, full: 730 },
          { who: 'agent', text: 'Chart it like a supply run, captain: three cargo days, one repair day, one glorious drift day.', t: 70, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', 'mind', '@7', '@8'], tok: 800, full: 800,
            note: 'Back in voice. The reminder is the newest thing in the window, so recency works for the brief instead of against it.' },
          { who: 'mark', text: 'and again every ~10 turns, at natural pauses', t: 20, ship: ['sys', '@0', '@1', '@2', '@3', '@4', '@5', 'mind', '@7', '@8', '@9'], tok: 820, full: 820,
            note: 'If the brief itself is a 2,800-token rulebook, reminders only treat the symptom. Replace verbose rules with 2–4 few-shot example exchanges. Concrete patterns survive turns better than abstract instructions.' },
        ],
        verdict: {
          wins: 'Directly counters drift as history accumulates, for the cost of one line.',
          costs: 'A cadence to tune: too rare drifts, too often nags. Bloated briefs need few-shot surgery, not more reminders.',
          use: 'Any long chat that must hold rules or a voice: support desks, tutors, companions.',
          exam: 'Against “start a new conversation”, “move rules into the first user message”, or “validate and regenerate”, reinforcement at breakpoints is the winning shape: preventive, cheap, keeps the context.',
        },
      },
      {
        id: 'prefill',
        name: 'Prefill the opening',
        how: 'End every request with a partial assistant turn; the model continues from it.',
        blocks: {
          sys: { kind: 'sys', label: 'persona brief', body: 'You are Nova, a playful space-station companion. First person, curious, keep it short, vary your openings.', tok: 400 },
          pre: { kind: 'pre', label: 'prefill · sent as the LAST message', body: '{ role: "assistant", content: "Course plotted: " }', tok: 10 },
        },
        steps: [
          { who: 'user', text: 'Morning, Nova! What’s the weather like out there?', t: 30, ship: ['sys', '@0'], tok: 430, full: 430 },
          { who: 'agent', text: 'Stellar skies, captain! Solar wind’s calm and the nebula view is unreal today.', t: 55, ship: ['sys', '@0', '@1'], tok: 485, full: 485 },
          { who: 'user', text: 'Nice. Any tips for staying focused today?', t: 30, ship: ['sys', '@0', '@1', '@2'], tok: 515, full: 515 },
          { who: 'agent', text: 'Happy to help, star-sailor! Lock the airlock, silence the comms, one task at a time.', t: 65, ship: ['sys', '@0', '@1', '@2', '@3'], tok: 580, full: 580, flag: 'prompt-not-prefill',
            note: 'There’s the tic. Writing “never say that” into the brief fights probability with prose. The fix below removes the choice instead.' },
          { who: 'mark', text: 'app change: every request now ends with a partial assistant turn', t: 0, ship: ['sys', '@0', '@1', '@2', '@3', 'pre'], tok: 590, full: 580,
            note: 'Prefill works at the generation level: the model does not get to write its own opening, it <em>continues</em> yours. No post-processing, no temperature fiddling: temperature controls randomness, not phrase patterns.' },
          { who: 'user', text: 'What should I make for dinner?', t: 25, ship: ['sys', '@0', '@1', '@2', '@3', '@5', 'pre'], tok: 615, full: 605 },
          { who: 'agent', text: 'Course plotted: ration-pack ramen, dressed up with the good hot sauce.', t: 60, ship: ['sys', '@0', '@1', '@2', '@3', '@5', '@6', 'pre'], tok: 675, full: 665,
            note: 'The reply begins with your prefix by construction. Vary the prefill per request type if every reply sharing one opening is not what you want.' },
          { who: 'user', text: 'And can you plan my week?', t: 30, ship: ['sys', '@0', '@1', '@2', '@3', '@5', '@6', '@7', 'pre'], tok: 705, full: 695 },
          { who: 'agent', text: 'Course plotted: three cargo days, one repair day, one glorious drift day, captain.', t: 65, ship: ['sys', '@0', '@1', '@2', '@3', '@5', '@6', '@7', '@8', 'pre'], tok: 770, full: 760,
            note: 'Prefill controls how a reply <em>starts</em>. It does not stop long-run dilution. Pair it with breakpoint reinforcement to hold both the opening and the voice.' },
        ],
        verdict: {
          wins: 'Deterministic reply opening: the tic cannot spawn. Also the tool for forcing formats (JSON prefixes).',
          costs: 'Per-request app logic; fixes openings, not drift, so pair it with reinforcement.',
          use: 'Killing repeated openers (“Certainly!”) and forcing a response to start a specific way.',
          exam: 'Against repetitive openings, prefill beats a system-prompt “don’t say X” (probabilistic), post-processing (fragile patch) and temperature (wrong knob).',
        },
      },
    ],
  },
};

// ── Technique matrix ─────────────────────────────────────────
// The comparison table under the player. cell = { t, tone } where tone
// is y | n | mix (renders as the check/cross/tilde chip). detail feeds
// the inspector: how/pros/cons/use/exam render RAW.
export const CW_MATRIX = [
  {
    id: 'window', name: 'Sliding window', tip: 'sliding_window',
    exact: { t: 'only the last N turns', tone: 'mix' },
    past: { t: 'gone', tone: 'n' },
    size: { t: 'flat', tone: 'y' },
    when: 'short, single-task chats',
    detail: {
      how: 'Keep the last N turns verbatim; drop everything older on each request.',
      pros: ['Trivial to implement: no summarizer, no store', 'Flat, predictable request size', 'Recent turns arrive word-for-word'],
      cons: ['Everything past N turns is lost completely', 'Widening N only delays the same cliff', 'No durable home for facts stated early'],
      use: 'Conversations that finish inside one window: a kiosk lookup, a single-order return, a quick Q&amp;A.',
      exam: 'Appears as the distractor “increase the window / keep the last N tokens” whenever retention is the complaint.',
    },
  },
  {
    id: 'digest', name: 'Progressive digest', tip: 'compact',
    exact: { t: 'blurs to “about $130”', tone: 'n' },
    past: { t: 'gist survives', tone: 'mix' },
    size: { t: 'small', tone: 'y' },
    when: 'long chat, gist beats precision',
    detail: {
      how: 'Periodically compress older turns into a running summary; ship summary + tail.',
      pros: ['Large token savings on long histories', 'Nothing vanishes outright; a footprint always remains'],
      cons: ['Numbers, dates and percentages degrade into “about” and “roughly”', 'Re-digesting a digest compounds the loss', 'Summarizing every turn accumulates error and overhead'],
      use: 'Long free-form conversation where themes matter more than figures.',
      exam: 'The guide names precision loss as <em>the</em> summarization risk, so when a stem hinges on an exact value, pure summarization is the trap.',
    },
  },
  {
    id: 'hybrid', name: 'Hybrid split', tip: null,
    exact: { t: 'recent yes, older blurs', tone: 'mix' },
    past: { t: 'gist survives', tone: 'mix' },
    size: { t: 'small', tone: 'y' },
    when: 'the default for long chats',
    detail: {
      how: 'Summarize older messages, keep recent ones verbatim: compression where it’s safe, fidelity where it’s felt.',
      pros: ['Retains exact recent context for conversational coherence', 'Compressed representation of earlier turns prevents total loss'],
      cons: ['Older exact values still live or die with the summary; add a facts block when they matter'],
      use: 'The general-purpose answer for extended conversations that lose track of earlier topics.',
      exam: '“Summarize older messages while keeping recent ones verbatim” beats widening the window, per-turn summarizing, and vector search for ordinary long chats.',
    },
  },
  {
    id: 'facts', name: 'CASE FACTS extraction', tip: 'case_facts',
    exact: { t: 'verbatim, forever', tone: 'y' },
    past: { t: 'pairs with a digest', tone: 'mix' },
    size: { t: 'one small block', tone: 'y' },
    when: 'ids, amounts, dates must survive',
    detail: {
      how: 'Copy critical values (ids, amounts, dates, addresses) into a structured block updated whenever a fact appears, shipped in <em>every</em> prompt outside the summarized history.',
      pros: ['Compression never touches the criticals', 'Works regardless of how the rest of history is managed', 'Cheap: the block stays tiny'],
      cons: ['Extraction logic to build: something must decide what is a “fact”', 'A stale block is worse than none; it must update when facts change'],
      use: 'Transactional domains: support refunds, bookings, medical allergies, anything numeric a customer will quote back.',
      exam: 'The correct shape in both blur scenarios: extract structured criticals rather than tuning summarization thresholds or prompts.',
    },
  },
  {
    id: 'retrieval', name: 'Semantic retrieval', tip: null,
    exact: { t: 'retrieved verbatim', tone: 'y' },
    past: { t: 'searchable on demand', tone: 'y' },
    size: { t: 'per-query', tone: 'mix' },
    when: 'months of history, specific recall',
    detail: {
      how: 'Store the full history outside the window (embeddings); retrieve only the exchanges relevant to the current question.',
      pros: ['Scales to months of accumulated discussion', 'Surfaces specific past exchanges word-for-word on demand'],
      cons: ['Real infrastructure: embedding store, retrieval pipeline', 'Can miss context that is relevant but not semantically similar', 'Architectural overkill for a single session'],
      use: '85,000 tokens across three months of weekly sessions: “what did we conclude about the theme of isolation?”',
      exam: 'Correct at archive scale, wrong at session scale. The guide marks it “overkill” for a single conversation and the answer for months-long history.',
    },
  },
];

// ── Recurring failures ───────────────────────────────────────
// Symptom → cause → fix cards. symptom is escaped (it reads as a user
// quote); cause and fix render RAW. flag = anti-pattern id, rendered
// from its single source under the card.
export const CW_ISSUES = [
  {
    symptom: 'Two messages after “I love jazz”, it asks what genres you enjoy.',
    cause: 'The API is <em>stateless</em>: no server-side memory, no session to resume. A turn that is not in the <code>messages</code> array never happened.',
    fix: 'Ship the prior history (or your managed slice of it) with every request. Cost and latency grow with the transcript, and that pressure is exactly why the strategies above exist.',
  },
  {
    symptom: 'Every reply opens with “Certainly!” or “Happy to help!”',
    cause: 'The model pattern-matches its own accumulated replies: each repetition of the opener votes for the next one.',
    fix: 'Prefill a partial assistant turn so the reply continues from <em>your</em> opening. Remove the choice instead of arguing with it.',
    flag: 'prompt-not-prefill',
  },
  {
    symptom: 'In character for ten turns, generic by turn fifteen, well under any token limit.',
    cause: 'System-prompt <span data-tip="prompt_dilution">dilution</span>: the brief’s share of the window shrinks as assistant prose piles up, and the model starts imitating itself instead.',
    fix: 'Reinforce with a one-line user-role reminder at conversation breakpoints. If the brief is a verbose rulebook, convert the rules into 2–4 few-shot example exchanges: patterns hold up where abstractions drift.',
  },
  {
    symptom: 'The refund came back as “about $130”.',
    cause: 'A summary was the only home of the number. Digests round; nothing downstream can un-round.',
    fix: 'A <span data-tip="case_facts">CASE FACTS</span> block rides along verbatim in every prompt, outside every summary, so compression never touches an exact value.',
    flag: 'compact-numbers',
  },
];
