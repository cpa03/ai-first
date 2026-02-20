/**
 * External API Rate Limit Tracker
 *
 * Tracks rate limit headers from external API responses and provides
 * proactive throttling to prevent hitting rate limits.
 *
 * Addresses issue #878: Missing rate limiting and throttling management
 * for external API integrations.
 */

import { createLogger } from './logger';
import { resourceCleanupManager } from './resource-cleanup';

const logger = createLogger('ExternalRateLimit');

/**
 * Rate limit information extracted from API response headers
 */
export interface ExternalRateLimitInfo {
  /** Service identifier (e.g., 'openai', 'github', 'notion', 'trello') */
  service: string;
  /** Remaining requests in current window */
  remaining: number;
  /** Total requests allowed in window */
  limit: number;
  /** Unix timestamp when the rate limit resets */
  resetTime: number;
  /** When this info was captured */
  capturedAt: number;
}

/**
 * Configuration for external rate limit tracking
 */
export interface ExternalRateLimitConfig {
  /** Threshold percentage (0-1) to start throttling (default: 0.2 = 20% remaining) */
  throttleThreshold: number;
  /** Maximum age of rate limit info before considering it stale (ms) */
  maxAgeMs: number;
  /** Maximum number of services to track (memory prevention) */
  maxServices: number;
}

/**
 * Service-specific rate limit header mappings
 * Different APIs use different header names for rate limit info
 */
const RATE_LIMIT_HEADERS: Record<
  string,
  {
    remaining: string[];
    limit: string[];
    reset: string[];
  }
> = {
  openai: {
    remaining: ['x-ratelimit-remaining-requests', 'x-ratelimit-remaining'],
    limit: ['x-ratelimit-limit-requests', 'x-ratelimit-limit'],
    reset: ['x-ratelimit-reset-requests', 'x-ratelimit-reset'],
  },
  github: {
    remaining: ['x-ratelimit-remaining'],
    limit: ['x-ratelimit-limit'],
    reset: ['x-ratelimit-reset'],
  },
  notion: {
    remaining: ['x-ratelimit-remaining'],
    limit: ['x-ratelimit-limit'],
    reset: ['x-ratelimit-reset'],
  },
  trello: {
    remaining: ['x-rate-limit-api-key-remaining'],
    limit: ['x-rate-limit-api-key-limit'],
    reset: ['x-rate-limit-api-key-reset'],
  },
};

/**
 * Default configuration for rate limit tracking
 */
const DEFAULT_CONFIG: ExternalRateLimitConfig = {
  throttleThreshold: 0.2, // Start throttling when 20% or less remaining
  maxAgeMs: 60 * 60 * 1000, // 1 hour
  maxServices: 20,
};

/**
 * External API Rate Limit Tracker
 *
 * Singleton class that tracks rate limit information from external API responses.
 */
class ExternalRateLimitTracker {
  private rateLimitStore = new Map<string, ExternalRateLimitInfo>();
  private config: ExternalRateLimitConfig;
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<ExternalRateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // RELIABILITY: Only start cleanup interval in production to avoid open handles in tests
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'production' &&
      !process.env.JEST_WORKER_ID &&
      !process.env.VITEST_WORKER_ID
    ) {
      this.startCleanupInterval();

      resourceCleanupManager.register('external-rate-limit-cleanup', () =>
        this.cleanup()
      );
    }
  }

  /**
   * Extract rate limit info from API response headers
   */
  extractRateLimitInfo(
    service: string,
    headers: Headers | Record<string, string | undefined>
  ): ExternalRateLimitInfo | null {
    const headerConfig = RATE_LIMIT_HEADERS[service.toLowerCase()];
    if (!headerConfig) {
      logger.debug(`No header mapping for service: ${service}`);
      return null;
    }

    const getHeader = (names: string[]): string | null => {
      for (const name of names) {
        let value: string | null = null;
        if (headers instanceof Headers) {
          value = headers.get(name);
        } else {
          value = headers[name] ?? headers[name.toLowerCase()] ?? null;
        }
        if (value) return value;
      }
      return null;
    };

    const remainingStr = getHeader(headerConfig.remaining);
    const limitStr = getHeader(headerConfig.limit);
    const resetStr = getHeader(headerConfig.reset);

    if (!remainingStr || !limitStr) {
      logger.debug(
        `Missing rate limit headers for ${service}: remaining=${remainingStr}, limit=${limitStr}`
      );
      return null;
    }

    const remaining = parseInt(remainingStr, 10);
    const limit = parseInt(limitStr, 10);
    // Reset time can be either a Unix timestamp or seconds until reset
    let resetTime: number;
    if (resetStr) {
      const resetValue = parseInt(resetStr, 10);
      // GitHub uses Unix timestamp, OpenAI uses seconds until reset
      // If the value is less than a reasonable timestamp (year 2020), it's probably seconds
      resetTime =
        resetValue < 1577836800
          ? Date.now() + resetValue * 1000
          : resetValue * 1000;
    } else {
      // Default to 1 hour from now if no reset header
      resetTime = Date.now() + 60 * 60 * 1000;
    }

    if (isNaN(remaining) || isNaN(limit)) {
      logger.warn(
        `Invalid rate limit values for ${service}: remaining=${remainingStr}, limit=${limitStr}`
      );
      return null;
    }

    return {
      service: service.toLowerCase(),
      remaining,
      limit,
      resetTime,
      capturedAt: Date.now(),
    };
  }

  /**
   * Update rate limit info for a service
   */
  updateRateLimit(info: ExternalRateLimitInfo): void {
    if (
      this.rateLimitStore.size >= this.config.maxServices &&
      !this.rateLimitStore.has(info.service)
    ) {
      // Remove at least 1 entry, up to 20% of max
      const toRemove = Math.max(1, Math.floor(this.config.maxServices * 0.2));
      this.cleanupOldestEntries(toRemove);
    }

    this.rateLimitStore.set(info.service, info);
    logger.debug(
      `Updated rate limit for ${info.service}: ${info.remaining}/${info.limit} remaining, resets at ${new Date(info.resetTime).toISOString()}`
    );
  }

  /**
   * Get rate limit info for a service
   */
  getRateLimitInfo(service: string): ExternalRateLimitInfo | null {
    const info = this.rateLimitStore.get(service.toLowerCase());
    if (!info) return null;

    // Check if info is stale
    if (Date.now() - info.capturedAt > this.config.maxAgeMs) {
      this.rateLimitStore.delete(service.toLowerCase());
      return null;
    }

    return info;
  }

  /**
   * Check if we should throttle requests to a service
   * Returns true if the service is approaching its rate limit
   */
  shouldThrottle(service: string): boolean {
    const info = this.getRateLimitInfo(service);
    if (!info) return false;

    // Check if reset time has passed
    if (Date.now() > info.resetTime) {
      this.rateLimitStore.delete(service.toLowerCase());
      return false;
    }

    // Check if remaining is below threshold
    const remainingRatio = info.remaining / info.limit;
    return remainingRatio <= this.config.throttleThreshold;
  }

  /**
   * Get the time in milliseconds until we can make requests again
   * Returns 0 if no throttle needed, or the wait time in ms
   */
  getThrottleWaitTime(service: string): number {
    const info = this.getRateLimitInfo(service);
    if (!info) return 0;

    if (info.remaining > 0 && !this.shouldThrottle(service)) {
      return 0;
    }

    const waitTime = info.resetTime - Date.now();
    return Math.max(0, waitTime);
  }

  /**
   * Get all current rate limit info
   */
  getAllRateLimits(): ExternalRateLimitInfo[] {
    return Array.from(this.rateLimitStore.values());
  }

  /**
   * Clear all rate limit info (useful for testing)
   */
  clear(): void {
    this.rateLimitStore.clear();
  }

  /**
   * Get statistics about rate limit tracking
   */
  getStats(): {
    servicesTracked: number;
    services: Array<{ service: string; remaining: number; limit: number }>;
  } {
    return {
      servicesTracked: this.rateLimitStore.size,
      services: this.getAllRateLimits().map((info) => ({
        service: info.service,
        remaining: info.remaining,
        limit: info.limit,
      })),
    };
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): void {
    const now = Date.now();
    for (const [service, info] of this.rateLimitStore.entries()) {
      // Remove if info is stale or reset time has passed
      if (
        now - info.capturedAt > this.config.maxAgeMs ||
        now > info.resetTime
      ) {
        this.rateLimitStore.delete(service);
      }
    }
  }

  /**
   * Start periodic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupIntervalId) return;

    this.cleanupIntervalId = setInterval(
      () => this.cleanupExpired(),
      5 * 60 * 1000
    );

    if (
      this.cleanupIntervalId &&
      typeof (this.cleanupIntervalId as NodeJS.Timeout).unref === 'function'
    ) {
      (this.cleanupIntervalId as NodeJS.Timeout).unref();
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.cleanupIntervalId) {
      clearInterval(this.cleanupIntervalId);
      this.cleanupIntervalId = null;
    }
    this.rateLimitStore.clear();
  }

  /**
   * Remove oldest entries (for memory management)
   */
  private cleanupOldestEntries(count: number): void {
    const entries = Array.from(this.rateLimitStore.entries());
    // Sort by capturedAt ascending (oldest first)
    entries.sort((a, b) => a[1].capturedAt - b[1].capturedAt);

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.rateLimitStore.delete(entries[i][0]);
    }
  }
}

// Singleton instance
let trackerInstance: ExternalRateLimitTracker | null = null;

/**
 * Get the singleton instance of the rate limit tracker
 */
export function getExternalRateLimitTracker(
  config?: Partial<ExternalRateLimitConfig>
): ExternalRateLimitTracker {
  if (!trackerInstance) {
    trackerInstance = new ExternalRateLimitTracker(config);
  }
  return trackerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetExternalRateLimitTracker(): void {
  if (trackerInstance) {
    trackerInstance.cleanup();
    trackerInstance = null;
  }
}

/**
 * Convenience function to extract and update rate limit info from a response
 */
export function captureRateLimit(
  service: string,
  headers: Headers | Record<string, string | undefined>
): ExternalRateLimitInfo | null {
  const tracker = getExternalRateLimitTracker();
  const info = tracker.extractRateLimitInfo(service, headers);
  if (info) {
    tracker.updateRateLimit(info);
  }
  return info;
}

/**
 * Convenience function to check if should throttle before making a request
 */
export function shouldThrottleRequest(service: string): {
  throttle: boolean;
  waitTimeMs: number;
  remaining: number | null;
} {
  const tracker = getExternalRateLimitTracker();
  const info = tracker.getRateLimitInfo(service);

  return {
    throttle: tracker.shouldThrottle(service),
    waitTimeMs: tracker.getThrottleWaitTime(service),
    remaining: info?.remaining ?? null,
  };
}
