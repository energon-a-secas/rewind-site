# Rush Q Cards -- Tech Role Brainstorm Reviews

Compiled from 5 parallel agent reviews, each adopting a different tech leadership persona to evaluate the game as a teaching/learning tool.

---

## Table of Contents

1. [Staff/Principal Engineer](#1-staffprincipal-engineer)
2. [VP of Engineering](#2-vp-of-engineering)
3. [Senior Product Manager](#3-senior-product-manager)
4. [Agile Coach](#4-agile-coach)
5. [CTO / Tech Strategy](#5-cto--tech-strategy)
6. [Cross-Role Themes](#6-cross-role-themes)
7. [Consolidated Mechanic Proposals](#7-consolidated-mechanic-proposals)

---

## 1. Staff/Principal Engineer

**Focus:** Day-to-day engineering realism, people dynamics, technical debt

### Key Findings

- Game teaches the "spreadsheet layer" (allocation, budgets, deadlines) but misses the "relationship layer" (trust, 1:1s, shielding from chaos, context switching costs).
- People-as-cards are interchangeable; need skill growth, morale, burnout, team chemistry, specialization.
- Tech debt should be persistent accumulating tokens, not one-shot events.

### Proposed Mechanics

1. **Retention Clock** -- Each person has a satisfaction counter. Neglect (unassigned, overworked, no skill investment) ticks it down. At zero, they leave. Teaches that retention is an active management activity.
2. **Shield Tax** -- When an event hits, the manager chooses: absorb it personally (lose a turn action) or pass it to the team (reduce team morale/satisfaction). Teaches the real cost of "shielding the team."
3. **Context Switch Penalty** -- Reassigning a person between projects costs 1 quarter of ramp-up time (reduced progress). Teaches that moving people between teams is not free.

---

## 2. VP of Engineering

**Focus:** Org design, headcount planning, cross-team dynamics, managing managers

### Key Findings

- Game operates as isolated silos; no cross-team dependencies or shared platform teams.
- No layer of indirection -- player directly assigns people, bypassing the "managing managers" challenge.
- Budget allocation is too simple (binary choice); real budget fights are annual, political, and forward-committed.
- Sabotage as a deliberate action is a caricature; real politics emerge from structural misalignment, not malice.
- Events are exogenous shocks with no causal link to player decisions (outages should correlate with tech debt, shipping speed).
- The Firefighter trait reinforces hero culture as a viable strategy.

### Proposed Mechanics

1. **Platform Debt** -- Allocate 0-3 people to a "Platform" track each quarter. They can't work on projects but generate Platform Credits. Every 3 credits permanently reduces future project member requirements by 1. Zero accumulated credits = 25% chance of a Tech Debt Crisis event. Teaches the courage required to slow down short-term delivery for long-term velocity.
2. **Dependency Chain** -- Strategic Initiative cards that span two players. Each contributes people and progress. Large reward split between both. Either player can defect mid-initiative (small rep hit but frees people; partner loses all invested progress). Teaches the prisoner's dilemma of cross-team work.
3. **Org Health Score** -- Hidden meter (0-10, starts at 5). Burst cards, layoffs, and failures decrease it; completions, soft skills, and mentoring increase it. Revealed at Q4 and Q8. High score = bonus cards and rep. Low score = attrition (lose people). Teaches that people management consequences are delayed and invisible until catastrophic.

### Workshop Format (bonus)

3-hour leadership offsite: 1hr play (no coaching), 1hr debrief by trait ("what did my style force me to do?"), 1hr redesign challenge (teams design a mechanic for a missing concept). Key rule: assign traits randomly to force leaders out of comfort zones.

---

## 3. Senior Product Manager

**Focus:** Prioritization, stakeholder management, engagement, debrief/learning

### Key Findings

- Prioritization frameworks are invisible -- "pick highest reward" is spreadsheet optimization, not product thinking. No customer impact or strategic dimension.
- "Saying no" has no mechanic -- no penalty for accepting work you should refuse.
- MVP thinking is completely absent -- all projects are all-or-nothing.
- No data-driven decisions or market signals informing what to build next.
- Stakeholder alignment is reactive (absorb events), not proactive (invest in alignment before reviews).
- Post-game debrief is a missed opportunity -- no decision replay, no counterfactual analysis.

### Engagement Critique

- First 5 minutes have too much cognitive load and delayed payoff. Q1 should present a forced dilemma, not a card dump.
- Hand should start at 3 cards, ramping to full by Q3.
- UI should show project completion forecasts so players feel tradeoffs in real time.
- First game should use a 40-card starter deck introducing one mechanic per quarter.

### Proposed Mechanics (Cards)

1. **"Scope Negotiation"** (Soft Skill) -- Choose an active project: reduce reward by 2, but also reduce member requirement by 1 and extend deadline by 1. Teaches MVP thinking -- reducing scope is a deliberate product decision.
2. **"Stakeholder Pre-Alignment"** (Soft Skill, shield) -- Play before Event phase. Negates assessment events (Executive Review, Board Review) entirely. No effect on other events. Cannot play other shields that quarter. Teaches proactive stakeholder management vs. reactive crisis response.
3. **"Kill the Project"** (Power Skill) -- Remove an active project with no failure penalty. Reassign all members. Lose 1 Favor. Cannot start a new project this quarter. Teaches sunk cost discipline and the hardest PM decision: killing something you invested in.

### Debrief Features

- Decision replay with counterfactual analysis ("You took Project X at Q2; Project Y would have given +5 more rep")
- Trait report card showing how management style shaped outcomes
- Cross-session pattern detection ("In 5 games, you've never completed a project early")
- Comparative debrief showing how AI handled the same events differently

---

## 4. Agile Coach

**Focus:** Iterative delivery, retrospectives, team dynamics, sustainable pace, collaboration

### Key Findings

- Projects have fixed scope, fixed time, fixed reward -- this is waterfall, not agile. No iterative delivery, MVPs, or scope flexibility.
- No inspect-and-adapt loop within the game. Quarters end, consequences land, next quarter starts with zero structured reflection.
- No WIP limits -- players can run 3 projects with no context-switching penalty. This violates Little's Law.
- No Definition of Done -- projects complete on math alone. No quality gate. Skipping QA has no consequence.
- No sustainable pace mechanic -- no burnout, fatigue, or overwork modeling.
- No collaboration -- every interaction is competitive or transactional. Sabotage cards teach zero-sum thinking.
- The game has 1,818 sabotage plays per 300 games (~1.5 per player per game).

### Structural Suggestions

- **Shared projects** allowing 2 players to co-own, creating the free-rider problem naturally.
- **Market health track** -- collective output threshold; if everyone underperforms, all suffer (budget cuts, hiring freeze).
- **Loan mechanic** -- lend a person to another player's project for 1 quarter in exchange for favors.

### Proposed Mechanics

1. **Retro Token** -- Each quarter-end, receive 1 token. Spend it to: (a) peek at top 3 event cards and reorder, (b) move 1 person between projects free, or (c) discard 2 / draw 2. Can also discard for 1 rep (but then you skip reflection). Teaches that pausing to reflect is the highest-leverage activity.
2. **WIP Tax** -- For every active project beyond 2, ALL projects receive 1 less progress that quarter. Not a hard cap -- you CAN run 3, but it slows everything. Reframes Risk Manager's 2-project limit as a structural advantage. Teaches Little's Law through pain.
3. **Technical Debt Snowball** -- Debt tokens persist and compound: -1 progress per token per quarter on that project. When a debt-laden project completes, tokens transfer to the player and reduce ALL future project progress by 0.5 each. Clearing debt costs a full action. Teaches that tech debt is a loan with compound interest.

---

## 5. CTO / Tech Strategy

**Focus:** Build vs buy, platform thinking, talent strategy, scaling, technology bets

### Key Findings

- Build vs. buy is entirely absent -- all projects are "build." No vendor solutions, integration complexity, or lock-in decisions.
- Platform investment has no representation -- no shared infrastructure that accelerates future work.
- Hiring strategy is one-dimensional -- no senior vs. junior tradeoff (expensive/productive vs. cheap/needs-ramp).
- No acqui-hire, vendor lock-in, or technical dependency mechanics.
- 50% CapEx rollover is unrealistically generous (real companies: 0% at fiscal year end).
- No concept of cloud migration (CapEx to OpEx shift).
- Tech debt has no financial cost in the budget system.
- No Conway's Law -- org structure doesn't shape system architecture.
- Communication overhead is linear, not quadratic (Brooks' Law absent).
- No Team Topologies (platform vs. stream-aligned vs. enabling teams).
- No middle management layer -- player is always a direct manager.

### Budget System Strengths (acknowledged)

- CapEx/OpEx split with fixed total and player-chosen allocation is genuinely good.
- 2:1 conversion ratio models real organizational friction.
- Payroll mechanic (1 OpEx/person) correctly teaches headcount is not one-time cost.
- ROI feedback loop (success = bigger budget, failure = smaller) mirrors real corporate funding.
- FTE ceiling of 8 implicitly teaches capacity limits.

### Proposed Mechanics

1. **Technical Debt Compound Interest** -- Debt tokens from burst cards cost 1 OpEx/quarter (maintenance burden). At 3+ tokens on a project, it "collapses" (discarded, full penalty). Can spend a turn action + 2 OpEx to remove one token ("refactoring sprint"). Teaches the financial reality of tech debt.
2. **Platform Investment Project Type** -- 0 reputation on completion. Instead: permanent -1 member requirement on all future projects. High CapEx, long deadline, no ROI budget bonus. Teaches the hardest budget pitch: "fund this thing that produces no direct revenue."
3. **Organizational Gravity (Conway's Law)** -- After Q3, reassigning people between projects costs 2 OpEx per person moved. New hires assign freely. A "Re-org" skill card waives cost once. Teaches that team structure set early constrains everything later.

---

## 6. Cross-Role Themes

Themes that appeared across 3+ reviews, indicating high-priority gaps:

### Technical Debt (all 5 roles)
Every reviewer flagged tech debt as the #1 missing mechanic. Current one-shot events don't teach compounding cost. Consensus: persistent tokens that accumulate, drain resources, and eventually cause failures.

### People Are Not Interchangeable (4/5 roles)
Staff Eng, VP, Agile Coach, and CTO all noted that people cards lack growth, chemistry, morale, specialization, or ramp-up time. Context switching is free and unrealistic.

### No Iterative/MVP Delivery (4/5 roles)
PM, Agile Coach, CTO, and Staff Eng flagged that projects are binary (done/not done) with fixed scope. No partial delivery, scope negotiation, or incremental value.

### Platform/Infrastructure Investment (3/5 roles)
VP, CTO, and Staff Eng all proposed a "platform project" type that trades short-term reputation for long-term structural advantage.

### Cross-Team Collaboration (3/5 roles)
VP, Agile Coach, and Staff Eng noted purely competitive dynamics miss real org collaboration. Shared projects, dependency chains, and loan mechanics proposed.

### Post-Game Learning/Debrief (3/5 roles)
PM, Agile Coach, and VP emphasized that the post-game moment is where learning crystallizes. Decision replay, counterfactual analysis, and trait report cards proposed.

### WIP Limits / Focus (3/5 roles)
Agile Coach, CTO, and Staff Eng flagged no penalty for running too many projects simultaneously. WIP tax or diminishing returns proposed.

### Events Should Be Causal, Not Random (2/5 roles)
VP and Staff Eng both noted events should correlate with player behavior (tech debt -> outages, overwork -> attrition) rather than being purely random.

---

## 7. Consolidated Mechanic Proposals

Ranked by cross-role consensus and implementation feasibility:

### Tier 1: High Consensus, High Impact

| # | Mechanic | Proposed By | Complexity | Teaching Goal |
|---|----------|-------------|------------|---------------|
| 1 | **Tech Debt Snowball** | All 5 roles | Medium | Compounding cost of shortcuts |
| 2 | **WIP Tax** | 3 roles | Low | Focus > multitasking (Little's Law) |
| 3 | **Scope Negotiation card** | PM, Agile | Low | MVP thinking, scope as a lever |
| 4 | **Platform Project type** | VP, CTO, Staff | Medium | Long-term investment vs. short-term delivery |
| 5 | **Post-game Decision Replay** | PM, Agile, VP | Medium | Crystallize learning from play |

### Tier 2: Strong Ideas, Moderate Consensus

| # | Mechanic | Proposed By | Complexity | Teaching Goal |
|---|----------|-------------|------------|---------------|
| 6 | **Context Switch Penalty** | Staff, CTO | Low | People reassignment isn't free |
| 7 | **Retro Token** | Agile, PM | Low | Inspect-and-adapt loops |
| 8 | **Kill the Project card** | PM | Low | Sunk cost discipline |
| 9 | **Org Health Score** | VP, Staff | Medium | Invisible consequences of neglect |
| 10 | **Shared/Co-owned Projects** | Agile, VP | High | Cross-team collaboration |

### Tier 3: Visionary, Higher Complexity

| # | Mechanic | Proposed By | Complexity | Teaching Goal |
|---|----------|-------------|------------|---------------|
| 11 | **Dependency Chain** | VP | High | Prisoner's dilemma of cross-team work |
| 12 | **Organizational Gravity** | CTO | Medium | Conway's Law, reorg costs |
| 13 | **Retention Clock** | Staff | Medium | Active retention management |
| 14 | **Stakeholder Pre-Alignment** | PM | Low | Proactive vs reactive management |
| 15 | **Shield Tax** | Staff | Low | Cost of protecting your team |

### Quick Wins (can implement with minimal engine changes)

1. **WIP Tax**: Add 3 lines to `processQuarterEnd` -- count active projects, reduce progress if > 2.
2. **Context Switch Penalty**: In `assignPerson` / `unassignPerson`, track last-assigned project; if changed, set a `rampUp` flag reducing progress by 1 for 1 quarter.
3. **Scope Negotiation card**: New skill card entry in `cards.json` + handler in `effects.js`.
4. **Kill the Project card**: New Power skill card + handler.
5. **Retro Token**: Add to `traitQuarterStartActions` as a universal mechanic (not trait-specific).
