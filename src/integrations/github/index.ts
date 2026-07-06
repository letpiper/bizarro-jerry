import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export class GitHubIntegration extends BaseIntegration {
  private repos: Map<string, any> = new Map();

  constructor(world: any) {
    super('api.github.com', world);
  }

  snapshot(): unknown {
    return { repoCount: this.repos.size };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    if (request.url.includes('/repos')) {
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { repos: Array.from(this.repos.values()) },
        timestamp: new Date(),
      };
    }
    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: {},
      timestamp: new Date(),
    };
  }
}

export { GitHubIntegration as default };
