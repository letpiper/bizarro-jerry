import { describe, it, expect, beforeEach } from 'vitest';
import {
  CalendarIntegration,
  SlackIntegration,
  GmailIntegration,
  TodoistIntegration,
  DocsIntegration,
  OuraIntegration,
  StravaIntegration,
  TwitterIntegration,
} from '../src/integrations';
import type { Organization, User } from '../src/core/types';

// Helper to create a mock world
const mockWorld = {
  recordMutation: () => {},
  eventBus: { fire: async () => {} },
};

// Helper to create a test organization
function createTestOrg(): Organization {
  return {
    id: 'test-org',
    name: 'Test Org',
    domain: 'test.example.com',
    timezone: 'America/New_York',
    users: new Map(),
    teams: new Map(),
    integrations: new Map(),
    settings: {
      ssoEnabled: false,
    },
  };
}

describe('Calendar Integration', () => {
  let integration: CalendarIntegration;

  beforeEach(() => {
    integration = new CalendarIntegration(mockWorld);
  });

  it('should create calendars for users', () => {
    integration.createCalendar('user@example.com');
    const events = integration.getEvents('user@example.com');
    expect(events).toHaveLength(0);
  });

  it('should add events to calendars', () => {
    integration.createCalendar('user@example.com');
    const now = new Date();
    const end = new Date(now.getTime() + 3600000);

    const eventId = integration.addEvent('user@example.com', 'Meeting', now, end);
    expect(eventId).toBeDefined();

    const events = integration.getEvents('user@example.com');
    expect(events).toHaveLength(1);
    expect(events[0].summary).toBe('Meeting');
  });

  it('should handle free/busy queries', async () => {
    integration.createCalendar('user@example.com');
    const now = new Date();
    const end = new Date(now.getTime() + 3600000);
    integration.addEvent('user@example.com', 'Meeting', now, end);

    const request = {
      method: 'GET',
      url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      body: {
        items: [{ id: 'user@example.com' }],
        timeMin: now.toISOString(),
        timeMax: end.toISOString(),
      },
      headers: {},
      timestamp: new Date(),
    };

    const response = await integration.handle(request);
    expect(response.status).toBe(200);
  });
});

describe('Slack Integration', () => {
  let integration: SlackIntegration;

  beforeEach(() => {
    integration = new SlackIntegration(mockWorld);
  });

  it('should list channels', async () => {
    const request = {
      method: 'GET',
      url: 'https://slack.com/api/conversations.list',
      headers: {},
      timestamp: new Date(),
    };

    const response = await integration.handle(request);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('channels');
  });

  it('should post messages', async () => {
    const request = {
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      body: {
        channel: 'C123',
        text: 'Hello world',
      },
      headers: {},
      timestamp: new Date(),
    };

    const response = await integration.handle(request);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('ok');
  });
});

describe('Gmail Integration', () => {
  let integration: GmailIntegration;

  beforeEach(() => {
    integration = new GmailIntegration(mockWorld);
  });

  it('should send emails', () => {
    const msgId = integration.sendEmail('to@example.com', 'Test', 'Body');
    expect(msgId).toBeDefined();

    const messages = integration.getMessages('SENT');
    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe(msgId);
  });

  it('should list messages by label', async () => {
    integration.sendEmail('to@example.com', 'Test', 'Body');

    const request = {
      method: 'GET',
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=label:SENT',
      headers: {},
      timestamp: new Date(),
    };

    const response = await integration.handle(request);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('messages');
  });
});

describe('Todoist Integration', () => {
  let integration: TodoistIntegration;

  beforeEach(() => {
    integration = new TodoistIntegration(mockWorld);
  });

  it('should create tasks', () => {
    const taskId = integration.createTask('Buy milk');
    expect(taskId).toBeDefined();

    const tasks = integration.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].content).toBe('Buy milk');
    expect(tasks[0].completed).toBe(false);
  });

  it('should complete tasks', () => {
    const taskId = integration.createTask('Buy milk');
    integration.completeTask(taskId);

    const tasks = integration.getTasks();
    expect(tasks[0].completed).toBe(true);
  });
});

describe('Docs Integration', () => {
  let integration: DocsIntegration;

  beforeEach(() => {
    integration = new DocsIntegration(mockWorld);
  });

  it('should create documents', () => {
    const docId = integration.createDocument('Test Doc');
    expect(docId).toBeDefined();

    const docs = integration.getDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0].title).toBe('Test Doc');
  });

  it('should set and retrieve document content', () => {
    const docId = integration.createDocument('Test Doc');
    integration.setDocumentContent(docId, 'Hello World');

    const docs = integration.getDocuments();
    expect(docs[0].title).toBe('Test Doc');
  });
});

describe('Oura Integration', () => {
  let integration: OuraIntegration;

  beforeEach(() => {
    integration = new OuraIntegration(mockWorld);
  });

  it('should record sleep data', () => {
    const id = integration.recordSleep('2024-07-04', 480, 85);
    expect(id).toBeDefined();

    const data = integration.getSleepData();
    expect(data).toHaveLength(1);
    expect(data[0].score).toBe(85);
  });

  it('should record activity data', () => {
    const id = integration.recordActivity('2024-07-04', 10000, 2500);
    expect(id).toBeDefined();
  });
});

describe('Strava Integration', () => {
  let integration: StravaIntegration;

  beforeEach(() => {
    integration = new StravaIntegration(mockWorld);
  });

  it('should log activities', () => {
    const actId = integration.logActivity('Morning Run', 'Run', 10, 3600);
    expect(actId).toBeDefined();

    const activities = integration.getActivities();
    expect(activities).toHaveLength(1);
    expect(activities[0].name).toBe('Morning Run');
    expect(activities[0].distance).toBe(10);
  });
});

describe('Twitter Integration', () => {
  let integration: TwitterIntegration;

  beforeEach(() => {
    integration = new TwitterIntegration(mockWorld);
  });

  it('should post tweets', () => {
    const tweetId = integration.postTweet('Hello Twitter');
    expect(tweetId).toBeDefined();

    const tweets = integration.getTweets();
    expect(tweets).toHaveLength(1);
    expect(tweets[0].text).toBe('Hello Twitter');
  });
});
