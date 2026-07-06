/**
 * MultiTurnSession: Manages multi-turn conversations and state
 */

import { SimulatedWorld } from '../core/world';
import type { Mutation, Trace } from '../core/types';

export interface Turn {
  input: string;
  output?: string;
  error?: Error;
  timestamp: Date;
  mutationsBefore: number;
  mutationsAfter: number;
  tracesBefore: number;
  tracesAfter: number;
}

export class MultiTurnSession {
  private world: SimulatedWorld;
  private history: Turn[] = [];
  private startTime: Date;

  constructor(world: SimulatedWorld) {
    this.world = world;
    this.startTime = new Date();
  }

  /**
   * Add a turn to the conversation
   */
  async addTurn(input: string): Promise<Turn> {
    const mutationsBefore = this.world.getMutations().length;
    const tracesBefore = this.world.getTraces().length;
    const timestamp = new Date();

    let output: string | undefined;
    let error: Error | undefined;

    try {
      // For now, simulate a simple processing step
      // In a real scenario, this would call Piper or another agent
      output = await this.processTurn(input);
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
    }

    const mutationsAfter = this.world.getMutations().length;
    const tracesAfter = this.world.getTraces().length;

    const turn: Turn = {
      input,
      output,
      error,
      timestamp,
      mutationsBefore,
      mutationsAfter,
      tracesBefore,
      tracesAfter,
    };

    this.history.push(turn);
    return turn;
  }

  /**
   * Process a single turn (to be overridden in subclasses)
   */
  private async processTurn(input: string): Promise<string> {
    // This is a placeholder that can be extended
    // In a real scenario, this would call Piper's API
    return `Processed: ${input}`;
  }

  /**
   * Get conversation history
   */
  getHistory(): Turn[] {
    return [...this.history];
  }

  /**
   * Get specific turn
   */
  getTurn(index: number): Turn | undefined {
    return this.history[index];
  }

  /**
   * Get the last turn
   */
  getLastTurn(): Turn | undefined {
    return this.history[this.history.length - 1];
  }

  /**
   * Get mutations since start
   */
  getMutations(): Mutation[] {
    return this.world.getMutations();
  }

  /**
   * Get traces since start
   */
  getTraces(): Trace[] {
    return this.world.getTraces();
  }

  /**
   * Get mutations for a specific turn
   */
  getTurnMutations(turnIndex: number): Mutation[] {
    const turn = this.history[turnIndex];
    if (!turn) return [];

    const allMutations = this.world.getMutations();
    return allMutations.slice(turn.mutationsBefore, turn.mutationsAfter);
  }

  /**
   * Compute metrics for the session
   */
  getMetrics() {
    const totalTurns = this.history.length;
    const totalMutations = this.world.getMutations().length;
    const totalTraces = this.world.getTraces().length;
    const errorCount = this.history.filter((t) => t.error).length;
    const averageLatency =
      this.history.length > 0
        ? this.history.reduce((sum, t, i, arr) => {
            if (i === 0) return 0;
            const prev = arr[i - 1];
            return sum + (t.timestamp.getTime() - prev.timestamp.getTime());
          }, 0) / (this.history.length - 1)
        : 0;

    return {
      totalTurns,
      totalMutations,
      totalTraces,
      errorCount,
      successRate: ((totalTurns - errorCount) / totalTurns) * 100,
      averageLatencyMs: averageLatency,
      sessionDuration: new Date().getTime() - this.startTime.getTime(),
    };
  }

  /**
   * Verify state consistency
   */
  verifyStateConsistency(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Verify mutations are chronologically ordered
    const mutations = this.world.getMutations();
    for (let i = 1; i < mutations.length; i++) {
      if (mutations[i].timestamp < mutations[i - 1].timestamp) {
        issues.push(`Mutation ${i} has earlier timestamp than ${i - 1}`);
      }
    }

    // Verify traces are valid
    const traces = this.world.getTraces();
    for (const trace of traces) {
      if (!trace.request) {
        issues.push(`Trace ${trace.id} has no request`);
      }
      if (trace.endTime && trace.startTime && trace.endTime < trace.startTime) {
        issues.push(`Trace ${trace.id} ends before it starts`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Clear history
   */
  reset(): void {
    this.history = [];
    this.startTime = new Date();
  }
}
