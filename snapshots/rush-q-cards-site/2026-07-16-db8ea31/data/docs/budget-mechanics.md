# Budget Mechanics Review & Redesign Proposal

**Perspective:** Project Manager / CFO / Financial Analyst
**Version:** 1.0
**Status:** Proposal (not yet implemented)

---

## Table of Contents

- [1. Analysis of Current Implementation](#1-analysis-of-current-implementation)
- [2. Redesigned Budget System](#2-redesigned-budget-system)
- [3. Trait Card Budget Interactions](#3-trait-card-budget-interactions)
- [4. Concrete Rules Changes (Before/After)](#4-concrete-rules-changes-beforeafter)
- [5. Implementation Notes](#5-implementation-notes)

---

## 1. Analysis of Current Implementation

### What Exists Today

The budget system (`js/game/budget.js`) is a toggleable mode layered on top of the classic game. When active:

- Each player gets a **CapEx** pool (hiring people, acquiring from markets) and an **OpEx** pool (playing skill cards).
- At each quarter start, the player picks between 2 randomly generated allocation options drawn from fixed arrays: `CAPEX_OPTIONS = [8, 12, 16, 20]`, `OPEX_OPTIONS = [5, 10, 14, 18]`.
- **Unspent budget expires** at quarter end (use-it-or-lose-it).
- Players can **convert** between pools at a 2:1 ratio.
- An **FTE ceiling** of 8 people per player caps headcount.
- Budget and Trait cards both exist in `cards.json` with `quantity: 0` (not yet active in game).

### What Is Wrong or Missing

#### 1.1 No Consequence for Expiring Budget (Missed Teaching Moment)

**Problem:** Unspent budget simply vanishes. Players learn nothing about why unspent capital is a problem in real organizations.

**Real-world lesson missed:** Unspent CapEx signals poor planning and typically results in reduced allocations next cycle. Boards and finance teams lose confidence in managers who consistently under-deploy capital. Conversely, "use it or lose it" encourages wasteful end-of-quarter spending (also a real phenomenon worth teaching).

**Impact:** Players have no incentive to plan ahead. There is no penalty for hoarding, nor any reward for efficient spending.

#### 1.2 CapEx and OpEx Feel Identical

**Problem:** Both pools are "spend now, gone at end of quarter." The only difference is WHAT they pay for. There is no structural distinction between them.

**Real-world lesson missed:** CapEx investments generate **lasting value** (assets, hires, infrastructure). OpEx is consumed immediately (services, day-to-day operations). The entire reason corporations distinguish CapEx from OpEx is that CapEx creates durable assets that depreciate, while OpEx is a current-period expense. This distinction drives tax treatment, financial reporting, and strategic planning.

**Impact:** The game currently treats CapEx as "just another currency for hiring." Players never learn WHY the distinction matters.

#### 1.3 No ROI Signal on Capital Investments

**Problem:** Hiring a person costs CapEx, but there is no feedback loop showing the return on that investment. A 7-value hire and a 1-value hire both just become "a person on your team."

**Real-world lesson missed:** Capital investments should be evaluated by ROI. Hiring an expensive senior engineer should yield more value than a cheap intern. Managers must justify CapEx spending by demonstrating returns.

#### 1.4 Budget Allocation Is Random, Not Strategic

**Problem:** Players choose between 2 random pairs. They cannot forecast or plan multi-quarter spending. The AI simply picks the pair with the highest total.

**Real-world lesson missed:** Real budget planning involves forecasting needs 1-4 quarters ahead, defending budget requests, and making deliberate trade-offs. The randomness removes all financial planning skill from the game.

#### 1.5 No Ongoing Salary / Maintenance Costs

**Problem:** People are hired once (CapEx) and then cost nothing to retain. Skill cards cost OpEx to play, but there is no recurring operational cost for maintaining your team.

**Real-world lesson missed:** Salaries are OpEx. Every hire increases your ongoing operational cost. Managers must balance headcount growth against operational burn rate. This is the core CapEx-vs-OpEx tension: you invest capital to grow, but growth increases your operating costs.

#### 1.6 Conversion Ratio Is Flat and Uninstructive

**Problem:** 2:1 conversion in either direction with no friction. It is always available and always the same rate.

**Real-world lesson missed:** In reality, reallocating budget between capital and operational lines requires approvals, has opportunity costs, and the "exchange rate" is rarely favorable. Converting CapEx to OpEx (e.g., canceling a planned hire to pay for contractors) has different organizational consequences than the reverse.

#### 1.7 Trait Cards Have No Budget Interaction

**Problem:** The 7 Trait cards (Facilitator, Networker, New Type, Politician, Risk Manager, Subject Matter Expert, Time Wizard) exist with `quantity: 0` and have no relationship to the budget system whatsoever.

**Real-world lesson missed:** Management style directly affects how budgets are spent. A "Networker" manager spends more on relationship-building (soft skills, travel, events). A "Subject Matter Expert" invests heavily in technical tools and training. A "Risk Manager" keeps larger reserves. These spending patterns are a core part of management identity.

#### 1.8 Simulation Shows Budget Mode Is Too Easy

**Problem:** Per simulation data (300 games), budget mode is "slightly easier" than normal mode. Average reputation is +8.3 with 39.1% ending negative. Some expensive cards ("Shift The Blame", "Fit Interviews") are NEVER played because they cost too much OpEx.

**Impact:** Budget mode should be a harder, more strategic variant. If it is easier, the constraints are not meaningful. The fact that some cards are never played means OpEx costs are miscalibrated.

---

## 2. Redesigned Budget System

### Design Principles

1. **Educational first, fun second, complex third.** Every mechanic must teach a real finance concept. If it does not teach, cut it.
2. **30-45 minute game time is sacred.** No mechanic that adds more than 10 seconds of decision time per turn.
3. **3 big changes, not 10 small ones.** Focus on the highest-impact redesigns.

### Change 1: Payroll (Recurring OpEx Cost for People)

**Concept taught:** Salaries are operational expenses. Headcount has ongoing cost. Growth is not free after the initial hire.

**Mechanic:**

- At the **start of each quarter**, before budget allocation, each player pays **1 OpEx per person** on their team as payroll. This comes out of the NEW quarter's budget automatically.
- If a player cannot cover payroll (OpEx pool after allocation < team size), they must **release people** (return to For Hire deck) until payroll fits.
- Payroll is deducted BEFORE the player takes any actions.

**Why this works:**
- Creates the real CapEx-vs-OpEx tension: hiring (CapEx) increases your ongoing cost (OpEx).
- Forces players to think twice before hiring aggressively.
- Makes "lean teams" a viable strategy, not just "hire everyone."
- Adds ~5 seconds of decision per quarter (just a deduction, no choice needed unless over-extended).

**Payroll cost per person:**

| Person Type    | Quarterly Payroll |
|---------------|-------------------|
| All people    | 1 OpEx each       |

Simple flat rate. No complexity by person type. The teaching moment is the concept of recurring cost, not granular salary negotiation.

### Change 2: Budget Rollover (Partial CapEx Carry-Forward)

**Concept taught:** CapEx is a long-term investment pool. Unused capital can roll forward (with depreciation). OpEx is use-it-or-lose-it.

**Mechanic:**

- **OpEx:** Still expires at quarter end (unchanged). This is accurate to real operations budgets.
- **CapEx:** Up to **50% of unspent CapEx** (rounded down) carries forward to next quarter, added on top of the new allocation. This represents approved-but-undeployed capital investment budget.
- **Cap:** Rolled-over CapEx cannot exceed the base allocation. (You cannot infinitely hoard.)

**Why this works:**
- Teaches the fundamental structural difference between CapEx and OpEx.
- Creates strategic depth: do you spend CapEx now or save some for a bigger hire next quarter?
- The 50% depreciation prevents hoarding while still rewarding planning.
- Adds 0 seconds of decision time (automatic calculation).

**Example:** Player has CapEx base of 12. Spends 8. Has 4 remaining. Rolls over 2 (50% of 4). Next quarter starts with 12 + 2 = 14 CapEx.

### Change 3: Planned Allocation (Replace Random Options with Strategic Slider)

**Concept taught:** Budget planning is about forecasting your needs and making deliberate trade-offs. More CapEx means less OpEx from the same total pool.

**Mechanic:**

- Each quarter, the player receives a **fixed total budget** (e.g., 20 points in standard mode). This number is set by the scenario and may vary by quarter.
- The player **splits** this total between CapEx and OpEx however they want, subject to minimums: at least 3 in each pool.
- The total budget may **increase or decrease** based on performance (see ROI bonus below).
- AI players use a heuristic: allocate proportionally to their needs (more CapEx if understaffed, more OpEx if holding many skill cards).

**Why this works:**
- Replaces randomness with genuine financial planning.
- The fixed-total constraint teaches the core lesson: every dollar in CapEx is a dollar NOT in OpEx.
- Minimum-3 rule prevents degenerate all-in strategies.
- Takes ~10 seconds per quarter (quick slider or two-button choice).

**Total budget by scenario:**

| Scenario        | Total per Quarter | Min Each |
|-----------------|-------------------|----------|
| Lean Startup    | 15                | 3        |
| Sprint Budget   | 20                | 3        |
| Balanced Books  | 24                | 3        |
| Corporate Crunch| 20                | 3        |
| Growth Mode     | 36                | 5        |

### Bonus Mechanic: ROI Feedback (Simple)

**Concept taught:** Good capital investments generate returns. Completing projects demonstrates ROI.

**Mechanic:**

- When a player **completes a project**, their total budget for the NEXT quarter increases by **+2** (representing increased trust from leadership / proven ROI).
- When a player **fails a project** (overdue discard), their total budget for the next quarter decreases by **-2** (loss of confidence).
- Budget adjustments are capped at +/- 6 from base (max 3 bonuses or penalties stacked).

**Why this works:**
- Direct feedback loop: invest well, get more to invest. Invest poorly, get less.
- Mirrors real corporate dynamics where successful teams get bigger budgets.
- No extra decision time. Automatic adjustment.

---

## 3. Trait Card Budget Interactions

Each Trait card should modify the budget system in a way that reflects the management style it represents. All Traits are active for the entire game once selected.

### Facilitator
**Current:** "Whenever you play a Soft Skill, draw 1 card."
**Budget interaction:** Soft Skill cards cost **1 less OpEx** (minimum 0). The Facilitator runs efficient meetings and workshops; soft skills come naturally.
**Teaching:** Some managers naturally reduce operational costs in their area of strength.

### Networker
**Current:** "Once every 2 Quarters, recover 1 Soft Skill from discard. Soft Skill costs halved."
**Budget interaction:** Already has cost halving for Soft Skills. Additionally, the Networker's **payroll cost is reduced by 1 total per quarter** (rounded down) because their network provides informal support that reduces operational overhead.
**Teaching:** Strong networks reduce dependency on formal (paid) resources.

### Politician
**Current:** "Once every 2 Quarters, recover 1 Power Skill from discard. Power Skill costs halved."
**Budget interaction:** Already has cost halving for Power Skills. Additionally, the Politician can **convert budget at 1.5:1 instead of 2:1** (i.e., 3 CapEx = 2 OpEx or vice versa). They are skilled at moving money between budget lines through organizational influence.
**Teaching:** Political skill in organizations often manifests as ability to reallocate resources across silos.

### Subject Matter Expert
**Current:** "Once every 2 Quarters, recover 1 Hard Skill from discard. Hard Skill costs halved."
**Budget interaction:** Already has cost halving for Hard Skills. Additionally, the SME's **CapEx rollover rate is 75% instead of 50%**. They plan technical investments carefully and rarely waste capital.
**Teaching:** Deep technical expertise leads to better capital planning and less waste.

### Risk Manager
**Current:** "Once per Quarter, discard 1 Event instead of resolving it."
**Budget interaction:** The Risk Manager starts each quarter with a **2 OpEx reserve** that can ONLY be spent on event costs or budget conversion. This reserve does not count toward payroll or normal spending. It represents a contingency fund.
**Teaching:** Risk management involves maintaining reserves. Good risk managers budget for the unexpected.

### Time Wizard
**Current:** "At start of each Quarter, gain 1 Progress on any project."
**Budget interaction:** The Time Wizard's free progress effectively represents **capital efficiency** -- getting more output per investment. No direct budget modifier, but their project completions come faster, which triggers the ROI bonus (+2 total budget) sooner and more often.
**Teaching:** Time-to-value is a real financial metric. Faster delivery = faster ROI = more future investment.

### New Type
**Current:** "Peek at 3rd card of Main Deck, return it, draw 1 card."
**Budget interaction:** At the start of each quarter, the New Type can **see both budget allocation options** (in the random system) or get **+2 total budget** to allocate (in the planned system). Represents innovative thinking that attracts slightly more funding.
**Teaching:** Innovation and fresh perspectives can attract additional investment from leadership who see potential.

---

## 4. Concrete Rules Changes (Before/After)

### 4.1 Budget Allocation

| Aspect | Before | After |
|--------|--------|-------|
| Method | Pick 1 of 2 random (CapEx, OpEx) pairs | Split a fixed total between CapEx and OpEx |
| CapEx options | Random from [8, 12, 16, 20] | Player chooses (min 3, max total - 3) |
| OpEx options | Random from [5, 10, 14, 18] | Player chooses (min 3, max total - 3) |
| Total budget | Random (13-38 range) | Fixed per scenario (15-36) |
| AI decision | Pick pair with highest total | Heuristic split based on team size and hand |
| Planning skill | None (random) | High (must forecast needs) |

### 4.2 Budget Expiry

| Aspect | Before | After |
|--------|--------|-------|
| CapEx end-of-quarter | Expires fully | 50% carries forward (max = base allocation) |
| OpEx end-of-quarter | Expires fully | Expires fully (unchanged) |
| Penalty for expiry | None | Implicit (50% CapEx loss is the cost of poor planning) |

### 4.3 Ongoing Costs

| Aspect | Before | After |
|--------|--------|-------|
| People maintenance | Free after hiring | 1 OpEx per person per quarter (payroll) |
| Payroll timing | N/A | Deducted at quarter start, after allocation |
| Over-extended | N/A | Must release people if cannot cover payroll |

### 4.4 Conversion

| Aspect | Before | After |
|--------|--------|-------|
| Ratio | 2:1 both directions | 2:1 both directions (unchanged) |
| Limit | Unlimited | Once per quarter (represents organizational friction) |
| Trait bonus | None | Politician gets 1.5:1 ratio |

### 4.5 ROI Feedback

| Aspect | Before | After |
|--------|--------|-------|
| Project completion | No budget effect | +2 total budget next quarter |
| Project failure | No budget effect | -2 total budget next quarter |
| Stacking | N/A | Max +/- 6 from base |

### 4.6 Skill Card Cost Rebalance (for Never-Played Cards)

| Card | Before (OpEx) | After (OpEx) | Reasoning |
|------|--------------|--------------|-----------|
| Shift The Blame | 10 | 6 | Was never played; powerful but not worth 10 |
| Fit Interviews | 8 | 5 | Was never played; hiring effect should be accessible |
| Other 8+ cost cards | 8-10 | 6-8 | Cap at 8 OpEx for any single card |

---

## 5. Implementation Notes

### 5.1 State Changes (`state.js`)

Add to the `budget` object on state:

```javascript
budget: {
  capEx: 0,
  opEx: 0,
  capExBase: 12,
  opExBase: 8,
  totalBudget: 20,       // NEW: fixed total per quarter
  rolloverCapEx: 0,       // NEW: carried-over CapEx from previous quarter
  roiAdjustment: 0,       // NEW: cumulative +/- from project outcomes
}
```

Add to player object:

```javascript
{
  // ... existing fields
  trait: null,            // NEW: selected Trait card (or null)
  payrollDue: 0,          // NEW: calculated at quarter start
}
```

### 5.2 Budget Module Changes (`budget.js`)

**New function: `calculatePayroll(player)`**
```
Returns player.people.length (1 OpEx per person).
Networker trait reduces by 1.
```

**New function: `processPayroll(s, player)`**
```
Deduct payroll from OpEx. If insufficient, force release of people.
Log all payroll transactions.
```

**Modified function: `resetQuarterBudget(s)`**
```
Calculate CapEx rollover: Math.min(Math.floor(unspent * 0.5), base).
SME trait: Math.floor(unspent * 0.75).
Apply ROI adjustment to total budget.
Present allocation choice (total split, not random pairs).
Deduct payroll.
```

**Modified function: `allocateQuarterBudget(s, player)`**
```
Instead of random pairs, present a slider/choice:
  Total = base + roiAdjustment
  Player splits between CapEx (min 3) and OpEx (min 3)
  Add rolloverCapEx to CapEx pool
  Then deduct payroll from OpEx
```

**Modified function: `convertBudget(s, player, direction)`**
```
Add once-per-quarter limit (track with quarterFlags).
Politician trait: 3:2 ratio instead of 2:1.
```

### 5.3 Engine Changes (`engine.js`)

**In `processQuarterEnd()`:**
- After project completion: apply `+2 roiAdjustment` (capped at +6).
- After project failure: apply `-2 roiAdjustment` (capped at -6).

**In `startGame()`:**
- If budget mode, allow trait selection before game begins.
- Apply trait to player object.

### 5.4 AI Changes (`ai.js`)

**Budget allocation heuristic:**
```
understaffedRatio = (needed people - current people) / needed people
If understaffedRatio > 0.3: allocate 60% to CapEx, 40% to OpEx
If many skill cards in hand: allocate 40% to CapEx, 60% to OpEx
Default: 50/50 split
```

**Payroll awareness:**
```
Before hiring, check: will new hire's payroll fit in projected OpEx?
Factor payroll into budget allocation decision.
```

### 5.5 Priority Order for Implementation

1. **Planned Allocation (Change 3)** - Replace random pairs with total-split. Highest impact, simplest change. Touches only `allocateQuarterBudget()`.
2. **Payroll (Change 1)** - Add payroll deduction. Second highest impact. Touches `resetQuarterBudget()` and adds `processPayroll()`.
3. **CapEx Rollover (Change 2)** - Modify `resetQuarterBudget()` to carry forward 50%.
4. **ROI Feedback** - Add `roiAdjustment` tracking in `processQuarterEnd()`.
5. **Trait interactions** - Add trait-aware cost modifiers in `spendOpEx()`, `convertBudget()`, and `resetQuarterBudget()`.
6. **Card cost rebalance** - Update `cards.json` values for never-played cards.

### 5.6 What Was Deliberately NOT Added

- **Depreciation modeling** - Too complex for a card game. The CapEx rollover at 50% implicitly models depreciation without burdening players with accounting.
- **Tax implications** - Not relevant to a game about tech management. Would add complexity without fun.
- **Multi-quarter budget forecasting UI** - Would be educational but slows the game beyond the 45-minute target. The ROI adjustment gives a lighter version of this feedback loop.
- **Per-person salary tiers** - Would be more realistic but adds cognitive load per hire. Flat 1-per-person is the right level of abstraction.
- **Budget approval process** - In reality, managers must defend budgets to leadership. This could be a future expansion mechanic (e.g., "Budget Review" event cards) but is too heavy for the base budget mode.
- **Debt / Borrowing** - Real organizations can borrow against future budgets. This would add a fascinating risk mechanic but would double the complexity of the budget system.

---

## Summary of Financial Concepts Taught

| Game Mechanic | Real-World Concept |
|--------------|-------------------|
| Split total between CapEx and OpEx | **Budget planning and trade-offs** - every dollar has an opportunity cost |
| 1 OpEx per person per quarter | **Payroll as operating expense** - headcount has ongoing cost |
| CapEx 50% rollover, OpEx expires | **CapEx vs OpEx distinction** - capital is durable, operations are consumed |
| +2 budget on project completion | **ROI on capital investments** - good investments earn more funding |
| -2 budget on project failure | **Accountability for failed investments** - wasted capital reduces trust |
| 2:1 conversion, once per quarter | **Budget reallocation friction** - moving money between lines has costs |
| Trait-based cost modifiers | **Management style affects spending** - expertise reduces costs in your domain |
| FTE ceiling (8 people) | **Organizational capacity limits** - you cannot scale infinitely |
| Must release people if payroll exceeds OpEx | **Cash flow management** - you need operating cash to keep the lights on |
