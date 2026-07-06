/**
 * HTTPInterceptor: Routes API requests to appropriate integration handlers
 */

import type { APIRequest, APIResponse } from '../core/types';

export class HTTPInterceptor {
  private handlers: Map<string, APIHandler> = new Map();

  registerHandler(domain: string, handler: APIHandler): void {
    this.handlers.set(domain, handler);
  }

  getHandler(url: string): APIHandler | undefined {
    const domain = this.extractDomain(url);
    if (!domain) return undefined;
    return this.handlers.get(domain);
  }

  async intercept(request: APIRequest): Promise<APIResponse> {
    const handler = this.getHandler(request.url);
    if (!handler) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: `No handler for domain in URL: ${request.url}` },
        timestamp: new Date(),
      };
    }

    try {
      return await handler.handle(request);
    } catch (error) {
      return {
        status: 500,
        headers: { 'content-type': 'application/json' },
        body: {
          error: error instanceof Error ? error.message : 'Internal error',
        },
        timestamp: new Date(),
      };
    }
  }

  private extractDomain(url: string): string | null {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return null;
    }
  }
}

export interface APIHandler {
  handle(request: APIRequest): Promise<APIResponse>;
}
