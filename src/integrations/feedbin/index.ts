import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface FeedbinEntry {
  id: string;
  title: string;
  content?: string;
  url: string;
  feedId: string;
  publishedAt: string;
  createdAt: string;
  read: boolean;
  starred: boolean;
}

export interface FeedbinFeed {
  id: string;
  title: string;
  feedUrl: string;
  siteUrl: string;
  createdAt: string;
  entryCount: number;
}

export class FeedbinIntegration extends BaseIntegration {
  private feeds: Map<string, FeedbinFeed> = new Map();
  private entries: Map<string, FeedbinEntry> = new Map();
  private feedId = 0;
  private entryId = 0;

  constructor(world: any) {
    super('feedbin.com', world);
  }

  snapshot(): unknown {
    return {
      feedCount: this.feeds.size,
      entryCount: this.entries.size,
      unreadCount: Array.from(this.entries.values()).filter((e) => !e.read).length,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/v2/feeds') && method === 'GET' && !path.includes('/feeds/')) {
      return this.handleListFeeds(request);
    } else if (path.includes('/v2/feeds') && method === 'POST') {
      return this.handleCreateFeed(request);
    } else if (path.includes('/v2/feeds/') && method === 'GET') {
      return this.handleGetFeed(request);
    } else if (path.includes('/v2/entries') && method === 'GET' && !path.includes('/entries/')) {
      return this.handleListEntries(request);
    } else if (path.includes('/v2/entries/') && method === 'GET') {
      return this.handleGetEntry(request);
    } else if (path.includes('/v2/entries/') && method === 'PATCH') {
      return this.handleUpdateEntry(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleListFeeds(request: APIRequest): APIResponse {
    const feeds = Array.from(this.feeds.values());

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: feeds,
      timestamp: new Date(),
    };
  }

  private handleCreateFeed(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const feedId = `feed_${++this.feedId}`;

    const feed: FeedbinFeed = {
      id: feedId,
      title: body.title || 'New Feed',
      feedUrl: body.feed_url || '',
      siteUrl: body.site_url || '',
      createdAt: new Date().toISOString(),
      entryCount: 0,
    };

    this.feeds.set(feedId, feed);

    this.recordMutation('feed_created', {
      feedId,
      title: feed.title,
    });

    return {
      status: 201,
      headers: { 'content-type': 'application/json' },
      body: feed,
      timestamp: new Date(),
    };
  }

  private handleGetFeed(request: APIRequest): APIResponse {
    const feedId = request.url.split('/feeds/')[1]?.split('?')[0];

    if (!feedId || !this.feeds.has(feedId)) {
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
      body: this.feeds.get(feedId),
      timestamp: new Date(),
    };
  }

  private handleListEntries(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const feedId = url.searchParams.get('feed_id');
    const limit = parseInt(url.searchParams.get('limit') || '30');

    let entries = Array.from(this.entries.values());
    if (feedId) {
      entries = entries.filter((e) => e.feedId === feedId);
    }

    entries = entries.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: entries.slice(0, limit),
      timestamp: new Date(),
    };
  }

  private handleGetEntry(request: APIRequest): APIResponse {
    const entryId = request.url.split('/entries/')[1]?.split('?')[0];

    if (!entryId || !this.entries.has(entryId)) {
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
      body: this.entries.get(entryId),
      timestamp: new Date(),
    };
  }

  private handleUpdateEntry(request: APIRequest): APIResponse {
    const entryId = request.url.split('/entries/')[1]?.split('?')[0];
    const body = request.body as Record<string, any>;

    const entry = this.entries.get(entryId!);
    if (!entry) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    if (body.read !== undefined) entry.read = body.read;
    if (body.starred !== undefined) entry.starred = body.starred;

    this.recordMutation('entry_updated', { entryId, read: entry.read });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: entry,
      timestamp: new Date(),
    };
  }

  // Test helpers
  addFeed(title: string, feedUrl: string): string {
    const feedId = `feed_${++this.feedId}`;
    const feed: FeedbinFeed = {
      id: feedId,
      title,
      feedUrl,
      siteUrl: '',
      createdAt: new Date().toISOString(),
      entryCount: 0,
    };

    this.feeds.set(feedId, feed);
    return feedId;
  }

  addEntry(feedId: string, title: string, content: string, url: string): string {
    const entryId = `entry_${++this.entryId}`;
    const entry: FeedbinEntry = {
      id: entryId,
      title,
      content,
      url,
      feedId,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
      starred: false,
    };

    this.entries.set(entryId, entry);

    const feed = this.feeds.get(feedId);
    if (feed) feed.entryCount++;

    return entryId;
  }

  getEntries(feedId?: string): FeedbinEntry[] {
    let entries = Array.from(this.entries.values());
    if (feedId) {
      entries = entries.filter((e) => e.feedId === feedId);
    }
    return entries;
  }
}
