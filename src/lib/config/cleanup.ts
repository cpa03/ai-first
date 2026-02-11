/**
 * Resource Cleanup Configuration
 * Centralizes cleanup and timeout settings for resource management
 */

export const CLEANUP_CONFIG = {
  /**
   * Resource cleanup manager settings
   */
  RESOURCE_MANAGER: {
    /**
     * Timeout for individual cleanup tasks (milliseconds)
     * If a cleanup task exceeds this time, it will be aborted
     */
    TASK_TIMEOUT_MS: 5000,

    /**
     * Default priority for cleanup tasks (higher = executed first)
     */
    DEFAULT_PRIORITY: 0,
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
