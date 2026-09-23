# Rush Q Cards -- Quick Mode Design v2

**Status:** Post-review revision
**Date:** 2026-03-08
**Players:** 2-4 / **Duration:** 15-25 min / **Reuses:** Same card deck as full game

---

## 1. Core Concept

A fast, competitive card game set in the same corporate world as full Rush Q. Players are tech managers racing to deliver projects, hire talent, and fulfill hidden agendas across 3 quarters. Same cards, different rules -- designed so a teenager could learn it in under 5 minutes.

### Win Condition

Score the most reputation. Four sources:
- **Completed projects** earn their reward value
- **Secret agenda** (hidden personal objective) earns +10 flat bonus if fulfilled
- **Management directives** (public objectives) earn +8-12 to the first player who completes them
- **Leftover people** on your field at game end: +1 each

You CAN win without your agenda, but completing it gives a significant edge.

### Game End

After quarter 3 resolves, enter the Retro Phase (Section 8). Then tally scores. Highest total wins. Ties broken by: most projects completed, then most people on field.

---

## 2. Card Roles (Reusing Existing Card Data)

| Existing Type | Quick Mode Role |
|---|---|
| Project Queue + Bonus Project (20 cards) | Revealed projects to claim and complete |
| Talent + Team (40 cards) | People you draft and hire to your field, then commit to projects |
| Soft Skills (11 cards) | Defense/negotiation -- block poaching, trade advantages |
| Hard Skills (11 cards) | Efficiency -- reduce requirements, accelerate delivery |
| Power Skills (16 cards) | Aggressive -- poach people, force discards, steal claims |
| Favors (2 cards) | Wild cards -- flexible value for any action |
| Events (12 cards) | Repurposed as management directive deck (public objectives) |
| Layoffs (4 cards) | 3 shuffled into project deck as crisis cards; 1 held for Q2 crisis |
| Budget cards (8 cards) | Budget cards with triangle/square symbols |

### New Cards Needed

**Agenda cards (15-20).** Secret personal objectives. Draw 2, keep 1 at setup. Agendas are grouped by difficulty tier to prevent variance (all should require deliberate effort, none should be passively achievable).

Tier A -- Action-based (require specific plays):
- "Speed Demon" -- Complete 3 projects total
- "Double Down" -- Complete 2 projects in the same quarter
- "Poacher" -- Successfully poach a person from another player
- "Dealmaker" -- Complete 3 trades across the game
- "Lean Machine" -- Complete a project with 0 square cost
- "Clutch Player" -- Complete a project in Q3 that you committed to in Q3

Tier B -- Board-state (require specific field conditions):
- "Empire Builder" -- Have 5+ people on your field at game end
- "Big Fish" -- Complete a project worth 5+ reward
- "Specialist" -- Complete a project using a "counts as 2" person
- "Full House" -- Have people committed to 2+ projects simultaneously
- "Jack of All Trades" -- Have 3+ different role types on your field

Tier C -- Social (require interaction with other players):
- "Networker" -- Trade with every other player at least once
- "Generous Leader" -- Lend a person to another player's project
- "Survivor" -- Be the only player to complete a project in any single quarter
- "Opportunist" -- Claim a management directive

**Management directive cards (8-10).** Public objectives revealed at Q1 and Q3. First player to complete claims it.
- "Board wants a big win" -- First to complete a 5+ reward project: +10
- "Cost-cutting initiative" -- First to complete a project spending 0 hand cards: +8
- "Talent showcase" -- First with 4+ people on field: +8
- "Ship fast" -- First to complete 2 projects total: +10
- "Innovation push" -- First to complete a Bonus Project type: +8
- "Reliability mandate" -- First to complete 2 projects without any failing: +8
- "Cross-team excellence" -- First to lend a person that helps complete a project: +8
- "Resource efficiency" -- First to complete a project using exactly the minimum people required: +10

---

## 3. Budget System (Shapes)

Two budget types represented by shapes. In Quick Mode, use only shape names -- no business jargon.

| Shape | Name | Purpose |
|---|---|---|
| Triangle | Hiring budget | Spend to recruit people from the pool |
| Square | Project budget | Pay project requirements (some projects need squares to run) |

### Budget Cards

Budget cards show combinations of triangles and squares:
- 2 triangles -- pure hiring power
- 2 squares -- pure project fuel
- 1 triangle + 1 square -- flexible
- 2 triangles + 1 square -- strong, rare

**Key rule:** Budget cards you don't spend on your turn discard automatically at end of turn. Before discarding, you may trade them to another player. Cards should have a visible expiry indicator (flame/hourglass icon) so players remember this rule.

### Hiring Costs (Triangles)

- Basic roles (Junior Dev, Coordinator, Intern): 1 triangle
- Standard roles (Manager, QA, Contractor): 2 triangles
- Premium roles (Tech Lead, Specialist): 4 triangles

Premium people are expensive because they "count as 2" for project commitment (see Section 5).

### Project Square Requirements

Some projects require square payments to activate:
- Simple projects: 0 squares (just need people)
- Medium projects: 1 square
- Complex projects: 2 squares

---

## 4. Turn Structure

### Setup

1. Shuffle cards into 3 decks: **Projects** (include 3 crisis cards from Layoffs), **People Pool**, **Action Deck** (skills + budget mixed)
2. Each player draws 5 action cards
3. **People Draft:** Reveal 6 people face-up. Players snake-draft 2 each (1st player picks 1, 2nd picks 1... last player picks 2, then back up). This is your starting team.
4. Each player draws 2 agenda cards, keeps 1 (secret), shuffles the other back
5. Flip 1 management directive (public)
6. Refill people pool to 4 visible

### Quarter 1

**1. Reveal** -- Flip 3 project cards to the center. If a **crisis card** is revealed, resolve it immediately (see Section 6e), then flip a replacement.

**2. Turns** -- Clockwise, each player does ONE action per turn:
- **Hire** -- Spend triangle budget card(s) matching the hire cost to recruit a person from the pool
- **Commit** -- Assign people from your field to a revealed project (locks them until project resolves)
- **Push** -- Discard 1 hand card to count as +1 extra person on a project you are committed to this quarter
- **Play a skill card** -- For its effect (block, poach, boost, etc.)
- **Trade** -- Offer another player a deal (cards, budget, promises -- nothing enforced by rules)
- **Draw** -- Draw 2 cards from the action deck, keep 1, discard the other

**3. Turns continue** around the table until all players pass consecutively

**4. Quarter end:**
- Projects with enough committed people (real + pushed) and squares paid = complete. Earn reward rep.
- Incomplete projects stay in the center (carry over to next quarter, people stay locked if you choose)
- People from completed projects return to your field
- Everyone draws 2 cards
- Refill people pool to 4 visible
- Randomize start player for next quarter

### Quarter 2: Disruption

**Before the reveal, flip 1 crisis card** from the remaining Layoff deck. All players resolve its effect (lose a person, discard cards, etc.). This is the mid-game shakeup.

Then proceed with Reveal, Turns, and Quarter End as normal.

### Before Quarter 3

Flip the **final management directive** (public). Two directives are now in play. Last chance to pivot strategy.

### Quarter 3: Sprint

Proceed with Reveal, Turns, and Quarter End as normal. After scoring, enter the Retro Phase (Section 8).

---

## 5. Project Completion (Simplified)

**No progress tracking.** A project completes at quarter end if:
1. Enough people committed -- real people + "pushed" virtual people meet the `members` requirement
2. Squares paid -- project's square cost has been covered by played budget cards

Most projects have deadline = 1 (complete same quarter you commit). A few large projects have deadline = 2 (need commitment across 2 quarters -- people stay locked, but you can Push additional cards across turns).

### "Counts as 2" People

Tech Lead and Specialist count as 2 people for **project commitment only.** They do NOT count as 2 for agenda purposes (e.g., "Empire Builder: 5+ people" counts them as 1).

This is their key advantage. It should be printed clearly on the card face.

### Push Action

Discard 1 hand card from your hand to count as +1 person on a project you are committed to this quarter. You can Push multiple times across turns. This lets you stretch a thin roster by burning hand cards -- the real tradeoff of depleting reserves to meet a deadline.

### Completing

- Project card goes to your score pile (worth its reward value)
- People return to your field (available next quarter)
- Check if any management directive is fulfilled

### Failing / Abandoning

- No negative reputation (keeps it casual)
- Punishment is lost tempo -- your people were locked, your cards were pushed, and you got nothing
- Incomplete projects stay in the center for other players (or yourself) next quarter

---

## 6. Player Interactions (4 Types + Crisis)

### 6a. Competing (Passive)
Multiple players can commit people to the same revealed project. At quarter end, only the player who FULLY meets requirements gets it. If multiple players fully meet requirements, the player who committed first (earlier in turn order that quarter) wins. Loser's people return to their field, pushed cards are still lost.

### 6b. Poaching (Aggressive)
Play a Power skill card to steal 1 UNCOMMITTED person from another player's field. Target can block by discarding a Soft skill card (the "Nope" of Rush Q). If no block, person moves to your field immediately.

### 6c. Negotiation (Social)
On a Trade action, offer another player any combination of hand cards, budget cards, or verbal promises. Deals are NOT enforced by rules. You can promise to lend someone next quarter and break that promise. Players can negotiate at any time but can only finalize a trade on their own turn using the Trade action.

### 6d. Lending (Cooperative-ish)
On your turn, loan 1 uncommitted person to another player's project for this quarter. That person counts toward the project's requirement. You draw 2 cards as payment (not 1 -- lending must be worth it). Person returns to your field at quarter end regardless of project outcome.

Lending looks collaborative but serves hidden motives: it frees up your own people, earns you cards, and can set up future trades or fulfill social agendas.

### 6e. Crisis Cards
When a crisis card is flipped during the Reveal phase (shuffled into the project deck), resolve it immediately before continuing. All players are affected. Effects include:
- Lose 1 uncommitted person (player's choice which)
- Discard 2 hand cards
- Lose 1 budget card without using it

After resolving, flip a replacement project card. 3 crisis cards are shuffled into the ~20 card project deck, so players know roughly 1 per quarter is possible but never exactly when.

The Q2 guaranteed crisis (from the Layoff deck) is separate and always fires.

---

## 7. Scoring Summary

| Source | Points |
|---|---|
| Completed projects | Their reward value (2-8 per project) |
| Secret agenda fulfilled | +10 flat bonus |
| Management directive (first to claim) | +8-12 per directive |
| Leftover people on field | +1 each |

---

## 8. Retro Phase (Built-in Debrief)

After Q3 scoring, before tallying final scores:

1. **Agenda reveal.** Each player flips their secret agenda face-up and announces whether they completed it. This reframes everything -- "THAT'S why you were hoarding people!"

2. **One question.** Each player answers: "What did you sacrifice to pursue your agenda?" This takes 2-3 minutes and creates the "aha" moments that make the game a conversation starter, not just a time-killer.

3. **Tally scores.** Add project rewards + agenda bonus + directive bonus + leftover people.

4. **Winner announced.** Optional: "Most Backstabs" tongue-in-cheek award for the player who broke the most promises.

The Retro Phase is part of the rules, not a facilitator add-on. It happens every game.

---

## 9. Design Goals

- **5-minute teach:** Two shapes, one action per turn, 3 quarters, draft your team
- **Hidden information:** Secret agendas create reads, bluffs, and misdirection
- **Social interaction:** Trading, lending, poaching, and lying make every game different
- **Drama moments:** Crisis cards create shared "oh no" stories players retell
- **Comeback mechanics:** Push action lets trailing players burn cards to compete
- **Reuses existing cards:** No new art needed; agenda/directive/crisis cards are text-only additions
- **Workplace satire:** Corporate politics emerge from hidden agendas and broken promises, not explicit sabotage
- **Built-in learning:** Retro Phase makes every game end with a real conversation

---

## 10. Player Count Variants

### 3-4 Players (Standard)
Play as written. Best experience at 4 -- maximum social friction and project scarcity.

### 2 Players (Rival Variant)
Negotiation and lending lose meaning at 2 players. Add a "Rival Company" mechanism:
- At each quarter end, any unclaimed project in the center is claimed by the Rival (remove from game).
- The Rival creates urgency: claim projects now or lose them forever.
- Poaching still works between the 2 players.
- Lending is replaced by: on your turn, you may discard 1 person from your field to remove 1 Rival-claimed project from the game (corporate espionage flavor).

### Solo (Challenge Mode)
Play against the Rival Company mechanism. Score threshold targets:
- 15+ rep: Promoted
- 10-14 rep: Survived
- Under 10: Laid off

---

## 11. Quick Reference (Player Aid Card)

**Your turn: pick ONE action**
- HIRE -- Spend triangles, take a person from pool
- COMMIT -- Lock your people to a project
- PUSH -- Discard 1 card = +1 virtual person on your project
- PLAY -- Use a skill card for its effect
- TRADE -- Make a deal (promises are NOT binding)
- DRAW -- Take 2 cards, keep 1

**Quarter end:** Projects with enough people + squares = complete. People return. Draw 2. New start player.

**Crisis cards:** When flipped, everyone suffers. Then flip a replacement project.

**Shapes:** Triangles = hire people. Squares = pay project costs. Budget cards expire at end of YOUR turn.

**Premium people (Tech Lead, Specialist):** Count as 2 for projects. Cost 4 triangles. Count as 1 for agendas.

**Winning:** Most rep wins. Projects + agenda (+10) + directives (+8-12) + leftover people (+1 each).

---

## 12. Changes from v1 (Post-Review)

Based on feedback from 5 agent reviewers (Tech Lead, Product Manager, Casual Gamer, Game Designer, Engineering Manager):

1. **Restored crisis cards** (2-3 in project deck + 1 guaranteed Q2) -- unanimous request
2. **Restored Push action** as "discard 1 card = +1 virtual person" -- 4/5 requested
3. **Removed underbidding** from base rules -- 4/5 found it confusing or too expensive
4. **Added Q2 guaranteed crisis** -- three-act arc: optimism, disruption, sprint
5. **Added snake draft opening** -- fixes dead Q1 start, creates interaction before turn 1
6. **Buffed Draw action** to "draw 2 keep 1" -- old "draw 1" was a trap action
7. **Buffed lending payoff** to 2 cards -- old payoff was too low to ever use
8. **Increased premium hire cost** to 4 triangles -- prevents autopick dominance
9. **Dropped CapEx/OpEx terminology** -- shapes only, no business jargon in Quick Mode
10. **Added built-in Retro Phase** -- agenda reveal + question after every game
11. **Expanded to 15+ agenda cards** with difficulty tiers to prevent passive completion
12. **Added budget card expiry visual indicator** requirement
13. **Added 2-player Rival variant** and solo Challenge Mode
14. **Randomized start player each quarter** -- prevents first-player advantage on directives
