import {
  ExportManager,
  NotionExporter,
  TrelloExporter,
  GitHubProjectsExporter,
  type ExportData,
} from '@/lib/export-connectors';
import { resilienceManager, circuitBreakerManager } from '@/lib/resilience';
import { MOCK_SECRETS } from './utils/test-secrets';

const mockCircuitBreakerStates: Record<
  string,
  { state: string; failures: number }
> = {};

jest.mock('@/lib/resilience', () => {
  const actualModule = jest.requireActual('@/lib/resilience');

  const mockExecute = jest.fn(
    async (
      operation: () => Promise<unknown>,
      _config?: unknown,
      context?: string
    ) => {
      if (context) {
        const serviceName = context.split('-')[0];
        if (serviceName && !mockCircuitBreakerStates[serviceName]) {
          mockCircuitBreakerStates[serviceName] = {
            state: 'closed',
            failures: 0,
          };
        }
      }
      return operation();
    }
  );

  const mockGetAllStatuses = jest.fn(() => {
    return { ...mockCircuitBreakerStates };
  });

  return {
    ...actualModule,
    resilienceManager: {
      execute: mockExecute,
      getCircuitBreaker: jest.fn(),
      getCircuitBreakerStates: mockGetAllStatuses,
      resetCircuitBreaker: jest.fn(),
    },
    circuitBreakerManager: {
      getOrCreate: jest.fn((name: string) => ({
        execute: jest.fn(async (operation: () => Promise<unknown>) =>
          operation()
        ),
        getState: jest.fn(
          () => mockCircuitBreakerStates[name]?.state || 'closed'
        ),
        getStatus: jest.fn(
          () =>
            mockCircuitBreakerStates[name] || { state: 'closed', failures: 0 }
        ),
        reset: jest.fn(() => {
          mockCircuitBreakerStates[name] = { state: 'closed', failures: 0 };
        }),
      })),
      get: jest.fn((name: string) => ({
        execute: jest.fn(async (operation: () => Promise<unknown>) =>
          operation()
        ),
        getState: jest.fn(
          () => mockCircuitBreakerStates[name]?.state || 'closed'
        ),
        getStatus: jest.fn(
          () =>
            mockCircuitBreakerStates[name] || { state: 'closed', failures: 0 }
        ),
        reset: jest.fn(),
      })),
      getAllStatuses: mockGetAllStatuses,
      reset: jest.fn((name: string) => {
        mockCircuitBreakerStates[name] = { state: 'closed', failures: 0 };
      }),
      resetAll: jest.fn(() => {
        Object.keys(mockCircuitBreakerStates).forEach((key) => {
          mockCircuitBreakerStates[key] = { state: 'closed', failures: 0 };
        });
      }),
    },
  };
});

jest.mock('@notionhq/client', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      pages: {
        create: jest.fn(),
      },
      users: {
        me: jest.fn(),
      },
    })),
  };
});

jest.mock('@anthropic-ai/sdk', () => ({}));

describe('Export Connectors Integration with Resilience Framework', () => {
  let exportManager: ExportManager;
  let mockResilienceExecute: jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();
    Object.keys(mockCircuitBreakerStates).forEach(
      (key) => delete mockCircuitBreakerStates[key]
    );
    exportManager = new ExportManager({ enableExternalConnectors: true });
    mockResilienceExecute = resilienceManager.execute as jest.Mock;
    mockResilienceExecute.mockImplementation(
      async (operation, _config, context) => {
        if (context) {
          const serviceName = context.split('-')[0];
          if (serviceName && !mockCircuitBreakerStates[serviceName]) {
            mockCircuitBreakerStates[serviceName] = {
              state: 'closed',
              failures: 0,
            };
          }
        }
        return operation();
      }
    );
  });

  const createMockExportData = (
    overrides: Partial<ExportData> = {}
  ): ExportData => ({
    idea: {
      id: 'test-idea-123',
      title: 'Test Project',
      raw_text: 'Test project description',
      status: 'draft',
      created_at: new Date().toISOString(),
      deleted_at: null,
      ...overrides.idea,
    },
    deliverables: overrides.deliverables || [
      {
        id: 'del-1',
        idea_id: 'test-idea-123',
        title: 'Deliverable 1',
        description: 'First deliverable',
        priority: 1,
        estimate_hours: 8,
        milestone_id: null,
        completion_percentage: 0,
        business_value: 100,
        risk_factors: [],
        acceptance_criteria: null,
        deliverable_type: 'feature',
        created_at: new Date().toISOString(),
        deleted_at: null,
      },
    ],
    tasks: overrides.tasks || [
      {
        id: 'task-1',
        deliverable_id: 'del-1',
        title: 'Task 1',
        description: 'First task',
        assignee: 'John Doe',
        status: 'todo',
        estimate: 2,
        created_at: new Date().toISOString(),
        milestone_id: null,
        actual_hours: null,
        completion_percentage: 0,
        priority_score: 1,
        complexity_score: 1,
        risk_level: 'low',
        tags: null,
        custom_fields: null,
        start_date: null,
        end_date: null,
      },
    ],
    ...overrides,
  });

  describe('ExportManager with Resilience', () => {
    it('should initialize with all export connectors', () => {
      const connectors = exportManager.getAvailableConnectors();

      expect(connectors).toBeDefined();
      expect(connectors.length).toBeGreaterThan(0);

      expect(connectors.some((c) => c.type === 'json')).toBe(true);
      expect(connectors.some((c) => c.type === 'markdown')).toBe(true);
      expect(connectors.some((c) => c.type === 'google-tasks')).toBe(true);
      expect(connectors.some((c) => c.type === 'notion')).toBe(true);
      expect(connectors.some((c) => c.type === 'trello')).toBe(true);
      expect(connectors.some((c) => c.type === 'github-projects')).toBe(true);
    });
  });

  describe('Circuit Breaker Integration with Exporters', () => {
    it('should use per-service circuit breakers', async () => {
      const mockClient = {
        pages: {
          create: jest.fn().mockResolvedValue({
            url: 'https://notion.so/test-page',
            id: 'page-123',
          }),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const allStatuses = circuitBreakerManager.getAllStatuses();

      expect(Object.keys(allStatuses).length).toBeGreaterThan(0);
    });

    it('should isolate failures between different exporters', async () => {
      const mockNotionClient = {
        pages: {
          create: jest.fn().mockResolvedValue({
            url: 'https://notion.so/test-page',
            id: 'page-123',
          }),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockNotionClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';
      process.env.TRELLO_API_KEY = MOCK_SECRETS.TRELLO_API_KEY;
      process.env.TRELLO_TOKEN = MOCK_SECRETS.TRELLO_TOKEN;

      const notionData = createMockExportData();
      const trelloData = createMockExportData();

      const [notionResult, trelloResult] = await Promise.allSettled([
        exportManager.exportToNotion(notionData),
        exportManager.exportToTrello(trelloData),
      ]);

      if (notionResult.status === 'fulfilled') {
        expect(notionResult.value.success).toBe(true);
      }

      const allStatuses = circuitBreakerManager.getAllStatuses();
      expect(Object.keys(allStatuses).length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Integration', () => {
    it('should convert errors to ExportResult format', async () => {
      const mockClient = {
        pages: {
          create: jest.fn().mockRejectedValue(new Error('Notion API error')),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.url).toBeUndefined();
      expect(result.id).toBeUndefined();
    });

    it('should handle null/undefined errors', async () => {
      const mockClient = {
        pages: {
          create: jest.fn().mockImplementation(() => {
            throw null;
          }),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unknown error types', async () => {
      const mockClient = {
        pages: {
          create: jest.fn().mockImplementation(() => {
            throw 'string error';
          }),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Validation Integration', () => {
    it('should validate configuration with resilience', async () => {
      const mockClient = {
        users: { me: jest.fn().mockResolvedValue({ id: 'user-123' }) },
        pages: { create: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;

      const notionExporter = new NotionExporter();
      const isValid = await notionExporter.validateConfig();

      expect(mockResilienceExecute).toHaveBeenCalled();
      expect(typeof isValid).toBe('boolean');
    });

    it('should handle configuration validation failures gracefully', async () => {
      delete process.env.NOTION_API_KEY;

      const notionExporter = new NotionExporter();
      const isValid = await notionExporter.validateConfig();

      expect(isValid).toBe(false);
    });
  });

  describe('Per-Service Resilience Configuration', () => {
    it('should use Notion-specific configuration', async () => {
      const mockClient = {
        pages: {
          create: jest.fn().mockResolvedValue({
            url: 'https://notion.so/test-page',
            id: 'page-123',
          }),
        },
        users: { me: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const calls = mockResilienceExecute.mock.calls;
      const notionCalls = calls.filter((call) => {
        const context = call[2];
        return context && context.startsWith('notion-');
      });

      expect(notionCalls.length).toBeGreaterThan(0);

      notionCalls.forEach((call) => {
        const config = call[1];
        expect(config.timeoutMs).toBe(30000);
        expect(config.maxRetries).toBe(3);
        expect(config.failureThreshold).toBe(5);
      });
    });

    it('should use Trello-specific configuration', async () => {
      process.env.TRELLO_API_KEY = MOCK_SECRETS.TRELLO_API_KEY;
      process.env.TRELLO_TOKEN = MOCK_SECRETS.TRELLO_TOKEN;

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'board-123',
          url: 'https://trello.com/b/test-board',
        }),
      } as Response);

      const testData = createMockExportData();
      await exportManager.exportToTrello(testData);

      const calls = mockResilienceExecute.mock.calls;
      const trelloCalls = calls.filter((call) => {
        const context = call[2];
        return context && context.startsWith('trello-');
      });

      expect(trelloCalls.length).toBeGreaterThan(0);

      trelloCalls.forEach((call) => {
        const config = call[1];
        expect(config.timeoutMs).toBe(15000);
        expect(config.maxRetries).toBe(3);
        expect(config.failureThreshold).toBe(3);
      });
    });

    it('should use GitHub-specific configuration', async () => {
      process.env.GITHUB_TOKEN = MOCK_SECRETS.GITHUB_TOKEN;

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          login: 'testuser',
          id: 1,
          name: 'test-project',
          html_url: 'https://github.com/test/repo',
        }),
      } as Response);

      const testData = createMockExportData();
      await exportManager.exportToGitHubProjects(testData);

      const calls = mockResilienceExecute.mock.calls;
      const githubCalls = calls.filter((call) => {
        const context = call[2];
        return context && context.startsWith('github-projects-');
      });

      expect(githubCalls.length).toBeGreaterThan(0);

      githubCalls.forEach((call) => {
        const config = call[1];
        expect(config.timeoutMs).toBe(30000);
        expect(config.maxRetries).toBe(3);
        expect(config.failureThreshold).toBe(5);
      });
    });
  });

  describe('Resilience Monitoring and Observability', () => {
    it('should expose circuit breaker states for all services', async () => {
      const mockClient = {
        users: { me: jest.fn().mockResolvedValue({ id: 'user-123' }) },
        pages: { create: jest.fn() },
      };

      const { Client } = require('@notionhq/client');
      Client.mockImplementation(() => mockClient);

      process.env.NOTION_API_KEY = MOCK_SECRETS.NOTION_API_KEY;
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const statuses = circuitBreakerManager.getAllStatuses();

      expect(Object.keys(statuses).length).toBeGreaterThan(0);

      Object.entries(statuses).forEach(([, status]) => {
        expect(status).toHaveProperty('state');
        expect(status).toHaveProperty('failures');
        expect(typeof status.failures).toBe('number');
      });
    });
  });
});
