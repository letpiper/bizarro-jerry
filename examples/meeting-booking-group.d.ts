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
import { SimulatedHTTPClient, EvaluationRubric } from '../src/index';
import type { Organization, User } from '../src/core/types';
declare function createGroupMeetingOrg(): Organization;
declare function createGroupMeetingUsers(): User[];
/**
 * Action to book a group meeting with timezone tradeoffs
 */
declare const groupMeetingAction: {
    name: string;
    description: string;
    attendees: string[];
    duration: number;
    execute(httpClient: SimulatedHTTPClient): Promise<{
        success: boolean;
        meeting: {
            id: any;
            start: string;
            end: string;
            attendees: string[];
        };
        suggestion: {
            start: string;
            end: string;
            utcTime: string;
            tradeoffs: {
                person: string;
                localTime: string;
                status: string;
            }[];
        };
        alternativeForBob: {
            description: string;
        };
    }>;
};
/**
 * Evaluation rubric for group meeting
 */
declare function createGroupMeetingRubric(): EvaluationRubric;
/**
 * Run the group meeting scenario
 */
export declare function runGroupMeetingScenario(): Promise<{
    result: import("../src/piper-adapter").ActionResult;
    score: import("../src/piper-adapter").EvaluationScore;
}>;
export { groupMeetingAction, createGroupMeetingRubric, createGroupMeetingUsers, createGroupMeetingOrg, };
//# sourceMappingURL=meeting-booking-group.d.ts.map