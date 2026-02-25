/**
 * Tests for use-cache React Hook
 * Target: Increase coverage to 80%+
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCache, clearCache } from '@/lib/use-cache';

// Mock dependencies
jest.mock('@/lib/config/constants', () => ({
  CACHE_TTL_CONFIG: {
    DEFAULT_CACHE_TTL_MS: 60000,
    DEFAULT_STALE_WHILE_REVALIDATE: true,
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('basic functionality', () => {
    it('should initialize with null data and loading true', async () => {
      const fetcher = jest.fn().mockResolvedValue({ test: 'data' });

      const { result } = renderHook(() =>
        useCache('test-key', fetcher, { ttl: 60000 })
      );

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should call fetcher if no cache exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const fetcher = jest.fn().mockResolvedValue({ test: 'data' });

      const { result } = renderHook(() =>
        useCache('test-key', fetcher, { ttl: 60000 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetcher).toHaveBeenCalled();
      expect(result.current.data).toEqual({ test: 'data' });
    });
  });

  describe('error handling', () => {
    it('should handle fetcher errors', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      const error = new Error('Fetch failed');
      const fetcher = jest.fn().mockRejectedValue(error);

      const { result } = renderHook(() =>
        useCache('test-key', fetcher, { ttl: 60000 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.data).toBeNull();
    });

    it('should handle invalid JSON in cache', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      const fetcher = jest.fn().mockResolvedValue({ test: 'data' });

      const { result } = renderHook(() =>
        useCache('test-key', fetcher, { ttl: 60000 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(fetcher).toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear specific cache key', () => {
      clearCache('test-key');

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
