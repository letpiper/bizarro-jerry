// Core types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone?: string;
  status?: 'active' | 'away' | 'offline';
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[];
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  teams: Team[];
}

// Slack types
export interface SlackUser extends User {
  slackId: string;
  realName?: string;
  displayName?: string;
  isBot?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
}

export interface SlackChannel {
  id: string;
  name: string;
  topic?: string;
  purpose?: string;
  isPrivate: boolean;
  isDM: boolean;
  isGroupDM: boolean;
  members: string[];
  createdAt: Date;
  creator?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
}

export interface SlackMessage {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  timestamp: Date;
  threadTs?: string;
  replyCount?: number;
  reactions?: SlackReaction[];
  files?: SlackFile[];
  edited?: boolean;
  deleted?: boolean;
}

export interface SlackReaction {
  name: string;
  users: string[];
  count: number;
}

export interface SlackFile {
  id: string;
  name: string;
  url?: string;
  size?: number;
  type?: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  organizer?: string;
  location?: string;
  isAllDay?: boolean;
  recurrence?: string;
  timezone?: string;
  conferenceUrl?: string;
  status?: 'tentative' | 'confirmed' | 'cancelled';
}

// Gmail types
export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred?: boolean;
  labels?: string[];
  attachments?: GmailAttachment[];
}

export interface GmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

// Observability types
export interface APIRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timestamp: Date;
}

export interface APIResponse {
  status: number;
  headers?: Record<string, string>;
  body?: any;
  timestamp: Date;
  duration: number;
}

export interface Trace {
  id: string;
  timestamp: Date;
  integration: string;
  request: APIRequest;
  response: APIResponse;
  error?: string;
  duration: number;
}

export interface Mutation {
  id: string;
  timestamp: Date;
  integration: string;
  type: 'created' | 'updated' | 'deleted';
  entity: string;
  entityId: string;
  before?: any;
  after?: any;
  userId?: string;
}

// Scenario types
export interface ScenarioDefinition {
  id: string;
  name: string;
  description?: string;
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  id: string;
  type: string;
  description?: string;
  integration: string;
  action: any;
  expectedResult?: any;
}

export interface ScenarioResult {
  id: string;
  scenarioId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  progress: number;
  metrics?: EvaluationMetrics;
  errors?: string[];
}

// Metrics types
export interface EvaluationMetrics {
  availability: number;
  timezone: number;
  conflict: number;
  workingHours: number;
  communication: number;
  performance: number;
  overallScore: number;
  passed: boolean;
}

// World snapshot
export interface WorldSnapshot {
  timestamp: Date;
  organization: Organization;
  users: User[];
  teams: Team[];
  slackChannels: SlackChannel[];
  slackMessages: SlackMessage[];
  calendarEvents: CalendarEvent[];
  gmailMessages: GmailMessage[];
  traces: Trace[];
  mutations: Mutation[];
}
