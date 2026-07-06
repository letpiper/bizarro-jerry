# Piper Meeting Booking: Iterative Improvement Plan

## Overview

Using **Bizarro Jerry's Judy scenario** as our test harness, we will iteratively improve Piper's meeting booking from **43% to 74%+ overall score**.

**Test command:** `node test-piper-meeting-booking.js`

Each iteration should:
1. Show measured improvement on Bizarro Jerry
2. Add one capability to Piper
3. Validate with real usage (Judy's actual workflow)

---

## Baseline Results (Current Piper)

```
Overall Score: 43% (FAIL)

Breakdown:
  Recommendation Clarity:    35% ✗ (opens with options, not clear recommendation)
  Timezone Handling:         40% ✗ (only ET shown, not all attendees)
  Conflict Detection:        60% ✗ (misses edge cases)
  Working Hours Respect:     50% ✗ (doesn't verify all attendees)
  Tradeoff Communication:    30% ✗ (no explanation)
  Group Coordination:        40% ✗ (doesn't acknowledge complexity)
```

---

## ITERATION 1: Recommendation Clarity (Day 1)

**Goal:** Make Piper state the recommendation first, not list options.

**Gap:** Piper says "Could meet at 2 PM or 3 PM..." instead of "Recommend 2 PM"

### What to Fix

**File:** `piper/capabilities/meeting-booking/system-prompt.md`

```diff
CURRENT:
"When scheduling meetings, consider available times and propose options."

TARGET:
"When scheduling meetings:
1. Analyze constraints (timezones, working hours, conflicts)
2. Find the BEST slot (not first available)
3. State the recommendation first: 'Recommend [TIME] [TIMEZONE]'
4. Show why: Explain constraint analysis
5. Offer alternatives: 'Alternative 1: [TIME], Alternative 2: [TIME]'

STRUCTURE:
'Recommend 2 PM ET (11 AM PT / 6 PM UTC).

Why: Works for all attendees in working hours. Mike's 5:30 PM respected.

Alternative 1: 3 PM ET (12 PM PT) - 1 hour later, same benefit
Alternative 2: 4 PM ET (1 PM PT) - within working hours but tight for timezone

Next step: Shall I book 2 PM ET?'"
```

**File:** `piper/capabilities/meeting-booking/schedule-meeting.ts` (or equivalent)

```typescript
// CURRENT
async function scheduleMeeting(request) {
  const availableSlots = await getAvailableSlots(request.attendees);
  return {
    message: `You could meet at ${availableSlots[0]} or ${availableSlots[1]}. Let me check further.`,
    slots: availableSlots,
  };
}

// TARGET
async function scheduleMeeting(request) {
  const availableSlots = await getAvailableSlots(request.attendees);
  const scoredSlots = scoreSlots(availableSlots, request.constraints);
  const bestSlot = scoredSlots[0];
  const alternatives = scoredSlots.slice(1, 3);

  return {
    recommendation: bestSlot,
    reasoning: explainConstraintAnalysis(bestSlot, request.constraints),
    alternatives: alternatives,
    message: `Recommend ${formatTime(bestSlot)}.

Why: ${bestSlot.reasoning}

Alternative 1: ${formatTime(alternatives[0])} - ${alternatives[0].reasoning}
Alternative 2: ${formatTime(alternatives[1])} - ${alternatives[1].reasoning}

Next step: Shall I book ${formatTime(bestSlot)}?`,
  };
}
```

### Expected Result

**Score:** 35% → 65% (+30 points)

```
✓ Recommendation Clarity: 35% → 65%
  "Recommend [TIME]" appears first
  Reasoning is clear
  Alternatives listed

Overall: 43% → 49%
```

### Validation

After implementing, run:
```bash
node test-piper-meeting-booking.js
```

Look for:
- ✓ Response starts with "Recommend"
- ✓ Reasoning section present
- ✓ Alternatives offered

---

## ITERATION 2: Timezone Handling + Working Hours (Days 2-3)

**Goal:** Show all attendees' local times and validate working hours.

**Gap:** Piper only shows ET, doesn't verify all attendees' working hours.

### What to Fix

**File:** `piper/capabilities/meeting-booking/attendee-profiles.ts`

```typescript
// NEW TOOL: Fetch attendee profiles with timezone
async function getAttendeeProfiles(emailAddresses: string[]) {
  // For each attendee:
  return emailAddresses.map(email => ({
    email: email,
    timezone: 'America/Toronto', // From Calendar API
    workingHours: {
      start: '09:00',
      end: '17:30',
      timezone: 'America/Toronto',
    },
    name: 'Mike',
    preferences: {
      preferredTimes: ['09:00-12:00', '14:00-17:00'],
      avoid: [],
    },
  }));
}
```

**File:** `piper/capabilities/meeting-booking/schedule-meeting.ts`

```typescript
// CURRENT
async function scheduleMeeting(request) {
  // Assumes all attendees work 9-5 ET
  const slots = await findSlots(request.attendees);
  return { recommendation: slots[0] };
}

// TARGET
async function scheduleMeeting(request) {
  // Fetch all attendee profiles (timezone + working hours)
  const profiles = await getAttendeeProfiles(request.attendees);
  
  const slots = await findSlots(request.attendees, profiles);
  const best = slots[0];
  
  // Show timezone table
  const timeTable = profiles.map(p => ({
    name: p.name,
    timezone: p.timezone,
    localTime: convertToTimezone(best.time, p.timezone),
    inWorkingHours: isInWorkingHours(
      convertToTimezone(best.time, p.timezone),
      p.workingHours
    ),
  }));
  
  return {
    recommendation: best,
    timeTable: timeTable, // Show this in response
    message: `Recommend ${best.time} ET.

Attendee local times:
${timeTable.map(t =>
  `- ${t.name} (${t.timezone}): ${t.localTime} ${t.inWorkingHours ? '✓' : '⚠️'}`
).join('\n')}

Why: All attendees in working hours with minimal early/late times.
...`,
  };
}
```

### Expected Result

**Score:** 43% → 60% (+17 points)

```
✓ Timezone Handling: 40% → 80% (+40)
  All attendee timezones shown
  Local times displayed in table
  UTC reference included

✓ Working Hours Respect: 50% → 70% (+20)
  All attendee hours validated
  Deviations flagged (✓ vs ⚠️)

Overall: 49% → 60%
```

### Validation

After implementing:
```bash
node test-piper-meeting-booking.js
```

Look for:
- ✓ Timezone table with all attendees
- ✓ Local times correct for each timezone
- ✓ Working hours validation (✓ in hours, ⚠️ outside)

---

## ITERATION 3: Conflict Detection + Tradeoff Communication (Days 4-5)

**Goal:** Check calendars thoroughly and explain tradeoffs clearly.

**Gap 1:** Piper misses conflicts (doesn't do full-week freeBusy)  
**Gap 2:** Piper doesn't explain why slot is better/worse

### What to Fix

**File:** `piper/capabilities/meeting-booking/calendar-query.ts`

```typescript
// CURRENT
async function checkAvailability(attendees, proposedTime) {
  // Only checks proposed time
  const busy = await calendar.freeBusy({
    timeMin: proposedTime,
    timeMax: proposedTime,
    items: attendees.map(a => ({ id: a.email })),
  });
  return !busy.calendars.some(c => c.busy.length > 0);
}

// TARGET
async function findConflictFreeSlots(attendees, duration, preferences) {
  // Check FULL WEEK in 30-min increments
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  
  const busy = await calendar.freeBusy({
    timeMin: weekStart,
    timeMax: weekEnd,
    items: attendees.map(a => ({ id: a.email })),
  });
  
  // Find all gaps ≥ duration
  const slots = [];
  for (let time = weekStart; time < weekEnd; time += 30 * 60 * 1000) {
    const slotEnd = time + duration * 60 * 1000;
    if (isAvailable(busy, time, slotEnd)) {
      slots.push({
        time,
        conflicts: [],
        score: scoreSlot(time, preferences),
      });
    }
  }
  
  return slots.sort((a, b) => b.score - a.score);
}

// If proposed time conflicts, find alternatives
async function findAlternatives(attendees, proposedTime, duration) {
  const allSlots = await findConflictFreeSlots(attendees, duration, {});
  
  // Mark proposed time
  const hasConflict = allSlots.find(s => s.time === proposedTime) === undefined;
  
  if (hasConflict) {
    return {
      proposed: {
        time: proposedTime,
        conflicts: ['Alice has client call 2-3 PM'],
        available: false,
      },
      alternatives: allSlots.slice(0, 3),
    };
  }
  
  return {
    proposed: { time: proposedTime, conflicts: [], available: true },
    alternatives: allSlots.slice(1, 3),
  };
}
```

**File:** `piper/capabilities/meeting-booking/schedule-meeting.ts`

```typescript
// Add tradeoff analysis
async function analyzeTrueoffs(slot, alternatives, attendeeProfiles) {
  return {
    slot: slot,
    analysis: {
      pros: [
        'All attendees in working hours',
        'No calendar conflicts',
        'Reasonable time for all timezones',
      ],
      cons: [
        alternatives.some(a => a.earlierInPT) ? 'Early for PT attendees' : null,
      ].filter(Boolean),
      score: calculateSlotScore(slot, attendeeProfiles),
    },
  };
}

// Updated response structure
return {
  primary: {
    time: bestSlot,
    conflicts: [], // or list conflicts if any
    analysis: tradeoffAnalysis(bestSlot),
  },
  alternatives: [
    {
      time: alt1,
      conflicts: [],
      analysis: tradeoffAnalysis(alt1),
      reason: 'Next best option, slightly later but same quality',
    },
    {
      time: alt2,
      conflicts: [],
      analysis: tradeoffAnalysis(alt2),
      reason: 'Later slot, better for PT but later for others',
    },
  ],
  message: `Recommend ${formatTime(bestSlot)}.

Why: ${bestSlot.analysis.pros.join(', ')}

Tradeoff: ${bestSlot.analysis.cons.length > 0 
  ? bestSlot.analysis.cons.join(', ') 
  : 'None identified'}

Alternative 1: ${formatTime(alt1)} - ${alt1.reason}
  Pros: ...
  Cons: ...

Alternative 2: ${formatTime(alt2)} - ${alt2.reason}
  Pros: ...
  Cons: ...`,
};
```

### Expected Result

**Score:** 60% → 70% (+10 points, **PASSES 70% threshold**)

```
✓ Conflict Detection: 60% → 80% (+20)
  Full-week freeBusy check
  Conflicts detected and flagged
  Alternatives found

✓ Tradeoff Communication: 30% → 70% (+40)
  Pros/cons explained
  Scoring shown
  Clear reasoning

Overall: 60% → 70% ✓ PASSES TARGET
```

### Validation

After implementing:
```bash
node test-piper-meeting-booking.js
```

Look for:
- ✓ Conflict detection section
- ✓ Multiple alternatives offered
- ✓ Tradeoff explanation (pros/cons)
- ✓ Overall score ≥70%

---

## ITERATION 4: Group Coordination (Days 6-8)

**Goal:** Acknowledge group scheduling complexity and suggest async when needed.

**Gap:** Piper doesn't acknowledge that 4+ people across timezones is hard.

### What to Fix

**File:** `piper/capabilities/meeting-booking/group-coordination.ts`

```typescript
// NEW: Analyze group scheduling complexity
async function analyzeGroupComplexity(attendees, attendeeProfiles) {
  // Calculate timezone span
  const timezones = [...new Set(attendeeProfiles.map(p => p.timezone))];
  const span = calculateTimezonSpan(timezones);
  
  // Calculate "workability" of best slot
  const bestSlot = await findBestSlot(attendees);
  const inWorkingHours = attendeeProfiles.filter(p =>
    isInWorkingHours(
      convertToTimezone(bestSlot, p.timezone),
      p.workingHours
    )
  ).length;
  
  const workabilityScore = inWorkingHours / attendeeProfiles.length;
  
  return {
    complexity: {
      timezoneSpan: span,
      numTimezones: timezones.length,
      worstCaseGap: `${calculateWorstGap(timezones)} hours`,
    },
    workability: {
      bestSlotScore: workabilityScore,
      percentInWorkingHours: Math.round(workabilityScore * 100),
      percentOutsideHours: Math.round((1 - workabilityScore) * 100),
    },
    recommendation: workabilityScore < 0.6 ? 'async' : 'sync',
  };
}

// If workability < 60%, suggest async
async function suggestAsyncAlternative(attendees, bestSyncSlot) {
  return {
    async: {
      format: 'Record live session + async follow-up',
      flow: [
        '1. Announce decision in Slack thread (async)',
        '2. Record synchronous session for those who can attend',
        '3. Upload recording + transcript (for async folks)',
        '4. Schedule 15-min async follow-up for outliers',
      ],
      benefits: ['Everyone gets context', 'No one forced into bad time', 'Flexible participation'],
      syncFallback: bestSyncSlot,
    },
  };
}
```

**File:** `piper/capabilities/meeting-booking/schedule-meeting.ts`

```typescript
// Updated response with group complexity
const complexity = await analyzeGroupComplexity(attendees, profiles);

if (complexity.workability.bestSlotScore < 0.6) {
  // Recommend async
  const asyncOption = await suggestAsyncAlternative(attendees, bestSlot);
  
  return {
    message: `Group scheduling challenge: ${complexity.complexity.numTimezones} timezones, ${complexity.complexity.worstCaseGap} hour span.

Best sync option: ${formatTime(bestSlot)}
- ${complexity.workability.percentInWorkingHours}% of attendees in working hours
- ${complexity.workability.percentOutsideHours}% outside working hours

Recommended: ASYNC-FIRST approach

${asyncOption.async.flow.map(s => `  ${s}`).join('\n')}

Why: Async ensures everyone can participate at their own time,
without forcing outlier timezones into bad times.

Sync fallback: ${formatTime(bestSlot)} (if group prefers live session)`,
  };
} else {
  // Sync is fine
  return {
    message: `Recommend ${formatTime(bestSlot)}.

Group scheduling: ${complexity.complexity.numTimezones} timezones
${profiles.map(p => `  - ${p.name} (${p.timezone}): ${convertToTimezone(bestSlot, p.timezone)}`).join('\n')}

All attendees in working hours. Good overlap found.`,
  };
}
```

### Expected Result

**Score:** 70% → 74% (+4 points, maintains >70%)

```
✓ Group Coordination: 40% → 75% (+35)
  Timezone complexity acknowledged
  Workability score calculated
  Async suggestion when score < 60%

Overall: 70% → 74% ✓ MAINTAINS TARGET
```

### Validation

After implementing:
```bash
node test-piper-meeting-booking.js
```

Look for:
- ✓ "Group scheduling challenge" language
- ✓ Timezone span shown
- ✓ Async suggested when score < 60%
- ✓ Sync fallback provided

---

## Final Result: 43% → 74% (9 Days)

### Summary of Changes

| Iteration | Focus | Changes | Effort | Result |
|-----------|-------|---------|--------|--------|
| 1 | Prompt Fix | System prompt + recommendation logic | 1 day | 43%→49% |
| 2 | Timezone | Attendee profiles + time table | 2 days | 49%→60% |
| 3 | Conflict | Full-week freeBusy + tradeoff | 3 days | 60%→70% ✓ |
| 4 | Group | Complexity analysis + async | 3 days | 70%→74% ✓ |

### Target Experience Achieved

✓ **General Target Experience**
- Crisp, decisive responses ("Recommend X")
- Clear reasoning (constraint analysis)
- Fast response (<2 seconds)

✓ **Meeting Booking Target Experience**
- Finds BEST slot (scored, not first)
- Handles 4+ people, multiple timezones
- Detects conflicts, finds alternatives
- Respects working hours
- Clear tradeoffs explained
- Async suggested when appropriate
- Judy's calendar cleared (she gains strategic time)

### How to Validate

1. **After each iteration:** Run `node test-piper-meeting-booking.js`
2. **Measure improvement:** Compare scores before/after
3. **Real validation:** Have Judy use improved Piper for actual meeting scheduling
4. **Track over time:** Commit test results to show progress

### Next: Start with Iteration 1

Ready to implement? Begin with the prompt fix (Day 1):
1. Update system prompt to lead with recommendation
2. Add scoring logic to ranking slots
3. Restructure response format
4. Run test: `node test-piper-meeting-booking.js`
5. Verify +30 point improvement

Then iterate through Iterations 2-4 for full ≥90% meeting booking experience.

---

## Running the Test

```bash
cd /tmp/simulated-world
node test-piper-meeting-booking.js
```

Output shows:
- Current scores for each dimension
- What to fix for each gap
- Estimated improvement per fix
- Expected scores after each iteration

Commit test results:
```bash
git log --oneline
# Shows iteration progress over time
```

---

## Success Metrics

✓ **Overall Score ≥70%** (after Iteration 3)  
✓ **All dimensions ≥50%** (after Iteration 2)  
✓ **Judy says "meeting scheduling is so much easier"** (real validation)  
✓ **All 4 scenarios pass ≥70%** (from PIPER_IMPROVEMENT_ROADMAP.md)

**Time to ≥70%:** 5 days (Iterations 1-3)  
**Time to ≥90%:** 8-9 days (All iterations + refinement)
