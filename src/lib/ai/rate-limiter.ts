import { ResilienceManager, defaultResilienceConfigs, ServiceResilienceConfig } from '../resilience';
import type { AIModelConfig } from './types';
import { AI_CONFIG, AI_HEALTH_CHECK_CONFIG, DEFAULT_TIMEOUTS, RESILIENCE_CONFIG } from '../config';

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
  private resilienceManager: ResilienceManager;

  constructor(resilienceManager?: ResilienceManager) {
    this.resilienceManager = resilienceManager || new ResilienceManager();
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
    } catch (error) {
      // Wrap non-Error errors for consistency
      if (!(error instanceof Error)) {
        throw new Error(String(error));
      }
      throw error;
    }
  }

  /**
   * Health check for AI providers
   */
  async healthCheck(
    openai: any,
    anthropic: any
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
      } catch (error) {
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
      } catch (error) {
        // Anthropic health check failed
      }
    }

    const circuitBreakers = this.resilienceManager.getAllCircuitBreakerStatuses();

    return {
      status: providers.length > 0 ? 'healthy' : 'unhealthy',
      providers,
      circuitBreakers,
    };
  }

  /**
   * Get the resilience manager instance (for advanced usage)
   */
  getResilienceManager(): ResilienceManager {
    return this.resilienceManager;
  }

  /**
   * Factory function for creating AIRateLimiter instances.
   * Enables dependency injection for testing.
   */
  static create(resilienceManager?: ResilienceManager): AIRateLimiter {
    return new AIRateLimiter(resilienceManager);
  }
}