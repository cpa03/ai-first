jest.mock('@/lib/validation', () => ({
  validateRequestSize: jest.fn().mockReturnValue({ valid: true, errors: [] }),
}));

jest.mock('@/lib/rate-limit', () => ({
  checkUserRateLimit: jest.fn().mockReturnValue({
    userInfo: { userId: 'test-user', identifier: 'test', role: 'user' },
    info: {
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 60000).toISOString(),
    },
    allowed: true,
  }),
  rateLimitConfigs: {
    lenient: { maxRequests: 100, windowMs: 60000 },
    moderate: { maxRequests: 50, windowMs: 60000 },
    strict: { maxRequests: 20, windowMs: 60000 },
  },
  rateLimitResponse: jest.fn().mockReturnValue(null),
}));

jest.mock('@/lib/metrics', () => ({
  httpRequestDuration: {
    observe: jest.fn(),
    labels: jest.fn().mockReturnValue({ observe: jest.fn() }),
  },
  httpRequestErrors: { inc: jest.fn() },
  httpRequestTotal: { inc: jest.fn() },
}));

jest.mock('@/lib/security/suspicious-patterns', () => ({
  detectSuspiciousPatterns: jest
    .fn()
    .mockReturnValue({ detected: false, patterns: [] }),
}));

jest.mock('@/lib/security/audit-log', () => ({
  SecurityAuditLog: { log: jest.fn() },
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCSRF: jest.fn().mockReturnValue({ valid: true }),
}));

jest.mock('@/lib/resilience/timeout-manager', () => ({
  TimeoutManager: {
    withTimeout: jest
      .fn()
      .mockImplementation((fn: () => Promise<unknown>) => fn()),
  },
}));

jest.mock('@/lib/db', () => ({
  dbService: {
    checkConnection: jest.fn(),
  },
}));

import { GET as liveGET } from '@/app/api/health/live/route';
import { GET as readyGET } from '@/app/api/health/ready/route';
import { dbService } from '@/lib/db';
import { createMockRequest } from './utils/_testHelpers';
import { buildApiUrl } from './config/test-config';

describe('/api/health/live GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with liveness status', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/live'),
    });

    const response = await liveGET(request, {
      params: {},
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('ok');
    expect(data.data.service).toBe('liveness');
    expect(data.data.timestamp).toBeDefined();
  });

  it('should include environment info', async () => {
    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/live'),
    });

    const response = await liveGET(request, {
      params: {},
    });
    const data = await response.json();

    expect(data.data.environment).toBeDefined();
  });
});

describe('/api/health/ready GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 when database is healthy', async () => {
    (dbService.checkConnection as jest.Mock).mockResolvedValue({
      client: true,
      admin: true,
    });

    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/ready'),
    });

    const response = await readyGET(request, {
      params: {},
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('ready');
    expect(data.data.service).toBe('readiness');
    expect(data.data.checks.database.status).toBe('ready');
  });

  it('should return 503 when database is unhealthy', async () => {
    (dbService.checkConnection as jest.Mock).mockResolvedValue({
      client: true,
      admin: false,
    });

    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/ready'),
    });

    const response = await readyGET(request, {
      params: {},
    });

    expect(response.status).toBe(503);
  });

  it('should return 503 when database connection throws', async () => {
    (dbService.checkConnection as jest.Mock).mockRejectedValue(
      new Error('Connection refused')
    );

    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/ready'),
    });

    const response = await readyGET(request, {
      params: {},
    });

    expect(response.status).toBe(503);
  });

  it('should include response time in database check', async () => {
    (dbService.checkConnection as jest.Mock).mockResolvedValue({
      client: true,
      admin: true,
    });

    const request = createMockRequest({
      method: 'GET',
      url: buildApiUrl('/health/ready'),
    });

    const response = await readyGET(request, {
      params: {},
    });
    const data = await response.json();

    expect(data.data.checks.database.responseTime).toBeGreaterThanOrEqual(0);
  });
});
