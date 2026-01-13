import {
  ExportManager,
  JSONExporter,
  MarkdownExporter,
  NotionExporter,
  TrelloExporter,
  GoogleTasksExporter,
  GitHubProjectsExporter,
  ExportConnector,
  exportUtils,
  IdeaFlowExportSchema,
  SyncStatusTracker,
  type ExportFormat,
  type ExportResult,
} from '@/lib/exports';

describe('Export Services', () => {
  describe('JSONExporter', () => {
    let exporter: JSONExporter;

    beforeEach(() => {
      exporter = new JSONExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('json');
      expect(exporter.name).toBe('JSON');
    });

    it('should validate config successfully', async () => {
      const isValid = await exporter.validateConfig();
      expect(isValid).toBe(true);
    });

    it('should export to JSON format', async () => {
      const testData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'This is a test project description',
          status: 'draft',
          created_at: new Date().toISOString(),
        },
      };

      const result = await exporter.export(testData);

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.url?.startsWith('data:application/json')).toBe(true);
    });

    it('should include metadata in JSON export', async () => {
      const testData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'Description',
          status: 'draft',
        },
      };

      const result = await exporter.export(testData, { customField: 'test' });

      expect(result.success).toBe(true);
      const json = JSON.parse(decodeURIComponent(result.url!.split(',')[1]));

      expect(json.metadata).toHaveProperty('exported_at');
      expect(json.metadata).toHaveProperty('version', '1.0.0');
      expect(json.metadata).toHaveProperty('customField', 'test');
    });

    it('should throw error for auth methods', async () => {
      await expect(exporter.getAuthUrl()).rejects.toThrow(
        'JSON export does not require authentication'
      );
      await expect(exporter.handleAuthCallback('code')).rejects.toThrow(
        'JSON export does not require authentication'
      );
    });
  });

  describe('MarkdownExporter', () => {
    let exporter: MarkdownExporter;

    beforeEach(() => {
      exporter = new MarkdownExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('markdown');
      expect(exporter.name).toBe('Markdown');
    });

    it('should validate config successfully', async () => {
      const isValid = await exporter.validateConfig();
      expect(isValid).toBe(true);
    });

    it('should export to markdown format', async () => {
      const testData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'This is a test project description',
          status: 'draft',
          created_at: new Date().toISOString(),
        },
        deliverables: [
          {
            id: 'test-deliverable',
            title: 'Test Deliverable',
            description: 'Test description',
            priority: 1,
            estimate_hours: 8,
          },
        ],
        tasks: [
          {
            id: 'test-task',
            deliverable_id: 'test-deliverable',
            title: 'Test Task',
            description: 'Test task description',
            assignee: 'Test User',
            status: 'todo',
            estimate: 2,
          },
        ],
      };

      const result = await exporter.export(testData);

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.url?.startsWith('data:text/markdown')).toBe(true);
    });

    it('should handle export errors gracefully', async () => {
      const invalidData = null;
      const result = await exporter.export(invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should generate markdown with all sections', async () => {
      const testData = {
        idea: {
          title: 'Test Project',
          raw_text: 'Test description',
        },
        deliverables: [
          {
            title: 'Deliverable 1',
            description: 'Description 1',
            estimate_hours: 5,
          },
        ],
        tasks: [
          {
            title: 'Task 1',
            assignee: 'User 1',
            status: 'completed',
            estimate: 3,
          },
        ],
      };

      const result = await exporter.export(testData, {
        goals: ['Goal 1', 'Goal 2'],
        targetAudience: 'Developers',
        roadmap: [
          {
            phase: 'Phase 1',
            start: '2024-01-01',
            end: '2024-01-31',
            deliverables: ['Deliverable 1'],
          },
        ],
      });

      expect(result.success).toBe(true);
      const markdown = decodeURIComponent(result.url!.split(',')[1]);

      expect(markdown).toContain('# Project Blueprint — Test Project');
      expect(markdown).toContain('## Summary');
      expect(markdown).toContain('Test description');
      expect(markdown).toContain('## Goals');
      expect(markdown).toContain('- Goal 1');
      expect(markdown).toContain('## Target Audience');
      expect(markdown).toContain('Developers');
      expect(markdown).toContain('## Deliverables');
      expect(markdown).toContain('## Tasks');
      expect(markdown).toContain('- [x] Task 1');
      expect(markdown).toContain('## Roadmap');
    });

    it('should throw error for auth methods', async () => {
      await expect(exporter.getAuthUrl()).rejects.toThrow(
        'Markdown export does not require authentication'
      );
      await expect(exporter.handleAuthCallback('code')).rejects.toThrow(
        'Markdown export does not require authentication'
      );
    });
  });

  describe('NotionExporter', () => {
    let exporter: NotionExporter;

    beforeEach(() => {
      exporter = new NotionExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('notion');
      expect(exporter.name).toBe('Notion');
    });

    it('should fail export without API key', async () => {
      const originalEnv = process.env.NOTION_API_KEY;
      delete process.env.NOTION_API_KEY;

      const result = await exporter.export({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('API key');

      process.env.NOTION_API_KEY = originalEnv;
    });

    it('should validate config based on environment variable', async () => {
      const originalEnv = process.env.NOTION_API_KEY;

      process.env.NOTION_API_KEY = 'test-key';
      // Note: This will fail in test environment without actual API access
      // but we test the logic structure
      const result1 = await exporter.validateConfig();
      expect(typeof result1).toBe('boolean');

      delete process.env.NOTION_API_KEY;
      expect(await exporter.validateConfig()).toBe(false);

      process.env.NOTION_API_KEY = originalEnv;
    });

    it('should return auth URL', async () => {
      const authUrl = await exporter.getAuthUrl();
      expect(authUrl).toContain('https://api.notion.com/v1/oauth/authorize');
      expect(authUrl).toContain('client_id=');
    });
  });

  describe('TrelloExporter', () => {
    let exporter: TrelloExporter;

    beforeEach(() => {
      exporter = new TrelloExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('trello');
      expect(exporter.name).toBe('Trello');
    });

    it('should fail export without credentials', async () => {
      const originalApiKey = process.env.TRELLO_API_KEY;
      const originalToken = process.env.TRELLO_TOKEN;

      delete process.env.TRELLO_API_KEY;
      delete process.env.TRELLO_TOKEN;

      const result = await exporter.export({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('API key and token are required');

      process.env.TRELLO_API_KEY = originalApiKey;
      process.env.TRELLO_TOKEN = originalToken;
    });

    it('should validate config based on environment variables', async () => {
      const originalApiKey = process.env.TRELLO_API_KEY;
      const originalToken = process.env.TRELLO_TOKEN;

      process.env.TRELLO_API_KEY = 'test-key';
      process.env.TRELLO_TOKEN = 'test-token';
      // Note: This will fail in test environment without actual API access
      const result1 = await exporter.validateConfig();
      expect(typeof result1).toBe('boolean');

      delete process.env.TRELLO_API_KEY;
      expect(await exporter.validateConfig()).toBe(false);

      process.env.TRELLO_API_KEY = originalApiKey;
      process.env.TRELLO_TOKEN = originalToken;
    });
  });

  describe('GoogleTasksExporter', () => {
    let exporter: GoogleTasksExporter;

    beforeEach(() => {
      exporter = new GoogleTasksExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('google-tasks');
      expect(exporter.name).toBe('Google Tasks');
    });

    it('should fail export without client API route', async () => {
      const result = await exporter.export({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('requires server-side API route');
    });

    it('should validate config based on environment variable', async () => {
      const originalEnv = process.env.GOOGLE_CLIENT_ID;
      const originalSecret = process.env.GOOGLE_CLIENT_SECRET;

      process.env.GOOGLE_CLIENT_ID = 'test-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
      // Note: This will fail without refresh token but tests the logic
      const result1 = await exporter.validateConfig();
      expect(typeof result1).toBe('boolean');

      delete process.env.GOOGLE_CLIENT_ID;
      expect(await exporter.validateConfig()).toBe(false);

      process.env.GOOGLE_CLIENT_ID = originalEnv;
      process.env.GOOGLE_CLIENT_SECRET = originalSecret;
    });
  });

  describe('GitHubProjectsExporter', () => {
    let exporter: GitHubProjectsExporter;

    beforeEach(() => {
      exporter = new GitHubProjectsExporter();
    });

    it('should have correct type and name', () => {
      expect(exporter.type).toBe('github-projects');
      expect(exporter.name).toBe('GitHub Projects');
    });

    it('should fail export without token', async () => {
      const originalToken = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const result = await exporter.export({});
      expect(result.success).toBe(false);
      expect(result.error).toContain('GitHub token is required');

      process.env.GITHUB_TOKEN = originalToken;
    });

    it('should validate config based on environment variable', async () => {
      const originalEnv = process.env.GITHUB_TOKEN;

      process.env.GITHUB_TOKEN = 'test-token';
      // Note: This will fail in test environment without actual API access
      const result1 = await exporter.validateConfig();
      expect(typeof result1).toBe('boolean');

      delete process.env.GITHUB_TOKEN;
      expect(await exporter.validateConfig()).toBe(false);

      process.env.GITHUB_TOKEN = originalEnv;
    });
  });

  describe('ExportManager', () => {
    let manager: ExportManager;

    beforeEach(() => {
      manager = new ExportManager();
    });

    it('should register client-side connectors', () => {
      const connectors = manager.getAvailableConnectors();
      expect(connectors).toHaveLength(3); // Only client-side connectors

      const types = connectors.map((c) => c.type);
      expect(types).toContain('json');
      expect(types).toContain('markdown');
      expect(types).toContain('google-tasks'); // Placeholder version
    });

    it('should get connector by type', () => {
      const markdownConnector = manager.getConnector('markdown');
      expect(markdownConnector).toBeInstanceOf(MarkdownExporter);

      const unknownConnector = manager.getConnector('unknown');
      expect(unknownConnector).toBeUndefined();
    });

    it('should register custom connector', () => {
      class CustomExporter extends ExportConnector {
        readonly type = 'custom';
        readonly name = 'Custom';

        async export(
          data: any,
          options?: Record<string, any>
        ): Promise<ExportResult> {
          return {
            success: true,
            url: `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`,
          };
        }

        async validateConfig(): Promise<boolean> {
          return true;
        }

        async getAuthUrl(): Promise<string> {
          return 'https://example.com/auth';
        }

        async handleAuthCallback(code: string): Promise<void> {
          // No-op for test
        }
      }

      const customConnector = new CustomExporter();
      manager.registerConnector(customConnector);

      const retrieved = manager.getConnector('custom');
      expect(retrieved).toBe(customConnector);
    });

    it('should export successfully with valid connector', async () => {
      const format: ExportFormat = {
        type: 'markdown',
        data: {
          idea: {
            id: 'test',
            title: 'Test',
            raw_text: 'Description',
            status: 'draft',
          },
        },
      };

      const result = await manager.export(format);
      expect(result.success).toBe(true);
    });

    it('should fail export with unknown connector', async () => {
      const format = {
        type: 'unknown' as any,
        data: {},
      };

      const result = await manager.export(format);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should fail export with invalid connector type', async () => {
      const format: ExportFormat = {
        type: 'notion', // Not available on client-side
        data: {
          idea: {
            id: 'test',
            title: 'Test',
            raw_text: 'Test',
            status: 'draft',
          },
        },
      };

      const result = await manager.export(format);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Export connector 'notion' not found");
    });

    it('should validate all client-side connectors', async () => {
      const results = await manager.validateAllConnectors();

      expect(results).toHaveProperty('markdown');
      expect(results).toHaveProperty('json');
      expect(results).toHaveProperty('google-tasks');
    });
  });

  describe('exportUtils', () => {
    describe('normalizeData', () => {
      it('should normalize idea data correctly', () => {
        const idea = {
          id: 'test-idea',
          title: 'Test Idea',
          raw_text: 'Test description',
          status: 'draft',
          created_at: '2024-01-01T00:00:00Z',
        };

        const result = exportUtils.normalizeData(idea);

        expect(result.idea).toEqual(idea);
        expect(result.deliverables).toEqual([]);
        expect(result.tasks).toEqual([]);
        expect(result.metadata).toHaveProperty('exported_at');
        expect(result.metadata.version).toBe('1.0.0');
      });

      it('should normalize deliverables and tasks', () => {
        const idea = {
          id: '1',
          title: 'Test',
          raw_text: 'Desc',
          status: 'draft',
        };
        const deliverables = [
          {
            id: 'd1',
            title: 'Deliverable 1',
            description: 'Desc',
            priority: 1,
            estimate_hours: 5,
          },
        ];
        const tasks = [
          {
            id: 't1',
            deliverable_id: 'd1',
            title: 'Task 1',
            description: 'Desc',
            assignee: 'User',
            status: 'todo',
            estimate: 2,
          },
        ];

        const result = exportUtils.normalizeData(idea, deliverables, tasks);

        expect(result.deliverables).toHaveLength(1);
        expect(result.tasks).toHaveLength(1);
        expect(result.deliverables[0]).toMatchObject(deliverables[0]);
        expect(result.tasks[0]).toMatchObject(tasks[0]);
        expect(result.deliverables[0]).toHaveProperty('created_at');
        expect(result.deliverables[0]).toHaveProperty('idea_id', '1');
        expect(result.tasks[0]).toHaveProperty('created_at');
      });
    });

    describe('validateExportData', () => {
      it('should validate correct data', () => {
        const validData = {
          idea: {
            id: 'test',
            title: 'Test',
            raw_text: 'Description',
            status: 'draft',
          },
        };

        const result = exportUtils.validateExportData(validData);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect missing idea', () => {
        const invalidData = {};

        const result = exportUtils.validateExportData(invalidData);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Missing required field: idea');
      });

      it('should detect missing required fields', () => {
        const invalidData = {
          idea: {
            id: 'test',
            title: 'Test',
            // missing raw_text and status
          },
        };

        const result = exportUtils.validateExportData(invalidData);
        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          'Missing required field: idea.raw_text'
        );
        expect(result.errors).toContain('Missing required field: idea.status');
      });
    });
  });

  describe('SyncStatusTracker', () => {
    let tracker: SyncStatusTracker;

    beforeEach(() => {
      tracker = SyncStatusTracker.getInstance();
      tracker.clearSyncStatus('test-export');
    });

    it('should set and get sync status', () => {
      const status = {
        status: 'completed' as const,
      };

      tracker.setSyncStatus('test-export', status);
      const retrieved = tracker.getSyncStatus('test-export');

      expect(retrieved).toBeDefined();
      expect(retrieved!.status).toBe('completed');
      expect(retrieved!.lastSync).toBeDefined();
    });

    it('should return undefined for non-existent status', () => {
      const status = tracker.getSyncStatus('non-existent');
      expect(status).toBeUndefined();
    });

    it('should get all sync statuses', () => {
      tracker.setSyncStatus('export1', { status: 'pending' as const });
      tracker.setSyncStatus('export2', { status: 'completed' as const });

      const allStatuses = tracker.getAllSyncStatuses();

      expect(allStatuses).toHaveProperty('export1');
      expect(allStatuses).toHaveProperty('export2');
      expect(allStatuses.export1.status).toBe('pending');
      expect(allStatuses.export2.status).toBe('completed');
    });

    it('should clear sync status', () => {
      tracker.setSyncStatus('test-export', { status: 'pending' as const });
      expect(tracker.getSyncStatus('test-export')).toBeDefined();

      tracker.clearSyncStatus('test-export');
      expect(tracker.getSyncStatus('test-export')).toBeUndefined();
    });
  });

  describe('IdeaFlowExportSchema', () => {
    it('should have correct schema structure', () => {
      expect(IdeaFlowExportSchema).toHaveProperty('$schema');
      expect(IdeaFlowExportSchema).toHaveProperty('type', 'object');
      expect(IdeaFlowExportSchema).toHaveProperty('properties');
      expect(IdeaFlowExportSchema).toHaveProperty('required', ['idea']);
    });

    it('should define idea properties correctly', () => {
      const ideaProps = IdeaFlowExportSchema.properties.idea;
      expect(ideaProps.properties).toHaveProperty('id');
      expect(ideaProps.properties).toHaveProperty('title');
      expect(ideaProps.properties).toHaveProperty('raw_text');
      expect(ideaProps.properties).toHaveProperty('status');
      expect(ideaProps.required).toEqual(['id', 'title', 'raw_text', 'status']);
    });
  });
});
