import {
  ExportManager,
  NotionExporter,
  TrelloExporter,
  GitHubProjectsExporter,
  type ExportData,
  type ExportResult,
} from '@/lib/export-connectors';
import {
  resilienceManager,
  circuitBreakerManager,
  CircuitBreaker,
} from '@/lib/resilience';

// Track circuit breaker states for testing
const mockCircuitBreakerStates: Record<
  string,
  { state: string; failures: number }
> = {};

// Mock the resilience module
jest.mock('@/lib/resilience', () => {
  const actualModule = jest.requireActual('@/lib/resilience');

  const mockExecute = jest.fn(
    async (
      operation: () => Promise<unknown>,
      _config?: unknown,
      context?: string
    ) => {
      // Track that a circuit breaker was "created" for this service
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

// Export Connectors Integration Tests with Resilience Framework
// Testing integration between export connectors and resilience framework
// Verifies circuit breaker behavior, retry logic, and error handling

describe('Export Connectors Integration with Resilience Framework', () => {
  let exportManager: ExportManager;
  let mockResilienceExecute: jest.Mock;
  let originalWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock circuit breaker states
    Object.keys(mockCircuitBreakerStates).forEach(
      (key) => delete mockCircuitBreakerStates[key]
    );
    // Create export manager with external connectors enabled for testing
    exportManager = new ExportManager({ enableExternalConnectors: true });
    mockResilienceExecute = resilienceManager.execute as jest.Mock;
    mockResilienceExecute.mockImplementation(
      async (operation, _config, context) => {
        // Track that a circuit breaker was "created" for this service
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

  afterEach(() => {
    // Ensure window is restored
    if (originalWindow && !(global as any).window) {
      (global as any).window = originalWindow;
    }
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

      // All connectors should be registered regardless of environment
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
      mockResilienceExecute.mockResolvedValue({
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      expect(mockResilienceExecute).toHaveBeenCalled();
      const callContexts = mockResilienceExecute.mock.calls.map(
        (call) => call[2]
      );
      expect(callContexts.some((ctx) => ctx && ctx.includes('notion'))).toBe(
        true
      );

      const allStatuses = circuitBreakerManager.getAllStatuses();
      expect(typeof allStatuses).toBe('object');
    });

    it('should isolate failures between different exporters', async () => {
      mockResilienceExecute.mockImplementation((_, __, context) => {
        if (context && context.includes('notion')) {
          return Promise.resolve({
            url: 'https://notion.so/test-page',
            id: 'page-123',
          });
        }
        return Promise.reject(new Error('Trello error'));
      });

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';
      process.env.TRELLO_API_KEY = 'test-key';
      process.env.TRELLO_TOKEN = 'test-token';

      const testData1 = createMockExportData();
      const testData2 = createMockExportData();

      const [notionResult, trelloResult] = await Promise.allSettled([
        exportManager.exportToNotion(testData1),
        exportManager.exportToTrello(testData2),
      ]);

      expect(notionResult.status).toBe('fulfilled');
      if (notionResult.status === 'fulfilled') {
        expect(notionResult.value.success).toBe(true);
      }

      expect(trelloResult.status).toBe('fulfilled');
      if (trelloResult.status === 'fulfilled') {
        expect(trelloResult.value.success).toBe(false);
      }

      const allStatuses = circuitBreakerManager.getAllStatuses();
      expect(typeof allStatuses).toBe('object');
    });
  });

  describe('Error Handling Integration', () => {
    it('should convert errors to ExportResult format', async () => {
      mockResilienceExecute.mockRejectedValue(new Error('Notion API error'));

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.url).toBeUndefined();
      expect(result.id).toBeUndefined();
    });

    it('should handle null/undefined errors', async () => {
      mockResilienceExecute.mockRejectedValue(null);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unknown error types', async () => {
      mockResilienceExecute.mockRejectedValue('string error');

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Validation Integration', () => {
    // BUG: Mock not properly intercepting resilience manager calls
    it.skip('should validate configuration with resilience - BUG: mocking issue', async () => {
      process.env.NOTION_API_KEY = 'test-key';

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
    // BUG: Mock not properly intercepting resilience manager calls
    it.skip('should use Notion-specific configuration - BUG: mocking issue', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);
      jest
        .spyOn(NotionExporter.prototype, 'validateConfig')
        .mockResolvedValue(true);

      process.env.NOTION_API_KEY = 'test-key';
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
      mockResilienceExecute.mockResolvedValue({
        id: 'board-123',
        url: 'https://trello.com/b/test-board',
      });

      process.env.TRELLO_API_KEY = 'test-key';
      process.env.TRELLO_TOKEN = 'test-token';

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
      mockResilienceExecute
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            name: 'test-project',
            html_url: 'https://github.com/test/repo',
          }),
        })
        .mockResolvedValue({
          ok: true,
          json: async () => ({ id: 101 }),
        });

      process.env.GITHUB_TOKEN = 'ghp_test';

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
      mockResilienceExecute.mockResolvedValue({
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const statuses = circuitBreakerManager.getAllStatuses();

      expect(typeof statuses).toBe('object');

      Object.entries(statuses).forEach(([service, status]) => {
        expect(status).toHaveProperty('state');
        expect(status).toHaveProperty('failures');
        expect(['closed', 'open', 'half-open']).toContain(status.state);
        expect(typeof status.failures).toBe('number');
      });
    });
  });
});
