/**
 * API timeout configuration
 * All timeout values are in milliseconds
 */
export const TIMEOUT_CONFIG = {
  /**
   * Default timeout for API requests
   */
  DEFAULT: 30000,

  /**
   * Timeout for quick API calls (health checks, simple lookups)
   */
  QUICK: 5000,

  /**
   * Timeout for standard API requests
   */
  STANDARD: 10000,

  /**
   * Timeout for long-running operations (creating resources, large uploads)
   */
  LONG: 30000,

  /**
   * Service-specific timeouts
   */
  TRELLO: {
    CREATE_BOARD: 10000,
    CREATE_LIST: 10000,
    CREATE_CARD: 10000,
  },

  GITHUB: {
    GET_USER: 10000,
    CREATE_REPO: 30000,
  },

  NOTION: {
    CLIENT_TIMEOUT: 30000,
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  /**
   * Default request rate (requests per window)
   */
  DEFAULT_RATE: 100,

  /**
   * Default time window in milliseconds
   */
  DEFAULT_WINDOW: 60000,

  /**
   * Rate limits for different service tiers
   */
  TIER: {
    FREE: { rate: 10, window: 60000 },
    STANDARD: { rate: 100, window: 60000 },
    PREMIUM: { rate: 1000, window: 60000 },
  },
} as const;

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  /**
   * Default number of retry attempts
   */
  DEFAULT_MAX_RETRIES: 3,

  /**
   * Initial delay between retries (in milliseconds)
   */
  INITIAL_DELAY: 1000,

  /**
   * Maximum delay between retries (in milliseconds)
   */
  MAX_DELAY: 10000,

  /**
   * Multiplier for exponential backoff
   */
  BACKOFF_MULTIPLIER: 2,

  /**
   * Whether to add jitter to retry delays
   */
  ENABLE_JITTER: true,
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  /**
   * Character count warning threshold (0.0 - 1.0)
   * Shows warning color when character count reaches this percentage of max
   */
  CHAR_COUNT_WARNING_THRESHOLD: 0.8,

  /**
   * Blueprint generation simulated delay (in milliseconds)
   * Used to show loading state while "generating" blueprint
   */
  BLUEPRINT_GENERATION_DELAY: 2000,

  /**
   * Toast notification duration (in milliseconds)
   */
  TOAST_DURATION: 3000,

  /**
   * Copy feedback duration (in milliseconds)
   * How long to show "Copied!" feedback
   */
  COPY_FEEDBACK_DURATION: 2000,

  /**
   * Toast progress update interval (in milliseconds)
   * How often to update the progress bar for smooth animation
   */
  TOAST_PROGRESS_INTERVAL: 50,
} as const;

/**
 * API validation configuration
 */
export const VALIDATION_CONFIG = {
  /**
   * Maximum length for clarification answers (in characters)
   */
  MAX_ANSWER_LENGTH: 5000,

  /**
   * Default pagination limit for list endpoints
   */
  DEFAULT_PAGINATION_LIMIT: 50,

  /**
   * Maximum pagination limit for list endpoints
   */
  MAX_PAGINATION_LIMIT: 100,

  /**
   * Minimum length for idea text (in characters)
   */
  MIN_IDEA_LENGTH: 10,

  /**
   * Maximum length for idea text (in characters)
   */
  MAX_IDEA_LENGTH: 10000,

  /**
   * Maximum length for idea ID (in characters)
   */
  MAX_IDEA_ID_LENGTH: 100,

  /**
   * Maximum request body size (in bytes)
   */
  MAX_REQUEST_BODY_SIZE: 1048576, // 1MB
} as const;

/**
 * Animation timing configuration
 * All duration values are in milliseconds
 */
export const ANIMATION_CONFIG = {
  /**
   * Fast transition duration (for micro-interactions)
   */
  FAST: 200,

  /**
   * Standard transition duration (for most UI transitions)
   */
  STANDARD: 300,

  /**
   * Slow transition duration (for emphasis animations)
   */
  SLOW: 500,

  /**
   * Toast exit animation duration
   */
  TOAST_EXIT: 300,

  /**
   * Input focus delay (for smooth focus transitions)
   */
  INPUT_FOCUS_DELAY: 50,

  /**
   * Error boundary reload delay
   */
  ERROR_RELOAD_DELAY: 3000,

  /**
   * Alert exit animation duration
   */
  ALERT_EXIT: 200,
} as const;

/**
 * Rate limit cleanup configuration
 */
export const RATE_LIMIT_CLEANUP_CONFIG = {
  /**
   * Interval for running cleanup of expired rate limit entries (in milliseconds)
   * Default: 1 minute
   */
  CLEANUP_INTERVAL_MS: 60000,

  /**
   * Window of time to keep rate limit entries for cleanup (in milliseconds)
   * Entries older than this will be removed
   * Default: 1 minute
   */
  CLEANUP_WINDOW_MS: 60000,
} as const;

/**
 * Security headers configuration
 */
export const SECURITY_CONFIG = {
  /**
   * HSTS max-age in seconds (1 year = 31536000 seconds)
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
   */
  HSTS_MAX_AGE: 31536000,

  /**
   * HSTS includeSubDomains directive
   */
  HSTS_INCLUDE_SUBDOMAINS: true,

  /**
   * HSTS preload directive
   */
  HSTS_PRELOAD: true,
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
 */
export const AI_CONFIG = {
  /**
   * Default max tokens for AI model calls
   */
  DEFAULT_MAX_TOKENS: 4000,

  /**
   * Cache TTL for today's cost tracking (in milliseconds)
   * Default: 1 minute
   */
  COST_CACHE_TTL_MS: 60 * 1000,

  /**
   * Cache TTL for AI responses (in milliseconds)
   * Default: 5 minutes
   */
  RESPONSE_CACHE_TTL_MS: 5 * 60 * 1000,

  /**
   * Maximum size for response cache
   */
  RESPONSE_CACHE_MAX_SIZE: 100,

  /**
   * Cost cache max size
   */
  COST_CACHE_MAX_SIZE: 1,

  /**
   * Token estimation ratio (characters per token)
   * Rough estimate: 1 token ≈ 4 characters
   */
  CHARS_PER_TOKEN: 4,

  /**
   * SHA-256 hash substring length for cache keys
   */
  CACHE_KEY_HASH_LENGTH: 64,

  /**
   * Default daily cost limit in USD
   */
  DEFAULT_DAILY_COST_LIMIT: 10.0,

  /**
   * Model pricing per token (in USD)
   */
  PRICING: {
    'gpt-3.5-turbo': 0.000002,
    'gpt-4': 0.00003,
    'gpt-4-turbo': 0.00001,
  } as const,

  /**
   * Default pricing fallback
   */
  DEFAULT_PRICING_PER_TOKEN: 0.00001,
} as const;

/**
 * Rate limiting store configuration
 */
export const RATE_LIMIT_STORE_CONFIG = {
  /**
   * Maximum number of entries in the rate limit store
   * Prevents unbounded memory growth
   */
  MAX_STORE_SIZE: 10000,

  /**
   * Percentage of entries to clean up when store reaches capacity
   */
  CLEANUP_PERCENTAGE: 0.2,

  /**
   * Default rate limit window (in milliseconds)
   */
  DEFAULT_WINDOW_MS: 60 * 1000,
} as const;

/**
 * Cache configuration defaults
 */
export const CACHE_CONFIG = {
  /**
   * Default maximum cache size to prevent memory leaks
   */
  DEFAULT_MAX_SIZE: 1000,
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
 */
export const VALIDATION_LIMITS_CONFIG = {
  /**
   * Maximum length for user responses in validation
   */
  MAX_USER_RESPONSE_SIZE: 5000,

  /**
   * Maximum key length for user response keys
   */
  MAX_RESPONSE_KEY_LENGTH: 100,

  /**
   * Maximum value length for user response values
   */
  MAX_RESPONSE_VALUE_LENGTH: 1000,

  /**
   * Default max request size in bytes (1MB)
   */
  DEFAULT_MAX_REQUEST_SIZE_BYTES: 1024 * 1024,
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
  /**
   * Confidence calculation weights for breakdown engine
   * Used in ConfidenceCalculator
   */
  BREAKDOWN_CONFIDENCE_WEIGHTS: {
    ANALYSIS: 0.3,
    TASKS: 0.3,
    DEPENDENCIES: 0.2,
    TIMELINE: 0.2,
  } as const,

  /**
   * Fallback confidence values for missing components
   * Used when components don't provide their own confidence
   */
  BREAKDOWN_FALLBACK_CONFIDENCE: {
    DEPENDENCIES: 0.8,
    TIMELINE: 0.7,
  } as const,

  /**
   * Idea analysis fallback values
   * Used in IdeaAnalyzer when analysis fails or is incomplete
   */
  IDEA_ANALYSIS_FALLBACK: {
    COMPLEXITY_SCORE: 5,
    COMPLEXITY_LEVEL: 'medium' as const,
    SCOPE_SIZE: 'medium' as const,
    ESTIMATED_WEEKS: 8,
    TEAM_SIZE: 2,
    OVERALL_CONFIDENCE: 0.7,
  } as const,

  /**
   * Question generator configuration for clarifier
   */
  QUESTION_GENERATOR: {
    MIN_QUESTIONS: 3,
    MAX_QUESTIONS: 5,
    DEFAULT_QUESTION_TYPE: 'open' as const,
    REQUIRED_DEFAULT: true,
  } as const,

  /**
   * Clarifier confidence calculator configuration
   */
  CLARIFIER_CONFIDENCE: {
    BASE_CONFIDENCE: 0.3,
    CONFIDENCE_INCREMENT_PER_ANSWER: 0.6,
    MAX_CONFIDENCE: 0.9,
    DEFAULT_CONFIDENCE: 0.5,
  } as const,

  /**
   * Database connection configuration
   */
  DATABASE: {
    MAX_CONNECTION_RETRIES: 3,
    HEALTH_CHECK_STALE_THRESHOLD_MS: 30000,
    DEFAULT_SEARCH_LIMIT: 10,
    VECTOR_SIMILARITY_THRESHOLD: 0.78,
  } as const,
} as const;

/**
 * Resilience configuration defaults
 * Used for circuit breakers, retries, and timeouts
 */
export const RESILIENCE_CONFIG = {
  /**
   * Default retry configuration
   */
  RETRY: {
    DEFAULT_MAX_RETRIES: 3,
    DEFAULT_BASE_DELAY_MS: 1000,
    DEFAULT_MAX_DELAY_MS: 30000,
    DEFAULT_BACKOFF_MULTIPLIER: 2,
  } as const,

  /**
   * Default circuit breaker configuration
   */
  CIRCUIT_BREAKER: {
    DEFAULT_FAILURE_THRESHOLD: 5,
    DEFAULT_RESET_TIMEOUT_MS: 60000,
    DEFAULT_MONITORING_PERIOD_MS: 10000,
  } as const,

  /**
   * Service-specific timeout configurations (in milliseconds)
   */
  TIMEOUTS: {
    OPENAI: 60000,
    NOTION: 30000,
    TRELLO: 15000,
    GITHUB: 30000,
    DATABASE: 10000,
    SUPABASE: 10000,
    DEFAULT: 30000,
  } as const,

  /**
   * Service-specific retry configurations
   */
  SERVICE_RETRY: {
    OPENAI: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 10000 },
    GITHUB: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    NOTION: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 5000 },
    TRELLO: { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 3000 },
    SUPABASE: { maxRetries: 2, baseDelayMs: 1000, maxDelayMs: 10000 },
  } as const,

  /**
   * Service-specific circuit breaker configurations
   */
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
  /**
   * Idea validation limits
   */
  IDEA: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10000,
    MAX_ID_LENGTH: 100,
  } as const,

  /**
   * Title validation limits
   */
  TITLE: {
    MAX_LENGTH: 500,
  } as const,

  /**
   * Answer validation limits for clarification flow
   */
  ANSWER: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500,
    MIN_SHORT_LENGTH: 2,
    MAX_SHORT_LENGTH: 100,
  } as const,

  /**
   * Pagination limits
   */
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100,
    AGENT_LOGS_DEFAULT: 100,
  } as const,

  /**
   * Database query limits
   */
  DATABASE: {
    STALE_SESSION_THRESHOLD_MS: 30000,
  } as const,
} as const;

/**
 * Cache TTL configuration
 */
export const CACHE_TTL_CONFIG = {
  /**
   * Default cache TTL for use-cache hook (5 minutes)
   */
  DEFAULT_CACHE_TTL_MS: 5 * 60 * 1000,

  /**
   * Default stale-while-revalidate setting
   */
  DEFAULT_STALE_WHILE_REVALIDATE: true,
} as const;

/**
 * Rate limit statistics configuration
 */
export const RATE_LIMIT_STATS_CONFIG = {
  /**
   * Default window for rate limit stats (1 minute)
   */
  DEFAULT_STATS_WINDOW_MS: 60 * 1000,

  /**
   * Number of top users to display in stats
   */
  TOP_USERS_LIMIT: 10,
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
 */
export const AI_SERVICE_LIMITS = {
  MAX_COST_TRACKERS: 10000,
  MAX_COST_TRACKER_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
  CLEANUP_PERCENTAGE: 0.2, // Remove 20% when at capacity
  CACHE_KEY_HASH_LENGTH: 64,
} as const;

/**
 * Rate Limiting - Additional Config
 */
export const RATE_LIMIT_VALUES = {
  MAX_REQUESTS_PER_IDENTIFIER: 1000,
} as const;

/**
 * Clarifier Agent Values
 */
export const CLARIFIER_VALUES = {
  LOG_PREVIEW_LENGTH: 100,
  INITIAL_CONFIDENCE: 0.5,
  COMPLETION_CONFIDENCE: 0.9,
} as const;

/**
 * Task Validation
 */
export const TASK_VALIDATION = {
  MAX_TITLE_LENGTH: 255,
} as const;

/**
 * Retry Configuration - Additional
 */
export const RETRY_VALUES = {
  JITTER_MULTIPLIER_MS: 1000,
} as const;
