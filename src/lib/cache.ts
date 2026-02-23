export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
}

import { CACHE_CONFIG } from './config/constants';

export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl?: number;
  private maxSize?: number;
  private onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
  private misses: number;
  private totalHits: number;
  private lastCleanup: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl;
    // Apply default maxSize if not specified to prevent unbounded memory growth
    this.maxSize = options.maxSize ?? CACHE_CONFIG.DEFAULT_MAX_SIZE;
    this.onEvict = options.onEvict;
    this.misses = 0;
    this.totalHits = 0;
    this.lastCleanup = Date.now();
  }

  set(key: string, value: T): void {
    // PERFORMANCE: Throttle proactive cleanup to avoid O(N) scans on every set() call.
    // Expired entries are still handled on-access in get() and has() methods.
    const now = Date.now();
    if (now - this.lastCleanup > CACHE_CONFIG.CLEANUP_INTERVAL_MS) {
      this.evictExpiredEntries();
      this.lastCleanup = now;
    }

    const existingEntry = this.cache.get(key);

    // If key doesn't exist and we're at capacity, evict LRU
    if (this.maxSize && this.cache.size >= this.maxSize && !existingEntry) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
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

    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access order for LRU: delete and re-insert to move to end
    this.cache.delete(key);
    this.cache.set(key, entry);

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

    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return false;
    }

    // Update access order for LRU: delete and re-insert to move to end
    this.cache.delete(key);
    this.cache.set(key, entry);

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

    // PERFORMANCE: Delete expired entries directly during iteration to avoid O(N) allocation
    // and the overhead of a second loop. In JavaScript, it is safe to delete keys
    // from a Map while iterating over its entries.
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruEntry: CacheEntry<T> | null = null;
    let lowestHits = Infinity;

    // Optimization: Stop searching if we find an entry with 0 hits.
    // Since Map preserves insertion order and we move entries to the end on access,
    // the first entry with 0 hits is the oldest cold entry.
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits === 0) {
        lruKey = key;
        lruEntry = entry;
        break;
      }

      if (entry.hits < lowestHits) {
        lowestHits = entry.hits;
        lruKey = key;
        lruEntry = entry;
      }
    }

    if (lruKey && lruEntry) {
      if (this.onEvict) {
        this.onEvict(lruKey, lruEntry);
      }
      this.totalHits -= lruEntry.hits;
      this.cache.delete(lruKey);
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
      ? (stats.size / this.maxSize) * 100
      : 0;

    // Calculate age of oldest entry
    let oldestEntryAge: number | null = null;
    for (const entry of this.cache.values()) {
      const age = Date.now() - entry.timestamp;
      if (oldestEntryAge === null || age > oldestEntryAge) {
        oldestEntryAge = age;
      }
    }

    // Determine health status based on utilization and hit rate
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    // Check utilization thresholds
    if (utilizationPercent >= 95) {
      status = 'critical';
      recommendations.push(
        'Cache is nearly full. Consider increasing maxSize or reducing TTL.'
      );
    } else if (utilizationPercent >= 80) {
      status = 'warning';
      recommendations.push(
        'Cache is approaching capacity. Monitor for evictions.'
      );
    }

    // Check hit rate (only if we have enough requests)
    const totalRequests = stats.hits + stats.misses;
    if (totalRequests >= 100 && stats.hitRate < 0.5) {
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
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      hitRate: Math.round(stats.hitRate * 10000) / 10000,
      oldestEntryAge,
      ttl: this.ttl,
      recommendation:
        recommendations.length > 0 ? recommendations.join(' ') : undefined,
    };
  }
}
