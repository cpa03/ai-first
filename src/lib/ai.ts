import 'openai/shims/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Cache } from './cache';
import { createLogger } from './logger';

const logger = createLogger('AIService');

/* eslint-disable @typescript-eslint/no-explicit-any */
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
  private supabase: any = null;
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

  // Make a model call with context windowing
  async callModel(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): Promise<string> {
    const startTime = Date.now();

    const cacheKey = this.generateCacheKey(messages, config);

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

          const content = completion.choices[0]?.message?.content || '';

          // Track costs
          const usage = completion.usage;
          if (usage) {
            await this.trackCost(usage.total_tokens, config.model);
          }

          return content;
        } else {
          throw new Error(`Provider ${config.provider} not yet implemented`);
        }
      }, config);

      const duration = Date.now() - startTime;

      // Log successful call
      if (this.supabase) {
        await this.logAgentAction('ai-service', 'model-call', {
          provider: config.provider,
          model: config.model,
          duration,
          messageCount: messages.length,
        });
      }

      this.responseCache.set(cacheKey, response);

      return response;
    } catch (error) {
      // Log error
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

  private generateCacheKey(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): string {
    const content = messages.map((m) => `${m.role}:${m.content}`).join('|');
    const key = `${config.provider}:${config.model}:${config.temperature}:${config.maxTokens}:${content}`;
    const hash = btoa(key).substring(0, 64);
    return hash;
  }

  private async executeWithResilience<T>(
    operation: () => Promise<T>,
    config: AIModelConfig
  ): Promise<T> {
    const { resilienceManager, defaultResilienceConfigs } =
      await import('@/lib/resilience');

    const serviceKey = config.provider === 'openai' ? 'openai' : 'default';

    return resilienceManager.execute(
      operation,
      defaultResilienceConfigs[
        serviceKey as keyof typeof defaultResilienceConfigs
      ] || defaultResilienceConfigs.openai,
      `ai-${config.provider}-${config.model}`
    );
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
      throw new Error('Supabase client not initialized');
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
          (m: any) => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })
        );
      }
    }

    context = [...context, ...newMessages];

    while (this.estimateTokens(context) > maxTokens && context.length > 2) {
      const systemMessages = context.filter((m) => m.role === 'system');
      const nonSystemMessages = context.filter((m) => m.role !== 'system');
      nonSystemMessages.shift();
      context = [...systemMessages, ...nonSystemMessages];
    }

    await this.supabase.from('vectors').upsert({
      idea_id: ideaId,
      reference_type: 'context',
      vector_data: { messages: context } as unknown as Record<string, unknown>,
    });

    this.responseCache.set(cacheKey, JSON.stringify(context));

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

    const tracker: CostTracker = {
      tokensUsed: tokens,
      cost,
      model,
      timestamp: new Date(),
    };

    this.costTrackers.push(tracker);

    this.todayCostCache.clear();

    const dailyLimit = parseFloat(process.env.COST_LIMIT_DAILY || '10.0');
    const todayCost = this.getTodayCost();

    if (todayCost + cost > dailyLimit) {
      throw new Error(
        `Cost limit exceeded. Today's cost: $${todayCost}, Limit: $${dailyLimit}`
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

  // Rate limiting
  private lastCallTime = 0;
  private readonly minCallInterval = 1000; // 1 second between calls

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minCallInterval) {
      const delay = this.minCallInterval - timeSinceLastCall;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastCallTime = Date.now();
  }

  // Agent action logging
  private async logAgentAction(
    agent: string,
    action: string,
    payload: any
  ): Promise<void> {
    if (this.supabase) {
      await this.supabase.from('agent_logs').insert({
        agent,
        action,
        payload: {
          ...payload,
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

  // Health check
  async healthCheck(): Promise<{ status: string; providers: string[] }> {
    const providers: string[] = [];

    if (this.openai) {
      try {
        await this.openai.models.list();
        providers.push('openai');
      } catch (error) {
        logger.error('OpenAI health check failed:', error);
      }
    }

    return {
      status: providers.length > 0 ? 'healthy' : 'unhealthy',
      providers,
    };
  }
}

// Singleton instance
export const aiService = new AIService();

// Export the class and utilities
export { AIService };
export { createClient };
