import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface LinearIssue {
  id: string;
  title: string;
  description?: string;
  state: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export class LinearIntegration extends BaseIntegration {
  private issues: Map<string, LinearIssue> = new Map();
  private issueId = 0;

  constructor(world: any) {
    super('api.linear.app', world);
  }

  snapshot(): unknown {
    return { issueCount: this.issues.size };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    if (request.url.includes('graphql')) {
      return this.handleGraphQL(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not found' },
      timestamp: new Date(),
    };
  }

  private handleGraphQL(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const query = body.query || '';

    if (query.includes('issues')) {
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: {
          data: {
            issues: {
              nodes: Array.from(this.issues.values()),
            },
          },
        },
        timestamp: new Date(),
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: {} },
      timestamp: new Date(),
    };
  }

  createIssue(title: string, description?: string): string {
    const id = `LIN-${++this.issueId}`;
    const issue: LinearIssue = {
      id,
      title,
      description,
      state: 'todo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.issues.set(id, issue);
    this.recordMutation('issue_created', { id, title });
    return id;
  }

  getIssues(): LinearIssue[] {
    return Array.from(this.issues.values());
  }
}
