'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface UseCacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
  revalidate: () => Promise<void>;
} {
  const { ttl = 5 * 60 * 1000, staleWhileRevalidate = true } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Use ref to avoid dependency on fetcher function identity
  // This prevents infinite re-renders when fetcher is not memoized by caller
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const revalidate = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetcherRef.current();

      const cacheEntry: CacheEntry<T> = {
        data: result,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(cacheEntry));
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    const fetchWithCache = async () => {
      try {
        const cached = localStorage.getItem(key);

        if (cached) {
          try {
            const entry: CacheEntry<T> = JSON.parse(cached);
            const age = Date.now() - entry.timestamp;

            if (age < ttl) {
              setData(entry.data);
              setLoading(false);

              if (staleWhileRevalidate) {
                revalidate();
              }
              return;
            }

            if (staleWhileRevalidate) {
              setData(entry.data);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }

        await revalidate();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchWithCache();
  }, [key, revalidate, staleWhileRevalidate, ttl]);

  return { data, error, loading, revalidate };
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith('cache:')) {
        localStorage.removeItem(k);
      }
    });
  }
}
