'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CACHE_TTL_CONFIG } from './config/constants';

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
  const {
    ttl = CACHE_TTL_CONFIG.DEFAULT_CACHE_TTL_MS,
    staleWhileRevalidate = CACHE_TTL_CONFIG.DEFAULT_STALE_WHILE_REVALIDATE,
  } = options;

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
    let isMounted = true;
    let abortController: AbortController | null = null;

    const fetchWithCache = async () => {
      abortController = new AbortController();

      try {
        if (abortController.signal.aborted) {
          return;
        }

        const cached = localStorage.getItem(key);

        if (cached) {
          try {
            const entry: CacheEntry<T> = JSON.parse(cached);
            const age = Date.now() - entry.timestamp;

            if (age < ttl) {
              if (isMounted && !abortController.signal.aborted) {
                setData(entry.data);
                setLoading(false);
              }

              if (
                staleWhileRevalidate &&
                isMounted &&
                !abortController.signal.aborted
              ) {
                try {
                  const freshResult = await fetcherRef.current();
                  if (isMounted && !abortController.signal.aborted) {
                    const newEntry: CacheEntry<T> = {
                      data: freshResult,
                      timestamp: Date.now(),
                    };
                    localStorage.setItem(key, JSON.stringify(newEntry));
                    setData(freshResult);
                    setError(null);
                  }
                } catch (err) {
                  if (isMounted && !abortController.signal.aborted) {
                    setError(
                      err instanceof Error ? err : new Error('Unknown error')
                    );
                  }
                }
              }
              return;
            }

            if (
              staleWhileRevalidate &&
              isMounted &&
              !abortController.signal.aborted
            ) {
              setData(entry.data);
            }
          } catch {
            localStorage.removeItem(key);
          }
        }

        if (isMounted && !abortController.signal.aborted) {
          await revalidate();
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    };

    fetchWithCache();

    return () => {
      isMounted = false;
      if (abortController) {
        abortController.abort();
      }
    };
  }, [key, ttl, staleWhileRevalidate, revalidate]);

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
