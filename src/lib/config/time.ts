import { EnvLoader } from './environment';

export const TIME_UNITS = {
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

export const CACHE_TTL = {
  SHORT: TIME_UNITS.MINUTE,
  STANDARD: 5 * TIME_UNITS.MINUTE,
  MEDIUM: 10 * TIME_UNITS.MINUTE,
  LONG: TIME_UNITS.HOUR,
  EXTENDED: TIME_UNITS.DAY,
  WEEKLY: TIME_UNITS.WEEK,
  AI_RESPONSE: 5 * TIME_UNITS.MINUTE,
  COST_TRACKING: TIME_UNITS.MINUTE,
} as const;

export const RATE_LIMIT_WINDOWS = {
  DEFAULT: TIME_UNITS.MINUTE,
  SHORT: 5 * TIME_UNITS.SECOND,
  STANDARD: TIME_UNITS.MINUTE,
  LONG: TIME_UNITS.HOUR,
} as const;

export const RETRY_DELAYS = {
  INITIAL: EnvLoader.number(
    'RETRY_DELAY_INITIAL_MS',
    TIME_UNITS.SECOND,
    100,
    60000
  ),
  MAX: EnvLoader.number(
    'RETRY_DELAY_MAX_MS',
    10 * TIME_UNITS.SECOND,
    1000,
    300000
  ),
  POLLING: EnvLoader.number('RETRY_DELAY_POLLING_MS', 100, 10, 1000),
} as const;

export const UI_DURATIONS = {
  FAST: EnvLoader.number('UI_DURATION_FAST_MS', 150, 50, 1000),
  NORMAL: EnvLoader.number('UI_DURATION_NORMAL_MS', 300, 50, 2000),
  SLOW: EnvLoader.number('UI_DURATION_SLOW_MS', 500, 100, 5000),
  TOAST: EnvLoader.number('UI_DURATION_TOAST_MS', 3000, 1000, 10000),
  TOOLTIP: EnvLoader.number('UI_DURATION_TOOLTIP_MS', 300, 50, 2000),
  COPY_FEEDBACK: EnvLoader.number(
    'UI_DURATION_COPY_FEEDBACK_MS',
    2000,
    500,
    10000
  ),
  BLUEPRINT_GENERATION: EnvLoader.number(
    'UI_DURATION_BLUEPRINT_MS',
    2000,
    0,
    10000
  ),
  ALERT_EXIT: EnvLoader.number('UI_DURATION_ALERT_EXIT_MS', 200, 50, 1000),
  ERROR_RELOAD: EnvLoader.number(
    'UI_DURATION_ERROR_RELOAD_MS',
    3000,
    1000,
    30000
  ),
  ANIMATED_COUNTER: EnvLoader.number(
    'UI_DURATION_ANIMATED_COUNTER_MS',
    100,
    50,
    1000
  ),
} as const;

export const CIRCUIT_BREAKER_TIMES = {
  DEFAULT_RESET: EnvLoader.number(
    'CB_DEFAULT_RESET_MS',
    TIME_UNITS.MINUTE,
    5000,
    600000
  ),
  MONITORING_PERIOD: EnvLoader.number(
    'CB_MONITORING_PERIOD_MS',
    10 * TIME_UNITS.SECOND,
    1000,
    60000
  ),
  OPENAI_RESET: EnvLoader.number(
    'CB_OPENAI_RESET_MS',
    TIME_UNITS.MINUTE,
    5000,
    600000
  ),
  GITHUB_RESET: EnvLoader.number(
    'CB_GITHUB_RESET_MS',
    30 * TIME_UNITS.SECOND,
    5000,
    300000
  ),
  NOTION_RESET: EnvLoader.number(
    'CB_NOTION_RESET_MS',
    30 * TIME_UNITS.SECOND,
    5000,
    300000
  ),
  TRELLO_RESET: EnvLoader.number(
    'CB_TRELLO_RESET_MS',
    20 * TIME_UNITS.SECOND,
    5000,
    120000
  ),
  SUPABASE_RESET: EnvLoader.number(
    'CB_SUPABASE_RESET_MS',
    TIME_UNITS.MINUTE,
    5000,
    600000
  ),
} as const;

export const API_TIMEOUTS = {
  QUICK: EnvLoader.number(
    'API_TIMEOUT_LEGACY_QUICK_MS',
    5 * TIME_UNITS.SECOND,
    500,
    60000
  ),
  STANDARD: EnvLoader.number(
    'API_TIMEOUT_LEGACY_STANDARD_MS',
    10 * TIME_UNITS.SECOND,
    1000,
    120000
  ),
  DEFAULT: EnvLoader.number(
    'API_TIMEOUT_LEGACY_DEFAULT_MS',
    30 * TIME_UNITS.SECOND,
    1000,
    300000
  ),
  LONG: EnvLoader.number(
    'API_TIMEOUT_LEGACY_LONG_MS',
    30 * TIME_UNITS.SECOND,
    5000,
    600000
  ),
  EXTENDED: EnvLoader.number(
    'API_TIMEOUT_LEGACY_EXTENDED_MS',
    TIME_UNITS.MINUTE,
    10000,
    3600000
  ),
  OPENAI: EnvLoader.number(
    'API_TIMEOUT_LEGACY_OPENAI_MS',
    TIME_UNITS.MINUTE,
    5000,
    300000
  ),
  NOTION: EnvLoader.number(
    'API_TIMEOUT_LEGACY_NOTION_MS',
    30 * TIME_UNITS.SECOND,
    5000,
    300000
  ),
  TRELLO: EnvLoader.number(
    'API_TIMEOUT_LEGACY_TRELLO_MS',
    15 * TIME_UNITS.SECOND,
    1000,
    120000
  ),
  GITHUB: EnvLoader.number(
    'API_TIMEOUT_LEGACY_GITHUB_MS',
    30 * TIME_UNITS.SECOND,
    5000,
    300000
  ),
  DATABASE: EnvLoader.number(
    'API_TIMEOUT_LEGACY_DATABASE_MS',
    10 * TIME_UNITS.SECOND,
    1000,
    120000
  ),
} as const;

/**
 * Time Conversion Constants for Relative Time Formatting
 * Centralizes magic numbers used in relative time calculations (e.g., "5 minutes ago")
 */
export const TIME_CONVERSION = {
  /** Seconds per minute */
  SECONDS_PER_MINUTE: 60,
  /** Minutes per hour */
  MINUTES_PER_HOUR: 60,
  /** Hours per day */
  HOURS_PER_DAY: 24,
  /** Days per week */
  DAYS_PER_WEEK: 7,
  /** Days per month (approximate) */
  DAYS_PER_MONTH: 30,
  /** Days per year (approximate) */
  DAYS_PER_YEAR: 365,
} as const;

/**
 * External Rate Limit Cleanup Configuration
 * Centralizes cleanup intervals for external rate limit tracking
 */
export const EXTERNAL_RATE_LIMIT_TIMING = {
  CLEANUP_INTERVAL: EnvLoader.number(
    'EXTERNAL_RATE_LIMIT_CLEANUP_MS',
    5 * TIME_UNITS.MINUTE,
    60000,
    3600000
  ),
} as const;

/**
 * AI Token Estimation Configuration
 * Centralizes magic numbers for token estimation from text
 */
export const AI_TOKEN_ESTIMATION = {
  CHARS_PER_TOKEN: EnvLoader.number('AI_TOKEN_CHARS_PER_TOKEN', 4, 1, 10),
} as const;

export type TimeUnits = typeof TIME_UNITS;
export type CacheTTL = typeof CACHE_TTL;
export type RateLimitWindows = typeof RATE_LIMIT_WINDOWS;
export type RetryDelays = typeof RETRY_DELAYS;
export type UIDurations = typeof UI_DURATIONS;
export type CircuitBreakerTimes = typeof CIRCUIT_BREAKER_TIMES;
export type APITimeouts = typeof API_TIMEOUTS;
export type TimeConversion = typeof TIME_CONVERSION;
export type ExternalRateLimitTiming = typeof EXTERNAL_RATE_LIMIT_TIMING;
export type AiTokenEstimation = typeof AI_TOKEN_ESTIMATION;
