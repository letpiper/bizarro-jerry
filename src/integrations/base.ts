import type { APIRequest, APIResponse } from '../core/types';
import type { HTTPInterceptor } from '../http/interceptor';

export abstract class BaseIntegration {
  protected domain: string;
  protected world: any;

  constructor(domain: string, world: any) {
    this.domain = domain;
    this.world = world;
  }

  abstract snapshot(): unknown;
  abstract handle(request: APIRequest): Promise<APIResponse>;

  registerHandler(interceptor: HTTPInterceptor): void {
    interceptor.registerHandler(this.domain, { handle: (req) => this.handle(req) });
  }

  protected recordMutation(type: string, data: unknown, userId?: string): void {
    this.world.recordMutation({
      type: `${this.domain}_${type}`,
      integration: this.domain,
      data,
      userId,
    });
  }

  protected async fireEvent(eventType: string, data: unknown): Promise<void> {
    await this.world.eventBus.fire(`${this.domain}_${eventType}`, data);
  }
}
