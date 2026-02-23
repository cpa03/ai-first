/**
 * Resource Cleanup Configuration
 * Centralizes cleanup and timeout settings for resource management
 * Supports environment variable overrides for containerized deployments
 */

import { EnvLoader } from './env-loader';

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
     * Env: CLEANUP_TIMEOUT_DEFAULT_MS (default: 30000)
     */
    DEFAULT_MS: EnvLoader.number(
      'CLEANUP_TIMEOUT_DEFAULT_MS',
      30000,
      5000,
      120000
    ),

    /**
     * Quick timeout for simple operations (milliseconds)
     * Env: CLEANUP_TIMEOUT_QUICK_MS (default: 5000)
     */
    QUICK_MS: EnvLoader.number('CLEANUP_TIMEOUT_QUICK_MS', 5000, 1000, 30000),

    /**
     * Long timeout for complex operations (milliseconds)
     * Env: CLEANUP_TIMEOUT_LONG_MS (default: 60000)
     */
    LONG_MS: EnvLoader.number('CLEANUP_TIMEOUT_LONG_MS', 60000, 10000, 300000),
  } as const,

  /**
   * Abort controller settings
   */
  ABORT: {
    /**
     * Delay before forcefully aborting stuck operations (milliseconds)
     * Env: CLEANUP_ABORT_FORCE_DELAY_MS (default: 1000)
     */
    FORCE_ABORT_DELAY_MS: EnvLoader.number(
      'CLEANUP_ABORT_FORCE_DELAY_MS',
      1000,
      100,
      10000
    ),
  } as const,

  /**
   * Memory management settings
   */
  MEMORY: {
    /**
     * Interval for memory usage checks (milliseconds)
     * Env: CLEANUP_MEMORY_CHECK_INTERVAL_MS (default: 30000)
     */
    CHECK_INTERVAL_MS: EnvLoader.number(
      'CLEANUP_MEMORY_CHECK_INTERVAL_MS',
      30000,
      5000,
      120000
    ),

    /**
     * Threshold for high memory warning (percentage)
     * Env: CLEANUP_MEMORY_HIGH_USAGE_THRESHOLD (default: 0.85)
     */
    HIGH_USAGE_THRESHOLD:
      EnvLoader.number('CLEANUP_MEMORY_HIGH_USAGE_THRESHOLD', 85, 50, 99) / 100,
  } as const,
} as const;

export type CleanupConfig = typeof CLEANUP_CONFIG;
