import { NextRequest } from 'next/server';
import {
  withApiHandler,
  successResponse,
  notFoundResponse,
  badRequestResponse,
  ApiContext,
} from '@/lib/api-handler';
import { AppError, ErrorCode } from '@/lib/errors';
import { rateLimitConfigs } from '@/lib/rate-limit';

jest.mock('@/lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  rateLimitConfigs: {
    strict: { windowMs: 60000, maxRequests: 10 },
    moderate: { windowMs: 60000, maxRequests: 30 },
    lenient: { windowMs: 60000, maxRequests: 60 },
  },
  rateLimitResponse: jest.fn(
    (resetTime) => new Response('Too many requests', { status: 429 })
  ),
  addRateLimitHeaders: jest.fn((response, info) => response),
}));

import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

describe('withApiHandler', () => {
  const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<
    typeof checkRateLimit
  >;
  const mockRateLimitResponse = rateLimitResponse as jest.MockedFunction<
    typeof rateLimitResponse
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful requests', () => {
    it('should generate and inject request ID', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(response.headers.get('X-Request-ID')).toMatch(
        /^req_\d+_[a-z0-9]{9}$/
      );
    });

    it('should pass ApiContext to handler with request ID', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      await wrapped(request);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      const context: ApiContext = mockHandler.mock.calls[0][0];
      expect(context).toHaveProperty('requestId');
      expect(context).toHaveProperty('request');
      expect(context.request).toBe(request);
    });

    it('should allow request through when rate limit check passes', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('Success'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Success');
    });

    it('should preserve handler response headers', async () => {
      const mockHandler = jest.fn(() =>
        Promise.resolve(
          new Response('OK', {
            headers: { 'X-Custom-Header': 'custom-value' },
          })
        )
      );
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('rate limiting', () => {
    it('should use lenient config by default', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      await wrapped(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'unknown',
        rateLimitConfigs.lenient
      );
    });

    it('should use specified rate limit config', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any, {
        rateLimit: 'strict',
      });
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      await wrapped(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        'unknown',
        rateLimitConfigs.strict
      );
    });

    it('should extract IP from x-forwarded-for header', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      await wrapped(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        '192.168.1.1',
        rateLimitConfigs.lenient
      );
    });

    it('should return rate limit response when limit exceeded', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');
      const resetTime = Date.now() + 60000;

      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        info: {
          limit: 60,
          remaining: 0,
          reset: resetTime,
        },
      });
      mockRateLimitResponse.mockReturnValue(
        new Response('Too many requests', { status: 429 })
      );

      const response = await wrapped(request);

      expect(response.status).toBe(429);
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockRateLimitResponse).toHaveBeenCalledWith(
        {
          limit: 60,
          remaining: 0,
          reset: resetTime,
        },
        expect.stringMatching(/^req_\d+_[a-z0-9]{9}$/)
      );
    });

    it('should not call handler when rate limit exceeded', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        info: {
          limit: 60,
          remaining: 0,
          reset: Date.now() + 60000,
        },
      });
      mockRateLimitResponse.mockReturnValue(
        new Response('Too many requests', { status: 429 })
      );

      await wrapped(request);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle AppError with toErrorResponse', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(
          new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400)
        );
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.error).toBe('Test error');
    });

    it('should include request ID in error response', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(
          new AppError('Test error', ErrorCode.INTERNAL_ERROR, 500)
        );
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.headers.get('X-Request-ID')).toBeTruthy();
    });

    it('should handle standard JavaScript Error', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(new Error('Standard error'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    it('should handle non-Error thrown values', async () => {
      const mockHandler = jest.fn().mockRejectedValue('String error');
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    it('should handle thrown objects', async () => {
      const mockHandler = jest.fn().mockRejectedValue({
        message: 'Object error',
        code: 'CUSTOM_ERROR',
      });
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });

    it('should handle null thrown value', async () => {
      const mockHandler = jest.fn().mockRejectedValue(null);
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body).toHaveProperty('error');
    });
  });

  describe('request size validation', () => {
    it('should validate request size by default', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(200);
    });

    it('should skip size validation when validateSize is false', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any, {
        validateSize: false,
      });
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(200);
    });

    it('should handle size validation error', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test', {
        method: 'POST',
        body: JSON.stringify({ data: 'x'.repeat(10 * 1024 * 1024) }),
        headers: { 'content-length': String(10 * 1024 * 1024 + 1) },
      });

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 60,
          remaining: 59,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(response.status).toBe(413);
      const body = await response.json();
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('combined scenarios', () => {
    it('should work with rate limiting and error handling together', async () => {
      const mockHandler = jest
        .fn()
        .mockRejectedValue(
          new AppError('Test error', ErrorCode.INTERNAL_ERROR, 500)
        );
      const wrapped = withApiHandler(mockHandler as any, {
        rateLimit: 'moderate',
      });
      const request = new NextRequest('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '10.0.0.1' },
      });

      mockCheckRateLimit.mockReturnValue({
        allowed: true,
        info: {
          limit: 30,
          remaining: 29,
          reset: Date.now() + 60000,
        },
      });

      const response = await wrapped(request);

      expect(mockCheckRateLimit).toHaveBeenCalledWith(
        '10.0.0.1',
        rateLimitConfigs.moderate
      );
      expect(response.status).toBe(500);
      expect(response.headers.get('X-Request-ID')).toBeTruthy();
    });

    it('should prioritize rate limit check over handler execution', async () => {
      const mockHandler = jest.fn().mockResolvedValue(new Response('OK'));
      const wrapped = withApiHandler(mockHandler as any);
      const request = new NextRequest('http://localhost/api/test');

      mockCheckRateLimit.mockReturnValue({
        allowed: false,
        info: {
          limit: 60,
          remaining: 0,
          reset: Date.now() + 60000,
        },
      });
      mockRateLimitResponse.mockReturnValue(
        new Response('Too many requests', { status: 429 })
      );

      await wrapped(request);

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});

describe('successResponse', () => {
  it('should create success response with default status 200', () => {
    const data = { message: 'Success' };
    const response = successResponse(data);

    expect(response.status).toBe(200);
  });

  it('should create success response with custom status', () => {
    const data = { message: 'Created' };
    const response = successResponse(data, 201);

    expect(response.status).toBe(201);
  });

  it('should serialize data correctly', async () => {
    const data = { id: 1, name: 'Test' };
    const response = successResponse(data);
    const body = await response.json();

    expect(body).toEqual(data);
  });

  it('should handle array data', async () => {
    const data = [1, 2, 3];
    const response = successResponse(data);
    const body = await response.json();

    expect(body).toEqual(data);
  });

  it('should handle null data', async () => {
    const response = successResponse(null);
    const body = await response.json();

    expect(body).toBeNull();
  });

  it('should handle string data', async () => {
    const data = 'Test message';
    const response = successResponse(data);
    const body = await response.json();

    expect(body).toBe(data);
  });
});

describe('notFoundResponse', () => {
  it('should create not found response with default message', async () => {
    const response = notFoundResponse();
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Resource not found');
    expect(body.code).toBe('NOT_FOUND');
  });

  it('should create not found response with custom message', async () => {
    const response = notFoundResponse('Custom not found message');
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Custom not found message');
    expect(body.code).toBe('NOT_FOUND');
  });
});

describe('badRequestResponse', () => {
  it('should create bad request response with message', async () => {
    const response = badRequestResponse('Invalid input');
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid input');
    expect(body.code).toBe('BAD_REQUEST');
  });

  it('should create bad request response with details', async () => {
    const details = [
      { field: 'email', message: 'Invalid email format' },
      { field: 'password', message: 'Password too short' },
    ];
    const response = badRequestResponse('Validation failed', details);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Validation failed');
    expect(body.code).toBe('BAD_REQUEST');
    expect(body.details).toEqual(details);
  });

  it('should handle empty details array', async () => {
    const response = badRequestResponse('Bad request', []);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.details).toEqual([]);
  });
});
