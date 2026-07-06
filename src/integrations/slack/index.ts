import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';
import type { SlackState, SlackWorkspace, SlackUser, SlackChannel, SlackMessage } from './types';

export class SlackIntegration extends BaseIntegration {
  private state: SlackState;

  constructor(world: any, workspaceId: string = 'T001') {
    super('slack.com', world);
    this.state = {
      workspaces: new Map(),
      dmChannels: new Map(),
      currentWorkspaceId: workspaceId,
    };
    this.createDefaultWorkspace(workspaceId);
  }

  private createDefaultWorkspace(id: string): void {
    this.state.workspaces.set(id, {
      id,
      name: 'Test Workspace',
      domain: 'test-workspace',
      users: new Map(),
      channels: new Map(),
      messages: new Map(),
    });
  }

  snapshot(): unknown {
    return {
      workspaces: Array.from(this.state.workspaces.entries()).map(([id, ws]) => ({
        id,
        name: ws.name,
        users: Array.from(ws.users.keys()),
        channels: Array.from(ws.channels.keys()),
      })),
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/conversations.list')) {
      return this.handleConversationsList(request);
    } else if (path.includes('/conversations.info')) {
      return this.handleConversationsInfo(request);
    } else if (path.includes('/conversations.history')) {
      return this.handleConversationsHistory(request);
    } else if (path.includes('/chat.postMessage') && method === 'POST') {
      return this.handlePostMessage(request);
    } else if (path.includes('/users.list')) {
      return this.handleUsersList(request);
    } else if (path.includes('/users.info')) {
      return this.handleUsersInfo(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'unknown_endpoint' },
      timestamp: new Date(),
    };
  }

  private handleConversationsList(request: APIRequest): APIResponse {
    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const channels = Array.from(workspace.channels.values()).map((c) => ({
      id: c.id,
      name: c.name,
      is_private: c.isPrivate,
      is_archived: c.isArchived,
      created: c.created?.getTime() || Date.now(),
    }));

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { ok: true, channels },
      timestamp: new Date(),
    };
  }

  private handleConversationsInfo(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const channelId = url.searchParams.get('channel');

    if (!channelId) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'missing_scope' },
        timestamp: new Date(),
      };
    }

    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const channel = workspace.channels.get(channelId);
    if (!channel) {
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'channel_not_found' },
        timestamp: new Date(),
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        ok: true,
        channel: {
          id: channel.id,
          name: channel.name,
          is_private: channel.isPrivate,
          is_archived: channel.isArchived,
          members: channel.members,
          created: channel.created?.getTime() || Date.now(),
        },
      },
      timestamp: new Date(),
    };
  }

  private handleConversationsHistory(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const channelId = url.searchParams.get('channel');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!channelId) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'missing_scope' },
        timestamp: new Date(),
      };
    }

    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const messages = workspace.messages.get(channelId) || [];
    const limited = messages.slice(0, limit);

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        ok: true,
        messages: limited,
        has_more: messages.length > limit,
      },
      timestamp: new Date(),
    };
  }

  private handlePostMessage(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const channelId = body.channel;
    const text = body.text;

    if (!channelId || !text) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'invalid_request' },
        timestamp: new Date(),
      };
    }

    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const ts = (Date.now() / 1000).toString();
    const message: SlackMessage = {
      type: 'message',
      user: body.user || 'bot',
      text,
      ts,
    };

    if (!workspace.messages.has(channelId)) {
      workspace.messages.set(channelId, []);
    }
    workspace.messages.get(channelId)!.push(message);

    this.recordMutation('message_posted', { channelId, text });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        ok: true,
        channel: channelId,
        ts,
        message,
      },
      timestamp: new Date(),
    };
  }

  private handleUsersList(request: APIRequest): APIResponse {
    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const members = Array.from(workspace.users.values()).map((u) => ({
      id: u.id,
      name: u.name,
      real_name: u.displayName || u.name,
      profile: {
        email: u.email,
        ...u.profile,
      },
    }));

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { ok: true, members },
      timestamp: new Date(),
    };
  }

  private handleUsersInfo(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user');

    if (!userId) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'missing_scope' },
        timestamp: new Date(),
      };
    }

    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'workspace_not_found' },
        timestamp: new Date(),
      };
    }

    const user = workspace.users.get(userId);
    if (!user) {
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: { ok: false, error: 'user_not_found' },
        timestamp: new Date(),
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          real_name: user.displayName,
          profile: { email: user.email, ...user.profile },
        },
      },
      timestamp: new Date(),
    };
  }

  // Helper methods for test setup
  createUser(id: string, email: string, name: string, workspaceId?: string): void {
    const wsId = workspaceId || this.state.currentWorkspaceId;
    const workspace = this.state.workspaces.get(wsId);
    if (!workspace) return;

    workspace.users.set(id, {
      id,
      email,
      name,
      profile: {},
    });
  }

  createChannel(id: string, name: string, isPrivate: boolean = false, workspaceId?: string): void {
    const wsId = workspaceId || this.state.currentWorkspaceId;
    const workspace = this.state.workspaces.get(wsId);
    if (!workspace) return;

    workspace.channels.set(id, {
      id,
      name,
      isPrivate,
      isArchived: false,
      members: [],
    });
  }

  postMessage(channelId: string, text: string, userId?: string): string {
    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) return '';

    const ts = (Date.now() / 1000).toString();
    const message: SlackMessage = {
      type: 'message',
      user: userId || 'bot',
      text,
      ts,
    };

    if (!workspace.messages.has(channelId)) {
      workspace.messages.set(channelId, []);
    }
    workspace.messages.get(channelId)!.push(message);

    return ts;
  }

  getMessages(channelId: string): SlackMessage[] {
    const workspace = this.state.workspaces.get(this.state.currentWorkspaceId);
    if (!workspace) return [];
    return workspace.messages.get(channelId) || [];
  }
}
