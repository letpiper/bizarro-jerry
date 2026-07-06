import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  internalDate: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    body?: { data: string };
  };
}

export class GmailIntegration extends BaseIntegration {
  private messages: Map<string, GmailMessage[]> = new Map();
  private messageId = 0;
  private threadId = 0;

  constructor(world: any) {
    super('gmail.googleapis.com', world);
    this.messages.set('INBOX', []);
    this.messages.set('SENT', []);
    this.messages.set('DRAFT', []);
  }

  snapshot(): unknown {
    const stats: Record<string, number> = {};
    for (const [label, msgs] of this.messages) {
      stats[label] = msgs.length;
    }
    return { messagesByLabel: stats };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const path = request.url;
    const method = request.method.toUpperCase();

    if (path.includes('/messages/send') && method === 'POST') {
      return this.handleSendMessage(request);
    } else if (path.includes('/messages?') && method === 'GET') {
      return this.handleListMessages(request);
    } else if (path.includes('/messages/') && method === 'GET') {
      return this.handleGetMessage(request);
    } else if (path.includes('/drafts') && method === 'POST') {
      return this.handleCreateDraft(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: { code: 404 } },
      timestamp: new Date(),
    };
  }

  private handleSendMessage(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const raw = body.raw;

    if (!raw) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: { code: 400, message: 'Invalid request' } },
        timestamp: new Date(),
      };
    }

    const msgId = `msg_${++this.messageId}`;
    const threadId = `thread_${++this.threadId}`;

    const message: GmailMessage = {
      id: msgId,
      threadId,
      labelIds: ['SENT'],
      snippet: this.decodeBase64(raw).substring(0, 100),
      internalDate: Date.now().toString(),
    };

    const sent = this.messages.get('SENT') || [];
    sent.push(message);
    this.messages.set('SENT', sent);

    this.recordMutation('email_sent', { messageId: msgId });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { id: msgId, threadId },
      timestamp: new Date(),
    };
  }

  private handleListMessages(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const maxResults = parseInt(url.searchParams.get('maxResults') || '10');

    let allMessages: GmailMessage[] = [];
    for (const msgs of this.messages.values()) {
      allMessages.push(...msgs);
    }

    if (q.includes('label:')) {
      const labelMatch = q.match(/label:(\w+)/);
      if (labelMatch) {
        const label = labelMatch[1].toUpperCase();
        allMessages = this.messages.get(label) || [];
      }
    }

    const limited = allMessages.slice(0, maxResults);

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        messages: limited.map((m) => ({ id: m.id, threadId: m.threadId })),
        resultSizeEstimate: allMessages.length,
      },
      timestamp: new Date(),
    };
  }

  private handleGetMessage(request: APIRequest): APIResponse {
    const msgId = request.url.split('/messages/').pop()?.split('?')[0];
    if (!msgId) {
      return {
        status: 400,
        headers: { 'content-type': 'application/json' },
        body: { error: { code: 400 } },
        timestamp: new Date(),
      };
    }

    for (const msgs of this.messages.values()) {
      const msg = msgs.find((m) => m.id === msgId);
      if (msg) {
        return {
          status: 200,
          headers: { 'content-type': 'application/json' },
          body: msg,
          timestamp: new Date(),
        };
      }
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: { code: 404 } },
      timestamp: new Date(),
    };
  }

  private handleCreateDraft(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const msgId = `msg_${++this.messageId}`;
    const threadId = `thread_${++this.threadId}`;

    const message: GmailMessage = {
      id: msgId,
      threadId,
      labelIds: ['DRAFT'],
      snippet: body.message?.snippet || '',
      internalDate: Date.now().toString(),
    };

    const drafts = this.messages.get('DRAFT') || [];
    drafts.push(message);
    this.messages.set('DRAFT', drafts);

    this.recordMutation('draft_created', { messageId: msgId });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { id: msgId, message },
      timestamp: new Date(),
    };
  }

  private decodeBase64(str: string): string {
    try {
      return Buffer.from(str, 'base64').toString('utf-8');
    } catch {
      return str;
    }
  }

  // Test helpers
  sendEmail(to: string, subject: string, body: string): string {
    const msgId = `msg_${++this.messageId}`;
    const threadId = `thread_${++this.threadId}`;

    const message: GmailMessage = {
      id: msgId,
      threadId,
      labelIds: ['SENT'],
      snippet: `${subject}: ${body}`.substring(0, 100),
      internalDate: Date.now().toString(),
    };

    const sent = this.messages.get('SENT') || [];
    sent.push(message);
    this.messages.set('SENT', sent);

    return msgId;
  }

  getMessages(label: string = 'INBOX'): GmailMessage[] {
    return this.messages.get(label) || [];
  }
}
