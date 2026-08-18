/**
 * Cloudflare KV Cache Helper
 *
 * Provides a simple, typed API for Cloudflare KV namespace operations.
 * Follows Cloudflare best practices for edge caching with proper TTL
 * management and error handling.
 *
 * @see https://developers.cloudflare.com/kv/
 *
 * @example
 * ```ts
 * // Initialize with KV namespace binding
 * const cache = new CloudflareKV(env.CACHE_KV);
 *
 * // Get/Set with automatic JSON serialization
 * const data = await cache.get<MyData>('key');
 * await cache.set('key', data, { ttl: CF_CACHE_TTL.MEDIUM });
 *
 * // Cache-aside pattern
 * const result = await cache.getOrSet('key', async () => {
 *   return await fetchExpensiveData();
 * }, { ttl: CF_CACHE_TTL.LONG });
 * ```
 */

import { CF_CACHE_TTL, CF_LIMITS } from '../config/cloudflare-config';

/**
 * Cloudflare KV Cache Helper
 */
export class CloudflareKV {
  private kv: KVNamespace | null;
  private prefix: string;
  private onError?: (error: Error, operation: string, key: string) => void;

  /**
   * Create a new CloudflareKV instance
   * @param kv - KV namespace binding (can be null in non-edge environments)
   * @param options - Configuration options
   * @param options.prefix - Optional key prefix for namespace isolation
   * @param options.onError - Optional callback for logging KV operation errors.
   *   Useful for production debugging and observability. Errors are caught and logged,
   *   but do not break the application (graceful degradation).
   */
  constructor(
    kv: KVNamespace | undefined | null,
    options?: {
      prefix?: string;
      onError?: (error: Error, operation: string, key: string) => void;
    }
  ) {
    this.kv = kv ?? null;
    this.prefix = options?.prefix ?? '';
    this.onError = options?.onError;
  }

  /**
   * Check if KV namespace is available
   * Returns false in non-edge environments or when KV is not configured
   */
  get isAvailable(): boolean {
    return this.kv !== null;
  }

  /**
   * Build a prefixed key
   */
  private buildKey(key: string): string {
    return this.prefix ? `${this.prefix}:${key}` : key;
  }

  /**
   * Get a value from KV with automatic JSON deserialization
   * @param key - Cache key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) {
      return null;
    }

    try {
      const value = await this.kv.get(this.buildKey(key), 'json');
      return value as T | null;
    } catch (error) {
      // KV errors should not break the application
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'get',
        key
      );
      return null;
    }
  }

  /**
   * Get a value as text (no JSON parsing)
   * @param key - Cache key
   * @returns Raw string value or null if not found
   */
  async getText(key: string): Promise<string | null> {
    if (!this.kv) {
      return null;
    }

    try {
      return await this.kv.get(this.buildKey(key), 'text');
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'getText',
        key
      );
      return null;
    }
  }

  /**
   * Get a value as ArrayBuffer (for binary data)
   * @param key - Cache key
   * @returns ArrayBuffer or null if not found
   */
  async getArrayBuffer(key: string): Promise<ArrayBuffer | null> {
    if (!this.kv) {
      return null;
    }

    try {
      return await this.kv.get(this.buildKey(key), 'arrayBuffer');
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'getArrayBuffer',
        key
      );
      return null;
    }
  }

  /**
   * Set a value in KV with automatic JSON serialization
   * @param key - Cache key
   * @param value - Value to cache (will be JSON serialized)
   * @param options - Cache options including TTL
   */
  async set<T>(
    key: string,
    value: T,
    options?: {
      /** Time-to-live in seconds */
      ttl?: number;
      /** Absolute expiration Unix timestamp */
      expiration?: number;
      /** Content type hint */
      contentType?: string;
    }
  ): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const kvOptions: KVNamespacePutOptions = {};

      if (options?.ttl !== undefined) {
        kvOptions.expirationTtl = options.ttl;
      }

      if (options?.expiration !== undefined) {
        kvOptions.expiration = options.expiration;
      }

      if (options?.contentType !== undefined) {
        kvOptions.contentType = options.contentType;
      }

      await this.kv.put(this.buildKey(key), JSON.stringify(value), kvOptions);
      return true;
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'set',
        key
      );
      return false;
    }
  }

  /**
   * Set a text value in KV (no JSON serialization)
   * @param key - Cache key
   * @param value - Text value to cache
   * @param options - Cache options
   */
  async setText(
    key: string,
    value: string,
    options?: { ttl?: number; expiration?: number; contentType?: string }
  ): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const kvOptions: KVNamespacePutOptions = {};

      if (options?.ttl !== undefined) {
        kvOptions.expirationTtl = options.ttl;
      }

      if (options?.expiration !== undefined) {
        kvOptions.expiration = options.expiration;
      }

      if (options?.contentType !== undefined) {
        kvOptions.contentType = options.contentType;
      }

      await this.kv.put(this.buildKey(key), value, kvOptions);
      return true;
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'setText',
        key
      );
      return false;
    }
  }

  /**
   * Delete a key from KV
   * @param key - Cache key to delete
   */
  async delete(key: string): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      await this.kv.delete(this.buildKey(key));
      return true;
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'delete',
        key
      );
      return false;
    }
  }

  /**
   * Check if a key exists in KV
   * @param key - Cache key to check
   */
  async exists(key: string): Promise<boolean> {
    if (!this.kv) {
      return false;
    }

    try {
      const metadata = await this.kv.getWithMetadata(this.buildKey(key));
      return metadata.value !== null;
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'exists',
        key
      );
      return false;
    }
  }

  /**
   * Get a value along with its metadata from KV
   * Useful for storing and retrieving additional context with cached data
   *
   * @param key - Cache key
   * @returns Object with value and metadata, or nulls if not found
   *
   * @example
   * ```ts
   * const { value, metadata } = await cache.getWithMetadata<UserData>('user:123');
   * if (value && metadata?.cachedAt) {
   *   const age = Date.now() - metadata.cachedAt;
   * }
   * ```
   */
  async getWithMetadata<T = unknown>(
    key: string
  ): Promise<{ value: T | null; metadata: unknown | null }> {
    if (!this.kv) {
      return { value: null, metadata: null };
    }

    try {
      const result = await this.kv.getWithMetadata<T>(
        this.buildKey(key),
        'json'
      );
      return {
        value: result.value,
        metadata: result.metadata,
      };
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'getWithMetadata',
        key
      );
      return { value: null, metadata: null };
    }
  }

  /**
   * Get or set pattern - implements cache-aside
   * Returns cached value if exists, otherwise fetches, caches, and returns
   *
   * @param key - Cache key
   * @param fetcher - Function to fetch value if not cached
   * @param options - Cache options
   * @returns Cached or fetched value
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; expiration?: number }
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const value = await fetcher();

    // Cache the result (fire and forget - don't await)
    this.set(key, value, options).catch(() => {
      // Ignore cache write errors
    });

    return value;
  }

  /**
   * List keys in KV namespace
   * @param options - List options
   * @returns List of keys and metadata
   */
  async list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    keys: Array<{ name: string; expiration?: number }>;
    cursor?: string;
  } | null> {
    if (!this.kv) {
      return null;
    }

    try {
      const result = await this.kv.list({
        prefix: options?.prefix,
        limit: options?.limit ?? CF_LIMITS.KV_LIST_MAX_KEYS,
        cursor: options?.cursor,
      });

      return {
        keys: result.keys.map((k) => ({
          name: k.name,
          expiration: k.expiration,
        })),
        cursor: result.list_complete ? undefined : result.cursor,
      };
    } catch (error) {
      this.onError?.(
        error instanceof Error ? error : new Error(String(error)),
        'list',
        options?.prefix ?? ''
      );
      return null;
    }
  }
}

/**
 * Create a CloudflareKV instance from environment
 * Convenience function for use in Workers
 *
 * @param env - Environment object containing KV binding
 * @param bindingName - Name of the KV binding (default: 'CACHE_KV')
 * @param options - KV options
 */
export function createKVCache(
  env: Record<string, unknown> | undefined,
  bindingName: string = 'CACHE_KV',
  options?: {
    prefix?: string;
    onError?: (error: Error, operation: string, key: string) => void;
  }
): CloudflareKV {
  const kv = env?.[bindingName] as KVNamespace | undefined;
  return new CloudflareKV(kv, options);
}

/**
 * KV cache options for common use cases
 * Pre-configured TTL values matching CF_CACHE_TTL
 */
export const KV_CACHE_OPTIONS = {
  /** No caching (utility for conditional logic) */
  NO_STORE: { ttl: CF_CACHE_TTL.NO_STORE },
  /** Short TTL for frequently changing content */
  SHORT: { ttl: CF_CACHE_TTL.SHORT },
  /** Medium TTL for semi-static content */
  MEDIUM: { ttl: CF_CACHE_TTL.MEDIUM },
  /** Long TTL for static content */
  LONG: { ttl: CF_CACHE_TTL.LONG },
  /** Immutable TTL for versioned assets */
  IMMUTABLE: { ttl: CF_CACHE_TTL.IMMUTABLE },
} as const;
