import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface OuraSleepData {
  id: string;
  date: string;
  duration: number;
  efficiency: number;
  score: number;
  deepSleep: number;
  remSleep: number;
  lightSleep: number;
  latency: number;
  midnightUtc: string;
}

export interface OuraActivityData {
  id: string;
  date: string;
  score: number;
  steps: number;
  calories: number;
  activeMinutes: number;
}

export interface OuraReadinessData {
  id: string;
  date: string;
  score: number;
  temperature: number;
  heartRateVariability: number;
  recoveryIndex: number;
}

export class OuraIntegration extends BaseIntegration {
  private sleepData: Map<string, OuraSleepData> = new Map();
  private activityData: Map<string, OuraActivityData> = new Map();
  private readinessData: Map<string, OuraReadinessData> = new Map();
  private dataId = 0;

  constructor(world: any) {
    super('api.ouraring.com', world);
  }

  snapshot(): unknown {
    return {
      sleepRecords: this.sleepData.size,
      activityRecords: this.activityData.size,
      readinessRecords: this.readinessData.size,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/v2/usercollection/sleep') && method === 'GET') {
      return this.handleGetSleep(request);
    } else if (path.includes('/v2/usercollection/activity') && method === 'GET') {
      return this.handleGetActivity(request);
    } else if (path.includes('/v2/usercollection/readiness') && method === 'GET') {
      return this.handleGetReadiness(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleGetSleep(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let data = Array.from(this.sleepData.values());

    if (startDate && endDate) {
      data = data.filter(
        (d) => d.date >= startDate && d.date <= endDate
      );
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data, next_token: null },
      timestamp: new Date(),
    };
  }

  private handleGetActivity(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let data = Array.from(this.activityData.values());

    if (startDate && endDate) {
      data = data.filter(
        (d) => d.date >= startDate && d.date <= endDate
      );
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data, next_token: null },
      timestamp: new Date(),
    };
  }

  private handleGetReadiness(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');

    let data = Array.from(this.readinessData.values());

    if (startDate && endDate) {
      data = data.filter(
        (d) => d.date >= startDate && d.date <= endDate
      );
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data, next_token: null },
      timestamp: new Date(),
    };
  }

  // Test helpers
  recordSleep(date: string, duration: number, score: number): string {
    const id = `sleep_${++this.dataId}`;
    const data: OuraSleepData = {
      id,
      date,
      duration,
      score,
      efficiency: Math.random() * 100,
      deepSleep: Math.random() * duration * 0.2,
      remSleep: Math.random() * duration * 0.2,
      lightSleep: Math.random() * duration * 0.6,
      latency: Math.random() * 30,
      midnightUtc: new Date(`${date}T00:00:00Z`).toISOString(),
    };

    this.sleepData.set(id, data);

    this.recordMutation('sleep_recorded', {
      date,
      duration,
      score,
    });

    return id;
  }

  recordActivity(date: string, steps: number, calories: number): string {
    const id = `activity_${++this.dataId}`;
    const data: OuraActivityData = {
      id,
      date,
      steps,
      calories,
      score: Math.min(100, Math.floor(steps / 10)),
      activeMinutes: Math.floor(steps / 100),
    };

    this.activityData.set(id, data);

    this.recordMutation('activity_recorded', {
      date,
      steps,
      calories,
    });

    return id;
  }

  recordReadiness(date: string, score: number): string {
    const id = `readiness_${++this.dataId}`;
    const data: OuraReadinessData = {
      id,
      date,
      score,
      temperature: 36.5 + (Math.random() - 0.5) * 0.5,
      heartRateVariability: 50 + Math.random() * 50,
      recoveryIndex: Math.floor(score * 0.8),
    };

    this.readinessData.set(id, data);

    this.recordMutation('readiness_recorded', {
      date,
      score,
    });

    return id;
  }

  getSleepData(startDate?: string, endDate?: string): OuraSleepData[] {
    let data = Array.from(this.sleepData.values());
    if (startDate && endDate) {
      data = data.filter((d) => d.date >= startDate && d.date <= endDate);
    }
    return data;
  }
}
