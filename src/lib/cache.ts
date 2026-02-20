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
    // PERFORMANCE: Call evictExpiredEntries on every set to keep cache clean.
    // It remains O(1) in the common case due to chronological optimization.
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

    const now = Date.now();
    if (this.ttl && now - entry.timestamp > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access order for LRU and TTL: delete and re-insert to move to end.
    // PERFORMANCE: By refreshing the timestamp on access, we maintain a sliding window
    // expiration policy where LRU order matches chronological order. This allows
    // O(1) eviction for both capacity and TTL.
    this.cache.delete(key);
    entry.timestamp = now;
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

    const now = Date.now();
    if (this.ttl && now - entry.timestamp > this.ttl) {
      this.totalHits -= entry.hits;
      this.cache.delete(key);
      this.misses++;
      return false;
    }

    // Update access order for LRU and TTL
    this.cache.delete(key);
    entry.timestamp = now;
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

    // PERFORMANCE: Since entries are added chronologically and TTL is constant,
    // we only need to check from the beginning of the Map.
    // This makes the common case (no expired entries) O(1).
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(key);
      } else {
        // Since entries are chronologically sorted, no further entries can be expired
        break;
      }
    }
  }

  private evictLRU(): void {
    // PERFORMANCE: Take the first entry from the Map (Least Recently Used).
    // This is true O(1) instead of O(N) searching for hits. Since we move entries
    // to the end of the Map on every get() and set(), the first entry is
    // guaranteed to be the least recently accessed.
    const iterator = this.cache.entries();
    const result = iterator.next();

    if (result.done) return;

    const [lruKey, lruEntry] = result.value;

    if (this.onEvict) {
      this.onEvict(lruKey, lruEntry);
    }
    this.totalHits -= lruEntry.hits;
    this.cache.delete(lruKey);
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
}
