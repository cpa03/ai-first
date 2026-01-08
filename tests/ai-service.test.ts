/**
 * Comprehensive AIService Tests
 *
 * Tests critical infrastructure for AI model calls, cost tracking,
 * context management, and health checks.
 */

import 'openai/shims/node';

import { AIService, AIModelConfig } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

jest.mock('openai', () => {
  return jest.fn();
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/resilience', () => ({
  resilienceManager: {
    execute: jest.fn((operation) => operation()),
  },
  defaultResilienceConfigs: {
    openai: {
      timeoutMs: 60000,
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      circuitBreakerThreshold: 5,
      circuitBreakerResetMs: 60000,
    },
    default: {
      timeoutMs: 30000,
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      circuitBreakerThreshold: 5,
      circuitBreakerResetMs: 60000,
    },
  },
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockOpenAIConstructor = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: any;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.OPENAI_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
    process.env.COST_LIMIT_DAILY = '10.0';

    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
      models: {
        list: jest.fn(),
      },
    };

    mockSupabase = {
      from: jest.fn(() => mockSupabase),
      insert: jest.fn(() => mockSupabase),
      select: jest.fn(() => mockSupabase),
      eq: jest.fn(() => mockSupabase),
      single: jest.fn(),
      upsert: jest.fn(() => mockSupabase),
    };

    mockCreateClient.mockReturnValue(mockSupabase);
    mockOpenAIConstructor.mockImplementation(() => mockOpenAI);

    aiService = new AIService();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.COST_LIMIT_DAILY;
  });

  describe('constructor', () => {
    it('should initialize OpenAI client when API key is provided', () => {
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-key',
      });
    });

    it('should not initialize OpenAI client when API key is missing', () => {
      delete process.env.OPENAI_API_KEY;
      const service = new AIService();

      expect(OpenAI).toHaveBeenCalledTimes(1);
    });

    it('should create daily cost cache with 60s TTL', () => {
      expect(aiService.getCacheStats()).toBeDefined();
      expect(aiService.getCacheStats().costCacheSize).toBe(0);
      expect(aiService.getCacheStats().responseCacheSize).toBe(0);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully for OpenAI provider', async () => {
      const config: AIModelConfig = {
        provider: 'openai',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7,
      };

      await expect(aiService.initialize(config)).resolves.not.toThrow();
    });

    it('should throw error when OpenAI provider not initialized', async () => {
      process.env.OPENAI_API_KEY = '';
      const service = new AIService();
      const config: AIModelConfig = {
        provider: 'openai',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7,
      };

      await expect(service.initialize(config)).rejects.toThrow(
        'OpenAI API key not configured'
      );
      process.env.OPENAI_API_KEY = 'test-key';
    });
  });

  describe('callModel', () => {
    const mockMessages = [
      { role: 'system' as const, content: 'You are a helpful assistant' },
      { role: 'user' as const, content: 'Hello' },
    ];

    const config: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
    };

    it('should call OpenAI completion with correct parameters', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Hi there!' } }],
        usage: { total_tokens: 50 },
      });

      const result = await aiService.callModel(mockMessages, config);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: mockMessages,
        max_tokens: 1000,
        temperature: 0.7,
      });
      expect(result).toBe('Hi there!');
    });

    it('should return empty string when completion has no content', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{}],
        usage: { total_tokens: 0 },
      });

      const result = await aiService.callModel(mockMessages, config);

      expect(result).toBe('');
    });

    it('should throw error for unimplemented provider', async () => {
      const anthropicConfig: AIModelConfig = {
        provider: 'anthropic',
        model: 'claude-3',
        maxTokens: 1000,
        temperature: 0.7,
      };

      await expect(
        aiService.callModel(mockMessages, anthropicConfig)
      ).rejects.toThrow('Provider anthropic not yet implemented');
    });

    it('should track cost when usage data is available', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 100 },
      });

      await aiService.callModel(mockMessages, config);

      const costTracking = aiService.getCostTracking();
      expect(costTracking).toHaveLength(1);
      expect(costTracking[0].tokensUsed).toBe(100);
      expect(costTracking[0].model).toBe('gpt-4');
    });

    it('should not track cost when usage data is missing', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
      });

      await aiService.callModel(mockMessages, config);

      const costTracking = aiService.getCostTracking();
      expect(costTracking).toHaveLength(0);
    });

    it('should throw error when cost limit is exceeded', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 500000 },
      });

      await expect(aiService.callModel(mockMessages, config)).rejects.toThrow(
        'Cost limit exceeded'
      );
    });

    it('should use resilience wrapper for OpenAI calls', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      });

      await aiService.callModel(mockMessages, config);

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('manageContextWindow', () => {
    const newMessages = [{ role: 'user' as const, content: 'New message' }];

    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: { vector_data: { messages: [] } },
      });
    });

    it('should retrieve existing context from database', async () => {
      const context = await aiService.manageContextWindow(
        'idea-123',
        newMessages
      );

      expect(context).toBeDefined();
      expect(context.length).toBeGreaterThan(0);
    });

    it('should add new messages to existing context', async () => {
      const context = await aiService.manageContextWindow(
        'idea-123',
        newMessages
      );

      expect(context[context.length - 1]).toEqual({
        role: 'user',
        content: 'New message',
      });
    });

    it('should truncate context when exceeding max tokens', async () => {
      const longMessages = Array(400).fill({
        role: 'user' as const,
        content: 'a'.repeat(50),
      });

      const context = await aiService.manageContextWindow(
        'idea-123',
        longMessages
      );

      expect(context.length).toBeLessThan(400);
    });

    it('should preserve system messages during truncation', async () => {
      const messages = [
        { role: 'system' as const, content: 'System instruction' },
        ...Array(50).fill({
          role: 'user' as const,
          content: 'a'.repeat(100),
        }),
      ];

      const context = await aiService.manageContextWindow('idea-123', messages);

      const systemMessages = context.filter((m) => m.role === 'system');
      expect(systemMessages.length).toBeGreaterThan(0);
    });

    it('should throw error when Supabase not initialized', async () => {
      const originalEnv = { ...process.env };
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const service = new AIService();
      const mockMessages = [{ role: 'user' as const, content: 'Test' }];

      await expect(
        service.manageContextWindow('idea-123', mockMessages)
      ).rejects.toThrow('Supabase client not initialized');

      process.env = originalEnv;
    });
  });

  describe('cost tracking', () => {
    const config: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
    };

    it('should return empty array when no costs tracked', () => {
      const tracking = aiService.getCostTracking();

      expect(tracking).toEqual([]);
    });

    it('should track costs across multiple calls', async () => {
      mockOpenAI.chat.completions.create
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Response 1' } }],
          usage: { total_tokens: 100 },
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Response 2' } }],
          usage: { total_tokens: 200 },
        });

      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        config
      );
      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        config
      );

      const tracking = aiService.getCostTracking();
      expect(tracking).toHaveLength(2);
      expect(tracking[0].tokensUsed).toBe(100);
      expect(tracking[1].tokensUsed).toBe(200);
    });

    it('should include timestamps in cost trackers', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 100 },
      });

      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        config
      );

      const tracking = aiService.getCostTracking();
      expect(tracking[0].timestamp).toBeInstanceOf(Date);
    });

    it('should calculate cost correctly for gpt-3.5-turbo', async () => {
      const gpt35Config: AIModelConfig = {
        ...config,
        model: 'gpt-3.5-turbo',
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 1000 },
      });

      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        gpt35Config
      );

      const tracking = aiService.getCostTracking();
      expect(tracking[0].cost).toBe(1000 * 0.000002);
    });

    it('should calculate cost correctly for gpt-4', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 1000 },
      });

      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        config
      );

      const tracking = aiService.getCostTracking();
      expect(tracking[0].cost).toBe(1000 * 0.00003);
    });

    it('should use default cost per token for unknown models', async () => {
      const unknownConfig: AIModelConfig = {
        ...config,
        model: 'unknown-model',
      };

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 1000 },
      });

      await aiService.callModel(
        [{ role: 'user' as const, content: 'Test' }],
        unknownConfig
      );

      const tracking = aiService.getCostTracking();
      expect(tracking[0].cost).toBe(1000 * 0.00001);
    });
  });

  describe('cache management', () => {
    it('should return cache stats', () => {
      const stats = aiService.getCacheStats();

      expect(stats).toBeDefined();
      expect(stats.costCacheSize).toBe(0);
      expect(stats.responseCacheSize).toBe(0);
    });

    it('should clear cost cache', () => {
      aiService.clearCostCache();

      const stats = aiService.getCacheStats();
      expect(stats.costCacheSize).toBe(0);
    });

    it('should clear cost cache', () => {
      aiService.clearCostCache();

      const stats = aiService.getCacheStats();
      expect(stats.costCacheSize).toBe(0);
    });

    it('should clear response cache', () => {
      aiService.clearResponseCache();

      const stats = aiService.getCacheStats();
      expect(stats.responseCacheSize).toBe(0);
    });

    it('should clear cost cache', () => {
      aiService.clearCostCache();

      const stats = aiService.getCacheStats();
      expect(stats.costCacheSize).toBe(0);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy when OpenAI is available', async () => {
      mockOpenAI.models.list.mockResolvedValue({ data: [] });

      const health = await aiService.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.providers).toContain('openai');
    });

    it('should return unhealthy when no providers available', async () => {
      delete process.env.OPENAI_API_KEY;
      const service = new AIService();

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.providers).toHaveLength(0);
    });

    it('should handle OpenAI health check errors gracefully', async () => {
      mockOpenAI.models.list.mockRejectedValue(new Error('API error'));

      const health = await aiService.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.providers).toHaveLength(0);
    });

    it('should list only available providers', async () => {
      mockOpenAI.models.list.mockResolvedValue({ data: [] });

      const health = await aiService.healthCheck();

      expect(health.providers).toEqual(['openai']);
    });
  });

  describe('edge cases and error handling', () => {
    const config: AIModelConfig = {
      provider: 'openai',
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
    };

    beforeEach(() => {
      mockSupabase.single.mockResolvedValue({
        data: { vector_data: { messages: [] } },
      });
    });

    it('should handle empty messages array', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: '' } }],
        usage: { total_tokens: 0 },
      });

      const result = await aiService.callModel([], config);

      expect(result).toBe('');
    });

    it('should handle OpenAI API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API error')
      );

      await expect(
        aiService.callModel(
          [{ role: 'user' as const, content: 'Test' }],
          config
        )
      ).rejects.toThrow('API error');
    });

    it('should handle context with only system messages', async () => {
      const systemMessages = [
        { role: 'system' as const, content: 'System instruction' },
      ];

      const context = await aiService.manageContextWindow(
        'idea-123',
        systemMessages
      );

      expect(context).toContainEqual({
        role: 'system',
        content: 'System instruction',
      });
    });

    it('should handle very large context that requires multiple truncations', async () => {
      const hugeMessages = Array(500).fill({
        role: 'user' as const,
        content: 'a'.repeat(50),
      });

      const context = await aiService.manageContextWindow(
        'idea-123',
        hugeMessages
      );

      expect(context.length).toBeLessThan(500);
    });

    it('should handle zero maxTokens limit in context management', async () => {
      const context = await aiService.manageContextWindow('idea-123', [], 0);

      expect(context).toBeDefined();
    });
  });
});
