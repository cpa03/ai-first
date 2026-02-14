import { aiService, AIService } from '../src/lib/ai';
import { dbService } from '../src/lib/db';
import { exportManager, type ExportData } from '../src/lib/export-connectors';

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

describe('Backend Services', () => {
  describe('AI Service', () => {
    it('should perform health check', async () => {
      const health = await aiService.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('providers');
      expect(Array.isArray(health.providers)).toBe(true);
    });

    it('should track costs', () => {
      const costTracking = aiService.getCostTracking();
      expect(Array.isArray(costTracking)).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      // Save current env var
      const originalKey = process.env.OPENAI_API_KEY;

      // Remove API key to test error handling
      delete process.env.OPENAI_API_KEY;

      const testService = new AIService();
      const config = {
        provider: 'openai' as const,
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      };

      // Should handle missing API key gracefully
      await expect(testService.initialize(config)).rejects.toThrow(
        'OpenAI API key not configured'
      );

      // Restore env var
      process.env.OPENAI_API_KEY = originalKey;
    });
  });

  describe('Database Service', () => {
    it('should perform health check', async () => {
      const health = await dbService.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('timestamp');
    });

    it('should validate idea data structure', () => {
      const ideaData = {
        user_id: 'test-user',
        title: 'Test Idea',
        raw_text: 'This is a test idea',
        status: 'draft' as const,
      };

      expect(ideaData).toHaveProperty('user_id');
      expect(ideaData).toHaveProperty('title');
      expect(ideaData).toHaveProperty('raw_text');
      expect(ideaData).toHaveProperty('status');
    });
  });

  describe('Export Manager', () => {
    it('should export to markdown', async () => {
      const testData = createMockExportData({
        deliverables: [
          createMockDeliverable({
            id: 'test-deliverable',
            idea_id: 'test-idea',
            title: 'Test Deliverable',
            description: 'Test description',
            priority: 1,
            estimate_hours: 8,
          }),
        ],
        tasks: [
          createMockTask({
            id: 'test-task',
            deliverable_id: 'test-deliverable',
            title: 'Test Task',
            description: 'Test task description',
            assignee: 'Test User',
            status: 'todo' as const,
            estimate: 2,
          }),
        ],
      });

      const result = await exportManager.export({
        type: 'markdown',
        data: testData,
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.url?.startsWith('data:text/markdown')).toBe(true);
    });
  });
});
