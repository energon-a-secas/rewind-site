# Rush Q Cards -- Learning Experience & Game Balance Analysis

**Date:** 2026-03-08
**Analyst role:** Learning Experience Designer & Game Balance Analyst
**Simulation:** 300 games x 4 AI players x 8 quarters, both Normal and Budget modes

---

## 1. Learning Analysis -- What Management Concepts Does the Game Teach?

### 1.1 Concepts Currently Taught Through Gameplay

| Concept | Mechanic That Teaches It | Strength of Lesson |
|---|---|---|
| **Resource allocation** | Assigning people to projects, choosing which project gets priority | Strong -- every turn forces a staffing decision |
| **Portfolio management** | Running multiple projects, balancing risk/reward across them | Strong -- 3-project cap forces prioritization |
| **Hiring vs. delivery tradeoff** | CapEx spent on people cannot be spent on projects | Moderate (budget mode only) |
| **Technical debt** | "Ship It and Forget It", "Heroic Programming" debt tokens, Technical Debt quarter event | Moderate -- present but consequences feel abstract |
| **Scope management** | Deadline cards (Refactoring Sprint, Cross-Team Dependency, Soothing Response) | Moderate -- extends or shrinks timelines |
| **Stakeholder management** | Events like Executive Review, Board Review, Skip-Level Surprise | Strong -- forces reactive decisions |
| **Crisis management** | Production Outage, Knowledge Silo, Team Conflict events | Strong -- must decide between paying costs or absorbing damage |
| **Political capital** | Favor cards as currency for negotiation and defense | Moderate -- Favors exist but AI cannot negotiate |
| **Sabotage / office politics** | Reassign Resources, Charm People, Undermine Reputation, Domain Collision | Present -- teaches that politics exist in management |
| **Risk assessment** | "Resume-Driven Development" and "Ship It and Forget It" offer risk/reward gambles | Moderate -- 60/40 and 50/50 odds are felt |
| **Budget discipline** | CapEx/OpEx limits per quarter, budget blocks | Strong in budget mode; absent in normal mode |
| **Innovation pressure** | Innovation Tax at Q6+ penalizes stagnation | Strong -- forces continuous delivery cadence |
| **Layoff survival** | Negative rep triggers team member loss at Q5+ | Moderate -- consequence is clear but recovery is hard |
| **Talent development** | Tech Lead bonus progress, Specialist versatility, Contractor card-draw on completion | Weak -- talent cards are functionally interchangeable except for bonuses |
| **Team composition** | Different talent types (Tech Lead, Contractor, Specialist, QA) have different effects | Moderate -- some variety but not deep |

### 1.2 Concepts MISSING That Should Be Taught

| Missing Concept | Why It Matters for Managers | Suggested Mechanic |
|---|---|---|
| **Delegation** | Managers must learn what to delegate and when. Currently the player does everything directly. | Trait ability: auto-resolve certain card types at reduced effect; or a "Delegate" skill card that gives +1 progress but you skip your draw phase. |
| **1:1 / coaching investment** | Investing in people yields compounding returns. The game has no talent growth. | People cards could "level up" after 2 completed projects, gaining +1 value or a new ability. |
| **Burnout / sustainability** | Overworking teams is a real risk. "Heroic Programming" hints at this but it is one card. | Assign >4 people to a single project = burnout risk. Each over-assigned person has a 25% chance of leaving next quarter. |
| **Communication overhead** | Brooks' Law: adding people to a late project makes it later. | Projects with 5+ members should have diminishing returns (each person beyond 4 adds 0.5 progress instead of 1). |
| **Succession planning** | Knowledge Silo event punishes this, but there is no proactive defense except holding Documentation. | A "Cross-Training" skill card that makes a project immune to Knowledge Silo. |
| **Strategic alignment** | OKR Alignment event exists but players do not set their own OKRs. | At game start, each player picks 2 "strategic priorities" (project types); completing aligned projects gives +2 bonus rep. |
| **Feedback loops** | Real managers get signals about what is working. | After each completed project, reveal the top card of the event deck -- information advantage for planning. |

### 1.3 Where Gameplay Reinforces Learning vs. Where It Is Just Randomness

**Reinforces learning (decisions matter):**
- Which project to take on (size vs. reward vs. deadline)
- When to hire vs. when to play skills
- How to assign people across projects (priority by urgency)
- When to use sabotage cards vs. when to invest in your own progress
- Budget mode: every purchase is an opportunity cost decision

**Mostly randomness (player has low agency):**
- Which event fires each quarter (no ability to predict or prepare beyond holding shields)
- Rush Q events hit everyone equally regardless of strategy
- Card draw luck determines whether you get progress cards or sabotage cards
- Market availability (which projects/people appear) is random
- Layoff cards in the Rush Q deck have arbitrary point thresholds

**Recommendation:** Increase agency over randomness. Let players peek at the next event (Foresight-like effects should be more common). Add a "planning phase" where players can reorder their hand or discard and redraw before Q1 starts.

### 1.4 Player Decisions Mapped to Real Management Decisions

| In-Game Decision | Real-World Equivalent |
|---|---|
| Assign people to projects | Sprint planning and team allocation |
| Take on a new project vs. focus on existing ones | Saying yes to new work vs. protecting current commitments |
| Play a shield card vs. a progress card | Defensive management vs. aggressive delivery |
| Spend Favors | Calling in political capital |
| Trade cards at market | Negotiating for resources in cross-team meetings |
| Use "Heroic Programming" | Asking a team to crunch -- effective short-term, destructive long-term |
| Play "Undermine Reputation" | Office politics and blame games |
| Hold cards in hand for defense | Keeping options open vs. acting immediately |
| Choose between CapEx and OpEx spending | Real budget management between infrastructure and operations |

---

## 2. Management Style Proposal -- Trait Card System

### 2.1 Design Principles

Each Trait should:
1. Create a **distinct playstyle** that maps to a real management archetype
2. Have a **clear strength** and a **meaningful weakness** (trade-off, not just upside)
3. Interact with **budget mode** to deepen the economic layer
4. Teach a **specific management lesson** through repeated play

### 2.2 Revised Trait Definitions

#### FACILITATOR
- **Archetype:** The People-First Leader (servant leadership)
- **Ability:** When you play a Soft Skill card, draw 1 card. Your people produce +1 morale (events cost 2 less rep to negate).
- **Weakness:** Hard Skill cards cost +1 OpEx. You cannot play sabotage cards (Undermine Reputation, Domain Collision, etc.).
- **Budget Interaction:** OpEx base +2 (more operational budget for people), CapEx base -2 (less for hiring/projects).
- **Learning Outcome:** Players learn that people-first leadership builds resilience and generates options, but moves slower on technical execution and cannot play political hardball.

#### NETWORKER
- **Archetype:** The Relationship Builder (stakeholder management)
- **Ability:** Recover Soft Skill cards from the discard pile (1 per quarter, free). Soft Skill OpEx costs halved (round down). Start with +1 Favor.
- **Weakness:** Hard Skills cost +1 OpEx. When a Rush Q event fires, you lose 1 additional rep (your network makes you visible).
- **Budget Interaction:** Can trade Favors as 2 CapEx worth of currency at markets.
- **Learning Outcome:** Players learn that relationships are a currency -- building a network creates options but also increases exposure and scrutiny.

#### VISIONARY (renamed from "New Type")
- **Archetype:** The Strategic Thinker (long-range planning)
- **Ability:** At the start of each quarter, peek at the top 2 cards of the Event deck and the Rush Q deck. Draw 1 additional card on Q1 and Q5 (fiscal year start).
- **Weakness:** Cannot play more than 1 Skill card per turn (analysis paralysis). Projects with deadline <= 2 get -1 progress per quarter (poor at urgency).
- **Budget Interaction:** CapEx base +2 (plans justify investment), OpEx base -2 (rigid operating model).
- **Learning Outcome:** Players learn that strategic foresight is powerful for planning but creates blind spots in execution. Information without action is wasted.

#### POLITICIAN
- **Archetype:** The Corporate Operator (political savvy)
- **Ability:** Recover Power Skill cards from the discard pile (1 per quarter, free). Power Skill OpEx costs halved. Sabotage cards cost 0 OpEx.
- **Weakness:** Project completion rewards reduced by 2 rep each (too busy politicking to deliver quality). If you end the game with negative rep, your penalty is doubled.
- **Budget Interaction:** Can redirect 2 CapEx from any opponent each quarter (through "political maneuvering").
- **Learning Outcome:** Players learn that political skill creates short-term advantage and disrupts opponents, but chronic politicking undermines your own delivery reputation. The doubled negative-rep penalty teaches that a political player who falls behind is devastated.

#### RISK MANAGER
- **Archetype:** The Conservative Leader (defensive management)
- **Ability:** Discard 1 Event card per quarter before it resolves. Shield cards can be played for free (0 OpEx).
- **Weakness:** Cannot take on more than 2 projects simultaneously. Cannot play burst cards (Heroic Programming). Progress cards add 1 less progress (minimum 1).
- **Budget Interaction:** CapEx and OpEx bases both +1 (conservative budgets get more consistent funding). Cannot spend more than half budget in a single turn.
- **Learning Outcome:** Players learn that risk management protects against downside but caps upside. The player who never takes risks is safe but rarely wins. Playing it safe is a strategy, not a victory condition.

#### SUBJECT MATTER EXPERT (SME)
- **Archetype:** The Technical Leader (hands-on expertise)
- **Ability:** Recover Hard Skill cards from the discard pile (1 per quarter, free). Hard Skill OpEx costs halved. Tech Lead talent cards under your control give +2 progress instead of +1.
- **Weakness:** Soft Skill cards cost +1 OpEx. Maximum hand size reduced by 2 (too focused to hold many options). Events that remove people target you first (poor people management).
- **Budget Interaction:** OpEx base +2 (technical tooling budget), CapEx base -1.
- **Learning Outcome:** Players learn that deep technical expertise accelerates delivery but creates tunnel vision. Neglecting soft skills and people management eventually catches up.

#### TIME WIZARD
- **Archetype:** The Execution-Focused Manager (delivery machine)
- **Ability:** +1 Progress per quarter on any one active project (automatic, before other effects). When you complete a project early (before deadline), gain +2 bonus rep.
- **Weakness:** Cannot extend deadlines using Soft Skill cards (no "Soothing Response" effect). Each project you fail costs double penalty rep.
- **Budget Interaction:** OpEx base +2 (operational efficiency), but unspent OpEx does not carry over (use it or lose it).
- **Learning Outcome:** Players learn that execution speed is king in project delivery, but rigidity about timelines creates fragility. When things go wrong, the execution-focused leader has no diplomatic tools to buy time.

### 2.3 Proposed New Traits (2 additions)

#### MENTOR (new)
- **Archetype:** The Coaching Leader (talent development)
- **Ability:** After completing a project, one assigned person "levels up" -- their trade value increases by 2 permanently. Once per game, promote a Semi Senior to Senior (free hire from For Hire deck).
- **Weakness:** First project each game takes +1 quarter (investing in training). Cannot use burst cards.
- **Budget Interaction:** CapEx base +3 (training budget), OpEx base -2 (less operational flexibility while training).
- **Learning Outcome:** Players learn that investing in people pays compounding returns, but front-loads cost. The Mentor starts slow and finishes strong -- teaching the real-world truth that coaching is a long-term investment.

#### FIREFIGHTER (new)
- **Archetype:** The Crisis Leader (incident response)
- **Ability:** When an Event would remove a person or freeze a project, you may pay 3 rep to negate it entirely. After negating any event, draw 2 cards. Production Outage events give you +3 rep instead of freezing you.
- **Weakness:** During quarters with no events, -1 progress on all projects (bored team, no urgency). Cannot hold more than 4 cards in hand at end of turn.
- **Budget Interaction:** OpEx base +3 (incident response budget), CapEx base -3 (no strategic investment).
- **Learning Outcome:** Players learn that some leaders thrive in chaos but create it when it does not exist. The Firefighter is the hero during crises but a liability during calm quarters -- teaching the anti-pattern of the "chaos-addicted manager."

### 2.4 Trait Balance Matrix

| Trait | Offensive | Defensive | Economy | Tempo | Political |
|---|---|---|---|---|---|
| Facilitator | Low | High | Moderate | Slow | None |
| Networker | Moderate | Moderate | High | Moderate | High |
| Visionary | Moderate | High | Moderate | Slow | Low |
| Politician | High | Low | High | Fast | Very High |
| Risk Manager | Low | Very High | Moderate | Very Slow | Low |
| SME | High | Low | Moderate | Fast | None |
| Time Wizard | Very High | Low | Moderate | Very Fast | None |
| Mentor | Low early, High late | Moderate | High late | Very Slow early | Low |
| Firefighter | Moderate | Very High (crisis) | Low | Reactive | Low |

---

## 3. Simulation Validation

### 3.1 Normal Mode Results (300 games, 1,200 player-games)

| Metric | Value | Assessment |
|---|---|---|
| Avg final reputation | 4.4 | Low -- most games end with players barely positive |
| Rep range | -40 to 79 | Very wide -- high variance |
| Rep std deviation | 17.8 | High variance; outcomes feel unpredictable |
| Players ending negative | 45.7% | Nearly half -- too punishing |
| Players completing 0 projects | 6.0% | Acceptable |
| Avg projects completed per player | 1.7 | Low for 8 quarters -- staffing is the bottleneck |
| Projects failed | 771 (27% of all started) | High fail rate -- understaffing is sole cause |
| Innovation Tax hits | 2,283 | 63.4% of eligible combos -- too frequent |
| Layoffs | 1,425 | Cascading punishment spiral |
| Trades | 3,588 | Healthy market activity |

**Key findings -- Normal mode:**
- **Innovation Tax is too punishing.** At 63.4%, it hits most players most quarters. It functions as an unavoidable rep drain rather than a teaching moment about stagnation. Recommendation: reduce to -1 rep or trigger only after 5 consecutive quarters without completion.
- **Negative rep spiral.** 45.7% end negative because: Innovation Tax drains rep -> negative rep triggers layoffs -> fewer people -> fewer project completions -> more Innovation Tax. This is a death spiral that removes player agency.
- **All project failures are understaffed.** Zero projects fail from "too slow" -- this means the deadline system is generous but the staffing requirement is the real chokepoint. Projects needing 5-6 members are nearly impossible to complete.
- **Sabotage is prevalent.** "Reassign Resources" and "Domain Collision" fire 1,818 combined times. In a 4-player game, this is roughly 1.5 sabotage plays per player per game -- enough to feel impactful without being oppressive.

### 3.2 Budget Mode Results (300 games, 1,200 player-games)

| Metric | Value | vs. Normal | Assessment |
|---|---|---|---|
| Avg final reputation | 8.5 | +4.1 | Better but still low |
| Rep std deviation | 19.7 | +1.9 | Slightly more variance |
| Players ending negative | 39.0% | -6.7pp | Improved but still high |
| Avg projects completed | 2.1 | +0.4 | Budget mode helps completion |
| Innovation Tax hits | 1,752 | -531 | Better but still 48.7% |
| Layoffs | 1,187 | -238 | Fewer death spirals |
| Budget blocks | 3,960 | N/A | ~3.3 blocks per player per game |
| Trades | 5,213 | +1,625 | More market engagement |
| "Shift The Blame" plays | 0 (never played) | -603 | Budget mode blocks expensive Power cards |
| "Fit Interviews" plays | 0 (never played) | -315 | Same -- blocked by OpEx cost |

**Key findings -- Budget mode:**
- **Budget creates meaningful decisions.** 3,960 budget blocks mean players are regularly denied actions they want to take. This is the core of good economic design -- scarcity forces prioritization.
- **Budget mode is paradoxically more forgiving.** Higher avg rep (+4.1), more projects completed (+0.4), fewer layoffs. This is because the budget constraint slows down sabotage (expensive Power cards like "Shift The Blame" become unplayable at value 10) and forces players toward cheaper, constructive cards.
- **Two skill cards become dead in budget mode.** "Shift The Blame" (value 10) and "Fit Interviews" (value 10) are never played because their OpEx cost exceeds the budget. These need rebalancing -- either reduce their value/cost or add a budget-mode discount.
- **Trading increases 45%.** Budget constraints push players toward the market, which is educational -- managers under budget pressure trade more to find resources.

### 3.3 Is There a Dominant Strategy?

**Normal mode:** The dominant strategy is "complete projects quickly and avoid sabotage." The simulation shows progress cards (3,526 plays) dominate, followed by shields (2,627). There is no benefit to playing politically vs. technically because all AI plays the same greedy algorithm. Without Traits active, there is no strategic diversity.

**Budget mode:** The constraint creates two viable approaches:
1. **Cheap and fast** -- play low-OpEx cards (Soft Skills), complete small projects, avoid expensive Power plays.
2. **Big investment** -- save budget for high-value Power plays and large projects with big rewards.

The AI always plays cheap-first (sorts by cost), so the simulation cannot show whether big-investment beats cheap-and-fast. But the data shows cheap-and-fast produces better average outcomes in simulation (budget mode avg rep is higher than normal mode).

**With Traits (projected):** Traits would break the single dominant strategy into 7-9 distinct viable strategies, each with different strengths against different matchups. This is the critical missing piece for both game balance and educational value.

### 3.4 Do Budget Constraints Create Meaningful Decisions?

**Yes, strongly.** Evidence:
- 3,960 budget blocks in 300 games = players hit the budget wall 3.3 times per game on average
- Two entire card archetypes (expensive Power Skills) become unplayable, forcing adaptation
- Trading increases 45%, meaning players engage more with the market economy
- The Innovation Tax rate drops from 63.4% to 48.7%, showing budget discipline improves delivery

Budget mode is the superior teaching tool. It should be the default mode, not optional.

---

## 4. Simplification Suggestions for 30-45 Minute Play

### 4.1 What to Simplify

| Current Mechanic | Problem | Simplification |
|---|---|---|
| **125 card definitions** | Too many unique effects to learn in one session | Reduce to 80 cards. Merge similar effects (e.g., "Skilled Execution" and "Production Release Preparation" both add progress). |
| **Value/negationCost/baseValue/recommendedNegationCost** | Four separate cost fields per card are confusing | Collapse to 2: **cost** (to play) and **counter-cost** (to negate). |
| **OpEx cost field exists but is 0 on most cards** | Inconsistent -- some cards have OpEx cost, most do not | In budget mode, all Skill cards cost 1 OpEx minimum. Remove per-card OpEx field. Use the card's value as the OpEx cost. |
| **Subcategory + effectType + skillSubtype + triggerTiming** | Four classification axes per card is designer complexity, not player complexity | Reduce to 2: **subcategory** (what it does: progress, shield, draw, sabotage, etc.) and **timing** (immediate, reactive, passive). |
| **Large projects (5-6 members)** | Simulation shows 100% of failures are from understaffing. 5-6 member projects are traps. | Cap project member requirements at 4. Reduce large project rewards proportionally. |
| **Innovation Tax at Q6+** | 63% hit rate in simulation. Feels like unavoidable punishment. | Trigger only after 5 consecutive quarters without completion. Reduce penalty to -1 rep. |
| **Layoffs checking every quarter from Q5+** | Creates death spiral with Innovation Tax | Layoffs trigger once at Q5 and once at Q7 only. Not every quarter. |
| **TL;DR cards (3 copies of 3 types = 9 cards)** | Reference cards that take up deck space | Print as a separate reference sheet, not cards in the deck. |
| **"Chance Skill" and "Opportunity Skill" fields** | Present on many cards but never used in simulation or rules | Remove entirely or consolidate into a single "Counter" field. |

### 4.2 What to Keep (Do Not Simplify)

| Mechanic | Why It Should Stay |
|---|---|
| **Budget mode (CapEx/OpEx)** | Creates the best teaching moments. Make it default. |
| **Market system (Project Queue + For Hire)** | Trading cards for resources is a core economic decision. |
| **Event system** | Randomness creates the "real world chaos" that managers must handle. |
| **Rush Q global events** | The shared crisis mechanic is the game's signature -- everyone suffers together. |
| **Favor cards** | Political capital is central to management. |
| **Project completion rewards** | The core feedback loop -- do work, earn reputation. |
| **Trait cards** | Not yet active, but essential for strategic diversity. Activate them. |

### 4.3 Suggested Turn Structure (Simplified)

Current turn has too many micro-decisions. Simplify to:

1. **Event Phase** (Q2+): Draw and resolve 1 event.
2. **Action Phase**: Do up to 3 actions total (play a card, assign a person, trade at market).
3. **Draw Phase**: Draw 1 card.

The "3 actions" cap replaces the current "play up to 2 skills, 2 people, 1 project, trade at both markets" structure. It is simpler to teach and creates harder trade-offs ("Do I play a skill card OR hire someone? I cannot do both this turn.").

### 4.4 Recommended Priority Order for Changes

1. **Activate Trait cards** -- this is the single highest-impact change for both balance and learning.
2. **Make budget mode default** -- it creates better decisions with no added complexity.
3. **Fix the death spiral** -- reduce Innovation Tax, limit layoff frequency.
4. **Cap project size at 4 members** -- removes the understaffing trap.
5. **Reduce card count from 125 to ~80** -- faster to learn, less shuffling, tighter design.
6. **Simplify turn to 3-action structure** -- speeds up play and sharpens decisions.

---

## 5. Summary

### What Rush Q does well:
- Authentic corporate management flavor (events, projects, politics, budget)
- Real trade-offs between offense and defense, speed and safety
- Budget mode creates genuinely meaningful economic decisions
- The Favor/political-capital system maps to real workplace dynamics
- Event variety keeps games unpredictable

### What needs work:
- No strategic diversity without Traits (one dominant strategy exists)
- Death spiral from Innovation Tax + Layoffs removes player agency in late game
- Large projects (5-6 members) are traps that only teach frustration
- 45.7% of players ending with negative rep means the game is too punishing for a learning tool
- Card complexity is high (4 cost fields, 4 classification fields per card)
- Key management concepts missing: delegation, coaching/talent development, burnout, communication overhead

### The single most impactful change:
**Activate the Trait card system.** It transforms the game from "everyone plays the same greedy algorithm" to "each player explores a distinct management philosophy." Every Trait teaches a different lesson, creates different trade-offs, and demands different strategy. Without Traits, Rush Q is a card game. With Traits, it is a management simulator.
