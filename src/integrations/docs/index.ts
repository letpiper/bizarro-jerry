import { BaseIntegration } from '../base';
import type { APIRequest, APIResponse } from '../../core/types';

export interface GoogleDoc {
  id: string;
  title: string;
  mimeType: 'application/vnd.google-apps.document';
  webViewLink: string;
  owners: string[];
  permissions: Array<{ role: string; emailAddress?: string }>;
  createdTime: string;
  modifiedTime: string;
}

export interface DocContent {
  body: {
    content: Array<{
      paragraph?: { elements: Array<{ textRun?: { content: string } }> };
    }>;
  };
}

export class DocsIntegration extends BaseIntegration {
  private docs: Map<string, GoogleDoc> = new Map();
  private docContent: Map<string, string> = new Map();
  private docId = 0;

  constructor(world: any) {
    super('docs.googleapis.com', world);
  }

  snapshot(): unknown {
    return {
      documentCount: this.docs.size,
      documents: Array.from(this.docs.keys()),
    };
  }

  async handle(request: APIRequest): Promise<APIResponse> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    if (path.includes('/drive/v3/files') && method === 'GET' && !path.includes('/files/')) {
      return this.handleListDocs(request);
    } else if (path.includes('/drive/v3/files') && method === 'POST') {
      return this.handleCreateDoc(request);
    } else if (path.includes('/drive/v3/files/') && method === 'GET') {
      return this.handleGetDoc(request);
    } else if (path.includes('/drive/v3/files/') && method === 'PATCH') {
      return this.handleUpdateDoc(request);
    } else if (path.includes('/docs/v1/') && method === 'GET') {
      return this.handleGetDocContent(request);
    } else if (path.includes('/docs/v1/') && method === 'POST') {
      return this.handleUpdateContent(request);
    }

    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: { error: 'Not Found' },
      timestamp: new Date(),
    };
  }

  private handleListDocs(request: APIRequest): APIResponse {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';

    let results = Array.from(this.docs.values());
    if (q) {
      results = results.filter((d) => d.title.includes(q));
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { files: results },
      timestamp: new Date(),
    };
  }

  private handleCreateDoc(request: APIRequest): APIResponse {
    const body = request.body as Record<string, any>;
    const docId = `doc_${++this.docId}`;

    const doc: GoogleDoc = {
      id: docId,
      title: body.name || 'Untitled Document',
      mimeType: 'application/vnd.google-apps.document',
      webViewLink: `https://docs.google.com/document/d/${docId}`,
      owners: ['user@example.com'],
      permissions: [],
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    };

    this.docs.set(docId, doc);
    this.docContent.set(docId, '');

    this.recordMutation('doc_created', {
      docId,
      title: doc.title,
    });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: doc,
      timestamp: new Date(),
    };
  }

  private handleGetDoc(request: APIRequest): APIResponse {
    const docId = request.url.split('/files/')[1]?.split('?')[0];

    if (!docId || !this.docs.has(docId)) {
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
      body: this.docs.get(docId),
      timestamp: new Date(),
    };
  }

  private handleUpdateDoc(request: APIRequest): APIResponse {
    const docId = request.url.split('/files/')[1]?.split('?')[0];
    const body = request.body as Record<string, any>;

    const doc = this.docs.get(docId!);
    if (!doc) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    if (body.name) {
      doc.title = body.name;
    }
    doc.modifiedTime = new Date().toISOString();

    this.recordMutation('doc_updated', { docId, title: doc.title });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: doc,
      timestamp: new Date(),
    };
  }

  private handleGetDocContent(request: APIRequest): APIResponse {
    const docId = request.url.split('/docs/v1/')[1]?.split('?')[0];

    if (!docId || !this.docs.has(docId)) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    const doc = this.docs.get(docId)!;
    const content = this.docContent.get(docId) || '';

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: {
        documentId: docId,
        title: doc.title,
        body: {
          content: [
            {
              paragraph: {
                elements: [{ textRun: { content } }],
              },
            },
          ],
        },
      },
      timestamp: new Date(),
    };
  }

  private handleUpdateContent(request: APIRequest): APIResponse {
    const docId = request.url.split('/docs/v1/')[1]?.split(':')[0];
    const body = request.body as Record<string, any>;

    if (!docId || !this.docs.has(docId)) {
      return {
        status: 404,
        headers: { 'content-type': 'application/json' },
        body: { error: 'Not Found' },
        timestamp: new Date(),
      };
    }

    const requests = body.requests || [];
    let content = this.docContent.get(docId) || '';

    for (const req of requests) {
      if (req.insertText) {
        content += req.insertText.text;
      }
    }

    this.docContent.set(docId, content);
    const doc = this.docs.get(docId)!;
    doc.modifiedTime = new Date().toISOString();

    this.recordMutation('doc_content_updated', { docId });

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: { documentId: docId, replies: [] },
      timestamp: new Date(),
    };
  }

  // Test helpers
  createDocument(title: string): string {
    const docId = `doc_${++this.docId}`;
    const doc: GoogleDoc = {
      id: docId,
      title,
      mimeType: 'application/vnd.google-apps.document',
      webViewLink: `https://docs.google.com/document/d/${docId}`,
      owners: ['user@example.com'],
      permissions: [],
      createdTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    };

    this.docs.set(docId, doc);
    this.docContent.set(docId, '');
    return docId;
  }

  setDocumentContent(docId: string, content: string): void {
    this.docContent.set(docId, content);
  }

  getDocuments(): GoogleDoc[] {
    return Array.from(this.docs.values());
  }
}
