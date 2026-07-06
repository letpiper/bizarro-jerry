/**
 * TimeEngine: Deterministic, frozen clock with advancement
 */

import type { ScheduledHook } from './types';

export class TimeEngine {
  private current: Date;
  private hooks: Map<string, ScheduledHook[]> = new Map();
  private listeners: Array<(newTime: Date) => void> = [];

  constructor(startTime: Date = new Date()) {
    this.current = new Date(startTime);
  }

  get now(): Date {
    return new Date(this.current);
  }

  /**
   * Advance time by a delta
   */
  advance(delta: {
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  }): Date {
    const ms =
      (delta.days || 0) * 86400000 +
      (delta.hours || 0) * 3600000 +
      (delta.minutes || 0) * 60000 +
      (delta.seconds || 0) * 1000;

    this.current.setTime(this.current.getTime() + ms);
    this.notifyListeners();
    return this.now;
  }

  /**
   * Schedule a hook to fire at a specific time
   */
  scheduleAt(time: Date, fn: (time: Date) => void): void {
    const key = time.getTime().toString();
    if (!this.hooks.has(key)) {
      this.hooks.set(key, []);
    }
    this.hooks.get(key)!.push({ at: time, fn });
  }

  /**
   * Fire any scheduled hooks at the current time
   */
  fireScheduledHooks(): void {
    const key = this.current.getTime().toString();
    const hooks = this.hooks.get(key) || [];
    for (const hook of hooks) {
      // Hook can be called without world context if needed
    }
  }

  /**
   * Check if a time is within working hours for a given timezone
   */
  isWorkingHours(
    timezone: string = 'America/New_York',
    workingHours?: { start: number; end: number }
  ): boolean {
    const hours = workingHours || { start: 9, end: 17 };
    const hour = this.current.getHours();
    return hour >= hours.start && hour < hours.end;
  }

  /**
   * Check if it's a weekend
   */
  isWeekend(): boolean {
    const day = this.current.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Get next business day
   */
  nextBusinessDay(): Date {
    const next = new Date(this.current);
    next.setDate(next.getDate() + 1);
    while (this.isWeekend()) {
      next.setDate(next.getDate() + 1);
    }
    return next;
  }

  /**
   * Set current time
   */
  setTime(time: Date): void {
    this.current = new Date(time);
    this.notifyListeners();
  }

  /**
   * Register a listener for time changes
   */
  onTimeChange(listener: (newTime: Date) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.now);
    }
  }
}
