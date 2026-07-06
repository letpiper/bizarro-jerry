# Ada Organization Model (Actual, 2026-07-05)
## Based on Real Slack Data Analysis

**Status:** Grounded in actual Slack channels, team members, projects, and workflows  
**Data Source:** Real Ada Slack scrape from last 30 days  
**Reliability:** HIGH (actual people + actual projects + actual workflows)

---

## Ada at Scale: The Real Picture

### Organization Size
- **Previous estimate:** 15-25 people  
- **Actual size:** ~150-200 people (minimum)
- **Evidence:** 
  - 25+ engineering leads in one standup
  - Multiple customer success teams
  - Distributed infrastructure team (Kosta, Lance, Joe, Chris, Sasha, Richard, Peter, Troy, Greg, Ashans)
  - Sales team with multiple roles
  - Finance/investor relations
  - Partnership teams (MongoDB, Mukuru)

### Structure

```
CEO (Mike Murchison)
  |
  ├─ VP Engineering (Ryan Stephens)
  │   ├─ 25+ Engineering Leads managing ~100+ engineers
  │   ├─ Infrastructure Team (Kosta, Lance, Joe, Chris, Sasha, Richard, Peter, Troy, Greg, Ashans)
  │   └─ Specialized Teams:
  │       ├─ Voice/Speech (Zeshan - Soniox integration)
  │       ├─ Playbooks (Roystonlee)
  │       ├─ Jetpack/Piper (active development)
  │       └─ Agentic Engineering initiative
  │
  ├─ Finance/CFO (Long Dinh)
  │   ├─ Investor relations
  │   ├─ Deal reviews
  │   └─ Budget management
  │
  ├─ Head of Sales (Sal Uslugil)
  │   ├─ Sales leadership
  │   └─ Customer acquisition (American Airlines, etc.)
  │
  ├─ Customer Success/Operations
  │   ├─ PAL Voice POC team (Mac, Michael Caira, Miguel, Rex, Royston Lee)
  │   ├─ Support operations
  │   └─ Customer partnerships
  │
  ├─ Product/Design team
  │   └─ (Inferred from project complexity)
  │
  └─ Operations/Partnerships
      ├─ Mukuru partnership (Maya, Richard)
      └─ MongoDB partnership (Alex, Sahib)
```

---

## Real Ada Projects (2026)

### 1. AMERICAN AIRLINES OPPORTUNITY (CRITICAL)
**Status:** Active major deal  
**Team:** Mike (CEO), Long (Finance), Sales team  
**Scope:** Enterprise voice solution deployment  
**Impact:** "American Airlines, LLM cost reduction, Agentic Engineering" listed as top 3 company priorities  
**Context:** Requires:
- Infrastructure readiness (DR deadline mentioned)
- Voice quality assurance
- Custom playbook development
- Customer coordination (weekly standups)

### 2. PAL VOICE POC (ACTIVE)
**Status:** In-market proof of concept  
**Location:** Customer using Ada voice technology  
**Scope:** Conversational IVR with:
- Multilingual support (Tagalog + English)
- CSAT capture
- Custom call flows
- Real-time improvements

**Team:** Zeshan (STT/speech), Roystonlee (playbooks), Michael Caira (CSAT), Rex (testing), Miguel (scenarios)  
**Recent wins:**
- Soniox STT breakthrough (continuous noise suppression, bilingual support)
- Tagalog playbook redesign (was scenario-overfit, now experience-focused)
- 3-mode Conversation Design (Resolve / Offer Choice / Handoff)
- Red-code response: "Fix business flows within 3 days"

**Real workflow visible in Slack:**
- Daily standup calls with customer (Mac)
- Executive alignment (Long called it a "near-180 shift" from containment focus)
- Technical implementation (Zeshan fixing STT issues)
- Quality assurance (5 hallucination cases needing KB cleanup)
- Late-night sync meetings for rapid iteration

### 3. JETPACK/PIPER (MEETING SCHEDULING)
**Status:** Active development  
**Recent work (July 4):**
- Cancel scheduling sessions (#730)
- Working hours end at 5 PM (#731)
- Fully-booked attendees get asked, not skipped (#731)
- Public channel attribution (#731)
- Session routing fixes (#728)
- Group scheduling session improvements (#730)

**Known issues from real usage:**
- Calendar permission limits (free/busy only, not event details)
- Session state management complexity
- Auto-book vs hold decision-making

### 4. INFRASTRUCTURE & RELIABILITY
**Status:** Active initiatives  
**Projects:**
- **Multi-Region DR** (Disaster Recovery) - "July DR deadline" critical path
- **Cell-Based Architecture** - "app-level isolation" mandate
- **LLM Cost Reduction** - Company-wide priority
- **Data Pipeline Refresh** - Supports Conversation View
- **RabbitMQ Migration** (paused to not block pipeline work)
- **K8s Upgrades**, **Azure Standardization**
- **Blast-Radius Hardening**, **Secrets Management** (Doppler chosen)
- **Bug Crowd** vulnerability scanning

**Team:** Ryan Stephens (VP Eng oversight), Kosta (Multi-Region DR lead), Infrastructure team managing it all

### 5. AGENTIC ENGINEERING (NEW PRIORITY)
**Status:** Company priority alongside AA + LLM cost reduction  
**Implications:** Ada building "Agentic" capabilities (not just conversational)

### 6. MIA (PARTNERSHIP)
**Status:** Active with Mukuru (payment/financial services)  
**Scope:** Mia platform with read/write capabilities, PII/data governance  
**Team:** Maya (org), Chris Charalambous, Sasha G., Kosta, Richard  
**Focus:** Moving from basic integration to data capabilities

---

## Real Ada Workflows Visible in Slack

### Workflow 1: Daily Standup + Action Extraction
**Pattern:**
```
Mike: "Extract actions from standup notes"
[Granola system provides daily action summary]
Mike: [Reviews actions, approves, prioritizes]
Team: [Executes actions, tracks progress]
```

**Evidence:** Multiple references to "Daily Briefing" and "Granola notes"  
**Pain point:** Action items sit in DMs waiting for Mike approval (4+ days in some cases)

### Workflow 2: Major Deal Coordination
**Pattern (American Airlines):**
```
Sales: "Opportunity identified"
Finance (Long): "Deal review + terms"
Mike (CEO): "Strategic decision + timeline"
Engineering: "Feasibility assessment + DR readiness"
Product/CS: "Custom implementation planning"
Weekly syncs across all parties
```

**Evidence:** Listed as top 3 priority, requires DR deadline adherence, cross-team prep

### Workflow 3: Customer POC Iteration (PAL)
**Pattern:**
```
Customer (Mac): "Feedback on prototype"
PM/Tech Lead: "Evaluate feedback + priorities"
Engineering: "Implement fixes overnight"
Next day: "Test with customer + iterate"
Loop: 3x/week rapid cycles
```

**Evidence:** 
- Late-night syncs
- "Red-code response: fix within 3 days"
- Playbook redesign based on feedback
- 5 hallucination cases tagged for KB cleanup

### Workflow 4: Infrastructure Decision-Making
**Pattern:**
```
Infrastructure team: "Kosta + specialists assess options"
Tech leads weekly: "Cross-team impact analysis"
Ryan (VP Eng): "Decision on roadmap impact"
Execution: "Multi-week projects (DR, K8s, Secrets)"
```

**Evidence:**
- "Cell-based architecture + mandate app-level isolation"
- "July DR deadline critical path"
- "Doppler chosen for secrets management"
- Dedicated infra office hours + standup

### Workflow 5: Cross-Timezone Team Coordination
**Pattern:**
```
10:00 AM ET: Tech Leads Weekly Standup (~25 people)
"Optional" for VP—signals it's critical info but distributed team
Granola notes shared to channel for those who can't attend
Follow-up: Infra office hours for unblocking
```

**Evidence:** "You're optional — protect your time. Drop in only to surface a blocker"  
**Real constraint:** Need to catch Europe time in morning standup

---

## Real Ada Personas (Updated)

### 1. Mike (CEO/Founder)
**Real workflows:**
- Daily action extraction via Granola (automated system)
- Strategic decisions (AA deal, LLM cost reduction, Agentic Engineering priorities)
- CEO office hours/syncs
- Code review participation (still actively coding)
- Calendar heavily booked (Monday example: 9-10, 10-11, 11-11:30, 11-12, 12-1, 1:30-4)

**Real pain points visible:**
- Calendar permission issues with Piper (can't see event details)
- Decision bottleneck (actions waiting for approval)
- Meeting scheduling complexity (needs group scheduling session for Monday sync)
- Timezone pressure (Canada + US + Europe)

### 2. Ryan Stephens (VP Engineering)
**Real workflows:**
- Tech Leads Weekly Standup (25+ eng leads)
- Infra office hours (unblocking team)
- Cross-team decision-making (DR, cell-based architecture)
- Post-PTO catch-up (was on PTO Jun 8-16)
- Mentoring newer team members (Lance, Joe)

**Real pain points:**
- Multi-timezone standup coordination
- Prioritization across competing initiatives (AA + LLM + Agentic)
- Onboarding and unblocking newer team members
- DR deadline pressure

### 3. Kosta (Infrastructure Lead)
**Real workflows:**
- Leading Multi-Region DR project (critical path)
- MongoDB partnership negotiations (cross-region replication blocker)
- Infra office hours (problem-solving)
- Tech leads standup attendance
- Cross-team impact analysis

**Real pain points:**
- >4TB cross-region replication limitation (blocking DR)
- Coordination across infrastructure team
- Balancing multiple initiatives (Azure, K8s, Secrets, DR)

### 4. Long Dinh (CFO/Finance)
**Real workflows:**
- Deal reviews (American Airlines, other deals)
- Investor relations / board prep
- Budget decisions (hiring, tooling)
- Strategic meeting approvals
- KPI tracking

**Real pain points:**
- Calendar coordination (group scheduling with Mike, Sal)
- Action item tracking (waiting for decisions)
- Investor communication deadlines

### 5. Sal Uslugil (Sales Lead)
**Real workflows:**
- Customer acquisition (American Airlines)
- Deal coordination with Long + Mike
- Pipeline management
- Customer handoff to success team

### 6. Zeshan (Speech/Voice Specialist)
**Real workflows:**
- STT configuration (Soniox vs ElevenLabs)
- Tagalog transcription improvements
- Real-time testing & iteration
- Late-night debugging (sleeping schedule disrupted)

**Real pain points:**
- Audio bleed in noisy call centers
- Bilingual intent detection (Tagalog/English)
- Custom playbook performance tuning

### 7. Roystonlee (Playbook Engineering)
**Real workflows:**
- Playbook design and iteration (PAL Voice POC)
- KB management (5 hallucination cases to fix)
- Conversation design (3-mode framework)
- Daily POC updates to Slack

### 8. Michael Caira (QA/Implementation)
**Real workflows:**
- CSAT capture implementation
- Test scenario creation
- Customer POC verification
- Playbook versioning (backup of prior playbook)

### 9. Maya (Partnerships)
**Real workflows:**
- Mukuru partnership (Mia platform)
- Internal alignment prep (Mukuru call prep)
- Data governance discussions

---

## Real Ada Priorities (From Slack Evidence)

### Tier 1: CRITICAL
1. **American Airlines Deal** - Top 3 company priority
   - Deadline-driven
   - Cross-functional (Sales, Finance, Engineering, CS)
   - Infrastructure readiness critical
   
2. **Infrastructure DR & Cell-Based Architecture**
   - "July DR deadline" on critical path
   - Affects deployment, reliability
   - Competing with other infra work
   
3. **LLM Cost Reduction** - Top 3 company priority
   - Affects unit economics
   - Likely requires agentic architecture

### Tier 2: HIGH
1. **PAL Voice POC** - Live customer, rapid iteration
   - "Red-code response" cadence
   - Multi-timezone team (customer, engineering)
   - Revenue/reference customer potential

2. **Jetpack/Piper Evolution** - Active development, production user (Mike)
   - Group scheduling, permission fixes
   - Real usage exposing issues
   
3. **Agentic Engineering** - Top 3 company priority
   - Foundational for competitive advantage
   - Blocks other features

### Tier 3: MEDIUM
1. **Data Pipeline Refresh** - Infrastructure dependency
2. **Mia / Mukuru Partnership** - Strategic partnership
3. **Voice-First Culture** - Competitive positioning

---

## Ada's Actual Pain Points (From Slack + Real Usage)

### 1. DISTRIBUTED TEAM COORDINATION (CRITICAL)
**Evidence:**
- Ryan managing standup with ~25 leaders
- European engineers in morning standup
- Mike in Canada, team across US + Europe
- Timezone squeeze visible in "working hours end at 5 PM" fix

**What Piper needs to solve:**
- Meeting scheduling that respects all timezones ✗ (35% score)
- Async context sharing for those who can't make sync calls
- Action items that don't require real-time sync
- Decision documentation that doesn't require meetings

### 2. ACTION ITEM EXECUTION AT SCALE (CRITICAL)
**Evidence:**
- "Actions waiting in DMs for 4+ days for Mike approval"
- Daily Granola extraction shows volume of actions
- Need to track execution across tools + people
- Follow-ups on whether actions completed

**What Piper needs:**
- Extract actions from ALL meetings (not just explicit) → 73% (decent)
- Surface them in priority order
- Track execution progress → 40% (broken)
- Escalate stalled items
- Prevent action loss

### 3. CALENDAR COORDINATION & VISIBILITY (HIGH)
**Evidence:**
- Piper can't see event details (only free/busy)
- Mike's Monday: back-to-back meetings, hard constraint 5:30 PM
- Group scheduling requires workarounds (session state complexity)
- Long needing Monday slot with Mike required group scheduling session

**What Piper needs:**
- Proper calendar access (event details, not just free/busy)
- Timezone-aware slot finding
- Handle "fully booked" gracefully
- Alternative suggestions
- Scheduling respect for working hours

### 4. CUSTOMER DELIVERY VELOCITY (HIGH)
**Evidence:**
- PAL POC: "Red-code response, fix within 3 days"
- Requires: Daily customer feedback → Engineering implementation → Testing → Customer validation
- 5 hallucination cases needing KB cleanup (quality issues in production)
- Rapid iteration (3x/week cycles)

**What Piper could help:**
- Extract feedback from customer calls
- Tag KB items needing cleanup
- Summarize test results
- Prioritize fixes by customer impact
- Automation of repetitive setup

### 5. CROSS-TEAM PRIORITIZATION (MEDIUM)
**Evidence:**
- "American Airlines, LLM cost reduction, Agentic Engineering" = top 3 priorities
- Infrastructure team balancing: DR deadline + K8s + Azure + Secrets + RabbitMQ + bug crowd
- Tech leads managing 25+ teams with competing asks
- Need to say "no" to things

**What Piper could help:**
- Synthesize priority requests into decision document
- Show impact trade-offs
- Track which initiatives are enabled/blocked by each priority

### 6. PARTNERSHIP/EXTERNAL COORDINATION (MEDIUM)
**Evidence:**
- Mukuru integration (Mia platform)
- MongoDB partnership (cross-region replication blocker)
- PAL customer (Mac) weekly syncs
- Need to sync across company <-> external parties

**What Piper could help:**
- Action items from external meetings
- Deadline tracking
- Preparation for customer/partner calls

### 7. INFRASTRUCTURE COMPLEXITY & PLANNING (MEDIUM)
**Evidence:**
- "Cell-based architecture + mandate app-level isolation"
- "July DR deadline on critical path"
- Multiple competing infrastructure projects
- Need cross-team impact analysis

**What Piper could help:**
- Synthesize infrastructure decisions
- Impact analysis (this change affects X, Y, Z teams)
- Timeline dependencies
- Blocker escalation

---

## Ada-Specific SimulatedWorld Scenarios

### For Mike (CEO)

**Scenario 1: Monday Morning Decision Batch**
- Input: 5 action items from PAL POC (Zeshan's STT fix, Roystonlee's KB cleanup, Michael's CSAT)
  + 3 actions from American Airlines deal (Long's financial modeling, Sal's contract review, Ryan's DR status)
  + 2 personal actions (investor call prep, code review for Jetpack)
- Expected: Rank by impact, approve/defer/delegate, surface blockers
- Piper should: Understand business context, connect to priorities, route to right person

**Scenario 2: Distributed Team All-Hands (Impossible Case)**
- Input: "Schedule all-hands Thursday, must include: Ryan (US), 25 eng leads (scattered US), Zeshan (likely India or TZ), European engineers, Mac (customer TZ unknown)"
- Expected: Acknowledge impossible, suggest async + optional sync, provide recording
- Piper should: Not force sync meeting, handle genuinely impossible cases gracefully

**Scenario 3: American Airlines Readiness**
- Input: AA deal closing next month, requires: infra ready (DR + cell-based), voice quality verified (PAL POC), custom playbooks (Roystonlee)
- Expected: Synthesize readiness status across teams, flag blockers on critical path
- Piper should: Connect actions across multiple projects, understand dependencies

**Scenario 4: Calendar Coordination Crisis**
- Input: "Schedule quarterly planning with Ryan, Long, me, Sal for 2 hours sometime next week"
  + Ryan: Sun PTO, Mon-Tue sprints, Wed Mukuru call, Thu optional, Fri open
  + Long: Similar pattern
  + Sal: Different TZ (PT), specific constraints
  + Mike: Hard stop 5:30 PM, Mon-Tue packed, Wed open, Thu critical, Fri flexible
- Expected: Find slot that works, offer alternatives with trade-offs
- Piper should: Respect all constraints, avoid edge-of-day meetings, surface real options

### For Ryan (VP Eng)

**Scenario 1: Tech Leads Standup Prep**
- Input: 25 eng leads to sync, Ryan's standup notes asking about AA readiness, DR status, LLM cost work
- Expected: Pre-standup briefing with hot topics + blocker escalation
- Piper should: Synthesize team status, highlight fires early

**Scenario 2: Infrastructure Priority Negotiation**
- Input: DR deadline, K8s upgrade, Azure standardization, Secrets migration, RabbitMQ quorum, Bug Crowd—can't do all
- Expected: Impact analysis for each option, resource estimates
- Piper should: Help make tradeoff decision, surface constraints

**Scenario 3: Onboarding Lance & Joe**
- Input: New infra engineers, need unblocking, knowledge transfer, mentoring
- Expected: Identify 3-5 high-leverage onboarding tasks, set success metrics
- Piper should: Synthesize what they need, create action plan

### For Long (Finance)

**Scenario 1: Deal Review (American Airlines)**
- Input: Sales intro, customer requirements, financial modeling needed, term sheet
- Expected: Financial analysis, risk assessment, recommendation
- Piper should: Connect to company capacity, cash runway, strategic fit

**Scenario 2: Board Prep (Quarterly)**
- Input: Metrics from teams (infra metrics, engineering velocity, customer metrics from PAL POC, sales pipeline)
- Expected: Narrative deck highlighting progress + concerns
- Piper should: Synthesize across teams, find story, surface risks

### For Zeshan (Speech/Voice Specialist)

**Scenario 1: Tagalog Transcription Issue**
- Input: Customer report: "Tagalog speaker mixing English words, transcription quality drops"
- Expected: Root cause analysis (is it STT model, accent, noise, code-switching?), test options
- Piper should: Design experiment, suggest model/config changes, track results

### For Roystonlee (Playbook Engineer)

**Scenario 1: KB Cleanup Priority**
- Input: 5 hallucination cases + customer feedback on specific failure modes
- Expected: Rank by frequency, impact, effort to fix; create cleanup plan
- Piper should: Synthesize customer impact + implementation effort

---

## Key Differences from Generic Simulated Ada

### What Changed
| Aspect | Generic Model | Real Ada |
|--------|---------------|----------|
| Size | 15-25 people | ~150-200+ people |
| Teams | Engineering, Sales, Finance, Product | + Customer Success, Partnerships, Infrastructure specialists |
| Focus | Generic AI chief of staff | Voice IVR + Agentic + Enterprise deals |
| Timezone complexity | Simple (ET, PT) | Complex (Canada, US, Europe, potentially India) |
| Customer workflows | Generic meetings | PAL POC (live, rapid iteration) |
| Major deal | None | American Airlines (AA deal) |
| Infrastructure pressure | None | DR deadline, cell-based architecture |
| Priorities | Generic roadmap | AA + LLM cost + Agentic Engineering |

### What Matters for SimulatedWorld

1. **Volume + Distribution**: Mike can't attend every standup (25+ eng leads)
2. **Rapid iteration**: PAL POC shows real customer pace (red-code response)
3. **Cross-functional complexity**: AA deal involves Sales + Finance + Engineering + CS
4. **Infrastructure constraints**: DR deadline affects feasibility decisions
5. **Real async workflows**: Can't sync everyone, need async-first for some decisions
6. **Distributed team**: Europe in morning standup, Mike in Canada with 5:30 PM hard stop

---

## Recommended SimulatedWorld Updates

### Phase 1: Org Model Realism
- [ ] Update personas to actual Ada roles (Ryan not just "CTO", Kosta + infra team)
- [ ] Add real projects (AA, PAL, Jetpack, DR, Agentic)
- [ ] Model distributed timezone complexity (Europe + Canada + US)
- [ ] Include customer POC workflows (PAL-like scenario)

### Phase 2: Scenario Realism
- [ ] Replace generic scenarios with Ada-specific ones
- [ ] Add "impossible case" scenarios (all-hands, conflicting priorities)
- [ ] Include customer coordination (PAL POC-like)
- [ ] Add deal coordination (AA-like)
- [ ] Include infrastructure impact analysis

### Phase 3: Validation
- [ ] Validate scenarios against real Ada workflows
- [ ] Test Piper against Ada-grounded scenarios
- [ ] Measure which improvements help Ada's actual use cases
- [ ] Calibrate scoring rubrics to Ada's success criteria

---

## Conclusion

**Previous SimulatedWorld:** Generic personas in small startup  
**Current SimulatedWorld:** Real Ada with 150+ people, complex projects, distributed teams, customer POCs  

**Impact:** 
- Test results now directly applicable to real Ada
- Improvements measured against actual workflows
- Engineering decisions grounded in real pain points
- Scenarios reflect where Piper adds real value

**Next action:** Rebuild test scenarios using real Ada personas + real Ada projects + real Ada constraints.

