// Copyright (c) 2026 Luciano Adonis Villarroel. MIT License.
// Game content (cards, art, mechanics) is proprietary — see LICENSE.CONTENT.

/**
 * Instinct — reaction-deck situations.
 *
 * Each situation shows a sharp workplace tension and a hand of four REAL cards
 * (verified live in data/cards.json). Every card is tagged with the management
 * archetype (PROFILES key) that reaching for it leans toward. There is no right
 * answer — the pick maps an instinct, and after eight rounds the tally becomes a
 * Style Compass.
 *
 * Each hand card also carries a `move`: one concrete sentence describing what
 * reaching for that card actually DOES in this situation. The card name alone is
 * an abstraction ("Defensive Maneuver" could mean contain-the-blast-radius or
 * deflect-blame); the move disambiguates so the pick is informed, not a guess at
 * the label. The `move` is shown on the card at pick time; the `reflections` text
 * still narrates the instinct behind it after the pick.
 *
 * Archetype coverage across the 8 situations (each pickable a fair number of times):
 *   hero 6 · cautious 6 · delegator 5 · politician 5 · realistic 5 · innovator 5
 *
 * Shape: { id, prompt, hand:[{card, style, move}], reflections:{style->text},
 *          discussion:[...], facilitatorNote }
 */
export const SITUATIONS = [
  {
    id: 'outage',
    prompt: "It's 2am. Production is down, customers are noticing, and you're the only one awake. What's your first move?",
    hand: [
      { card: 'Heroic Programming', style: 'hero', move: "Dive into the code yourself and hotfix the bug live, right now, alone." },
      { card: 'Pair Programming', style: 'delegator', move: "Wake a teammate so two of you diagnose and recover it together." },
      { card: 'Defensive Maneuver', style: 'cautious', move: "Roll back to the last good deploy and stop the bleeding before touching the bug." },
      { card: 'Executive Review', style: 'politician', move: "Post the incident upward and to customers first, then start fixing." },
    ],
    reflections: {
      hero: "You dove straight in and started fixing. Under fire your instinct is to become the fix, fast, decisive, and personally accountable. The shadow: if you're always the one who saves the night, no one else ever learns the system, and the next 2am is yours too.",
      delegator: "You woke someone to solve it together. Your instinct is that a crisis is a bad time to be a single point of failure, two heads recover faster and one of them learns. The shadow: pulling people in costs precious minutes, and sometimes the room just needs one person to act.",
      cautious: "You reached for the safe rollback before touching anything live. Your instinct protects the blast radius first, diagnoses second. The shadow: the careful path can be the slow path, and a cautious hold can let a small fire become a big one.",
      politician: "You made the incident visible upward before diving in. Your instinct is that an unmanaged narrative is its own outage, leadership hearing it from you beats hearing it from a customer. The shadow: comms are not a fix, and time spent framing is time the bug is still live.",
    },
    discussion: [
      "Whose instinct do you actually want on-call at 2am, and does that change by seniority?",
      "When is 'making it visible' leadership, and when is it just covering yourself?",
    ],
    facilitatorNote: "Watch for the room splitting between 'fix it' and 'communicate it'. There's no winner here, surface that senior ICs and managers often reach for opposite cards, and both are defensible.",
  },
  {
    id: 'greenfield',
    prompt: "You're handed a blank-slate project. No legacy, no constraints, a real deadline. How do you start?",
    hand: [
      { card: 'Skilled Execution', style: 'hero', move: "Start building a working prototype today and let the code teach you the shape." },
      { card: 'Resume-Driven Development', style: 'innovator', move: "Bet on the ambitious modern stack: treat the blank slate as a chance for 10x leverage." },
      { card: 'Compromise', style: 'realistic', move: "Reach for the proven, boring tools the team already knows and ship fast." },
      { card: 'Organization and Planning', style: 'cautious', move: "Design the architecture and lay out the plan before anyone writes code." },
    ],
    reflections: {
      hero: "You started building immediately. Your instinct trusts momentum. A working prototype teaches more than a plan. The shadow: code written before the shape is clear becomes the constraint you later fight.",
      innovator: "You reached for the ambitious stack. A blank slate reads to you as a rare chance to bet on leverage and learn something worth 10x. The shadow: unproven tech on a deadline is a resume line that can also become a rewrite.",
      realistic: "You picked the good-enough, proven tools the team already knows. Your instinct optimizes for shipping, not for the perfect architecture. The shadow: 'boring' can quietly cap your ceiling and bore the people who wanted the greenfield.",
      cautious: "You planned the architecture before anyone touched code. Your instinct front-loads the thinking so the build is cheap. The shadow: a blank slate can also drown in planning while the deadline stays fixed.",
    },
    discussion: [
      "Does 'greenfield' license ambition, or is discipline exactly what a blank slate needs?",
      "What would you regret more in a year: the rewrite, or the boring choice?",
    ],
    facilitatorNote: "This one exposes risk appetite. Ask the innovators and the realists to argue each other's case for two minutes. The point is empathy for the opposite instinct, not consensus.",
  },
  {
    id: 'junior-ownership',
    prompt: "A strong junior asks to own a risky, high-visibility feature. It's a stretch for them. Do you let them?",
    hand: [
      { card: 'Mentorship', style: 'delegator', move: "Say yes, and pair them with a mentor as a safety net around real stakes." },
      { card: 'Charm People', style: 'politician', move: "Say yes, but first line up a senior sponsor to give them air cover." },
      { card: 'Code Review', style: 'realistic', move: "Say yes, but gate the risk behind tight, frequent review." },
      { card: 'Breakthrough', style: 'innovator', move: "Say yes, and push them to attempt the most ambitious version of it." },
    ],
    reflections: {
      delegator: "You said yes and set up mentorship around them. Your instinct grows people by giving real stakes with a safety net. The shadow: if the feature is genuinely load-bearing, 'growth' can become a gamble with someone else's chips.",
      politician: "You said yes but first lined up the right sponsor to back them. Your instinct manages the perception as much as the work. A stretch assignment lands better with air cover. The shadow: managing optics for a junior can read as politicking instead of protecting.",
      realistic: "You said yes but gated it behind tight review. Your instinct trusts the person and the process to catch the risk pragmatically. The shadow: review is a net, not a plan. It catches mistakes late, not early.",
      innovator: "You said yes and encouraged them to attempt the ambitious version. Your instinct sees a stretch as the fastest way to level someone up. The shadow: high visibility plus high ambition is where careers get made or dented.",
    },
    discussion: [
      "Whose risk is it, really: the junior's, the feature's, or yours?",
      "How would your answer change if this were the last feature before a launch?",
    ],
    facilitatorNote: "A good place to name that 'yes' is unanimous but the scaffolding differs wildly. Ask what each person is optimizing for: the person, the feature, or the optics.",
  },
  {
    id: 'deadline-slip',
    prompt: "Mid-quarter and the deadline is slipping. Scope is too big for the time left. What gives?",
    hand: [
      { card: 'Overreach', style: 'hero', move: "Absorb the gap yourself: more hours, more grind, keep the full scope." },
      { card: 'Foresight', style: 'cautious', move: "Cut and de-risk scope now, before the deadline breaks on its own." },
      { card: 'Compromise', style: 'politician', move: "Go renegotiate the deadline and scope with the stakeholders." },
      { card: 'Optimize Workflow', style: 'innovator', move: "Build tooling or automation to buy back the speed you're missing." },
    ],
    reflections: {
      hero: "You absorbed the gap personally: more hours, more grind. Your instinct is to spend yourself before spending the plan. The shadow: heroics that hide a scoping problem mean the same crunch returns next quarter, minus your energy.",
      cautious: "You cut and de-risked scope early rather than hoping. Your instinct protects the quarter by shrinking the promise before it breaks. The shadow: cutting fast can trade a deadline you'd have made for trust you didn't need to spend.",
      politician: "You went to renegotiate scope with stakeholders. Your instinct is that a deadline is a negotiation, not a law of physics. The shadow: every renegotiation spends credibility, and the well runs dry.",
      innovator: "You reached for tooling and automation to buy back speed. Your instinct is that the bottleneck is a systems problem, not an hours problem. The shadow: building the accelerator mid-slip can cost the very time you're trying to save.",
    },
    discussion: [
      "Is renegotiating scope a strength or an admission, and to whom?",
      "When is grinding it out the right call, and when is it avoidance of a harder conversation?",
    ],
    facilitatorNote: "The tell here is whether people change the work or change the promise. Neither is wrong; press gently on the hidden cost each card carries.",
  },
  {
    id: 'slow-ramp',
    prompt: "A new hire is ramping slower than expected. The team is starting to route around them. What do you do?",
    hand: [
      { card: 'Onboarding', style: 'delegator', move: "Double down on structured onboarding: treat it as a system gap to close." },
      { card: 'Contractor', style: 'realistic', move: "Bring in temporary help to hold delivery steady while they ramp." },
      { card: 'Documentation', style: 'cautious', move: "Write the missing docs so the ramp is repeatable for them and the next hire." },
      { card: 'Heroic Programming', style: 'hero', move: "Quietly do their work yourself to keep the team moving." },
    ],
    reflections: {
      delegator: "You doubled down on structured onboarding. Your instinct treats a slow ramp as a system gap, not a person gap. The shadow: sometimes the ramp is the person, and patient investment delays a harder call.",
      realistic: "You brought in temporary help to cover the gap while they ramp. Your instinct keeps the team's delivery steady and buys the new hire runway. The shadow: routing work around someone can quietly become permanent.",
      cautious: "You wrote the docs the ramp was missing so it's repeatable. Your instinct fixes the pothole for the next person too. The shadow: documentation helps the next hire more than this one, who needs a human right now.",
      hero: "You quietly did their work to keep things moving. Your instinct protects the team's output first. The shadow: covering for someone hides the problem from everyone, including them, until it's too big to coach.",
    },
    discussion: [
      "At what point does 'support' become 'avoiding the hard conversation'?",
      "Is a slow ramp the hire's problem, the onboarding's problem, or the team's?",
    ],
    facilitatorNote: "Emotionally loaded: keep it about instincts, not real people. The hero card here is a trap worth naming warmly: covering feels kind and is often the least kind option.",
  },
  {
    id: 'design-stalemate',
    prompt: "Two senior engineers are deadlocked on a design. Both are right in part. The team is stalling. Break it.",
    hand: [
      { card: 'Counter Argument', style: 'politician', move: "Build the strongest case for one side and move to win the room to it." },
      { card: 'Breakthrough', style: 'innovator', move: "Propose a third option that reframes the debate past the deadlock." },
      { card: '1:1 Meetings', style: 'delegator', move: "Pull each aside privately to find what's really underneath the disagreement." },
      { card: 'Compromise', style: 'realistic', move: "Split the difference and pick a path so the team can move today." },
    ],
    reflections: {
      politician: "You built the case and moved to win the room. Your instinct breaks a tie by making the strongest argument carry the decision. The shadow: 'winning' a design debate can leave the loser disengaged from the thing they now have to build.",
      innovator: "You proposed a third option that reframed the whole debate. Your instinct escapes false binaries by changing the question. The shadow: a reframe can feel like dodging the decision the two of them actually needed made.",
      delegator: "You pulled each aside in a 1:1 to understand what's really underneath. Your instinct is that a stalemate is usually about people, not architecture. The shadow: the team is stalling now, and private diplomacy takes time it may not have.",
      realistic: "You split the difference and picked a path so the team could move. Your instinct values momentum over the perfect answer. The shadow: a compromise nobody loves can be worse than either option done fully.",
    },
    discussion: [
      "Is a design deadlock a technical problem or a relationship problem?",
      "When is a 'good enough, decide now' better than the right answer three days late?",
    ],
    facilitatorNote: "Great for surfacing how people treat conflict. Note who tries to win it, who tries to dissolve it, and who tries to understand it, all three are leadership, differently shaped.",
  },
  {
    id: 'fragile-legacy',
    prompt: "A creaky legacy service technically works. Leadership wants shiny new features on top of it. Where do you point the team?",
    hand: [
      { card: 'Refactoring Sprint', style: 'cautious', move: "Stabilize the shaky foundation first, before adding any new weight." },
      { card: 'Ship It and Forget It', style: 'hero', move: "Bolt the features on now and deal with the cracks later." },
      { card: 'Hiring', style: 'delegator', move: "Staff a dedicated team to properly own the legacy service." },
      { card: 'Resume-Driven Development', style: 'innovator', move: "Pitch rebuilding it on a modern platform to unlock the leverage." },
    ],
    reflections: {
      cautious: "You stabilized the foundation before adding weight to it. Your instinct won't build on sand. The shadow: invisible hardening work can read as 'no progress' to the people who wanted features.",
      hero: "You bolted the features on and kept moving. Your instinct delivers what's asked and deals with the cracks later. The shadow: 'later' compounds, and the person holding the pager when it breaks is often you.",
      delegator: "You staffed a team to properly own the legacy service. Your instinct scales the problem with people, not with your own nights. The shadow: hiring is slow, and the feature request is now.",
      innovator: "You proposed rebuilding it on a modern platform. Your instinct sees the creaky service as leverage waiting to be unlocked. The shadow: a rewrite is the most expensive bet on the board, and it rarely comes in on time.",
    },
    discussion: [
      "How do you sell invisible stabilization work to leadership that wants features?",
      "When is 'rewrite it' courage, and when is it avoidance of the boring fix?",
    ],
    facilitatorNote: "The classic tech-debt fork. Ask each person to name the cost their card pushes onto a future quarter. Every option here borrows from the future differently.",
  },
  {
    id: 'stolen-credit',
    prompt: "In a leadership review, a peer manager takes credit for your team's biggest win. The room believes them. Your move?",
    hand: [
      { card: 'Skilled Execution', style: 'realistic', move: "Let the work speak: keep your team delivering and trust results to compound." },
      { card: 'Owed Favors', style: 'politician', move: "Call in relationships off-stage to quietly set the record straight." },
      { card: 'Documentation', style: 'cautious', move: "Reach for the paper trail that shows whose work it actually was." },
      { card: 'Overreach', style: 'hero', move: "Reclaim the credit in the room, in the moment, out loud." },
    ],
    reflections: {
      realistic: "You let the work speak and kept your team delivering. Your instinct trusts that results compound and credit eventually follows. The shadow: sometimes it doesn't, and the people who quietly deliver get quietly overlooked.",
      politician: "You called in relationships to set the record straight off-stage. Your instinct fixes perception through the people who shape it, not through confrontation. The shadow: backchannels can spend more capital than the credit was worth.",
      cautious: "You reached for the receipts: the paper trail that shows whose work it was. Your instinct settles disputes with evidence, not volume. The shadow: being right on the record doesn't always change the room's memory.",
      hero: "You went over the top to reclaim the credit in the moment. Your instinct is that letting it slide teaches everyone the wrong lesson. The shadow: a public fight over credit can cost you more standing than the credit itself.",
    },
    discussion: [
      "Is protecting your team's credit a duty, or is chasing it a distraction from the work?",
      "What does your team learn from watching how you respond to this?",
    ],
    facilitatorNote: "This one gets personal fast: that's the value. Keep it in the third person. The split between 'let the work speak' and 'address it now' is a real values fault line worth sitting with.",
  },
];
