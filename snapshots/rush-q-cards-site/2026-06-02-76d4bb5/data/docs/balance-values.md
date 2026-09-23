# Card Value System Analysis & Recommendations

## Current State Analysis

### Baseline Values
- **Starting Reputation**: 20 points per player
- **Project Baseline**: Multiples of 5 (5, 10, 15, 20, 25, etc.)
- **Current Value Range**: 0-25 points across all card types

### Current Value Distribution Issues

#### 1. **Inconsistent Value Scaling**
- **Skill Cards**: Range from 0-10, but many powerful effects are undervalued
- **For Hire Cards**: Range from 1-7, but some provide significant advantages
- **Business Cards**: Range from 1-25, with high variance
- **Budget Cards**: Range from 5-20, but effects are similar

#### 2. **Negation Cost Imbalance**
- **Current Range**: 1-25 points
- **Problem**: High negation costs make some cards nearly impossible to counter
- **Example**: "It's not you, it's me" requires 25 points to negate (more than starting reputation)

#### 3. **Skill Type Value Inconsistency**
- **Hard Skills**: Often undervalued (1-5 points for significant effects)
- **Soft Skills**: Inconsistent pricing (1-7 points)
- **Power Skills**: Some overvalued, some undervalued (1-10 points)

## Recommended Value System

### Core Principles

#### 1. **Multiples of 3 System**
- **Base Unit**: 3 points
- **Reasoning**: Forces strategic decisions and card sacrifices
- **Range**: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30

#### 2. **Effect-Based Valuation**

##### **Drawing Cards**
- **Draw 1 Skill Card**: 3 points (base value)
- **Draw 1 Bonus Project**: 6 points (more valuable)
- **Draw 2+ Cards**: 6-9 points (scaling with quantity)
- **Draw with Conditions**: +3 points for restrictions

##### **Progress Effects**
- **Add 1 Progress**: 3 points
- **Add 2 Progress**: 6 points
- **Add 3+ Progress**: 9+ points (scaling)
- **Progress with Conditions**: +3 points for restrictions

##### **Protection/Immunity**
- **Quarter Immunity**: 6 points
- **Effect Immunity**: 9 points
- **Full Protection**: 12 points

##### **Negation Effects**
- **Basic Negation**: 6 points
- **Advanced Negation**: 9 points
- **Full Negation**: 12 points

##### **Reputation Effects**
- **Gain 1-3 Reputation**: 3 points
- **Gain 4-6 Reputation**: 6 points
- **Gain 7+ Reputation**: 9+ points
- **Lose Reputation**: -3 to -9 points (negative value)

### Card Type Specific Valuations

#### **Skill Cards**
| Effect Type | Base Value | Examples |
|-------------|------------|----------|
| Draw 1 Skill | 3 | Changing Requirements, Semi Senior |
| Draw 1 Bonus Project | 6 | Senior Developer, Senior Lv. 1 |
| Add 1 Progress | 3 | Skilled Execution |
| Add 2 Progress | 6 | Efficient Specialist |
| Quarter Extension | 3 | Cross-Team Dependency |
| Basic Negation | 6 | Counter Argument |
| Protection | 6-9 | Defensive Maneuver |
| Reputation Gain | 3-6 | Owed Favors |

#### **For Hire Cards**
| Effect Type | Base Value | Examples |
|-------------|------------|----------|
| Draw 1 Skill | 3 | Senior Lv. 1, Senior Lv. 4 Data |
| Draw 1 Bonus Project | 6 | Senior Developer |
| Progress Bonus | 6 | Tech Lead |
| Cost Reduction | 6-9 | Project Manager |
| Special Abilities | 9-12 | Specialist |

#### **Business Cards**
| Effect Type | Base Value | Examples |
|-------------|------------|----------|
| Draw 1 Bonus Project | 6 | Most Bonus Projects |
| Progress Effects | 6-9 | Performance Optimization |
| Special Abilities | 9-12 | Platform Launch |
| High Reward | 12-15 | Innovation, App Modernization |

#### **Budget Cards**
| Effect Type | Base Value | Examples |
|-------------|------------|----------|
| Standard Budget | 6 | Keep lights on |
| Enhanced Budget | 9 | Extra hands |
| Premium Budget | 12 | Full coverage |
| Strategic Budget | 15-18 | Scale up, Moonshot |

### Negation Cost Formula

#### **Base Formula**
```
Negation Cost = Base Card Value + Effect Complexity Modifier
```

#### **Effect Complexity Modifiers**
- **Simple Effect**: +0 points
- **Conditional Effect**: +3 points
- **Multi-Target Effect**: +3 points
- **Permanent Effect**: +6 points
- **Chain Effect**: +6 points

#### **Examples**
- **Changing Requirements** (Value: 3, Simple): Negation = 3 points
- **Defensive Maneuver** (Value: 6, Conditional): Negation = 9 points
- **It's Show Time** (Value: 6, Multi-Target): Negation = 9 points
- **Shift The Blame** (Value: 9, Permanent): Negation = 15 points

### Airtable Formulas

#### **1. Base Value Calculation**
```javascript
// Base value based on card effect
SWITCH(
  {Effect Type},
  "Draw 1 Skill", 3,
  "Draw 1 Bonus Project", 6,
  "Draw 2+ Cards", 9,
  "Add 1 Progress", 3,
  "Add 2 Progress", 6,
  "Add 3+ Progress", 9,
  "Quarter Extension", 3,
  "Basic Negation", 6,
  "Protection", 6,
  "Reputation Gain", 3,
  3  // Default value
)
```

#### **2. Effect Complexity Modifier**
```javascript
// Complexity modifier
IF(
  {Conditional Effect}, 3,
  IF(
    {Multi-Target Effect}, 3,
    IF(
      {Permanent Effect}, 6,
      IF(
        {Chain Effect}, 6,
        0
      )
    )
  )
)
```

#### **3. Final Value Calculation**
```javascript
// Final card value
{Base Value} + {Effect Complexity Modifier}
```

#### **4. Negation Cost Calculation**
```javascript
// Negation cost
{Final Value} + {Effect Complexity Modifier}
```

### Recommended Value Adjustments

#### **High Priority Fixes**

1. **"It's not you, it's me"**
   - Current: 25 points
   - Recommended: 12 points (6 base + 6 complexity)

2. **"Shift The Blame"**
   - Current: 10 points
   - Recommended: 15 points (9 base + 6 complexity)

3. **"Defensive Maneuver"**
   - Current: 7 points
   - Recommended: 9 points (6 base + 3 complexity)

4. **"It's Show Time"**
   - Current: 6 points
   - Recommended: 9 points (6 base + 3 complexity)

#### **Medium Priority Fixes**

1. **"Wonderful Move"**
   - Current: 7 points
   - Recommended: 9 points (6 base + 3 complexity)

2. **"Reassign Resources"**
   - Current: 7 points
   - Recommended: 9 points (6 base + 3 complexity)

3. **"Specialist"**
   - Current: 7 points
   - Recommended: 9 points (6 base + 3 complexity)

#### **Low Priority Fixes**

1. **"Skilled Execution"**
   - Current: 4 points
   - Recommended: 3 points (standardized)

2. **"Efficient Specialist"**
   - Current: 5 points
   - Recommended: 6 points (standardized)

### Implementation Strategy

#### **Phase 1: Core System**
1. Implement multiples of 3 baseline
2. Standardize basic effects (draw, progress, negation)
3. Update high-priority cards

#### **Phase 2: Advanced Effects**
1. Implement complexity modifiers
2. Balance special abilities
3. Fine-tune negation costs

#### **Phase 3: Testing & Refinement**
1. Playtest with new values
2. Adjust based on player feedback
3. Finalize formulas

### Questions for Clarification

1. **Should Power Skills have a premium value?** (Currently some are undervalued)
2. **How should we handle cards with multiple effects?** (Add values or use highest?)
3. **Should negation costs scale with player count?** (More players = higher costs?)
4. **How should we value cards that affect other players?** (Currently inconsistent)
5. **Should budget cards have different valuation rules?** (They're more strategic than tactical)

### Testing Recommendations

1. **Start with 3-4 player games** to test balance
2. **Track card usage rates** to identify over/under-valued cards
3. **Monitor negation frequency** to ensure costs are appropriate
4. **Test edge cases** with high-value cards
5. **Gather feedback** on strategic depth vs. accessibility

This system should create more strategic decisions while maintaining game balance and accessibility. 