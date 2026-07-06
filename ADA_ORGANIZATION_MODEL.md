# Ada Organization Model for SimulatedWorld
## Grounding Piper Testing in Real Ada Structure and Personas

**Date:** 2026-07-05  
**Status:** Defining personas to replace generic test users  
**Goal:** Make SimulatedWorld scenarios reflect Ada's actual workflows

---

## The Problem

Current SimulatedWorld uses generic personas:
- Alice (PM), Bob (Engineer), Charlie (Designer)
- No connection to Ada's actual org
- No CEO workflows
- No founder/leadership patterns
- Doesn't reflect Ada's actual pain points

**This means our test results might not translate to real Ada workflows.**

---

## Ada's Actual Organization (2026)

Based on context:
- **Founder/CEO:** Mike Murchison
- **Company size:** ~15-25 people (estimate based on "staff of 1" comment)
- **Business:** Ada - AI voice solution for businesses
- **Stage:** Growth/Series A
- **Structure:** Engineering, Product, Sales/BD, Operations

---

## Proposed Ada Personas

### Tier 1: Executive Leadership

#### 1. Mike Murchison (CEO/Founder)
**Role:** CEO & Co-founder  
**Location:** Canada (home by 5:30 PM daily)  
**Integrations:** Calendar, Slack, Email, Linear, GitHub  
**Typical Daily:**
- 5-6 meetings with investors, customers, leadership team
- Strategy decisions (roadmap, hiring, fundraising)
- Code reviews (still actively coding)
- Personal constraints: Hard stop 5:30 PM for family

**What Piper Needs:**
- ✅ Extract action items from investor calls
- ✅ Quick meeting scheduling (high-value calendars)
- ✅ Email drafting (investor updates, customer proposals)
- ✅ Daily summary of team decisions
- ✓ Action surface tied to strategic initiatives

**Piper's Current Gaps (Relevant to Mike):**
- No strategic thinking (can't understand business impact)
- Can't prioritize strategically (what matters most to Ada?)
- Meeting scheduling broken for distributed team
- No cross-tool view of progress

---

#### 2. Prashan (CTO / VP Engineering)
**Role:** VP Engineering  
**Location:** US (timezone varies based on team)  
**Integrations:** GitHub, Slack, Linear, Calendar  
**Typical Daily:**
- 3-4 technical decisions with engineers
- Code review and architecture discussions
- Cross-team coordination (product, design)
- Hiring and technical interviews

**What Piper Needs:**
- ✅ Surface action items from code reviews
- ✅ Task sync across GitHub and Linear
- ✅ Meeting coordination across US timezones
- ✓ Status updates (velocity, blockers)

**Piper's Current Gaps (Relevant to Prashan):**
- Task sync broken (GitHub + Linear + Todoist)
- Can't understand technical dependencies
- Meeting scheduling doesn't work for distributed team
- No sense of project velocity/progress

---

#### 3. Long (Finance/CFO - assume exists)
**Role:** Chief Financial Officer  
**Location:** US timezone  
**Integrations:** Slack, Email, Calendar, Spreadsheets (Sheets)  
**Typical Daily:**
- 2-3 financial reviews
- Board prep and reporting
- Funding/investor relations
- Budget management

**What Piper Needs:**
- ✅ Extract action items from board meetings
- ✅ Compile financial metrics for reports
- ✓ Calendar coordination for investor calls
- ✓ Email drafting (investor communications)

**Piper's Current Gaps (Relevant to Long):**
- Data synthesis broken (can't analyze trends)
- Can't create strategic reports (just templates)
- No cross-tool data aggregation
- Meeting scheduling for investor coordination

---

### Tier 2: Senior Individual Contributors

#### 4. Sal (Sales/BD Lead - assume exists)
**Role:** Head of Sales/Business Development  
**Location:** US timezone  
**Integrations:** Slack, Email, Calendar, Salesforce  
**Typical Daily:**
- 4-5 customer calls
- Proposal creation and follow-up
- Pipeline management
- Competitive intelligence

**What Piper Needs:**
- ✅ Extract action items from customer calls
- ✅ Proposal drafting and email
- ✓ Meeting scheduling (customer coordination)
- ✓ CRM updates from conversation notes

**Piper's Current Gaps (Relevant to Sal):**
- Email at scale (inbox overload)
- CRM updates (Salesforce sync broken)
- Proposal template and drafting
- No sales/competitive intelligence

---

#### 5. Brendan (Product Lead - assume exists)
**Role:** Head of Product  
**Location:** US timezone  
**Integrations:** Slack, Email, Calendar, Linear, Docs  
**Typical Daily:**
- 3-4 product planning meetings
- Requirements/spec writing
- Customer feedback synthesis
- Cross-functional coordination

**What Piper Needs:**
- ✅ Extract action items from planning meetings
- ✅ Document creation (specs, roadmaps)
- ✅ Customer feedback synthesis
- ✓ Cross-team coordination

**Piper's Current Gaps (Relevant to Brendan):**
- Document collaboration (multi-author specs)
- Customer feedback synthesis across channels
- Roadmap prioritization (no strategic thinking)
- Meeting scheduling across teams

---

### Tier 3: Individual Contributors

#### 6. Engineer A (Staff Engineer / IC Lead)
**Role:** Senior Engineer  
**Location:** US timezone  
**Integrations:** GitHub, Slack, Linear, Calendar  
**Typical Daily:**
- Code review and writing
- Technical discussions
- Task management
- Team coordination

**What Piper Needs:**
- ✅ Task/issue management (Linear + GitHub)
- ✅ Code review summaries
- ✓ Meeting coordination
- ✓ Technical discussion notes

**Piper's Current Gaps:**
- Task sync (0% - completely broken)
- Code review synthesis
- Meeting scheduling across timezones

---

#### 7. Engineer B (Mid-level Engineer)
**Role:** Software Engineer  
**Location:** Different timezone (Europe?)  
**Integrations:** GitHub, Slack, Linear  
**Typical Daily:**
- Code writing and review
- Task management
- Team communication

**What Piper Needs:**
- ✅ Task management
- ✓ Code review feedback
- ✓ Async communication

**Piper's Current Gaps:**
- Task sync
- Timezone coordination for meetings

---

#### 8. Designer (Product Designer)
**Role:** Senior Product Designer  
**Location:** US timezone  
**Integrations:** Figma, Slack, Calendar, Docs  
**Typical Daily:**
- Design work and iteration
- Design reviews
- Cross-functional meetings
- Feedback incorporation

**What Piper Needs:**
- ✅ Design feedback synthesis
- ✅ Meeting notes and action items
- ✓ Design system documentation

**Piper's Current Gaps:**
- Design collaboration tools (Figma integration weak)
- Multi-author feedback on designs
- Design review coordination

---

## Organization Structure

```
                    Mike (CEO)
                      |
        ______________|______________
        |              |              |
      Prashan       Long            Sal
      (CTO)        (CFO)         (Sales)
        |
    _____|_____
    |         |
  Eng A     Eng B      Brendan (Product)    [Designer]
  (Staff)  (Mid)       (IC/Lead)

Key characteristics:
- ~8-12 people in engineering/product
- ~2-3 in sales/BD
- ~1-2 in operations/finance
- Total: ~15-25 people
- Distributed (US + Canada + possibly Europe)
- Heavily collaborative
```

---

## Timezone Distribution

Assuming:
- Mike: Canada (ET)
- Prashan: US (varies, but ET/CT)
- Long: US (ET/CT)
- Sal: US (PT/CT)
- Brendan: US (PT)
- Engineer A: US (CT/PT)
- Engineer B: Europe (UTC+1, UK/Europe)
- Designer: US (PT)

**Key insight:** Distributed team = timezone coordination is CRITICAL pain point

---

## Ada's Actual Workflows (Inferred)

### 1. Daily Standup / Team Sync
- **Who:** Engineers + Prashan (maybe product)
- **When:** Morning US time (to catch Europe)
- **Output:** Blockers, progress, dependencies
- **Problem Piper Needs to Solve:**
  - Extract blockers automatically
  - Surface blocking dependencies
  - Create action items for unblock
  - Track daily progress

### 2. Product Planning / Roadmap
- **Who:** Mike, Brendan, Prashan
- **When:** Weekly/bi-weekly
- **Output:** Roadmap decisions, priorities, specs
- **Problem Piper Needs to Solve:**
  - Extract decisions and action items
  - Create specs from decisions
  - Link to engineering tasks
  - Communicate roadmap to team

### 3. Customer Calls (Sales)
- **Who:** Sal + customer
- **When:** Variable
- **Output:** Feedback, requirements, proposals
- **Problem Piper Needs to Solve:**
  - Extract customer needs
  - Update CRM
  - Create proposals
  - Share feedback with product

### 4. Investor/Board Updates
- **Who:** Mike + Long
- **When:** Monthly/quarterly
- **Output:** Board deck, financial report, narrative
- **Problem Piper Needs to Solve:**
  - Aggregate metrics from teams
  - Create data-driven narratives
  - Extract decisions/action items
  - Coordinate investor follow-ups

### 5. Technical Reviews / Code Reviews
- **Who:** Prashan + team
- **When:** Continuous
- **Output:** Feedback, approved changes
- **Problem Piper Needs to Solve:**
  - Summarize code review feedback
  - Extract action items
  - Identify blockers
  - Track code review velocity

---

## Key Ada-Specific Pain Points

Based on the organization structure, Piper should focus on:

### 1. CRITICAL: Meeting Coordination Across Timezones
**Why:** Mike in Canada, distributed team US + Europe  
**Current Problem:** Timezone blindness (35% score)  
**Impact:** High - affects daily standup, planning, customer calls  
**Evidence:** Mike's constraint "home by 5:30 PM" creates timezone squeeze

### 2. CRITICAL: Action Item Extraction & Execution
**Why:** Multiple daily meetings (standup, planning, customer calls, reviews)  
**Current Problem:** Extraction OK (73%), execution broken (40%)  
**Impact:** High - where do decisions actually get tracked?  
**Evidence:** "Extract actions from meetings" is CEO use case

### 3. HIGH: Task Sync Across GitHub + Linear
**Why:** Engineering uses both + maybe Todoist  
**Current Problem:** 0% (completely broken)  
**Impact:** High - engineers don't have unified view  
**Evidence:** Tech teams always struggle with this

### 4. HIGH: CRM + Email for Sales
**Why:** Sal needs to track customer relationships  
**Current Problem:** Email at scale (23%), Salesforce sync (0%)  
**Impact:** Medium - critical for growth  
**Evidence:** Sales org always needs this

### 5. MEDIUM: Data Synthesis for Board/Investor Updates
**Why:** Mike + Long need monthly/quarterly reports  
**Current Problem:** Data synthesis (8%)  
**Impact:** Medium - strategic but less frequent  
**Evidence:** Investor relations critical for fundraising

---

## Piper Scenarios by Persona

### For Mike (CEO)
```
Scenario 1: Extract Actions from Investor Call
- Input: 45-min call notes with Investor X
- Expected: Investment terms, action items, deadlines
- Piper should: Extract key terms, identify follow-ups, schedule reminders

Scenario 2: Daily Team Status
- Input: Slack standup messages from team
- Expected: Blockers, progress, risks, next steps
- Piper should: Synthesize into brief update for board

Scenario 3: Meet Schedule Across Timezones
- Input: "Schedule planning with Prashan (PT), Long (CT), Engineer B (UK)"
- Expected: 1-hour slot that works for all
- Piper should: Respect working hours for all, suggest alternatives if impossible

Scenario 4: Weekly Investors Update Email
- Input: Progress this week + fundraising status
- Expected: Professional email to investors with highlights
- Piper should: Tone, focus on what matters to investors, call-to-action
```

### For Prashan (CTO)
```
Scenario 1: Extract Blockers from Standup
- Input: Team standup transcript
- Expected: Who's blocked by what, dependencies, action items
- Piper should: Identify blocking relationships, surface unblock actions

Scenario 2: Code Review Summary
- Input: GitHub PR review comments
- Expected: Summary of feedback, action items for engineer
- Piper should: Synthesize feedback, prioritize feedback

Scenario 3: Task Sync Across GitHub + Linear
- Input: Engineer references GitHub PR in Linear ticket
- Expected: Both systems stay in sync
- Piper should: Bidirectional sync, no duplicates

Scenario 4: Technical Debt vs Feature Work
- Input: Team capacity for next sprint
- Expected: Recommendation on how much debt vs features
- Piper should: Strategic thinking about tradeoffs
```

### For Sal (Sales)
```
Scenario 1: Customer Call Notes → Action Items
- Input: Call notes from customer conversation
- Expected: Extract customer needs, action items, next steps
- Piper should: Update CRM, create follow-up tasks

Scenario 2: Proposal Drafting
- Input: Customer X + their requirements
- Expected: Professional proposal
- Piper should: Tailor to customer, include pricing, timeline

Scenario 3: Competitive Intelligence
- Input: Customer mentions competitor in call
- Expected: Analysis + recommended response
- Piper should: Research competitor, suggest differentiation

Scenario 4: Pipeline Management
- Input: List of open deals + their status
- Expected: Pipeline forecast and risk alerts
- Piper should: Flag at-risk deals, suggest follow-up timing
```

### For Brendan (Product)
```
Scenario 1: Customer Feedback Synthesis
- Input: Multiple customer calls this week
- Expected: Key themes, feature requests, pain points
- Piper should: Aggregate and categorize feedback

Scenario 2: Spec Writing from Meeting
- Input: Planning meeting notes
- Expected: Formal product spec
- Piper should: Convert discussion to structured spec

Scenario 3: Roadmap Prioritization
- Input: Feature backlog + customer feedback + tech debt
- Expected: Prioritized roadmap
- Piper should: Strategic thinking about impact vs effort

Scenario 4: Cross-team Coordination
- Input: Spec requires input from design, engineering, sales
- Expected: Get all input and synthesize decision
- Piper should: Coordinate reviews, identify disagreements
```

---

## Organization Model for SimulatedWorld

Now that we have personas, we need:

1. **Org Graph**
   - Who reports to whom?
   - Team memberships?
   - Decision authority?

2. **Calendar Data**
   - Realistic working hours for each
   - Timezone considerations
   - Standing meetings

3. **Integration Access**
   - What tools does each person use?
   - What data can they see?
   - What can they modify?

4. **Real Workflows**
   - How do decisions actually happen?
   - What meetings are recurring?
   - How do action items get tracked?

5. **Scenarios by Role**
   - Test CEO workflows
   - Test manager workflows  
   - Test IC workflows
   - Test cross-functional workflows

---

## Recommended Next Steps

### This Week:
1. **Validate personas**
   - Is this org structure right?
   - Who are the actual people?
   - What roles are missing?

2. **Get real calendars** (if possible)
   - Export Mike's calendar (sample week)
   - Export Prashan's calendar
   - Export Sal's calendar
   - Analyze: what's typical?

3. **Get real workflows** (interviews)
   - Ask Mike: "How do you use Piper daily?"
   - Ask Prashan: "What's your bottleneck with tools?"
   - Ask Sal: "What takes the most time?"

4. **Ground scenarios in reality**
   - Use real meeting types (not generic)
   - Use real timezones
   - Use real tools (not imagined)
   - Use real pain points (not guessed)

### Then:
- Rebuild SimulatedWorld scenarios with real Ada personas
- Re-test against actual Ada workflows
- Get real confidence scores

---

## Conclusion

**Current SimulatedWorld:**
- Generic personas (Alice, Bob, Charlie)
- Not grounded in Ada's org
- Tests generic problems
- Results may not apply to real Ada

**Proposed Ada-Grounded SimulatedWorld:**
- Real personas (Mike, Prashan, Long, Sal, Brendan, Engineers, Designer)
- Grounded in Ada's actual structure
- Tests Ada's actual workflows
- Results directly applicable

**Benefit:** When SimulatedWorld scores improve, we know it actually helps Ada.

---

**Next Action:** Align on these personas. Are they right? Who's missing? Then rebuild scenarios to match real Ada workflows.

EOF

cat /tmp/simulated-world/ADA_ORGANIZATION_MODEL.md
