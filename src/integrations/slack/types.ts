export interface SlackUser {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  timezone?: string;
  profile: Record<string, any>;
}

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  creator?: string;
  created?: Date;
  members: string[];
  topic?: { value: string };
  purpose?: { value: string };
}

export interface SlackMessage {
  type: string;
  user?: string;
  text: string;
  ts: string;
  threadTs?: string;
  blocks?: Record<string, any>[];
  attachments?: Record<string, any>[];
  reactions?: Array<{ name: string; users: string[] }>;
  edited?: { user: string; ts: string };
}

export interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  users: Map<string, SlackUser>;
  channels: Map<string, SlackChannel>;
  messages: Map<string, SlackMessage[]>;
}

export interface SlackState {
  workspaces: Map<string, SlackWorkspace>;
  dmChannels: Map<string, SlackMessage[]>;
  currentWorkspaceId: string;
}
