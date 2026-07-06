import { describe, it, expect, beforeEach } from 'vitest';
import {
  SimulatedHTTPClient,
  ScenarioRunner,
  EvaluationRubric,
  SimulatedWorld,
  CalendarIntegration,
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

describe('SimulatedHTTPClient', () => {
  let client: SimulatedHTTPClient;
  let world: SimulatedWorld;

  beforeEach(() => {
    const org = createTestOrg();
    world = new SimulatedWorld(org);
    client = new SimulatedHTTPClient(world);
  });

  it('should make GET requests', async () => {
    const response = await client.get('https://example.com/api/test');
    expect(response).toBeDefined();
    expect(response.status).toBeDefined();
  });

  it('should make POST requests', async () => {
    const response = await client.post('https://example.com/api/test', { data: 'test' });
    expect(response).toBeDefined();
  });

  it('should make PUT requests', async () => {
    const response = await client.put('https://example.com/api/test', { data: 'test' });
    expect(response).toBeDefined();
  });

  it('should make PATCH requests', async () => {
    const response = await client.patch('https://example.com/api/test', { data: 'test' });
    expect(response).toBeDefined();
  });

  it('should make DELETE requests', async () => {
    const response = await client.delete('https://example.com/api/test');
    expect(response).toBeDefined();
  });
});

describe('ScenarioRunner', () => {
  let runner: ScenarioRunner;
  let world: SimulatedWorld;

  beforeEach(() => {
    const org = createTestOrg();
    world = new SimulatedWorld(org);
    runner = new ScenarioRunner(world);
  });

  it('should provide HTTP client', () => {
    const client = runner.getHTTPClient();
    expect(client).toBeDefined();
    expect(typeof client.request).toBe('function');
  });

  it('should provide world access', () => {
    const w = runner.getWorld();
    expect(w).toBe(world);
  });

  it('should execute actions successfully', async () => {
    const calendar = new CalendarIntegration(world);
    world.registerIntegration('calendar', calendar);

    const action = {
      name: 'Create Event',
      execute: async (client: SimulatedHTTPClient) => {
        calendar.createCalendar('user@example.com');
        const now = new Date();
        const end = new Date(now.getTime() + 3600000);
        return calendar.addEvent('user@example.com', 'Test', now, end);
      },
    };

    const result = await runner.executeAction(action);

    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('should track action execution', async () => {
    const calendar = new CalendarIntegration(world);
    world.registerIntegration('calendar', calendar);

    const action = {
      name: 'Create Events',
      execute: async () => {
        calendar.createCalendar('user@example.com');
        const now = new Date();
        const end = new Date(now.getTime() + 3600000);
        calendar.addEvent('user@example.com', 'Event 1', now, end);
        calendar.addEvent('user@example.com', 'Event 2', now, end);
        return 'Created events';
      },
    };

    const result = await runner.executeAction(action);

    expect(result.success).toBe(true);
    expect(result.result).toBe('Created events');
  });
});

describe('EvaluationRubric', () => {
  let rubric: EvaluationRubric;

  beforeEach(() => {
    rubric = new EvaluationRubric();
  });

  it('should add targets', () => {
    const target = {
      name: 'Test Target',
      description: 'A test target',
      criteria: [
        {
          name: 'Success',
          weight: 100,
          evaluate: (result: any) => (result.success ? 100 : 0),
        },
      ],
    };

    rubric.addTarget(target);
    const score = rubric.evaluate({ success: true, duration: 100, mutationsCreated: [] });

    expect(score.overall).toBe(100);
    expect(score.passed).toBe(true);
  });

  it('should evaluate multiple criteria', () => {
    const target = {
      name: 'Performance',
      description: 'Performance metrics',
      criteria: [
        {
          name: 'Success',
          weight: 50,
          evaluate: (result: any) => (result.success ? 100 : 0),
        },
        {
          name: 'Speed',
          weight: 50,
          evaluate: (result: any) => (result.duration < 1000 ? 100 : 0),
        },
      ],
    };

    rubric.addTarget(target);

    const result1 = rubric.evaluate({ success: true, duration: 100, mutationsCreated: [] });
    expect(result1.overall).toBe(100);

    const result2 = rubric.evaluate({ success: true, duration: 5000, mutationsCreated: [] });
    expect(result2.overall).toBe(50);

    const result3 = rubric.evaluate({ success: false, duration: 100, mutationsCreated: [] });
    expect(result3.overall).toBe(50);
  });

  it('should score by target', () => {
    const target1 = {
      name: 'Target 1',
      description: 'First target',
      criteria: [
        {
          name: 'Criterion 1',
          weight: 100,
          evaluate: () => 80,
        },
      ],
    };

    const target2 = {
      name: 'Target 2',
      description: 'Second target',
      criteria: [
        {
          name: 'Criterion 2',
          weight: 100,
          evaluate: () => 60,
        },
      ],
    };

    rubric.addTarget(target1);
    rubric.addTarget(target2);

    const score = rubric.evaluate({ success: true, duration: 100, mutationsCreated: [] });

    expect(score.byTarget['Target 1']).toBe(80);
    expect(score.byTarget['Target 2']).toBe(60);
    expect(score.overall).toBe(70); // Average
  });
});
