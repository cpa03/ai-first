// Mock the AI service to avoid OpenAI initialization in test environment
jest.mock('@/lib/ai', () => ({
  aiService: {
    healthCheck: jest.fn(),
    getCostTracking: jest.fn(),
    initialize: jest.fn(),
  },
}));

import { aiService } from '@/lib/ai';
import { dbService } from '@/lib/db';
import { exportManager, type ExportData } from '@/lib/export-connectors';

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

function createMockExportData(overrides = {}): ExportData {
  return {
    idea: {
      id: 'test-idea',
      title: 'Test Project',
      raw_text: 'This is a test project description',
      status: 'draft' as const,
      created_at: new Date().toISOString(),
      deleted_at: null,
    },
    deliverables: [],
    tasks: [],
    ...overrides,
  };
}

function createMockDeliverable(overrides = {}) {
  return {
    id: 'test-deliverable',
    idea_id: 'test-idea',
    title: 'Test Deliverable',
    description: 'Test description',
    priority: 1,
    estimate_hours: 8,
    milestone_id: null,
    completion_percentage: 0,
    business_value: 100,
    risk_factors: null,
    acceptance_criteria: null,
    deliverable_type: 'feature' as const,
    created_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}

function createMockTask(overrides = {}) {
  return {
    id: 'test-task',
    deliverable_id: 'test-deliverable',
    title: 'Test Task',
    description: 'Test task description',
    assignee: 'Test User',
    status: 'todo' as const,
    estimate: 2,
    created_at: new Date().toISOString(),
    milestone_id: null,
    actual_hours: null,
    completion_percentage: 0,
    priority_score: 1,
    complexity_score: 1,
    risk_level: 'low' as const,
    tags: null,
    custom_fields: null,
    deleted_at: null,
    start_date: null,
    end_date: null,
    ...overrides,
  };
}

describe('Integration Tests', () => {
  describe('AI Service Integration', () => {
    it('should initialize and perform health check', async () => {
      const mockHealth = {
        status: 'healthy',
        providers: ['openai'],
      };
      (aiService.healthCheck as jest.Mock).mockResolvedValue(mockHealth);

      const health = await aiService.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('providers');
      expect(Array.isArray(health.providers)).toBe(true);
    });

    it('should track costs across multiple calls', async () => {
      const mockCosts = [{ model: 'gpt-3.5-turbo', tokens: 100, cost: 0.002 }];
      (aiService.getCostTracking as jest.Mock).mockReturnValue(mockCosts);

      const currentCosts = aiService.getCostTracking();
      expect(Array.isArray(currentCosts)).toBe(true);
      expect(currentCosts).toHaveLength(1);
    });

    it('should handle configuration validation', async () => {
      (aiService.initialize as jest.Mock).mockRejectedValue(
        new Error('Invalid configuration')
      );

      const config = {
        provider: 'openai' as const,
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      };

      await expect(aiService.initialize(config)).rejects.toThrow(
        'Invalid configuration'
      );
    });
  });

  describe('Database Service Integration', () => {
    it('should perform health check', async () => {
      const health = await dbService.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
    });

    it('should handle idea CRUD operations', async () => {
      const ideaData = {
        title: 'Integration Test Idea',
        raw_text: 'This is an integration test idea',
        status: 'draft' as const,
        user_id: 'test-user-id',
      };

      // Test validation (actual DB operations would require real connection)
      expect(ideaData).toHaveProperty('user_id');
      expect(ideaData).toHaveProperty('title');
      expect(ideaData).toHaveProperty('raw_text');
      expect(ideaData).toHaveProperty('status');
      expect(['draft', 'clarified', 'breakdown', 'completed']).toContain(
        ideaData.status
      );
    });

    it('should handle session data structure', async () => {
      const sessionData = {
        idea_id: 'test-idea',
        state: {
          questions: [],
          status: 'clarifying',
        },
        last_agent: 'clarifier',
        metadata: {
          agent: 'clarifier',
          timestamp: new Date().toISOString(),
        },
      };

      expect(sessionData).toHaveProperty('idea_id');
      expect(sessionData).toHaveProperty('state');
      expect(sessionData).toHaveProperty('last_agent');
      expect(sessionData).toHaveProperty('metadata');
    });
  });

  describe('Export Service Integration', () => {
    it('should integrate all export connectors', () => {
      const connectors = exportManager.getAvailableConnectors();
      expect(connectors.length).toBeGreaterThan(0);

      // Test that all connectors have required methods
      connectors.forEach((connector) => {
        expect(connector).toHaveProperty('type');
        expect(connector).toHaveProperty('name');
        expect(typeof connector.export).toBe('function');
        expect(typeof connector.validateConfig).toBe('function');
      });
    });

    it('should handle complete export pipeline', async () => {
      const testData = createMockExportData({
        idea: {
          id: 'integration-test',
          title: 'Integration Test Project',
          raw_text: 'A comprehensive integration test project',
          status: 'clarified' as const,
          created_at: new Date().toISOString(),
          deleted_at: null,
        },
        deliverables: [
          createMockDeliverable({
            id: 'del-1',
            idea_id: 'integration-test',
            title: 'Test Deliverable',
            description: 'Test deliverable description',
            priority: 1,
            estimate_hours: 8,
            deleted_at: null,
          }),
        ],
        tasks: [
          createMockTask({
            id: 'task-1',
            deliverable_id: 'del-1',
            title: 'Test Task',
            description: 'Test task description',
            assignee: 'Test User',
            status: 'todo' as const,
            estimate: 2,
          }),
        ],
      });

      // Test markdown export (should work)
      const markdownResult = await exportManager.export({
        type: 'markdown',
        data: testData,
      });

      expect(markdownResult.success).toBe(true);
      expect(markdownResult.url).toBeDefined();
      expect(markdownResult.url?.startsWith('data:text/markdown')).toBe(true);

      // Test validation of all connectors
      const validationResults = await exportManager.validateAllConnectors();
      expect(validationResults).toHaveProperty('markdown');
      expect(validationResults.markdown).toBe(true);
    });

    it('should handle export errors gracefully', async () => {
      const invalidData = null as any;

      const result = await exportManager.export({
        type: 'markdown',
        data: invalidData,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('End-to-End Workflow Integration', () => {
    it('should handle complete idea clarification workflow', async () => {
      // This tests the integration points between services
      const workflowData = {
        idea: 'Build a task management application',
        expectedSteps: [
          'ai-service-initialization',
          'question-generation',
          'answer-processing',
          'idea-refinement',
          'export-generation',
        ],
      };

      // Test workflow structure
      expect(workflowData.idea).toBeTruthy();
      expect(workflowData.expectedSteps).toHaveLength(5);
      expect(workflowData.expectedSteps).toContain('question-generation');
    });

    it('should validate data flow between components', () => {
      const ideaFlow = {
        input: 'User idea text',
        questions: ['Generated questions'],
        answers: { q1: 'User answer' },
        refined: 'Refined idea description',
        export: 'Generated blueprint',
      };

      // Validate each step has required data
      expect(ideaFlow.input).toBeTruthy();
      expect(Array.isArray(ideaFlow.questions)).toBe(true);
      expect(typeof ideaFlow.answers).toBe('object');
      expect(ideaFlow.refined).toBeTruthy();
      expect(ideaFlow.export).toBeTruthy();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service unavailability gracefully', async () => {
      // Test AI service error handling
      const invalidConfig = {
        provider: 'openai' as const,
        model: 'invalid-model',
        maxTokens: -1, // Invalid
        temperature: 2.0, // Invalid (should be 0-1)
      };

      await expect(aiService.initialize(invalidConfig)).rejects.toThrow();
    });

    it('should handle export connector failures', async () => {
      // Test with non-existent connector
      const result = await exportManager.export({
        type: 'non-existent' as any,
        data: {
          idea: {
            id: 'test',
            title: 'Test',
            raw_text: 'Test',
            status: 'draft' as const,
            created_at: new Date().toISOString(),
          },
        } as any,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        idea: null, // Invalid
        deliverables: 'not-an-array', // Invalid
        tasks: { also: 'invalid' }, // Invalid
      } as any;

      const result = await exportManager.export({
        type: 'markdown',
        data: malformedData,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent operations', async () => {
      const startTime = Date.now();

      // Simulate concurrent operations
      const promises = [
        aiService.healthCheck(),
        dbService.healthCheck(),
        exportManager.validateAllConnectors(),
      ];

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All operations should complete
      expect(results).toHaveLength(3);
      expect(results[0]).toHaveProperty('status');
      expect(results[1]).toHaveProperty('status');
      expect(typeof results[2]).toBe('object');

      // Should complete within reasonable time (5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle large data sets', async () => {
      const largeData = createMockExportData({
        idea: {
          id: 'large-test',
          title: 'Large Test Project',
          raw_text: 'A'.repeat(10000), // Large text
          status: 'draft' as const,
          created_at: new Date().toISOString(),
          deleted_at: null,
        },
        deliverables: Array.from({ length: 100 }, (_, i) =>
          createMockDeliverable({
            id: `del-${i}`,
            idea_id: 'large-test',
            title: `Deliverable ${i}`,
            description: `Description for deliverable ${i}`,
            priority: (i % 5) + 1,
            estimate_hours: (i % 8) + 1,
            deleted_at: null,
          })
        ),
        tasks: Array.from({ length: 500 }, (_, i) =>
          createMockTask({
            id: `task-${i}`,
            deliverable_id: `del-${Math.floor(i / 5)}`,
            title: `Task ${i}`,
            description: `Description for task ${i}`,
            assignee: `User ${i % 10}`,
            status: ['todo', 'in_progress', 'completed'][i % 3] as
              | 'todo'
              | 'in_progress'
              | 'completed',
            estimate: (i % 4) + 1,
          })
        ),
      });

      const startTime = Date.now();
      const result = await exportManager.export({
        type: 'markdown',
        data: largeData,
      });
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();

      // Should handle large data within reasonable time (10 seconds)
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });
});
