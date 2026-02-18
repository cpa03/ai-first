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

    /**
     * Maximum time allowed for graceful shutdown before force exit (milliseconds)
     * After this time, the process will exit regardless of cleanup completion
     * This is critical for containerized environments (Kubernetes, Docker)
     * that send SIGKILL after a grace period (typically 30s)
     * Default: 10000ms (10 seconds) to allow time for cleanup + force exit
     */
    GRACEFUL_SHUTDOWN_TIMEOUT_MS: 10000,
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
