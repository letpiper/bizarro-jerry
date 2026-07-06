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
import { SimulatedHTTPClient, EvaluationRubric } from '../src/index';
import type { Organization, User } from '../src/core/types';
declare function createBasicMeetingOrg(): Organization;
declare function createBasicMeetingUsers(): User[];
/**
 * Piper action that would book a basic 1-on-1 meeting
 */
declare const basicMeetingAction: {
    name: string;
    description: string;
    attendees: string[];
    duration: number;
    preferredTime: null;
    execute(httpClient: SimulatedHTTPClient): Promise<{
        success: boolean;
        meeting: {
            id: any;
            start: string;
            end: string;
            attendees: string[];
        };
    }>;
};
/**
 * Evaluation rubric for basic 1-on-1 meeting
 */
declare function createBasicMeetingRubric(): EvaluationRubric;
/**
 * Run the basic meeting scenario
 */
export declare function runBasicMeetingScenario(): Promise<{
    result: import("../src/piper-adapter").ActionResult;
    score: import("../src/piper-adapter").EvaluationScore;
}>;
export { basicMeetingAction, createBasicMeetingRubric, createBasicMeetingUsers, createBasicMeetingOrg };
//# sourceMappingURL=meeting-booking-basic.d.ts.map