/**
 * Tracer: Record and query API requests
 */

import type { APIRequest, APIResponse, Trace } from '../core/types';

export class Tracer {
  private traces: Trace[] = [];
  private currentId = 0;

  startTrace(request: APIRequest): Trace {
    const trace: Trace = {
      id: `trace-${++this.currentId}`,
      request,
      startTime: new Date(),
    };
    this.traces.push(trace);
    return trace;
  }

  endTrace(trace: Trace, response: APIResponse): void {
    trace.response = response;
    trace.endTime = new Date();
    trace.duration =
      trace.endTime.getTime() - trace.startTime.getTime();
  }

  recordError(trace: Trace, error: Error): void {
    trace.error = error;
    trace.endTime = new Date();
    trace.duration =
      trace.endTime.getTime() - trace.startTime.getTime();
  }

  getAll(): Trace[] {
    return [...this.traces];
  }

  getByIntegration(hostname: string): Trace[] {
    return this.traces.filter(
      (t) =>
        t.request.url.includes(hostname) ||
        new URL(t.request.url).hostname === hostname
    );
  }

  clear(): void {
    this.traces = [];
  }

  findByMethod(method: string): Trace[] {
    return this.traces.filter((t) => t.request.method === method);
  }

  findByPath(path: string): Trace[] {
    return this.traces.filter((t) => t.request.url.includes(path));
  }
}
