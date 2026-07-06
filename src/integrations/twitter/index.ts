import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface Tweet {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  likeCount: number;
  retweetCount: number;
  replyCount: number;
  impressionCount: number;
}

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  followers: number;
  following: number;
  tweetCount: number;
  profileImage: string;
  bio?: string;
}

export class TwitterIntegration extends BaseIntegration {
  private tweets: Map<string, Tweet> = new Map();
  private user: TwitterUser | null = null;
  private tweetId = 0;

  constructor(world: any) {
    super('api.twitter.com', world);
  }

  snapshot(): unknown {
    return {
      tweetCount: this.tweets.size,
      followers: this.user?.followers || 0,
      following: this.user?.following || 0,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/2/users/me') && method === 'GET') {
      return this.handleGetMe(request);
    } else if (path.includes('/2/tweets/search/recent') && method === 'GET') {
      return this.handleSearchTweets(request);
    } else if (path.includes('/2/tweets') && method === 'POST') {
      return this.handleCreateTweet(request);
    } else if (path.includes('/2/tweets/') && method === 'GET' && !path.includes('/liking_users')) {
      return this.handleGetTweet(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleGetMe(request: APIRequest): APIResponse {
    if (!this.user) {
      this.user = {
        id: 'user_1',
        username: 'testuser',
        name: 'Test User',
        followers: 0,
        following: 0,
        tweetCount: 0,
        profileImage: 'https://example.com/profile.jpg',
      };
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: this.user },
      timestamp: new Date(),
    };
  }

  private handleSearchTweets(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const maxResults = parseInt(url.searchParams.get('max_results') || '10');

    let results = Array.from(this.tweets.values());
    if (query) {
      results = results.filter((t) => t.text.includes(query));
    }

    results = results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxResults);

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: results },
      timestamp: new Date(),
    };
  }

  private handleCreateTweet(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const tweetId = `tweet_${++this.tweetId}`;

    if (!this.user) {
      this.user = {
        id: 'user_1',
        username: 'testuser',
        name: 'Test User',
        followers: 0,
        following: 0,
        tweetCount: 0,
        profileImage: 'https://example.com/profile.jpg',
      };
    }

    const tweet: Tweet = {
      id: tweetId,
      text: body.text || '',
      createdAt: new Date().toISOString(),
      authorId: this.user.id,
      likeCount: 0,
      retweetCount: 0,
      replyCount: 0,
      impressionCount: 0,
    };

    this.tweets.set(tweetId, tweet);
    this.user.tweetCount++;

    this.recordMutation('tweet_created', {
      tweetId,
      text: tweet.text.substring(0, 100),
    });

    return {
      status: 201,
      headers: { 'content-type': 'application/json' },
      body: { data: { id: tweetId, text: tweet.text } },
      timestamp: new Date(),
    };
  }

  private handleGetTweet(request: APIRequest): APIResponse {
    const tweetId = request.url.split('/tweets/')[1]?.split('?')[0];

    if (!tweetId || !this.tweets.has(tweetId)) {
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
      body: { data: this.tweets.get(tweetId) },
      timestamp: new Date(),
    };
  }

  // Test helpers
  postTweet(text: string): string {
    const tweetId = `tweet_${++this.tweetId}`;

    if (!this.user) {
      this.user = {
        id: 'user_1',
        username: 'testuser',
        name: 'Test User',
        followers: 0,
        following: 0,
        tweetCount: 0,
        profileImage: 'https://example.com/profile.jpg',
      };
    }

    const tweet: Tweet = {
      id: tweetId,
      text,
      createdAt: new Date().toISOString(),
      authorId: this.user.id,
      likeCount: 0,
      retweetCount: 0,
      replyCount: 0,
      impressionCount: 0,
    };

    this.tweets.set(tweetId, tweet);
    this.user.tweetCount++;

    return tweetId;
  }

  getTweets(): Tweet[] {
    return Array.from(this.tweets.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
