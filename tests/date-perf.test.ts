import { getRelativeTime, parseDate } from '@/lib/utils';

describe('Date Formatting Performance and Correctness', () => {
  // Use a fixed "now" date
  const now = new Date('2026-05-18T12:00:00Z');

  // getRelativeTime internally uses new Date() for comparison
  // We need to mock the Date constructor to return our fixed "now"
  const RealDate = global.Date;

  beforeAll(() => {
    global.Date = class extends RealDate {
      constructor(arg?: string | number | Date) {
        super();
        if (arg === undefined) {
          return new RealDate(now.getTime());
        }
        return new RealDate(arg);
      }
      static now() {
        return now.getTime();
      }
    } as typeof RealDate;
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  describe('getRelativeTime Correctness', () => {
    it('should format "just now"', () => {
      const date = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      expect(getRelativeTime(date)).toBe('just now');
    });

    it('should format minutes ago', () => {
      const date = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(getRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should format hours ago', () => {
      const date = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      expect(getRelativeTime(date)).toBe('2 hours ago');
    });

    it('should format days ago', () => {
      const date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      expect(getRelativeTime(date)).toBe('3 days ago');
    });

    it('should format absolute date for old dates', () => {
      const date = new Date('2025-01-01T12:00:00Z');
      expect(getRelativeTime(date)).toBe('Jan 1, 2025');
    });
  });

  describe('parseDate Correctness', () => {
    it('should parse date strings correctly', () => {
      const dateStr = '2026-05-15T10:00:00Z';
      const parsed = parseDate(dateStr);
      expect(Object.prototype.toString.call(parsed)).toBe('[object Date]');
      expect(parsed.getTime()).toBe(new Date(dateStr).getTime());
    });

    it('should return exact same Date reference from cache for identical string inputs', () => {
      const dateStr = '2026-05-15T10:00:00Z';
      const parsed1 = parseDate(dateStr);
      const parsed2 = parseDate(dateStr);
      expect(parsed1).toBe(parsed2); // Checks reference equality
    });

    it('should return the input unchanged if already a Date object', () => {
      const dateObj = new Date();
      const result = parseDate(dateObj);
      expect(result).toBe(dateObj);
    });
  });

  describe('Performance Benchmark', () => {
    it('benchmarks getRelativeTime for old dates (cold path)', () => {
      const oldDate = new Date('2025-01-01T12:00:00Z');
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        getRelativeTime(oldDate);
      }
      const end = performance.now();
      const duration = end - start;

      console.log(
        `[Benchmark] getRelativeTime with Date object (${iterations} iterations): ${duration.toFixed(2)}ms`
      );

      // Basic sanity check
      expect(duration).toBeDefined();
    });

    it('benchmarks getRelativeTime for string inputs (caching path)', () => {
      const dateStr = '2025-01-01T12:00:00Z';
      const iterations = 1000;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        getRelativeTime(dateStr);
      }
      const end = performance.now();
      const duration = end - start;

      console.log(
        `[Benchmark] getRelativeTime with String inputs (${iterations} iterations with cache): ${duration.toFixed(2)}ms`
      );

      // Basic sanity check
      expect(duration).toBeDefined();
    });
  });
});
