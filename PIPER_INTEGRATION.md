# Piper Integration Guide

## Overview

This guide explains how to use SimulatedWorld to test Piper's meeting scheduling capabilities. The simulator creates realistic Calendar, Slack, and Gmail state, allowing you to verify Piper's scheduling decisions without hitting real APIs.

## What is SimulatedWorld?

SimulatedWorld is a test harness that:

- **Simulates HTTP endpoints** that Piper calls (Google Calendar, Slack, Gmail, etc.)
- **Tracks mutations** (events created, messages posted, etc.)
- **Records traces** of all Piper's HTTP requests and responses
- **Evaluates performance** against configurable rubrics
- **Supports multi-turn conversations** to test complex flows

## How Piper Uses This Simulator

### 1. Inject SimulatedHTTPClient Instead of Real HTTP

Instead of making real HTTP calls, Piper uses `SimulatedHTTPClient`:

```typescript
import { SimulatedWorld, SimulatedHTTPClient } from '@ada/simulated-world';

// Create simulated world with test data
const org = createTestOrganization();
const world = new SimulatedWorld(org);

// Register integrations
world.registerIntegration('calendar', new CalendarIntegration(world));
world.registerIntegration('slack', new SlackIntegration(world));

// Create HTTP client that Piper will use
const httpClient = new SimulatedHTTPClient(world);

// Pass to Piper instead of real HTTP client
const result = await piperMeetingScheduler.schedule({
  attendees: ['alice@ada.support', 'bob@ada.support'],
  duration: 60,
  httpClient, // <- Piper uses this instead of real HTTP
});
```

### 2. Run Piper Against a Scenario

```typescript
import { ScenarioRunner } from '@ada/simulated-world';

const runner = new ScenarioRunner(world);

// Define what Piper should do
const action = {
  name: 'Book 1-on-1 meeting',
  async execute(httpClient: SimulatedHTTPClient) {
    // Piper's actual logic here
    // Uses httpClient.get(), httpClient.post(), etc.
    // All calls are intercepted by SimulatedWorld
  },
};

// Execute and capture results
const result = await runner.executeAction(action);
```

### 3. Evaluate Results Using Rubric

```typescript
import { EvaluationRubric } from '@ada/simulated-world';

const rubric = new EvaluationRubric();

rubric.addTarget({
  name: 'Availability Detection',
  description: 'Can Piper accurately detect attendee availability',
  criteria: [
    {
      name: 'Detects available slots',
      weight: 50,
      evaluate: (result) => result.success ? 100 : 0,
    },
    {
      name: 'Response time < 2s',
      weight: 50,
      evaluate: (result) => result.duration < 2000 ? 100 : 50,
    },
  ],
});

const score = rubric.evaluate(result);
console.log(`Overall Score: ${score.overall}%`);
console.log(`Passed: ${score.passed}`); // true if >= 70%
```

## Available Scenarios

### 1. Basic 1-on-1 Meeting (`meeting-booking-basic.ts`)

**What it tests:**
- Can Piper find a free slot for 2 people?
- Correct timezone conversion (ET vs PT)?
- Event creation in both calendars?

**Setup:**
- Alice (ET, 9 AM - 5 PM)
- Bob (PT, 9 AM - 5 PM)
- Both calendars clear

**Success Criteria:**
- Finds available 1-hour slot
- Slot works in both timezones
- Creates meeting in both calendars
- Response time < 2s

**Key Metrics:**
- Availability Detection: 70%
- Timezone Handling: 100%
- Calendar Operations: 100%

### 2. Group Meeting with 4+ People Across Timezones (`meeting-booking-group.ts`)

**What it tests:**
- Can Piper coordinate 4+ people across US, UK, and India?
- Recognizes when no good slot exists?
- Offers tradeoff analysis?

**Setup:**
- Alice (ET, 9 AM - 5 PM)
- Bob (PT, 9 AM - 5 PM)
- Charlie (UK, 9 AM - 5 PM)
- Diana (India, 9:30 AM - 5:30 PM)
- Pre-populated calendar conflicts

**Success Criteria:**
- Identifies workable slot (1-2 PM UTC is optimal)
- Explains tradeoffs (who's at odd hours)
- Offers async alternative if sync is suboptimal
- Provides clear time conversions

**Key Metrics:**
- Multi-timezone Coordination: 80%
- Working Hours Respect: 90%
- Group Size Handling: 100%
- Alternative Suggestions: 85%

### 3. Conflict Resolution (`meeting-booking-conflict-resolution.ts`)

**What it tests:**
- Can Piper detect conflicts at preferred time?
- Does it search for alternatives?
- Does it communicate the change?

**Setup:**
- Alice has client call at 2 PM ET
- Bob and Charlie are free
- Meeting requested for 2 PM (conflicts with Alice)

**Success Criteria:**
- Detects Alice's conflict at 2 PM
- Checks 3 PM - all clear
- Suggests 3 PM with explanation
- Posts Slack notification if rescheduled
- Creates meeting at 3 PM

**Key Metrics:**
- Conflict Detection: 100%
- Alternative Finding: 85%
- Communication: 90%
- Calendar Operations: 100%

### 4. Timezone Edge Cases (`meeting-booking-timezone-edge-cases.ts`)

**What it tests:**
- Meetings spanning midnight across timezones
- Date boundary handling
- Complex timezone math (PT, JST, NZST)
- Working hours at extreme times

**Setup:**
- Alice (PT: 9 AM - 5 PM)
- Bob (JST: 10 AM - 6 PM next day)
- Diana (NZST: 9 AM - 5 PM next day)

**Success Criteria:**
- Correctly identifies overlap: PT 4-5 PM = JST 9-10 AM (next day) = NZST 12-1 PM (next day)
- Explains date boundary crossing
- Documents edge cases
- Provides clear conversions

**Key Metrics:**
- Date Boundary Handling: 100%
- Timezone Conversion Accuracy: 95%
- Edge Case Documentation: 90%
- Working Hours Respect: 85%

## Running Scenarios

### Run a Single Scenario

```bash
# Run basic 1-on-1 scenario
npx ts-node examples/meeting-booking-basic.ts

# Run group meeting scenario
npx ts-node examples/meeting-booking-group.ts

# Run conflict resolution scenario
npx ts-node examples/meeting-booking-conflict-resolution.ts

# Run timezone edge cases scenario
npx ts-node examples/meeting-booking-timezone-edge-cases.ts
```

### Run All Scenarios

```bash
npx ts-node examples/run-all-scenarios.ts
```

### Expected Output

```
=== Basic 1-on-1 Meeting Booking ===

Action: Book 1-on-1 meeting
Status: SUCCESS
Duration: 245ms
Mutations: 2

Evaluation Score:
  Overall: 95.0%
  Availability Detection: 100.0%
  Timezone Handling: 100.0%
  Calendar Operations: 90.0%
  Passed: YES

Calendar State:
  Alice's events: 1
  Bob's events: 1
```

## Key Metrics for Meeting Scheduling Success

### 1. Availability Detection
- **Criteria:** Can find open time slots accurately
- **Measurement:** Free/busy queries return correct data
- **Target:** >= 90%

### 2. Timezone Handling
- **Criteria:** Correctly converts between timezones
- **Measurement:** All attendees see correct local times
- **Target:** >= 95%

### 3. Conflict Detection
- **Criteria:** Identifies conflicts at proposed times
- **Measurement:** Suggests alternatives when conflicts exist
- **Target:** >= 85%

### 4. Working Hours Respect
- **Criteria:** Suggests times within working hour preferences
- **Measurement:** Explains when suggesting outside hours
- **Target:** >= 80%

### 5. Communication
- **Criteria:** Notifies attendees of changes
- **Measurement:** Posts Slack messages for reschedules
- **Target:** >= 80%

### 6. Performance
- **Criteria:** Responds quickly (under 2 seconds)
- **Measurement:** HTTP request latency
- **Target:** < 2000ms

## Evaluating Piper's Responses

### What to Look For

#### Good Signs
- Detects all conflicts before suggesting time
- Explains tradeoffs clearly ("Bob would be very early at 5 AM")
- Offers alternatives when primary slot has issues
- Provides time conversions for all attendees
- Creates events in all attendee calendars
- Posts notifications in Slack

#### Gaps to Address

**Gap: Doesn't explain tradeoffs**
```
❌ Bad: Suggests 6 AM PT without mentioning it's outside working hours
✓ Good: Suggests 6 AM PT but notes "This is 30 min before Bob's working hours"
```

**Gap: Doesn't handle group scheduling**
```
❌ Bad: Only checks 1 person's calendar
✓ Good: Checks all attendees, identifies no common slot, offers async
```

**Gap: Timezone math errors**
```
❌ Bad: Says 2 PM ET = 3 PM PT (off by 3 hours)
✓ Good: Says 2 PM ET = 11 AM PT, shows UTC time
```

**Gap: Doesn't resolve conflicts**
```
❌ Bad: Suggests time with conflict, doesn't search alternatives
✓ Good: Detects conflict, suggests 3 next alternatives
```

## Integration Checklist

- [ ] Piper can call `/calendar/v3/freeBusy` and get accurate responses
- [ ] Piper correctly parses busy time blocks
- [ ] Piper can create events via `/calendar/v3/calendars/primary/events`
- [ ] Piper can post to Slack via `/api/chat.postMessage`
- [ ] Piper handles timezone conversions correctly
- [ ] Piper suggests alternatives when conflicts exist
- [ ] Piper respects user working hour preferences
- [ ] Piper explains tradeoffs in natural language
- [ ] Piper scores >= 70% on all scenarios

## Next Steps

1. **Run the scenarios** to establish a baseline
2. **Review the gaps** - identify which capabilities need work
3. **Implement fixes** in Piper based on findings
4. **Re-run scenarios** to verify improvements
5. **Add custom scenarios** for Ada-specific workflows

## Custom Scenarios

To create your own scenario:

```typescript
import { ScenarioBuilder, SimulatedHTTPClient, EvaluationRubric } from '@ada/simulated-world';

// 1. Create organization
const org = {
  id: 'org-custom',
  name: 'Custom Test',
  domain: 'test.ada.support',
  timezone: 'America/New_York',
  users: new Map(),
  teams: new Map(),
  integrations: new Map(),
  settings: { ssoEnabled: false },
};

// 2. Create builder and add users/integrations
const builder = new ScenarioBuilder(org);
// ... add users, calendars, etc.

// 3. Define action
const action = {
  name: 'My custom action',
  async execute(httpClient: SimulatedHTTPClient) {
    // Piper's logic here
  },
};

// 4. Create rubric
const rubric = new EvaluationRubric();
rubric.addTarget({
  name: 'My target',
  description: 'What I want to measure',
  criteria: [
    {
      name: 'Criterion 1',
      weight: 50,
      evaluate: (result) => result.success ? 100 : 0,
    },
  ],
});

// 5. Run and evaluate
const runner = new ScenarioRunner(builder.getWorld());
const result = await runner.executeAction(action);
const score = rubric.evaluate(result);
```

## Troubleshooting

### Calendar endpoints return 404

Make sure you registered the integration:
```typescript
const calendar = new CalendarIntegration(world);
world.registerIntegration('calendar', calendar);
```

### Events not appearing in calendar

1. Check the email is correct in free/busy request
2. Verify the event was created with correct email
3. Use `calendar.getEvents(email)` to inspect state

### Timezone conversions wrong

- Verify you're using IANA timezone names (e.g., `America/New_York` not `EST`)
- Check if DST boundaries might be involved
- Test with explicit ISO timestamps

### Slack notifications not posting

- Ensure Slack integration is registered
- Channel ID must exist (e.g., `C001`)
- Check message payload format

## Performance Expectations

- Basic 1-on-1: 200-400ms
- Group meeting (4 people): 400-800ms
- Conflict resolution: 300-600ms
- Timezone edge cases: 500-900ms

If Piper is slower, check:
- Number of free/busy queries (batch when possible)
- How many alternative slots are being checked
- If unnecessary API calls are being made
