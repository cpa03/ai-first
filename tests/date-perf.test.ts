import { getRelativeTime } from '@/lib/utils';

describe('Date Formatting Performance and Correctness', () => {
  // Use a fixed "now" date
  const now = new Date('2026-05-18T12:00:00Z');

  // getRelativeTime internally uses new Date() for comparison
  // We need to mock the Date constructor to return our fixed "now"
  const RealDate = global.Date;

  beforeAll(() => {
    global.Date = class extends RealDate {
      constructor(arg?: string | number | Date) {
        super(arg === undefined ? now.getTime() : arg);
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
        `[Benchmark] getRelativeTime (${iterations} iterations): ${duration.toFixed(2)}ms`
      );

      // Basic sanity check
      expect(duration).toBeDefined();
    });
  });
});
