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
import { AI_CONFIG, AI_SERVICE_LIMITS, STATUS_CODES } from './config/constants';
import { resourceCleanupManager } from './resource-cleanup';

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

// Memory leak prevention: Maximum number of cost trackers to prevent unbounded growth
const MAX_COST_TRACKERS = AI_SERVICE_LIMITS.MAX_COST_TRACKERS;

// Memory leak prevention: Maximum age of cost tracker entries (24 hours)
const MAX_COST_TRACKER_AGE_MS = AI_SERVICE_LIMITS.MAX_COST_TRACKER_AGE_MS;

// Context windowing strategy
export interface ContextWindow {
  shortTerm: Array<{ role: string; content: string }>;
  longTermSummary?: string;
  maxTokens: number;
}

class AIService {
  private openai: OpenAI | null = null;
  // SECURITY: Lazy-loaded Supabase client to prevent service role key exposure in client bundle
  // The client is only initialized when explicitly needed in server-side contexts
  private _supabase: SupabaseClient | null = null;
  private costTrackers: CostTracker[] = [];
  private todayCostCache: Cache<number>;
  private responseCache: Cache<string>;
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.todayCostCache = new Cache<number>({
      ttl: AI_CONFIG.COST_CACHE_TTL_MS,
      maxSize: AI_CONFIG.COST_CACHE_MAX_SIZE,
    });

    this.responseCache = new Cache<string>({
      ttl: AI_CONFIG.RESPONSE_CACHE_TTL_MS,
      maxSize: AI_CONFIG.RESPONSE_CACHE_MAX_SIZE,
    });

    // SECURITY: Removed direct Supabase client initialization from constructor
    // to prevent SUPABASE_SERVICE_ROLE_KEY from being accessed at module load time
    // Use getSupabase() method instead for lazy initialization

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: DEFAULT_TIMEOUTS.openai,
      });
    }

    // Periodic cleanup of cost trackers to prevent memory leaks
    // Only start in production to avoid open handles in tests
    // RELIABILITY: Conditional interval start prevents Jest force exit warnings
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'production' &&
      !process.env.JEST_WORKER_ID &&
      !process.env.VITEST_WORKER_ID
    ) {
      this.cleanupIntervalId = setInterval(() => {
        this.cleanupOldCostTrackers();
      }, AI_CONFIG.COST_TRACKER_CLEANUP_INTERVAL_MS);

      // Prevent interval from keeping process alive
      if (
        this.cleanupIntervalId &&
        typeof (this.cleanupIntervalId as NodeJS.Timeout).unref === 'function'
      ) {
        (this.cleanupIntervalId as NodeJS.Timeout).unref();
      }

      resourceCleanupManager.register('ai-service-interval', () =>
        this.cleanup()
      );
    }
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
      throw new Error(
        'CRITICAL SECURITY VIOLATION: getSupabase() was called in browser context. ' +
          'The Supabase service role key bypasses RLS and must NEVER be exposed to clients.'
      );
    }

    // Lazy initialization to prevent key from being accessed during module load
    if (!this._supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
          if (!this.openai) {
            const { AppError, ErrorCode } = await import('./errors');
            throw new AppError(
              'OpenAI client not initialized. Check OPENAI_API_KEY environment variable.',
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
              'Invalid response from OpenAI: no choices returned',
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
              'Invalid response from OpenAI: missing choice',
              ErrorCode.EXTERNAL_SERVICE_ERROR,
              STATUS_CODES.BAD_GATEWAY,
              undefined,
              true
            );
          }

          const response = choice.message?.content || '';

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
            STATUS_CODES.NOT_IMPLEMENTED,
            undefined,
            false,
            [
              'Use "openai" as the provider',
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
      const hash = btoa(key).substring(
        0,
        AI_SERVICE_LIMITS.CACHE_KEY_HASH_LENGTH
      );
      return hash;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return hashHex.substring(0, AI_SERVICE_LIMITS.CACHE_KEY_HASH_LENGTH);
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
          STATUS_CODES.BAD_GATEWAY,
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
      const { data: existingContext } = await supabase
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

    // Maximum iterations to prevent potential infinite loops (from config)
    const MAX_CONTEXT_ITERATIONS = AI_CONFIG.MAX_CONTEXT_ITERATIONS;
    let iterations = 0;

    // PERFORMANCE: Use a single pass to separate messages and avoid O(N^2) truncation.
    // Math.ceil(totalChars / 4) > maxTokens is equivalent to totalChars > maxTokens * 4.
    const charLimit = maxTokens * 4;
    if (totalChars > charLimit) {
      const systemMessages: typeof context = [];
      const nonSystemMessages: typeof context = [];

      for (let i = 0; i < context.length; i++) {
        const msg = context[i];
        if (msg.role === 'system') {
          systemMessages.push(msg);
        } else {
          nonSystemMessages.push(msg);
        }
      }

      let messagesToRemove = 0;
      const maxRemovable = nonSystemMessages.length;
      while (
        totalChars > charLimit &&
        messagesToRemove < maxRemovable &&
        iterations < MAX_CONTEXT_ITERATIONS
      ) {
        totalChars -= nonSystemMessages[messagesToRemove].content.length;
        messagesToRemove++;
        iterations++;
      }

      if (iterations >= MAX_CONTEXT_ITERATIONS) {
        logger.warn(
          `Context window iteration limit reached (${MAX_CONTEXT_ITERATIONS}). Context may exceed token limit.`
        );
      }

      // PERFORMANCE: Use slice() once instead of multiple shift() calls to avoid O(N^2).
      const remainingNonSystem =
        messagesToRemove > 0
          ? nonSystemMessages.slice(messagesToRemove)
          : nonSystemMessages;

      context = [...systemMessages, ...remainingNonSystem];
    }

    await supabase.from('vectors').upsert({
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
    return Math.ceil(totalChars / AI_CONFIG.CHARS_PER_TOKEN);
  }

  // Cost tracking and guardrails
  private async trackCost(tokens: number, model: string): Promise<void> {
    // Memory leak prevention: Clean up old cost trackers before adding new ones
    this.cleanupOldCostTrackers();

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

    // Memory leak prevention: If array exceeds max size, remove oldest 20% of entries
    if (this.costTrackers.length > MAX_COST_TRACKERS) {
      const entriesToRemove = Math.floor(
        MAX_COST_TRACKERS * AI_SERVICE_LIMITS.CLEANUP_PERCENTAGE
      );
      this.costTrackers.splice(0, entriesToRemove);
    }

    // PERFORMANCE: Update cache with the new total instead of clearing it.
    // This keeps subsequent calls to getTodayCost() as O(1).
    const today = new Date().toDateString();
    const cacheKey = `today:${today}`;
    this.todayCostCache.set(cacheKey, totalTodayCost);

    const dailyLimit = parseFloat(
      process.env.COST_LIMIT_DAILY || String(AI_CONFIG.DEFAULT_DAILY_COST_LIMIT)
    );

    if (totalTodayCost > dailyLimit) {
      throw new Error(
        `Cost limit exceeded. Today's cost: $${totalTodayCost}, Limit: $${dailyLimit}`
      );
    }

    // Store cost tracking
    const supabase = this.getSupabase();
    if (supabase) {
      await supabase.from('agent_logs').insert({
        agent: 'ai-service',
        action: 'cost-tracking',
        payload: tracker,
      });
    }
  }

  private getCostPerToken(model: string): number {
    return (
      AI_CONFIG.PRICING[model as keyof typeof AI_CONFIG.PRICING] ??
      AI_CONFIG.DEFAULT_PRICING_PER_TOKEN
    );
  }

  /**
   * Memory leak prevention: Clean up old cost tracker entries
   * Removes entries older than MAX_COST_TRACKER_AGE_MS (24 hours)
   */
  private cleanupOldCostTrackers(): void {
    const now = Date.now();
    const cutoffTime = now - MAX_COST_TRACKER_AGE_MS;

    // PERFORMANCE: Use a manual loop to find the first index that is within the window
    // instead of filter(). Since costTrackers is naturally sorted by timestamp
    // (new entries are always pushed to the end), we can find the split point in O(N).
    // This avoids O(N) property lookups and reduces memory pressure.
    let firstValidIndex = -1;
    for (let i = 0; i < this.costTrackers.length; i++) {
      if (this.costTrackers[i].timestamp.getTime() > cutoffTime) {
        firstValidIndex = i;
        break;
      }
    }

    if (firstValidIndex === -1) {
      // All entries are expired
      this.costTrackers = [];
    } else if (firstValidIndex > 0) {
      // Some entries are expired, remove them
      this.costTrackers = this.costTrackers.slice(firstValidIndex);
    }
    // If firstValidIndex is 0, all entries are still valid; no action needed.
  }

  /**
   * Cleanup method to stop the interval and prevent memory leaks
   * Should be called on service shutdown
   */
  cleanup(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
  }

  private getTodayCost(): number {
    const today = new Date().toDateString();
    const cacheKey = `today:${today}`;

    const cachedCost = this.todayCostCache.get(cacheKey);
    if (cachedCost !== null) {
      return cachedCost;
    }

    // PERFORMANCE: Use a manual loop to iterate backwards from the latest entries.
    // Since entries are added chronologically, we can stop as soon as we hit an
    // entry from a previous day, avoiding O(N) traversal of the entire array.
    let cost = 0;
    for (let i = this.costTrackers.length - 1; i >= 0; i--) {
      if (this.costTrackers[i].timestamp.toDateString() === today) {
        cost += this.costTrackers[i].cost;
      } else {
        // Found an entry from a previous day, can stop searching
        break;
      }
    }

    this.todayCostCache.set(cacheKey, cost);
    return cost;
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

      await supabase.from('agent_logs').insert({
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

    if (this.openai?.models) {
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
