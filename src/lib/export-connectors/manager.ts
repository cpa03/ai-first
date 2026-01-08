import {
  ExportConnector,
  ExportResult,
  ExportFormat,
  SyncStatus,
} from './base';
import {
  JSONExporter,
  MarkdownExporter,
  NotionExporter,
  TrelloExporter,
  GoogleTasksExporter,
  GitHubProjectsExporter,
} from './connectors';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class ExportManager {
  private connectors: Map<string, ExportConnector> = new Map();

  constructor() {
    this.registerConnector(new JSONExporter());
    this.registerConnector(new MarkdownExporter());

    if (typeof window === 'undefined') {
      this.registerConnector(new NotionExporter());
      this.registerConnector(new TrelloExporter());
      this.registerConnector(new GoogleTasksExporter());
      this.registerConnector(new GitHubProjectsExporter());
    } else {
      this.registerConnector(new GoogleTasksExporter());
    }
  }

  registerConnector(connector: ExportConnector): void {
    this.connectors.set(connector.type, connector);
  }

  getConnector(type: string): ExportConnector | undefined {
    return this.connectors.get(type);
  }

  getAvailableConnectors(): ExportConnector[] {
    return Array.from(this.connectors.values());
  }

  async export(format: ExportFormat): Promise<ExportResult> {
    const connector = this.getConnector(format.type);

    if (!connector) {
      return {
        success: false,
        error: `Export connector '${format.type}' not found`,
      };
    }

    const isValid = await connector.validateConfig();
    if (!isValid) {
      return {
        success: false,
        error: `Export connector '${format.type}' is not properly configured`,
      };
    }

    return await connector.export(format.data, format.metadata);
  }

  async validateAllConnectors(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const type of Array.from(this.connectors.keys())) {
      const connector = this.connectors.get(type);
      if (connector) {
        try {
          results[type] = await connector.validateConfig();
        } catch (_error) {
          results[type] = false;
        }
      }
    }

    return results;
  }
}

export const exportManager = new ExportManager();

export class ExportService {
  private markdownExporter: MarkdownExporter;
  private jsonExporter: JSONExporter;
  private notionExporter: NotionExporter;
  private trelloExporter: TrelloExporter;
  private googleTasksExporter: GoogleTasksExporter;
  private githubProjectsExporter: GitHubProjectsExporter;

  constructor() {
    this.markdownExporter = new MarkdownExporter();
    this.jsonExporter = new JSONExporter();
    this.notionExporter = new NotionExporter();
    this.trelloExporter = new TrelloExporter();
    this.googleTasksExporter = new GoogleTasksExporter();
    this.githubProjectsExporter = new GitHubProjectsExporter();
  }

  async exportToMarkdown(
    data: any
  ): Promise<ExportResult & { content?: string; url?: string }> {
    return await this.markdownExporter.export(data);
  }

  async exportToJSON(data: any): Promise<ExportResult> {
    return await this.jsonExporter.export(data);
  }

  async exportToNotion(
    data: any
  ): Promise<ExportResult & { notionPageId?: string }> {
    return (await this.notionExporter.export(data)) as ExportResult & {
      notionPageId?: string;
    };
  }

  async exportToTrello(
    data: any
  ): Promise<ExportResult & { boardId?: string }> {
    return (await this.trelloExporter.export(data)) as ExportResult & {
      boardId?: string;
    };
  }

  async exportToGoogleTasks(data: any): Promise<ExportResult> {
    return await this.googleTasksExporter.export(data);
  }

  async exportToGitHubProjects(data: any): Promise<ExportResult> {
    return await this.githubProjectsExporter.export(data);
  }
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 100, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();

    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.requests.push(now);
  }
}

export class SyncStatusTracker {
  private static instance: SyncStatusTracker;
  private syncStatuses: Map<string, SyncStatus> = new Map();

  static getInstance(): SyncStatusTracker {
    if (!SyncStatusTracker.instance) {
      SyncStatusTracker.instance = new SyncStatusTracker();
    }
    return SyncStatusTracker.instance;
  }

  setSyncStatus(exportId: string, status: SyncStatus): void {
    this.syncStatuses.set(exportId, {
      ...status,
      lastSync: new Date().toISOString(),
    });
  }

  getSyncStatus(exportId: string): SyncStatus | undefined {
    return this.syncStatuses.get(exportId);
  }

  getAllSyncStatuses(): Record<string, SyncStatus> {
    return Object.fromEntries(this.syncStatuses);
  }

  clearSyncStatus(exportId: string): void {
    this.syncStatuses.delete(exportId);
  }
}

export const IdeaFlowExportSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  title: 'IdeaFlow Export Schema',
  description: 'JSON schema for IdeaFlow project exports',
  properties: {
    idea: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        raw_text: { type: 'string' },
        status: {
          type: 'string',
          enum: ['draft', 'clarified', 'breakdown', 'completed'],
        },
        created_at: { type: 'string', format: 'date-time' },
      },
      required: ['id', 'title', 'raw_text', 'status'],
    },
    deliverables: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'integer' },
          estimate_hours: { type: 'integer' },
        },
        required: ['id', 'title'],
      },
    },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          deliverable_id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          assignee: { type: 'string' },
          status: {
            type: 'string',
            enum: ['todo', 'in_progress', 'completed'],
          },
          estimate: { type: 'integer' },
        },
        required: ['id', 'deliverable_id', 'title'],
      },
    },
    metadata: {
      type: 'object',
      properties: {
        exported_at: { type: 'string', format: 'date-time' },
        version: { type: 'string' },
        goals: { type: 'array', items: { type: 'string' } },
        target_audience: { type: 'string' },
        roadmap: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phase: { type: 'string' },
              start: { type: 'string' },
              end: { type: 'string' },
              deliverables: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  required: ['idea'],
};

export const exportUtils = {
  normalizeData(idea: any, deliverables: any[] = [], tasks: any[] = []): any {
    return {
      idea: {
        id: idea.id,
        title: idea.title,
        raw_text: idea.raw_text,
        status: idea.status,
        created_at: idea.created_at,
      },
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        priority: d.priority,
        estimate_hours: d.estimate_hours,
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        deliverable_id: t.deliverable_id,
        title: t.title,
        description: t.description,
        assignee: t.assignee,
        status: t.status,
        estimate: t.estimate,
      })),
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  },

  validateExportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.idea) {
      errors.push('Missing required field: idea');
    } else {
      if (!data.idea.id) errors.push('Missing required field: idea.id');
      if (!data.idea.title) errors.push('Missing required field: idea.title');
      if (!data.idea.raw_text)
        errors.push('Missing required field: idea.raw_text');
      if (!data.idea.status) errors.push('Missing required field: idea.status');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  generateExportId(): string {
    return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (_error) {
        lastError =
          _error instanceof Error ? _error : new Error('Unknown error');

        if (attempt === maxRetries) {
          throw lastError;
        }

        const waitTime = delay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    throw lastError!;
  },
};
