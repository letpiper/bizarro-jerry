/**
 * Core data types for SimulatedWorld
 * These are generic organization/user types, not Piper-specific
 */

export interface User {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  timezone: string;
  locale?: string;
  picture?: string;
  phone?: string;
  profile: {
    title?: string;
    department?: string;
    manager?: string;
    team?: string;
    location?: string;
    pronouns?: string;
    bio?: string;
  };
  preferences: {
    workingHours?: { start: number; end: number };
    notificationsEnabled: boolean;
    doNotDisturb?: { start: number; end: number };
  };
  integrations: Record<string, IntegrationUserData>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationUserData {
  userId?: string;
  accountId?: string;
  email?: string;
  workspaceId?: string;
  [key: string]: unknown;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
  manager?: string;
  leads?: string[];
  parent?: string;
  color?: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  picture?: string;
  timezone: string;
  users: Map<string, User>;
  teams: Map<string, Team>;
  integrations: Map<string, IntegrationConfig>;
  settings: OrgSettings;
}

export interface IntegrationConfig {
  name: string;
  enabled: boolean;
  credentials?: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
  };
  scopes?: string[];
  config?: Record<string, unknown>;
}

export interface OrgSettings {
  workingHours?: { start: number; end: number };
  workDays?: number[];
  holidays?: Date[];
  timeOffTypes?: string[];
  slackWorkspaceId?: string;
  calendarDomain?: string;
  ssoEnabled: boolean;
}

export interface APIRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timestamp: Date;
}

export interface APIResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  timestamp: Date;
}

export interface Mutation {
  type: string;
  timestamp: Date;
  integration: string;
  data: unknown;
  userId?: string;
}

export interface Trace {
  id: string;
  request: APIRequest;
  response?: APIResponse;
  error?: Error;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface WorldSnapshot {
  timestamp: Date;
  organization: Organization;
  integrations: Array<{
    name: string;
    snapshot: unknown;
  }>;
}

export interface EventListener {
  (data: unknown): Promise<void> | void;
}

export interface ScheduledHook {
  at: Date;
  fn: (world: any) => void;
}

export interface WorldConfig {
  startTime?: Date;
  seed?: boolean;
}
