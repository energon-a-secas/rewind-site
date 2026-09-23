# Rush Q! — Tech Manager Review

**Reviewer Profile:** 8 years experience, managing 8-12 developers, hands-on with architecture decisions

---

## 1. Technical Realism Assessment

### Project Types

**High Realism (8-9/10):** CI/CD Migration, Architecture Modernization, Disaster Recovery, Security Vulnerability, Tech Upgrades

**Medium Realism (6-7/10):** App Modernization (too vague), Lift-and-Shift (backward direction for 2026), Library Creation (usually emergent, not queued), Innovation (too generic), Internal Tools (needs specificity)

**Low Realism (3-5/10):** On-Prem Migration (most orgs going cloud, not on-prem)

### Talent Card Accuracy

**Realistic:** Tech Lead (+2 progress, negates Skills Gap — perfect), QA (negates Failed Release — brilliant), Contractor (sacrificed for Attrition — darkly accurate), Specialist (flexible high-impact)

**Questionable:**
- AI Companion: "doesn't add progress" contradicts "reduces project time." Should be: "+1 progress but risk of Tech Debt event"
- Manager: "reduces costs" is backwards. Should enable hiring, not reduce costs
- Project Manager: PMs manage scope/timelines, not hiring costs. Should nullify Changing Requirements
- Semi Senior: Rename to "Mid-Level Dev"

### Missing Technical Events
- **Production Incident/Outage** — Most disruptive real event, not in game
- **Technical Debt Accumulation** — Slow burn: "+1 quarter to all projects until Tech Debt project completed"
- **Key Engineer Departure** — Losing a tech lead mid-project is catastrophic
- **Vendor Lock-In** — "External API deprecated, Architecture Modernization required"
- **Compliance Audit** — All projects paused, must complete Security or DR project

---

## 2. Technical Decision Training

### Teaches Well
- Resource allocation under constraints (limited talent, multiple projects, time pressure)
- QA as risk mitigation (negates Failed Release = brilliant education)
- Specialist value as force multipliers

### Misses or Underrepresents
- **Build vs Buy:** No "skip this project by adopting vendor solution" mechanic
- **Architecture Trade-offs:** Projects have fixed scopes. Need branch points: "Ship monolith now (2Q) or microservices (3Q)"
- **CI/CD as Foundational Multiplier:** Completing CI/CD should permanently reduce all future project times
- **Security as Continuous Work:** Missing proactive security investment
- **Tech Debt as Gradual Tax:** "Each quarter you don't work on Tech Debt, all projects get +1 quarter. Stacks."
- **Incident Response:** No "drop everything, fix production" mechanic
- **Hiring Lead Time:** Contractors arrive instantly; real hiring takes 3-6 months

---

## 3. Five Technical Exercise Scenarios

### Scenario 1: The CI/CD Gambit
**Setup:** Q1, 3 talent. Queue: CI/CD Migration (3Q), App Modernization (2Q), Security Vulnerability (bonus, 1Q). Event: Changing Requirements.

**Optimal:** Start CI/CD with Senior + Semi Senior (long-term multiplier). Use Contractor for Security Vulnerability. Accept Q1-Q3 investment for compounding returns.

**Teaches:** Invest in foundational DevOps early — compounding returns by mid-game are decisive.

### Scenario 2: The Attrition Bomb
**Setup:** Q4, Tech Lead + 2 Senior Devs + QA. Events: Attrition (lose 1) + Failed Release (negated by QA, but QA vulnerable).

**Optimal:** Never sacrifice QA. Innovation can slip; production failures cannot.

**Teaches:** Protect force multipliers (QA, Tech Leads) at all costs.

### Scenario 3: The Tech Debt Reckoning
**Setup:** Q5, 4 talent, 2 projects near completion. Event: "+1 quarter to all projects due to accumulated Tech Debt."

**Optimal:** Pause lowest-value project, shift engineers to Tech Debt immediately. Taking the pain now clears the board for Q7-Q8.

**Teaches:** Tech Debt is compound interest on bad decisions. Pay it down before it bankrupts velocity.

### Scenario 4: The Cross-Team Dependency Trap
**Setup:** Q3, Platform Launch (2Q left, 3 talent) + Internal Tools (1Q left). Event: Cross-Team Dependency adds +1 quarter unless you have PM.

**Optimal:** Use Project Manager to nullify the dependency delay. PM's primary real-world value is absorbing coordination overhead.

**Teaches:** Cross-team dependencies are #1 cause of project delays — invest in roles that mitigate them.

### Scenario 5: The Rush Quarter Gauntlet
**Setup:** Q6, 5 talent, 3 active projects but can only staff 2. Failing to progress any project loses Rep.

**Optimal:** Use Specialist's "nullify Rush Quarter" if available. Otherwise deprioritize Innovation (least structural consequences).

**Teaches:** During crunch, protect foundational work and near-completion projects. Innovation can wait.

---

## 4. Card Improvement Proposals

### New Technical Event Cards
| Card | Effect | Why |
|------|--------|-----|
| Production Outage | All talent on "Incident Response" for 1Q. All projects paused | Most realistic disruptive event |
| Key Engineer Departure | Project loses 1 talent + gains +1Q unless Tech Lead mitigates | Succession planning |
| Vendor Lock-In | Lift-and-Shift becomes Architecture Modernization +2Q | Hidden cost of shortcuts |
| Compliance Audit | All projects paused 1Q. Must complete Security/DR in 2Q | Regulatory forcing function |
| Technical Debt Bankruptcy | No Tech Debt project by Q6 = all projects +1Q permanently | Debt compounds |
| Third-Party API Deprecated | Mandatory "API Migration" project (2Q, 2 talent) | External dependency failure |

### Better Role Differentiation
| Card | Effect | Why |
|------|--------|-----|
| Backend Engineer | +1 progress on Architecture/CI-CD/DR/Perf. Cannot do App Modernization | Skill specialization matters |
| Frontend Engineer | +1 progress on App Modernization/Internal Tools/Platform Launch | Reflects real skill splits |
| DevOps Engineer | +2 progress on CI-CD/DR/Tech Upgrades. Can work solo | Force multiplier for infra |
| Staff Engineer | +1 any project. Once/game: split multi-quarter project into parallel tracks | Strategic project decomposition |
| Engineering Manager (revised) | No progress. Reassign talent once/quarter without penalty. Nullify Changing Requirements | Managers coordinate, not code |
| Product Manager (new, distinct) | No progress. +2 Rep on chosen project completion. Nullify Changing Requirements | PMs define scope and business value |

### Architecture Trade-off Cards
| Card | Effect | Why |
|------|--------|-----|
| Technical Spike | Spend 1Q + 1 Senior to preview Project Queue card's hidden complexity | Research and risk mitigation |
| Fast-Follow vs Rebuild | When starting Arch/App Modernization: (A) Quick 2Q + 1 Tech Debt, or (B) Done Right 4Q | Classic speed vs quality trade-off |

---

## 5. Anti-Pattern Cards

### 1. Heroic Programming
Assign 1 Senior Dev to 3-talent project solo. Completes in -1Q but: engineer burned out (discard 2Q) + draw Tech Debt card.
**Real parallel:** All-nighters to ship. Short-term win, long-term disaster.

### 2. Resume-Driven Development
Start Innovation with unproven tech. +1Q. When completed, draw "Unsupported Framework" Tech Debt.
**Real parallel:** Choosing hot framework for resumes, not business value.

### 3. Meeting Overload
Hire Manager/PM. All engineers lose -1 progress this quarter due to coordination overhead.
**Real parallel:** Manager who layers process without streamlining.

### 4. The Rewrite Fallacy
Discard active Architecture Modernization (lose all progress). Start "Full Rewrite": 5Q, 4 talent. If not done by Q8, lose the game.
**Real parallel:** "Let's throw away the codebase and start from scratch!"

### 5. Ship It and Forget It
Complete project without QA. 50% chance of Failed Release next quarter.
**Real parallel:** Celebrating the deploy then immediately moving on. No monitoring, no hardening.

---

## Final Assessment

**Strengths:** Core resource allocation loop is strong. QA/Tech Lead/Specialist roles well-designed. Failed Release/Changing Requirements/Skills Gap events spot-on.

**Critical Gaps:**
1. No Production Incidents (#1 stressor)
2. CI/CD should grant persistent buffs, not just Rep
3. Tech Debt must compound if ignored
4. Architecture needs branch points (fast/fragile vs slow/robust)
5. Role differentiation (Backend/Frontend/DevOps should feel distinct)

**Would I use this with my team?** Yes, with revisions. Quarterly game day as forcing function for hard conversations: "Remember when you sacrificed QA to hit the deadline? How'd that work out?"

**The real value: not simulation, but shared language for hard conversations.**
