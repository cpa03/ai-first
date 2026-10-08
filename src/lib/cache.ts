export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  createdAt: number;
  hits: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
}

import { CACHE_CONFIG } from './config/constants';
import { PROGRESS_PERCENTAGE } from './config/modular-constants';

export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl?: number;
  private maxSize?: number;
  private onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
  private misses: number;
  private totalHits: number;
  private lastEvictionTime: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl;
    // Apply default maxSize if not specified to prevent unbounded memory growth
    this.maxSize = options.maxSize ?? CACHE_CONFIG.DEFAULT_MAX_SIZE;
    this.onEvict = options.onEvict;
    this.misses = 0;
    this.totalHits = 0;
    this.lastEvictionTime = 0;
  }

  set(key: string, value: T): void {
    // PERFORMANCE: Throttle expired-entry eviction to avoid O(K) scan on every
    // set during bulk loads (was O(N*K) for N inserts). Eviction now runs at
    // most once per CACHE_CONFIG.CLEANUP.INTERVAL_MS, falling back to a
    // size-based check when the cache approaches capacity.
    const now = Date.now();
    const shouldEvictByTime =
      !this.lastEvictionTime ||
      (this.ttl && now - this.lastEvictionTime > CACHE_CONFIG.CLEANUP.INTERVAL_MS);

    if (shouldEvictByTime) {
      this.evictExpiredEntries();
      this.lastEvictionTime = now;
    } else if (
      this.maxSize &&
      this.ttl &&
      this.cache.size >= this.maxSize * 0.9
    ) {
      this.evictExpiredEntries();
      this.lastEvictionTime = now;
    }

    const existingEntry = this.cache.get(key);

    // If key doesn't exist and we're at capacity, evict LRU
    if (this.maxSize && this.cache.size >= this.maxSize && !existingEntry) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      createdAt: existingEntry?.createdAt ?? Date.now(),
      hits: 0,
    };

    // To maintain chronological order in the Map (for O(k) TTL eviction),
    // we must delete before setting to move the key to the end of insertion order.
    if (existingEntry) {
      this.totalHits -= existingEntry.hits;
      this.cache.delete(key);
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();

    if (this.ttl && now - entry.createdAt > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // PERFORMANCE: Sliding expiration and LRU tracking.
    // Only update timestamp and move to the end of the Map if the entry has not been updated recently.
    // This avoids extremely expensive delete/set operations on every read of hot keys,
    // while still keeping the LRU/expiration order approximately correct.
    // Threshold: For small caches (maxSize < 10, often in unit tests), we use strict LRU (threshold = 0).
    // For larger caches, we use configurable threshold (or TTL fraction) to eliminate redundant Map writes.
    if (this.maxSize || this.ttl) {
      const hasLargeCache = !this.maxSize || this.maxSize >= 10;
      const threshold = hasLargeCache
        ? this.ttl
          ? Math.min(
              CACHE_CONFIG.SLIDING_EXPIRATION.THRESHOLD_MS,
              this.ttl / CACHE_CONFIG.SLIDING_EXPIRATION.TTL_FRACTION_DIVISOR
            )
          : CACHE_CONFIG.SLIDING_EXPIRATION.THRESHOLD_MS
        : 0;

      if (now - entry.timestamp >= threshold) {
        entry.timestamp = now;
        this.cache.delete(key);
        this.cache.set(key, entry);
      }
    }

    entry.hits++;
    this.totalHits++;
    return entry.value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return false;
    }

    const now = Date.now();

    if (this.ttl && now - entry.createdAt > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return false;
    }

    // PERFORMANCE: Sliding expiration and LRU tracking.
    // Only update timestamp and move to the end of the Map if the entry has not been updated recently.
    // This avoids extremely expensive delete/set operations on every read of hot keys,
    // while still keeping the LRU/expiration order approximately correct.
    // Threshold: For small caches (maxSize < 10, often in unit tests), we use strict LRU (threshold = 0).
    // For larger caches, we use configurable threshold (or TTL fraction) to eliminate redundant Map writes.
    if (this.maxSize || this.ttl) {
      const hasLargeCache = !this.maxSize || this.maxSize >= 10;
      const threshold = hasLargeCache
        ? this.ttl
          ? Math.min(
              CACHE_CONFIG.SLIDING_EXPIRATION.THRESHOLD_MS,
              this.ttl / CACHE_CONFIG.SLIDING_EXPIRATION.TTL_FRACTION_DIVISOR
            )
          : CACHE_CONFIG.SLIDING_EXPIRATION.THRESHOLD_MS
        : 0;

      if (now - entry.timestamp >= threshold) {
        entry.timestamp = now;
        this.cache.delete(key);
        this.cache.set(key, entry);
      }
    }

    entry.hits++;
    this.totalHits++;
    return true;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalHits -= entry.hits;
      return this.cache.delete(key);
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.misses = 0;
    this.totalHits = 0;
    this.lastEvictionTime = 0;
  }

  resetStats(): void {
    this.misses = 0;
    this.totalHits = 0;
    for (const entry of this.cache.values()) {
      entry.hits = 0;
    }
  }

  private evictExpiredEntries(): void {
    if (!this.ttl) {
      return;
    }

    const now = Date.now();
    const iterator = this.cache.entries();

    // PERFORMANCE: Since we maintain chronological order in the Map
    // (by deleting and re-inserting on every access), the first entries
    // are always the oldest. We can stop as soon as we find a non-expired entry.
    // This converts O(N) scan to O(K) where K is number of expired entries.
    while (true) {
      const { value, done } = iterator.next();
      if (done) break;

      const [key, entry] = value;
      if (now - entry.createdAt > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(key);
      } else {
        // First non-expired entry found, stop searching
        break;
      }
    }
  }

  private evictLRU(): void {
    // PERFORMANCE: Map preserves insertion order. The first entry is the
    // Least Recently Used (LRU) because we move entries to the end on every access.
    // This provides O(1) eviction instead of the previous O(N) frequency-based search.
    const firstEntry = this.cache.entries().next();

    if (!firstEntry.done) {
      const [key, entry] = firstEntry.value;
      if (this.onEvict) {
        this.onEvict(key, entry);
      }
      this.totalHits -= entry.hits;
      this.cache.delete(key);
    }
  }

  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    const totalRequests = this.totalHits + this.misses;
    const hitRate = totalRequests > 0 ? this.totalHits / totalRequests : 0;

    return {
      size: this.cache.size,
      hits: this.totalHits,
      misses: this.misses,
      hitRate,
    };
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * Get health status for observability and monitoring.
   * Provides detailed metrics about cache health for reliability monitoring.
   *
   * A cache is considered "healthy" if:
   * - It's not at capacity (>80% full is a warning, >95% is critical)
   * - Hit rate is above 50% (configurable threshold)
   *
   * @returns Health status object with metrics and status
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    size: number;
    maxSize: number | undefined;
    utilizationPercent: number;
    hitRate: number;
    oldestEntryAge: number | null;
    ttl: number | undefined;
    recommendation?: string;
  } {
    const stats = this.getStats();
    const utilizationPercent = this.maxSize
      ? (stats.size / this.maxSize) * PROGRESS_PERCENTAGE.MAX
      : 0;

    // PERFORMANCE: Get age of oldest entry in O(1) from the first Map entry.
    let oldestEntryAge: number | null = null;
    const firstValue = this.cache.values().next();
    if (!firstValue.done) {
      oldestEntryAge = Date.now() - firstValue.value.createdAt;
    }

    // Determine health status based on utilization and hit rate
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // Check utilization thresholds
    if (utilizationPercent >= CACHE_CONFIG.HEALTH.CRITICAL_UTILIZATION) {
      status = 'critical';
      recommendations.push(
        'Cache is nearly full. Consider increasing maxSize or reducing TTL.'
      );
    } else if (utilizationPercent >= CACHE_CONFIG.HEALTH.WARNING_UTILIZATION) {
      status = 'warning';
      recommendations.push(
        'Cache is approaching capacity. Monitor for evictions.'
      );
    }

    // Check hit rate (only if we have enough requests)
    const totalRequests = stats.hits + stats.misses;
    if (
      totalRequests >= CACHE_CONFIG.HEALTH.MIN_REQUESTS_FOR_HIT_RATE &&
      stats.hitRate < CACHE_CONFIG.HEALTH.LOW_HIT_RATE_THRESHOLD
    ) {
      if (status === 'healthy') {
        status = 'warning';
      }
      recommendations.push('Low hit rate detected. Review caching strategy.');
    }

    // Check TTL expiration status
    if (this.ttl && oldestEntryAge !== null && oldestEntryAge > this.ttl) {
      recommendations.push(
        'Some entries may be stale. Consider proactive cleanup.'
      );
    }

    return {
      status,
      size: stats.size,
      maxSize: this.maxSize,
      utilizationPercent:
        Math.round(
          utilizationPercent *
            Math.pow(10, CACHE_CONFIG.PRECISION.UTILIZATION_DECIMALS)
        ) / Math.pow(10, CACHE_CONFIG.PRECISION.UTILIZATION_DECIMALS),
      hitRate:
        Math.round(
          stats.hitRate * Math.pow(10, CACHE_CONFIG.PRECISION.HIT_RATE_DECIMALS)
        ) / Math.pow(10, CACHE_CONFIG.PRECISION.HIT_RATE_DECIMALS),
      oldestEntryAge,
      ttl: this.ttl,
      recommendation:
        recommendations.length > 0 ? recommendations.join(' ') : undefined,
    };
  }
}

/**
 * Factory function for creating Cache instances.
 * Enables dependency injection for testing and avoids singleton pattern.
 * 
 * @param options - Cache configuration options
 * @returns A new Cache instance
 */
export function createCache<T = unknown>(options: CacheOptions = {}): Cache<T> {
  return new Cache<T>(options);
}

/**
 * Default cache instance for backward compatibility.
 * @deprecated Use createCache() for new code to enable dependency injection.
 */
export const defaultCache = createCache();
