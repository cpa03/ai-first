import { CACHE_CONFIG } from './config/cache';

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

/**
 * High-performance Cache utility with O(1) operations.
 * Optimized for high-throughput environments (e.g., Edge Runtime, Cloudflare Workers).
 *
 * Performance Improvements:
 * - O(1) LRU eviction using Map's insertion order.
 * - Amortized O(1) TTL eviction using sliding expiration and throttled cleanup.
 * - O(k) early-exit strategy for proactive cleanup.
 *
 * Behavioral Changes:
 * - Implements sliding expiration (TTL refreshes on access) to maintain chronological order.
 * - Uses pure LRU eviction based on access/update time.
 */
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
    // Apply default maxSize from centralized config
    this.maxSize = options.maxSize ?? CACHE_CONFIG.SIZE.MAXIMUM;
    this.onEvict = options.onEvict;
    this.misses = 0;
    this.totalHits = 0;
    this.lastCleanup = Date.now();
  }

  set(key: string, value: T): void {
    // Proactive cleanup is throttled to maintain amortized O(1) performance
    this.evictExpiredEntries();

    const existingEntry = this.cache.get(key);

    // If key doesn't exist and we're at capacity, evict LRU (O(1))
    if (this.maxSize && this.cache.size >= this.maxSize && !existingEntry) {
      this.evictLRU();
    }

    // Reset hits on new set to match original behavior
    if (existingEntry) {
      this.totalHits -= existingEntry.hits;
      this.cache.delete(key);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
    };

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

    // Update hits before refreshing position in Map
    entry.hits++;
    this.totalHits++;

    // SLIDING EXPIRATION: Refresh timestamp and move to end to maintain chronological order
    entry.timestamp = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

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

    // Update hits before refreshing position in Map
    entry.hits++;
    this.totalHits++;

    // SLIDING EXPIRATION: Refresh timestamp and move to end
    entry.timestamp = Date.now();
    this.cache.delete(key);
    this.cache.set(key, entry);

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

    // PERFORMANCE: Throttle proactive cleanup to avoid frequent O(N) or even O(k) scans.
    // Effectiveness: Converts O(N) amortized cost to O(1) amortized.
    if (now - this.lastCleanup < CACHE_CONFIG.CLEANUP.INTERVAL_MS) {
      return;
    }
    this.lastCleanup = now;

    // PERFORMANCE: O(k) early-exit strategy.
    // Since Map preserves insertion order and we update timestamps on access,
    // entries are sorted chronologically. We can stop scanning as soon as we
    // hit a non-expired entry.
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(key);
      } else {
        // First non-expired entry found, all subsequent entries are newer
        break;
      }
    }
  }

  private evictLRU(): void {
    // PERFORMANCE: O(1) LRU eviction using Map's insertion order.
    // The first entry in the Map is the least recently accessed/set.
    const iterator = this.cache.entries().next();
    if (iterator.done) return;

    const [key, entry] = iterator.value;

    if (this.onEvict) {
      this.onEvict(key, entry);
    }
    this.totalHits -= entry.hits;
    this.cache.delete(key);
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

    // In O(1) mode, the oldest entry is always the first one
    const iterator = this.cache.values().next();
    const oldestEntryAge = iterator.done
      ? null
      : Date.now() - iterator.value.timestamp;

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
