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
} as const;
