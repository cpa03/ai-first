import { Cache } from '@/lib/cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    cache = new Cache<string>({ ttl: 5000, maxSize: 100 });
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      const defaultCache = new Cache<string>();

      expect(defaultCache.size).toBe(0);
    });

    it('should initialize with TTL', () => {
      const cacheWithTTL = new Cache<string>({ ttl: 1000 });

      expect(cacheWithTTL.size).toBe(0);
    });

    it('should initialize with maxSize', () => {
      const cacheWithMaxSize = new Cache<string>({ maxSize: 10 });

      expect(cacheWithMaxSize.size).toBe(0);
    });

    it('should initialize with onEvict callback', () => {
      const onEvict = jest.fn();
      const cacheWithCallback = new Cache<string>({ onEvict });

      expect(cacheWithCallback.size).toBe(0);
    });

    it('should initialize with all options', () => {
      const onEvict = jest.fn();
      const fullCache = new Cache<string>({
        ttl: 5000,
        maxSize: 10,
        onEvict,
      });

      expect(fullCache.size).toBe(0);
    });
  });

  describe('set', () => {
    it('should add a value to the cache', () => {
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.size).toBe(1);
    });

    it('should update an existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
      expect(cache.size).toBe(1);
    });

    it('should store different types of values', () => {
      const numberCache = new Cache<number>();
      const objectCache = new Cache<{ name: string }>();

      numberCache.set('num', 42);
      objectCache.set('obj', { name: 'test' });

      expect(numberCache.get('num')).toBe(42);
      expect(objectCache.get('obj')).toEqual({ name: 'test' });
    });

    it('should handle null and undefined values', () => {
      cache.set('null-key', null as any);
      cache.set('undefined-key', undefined as any);

      expect(cache.get('null-key')).toBeNull();
      expect(cache.get('undefined-key')).toBeUndefined();
    });

    it('should handle empty string keys', () => {
      cache.set('', 'empty-key-value');

      expect(cache.get('')).toBe('empty-key-value');
      expect(cache.size).toBe(1);
    });

    it('should evict LRU when maxSize is reached', () => {
      const smallCache = new Cache<string>({ maxSize: 3, ttl: 5000 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      expect(smallCache.size).toBe(3);

      smallCache.set('key4', 'value4');
      expect(smallCache.size).toBe(3);
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should call onEvict callback when evicting due to maxSize', () => {
      const onEvict = jest.fn();
      const smallCache = new Cache<string>({ maxSize: 2, onEvict });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      expect(onEvict).not.toHaveBeenCalled();

      smallCache.set('key3', 'value3');
      expect(onEvict).toHaveBeenCalledWith(
        'key1',
        expect.objectContaining({ value: 'value1' })
      );
    });

    it('should evict expired entries before adding new ones', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50, maxSize: 3 });

      shortTTLCache.set('key1', 'value1');

      jest.advanceTimersByTime(51);
      shortTTLCache.set('key2', 'value2');
      shortTTLCache.set('key3', 'value3');
      shortTTLCache.set('key4', 'value4');

      expect(shortTTLCache.get('key1')).toBeNull();
      expect(shortTTLCache.size).toBe(3);
    });
  });

  describe('get', () => {
    it('should return value for existing key', () => {
      cache.set('key1', 'value1');

      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should return null for expired entry', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(51);
      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should remove expired entry from cache', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.size).toBe(1);

      jest.advanceTimersByTime(51);
      shortTTLCache.get('key1');

      expect(shortTTLCache.size).toBe(0);
    });

    it('should increment hit count on successful get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1');
      cache.get('key1');
      cache.get('key2');

      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
    });

    it('should not increment hit count on failed get', () => {
      cache.set('key1', 'value1');

      cache.get('key1');
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
    });

    it('should handle retrieving recently updated entry', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      expect(cache.get('key1')).toBe('value2');
      expect(cache.size).toBe(1);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired entry', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.has('key1')).toBe(true);

      jest.advanceTimersByTime(51);
      expect(shortTTLCache.has('key1')).toBe(false);
    });

    it('should increment hit count (has uses get internally)', () => {
      cache.set('key1', 'value1');

      cache.has('key1');
      cache.has('key1');

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
    });

    it('should handle empty string key', () => {
      cache.set('', 'value');

      expect(cache.has('')).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      const result = cache.delete('key1');

      expect(result).toBe(true);
      expect(cache.has('key1')).toBe(false);
      expect(cache.size).toBe(0);
    });

    it('should return false for non-existent key', () => {
      const result = cache.delete('non-existent');

      expect(result).toBe(false);
    });

    it('should handle deleting from empty cache', () => {
      const result = cache.delete('key1');

      expect(result).toBe(false);
      expect(cache.size).toBe(0);
    });

    it('should not affect other entries when deleting one', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.delete('key2');

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
      expect(cache.size).toBe(2);
    });

    it('should not call onEvict callback when manually deleting', () => {
      const onEvict = jest.fn();
      const cacheWithCallback = new Cache<string>({ onEvict });

      cacheWithCallback.set('key1', 'value1');
      cacheWithCallback.delete('key1');

      expect(onEvict).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });

    it('should handle clearing empty cache', () => {
      cache.clear();

      expect(cache.size).toBe(0);
      expect(() => cache.clear()).not.toThrow();
    });

    it('should reset hit statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');

      expect(cache.getStats().hits).toBe(2);

      cache.clear();

      expect(cache.getStats().hits).toBe(0);
    });

    it('should not call onEvict callback when clearing', () => {
      const onEvict = jest.fn();
      const cacheWithCallback = new Cache<string>({ onEvict });

      cacheWithCallback.set('key1', 'value1');
      cacheWithCallback.set('key2', 'value2');
      cacheWithCallback.clear();

      expect(onEvict).not.toHaveBeenCalled();
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size).toBe(0);
    });

    it('should return correct size after adding entries', () => {
      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);

      cache.set('key3', 'value3');
      expect(cache.size).toBe(3);
    });

    it('should reflect size after deleting entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.delete('key2');

      expect(cache.size).toBe(2);
    });

    it('should reflect size after clearing', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.size).toBe(0);
    });

    it('should not count expired entries', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.size).toBe(1);

      jest.advanceTimersByTime(51);
      shortTTLCache.get('key1');

      expect(shortTTLCache.size).toBe(0);
    });

    it('should reflect LRU eviction', () => {
      const smallCache = new Cache<string>({ maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      expect(smallCache.size).toBe(2);

      smallCache.set('key3', 'value3');
      expect(smallCache.size).toBe(2);
    });
  });

  describe('getStats', () => {
    it('should return stats for empty cache', () => {
      const stats = cache.getStats();

      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should track hits correctly', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1');
      cache.get('key1');
      cache.get('key1');
      cache.get('key2');

      const stats = cache.getStats();
      expect(stats.hits).toBe(4);
    });

    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1');
      cache.get('key1');
      cache.get('key2');
      cache.get('non-existent');

      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.hitRate).toBe(0.75);
    });

    it('should update stats after clearing', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');

      let stats = cache.getStats();
      expect(stats.hits).toBe(2);

      cache.clear();
      stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.size).toBe(0);
    });

    it('should track hits across multiple entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      for (let i = 0; i < 10; i++) {
        cache.get('key1');
      }
      for (let i = 0; i < 5; i++) {
        cache.get('key2');
      }
      cache.get('key3');

      const stats = cache.getStats();
      expect(stats.hits).toBe(16);
      expect(stats.size).toBe(3);
    });
  });

  describe('onEvict callback', () => {
    it('should call onEvict when evicting due to maxSize', () => {
      const onEvict = jest.fn();
      const smallCache = new Cache<string>({ maxSize: 2, onEvict });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');

      smallCache.set('key3', 'value3');

      expect(onEvict).toHaveBeenCalledTimes(1);
      expect(onEvict).toHaveBeenCalledWith(
        'key1',
        expect.objectContaining({
          value: 'value1',
          hits: 0,
        })
      );
    });

    it('should pass correct entry data to onEvict', () => {
      const onEvict = jest.fn();
      const smallCache = new Cache<string>({ maxSize: 2, onEvict });

      smallCache.set('key1', 'value1');
      smallCache.get('key1');
      smallCache.get('key1');

      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      expect(onEvict).toHaveBeenCalledWith(
        'key2',
        expect.objectContaining({
          value: 'value2',
          hits: 0,
        })
      );
    });

    it('should not call onEvict when deleting manually', () => {
      const onEvict = jest.fn();
      const cacheWithCallback = new Cache<string>({ onEvict });

      cacheWithCallback.set('key1', 'value1');
      cacheWithCallback.delete('key1');

      expect(onEvict).not.toHaveBeenCalled();
    });

    it('should not call onEvict when clearing', () => {
      const onEvict = jest.fn();
      const cacheWithCallback = new Cache<string>({ onEvict });

      cacheWithCallback.set('key1', 'value1');
      cacheWithCallback.set('key2', 'value2');
      cacheWithCallback.clear();

      expect(onEvict).not.toHaveBeenCalled();
    });

    it('should handle multiple evictions correctly', () => {
      const onEvict = jest.fn();
      const tinyCache = new Cache<string>({ maxSize: 1, onEvict });

      tinyCache.set('key1', 'value1');
      tinyCache.set('key2', 'value2');
      tinyCache.set('key3', 'value3');

      expect(onEvict).toHaveBeenCalledTimes(2);
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', () => {
      const shortTTLCache = new Cache<string>({ ttl: 100 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(101);
      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should not expire entries before TTL', () => {
      const shortTTLCache = new Cache<string>({ ttl: 100 });

      shortTTLCache.set('key1', 'value1');

      jest.advanceTimersByTime(50);
      expect(shortTTLCache.get('key1')).toBe('value1');

      jest.advanceTimersByTime(49);
      expect(shortTTLCache.get('key1')).toBe('value1');
    });

    it('should handle cache without TTL (entries never expire)', () => {
      const noTTLCache = new Cache<string>({});

      noTTLCache.set('key1', 'value1');

      jest.advanceTimersByTime(10000);
      expect(noTTLCache.get('key1')).toBe('value1');
    });

    it('should refresh timestamp when updating existing key', () => {
      const shortTTLCache = new Cache<string>({ ttl: 100 });

      shortTTLCache.set('key1', 'value1');

      jest.advanceTimersByTime(80);
      shortTTLCache.set('key1', 'updated-value');

      jest.advanceTimersByTime(30);
      expect(shortTTLCache.get('key1')).toBe('updated-value');

      jest.advanceTimersByTime(71);
      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should evict expired entries before LRU when both conditions apply', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50, maxSize: 3 });

      shortTTLCache.set('key1', 'value1');

      jest.advanceTimersByTime(51);
      shortTTLCache.set('key2', 'value2');
      shortTTLCache.set('key3', 'value3');

      expect(shortTTLCache.size).toBe(2);
      expect(shortTTLCache.get('key1')).toBeNull();
    });

    it('should not count expired entries in size', () => {
      const shortTTLCache = new Cache<string>({ ttl: 50 });

      shortTTLCache.set('key1', 'value1');
      expect(shortTTLCache.size).toBe(1);

      jest.advanceTimersByTime(51);
      shortTTLCache.get('key1');

      expect(shortTTLCache.size).toBe(0);
    });
  });

  describe('LRU (Least Recently Used) eviction', () => {
    it('should evict least recently used entry', () => {
      const smallCache = new Cache<string>({ maxSize: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      expect(smallCache.size).toBe(3);

      smallCache.set('key4', 'value4');

      expect(smallCache.size).toBe(3);
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toBe('value2');
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should update LRU when accessing entry', () => {
      const smallCache = new Cache<string>({ maxSize: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      smallCache.get('key1');

      smallCache.set('key4', 'value4');

      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBeNull();
      expect(smallCache.get('key3')).toBe('value3');
      expect(smallCache.get('key4')).toBe('value4');
    });

    it('should use hit count as secondary LRU metric', () => {
      const smallCache = new Cache<string>({ maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.get('key1');
      smallCache.get('key1');

      smallCache.set('key2', 'value2');
      smallCache.get('key2');

      smallCache.set('key3', 'value3');

      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBeNull();
    });

    it('should handle edge case where all entries have same hit count', () => {
      const smallCache = new Cache<string>({ maxSize: 2 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');

      smallCache.set('key3', 'value3');

      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key2')).toBe('value2');
    });

    it('should not evict when size is below maxSize', () => {
      const smallCache = new Cache<string>({ maxSize: 3 });

      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');

      expect(smallCache.size).toBe(2);
      expect(smallCache.get('key1')).toBe('value1');
      expect(smallCache.get('key2')).toBe('value2');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle very large cache size', () => {
      const largeCache = new Cache<string>({ maxSize: 10000 });

      for (let i = 0; i < 1000; i++) {
        largeCache.set(`key${i}`, `value${i}`);
      }

      expect(largeCache.size).toBe(1000);
      expect(largeCache.get('key500')).toBe('value500');
    });

    it('should handle very long keys', () => {
      const longKey = 'a'.repeat(10000);
      cache.set(longKey, 'value');

      expect(cache.get(longKey)).toBe('value');
      expect(cache.size).toBe(1);
    });

    it('should handle special characters in keys', () => {
      const specialKeys = [
        'key with spaces',
        'key/with/slashes',
        'key?with?question',
        'key#with#hash',
        'key@with@at',
      ];

      specialKeys.forEach((key) => {
        cache.set(key, `value-${key}`);
      });

      specialKeys.forEach((key) => {
        expect(cache.get(key)).toBe(`value-${key}`);
      });

      expect(cache.size).toBe(specialKeys.length);
    });

    it('should handle concurrent operations', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(cache.set(`key${i}`, `value${i}`)));
      }
      await Promise.all(promises);

      expect(cache.size).toBe(100);

      const getPromises = [];
      for (let i = 0; i < 100; i++) {
        getPromises.push(Promise.resolve(cache.get(`key${i}`)));
      }
      const results = await Promise.all(getPromises);

      results.forEach((value, index) => {
        expect(value).toBe(`value${index}`);
      });
    });

    it('should handle rapid set and delete operations', () => {
      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, `value${i}`);
      }

      for (let i = 0; i < 50; i++) {
        cache.delete(`key${i}`);
      }

      expect(cache.size).toBe(50);
      expect(cache.get('key0')).toBeNull();
      expect(cache.get('key50')).toBe('value50');
    });
  });
});
