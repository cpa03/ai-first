/**
 * Comprehensive Backend Service Tests
 */

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
  mockEnvVars,
  createMockSupabaseClient,
  mockOpenAIResponses,
  mockAPIResponses,
  waitForAsync,
  createMockFetch,
} from './utils/_testHelpers';

// Mock environment variables
Object.assign(process.env, mockEnvVars);

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

    // Reset DatabaseService singleton
    (DatabaseService as any).instance = undefined;

    mockSupabase = createMockSupabaseClient();
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    // Mock createClient function
    mockCreateClient.mockReturnValue(mockSupabase);

    // Mock OpenAI constructor
    mockOpenAIConstructor.mockImplementation(() => mockOpenAI);

    // Create a new DatabaseService instance for each test
    dbService = new (DatabaseService as any)();
    // Manually set the client for testing
    (dbService as any).client = mockSupabase;
    (dbService as any).admin = mockSupabase;
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
        .mockRejectedValueOnce(new Error('Temporary failure'))
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

      // Setup the mock to return the mock idea when insert().select().single() is called
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockIdea,
              error: null,
            }),
          }),
        }),
      });
      mockSupabase.from = mockFrom;

      const result = await dbService.createIdea({
        user_id: 'user-123',
        title: 'Test idea',
        raw_text: 'Test idea content',
        status: 'draft',
        deleted_at: null,
      });

      expect(result).toEqual(mockIdea);
      expect(mockFrom).toHaveBeenCalledWith('ideas');
    });

    it('should handle database errors', async () => {
      const mockError = new Error('Database error');

      // Setup the mock to return an error when insert().select().single() is called
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });
      mockSupabase.from = mockFrom;

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

      // Setup the mock to return the mock session when insert().select().single() is called
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockSession,
              error: null,
            }),
          }),
        }),
      });
      mockSupabase.from = mockFrom;

      const result = await dbService.createClarificationSession('idea-id');

      expect(result).toEqual(mockSession);
    });

    it('should save answers to session', async () => {
      const mockAnswers = {
        data: { id: 'answer-id', session_id: 'session-id' },
        error: null,
      };

      // Setup the mock to return the mock answers when insert().select() is called
      const mockFrom = jest.fn().mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockAnswers),
        }),
      });
      mockSupabase.from = mockFrom;

      const result = await dbService.saveAnswers('session-id', {
        '1': 'answer1',
      });

      expect(mockFrom).toHaveBeenCalledWith('clarification_answers');
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
      // Markdown content is embedded in the URL as a data URI
      expect(result.url).toContain('data:text/markdown');
      expect(result.url).toContain(encodeURIComponent('Test Project'));
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
      expect(result.url).toContain('data:application/json');
    });
  });
});
