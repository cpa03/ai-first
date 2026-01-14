import {
  ExportConnector,
  ExportResult,
  ExportFormat,
  ExportData,
} from './base';
import {
  JSONExporter,
  MarkdownExporter,
  NotionExporter,
  TrelloExporter,
  GoogleTasksExporter,
  GitHubProjectsExporter,
} from './connectors';
import { Deliverable, Task, Idea } from '../db';

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

  async exportToMarkdown(
    data: ExportData
  ): Promise<ExportResult & { content?: string; url?: string }> {
    return await this.export({ type: 'markdown', data });
  }

  async exportToJSON(data: ExportData): Promise<ExportResult> {
    return await this.export({ type: 'json', data });
  }

  async exportToNotion(
    data: ExportData
  ): Promise<ExportResult & { notionPageId?: string }> {
    return (await this.export({ type: 'notion', data })) as ExportResult & {
      notionPageId?: string;
    };
  }

  async exportToTrello(
    data: ExportData
  ): Promise<ExportResult & { boardId?: string }> {
    return (await this.export({ type: 'trello', data })) as ExportResult & {
      boardId?: string;
    };
  }

  async exportToGoogleTasks(data: ExportData): Promise<ExportResult> {
    return await this.export({ type: 'google-tasks', data });
  }

  async exportToGitHubProjects(data: ExportData): Promise<ExportResult> {
    return await this.export({ type: 'github-projects', data });
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

export const ExportService = ExportManager;

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
  normalizeData(
    idea: Partial<ExportData['idea']> &
      Pick<ExportData['idea'], 'id' | 'title' | 'raw_text'>,
    deliverables: Partial<Deliverable>[] = [],
    tasks: Partial<Task>[] = []
  ): ExportData {
    return {
      idea: {
        id: idea.id,
        title: idea.title,
        raw_text: idea.raw_text,
        created_at: idea.created_at || new Date().toISOString(),
        status: (idea.status || 'draft') as Idea['status'],
      },
      deliverables: deliverables.map((d) => ({
        id: d.id || '',
        idea_id: d.idea_id || idea.id,
        title: d.title || '',
        description: d.description,
        priority: d.priority || 50,
        estimate_hours: d.estimate_hours || 0,
        created_at: d.created_at || new Date().toISOString(),
      })),
      tasks: tasks.map((t) => ({
        id: t.id || '',
        deliverable_id: t.deliverable_id || '',
        title: t.title || '',
        description: t.description,
        assignee: t.assignee,
        status: (t.status || 'todo') as Task['status'],
        estimate: t.estimate || 0,
        created_at: t.created_at || new Date().toISOString(),
      })),
      metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
      },
    };
  },

  validateExportData(data: ExportData): { valid: boolean; errors: string[] } {
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
};
