# Rush Q Cards -- Quick Mode Design v1

**Status:** Draft for review
**Date:** 2026-03-08
**Players:** 2-4 / **Duration:** 15-25 min / **Reuses:** Same card deck as full game

---

## 1. Core Concept

A fast, competitive card game set in the same corporate world as full Rush Q. Players are tech managers racing to deliver projects, hire talent, and fulfill hidden agendas across 3 quarters. Same cards, different rules -- designed so a teenager could pick it up in 5 minutes.

### Win Condition

Score the most reputation. Three sources:
- **Completed projects** earn their reward value
- **Secret agenda** (hidden personal objective) earns +10 flat bonus if fulfilled
- **Management directives** (public objectives) earn +8-12 to the first player who completes them

You CAN win without your agenda, but completing it gives a significant edge.

---

## 2. Card Roles (Reusing Existing Card Data)

| Existing Type | Quick Mode Role |
|---|---|
| Project Queue + Bonus Project (20 cards) | Revealed projects to claim and complete |
| Talent + Team (40 cards) | People you hire to your field and commit to projects |
| Soft Skills (11 cards) | Defense/negotiation -- block poaching, trade advantages |
| Hard Skills (11 cards) | Efficiency -- reduce requirements, accelerate delivery |
| Power Skills (16 cards) | Aggressive -- poach people, force discards, steal claims |
| Favors (2 cards) | Wild cards -- flexible value for any action |
| Events (12 cards) | Repurposed as management directive deck |
| Layoffs (4 cards) | Shuffled into project deck as crisis cards -- when revealed, all players lose something |
| Budget cards (CapEx/OpEx, 8 cards) | Budget cards with triangle/square symbols |

### New Cards Needed

**Agenda cards (~15-20):** Secret personal objectives. Examples:
- "Empire Builder" -- Have 5+ people on your field at game end
- "Speed Demon" -- Complete 3 projects before anyone else completes 2
- "Specialist" -- Complete a project that required a specific role match
- "Minimalist" -- Complete 2 projects using only 2 people total
- "Networker" -- Successfully trade with every other player at least once
- "Big Fish" -- Complete a project worth 5+ reward
- "Hoarder" -- End the game with 4+ hand cards
- "Poacher" -- Successfully steal a person from another player
- "Lean Machine" -- Complete a project with 0 OpEx cost
- "Double Down" -- Complete 2 projects in the same quarter

**Management directive cards (~8-10):** Public objectives revealed at Q1 and Q3. Examples:
- "Board wants a big win" -- First to complete a 5+ reward project: +10
- "Cost-cutting initiative" -- First to complete a project spending 0 hand cards: +8
- "Talent showcase" -- First with 4+ people on field: +8
- "Ship fast" -- First to complete 2 projects total: +10
- "Innovation push" -- First to complete a Bonus Project type: +8

---

## 3. Budget System (Shapes, Not Numbers)

Two budget types represented by shapes:

| Shape | Type | Purpose |
|---|---|---|
| Triangle (CapEx) | Capital expenditure | Spend to hire people from the pool |
| Square (OpEx) | Operational expenditure | Pay project requirements (some projects need squares to run) |

### Budget Cards

Budget cards show combinations of triangles and squares:
- 2 triangles -- pure hiring power
- 2 squares -- pure project fuel
- 1 triangle + 1 square -- flexible
- 2 triangles + 1 square -- strong, rare

**Key rule:** Budget cards you don't use on your turn discard automatically at end of turn. This forces decisions: use it, trade it, or lose it.

### Hiring Costs (CapEx / Triangles)

- Basic roles (Junior Dev, Coordinator, Intern): 1 triangle
- Standard roles (Manager, QA, Contractor): 2 triangles
- Premium roles (Tech Lead, Specialist): 3 triangles

### Project OpEx Requirements

Some projects require square payments to activate:
- Simple projects: 0 squares (just need people)
- Medium projects: 1 square
- Complex projects: 2 squares

---

## 4. Turn Structure

### Setup

1. Shuffle cards into 3 decks: Projects, People Pool (4 visible), Action Deck (skills + budget mixed)
2. Each player draws 5 action cards + receives 1 free starter person
3. Each player draws 2 agenda cards, keeps 1 (secret), other goes back
4. Flip 1 management directive (public)

### Quarter Flow (3 quarters total)

**1. Reveal** -- Flip 3 project cards to the center (join any unclaimed projects from prior quarter)

**2. Turns** -- Clockwise, each player does ONE action per turn:
- **Hire** -- Spend triangle budget card(s) to recruit a person from the pool to your field
- **Commit** -- Assign people from your field to a revealed project (locks them until project resolves)
- **Play a skill card** -- For its effect (draw, block, poach, boost)
- **Trade** -- Offer another player a deal (cards, budget, promises -- nothing enforced)
- **Draw 1** card from the action deck

**3. Turns continue** around the table until all players pass consecutively

**4. Quarter end:**
- Projects with enough committed people + OpEx paid = complete. Earn reward rep.
- Incomplete projects: people return, no penalty (but wasted tempo)
- All committed people on completed projects return to your field
- Everyone draws 2 cards
- Refill people pool to 4 visible

### Before Quarter 3

Flip the final management directive (public). Last chance to pivot strategy.

---

## 5. Project Completion (Simplified)

**No progress tracking.** A project completes at quarter end if:
1. Enough people committed (meets `members` requirement)
2. OpEx squares paid (meets project's square cost)
3. Deadline met (project available for at least N quarters where N = deadline field, minimum 1)

For Quick Mode, most projects have deadline = 1 (complete same quarter you commit). Some larger projects have deadline = 2 (need people committed across 2 quarters -- people stay locked).

**"Counts as 2" people:** Tech Lead and Specialist count as 2 people for commitment purposes. This is their key advantage.

**What happens on completion:**
- Project card goes to your score pile (worth its reward value)
- People return to your field (available next quarter)

**What happens on failure/abandonment:**
- No negative reputation (keeps it casual)
- Punishment is lost tempo -- your people were locked doing nothing useful

---

## 6. Player Interactions (5 Types)

### 6a. Competing (Passive)
Multiple players can commit people to the same revealed project. At quarter end, only the player who FULLY meets requirements gets it. If tied, the player who committed first (earlier in turn order) wins.

### 6b. Poaching (Aggressive)
Play a Power skill card to steal 1 UNCOMMITTED person from another player's field. Target can block by discarding a Soft skill card. If no block, person moves to your field.

### 6c. Negotiation (Social)
On a Trade action, offer any combination of hand cards, budget cards, or verbal promises. Nothing is enforced by rules. You can promise to lend someone next quarter and just... not. Pure workplace politics.

### 6d. Underbidding (Competitive Claiming)
When a player commits to a project, another player can challenge by discarding 2 hand cards. Both players race: at quarter end, whoever has MORE people committed gets the project (ties go to the challenger since they paid 2 cards). Loser's people return.

### 6e. Lending (Cooperative-ish)
On your turn, loan 1 uncommitted person to another player's project for this quarter. They count toward that project's requirement. You draw 1 card as payment. Person returns to your field at quarter end. Looks friendly but frees your people for your real agenda.

---

## 7. Scoring Summary

| Source | Points |
|---|---|
| Completed projects | Their reward value (2-8 per project) |
| Secret agenda fulfilled | +10 flat bonus |
| Management directive (first to complete) | +8-12 per directive |
| Leftover people on field | +1 each |

**Game end:** After quarter 3 resolves, tally scores. Highest total wins. Ties broken by: most projects completed, then most people on field.

---

## 8. Design Goals

- **5-minute teach:** Two shapes, one action per turn, 3 quarters
- **Hidden information:** Secret agendas create reads, bluffs, and misdirection
- **Social interaction:** Trading, lending, poaching, and lying make every game different
- **Reuses existing cards:** No new art needed, just agenda/directive cards (text only)
- **Workplace satire preserved:** Corporate politics through hidden agendas, not sabotage cards

---

## 9. Discarded Features (For Agent Review)

Features considered but cut for simplicity. Agents should evaluate whether any should be restored:

### 9a. Progress Tracking
Original design had per-project progress tokens (people generate +1/turn, Tech Lead +2, Push action +1 for discarding a card). Cut because tracking individual progress per project per player adds bookkeeping that slows a casual game. Current model: you either have enough people committed or you don't.

**Trade-off:** Simpler but removes the "Push" action (discard cards for progress) which was a nice tension between hand size and project speed.

### 9b. Four Budget Symbol Types
Original design had 4 symbols (Tech, Ops, Growth, Wild) mapped to hiring different role categories. Cut to 2 shapes (triangle CapEx, square OpEx) for clarity.

**Trade-off:** Less variety in hiring puzzle, but much easier to teach and remember.

### 9c. Negative Reputation on Project Failure
Full game penalizes failed projects. Quick Mode has no penalty -- you just lose tempo.

**Trade-off:** Lower stakes may reduce tension. But negative points in casual games often feel bad and discourage risk-taking.

### 9d. Individual Card Progress (Push Action)
Players could discard hand cards to add +1 progress to a committed project. Created tension between keeping cards for skills/trading vs. accelerating delivery.

**Trade-off:** Without progress tracking, this action has no home. Could be reimagined as "discard 1 card to count as +1 extra person for commitment purposes this quarter."

### 9e. Crisis Cards in Project Deck
Layoff cards shuffled into the project deck. When flipped during Reveal, all players suffer (lose a person, discard cards). Creates surprise tension.

**Trade-off:** Random punishment in a casual game can feel unfair. But it adds drama and the "oh no" moments that make card games memorable.

### 9f. Hand Card Limit
No hand limit in current design. Could add a limit of 7 to force discard decisions and prevent hoarding.

**Trade-off:** Adds a rule but creates interesting decisions about what to keep.
