# Ada Core 5 Personas for SimulatedWorld
## Leadership + Executive Support Test Coverage

**Focus:** These 5 personas represent the core workflows Piper needs to support  
**Date:** 2026-07-05  
**Why these 5:** They cover executive decision-making, product strategy, sales, operations, and executive support

---

## The 5 Core Personas

### 1. Mike (CEO)
**Full Title:** CEO & Co-founder  
**Timezone:** America/Toronto (ET -1)  
**Working Hours:** 9 AM - 5:30 PM ET (hard family constraint)  
**Tools:** Calendar, Slack, Gmail, Linear, GitHub, Granola  
**Reports to:** Board

**Daily Pattern:**
- 5-6 meetings (customer calls, investor updates, strategy, team sync)
- Decision-maker on all major items (AA deal, product direction, hires, budget)
- Code reviews (still actively coding)
- Action approval bottleneck (team waits for Mike's decision)

**Real Constraints:**
- Hard stop 5:30 PM (home by 5:30 PM daily - from CLAUDE.md)
- Heavy calendar (back-to-back meetings common)
- Needs daily action summary (uses Granola for this)
- Calendar permission limited (Piper sees free/busy only)

**What Piper Needs to Do:**
- Extract actions from meetings with ownership + priority
- Surface blockers that need Mike's approval
- Synthesize team status into executive summary
- Schedule meetings respecting 5:30 PM constraint
- Route decisions efficiently (don't overload Mike)
- Track approval status of action items

**Key Workflows:**
1. Daily decision batch (actions from team + deals + personal)
2. Investor call prep + follow-ups
3. Team decision synthesis
4. Deal readiness assessment
5. Meeting coordination across timezones

---

### 2. Goz (CPTO - Chief Product & Technology Officer)
**Full Title:** Chief Product & Technology Officer  
**Timezone:** TBD (likely US, probably ET or PT)  
**Working Hours:** 9 AM - 5 PM (standard)  
**Tools:** Calendar, Slack, Linear, GitHub, Docs, Figma (inference)  
**Reports to:** Mike

**Daily Pattern:**
- Product strategy + roadmap decisions
- Technology architecture decisions
- Cross-functional coordination (Eng, Design, Product)
- Feature prioritization and trade-offs
- Customer feedback synthesis
- Technical reviews + approvals

**Real Constraints:**
- Balances product vision with engineering reality
- Makes prioritization decisions (feature vs debt vs cost reduction)
- Owns customer satisfaction metrics
- Coordinates across multiple teams

**What Piper Needs to Do:**
- Synthesize customer feedback into themes
- Prioritize features by impact + effort
- Identify technical blockers early
- Create specs from planning discussions
- Track feature progress across sprints
- Surface trade-off decisions (when to say no)
- Cross-team coordination (engineering, design, sales feedback)

**Key Workflows:**
1. Weekly roadmap planning (feedback + capacity + priorities)
2. Feature spec writing (from discussions → structured specs)
3. Customer feedback synthesis (calls + support tickets + usage data)
4. Technical debt vs feature trade-offs
5. Cross-team coordination (eng + design + sales alignment)
6. Progress tracking and velocity

---

### 3. Jason (Account Executive / Salesperson)
**Full Title:** Account Executive (Sales)  
**Timezone:** TBD (likely PT for customer coverage)  
**Working Hours:** 9 AM - 5 PM  
**Tools:** Calendar, Slack, Gmail, Salesforce, Granola (inference)  
**Reports to:** Sal (Sales Lead) or Head of Sales

**Daily Pattern:**
- 4-5 customer calls (demos, discovery, follow-ups)
- Proposal creation + customization
- CRM updates (Salesforce)
- Pipeline management
- Competitive intelligence
- Collaboration with product (feature requests → product team)

**Real Constraints:**
- High call volume (context-switching)
- CRM must stay in sync (SLA tracking for customer updates)
- Proposals time-sensitive
- Needs customer context preserved
- Works with product team on feature requests

**What Piper Needs to Do:**
- Extract action items from customer calls
- Draft proposals from customer requirements
- Update CRM (Salesforce) from call notes
- Track follow-up actions + deadlines
- Flag competitive threats
- Synthesize customer feedback for product team
- Calendar coordination with customers

**Key Workflows:**
1. Customer call notes → action items + CRM update
2. Proposal drafting (customer X + requirements → customized proposal)
3. Pipeline management (deal status + forecasting)
4. Follow-up tracking (customers expecting calls)
5. Competitive intelligence (customer mentions Competitor Y)
6. Feature request routing to product

---

### 4. Judy (Executive Assistant)
**Full Title:** Executive Assistant to CEO  
**Timezone:** America/Toronto (with Mike)  
**Working Hours:** 8:30 AM - 5:30 PM ET (supports Mike's schedule)  
**Tools:** Calendar, Slack, Gmail, Sheets, Docs, Asana (likely)  
**Reports to:** Mike (directly)

**Daily Pattern:**
- Coordinate Mike's calendar (10+ meeting requests/day)
- Track action items from meetings
- Prepare briefing materials for meetings
- Meeting notes + action summaries
- Executive communication (investor emails, board materials)
- Cross-functional coordination on Mike's behalf
- Decision tracking + follow-ups

**Real Constraints:**
- Must respect Mike's 5:30 PM hard stop
- Multiple calendars to coordinate (Mike + cross-functional)
- Information hub (knows what's happening across org)
- Often first-line for approvals
- Needs to prep Mike for meetings

**What Piper Needs to Do:**
- Find meeting slots respecting Mike's constraints
- Group scheduling (Mike + others) with permission awareness
- Extract action items from Mike's meetings
- Track who's responsible for what + deadlines
- Prepare meeting briefs (context + agenda + prep work)
- Schedule follow-ups automatically
- Coordinate across teams on Mike's behalf
- Create executive summaries (daily status, weekly review)
- Identify decisions pending Mike's approval

**Key Workflows:**
1. Meeting scheduling + conflict resolution
2. Action item tracking + follow-ups
3. Meeting prep (briefing document creation)
4. Meeting notes + action extraction
5. Calendar coordination (Mike + cross-functional)
6. Executive communication (emails, board materials)
7. Decision tracking (what's approved, what's waiting)
8. Daily executive summary (what Mike needs to know)

---

### 5. Long (CFO)
**Full Title:** Chief Financial Officer  
**Timezone:** America/Eastern  
**Working Hours:** 9 AM - 5 PM ET  
**Tools:** Calendar, Slack, Gmail, Sheets, Salesforce (pipelines)  
**Reports to:** Mike

**Daily Pattern:**
- Deal reviews (American Airlines, customer contracts)
- Financial planning + forecasting
- Board prep + investor relations
- Budget decisions + hiring approvals
- Metrics reporting (monthly, quarterly)
- Cash flow management

**Real Constraints:**
- Board/investor deadlines are hard
- Needs cross-team data (ARR, churn, customer health)
- Deal complexity (terms, margins, risk)
- Investor communication critical
- Multiple stakeholders (Mike, Board, Investors)

**What Piper Needs to Do:**
- Synthesize deal status (Sales pipeline → Finance terms)
- Financial analysis (pricing, margins, ARR impact)
- Board prep (metrics synthesis, narrative)
- Investor communication (quarterly updates, follow-ups)
- Budget tracking vs forecast
- Risk analysis (deal risk, cash risk, growth risk)
- Cross-team metrics aggregation

**Key Workflows:**
1. Deal review (sales opportunity → financial analysis)
2. Board meeting prep (metrics + narrative + recommendations)
3. Investor relations (quarterly updates, follow-ups)
4. Financial forecast vs actuals
5. Budget management (approvals, tracking)
6. Customer health metrics (churn risk, expansion risk)
7. KPI reporting (monthly, quarterly)

---

## Interactions Between Personas

### Mike ↔ Goz
- Weekly product strategy syncs
- Feature prioritization decisions
- Roadmap alignment
- Tech debt vs feature trade-offs
- Customer feedback escalation

### Mike ↔ Judy
- Daily (Judy coordinates Mike's calendar)
- Judy tracks Mike's action items + decisions
- Judy preps Mike for meetings
- Judy communicates Mike's decisions to org

### Mike ↔ Long
- Deal reviews (AA deal, customer contracts)
- Board prep (metrics + investor updates)
- Fundraising discussions
- Budget + hiring approvals
- Strategic financial decisions

### Mike ↔ Jason
- Occasional customer calls (large deals)
- Investor introductions
- High-value customer relationship

### Goz ↔ Judy
- Judy may help coordinate Goz's calendar (secondary)
- Product updates to communicate

### Goz ↔ Jason (Sales)
- Jason sends feature requests from customer
- Goz provides product context for sales calls

### Long ↔ Jason
- Deal terms (pricing, SLA)
- Customer contract review
- Revenue recognition

### Long ↔ Judy
- Board materials preparation
- Financial briefing for Mike's meetings

---

## Core Workflows Across All 5

### Workflow 1: Decision Making + Approval
```
Initiator: Any of 5
Blocking point: Mike's approval
Challenge: Actions stuck waiting for Mike

Flow:
1. Team creates action/decision
2. Surfaces to Mike (via Judy or direct)
3. Mike approves / defers / changes
4. Judy tracks + communicates result
5. Team executes

Piper should:
- Flag pending decisions
- Escalate stalled items (>24h waiting)
- Route decision efficiently
- Track approval status
```

### Workflow 2: Calendar Coordination
```
Owner: Judy (primary), Mike/Goz/Long/Jason (participants)
Challenge: Complex constraints (timezones, hard stops, team coordination)

Flow:
1. Meeting request comes in
2. Judy finds slot (respecting constraints)
3. Calendar invites sent
4. Attendees confirm
5. Prep materials created
6. Meeting happens

Piper should:
- Propose slots (smart alternatives)
- Handle impossible cases gracefully
- Respect Mike's 5:30 PM
- Group scheduling (multiple attendees)
- Create meeting briefs
```

### Workflow 3: Action Item Tracking
```
Owner: Judy (tracks), Team (executes)
Blocking points: Who owns what? What's blocked? What's overdue?

Flow:
1. Actions extracted from meetings
2. Judy assigns + tracks
3. Team executes + updates status
4. Judy surfaces blockers to Mike
5. Mike unblocks / escalates
6. Action completed + marked done

Piper should:
- Extract actions from all sources (calls, emails, Slack, docs)
- Track ownership + deadline
- Flag overdue items
- Surface blockers
- Create action summaries for Mike
```

### Workflow 4: Information Synthesis
```
Owner: Judy (for Mike briefs), Long (for board), Goz (for product)
Challenge: Information scattered across tools

Flow:
1. Data exists in multiple places (Slack, calls, docs, CRM, metrics)
2. Person needs synthesized view (brief, report, decision doc)
3. Piper aggregates + synthesizes
4. Person reviews + makes decision

Piper should:
- Pull data from multiple sources
- Synthesize into coherent narrative
- Highlight key decisions/risks/opportunities
- Create executive summary format
```

---

## SimulatedWorld Test Approach for Core 5

Instead of 6 scenarios, focus on:

### High-Value Scenarios
1. **Mike's Daily Decision Batch** (Decision approval)
   - 8 action items, needs ranking + routing
   - Includes PAL POC, AA deal, personal

2. **Judy Scheduling Mike's Week** (Calendar coordination)
   - 10 meeting requests, multiple constraints
   - Timezone complexity, conflicting priorities
   - Must respect 5:30 PM

3. **Jason's Customer Call Loop** (Sales workflow)
   - Call notes → action items + Salesforce update
   - Feature request → product team
   - Follow-up tracking

4. **Goz's Product Planning** (Strategic synthesis)
   - Customer feedback → themes + priorities
   - Feature backlog prioritization
   - Trade-off decisions

5. **Long's Board Prep** (Financial synthesis)
   - Metrics from multiple sources
   - Narrative creation
   - Risk assessment

6. **Impossible Case: All-Hands Coordination** (Constraint handling)
   - If need to reach all 5 personas + team
   - Shows graceful degradation

---

## Key Insight: Judy is Critical

**Why Judy matters:**
- Gate-keeper to Mike (controls calendar, tracks decisions)
- Information hub (knows everything happening in org)
- Execution enabler (turns decisions into action)
- If Piper helps Judy, Mike is more efficient
- Judy workflows are complex (calendar, action tracking, communication)

**Judy's biggest pain points:**
1. Meeting scheduling (10+ requests/day, complex constraints)
2. Action item tracking (scattered across Slack, docs, emails)
3. Mike prep (gathering context for 5+ meetings/day)
4. Decision tracking (what's approved? who's waiting?)
5. Communication (filtering what matters to Mike)

**If Piper solves Judy's problems:**
- Mike gets more efficient (fewer approval bottlenecks)
- Team gets clarity (who owns what, what's decided)
- Org moves faster (less time on coordination)

This is often overlooked in tools (build for the "user" not the assistant), but Judy is probably 10x impact for Ada's efficiency.

---

## Test Harness Ready

With these 5 personas, SimulatedWorld can measure:
- Whether Piper helps Mike make faster decisions
- Whether Piper helps Judy coordinate complex calendars
- Whether Piper helps Jason close more deals (CRM sync, proposals)
- Whether Piper helps Goz prioritize strategically
- Whether Piper helps Long deliver board-ready materials

All measurable against **real Ada workflows**.
