import {
  getExternalRateLimitTracker,
  resetExternalRateLimitTracker,
  captureRateLimit,
  shouldThrottleRequest,
  type ExternalRateLimitInfo,
} from '../src/lib/external-rate-limit';

describe('ExternalRateLimitTracker', () => {
  beforeEach(() => {
    resetExternalRateLimitTracker();
  });

  afterEach(() => {
    resetExternalRateLimitTracker();
  });

  describe('extractRateLimitInfo', () => {
    it('should extract rate limit info from GitHub headers', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = new Headers({
        'x-ratelimit-remaining': '45',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
      });

      const info = tracker.extractRateLimitInfo('github', headers);

      expect(info).not.toBeNull();
      expect(info!.service).toBe('github');
      expect(info!.remaining).toBe(45);
      expect(info!.limit).toBe(5000);
    });

    it('should extract rate limit info from OpenAI headers', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = new Headers({
        'x-ratelimit-remaining-requests': '100',
        'x-ratelimit-limit-requests': '500',
        'x-ratelimit-reset-requests': '60',
      });

      const info = tracker.extractRateLimitInfo('openai', headers);

      expect(info).not.toBeNull();
      expect(info!.service).toBe('openai');
      expect(info!.remaining).toBe(100);
      expect(info!.limit).toBe(500);
    });

    it('should handle case-insensitive service names', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = new Headers({
        'x-ratelimit-remaining': '50',
        'x-ratelimit-limit': '100',
      });

      const info = tracker.extractRateLimitInfo('GITHUB', headers);

      expect(info).not.toBeNull();
      expect(info!.service).toBe('github');
    });

    it('should return null for unknown service', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = new Headers();

      const info = tracker.extractRateLimitInfo('unknown-service', headers);

      expect(info).toBeNull();
    });

    it('should return null for missing headers', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = new Headers();

      const info = tracker.extractRateLimitInfo('github', headers);

      expect(info).toBeNull();
    });

    it('should handle plain object headers', () => {
      const tracker = getExternalRateLimitTracker();
      const headers = {
        'x-ratelimit-remaining': '25',
        'x-ratelimit-limit': '100',
      };

      const info = tracker.extractRateLimitInfo('github', headers);

      expect(info).not.toBeNull();
      expect(info!.remaining).toBe(25);
    });
  });

  describe('updateRateLimit and getRateLimitInfo', () => {
    it('should store and retrieve rate limit info', () => {
      const tracker = getExternalRateLimitTracker();
      const info: ExternalRateLimitInfo = {
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      };

      tracker.updateRateLimit(info);
      const retrieved = tracker.getRateLimitInfo('github');

      expect(retrieved).not.toBeNull();
      expect(retrieved!.remaining).toBe(100);
    });

    it('should update existing rate limit info', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      tracker.updateRateLimit({
        service: 'github',
        remaining: 99,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      const retrieved = tracker.getRateLimitInfo('github');
      expect(retrieved!.remaining).toBe(99);
    });

    it('should return null for stale info', () => {
      const tracker = getExternalRateLimitTracker({ maxAgeMs: 100 });
      const oldTime = Date.now() - 1000;

      tracker.updateRateLimit({
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: oldTime,
      });

      const retrieved = tracker.getRateLimitInfo('github');
      expect(retrieved).toBeNull();
    });
  });

  describe('shouldThrottle', () => {
    it('should return false when no info exists', () => {
      const tracker = getExternalRateLimitTracker();

      expect(tracker.shouldThrottle('github')).toBe(false);
    });

    it('should return false when plenty of requests remaining', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 4000,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      expect(tracker.shouldThrottle('github')).toBe(false);
    });

    it('should return true when approaching limit', () => {
      const tracker = getExternalRateLimitTracker({ throttleThreshold: 0.2 });

      tracker.updateRateLimit({
        service: 'github',
        remaining: 500, // 10% of 5000
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      expect(tracker.shouldThrottle('github')).toBe(true);
    });

    it('should return false after reset time', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 0,
        limit: 5000,
        resetTime: Date.now() - 1000, // Already reset
        capturedAt: Date.now(),
      });

      expect(tracker.shouldThrottle('github')).toBe(false);
    });
  });

  describe('getThrottleWaitTime', () => {
    it('should return 0 when no throttle needed', () => {
      const tracker = getExternalRateLimitTracker();

      expect(tracker.getThrottleWaitTime('github')).toBe(0);
    });

    it('should return wait time when throttled', () => {
      const tracker = getExternalRateLimitTracker();
      const resetTime = Date.now() + 60000;

      tracker.updateRateLimit({
        service: 'github',
        remaining: 0,
        limit: 5000,
        resetTime,
        capturedAt: Date.now(),
      });

      const waitTime = tracker.getThrottleWaitTime('github');
      expect(waitTime).toBeGreaterThan(50000);
      expect(waitTime).toBeLessThanOrEqual(60000);
    });
  });

  describe('getStats', () => {
    it('should return stats for tracked services', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      tracker.updateRateLimit({
        service: 'openai',
        remaining: 50,
        limit: 500,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      const stats = tracker.getStats();

      expect(stats.servicesTracked).toBe(2);
      expect(stats.services).toHaveLength(2);
      expect(stats.services.map((s) => s.service)).toContain('github');
      expect(stats.services.map((s) => s.service)).toContain('openai');
    });
  });

  describe('cleanupExpired', () => {
    it('should remove expired entries', () => {
      const tracker = getExternalRateLimitTracker({ maxAgeMs: 100 });

      tracker.updateRateLimit({
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now() - 1000, // Old
      });

      tracker.cleanupExpired();

      expect(tracker.getRateLimitInfo('github')).toBeNull();
    });

    it('should remove entries with passed reset time', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 0,
        limit: 5000,
        resetTime: Date.now() - 1000, // Already reset
        capturedAt: Date.now(),
      });

      tracker.cleanupExpired();

      expect(tracker.getRateLimitInfo('github')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all rate limit info', () => {
      const tracker = getExternalRateLimitTracker();

      tracker.updateRateLimit({
        service: 'github',
        remaining: 100,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      tracker.clear();

      expect(tracker.getStats().servicesTracked).toBe(0);
    });
  });

  describe('convenience functions', () => {
    it('captureRateLimit should extract and store rate limit info', () => {
      resetExternalRateLimitTracker();

      const headers = new Headers({
        'x-ratelimit-remaining': '45',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-reset': String(Math.floor(Date.now() / 1000) + 3600),
      });

      const info = captureRateLimit('github', headers);

      expect(info).not.toBeNull();
      expect(info!.remaining).toBe(45);
    });

    it('shouldThrottleRequest should return throttle info', () => {
      resetExternalRateLimitTracker();

      // No info exists yet
      let result = shouldThrottleRequest('github');
      expect(result.throttle).toBe(false);
      expect(result.waitTimeMs).toBe(0);
      expect(result.remaining).toBeNull();

      // Add info with plenty of requests remaining (4000/5000 = 80%)
      const tracker = getExternalRateLimitTracker();
      tracker.updateRateLimit({
        service: 'github',
        remaining: 4000,
        limit: 5000,
        resetTime: Date.now() + 3600000,
        capturedAt: Date.now(),
      });

      result = shouldThrottleRequest('github');
      expect(result.throttle).toBe(false);
      expect(result.remaining).toBe(4000);
    });
  });

  describe('memory management', () => {
    it('should limit number of tracked services', () => {
      const tracker = getExternalRateLimitTracker({ maxServices: 3 });

      for (let i = 0; i < 5; i++) {
        tracker.updateRateLimit({
          service: `service-${i}`,
          remaining: 100,
          limit: 5000,
          resetTime: Date.now() + 3600000,
          capturedAt: Date.now(),
        });
      }

      const stats = tracker.getStats();
      expect(stats.servicesTracked).toBeLessThanOrEqual(3);
    });
  });
});
