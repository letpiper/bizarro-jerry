import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  organizer?: { email: string };
  attendees?: Array<{ email: string; responseStatus: string }>;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export class CalendarIntegration extends BaseIntegration {
  private calendars: Map<string, CalendarEvent[]> = new Map();
  private eventId = 0;

  constructor(world: any) {
    super('www.googleapis.com', world);
  }

  snapshot(): unknown {
    return {
      calendars: Array.from(this.calendars.entries()).map(([email, events]) => ({
        email,
        eventCount: events.length,
      })),
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/calendar/v3/calendars/primary/events') && method === 'GET') {
      return this.handleFreeBusy(request);
    } else if (path.includes('/calendar/v3/calendars/primary/events') && method === 'POST') {
      return this.handleCreateEvent(request);
    } else if (path.includes('/calendar/v3/calendars/primary/events') && method === 'PUT') {
      return this.handleUpdateEvent(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: { code: 404, message: 'Not Found' } },
      timestamp: new Date(),
    };
  }

  private handleFreeBusy(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const items = body.items || [];
    const timeMin = body.timeMin;
    const timeMax = body.timeMax;

    const calendars: Record<string, any> = {};

    for (const item of items) {
      const email = item.id;
      const events = this.calendars.get(email) || [];
      const busy = this.calculateBusyTimes(events, timeMin, timeMax);
      calendars[email] = { busy };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { calendars },
      timestamp: new Date(),
    };
  }

  private handleCreateEvent(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const email = 'user@example.com';

    const eventId = `evt_${++this.eventId}`;
    const event: CalendarEvent = {
      id: eventId,
      summary: body.summary || 'Event',
      start: body.start,
      end: body.end,
      status: 'confirmed',
      attendees: body.attendees,
      organizer: { email },
    };

    if (!this.calendars.has(email)) {
      this.calendars.set(email, []);
    }
    this.calendars.get(email)!.push(event);

    this.recordMutation('event_created', {
      email,
      eventId,
      summary: event.summary,
    });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: event,
      timestamp: new Date(),
    };
  }

  private handleUpdateEvent(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const url = new URL(request.url);
    const eventId = url.pathname.split('/').pop();
    const email = 'user@example.com';

    const events = this.calendars.get(email) || [];
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: { code: 404 } },
        timestamp: new Date(),
      };
    }

    Object.assign(event, body);

    this.recordMutation('event_updated', { email, eventId });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: event,
      timestamp: new Date(),
    };
  }

  private calculateBusyTimes(
    events: CalendarEvent[],
    timeMin: string,
    timeMax: string
  ): Array<{ start: string; end: string }> {
    const minTime = new Date(timeMin);
    const maxTime = new Date(timeMax);

    return events
      .filter((e) => e.status !== 'cancelled')
      .map((e) => ({
        start: e.start.dateTime,
        end: e.end.dateTime,
      }))
      .filter((slot) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slot.end);
        return slotStart < maxTime && slotEnd > minTime;
      });
  }

  // Test helpers
  createCalendar(email: string): void {
    if (!this.calendars.has(email)) {
      this.calendars.set(email, []);
    }
  }

  addEvent(email: string, summary: string, start: Date, end: Date): string {
    const eventId = `evt_${++this.eventId}`;
    const event: CalendarEvent = {
      id: eventId,
      summary,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      status: 'confirmed',
    };

    if (!this.calendars.has(email)) {
      this.calendars.set(email, []);
    }
    this.calendars.get(email)!.push(event);

    return eventId;
  }

  getEvents(email: string): CalendarEvent[] {
    return this.calendars.get(email) || [];
  }
}
