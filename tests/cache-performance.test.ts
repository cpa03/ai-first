import { Cache } from '@/lib/cache';

describe('Cache Performance', () => {
  describe('Basic caching operations', () => {
    it('should cache values and retrieve them quickly', () => {
      const cache = new Cache<string>({ ttl: 5000, maxSize: 1000 });

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`);
      }
      const writeTime = performance.now() - start;

      const readStart = performance.now();
      for (let i = 0; i < 1000; i++) {
        const value = cache.get(`key${i}`);
        expect(value).toBe(`value${i}`);
      }
      const readTime = performance.now() - readStart;

      console.log(
        `Cache write time for 1000 operations: ${writeTime.toFixed(2)}ms`
      );
      console.log(
        `Cache read time for 1000 operations: ${readTime.toFixed(2)}ms`
      );
      console.log(
        `Average read per operation: ${(readTime / 1000).toFixed(4)}ms`
      );
    });

    it('should enforce TTL and evict expired entries', async () => {
      const cache = new Cache<string>({ ttl: 100, maxSize: 10 });

      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      await new Promise((resolve) => setTimeout(resolve, 150));

      const start = performance.now();
      const value = cache.get('key1');
      const getTime = performance.now() - start;

      expect(value).toBeNull();
      console.log(`TTL check time: ${getTime.toFixed(2)}ms`);
    });

    it('should evict LRU entries when max size is reached', () => {
      const cache = new Cache<string>({ ttl: 5000, maxSize: 3 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size).toBe(3);

      const start = performance.now();
      cache.set('key4', 'value4');
      const writeTime = performance.now() - start;

      expect(cache.size).toBe(3);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key4')).toBe('value4');

      console.log(`LRU eviction time: ${writeTime.toFixed(2)}ms`);
    });

    it('should track cache hits for statistics', () => {
      const cache = new Cache<string>({ ttl: 5000, maxSize: 10 });

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      for (let i = 0; i < 100; i++) {
        cache.get('key1');
      }
      for (let i = 0; i < 50; i++) {
        cache.get('key2');
      }

      const stats = cache.getStats();
      expect(stats.hits).toBe(150);

      console.log(`Cache stats: ${JSON.stringify(stats)}`);
    });
  });

  describe('Performance comparison: cached vs uncached', () => {
    it('should demonstrate performance improvement with caching', () => {
      const cache = new Cache<string>({ ttl: 5000, maxSize: 100 });

      const expensiveOperation = (key: string): string => {
        let result = '';
        for (let i = 0; i < 1000; i++) {
          result += key;
        }
        return result;
      };

      // Warm up cache first to ensure all keys are populated
      for (let i = 0; i < 10; i++) {
        const key = `key${i}`;
        cache.set(key, expensiveOperation(key));
      }

      const uncachedStart = performance.now();
      for (let i = 0; i < 100; i++) {
        expensiveOperation(`key${i % 10}`);
      }
      const uncachedTime = performance.now() - uncachedStart;

      const cachedStart = performance.now();
      for (let i = 0; i < 100; i++) {
        const key = `key${i % 10}`;
        const value = cache.get(key);
        // Cache is already warmed up, so value should always exist
        if (!value) {
          cache.set(key, expensiveOperation(key));
        }
      }
      const cachedTime = performance.now() - cachedStart;

      const improvement = ((uncachedTime - cachedTime) / uncachedTime) * 100;

      console.log(`Uncached operations time: ${uncachedTime.toFixed(2)}ms`);
      console.log(`Cached operations time: ${cachedTime.toFixed(2)}ms`);
      console.log(`Performance improvement: ${improvement.toFixed(2)}%`);

      expect(cachedTime).toBeLessThan(uncachedTime);
    });
  });
});
