import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface StravaActivity {
  id: string;
  name: string;
  type: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  elevationGain: number;
  startDate: string;
  averageSpeed: number;
  maxSpeed: number;
}

export interface StravaAthlete {
  id: string;
  firstname: string;
  lastname: string;
  profile: string;
  totalDistance: number;
  totalMovingTime: number;
}

export class StravaIntegration extends BaseIntegration {
  private activities: Map<string, StravaActivity> = new Map();
  private athlete: StravaAthlete | null = null;
  private activityId = 0;

  constructor(world: any) {
    super('www.strava.com', world);
  }

  snapshot(): unknown {
    return {
      activityCount: this.activities.size,
      totalDistance: this.athlete?.totalDistance || 0,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/api/v3/athlete') && method === 'GET' && !path.includes('/activities')) {
      return this.handleGetAthlete(request);
    } else if (path.includes('/api/v3/athlete/activities') && method === 'GET') {
      return this.handleListActivities(request);
    } else if (path.includes('/api/v3/activities') && method === 'POST') {
      return this.handleCreateActivity(request);
    } else if (path.includes('/api/v3/activities/') && method === 'GET') {
      return this.handleGetActivity(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleGetAthlete(request: APIRequest): APIResponse {
    if (!this.athlete) {
      this.athlete = {
        id: 'athlete_1',
        firstname: 'Test',
        lastname: 'User',
        profile: 'https://example.com/profile.jpg',
        totalDistance: 0,
        totalMovingTime: 0,
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: this.athlete,
      timestamp: new Date(),
    };
  }

  private handleListActivities(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('per_page') || '30');

    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, limit);

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: activities,
      timestamp: new Date(),
    };
  }

  private handleCreateActivity(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const activityId = `activity_${++this.activityId}`;

    const activity: StravaActivity = {
      id: activityId,
      name: body.name || 'Activity',
      type: body.type || 'Run',
      distance: body.distance || 0,
      movingTime: body.moving_time || 0,
      elapsedTime: body.elapsed_time || 0,
      elevationGain: body.elevation_gain || 0,
      startDate: body.start_date || new Date().toISOString(),
      averageSpeed: body.average_speed || 0,
      maxSpeed: body.max_speed || 0,
    };

    this.activities.set(activityId, activity);

    if (this.athlete) {
      this.athlete.totalDistance += activity.distance;
      this.athlete.totalMovingTime += activity.movingTime;
    }

    this.recordMutation('activity_created', {
      activityId,
      name: activity.name,
      distance: activity.distance,
    });

    return {
      status: 201,
      headers: { 'content-type': 'application/json' },
      body: activity,
      timestamp: new Date(),
    };
  }

  private handleGetActivity(request: APIRequest): APIResponse {
    const activityId = request.url.split('/activities/')[1]?.split('?')[0];

    if (!activityId || !this.activities.has(activityId)) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: this.activities.get(activityId),
      timestamp: new Date(),
    };
  }

  // Test helpers
  logActivity(name: string, type: string, distance: number, movingTime: number): string {
    const activityId = `activity_${++this.activityId}`;
    const activity: StravaActivity = {
      id: activityId,
      name,
      type,
      distance,
      movingTime,
      elapsedTime: movingTime + Math.random() * 600,
      elevationGain: Math.random() * 500,
      startDate: new Date().toISOString(),
      averageSpeed: distance / (movingTime / 3600),
      maxSpeed: distance / (movingTime / 3600) * 1.2,
    };

    this.activities.set(activityId, activity);

    if (!this.athlete) {
      this.athlete = {
        id: 'athlete_1',
        firstname: 'Test',
        lastname: 'User',
        profile: 'https://example.com/profile.jpg',
        totalDistance: 0,
        totalMovingTime: 0,
      };
    }

    this.athlete.totalDistance += distance;
    this.athlete.totalMovingTime += movingTime;

    return activityId;
  }

  getActivities(): StravaActivity[] {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }
}
