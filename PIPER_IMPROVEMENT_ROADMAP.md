# Piper Meeting Scheduling Improvement Roadmap

## Executive Summary

The SimulatedWorld package provides comprehensive testing infrastructure for Piper's meeting scheduling capabilities. This roadmap identifies:

1. **What Piper needs to achieve** to meet both target experiences
2. **Current capability gaps** identified by testing
3. **Specific improvements** needed in prompts, tools, and logic
4. **How to measure success** using the evaluation framework

---

## Target Experiences

### 1. General Target Piper Experience

**Crisp, hard-thinking-first responses.** Example: "the answer is 42"

What this means for meeting scheduling:
- Clear decision-making (not wishy-washy)
- Direct answer first, then explanation
- Identifies constraints immediately
- Shows reasoning transparently

**Piper must:**
- State the recommended time slot immediately
- Explain WHY (constraint analysis)
- Show what was considered (tradeoffs)
- Provide confidence level

### 2. Target Meeting Booking Experience

**Intelligent meeting scheduling that just works.**

Piper must:
- Find the BEST slot (not just first available)
- Handle complex group scenarios (4+ people, multiple timezones)
- Intelligently handle conflicts (detect, find alternatives, explain)
- Respect working hour preferences
- Surface clear tradeoffs
- Handle timezone complexity gracefully
- Suggest async alternatives when sync is suboptimal

---

## Evaluation Framework

### Success Metrics

All scenarios must achieve **≥70% overall score** to pass. Each metric has a target:

| Metric | Target | Weight | What It Tests |
|--------|--------|--------|---------------|
| **Availability Detection** | ≥90% | 20% | Can find open slots accurately |
| **Timezone Handling** | ≥95% | 20% | Correct timezone conversion |
| **Conflict Detection** | ≥85% | 20% | Detects conflicts, finds alternatives |
| **Working Hours Respect** | ≥80% | 15% | Stays within preferences |
| **Communication** | ≥80% | 15% | Clear explanation of decisions |
| **Performance** | <2s | 10% | Responds quickly |

### Scenario Pass/Fail Criteria

```
PASS if:
  - All attendees can join at proposed time
  - No calendar conflicts
  - Time is within working hours (or explained)
  - Response is clear and decisive
  - Overall score ≥70%

FAIL if:
  - Proposes time with conflict
  - Doesn't explain tradeoffs
  - Timezone conversion wrong
  - Slow response (>2s)
  - Overall score <70%
```

---

## Current Gaps & Improvements

### Gap 1: Doesn't State Recommendation First

**Problem:** Piper explains options but doesn't clearly recommend one.

**Current Behavior:**
```
"You could meet at 2 PM ET or 3 PM ET. 
2 PM works for Alice and Bob. 
3 PM also works. 
What would you prefer?"
```

**Target Behavior:**
```
"Recommend 2 PM ET (11 AM PT).

Why: Works for all attendees within working hours.
Tradeoff: Bob joins 11 AM PT (early but within hours).
Alternative: 3 PM ET (12 PM PT) also works, 1 hour later."
```

**How to Fix:**
1. Add reasoning step: "Analyze constraints → Score slots → Recommend highest-scoring"
2. Update system prompt: "Always start with the recommended time slot"
3. Tool output should include confidence score

### Gap 2: Timezone Math Errors

**Problem:** Piper miscalculates or doesn't verify timezone conversions.

**Current Behavior:**
```
"2 PM ET = 3 PM PT" ❌ (Wrong: should be 11 AM PT)
```

**Target Behavior:**
```
"2 PM ET = 11 AM PT = 6 PM UTC

Attendee local times:
- Alice (ET): 2:00 PM ✓
- Bob (PT): 11:00 AM ✓
- Charlie (UK): 6:00 PM ✓
- Diana (IST): 11:30 PM (outside 5:30 PM end)"
```

**How to Fix:**
1. Create timezone-aware time slot validator
2. Always show conversions for all attendees
3. Validate all times against working hours
4. Add test cases for DST boundaries

### Gap 3: Doesn't Detect/Handle Conflicts

**Problem:** Piper doesn't check calendars before suggesting, or doesn't find alternatives.

**Current Behavior:**
```
"Meet at 2 PM ET" → [Alice has meeting at 2 PM] → Conflict not caught
```

**Target Behavior:**
```
"Primary: 2 PM ET - CONFLICT with Alice's client call
Alternative 1: 3 PM ET - All clear ✓
Alternative 2: 4 PM ET - All clear ✓
Recommend: 3 PM ET (closest to primary)"
```

**How to Fix:**
1. Call `/calendar/v3/freeBusy` for ALL attendees BEFORE suggesting
2. Keep top 5 conflict-free alternatives
3. Search in 30-minute increments across the week
4. Score alternatives by:
   - How close to requested time
   - How well it fits all attendees' preferences
   - How "normal" the time is (vs. early morning / late evening)

### Gap 4: Doesn't Show Clear Tradeoffs

**Problem:** Piper doesn't explain why a slot is sub-optimal or why you might prefer it anyway.

**Current Behavior:**
```
"We can meet at 8 AM ET"
```

**Target Behavior:**
```
"Can meet 8 AM ET, but:
- Bob joins 5 AM PT (outside his 9 AM start)
- Charlie joins 1 PM UTC (lunch time)
Better option: 12 PM ET (9 AM PT, 5 PM UTC) for all attendees in working hours"
```

**How to Fix:**
1. Extract working hour preferences from attendee objects
2. Score slots by "working hours coverage" (% of attendees in working hours)
3. Highlight deviations explicitly
4. Explain the tradeoff math

### Gap 5: Doesn't Handle Group Scheduling

**Problem:** With 4+ people across timezones, no time works perfectly—Piper doesn't acknowledge this.

**Current Behavior:**
```
"Meet at 2 PM ET" (Only checked 1-2 people's calendars)
```

**Target Behavior:**
```
"Group scheduling challenge: ET + PT + UK + IST spans 16 hours.

Best overlap: 1-2 PM UTC (works for 3/4 in working hours)
- Alice (ET): 8-9 AM ✓
- Bob (PT): 5-6 AM ✗ (outside hours)
- Charlie (UK): 1-2 PM ✓
- Diana (IST): 6:30-7:30 PM ✓

Options:
1. Sync at 1 PM UTC (Bob early, but doable) ✓ Recommended
2. Async-first (record for Bob, live for others)
3. Two sessions (US+UK at 1 PM UTC, separate for India)"
```

**How to Fix:**
1. Check ALL attendee calendars in parallel
2. Calculate timezone overlap mathematically
3. Score "workability" by attendees-in-working-hours / total-attendees
4. Suggest async alternatives when sync score <60%

### Gap 6: Doesn't Suggest Async Alternatives

**Problem:** When sync scheduling is suboptimal, Piper doesn't suggest async.

**Target Behavior:**
```
"Async recommended for this group:
- Reason: No time works for all in working hours
- Next steps:
  1. Post decision in Slack thread
  2. Record live session for Bob (5 AM PT)
  3. Schedule 15-min async follow-up for Bob

Sync fallback: 1 PM UTC (Bob joins early)"
```

**How to Fix:**
1. Add decision logic: if best_slot_score < 60% → suggest async
2. Create async workflow: Slack thread + recording link + follow-up
3. Offer sync as fallback with tradeoff explanation

---

## Detailed Improvements by Capability

### 1. Availability Detection (Metric: ≥90%)

**What Piper needs:**
- Accurate free/busy queries
- Handle all-day events, recurring events
- Understand "tentative" bookings
- Respect calendar colors / private calendars

**Implementation:**
```
Tool: /calendar/freeBusy
  Input: attendees list, date range, duration
  Output: List of available 30-min slots with confidence
  
Piper logic:
  1. Query freeBusy for all attendees
  2. Parse busy blocks (extract start/end)
  3. Find gaps ≥ duration
  4. Return top 5 slots sorted by "goodness"
```

**Test with:** `meeting-booking-basic.ts`

### 2. Timezone Handling (Metric: ≥95%)

**What Piper needs:**
- Parse attendee timezone from profile
- Convert times to all local timezones
- Handle DST boundaries
- Show UTC as reference

**Implementation:**
```
Tool: /users/profiles
  Input: attendee emails
  Output: User object with timezone (IANA format)

Piper logic:
  1. Fetch all attendee profiles
  2. For proposed time, calculate local times for all
  3. Validate against working hours
  4. Show table:
     Attendee | Local Time | Working Hours?
```

**Test with:** `meeting-booking-timezone-edge-cases.ts`

### 3. Conflict Detection (Metric: ≥85%)

**What Piper needs:**
- Query freeBusy with full date range
- Understand different conflict types (hard/soft)
- Search for alternatives intelligently
- Return multiple options

**Implementation:**
```
Algorithm: Find Best Slot
  1. Get proposed time slots from user
  2. For each slot:
     a. Query /calendar/freeBusy for all attendees
     b. Check if slot falls in busy time for anyone
     c. If conflict, mark as "has_conflict"
  3. If primary has conflict:
     a. Search 1 week window
     b. Check every 30-min increment
     c. Find top 5 conflict-free slots
  4. Return: [recommended_slot, alt_1, alt_2, ...]

Output format:
  primary_slot: { time, conflict_with: ["Alice"] }
  alternatives: [
    { time: "3 PM ET", confidence: 95%, attendees: "all" },
    { time: "4 PM ET", confidence: 95%, attendees: "all" },
  ]
```

**Test with:** `meeting-booking-conflict-resolution.ts`

### 4. Working Hours Respect (Metric: ≥80%)

**What Piper needs:**
- Read working hour preferences from user profiles
- Check if proposed time is within hours
- Clearly indicate out-of-hours suggestions
- Offer in-hours alternatives

**Implementation:**
```
Data: User.preferences.workingHours
  { start: 9, end: 17 }  // 9 AM - 5 PM

Validation: Is Time In Working Hours?
  function isInWorkingHours(time, attendee) {
    localHour = convertToTimeZone(time, attendee.timezone)
    return localHour >= attendee.preferences.workingHours.start
           && localHour <= attendee.preferences.workingHours.end
  }

Piper logic:
  For each candidate slot:
    1. Check all attendees
    2. Count in_hours vs out_of_hours
    3. Score: in_hours_count / total * 100
    4. Flag if any attendee is outside hours
```

**Test with:** `meeting-booking-group.ts`

### 5. Communication (Metric: ≥80%)

**What Piper needs:**
- Clear statement of recommendation
- Explicit reasoning (constraints, tradeoffs)
- Confidence level
- Show what was considered

**Implementation:**
```
Response Template:

---
RECOMMENDATION
Suggest [TIME] for [DURATION]

REASONING
[Constraint 1] → [Impact]
[Constraint 2] → [Impact]
Scoring: [slot A: 95%], [slot B: 80%]
→ Recommend slot A

TRADEOFFS
[Who is affected]: [How]

ALTERNATIVES
[Alt 1] - [Why worse than recommendation]
[Alt 2] - [Why worse than recommendation]

NEXT STEPS
1. Confirm time
2. Send calendar invite
3. Post in Slack
---
```

**Test with:** All scenarios

### 6. Performance (Target: <2s)

**What Piper needs:**
- Parallel freeBusy queries (not sequential)
- Cache timezone data
- Batch API calls when possible

**Optimization:**
```
Current (slow):
  for each attendee:
    query freeBusy  // 4 sequential calls = 400ms

Better (parallel):
  Promise.all([
    query(alice),
    query(bob),
    query(charlie),
    query(diana),
  ])  // 4 parallel calls = 100ms
```

**Test with:** All scenarios (check `duration` metric)

---

## Implementation Checklist

### Phase 1: Core Availability (Week 1)
- [ ] Implement freeBusy query tool
- [ ] Parse busy blocks correctly
- [ ] Find 30-minute slots
- [ ] Parallel freeBusy queries
- [ ] Pass `meeting-booking-basic.ts` at ≥70%

### Phase 2: Timezone & Working Hours (Week 2)
- [ ] Fetch attendee profiles + timezones
- [ ] Calculate local times for all attendees
- [ ] Check working hour preferences
- [ ] Show timezone table in response
- [ ] Pass `meeting-booking-timezone-edge-cases.ts` at ≥70%

### Phase 3: Conflict Detection & Alternatives (Week 3)
- [ ] Detect conflicts in proposed slot
- [ ] Search for alternatives
- [ ] Return top 5 options
- [ ] Score by "goodness" (all in working hours? closest to requested?)
- [ ] Pass `meeting-booking-conflict-resolution.ts` at ≥70%

### Phase 4: Group Scheduling & Async (Week 4)
- [ ] Handle 4+ attendees across timezones
- [ ] Calculate timezone overlap
- [ ] Suggest async when sync score <60%
- [ ] Show tradeoff analysis
- [ ] Pass `meeting-booking-group.ts` at ≥70%

### Phase 5: Refinement & General Experience (Week 5)
- [ ] Polish system prompt for "decisive" tone
- [ ] Recommendation first, explanation second
- [ ] Clear reasoning + confidence
- [ ] All tests pass at ≥70%
- [ ] Response time <2s consistently

---

## System Prompt Template

```
You are Piper, Ada's AI assistant. You help users accomplish their goals with crisp, 
hard-thinking-first responses.

For meeting scheduling:

1. ANALYZE: What are the constraints?
   - Who needs to attend (emails + timezones)
   - How long (duration)
   - When (specific time or flexible)
   - Where (timezone considerations)

2. REASON: What options exist?
   - Query all attendees' free/busy
   - Find conflict-free slots
   - Score by working hours coverage
   - Consider timezone overlap

3. RECOMMEND: What's the best slot?
   - State clearly: "Recommend [TIME]"
   - Explain why (constraint analysis)
   - Show reasoning (confidence score)
   - Highlight tradeoffs

4. COMMUNICATE: What happens next?
   - Confirm attendees accept
   - Create calendar event
   - Post Slack notification
   - Record for async attendees if needed

IMPORTANT:
- Always start with the recommendation, not options
- Show your work (constraints, scoring)
- Be decisive, not indecisive ("I recommend X because Y")
- Handle timezone complexity gracefully
- Suggest async when sync is suboptimal
```

---

## Testing Workflow

### 1. Run Individual Scenarios

```bash
# Basic test
npx ts-node examples/meeting-booking-basic.ts

# Output should show:
# ✓ Found available slot: 2 PM ET
# ✓ All attendees in working hours
# ✓ Calendar events created
# Score: 95%+ to PASS
```

### 2. Run Full Suite

```bash
node /tmp/simulated-world/test-scenarios.js

# Output:
# Basic 1-on-1:         PASS (95%)
# Group Meeting:        PASS (85%)
# Conflict Resolution:  PASS (90%)
# Timezone Edge Cases:  PASS (92%)
# Overall:             PASS (90.5%)
```

### 3. Measure Before/After

```
BEFORE improvements:
  Basic 1-on-1: 65% ❌
  Group: 45% ❌
  Conflict: 40% ❌
  Timezone: 55% ❌

AFTER improvements:
  Basic 1-on-1: 95% ✅
  Group: 85% ✅
  Conflict: 90% ✅
  Timezone: 92% ✅
```

---

## Success Criteria

### Piper achieves "General Target Experience"
- ✅ States recommendation first ("the answer is...")
- ✅ Shows reasoning clearly
- ✅ Decisive, not wishy-washy
- ✅ <2s response time

### Piper achieves "Meeting Booking Target Experience"
- ✅ Finds BEST slot (not first)
- ✅ Handles 4+ people across timezones
- ✅ Detects conflicts, finds alternatives
- ✅ Respects working hours
- ✅ Clear tradeoff explanation
- ✅ Suggests async when appropriate

### All Scenarios Pass
- ✅ Basic 1-on-1: ≥70%
- ✅ Group Meeting: ≥70%
- ✅ Conflict Resolution: ≥70%
- ✅ Timezone Edge Cases: ≥70%

---

## Quick Reference

| Scenario | What It Tests | Expected | File |
|----------|---------------|----------|------|
| Basic 1-on-1 | Availability + timezone | 95%+ | `meeting-booking-basic.ts` |
| Group (4tz) | Multi-timezone coordination | 85%+ | `meeting-booking-group.ts` |
| Conflicts | Detection + alternatives | 90%+ | `meeting-booking-conflict-resolution.ts` |
| Edge Cases | Timezone math + date boundaries | 92%+ | `meeting-booking-timezone-edge-cases.ts` |

---

## Next Steps

1. **Establish Baseline:** Run all scenarios against current Piper, document scores
2. **Prioritize Gaps:** Which metric is lowest? Fix that first
3. **Implement Phase 1:** Get availability detection working
4. **Iterate:** Each phase, run scenarios, measure improvement
5. **Polish:** Once all phases pass, refine tone and performance
6. **Ship:** Piper's meeting scheduling is now robust and reliable
