// Export connectors for IdeaFlow integrations
// Supports Notion, Trello, Google Tasks, GitHub Projects

export interface ExportFormat {
  type:
    | 'markdown'
    | 'json'
    | 'notion'
    | 'trello'
    | 'google-tasks'
    | 'github-projects';
  data: any;
  metadata?: Record<string, any>;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  id?: string;
  error?: string;
}

// Base export connector interface
export abstract class ExportConnector {
  abstract readonly type: string;
  abstract readonly name: string;

  abstract export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult>;
  abstract validateConfig(): Promise<boolean>;
  abstract getAuthUrl?(): Promise<string>;
  abstract handleAuthCallback?(code: string): Promise<void>;
}

// Markdown export connector (built-in)
export class MarkdownExporter extends ExportConnector {
  readonly type = 'markdown';
  readonly name = 'Markdown';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      const markdown = this.generateMarkdown(data, options);

      // In a real implementation, this would generate a downloadable file
      // For now, return the markdown content as if it were exported
      return {
        success: true,
        url: `data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Markdown export doesn't require external configuration
    return true;
  }

  async getAuthUrl(): Promise<string> {
    throw new Error('Markdown export does not require authentication');
  }

  async handleAuthCallback(code: string): Promise<void> {
    throw new Error('Markdown export does not require authentication');
  }

  private generateMarkdown(data: any, options?: Record<string, any>): string {
    const { idea, deliverables, tasks } = data;

    let markdown = `# Project Blueprint — ${idea.title}\n\n`;

    // Summary section
    markdown += `## Summary\n${idea.raw_text}\n\n`;

    // Goals section
    if (options?.goals) {
      markdown += `## Goals\n`;
      options.goals.forEach((goal: string) => {
        markdown += `- ${goal}\n`;
      });
      markdown += `\n`;
    }

    // Target audience
    if (options?.targetAudience) {
      markdown += `## Target Audience\n${options.targetAudience}\n\n`;
    }

    // Deliverables
    if (deliverables && deliverables.length > 0) {
      markdown += `## Deliverables\n`;
      deliverables.forEach((deliverable: any, index: number) => {
        markdown += `${index + 1}. **${deliverable.title}** — ${deliverable.description || 'No description'} — ${deliverable.estimate_hours}h estimated\n`;
      });
      markdown += `\n`;
    }

    // Tasks
    if (tasks && tasks.length > 0) {
      markdown += `## Tasks\n`;
      tasks.forEach((task: any) => {
        const status = task.status === 'completed' ? 'x' : ' ';
        markdown += `- [${status}] ${task.title} — ${task.assignee || 'Unassigned'} — ${task.estimate}h\n`;
      });
      markdown += `\n`;
    }

    // Roadmap
    if (options?.roadmap) {
      markdown += `## Roadmap\n`;
      markdown += `| Phase | Start | End | Key deliverables |\n`;
      markdown += `|-------|-------|-----|------------------|\n`;
      options.roadmap.forEach((phase: any) => {
        markdown += `| ${phase.phase} | ${phase.start} | ${phase.end} | ${phase.deliverables.join(', ')} |\n`;
      });
    }

    return markdown;
  }
}

// Notion export connector (placeholder)
export class NotionExporter extends ExportConnector {
  readonly type = 'notion';
  readonly name = 'Notion';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      // Placeholder implementation
      // In a real implementation, this would:
      // 1. Authenticate with Notion API
      // 2. Create a new page or database
      // 3. Format data according to Notion's structure
      // 4. Return the page URL

      console.log('Notion export not yet implemented', { data, options });

      return {
        success: false,
        error: 'Notion export connector not yet implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Check if NOTION_API_KEY is configured
    return !!process.env.NOTION_API_KEY;
  }

  async getAuthUrl(): Promise<string> {
    // Return Notion OAuth URL
    return 'https://api.notion.com/v1/oauth/authorize';
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Handle Notion OAuth callback
    console.log('Notion auth callback not implemented');
  }
}

// Trello export connector (placeholder)
export class TrelloExporter extends ExportConnector {
  readonly type = 'trello';
  readonly name = 'Trello';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      // Placeholder implementation
      // In a real implementation, this would:
      // 1. Authenticate with Trello API
      // 2. Create a new board
      // 3. Create lists for deliverables
      // 4. Create cards for tasks
      // 5. Return the board URL

      console.log('Trello export not yet implemented', { data, options });

      return {
        success: false,
        error: 'Trello export connector not yet implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Check if Trello API credentials are configured
    return !!(process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN);
  }

  async getAuthUrl(): Promise<string> {
    // Return Trello OAuth URL
    return 'https://trello.com/1/authorize';
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Handle Trello OAuth callback
    console.log('Trello auth callback not implemented');
  }
}

// Google Tasks export connector (placeholder)
export class GoogleTasksExporter extends ExportConnector {
  readonly type = 'google-tasks';
  readonly name = 'Google Tasks';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      // Placeholder implementation
      console.log('Google Tasks export not yet implemented', { data, options });

      return {
        success: false,
        error: 'Google Tasks export connector not yet implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Check if Google API credentials are configured
    return !!process.env.GOOGLE_CLIENT_ID;
  }

  async getAuthUrl(): Promise<string> {
    // Return Google OAuth URL
    return 'https://accounts.google.com/oauth/authorize';
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Handle Google OAuth callback
    console.log('Google auth callback not implemented');
  }
}

// GitHub Projects export connector (placeholder)
export class GitHubProjectsExporter extends ExportConnector {
  readonly type = 'github-projects';
  readonly name = 'GitHub Projects';

  async export(
    data: any,
    options?: Record<string, any>
  ): Promise<ExportResult> {
    try {
      // Placeholder implementation
      console.log('GitHub Projects export not yet implemented', {
        data,
        options,
      });

      return {
        success: false,
        error: 'GitHub Projects export connector not yet implemented',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateConfig(): Promise<boolean> {
    // Check if GitHub token is configured
    return !!process.env.GITHUB_TOKEN;
  }

  async getAuthUrl(): Promise<string> {
    // Return GitHub OAuth URL
    return 'https://github.com/login/oauth/authorize';
  }

  async handleAuthCallback(code: string): Promise<void> {
    // Handle GitHub OAuth callback
    console.log('GitHub auth callback not implemented');
  }
}

// Export manager class
export class ExportManager {
  private connectors: Map<string, ExportConnector> = new Map();

  constructor() {
    // Register built-in connectors
    this.registerConnector(new MarkdownExporter());
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

    // Validate connector configuration
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

    for (const [type, connector] of this.connectors) {
      try {
        results[type] = await connector.validateConfig();
      } catch (error) {
        results[type] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const exportManager = new ExportManager();

// JSON schema for programmatic integrations
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

// Export utilities
export const exportUtils = {
  // Convert IdeaFlow data to standard format
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

  // Validate export data against schema
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
};
