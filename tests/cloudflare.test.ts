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
  getCacheKey,
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
