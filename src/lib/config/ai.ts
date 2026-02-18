/**
 * AI Service Configuration
 *
 * Centralizes all AI-related configuration including:
 * - Context window management
 * - Token limits
 * - Iteration limits
 * - Hash algorithms
 *
 * All values are configurable via environment variables
 */

import { EnvLoader } from './environment';

/**
 * Context window and iteration configuration
 */
export const AI_SERVICE_CONFIG = {
  /**
   * Maximum number of iterations for context window optimization
   * Prevents infinite loops when trimming context
   * Env: AI_MAX_CONTEXT_ITERATIONS (default: 1000)
   */
  MAX_CONTEXT_ITERATIONS: EnvLoader.number(
    'AI_MAX_CONTEXT_ITERATIONS',
    1000,
    100,
    10000
  ),

  /**
   * Hash algorithm for cache key generation
   * Env: AI_HASH_ALGORITHM (default: SHA-256)
   */
  HASH_ALGORITHM: EnvLoader.string('AI_HASH_ALGORITHM', 'SHA-256'),

  /**
   * Hash length for cache key generation (in bytes)
   * Env: AI_HASH_LENGTH (default: 32)
   */
  HASH_LENGTH: EnvLoader.number('AI_HASH_LENGTH', 32, 16, 64),

  /**
   * Maximum token limit for AI requests
   * Env: AI_MAX_TOKENS (default: 4096)
   */
  MAX_TOKENS: EnvLoader.number('AI_MAX_TOKENS', 4096, 512, 16000),

  /**
   * Context window size (number of messages to retain)
   * Env: AI_CONTEXT_WINDOW_SIZE (default: 20)
   */
  CONTEXT_WINDOW_SIZE: EnvLoader.number('AI_CONTEXT_WINDOW_SIZE', 20, 5, 100),

  /**
   * Temperature for AI responses (0.0 - 2.0)
   * Env: AI_TEMPERATURE (default: 0.7)
   */
  TEMPERATURE: EnvLoader.number('AI_TEMPERATURE', 0.7, 0.0, 2.0),

  /**
   * Top-p sampling parameter (0.0 - 1.0)
   * Env: AI_TOP_P (default: 1.0)
   */
  TOP_P: EnvLoader.number('AI_TOP_P', 1.0, 0.0, 1.0),

  /**
   * Frequency penalty (-2.0 to 2.0)
   * Env: AI_FREQUENCY_PENALTY (default: 0.0)
   */
  FREQUENCY_PENALTY: EnvLoader.number('AI_FREQUENCY_PENALTY', 0.0, -2.0, 2.0),

  /**
   * Presence penalty (-2.0 to 2.0)
   * Env: AI_PRESENCE_PENALTY (default: 0.0)
   */
  PRESENCE_PENALTY: EnvLoader.number('AI_PRESENCE_PENALTY', 0.0, -2.0, 2.0),

  /**
   * Cleanup interval for cost trackers (ms)
   * Env: AI_CLEANUP_INTERVAL_MS (default: 300000 = 5 minutes)
   */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'AI_CLEANUP_INTERVAL_MS',
    5 * 60 * 1000,
    60000,
    600000
  ),
} as const;

/**
 * AI Provider Configuration
 */
export const AI_PROVIDER_CONFIG = {
  /**
   * Default AI provider
   * Env: AI_DEFAULT_PROVIDER (default: openai)
   */
  DEFAULT_PROVIDER: EnvLoader.string('AI_DEFAULT_PROVIDER', 'openai'),

  /**
   * Default model for the provider
   * Env: AI_DEFAULT_MODEL (default: gpt-4)
   */
  DEFAULT_MODEL: EnvLoader.string('AI_DEFAULT_MODEL', 'gpt-4'),

  /**
   * Fallback model if primary fails
   * Env: AI_FALLBACK_MODEL (default: gpt-3.5-turbo)
   */
  FALLBACK_MODEL: EnvLoader.string('AI_FALLBACK_MODEL', 'gpt-3.5-turbo'),

  /**
   * Enable fallback on failure
   * Env: AI_ENABLE_FALLBACK (default: true)
   */
  ENABLE_FALLBACK: EnvLoader.boolean('AI_ENABLE_FALLBACK', true),

  /**
   * Maximum number of concurrent AI requests
   * Env: AI_MAX_CONCURRENT_REQUESTS (default: 5)
   */
  MAX_CONCURRENT_REQUESTS: EnvLoader.number(
    'AI_MAX_CONCURRENT_REQUESTS',
    5,
    1,
    20
  ),

  /**
   * Request timeout for AI calls (ms)
   * Env: AI_REQUEST_TIMEOUT (default: 60000)
   */
  REQUEST_TIMEOUT: EnvLoader.number('AI_REQUEST_TIMEOUT', 60000, 10000, 300000),
} as const;

/**
 * Cost tracking configuration
 */
export const AI_COST_CONFIG = {
  /**
   * Enable cost tracking
   * Env: AI_ENABLE_COST_TRACKING (default: true)
   */
  ENABLED: EnvLoader.boolean('AI_ENABLE_COST_TRACKING', true),

  /**
   * Daily cost limit in USD
   * Env: AI_DAILY_COST_LIMIT (default: 10.0)
   */
  DAILY_LIMIT: EnvLoader.number('AI_DAILY_COST_LIMIT', 10.0, 1.0, 1000.0),

  /**
   * Warning threshold for daily cost (percentage)
   * Env: AI_COST_WARNING_THRESHOLD (default: 80)
   */
  WARNING_THRESHOLD: EnvLoader.number('AI_COST_WARNING_THRESHOLD', 80, 50, 95),
} as const;

/**
 * Type exports
 */
export type AIServiceConfig = typeof AI_SERVICE_CONFIG;
export type AIProviderConfig = typeof AI_PROVIDER_CONFIG;
export type AICostConfig = typeof AI_COST_CONFIG;
