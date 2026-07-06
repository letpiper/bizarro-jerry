import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface GranolaNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  linkedNotes?: string[];
}

export interface GranolaPanel {
  id: string;
  name: string;
  notes: string[];
  createdAt: string;
}

export class GranolaIntegration extends BaseIntegration {
  private notes: Map<string, GranolaNote> = new Map();
  private panels: Map<string, GranolaPanel> = new Map();
  private noteId = 0;
  private panelId = 0;

  constructor(world: any) {
    super('granola.co', world);
  }

  snapshot(): unknown {
    return {
      noteCount: this.notes.size,
      panelCount: this.panels.size,
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/notes') && method === 'GET' && !path.includes('/notes/')) {
      return this.handleListNotes(request);
    } else if (path.includes('/notes') && method === 'POST') {
      return this.handleCreateNote(request);
    } else if (path.includes('/notes/') && method === 'GET') {
      return this.handleGetNote(request);
    } else if (path.includes('/notes/') && method === 'PUT') {
      return this.handleUpdateNote(request);
    } else if (path.includes('/panels') && method === 'GET' && !path.includes('/panels/')) {
      return this.handleListPanels(request);
    } else if (path.includes('/panels') && method === 'POST') {
      return this.handleCreatePanel(request);
    } else if (path.includes('/search') && method === 'GET') {
      return this.handleSearch(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleListNotes(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    const notes = Array.from(this.notes.values()).slice(0, limit);

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { notes, total: this.notes.size },
      timestamp: new Date(),
    };
  }

  private handleCreateNote(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const noteId = `note_${++this.noteId}`;

    const note: GranolaNote = {
      id: noteId,
      title: body.title || 'Untitled',
      content: body.content || '',
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedNotes: [],
    };

    this.notes.set(noteId, note);

    this.recordMutation('note_created', {
      noteId,
      title: note.title,
    });

    return {
      status: 201,
      headers: { 'content-type': 'application/json' },
      body: note,
      timestamp: new Date(),
    };
  }

  private handleGetNote(request: APIRequest): APIResponse {
    const noteId = request.url.split('/notes/')[1]?.split('?')[0];

    if (!noteId || !this.notes.has(noteId)) {
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
      body: this.notes.get(noteId),
      timestamp: new Date(),
    };
  }

  private handleUpdateNote(request: APIRequest): APIResponse {
    const noteId = request.url.split('/notes/')[1]?.split('?')[0];
    const body = request.body as Record<string, any>;

    const note = this.notes.get(noteId!);
    if (!note) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    if (body.title) note.title = body.title;
    if (body.content) note.content = body.content;
    if (body.tags) note.tags = body.tags;
    note.updatedAt = new Date().toISOString();

    this.recordMutation('note_updated', { noteId });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: note,
      timestamp: new Date(),
    };
  }

  private handleListPanels(request: APIRequest): APIResponse {
    const panels = Array.from(this.panels.values());

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { panels, total: this.panels.size },
      timestamp: new Date(),
    };
  }

  private handleCreatePanel(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const panelId = `panel_${++this.panelId}`;

    const panel: GranolaPanel = {
      id: panelId,
      name: body.name || 'New Panel',
      notes: body.notes || [],
      createdAt: new Date().toISOString(),
    };

    this.panels.set(panelId, panel);

    this.recordMutation('panel_created', {
      panelId,
      name: panel.name,
    });

    return {
      status: 201,
      headers: { 'content-type': 'application/json' },
      body: panel,
      timestamp: new Date(),
    };
  }

  private handleSearch(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    const results = Array.from(this.notes.values()).filter(
      (note) =>
        note.title.includes(query) ||
        note.content.includes(query) ||
        note.tags.some((tag) => tag.includes(query))
    );

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { results, count: results.length },
      timestamp: new Date(),
    };
  }

  // Test helpers
  createNote(title: string, content: string, tags: string[] = []): string {
    const noteId = `note_${++this.noteId}`;
    const note: GranolaNote = {
      id: noteId,
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.set(noteId, note);
    return noteId;
  }

  getNotes(): GranolaNote[] {
    return Array.from(this.notes.values());
  }
}
