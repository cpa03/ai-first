/**
 * Comprehensive Backend Service Tests
 */

// Set environment variables BEFORE any imports that use them
import { mockEnvVars } from './utils/_testHelpers';
Object.assign(process.env, mockEnvVars);

// Mock OpenAI shims first
import 'openai/shims/node';

// Mock external dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('openai', () => {
  return jest.fn();
});

import { AIService, aiService } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { ExportService } from '@/lib/export-connectors';
import { DatabaseService } from '@/lib/db';
import {
  createMockSupabaseClient,
  mockOpenAIResponses,
  mockAPIResponses,
  waitForAsync,
  createMockFetch,
} from './utils/_testHelpers';

// Mock window to be undefined (server-side)
delete (global as any).window;

// Get mocked constructors
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockOpenAIConstructor = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('Backend Service Tests', () => {
  let mockSupabase: any;
  let mockOpenAI: any;
  let dbService: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = createMockSupabaseClient();
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    // Mock createClient function - must return valid mock for DatabaseService
    mockCreateClient.mockReturnValue(mockSupabase);

    // Mock OpenAI constructor
    mockOpenAIConstructor.mockImplementation(() => mockOpenAI);

    // Reset DatabaseService singleton to ensure it picks up mocked clients
    DatabaseService.resetInstance();
    dbService = DatabaseService.getInstance();
    dbService.reinitializeClients();
  });

  describe('AIService', () => {
    it('should create completion successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: { content: 'Test response' },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const aiService = new AIService();
      await aiService.initialize({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });
      const result = await aiService.callModel(
        [{ role: 'user', content: 'test prompt' }],
        {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          maxTokens: 1000,
          temperature: 0.7,
        }
      );

      expect(result).toBe('Test response');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'test prompt' }],
        max_tokens: 1000,
        temperature: 0.7,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API Error')
      );

      const aiService = new AIService();
      await aiService.initialize({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });

      await expect(
        aiService.callModel([{ role: 'user', content: 'test prompt' }], {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          maxTokens: 1000,
          temperature: 0.7,
        })
      ).rejects.toThrow('failed after');
    });

    it('should retry on failure', async () => {
      mockOpenAI.chat.completions.create
        .mockRejectedValueOnce(new Error('ETIMEDOUT: Connection timed out'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Success after retry' } }],
        });

      const aiService = new AIService();
      await aiService.initialize({
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
      });
      const result = await aiService.callModel(
        [{ role: 'user', content: 'test prompt' }],
        {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          maxTokens: 1000,
          temperature: 0.7,
        }
      );

      expect(result).toBe('Success after retry');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('DatabaseService', () => {
    it('should create idea successfully', async () => {
      const mockIdea = {
        id: 'test-id',
        user_id: 'user-123',
        title: 'Test idea',
        raw_text: 'Test idea content',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
      };

      mockSupabase.mockSingle.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const result = await dbService.createIdea({
        user_id: 'user-123',
        title: 'Test idea',
        raw_text: 'Test idea content',
        status: 'draft',
        deleted_at: null,
      });

      expect(result).toEqual(mockIdea);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.mockSingle.mockRejectedValue(new Error('Database error'));

      await expect(
        dbService.createIdea({
          user_id: 'user-123',
          title: 'Test idea',
          raw_text: 'Test idea content',
          status: 'draft',
          deleted_at: null,
        })
      ).rejects.toThrow('Database error');
    });

    it('should get idea by id', async () => {
      const mockIdea = {
        id: 'test-id',
        content: 'Test idea',
      };

      // Setup the mock to support .from().select().eq().is().single() chain
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            is: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockIdea,
                error: null,
              }),
            }),
          }),
        }),
      });
      mockSupabase.from = mockFrom;

      const result = await dbService.getIdea('test-id');

      expect(result).toEqual(mockIdea);
    });

    it('should create clarification session', async () => {
      const mockSession = {
        id: 'session-id',
        idea_id: 'idea-id',
        status: 'active',
      };

      mockSupabase.mockSingle.mockResolvedValue({
        data: mockSession,
        error: null,
      });

      const result = await dbService.createClarificationSession('idea-id');

      expect(result).toEqual(mockSession);
    });

    it('should save answers to session', async () => {
      const mockAnswers = [
        {
          id: 'answer-id',
          session_id: 'session-id',
          question_id: '1',
          answer: 'answer1',
        },
      ];

      // Setup mock chain for insert().select()
      const mockInsertSelect = jest.fn().mockResolvedValue({
        data: mockAnswers,
        error: null,
      });

      // Replace the mockInsert to return our custom select mock
      mockSupabase.from = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: mockInsertSelect,
        }),
        select: mockSupabase.mockSelect,
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const result = await dbService.saveAnswers('session-id', {
        '1': 'answer1',
      });

      expect(result).toBeDefined();
      expect(result).toEqual(mockAnswers);
    });
  });

  describe('ExportService', () => {
    let exportService: any;

    beforeEach(() => {
      exportService = new ExportService();
    });

    it('should export to markdown successfully', async () => {
      const mockData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'Test Description',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [],
        tasks: [],
      };

      const result = await exportService.exportToMarkdown(mockData);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Test Project');
      expect(result.url).toMatch(/data:text\/markdown/);
    });

    it('should have Notion connector available', () => {
      const connector = exportService.getConnector('notion');
      expect(connector).toBeDefined();
      expect(connector?.type).toBe('notion');
    });

    it('should have Trello connector available', () => {
      const connector = exportService.getConnector('trello');
      expect(connector).toBeDefined();
      expect(connector?.type).toBe('trello');
    });

    it('should handle JSON export successfully', async () => {
      const mockData = {
        idea: {
          id: 'test-idea',
          title: 'Test Project',
          raw_text: 'Test Description',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [],
        tasks: [],
      };

      const result = await exportService.exportToJSON(mockData);

      expect(result.success).toBe(true);
    });

    it('should fail Notion export without API key', async () => {
      // Save and clear the API key before creating the service
      const originalKey = process.env.NOTION_API_KEY;
      delete process.env.NOTION_API_KEY;

      // Create a new service instance after clearing the env var
      const exportService = new ExportService();

      try {
        const result = await exportService.exportToNotion({
          idea: {
            id: 'test-idea',
            title: 'Test',
            raw_text: 'Test',
            status: 'draft' as const,
            created_at: new Date().toISOString(),
            deleted_at: null,
          },
          deliverables: [],
          tasks: [],
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('is not properly configured');
      } finally {
        // Restore environment variable after test
        if (originalKey) {
          process.env.NOTION_API_KEY = originalKey;
        }
      }
    });

    it('should handle Trello export with credentials', async () => {
      const mockData = {
        idea: {
          id: 'test-idea',
          title: 'Test',
          raw_text: 'Test',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
          deleted_at: null,
        },
        deliverables: [],
        tasks: [],
      };

      global.fetch = createMockFetch({ id: 'trello-board-id' });

      const result = await exportService.exportToTrello(mockData);

      expect(result.success).toBe(true);
      expect(result.id).toBe('trello-board-id');
    });

    it('should fail Trello export without credentials', async () => {
      delete process.env.TRELLO_API_KEY;

      const exportService = new ExportService();
      const result = await exportService.exportToTrello({
        idea: {
          id: 'test-idea',
          title: 'Test',
          raw_text: 'Test',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
          deleted_at: null,
        },
        deliverables: [],
        tasks: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('is not properly configured');
    });
  });
});
