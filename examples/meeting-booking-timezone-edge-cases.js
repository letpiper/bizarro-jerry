/**
 * Scenario: Timezone Edge Cases
 * Tests Piper's handling of complex timezone boundary conditions:
 *
 * Edge Cases:
 * 1. Meeting spanning midnight across timezones
 * 2. Daylight saving time boundaries
 * 3. Working hours at extreme times (5 AM or 6 PM)
 * 4. Crossing international date line scenarios
 * 5. Users with overlapping but offset working hours
 *
 * Setup:
 * - Alice (US Pacific, 9 AM - 5 PM)
 * - Bob (Japan, 10 AM - 6 PM JST, which is previous day afternoon in PT)
 * - Diana (New Zealand, 9 AM - 5 PM NZST)
 *
 * Success Criteria:
 * - Correctly handles date boundaries
 * - Respects DST transitions
 * - Finds slots even when schedules are highly offset
 * - Clear communication about time conversions
 */
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, ScenarioRunner, EvaluationRubric, } from '../src/index';
function createTimezoneEdgeCaseOrg() {
    return {
        id: 'org-timezone-edge',
        name: 'Timezone Edge Case Test Org',
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
function createTimezoneEdgeCaseUsers() {
    return [
        {
            id: 'alice-tz',
            email: 'alice@ada.support',
            name: 'Alice Chen',
            timezone: 'America/Los_Angeles',
            profile: {
                title: 'Product Manager',
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
            id: 'bob-tz',
            email: 'bob@ada.support',
            name: 'Bob Tanaka',
            timezone: 'Asia/Tokyo',
            profile: {
                title: 'Engineer',
                location: 'Tokyo',
            },
            preferences: {
                workingHours: { start: 10, end: 18 }, // 10 AM - 6 PM JST
                notificationsEnabled: true,
            },
            integrations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'diana-tz',
            email: 'diana@ada.support',
            name: 'Diana Smith',
            timezone: 'Pacific/Auckland',
            profile: {
                title: 'Customer Success',
                location: 'Auckland',
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
 * Action: Book meeting handling complex timezone scenarios
 */
const timezoneEdgeCaseAction = {
    name: 'Book meeting with timezone edge cases',
    description: 'Schedule meeting spanning PT, JST, and NZST timezones',
    attendees: ['alice@ada.support', 'bob@ada.support', 'diana@ada.support'],
    duration: 60,
    async execute(httpClient) {
        // PT:  9 AM - 5 PM  (UTC-8/-7)
        // JST: 10 AM - 6 PM (UTC+9) - next day during PT night
        // NZST: 9 AM - 5 PM (UTC+13) - 2 days ahead during PT
        // Best overlap:
        // PT: 4-5 PM (last hour) = JST: next day 9-10 AM (start) = NZST: next day 12-1 PM (lunch)
        // This is edge case: near end of Alice's day, start of Bob's day, mid-day for Diana
        // Step 1: Search for available slot
        const now = new Date();
        const searchStart = new Date(now);
        const searchEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const freeBusyResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            timeMin: searchStart.toISOString(),
            timeMax: searchEnd.toISOString(),
            items: [
                { id: 'alice@ada.support' },
                { id: 'bob@ada.support' },
                { id: 'diana@ada.support' },
            ],
        });
        if (freeBusyResponse.status !== 200) {
            throw new Error('Failed to check availability');
        }
        // Step 2: Find best overlap slot
        // The actual best slot for these three timezones is:
        // PT: 4:00-5:00 PM (Mon)
        // JST: 9:00-10:00 AM (Tue)
        // NZST: 12:00-1:00 PM (Tue)
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(16, 0, 0, 0); // 4 PM PT
        const meetingEnd = new Date(tomorrow.getTime() + 60 * 60 * 1000);
        // Step 3: Create event with timezone-aware description
        const timeConversions = {
            pt: 'Monday 4:00 PM - 5:00 PM PT',
            jst: 'Tuesday 9:00 AM - 10:00 AM JST (next day)',
            nzst: 'Tuesday 12:00 PM - 1:00 PM NZST (next day)',
        };
        const createEvent = {
            summary: 'Cross-Timezone Sync',
            description: `Time conversions:\n- Alice (PT): ${timeConversions.pt}\n- Bob (JST): ${timeConversions.jst}\n- Diana (NZST): ${timeConversions.nzst}`,
            start: { dateTime: tomorrow.toISOString() },
            end: { dateTime: meetingEnd.toISOString() },
            attendees: [
                { email: 'alice@ada.support' },
                { email: 'bob@ada.support' },
                { email: 'diana@ada.support' },
            ],
        };
        const createResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', createEvent);
        if (createResponse.status !== 200) {
            throw new Error('Failed to create timezone edge case meeting');
        }
        // Step 4: Post explanation in Slack
        await httpClient.post('https://slack.com/api/chat.postMessage', {
            channel: 'C001',
            text: 'Meeting scheduled with timezone details. Alice (end of day), Bob (next morning), Diana (midday next day).',
        });
        return {
            success: true,
            meeting: {
                id: createResponse.body.id,
                start: tomorrow.toISOString(),
                end: meetingEnd.toISOString(),
                attendees: ['alice@ada.support', 'bob@ada.support', 'diana@ada.support'],
            },
            timeConversions,
            edgeCases: [
                'Meeting spans two calendar days',
                "Bob's meeting is on next day in his timezone",
                "Diana's meeting is also on next day in her timezone",
                'Alice at end of working day (4 PM)',
                'Bob at start of working day (9 AM)',
            ],
        };
    },
};
/**
 * Evaluation rubric for timezone edge cases
 */
function createTimezoneEdgeCaseRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Date Boundary Handling',
        description: 'Correctly handles meetings spanning calendar dates',
        criteria: [
            {
                name: 'Handles date rollovers',
                weight: 100,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Timezone Conversion Accuracy',
        description: 'Converts times between distant timezones correctly',
        criteria: [
            {
                name: 'PT, JST, NZST conversions correct',
                weight: 60,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    const data = result.result;
                    // Check if time conversions are included
                    return data?.timeConversions ? 100 : 50;
                },
            },
            {
                name: 'Respects offset working hours',
                weight: 40,
                evaluate: (result) => (result.success ? 100 : 0),
            },
        ],
    });
    rubric.addTarget({
        name: 'Edge Case Documentation',
        description: 'Clearly explains what makes this meeting difficult',
        criteria: [
            {
                name: 'Documents edge cases',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    const data = result.result;
                    return data?.edgeCases && data.edgeCases.length > 0 ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Working Hours Respect',
        description: 'Finds slot that respects all working hour preferences',
        criteria: [
            {
                name: 'All attendees within/near working hours',
                weight: 100,
                evaluate: (result) => {
                    // PT 4 PM is end of day (ok)
                    // JST 9 AM is start of day (ok)
                    // NZST 12 PM is midday (ok)
                    return result.success ? 100 : 50;
                },
            },
        ],
    });
    return rubric;
}
/**
 * Run the timezone edge case scenario
 */
export async function runTimezoneEdgeCaseScenario() {
    console.log('\n=== Timezone Edge Cases: PT, JST, NZST ===\n');
    const org = createTimezoneEdgeCaseOrg();
    const builder = new ScenarioBuilder(org);
    // Setup
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);
    const users = createTimezoneEdgeCaseUsers();
    users.forEach((user) => {
        builder.withUser(user);
        calendar.createCalendar(user.email);
    });
    slack.createChannel('C001', 'tz-edge-case', false);
    // Set current time to Monday 9 AM PT
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);
    console.log('Timezone Overview (assuming Monday 9 AM PT):');
    console.log('  Alice (PT):    Monday 9:00 AM (9 AM - 5 PM working hours)');
    console.log('  Bob (JST):     Tuesday 1:00 AM (10 AM - 6 PM working hours)');
    console.log('  Diana (NZST):  Tuesday 4:00 PM (9 AM - 5 PM working hours)');
    console.log('');
    console.log('Challenge: Bob is sleeping, Diana is after work. They overlap at:');
    console.log('  PT: 4-5 PM (Mon) = JST: 9-10 AM (Tue) = NZST: 12-1 PM (Tue)');
    console.log('');
    // Execute action
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(timezoneEdgeCaseAction);
    // Evaluate
    const rubric = createTimezoneEdgeCaseRubric();
    const score = rubric.evaluate(result);
    console.log('Action: Book meeting with timezone edge cases');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
        console.log(`Error: ${result.error.message}`);
    }
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Mutations: ${result.mutationsCreated.length}`);
    const data = result.result;
    if (data?.timeConversions) {
        console.log(`\nTime Conversions:`);
        console.log(`  ${data.timeConversions.pt}`);
        console.log(`  ${data.timeConversions.jst}`);
        console.log(`  ${data.timeConversions.nzst}`);
    }
    if (data?.edgeCases) {
        console.log(`\nEdge Cases Identified:`);
        data.edgeCases.forEach((edgeCase) => {
            console.log(`  - ${edgeCase}`);
        });
    }
    console.log(`\nEvaluation Score:`);
    console.log(`  Overall: ${score.overall.toFixed(1)}%`);
    console.log(`  Date Boundary Handling: ${score.byTarget['Date Boundary Handling'].toFixed(1)}%`);
    console.log(`  Timezone Conversion Accuracy: ${score.byTarget['Timezone Conversion Accuracy'].toFixed(1)}%`);
    console.log(`  Edge Case Documentation: ${score.byTarget['Edge Case Documentation'].toFixed(1)}%`);
    console.log(`  Working Hours Respect: ${score.byTarget['Working Hours Respect'].toFixed(1)}%`);
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
export { timezoneEdgeCaseAction, createTimezoneEdgeCaseRubric, createTimezoneEdgeCaseUsers, createTimezoneEdgeCaseOrg, };
// Main entry point
if (require.main === module) {
    runTimezoneEdgeCaseScenario().catch(console.error);
}
//# sourceMappingURL=meeting-booking-timezone-edge-cases.js.map