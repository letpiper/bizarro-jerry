import type { Mutation } from '../core/types';

export class MutationLog {
  private mutations: Mutation[] = [];

  record(mutation: Mutation): void {
    this.mutations.push(mutation);
  }

  getAll(integration?: string): Mutation[] {
    if (!integration) return [...this.mutations];
    return this.mutations.filter((m) => m.integration === integration);
  }

  getByType(type: string): Mutation[] {
    return this.mutations.filter((m) => m.type === type);
  }

  getByUser(userId: string): Mutation[] {
    return this.mutations.filter((m) => m.userId === userId);
  }

  getSince(timestamp: Date): Mutation[] {
    return this.mutations.filter((m) => m.timestamp >= timestamp);
  }

  clear(): void {
    this.mutations = [];
  }

  getCount(): number {
    return this.mutations.length;
  }
}
