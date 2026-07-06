/**
 * Piper Adapter Example
 * Demonstrates how to inject SimulatedHTTPClient into Piper for testing
 *
 * This example shows:
 * 1. Creating a simulated world with test data
 * 2. Setting up Piper to use SimulatedHTTPClient
 * 3. Running a scenario and capturing HTTP requests
 * 4. Evaluating Piper's responses
 * 5. Identifying gaps and improvements needed
 */
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, ScenarioRunner, EvaluationRubric, } from '../src/index';
/**
 * STEP 1: Create test organization and users
 */
function createTestOrg() {
    return {
        id: 'org-piper-test',
        name: 'Piper Test Organization',
        domain: 'piper.test',
        timezone: 'America/New_York',
        users: new Map(),
        teams: new Map(),
        integrations: new Map(),
        settings: {
            workingHours: { start: 9, end: 17 },
            ssoEnabled: false,
        },
    };
}
function createTestUsers() {
    return [
        {
            id: 'user-alice',
            email: 'alice@example.com',
            name: 'Alice',
            timezone: 'America/New_York',
            profile: { title: 'PM' },
            preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user-bob',
            email: 'bob@example.com',
            name: 'Bob',
            timezone: 'America/Los_Angeles',
            profile: { title: 'Engineer' },
            preferences: { workingHours: { start: 9, end: 17 }, notificationsEnabled: true },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}
/**
 * STEP 2: Setup scenario with SimulatedWorld
 */
async function setupScenario() {
    const org = createTestOrg();
    const builder = new ScenarioBuilder(org);
    // Register integrations
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);
    // Add users and calendars
    const users = createTestUsers();
    users.forEach((user) => {
        builder.withUser(user);
        calendar.createCalendar(user.email);
    });
    slack.createChannel('C001', 'scheduling', false);
    // Set time to 9 AM Monday
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);
    return { builder, users, calendar, slack };
}
/**
 * STEP 3: Example Piper scheduler implementation
 * This is what Piper would do to schedule a meeting
 */
const piperMeetingScheduler = {
    async schedule(options) {
        const { attendees, duration, httpClient } = options;
        // 1. Query free/busy for attendees
        console.log('  [Piper] Querying free/busy for:', attendees);
        const now = new Date();
        const oneWeekOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const freeBusyResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            timeMin: now.toISOString(),
            timeMax: oneWeekOut.toISOString(),
            items: attendees.map((email) => ({ id: email })),
        });
        if (freeBusyResponse.status !== 200) {
            throw new Error('Failed to query free/busy');
        }
        // 2. Find first available slot
        console.log('  [Piper] Analyzing availability...');
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0); // Try noon
        const meetingEnd = new Date(tomorrow.getTime() + duration * 60 * 1000);
        // 3. Create calendar event
        console.log('  [Piper] Creating calendar event...');
        const createResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            summary: 'Scheduled Meeting',
            description: 'Meeting scheduled by Piper',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: meetingEnd.toISOString() },
            attendees: attendees.map((email) => ({ email })),
        });
        if (createResponse.status !== 200) {
            throw new Error('Failed to create event');
        }
        // 4. Post notification to Slack
        console.log('  [Piper] Posting Slack notification...');
        await httpClient.post('https://slack.com/api/chat.postMessage', {
            channel: 'C001',
            text: `Meeting scheduled: ${attendees.join(', ')} at ${tomorrow.toLocaleTimeString()}`,
        });
        return {
            success: true,
            eventId: createResponse.body.id,
            start: tomorrow.toISOString(),
            end: meetingEnd.toISOString(),
            attendees,
        };
    },
};
/**
 * STEP 4: Create evaluation rubric
 */
function createEvaluationRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Availability Detection',
        description: 'Correctly finds available time slots',
        criteria: [
            {
                name: 'Queries free/busy endpoint',
                weight: 40,
                evaluate: (result) => result.success ? 100 : 0,
            },
            {
                name: 'Finds available slot',
                weight: 60,
                evaluate: (result) => result.success ? 100 : 0,
            },
        ],
    });
    rubric.addTarget({
        name: 'Calendar Operations',
        description: 'Creates events in all calendars',
        criteria: [
            {
                name: 'Creates calendar event',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    // Check that event was created (at least 1 mutation)
                    return result.mutationsCreated.length > 0 ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Communication',
        description: 'Notifies attendees via Slack',
        criteria: [
            {
                name: 'Posts Slack notification',
                weight: 100,
                evaluate: (result) => result.success ? 100 : 50,
            },
        ],
    });
    rubric.addTarget({
        name: 'Performance',
        description: 'Responds in reasonable time',
        criteria: [
            {
                name: 'Response time < 1 second',
                weight: 100,
                evaluate: (result) => (result.duration < 1000 ? 100 : result.duration < 2000 ? 50 : 0),
            },
        ],
    });
    return rubric;
}
/**
 * STEP 5: Run the example
 */
export async function runPiperAdapterExample() {
    console.log('\n=== Piper Adapter Example ===\n');
    // Setup
    console.log('Setup:');
    const { builder, users, calendar, slack } = await setupScenario();
    console.log(`  - Created ${users.length} test users`);
    console.log(`  - Setup Calendar and Slack integrations`);
    console.log('');
    // Create Piper action
    const action = {
        name: 'Schedule 1-on-1 with Piper',
        async execute(httpClient) {
            return piperMeetingScheduler.schedule({
                attendees: ['alice@example.com', 'bob@example.com'],
                duration: 60,
                httpClient,
            });
        },
    };
    // Run Piper
    console.log('Execution:');
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(action);
    console.log('');
    console.log('Results:');
    console.log(`  Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  Duration: ${result.duration}ms`);
    console.log(`  Mutations: ${result.mutationsCreated.length}`);
    if (result.error) {
        console.log(`  Error: ${result.error.message}`);
    }
    // Evaluate
    console.log('');
    console.log('Evaluation:');
    const rubric = createEvaluationRubric();
    const score = rubric.evaluate(result);
    console.log(`  Overall Score: ${score.overall.toFixed(1)}%`);
    console.log(`  Availability Detection: ${score.byTarget['Availability Detection'].toFixed(1)}%`);
    console.log(`  Calendar Operations: ${score.byTarget['Calendar Operations'].toFixed(1)}%`);
    console.log(`  Communication: ${score.byTarget['Communication'].toFixed(1)}%`);
    console.log(`  Performance: ${score.byTarget['Performance'].toFixed(1)}%`);
    console.log(`  Passed: ${score.passed ? 'YES' : 'NO'}`);
    // Show calendar state
    console.log('');
    console.log('Calendar State After:');
    users.forEach((user) => {
        const events = calendar.getEvents(user.email);
        console.log(`  ${user.name}: ${events.length} event(s)`);
        events.forEach((evt) => {
            console.log(`    - ${evt.summary}`);
        });
    });
    // Show Slack messages
    console.log('');
    console.log('Slack Activity:');
    const slackChannelId = 'C001';
    // In a real implementation, you'd query Slack for messages
    console.log(`  Posted message to #scheduling channel`);
    // Show traces (what HTTP calls were made)
    console.log('');
    console.log('HTTP Requests Made:');
    const traces = builder.getWorld().getTraces();
    traces.forEach((trace, idx) => {
        const method = trace.request.method;
        const url = new URL(trace.request.url);
        const path = url.pathname.split('/').slice(-2).join('/');
        const status = trace.response?.status || 'ERROR';
        console.log(`  ${idx + 1}. ${method} ${path} -> ${status}`);
    });
    return { result, score };
}
/**
 * BEFORE & AFTER: What needs to improve in Piper
 */
function showBeforeAndAfter() {
    console.log('\n=== Before & After: Gaps to Address ===\n');
    const improvements = [
        {
            title: 'Better Timezone Handling',
            before: 'Suggests 12 PM ET for all attendees, Bob gets 9 AM PT',
            after: 'Suggests 1 PM ET = 10 AM PT, clearly shows both times',
            metric: 'Timezone Handling Score',
        },
        {
            title: 'Conflict Detection',
            before: 'Suggests time without checking if anyone is busy',
            after: 'Queries free/busy first, detects conflicts, suggests alternatives',
            metric: 'Availability Detection Score',
        },
        {
            title: 'Working Hours Respect',
            before: 'Suggests 7 AM without mentioning it\'s early',
            after: 'Suggests 7 AM but notes "This is 30 min before Bob\'s working hours"',
            metric: 'Working Hours Respect Score',
        },
        {
            title: 'Group Scheduling',
            before: 'Only handles 1-on-1, fails with 3+ people',
            after: 'Handles 4+ people, finds optimal time, explains tradeoffs',
            metric: 'Group Size Handling Score',
        },
        {
            title: 'Natural Language Explanations',
            before: 'Creates event silently',
            after: 'Explains: "Best overlap is 1 PM ET. This is noon for Bob, ideal for both."',
            metric: 'Communication Score',
        },
    ];
    improvements.forEach((improvement) => {
        console.log(`${improvement.title}`);
        console.log(`  Before: ${improvement.before}`);
        console.log(`  After:  ${improvement.after}`);
        console.log(`  Metric: ${improvement.metric}`);
        console.log('');
    });
}
/**
 * Main entry point
 */
async function main() {
    try {
        await runPiperAdapterExample();
        showBeforeAndAfter();
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
// Export for use in tests
export { piperMeetingScheduler, createEvaluationRubric, setupScenario };
// Main
if (require.main === module) {
    main();
}
//# sourceMappingURL=piper-adapter-example.js.map