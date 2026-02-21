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
    const existingEntry = this.cache.get(key);

    // PERFORMANCE: Only evict if we're at capacity and adding a new key.
    // This defers the O(N) TTL check until absolutely necessary.
    if (this.maxSize && this.cache.size >= this.maxSize && !existingEntry) {
      // PERFORMANCE: Further throttle TTL eviction to once per 10% of TTL or 1 min.
      // This makes the average complexity O(1) even when the cache is full.
      const now = Date.now();
      const cleanupInterval = Math.min(this.ttl || 60000, 60000) / 10;

      if (now - this.lastCleanup > cleanupInterval) {
        this.evictExpiredEntries();
        this.lastCleanup = now;
      }

      // If still at capacity (or we skipped TTL cleanup), use O(1) LRU eviction.
      if (this.cache.size >= this.maxSize) {
        this.evictLRU();
      }
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

    // PERFORMANCE: Delete expired entries directly during iteration.
    // JS Map preserves insertion order and allows deletion during iteration.
    // This avoids allocating an intermediate array of keys.
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

    // PERFORMANCE: Use Map's insertion order to find the oldest entry with the fewest hits.
    // Since we move entries to the end on access, the beginning of the Map has the oldest entries.
    // We stop searching immediately if we find an entry with 0 hits (the common case for new data).
    for (const [key, entry] of this.cache) {
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
}
