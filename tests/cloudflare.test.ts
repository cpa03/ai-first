import {
  CLOUDFLARE_HEADERS,
  CLOUDFLARE_ENV_VARS,
  CF_CACHE_STATUS,
  CF_CACHE_TTL,
  CF_LIMITS,
  isCloudflareWorker,
  isCloudflareRequest,
  getCloudflareRequestInfo,
  getCloudflareGeoInfo,
  getClientIp,
  createCloudflareDebugHeaders,
  createCacheControlHeaders,
  detectPlatform,
  getExecutionContext,
  isEdgeRequest,
  getRequestLatency,
  getVisitorScheme,
  getCacheKey,
  CORRELATION_HEADERS,
  generateRequestId,
  getOrCreateRequestId,
  getCorrelationId,
  createCorrelationHeaders,
  addCorrelationHeaders,
  getRequestContext,
  createEarlyHintsHeaders,
  shouldSendEarlyHints,
  detectBot,
} from '@/lib/cloudflare';

function createMockRequest(headers: Record<string, string> = {}): Request {
  return new Request('https://example.com', {
    headers: new Headers(headers),
  });
}

describe('Cloudflare Constants', () => {
  describe('CLOUDFLARE_HEADERS', () => {
    it('should have correct CF-RAY header name', () => {
      expect(CLOUDFLARE_HEADERS.CF_RAY).toBe('cf-ray');
    });

    it('should have correct CF-Connecting-IP header name', () => {
      expect(CLOUDFLARE_HEADERS.CF_CONNECTING_IP).toBe('cf-connecting-ip');
    });

    it('should have correct CF-IPCountry header name', () => {
      expect(CLOUDFLARE_HEADERS.CF_IPCOUNTRY).toBe('cf-ipcountry');
    });

    it('should have geo headers defined', () => {
      expect(CLOUDFLARE_HEADERS.CF_IPCITY).toBe('cf-ipcity');
      expect(CLOUDFLARE_HEADERS.CF_REGION).toBe('cf-region');
      expect(CLOUDFLARE_HEADERS.CF_TIMEZONE).toBe('cf-timezone');
      expect(CLOUDFLARE_HEADERS.CF_POSTAL_CODE).toBe('cf-postal-code');
      expect(CLOUDFLARE_HEADERS.CF_ASN).toBe('cf-asn');
      expect(CLOUDFLARE_HEADERS.CF_IPORG).toBe('cf-iporg');
    });
  });

  describe('CF_CACHE_STATUS', () => {
    it('should have all cache status values', () => {
      expect(CF_CACHE_STATUS.HIT).toBe('HIT');
      expect(CF_CACHE_STATUS.MISS).toBe('MISS');
      expect(CF_CACHE_STATUS.BYPASS).toBe('BYPASS');
      expect(CF_CACHE_STATUS.EXPIRED).toBe('EXPIRED');
      expect(CF_CACHE_STATUS.STALE).toBe('STALE');
      expect(CF_CACHE_STATUS.UPDATING).toBe('UPDATING');
      expect(CF_CACHE_STATUS.REVALIDATED).toBe('REVALIDATED');
    });
  });

  describe('CF_CACHE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(CF_CACHE_TTL.NO_STORE).toBe(0);
      expect(CF_CACHE_TTL.SHORT).toBe(60);
      expect(CF_CACHE_TTL.MEDIUM).toBe(3600);
      expect(CF_CACHE_TTL.LONG).toBe(86400);
      expect(CF_CACHE_TTL.IMMUTABLE).toBe(31536000);
    });
  });

  describe('CF_LIMITS', () => {
    it('should have correct CPU limits', () => {
      expect(CF_LIMITS.CPU_MS_FREE).toBe(10);
      expect(CF_LIMITS.CPU_MS_PAID).toBe(50);
      expect(CF_LIMITS.CPU_MS_UNBOUND).toBe(900000);
    });

    it('should have correct size limits', () => {
      expect(CF_LIMITS.MAX_BODY_SIZE).toBe(100 * 1024 * 1024);
      expect(CF_LIMITS.MAX_KV_VALUE_SIZE).toBe(25 * 1024 * 1024);
      expect(CF_LIMITS.MAX_D1_SIZE).toBe('500MB');
    });
  });
});

describe('isCloudflareWorker', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return false when no Cloudflare env vars are set', () => {
    delete process.env[CLOUDFLARE_ENV_VARS.CF_WORKER];
    delete process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE];
    delete process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE_WORKERS];
    delete process.env[CLOUDFLARE_ENV_VARS.CF_PAGES];
    delete process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_BRANCH];
    delete process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_URL];
    expect(isCloudflareWorker()).toBe(false);
  });

  it('should return true when CF_WORKER env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CF_WORKER] = 'true';
    expect(isCloudflareWorker()).toBe(true);
  });

  it('should return true when CLOUDFLARE env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE] = 'true';
    expect(isCloudflareWorker()).toBe(true);
  });

  it('should return true when CLOUDFLARE_WORKERS env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CLOUDFLARE_WORKERS] = 'true';
    expect(isCloudflareWorker()).toBe(true);
  });

  it('should return true when CF_PAGES env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES] = '1';
    expect(isCloudflareWorker()).toBe(true);
  });

  it('should return true when CF_PAGES_BRANCH env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_BRANCH] = 'main';
    expect(isCloudflareWorker()).toBe(true);
  });

  it('should return true when CF_PAGES_URL env var is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CF_PAGES_URL] = 'https://example.pages.dev';
    expect(isCloudflareWorker()).toBe(true);
  });
});

describe('isCloudflareRequest', () => {
  it('should return false for request without CF-Ray header', () => {
    const request = createMockRequest();
    expect(isCloudflareRequest(request)).toBe(false);
  });

  it('should return true for request with CF-Ray header', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    expect(isCloudflareRequest(request)).toBe(true);
  });
});

describe('getCloudflareRequestInfo', () => {
  it('should return isCloudflare false for non-Cloudflare request', () => {
    const request = createMockRequest();
    const info = getCloudflareRequestInfo(request);
    expect(info.isCloudflare).toBe(false);
    expect(info.rayId).toBeNull();
    expect(info.cacheStatus).toBeNull();
    expect(info.clientIp).toBeNull();
    expect(info.country).toBeNull();
    expect(info.city).toBeNull();
  });

  it('should extract all Cloudflare headers when present', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-cache-status': 'HIT',
      'cf-connecting-ip': '192.168.1.1',
      'cf-ipcountry': 'US',
      'cf-ipcity': 'San Francisco',
    });
    const info = getCloudflareRequestInfo(request);
    expect(info.isCloudflare).toBe(true);
    expect(info.rayId).toBe('7c1c2c3d4e5f6g7h');
    expect(info.cacheStatus).toBe('HIT');
    expect(info.clientIp).toBe('192.168.1.1');
    expect(info.country).toBe('US');
    expect(info.city).toBe('San Francisco');
  });

  it('should return null for invalid cache status', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-cache-status': 'INVALID',
    });
    const info = getCloudflareRequestInfo(request);
    expect(info.cacheStatus).toBeNull();
  });
});

describe('getCloudflareGeoInfo', () => {
  it('should return hasGeoData false when no geo headers present', () => {
    const request = createMockRequest();
    const geoInfo = getCloudflareGeoInfo(request);
    expect(geoInfo.hasGeoData).toBe(false);
    expect(geoInfo.country).toBeNull();
    expect(geoInfo.city).toBeNull();
    expect(geoInfo.region).toBeNull();
  });

  it('should extract all geo headers when present', () => {
    const request = createMockRequest({
      'cf-ipcountry': 'US',
      'cf-ipcity': 'San Francisco',
      'cf-region': 'CA',
      'cf-postal-code': '94102',
      'cf-timezone': 'America/Los_Angeles',
      'cf-asn': '12345',
      'cf-iporg': 'Cloudflare, Inc.',
    });
    const geoInfo = getCloudflareGeoInfo(request);
    expect(geoInfo.hasGeoData).toBe(true);
    expect(geoInfo.country).toBe('US');
    expect(geoInfo.city).toBe('San Francisco');
    expect(geoInfo.region).toBe('CA');
    expect(geoInfo.postalCode).toBe('94102');
    expect(geoInfo.timezone).toBe('America/Los_Angeles');
    expect(geoInfo.asn).toBe('12345');
    expect(geoInfo.isp).toBe('Cloudflare, Inc.');
  });
});

describe('getClientIp', () => {
  it('should return null when no IP headers present', () => {
    const request = createMockRequest();
    expect(getClientIp(request)).toBeNull();
  });

  it('should prefer CF-Connecting-IP over other headers', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '192.168.1.1',
      'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      'x-real-ip': '172.16.0.1',
    });
    expect(getClientIp(request)).toBe('192.168.1.1');
  });

  it('should use x-forwarded-for first IP when CF header not present', () => {
    const request = createMockRequest({
      'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      'x-real-ip': '172.16.0.1',
    });
    expect(getClientIp(request)).toBe('10.0.0.1');
  });

  it('should use x-real-ip when other headers not present', () => {
    const request = createMockRequest({
      'x-real-ip': '172.16.0.1',
    });
    expect(getClientIp(request)).toBe('172.16.0.1');
  });

  it('should trim whitespace from IP addresses', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '  192.168.1.1  ',
    });
    expect(getClientIp(request)).toBe('192.168.1.1');
  });
});

describe('createCloudflareDebugHeaders', () => {
  it('should return X-CF-Worker header even without CF headers', () => {
    const request = createMockRequest();
    const headers = createCloudflareDebugHeaders(request);
    expect(headers['X-CF-Worker']).toBe('false');
    expect(headers['X-CF-Ray']).toBeUndefined();
    expect(headers['X-CF-Cache-Status']).toBeUndefined();
    expect(headers['X-CF-Country']).toBeUndefined();
  });

  it('should include all available CF debug headers', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-cache-status': 'HIT',
      'cf-ipcountry': 'US',
    });
    const headers = createCloudflareDebugHeaders(request);
    expect(headers['X-CF-Ray']).toBe('7c1c2c3d4e5f6g7h');
    expect(headers['X-CF-Cache-Status']).toBe('HIT');
    expect(headers['X-CF-Country']).toBe('US');
    expect(headers['X-CF-Worker']).toBe('false');
  });
});

describe('createCacheControlHeaders', () => {
  it('should return no-store by default', () => {
    const header = createCacheControlHeaders({});
    expect(header).toBe('no-store');
  });

  it('should return no-store when noStore is true', () => {
    const header = createCacheControlHeaders({ noStore: true });
    expect(header).toBe('no-store');
  });

  it('should create public cache with max-age', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 3600,
    });
    expect(header).toBe('public, max-age=3600');
  });

  it('should create private cache', () => {
    const header = createCacheControlHeaders({
      private: true,
      maxAge: 60,
    });
    expect(header).toBe('private, max-age=60');
  });

  it('should include s-maxage for CDN caching', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 3600,
      sMaxAge: 86400,
    });
    expect(header).toBe('public, max-age=3600, s-maxage=86400');
  });

  it('should include stale-while-revalidate', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 3600,
      staleWhileRevalidate: 86400,
    });
    expect(header).toBe('public, max-age=3600, stale-while-revalidate=86400');
  });

  it('should include stale-if-error', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 3600,
      staleIfError: 300,
    });
    expect(header).toBe('public, max-age=3600, stale-if-error=300');
  });

  it('should include immutable', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 31536000,
      immutable: true,
    });
    expect(header).toBe('public, max-age=31536000, immutable');
  });

  it('should include no-cache', () => {
    const header = createCacheControlHeaders({
      noCache: true,
    });
    expect(header).toBe('no-cache');
  });

  it('should create complex cache control header', () => {
    const header = createCacheControlHeaders({
      public: true,
      maxAge: 3600,
      sMaxAge: 86400,
      staleWhileRevalidate: 3600,
      staleIfError: 300,
    });
    expect(header).toContain('public');
    expect(header).toContain('max-age=3600');
    expect(header).toContain('s-maxage=86400');
    expect(header).toContain('stale-while-revalidate=3600');
    expect(header).toContain('stale-if-error=300');
  });
});

describe('detectPlatform', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return cloudflare when CF_WORKER env is set', () => {
    process.env[CLOUDFLARE_ENV_VARS.CF_WORKER] = 'true';
    expect(detectPlatform()).toBe('cloudflare');
  });

  it('should return vercel when VERCEL env is set', () => {
    delete process.env[CLOUDFLARE_ENV_VARS.CF_WORKER];
    process.env.VERCEL = 'true';
    expect(detectPlatform()).toBe('vercel');
  });

  it('should return vercel when NEXT_PUBLIC_VERCEL_URL is set', () => {
    delete process.env[CLOUDFLARE_ENV_VARS.CF_WORKER];
    delete process.env.VERCEL;
    process.env.NEXT_PUBLIC_VERCEL_URL = 'example.vercel.app';
    expect(detectPlatform()).toBe('vercel');
  });

  it('should return unknown when no platform detected', () => {
    delete process.env[CLOUDFLARE_ENV_VARS.CF_WORKER];
    delete process.env.VERCEL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    expect(detectPlatform()).toBe('unknown');
  });
});

describe('getExecutionContext', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return correct execution context', () => {
    const ctx = getExecutionContext();
    expect(ctx).toHaveProperty('platform');
    expect(ctx).toHaveProperty('isEdge');
    expect(ctx).toHaveProperty('isNode');
    expect(ctx).toHaveProperty('isDevelopment');
    expect(ctx).toHaveProperty('isProduction');
    expect(ctx).toHaveProperty('nodeVersion');
    expect(ctx).toHaveProperty('region');
  });

  it('should detect Node.js runtime', () => {
    const ctx = getExecutionContext();
    expect(ctx.isNode).toBe(true);
    expect(ctx.nodeVersion).not.toBeNull();
  });

  it('should detect development mode', () => {
    Object.defineProperty(process, 'env', {
      value: { ...originalEnv, NODE_ENV: 'development' },
      writable: true,
      configurable: true,
    });
    const ctx = getExecutionContext();
    expect(ctx.isDevelopment).toBe(true);
    expect(ctx.isProduction).toBe(false);
  });

  it('should detect production mode', () => {
    Object.defineProperty(process, 'env', {
      value: { ...originalEnv, NODE_ENV: 'production' },
      writable: true,
      configurable: true,
    });
    const ctx = getExecutionContext();
    expect(ctx.isProduction).toBe(true);
    expect(ctx.isDevelopment).toBe(false);
  });
});

describe('isEdgeRequest', () => {
  it('should return false for non-Cloudflare request', () => {
    const request = createMockRequest();
    expect(isEdgeRequest(request)).toBe(false);
  });

  it('should return true for Cloudflare request', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    expect(isEdgeRequest(request)).toBe(true);
  });
});

describe('getRequestLatency', () => {
  it('should return null when CF-RTT-MS header is not present', () => {
    const request = createMockRequest();
    expect(getRequestLatency(request)).toBeNull();
  });

  it('should return the RTT value in milliseconds', () => {
    const request = createMockRequest({
      'cf-rtt-ms': '150',
    });
    expect(getRequestLatency(request)).toBe(150);
  });

  it('should return null for invalid RTT value', () => {
    const request = createMockRequest({
      'cf-rtt-ms': 'invalid',
    });
    expect(getRequestLatency(request)).toBeNull();
  });

  it('should handle zero RTT value', () => {
    const request = createMockRequest({
      'cf-rtt-ms': '0',
    });
    expect(getRequestLatency(request)).toBe(0);
  });

  it('should handle large RTT values', () => {
    const request = createMockRequest({
      'cf-rtt-ms': '9999',
    });
    expect(getRequestLatency(request)).toBe(9999);
  });
});

describe('getVisitorScheme', () => {
  it('should return null when CF-Visitor header is not present', () => {
    const request = createMockRequest();
    expect(getVisitorScheme(request)).toBeNull();
  });

  it('should return https when scheme is https', () => {
    const request = createMockRequest({
      'cf-visitor': '{"scheme":"https"}',
    });
    expect(getVisitorScheme(request)).toBe('https');
  });

  it('should return http when scheme is http', () => {
    const request = createMockRequest({
      'cf-visitor': '{"scheme":"http"}',
    });
    expect(getVisitorScheme(request)).toBe('http');
  });

  it('should return null for invalid JSON', () => {
    const request = createMockRequest({
      'cf-visitor': 'not-valid-json',
    });
    expect(getVisitorScheme(request)).toBeNull();
  });

  it('should return null for invalid scheme value', () => {
    const request = createMockRequest({
      'cf-visitor': '{"scheme":"ftp"}',
    });
    expect(getVisitorScheme(request)).toBeNull();
  });

  it('should return null for missing scheme property', () => {
    const request = createMockRequest({
      'cf-visitor': '{"other":"value"}',
    });
    expect(getVisitorScheme(request)).toBeNull();
  });
});

describe('getCacheKey', () => {
  it('should generate basic cache key from URL', () => {
    const key = getCacheKey('https://api.example.com/data');
    expect(key).toBe('cache:api.example.com/data');
  });

  it('should include URL path in cache key', () => {
    const key = getCacheKey('https://api.example.com/api/v1/users');
    expect(key).toBe('cache:api.example.com/api/v1/users');
  });

  it('should include variants in cache key', () => {
    const key = getCacheKey('https://api.example.com/data', {
      locale: 'en-US',
    });
    expect(key).toBe('cache:api.example.com/data:locale=en-US');
  });

  it('should sort variants alphabetically', () => {
    const key = getCacheKey('https://api.example.com/data', {
      format: 'json',
      locale: 'en-US',
    });
    expect(key).toBe('cache:api.example.com/data:format=json:locale=en-US');
  });

  it('should handle invalid URL gracefully', () => {
    const key = getCacheKey('not-a-valid-url');
    expect(key).toBe('cache:not-a-valid-url');
  });

  it('should return base key when variants is empty', () => {
    const key = getCacheKey('https://api.example.com/data', {});
    expect(key).toBe('cache:api.example.com/data');
  });

  it('should handle multiple variant combinations', () => {
    const key = getCacheKey('https://api.example.com/data', {
      version: 'v1',
      format: 'json',
      locale: 'en-US',
    });
    expect(key).toContain('format=json');
    expect(key).toContain('locale=en-US');
    expect(key).toContain('version=v1');
  });
});

describe('CORRELATION_HEADERS', () => {
  it('should have correct header names', () => {
    expect(CORRELATION_HEADERS.REQUEST_ID).toBe('x-request-id');
    expect(CORRELATION_HEADERS.CORRELATION_ID).toBe('x-correlation-id');
    expect(CORRELATION_HEADERS.TRACE_ID).toBe('x-trace-id');
    expect(CORRELATION_HEADERS.SPAN_ID).toBe('x-span-id');
  });
});

describe('generateRequestId', () => {
  it('should generate a unique request ID', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(0);
  });

  it('should generate a valid UUID format when crypto.randomUUID available', () => {
    const id = generateRequestId();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(id) || id.startsWith('req_')).toBe(true);
  });
});

describe('getOrCreateRequestId', () => {
  it('should return existing request ID from header', () => {
    const request = createMockRequest({
      'x-request-id': 'existing-request-id',
    });
    expect(getOrCreateRequestId(request)).toBe('existing-request-id');
  });

  it('should use CF-Ray when available', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    expect(getOrCreateRequestId(request)).toBe('cf_7c1c2c3d4e5f6g7h');
  });

  it('should generate new ID when no headers present', () => {
    const request = createMockRequest();
    const id = getOrCreateRequestId(request);
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('getCorrelationId', () => {
  it('should return correlation ID from header', () => {
    const request = createMockRequest({
      'x-correlation-id': 'corr-123',
    });
    expect(getCorrelationId(request)).toBe('corr-123');
  });

  it('should fall back to trace ID', () => {
    const request = createMockRequest({
      'x-trace-id': 'trace-456',
    });
    expect(getCorrelationId(request)).toBe('trace-456');
  });

  it('should fall back to CF-Ray', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    expect(getCorrelationId(request)).toBe('7c1c2c3d4e5f6g7h');
  });

  it('should generate new ID when no correlation headers present', () => {
    const request = createMockRequest();
    const id = getCorrelationId(request);
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('createCorrelationHeaders', () => {
  it('should create headers with request and correlation IDs', () => {
    const request = createMockRequest({
      'x-request-id': 'req-123',
      'x-correlation-id': 'corr-456',
    });
    const headers = createCorrelationHeaders(request);
    expect(headers['x-request-id']).toBe('req-123');
    expect(headers['x-correlation-id']).toBe('corr-456');
  });

  it('should include CF-Ray when available', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    const headers = createCorrelationHeaders(request);
    expect(headers['x-cf-ray']).toBe('7c1c2c3d4e5f6g7h');
  });

  it('should allow overrides', () => {
    const request = createMockRequest();
    const headers = createCorrelationHeaders(request, {
      REQUEST_ID: 'override-req',
    });
    expect(headers['x-request-id']).toBe('override-req');
  });
});

describe('addCorrelationHeaders', () => {
  it('should add correlation headers to response', () => {
    const request = createMockRequest({
      'x-request-id': 'req-123',
      'x-correlation-id': 'corr-456',
    });
    const originalResponse = new Response('test', { status: 200 });
    const response = addCorrelationHeaders(originalResponse, request);
    expect(response.headers.get('x-request-id')).toBe('req-123');
    expect(response.headers.get('x-correlation-id')).toBe('corr-456');
    expect(response.status).toBe(200);
  });

  it('should preserve existing response headers', () => {
    const request = createMockRequest();
    const originalResponse = new Response('test', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    const response = addCorrelationHeaders(originalResponse, request);
    expect(response.headers.get('x-request-id')).not.toBeNull();
    expect(response.status).toBe(200);
  });
});

describe('getRequestContext', () => {
  it('should extract full request context', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-connecting-ip': '192.168.1.1',
      'cf-ipcountry': 'US',
    });
    const context = getRequestContext(request);
    expect(context.cfRay).toBe('7c1c2c3d4e5f6g7h');
    expect(context.clientIp).toBe('192.168.1.1');
    expect(context.country).toBe('US');
    expect(context.path).toBe('/');
    expect(context.method).toBe('GET');
    expect(context.timestamp).toBeDefined();
    expect(context.requestId).toBeDefined();
    expect(context.correlationId).toBeDefined();
  });

  it('should handle request without Cloudflare headers', () => {
    const request = createMockRequest();
    const context = getRequestContext(request);
    expect(context.cfRay).toBeNull();
    expect(context.clientIp).toBeNull();
    expect(context.country).toBeNull();
    expect(context.requestId).toBeDefined();
  });
});

describe('createEarlyHintsHeaders', () => {
  it('should return empty object when no hints provided', () => {
    const headers = createEarlyHintsHeaders({});
    expect(headers).toEqual({});
  });

  it('should create preload headers for CSS', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/styles.css'],
    });
    expect(headers['link']).toBe('</styles.css>; rel=preload; as=style');
  });

  it('should create preload headers for JavaScript', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/app.js'],
    });
    expect(headers['link']).toBe('</app.js>; rel=preload; as=script');
  });

  it('should create preload headers for fonts', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/font.woff2'],
    });
    expect(headers['link']).toBe('</font.woff2>; rel=preload; as=font');
  });

  it('should create preconnect headers', () => {
    const headers = createEarlyHintsHeaders({
      preconnect: ['https://api.example.com'],
    });
    expect(headers['link']).toBe('<https://api.example.com>; rel=preconnect');
  });

  it('should combine multiple hints', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/styles.css', '/app.js'],
      preconnect: ['https://api.example.com'],
    });
    expect(headers['link']).toContain('</styles.css>; rel=preload; as=style');
    expect(headers['link']).toContain('</app.js>; rel=preload; as=script');
    expect(headers['link']).toContain(
      '<https://api.example.com>; rel=preconnect'
    );
  });

  it('should handle images', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/hero.webp', '/icon.png'],
    });
    expect(headers['link']).toContain('as=image');
  });

  it('should handle resources without recognized extensions', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/data.json'],
    });
    expect(headers['link']).toBe('</data.json>; rel=preload');
  });

  it('should handle query strings in URLs', () => {
    const headers = createEarlyHintsHeaders({
      preload: ['/script.js?v=123'],
    });
    expect(headers['link']).toBe('</script.js?v=123>; rel=preload; as=script');
  });
});

describe('shouldSendEarlyHints', () => {
  it('should return true for Cloudflare request with caching', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-cache-status': 'HIT',
    });
    expect(shouldSendEarlyHints(request)).toBe(true);
  });

  it('should return true for Cloudflare request without cache status', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
    });
    expect(shouldSendEarlyHints(request)).toBe(true);
  });

  it('should return false for non-Cloudflare request', () => {
    const request = createMockRequest();
    expect(shouldSendEarlyHints(request)).toBe(false);
  });

  it('should return false when cache is bypassed', () => {
    const request = createMockRequest({
      'cf-ray': '7c1c2c3d4e5f6g7h',
      'cf-cache-status': 'BYPASS',
    });
    expect(shouldSendEarlyHints(request)).toBe(false);
  });
});

describe('detectBot', () => {
  it('should detect bot from low bot score', () => {
    const request = createMockRequest({
      'cf-bot-score': '20',
    });
    const result = detectBot(request);
    expect(result.isBot).toBe(true);
    expect(result.botScore).toBe(20);
  });

  it('should detect human from high bot score', () => {
    const request = createMockRequest({
      'cf-bot-score': '80',
    });
    const result = detectBot(request);
    expect(result.isBot).toBe(false);
    expect(result.botScore).toBe(80);
  });

  it('should detect bot from high threat score', () => {
    const request = createMockRequest({
      'cf-threat-score': '75',
    });
    const result = detectBot(request);
    expect(result.isBot).toBe(true);
    expect(result.threatScore).toBe(75);
  });

  it('should detect WARP usage', () => {
    const request = createMockRequest({
      'cf-warp': '1',
    });
    const result = detectBot(request);
    expect(result.isWarp).toBe(true);
  });

  it('should extract TLS fingerprint', () => {
    const request = createMockRequest({
      'cf-tls-fingerprint': 'abc123def456',
    });
    const result = detectBot(request);
    expect(result.tlsFingerprint).toBe('abc123def456');
  });

  it('should return default values for non-Cloudflare request', () => {
    const request = createMockRequest();
    const result = detectBot(request);
    expect(result.isBot).toBe(false);
    expect(result.botScore).toBeNull();
    expect(result.threatScore).toBeNull();
    expect(result.isWarp).toBe(false);
    expect(result.tlsFingerprint).toBeNull();
  });

  it('should handle all headers together', () => {
    const request = createMockRequest({
      'cf-bot-score': '25',
      'cf-threat-score': '30',
      'cf-warp': 'true',
      'cf-tls-fingerprint': 'fingerprint123',
    });
    const result = detectBot(request);
    expect(result.isBot).toBe(true); // bot score < 30
    expect(result.botScore).toBe(25);
    expect(result.threatScore).toBe(30);
    expect(result.isWarp).toBe(true);
    expect(result.tlsFingerprint).toBe('fingerprint123');
  });

  it('should handle invalid numeric values', () => {
    const request = createMockRequest({
      'cf-bot-score': 'invalid',
      'cf-threat-score': 'not-a-number',
    });
    const result = detectBot(request);
    expect(result.botScore).toBeNull();
    expect(result.threatScore).toBeNull();
  });
});

describe('Extended CLOUDFLARE_HEADERS', () => {
  it('should have CF-WARP header', () => {
    expect(CLOUDFLARE_HEADERS.CF_WARP).toBe('cf-warp');
  });

  it('should have CF-EW-VTT header for Early Hints', () => {
    expect(CLOUDFLARE_HEADERS.CF_EW_VTT).toBe('cf-ew-vtt');
  });

  it('should have CF-RTT-MS header', () => {
    expect(CLOUDFLARE_HEADERS.CF_RTT_MS).toBe('cf-rtt-ms');
  });

  it('should have CF-TLS-FINGERPRINT header', () => {
    expect(CLOUDFLARE_HEADERS.CF_TLS_FINGERPRINT).toBe('cf-tls-fingerprint');
  });

  it('should have CF-BOT-SCORE header', () => {
    expect(CLOUDFLARE_HEADERS.CF_BOT_SCORE).toBe('cf-bot-score');
  });

  it('should have CF-THREAT-SCORE header', () => {
    expect(CLOUDFLARE_HEADERS.CF_THREAT_SCORE).toBe('cf-threat-score');
  });
});

import {
  CloudflareKV,
  createKVCache,
  KV_CACHE_OPTIONS,
} from '@/lib/cloudflare';

function createMockKVNamespace(): KVNamespace {
  const store = new Map<string, { value: string; metadata?: unknown }>();

  return {
    get: jest.fn(async (key: string, type?: string | object) => {
      const entry = store.get(key);
      if (!entry) return null;

      const typeStr =
        typeof type === 'string'
          ? type
          : (type as { type?: string })?.type || 'text';
      if (typeStr === 'json') {
        return JSON.parse(entry.value);
      }
      if (typeStr === 'arrayBuffer') {
        return new TextEncoder().encode(entry.value).buffer;
      }
      return entry.value;
    }),
    getWithMetadata: jest.fn(async (key: string, _type?: string) => {
      const entry = store.get(key);
      if (!entry) return { value: null, metadata: null };
      return {
        value: JSON.parse(entry.value),
        metadata: entry.metadata ?? null,
      };
    }) as KVNamespace['getWithMetadata'],
    put: jest.fn(
      async (
        key: string,
        value: string | ReadableStream | ArrayBuffer,
        _options?: unknown
      ) => {
        const valueStr =
          typeof value === 'string'
            ? value
            : value instanceof ArrayBuffer
              ? new TextDecoder().decode(value)
              : JSON.stringify(value);
        store.set(key, { value: valueStr });
      }
    ),
    delete: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    list: jest.fn(
      async (options?: {
        prefix?: string;
        limit?: number;
        cursor?: string;
      }) => {
        const keys = Array.from(store.keys())
          .filter((k) => !options?.prefix || k.startsWith(options.prefix))
          .slice(0, options?.limit ?? 1000)
          .map((name) => ({ name }));
        return { keys, list_complete: true, cursor: options?.cursor };
      }
    ),
  };
}

describe('CloudflareKV', () => {
  describe('constructor', () => {
    it('should create instance with null KV', () => {
      const cache = new CloudflareKV(null);
      expect(cache.isAvailable).toBe(false);
    });

    it('should create instance with undefined KV', () => {
      const cache = new CloudflareKV(undefined);
      expect(cache.isAvailable).toBe(false);
    });

    it('should create instance with KV namespace', () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      expect(cache.isAvailable).toBe(true);
    });

    it('should support key prefix', () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv, { prefix: 'myapp' });
      expect(cache.isAvailable).toBe(true);
    });
  });

  describe('get', () => {
    it('should return null when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.get('key');
      expect(result).toBeNull();
    });

    it('should get value from KV with JSON parsing', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key', { foo: 'bar' });
      const result = await cache.get<{ foo: string }>('key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return null for non-existent key', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getText', () => {
    it('should return null when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.getText('key');
      expect(result).toBeNull();
    });

    it('should get text value from KV', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.setText('key', 'hello world');
      const result = await cache.getText('key');
      expect(result).toBe('hello world');
    });
  });

  describe('set', () => {
    it('should return false when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.set('key', { foo: 'bar' });
      expect(result).toBe(false);
    });

    it('should set value in KV with JSON serialization', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.set('key', { foo: 'bar' }, { ttl: 60 });
      expect(result).toBe(true);
    });

    it('should set value with TTL', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.set('key', 'value', {
        ttl: CF_CACHE_TTL.SHORT,
      });
      expect(result).toBe(true);
    });
  });

  describe('setText', () => {
    it('should return false when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.setText('key', 'value');
      expect(result).toBe(false);
    });

    it('should set text value in KV', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.setText('key', 'plain text');
      expect(result).toBe(true);
    });
  });

  describe('delete', () => {
    it('should return false when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.delete('key');
      expect(result).toBe(false);
    });

    it('should delete key from KV', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key', 'value');
      const result = await cache.delete('key');
      expect(result).toBe(true);
    });
  });

  describe('exists', () => {
    it('should return false when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.exists('key');
      expect(result).toBe(false);
    });

    it('should return true for existing key', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key', 'value');
      const result = await cache.exists('key');
      expect(result).toBe(true);
    });

    it('should return false for non-existing key', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.exists('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getWithMetadata', () => {
    it('should return nulls when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.getWithMetadata('key');
      expect(result).toEqual({ value: null, metadata: null });
    });

    it('should return value and metadata for existing key', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key', { foo: 'bar' });
      const result = await cache.getWithMetadata<{ foo: string }>('key');
      expect(result.value).toEqual({ foo: 'bar' });
    });

    it('should return nulls for non-existent key', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const result = await cache.getWithMetadata('nonexistent');
      expect(result).toEqual({ value: null, metadata: null });
    });
  });

  describe('getOrSet', () => {
    it('should fetch and cache when key does not exist', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      const fetcher = jest.fn().mockResolvedValue({ data: 'fetched' });

      const result = await cache.getOrSet('key', fetcher, { ttl: 60 });

      expect(result).toEqual({ data: 'fetched' });
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should return cached value when key exists', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key', { data: 'cached' });
      const fetcher = jest.fn().mockResolvedValue({ data: 'fetched' });

      const result = await cache.getOrSet('key', fetcher);

      expect(result).toEqual({ data: 'cached' });
      expect(fetcher).not.toHaveBeenCalled();
    });

    it('should fetch when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const fetcher = jest.fn().mockResolvedValue({ data: 'fetched' });

      const result = await cache.getOrSet('key', fetcher);

      expect(result).toEqual({ data: 'fetched' });
      expect(fetcher).toHaveBeenCalledTimes(1);
    });
  });

  describe('list', () => {
    it('should return null when KV is not available', async () => {
      const cache = new CloudflareKV(null);
      const result = await cache.list();
      expect(result).toBeNull();
    });

    it('should list keys from KV', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv);
      await cache.set('key1', 'value1');
      await cache.set('key2', 'value2');

      const result = await cache.list();

      expect(result).not.toBeNull();
      expect(result?.keys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('prefix support', () => {
    it('should prefix keys on get', async () => {
      const kv = createMockKVNamespace();
      const cache = new CloudflareKV(kv, { prefix: 'myapp' });
      await cache.set('key', 'value');

      const result = await cache.get('key');

      expect(result).toBe('value');
    });
  });
});

describe('createKVCache', () => {
  it('should create cache with env binding', () => {
    const kv = createMockKVNamespace();
    const cache = createKVCache({ CACHE_KV: kv });
    expect(cache.isAvailable).toBe(true);
  });

  it('should create cache without env binding', () => {
    const cache = createKVCache({});
    expect(cache.isAvailable).toBe(false);
  });

  it('should create cache with undefined env', () => {
    const cache = createKVCache(undefined);
    expect(cache.isAvailable).toBe(false);
  });

  it('should support custom binding name', () => {
    const kv = createMockKVNamespace();
    const cache = createKVCache({ MY_CACHE: kv }, 'MY_CACHE');
    expect(cache.isAvailable).toBe(true);
  });

  it('should support prefix option', () => {
    const kv = createMockKVNamespace();
    const cache = createKVCache({ CACHE_KV: kv }, 'CACHE_KV', {
      prefix: 'test',
    });
    expect(cache.isAvailable).toBe(true);
  });
});

describe('KV_CACHE_OPTIONS', () => {
  it('should have NO_STORE option', () => {
    expect(KV_CACHE_OPTIONS.NO_STORE.ttl).toBe(CF_CACHE_TTL.NO_STORE);
  });

  it('should have SHORT option', () => {
    expect(KV_CACHE_OPTIONS.SHORT.ttl).toBe(CF_CACHE_TTL.SHORT);
  });

  it('should have MEDIUM option', () => {
    expect(KV_CACHE_OPTIONS.MEDIUM.ttl).toBe(CF_CACHE_TTL.MEDIUM);
  });

  it('should have LONG option', () => {
    expect(KV_CACHE_OPTIONS.LONG.ttl).toBe(CF_CACHE_TTL.LONG);
  });

  it('should have IMMUTABLE option', () => {
    expect(KV_CACHE_OPTIONS.IMMUTABLE.ttl).toBe(CF_CACHE_TTL.IMMUTABLE);
  });
});
