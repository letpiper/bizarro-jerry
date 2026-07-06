/**
 * ScenarioExecutor: Runs scenarios deterministically and captures metrics
 */

import { ScenarioBuilder } from './builder';
import { MultiTurnSession } from './session';
import type { Organization } from '../core/types';

export interface ScenarioDefinition {
  name: string;
  description?: string;
  setup: (builder: ScenarioBuilder) => Promise<void> | void;
  execute: (builder: ScenarioBuilder) => Promise<void> | void;
  verify?: (builder: ScenarioBuilder) => Promise<boolean> | boolean;
}

export interface ExecutionResult {
  scenarioName: string;
  success: boolean;
  error?: Error;
  metrics: {
    duration: number;
    turns: number;
    mutations: number;
    traces: number;
    mutationsByType: Record<string, number>;
  };
  verificationPassed?: boolean;
  details: string;
}

export class ScenarioExecutor {
  private results: ExecutionResult[] = [];

  /**
   * Run a scenario
   */
  async run(scenario: ScenarioDefinition, org: Organization): Promise<ExecutionResult> {
    const startTime = Date.now();
    const builder = new ScenarioBuilder(org);

    let success = false;
    let error: Error | undefined;
    let verificationPassed: boolean | undefined;

    try {
      // Setup
      await Promise.resolve(scenario.setup(builder));

      // Get mutations before execution
      const mutationsBefore = builder.getMutations().length;

      // Execute
      await Promise.resolve(scenario.execute(builder));

      // Verify if verification function provided
      if (scenario.verify) {
        verificationPassed = await Promise.resolve(scenario.verify(builder));
        if (!verificationPassed) {
          throw new Error('Verification failed');
        }
      }

      success = true;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    const duration = Date.now() - startTime;
    const session = builder.getSession();
    const metrics = session.getMetrics();
    const allMutations = builder.getMutations();

    // Count mutations by type
    const mutationsByType: Record<string, number> = {};
    for (const mutation of allMutations) {
      mutationsByType[mutation.type] = (mutationsByType[mutation.type] || 0) + 1;
    }

    const result: ExecutionResult = {
      scenarioName: scenario.name,
      success: success && !error,
      error,
      metrics: {
        duration,
        turns: metrics.totalTurns,
        mutations: metrics.totalMutations,
        traces: metrics.totalTraces,
        mutationsByType,
      },
      verificationPassed,
      details: error?.message || 'Scenario completed successfully',
    };

    this.results.push(result);
    return result;
  }

  /**
   * Run multiple scenarios
   */
  async runAll(scenarios: ScenarioDefinition[], org: Organization): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    for (const scenario of scenarios) {
      const result = await this.run(scenario, org);
      results.push(result);
    }
    return results;
  }

  /**
   * Get execution results
   */
  getResults(): ExecutionResult[] {
    return [...this.results];
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.success).length;
    const verified = this.results.filter((r) => r.verificationPassed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.metrics.duration, 0);
    const totalMutations = this.results.reduce((sum, r) => sum + r.metrics.mutations, 0);

    return {
      total,
      passed,
      failed: total - passed,
      verified,
      successRate: ((passed / total) * 100).toFixed(2) + '%',
      totalDuration,
      totalMutations,
      averageDuration: total > 0 ? totalDuration / total : 0,
    };
  }

  /**
   * Clear results
   */
  clearResults(): void {
    this.results = [];
  }
}
