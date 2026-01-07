import 'openai/shims/node';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import {
  createResilientWrapper,
  DEFAULT_RETRIES,
  DEFAULT_TIMEOUTS,
  DEFAULT_CIRCUIT_BREAKER_CONFIG,
  circuitBreakerManager,
  withTimeout,
  withRetry,
} from './resilience';

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

  // Make a model call with context windowing
  async callModel(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    config: AIModelConfig
  ): Promise<string> {
    const startTime = Date.now();

    const circuitBreaker = circuitBreakerManager.getOrCreate(
      `ai-${config.provider}`,
      DEFAULT_CIRCUIT_BREAKER_CONFIG
    );

    const makeCall = async (): Promise<string> => {
      if (config.provider === 'openai') {
        const completion = await this.openai!.chat.completions.create({
          model: config.model,
          messages,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        });

        const response = completion.choices[0]?.message?.content || '';

        // Track costs
        const usage = completion.usage;
        if (usage) {
          await this.trackCost(usage.total_tokens, config.model);
        }

        return response;
      } else {
        throw new Error(`Provider ${config.provider} not yet implemented`);
      }
    };

    try {
      const response = await createResilientWrapper(makeCall, {
        circuitBreaker,
        timeoutMs: DEFAULT_TIMEOUTS.openai,
        retryConfig: DEFAULT_RETRIES,
      })();

      // Log successful call
      if (this.supabase) {
        await this.logAgentAction('ai-service', 'model-call', {
          provider: config.provider,
          model: config.model,
          duration: Date.now() - startTime,
          messageCount: messages.length,
        });
      }

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

  // Health check
  async healthCheck(): Promise<{
    status: string;
    providers: string[];
    circuitBreakers: Record<string, any>;
  }> {
    const providers: string[] = [];

    if (this.openai) {
      try {
        await withTimeout(
          () => this.openai!.models.list(),
          DEFAULT_TIMEOUTS.openai / 2
        );
        providers.push('openai');
      } catch (error) {
        console.error('OpenAI health check failed:', error);
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
