import 'openai/shims/node';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Cache } from './cache';
import { createLogger } from './logger';
import { redactPIIInObject } from './pii-redaction';
import {
  DEFAULT_TIMEOUTS,
  withTimeout,
  circuitBreakerManager,
  type ServiceResilienceConfig,
  type ResilienceConfig,
} from './resilience';
import {
  AI_CONFIG,
  AI_SERVICE_LIMITS,
  STATUS_CODES,
  RESILIENCE_CONFIG,
} from './config/constants';
import {
  AI_MODEL_CONFIG,
  AI_HEALTH_CHECK_CONFIG,
} from './config/modular-constants';
import { API_ERROR_MESSAGES } from './config';
import { DB_TABLES } from './config/database-tables';
import { DB_REFERENCE_TYPES } from './config/database-tables';
import {
  AI_ENV_KEYS,
  PLATFORM_ENV_KEYS,
  DATABASE_ENV_KEYS,
} from './config/env-keys';
import { AI_TOKEN_ESTIMATION } from './config/time';
import { resourceCleanupManager } from './resource-cleanup';
import { validateAIModelConfig } from './validation';

// Import new modular components
import { AIProviderRegistry, defaultProviderRegistry } from './ai/provider-registry';
import { AICostTracker } from './ai/cost-tracker';
import { AIRateLimiter } from './ai/rate-limiter';

// Import types from dedicated types file
import type { AIModelConfig, CostTracker, ContextWindow } from './ai/types';

function toResilienceConfig(config: ServiceResilienceConfig): ResilienceConfig {
  return {
    timeoutMs: config.timeout.timeoutMs,
    maxRetries: config.retry.maxRetries,
    baseDelayMs: config.retry.baseDelayMs,
    maxDelayMs: config.retry.maxDelayMs,
    failureThreshold: config.circuitBreaker.failureThreshold,
    resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
  };
}

const logger = createLogger('AIService');

// Re-export types for backward compatibility
export type { AIModelConfig, CostTracker, ContextWindow };

class AIService {
  // Use new modular components
  private providerRegistry: AIProviderRegistry;
  private costTracker: AICostTracker;
  private rateLimiter: AIRateLimiter;

  // Legacy properties for backward compatibility
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  // SECURITY: Lazy-loaded Supabase client to prevent service role key exposure in client bundle
  // The client is only initialized when explicitly needed in server-side contexts
  private _supabase: SupabaseClient | null = null;
  private responseCache: Cache<string>;
  private encoder = new TextEncoder();

  // Allow dependency injection for testing
  constructor(
    providerRegistry?: AIProviderRegistry,
    costTracker?: AICostTracker,
    rateLimiter?: AIRateLimiter
  ) {
    // Initialize modular components
    this.providerRegistry = providerRegistry || defaultProviderRegistry;
    this.costTracker = costTracker || new AICostTracker();
    this.rateLimiter = rateLimiter || new AIRateLimiter();

    // Initialize legacy properties from provider registry for backward compatibility
    this.openai = this.providerRegistry.getOpenAIClient();
    this.anthropic = this.providerRegistry.getAnthropicClient();

    this.responseCache = new Cache<string>({
      ttl: AI_CONFIG.RESPONSE_CACHE_TTL_MS,
      maxSize: AI_CONFIG.RESPONSE_CACHE_MAX_SIZE,
    });

    // Register cleanup with resource manager
    resourceCleanupManager.register('ai-service', () => this.cleanup());
  }

  /**
   * Get the Supabase admin client (server-side only)
   *
   * SECURITY: This method implements lazy initialization to prevent the service role key
   * from being bundled in client-side JavaScript. The key is only accessed at runtime
   * when this method is called in a server-side context.
   *
   * @returns Supabase client with service role access, or null if not in server context
   * @throws Error if called in browser context
   */
  private getSupabase(): SupabaseClient | null {
    // SECURITY: Runtime check to prevent browser execution
    if (typeof window !== 'undefined') {
      throw new Error(API_ERROR_MESSAGES.AI.SECURITY_BROWSER_VIOLATION);
    }

    // Lazy initialization to prevent key from being accessed during module load
    if (!this._supabase) {
      const supabaseUrl =
        process.env[DATABASE_ENV_KEYS.NEXT_PUBLIC_SUPABASE_URL];
      const serviceKey =
        process.env[DATABASE_ENV_KEYS.SUPABASE_SERVICE_ROLE_KEY];

      if (!supabaseUrl || !serviceKey) {
        logger.warn(
          'Supabase admin client not initialized: missing URL or service role key'
        );
        return null;
      }

      this._supabase = createClient(supabaseUrl, serviceKey);
    }

    return this._supabase;
  }

  // Initialize AI service with provider-specific config
  async initialize(config: AIModelConfig): Promise<void> {
    // SECURITY: Validate AI model configuration before initialization
    // Defense-in-depth: validation also happens in config-service
    const validationResult = validateAIModelConfig(config);
    if (!validationResult.valid) {
      const { AppError, ErrorCode } = await import('./errors');
      const errorDetails = validationResult.errors
        .map((e) => e.field + ': ' + e.message)
        .join('; ');
      throw new AppError(
        `Invalid AI model configuration: ${errorDetails}`,
        ErrorCode.VALIDATION_ERROR,
        undefined,
        validationResult.errors
      );
    }

    // Validate API keys and configuration via provider registry
    this.providerRegistry.validateProviderConfig(config);

    // Log initialization for audit
    await this.logAgentAction('ai-service', 'initialize', {
      provider: config.provider,
      model: config.model,
    });
  }

  async callModel(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): Promise<string> {
    // SECURITY: Validate AI model configuration before making API call
    // Defense-in-depth: validation also happens in config-service
    const validationResult = validateAIModelConfig(config);
    if (!validationResult.valid) {
      const { AppError, ErrorCode } = await import('./errors');
      const errorDetails = validationResult.errors
        .map((e) => e.field + ': ' + e.message)
        .join('; ');
      throw new AppError(
        'Invalid AI model configuration: ' + errorDetails,
        ErrorCode.VALIDATION_ERROR,
        STATUS_CODES.BAD_REQUEST,
        undefined,
        false
      );
    }

    const startTime = Date.now();

    const cacheKey = await this.generateCacheKey(messages, config);

    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Use rate limiter for resilience
      const response = await this.rateLimiter.executeWithResilience(async () => {
        if (config.provider === 'openai') {
          if (!this.openai) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.OPENAI_NOT_INITIALIZED,
              ErrorCode.SERVICE_UNAVAILABLE,
              STATUS_CODES.SERVICE_UNAVAILABLE,
              undefined,
              false,
              [
                'Ensure OPENAI_API_KEY is set in environment variables',
                'Verify the API key is valid and has not expired',
              ]
            );
          }
          const completion = await this.openai.chat.completions.create({
            model: config.model,
            messages,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
          });

          if (
            !completion ||
            !completion.choices ||
            completion.choices.length === 0
          ) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.INVALID_RESPONSE_NO_CHOICES,
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              STATUS_CODES.BAD_GATEWAY,
              undefined,
              true
            );
          }

          const choice = completion.choices[0];
          if (!choice) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.INVALID_RESPONSE_MISSING_CHOICE,
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              STATUS_CODES.BAD_GATEWAY,
              undefined,
              true
            );
          }

          const response = choice.message?.content || '';

          const usage = completion.usage;
          if (usage) {
            await this.costTracker.trackCost(usage.total_tokens, config.model);
          }

          return response;
        } else if (config.provider === 'anthropic') {
          if (!this.anthropic) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.ANTHROPIC_NOT_INITIALIZED,
              ErrorCode.SERVICE_UNAVAILABLE,
              STATUS_CODES.SERVICE_UNAVAILABLE,
              undefined,
              false,
              [
                'Ensure ANTHROPIC_API_KEY is set in environment variables',
                'Verify the API key is valid and has not expired',
              ]
            );
          }

          // Convert OpenAI-style messages to Anthropic format
          const systemMessage = messages.find((m) => m.role === 'system');
          const otherMessages = messages.filter((m) => m.role !== 'system');

          const anthropicMessages: Anthropic.MessageParam[] = otherMessages.map(
            (m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })
          );

          const response = await this.anthropic.messages.create({
            model: config.model,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            system: systemMessage?.content,
            messages: anthropicMessages,
          });

          if (!response || !response.content || response.content.length === 0) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.INVALID_RESPONSE_NO_CONTENT,
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              STATUS_CODES.BAD_GATEWAY,
              undefined,
              true
            );
          }

          const textContent = response.content[0];
          if (textContent.type !== 'text') {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              API_ERROR_MESSAGES.AI.INVALID_RESPONSE_UNEXPECTED_TYPE,
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              STATUS_CODES.BAD_GATEWAY,
              undefined,
              true
            );
          }

          const anthropicResponse = textContent.text;

          // Track usage for Anthropic (uses input_tokens and output_tokens)
          if (response.usage) {
            const totalTokens =
              (response.usage.input_tokens || 0) +
              (response.usage.output_tokens || 0);
            await this.costTracker.trackCost(totalTokens, config.model);
          }

          return anthropicResponse;
        } else {
          const { AppError, ErrorCode } = await import('./errors');
          throw new AppError(
            API_ERROR_MESSAGES.AI.PROVIDER_NOT_IMPLEMENTED(config.provider),
            ErrorCode.EXTERNAL_SERVICE_ERROR,
            STATUS_CODES.NOT_IMPLEMENTED,
            undefined,
            false,
            [
              'Use "openai" or "anthropic" as the provider',
              'Check documentation for supported providers',
            ]
          );
        }
      }, config);

      const supabase = this.getSupabase();
      if (supabase) {
        await this.logAgentAction('ai-service', 'model-call', {
          provider: config.provider,
          model: config.model,
          duration: Date.now() - startTime,
          messageCount: messages.length,
        });
      }

      this.responseCache.set(cacheKey, response);

      return response;
    } catch (error) {
      const supabase = this.getSupabase();
      if (supabase) {
        await this.logAgentAction('ai-service', 'model-call-error', {
          provider: config.provider,
          model: config.model,
          duration: Date.now() - startTime,
          error:
            error instanceof Error
              ? error.message
              : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR,
        });
      }

      throw error;
    }
  }

  private async generateCacheKey(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): Promise<string> {
    const content = messages.map((m) => `${m.role}:${m.content}`).join('|');
    const key = `${config.provider}:${config.model}:${config.temperature}:${config.maxTokens}:${content}`;

    if (typeof crypto === 'undefined' || !crypto.subtle) {
      const hash = btoa(key).substring(
        0,
        AI_SERVICE_LIMITS.CACHE_KEY_HASH_LENGTH
      );
      return hash;
    }

    const data = this.encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex.substring(0, AI_SERVICE_LIMITS.CACHE_KEY_HASH_LENGTH);
  }

  // Context windowing strategy
  async manageContextWindow(
    ideaId: string,
    newMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    maxTokens: number = AI_CONFIG.DEFAULT_MAX_TOKENS
  ): Promise<
    Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  > {
    const supabase = this.getSupabase();
    if (!supabase) {
      const { AppError, ErrorCode } = await import('./errors');
      throw new AppError(
        'Supabase client not initialized',
        ErrorCode.SERVICE_UNAVAILABLE,
        STATUS_CODES.SERVICE_UNAVAILABLE,
        undefined,
        false,
        [
          'Check that Supabase environment variables are configured',
          'Verify SUPABASE_SERVICE_ROLE_KEY is set',
        ]
      );
    }

    const cacheKey = `context:${ideaId}`;

    const cachedContext = this.responseCache.get(cacheKey);
    let context: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [];

    if (cachedContext) {
      try {
        context = JSON.parse(cachedContext);
      } catch (error) {
        logger.error('Failed to parse cached context:', error);
      }
    } else {
      const { data: existingContext } = await supabase
        .from(DB_TABLES.VECTORS)
        .select('vector_data')
        .eq('idea_id', ideaId)
        .eq('reference_type', DB_REFERENCE_TYPES.CONTEXT)
        .single();

      if (existingContext?.vector_data) {
        context = (existingContext.vector_data.messages || []).map(
          (m: { role: string; content: string }) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })
        );
      }
    }

    context = [...context, ...newMessages];

    // Optimize: Pre-calculate total characters to avoid O(n^2) in the truncation loop
    const totalChars = context.reduce(
      (sum, msg) => sum + msg.content.length,
      0
    );

    // Maximum iterations to prevent potential infinite loops (from config)
    const MAX_CONTEXT_ITERATIONS = AI_CONFIG.MAX_CONTEXT_ITERATIONS;
    let iterations = 0;

    // If context exceeds token limit, remove oldest non-system messages
    if (
      Math.ceil(totalChars / AI_TOKEN_ESTIMATION.CHARS_PER_TOKEN) > maxTokens
    ) {
      const systemMessages = context.filter((m) => m.role === 'system');
      let nonSystemMessages = context.filter((m) => m.role !== 'system');

      // PERFORMANCE: Optimize truncation loop by using slice instead of shift().
      // shift() is O(N) because it re-indexes the entire array, leading to O(N^2)
      // in the truncation loop. slice() is O(N) and called once.
      if (
        Math.ceil(totalChars / AI_TOKEN_ESTIMATION.CHARS_PER_TOKEN) > maxTokens
      ) {
        let charsToRemove = 0;
        let splitIndex = -1;

        for (let i = 0; i < nonSystemMessages.length; i++) {
          iterations++;
          charsToRemove += nonSystemMessages[i].content.length;
          if (
            Math.ceil(
              (totalChars - charsToRemove) / AI_TOKEN_ESTIMATION.CHARS_PER_TOKEN
            ) <= maxTokens ||
            iterations >= MAX_CONTEXT_ITERATIONS
          ) {
            splitIndex = i + 1;
            break;
          }
        }

        if (splitIndex !== -1) {
          nonSystemMessages = nonSystemMessages.slice(splitIndex);
        }
      }

      if (iterations >= MAX_CONTEXT_ITERATIONS) {
        logger.warn(
          `Context window iteration limit reached (${MAX_CONTEXT_ITERATIONS}). Context may exceed token limit.`
        );
      }

      context = [...systemMessages, ...nonSystemMessages];
    }

    await supabase.from(DB_TABLES.VECTORS).upsert({
      idea_id: ideaId,
      reference_type: DB_REFERENCE_TYPES.CONTEXT,
      vector_data: { messages: context } as unknown as Record<string, unknown>,
    });

    this.responseCache.set(cacheKey, JSON.stringify(context));

    const ideaUpdateCacheKey = `idea:${ideaId}:updated`;
    this.responseCache.set(ideaUpdateCacheKey, Date.now().toString());

    return context;
  }

  // Get cost tracking data (delegates to costTracker)
  getCostTracking(): CostTracker[] {
    return this.costTracker.getCostTracking();
  }

  getCacheStats(): {
    costCache: ReturnType<Cache<number>['getStats']>;
    responseCache: ReturnType<Cache<string>['getStats']>;
    costCacheSize: number;
    responseCacheSize: number;
  } {
    return {
      costCache: this.costTracker.getCacheStats(),
      responseCache: this.responseCache.getStats(),
      costCacheSize: this.costTracker.getCacheStats().size,
      responseCacheSize: this.responseCache.size,
    };
  }

  clearCostCache(): void {
    this.costTracker.clearCostCache();
  }

  clearResponseCache(): void {
    this.responseCache.clear();
  }

  invalidateIdeaCache(ideaId: string): void {
    const contextCacheKey = `context:${ideaId}`;
    const ideaUpdateCacheKey = `idea:${ideaId}:updated`;

    this.responseCache.delete(contextCacheKey);
    this.responseCache.delete(ideaUpdateCacheKey);
  }

  // Health check (delegates to rateLimiter)
  async healthCheck(): Promise<{
    status: string;
    providers: string[];
    circuitBreakers: Record<
      string,
      {
        state: 'closed' | 'open' | 'half-open';
        failures: number;
        nextAttemptTime?: string;
      }
    >;
  }> {
    return this.rateLimiter.healthCheck(this.openai, this.anthropic);
  }

  // Agent action logging
  private async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const supabase = this.getSupabase();
    if (supabase) {
      // Redact sensitive information before logging to database
      const sanitizedPayload = redactPIIInObject(payload);

      await supabase.from(DB_TABLES.AGENT_LOGS).insert({
        agent,
        action,
        payload: {
          ...(sanitizedPayload as Record<string, unknown>),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Cleanup method to stop intervals and prevent memory leaks
   * Should be called on service shutdown
   */
  cleanup(): void {
    this.costTracker.cleanup();
    // Note: rateLimiter doesn't have cleanup needed as it uses the shared resilienceManager
  }

  // Backward compatibility getters
  getProviderRegistry(): AIProviderRegistry {
    return this.providerRegistry;
  }

  getCostTracker(): AICostTracker {
    return this.costTracker;
  }

  getRateLimiter(): AIRateLimiter {
    return this.rateLimiter;
  }
}

// Singleton instance (backward compatible)
export const aiService = new AIService();

// Export the class and utilities
export { AIService };
export { createClient };

// Export new modular components for direct use
export { AIProviderRegistry, createAIProviderRegistry, defaultProviderRegistry } from './ai/provider-registry';
export { AICostTracker } from './ai/cost-tracker';
export { AIRateLimiter } from './ai/rate-limiter';