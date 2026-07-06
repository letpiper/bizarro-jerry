/**
 * Example: Meeting Scheduling Scenario
 * Demonstrates using SimulatedWorld to test Piper's meeting scheduling
 */
import { ScenarioBuilder, EvaluationRubric } from '../src/index';
/**
 * Example scenario: Basic 1-on-1 meeting
 */
declare const basicMeetingScenario: {
    name: string;
    description: string;
    setup: (builder: ScenarioBuilder) => Promise<void>;
    execute: (builder: ScenarioBuilder) => Promise<void>;
    verify: (builder: ScenarioBuilder) => Promise<boolean>;
};
/**
 * Example scenario: Group meeting with timezone conflicts
 */
declare const groupMeetingScenario: {
    name: string;
    description: string;
    setup: (builder: ScenarioBuilder) => Promise<void>;
    execute: (builder: ScenarioBuilder) => Promise<void>;
    verify: (builder: ScenarioBuilder) => Promise<boolean>;
};
/**
 * Example scenario: Complex meeting with conflicts
 */
declare const conflictResolutionScenario: {
    name: string;
    description: string;
    setup: (builder: ScenarioBuilder) => Promise<void>;
    execute: (builder: ScenarioBuilder) => Promise<void>;
    verify: (builder: ScenarioBuilder) => Promise<boolean>;
};
/**
 * Run all scenarios and evaluate
 */
declare function runMeetingSchedulingEvaluation(): Promise<void>;
/**
 * Example: Using with Piper HTTP Client
 */
declare function demonstratePiperIntegration(): Promise<void>;
/**
 * Evaluation rubric for Piper's meeting scheduling
 */
declare function createMeetingSchedulingRubric(): EvaluationRubric;
export { runMeetingSchedulingEvaluation, demonstratePiperIntegration, createMeetingSchedulingRubric, basicMeetingScenario, groupMeetingScenario, conflictResolutionScenario, };
//# sourceMappingURL=meeting-scheduling.d.ts.map