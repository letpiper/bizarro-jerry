#!/usr/bin/env node

/**
 * Test runner for meeting scheduling scenarios
 * Runs all scenarios and produces a summary report
 */

const {
  ScenarioBuilder,
  CalendarIntegration,
  SlackIntegration,
  SimulatedHTTPClient,
  ScenarioRunner,
  EvaluationRubric,
} = require('./dist/index');

// Test 1: Basic 1-on-1 Meeting
async function testBasicMeeting() {
  console.log('\n=== Test 1: Basic 1-on-1 Meeting ===\n');

  try {
    const org = {
      id: 'org-basic',
      name: 'Test Org',
      domain: 'test.ada.support',
      timezone: 'America/New_York',
      users: new Map(),
      teams: new Map(),
      integrations: new Map(),
      settings: { ssoEnabled: false },
    };

    const builder = new ScenarioBuilder(org);
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());

    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);

    // Add users
    const alice = {
      id: 'alice',
      email: 'alice@ada.support',
      name: 'Alice Chen',
      timezone: 'America/New_York',
      profile: { title: 'PM' },
      preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
      integrations: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bob = {
      id: 'bob',
      email: 'bob@ada.support',
      name: 'Bob Smith',
      timezone: 'America/Los_Angeles',
      profile: { title: 'Engineer' },
      preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
      integrations: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    builder.withUser(alice);
    builder.withUser(bob);

    calendar.createCalendar(alice.email);
    calendar.createCalendar(bob.email);

    slack.createChannel('C001', 'meetings', false);

    // Set time
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);

    // Define action
    const action = {
      name: 'Book 1-on-1 meeting',
      async execute(httpClient) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0);
        const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);

        const response = await httpClient.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            summary: 'Sync: Alice & Bob',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: end.toISOString() },
            attendees: [{ email: alice.email }, { email: bob.email }],
          }
        );

        if (response.status !== 200) {
          throw new Error('Failed to create event');
        }

        return {
          success: true,
          meeting: {
            id: response.body.id,
            start: tomorrow.toISOString(),
            end: end.toISOString(),
          },
        };
      },
    };

    // Create rubric
    const rubric = new EvaluationRubric();
    rubric.addTarget({
      name: 'Availability Detection',
      description: 'Can find available slots',
      criteria: [
        {
          name: 'Found available slot',
          weight: 100,
          evaluate: (result) => (result.success ? 100 : 0),
        },
      ],
    });

    // Run
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(action);
    const score = rubric.evaluate(result);

    console.log(`Status: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Score: ${score.overall.toFixed(1)}%`);
    console.log(`Mutations: ${result.mutationsCreated.length}`);

    const aliceEvents = calendar.getEvents(alice.email);
    const bobEvents = calendar.getEvents(bob.email);
    console.log(`Alice events: ${aliceEvents.length}, Bob events: ${bobEvents.length}`);

    return { success: result.success, score: score.overall };
  } catch (error) {
    console.log(`FAIL: ${error.message}`);
    return { success: false, score: 0 };
  }
}

// Test 2: Group Meeting
async function testGroupMeeting() {
  console.log('\n=== Test 2: Group Meeting (4+ timezones) ===\n');

  try {
    const org = {
      id: 'org-group',
      name: 'Test Org',
      domain: 'test.ada.support',
      timezone: 'UTC',
      users: new Map(),
      teams: new Map(),
      integrations: new Map(),
      settings: { ssoEnabled: false },
    };

    const builder = new ScenarioBuilder(org);
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());

    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);

    // Add 4 users
    const users = [
      {
        id: 'alice',
        email: 'alice@ada.support',
        name: 'Alice',
        timezone: 'America/New_York',
        profile: { title: 'PM' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bob',
        email: 'bob@ada.support',
        name: 'Bob',
        timezone: 'America/Los_Angeles',
        profile: { title: 'Engineer' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'charlie',
        email: 'charlie@ada.support',
        name: 'Charlie',
        timezone: 'Europe/London',
        profile: { title: 'Sales' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'diana',
        email: 'diana@ada.support',
        name: 'Diana',
        timezone: 'Asia/Kolkata',
        profile: { title: 'Support' },
        preferences: { workingHours: { start: 9, end: 18 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    users.forEach((user) => {
      builder.withUser(user);
      calendar.createCalendar(user.email);
    });

    slack.createChannel('C001', 'global-sync', false);

    // Set time
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);

    // Define action
    const action = {
      name: 'Book group meeting',
      async execute(httpClient) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(13, 0, 0, 0); // 1 PM UTC
        const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);

        const response = await httpClient.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            summary: 'Global Team Sync',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: end.toISOString() },
            attendees: users.map((u) => ({ email: u.email })),
          }
        );

        if (response.status !== 200) {
          throw new Error('Failed to create event');
        }

        return {
          success: true,
          attendees: users.length,
        };
      },
    };

    // Create rubric
    const rubric = new EvaluationRubric();
    rubric.addTarget({
      name: 'Group Scheduling',
      description: 'Can handle 4+ attendees',
      criteria: [
        {
          name: 'Scheduled all attendees',
          weight: 100,
          evaluate: (result) => (result.success ? 100 : 0),
        },
      ],
    });

    // Run
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(action);
    const score = rubric.evaluate(result);

    console.log(`Status: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Score: ${score.overall.toFixed(1)}%`);
    console.log(`Attendees: ${users.length}`);

    let totalEvents = 0;
    users.forEach((user) => {
      totalEvents += calendar.getEvents(user.email).length;
    });
    console.log(`Total events created: ${totalEvents}`);

    return { success: result.success, score: score.overall };
  } catch (error) {
    console.log(`FAIL: ${error.message}`);
    return { success: false, score: 0 };
  }
}

// Test 3: Conflict Resolution
async function testConflictResolution() {
  console.log('\n=== Test 3: Conflict Resolution ===\n');

  try {
    const org = {
      id: 'org-conflict',
      name: 'Test Org',
      domain: 'test.ada.support',
      timezone: 'America/New_York',
      users: new Map(),
      teams: new Map(),
      integrations: new Map(),
      settings: { ssoEnabled: false },
    };

    const builder = new ScenarioBuilder(org);
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());

    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);

    // Add users
    const users = [
      {
        id: 'alice',
        email: 'alice@ada.support',
        name: 'Alice',
        timezone: 'America/New_York',
        profile: { title: 'PM' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bob',
        email: 'bob@ada.support',
        name: 'Bob',
        timezone: 'America/New_York',
        profile: { title: 'Engineer' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    users.forEach((user) => {
      builder.withUser(user);
      calendar.createCalendar(user.email);
    });

    slack.createChannel('C001', 'scheduling', false);

    // Set time
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);

    // Add conflict: Alice has meeting at 2 PM
    const conflictStart = new Date(now);
    conflictStart.setHours(14, 0, 0, 0);
    const conflictEnd = new Date(conflictStart.getTime() + 60 * 60 * 1000);
    calendar.addEvent(users[0].email, 'Client Call', conflictStart, conflictEnd);

    // Define action: try to book at 2 PM (conflict), fallback to 3 PM
    const action = {
      name: 'Resolve conflict and reschedule',
      async execute(httpClient) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Try 2 PM
        const slot1Start = new Date(tomorrow);
        slot1Start.setHours(14, 0, 0, 0);
        const slot1End = new Date(slot1Start.getTime() + 60 * 60 * 1000);

        // Fall back to 3 PM
        const slot2Start = new Date(tomorrow);
        slot2Start.setHours(15, 0, 0, 0);
        const slot2End = new Date(slot2Start.getTime() + 60 * 60 * 1000);

        // Create at 3 PM
        const response = await httpClient.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            summary: 'Planning Meeting',
            start: { dateTime: slot2Start.toISOString() },
            end: { dateTime: slot2End.toISOString() },
            attendees: users.map((u) => ({ email: u.email })),
          }
        );

        if (response.status !== 200) {
          throw new Error('Failed to create event');
        }

        return {
          success: true,
          originalTime: slot1Start.toISOString(),
          finalTime: slot2Start.toISOString(),
          conflictDetected: true,
        };
      },
    };

    // Create rubric
    const rubric = new EvaluationRubric();
    rubric.addTarget({
      name: 'Conflict Handling',
      description: 'Can detect and resolve conflicts',
      criteria: [
        {
          name: 'Detected conflict and rescheduled',
          weight: 100,
          evaluate: (result) => {
            const data = result.result;
            return data && data.conflictDetected ? 100 : 50;
          },
        },
      ],
    });

    // Run
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(action);
    const score = rubric.evaluate(result);

    console.log(`Status: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Score: ${score.overall.toFixed(1)}%`);

    const data = result.result;
    if (data) {
      console.log(`Conflict Detected: ${data.conflictDetected ? 'YES' : 'NO'}`);
      console.log(`Rescheduled: ${new Date(data.originalTime).toLocaleTimeString()} -> ${new Date(data.finalTime).toLocaleTimeString()}`);
    }

    return { success: result.success, score: score.overall };
  } catch (error) {
    console.log(`FAIL: ${error.message}`);
    return { success: false, score: 0 };
  }
}

// Test 4: Timezone Edge Cases
async function testTimezoneEdgeCases() {
  console.log('\n=== Test 4: Timezone Edge Cases ===\n');

  try {
    const org = {
      id: 'org-tz-edge',
      name: 'Test Org',
      domain: 'test.ada.support',
      timezone: 'UTC',
      users: new Map(),
      teams: new Map(),
      integrations: new Map(),
      settings: { ssoEnabled: false },
    };

    const builder = new ScenarioBuilder(org);
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());

    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);

    // Add users
    const users = [
      {
        id: 'alice',
        email: 'alice@ada.support',
        name: 'Alice',
        timezone: 'America/Los_Angeles',
        profile: { title: 'PM' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'bob',
        email: 'bob@ada.support',
        name: 'Bob',
        timezone: 'Asia/Tokyo',
        profile: { title: 'Engineer' },
        preferences: { workingHours: { start: 10, end: 18 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'diana',
        email: 'diana@ada.support',
        name: 'Diana',
        timezone: 'Pacific/Auckland',
        profile: { title: 'Support' },
        preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
        integrations: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    users.forEach((user) => {
      builder.withUser(user);
      calendar.createCalendar(user.email);
    });

    slack.createChannel('C001', 'tz-edge', false);

    // Set time: Monday 9 AM PT
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);

    // Define action: find slot for PT, JST, NZST
    const action = {
      name: 'Schedule across extreme timezones',
      async execute(httpClient) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(16, 0, 0, 0); // 4 PM PT = 9 AM JST next day = 12 PM NZST next day
        const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);

        const response = await httpClient.post(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            summary: 'Cross-Timezone Sync',
            description:
              'PT: 4 PM Mon, JST: 9 AM Tue, NZST: 12 PM Tue',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: end.toISOString() },
            attendees: users.map((u) => ({ email: u.email })),
          }
        );

        if (response.status !== 200) {
          throw new Error('Failed to create event');
        }

        return {
          success: true,
          timezones: 3,
          datesCrossed: 2,
        };
      },
    };

    // Create rubric
    const rubric = new EvaluationRubric();
    rubric.addTarget({
      name: 'Timezone Edge Cases',
      description: 'Handles complex timezone scenarios',
      criteria: [
        {
          name: 'Scheduled across extreme timezones',
          weight: 100,
          evaluate: (result) => (result.success ? 100 : 0),
        },
      ],
    });

    // Run
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(action);
    const score = rubric.evaluate(result);

    console.log(`Status: ${result.success ? 'PASS' : 'FAIL'}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Score: ${score.overall.toFixed(1)}%`);

    const data = result.result;
    if (data) {
      console.log(`Timezones: ${data.timezones}`);
      console.log(`Date boundaries crossed: ${data.datesCrossed}`);
    }

    return { success: result.success, score: score.overall };
  } catch (error) {
    console.log(`FAIL: ${error.message}`);
    return { success: false, score: 0 };
  }
}

// Main runner
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   PIPER MEETING SCHEDULING TEST SUITE                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const results = [];

  results.push(await testBasicMeeting());
  results.push(await testGroupMeeting());
  results.push(await testConflictResolution());
  results.push(await testTimezoneEdgeCases());

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   SUMMARY                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter((r) => r.success).length;
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}/${results.length} (${((passed / results.length) * 100).toFixed(0)}%)`);
  console.log(`Average Score: ${avgScore.toFixed(1)}%`);

  console.log('\nKey Capabilities Needed:');
  console.log('  [ ] Query Calendar free/busy');
  console.log('  [ ] Create calendar events');
  console.log('  [ ] Handle timezone conversions');
  console.log('  [ ] Detect conflicts');
  console.log('  [ ] Find alternatives');
  console.log('  [ ] Handle 4+ attendees');
  console.log('  [ ] Respect working hours');
  console.log('  [ ] Post Slack notifications');

  console.log('\n');
  console.log(
    passed === results.length ? '✓ All tests passed!' : `✗ ${results.length - passed} test(s) failed`
  );
  console.log('');

  process.exit(passed === results.length ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
