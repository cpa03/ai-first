/**
 * Environment Configuration
 * Loads configuration from environment variables with type safety and validation
 * All values have sensible defaults but can be overridden via environment variables
 *
 * Note: This module uses console.warn directly to avoid circular dependencies
 * with the logger module (logger → pii-redaction → config/constants).
 */

export const isDevelopment =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
export const isProduction =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
export const isTest =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

// EnvLoader lives in a leaf module so domain configs can import it without
// cycling through this aggregator. Re-exported for backward compatibility.
import { EnvLoader } from './env-loader';
export { EnvLoader } from './env-loader';

// Single-source-of-truth domain configs (previously duplicated verbatim in
// this file). Imported here only for the ENV_CONFIG aggregate below — all
// consumers must import from '@/lib/config', '@/lib/config/constants', or
// the domain module directly, never from './environment'.
import { TIMEOUT_CONFIG } from './timeout-config';
import { RATE_LIMIT_CONFIG } from './rate-limit-config';
import { RETRY_CONFIG } from './retry-config';
import { CACHE_CONFIG } from './cache';

/**
 * UI Timing Configuration
 */
export const UI_CONFIG = {
  /** Character count warning threshold (0.0 - 1.0) - Default: 0.8 */
  CHAR_COUNT_WARNING_THRESHOLD:
    EnvLoader.number('UI_CHAR_COUNT_WARNING_THRESHOLD', 80, 50, 95) / 100,

  /** Blueprint generation simulated delay (ms) - Default: 2000 */
  BLUEPRINT_GENERATION_DELAY: EnvLoader.number(
    'UI_BLUEPRINT_GENERATION_DELAY',
    2000,
    0,
    10000
  ),

  /** Toast notification duration (ms) - Default: 3000 */
  TOAST_DURATION: EnvLoader.number('UI_TOAST_DURATION', 3000, 1000, 30000),

  /** Copy feedback duration (ms) - Default: 2000 */
  COPY_FEEDBACK_DURATION: EnvLoader.number(
    'UI_COPY_FEEDBACK_DURATION',
    2000,
    500,
    10000
  ),

  /** Toast progress update interval (ms) - Default: 50 */
  TOAST_PROGRESS_INTERVAL: EnvLoader.number(
    'UI_TOAST_PROGRESS_INTERVAL',
    50,
    10,
    500
  ),

  /** Animation durations (ms) */
  ANIMATION: {
    FAST: EnvLoader.number('UI_ANIMATION_FAST', 200, 50, 1000),
    STANDARD: EnvLoader.number('UI_ANIMATION_STANDARD', 300, 50, 2000),
    SLOW: EnvLoader.number('UI_ANIMATION_SLOW', 500, 100, 5000),
    TOAST_EXIT: EnvLoader.number('UI_ANIMATION_TOAST_EXIT', 300, 50, 2000),
    INPUT_FOCUS_DELAY: EnvLoader.number(
      'UI_ANIMATION_INPUT_FOCUS_DELAY',
      50,
      10,
      500
    ),
    ERROR_RELOAD_DELAY: EnvLoader.number(
      'UI_ANIMATION_ERROR_RELOAD_DELAY',
      3000,
      1000,
      30000
    ),
    ALERT_EXIT: EnvLoader.number('UI_ANIMATION_ALERT_EXIT', 200, 50, 1000),
  },
} as const;

/**
 * Validation Configuration
 */
export const VALIDATION_CONFIG = {
  /** Maximum length for clarification answers (characters) - Default: 5000 */
  MAX_ANSWER_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_ANSWER_LENGTH',
    5000,
    100,
    50000
  ),

  /** Default pagination limit - Default: 50 */
  DEFAULT_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_DEFAULT_PAGINATION_LIMIT',
    50,
    5,
    500
  ),

  /** Maximum pagination limit - Default: 100 */
  MAX_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_MAX_PAGINATION_LIMIT',
    100,
    10,
    1000
  ),

  /** Minimum length for idea text (characters) - Default: 10 */
  MIN_IDEA_LENGTH: EnvLoader.number('VALIDATION_MIN_IDEA_LENGTH', 10, 1, 1000),

  /** Maximum length for idea text (characters) - Default: 10000 */
  MAX_IDEA_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_LENGTH',
    10000,
    100,
    100000
  ),

  /** Maximum length for idea ID (characters) - Default: 100 */
  MAX_IDEA_ID_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_ID_LENGTH',
    100,
    10,
    500
  ),

  /** Maximum request body size (bytes) - Default: 1048576 */
  MAX_REQUEST_BODY_SIZE: EnvLoader.number(
    'VALIDATION_MAX_REQUEST_BODY_SIZE',
    1048576,
    1024,
    10485760
  ),
} as const;

/**
 * AI Service Configuration
 */
export const AI_CONFIG = {
  /** Default max tokens for AI model calls - Default: 4000 */
  DEFAULT_MAX_TOKENS: EnvLoader.number(
    'AI_DEFAULT_MAX_TOKENS',
    4000,
    100,
    16000
  ),

  /** Cache TTL for cost tracking (ms) - Default: 60000 */
  COST_CACHE_TTL_MS: EnvLoader.number(
    'AI_COST_CACHE_TTL_MS',
    60 * 1000,
    1000,
    600000
  ),

  /** Cache TTL for AI responses (ms) - Default: 300000 */
  RESPONSE_CACHE_TTL_MS: EnvLoader.number(
    'AI_RESPONSE_CACHE_TTL_MS',
    5 * 60 * 1000,
    1000,
    3600000
  ),

  /** Maximum size for response cache - Default: 100 */
  RESPONSE_CACHE_MAX_SIZE: EnvLoader.number(
    'AI_RESPONSE_CACHE_MAX_SIZE',
    100,
    10,
    1000
  ),

  /** Cost cache max size - Default: 1 */
  COST_CACHE_MAX_SIZE: EnvLoader.number('AI_COST_CACHE_MAX_SIZE', 1, 1, 100),

  /** Token estimation ratio (characters per token) - Default: 4 */
  CHARS_PER_TOKEN: EnvLoader.number('AI_CHARS_PER_TOKEN', 4, 1, 10),

  /** SHA-256 hash substring length for cache keys - Default: 64 */
  CACHE_KEY_HASH_LENGTH: EnvLoader.number(
    'AI_CACHE_KEY_HASH_LENGTH',
    64,
    8,
    128
  ),

  /** Default daily cost limit in USD - Default: 10.0 */
  DEFAULT_DAILY_COST_LIMIT: EnvLoader.number(
    'AI_DEFAULT_DAILY_COST_LIMIT',
    10.0,
    1.0,
    1000.0
  ),
} as const;

/**
 * Resilience Configuration
 * Circuit breakers and timeouts (retry config is in RETRY_CONFIG)
 */
export const RESILIENCE_CONFIG = {
  CIRCUIT_BREAKER: {
    DEFAULT_FAILURE_THRESHOLD: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_FAILURE_THRESHOLD',
      5,
      1,
      50
    ),
    DEFAULT_RESET_TIMEOUT_MS: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_RESET_TIMEOUT_MS',
      60000,
      5000,
      600000
    ),
    DEFAULT_MONITORING_PERIOD_MS: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_MONITORING_PERIOD_MS',
      10000,
      1000,
      60000
    ),
  },

  TIMEOUTS: {
    OPENAI: EnvLoader.number('RESILIENCE_TIMEOUT_OPENAI', 60000, 5000, 300000),
    NOTION: EnvLoader.number('RESILIENCE_TIMEOUT_NOTION', 30000, 5000, 300000),
    TRELLO: EnvLoader.number('RESILIENCE_TIMEOUT_TRELLO', 15000, 1000, 120000),
    GITHUB: EnvLoader.number('RESILIENCE_TIMEOUT_GITHUB', 30000, 5000, 300000),
    DATABASE: EnvLoader.number(
      'RESILIENCE_TIMEOUT_DATABASE',
      10000,
      1000,
      120000
    ),
    SUPABASE: EnvLoader.number(
      'RESILIENCE_TIMEOUT_SUPABASE',
      10000,
      1000,
      120000
    ),
    DEFAULT: EnvLoader.number(
      'RESILIENCE_TIMEOUT_DEFAULT',
      30000,
      1000,
      300000
    ),
  },
} as const;

/**
 * Agent Configuration
 */
export const AGENT_CONFIG = {
  BREAKDOWN_CONFIDENCE_WEIGHTS: {
    ANALYSIS:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_ANALYSIS', 30, 0, 100) / 100,
    TASKS: EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_TASKS', 30, 0, 100) / 100,
    DEPENDENCIES:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_DEPENDENCIES', 20, 0, 100) / 100,
    TIMELINE:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_TIMELINE', 20, 0, 100) / 100,
  },

  QUESTION_GENERATOR: {
    MIN_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MIN', 3, 1, 10),
    MAX_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MAX', 5, 1, 20),
  },

  CLARIFIER_CONFIDENCE: {
    BASE_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_BASE_CONFIDENCE', 30, 0, 100) / 100,
    CONFIDENCE_INCREMENT_PER_ANSWER:
      EnvLoader.number('AGENT_CLARIFIER_INCREMENT', 60, 0, 100) / 100,
    MAX_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_MAX_CONFIDENCE', 90, 50, 100) / 100,
  },

  DATABASE: {
    MAX_CONNECTION_RETRIES: EnvLoader.number('AGENT_DB_MAX_RETRIES', 3, 0, 10),
    HEALTH_CHECK_STALE_THRESHOLD_MS: EnvLoader.number(
      'AGENT_DB_HEALTH_CHECK_STALE_MS',
      30000,
      5000,
      300000
    ),
    VECTOR_SIMILARITY_THRESHOLD:
      EnvLoader.number('AGENT_DB_VECTOR_SIMILARITY_THRESHOLD', 78, 0, 100) /
      100,
  },
} as const;

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  /** HSTS max-age in seconds (1 year = 31536000 seconds) - Default: 31536000 */
  HSTS_MAX_AGE: EnvLoader.number(
    'SECURITY_HSTS_MAX_AGE',
    31536000,
    0,
    63072000
  ),

  /** HSTS includeSubDomains directive - Default: true */
  HSTS_INCLUDE_SUBDOMAINS: EnvLoader.boolean(
    'SECURITY_HSTS_INCLUDE_SUBDOMAINS',
    true
  ),

  /** HSTS preload directive - Default: true */
  HSTS_PRELOAD: EnvLoader.boolean('SECURITY_HSTS_PRELOAD', true),

  /** XSS Protection header - Default: '0' */
  X_XSS_PROTECTION: EnvLoader.string('SECURITY_X_XSS_PROTECTION', '0'),

  /** Cross-Origin-Resource-Policy header - Default: 'same-origin' */
  CROSS_ORIGIN_RESOURCE_POLICY: EnvLoader.string(
    'SECURITY_CORP',
    'same-origin'
  ),

  /** Cross-Origin-Opener-Policy header - Default: 'same-origin-allow-popups' */
  CROSS_ORIGIN_OPENER_POLICY: EnvLoader.string(
    'SECURITY_COOP',
    'same-origin-allow-popups'
  ),

  /** X-Frame-Options header - Default: 'DENY' */
  X_FRAME_OPTIONS: EnvLoader.string('SECURITY_X_FRAME_OPTIONS', 'DENY'),

  /** X-Content-Type-Options header - Default: 'nosniff' */
  X_CONTENT_TYPE_OPTIONS: EnvLoader.string(
    'SECURITY_X_CONTENT_TYPE_OPTIONS',
    'nosniff'
  ),

  /** Referrer-Policy header - Default: 'strict-origin-when-cross-origin' */
  REFERRER_POLICY: EnvLoader.string(
    'SECURITY_REFERRER_POLICY',
    'strict-origin-when-cross-origin'
  ),
} as const;

/**
 * Export all environment configurations
 */
export const ENV_CONFIG = {
  TIMEOUT: TIMEOUT_CONFIG,
  RATE_LIMIT: RATE_LIMIT_CONFIG,
  RETRY: RETRY_CONFIG,
  CACHE: CACHE_CONFIG,
  UI: UI_CONFIG,
  VALIDATION: VALIDATION_CONFIG,
  AI: AI_CONFIG,
  RESILIENCE: RESILIENCE_CONFIG,
  AGENT: AGENT_CONFIG,
  SECURITY: SECURITY_CONFIG,
} as const;

export type EnvironmentConfig = typeof ENV_CONFIG;
