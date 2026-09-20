import {
  resilienceManager,
  defaultResilienceConfigs,
  ServiceResilienceConfig,
} from '../resilience';
import type { AIModelConfig } from './types';
import { AI_HEALTH_CHECK_CONFIG } from '../config/modular-constants';

/**
 * Rate limiter configuration for AI providers
 */
export interface AIRateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

/**
 * AI Rate Limiter - handles rate limiting and resilience for AI provider calls.
 * Extracted from AIService to follow Single Responsibility Principle.
 */
export class AIRateLimiter {
  private resilienceManager: typeof resilienceManager;

  constructor(customResilienceManager?: typeof resilienceManager) {
    this.resilienceManager = customResilienceManager || resilienceManager;
  }

  /**
   * Convert AI service resilience config to core resilience config
   */
  private toResilienceConfig(config: ServiceResilienceConfig) {
    return {
      timeoutMs: config.timeout.timeoutMs,
      maxRetries: config.retry.maxRetries,
      baseDelayMs: config.retry.baseDelayMs,
      maxDelayMs: config.retry.maxDelayMs,
      failureThreshold: config.circuitBreaker.failureThreshold,
      resetTimeoutMs: config.circuitBreaker.resetTimeoutMs,
    };
  }

  /**
   * Execute an operation with resilience (retry, circuit breaker, timeout)
   */
  async executeWithResilience<T>(
    operation: () => Promise<T>,
    config: AIModelConfig
  ): Promise<T> {
    // Use 'anthropic' key if provider is anthropic, otherwise use provider name or fall back to default
    const serviceKey =
      config.provider === 'openai'
        ? 'openai'
        : config.provider === 'anthropic'
          ? 'anthropic'
          : 'default';

    try {
      return await this.resilienceManager.execute(
        operation,
        this.toResilienceConfig(
          defaultResilienceConfigs[
            serviceKey as keyof typeof defaultResilienceConfigs
          ] || defaultResilienceConfigs.openai
        ),
        `ai-${config.provider}-${config.model}`
      );
    } catch (_error) {
      // Wrap non-Error errors for consistency
      throw _error instanceof Error ? _error : new Error(String(_error));
    }
  }

  /**
   * Health check for AI providers
   */
  async healthCheck(
    openai: { models?: { list: () => Promise<unknown> } } | null | undefined,
    anthropic:
      { messages?: { create: () => Promise<unknown> } } | null | undefined
  ): Promise<{
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

    if (openai?.models) {
      try {
        await openai.models.list();
        providers.push('openai');
      } catch {
        // OpenAI health check failed
      }
    }

    if (anthropic) {
      try {
        await anthropic.messages.create({
          model: AI_HEALTH_CHECK_CONFIG.HEALTH_CHECK_MODEL,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        });
        providers.push('anthropic');
      } catch {
        // Anthropic health check failed
      }
    }

    const circuitBreakers = this.resilienceManager.getCircuitBreakerStates();

    return {
      status: providers.length > 0 ? 'healthy' : 'unhealthy',
      providers,
      circuitBreakers,
    };
  }

  /**
   * Get the resilience manager instance (for advanced usage)
   */
  getResilienceManager(): typeof resilienceManager {
    return this.resilienceManager;
  }

  /**
   * Factory function for creating AIRateLimiter instances.
   * Enables dependency injection for testing.
   */
  static create(resilienceManager?: typeof resilienceManager): AIRateLimiter {
    return new AIRateLimiter(resilienceManager);
  }
}
