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
} as const;
