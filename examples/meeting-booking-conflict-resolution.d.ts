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
import { SimulatedHTTPClient, EvaluationRubric } from '../src/index';
import type { Organization, User } from '../src/core/types';
declare function createConflictResolutionOrg(): Organization;
declare function createConflictResolutionUsers(): User[];
/**
 * Action: Attempt to book meeting, detect conflict, suggest alternative
 */
declare const conflictResolutionAction: {
    name: string;
    description: string;
    attendees: string[];
    preferredTime: string;
    backupTime: string;
    duration: number;
    execute(httpClient: SimulatedHTTPClient): Promise<{
        success: boolean;
        meeting: {
            id: any;
            start: string;
            end: string;
            attendees: string[];
        };
        conflictDetected: boolean;
        originalTime: string;
        finalTime: string;
        timeMoved: boolean;
    }>;
};
/**
 * Evaluation rubric for conflict resolution
 */
declare function createConflictResolutionRubric(): EvaluationRubric;
/**
 * Run the conflict resolution scenario
 */
export declare function runConflictResolutionScenario(): Promise<{
    result: import("../src/piper-adapter").ActionResult;
    score: import("../src/piper-adapter").EvaluationScore;
}>;
export { conflictResolutionAction, createConflictResolutionRubric, createConflictResolutionUsers, createConflictResolutionOrg, };
//# sourceMappingURL=meeting-booking-conflict-resolution.d.ts.map