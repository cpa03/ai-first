import 'openai/shims/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

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

interface CacheEntry {
  response: string;
  timestamp: number;
}

class AIService {
  private openai: OpenAI | null = null;
  private supabase: any = null;
  private costTrackers: CostTracker[] = [];
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 300000;
  private readonly MAX_CACHE_SIZE = 100;

  constructor() {
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

  private generateCacheKey(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): string {
    const messagesString = JSON.stringify(messages);
    const configString = `${config.provider}-${config.model}-${config.maxTokens}-${config.temperature}`;
    return `${configString}-${Buffer.from(messagesString).toString('base64')}`;
  }

  private getFromCache(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  private setInCache(key: string, response: string): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Make a model call with context windowing
  async callModel(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): Promise<string> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(messages, config);

    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      let response: string;

      if (config.provider === 'openai') {
        await this.enforceRateLimit();

        const completion = await this.openai!.chat.completions.create({
          model: config.model,
          messages,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        });

        response = completion.choices[0]?.message?.content || '';

        this.setInCache(cacheKey, response);

        const usage = completion.usage;
        if (usage) {
          await this.trackCost(usage.total_tokens, config.model);
        }
      } else {
        throw new Error(`Provider ${config.provider} not yet implemented`);
      }

      if (this.supabase) {
        await this.logAgentAction('ai-service', 'model-call', {
          provider: config.provider,
          model: config.model,
          duration: Date.now() - startTime,
          messageCount: messages.length,
          cached: false,
        });
      }

      return response;
    } catch (error) {
      if (this.supabase) {
        await this.logAgentAction('ai-service', 'model-call-error', {
          provider: config.provider,
          model: config.model,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
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
      throw new Error('Supabase client not initialized');
    }

    // Retrieve existing context from vector store
    const { data: existingContext } = await this.supabase
      .from('vectors')
      .select('vector_data')
      .eq('idea_id', ideaId)
      .eq('reference_type', 'context')
      .single();

    let context: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }> = [];

    if (existingContext?.vector_data) {
      context = (existingContext.vector_data.messages || []).map((m: any) => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      }));
    }

    // Add new messages
    context = [...context, ...newMessages];

    // Implement simple truncation strategy (can be enhanced with summarization)
    while (this.estimateTokens(context) > maxTokens && context.length > 2) {
      // Remove oldest non-system message
      const systemMessages = context.filter((m) => m.role === 'system');
      const nonSystemMessages = context.filter((m) => m.role !== 'system');
      nonSystemMessages.shift(); // Remove oldest
      context = [...systemMessages, ...nonSystemMessages];
    }

    // Store updated context
    await this.supabase.from('vectors').upsert({
      idea_id: ideaId,
      reference_type: 'context',
      vector_data: { messages: context },
    } as any);

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

    // Check cost limits
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
    return this.costTrackers
      .filter((tracker) => tracker.timestamp.toDateString() === today)
      .reduce((sum, tracker) => sum + tracker.cost, 0);
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

  clearCache(): void {
    this.cache.clear();
  }

  // Get cost tracking data
  getCostTracking(): CostTracker[] {
    return [...this.costTrackers];
  }

  // Health check
  async healthCheck(): Promise<{ status: string; providers: string[] }> {
    const providers: string[] = [];

    if (this.openai) {
      try {
        await this.openai.models.list();
        providers.push('openai');
      } catch (error) {
        console.error('OpenAI health check failed:', error);
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
