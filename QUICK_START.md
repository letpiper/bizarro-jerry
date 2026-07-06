# SimulatedWorld Quick Start Guide

## What Is SimulatedWorld?

A **deterministic test harness** that:
- Creates realistic scenarios (users, calendars, events)
- Runs code against simulated APIs
- Captures traces and mutations
- Evaluates against quality rubrics
- Measures improvements quantitatively

## Running the Demos

### 1. Baseline Test (Current Piper Implementation)
```bash
cd /tmp/simulated-world
node meeting-scheduler-demo.js
```

**Output:**
- Overall score: 78.8% (PASSED)
- Breakdown by dimension
- Identified gaps and recommendations
- JSON export with metrics

### 2. Improvement Demo (After Implementing Fixes)
```bash
node iterative-improvement-demo.js
```

**Output:**
- Improved score: 90.0%
- +11.2% improvement
- Shows before/after comparison
- 3 alternatives provided

### 3. View Results
```bash
# Baseline execution
cat test-results.json

# Improvement comparison
cat improvement-comparison.json
```

## The Scenario: Cross-Timezone Meeting Scheduling

**Participants:**
- Alice (ET): 9 AM - 5 PM America/New_York
- Bob (PT): 9 AM - 5 PM America/Los_Angeles
- Charlie (UK): 9 AM - 5 PM Europe/London

**Goal:** Schedule 1-hour meeting for all 3 next week

**Challenge:** Zero actual overlap in working hours

## Key Results

### Baseline (Current)
```
Overall:                78.8% ✓ PASSED
├─ Availability:        75.0%
├─ Meeting Creation:   100.0%
└─ Target Experience:   61.5%

Identified Gaps:
1. No working-hours awareness
2. No alternative suggestions
3. No conflict detection
4. No buffer time
5. No attendee weighting
```

### Improved (After Fix)
```
Overall:                90.0% ✓ PASSED (+11.2%)
├─ Availability:        80.0%
├─ Conflict Resolution: 100.0% (NEW)
└─ Target Experience:   90.0%

Improvements:
✓ Working-hours detection
✓ 3 alternative times generated
✓ Conflict detection (1 detected)
✓ Resolution strategy provided
```

## How It Works

### 1. Setup
```javascript
// Create world with users and integrations
const world = new SimulatedWorld(organization)
const calendar = new CalendarIntegration(world)
const slack = new SlackIntegration(world)

// Add users
org.users.set(user.id, user)

// Create calendars and events
calendar.createCalendar(user.email)
calendar.addEvent(user.email, summary, start, end)
```

### 2. Execute
```javascript
// Create action (what Piper would do)
const action = {
  name: 'Schedule meeting',
  async execute(httpClient) {
    // Fetch calendars
    const alice = await httpClient.get('calendar/alice@example.com')
    const bob = await httpClient.get('calendar/bob@example.com')
    
    // Create event
    const event = await httpClient.post('calendar/events', { ... })
    
    // Send notification
    await httpClient.post('slack/messages', { ... })
    
    return { eventCreated: true, ... }
  }
}

// Run it
const runner = new ScenarioRunner(world)
const result = await runner.executeAction(action)
```

### 3. Evaluate
```javascript
// Define rubric
const rubric = new EvaluationRubric()
rubric.addTarget({
  name: 'Target Experience',
  criteria: [
    {
      name: 'Timezone awareness',
      weight: 35,
      evaluate: (result) => { /* score 0-100 */ }
    }
  ]
})

// Evaluate result
const score = rubric.evaluate(result)
// Returns: { overall: 78.8, byTarget: {...}, passed: true }
```

### 4. Observe
```javascript
// Get all mutations
const mutations = world.getMutations()
// [
//   { timestamp, type: 'event_created', resource: 'calendar', ... },
//   { timestamp, type: 'message_sent', resource: 'slack', ... }
// ]

// Get all traces
const traces = world.getTraces()
// [
//   { request: GET /calendar/..., response: {...}, duration: 5ms },
//   { request: POST /calendar/events, response: {...}, duration: 3ms }
// ]
```

## Extending SimulatedWorld

### Add New Scenario
```javascript
// Create new scenario file
function createMyScenario(attendees, baseDate) {
  return {
    name: 'My scenario',
    async execute(httpClient) {
      // Your test logic here
      return { success: true, ... }
    }
  }
}

// Run it
const runner = new ScenarioRunner(world)
const result = await runner.executeAction(createMyScenario(...))
```

### Add New Evaluation Criteria
```javascript
rubric.addTarget({
  name: 'New dimension',
  criteria: [
    {
      name: 'New criterion',
      weight: 25,
      evaluate: (result) => {
        // Analyze result
        return score // 0-100
      }
    }
  ]
})
```

### Add New Integration
```javascript
class MyIntegration extends BaseIntegration {
  async handle(request) {
    if (request.url.includes('/my-api')) {
      return { status: 200, body: {...} }
    }
  }
  
  recordMutation(type, data) {
    this.world.recordMutation({
      type, integration: 'my-api', data
    })
  }
}

world.registerIntegration('my-api', new MyIntegration(world))
```

## Architecture

```
SimulatedWorld (Main)
  ├── TimeEngine (deterministic clock)
  ├── EventBus (event dispatch)
  ├── HTTPInterceptor (routes API calls)
  ├── MutationLog (data change tracking)
  ├── Tracer (request/response logging)
  └── Integrations
      ├── CalendarIntegration
      ├── SlackIntegration
      ├── GmailIntegration
      ├── LinearIntegration
      └── ... (10+ others)
```

## FAQ

**Q: Why SimulatedWorld instead of mocking?**
A: Mocks are fragile. SimulatedWorld captures full traces, enables complex scenarios, and provides evaluation metrics. It's deterministic, reproducible, and automatically tracks regressions.

**Q: Can I use real APIs?**
A: The harness is designed for simulation. Using real APIs defeats the purpose (non-deterministic, slow, expensive). But you can hook up real responses if needed.

**Q: How do I add my own metrics?**
A: Create a custom rubric with your criteria. Each criterion is a function that scores 0-100. Weight them by importance.

**Q: How fast does it run?**
A: Instantaneous (0ms shown in demo). No network calls, deterministic time. Run 1000 scenarios in seconds.

**Q: Can I run this in CI?**
A: Yes! The output is JSON. Fail the build if score drops below threshold.

**Q: How do I prevent regressions?**
A: Run the same scenarios after every code change. If score drops, someone broke something. Immediate feedback.

## Example: Full Workflow

```bash
# 1. Run baseline
node meeting-scheduler-demo.js
# → test-results.json shows 78.8%

# 2. Implement fix for Gap #1
# (edit Piper code to add working-hours awareness)

# 3. Run improvement demo
node iterative-improvement-demo.js
# → improvement-comparison.json shows 90.0% (+11.2%)

# 4. Add more scenarios
# (create hard_cases.js with edge cases)

# 5. Run all scenarios in CI
# (verify no regressions)

# 6. Track over time
# (dashboard showing score trends)
```

## Files

- `meeting-scheduler-demo.js` - Baseline test with current implementation
- `iterative-improvement-demo.js` - Shows improvement from fixing Gap #1
- `test-results.json` - Baseline execution metrics
- `improvement-comparison.json` - Before/after comparison
- `src/` - Full source code for SimulatedWorld
- `dist/` - Compiled JavaScript (ready to use)

## Next Steps

1. Run the demos: `node meeting-scheduler-demo.js`
2. Review results in `test-results.json`
3. Implement Gap #1 (working-hours awareness)
4. Run improvement demo: `node iterative-improvement-demo.js`
5. See score improve to 90.0%
6. Add more scenarios for your use cases
7. Integrate into CI/CD

---

**TL;DR:** SimulatedWorld turns vague "we need better meeting scheduling" into specific, measurable improvements. Run the demo, see it work, implement fixes, watch scores improve.
