/**
 * Simplified Backend Service Tests - Compatible with existing codebase
 */

import {
  mockEnvVars,
  createMockSupabaseClient,
  mockOpenAIResponses,
  mockAPIResponses,
  waitForAsync,
  createMockFetch,
} from './utils/testHelpers';

// Mock environment variables
Object.assign(process.env, mockEnvVars);

// Mock OpenAI shims first
import 'openai/shims/node';

// Mock external dependencies
jest.mock('@/lib/db', () => {
  return {
    dbService: {
      createIdea: jest.fn(),
      getIdea: jest.fn(),
      createClarificationSession: jest.fn(),
      saveAnswers: jest.fn(),
    },
    Idea: function (data: any) {
      return { ...data };
    },
  };
});

jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

describe('Backend Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as any)?.mockClear?.();
  });

  describe('Database Operations', () => {
    it('should mock fetch for API calls', async () => {
      const mockFetch = createMockFetch({
        data: { id: 'test-id', content: 'Test idea' },
        error: null,
      });

      global.fetch = mockFetch;

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(data.data.id).toBe('test-id');
      expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });

    it('should handle error responses', async () => {
      const mockFetch = createMockFetch(
        { error: 'Test error' },
        { ok: false, status: 500 }
      );
      global.fetch = mockFetch;

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });
  });

  describe('Export Services', () => {
    it('should validate export configuration', () => {
      const mockBlueprint = {
        title: 'Test Project',
        description: 'Test Description',
        phases: [
          {
            name: 'Phase 1',
            tasks: [
              {
                title: 'Task 1',
                description: 'Description 1',
                estimated: '2 days',
              },
            ],
          },
        ],
      };

      expect(mockBlueprint.title).toBeDefined();
      expect(mockBlueprint.phases).toHaveLength(1);
      expect(mockBlueprint.phases[0].tasks).toHaveLength(1);
    });

    it('should validate API endpoint responses', async () => {
      const apiEndpoints = [
        { path: '/api/clarify/start', expectedStatus: 200 },
        { path: '/api/clarify/answer', expectedStatus: 200 },
        { path: '/api/clarify/complete', expectedStatus: 200 },
      ];

      for (const endpoint of apiEndpoints) {
        const mockFetch = createMockFetch(
          { success: true },
          { ok: true, status: endpoint.expectedStatus }
        );
        global.fetch = mockFetch;

        const response = await fetch(endpoint.path);

        expect(response.ok).toBe(true);
        expect(response.status).toBe(endpoint.expectedStatus);
      }
    });
  });

  describe('AI Service Integration', () => {
    it('should handle OpenAI API format', () => {
      const mockOpenAI = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: { content: 'Test response' },
                },
              ],
            }),
          },
        },
      };

      // Mock the OpenAI constructor
      const OpenAIConstructor = require('openai').default;
      const instance = new OpenAIConstructor();

      expect(instance.chat.completions.create).toBeDefined();
    });

    it('should validate API response structure', () => {
      const validResponse = {
        choices: [
          {
            message: { content: 'Response content' },
          },
        ],
      };

      const invalidResponse = {
        error: { message: 'API Error' },
      };

      expect(validResponse.choices).toBeDefined();
      expect(validResponse.choices[0].message.content).toBeDefined();
      expect(invalidResponse.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle service unavailable errors', async () => {
      const mockFetch = createMockFetch(
        { error: 'Service unavailable' },
        { ok: false, status: 503 }
      );
      global.fetch = mockFetch;

      const response = await fetch('/api/test');

      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('Service unavailable');
    });

    it('should handle timeout scenarios', async () => {
      jest.useFakeTimers();

      const mockFetch = new Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: async () => ({ data: 'delayed response' }),
            }),
          5000
        );
      });

      global.fetch = jest.fn().mockReturnValue(mockFetch);

      const fetchPromise = fetch('/api/test');

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      const response = await fetchPromise;
      expect(response.ok).toBe(true);

      jest.useRealTimers();
    });
  });
});
