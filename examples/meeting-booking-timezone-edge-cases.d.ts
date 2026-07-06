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
import { SimulatedHTTPClient, EvaluationRubric } from '../src/index';
import type { Organization, User } from '../src/core/types';
declare function createTimezoneEdgeCaseOrg(): Organization;
declare function createTimezoneEdgeCaseUsers(): User[];
/**
 * Action: Book meeting handling complex timezone scenarios
 */
declare const timezoneEdgeCaseAction: {
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
        timeConversions: {
            pt: string;
            jst: string;
            nzst: string;
        };
        edgeCases: string[];
    }>;
};
/**
 * Evaluation rubric for timezone edge cases
 */
declare function createTimezoneEdgeCaseRubric(): EvaluationRubric;
/**
 * Run the timezone edge case scenario
 */
export declare function runTimezoneEdgeCaseScenario(): Promise<{
    result: import("../src/piper-adapter").ActionResult;
    score: import("../src/piper-adapter").EvaluationScore;
}>;
export { timezoneEdgeCaseAction, createTimezoneEdgeCaseRubric, createTimezoneEdgeCaseUsers, createTimezoneEdgeCaseOrg, };
//# sourceMappingURL=meeting-booking-timezone-edge-cases.d.ts.map