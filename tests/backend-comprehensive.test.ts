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
import { ExportService } from '@/lib/exports';
import { ClarifierAgent } from '@/lib/agents/clarifier';
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

    // Mock createClient function
    mockCreateClient.mockReturnValue(mockSupabase);

    // Mock OpenAI constructor
    mockOpenAIConstructor.mockImplementation(() => mockOpenAI);
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

      mockSupabase.mockInsert.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const dbService = DatabaseService.getInstance();
      const result = await dbService.createIdea({
        user_id: 'user-123',
        title: 'Test idea',
        raw_text: 'Test idea content',
        status: 'draft',
      });

      expect(result).toEqual(mockIdea);
      expect(mockSupabase.from).toHaveBeenCalledWith('ideas');
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };
      mockSupabase.mockInsert.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const dbService = DatabaseService.getInstance();

      await expect(
        dbService.createIdea({
          user_id: 'user-123',
          title: 'Test idea',
          raw_text: 'Test idea content',
          status: 'draft',
        })
      ).rejects.toThrow('Database error');
    });

    it('should get idea by id', async () => {
      const mockIdea = {
        id: 'test-id',
        content: 'Test idea',
      };

      mockSupabase.mockSingle.mockResolvedValue({
        data: mockIdea,
        error: null,
      });

      const dbService = DatabaseService.getInstance();
      const result = await dbService.getIdea('test-id');

      expect(result).toEqual(mockIdea);
    });

    it('should create clarification session', async () => {
      const mockSession = {
        id: 'session-id',
        idea_id: 'idea-id',
        status: 'active',
      };

      mockSupabase.mockInsert.mockResolvedValue({
        data: [mockSession],
        error: null,
      });

      const dbService = DatabaseService.getInstance();
      const result = await dbService.createClarificationSession('idea-id');

      expect(result).toEqual(mockSession);
    });

    it('should save answers to session', async () => {
      const mockAnswers = {
        data: { id: 'answer-id', session_id: 'session-id' },
        error: null,
      };

      mockSupabase.mockInsert.mockResolvedValue(mockAnswers);

      const dbService = DatabaseService.getInstance();
      const result = await dbService.saveAnswers('session-id', {
        '1': 'answer1',
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('clarification_answers');
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
      expect(result.content).toContain('# Test Project');
      expect(result.url).toMatch(/\.md$/);
    });

    it('should handle Notion export with API key', async () => {
      const mockData = {
        idea: {
          id: 'test-idea',
          title: 'Test',
          raw_text: 'Test Description',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [],
        tasks: [],
      };

      // Mock Notion API
      global.fetch = createMockFetch({ id: 'notion-page-id' });

      const result = await exportService.exportToNotion(mockData);

      expect(result.success).toBe(true);
      expect(result.notionPageId).toBe('notion-page-id');
    });

    it('should fail Notion export without API key', async () => {
      // Save original environment variable
      const originalKey = process.env.NOTION_API_KEY;
      delete process.env.NOTION_API_KEY;

      const exportService = new ExportService();

      // Restore environment variable after service is created
      if (originalKey) {
        process.env.NOTION_API_KEY = originalKey;
      }

      const result = await exportService.exportToNotion({
        idea: {
          id: 'test-idea',
          title: 'Test',
          raw_text: 'Test',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [],
        tasks: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key is required');
    });

    it('should handle Trello export with credentials', async () => {
      const mockData = {
        idea: {
          id: 'test-idea',
          title: 'Test',
          raw_text: 'Test',
          status: 'draft' as const,
          created_at: new Date().toISOString(),
        },
        deliverables: [],
        tasks: [],
      };

      global.fetch = createMockFetch({ id: 'trello-board-id' });

      const result = await exportService.exportToTrello(mockData);

      expect(result.success).toBe(true);
      expect(result.boardId).toBe('trello-board-id');
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
        },
        deliverables: [],
        tasks: [],
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('API key and token are required');
    });
  });

  describe('ClarifierAgent', () => {
    let clarifierAgent: InstanceType<typeof ClarifierAgent>;

    beforeEach(async () => {
      // Create mock AI service FIRST (before ClarifierAgent)
      const mockAiService = {
        callModel: jest.fn(),
        initialize: jest.fn().mockResolvedValue(undefined),
      } as any;

      // Create ClarifierAgent instance
      clarifierAgent = new ClarifierAgent();

      // Set mock AI service BEFORE initialize
      clarifierAgent.aiService = mockAiService;

      // Initialize to set up modules (they now use the mock)
      await clarifierAgent.initialize();

      // Reset mock calls before each test
      mockAiService.callModel.mockClear();
    });

    it('should generate clarification questions', async () => {
      const mockResponse = JSON.stringify(
        mockOpenAIResponses.clarificationQuestions
      );
      (clarifierAgent.aiService.callModel as jest.Mock).mockResolvedValue(
        mockResponse
      );

      console.log('Mock set to return:', mockResponse);

      const result = await clarifierAgent.generateQuestions('Test idea');

      console.log('Expected:', mockOpenAIResponses.clarificationQuestions);
      console.log('Received:', result);

      expect(result).toEqual(mockOpenAIResponses.clarificationQuestions);
      expect(clarifierAgent.aiService.callModel).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('Test idea'),
          }),
        ]),
        expect.any(Object)
      );
    });

    it('should generate refined idea from answers', async () => {
      const answers = { '1': 'Answer 1', '2': 'Answer 2' };
      const session = {
        ideaId: 'test-idea',
        originalIdea: 'Test idea',
        questions: mockOpenAIResponses.clarificationQuestions as any,
        answers,
        confidence: 0.5,
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (clarifierAgent.aiService.callModel as jest.Mock).mockResolvedValue(
        mockOpenAIResponses.refinedIdea
      );

      const result = await clarifierAgent.generateRefinedIdea(session);

      expect(result).toBe(mockOpenAIResponses.refinedIdea);
    });

    it('should handle AI service failures gracefully', async () => {
      (clarifierAgent.aiService.callModel as jest.Mock).mockRejectedValue(
        new Error('AI Error')
      );

      const result = await clarifierAgent.generateQuestions('Test idea');

      expect(result).toHaveLength(3); // Should return fallback questions
    });

    it('should validate question format', () => {
      (clarifierAgent.aiService.callModel as jest.Mock).mockRejectedValue(
        new Error('Invalid JSON response from AI')
      );

      const result = clarifierAgent.generateQuestions('Test idea');

      // Should fallback to default questions on AI error
      expect(result).resolves.toHaveLength(3);
    });
  });
});
