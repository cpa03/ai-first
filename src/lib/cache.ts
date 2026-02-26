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

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl;
    // Apply default maxSize if not specified to prevent unbounded memory growth
    this.maxSize = options.maxSize ?? CACHE_CONFIG.DEFAULT_MAX_SIZE;
    this.onEvict = options.onEvict;
    this.misses = 0;
    this.totalHits = 0;
  }

  set(key: string, value: T): void {
    // PERFORMANCE: Optimized O(K) early-stop cleanup on every set operation.
    // Since we use sliding expiration (updating timestamp on get/set), the Map
    // remains sorted by expiration time, allowing O(K) instead of O(N) scans.
    this.evictExpiredEntries();

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

    // PERFORMANCE: Sliding expiration - update timestamp and move to end of Map.
    // This keeps the Map sorted by expiration time for O(K) cleanup.
    entry.timestamp = Date.now();
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

    // PERFORMANCE: Sliding expiration - update timestamp and move to end of Map.
    // This keeps the Map sorted by expiration time for O(K) cleanup.
    entry.timestamp = Date.now();
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
    const iterator = this.cache.entries();

    // PERFORMANCE: Since we maintain chronological order in the Map
    // (by deleting and re-inserting on every access), the first entries
    // are always the oldest. We can stop as soon as we find a non-expired entry.
    // This converts O(N) scan to O(K) where K is number of expired entries.
    while (true) {
      const { value, done } = iterator.next();
      if (done) break;

      const [key, entry] = value;
      if (now - entry.timestamp > this.ttl) {
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
      ? (stats.size / this.maxSize) * 100
      : 0;

    // PERFORMANCE: Get age of oldest entry in O(1) from the first Map entry.
    let oldestEntryAge: number | null = null;
    const firstValue = this.cache.values().next();
    if (!firstValue.done) {
      oldestEntryAge = Date.now() - firstValue.value.timestamp;
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
