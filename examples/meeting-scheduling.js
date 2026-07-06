/**
 * Example: Meeting Scheduling Scenario
 * Demonstrates using SimulatedWorld to test Piper's meeting scheduling
 */
import { ScenarioExecutor, CalendarIntegration, SlackIntegration, EvaluationRubric, SimulatedWorld, ScenarioRunner, } from '../src/index';
/**
 * Create a test organization with sample data
 */
function createMeetingSchedulingOrg() {
    return {
        id: 'test-org',
        name: 'Ada Test Corp',
        domain: 'test.ada.support',
        timezone: 'America/New_York',
        users: new Map(),
        teams: new Map(),
        integrations: new Map(),
        settings: {
            ssoEnabled: false,
        },
    };
}
/**
 * Create test users with different timezones and availability
 */
function createTestUsers() {
    return [
        {
            id: 'user1',
            email: 'alice@ada.support',
            name: 'Alice Chen',
            timezone: 'America/New_York',
            profile: {
                title: 'Product Manager',
            },
            preferences: {
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user2',
            email: 'bob@ada.support',
            name: 'Bob Smith',
            timezone: 'America/Los_Angeles',
            profile: {
                title: 'Engineer',
            },
            preferences: {
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'user3',
            email: 'charlie@ada.support',
            name: 'Charlie Johnson',
            timezone: 'Europe/London',
            profile: {
                title: 'Sales',
            },
            preferences: {
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}
/**
 * Example scenario: Basic 1-on-1 meeting
 */
const basicMeetingScenario = {
    name: 'Basic 1-on-1 Meeting',
    description: 'Schedule a simple meeting between two team members',
    setup: async (builder) => {
        // Add integrations
        const calendar = new CalendarIntegration(builder.getWorld());
        const slack = new SlackIntegration(builder.getWorld());
        builder.withIntegration('calendar', calendar);
        builder.withIntegration('slack', slack);
        // Add users
        const users = createTestUsers();
        users.forEach((user) => builder.withUser(user));
        // Create calendars for each user
        users.forEach((user) => calendar.createCalendar(user.email));
        // Create a Slack channel
        slack.createChannel('C001', 'general', false);
    },
    execute: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const slack = builder.getWorld().getIntegration('slack');
        const org = builder.getWorld().org;
        // Get users
        const users = Array.from(org.users.values());
        const alice = users[0];
        const bob = users[1];
        // Check availability (both are free 2pm-3pm ET today)
        const now = new Date();
        now.setHours(14, 0, 0, 0);
        const end = new Date(now.getTime() + 3600000); // 1 hour
        builder.atTime(now);
        // Add the meeting to both calendars
        calendar.addEvent(alice.email, 'Team Sync with Bob', now, end);
        calendar.addEvent(bob.email, 'Team Sync with Alice', now, end);
        // Post notification in Slack
        slack.postMessage('C001', `Meeting scheduled: Team Sync 2-3 PM ET`);
    },
    verify: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const alice_events = calendar.getEvents('alice@ada.support');
        const bob_events = calendar.getEvents('bob@ada.support');
        // Both should have the meeting on their calendars
        return alice_events.length > 0 && bob_events.length > 0;
    },
};
/**
 * Example scenario: Group meeting with timezone conflicts
 */
const groupMeetingScenario = {
    name: 'Group Meeting Across Timezones',
    description: 'Schedule a meeting with people in multiple timezones',
    setup: async (builder) => {
        const calendar = new CalendarIntegration(builder.getWorld());
        builder.withIntegration('calendar', calendar);
        const users = createTestUsers();
        users.forEach((user) => builder.withUser(user));
        users.forEach((user) => calendar.createCalendar(user.email));
    },
    execute: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const org = builder.getWorld().org;
        const users = Array.from(org.users.values());
        // Try to find a slot that works for everyone
        // For US + EU participants, this is typically early US morning or late afternoon
        const now = new Date();
        now.setHours(13, 0, 0, 0); // 1 PM ET = 6 PM UTC = 7 PM UK
        const end = new Date(now.getTime() + 3600000);
        builder.atTime(now);
        // Add to all three calendars
        users.forEach((user) => {
            calendar.addEvent(user.email, 'Company All Hands', now, end);
        });
    },
    verify: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const allUsers = [
            'alice@ada.support',
            'bob@ada.support',
            'charlie@ada.support',
        ];
        // Verify all users have the meeting
        return allUsers.every((email) => calendar.getEvents(email).length > 0);
    },
};
/**
 * Example scenario: Complex meeting with conflicts
 */
const conflictResolutionScenario = {
    name: 'Conflict Resolution Meeting',
    description: 'Handle scheduling when initial slot has conflicts',
    setup: async (builder) => {
        const calendar = new CalendarIntegration(builder.getWorld());
        builder.withIntegration('calendar', calendar);
        const users = createTestUsers();
        users.forEach((user) => builder.withUser(user));
        users.forEach((user) => calendar.createCalendar(user.email));
    },
    execute: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const org = builder.getWorld().org;
        const users = Array.from(org.users.values());
        const now = new Date();
        now.setHours(10, 0, 0, 0);
        // Pre-block: Add conflicting meetings for Alice at 2 PM
        const conflictStart = new Date(now);
        conflictStart.setHours(14, 0, 0, 0);
        const conflictEnd = new Date(conflictStart.getTime() + 3600000);
        calendar.addEvent(users[0].email, 'Client Call', conflictStart, conflictEnd);
        builder.atTime(now);
        // Now try to schedule meeting for all three at 2-3 PM
        const meetStart = new Date(now);
        meetStart.setHours(14, 0, 0, 0);
        const meetEnd = new Date(meetStart.getTime() + 3600000);
        // This should detect Alice is busy and suggest alternative time
        users.forEach((user) => {
            if (user.email !== users[0].email) {
                calendar.addEvent(user.email, 'Team Planning', meetStart, meetEnd);
            }
        });
        // Alternative: reschedule to 3 PM where Alice is free
        const altStart = new Date(now);
        altStart.setHours(15, 0, 0, 0);
        const altEnd = new Date(altStart.getTime() + 3600000);
        calendar.addEvent(users[0].email, 'Team Planning (rescheduled)', altStart, altEnd);
    },
    verify: async (builder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        // Alice should have the original client call + rescheduled meeting
        const aliceEvents = calendar.getEvents('alice@ada.support');
        return aliceEvents.length >= 2;
    },
};
/**
 * Run all scenarios and evaluate
 */
async function runMeetingSchedulingEvaluation() {
    const executor = new ScenarioExecutor();
    const org = createMeetingSchedulingOrg();
    console.log('=== Meeting Scheduling Scenario Evaluation ===\n');
    const scenarios = [basicMeetingScenario, groupMeetingScenario, conflictResolutionScenario];
    for (const scenario of scenarios) {
        console.log(`\nRunning: ${scenario.name}`);
        const result = await executor.run(scenario, org);
        console.log(`  Status: ${result.success ? 'PASSED' : 'FAILED'}`);
        console.log(`  Verification: ${result.verificationPassed ? 'PASSED' : 'FAILED'}`);
        console.log(`  Duration: ${result.metrics.duration}ms`);
        console.log(`  Mutations: ${result.metrics.mutations}`);
    }
    const summary = executor.getSummary();
    console.log('\n=== Summary ===');
    console.log(`Total Scenarios: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}`);
}
/**
 * Example: Using with Piper HTTP Client
 */
async function demonstratePiperIntegration() {
    const org = createMeetingSchedulingOrg();
    const world = new SimulatedWorld(org);
    const runner = new ScenarioRunner(world);
    // Add calendar integration
    const calendar = new CalendarIntegration(world);
    world.registerIntegration('calendar', calendar);
    // Get the HTTP client that Piper would use
    const httpClient = runner.getHTTPClient();
    // Example: Piper makes a calendaring API call
    const response = await httpClient.get('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    console.log('Piper HTTP Client Response:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Headers: ${JSON.stringify(response.headers)}`);
}
/**
 * Evaluation rubric for Piper's meeting scheduling
 */
function createMeetingSchedulingRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Availability Detection',
        description: 'Can Piper accurately detect attendee availability',
        criteria: [
            {
                name: 'Detects available slots',
                weight: 50,
                evaluate: (result) => (result.success ? 100 : 0),
            },
            {
                name: 'Response time',
                weight: 50,
                evaluate: (result) => (result.duration < 1000 ? 100 : 50),
            },
        ],
    });
    rubric.addTarget({
        name: 'Timezone Handling',
        description: 'Correctly handles multiple timezones',
        criteria: [
            {
                name: 'Timezone conversion accuracy',
                weight: 100,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Conflict Resolution',
        description: 'Intelligently handles scheduling conflicts',
        criteria: [
            {
                name: 'Suggests alternatives',
                weight: 70,
                evaluate: (result) => (result.success ? 100 : 0),
            },
            {
                name: 'Respects preferences',
                weight: 30,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    return rubric;
}
// Main
if (require.main === module) {
    console.log('Starting meeting scheduling evaluation...\n');
    runMeetingSchedulingEvaluation().then(() => {
        console.log('\nEvaluation complete.');
    });
}
export { runMeetingSchedulingEvaluation, demonstratePiperIntegration, createMeetingSchedulingRubric, basicMeetingScenario, groupMeetingScenario, conflictResolutionScenario, };
//# sourceMappingURL=meeting-scheduling.js.map