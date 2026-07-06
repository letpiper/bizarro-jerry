# Piper Meeting Booking: Complete Improvement Roadmap

## Mission

Use **Bizarro Jerry** as a deterministic test harness to iteratively improve Piper's meeting scheduling from current state to the **target experience**:

> "When you ask me to book a meeting, my job is to find the best slot fast and intelligently — not just the first open one. I start by pinning down the meeting's purpose. Then I read your calendar and rank everything against your goals. I own the complexity instead of broadcasting problems. The calendar is the source of truth. You get a crisp answer fast."

---

## Current State

Piper's meeting booking capabilities:
- ✗ Doesn't understand meeting purpose before proposing time
- ✗ Doesn't rank meetings against organizational/personal goals
- ✗ Exposes calendar details in group settings (privacy leak)
- ✗ Broadcasts problems to group instead of solving privately
- ✗ Proposes lists of options instead of one clear recommendation
- ✗ No agent-to-agent negotiation for constraint relaxation
- ✗ Doesn't minimize disruption when rescheduling required
- ✗ Judy still spends 3 hours coordinating; doesn't gain strategic time

**Current Score:** 0-30% on target experience (depends on implementation)

---

## Target State

When Piper books a meeting, it will:

### 1. **Purpose-First Understanding**
- Ask one clarifying question if purpose is unclear: "Is this to decide Q3 targets or gather input?"
- Understand meeting importance (decision vs info vs recurring)
- Identify essential attendees vs optional
- Rank against existing meetings (board decision > customer call > standup)
- Allocate time based on purpose (decision = 60 min, info = 30 min)

### 2. **Smart Ranking Against Goals**
- Know Ada's strategic goals (close AA deal, hit $10M ARR, ship Piper v2)
- Know Mike's goals (AA by July 25, investor call ready, family 5:30 PM)
- Rank incoming meetings: AA deal + investor > customer > standup
- Protect valuable blocks: Customer calls, leadership decisions, private time (Noa's concert)
- Move lower-priority meetings if necessary (standup can be async; AA deal cannot)

### 3. **Privacy by Default**
- In private 1:1: Show full calendar context
- In group settings: Only expose free/busy blocks, never titles or details
- Public channel: "Works for 4/5, one conflict for one person" (never what conflict is)
- Keep personal goals completely private ("Noa's concert" never visible to team)
- Agent-to-agent negotiation: Secure channel, each person's Piper speaks for their constraints

### 4. **Own the Complexity**
- Reconcile everyone's availability without broadcasting the problem
- Identify blocking meetings and who owns them
- For group scheduling: Calculate timezone overlap, weigh essential vs optional attendees
- Don't hand back "no clean slot found" — find the minimal change that solves it

### 5. **Minimal-Cost Constraint Relaxation**
- When no clean slot: Identify all possible solutions ranked by cost
  - Lowest: Move one optional person's own meeting (Ryan reschedules his architecture discussion)
  - Medium: Move someone's less important meeting (Judy moves her lunch break)
  - High: Move someone's critical meeting (break customer call with stakeholder)
- Approach one person privately with specific ask: "Your 11 AM blocks the roadmap sync; can you move it to 3-4 PM or Thursday?"
- Get explicit approval before proposing final time to group
- Present solution to group as "done," not "depends on..."

### 6. **Calendar is Source of Truth**
- Check RSVP status from Calendar API, not Slack "sounds good"
- Set decision deadline so optional attendees don't freeze the room with silence
- Track conflicts and availability from Calendar, not manual tracking
- Verify all moves are actually accepted (hard confirmation, not soft signal)

### 7. **Crisp Answer, Not Options**
- Propose ONE recommendation: "Recommend Tuesday 2-3 PM ET"
- Explain why: "All in working hours, closes Friday deadline, minimal movement needed"
- Acknowledge tradeoff: "Jason reschedules lower-priority customer call to Wednesday"
- Offer alternative only if primary fails: "Backup: Wednesday 10 AM with Goz on dial-in"
- Decision is confident, not wishy-washy: "Ready to send invite. Approve?"

### 8. **Result: Judy Gains Strategic Time**
- Judy spends 30 min coordinating (not 3 hours)
- Judy has 2.5+ hours for executive prep work
- Judy can focus on: Context synthesis, decision tracking, cross-team communication
- Judy feels trusted to make decisions without always asking Mike

**Expected Score:** 80-90%+ on target experience (all capabilities implemented)

---

## Test Framework

### Test #1: Simple Measurement (`test-piper-meeting-booking.js`)

Measures Piper's performance on 6 dimensions with baseline → iteration path:

```
Baseline: 43% (below target)

Iteration 1: Recommendation Clarity → 49%
Iteration 2: Timezone + Working Hours → 60%
Iteration 3: Conflict Detection + Tradeoff → 70% ✓ (PASSES)
Iteration 4: Group Coordination → 74%
```

Run: `node test-piper-meeting-booking.js`

### Test #2: Target Experience (`test-piper-target-experience.js`)

Tests Piper against the actual target experience with 5 comprehensive scenarios:

1. **Purpose-First** — Does Piper understand meeting intent before proposing?
2. **Privacy by Default** — Does Piper protect details in group settings?
3. **Minimal-Cost Relaxation** — Does Piper solve without broadcasting?
4. **Crisp Answer** — Does Piper propose one recommendation with clear tradeoffs?
5. **Judy's Scenario** — Does Judy gain strategic time? Does Mike's calendar work?

Run: `node test-piper-target-experience.js`

### Test #3: Bizarro Jerry Scenarios

Use Judy's Executive Coordination scenario from `ada-core-7-scenarios-goal-based.js`:

```bash
node ada-core-7-scenarios-goal-based.js
# Scenario 2: Judy's Calendar Coordination
```

Measures:
- Scheduling efficiency (30 min coordination vs 3 hours)
- Strategic delegation (which meetings don't need Mike)
- Context prep quality (auto-drafted briefs vs Judy writing from scratch)
- Time freed for strategy (2.5+ hours for executive prep)
- Privacy respect (personal goals never leak)

---

## Implementation Path

### Phase 1: Prompt + Decision Logic (3 days)

**Goal:** Make Piper state recommendation first, understand purpose

**Changes:**
- Update system prompt: "Always start with 'Recommend [TIME]'"
- Add reasoning step: "Analyze constraints → Score slots → Recommend highest-scoring"
- Add clarifying question: "Is this to decide or gather input?" (if needed)

**Test:** `node test-piper-meeting-booking.js`
- Expected gain: Recommendation Clarity 35% → 65% (+30)
- Overall: 43% → 49%

### Phase 2: Timezone + Goals (4 days)

**Goal:** Fetch attendee profiles, rank against goals, show all local times

**Changes:**
- Create `/users/profiles` tool → fetch timezone + working hours
- Create `rankMeetingsByGoal` logic → know Ada's goals + Mike's goals
- Update response: Show timezone table with all attendees' local times + working hours status
- Add goal context: "AA deal > customer > standup"

**Test:** `node test-piper-meeting-booking.js`
- Expected gain: Timezone 40% → 80%, Working Hours 50% → 70% (+40)
- Overall: 49% → 60%

### Phase 3: Conflict + Tradeoff (4 days)

**Goal:** Full-week availability check, find alternatives, explain tradeoffs

**Changes:**
- Call `/calendar/freeBusy` with full week, not just proposed time
- Find all gaps ≥ duration, score by attendee preferences
- Return top 3 conflict-free alternatives
- Add tradeoff analysis: "Pros: All in working hours | Cons: Jason joins early"
- Suggest async if no good sync exists

**Test:** `node test-piper-meeting-booking.js`
- Expected gain: Conflict 60% → 80%, Tradeoff 30% → 70% (+40)
- Overall: 60% → 70% ✓ (PASSES TARGET)

**Validation:** Run `test-piper-target-experience.js`
- Scenario 1 & 4: Purpose + Crisp Answer should pass
- Scenario 2: Privacy still needs work (Phase 4)

### Phase 4: Privacy + Agent-to-Agent (5 days)

**Goal:** Protect calendar details, negotiate privately, solve without broadcasting

**Changes:**
- Create secure channel for agent-to-agent negotiation
- Implement privacy levels:
  - Individual: Full calendar detail
  - Direct report (Judy): Constraints + reasoning (not titles)
  - Group channel: Free/busy only, never details
- Add constraint relaxation logic: Identify lowest-cost changes
- Add approval workflow: Get confirmation before proposing to group

**Test:** `test-piper-target-experience.js`
- All 5 scenarios should pass ≥70%
- Especially Scenario 2 (Privacy), Scenario 3 (Relaxation)

**Real validation:** Judy runs Piper for actual meeting scheduling
- Does she gain 2.5+ hours?
- Does Mike's 5:30 PM stay protected?
- Do personal goals stay private?

### Phase 5: Iteration + Refinement (Ongoing)

**Loop:**
1. Judy coordinates meetings using Piper
2. Measure time saved, quality of decisions
3. Identify gaps (rare edge cases, timing issues)
4. Implement fixes
5. Re-run test suites
6. Track improvement over weeks/months

---

## Success Metrics

### Immediate (After Phase 3: Conflict + Tradeoff)

- [ ] `test-piper-meeting-booking.js` score ≥70%
- [ ] Piper states recommendation first (not options)
- [ ] All timezone conversions correct
- [ ] Conflict detection catches all conflicts
- [ ] Tradeoff explanation clear

### Short-term (After Phase 4: Privacy + Agent-to-Agent)

- [ ] `test-piper-target-experience.js` all scenarios ≥70%
- [ ] Personal goals completely private
- [ ] Group scheduling shows only free/busy
- [ ] Constraint relaxation works (identifies lowest-cost changes)
- [ ] Agent-to-agent negotiation functional

### Long-term (Real Validation)

- [ ] Judy gains 2 hours/week for strategic work
- [ ] Mike's 5:30 PM hard stop always respected
- [ ] Calendar conflicts drop to near-zero
- [ ] Judy reports: "Meeting scheduling is effortless"
- [ ] Team reports: "Never felt forced into bad times"
- [ ] All meeting bookings happen first-pass (no reschedules)

---

## Running the Tests

### Quick Check
```bash
cd /tmp/simulated-world

# Simple metric test
node test-piper-meeting-booking.js

# Full target experience test
node test-piper-target-experience.js

# Bizarro Jerry scenarios
node ada-core-7-scenarios-goal-based.js
# Look for: Scenario 2 (Judy's Calendar Coordination)
```

### Track Progress
```bash
# After each phase implementation
git log --oneline test-piper-*.js
# Shows iteration history

# Compare scores
git diff HEAD~5..HEAD test-piper-meeting-booking.js
# Shows improvement over iterations
```

---

## Timeline

| Phase | Focus | Effort | Result |
|-------|-------|--------|--------|
| 1 | Prompt + Purpose | 3 days | 49% |
| 2 | Timezone + Goals | 4 days | 60% |
| 3 | Conflict + Tradeoff | 4 days | 70% ✓ |
| 4 | Privacy + Agent-to-Agent | 5 days | 85%+ |
| 5 | Refinement + Real Validation | Ongoing | 90%+ |

**Time to passing (≥70%):** 11 days (Phases 1-3)  
**Time to target (≥85%):** 16 days (Phase 4)  
**Time to excellence (≥90%):** Ongoing

---

## Key Insight: Judy is the Leverage Point

When Piper handles meeting scheduling well:
- Judy goes from "calendar tetris" to "strategic support"
- Mike gets fewer calendar conflicts → makes faster decisions
- Team has clarity on Mike's availability (no confusion)
- Organization accelerates because the coordination hub is unblocked

**Judy currently spends 3 hours/day on calendar coordination.**  
**Target: 30 minutes/day (98% time savings).**

When this works, the entire organization feels faster.

---

## Next Step

1. Review this roadmap with the Piper team
2. Commit to Phase 1 (Prompt + Purpose)
3. Run baseline: `node test-piper-meeting-booking.js`
4. Implement Phase 1 changes
5. Re-run test, measure improvement
6. Move to Phase 2

Let's build the meeting booking experience that actually works.

---

**Bizarro Jerry is live and ready to measure progress:**

```bash
cd /tmp/simulated-world
node test-piper-meeting-booking.js
```

**Repository:** https://github.com/letpiper/bizarro-jerry
