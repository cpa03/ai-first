// Mock environment variables for testing - MUST be set before imports
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

import { aiService, AIService } from '../src/lib/ai';
import { dbService } from '../src/lib/db';
import { exportManager } from '../src/lib/exports';

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
    it('should have available connectors', () => {
      const connectors = exportManager.getAvailableConnectors();
      expect(connectors.length).toBeGreaterThan(0);

      // Should include markdown exporter
      const markdownExporter = connectors.find((c) => c.type === 'markdown');
      expect(markdownExporter).toBeDefined();
    });

    it('should validate markdown export', async () => {
      const connector = exportManager.getConnector('markdown');
      expect(connector).toBeDefined();

      if (connector) {
        const isValid = await connector.validateConfig();
        expect(isValid).toBe(true);
      }
    });

    it('should export to markdown format', async () => {
      const testData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'This is a test project description',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [
          {
            id: 'test-deliverable',
            idea_id: 'test-idea',
            title: 'Test Deliverable',
            description: 'Test description',
            priority: 1,
            estimate_hours: 8,
            created_at: new Date().toISOString(),
          },
        ],
        tasks: [
          {
            id: 'test-task',
            deliverable_id: 'test-deliverable',
            title: 'Test Task',
            description: 'Test task description',
            assignee: 'Test User',
            status: 'todo' as const,
            estimate: 2,
            created_at: new Date().toISOString(),
          },
        ],
      };

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
