# SimulatedWorld Validation Framework
## How Accurate Are These Tests? How Do We Know?

**Date:** 2026-07-05  
**Status:** Test harness built. Now: VALIDATE before trusting for engineering decisions.

---

## The Core Question

We've measured Piper's capabilities with SimulatedWorld:
- Action extraction: 73%
- Meeting scheduling: 35%
- Email management: 31%
- etc.

**But how do we know these scores reflect reality?**

Answer: We don't. Not yet. We need validation.

---

## Validation Levels

### Level 0: No Validation (Current State)
✗ We've built the test harness
✗ We've run scenarios
✗ We have numbers
✗ **But we don't know if they're accurate**

**Risk:** We optimize for SimulatedWorld metrics that don't match real user experience.

### Level 1: Spot Check (1-2 Weeks)
Compare SimulatedWorld scores with:
- Real user testing
- Customer support tickets
- Actual Piper output on test scenarios

**Example:**
- SimulatedWorld says: Meeting scheduling 35%
- Real test: Give 5 users "schedule meeting with 3 people across timezones"
- Measure: Did they get working solution? Did they encounter timezone issues?
- Result: Validates or refutes the 35% score

### Level 2: Full Calibration (3-4 Weeks)
Run ALL 47 scenarios with:
- Real Piper (if possible)
- Real users (if possible)
- Capture actual outputs
- Compare to SimulatedWorld predictions

**This is the gold standard.**

### Level 3: Continuous Validation (Ongoing)
- Every feature ships
- Run SimulatedWorld
- Compare to real usage metrics
- Update simulation parameters based on reality

---

## How to Validate Quickly (This Week)

### 1. Spot-Check Action Extraction (Highest Priority)
**Why?** This is our #1 capability (73%). If it's wrong, everything else is suspect.

**Test:**
```
Real-world test:
1. Run an actual meeting (or use recording)
2. Ask Piper to extract actions
3. Compare to SimulatedWorld prediction
4. Score: Did Piper catch all actions? Implicit ones? Dependencies?

Example:
Meeting notes: "Bob will review API docs by Friday, then Charlie can finalize UI spec"

SimulatedWorld predicts: 90% (explicit extraction, 35% implicit)
Real Piper does: [what?]

Compare scores. If they match → validation success.
If they differ → understand why.
```

**Effort:** 2-3 hours  
**Confidence gain:** High (most important metric)

### 2. Spot-Check Meeting Scheduling (Second Priority)
**Why?** This is our most-tested capability (16 scenarios). If wrong, we've built a bad test suite.

**Test:**
```
Real-world test:
1. Give Piper: "Schedule meeting: Alice (ET), Bob (PT), Charlie (UK), all next week"
2. Capture what Piper suggests
3. Compare to SimulatedWorld prediction (35%)

SimulatedWorld says: Timezone blind, books outside working hours
Real Piper does: [what?]

Does real output match prediction?
```

**Effort:** 1 hour  
**Confidence gain:** Critical (validates whole test suite)

### 3. Spot-Check Task Sync (Worst Case)
**Why?** We predicted 0% (completely broken). Easy to validate.

**Test:**
```
Real-world test:
1. Create task in Todoist
2. Ask Piper to sync to Linear
3. Measure: Does it work? 0% or better?

SimulatedWorld predicts: 0% (broken)
Reality: 0% or 5% or 50%?

If reality = 0%, validation succeeds.
If reality > 0%, we underestimated Piper's capability.
```

**Effort:** 30 minutes  
**Confidence gain:** Medium (edge case)

---

## What Could Be Wrong?

### Scenario 1: SimulatedWorld Overestimates (Likely)
**Risk:** We built the test harness. It might be too generous.

**Example:** 
- SimulatedWorld: "Piper extracts explicit actions 90%"
- Reality: Piper actually gets 70% (misses implied actions, struggles with passive voice, etc.)

**How to detect:** Real user test vs SimulatedWorld
**Impact:** If true, Piper is worse than we think

### Scenario 2: SimulatedWorld Underestimates (Less Likely)
**Risk:** We might have missed Piper's capabilities.

**Example:**
- SimulatedWorld: "Task sync 0% (broken)"
- Reality: Piper has basic sync that works 40% of the time

**How to detect:** Real user test vs SimulatedWorld
**Impact:** If true, Piper is better than we think

### Scenario 3: Wrong Dimensions
**Risk:** We might be measuring the wrong things.

**Example:**
- SimulatedWorld measures: "Can Piper extract all action items?"
- Reality users care about: "Can Piper surface actions when I need them?"

**Two different metrics. SimulatedWorld might be 90% on extraction but users rate execution at 40%.**

**How to detect:** Ask real users what matters
**Impact:** If true, we optimize for wrong things

### Scenario 4: Context Loss
**Risk:** SimulatedWorld scenarios are too clean compared to real meetings.

**Example:**
- SimulatedWorld: "Clear meeting notes with explicit actions"
- Reality: "Rambling 90-minute meeting with sarcasm, jokes, context from 3 months ago"

**Real Piper might struggle more than our clean scenarios suggest.**

**How to detect:** Test with real, messy meeting recordings
**Impact:** If true, Piper is worse in production

---

## Validation Checklist

### This Week (Quick Validation)
- [ ] Test action extraction on 3 real meetings
  - Target: 90% explicit, 35% implicit
  - Actual: [measure]
  - Verdict: Match/underestimate/overestimate?

- [ ] Test meeting scheduling on 2 real scenarios
  - Target: 35% (timezone blind)
  - Actual: [measure]
  - Verdict: Match?

- [ ] Test task sync
  - Target: 0% (broken)
  - Actual: [measure]
  - Verdict: Match?

- [ ] Interview 3 power users
  - Ask: "What's Piper's #1 gap?"
  - Prediction: (from SimulatedWorld)
  - Compare: Do they match?

### Next 2 Weeks (Deeper Validation)
- [ ] Run 10 action extraction tests
  - Real meetings (not scripted)
  - Capture actual Piper output
  - Compare to SimulatedWorld prediction

- [ ] Run 5 meeting scheduling tests
  - Real attendees, real timezones
  - Actual calendar data
  - Measure quality

- [ ] Run 3 email management tests
  - Real inboxes
  - Real drafting scenarios
  - Actual output quality

- [ ] Run 2 task sync tests
  - Real Todoist/Linear accounts
  - Actual sync attempts
  - Does it work or not?

### Month 1 (Full Calibration)
- [ ] Run all 47 SimulatedWorld scenarios against real Piper
- [ ] Capture actual output for each
- [ ] Compare scores: prediction vs reality
- [ ] Update simulation parameters based on findings
- [ ] Publish calibration report

---

## Confidence Levels (Current)

Based on how testable / obvious each capability is:

### HIGH Confidence (85%+)
- Action extraction explicit: 90% (straightforward pattern matching)
- Task sync: 0% (either works or doesn't)
- Collaboration: 0% (either works or doesn't)

**Why?** These are binary or near-binary. Easy to validate.

### MEDIUM Confidence (60-70%)
- Meeting scheduling: 35% (depends on definition of "works")
- Email drafting: 38% (quality is subjective)
- Email organization: 23% (scale matters)

**Why?** Depend on how you measure "works". Validation needed.

### LOW Confidence (30-50%)
- Action execution surface: 40% (very subjective)
- Implicit extraction: 35% (what counts as "implicit"?)
- Slack context: 18% (depends on scenario)

**Why?** Highly subjective. Big range of possible real values.

### UNKNOWN Confidence (<20%)
- Data synthesis insights: 8% (completely speculative)
- Document collaboration: 0% (assumed broken without testing)

**Why?** Didn't test deeply, just extrapolated.

---

## Success Criteria for Validation

### PASS (High Confidence)
If real Piper output matches SimulatedWorld prediction within ±10%:
- Prediction: 90% → Reality: 85-95% ✓
- Prediction: 35% → Reality: 30-40% ✓
- Prediction: 0% → Reality: 0-5% ✓

**Implication:** Test harness is accurate. Use for engineering decisions.

### BORDERLINE (Medium Confidence)
If real Piper output differs by 10-25%:
- Prediction: 90% → Reality: 70-80% ⚠
- Prediction: 35% → Reality: 20-50% ⚠

**Implication:** Test harness is roughly right direction but need calibration.

### FAIL (Low Confidence)
If real Piper output differs by >25%:
- Prediction: 90% → Reality: 50% ✗
- Prediction: 0% → Reality: 40% ✗

**Implication:** Test harness is wrong. Don't trust it. Rebuild.

---

## How to Actually Validate

### Option A: Manual Testing (3-4 days, free)
1. Create 5-10 realistic scenarios
2. Run against real Piper
3. Capture actual output
4. Score manually: "Did it work?"
5. Compare to SimulatedWorld prediction

**Pros:** Free, fast, direct
**Cons:** Small sample size, subjective scoring, single tester bias

### Option B: User Testing (1-2 weeks, 5K+ cost)
1. Recruit 10-20 users
2. Give them real tasks
3. Measure: Success rate, time, satisfaction
4. Compare to SimulatedWorld metrics
5. Statistical analysis

**Pros:** Real data, statistical significance
**Cons:** Expensive, time-consuming, requires ethics review

### Option C: Hybrid (1 week, $1-2K)
1. 3 days manual testing by you + 1 engineer
2. 2 days user interviews (5-10 power users)
3. Ask: "What's Piper's #1 gap?" + "How often do you hit it?"
4. Compare to our top-5 gaps
5. Quick confidence assessment

**Pros:** Affordable, fast, good signal
**Cons:** Not statistically rigorous

---

## What We Should Do

### Minimum (This Week)
Spend 4 hours on quick spot-checks:
1. Test action extraction on 2 real meetings
2. Test meeting scheduling on 1 real scenario
3. Interview 3 power users about gaps
4. Report: "SimulatedWorld predictions ✓/✗"

**Cost:** 4 hours  
**Confidence gain:** Medium (enough to proceed cautiously)

### Recommended (Next 2 Weeks)
Spend 1-2 days on deeper validation:
1. Run 10 action extraction tests (real meetings)
2. Run 5 meeting scheduling tests (real scenario)
3. Run 3 email management tests (real inbox)
4. Publish validation report with confidence levels

**Cost:** 1-2 days  
**Confidence gain:** High (enough to trust scores)

### Ideal (Month 1)
Full calibration against real Piper:
1. Run all 47 scenarios
2. Capture real output
3. Update simulation parameters
4. Publish detailed calibration report

**Cost:** 3-4 days + 1 engineer  
**Confidence gain:** Very High (production-ready)

---

## Risks of Skipping Validation

### Risk 1: Optimize for Wrong Metrics
We implement "Action execution surface" (40% → 85%) because SimulatedWorld says it's critical.
But real users care about "Email organization" instead.
Result: We ship wrong feature.

**Probability:** Medium (35%)

### Risk 2: Overestimate Capability
SimulatedWorld says "Action extraction 90%"
Reality is "Action extraction 65%" (Piper misses passive voice, implied tasks)
Result: We think problem is solved when it's not.

**Probability:** Medium (40%)

### Risk 3: Miss Quick Wins
SimulatedWorld says "Task sync 0%"
Reality is "Task sync 30%" (works for basic cases)
Result: We don't invest in feature that's actually half-working.

**Probability:** Low (20%)

### Risk 4: Credibility Damage
We ship feature based on SimulatedWorld
Real users find it doesn't match our claims
Result: Loss of trust.

**Probability:** Medium-High (50%) if no validation

---

## Recommendation

### For Next Sprint
1. **Do quick validation** (4 hours this week)
   - Spot-check top 3 capabilities
   - Interview 3 users
   - Report confidence levels

2. **Adjust messaging**
   - If validation passes: "SimulatedWorld validated, high confidence"
   - If validation fails: "SimulatedWorld is direction-only, not precise"
   - If mixed: "High confidence on X, medium on Y, low on Z"

3. **Plan deeper validation**
   - Schedule 2-3 days next sprint
   - Focus on top priorities
   - Publish calibration results

### For Engineering Decisions
- **Don't trust:** Absolute percentages (90%, 35%, 8%)
- **Do trust:** Relative rankings (extraction > scheduling > synthesis)
- **Do trust:** Direction (timezone blindness exists)
- **Don't trust:** Exact impact of fixes ("+35% improvement" might be ±10%)

### Bottom Line
SimulatedWorld is a **direction indicator, not a precision instrument.**

It tells us "Action extraction is good, data synthesis is bad."
It doesn't tell us "exactly how good/bad."

Validate before betting the company on it.

---

## Next Steps

1. **This week:** Run quick spot-checks (4 hours)
2. **Next sprint:** Deeper validation (1-2 days)
3. **Month 1:** Full calibration (if warranted)
4. **Going forward:** Continuous validation as we ship

Don't let perfect be the enemy of good. But don't skip validation entirely either.

---

**Current Status:** Test harness built. Validation pending.

**Confidence Level:** Medium (60%). Use for direction, not precision.

**Next Action:** Quick spot-check this week.
