/**
 * Environment Configuration
 * Loads configuration from environment variables with type safety and validation
 * All values have sensible defaults but can be overridden via environment variables
 */

/**
 * Type-safe environment variable loader
 */
class EnvLoader {
  /**
   * Get string value from environment variable
   */
  static string(key: string, defaultValue: string): string {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Get number value from environment variable
   */
  static number(
    key: string,
    defaultValue: number,
    min?: number,
    max?: number
  ): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      console.warn(
        `Invalid number value for ${key}: "${value}". Using default: ${defaultValue}`
      );
      return defaultValue;
    }

    if (min !== undefined && parsed < min) {
      console.warn(
        `${key} value ${parsed} is below minimum ${min}. Using minimum.`
      );
      return min;
    }

    if (max !== undefined && parsed > max) {
      console.warn(
        `${key} value ${parsed} is above maximum ${max}. Using maximum.`
      );
      return max;
    }

    return parsed;
  }

  /**
   * Get boolean value from environment variable
   */
  static boolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;

    console.warn(
      `Invalid boolean value for ${key}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }

  /**
   * Get array value from comma-separated environment variable
   */
  static array<T>(
    key: string,
    defaultValue: T[],
    parser: (item: string) => T
  ): T[] {
    const value = process.env[key];
    if (value === undefined || value.trim() === '') return defaultValue;

    return value
      .split(',')
      .map((item) => parser(item.trim()))
      .filter((item) => item !== undefined);
  }
}

/**
 * API Timeout Configuration
 * All timeout values are in milliseconds
 */
export const TIMEOUT_CONFIG = {
  /** Default timeout for API requests (ms) - Default: 30000 */
  DEFAULT: EnvLoader.number('API_TIMEOUT_DEFAULT', 30000, 1000, 300000),

  /** Timeout for quick API calls - health checks, simple lookups (ms) - Default: 5000 */
  QUICK: EnvLoader.number('API_TIMEOUT_QUICK', 5000, 500, 60000),

  /** Timeout for standard API requests (ms) - Default: 10000 */
  STANDARD: EnvLoader.number('API_TIMEOUT_STANDARD', 10000, 1000, 120000),

  /** Timeout for long-running operations (ms) - Default: 30000 */
  LONG: EnvLoader.number('API_TIMEOUT_LONG', 30000, 5000, 600000),

  /** Service-specific timeouts */
  TRELLO: {
    CREATE_BOARD: EnvLoader.number(
      'API_TIMEOUT_TRELLO_BOARD',
      10000,
      1000,
      60000
    ),
    CREATE_LIST: EnvLoader.number(
      'API_TIMEOUT_TRELLO_LIST',
      10000,
      1000,
      60000
    ),
    CREATE_CARD: EnvLoader.number(
      'API_TIMEOUT_TRELLO_CARD',
      10000,
      1000,
      60000
    ),
  },

  GITHUB: {
    GET_USER: EnvLoader.number('API_TIMEOUT_GITHUB_USER', 10000, 1000, 60000),
    CREATE_REPO: EnvLoader.number(
      'API_TIMEOUT_GITHUB_REPO',
      30000,
      1000,
      300000
    ),
  },

  NOTION: {
    CLIENT_TIMEOUT: EnvLoader.number('API_TIMEOUT_NOTION', 30000, 1000, 300000),
  },
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  /** Default request rate (requests per window) - Default: 100 */
  DEFAULT_RATE: EnvLoader.number('RATE_LIMIT_DEFAULT_RATE', 100, 1, 10000),

  /** Default time window in milliseconds - Default: 60000 */
  DEFAULT_WINDOW: EnvLoader.number(
    'RATE_LIMIT_DEFAULT_WINDOW',
    60000,
    1000,
    3600000
  ),

  /** Tier-specific rate limits */
  TIER: {
    FREE: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_FREE_RATE', 10, 1, 1000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_FREE_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
    STANDARD: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_STANDARD_RATE', 100, 1, 5000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_STANDARD_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
    PREMIUM: {
      rate: EnvLoader.number('RATE_LIMIT_TIER_PREMIUM_RATE', 1000, 1, 10000),
      window: EnvLoader.number(
        'RATE_LIMIT_TIER_PREMIUM_WINDOW',
        60000,
        1000,
        3600000
      ),
    },
  },

  /** Maximum number of entries in rate limit store - Default: 10000 */
  MAX_STORE_SIZE: EnvLoader.number(
    'RATE_LIMIT_MAX_STORE_SIZE',
    10000,
    100,
    100000
  ),

  /** Cleanup interval in milliseconds - Default: 60000 */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'RATE_LIMIT_CLEANUP_INTERVAL',
    60000,
    5000,
    300000
  ),
} as const;

/**
 * Retry Configuration
 */
export const RETRY_CONFIG = {
  /** Default number of retry attempts - Default: 3 */
  DEFAULT_MAX_RETRIES: EnvLoader.number('RETRY_DEFAULT_MAX_RETRIES', 3, 0, 10),

  /** Initial delay between retries (ms) - Default: 1000 */
  INITIAL_DELAY: EnvLoader.number('RETRY_INITIAL_DELAY', 1000, 100, 60000),

  /** Maximum delay between retries (ms) - Default: 10000 */
  MAX_DELAY: EnvLoader.number('RETRY_MAX_DELAY', 10000, 1000, 300000),

  /** Multiplier for exponential backoff - Default: 2 */
  BACKOFF_MULTIPLIER: EnvLoader.number('RETRY_BACKOFF_MULTIPLIER', 2, 1, 10),

  /** Whether to add jitter to retry delays - Default: true */
  ENABLE_JITTER: EnvLoader.boolean('RETRY_ENABLE_JITTER', true),
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  TTL: {
    /** Short-lived cache entries (ms) - Default: 60000 */
    SHORT: EnvLoader.number('CACHE_TTL_SHORT', 60 * 1000, 1000, 600000),
    /** Standard cache entries (ms) - Default: 300000 */
    STANDARD: EnvLoader.number(
      'CACHE_TTL_STANDARD',
      5 * 60 * 1000,
      1000,
      3600000
    ),
    /** Medium-lived cache entries (ms) - Default: 600000 */
    MEDIUM: EnvLoader.number('CACHE_TTL_MEDIUM', 10 * 60 * 1000, 1000, 7200000),
    /** Long-lived cache entries (ms) - Default: 3600000 */
    LONG: EnvLoader.number('CACHE_TTL_LONG', 60 * 60 * 1000, 1000, 86400000),
    /** AI response cache (ms) - Default: 300000 */
    AI_RESPONSE: EnvLoader.number(
      'CACHE_TTL_AI_RESPONSE',
      5 * 60 * 1000,
      1000,
      3600000
    ),
    /** Cost tracking cache (ms) - Default: 60000 */
    COST_TRACKING: EnvLoader.number(
      'CACHE_TTL_COST_TRACKING',
      60 * 1000,
      1000,
      600000
    ),
  },

  SIZE: {
    /** Small cache size - Default: 50 */
    SMALL: EnvLoader.number('CACHE_SIZE_SMALL', 50, 10, 1000),
    /** Standard cache size - Default: 100 */
    STANDARD: EnvLoader.number('CACHE_SIZE_STANDARD', 100, 10, 1000),
    /** Medium cache size - Default: 200 */
    MEDIUM: EnvLoader.number('CACHE_SIZE_MEDIUM', 200, 10, 2000),
    /** Large cache size - Default: 1000 */
    LARGE: EnvLoader.number('CACHE_SIZE_LARGE', 1000, 100, 10000),
    /** Maximum cache size - Default: 10000 */
    MAXIMUM: EnvLoader.number('CACHE_SIZE_MAXIMUM', 10000, 1000, 100000),
  },

  CLEANUP: {
    /** Cleanup interval (ms) - Default: 60000 */
    INTERVAL_MS: EnvLoader.number(
      'CACHE_CLEANUP_INTERVAL',
      60 * 1000,
      5000,
      300000
    ),
    /** Trim percentage when at capacity - Default: 0.2 */
    TRIM_PERCENTAGE: EnvLoader.number('CACHE_TRIM_PERCENTAGE', 20, 5, 50) / 100,
  },
} as const;

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
 * Circuit breakers, retries, and timeouts
 */
export const RESILIENCE_CONFIG = {
  RETRY: {
    DEFAULT_MAX_RETRIES: EnvLoader.number(
      'RESILIENCE_RETRY_DEFAULT_MAX_RETRIES',
      3,
      0,
      10
    ),
    DEFAULT_BASE_DELAY_MS: EnvLoader.number(
      'RESILIENCE_RETRY_DEFAULT_BASE_DELAY_MS',
      1000,
      100,
      60000
    ),
    DEFAULT_MAX_DELAY_MS: EnvLoader.number(
      'RESILIENCE_RETRY_DEFAULT_MAX_DELAY_MS',
      30000,
      1000,
      300000
    ),
    DEFAULT_BACKOFF_MULTIPLIER: EnvLoader.number(
      'RESILIENCE_RETRY_DEFAULT_BACKOFF_MULTIPLIER',
      2,
      1,
      10
    ),
  },

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
