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

    // Update access order for LRU: delete and re-insert to move to end
    this.cache.delete(key);
    this.cache.set(key, entry);

    entry.hits++;
    this.totalHits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
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

    // Since we maintain chronological order in the Map (via delete/set),
    // we can stop as soon as we find an entry that hasn't expired.
    // This reduces complexity from O(n) to O(k).
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(key);
      } else {
        // Entries are sorted by timestamp; if this one isn't expired, none after it are.
        break;
      }
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lowestHits = Infinity;

    // Optimization: Stop searching if we find an entry with 0 hits.
    // Since Map preserves insertion order and we move entries to the end on access,
    // the first entry with 0 hits is the oldest cold entry.
    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits === 0) {
        lruKey = key;
        break;
      }

      if (entry.hits < lowestHits) {
        lowestHits = entry.hits;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      if (entry) {
        if (this.onEvict) {
          this.onEvict(lruKey, entry);
        }
        this.totalHits -= entry.hits;
        this.cache.delete(lruKey);
      }
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
