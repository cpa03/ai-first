/**
 * Session Tracking Configuration
 *
 * Extracted from useSessionDuration hook to improve modularity.
 * All session tracking related configuration values are now centralized
 * and can be overridden via environment variables.
 */

import { EnvLoader, isTest } from './environment';

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
  ENABLED: EnvLoader.boolean('SESSION_TRACKING_ENABLED', !isTest),

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

/**
 * Configuration for clarification session timer
 * Extracted from useClarificationSession hook for modularity
 */
export const CLARIFICATION_TIMER_CONFIG = {
  /**
   * Timer update interval in milliseconds.
   * How often the elapsed time counter updates during clarification flow.
   *
   * Env: CLARIFICATION_TIMER_INTERVAL_MS
   * Default: 1000 (1 second)
   */
  INTERVAL_MS: EnvLoader.number(
    'CLARIFICATION_TIMER_INTERVAL_MS',
    1000,
    100,
    5000
  ),

  /**
   * Minimum time between question transitions in milliseconds.
   * Prevents rapid-fire transitions that could confuse users.
   *
   * Env: CLARIFICATION_MIN_TRANSITION_MS
   * Default: 500 (0.5 seconds)
   */
  MIN_TRANSITION_MS: EnvLoader.number(
    'CLARIFICATION_MIN_TRANSITION_MS',
    500,
    100,
    2000
  ),

  /**
   * Duration of the estimate pulse animation in milliseconds.
   * Visual cue when estimated time remaining changes.
   *
   * Env: CLARIFICATION_PULSE_DURATION_MS
   * Default: 600 (0.6 seconds)
   */
  PULSE_DURATION_MS: EnvLoader.number(
    'CLARIFICATION_PULSE_DURATION_MS',
    600,
    200,
    2000
  ),
} as const;

export type SessionTrackingConfig = typeof SESSION_TRACKING_CONFIG;
export type ClarificationTimerConfig = typeof CLARIFICATION_TIMER_CONFIG;
