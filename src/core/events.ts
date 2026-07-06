/**
 * EventBus: Cross-integration consistency
 */

import type { EventListener } from './types';

export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventLog: Array<{ type: string; timestamp: Date; data: unknown }> =
    [];

  /**
   * Register a listener for an event type
   */
  on(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  /**
   * Fire an event synchronously
   */
  async fire(eventType: string, data: unknown = {}): Promise<void> {
    this.eventLog.push({ type: eventType, timestamp: new Date(), data });

    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    // Fire all listeners, wait for all to complete
    await Promise.all(Array.from(listeners).map((l) => Promise.resolve(l(data))));
  }

  /**
   * Get all events of a type
   */
  getEvents(eventType?: string): Array<{
    type: string;
    timestamp: Date;
    data: unknown;
  }> {
    if (!eventType) return this.eventLog;
    return this.eventLog.filter((e) => e.type === eventType);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.eventLog = [];
  }

  /**
   * Check if any events of a type occurred
   */
  hasEvent(eventType: string): boolean {
    return this.eventLog.some((e) => e.type === eventType);
  }
}
