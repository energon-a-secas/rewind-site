# Rush Q! — Full Multi-Perspective Analysis Report

**Date:** March 4, 2026
**Reviewers:** Senior Executive, Senior Engineering Manager, Tech Manager, Senior Tech Lead (Adversarial), Expert Game Designer

Individual reports: `review-executive.md`, `review-senior-manager.md`, `review-tech-manager.md`, `review-tech-lead-adversarial.md`, `review-game-designer.md`

---

## Executive Summary

Rush Q! has a **solid operational core** — the resource allocation loop, event-driven chaos, and favor economy capture the real pressures of tech management. However, every reviewer identified the same structural issues:

1. **Early game is too slow** — Q1 has too few decisions
2. **Favor economy is broken** — underused after Q3, best strategy is hoarding
3. **Negation is unbalanced** — costs range from 0 to 27, making some cards uncounterable
4. **Recovery is too hard** — only 2 catch-up mechanics exist
5. **People management is absent** — no 1:1s, PIPs, promotions, burnout, coaching
6. **A dominant "turtle" strategy exists** — hoard resources, avoid risk, dump in Q7-Q8
7. **Rush Quarters feel like Events** — need distinct identity

**Overall Grades:**
- Game Quality: **B-** (playable, needs iteration)
- Training Value: **5/10** (strong foundation, critical gaps)
- Potential After Fixes: **A** (best-in-class management training game)

---

## Consensus Findings (All 5 Reviewers Agree)

### Strengths
- Core resource allocation loop is realistic and engaging
- QA negating Failed Release is "brilliant" — teaches QA investment value
- Tech Lead as force multiplier is well-designed
- Contractor mechanics (sacrificeable, short-term boost) are darkly accurate
- Rush Quarter / Layoff pressure creates real tension
- Favor system has untapped potential as core economy

### Critical Gaps (Unanimous)
1. **No Production Incidents** — the #1 real-world management stressor is absent
2. **No Technical Debt mechanic** — rushing projects has no long-term consequences
3. **No people development** — team members are static, can't be coached/promoted/grown
4. **No cross-team dependencies** — game plays like managing an island
5. **No managing up** — no executive/board/stakeholder pressure mechanics
6. **Shift The Blame is broken** — negation cost 27 makes it uncounterable

---

## Consolidated Improvement Priorities

### Tier 1: Fix Before Next Playtest

| Fix | Details |
|-----|---------|
| Accelerate Q1 | Start with 2 People, 6 cards, 1 Favor. Open both stores immediately |
| Cap negation at 18 | Shift The Blame: 27→15. Domain Collision: 18→12 |
| Differentiate Rush Quarters | Make them all-player simultaneous events at quarter-end, not individual turn events |
| Anti-turtle mechanic | "Innovation Tax": no project completed in 2 quarters = -10 Rep |
| Favor decay | Lose 1 Favor per quarter. Max 3 at any time. Forces spending |

### Tier 2: Core Expansion Cards

| Card | Type | Effect | Reviewer |
|------|------|--------|----------|
| Production Outage | Event | All talent on incident response 1Q. Projects paused | Tech Manager |
| 1:1 Meetings | Event | Remove 1 break token from everyone OR skip (+1 break all) | Sr. Manager |
| Technical Debt | Mechanic | Rush projects → debt tokens → slow future work | All |
| Promotion Cycle | Event (Q4) | Promote senior (+2 progress, 1 Favor) or decline (+2 break) | Sr. Manager |
| Executive Review | Event | VP wants update. >50% progress = +1 Rep. <50% = -1 Rep | Sr. Manager |
| Board Review | Event (Q4/Q8) | Lowest-Rep player defends performance | Executive |
| Knowledge Silo | Event | Specialist leaves → lose all project progress. Negate with Documentation | Sr. Manager |
| Skip-Level Surprise | Event | Meet skip-level (discard project, +10 Rep) or decline (-5 Rep) | Tech Lead |

### Tier 3: Card Fixes

| Card | Current Problem | Fix |
|------|----------------|-----|
| Shift The Blame | Negation 27 = uncounterable | Lower to 15. Each use costs 5 more |
| Domain Collision | -20 Rep = never worth playing | Remove 20 Rep. Both lose 5. Complete = +10 bonus |
| OOO Time! | No downside late-game | Projects don't progress while OOO |
| Defensive Maneuver | 10 Rep too cheap, spammable | One-time use per game |
| Undermine Reputation | Pure grief card | Rework: target loses 5, YOU gain 3 (catch-up) |
| Foresight | Uncounterable 2Q immunity | Immunity breaks on Company Priorities/Team Reorg |
| Layoffs | Binary survive/die | Graduated: <20pts = lose 1 person + 1 project. <10 = eliminated |
| Manager card | "Recruit for free" = unrealistic | Reduce break tokens by 1/quarter across team |
| Project Manager | "Eliminates rush quarter" = overpowered | Reveal top Rush Q card. Pay 1 Favor to negate |

### Tier 4: New Card Categories

**Hard Skills (add 5 to balance against 13 Power Skills):**
- Code Review (+1 progress + draw 1)
- Refactoring Sprint (remove 1Q from project)
- Automated Testing (prevent next Event)
- Documentation (+1 progress cost, protects against Knowledge Silo)
- Pair Programming (1.5x progress, knowledge sharing)

**Anti-Pattern Cards (teaching moments):**
- Heroic Programming (solo 3-person project: fast but burnout + tech debt)
- Resume-Driven Development (unproven tech: +1Q + tech debt)
- Meeting Overload (hire PM: all engineers -1 progress)
- The Rewrite Fallacy (discard architecture project, start 5Q full rewrite)
- Ship It and Forget It (no QA: 50% chance Failed Release next Q)

**Chaos Cards (political realism):**
- High-Performer Hostage (star demands sabbatical or quits)
- Reorg Roulette (random team split/merge)
- Ethical Corner-Case (privacy issue: fix now or defer and risk)
- Invisible Work Tax (toil adds quarters to all projects)
- Appropriated Glory (claim half another player's project reward)

---

## 21 Exercise Scenarios Collected

### From Executive (3)
1. **The Layoff Dilemma** — Save team or save product? (Prioritization, sunk cost)
2. **The Favor Economy** — Build alone or coalition-build? (Negotiation, coalition)
3. **The Death Spiral Recovery** — Q7 crisis turnaround (Risk-taking, tempo)

### From Senior Manager (5)
4. **The Toxic Rockstar** — Keep toxic performer or fire for team health? (Culture vs delivery)
5. **The Promotion Trap** — Promote, trade, or decline? (People investment)
6. **The Dependency Disaster** — Backend blocks Frontend, VP demands ship (Dependencies)
7. **The Attrition Spiral** — Stabilize after key departure (Recovery, morale)
8. **The Layoff Survival** — Crisis prioritization under elimination threat (Triage)

### From Tech Manager (5)
9. **The CI/CD Gambit** — Foundation investment vs quick wins (Long-term thinking)
10. **The Attrition Bomb** — Protect QA or sacrifice for project speed? (Force multipliers)
11. **The Tech Debt Reckoning** — Pay down debt or keep shipping? (Compound interest)
12. **The Cross-Team Dependency Trap** — Use PM to unblock? (Role value)
13. **The Rush Quarter Gauntlet** — Which project to deprioritize? (Crunch triage)

### From Tech Lead — Adversarial (5)
14. **The Blame Hot Potato** — Deterrence vs defense (Establishing consequences)
15. **The Layoff Calculation** — Don't over-optimize when safe (Satisficing)
16. **The Kingmaker's Dilemma** — Lose with dignity (When to stop fighting)
17. **The OOO Trap** — Save protection for when it matters (Timing > resources)
18. **The Favor Debt Spiral** — Refuse traps disguised as favors (Independence)

### From Game Designer (3)
19. **The Understaffed Sprint** — Calculate progress under deadline (★ Easy)
20. **The Layoff Dilemma** — Sacrifice calculation under pressure (★★ Medium)
21. **The Reputation Attack** — Triage multiple threats simultaneously (★★★ Hard)

---

## Learning Edition (60-Card Starter Set)

For training exercises and onboarding, strip to 60 cards:

| Type | Cards | Notes |
|------|-------|-------|
| Talents | 15 | 1 of each archetype |
| Skills (Soft) | 6 | Brainstorming, Fit Interviews, It's Show Time, Counter Argument, Request Help, Sprint Planning |
| Skills (Hard) | 6 | Skilled Execution ×2, Efficient Specialist, Code Review ×2, Refactoring Sprint |
| Skills (Power) | 6 | Shift The Blame, Reassign Resources, Wonderful Move, Fast Learner, OOO Time!, Talent Poaching |
| Bonus Projects | 6 | Performance Optimization ×2, Ad Hoc Support, CI/CD Improvements, Platform Launch, Internal Project |
| Project Queue | 9 | CI/CD Migration ×3, On-Prem Migration ×3, Innovation ×2, App Modernization |
| Events | 12 | Angry Client ×2, Attrition ×2, Changing Requirements ×2, Skills Gap ×2, Team Conflict ×2, Hiring ×2 |
| Rush Quarters | 6 | Budget Cuts, Missing Deadline, Unrealistic Expectations, Legacy Strikes Back, Freeze, Budget Surplus |
| Layoffs | 4 | All 4 |
| Starter | 12 | Projects + reduced Favors |

---

## Player Assessment Rubric

| Category | Points | What to Observe |
|----------|--------|-----------------|
| Project Efficiency | 0-25 | Rep earned per project completed |
| Resource Management | 0-25 | Minimized wasted cards/people/turns |
| Crisis Response | 0-20 | Survived events without over-spending |
| Negotiation | 0-15 | Favor trades executed (3+ = 15pts) |
| Strategic Depth | 0-15 | Card combos, long-term planning |

### Debrief Questions
1. What was your biggest crisis? How did you respond?
2. Which decision do you regret most?
3. How does this relate to your actual work?
4. When you played [specific card], how did it feel? Would you do that IRL?

---

## Next Steps

1. **Implement Tier 1 fixes** (Q1 acceleration, negation cap, anti-turtle, favor decay)
2. **Playtest 60-card Learning Edition** with 3-4 people
3. **Create 10 standalone exercise scenarios** using the framework above
4. **Build the Rush Q Cards Site** (`rush-q-cards-site/`) with exercise mode
5. **Iterate on Tier 2 expansion cards** based on playtest feedback
