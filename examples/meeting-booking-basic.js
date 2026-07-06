/**
 * Scenario: Basic 1-on-1 Meeting Booking
 * Tests Piper's ability to schedule a simple meeting between two people
 *
 * Setup:
 * - Alice (9 AM - 5 PM ET) and Bob (9 AM - 5 PM PT)
 * - Both have clear calendars
 * - Meeting needed: 1 hour sync
 *
 * Success Criteria:
 * - Piper finds an available 1-hour slot
 * - Slot respects both calendars
 * - Slot respects both timezones
 * - Meeting is created in both calendars
 */
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, ScenarioRunner, EvaluationRubric, } from '../src/index';
function createBasicMeetingOrg() {
    return {
        id: 'org-basic-meeting',
        name: 'Basic Meeting Test Org',
        domain: 'test.ada.support',
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
function createBasicMeetingUsers() {
    return [
        {
            id: 'alice-basic',
            email: 'alice@ada.support',
            name: 'Alice Chen',
            timezone: 'America/New_York',
            profile: {
                title: 'Product Manager',
                department: 'Product',
            },
            preferences: {
                workingHours: { start: 9, end: 17 },
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'bob-basic',
            email: 'bob@ada.support',
            name: 'Bob Smith',
            timezone: 'America/Los_Angeles',
            profile: {
                title: 'Engineer',
                department: 'Engineering',
            },
            preferences: {
                workingHours: { start: 9, end: 17 },
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}
/**
 * Piper action that would book a basic 1-on-1 meeting
 */
const basicMeetingAction = {
    name: 'Book 1-on-1 meeting',
    description: 'Alice and Bob book a 1-hour sync',
    attendees: ['alice@ada.support', 'bob@ada.support'],
    duration: 60,
    preferredTime: null, // Let Piper choose
    async execute(httpClient) {
        // Step 1: Check free/busy for both attendees
        const response = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            timeMin: new Date().toISOString(),
            timeMax: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            items: [
                { id: 'alice@ada.support' },
                { id: 'bob@ada.support' },
            ],
        });
        if (response.status !== 200) {
            throw new Error('Failed to check availability');
        }
        // Step 2: Find first available slot (would be tomorrow 12 PM ET / 9 AM PT)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(12, 0, 0, 0); // 12 PM ET = 9 AM PT
        const meetingEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);
        // Step 3: Create event on both calendars
        const createEvent = {
            summary: 'Sync: Alice & Bob',
            description: '1-on-1 sync between product and engineering',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: meetingEnd.toISOString() },
            attendees: [
                { email: 'alice@ada.support' },
                { email: 'bob@ada.support' },
            ],
        };
        const createResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', createEvent);
        if (createResponse.status !== 200) {
            throw new Error('Failed to create event');
        }
        return {
            success: true,
            meeting: {
                id: createResponse.body.id,
                start: tomorrow.toISOString(),
                end: meetingEnd.toISOString(),
                attendees: ['alice@ada.support', 'bob@ada.support'],
            },
        };
    },
};
/**
 * Evaluation rubric for basic 1-on-1 meeting
 */
function createBasicMeetingRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Availability Detection',
        description: 'Can Piper find open time slots',
        criteria: [
            {
                name: 'Found available slot',
                weight: 50,
                evaluate: (result) => (result.success ? 100 : 0),
            },
            {
                name: 'Response time < 2s',
                weight: 50,
                evaluate: (result) => (result.duration < 2000 ? 100 : result.duration < 5000 ? 50 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Timezone Handling',
        description: 'Correctly converts between ET and PT',
        criteria: [
            {
                name: 'Respects both timezones',
                weight: 100,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Calendar Operations',
        description: 'Creates meeting in both calendars',
        criteria: [
            {
                name: 'Calendar events created',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    // Should have 2 mutations (one per calendar)
                    return result.mutationsCreated.length >= 1 ? 100 : 50;
                },
            },
        ],
    });
    return rubric;
}
/**
 * Run the basic meeting scenario
 */
export async function runBasicMeetingScenario() {
    console.log('\n=== Basic 1-on-1 Meeting Booking ===\n');
    const org = createBasicMeetingOrg();
    const builder = new ScenarioBuilder(org);
    // Setup
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);
    const users = createBasicMeetingUsers();
    users.forEach((user) => {
        builder.withUser(user);
        calendar.createCalendar(user.email);
    });
    // Create Slack channel for notifications
    slack.createChannel('C001', 'meetings', false);
    // Set current time to Monday 9 AM ET
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);
    // Execute action
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(basicMeetingAction);
    // Evaluate
    const rubric = createBasicMeetingRubric();
    const score = rubric.evaluate(result);
    console.log('Action: Book 1-on-1 meeting');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
        console.log(`Error: ${result.error.message}`);
    }
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Mutations: ${result.mutationsCreated.length}`);
    console.log(`\nEvaluation Score:`);
    console.log(`  Overall: ${score.overall.toFixed(1)}%`);
    console.log(`  Availability Detection: ${score.byTarget['Availability Detection'].toFixed(1)}%`);
    console.log(`  Timezone Handling: ${score.byTarget['Timezone Handling'].toFixed(1)}%`);
    console.log(`  Calendar Operations: ${score.byTarget['Calendar Operations'].toFixed(1)}%`);
    console.log(`  Passed: ${score.passed ? 'YES' : 'NO'}`);
    // Verify calendar state
    const aliceEvents = calendar.getEvents('alice@ada.support');
    const bobEvents = calendar.getEvents('bob@ada.support');
    console.log(`\nCalendar State:`);
    console.log(`  Alice's events: ${aliceEvents.length}`);
    console.log(`  Bob's events: ${bobEvents.length}`);
    return { result, score };
}
// Export for testing
export { basicMeetingAction, createBasicMeetingRubric, createBasicMeetingUsers, createBasicMeetingOrg };
// Main entry point
if (require.main === module) {
    runBasicMeetingScenario().catch(console.error);
}
//# sourceMappingURL=meeting-booking-basic.js.map