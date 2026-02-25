import type { ApiResponse } from '@/lib/api-handler';
import {
  unwrapApiResponse,
  unwrapApiResponseSafe,
  apiRequest,
  ApiRequestError,
} from '@/lib/api-client';
import { buildApiUrl } from './config/test-config';

interface TestData {
  message: string;
  count: number;
}

describe('api-client utilities', () => {
  describe('unwrapApiResponse', () => {
    it('should unwrap valid API response', () => {
      const response = {
        success: true,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as ApiResponse<TestData>;
      const result = unwrapApiResponse<TestData>(response);
      expect(result).toEqual({ message: 'test', count: 42 });
    });

    it('should throw error when success is false', () => {
      const response = {
        success: false,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      expect(() => unwrapApiResponse<TestData>(response)).toThrow(
        'Invalid API response: success must be true'
      );
    });

    it('should throw error when data is undefined', () => {
      const response = {
        success: true,
        data: undefined,
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      expect(() => unwrapApiResponse<TestData>(response)).toThrow(
        'Invalid API response: data is undefined'
      );
    });
  });

  describe('unwrapApiResponseSafe', () => {
    it('should unwrap valid API response', () => {
      const response = {
        success: true,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as ApiResponse<TestData>;
      const result = unwrapApiResponseSafe<TestData>(response, {
        message: '',
        count: 0,
      });
      expect(result).toEqual({ message: 'test', count: 42 });
    });

    it('should return default value when response is null', () => {
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(null, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when response is undefined', () => {
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(undefined, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when success is false', () => {
      const response = {
        success: false,
        data: { message: 'test', count: 42 },
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(response, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value when data is undefined', () => {
      const response = {
        success: true,
        data: undefined,
        requestId: 'req_123',
        timestamp: '2024-01-08T00:00:00Z',
      } as unknown as ApiResponse<TestData>;
      const defaultValue = { message: 'default', count: 0 };
      const result = unwrapApiResponseSafe<TestData>(response, defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('ApiRequestError', () => {
    it('should create error with message and status code', () => {
      const error = new ApiRequestError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ApiRequestError');
    });

    it('should include optional properties', () => {
      const error = new ApiRequestError('Not found', 404, {
        code: 'NOT_FOUND',
        requestId: 'req_123',
        retryable: false,
        details: [{ field: 'id', message: 'Invalid ID' }],
      });
      expect(error.code).toBe('NOT_FOUND');
      expect(error.requestId).toBe('req_123');
      expect(error.retryable).toBe(false);
      expect(error.details).toEqual([{ field: 'id', message: 'Invalid ID' }]);
    });

    it('should default retryable to false', () => {
      const error = new ApiRequestError('Error', 500);
      expect(error.retryable).toBe(false);
    });

    it('should be instance of Error', () => {
      const error = new ApiRequestError('Error', 500);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiRequestError);
    });
  });

  describe('apiRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('successful requests', () => {
      it('should make GET request and unwrap response', async () => {
        const mockResponse = {
          success: true,
          data: { message: 'test', count: 42 },
          requestId: 'req_123',
          timestamp: '2024-01-08T00:00:00Z',
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers({ 'X-Request-ID': 'req_123' }),
        });

        const result = await apiRequest<TestData>('/api/test');

        expect(result.data).toEqual({ message: 'test', count: 42 });
        expect(result.requestId).toBe('req_123');
      });

      it('should not unwrap when unwrap is false', async () => {
        const mockResponse = {
          success: true,
          data: { message: 'test', count: 42 },
          requestId: 'req_123',
        };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        });

        const result = await apiRequest<ApiResponse<TestData>>('/api/test', {
          unwrap: false,
        });

        expect(result.data.success).toBe(true);
        expect(result.data.data).toEqual({ message: 'test', count: 42 });
      });

      it('should return raw response when not wrapped', async () => {
        const mockResponse = { items: [1, 2, 3] };

        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers(),
        });

        const result = await apiRequest<{ items: number[] }>('/api/test');

        expect(result.data).toEqual({ items: [1, 2, 3] });
      });
    });

    describe('request options', () => {
      it('should set Content-Type for JSON body', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
          headers: new Headers(),
        });

        await apiRequest('/api/test', {
          method: 'POST',
          body: { name: 'test' },
        });

        expect(global.fetch).toHaveBeenCalledWith(
          '/api/test',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'test' }),
          })
        );

        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        expect(callArgs.headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
          headers: new Headers(),
        });

        await apiRequest('/api/test', {
          method: 'POST',
          body: 'plain text',
          headers: { 'Content-Type': 'text/plain' },
        });

        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        expect(callArgs.headers.get('Content-Type')).toBe('text/plain');
      });

      it('should not stringify string body', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
          headers: new Headers(),
        });

        await apiRequest('/api/test', {
          method: 'POST',
          body: 'raw string body',
        });

        const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
        expect(callArgs.body).toBe('raw string body');
      });
    });

    describe('error handling', () => {
      it('should throw ApiRequestError on non-OK response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: () =>
            Promise.resolve({
              error: 'Resource not found',
              code: 'NOT_FOUND',
              requestId: 'req_404',
              retryable: false,
            }),
          headers: new Headers({ 'X-Request-ID': 'req_404' }),
        });

        await expect(apiRequest('/api/test')).rejects.toThrow(ApiRequestError);

        try {
          await apiRequest('/api/test');
        } catch (error) {
          expect((error as ApiRequestError).statusCode).toBe(404);
          expect((error as ApiRequestError).code).toBe('NOT_FOUND');
          expect((error as ApiRequestError).requestId).toBe('req_404');
          expect((error as ApiRequestError).retryable).toBe(false);
        }
      });

      it('should handle non-JSON error response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('Invalid JSON')),
          headers: new Headers(),
        });

        await expect(apiRequest('/api/test')).rejects.toThrow(
          'Internal Server Error'
        );

        try {
          await apiRequest('/api/test');
        } catch (error) {
          expect((error as ApiRequestError).statusCode).toBe(500);
        }
      });

      it('should use "Request failed" when no error message', async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: '',
          json: () => Promise.resolve({}),
          headers: new Headers(),
        });

        await expect(apiRequest('/api/test')).rejects.toThrow('Request failed');
      });
    });

    describe('timeout', () => {
      it('should pass timeout to fetchWithTimeout', async () => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ success: true, data: {} }),
          headers: new Headers(),
        });
        global.fetch = mockFetch;

        await apiRequest('/api/test', { timeoutMs: 5000 });

        const abortSignal = mockFetch.mock.calls[0][1].signal;
        expect(abortSignal).toBeInstanceOf(AbortSignal);
      });
    });
  });
});
