/**
 * Piper Integration Adapter: Connects Piper to SimulatedWorld
 */

import { SimulatedWorld } from '../core/world';
import type { APIRequest, APIResponse } from '../core/types';

/**
 * HTTPClient that can be injected into Piper
 * Allows Piper to make HTTP calls that are intercepted by SimulatedWorld
 */
export class SimulatedHTTPClient {
  private world: SimulatedWorld;

  constructor(world: SimulatedWorld) {
    this.world = world;
  }

  /**
   * Make an HTTP request through the simulated world
   */
  async request(request: APIRequest): Promise<APIResponse> {
    return this.world.handleAPIRequest(request);
  }

  /**
   * Helper to make a GET request
   */
  async get(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request({
      method: 'GET',
      url,
      headers,
      timestamp: new Date(),
    });
  }

  /**
   * Helper to make a POST request
   */
  async post(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    return this.request({
      method: 'POST',
      url,
      body,
      headers: { 'content-type': 'application/json', ...headers },
      timestamp: new Date(),
    });
  }

  /**
   * Helper to make a PUT request
   */
  async put(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    return this.request({
      method: 'PUT',
      url,
      body,
      headers: { 'content-type': 'application/json', ...headers },
      timestamp: new Date(),
    });
  }

  /**
   * Helper to make a PATCH request
   */
  async patch(
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    return this.request({
      method: 'PATCH',
      url,
      body,
      headers: { 'content-type': 'application/json', ...headers },
      timestamp: new Date(),
    });
  }

  /**
   * Helper to make a DELETE request
   */
  async delete(url: string, headers?: Record<string, string>): Promise<APIResponse> {
    return this.request({
      method: 'DELETE',
      url,
      headers,
      timestamp: new Date(),
    });
  }
}

/**
 * ScenarioRunner: Executes Piper against a scenario
 */
export class ScenarioRunner {
  private world: SimulatedWorld;
  private httpClient: SimulatedHTTPClient;

  constructor(world: SimulatedWorld) {
    this.world = world;
    this.httpClient = new SimulatedHTTPClient(world);
  }

  /**
   * Get the HTTP client for injection into Piper
   */
  getHTTPClient(): SimulatedHTTPClient {
    return this.httpClient;
  }

  /**
   * Get the world for accessing state
   */
  getWorld(): SimulatedWorld {
    return this.world;
  }

  /**
   * Execute an action and collect results
   */
  async executeAction(action: PiperAction): Promise<ActionResult> {
    const startTime = Date.now();
    const mutationsBefore = this.world.getMutations().length;

    try {
      const result = await action.execute(this.httpClient);

      const duration = Date.now() - startTime;
      const mutationsAfter = this.world.getMutations().length;
      const mutations = this.world.getMutations().slice(mutationsBefore, mutationsAfter);

      return {
        success: true,
        result,
        duration,
        mutationsCreated: mutations,
        error: undefined,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        result: undefined,
        duration,
        mutationsCreated: [],
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export interface PiperAction {
  name: string;
  execute(httpClient: SimulatedHTTPClient): Promise<unknown>;
}

export interface ActionResult {
  success: boolean;
  result?: unknown;
  error?: Error;
  duration: number;
  mutationsCreated: any[];
}

/**
 * EvaluationRubric: Scores responses against target experiences
 */
export interface TargetExperience {
  name: string;
  description: string;
  criteria: EvaluationCriterion[];
}

export interface EvaluationCriterion {
  name: string;
  weight: number;
  evaluate(result: ActionResult): number; // Returns 0-100 score
}

export class EvaluationRubric {
  private targets: TargetExperience[] = [];

  addTarget(target: TargetExperience): void {
    this.targets.push(target);
  }

  /**
   * Evaluate an action against all targets
   */
  evaluate(result: ActionResult): EvaluationScore {
    const scores: Record<string, number> = {};

    for (const target of this.targets) {
      let totalScore = 0;
      let totalWeight = 0;

      for (const criterion of target.criteria) {
        const criterionScore = criterion.evaluate(result);
        const weightedScore = (criterionScore * criterion.weight) / 100;
        totalScore += weightedScore;
        totalWeight += criterion.weight;
      }

      const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
      scores[target.name] = normalizedScore;
    }

    const overallScore =
      Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.keys(scores).length;

    return {
      overall: overallScore,
      byTarget: scores,
      passed: overallScore >= 70, // 70% threshold
    };
  }
}

export interface EvaluationScore {
  overall: number;
  byTarget: Record<string, number>;
  passed: boolean;
}
