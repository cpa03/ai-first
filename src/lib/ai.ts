import 'openai/shims/node';
import OpenAI from 'openai';
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

// Model configuration
export interface AIModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  maxTokens: number;
  temperature: number;
}

// Cost tracking
export interface CostTracker {
  tokensUsed: number;
  cost: number;
  model: string;
  timestamp: Date;
}

// Context windowing strategy
export interface ContextWindow {
  shortTerm: Array<{ role: string; content: string }>;
  longTermSummary?: string;
  maxTokens: number;
}

class AIService {
  private openai: OpenAI | null = null;
  private supabase: SupabaseClient | null = null;
  private costTrackers: CostTracker[] = [];
  private todayCostCache: Cache<number>;
  private responseCache: Cache<string>;

  constructor() {
    this.todayCostCache = new Cache<number>({
      ttl: 60 * 1000,
      maxSize: 1,
    });

    this.responseCache = new Cache<string>({
      ttl: 5 * 60 * 1000,
      maxSize: 100,
    });
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: DEFAULT_TIMEOUTS.openai,
      });
    }
  }

  // Initialize AI service with provider-specific config
  async initialize(config: AIModelConfig): Promise<void> {
    // Validate API keys and configuration
    if (config.provider === 'openai' && !this.openai) {
      throw new Error('OpenAI API key not configured');
    }

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
    const startTime = Date.now();

    const cacheKey = await this.generateCacheKey(messages, config);

    const cachedResponse = this.responseCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await this.executeWithResilience(async () => {
        if (config.provider === 'openai') {
          const completion = await this.openai!.chat.completions.create({
            model: config.model,
            messages,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
          });

          const response = completion.choices[0]?.message?.content || '';

          const usage = completion.usage;
          if (usage) {
            await this.trackCost(usage.total_tokens, config.model);
          }

          return response;
        } else {
          const { AppError, ErrorCode } = await import('./errors');
          throw new AppError(
            `Provider ${config.provider} not yet implemented`,
            ErrorCode.EXTERNAL_SERVICE_ERROR,
            501,
            undefined,
            false,
            [
              'Use "openai" as the provider',
              'Check documentation for supported providers',
            ]
          );
        }
      }, config);

      if (this.supabase) {
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
      if (this.supabase) {
        await this.logAgentAction('ai-service', 'model-call-error', {
          provider: config.provider,
          model: config.model,
          duration: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
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

    if (
      typeof TextEncoder === 'undefined' ||
      typeof crypto === 'undefined' ||
      !crypto.subtle
    ) {
      const hash = btoa(key).substring(0, 64);
      return hash;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex.substring(0, 64);
  }

  private async executeWithResilience<T>(
    operation: () => Promise<T>,
    config: AIModelConfig
  ): Promise<T> {
    const { resilienceManager, defaultResilienceConfigs } =
      await import('@/lib/resilience');

    const serviceKey = config.provider === 'openai' ? 'openai' : 'default';

    try {
      return await resilienceManager.execute(
        operation,
        toResilienceConfig(
          defaultResilienceConfigs[
            serviceKey as keyof typeof defaultResilienceConfigs
          ] || defaultResilienceConfigs.openai
        ),
        `ai-${config.provider}-${config.model}`
      );
    } catch (error) {
      // Wrap non-AppError errors for consistency
      if (!(error instanceof Error)) {
        const { AppError, ErrorCode } = await import('./errors');
        throw new AppError(
          String(error),
          ErrorCode.EXTERNAL_SERVICE_ERROR,
          502,
          undefined,
          true
        );
      }
      throw error;
    }
  }

  // Context windowing strategy
  async manageContextWindow(
    ideaId: string,
    newMessages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>,
    maxTokens: number = 4000
  ): Promise<
    Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  > {
    if (!this.supabase) {
      const { AppError, ErrorCode } = await import('./errors');
      throw new AppError(
        'Supabase client not initialized',
        ErrorCode.SERVICE_UNAVAILABLE,
        503,
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
      const { data: existingContext } = await this.supabase
        .from('vectors')
        .select('vector_data')
        .eq('idea_id', ideaId)
        .eq('reference_type', 'context')
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
    let totalChars = context.reduce((sum, msg) => sum + msg.content.length, 0);

    // If context exceeds token limit, remove oldest non-system messages
    if (Math.ceil(totalChars / 4) > maxTokens) {
      const systemMessages = context.filter((m) => m.role === 'system');
      const nonSystemMessages = context.filter((m) => m.role !== 'system');

      while (
        Math.ceil(totalChars / 4) > maxTokens &&
        nonSystemMessages.length > 0
      ) {
        const removed = nonSystemMessages.shift();
        if (removed) {
          totalChars -= removed.content.length;
        }
      }
      context = [...systemMessages, ...nonSystemMessages];
    }

    await this.supabase.from('vectors').upsert({
      idea_id: ideaId,
      reference_type: 'context',
      vector_data: { messages: context } as unknown as Record<string, unknown>,
    });

    this.responseCache.set(cacheKey, JSON.stringify(context));

    const ideaUpdateCacheKey = `idea:${ideaId}:updated`;
    this.responseCache.set(ideaUpdateCacheKey, Date.now().toString());

    return context;
  }

  // Estimate token count (rough approximation)
  private estimateTokens(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): number {
    const totalChars = messages.reduce(
      (sum, msg) => sum + msg.content.length,
      0
    );
    return Math.ceil(totalChars / 4); // Rough estimate: 1 token ≈ 4 chars
  }

  // Cost tracking and guardrails
  private async trackCost(tokens: number, model: string): Promise<void> {
    // Simple cost calculation (can be enhanced with actual pricing)
    const costPerToken = this.getCostPerToken(model);
    const cost = tokens * costPerToken;

    // PERFORMANCE: Get current today's cost. This is O(1) if cached, O(n) if not.
    // We call it before pushing the new tracker to ensure it only includes previous costs.
    const previousTodayCost = this.getTodayCost();
    const totalTodayCost = previousTodayCost + cost;

    const tracker: CostTracker = {
      tokensUsed: tokens,
      cost,
      model,
      timestamp: new Date(),
    };

    this.costTrackers.push(tracker);

    // PERFORMANCE: Update cache with the new total instead of clearing it.
    // This keeps subsequent calls to getTodayCost() as O(1).
    const today = new Date().toDateString();
    const cacheKey = `today:${today}`;
    this.todayCostCache.set(cacheKey, totalTodayCost);

    const dailyLimit = parseFloat(process.env.COST_LIMIT_DAILY || '10.0');

    if (totalTodayCost > dailyLimit) {
      throw new Error(
        `Cost limit exceeded. Today's cost: $${totalTodayCost}, Limit: $${dailyLimit}`
      );
    }

    // Store cost tracking
    if (this.supabase) {
      await this.supabase.from('agent_logs').insert({
        agent: 'ai-service',
        action: 'cost-tracking',
        payload: tracker,
      });
    }
  }

  private getCostPerToken(model: string): number {
    // Simplified pricing (should be updated with actual rates)
    const pricing: Record<string, number> = {
      'gpt-3.5-turbo': 0.000002,
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
    };
    return pricing[model] || 0.00001;
  }

  private getTodayCost(): number {
    const today = new Date().toDateString();
    const cacheKey = `today:${today}`;

    const cachedCost = this.todayCostCache.get(cacheKey);
    if (cachedCost !== null) {
      return cachedCost;
    }

    const cost = this.costTrackers
      .filter((tracker) => tracker.timestamp.toDateString() === today)
      .reduce((sum, tracker) => sum + tracker.cost, 0);

    this.todayCostCache.set(cacheKey, cost);
    return cost;
  }

  // Agent action logging
  private async logAgentAction(
    agent: string,
    action: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    if (this.supabase) {
      // Redact sensitive information before logging to database
      const sanitizedPayload = redactPIIInObject(payload);

      await this.supabase.from('agent_logs').insert({
        agent,
        action,
        payload: {
          ...(sanitizedPayload as Record<string, unknown>),
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  // Get cost tracking data
  getCostTracking(): CostTracker[] {
    return [...this.costTrackers];
  }

  getCacheStats(): {
    costCache: ReturnType<Cache<number>['getStats']>;
    responseCache: ReturnType<Cache<string>['getStats']>;
    costCacheSize: number;
    responseCacheSize: number;
  } {
    return {
      costCache: this.todayCostCache.getStats(),
      responseCache: this.responseCache.getStats(),
      costCacheSize: this.todayCostCache.size,
      responseCacheSize: this.responseCache.size,
    };
  }

  clearCostCache(): void {
    this.todayCostCache.clear();
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

  // Health check
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
    const providers: string[] = [];

    if (this.openai) {
      try {
        await withTimeout(() => this.openai!.models.list(), {
          timeoutMs: DEFAULT_TIMEOUTS.openai / 2,
        });
        providers.push('openai');
      } catch (error) {
        logger.error('OpenAI health check failed:', error);
      }
    }

    const circuitBreakers = circuitBreakerManager.getAllStatuses();

    return {
      status: providers.length > 0 ? 'healthy' : 'unhealthy',
      providers,
      circuitBreakers,
    };
  }
}

// Singleton instance
export const aiService = new AIService();

// Export the class and utilities
export { AIService };
export { createClient };
