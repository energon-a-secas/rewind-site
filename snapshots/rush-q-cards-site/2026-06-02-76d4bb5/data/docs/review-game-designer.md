# Rush Q! — Expert Game Design Review

**Reviewer Profile:** Game designer specializing in educational card games and serious games for Fortune 500 training

---

## 1. Core Loop Analysis

### Current Loop: Draw → Event → Play → Progress

**Fundamental Problem:** Loop is reactive, not proactive. Players respond to Events rather than driving strategy.

| Quarter | Decision Density | Agency Rating |
|---------|-----------------|---------------|
| Q1 | Medium | 5/10 |
| Q2-Q3 | Low | 4-6/10 |
| Q5-Q8 | High (overload) | 7/10 |

**Issues:**
- Q1 artificially slow — can't access stores until Q1 ends
- Q2-Q3 feel identical — Events don't differentiate from Rush Quarters
- Q5+ creates decision overload — three crisis types simultaneously

### Feedback Loops

| Type | Mechanic | Balance |
|------|----------|---------|
| Positive | Tech Lead → faster completion → more Rep → buy more Talent | **Overpowered** — snowballs by Q4 |
| Positive | Favor accumulation → "It's Show Time" | **Underused** — favors sit after Q3 |
| Negative | Failed project → -Rep → fewer cards → harder to recover | **Too punishing** — no comeback |
| Negative | Layoffs → lose team → less progress → miss deadlines | **Binary** — survive or fired |

### Catch-Up Mechanics: Grade D
Only "Redemption" (+9 Rep, free for lowest player) and "Punished Senior" (free from Q3). Once 15+ Rep behind, recovery nearly impossible.

---

## 2. Economy Design

### Resource Hierarchy (Only 2-3 Matter)

| Resource | Victory Impact | Strategic Depth | Usage Rate |
|----------|---------------|-----------------|------------|
| Reputation | Direct | Medium | 100% |
| Card Advantage | High | High | 100% |
| Board Presence | High | Medium | 90% |
| Favors | Low | Low | **40%** |
| Budget (draft) | None | None | 0% |

### Tech Lead Dominance (Example)
- Cost: 3 points. Effect: 2 progress/turn (double normal).
- On 4-progress project over 2 quarters: generates 4 total vs 2 for normal person.
- +50% efficiency for 3-point investment. Strictly best card in game.

### Negation Cost Distribution

| Range | # Cards | Issue |
|-------|---------|-------|
| 0 (un-negatable) | 42 (23%) | Too many "must resolve" effects |
| 1-6 | 38 (21%) | Reasonable |
| 7-15 | 31 (17%) | High but situational |
| 16-27 | 12 (6%) | **Prohibitively expensive** — effectively uncounterable |

**Cap negation at 18.** No card should cost more than starting Rep to counter.

---

## 3. Balance Assessment

### Card Distribution Issues

| Type | Unique | Total | Issue |
|------|--------|-------|-------|
| Talent | 17 | 27 | Too few — only ~3 hires per player over 8Q |
| Project Queue | 9 | 18 | 8/9 have identical effect ("Draw Bonus Project") |
| Hard Skills | 6 | 10 | **Underpowered** — outnumbered 2:1 by Power Skills |
| Power Skills | 13 | 17 | **Overpowered** — too many "target opponent" effects |
| Rush Quarter | 8 | 9 | Undifferentiated from Events |
| Favors | 6 | 18 | Too many copies, too little use |

### First-Player Advantage: Grade C
Player 1 gets first pick of starter cards AND first access to Project Queue. Player 4 always goes last.
**Fix:** Snake draft (1-2-3-4-4-3-2-1) or rotate first player each quarter.

### Snowball vs Rubber-Band: 70% Snowball, 30% Rubber-Band
By Q5, leader has 2x board presence of last place. Only 2 catch-up cards exist.

---

## 4. Learning Design Alignment

### Mechanic → Concept Mapping

| Concept | Mechanic | Effectiveness | Fun Conflict? |
|---------|----------|---------------|--------------|
| Resource allocation | Assign people to projects | High | No |
| Scope creep | Events add quarters | High | No |
| Attrition | Layoffs force sacrifices | High | **Yes** — feels punishing |
| Sunk cost fallacy | Can't cancel projects | **Low** — never face the decision | Yes |
| Negotiation | Favor trading | **Low** — favors rarely used | Yes |
| Crisis management | Rush Quarters | Medium — feels random | Yes |

### Key Conflicts

**Layoffs Are Unfun:** Being eliminated before game ends is worst tabletop experience. Replace "fired" with "demoted" (-10 Rep, discard 2 cards, stay in game).

**Events Create Learned Helplessness:** 60% of turn resolving random events = watching a story happen to you. Add Event Preparation tokens — let players defer events to create agency.

---

## 5. Chess Exercise Framework

### Exercise Format Template

```
SCENARIO: [Narrative]
QUARTER: Q#
YOUR BOARD: [People, Projects, Progress]
YOUR HAND: [5 cards]
YOUR REP: X points
EVENT DRAWN: [Card name and effect]

CHALLENGE: [Goal with constraints]
DIFFICULTY: ★☆☆ Easy / ★★☆ Medium / ★★★ Hard
CONSTRAINTS: [Play limits, no specific card types, etc.]

LEARNING OBJECTIVES:
- LO1: [Skill being tested]
- LO2: [Secondary skill]
```

### Difficulty Scaling

| Difficulty | Constraints | Cards Allowed | Rep Buffer | Success Rate |
|-----------|-------------|---------------|------------|-------------|
| ★ Easy | None | All | 15+ | 90% |
| ★★ Medium | 1 constraint | 2-3 cards | 10+ | 60% |
| ★★★ Hard | 2 constraints | 1 card | 5+ | 30% |
| ★★★★ Expert | 3 + opponent interaction | 0-1 cards | Survive | 10% |

### Scoring Rubric

| Criteria | Points |
|----------|--------|
| Optimal Solution | 10 |
| Sub-Optimal (solves but inefficient) | 7 |
| Partial Solution | 4 |
| Failed Solution | 0 |
| Bonus: Alternative Path | +3 |

### Example Exercise 1: The Understaffed Sprint (★ Easy)

**Setup:** Q2, 1 Semi Senior, 1 project (4 progress required, 1 current, 1Q left). Hand: Skilled Execution, Brainstorming, Efficient Specialist, Cross-Team Dependency, Fit Interviews. Event: Missing Deadline (-1Q all projects).

**Solution:** Play Efficient Specialist (+2 progress → 3/4), assign Semi Senior (→ 4/4). Done. Cost: 1 card.

### Example Exercise 2: The Layoff Dilemma (★★ Medium)

**Setup:** Y2-Q1, 3 People (Tech Lead, Senior, Contractor), 2 projects (A: 5/6, B: 2/4). Layoff: pay 15 points or fired. Must keep Tech Lead on Project A.

**Solution:** Sacrifice Contractor (5pts) + Project B (5pts) + 5 Rep. Keep Tech Lead + Senior + Project A. Cost: 9 Rep, 1 person, 1 project.

### Example Exercise 3: The Reputation Attack (★★★ Hard)

**Setup:** Q6, 16 Rep, opponent about to play Undermine Reputation (-11 Rep). Event: Team Conflict (-15 Rep). No Soft/Hard skills in hand. Have Shift The Blame + Lighten the Mood + Counter Argument + Request Help.

**Solution:** Shift The Blame on Undermine Reputation (redirect to another player). Lighten the Mood on Team Conflict (reduce damage by team size). Request Help for project progress next turn. Final: 7 Rep + project completion reward = 17 Rep.

**Teaches:** Triage — prioritize the lethal threat, mitigate the rest.

### Learning Objective Mapping

| LO | Mechanic to Test | Example |
|----|-----------------|---------|
| Prioritize ruthlessly | Choose between 2 projects | Layoff Dilemma |
| Identify sunk costs | Near-complete vs new opportunity | "Abandon 4/5 project for better one?" |
| Negotiate under pressure | Favor trading with incomplete info | "Trade favor for immunity?" |
| Calculate risk | Multiple paths, different probabilities | Brainstorming (variable) vs Efficient Specialist (certain) |
| Sequence actions | Timing dependencies | Must play Cross-Team Dependency BEFORE Missing Deadline resolves |

---

## 6. Structural Improvements

### Fix 1: Accelerate Q1
Start with 2 People (not 1), 6 cards (not 5), 1 Favor. Unlock BOTH stores at Q1 start.
**Impact:** Q1 decisions go from 3 to 8.

### Fix 2: Differentiate Rush Quarters from Events

| | Events | Rush Quarters |
|-|--------|--------------|
| Timing | Start of turn (individual) | End of quarter (simultaneous) |
| Scope | Single player | **All players** |
| Theme | Team/project challenges | **Corporate strategy shifts** |
| Mitigation | Negate via skills | **Bid favors to redirect** |

New Rush Quarters: "Board Demands Results" (all must complete 1 project or -10 Rep), "Hiring Freeze" (no For Hire purchases), "Pivot or Perish" (discard 1 project or pay 5 Favors).

### Fix 3: Make Favors Matter
- **Favor Trading Post:** Once/quarter, spend 2 Favors for: draw 3 keep 1, +1 progress, negate 1 Event, or buy from For Hire at -3 cost
- **Rewrite 12 cards to cost Favors** instead of card discard

### Fix 4: Improve Recovery
- At Q5/Q6/Q7: lowest Rep player draws +1 card
- 10+ Rep below leader: next project completion grants +5 Bonus Rep
- Add "Hail Mary" Bonus Projects (high risk/reward)

### Fix 5: Balance Negation
Formula: `Negation Cost = (Base Value × 1.5) + Complexity Modifier`
**Cap at 18.** Shift The Blame: 27 → 15. Domain Collision: 18 → 12.

### Fix 6: Reduce Dead Cards
Every card should offer a meaningful choice, even if bad-vs-worse. Replace 0-negation-cost "must resolve" events with "choose your penalty" options.

### Fix 7: Learning Edition (60 Cards)
Cut TL;DR (9 cards), duplicate Internal Projects, excess Favors, excess Contractors. Add 5 Hard Skills.

---

## 7. Card Set Optimization

### Cards to Cut (20 cards)
- TL;DR (all 9) — reference cards, not gameplay
- Internal Project Budgety + Finder (2) — identical to Kiwi
- Scope Creep (1 copy) — redundant
- Bonus Favor (4 copies) — 18 is excessive
- Contractor (2 copies) — 3× redundant

### Cards to Merge
- Senior Lv.1 + Senior Lv.1 (Starter) + Senior Lv.1.5 → **"Senior Engineer"**
- Cross-Team Dependency + Soothing Response → **"Deadline Extension"**

### New Cards Needed (8)
| Card | Type | Effect |
|------|------|--------|
| Code Review | Hard | +1 progress + draw 1 |
| Refactoring Sprint | Hard | Remove 1Q from project |
| Automated Testing | Hard | Prevent next Event (your turn) |
| Documentation Debt | Hard | Pay 3 Rep to draw 3 |
| Pair Programming | Hard | Copy another player's progress (max 2) |
| Budget Surplus | Rush Q | Draw 1 card per completed project this Q |
| Investor Pressure | Rush Q | All bid Favors. Highest chooses turn order |
| Talent Poaching | Power | Pay 2 Favors to steal 1 unassigned Person |

### 60-Card Starter Set Breakdown
- Talents: 15 (Tech Lead ×2, Senior ×3, PM ×2, Manager ×2, Semi Senior ×2, Contractor ×1, QA ×1, Architect ×1, Specialist ×1)
- Skills: 18 (6 Soft, 6 Hard, 6 Power)
- Bonus Projects: 6
- Project Queue: 9
- Events: 12
- Rush Quarters: 6
- Layoffs: 4
- Starter Deck: 12

---

## Assessment Rubric for Players

| Category | Points | Measurement |
|----------|--------|-------------|
| Project Efficiency | 0-25 | Rep per project completed |
| Resource Management | 0-25 | Minimize wasted cards/people |
| Crisis Response | 0-20 | Survive without elimination |
| Negotiation | 0-15 | Favor trades executed (3+ = 15pts) |
| Strategic Depth | 0-15 | Use of combos |

### Debrief Framework (15 min post-game)
1. **Reflection:** What was your biggest crisis? How did you respond?
2. **Analysis:** Which decision do you regret most? What differently?
3. **Application:** How does this relate to your real work?

---

## Final Grade

**Current: B- (Playable, needs iteration)**
**Potential after fixes: A (Best-in-class management training game)**

### Priority 1 (Before Next Playtest)
1. Accelerate Q1 (2 people, 6 cards, both stores open)
2. Differentiate Rush Quarters (company-wide, predictable, bid-based)
3. Fix Favor economy (Trading Post + rewrite 12 cards)
4. Cap negation at 18

### Priority 2 (Learning Edition)
5. Cut to 60 cards
6. Add 5 Hard Skills
7. Add underdog buffs

### Priority 3 (Full Game)
8. Replace "fired" with "demoted"
9. Add Event Preparation tokens
10. Create 20 chess exercises for standalone training
