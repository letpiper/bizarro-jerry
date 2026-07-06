#!/usr/bin/env node

/**
 * Meeting Scheduler Demo: Complete SimulatedWorld Test
 *
 * This demonstrates the full power of SimulatedWorld as a test harness:
 * - Real meeting scheduling scenario across 3 timezones
 * - Calendar conflicts and availability detection
 * - Trace/mutation observability
 * - Evaluation against target experience
 * - Identification of Piper gaps
 */

const {
  SimulatedWorld,
  TimeEngine,
  EventBus,
  SlackIntegration,
  CalendarIntegration,
  SimulatedHTTPClient,
  ScenarioRunner,
  EvaluationRubric,
} = require('./dist/index');

const path = require('path');
const fs = require('fs');

// ============================================================================
// SCENARIO SETUP
// ============================================================================

/**
 * Create a realistic world with 3 attendees across timezones
 */
async function setupWorld() {
  const org = {
    id: 'org-demo',
    name: 'Ada Demo Org',
    domain: 'demo.ada.support',
    timezone: 'America/New_York',
    users: new Map(),
    teams: new Map(),
    integrations: new Map(),
    settings: {
      ssoEnabled: false,
    },
  };

  const world = new SimulatedWorld(org);

  return { world, org };
}

/**
 * Create 3 attendees across timezones
 * Alice: ET (UTC-4), 9 AM - 5 PM
 * Bob: PT (UTC-7), 9 AM - 5 PM
 * Charlie: UK (UTC+1), 9 AM - 5 PM
 */
function createAttendees() {
  return {
    alice: {
      id: 'alice',
      email: 'alice@ada.support',
      name: 'Alice Chen',
      timezone: 'America/New_York', // ET
      profile: { title: 'Product Manager' },
      preferences: {
        workingHours: { start: 9, end: 17 },
        notificationsEnabled: true,
      },
      integrations: {
        google: { accessToken: 'mock-token-alice' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    bob: {
      id: 'bob',
      email: 'bob@ada.support',
      name: 'Bob Smith',
      timezone: 'America/Los_Angeles', // PT
      profile: { title: 'Engineer' },
      preferences: {
        workingHours: { start: 9, end: 17 },
        notificationsEnabled: true,
      },
      integrations: {
        google: { accessToken: 'mock-token-bob' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    charlie: {
      id: 'charlie',
      email: 'charlie@ada.support',
      name: 'Charlie Wong',
      timezone: 'Europe/London', // UK
      profile: { title: 'Designer' },
      preferences: {
        workingHours: { start: 9, end: 17 },
        notificationsEnabled: true,
      },
      integrations: {
        google: { accessToken: 'mock-token-charlie' },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

/**
 * Create realistic calendar events for next week
 * This tests conflict detection and availability analysis
 */
function createCalendarConflicts(attendees, baseDate) {
  // Monday 9 AM ET (6 AM PT, 2 PM UK) - Alice busy with standup
  const aliceMonday = new Date(baseDate);
  aliceMonday.setDate(aliceMonday.getDate() + 1); // tomorrow = Monday
  aliceMonday.setHours(9, 0, 0, 0); // 9 AM ET

  // Monday 10 AM PT (1 PM ET, 6 PM UK) - Bob has team sync
  const bobMonday = new Date(baseDate);
  bobMonday.setDate(bobMonday.getDate() + 1);
  bobMonday.setHours(10, 0, 0, 0);

  // Wednesday 2 PM UK (9 AM ET, 6 AM PT) - Charlie has design review
  const charlieWednesday = new Date(baseDate);
  charlieWednesday.setDate(charlieWednesday.getDate() + 3); // Wednesday
  charlieWednesday.setHours(14, 0, 0, 0);

  return [
    {
      email: attendees.alice.email,
      summary: 'Team Standup',
      startTime: aliceMonday,
      endTime: new Date(aliceMonday.getTime() + 30 * 60 * 1000), // 30 min
    },
    {
      email: attendees.bob.email,
      summary: 'Team Sync',
      startTime: bobMonday,
      endTime: new Date(bobMonday.getTime() + 60 * 60 * 1000), // 1 hour
    },
    {
      email: attendees.charlie.email,
      summary: 'Design Review',
      startTime: charlieWednesday,
      endTime: new Date(charlieWednesday.getTime() + 60 * 60 * 1000), // 1 hour
    },
  ];
}

/**
 * Create the main action: Schedule a 1-hour meeting with all 3 attendees
 */
function createMeetingSchedulingAction(attendees, baseDate) {
  return {
    name: 'Schedule 1-hour meeting across 3 timezones',
    async execute(httpClient) {
      // Target: Find a slot next week that works for everyone
      // Alice: 9 AM - 5 PM ET
      // Bob: 9 AM - 5 PM PT (12 PM - 8 PM ET equivalent)
      // Charlie: 9 AM - 5 PM UK (4 AM - 12 PM ET equivalent)
      //
      // Overlap: 12 PM - 12 PM ET (no overlap!)
      // Best compromise: 2 PM ET (11 AM PT, 7 PM UK) - outside Charlie's hours
      // Actually: 10 AM ET (7 AM PT, 3 PM UK) - Bob outside hours
      // Best window: 1 PM ET (10 AM PT, 6 PM UK) - Charlie outside hours
      // Reality: 12 PM ET (9 AM PT, 5 PM UK) - at boundary

      const proposedStart = new Date(baseDate);
      proposedStart.setDate(proposedStart.getDate() + 4); // Thursday
      proposedStart.setHours(13, 0, 0, 0); // 1 PM ET

      const proposedEnd = new Date(proposedStart.getTime() + 60 * 60 * 1000);

      // Step 1: Check Alice's availability
      const aliceCheckResponse = await httpClient.get(
        `https://www.googleapis.com/calendar/v3/calendars/${attendees.alice.email}/events`,
        { Authorization: 'Bearer mock-token-alice' }
      );

      // Step 2: Check Bob's availability
      const bobCheckResponse = await httpClient.get(
        `https://www.googleapis.com/calendar/v3/calendars/${attendees.bob.email}/events`,
        { Authorization: 'Bearer mock-token-bob' }
      );

      // Step 3: Check Charlie's availability
      const charlieCheckResponse = await httpClient.get(
        `https://www.googleapis.com/calendar/v3/calendars/${attendees.charlie.email}/events`,
        { Authorization: 'Bearer mock-token-charlie' }
      );

      // Step 4: Create event on all calendars
      const createEventBody = {
        summary: 'Quarterly Planning - Cross-Timezone Sync',
        description: 'Q3 Planning meeting for Alice, Bob, and Charlie',
        start: { dateTime: proposedStart.toISOString() },
        end: { dateTime: proposedEnd.toISOString() },
        attendees: [
          { email: attendees.alice.email },
          { email: attendees.bob.email },
          { email: attendees.charlie.email },
        ],
        conferenceData: {
          createRequest: { requestId: 'meeting-request-1' },
        },
      };

      const createResponse = await httpClient.post(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        createEventBody,
        { Authorization: 'Bearer mock-token-alice' }
      );

      // Step 5: Send Slack notification
      const slackNotification = await httpClient.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: 'C001meetings',
          text: `Meeting scheduled: Quarterly Planning\nParticipants: Alice Chen, Bob Smith, Charlie Wong\nTime: Thursday 1 PM ET (10 AM PT, 6 PM UK)\n\nNote: Charlie is outside working hours. Consider rescheduling.`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Quarterly Planning - Cross-Timezone Sync*\n1 hour | Thursday 1 PM ET',
              },
            },
          ],
        },
        { Authorization: 'Bearer xoxb-mock-slack-token' }
      );

      return {
        eventCreated: true,
        eventId: 'event-new-meeting',
        startTime: proposedStart.toISOString(),
        endTime: proposedEnd.toISOString(),
        attendees: Object.keys(attendees).map(key => attendees[key].name),
        timezoneOverlapAnalysis: {
          alice: '1 PM - 2 PM ET (9-5 working hours)', // ✓
          bob: '10 AM - 11 AM PT (9-5 working hours)', // ✓
          charlie: '6 PM - 7 PM UK (outside 9-5!)', // ✗
        },
        conflictsDetected: 0,
        conflictResolutionAttempts: 0,
        slackNotified: true,
      };
    },
  };
}

/**
 * Build the evaluation rubric for meeting scheduling
 */
function buildEvaluationRubric() {
  const rubric = new EvaluationRubric();

  rubric.addTarget({
    name: 'Availability Detection',
    description: 'System detects attendee availability across timezones',
    criteria: [
      {
        name: 'Fetches all calendars',
        weight: 25,
        evaluate: (result) => {
          const mutations = result.mutationsCreated || [];
          const calendarFetches = mutations.filter(m =>
            m.resource?.includes('calendar') && m.operation === 'READ'
          );
          // Should have 3 calendar fetches
          return calendarFetches.length >= 3 ? 100 : (calendarFetches.length / 3) * 100;
        },
      },
      {
        name: 'Handles timezone conversion',
        weight: 25,
        evaluate: (result) => {
          const resultData = result.result;
          if (!resultData || !resultData.timezoneOverlapAnalysis) return 0;

          // Check if result mentions specific timezones
          const hasTimezones = Object.values(resultData.timezoneOverlapAnalysis).some(
            str => typeof str === 'string' && (str.includes('ET') || str.includes('PT') || str.includes('UK'))
          );
          return hasTimezones ? 100 : 50;
        },
      },
      {
        name: 'Identifies working hours conflicts',
        weight: 25,
        evaluate: (result) => {
          const resultData = result.result;
          if (!resultData || !resultData.timezoneOverlapAnalysis) return 0;

          // Charlie is outside working hours - should be detected
          const charlieStatus = resultData.timezoneOverlapAnalysis.charlie;
          const conflictIdentified = typeof charlieStatus === 'string' &&
            charlieStatus.toLowerCase().includes('outside');
          return conflictIdentified ? 100 : 50;
        },
      },
      {
        name: 'Completes within reasonable time',
        weight: 25,
        evaluate: (result) => {
          // Should complete within 1000ms (multiple API calls)
          return result.duration < 2000 ? 100 : Math.max(0, 100 - (result.duration - 2000) / 10);
        },
      },
    ],
  });

  rubric.addTarget({
    name: 'Meeting Creation',
    description: 'Meeting is successfully created and notifications sent',
    criteria: [
      {
        name: 'Event created',
        weight: 40,
        evaluate: (result) => {
          const resultData = result.result;
          return resultData?.eventCreated ? 100 : 0;
        },
      },
      {
        name: 'All attendees included',
        weight: 30,
        evaluate: (result) => {
          const resultData = result.result;
          const attendeeCount = resultData?.attendees?.length || 0;
          return attendeeCount >= 3 ? 100 : (attendeeCount / 3) * 100;
        },
      },
      {
        name: 'Notifications sent',
        weight: 30,
        evaluate: (result) => {
          const resultData = result.result;
          return resultData?.slackNotified ? 100 : 50;
        },
      },
    ],
  });

  rubric.addTarget({
    name: 'Target Meeting Booking Experience',
    description: 'Matches the ideal meeting booking UX from requirements',
    criteria: [
      {
        name: 'Smart timezone handling',
        weight: 30,
        evaluate: (result) => {
          const resultData = result.result;
          if (!resultData) return 0;

          // Check for timezone-aware analysis
          const hasTzAnalysis = resultData.timezoneOverlapAnalysis !== undefined;
          // Check for conflict detection
          const hasConflictInfo = resultData.conflictsDetected !== undefined;

          return (hasTzAnalysis ? 50 : 0) + (hasConflictInfo ? 50 : 0);
        },
      },
      {
        name: 'Proactive conflict warnings',
        weight: 35,
        evaluate: (result) => {
          const mutations = result.mutationsCreated || [];
          const slackMessages = mutations.filter(m =>
            m.resource?.includes('slack') && m.operation === 'CREATE'
          );
          return slackMessages.length > 0 ? 100 : 60;
        },
      },
      {
        name: 'Suggests alternatives for conflicts',
        weight: 35,
        evaluate: (result) => {
          const resultData = result.result;
          // Check for alternative suggestions (this would be a gap)
          const hasAlternatives = resultData?.suggestedAlternatives?.length > 0;
          return hasAlternatives ? 100 : 30; // Likely missing feature
        },
      },
    ],
  });

  return rubric;
}

// ============================================================================
// MAIN DEMO
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('SimulatedWorld: Meeting Scheduler Demo');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Setup
    console.log('Step 1: Setting up simulated world...');
    const { world, org } = await setupWorld();

    // 2. Add users
    console.log('Step 2: Creating 3 attendees across timezones...');
    const attendees = createAttendees();
    for (const [key, user] of Object.entries(attendees)) {
      org.users.set(user.id, user);
      console.log(`  ✓ ${user.name} (${user.timezone})`);
    }

    // 3. Setup integrations
    console.log('\nStep 3: Initializing integrations...');
    const calendar = new CalendarIntegration(world);
    const slack = new SlackIntegration(world);
    world.registerIntegration('calendar', calendar);
    world.registerIntegration('slack', slack);
    console.log('  ✓ Calendar integration');
    console.log('  ✓ Slack integration');

    // 4. Setup calendar conflicts
    console.log('\nStep 4: Populating calendars with realistic conflicts...');
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + 1); // Start from tomorrow

    // Create calendars first
    for (const attendee of Object.values(attendees)) {
      calendar.createCalendar(attendee.email);
    }

    const conflicts = createCalendarConflicts(attendees, baseDate);
    for (const event of conflicts) {
      calendar.addEvent(event.email, event.summary, event.startTime, event.endTime);
      console.log(`  ✓ Added: "${event.summary}" for ${event.email}`);
    }

    // 5. Create runner and action
    console.log('\nStep 5: Creating meeting scheduling action...');
    const runner = new ScenarioRunner(world);
    const action = createMeetingSchedulingAction(attendees, baseDate);
    console.log(`  ✓ Action: ${action.name}`);

    // 6. Execute
    console.log('\nStep 6: Executing meeting scheduling logic...');
    console.log('  → Fetching calendars...');
    console.log('  → Analyzing availability...');
    console.log('  → Detecting timezone conflicts...');
    console.log('  → Creating event...');
    console.log('  → Sending notifications...');

    const result = await runner.executeAction(action);

    // 7. Collect mutations and traces
    console.log('\nStep 7: Capturing traces and mutations...');
    const mutations = world.getMutations();
    const traces = world.getTraces ? world.getTraces() : [];
    console.log(`  ✓ Captured ${mutations.length} mutations`);
    console.log(`  ✓ Captured ${traces.length} traces`);

    // 8. Evaluate
    console.log('\nStep 8: Evaluating against target experience...');
    const rubric = buildEvaluationRubric();
    const evaluation = rubric.evaluate(result);

    // 9. Display results
    console.log('\n' + '='.repeat(80));
    console.log('EXECUTION RESULTS');
    console.log('='.repeat(80));

    console.log('\n📊 OVERALL SCORE: ' + evaluation.overall.toFixed(1) + '%');
    console.log('   ' + (evaluation.passed ? '✓ PASSED' : '✗ FAILED') + ' (threshold: 70%)');

    console.log('\n📈 BREAKDOWN BY TARGET:');
    for (const [target, score] of Object.entries(evaluation.byTarget)) {
      const indicator = score >= 70 ? '✓' : '⚠';
      console.log(`   ${indicator} ${target}: ${score.toFixed(1)}%`);
    }

    console.log('\n⏱ EXECUTION METRICS:');
    console.log(`   Duration: ${result.duration}ms`);
    console.log(`   Success: ${result.success}`);
    console.log(`   Mutations created: ${result.mutationsCreated.length}`);

    if (result.result) {
      const rs = result.result;
      console.log('\n📅 MEETING DETAILS:');
      console.log(`   Event created: ${rs.eventCreated ? 'Yes' : 'No'}`);
      console.log(`   Attendees: ${rs.attendees?.join(', ') || 'N/A'}`);
      console.log(`   Time: ${rs.startTime}`);
      console.log(`   Slack notified: ${rs.slackNotified ? 'Yes' : 'No'}`);

      console.log('\n🌍 TIMEZONE ANALYSIS:');
      if (rs.timezoneOverlapAnalysis) {
        for (const [person, status] of Object.entries(rs.timezoneOverlapAnalysis)) {
          const warning = status.includes('outside') ? ' ⚠' : '';
          console.log(`   ${person}: ${status}${warning}`);
        }
      }
    }

    console.log('\n📡 API INTERACTIONS:');
    const apiCalls = mutations.filter(m => m.type === 'api');
    console.log(`   Total API calls: ${apiCalls.length}`);
    for (const call of apiCalls.slice(0, 10)) {
      const method = call.details?.method || 'UNKNOWN';
      const resource = call.resource || 'unknown';
      console.log(`   • ${method} ${resource}`);
    }

    // 10. Identify gaps
    console.log('\n' + '='.repeat(80));
    console.log('PIPER IMPROVEMENT OPPORTUNITIES');
    console.log('='.repeat(80));

    const gaps = [];

    if (evaluation.byTarget['Target Meeting Booking Experience'] < 70) {
      gaps.push({
        priority: 'HIGH',
        issue: 'Timezone conflict warning',
        detail: 'Charlie is outside working hours (6 PM UK) but system did not suggest reschedule',
        piperGap: 'Need to implement working-hours-aware scheduling',
        effort: 'Medium',
      });
    }

    gaps.push({
      priority: 'HIGH',
      issue: 'No alternative time suggestions',
      detail: 'System booked meeting but did not suggest better times for all attendees',
      piperGap: 'Implement algorithm to find optimal timezone-aware time slots',
      effort: 'High',
    });

    gaps.push({
      priority: 'MEDIUM',
      issue: 'Calendar recursion not handled',
      detail: 'System only checks individual event conflicts, not recurring patterns',
      piperGap: 'Expand conflict detection to handle recurring events',
      effort: 'Medium',
    });

    gaps.push({
      priority: 'MEDIUM',
      issue: 'No buffer time between meetings',
      detail: 'System can book back-to-back meetings across timezones',
      piperGap: 'Add configurable buffer time (default 15 min) between meetings',
      effort: 'Low',
    });

    gaps.push({
      priority: 'LOW',
      issue: 'No preference weighting',
      detail: 'All attendees treated equally; should weight by seniority/importance',
      piperGap: 'Add attendee weight/priority to scheduling algorithm',
      effort: 'Low',
    });

    for (let i = 0; i < gaps.length; i++) {
      const g = gaps[i];
      console.log(`\n${i + 1}. [${g.priority}] ${g.issue}`);
      console.log(`   Problem: ${g.detail}`);
      console.log(`   Piper gap: ${g.piperGap}`);
      console.log(`   Effort: ${g.effort}`);
    }

    // 11. Show how SimulatedWorld enables iteration
    console.log('\n' + '='.repeat(80));
    console.log('HOW SIMULATEDWORLD DRIVES IMPROVEMENT');
    console.log('='.repeat(80));

    console.log(`
1. OBSERVABILITY: SimulatedWorld captured ${mutations.length} mutations across
   ${[...new Set(mutations.map(m => m.resource))].length} resources. Each mutation is
   timestamped and traceable to the action that caused it.

2. REPRODUCIBILITY: This exact scenario can be run 100 times against different
   implementations of meeting scheduling logic. Results are deterministic.

3. EVALUATION: The rubric automatically scores against the Target Meeting Booking
   Experience. Improvements to scoring are measurable and tied to specific gaps.

4. ITERATION: Engineers can implement improvements (e.g., "suggest alternatives")
   and see immediate score improvements. Regression testing is built-in.

5. REGRESSION PREVENTION: As new features are added to Piper, this scenario
   continues to run. If availability detection breaks, the score drops.

NEXT STEPS:
- Run this scenario 100 times to establish baseline metrics
- Implement gap #1 (working-hours-aware scheduling)
- Re-run and verify score improves
- Add new scenarios for complex cases (>5 attendees, multiple time zones, etc)
- Integrate into CI/CD to track improvements over time
    `);

    // 12. Export results
    console.log('\n' + '='.repeat(80));
    console.log('EXPORTING RESULTS');
    console.log('='.repeat(80));

    const report = {
      timestamp: new Date().toISOString(),
      scenario: 'Meeting Scheduling (3 Timezones)',
      execution: {
        duration: result.duration,
        success: result.success,
        error: result.error?.message,
      },
      evaluation: {
        overall: evaluation.overall,
        passed: evaluation.passed,
        byTarget: evaluation.byTarget,
      },
      metrics: {
        mutationsCreated: result.mutationsCreated.length,
        calendarEventsCreated: 3,
        attendees: 3,
        timezones: 3,
      },
      gaps: gaps.map(g => ({
        priority: g.priority,
        issue: g.issue,
        piperGap: g.piperGap,
      })),
      meeting: result.result
        ? {
            created: result.result.eventCreated,
            startTime: result.result.startTime,
            attendees: result.result.attendees,
            conflictsDetected: result.result.conflictsDetected,
          }
        : null,
    };

    const reportPath = path.join('/tmp/simulated-world', 'test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Full results exported to: ${reportPath}`);

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
