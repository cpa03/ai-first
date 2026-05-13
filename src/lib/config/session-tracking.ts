/**
 * Session Tracking Configuration
 *
 * Extracted from useSessionDuration hook to improve modularity.
 * All session tracking related configuration values are now centralized
 * and can be overridden via environment variables.
 */

import { EnvLoader } from './environment';

/**
 * Configuration for session duration tracking
 */
export const SESSION_TRACKING_CONFIG = {
  /**
   * Minimum time in milliseconds before tracking a page visit.
   * Filters out quick navigations that don't represent meaningful engagement.
   *
   * Env: SESSION_TRACKING_MIN_PAGE_TIME_MS
   * Default: 1000 (1 second)
   */
  MIN_PAGE_TIME_MS: EnvLoader.number(
    'SESSION_TRACKING_MIN_PAGE_TIME_MS',
    1000,
    0,
    60000
  ),

  /**
   * Whether session tracking is enabled.
   *
   * Env: SESSION_TRACKING_ENABLED
   * Default: true in non-test environments
   */
  ENABLED: EnvLoader.boolean(
    'SESSION_TRACKING_ENABLED',
    process.env.NODE_ENV !== 'test'
  ),

  /**
   * Maximum session duration to track (in milliseconds).
   * Prevents tracking of abnormally long sessions which may indicate issues.
   *
   * Env: SESSION_TRACKING_MAX_DURATION_MS
   * Default: 3600000 (1 hour)
   */
  MAX_DURATION_MS: EnvLoader.number(
    'SESSION_TRACKING_MAX_DURATION_MS',
    3600000,
    60000,
    86400000
  ),
} as const;

export type SessionTrackingConfig = typeof SESSION_TRACKING_CONFIG;
