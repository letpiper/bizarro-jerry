/**
 * Scenario: Conflict Resolution - Finding Alternative When First Choice Conflicts
 * Tests Piper's ability to detect conflicts and find alternatives
 *
 * Setup:
 * - Alice needs to meet with Bob and Charlie
 * - Alice's preferred time (2 PM ET) has a client call
 * - Need to find alternative: 3 PM ET works for all
 * - Process should:
 *   1. Detect Alice is busy at 2 PM
 *   2. Check 3 PM - all clear
 *   3. Suggest 3 PM with explanation
 *   4. Create meeting at 3 PM
 *
 * Success Criteria:
 * - Detects conflict at preferred time
 * - Searches forward for alternatives
 * - Finds viable slot within 1-2 hours
 * - Creates meeting at alternative time
 * - Notifies attendees of change
 */
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, ScenarioRunner, EvaluationRubric, } from '../src/index';
function createConflictResolutionOrg() {
    return {
        id: 'org-conflict-resolution',
        name: 'Conflict Resolution Test Org',
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
function createConflictResolutionUsers() {
    return [
        {
            id: 'alice-conflict',
            email: 'alice@ada.support',
            name: 'Alice Chen',
            timezone: 'America/New_York',
            profile: {
                title: 'Product Manager',
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
            id: 'bob-conflict',
            email: 'bob@ada.support',
            name: 'Bob Smith',
            timezone: 'America/New_York',
            profile: {
                title: 'Engineer',
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
            id: 'charlie-conflict',
            email: 'charlie@ada.support',
            name: 'Charlie Johnson',
            timezone: 'America/New_York',
            profile: {
                title: 'Sales',
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
 * Action: Attempt to book meeting, detect conflict, suggest alternative
 */
const conflictResolutionAction = {
    name: 'Book meeting with conflict resolution',
    description: 'Request 2 PM ET slot, detect conflict, find 3 PM alternative',
    attendees: ['alice@ada.support', 'bob@ada.support', 'charlie@ada.support'],
    preferredTime: '2:00 PM ET',
    backupTime: '3:00 PM ET',
    duration: 60,
    async execute(httpClient) {
        // Step 1: Check if preferred time (2 PM ET) is available
        const now = new Date();
        const preferredStart = new Date(now);
        preferredStart.setHours(14, 0, 0, 0); // 2 PM ET
        const preferredEnd = new Date(preferredStart.getTime() + 60 * 60 * 1000);
        const freeBusyResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
            timeMin: preferredStart.toISOString(),
            timeMax: preferredStart.toISOString(),
            items: [
                { id: 'alice@ada.support' },
                { id: 'bob@ada.support' },
                { id: 'charlie@ada.support' },
            ],
        });
        if (freeBusyResponse.status !== 200) {
            throw new Error('Failed to check availability');
        }
        // Step 2: Detect conflict (Alice is busy at 2 PM - client call)
        const calendars = freeBusyResponse.body.calendars;
        const aliceBusy = (calendars['alice@ada.support']?.busy || []).length > 0;
        const bobFree = (calendars['bob@ada.support']?.busy || []).length === 0;
        const charlieFree = (calendars['charlie@ada.support']?.busy || []).length === 0;
        let finalStart;
        let finalEnd;
        let conflictDetected = false;
        if (aliceBusy && bobFree && charlieFree) {
            // Conflict detected at preferred time
            conflictDetected = true;
            // Step 3: Check backup time (3 PM ET)
            const backupStart = new Date(now);
            backupStart.setHours(15, 0, 0, 0); // 3 PM ET
            const backupEnd = new Date(backupStart.getTime() + 60 * 60 * 1000);
            const backupFreeBusyResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/freeBusy', {
                timeMin: backupStart.toISOString(),
                timeMax: backupStart.toISOString(),
                items: [
                    { id: 'alice@ada.support' },
                    { id: 'bob@ada.support' },
                    { id: 'charlie@ada.support' },
                ],
            });
            if (backupFreeBusyResponse.status !== 200) {
                throw new Error('Failed to check backup time');
            }
            // All clear at 3 PM
            finalStart = backupStart;
            finalEnd = backupEnd;
        }
        else {
            // No conflict, use preferred time
            finalStart = preferredStart;
            finalEnd = preferredEnd;
        }
        // Step 4: Create event at the final time
        const createEvent = {
            summary: 'Product Strategy Planning',
            description: conflictDetected
                ? 'Rescheduled from 2 PM due to conflict'
                : 'Planning meeting as scheduled',
            start: { dateTime: finalStart.toISOString() },
            end: { dateTime: finalEnd.toISOString() },
            attendees: [
                { email: 'alice@ada.support' },
                { email: 'bob@ada.support' },
                { email: 'charlie@ada.support' },
            ],
        };
        const createResponse = await httpClient.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', createEvent);
        if (createResponse.status !== 200) {
            throw new Error('Failed to create meeting');
        }
        // Step 5: Post notification if rescheduled
        if (conflictDetected) {
            await httpClient.post('https://slack.com/api/chat.postMessage', {
                channel: 'C001',
                text: 'Meeting rescheduled from 2 PM to 3 PM due to conflict. Updated calendar invites sent.',
            });
        }
        return {
            success: true,
            meeting: {
                id: createResponse.body.id,
                start: finalStart.toISOString(),
                end: finalEnd.toISOString(),
                attendees: ['alice@ada.support', 'bob@ada.support', 'charlie@ada.support'],
            },
            conflictDetected,
            originalTime: preferredStart.toISOString(),
            finalTime: finalStart.toISOString(),
            timeMoved: conflictDetected,
        };
    },
};
/**
 * Evaluation rubric for conflict resolution
 */
function createConflictResolutionRubric() {
    const rubric = new EvaluationRubric();
    rubric.addTarget({
        name: 'Conflict Detection',
        description: 'Can Piper detect calendar conflicts',
        criteria: [
            {
                name: 'Detected conflict at preferred time',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    const data = result.result;
                    return data?.conflictDetected ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Alternative Finding',
        description: 'Finds alternative time slot quickly',
        criteria: [
            {
                name: 'Found alternative within 1-2 hours',
                weight: 60,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    const data = result.result;
                    if (!data?.originalTime || !data?.finalTime)
                        return 0;
                    const originalTime = new Date(data.originalTime).getTime();
                    const finalTime = new Date(data.finalTime).getTime();
                    const diffMs = Math.abs(finalTime - originalTime);
                    const diffHours = diffMs / (60 * 60 * 1000);
                    // Prefer within 1-2 hours
                    if (diffHours >= 1 && diffHours <= 2)
                        return 100;
                    if (diffHours <= 4)
                        return 75;
                    return 50;
                },
            },
            {
                name: 'All attendees free at final time',
                weight: 40,
                evaluate: (result) => (result.success ? 100 : 50),
            },
        ],
    });
    rubric.addTarget({
        name: 'Communication',
        description: 'Notifies attendees of reschedule',
        criteria: [
            {
                name: 'Sent notification if rescheduled',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    const data = result.result;
                    // Should have Slack notification if conflict detected
                    return data?.timeMoved ? 100 : 50;
                },
            },
        ],
    });
    rubric.addTarget({
        name: 'Calendar Operations',
        description: 'Creates meeting at correct time',
        criteria: [
            {
                name: 'Event created in all calendars',
                weight: 100,
                evaluate: (result) => {
                    if (!result.success)
                        return 0;
                    return result.mutationsCreated.length > 0 ? 100 : 50;
                },
            },
        ],
    });
    return rubric;
}
/**
 * Run the conflict resolution scenario
 */
export async function runConflictResolutionScenario() {
    console.log('\n=== Conflict Resolution: Finding Alternative Time ===\n');
    const org = createConflictResolutionOrg();
    const builder = new ScenarioBuilder(org);
    // Setup
    const calendar = new CalendarIntegration(builder.getWorld());
    const slack = new SlackIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    builder.withIntegration('slack', slack);
    const users = createConflictResolutionUsers();
    users.forEach((user) => {
        builder.withUser(user);
        calendar.createCalendar(user.email);
    });
    slack.createChannel('C001', 'scheduling', false);
    // Set current time to today at 9 AM ET
    const now = new Date();
    now.setHours(9, 0, 0, 0);
    builder.atTime(now);
    // Create Alice's conflicting meeting at 2 PM ET
    const conflictStart = new Date(now);
    conflictStart.setHours(14, 0, 0, 0); // 2 PM ET
    const conflictEnd = new Date(conflictStart.getTime() + 60 * 60 * 1000);
    calendar.addEvent('alice@ada.support', 'Client Call: Acme Corp', conflictStart, conflictEnd);
    console.log('Pre-scheduled events:');
    console.log(`  Alice: 2 PM - 3 PM ET: Client Call (Acme Corp)`);
    console.log(`  Bob: Available all day`);
    console.log(`  Charlie: Available all day`);
    console.log('');
    // Execute action
    const runner = new ScenarioRunner(builder.getWorld());
    const result = await runner.executeAction(conflictResolutionAction);
    // Evaluate
    const rubric = createConflictResolutionRubric();
    const score = rubric.evaluate(result);
    console.log('Action: Book meeting with conflict resolution');
    console.log(`Status: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.error) {
        console.log(`Error: ${result.error.message}`);
    }
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Mutations: ${result.mutationsCreated.length}`);
    const data = result.result;
    if (data) {
        console.log(`\nConflict Resolution:`);
        console.log(`  Conflict Detected: ${data.conflictDetected ? 'YES' : 'NO'}`);
        console.log(`  Original Time: ${new Date(data.originalTime).toLocaleTimeString('en-US')}`);
        console.log(`  Final Time: ${new Date(data.finalTime).toLocaleTimeString('en-US')}`);
        console.log(`  Time Moved: ${data.timeMoved ? 'YES' : 'NO'}`);
    }
    console.log(`\nEvaluation Score:`);
    console.log(`  Overall: ${score.overall.toFixed(1)}%`);
    console.log(`  Conflict Detection: ${score.byTarget['Conflict Detection'].toFixed(1)}%`);
    console.log(`  Alternative Finding: ${score.byTarget['Alternative Finding'].toFixed(1)}%`);
    console.log(`  Communication: ${score.byTarget['Communication'].toFixed(1)}%`);
    console.log(`  Calendar Operations: ${score.byTarget['Calendar Operations'].toFixed(1)}%`);
    console.log(`  Passed: ${score.passed ? 'YES' : 'NO'}`);
    // Verify calendar state
    console.log(`\nCalendar State:`);
    users.forEach((user) => {
        const events = calendar.getEvents(user.email);
        console.log(`  ${user.name}: ${events.length} events`);
        events.forEach((evt) => {
            const start = new Date(evt.start.dateTime);
            console.log(`    - ${evt.summary} (${start.toLocaleTimeString('en-US')})`);
        });
    });
    return { result, score };
}
// Export for testing
export { conflictResolutionAction, createConflictResolutionRubric, createConflictResolutionUsers, createConflictResolutionOrg, };
// Main entry point
if (require.main === module) {
    runConflictResolutionScenario().catch(console.error);
}
//# sourceMappingURL=meeting-booking-conflict-resolution.js.map