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

export class Cache<T = unknown> {
  private cache: Map<string, CacheEntry<T>>;
  private ttl?: number;
  private maxSize?: number;
  private onEvict?: (key: string, entry: CacheEntry<unknown>) => void;
  private misses: number;

  constructor(options: CacheOptions = {}) {
    this.cache = new Map();
    this.ttl = options.ttl;
    this.maxSize = options.maxSize;
    this.onEvict = options.onEvict;
    this.misses = 0;
  }

  set(key: string, value: T): void {
    this.evictExpiredEntries();

    if (
      this.maxSize &&
      this.cache.size >= this.maxSize &&
      !this.cache.has(key)
    ) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      hits: 0,
    };

    // Move to end of Map to maintain chronological order for O(k) eviction
    this.cache.delete(key);
    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (this.ttl && Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.misses = 0;
  }

  resetStats(): void {
    this.misses = 0;
    for (const entry of this.cache.values()) {
      entry.hits = 0;
    }
  }

  private evictExpiredEntries(): void {
    if (!this.ttl) {
      return;
    }

    const now = Date.now();

    // Since we maintain insertion order in set(), entries are in chronological order.
    // We can stop at the first non-expired entry, making this O(k) instead of O(n).
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        if (this.onEvict) {
          this.onEvict(key, entry);
        }
        this.cache.delete(key);
      } else {
        break;
      }
    }
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let lowestHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < lowestHits) {
        lowestHits = entry.hits;
        lruKey = key;

        // Optimization: if we found an entry with 0 hits, it's a minimum and
        // since Map is in chronological order, the first one found is the oldest.
        if (lowestHits === 0) break;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      if (entry && this.onEvict) {
        this.onEvict(lruKey, entry);
      }
      this.cache.delete(lruKey);
    }
  }

  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  } {
    let totalHits = 0;
    for (const entry of this.cache.values()) {
      totalHits += entry.hits;
    }

    const totalRequests = totalHits + this.misses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      size: this.cache.size,
      hits: totalHits,
      misses: this.misses,
      hitRate,
    };
  }

  get size(): number {
    return this.cache.size;
  }
}
