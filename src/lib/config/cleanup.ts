/**
 * Resource Cleanup Configuration
 * Centralizes cleanup and timeout settings for resource management
 * Supports environment variable overrides for containerized deployments
 */

import { EnvLoader } from './environment';

export const CLEANUP_CONFIG = {
  RESOURCE_MANAGER: {
    TASK_TIMEOUT_MS: EnvLoader.number(
      'CLEANUP_TASK_TIMEOUT_MS',
      5000,
      1000,
      30000
    ),
    DEFAULT_PRIORITY: 0,
    GRACEFUL_SHUTDOWN_TIMEOUT_MS: EnvLoader.number(
      'GRACEFUL_SHUTDOWN_TIMEOUT_MS',
      10000,
      5000,
      60000
    ),
  } as const,

  /**
   * Timeout wrapper settings
   */
  TIMEOUT: {
    /**
     * Default timeout for async operations (milliseconds)
     */
    DEFAULT_MS: 30000,

    /**
     * Quick timeout for simple operations (milliseconds)
     */
    QUICK_MS: 5000,

    /**
     * Long timeout for complex operations (milliseconds)
     */
    LONG_MS: 60000,
  } as const,

  /**
   * Abort controller settings
   */
  ABORT: {
    /**
     * Delay before forcefully aborting stuck operations (milliseconds)
     */
    FORCE_ABORT_DELAY_MS: 1000,
  } as const,

  /**
   * Memory management settings
   */
  MEMORY: {
    /**
     * Interval for memory usage checks (milliseconds)
     */
    CHECK_INTERVAL_MS: 30000,

    /**
     * Threshold for high memory warning (percentage)
     */
    HIGH_USAGE_THRESHOLD: 0.85,
  } as const,
} as const;

export type CleanupConfig = typeof CLEANUP_CONFIG;
