/**
 * API timeout configuration
 * All timeout values are in milliseconds
 * Now supports environment variable overrides
 */
import { EnvLoader } from './environment';

export const TIMEOUT_CONFIG = {
  /**
   * Default timeout for API requests (ms)
   * Env: API_TIMEOUT_DEFAULT (default: 30000)
   */
  DEFAULT: EnvLoader.number('API_TIMEOUT_DEFAULT', 30000, 1000, 300000),

  /**
   * Timeout for quick API calls (health checks, simple lookups) (ms)
   * Env: API_TIMEOUT_QUICK (default: 5000)
   */
  QUICK: EnvLoader.number('API_TIMEOUT_QUICK', 5000, 500, 60000),

  /**
   * Timeout for standard API requests (ms)
   * Env: API_TIMEOUT_STANDARD (default: 10000)
   */
  STANDARD: EnvLoader.number('API_TIMEOUT_STANDARD', 10000, 1000, 120000),

  /**
   * Timeout for long-running operations (creating resources, large uploads) (ms)
   * Env: API_TIMEOUT_LONG (default: 30000)
   */
  LONG: EnvLoader.number('API_TIMEOUT_LONG', 30000, 5000, 600000),

  /**
   * Service-specific timeouts
   */
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
 * Rate limiting configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Default request rate (requests per window)
   * Env: RATE_LIMIT_DEFAULT_RATE (default: 100)
   */
  DEFAULT_RATE: EnvLoader.number('RATE_LIMIT_DEFAULT_RATE', 100, 1, 10000),

  /**
   * Default time window in milliseconds
   * Env: RATE_LIMIT_DEFAULT_WINDOW (default: 60000)
   */
  DEFAULT_WINDOW: EnvLoader.number(
    'RATE_LIMIT_DEFAULT_WINDOW',
    60000,
    1000,
    3600000
  ),

  /**
   * Rate limits for different service tiers
   */
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

  /**
   * Maximum number of entries in rate limit store
   * Env: RATE_LIMIT_MAX_STORE_SIZE (default: 10000)
   */
  MAX_STORE_SIZE: EnvLoader.number(
    'RATE_LIMIT_MAX_STORE_SIZE',
    10000,
    100,
    100000
  ),

  /**
   * Cleanup interval in milliseconds
   * Env: RATE_LIMIT_CLEANUP_INTERVAL (default: 60000)
   */
  CLEANUP_INTERVAL_MS: EnvLoader.number(
    'RATE_LIMIT_CLEANUP_INTERVAL',
    60000,
    5000,
    300000
  ),

  /**
   * Cleanup window in milliseconds
   * Env: RATE_LIMIT_CLEANUP_WINDOW (default: 60000)
   */
  CLEANUP_WINDOW_MS: EnvLoader.number(
    'RATE_LIMIT_CLEANUP_WINDOW',
    60000,
    1000,
    3600000
  ),

  /**
   * API endpoint rate limit presets
   * Different endpoints have different rate limit requirements
   * Now supports environment variable overrides
   */
  ENDPOINT_PRESETS: {
    /** Strict limits for sensitive/admin endpoints - Default: 10 */
    STRICT: EnvLoader.number('RATE_LIMIT_ENDPOINT_STRICT', 10, 1, 100),
    /** Moderate limits for standard API endpoints - Default: 30 */
    MODERATE: EnvLoader.number('RATE_LIMIT_ENDPOINT_MODERATE', 30, 5, 200),
    /** Lenient limits for public/read-only endpoints - Default: 60 */
    LENIENT: EnvLoader.number('RATE_LIMIT_ENDPOINT_LENIENT', 60, 10, 500),
  },

  /**
   * User tier rate limit configurations
   * Different user roles have different rate limits
   * Now supports environment variable overrides
   */
  USER_TIER: {
    /** Anonymous/unauthenticated users - Default: 30 */
    ANONYMOUS: EnvLoader.number('RATE_LIMIT_TIER_ANONYMOUS_RATE', 30, 5, 200),
    /** Authenticated regular users - Default: 60 */
    AUTHENTICATED: EnvLoader.number(
      'RATE_LIMIT_TIER_AUTHENTICATED_RATE',
      60,
      10,
      500
    ),
    /** Premium users - Default: 120 */
    PREMIUM: EnvLoader.number('RATE_LIMIT_TIER_PREMIUM_RATE', 120, 20, 1000),
    /** Enterprise users - Default: 300 */
    ENTERPRISE: EnvLoader.number(
      'RATE_LIMIT_TIER_ENTERPRISE_RATE',
      300,
      50,
      2000
    ),
  },
} as const;

/**
 * Retry configuration
 * Now supports environment variable overrides
 */
export const RETRY_CONFIG = {
  /**
   * Default number of retry attempts
   * Env: RETRY_DEFAULT_MAX_RETRIES (default: 3)
   */
  DEFAULT_MAX_RETRIES: EnvLoader.number('RETRY_DEFAULT_MAX_RETRIES', 3, 0, 10),

  /**
   * Initial delay between retries (in milliseconds)
   * Env: RETRY_INITIAL_DELAY (default: 1000)
   */
  INITIAL_DELAY: EnvLoader.number('RETRY_INITIAL_DELAY', 1000, 100, 60000),

  /**
   * Maximum delay between retries (in milliseconds)
   * Env: RETRY_MAX_DELAY (default: 10000)
   */
  MAX_DELAY: EnvLoader.number('RETRY_MAX_DELAY', 10000, 1000, 300000),

  /**
   * Multiplier for exponential backoff
   * Env: RETRY_BACKOFF_MULTIPLIER (default: 2)
   */
  BACKOFF_MULTIPLIER: EnvLoader.number('RETRY_BACKOFF_MULTIPLIER', 2, 1, 10),

  /**
   * Whether to add jitter to retry delays
   * Env: RETRY_ENABLE_JITTER (default: true)
   */
  ENABLE_JITTER: EnvLoader.boolean('RETRY_ENABLE_JITTER', true),
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /**
   * Character count warning threshold (0.0 - 1.0)
   * Shows warning color when character count reaches this percentage of max
   * Env: UI_CHAR_COUNT_WARNING_THRESHOLD (default: 80, converted to 0.8)
   */
  CHAR_COUNT_WARNING_THRESHOLD:
    EnvLoader.number('UI_CHAR_COUNT_WARNING_THRESHOLD', 80, 50, 95) / 100,

  /**
   * Blueprint generation simulated delay (in milliseconds)
   * Used to show loading state while "generating" blueprint
   * Env: UI_BLUEPRINT_GENERATION_DELAY (default: 2000)
   */
  BLUEPRINT_GENERATION_DELAY: EnvLoader.number(
    'UI_BLUEPRINT_GENERATION_DELAY',
    2000,
    0,
    10000
  ),

  /**
   * Toast notification duration (in milliseconds)
   * Env: UI_TOAST_DURATION (default: 3000)
   */
  TOAST_DURATION: EnvLoader.number('UI_TOAST_DURATION', 3000, 1000, 30000),

  /**
   * Tooltip show delay (in milliseconds)
   * Delay before showing tooltip on hover/focus
   * Env: UI_TOOLTIP_DELAY (default: 300)
   */
  TOOLTIP_DELAY: EnvLoader.number('UI_TOOLTIP_DELAY', 300, 50, 2000),

  /**
   * Copy feedback duration (in milliseconds)
   * How long to show "Copied!" feedback
   * Env: UI_COPY_FEEDBACK_DURATION (default: 2000)
   */
  COPY_FEEDBACK_DURATION: EnvLoader.number(
    'UI_COPY_FEEDBACK_DURATION',
    2000,
    500,
    10000
  ),

  /**
   * Toast progress update interval (in milliseconds)
   * How often to update the progress bar for smooth animation
   * Env: UI_TOAST_PROGRESS_INTERVAL (default: 50)
   */
  TOAST_PROGRESS_INTERVAL: EnvLoader.number(
    'UI_TOAST_PROGRESS_INTERVAL',
    50,
    10,
    500
  ),
} as const;

/**
 * API validation configuration
 * Now supports environment variable overrides
 */
export const VALIDATION_CONFIG = {
  MAX_ANSWER_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_ANSWER_LENGTH',
    5000,
    100,
    50000
  ),
  DEFAULT_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_DEFAULT_PAGINATION_LIMIT',
    50,
    5,
    500
  ),
  MAX_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_MAX_PAGINATION_LIMIT',
    100,
    10,
    1000
  ),
  MIN_IDEA_LENGTH: EnvLoader.number('VALIDATION_MIN_IDEA_LENGTH', 10, 1, 1000),
  MAX_IDEA_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_LENGTH',
    10000,
    100,
    100000
  ),
  MAX_IDEA_ID_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_ID_LENGTH',
    100,
    10,
    500
  ),
  MAX_REQUEST_BODY_SIZE: EnvLoader.number(
    'VALIDATION_MAX_REQUEST_BODY_SIZE',
    1048576,
    1024,
    10485760
  ),
} as const;

/**
 * Animation timing configuration
 * All duration values are in milliseconds
 * Now supports environment variable overrides
 */
export const ANIMATION_CONFIG = {
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
} as const;

/**
 * Rate limit cleanup configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_CLEANUP_CONFIG = {
  CLEANUP_INTERVAL_MS: RATE_LIMIT_CONFIG.CLEANUP_INTERVAL_MS,
  CLEANUP_WINDOW_MS: RATE_LIMIT_CONFIG.CLEANUP_WINDOW_MS,
} as const;

/**
 * Security headers configuration
 * Now supports environment variable overrides
 */
export const SECURITY_CONFIG = {
  HSTS_MAX_AGE: EnvLoader.number(
    'SECURITY_HSTS_MAX_AGE',
    31536000,
    0,
    63072000
  ),
  HSTS_INCLUDE_SUBDOMAINS: EnvLoader.boolean(
    'SECURITY_HSTS_INCLUDE_SUBDOMAINS',
    true
  ),
  HSTS_PRELOAD: EnvLoader.boolean('SECURITY_HSTS_PRELOAD', true),
} as const;

/**
 * Retry delay polling configuration
 */
export const RETRY_DELAY_CONFIG = {
  /**
   * Polling interval for checking if retry delay should be aborted (in milliseconds)
   * Lower values provide more responsive cancellation but use more CPU
   * Default: 100ms
   */
  POLLING_INTERVAL_MS: 100,
} as const;

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
   * Model pricing per token (in USD)
   * NOTE: Pricing is not environment-configurable as it's tied to provider rates
   */
  PRICING: {
    'gpt-3.5-turbo': 0.000002,
    'gpt-4': 0.00003,
    'gpt-4-turbo': 0.00001,
  } as const,

  /**
   * Default pricing fallback
   * NOTE: Not environment-configurable
   */
  DEFAULT_PRICING_PER_TOKEN: 0.00001,
} as const;

/**
 * Rate limiting store configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_STORE_CONFIG = {
  MAX_STORE_SIZE: RATE_LIMIT_CONFIG.MAX_STORE_SIZE,
  CLEANUP_PERCENTAGE:
    EnvLoader.number('CACHE_TRIM_PERCENTAGE', 20, 5, 50) / 100,
  DEFAULT_WINDOW_MS: RATE_LIMIT_CONFIG.DEFAULT_WINDOW,
} as const;

/**
 * Cache configuration defaults
 * Now supports environment variable overrides
 */
export const CACHE_CONFIG = {
  DEFAULT_MAX_SIZE: EnvLoader.number('CACHE_SIZE_MAXIMUM', 1000, 100, 10000),
} as const;

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  /**
   * Default CSP directives
   */
  DIRECTIVES: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://vercel.live'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': [],
    'connect-src': ["'self'", 'https://*.supabase.co'],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"],
  } as const,

  /**
   * Permissions Policy directives
   */
  PERMISSIONS_POLICY: [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'browsing-topics=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ] as const,
} as const;

/**
 * PII Redaction configuration
 */
export const PII_REDACTION_CONFIG = {
  /**
   * Redaction labels for different PII types
   */
  REDACTION_LABELS: {
    JWT: '[REDACTED_TOKEN]',
    URL_WITH_CREDENTIALS: '[REDACTED_URL]',
    EMAIL: '[REDACTED_EMAIL]',
    PHONE: '[REDACTED_PHONE]',
    SSN: '[REDACTED_SSN]',
    CREDIT_CARD: '[REDACTED_CARD]',
    IP_ADDRESS: '[REDACTED_IP]',
    API_KEY: '[REDACTED_API_KEY]',
    PASSPORT: '[REDACTED_PASSPORT]',
    DRIVERS_LICENSE: '[REDACTED_LICENSE]',
  } as const,

  /**
   * Private IP address ranges
   */
  PRIVATE_IP_RANGES: {
    LOOPBACK: ['127'],
    PRIVATE_CLASS_A: ['10'],
    PRIVATE_CLASS_B: ['172'],
    PRIVATE_CLASS_C: ['192', '168'],
  } as const,

  /**
   * API key prefixes for regex patterns
   */
  API_KEY_PREFIXES: [
    'api[_-]?key',
    'apikey',
    'secret',
    'token',
    'credential',
    'auth',
    'authorization',
    'admin[-_ ]?key',
    'adminkey',
    'password',
    'passphrase',
    'bearer',
    'access[_-]?key',
  ] as const,

  /**
   * Safe fields that should not be redacted
   */
  SAFE_FIELDS: [
    'id',
    'created_at',
    'updated_at',
    'status',
    'priority',
    'estimate_hours',
  ] as const,
} as const;

/**
 * Validation limits configuration
 * Now supports environment variable overrides
 */
export const VALIDATION_LIMITS_CONFIG = {
  MAX_USER_RESPONSE_SIZE: VALIDATION_CONFIG.MAX_ANSWER_LENGTH,
  MAX_RESPONSE_KEY_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_RESPONSE_KEY_LENGTH',
    100,
    10,
    500
  ),
  MAX_RESPONSE_VALUE_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_RESPONSE_VALUE_LENGTH',
    1000,
    100,
    5000
  ),
  DEFAULT_MAX_REQUEST_SIZE_BYTES: VALIDATION_CONFIG.MAX_REQUEST_BODY_SIZE,
} as const;

/**
 * Error message configuration
 */
export const ERROR_CONFIG = {
  /**
   * Request ID generation configuration
   */
  REQUEST_ID: {
    PREFIX: 'req_',
    RANDOM_LENGTH: 9,
    RADIX: 36,
  } as const,

  /**
   * Rate limit response configuration
   */
  RATE_LIMIT: {
    ERROR_CODE: 'RATE_LIMIT_EXCEEDED',
    STATUS_CODE: 429,
  } as const,
} as const;

/**
 * Agent configuration for breakdown engine and clarifier
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
  } as const,

  BREAKDOWN_FALLBACK_CONFIDENCE: {
    DEPENDENCIES: 0.8,
    TIMELINE: 0.7,
  } as const,

  IDEA_ANALYSIS_FALLBACK: {
    COMPLEXITY_SCORE: 5,
    COMPLEXITY_LEVEL: 'medium' as const,
    SCOPE_SIZE: 'medium' as const,
    ESTIMATED_WEEKS: 8,
    TEAM_SIZE: 2,
    OVERALL_CONFIDENCE: 0.7,
  } as const,

  QUESTION_GENERATOR: {
    MIN_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MIN', 3, 1, 10),
    MAX_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MAX', 5, 1, 20),
    DEFAULT_QUESTION_TYPE: 'open' as const,
    REQUIRED_DEFAULT: true,
  } as const,

  CLARIFIER_CONFIDENCE: {
    BASE_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_BASE_CONFIDENCE', 30, 0, 100) / 100,
    CONFIDENCE_INCREMENT_PER_ANSWER:
      EnvLoader.number('AGENT_CLARIFIER_INCREMENT', 60, 0, 100) / 100,
    MAX_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_MAX_CONFIDENCE', 90, 50, 100) / 100,
    DEFAULT_CONFIDENCE: 0.5,
  } as const,

  DATABASE: {
    MAX_CONNECTION_RETRIES: EnvLoader.number('AGENT_DB_MAX_RETRIES', 3, 0, 10),
    HEALTH_CHECK_STALE_THRESHOLD_MS: EnvLoader.number(
      'AGENT_DB_HEALTH_CHECK_STALE_MS',
      30000,
      5000,
      300000
    ),
    DEFAULT_SEARCH_LIMIT: EnvLoader.number(
      'AGENT_DB_DEFAULT_SEARCH_LIMIT',
      10,
      1,
      100
    ),
    VECTOR_SIMILARITY_THRESHOLD:
      EnvLoader.number('AGENT_DB_VECTOR_SIMILARITY_THRESHOLD', 78, 0, 100) /
      100,
  } as const,
} as const;

/**
 * Resilience configuration defaults
 * Used for circuit breakers, retries, and timeouts
 */
export const RESILIENCE_CONFIG = {
  RETRY: {
    DEFAULT_MAX_RETRIES: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
    DEFAULT_BASE_DELAY_MS: RETRY_CONFIG.INITIAL_DELAY,
    DEFAULT_MAX_DELAY_MS: RETRY_CONFIG.MAX_DELAY,
    DEFAULT_BACKOFF_MULTIPLIER: RETRY_CONFIG.BACKOFF_MULTIPLIER,
  } as const,

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
  } as const,

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
  } as const,

  SERVICE_RETRY: {
    OPENAI: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
    GITHUB: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    NOTION: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    TRELLO: { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 3000 },
    SUPABASE: { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 },
  } as const,

  SERVICE_CIRCUIT_BREAKER: {
    OPENAI: { failureThreshold: 5, resetTimeoutMs: 60000 },
    GITHUB: { failureThreshold: 5, resetTimeoutMs: 30000 },
    NOTION: { failureThreshold: 5, resetTimeoutMs: 30000 },
    TRELLO: { failureThreshold: 3, resetTimeoutMs: 20000 },
    SUPABASE: { failureThreshold: 10, resetTimeoutMs: 60000 },
  } as const,
} as const;

/**
 * Legacy validation limits configuration
 * Note: VALIDATION_CONFIG above is the primary source for API validation
 * These constants provide field-specific limits for use in validation.ts
 */
export const VALIDATION_LIMITS = {
  IDEA: {
    MIN_LENGTH: VALIDATION_CONFIG.MIN_IDEA_LENGTH,
    MAX_LENGTH: VALIDATION_CONFIG.MAX_IDEA_LENGTH,
    MAX_ID_LENGTH: VALIDATION_CONFIG.MAX_IDEA_ID_LENGTH,
  } as const,

  TITLE: {
    MAX_LENGTH: EnvLoader.number('VALIDATION_TITLE_MAX_LENGTH', 500, 50, 1000),
  } as const,

  ANSWER: {
    MIN_LENGTH: EnvLoader.number('VALIDATION_ANSWER_MIN_LENGTH', 5, 1, 50),
    MAX_LENGTH: EnvLoader.number('VALIDATION_ANSWER_MAX_LENGTH', 500, 50, 5000),
    MIN_SHORT_LENGTH: EnvLoader.number(
      'VALIDATION_ANSWER_MIN_SHORT_LENGTH',
      2,
      1,
      10
    ),
    MAX_SHORT_LENGTH: EnvLoader.number(
      'VALIDATION_ANSWER_MAX_SHORT_LENGTH',
      100,
      10,
      500
    ),
  } as const,

  PAGINATION: {
    DEFAULT_LIMIT: VALIDATION_CONFIG.DEFAULT_PAGINATION_LIMIT,
    MAX_LIMIT: VALIDATION_CONFIG.MAX_PAGINATION_LIMIT,
    AGENT_LOGS_DEFAULT: EnvLoader.number(
      'VALIDATION_AGENT_LOGS_DEFAULT',
      100,
      10,
      1000
    ),
  } as const,

  DATABASE: {
    STALE_SESSION_THRESHOLD_MS:
      AGENT_CONFIG.DATABASE.HEALTH_CHECK_STALE_THRESHOLD_MS,
  } as const,
} as const;

/**
 * Cache TTL configuration
 * Now supports environment variable overrides
 */
export const CACHE_TTL_CONFIG = {
  DEFAULT_CACHE_TTL_MS: EnvLoader.number(
    'CACHE_TTL_STANDARD',
    5 * 60 * 1000,
    1000,
    3600000
  ),
  DEFAULT_STALE_WHILE_REVALIDATE: true,
} as const;

/**
 * Rate limit statistics configuration
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_STATS_CONFIG = {
  DEFAULT_STATS_WINDOW_MS: RATE_LIMIT_CONFIG.DEFAULT_WINDOW,
  TOP_USERS_LIMIT: EnvLoader.number('RATE_LIMIT_TOP_USERS_LIMIT', 10, 1, 100),
} as const;

/**
 * HTTP Status Codes
 * Centralized status codes for API responses
 */
export const STATUS_CODES = {
  // Success
  OK: 200,
  CREATED: 201,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PAYLOAD_TOO_LARGE: 413,
  RATE_LIMITED: 429,

  // Server Errors
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
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

/**
 * Rate Limiting - Additional Config
 * Now supports environment variable overrides
 */
export const RATE_LIMIT_VALUES = {
  MAX_REQUESTS_PER_IDENTIFIER: EnvLoader.number(
    'RATE_LIMIT_MAX_REQUESTS_PER_IDENTIFIER',
    1000,
    100,
    10000
  ),
} as const;

/**
 * Clarifier Agent Values
 * Now supports environment variable overrides
 */
export const CLARIFIER_VALUES = {
  LOG_PREVIEW_LENGTH: EnvLoader.number(
    'AGENT_CLARIFIER_LOG_PREVIEW_LENGTH',
    100,
    50,
    500
  ),
  INITIAL_CONFIDENCE: AGENT_CONFIG.CLARIFIER_CONFIDENCE.BASE_CONFIDENCE,
  COMPLETION_CONFIDENCE: AGENT_CONFIG.CLARIFIER_CONFIDENCE.MAX_CONFIDENCE,
} as const;

/**
 * Task Validation
 * Now supports environment variable overrides
 */
export const TASK_VALIDATION = {
  MAX_TITLE_LENGTH: EnvLoader.number(
    'VALIDATION_TASK_MAX_TITLE_LENGTH',
    255,
    50,
    1000
  ),
} as const;

/**
 * Retry Configuration - Additional
 * Now supports environment variable overrides
 */
export const RETRY_VALUES = {
  JITTER_MULTIPLIER_MS: RETRY_CONFIG.INITIAL_DELAY,
} as const;
