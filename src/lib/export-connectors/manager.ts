import {
  ExportConnector,
  ExportResult,
  ExportFormat,
  ExportData,
  ServiceHealthResult,
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
import { TASK_CONFIG, IDEA_CONFIG, APP_CONFIG } from '../config';
import { generateId } from '../id-generator';

export interface ExportManagerOptions {
  enableExternalConnectors?: boolean;
}

export class ExportManager {
  private connectors: Map<string, ExportConnector> = new Map();

  constructor(_options: ExportManagerOptions = {}) {
    this.registerConnector(new JSONExporter());
    this.registerConnector(new MarkdownExporter());

    // Server-side connectors (always register, but they check env vars)
    // In browser, these will fail validation gracefully
    this.registerConnector(new NotionExporter());
    this.registerConnector(new TrelloExporter());
    this.registerConnector(new GoogleTasksExporter());
    this.registerConnector(new GitHubProjectsExporter());
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

  private static readonly EXTERNAL_CONNECTORS_REQUIRING_API_ACCESS = new Set([
    'notion',
    'trello',
    'google-tasks',
    'github-projects',
  ]);

  async getConnectorsHealth(): Promise<
    Record<
      string,
      {
        name: string;
        configured: boolean;
        isExternal: boolean;
        lastChecked: string;
        error?: string;
        serviceHealth?: ServiceHealthResult | null;
      }
    >
  > {
    const results: Record<
      string,
      {
        name: string;
        configured: boolean;
        isExternal: boolean;
        lastChecked: string;
        error?: string;
        serviceHealth?: ServiceHealthResult | null;
      }

    > = {};

    for (const [type, connector] of this.connectors.entries()) {
      try {
        const isValid = await connector.validateConfig();
        const serviceHealth = connector.checkServiceHealth ? await connector.checkServiceHealth() : null;
        results[type] = {
          name: connector.name,
          configured: isValid,
          isExternal:
            ExportManager.EXTERNAL_CONNECTORS_REQUIRING_API_ACCESS.has(type),
          lastChecked: new Date().toISOString(),
          serviceHealth,
        };
      } catch (error) {
        results[type] = {
          name: connector.name,
          configured: false,
          isExternal:
            ExportManager.EXTERNAL_CONNECTORS_REQUIRING_API_ACCESS.has(type),
          lastChecked: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return results;
  }

  async getConnectorsHealthSummary(): Promise<{
    total: number;
    configured: number;
    external: number;
    externalConfigured: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
  }> {
    const health = await this.getConnectorsHealth();
    const connectors = Object.values(health);

    const total = connectors.length;
    const configured = connectors.filter((c) => c.configured).length;
    const external = connectors.filter((c) => c.isExternal).length;
    const externalConfigured = connectors.filter(
      (c) => c.isExternal && c.configured
    ).length;

    const status: 'healthy' | 'degraded' | 'unhealthy' =
      configured === total
        ? 'healthy'
        : configured > 0
          ? 'degraded'
          : 'unhealthy';

    return {
      total,
      configured,
      external,
      externalConfigured,
      status,
    };
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
        status: (idea.status || IDEA_CONFIG.DEFAULTS.STATUS) as Idea['status'],
        deleted_at: idea.deleted_at || null,
      },
      deliverables: deliverables.map((d) => ({
        id: d.id || '',
        idea_id: d.idea_id || idea.id,
        title: d.title || '',
        description: d.description,
        priority: d.priority || TASK_CONFIG.DEFAULTS.PRIORITY,
        estimate_hours: d.estimate_hours || TASK_CONFIG.DEFAULTS.ESTIMATE,
        milestone_id: d.milestone_id || null,
        completion_percentage:
          d.completion_percentage || TASK_CONFIG.DEFAULTS.COMPLETION_PERCENTAGE,
        business_value: d.business_value || TASK_CONFIG.DEFAULTS.PRIORITY,
        risk_factors: d.risk_factors || [],
        acceptance_criteria: d.acceptance_criteria || null,
        deliverable_type: d.deliverable_type || 'feature',
        deleted_at: d.deleted_at || null,
        created_at: d.created_at || new Date().toISOString(),
      })),
      tasks: tasks.map((t) => ({
        id: t.id || '',
        deliverable_id: t.deliverable_id || '',
        title: t.title || '',
        description: t.description,
        assignee: t.assignee,
        status: (t.status || TASK_CONFIG.STATUSES.TODO) as Task['status'],
        estimate: t.estimate || TASK_CONFIG.DEFAULTS.ESTIMATE,
        start_date: t.start_date || null,
        end_date: t.end_date || null,
        actual_hours: t.actual_hours || null,
        completion_percentage:
          t.completion_percentage || TASK_CONFIG.DEFAULTS.COMPLETION_PERCENTAGE,
        priority_score: t.priority_score || TASK_CONFIG.DEFAULTS.PRIORITY_SCORE,
        complexity_score:
          t.complexity_score || TASK_CONFIG.DEFAULTS.COMPLEXITY_SCORE,
        risk_level: t.risk_level || TASK_CONFIG.DEFAULTS.RISK_LEVEL,
        tags: t.tags || [],
        custom_fields: t.custom_fields || null,
        milestone_id: t.milestone_id || null,
        deleted_at: t.deleted_at || null,
        created_at: t.created_at || new Date().toISOString(),
      })),
      metadata: {
        exported_at: new Date().toISOString(),
        version: APP_CONFIG.VERSION,
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
    // SECURITY: Use centralized generateId() for cryptographically secure, collision-resistant IDs
    return `export_${generateId()}`;
  },
};
