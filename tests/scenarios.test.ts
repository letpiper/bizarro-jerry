import { describe, it, expect, beforeEach } from 'vitest';
import {
  ScenarioBuilder,
  ScenarioExecutor,
  CalendarIntegration,
  TodoistIntegration,
} from '../src/index';
import type { Organization, User } from '../src/core/types';

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

function createTestUser(id: string, email: string): User {
  return {
    id,
    email,
    name: `Test User ${id}`,
    timezone: 'America/New_York',
    profile: {},
    preferences: {
      notificationsEnabled: true,
    },
    integrations: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('ScenarioBuilder', () => {
  let builder: ScenarioBuilder;
  let org: Organization;

  beforeEach(() => {
    org = createTestOrg();
    builder = new ScenarioBuilder(org);
  });

  it('should initialize with an organization', () => {
    expect(builder.getWorld()).toBeDefined();
    expect(builder.getWorld().org).toBe(org);
  });

  it('should add users', () => {
    const user = createTestUser('user1', 'user1@example.com');
    builder.withUser(user);

    expect(org.users.has('user1')).toBe(true);
  });

  it('should set time', () => {
    const date = new Date('2024-07-04T10:00:00Z');
    builder.atTime(date);

    expect(builder.getWorld().getCurrentTime()).toEqual(date);
  });

  it('should advance time', () => {
    const date = new Date('2024-07-04T10:00:00Z');
    builder.atTime(date);

    const oldTime = builder.getWorld().getCurrentTime();
    builder.advanceTime({ hours: 1 });

    const newTime = builder.getWorld().getCurrentTime();
    expect(newTime.getTime()).toBe(oldTime.getTime() + 3600000);
  });

  it('should register integrations', () => {
    const calendar = new CalendarIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);

    const registered = builder.getWorld().getIntegration('calendar');
    expect(registered).toBeDefined();
  });

  it('should register integrations', () => {
    const calendar = new CalendarIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);

    const registered = builder.getWorld().getIntegration('calendar');
    expect(registered).toBeDefined();
  });

  it('should get world snapshot', async () => {
    const calendar = new CalendarIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);
    calendar.createCalendar('user@example.com');

    const snapshot = builder.getSnapshot();
    expect(snapshot).toHaveProperty('timestamp');
    expect(snapshot).toHaveProperty('organization');
  });

  it('should get snapshot', () => {
    const calendar = new CalendarIntegration(builder.getWorld());
    builder.withIntegration('calendar', calendar);

    const snapshot = builder.getSnapshot();
    expect(snapshot).toHaveProperty('timestamp');
    expect(snapshot).toHaveProperty('organization');
    expect(snapshot).toHaveProperty('integrations');
  });
});

describe('ScenarioExecutor', () => {
  let executor: ScenarioExecutor;

  beforeEach(() => {
    executor = new ScenarioExecutor();
  });

  it('should run a simple scenario', async () => {
    const org = createTestOrg();

    const scenario = {
      name: 'Create Event',
      description: 'Test creating a calendar event',
      setup: async (builder: ScenarioBuilder) => {
        const calendar = new CalendarIntegration(builder.getWorld());
        builder.withIntegration('calendar', calendar);
        calendar.createCalendar('user@example.com');
      },
      execute: async (builder: ScenarioBuilder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const now = new Date();
        const end = new Date(now.getTime() + 3600000);
        calendar.addEvent('user@example.com', 'Test Meeting', now, end);
      },
      verify: async (builder: ScenarioBuilder) => {
        const calendar = builder.getWorld().getIntegration('calendar');
        const events = calendar.getEvents('user@example.com');
        return events.length > 0;
      },
    };

    const result = await executor.run(scenario, org);

    expect(result.success).toBe(true);
    expect(result.scenarioName).toBe('Create Event');
    expect(result.verificationPassed).toBe(true);
  });

  it('should run multiple scenarios', async () => {
    const org = createTestOrg();

    const scenario1 = {
      name: 'Scenario 1',
      setup: async () => {},
      execute: async () => {},
    };

    const scenario2 = {
      name: 'Scenario 2',
      setup: async () => {},
      execute: async () => {},
    };

    const results = await executor.runAll([scenario1, scenario2], org);

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('should track metrics', async () => {
    const org = createTestOrg();

    const scenario = {
      name: 'Create Tasks',
      setup: async (builder: ScenarioBuilder) => {
        const todoist = new TodoistIntegration(builder.getWorld());
        builder.withIntegration('todoist', todoist);
      },
      execute: async (builder: ScenarioBuilder) => {
        const todoist = builder.getWorld().getIntegration('todoist');
        todoist.createTask('Task 1');
        todoist.createTask('Task 2');
        todoist.createTask('Task 3');
      },
    };

    const result = await executor.run(scenario, org);

    expect(result.success).toBe(true);
    expect(result.metrics.duration).toBeGreaterThanOrEqual(0);
  });

  it('should generate summary', async () => {
    const org = createTestOrg();

    const scenario = {
      name: 'Test',
      setup: async () => {},
      execute: async () => {},
    };

    await executor.run(scenario, org);
    const summary = executor.getSummary();

    expect(summary.total).toBe(1);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(0);
  });
});

describe('MultiTurnSession', () => {
  it('should track conversation history', async () => {
    const org = createTestOrg();
    const builder = new ScenarioBuilder(org);
    const session = builder.getSession();

    const turn1 = await session.addTurn('Hello');
    expect(turn1.input).toBe('Hello');

    const history = session.getHistory();
    expect(history).toHaveLength(1);

    const lastTurn = session.getLastTurn();
    expect(lastTurn?.input).toBe('Hello');
  });

  it('should compute metrics', async () => {
    const org = createTestOrg();
    const builder = new ScenarioBuilder(org);
    const session = builder.getSession();

    await session.addTurn('Message 1');
    await session.addTurn('Message 2');

    const metrics = session.getMetrics();
    expect(metrics.totalTurns).toBe(2);
  });

  it('should verify state consistency', async () => {
    const org = createTestOrg();
    const builder = new ScenarioBuilder(org);
    const session = builder.getSession();

    const consistency = session.verifyStateConsistency();
    expect(consistency.valid).toBe(true);
    expect(consistency.issues).toHaveLength(0);
  });
});
