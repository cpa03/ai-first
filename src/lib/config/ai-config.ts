import { EnvLoader } from './environment';
import { RATE_LIMIT_STORE_CONFIG } from './rate-limit-values';

/**
 * AI Service configuration
 * Now supports environment variable overrides
 */
export const AI_CONFIG = {
  DEFAULT_MAX_TOKENS: EnvLoader.number(
    'AI_DEFAULT_MAX_TOKENS',
    4000,
    100,
    16000
  ),
  COST_CACHE_TTL_MS: EnvLoader.number(
    'AI_COST_CACHE_TTL_MS',
    60 * 1000,
    1000,
    600000
  ),
  RESPONSE_CACHE_TTL_MS: EnvLoader.number(
    'AI_RESPONSE_CACHE_TTL_MS',
    5 * 60 * 1000,
    1000,
    3600000
  ),
  RESPONSE_CACHE_MAX_SIZE: EnvLoader.number(
    'AI_RESPONSE_CACHE_MAX_SIZE',
    100,
    10,
    1000
  ),
  COST_CACHE_MAX_SIZE: EnvLoader.number('AI_COST_CACHE_MAX_SIZE', 1, 1, 100),
  CHARS_PER_TOKEN: EnvLoader.number('AI_CHARS_PER_TOKEN', 4, 1, 10),
  CACHE_KEY_HASH_LENGTH: EnvLoader.number(
    'AI_CACHE_KEY_HASH_LENGTH',
    64,
    8,
    128
  ),
  DEFAULT_DAILY_COST_LIMIT: EnvLoader.number(
    'AI_DEFAULT_DAILY_COST_LIMIT',
    10.0,
    1.0,
    1000.0
  ),

  /**
   * Cost tracker cleanup interval in milliseconds
   * Prevents memory leaks by periodically cleaning old cost tracker entries
   * Env: AI_COST_TRACKER_CLEANUP_INTERVAL_MS (default: 300000 = 5 minutes)
   */
  COST_TRACKER_CLEANUP_INTERVAL_MS: EnvLoader.number(
    'AI_COST_TRACKER_CLEANUP_INTERVAL_MS',
    5 * 60 * 1000,
    60000,
    3600000
  ),

  /**
   * Maximum iterations for context window truncation loop
   * Prevents infinite loops when removing messages from context
   * NOTE: Not environment-configurable as this is a safety limit
   */
  MAX_CONTEXT_ITERATIONS: 1000,

  /**
   * Model pricing per token (in USD)
   * NOTE: Pricing is not environment-configurable as it's tied to provider rates
   */
  PRICING: {
    'gpt-3.5-turbo': 0.000002,
    'gpt-4': 0.00003,
    'gpt-4-turbo': 0.00001,
    'claude-3-5-sonnet-20241022': 0.000015,
    'claude-3-opus-20240229': 0.000075,
    'claude-3-sonnet-20240229': 0.000015,
    'claude-3-haiku-20240307': 0.0000025,
  } as const,

  /**
   * Default pricing fallback
   * NOTE: Not environment-configurable
   */
  DEFAULT_PRICING_PER_TOKEN: 0.00001,

  /**
   * AI Model Parameter Validation Limits
   * SECURITY: These limits prevent malicious or accidental misconfiguration
   * of AI model parameters that could lead to unexpected behavior or resource exhaustion
   */
  VALIDATION: {
    TEMPERATURE_MIN: 0,
    TEMPERATURE_MAX: 2.0,
    TEMPERATURE_DEFAULT: 0.7,
    MAX_TOKENS_MIN: 1,
    MAX_TOKENS_MAX: 32000,
    MAX_TOKENS_DEFAULT: 4000,
    MODEL_NAME_PATTERN: /^[a-zA-Z0-9._-]+$/,
    ALLOWED_MODEL_PREFIXES: ['gpt-', 'claude-', 'o1-', 'o3-'],
  } as const,
} as const;

/**
 * AI Service Limits
 * Now supports environment variable overrides
 */
export const AI_SERVICE_LIMITS = {
  MAX_COST_TRACKERS: AI_CONFIG.RESPONSE_CACHE_MAX_SIZE * 100,
  MAX_COST_TRACKER_AGE_MS: EnvLoader.number(
    'AI_MAX_COST_TRACKER_AGE_MS',
    24 * 60 * 60 * 1000,
    3600000,
    168 * 60 * 60 * 1000
  ),
  CLEANUP_PERCENTAGE: RATE_LIMIT_STORE_CONFIG.CLEANUP_PERCENTAGE,
  CACHE_KEY_HASH_LENGTH: AI_CONFIG.CACHE_KEY_HASH_LENGTH,
} as const;
