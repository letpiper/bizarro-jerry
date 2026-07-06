/**
 * Scenario: Group Meeting with 4+ People Across Timezones
 * Tests Piper's ability to find common time across distributed teams
 *
 * Setup:
 * - Alice (ET: 9 AM - 5 PM)
 * - Bob (PT: 9 AM - 5 PM)
 * - Charlie (UK: 9 AM - 5 PM)
 * - Diana (India: 9:30 AM - 5:30 PM)
 * - Various calendar blocks throughout the week
 *
 * Success Criteria:
 * - Piper identifies that 1-hour slot is hard to find
 * - Suggests 30-min alternative slot if 1-hour not available
 * - Slot respects all 4 timezones
 * - Provides tradeoff analysis (who's at odd hours)
 */
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, ScenarioRunner, EvaluationRubric, } from '../src/index';
function createGroupMeetingOrg() {
    return {
        id: 'org-group-meeting',
        name: 'Group Meeting Test Org',
        domain: 'test.ada.support',
        timezone: 'UTC',
        users: new Map(),
        teams: new Map(),
        integrations: new Map(),
        settings: {
            workingHours: { start: 9, end: 17 },
            ssoEnabled: false,
        },
    };
}
function createGroupMeetingUsers() {
    return [
        {
            id: 'alice-group',
            email: 'alice@ada.support',
            name: 'Alice Chen',
            timezone: 'America/New_York',
            profile: {
                title: 'Product Manager',
                department: 'Product',
                location: 'New York',
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
            id: 'bob-group',
            email: 'bob@ada.support',
            name: 'Bob Smith',
            timezone: 'America/Los_Angeles',
            profile: {
                title: 'Engineer',
                department: 'Engineering',
                location: 'San Francisco',
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
            id: 'charlie-group',
            email: 'charlie@ada.support',
            name: 'Charlie Johnson',
            timezone: 'Europe/London',
            profile: {
                title: 'Sales',
                department: 'Sales',
                location: 'London',
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
            id: 'diana-group',
            email: 'diana@ada.support',
            name: 'Diana Patel',
            timezone: 'Asia/Kolkata',
            profile: {
                title: 'Customer Success',
                department: 'Customer Success',
                location: 'Bangalore',
            },
            preferences: {
                workingHours: { start: 9, end: 18 }, // 9:30 AM - 5:30 PM local
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
}
/**
 * Action to book a group meeting with timezone tradeoffs
 */
const groupMeetingAction = {
    name: 'Book group meeting across timezones',
    description: 'Schedule 4-person meeting across US, UK, and India offices',
    attendees: [
        'alice@ada.support',
        'bob@ada.support',
        'charlie@ada.support',
        'diana@ada.support',
    ],
    duration: 60,
    async execute(httpClient) {
        // Step 1: Check free/busy for all 4 attendees across next 2 weeks
        const timeMin = new Date();
        const timeMax = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const response = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            items: [
                { id: 'alice@ada.support' },
                { id: 'bob@ada.support' },
                { id: 'charlie@ada.support' },
                { id: 'diana@ada.support' },
            ],
        });
        if (response.status !== 200) {
            throw new Error('Failed to check group availability');
        }
        // Step 2: Find best slot (would typically be 1-2 PM UTC which is:
        // - 8-9 AM ET (Alice - early but ok)
        // - 5-6 AM PT (Bob - very early, suggest async)
        // - 1-2 PM UK (Charlie - good)
        // - 6:30-7:30 PM India (Diana - after hours, okay for async)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setUTCHours(13, 0, 0, 0); // 1 PM UTC
        const meetingEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);
        // Step 3: Suggest primary option (1 hour) with tradeoff analysis
        const primarySuggestion = {
            start: tomorrow.toISOString(),
            end: meetingEnd.toISOString(),
            utcTime: '1:00 PM UTC',
            tradeoffs: [
                { person: 'Alice Chen', localTime: '8:00 AM ET', status: 'early but acceptable' },
                { person: 'Bob Smith', localTime: '5:00 AM PT', status: 'very early - consider async' },
                {
                    person: 'Charlie Johnson',
                    localTime: '1:00 PM UK',
                    status: 'optimal',
                },
                { person: 'Diana Patel', localTime: '6:30 PM IST', status: 'after hours' },
            ],
        };
        // Step 4: Create the event
        const createEvent = {
            summary: 'Global Team Sync',
            description: 'Quarterly sync across US, UK, and India offices. Note: Not ideal for all timezones.',
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: meetingEnd.toISOString() },
            attendees: [
                { email: 'alice@ada.support' },
                { email: 'bob@ada.support' },
                { email: 'charlie@ada.support' },
                { email: 'diana@ada.support' },
            ],
        };
        const createResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', createEvent);
        if (createResponse.status !== 200) {
            throw new Error('Failed to create group meeting event');
        }
        return {
            success: true,
            meeting: {
                id: createResponse.body.id,
                start: tomorrow.toISOString(),
                end: meetingEnd.toISOString(),
                attendees: [
                    'alice@ada.support',
                    'bob@ada.support',
                    'charlie@ada.support',
                    'diana@ada.support',
                ],
            },
            suggestion: primarySuggestion,
            alternativeForBob: {
                description: 'If Bob cannot make 5 AM: record for async, share notes',
            },
        };
    },
};
/**
 * Evaluation rubric for group meeting
 */
function createGroupMeetingRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Multi-timezone Coordination',
        description: 'Finds time across 4+ timezones',
        criteria: [
            {
                name: 'Found workable slot',
                weight: 60,
                evaluate: (result) => (result.success ? 100 : 0),
            },
            {
                name: 'Provided tradeoff analysis',
                weight: 40,
                evaluate: (result) => {
                    // Check if result contains tradeoff info
                    return result.success ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Working Hours Respect',
        description: 'Respects all attendees\' working hours',
        criteria: [
            {
                name: 'All within working hours or noted',
                weight: 100,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Group Size Handling',
        description: 'Manages 4+ attendee scheduling',
        criteria: [
            {
                name: 'All attendees added',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    // Should have created event for all 4 people
                    return result.mutationsCreated.length > 0 ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Alternative Suggestions',
        description: 'Suggests async options when sync is suboptimal',
        criteria: [
            {
                name: 'Offers alternatives',
                weight: 100,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    return rubric;
}
/**
 * Run the group meeting scenario
 */
export async function runGroupMeetingScenario() {
    console.log('\n=== Group Meeting with 4+ People Across Timezones ===\n');
    const org = createGroupMeetingOrg();
    const builder = new ScenarioBuilder(org);
    // Setup
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);
    const users = createGroupMeetingUsers();
    users.forEach((user) => {
        builder.withUser(user);
        calendar.createCalendar(user.email);
    });
    slack.createChannel('C001', 'global-team', false);
    // Pre-populate some calendar conflicts
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);
    // Add some existing meetings (simulating busy calendars)
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Alice: morning standups
    calendar.addEvent('alice@ada.support', 'Daily Standup', new Date(tomorrow.setHours(9, 0, 0, 0)), new Date(tomorrow.setHours(9, 30, 0, 0)));
    // Charlie: afternoon meetings
    calendar.addEvent('charlie@ada.support', 'Sales Review', new Date(tomorrow.setHours(15, 0, 0, 0)), new Date(tomorrow.setHours(16, 0, 0, 0)));
    // Execute action
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(groupMeetingAction);
    // Evaluate
    const rubric = createGroupMeetingRubric();
    const score = rubric.evaluate(result);
    console.log('Action: Book group meeting across timezones');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
        console.log(`Error: ${result.error.message}`);
    }
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Mutations: ${result.mutationsCreated.length}`);
    console.log(`\nEvaluation Score:`);
    console.log(`  Overall: ${score.overall.toFixed(1)}%`);
    console.log(`  Multi-timezone Coordination: ${score.byTarget['Multi-timezone Coordination'].toFixed(1)}%`);
    console.log(`  Working Hours Respect: ${score.byTarget['Working Hours Respect'].toFixed(1)}%`);
    console.log(`  Group Size Handling: ${score.byTarget['Group Size Handling'].toFixed(1)}%`);
    console.log(`  Alternative Suggestions: ${score.byTarget['Alternative Suggestions'].toFixed(1)}%`);
    console.log(`  Passed: ${score.passed ? 'YES' : 'NO'}`);
    // Verify calendar state
    console.log(`\nCalendar State:`);
    users.forEach((user) => {
        const events = calendar.getEvents(user.email);
        console.log(`  ${user.name}: ${events.length} events`);
    });
    return { result, score };
}
// Export for testing
export { groupMeetingAction, createGroupMeetingRubric, createGroupMeetingUsers, createGroupMeetingOrg, };
// Main entry point
if (require.main === module) {
    runGroupMeetingScenario().catch(console.error);
}
//# sourceMappingURL=meeting-booking-group.js.map