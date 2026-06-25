import { EnvLoader } from './environment';

/**
 * Session Analytics Configuration
 * Client-side session and page time tracking configuration
 * Now supports environment variable overrides
 */
export const SESSION_ANALYTICS_CONFIG = {
  /**
   * Maximum events to queue before flushing
   * Env: SESSION_ANALYTICS_MAX_QUEUE_SIZE (default: 10)
   */
  MAX_QUEUE_SIZE: EnvLoader.number(
    'SESSION_ANALYTICS_MAX_QUEUE_SIZE',
    10,
    1,
    100
  ),

  /**
   * Flush interval in milliseconds
   * How often to flush queued events when queue is not full
   * Env: SESSION_ANALYTICS_FLUSH_INTERVAL_MS (default: 5000)
   */
  FLUSH_INTERVAL_MS: EnvLoader.number(
    'SESSION_ANALYTICS_FLUSH_INTERVAL_MS',
    5000,
    1000,
    60000
  ),
} as const;
