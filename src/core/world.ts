/**
 * SimulatedWorld: Main orchestrator for all simulated integrations
 */

import { TimeEngine } from './time';
import { EventBus } from './events';
import type {
  User,
  Team,
  Organization,
  IntegrationConfig,
  APIRequest,
  APIResponse,
  Mutation,
  Trace,
  WorldSnapshot,
  WorldConfig,
} from './types';
import { HTTPInterceptor } from '../http/interceptor';
import { MutationLog } from '../observability/mutations';
import { Tracer } from '../observability/tracer';

export class SimulatedWorld {
  readonly time: TimeEngine;
  readonly org: Organization;
  readonly eventBus: EventBus;

  private interceptor: HTTPInterceptor;
  private tracer: Tracer;
  private mutations: MutationLog;
  private integrations: Map<string, any> = new Map();

  constructor(
    org: Organization,
    config: WorldConfig = {}
  ) {
    this.org = org;
    this.time = new TimeEngine(config.startTime || new Date());
    this.eventBus = new EventBus();
    this.interceptor = new HTTPInterceptor();
    this.tracer = new Tracer();
    this.mutations = new MutationLog();
  }

  /**
   * Initialize all integrations
   */
  async initialize(): Promise<void> {
    // Integrations will register themselves via registerIntegration
  }

  /**
   * Register an integration
   */
  registerIntegration(name: string, integration: any): void {
    this.integrations.set(name, integration);
    if (integration.registerHandler) {
      integration.registerHandler(this.interceptor);
    }
  }

  /**
   * Get an integration
   */
  getIntegration<T = any>(name: string): T {
    const integration = this.integrations.get(name);
    if (!integration) {
      throw new Error(`Integration ${name} not registered`);
    }
    return integration as T;
  }

  /**
   * Handle API request (entry point for mocked HTTP calls)
   */
  async handleAPIRequest(request: APIRequest): Promise<APIResponse> {
    const trace = this.tracer.startTrace(request);
    try {
      const response = await this.interceptor.intercept(request);
      this.tracer.endTrace(trace, response);
      return response;
    } catch (error) {
      this.tracer.recordError(trace, error as Error);
      throw error;
    }
  }

  /**
   * Get current time
   */
  getCurrentTime(): Date {
    return this.time.now;
  }

  /**
   * Advance time
   */
  advanceTime(delta: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }): Date {
    return this.time.advance(delta);
  }

  /**
   * Record a mutation
   */
  recordMutation(mutation: Omit<Mutation, 'timestamp'>): void {
    this.mutations.record({
      ...mutation,
      timestamp: this.time.now,
    });
  }

  /**
   * Get mutations
   */
  getMutations(integration?: string): Mutation[] {
    return this.mutations.getAll(integration);
  }

  /**
   * Get traces
   */
  getTraces(): Trace[] {
    return this.tracer.getAll();
  }

  /**
   * Create a world snapshot
   */
  snapshot(): WorldSnapshot {
    return {
      timestamp: this.time.now,
      organization: this.org,
      integrations: Array.from(this.integrations.entries()).map(
        ([name, integration]) => ({
          name,
          snapshot: integration.snapshot?.() || {},
        })
      ),
    };
  }

  /**
   * Get HTTP mock client for injecting into code
   */
  getHTTPClient(): HTTPClient {
    return {
      request: (req: APIRequest) => this.handleAPIRequest(req),
    };
  }
}

export interface HTTPClient {
  request(request: APIRequest): Promise<APIResponse>;
}
