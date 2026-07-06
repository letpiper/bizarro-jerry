/**
 * ScenarioBuilder: Fluent DSL for building and executing test scenarios
 */

import { SimulatedWorld } from '../core/world';
import type { User, Organization, APIRequest, APIResponse } from '../core/types';
import { MultiTurnSession, type Turn } from './session';

export class ScenarioBuilder {
  private world: SimulatedWorld;
  private session: MultiTurnSession;
  private baseOrg: Organization;

  constructor(org: Organization) {
    this.baseOrg = org;
    this.world = new SimulatedWorld(org);
    this.session = new MultiTurnSession(this.world);
  }

  /**
   * Add a user to the scenario
   */
  withUser(user: User): this {
    this.baseOrg.users.set(user.id, user);
    return this;
  }

  /**
   * Add a Slack channel
   */
  withSlackChannel(channelId: string, channelName: string, isPrivate: boolean = false): this {
    const slack = this.world.getIntegration('slack');
    if (slack && slack.createChannel) {
      slack.createChannel(channelId, channelName, isPrivate);
    }
    return this;
  }

  /**
   * Add a calendar event
   */
  withCalendarEvent(
    email: string,
    summary: string,
    start: Date,
    end: Date
  ): this {
    const calendar = this.world.getIntegration('calendar');
    if (calendar && calendar.addEvent) {
      calendar.addEvent(email, summary, start, end);
    }
    return this;
  }

  /**
   * Set the current time
   */
  atTime(date: Date): this {
    this.world.time.setTime(date);
    return this;
  }

  /**
   * Advance time by a delta
   */
  advanceTime(delta: { days?: number; hours?: number; minutes?: number; seconds?: number }): this {
    this.world.advanceTime(delta);
    return this;
  }

  /**
   * Register an integration
   */
  withIntegration(name: string, integration: any): this {
    this.world.registerIntegration(name, integration);
    return this;
  }

  /**
   * Execute a single turn: send a message and get response
   */
  async runTurn(message: string): Promise<TurnResult> {
    const mutationsBefore = this.world.getMutations().length;
    const turn = await this.session.addTurn(message);
    const mutationsAfter = this.world.getMutations().length;
    const mutations = this.world.getMutations().slice(mutationsBefore, mutationsAfter);

    return {
      ...turn,
      mutationsCreated: mutations.map((m) => m.type),
    };
  }

  /**
   * Execute multiple turns
   */
  async runTurns(messages: string[]): Promise<TurnResult[]> {
    const results: TurnResult[] = [];
    for (const message of messages) {
      const result = await this.runTurn(message);
      results.push(result);
    }
    return results;
  }

  /**
   * Verify that a mutation of a given type occurred
   */
  assertMutationOccurred(type: string, count: number = 1): boolean {
    const mutations = this.world.getMutations();
    const matching = mutations.filter((m) => m.type === type);
    return matching.length >= count;
  }

  /**
   * Get all mutations
   */
  getMutations(integration?: string) {
    return this.world.getMutations(integration);
  }

  /**
   * Get all traces
   */
  getTraces() {
    return this.world.getTraces();
  }

  /**
   * Get current world snapshot
   */
  getSnapshot() {
    return this.world.snapshot();
  }

  /**
   * Get the world
   */
  getWorld(): SimulatedWorld {
    return this.world;
  }

  /**
   * Get the session
   */
  getSession(): MultiTurnSession {
    return this.session;
  }
}

export interface TurnResult extends Turn {
  mutationsCreated: string[];
}
