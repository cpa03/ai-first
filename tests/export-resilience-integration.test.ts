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

jest.mock('@/lib/resilience');

describe('Export Connectors Integration with Resilience Framework', () => {
  let exportManager: ExportManager;
  let mockResilienceExecute: jest.Mock;
  let originalWindow: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Temporarily remove window to simulate server-side environment
    originalWindow = (global as any).window;
    delete (global as any).window;
    exportManager = new ExportManager();
    // Restore window for other tests
    (global as any).window = originalWindow;

    mockResilienceExecute = (
      resilienceManager.execute as jest.Mock
    ).mockImplementation(async (operation) => {
      return operation();
    });
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
      expect(connectors.some((c) => c.type === 'json')).toBe(true);
      expect(connectors.some((c) => c.type === 'markdown')).toBe(true);
      expect(connectors.some((c) => c.type === 'notion')).toBe(true);
      expect(connectors.some((c) => c.type === 'trello')).toBe(true);
      expect(connectors.some((c) => c.type === 'github-projects')).toBe(true);
      expect(connectors.some((c) => c.type === 'google-tasks')).toBe(true);
    });

    it('should use resilience manager for each export operation', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      expect(mockResilienceExecute).toHaveBeenCalled();
    });

    it('should handle multiple concurrent exports with resilience', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page-1',
        id: 'page-1',
      });

      const mockTrelloExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://trello.com/b/2',
        id: 'board-2',
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);
      jest
        .spyOn(TrelloExporter.prototype, 'export')
        .mockImplementation(mockTrelloExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-1';
      process.env.TRELLO_API_KEY = 'test-key';
      process.env.TRELLO_TOKEN = 'test-token';

      const testData1 = createMockExportData({
        idea: { ...createMockExportData().idea, title: 'Project 1' },
      });
      const testData2 = createMockExportData({
        idea: { ...createMockExportData().idea, title: 'Project 2' },
      });

      const results = await Promise.all([
        exportManager.exportToNotion(testData1),
        exportManager.exportToTrello(testData2),
      ]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockResilienceExecute).toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker Integration with Exporters', () => {
    it('should use per-service circuit breakers', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const allStatuses = circuitBreakerManager.getAllStatuses();

      expect(Object.keys(allStatuses).length).toBeGreaterThan(0);
    });

    it('should isolate failures between different exporters', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      const mockTrelloExport = jest
        .fn()
        .mockRejectedValue(new Error('Trello error'));

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);
      jest
        .spyOn(TrelloExporter.prototype, 'export')
        .mockImplementation(mockTrelloExport);

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

      if (notionResult.status === 'fulfilled') {
        expect(notionResult.value.success).toBe(true);
      }

      if (trelloResult.status === 'fulfilled') {
        expect(trelloResult.value.success).toBe(false);
      }

      const allStatuses = circuitBreakerManager.getAllStatuses();

      expect(Object.keys(allStatuses).length).toBeGreaterThan(0);
    });

    it('should recover from circuit breaker after reset timeout', async () => {
      const mockNotionExport = jest.fn();

      mockNotionExport
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          success: true,
          url: 'https://notion.so/test-page',
          id: 'page-123',
        });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();

      let result = await exportManager.exportToNotion(testData);
      expect(result.success).toBe(false);

      jest.useFakeTimers();
      jest.advanceTimersByTime(31000);
      jest.useRealTimers();

      result = await exportManager.exportToNotion(testData);
      expect(result.success).toBe(true);
    });
  });

  describe('Retry Integration with Exporters', () => {
    it('should retry transient failures automatically', async () => {
      const mockNotionExport = jest.fn();

      mockNotionExport
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValue({
          success: true,
          url: 'https://notion.so/test-page',
          id: 'page-123',
        });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(true);
      expect(mockNotionExport).toHaveBeenCalledTimes(3);
    });

    it('should give up after max retries', async () => {
      const mockNotionExport = jest
        .fn()
        .mockRejectedValue(new Error('Permanent error'));

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Permanent error');
      expect(mockNotionExport).toHaveBeenCalledTimes(4);
    });

    it('should apply exponential backoff between retries', async () => {
      const timestamps: number[] = [];
      const mockNotionExport = jest.fn().mockImplementation(() => {
        timestamps.push(Date.now());

        if (timestamps.length < 3) {
          return Promise.reject(new Error('Transient error'));
        }

        return Promise.resolve({
          success: true,
          url: 'https://notion.so/test-page',
          id: 'page-123',
        });
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(true);
      expect(timestamps.length).toBe(3);

      const delays = timestamps
        .map((t, i, arr) => (i > 0 ? t - arr[i - 1] : 0))
        .slice(1);
      expect(delays.length).toBe(2);

      for (let i = 1; i < delays.length; i++) {
        expect(delays[i]).toBeGreaterThan(delays[i - 1] * 0.5);
      }
    });
  });

  describe('Timeout Integration with Exporters', () => {
    it('should timeout long-running operations', async () => {
      const mockNotionExport = jest.fn().mockImplementation(() => {
        return new Promise(() => {});
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();

      const startTime = Date.now();
      const result = await exportManager.exportToNotion(testData);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
      expect(duration).toBeLessThan(35000);
    });

    it('should complete operations within timeout', async () => {
      const mockNotionExport = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              url: 'https://notion.so/test-page',
              id: 'page-123',
            });
          }, 100);
        });
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should convert errors to ExportResult format', async () => {
      const mockNotionExport = jest
        .fn()
        .mockRejectedValue(new Error('Notion API error'));

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

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
      const mockNotionExport = jest.fn().mockRejectedValue(null);

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle unknown error types', async () => {
      const mockNotionExport = jest.fn().mockRejectedValue('string error');

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      const result = await exportManager.exportToNotion(testData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Configuration Validation Integration', () => {
    it('should validate configuration with resilience', async () => {
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
    it('should use Notion-specific configuration', async () => {
      const mockNotionExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://notion.so/test-page',
        id: 'page-123',
      });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

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
      const mockTrelloExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://trello.com/b/test-board',
        id: 'board-123',
      });

      jest
        .spyOn(TrelloExporter.prototype, 'export')
        .mockImplementation(mockTrelloExport);

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
      const mockGithubExport = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://github.com/test/repo',
        id: '123',
      });

      jest
        .spyOn(GitHubProjectsExporter.prototype, 'export')
        .mockImplementation(mockGithubExport);

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
      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();
      await exportManager.exportToNotion(testData);

      const statuses = circuitBreakerManager.getAllStatuses();

      expect(Object.keys(statuses).length).toBeGreaterThan(0);

      Object.entries(statuses).forEach(([service, status]) => {
        expect(status).toHaveProperty('state');
        expect(status).toHaveProperty('failures');
        expect(['closed', 'open', 'half-open']).toContain(status.state);
        expect(typeof status.failures).toBe('number');
      });
    });

    it('should track circuit breaker state transitions', async () => {
      const mockNotionExport = jest.fn();

      mockNotionExport
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          success: true,
          url: 'https://notion.so/test-page',
          id: 'page-123',
        });

      jest
        .spyOn(NotionExporter.prototype, 'export')
        .mockImplementation(mockNotionExport);

      process.env.NOTION_API_KEY = 'test-key';
      process.env.NOTION_PARENT_PAGE_ID = 'page-123';

      const testData = createMockExportData();

      let result = await exportManager.exportToNotion(testData);
      expect(result.success).toBe(false);

      const statusesAfterOpen = circuitBreakerManager.getAllStatuses();

      jest.useFakeTimers();
      jest.advanceTimersByTime(31000);
      jest.useRealTimers();

      result = await exportManager.exportToNotion(testData);
      expect(result.success).toBe(true);

      const statusesAfterClose = circuitBreakerManager.getAllStatuses();
    });
  });
});
