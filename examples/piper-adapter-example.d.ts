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
import { ScenarioBuilder, CalendarIntegration, SlackIntegration, SimulatedHTTPClient, EvaluationRubric } from '../src/index';
import type { User } from '../src/core/types';
/**
 * STEP 2: Setup scenario with SimulatedWorld
 */
declare function setupScenario(): Promise<{
    builder: ScenarioBuilder;
    users: User[];
    calendar: CalendarIntegration;
    slack: SlackIntegration;
}>;
/**
 * STEP 3: Example Piper scheduler implementation
 * This is what Piper would do to schedule a meeting
 */
declare const piperMeetingScheduler: {
    schedule(options: {
        attendees: string[];
        duration: number;
        httpClient: SimulatedHTTPClient;
    }): Promise<{
        success: boolean;
        eventId: any;
        start: string;
        end: string;
        attendees: string[];
    }>;
};
/**
 * STEP 4: Create evaluation rubric
 */
declare function createEvaluationRubric(): EvaluationRubric;
/**
 * STEP 5: Run the example
 */
export declare function runPiperAdapterExample(): Promise<{
    result: import("../src/piper-adapter").ActionResult;
    score: import("../src/piper-adapter").EvaluationScore;
}>;
export { piperMeetingScheduler, createEvaluationRubric, setupScenario };
//# sourceMappingURL=piper-adapter-example.d.ts.map