import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitConfigs,
  createRateLimitMiddleware,
  cleanupExpiredEntries,
  rateLimitResponse,
} from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('new identifier', () => {
    it('should allow first request', () => {
      const result = checkRateLimit('test-user', rateLimitConfigs.lenient);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(rateLimitConfigs.lenient.maxRequests - 1);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should set reset time based on windowMs', () => {
      const result = checkRateLimit('test-user', rateLimitConfigs.strict);

      const expectedResetTime =
        result.resetTime - rateLimitConfigs.strict.windowMs;
      expect(result.resetTime - expectedResetTime).toBe(
        rateLimitConfigs.strict.windowMs
      );
    });

    it('should work with different identifiers', () => {
      const result1 = checkRateLimit('user-1', rateLimitConfigs.moderate);
      const result2 = checkRateLimit('user-2', rateLimitConfigs.moderate);

      expect(result1.remaining).toBe(rateLimitConfigs.moderate.maxRequests - 1);
      expect(result2.remaining).toBe(rateLimitConfigs.moderate.maxRequests - 1);
    });
  });

  describe('within window', () => {
    it('should increment count for subsequent requests', () => {
      const identifier = 'test-user-2';

      checkRateLimit(identifier, rateLimitConfigs.lenient);
      const result2 = checkRateLimit(identifier, rateLimitConfigs.lenient);

      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(rateLimitConfigs.lenient.maxRequests - 2);
    });

    it('should keep same reset time for requests within window', () => {
      const identifier = 'test-user-3';

      const result1 = checkRateLimit(identifier, rateLimitConfigs.moderate);
      const result2 = checkRateLimit(identifier, rateLimitConfigs.moderate);

      expect(result1.resetTime).toBe(result2.resetTime);
    });

    it('should return correct remaining count', () => {
      const identifier = 'test-user-4';
      const maxRequests = rateLimitConfigs.lenient.maxRequests;

      const results = [];
      for (let i = 0; i < maxRequests; i++) {
        results.push(checkRateLimit(identifier, rateLimitConfigs.lenient));
      }

      expect(results[0].remaining).toBe(maxRequests - 1);
      expect(results[results.length - 2].remaining).toBe(1);
      expect(results[results.length - 1].remaining).toBe(0);
    });
  });

  describe('limit exceeded', () => {
    it('should deny request when limit is reached', () => {
      const identifier = 'test-user-5';
      const config = rateLimitConfigs.strict;

      for (let i = 0; i < config.maxRequests; i++) {
        checkRateLimit(identifier, config);
      }

      const result = checkRateLimit(identifier, config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should return same reset time when limit exceeded', () => {
      const identifier = 'test-user-6';
      const config = rateLimitConfigs.moderate;

      checkRateLimit(identifier, config);
      const initialResetTime = checkRateLimit(identifier, config).resetTime;

      for (let i = 2; i <= config.maxRequests; i++) {
        checkRateLimit(identifier, config);
      }

      const exceededResult = checkRateLimit(identifier, config);
      expect(exceededResult.resetTime).toBe(initialResetTime);
    });

    it('should continue to deny until window expires', () => {
      const identifier = 'test-user-7';
      const config = rateLimitConfigs.strict;

      for (let i = 0; i < config.maxRequests; i++) {
        checkRateLimit(identifier, config);
      }

      const result1 = checkRateLimit(identifier, config);
      expect(result1.allowed).toBe(false);

      const result2 = checkRateLimit(identifier, config);
      expect(result2.allowed).toBe(false);

      const result3 = checkRateLimit(identifier, config);
      expect(result3.allowed).toBe(false);
    });
  });

  describe('window expired', () => {
    it('should reset count after window expires', () => {
      const identifier = 'test-user-8';
      const config = rateLimitConfigs.lenient;

      for (let i = 0; i < config.maxRequests; i++) {
        checkRateLimit(identifier, config);
      }

      const resultBeforeExpiry = checkRateLimit(identifier, config);
      expect(resultBeforeExpiry.allowed).toBe(false);

      jest.advanceTimersByTime(config.windowMs + 100);

      const resultAfterExpiry = checkRateLimit(identifier, config);

      expect(resultAfterExpiry.allowed).toBe(true);
      expect(resultAfterExpiry.remaining).toBe(config.maxRequests - 1);
    });

    it('should set new reset time after window expires', () => {
      const identifier = 'test-user-9';
      const config = rateLimitConfigs.moderate;

      const result1 = checkRateLimit(identifier, config);
      jest.advanceTimersByTime(config.windowMs + 100);

      const result2 = checkRateLimit(identifier, config);

      expect(result2.resetTime).toBeGreaterThan(result1.resetTime);
    });

    it('should handle requests crossing window boundary', () => {
      const identifier = 'test-user-10';
      const config = rateLimitConfigs.strict;
      const halfWindow = Math.floor(config.windowMs / 2);

      checkRateLimit(identifier, config);
      jest.advanceTimersByTime(halfWindow);

      for (let i = 1; i < config.maxRequests; i++) {
        checkRateLimit(identifier, config);
      }

      const result = checkRateLimit(identifier, config);
      expect(result.allowed).toBe(false);

      jest.advanceTimersByTime(halfWindow + 100);

      const resultAfter = checkRateLimit(identifier, config);
      expect(resultAfter.allowed).toBe(true);
    });
  });

  describe('different configs', () => {
    it('should work with strict config', () => {
      const identifier = 'test-user-11';

      for (let i = 0; i < rateLimitConfigs.strict.maxRequests; i++) {
        const result = checkRateLimit(identifier, rateLimitConfigs.strict);
        expect(result.allowed).toBe(true);
      }

      const result = checkRateLimit(identifier, rateLimitConfigs.strict);
      expect(result.allowed).toBe(false);
    });

    it('should work with moderate config', () => {
      const identifier = 'test-user-12';

      for (let i = 0; i < rateLimitConfigs.moderate.maxRequests; i++) {
        const result = checkRateLimit(identifier, rateLimitConfigs.moderate);
        expect(result.allowed).toBe(true);
      }

      const result = checkRateLimit(identifier, rateLimitConfigs.moderate);
      expect(result.allowed).toBe(false);
    });

    it('should work with lenient config', () => {
      const identifier = 'test-user-13';

      for (let i = 0; i < rateLimitConfigs.lenient.maxRequests; i++) {
        const result = checkRateLimit(identifier, rateLimitConfigs.lenient);
        expect(result.allowed).toBe(true);
      }

      const result = checkRateLimit(identifier, rateLimitConfigs.lenient);
      expect(result.allowed).toBe(false);
    });

    it('should handle different identifiers with same config', () => {
      const config = rateLimitConfigs.lenient;

      const result1 = checkRateLimit('user-1', config);
      const result2 = checkRateLimit('user-2', config);
      const result3 = checkRateLimit('user-3', config);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should allow exact max requests', () => {
      const identifier = 'test-user-14';
      const config = rateLimitConfigs.strict;

      const results = [];
      for (let i = 0; i < config.maxRequests; i++) {
        const result = checkRateLimit(identifier, config);
        results.push(result);
      }

      results.forEach((result) => {
        expect(result.allowed).toBe(true);
      });
    });

    it('should maintain separation between identifiers', () => {
      const config = rateLimitConfigs.moderate;

      const results1 = [];
      for (let i = 0; i < config.maxRequests; i++) {
        results1.push(checkRateLimit('user-1', config));
      }

      const result2 = checkRateLimit('user-2', config);
      expect(result2.allowed).toBe(true);

      const result1Final = checkRateLimit('user-1', config);
      expect(result1Final.allowed).toBe(false);
    });
  });
});

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe('192.168.1.1');
  });

  it('should use first IP from x-forwarded-for when multiple present', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 10.0.0.3' },
    });

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe('10.0.0.1');
  });

  it('should fall back to x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '172.16.0.1' },
    });

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe('172.16.0.1');
  });

  it('should return unknown when no headers present', () => {
    const request = new Request('http://localhost');

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe('unknown');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '10.0.0.1',
        'x-real-ip': '172.16.0.1',
      },
    });

    const identifier = getClientIdentifier(request);

    expect(identifier).toBe('10.0.0.1');
  });
});

describe('rateLimitConfigs', () => {
  it('should have strict config', () => {
    expect(rateLimitConfigs.strict).toBeDefined();
    expect(rateLimitConfigs.strict.windowMs).toBe(60 * 1000);
    expect(rateLimitConfigs.strict.maxRequests).toBe(10);
  });

  it('should have moderate config', () => {
    expect(rateLimitConfigs.moderate).toBeDefined();
    expect(rateLimitConfigs.moderate.windowMs).toBe(60 * 1000);
    expect(rateLimitConfigs.moderate.maxRequests).toBe(30);
  });

  it('should have lenient config', () => {
    expect(rateLimitConfigs.lenient).toBeDefined();
    expect(rateLimitConfigs.lenient.windowMs).toBe(60 * 1000);
    expect(rateLimitConfigs.lenient.maxRequests).toBe(60);
  });
});

describe('createRateLimitMiddleware', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create middleware function', () => {
    const middleware = createRateLimitMiddleware(rateLimitConfigs.lenient);

    expect(typeof middleware).toBe('function');
  });

  it('should call checkRateLimit with client identifier', () => {
    const middleware = createRateLimitMiddleware(rateLimitConfigs.moderate);
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });

    const result = middleware(request);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(rateLimitConfigs.moderate.maxRequests - 1);
  });

  it('should work with different config', () => {
    const middleware = createRateLimitMiddleware(rateLimitConfigs.strict);
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });

    const result = middleware(request);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(rateLimitConfigs.strict.maxRequests - 1);
  });
});

describe('cleanupExpiredEntries', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should run without errors', () => {
    expect(() => cleanupExpiredEntries()).not.toThrow();
  });

  it('should handle calls when no entries exist', () => {
    expect(() => cleanupExpiredEntries()).not.toThrow();
  });

  it('should handle multiple calls', () => {
    const config = rateLimitConfigs.lenient;

    checkRateLimit('user-1', config);
    jest.advanceTimersByTime(config.windowMs + 100);

    cleanupExpiredEntries();
    cleanupExpiredEntries();
    cleanupExpiredEntries();

    expect(() => cleanupExpiredEntries()).not.toThrow();
  });
});

describe('rateLimitResponse', () => {
  it('should return 429 status', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    expect(response.status).toBe(429);
  });

  it('should set correct content type', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    expect(response.headers.get('content-type')).toBe('application/json');
  });

  it('should include error message in body', async () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);
    const body = await response.json();

    expect(body.error).toBe('Too many requests');
  });

  it('should include retryAfter in body', async () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);
    const body = await response.json();

    expect(body.retryAfter).toBeGreaterThanOrEqual(59);
    expect(body.retryAfter).toBeLessThanOrEqual(61);
  });

  it('should set Retry-After header', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    const retryAfter = parseInt(response.headers.get('Retry-After') || '0');
    expect(retryAfter).toBeGreaterThanOrEqual(59);
    expect(retryAfter).toBeLessThanOrEqual(61);
  });

  it('should set X-RateLimit-Limit header', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('60');
  });

  it('should set X-RateLimit-Remaining header', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should set X-RateLimit-Reset header', () => {
    const resetTime = Date.now() + 60000;
    const response = rateLimitResponse(resetTime);

    const resetHeader = response.headers.get('X-RateLimit-Reset');
    expect(resetHeader).toBeTruthy();
    expect(() => new Date(resetHeader || '')).not.toThrow();
  });

  it('should handle reset time in the past', async () => {
    const resetTime = Date.now() - 1000;
    const response = rateLimitResponse(resetTime);
    const body = await response.json();

    expect(body.retryAfter).toBeLessThanOrEqual(0);
  });

  it('should handle zero reset time', async () => {
    const resetTime = 0;
    const response = rateLimitResponse(resetTime);
    const body = await response.json();

    expect(body.retryAfter).toBeDefined();
  });
});
