import {
  AppError,
  ValidationError,
  RateLimitError,
  ExternalServiceError,
  TimeoutError,
  CircuitBreakerError,
  RetryExhaustedError as AppRetryExhaustedError,
  ErrorCode,
  ErrorDetail,
  toErrorResponse,
  generateRequestId,
  isRetryableError,
} from '@/lib/errors';

describe('AppError', () => {
  describe('construction', () => {
    it('should create basic AppError', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(false);
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with custom statusCode', () => {
      const error = new AppError('Not found', ErrorCode.NOT_FOUND, 404);

      expect(error.statusCode).toBe(404);
    });

    it('should create AppError with details', () => {
      const details: ErrorDetail[] = [
        { field: 'email', message: 'Invalid email format' },
      ];

      const error = new AppError(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        details
      );

      expect(error.details).toEqual(details);
    });

    it('should create AppError with retryable flag', () => {
      const error = new AppError(
        'Temporary error',
        ErrorCode.SERVICE_UNAVAILABLE,
        503,
        [],
        true
      );

      expect(error.retryable).toBe(true);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('toJSON', () => {
    it('should convert to ErrorResponse format', () => {
      const error = new AppError(
        'Test error',
        ErrorCode.INTERNAL_ERROR,
        500,
        [],
        true
      );
      const json = error.toJSON();

      expect(json.error).toBe('Test error');
      expect(json.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(json.details).toEqual([]);
      expect(json.timestamp).toBeDefined();
      expect(json.retryable).toBe(true);
    });

    it('should include timestamp in ISO format', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);
      const json = error.toJSON();

      expect(json.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('should redact PII in message', () => {
      const error = new AppError(
        'User with email test@example.com already exists',
        ErrorCode.CONFLICT
      );
      const json = error.toJSON();

      expect(json.error).not.toContain('test@example.com');
      expect(json.error).toContain('[REDACTED_EMAIL]');
    });

    it('should redact PII in details', () => {
      const details: ErrorDetail[] = [
        {
          field: 'email',
          message: 'User with email test@example.com already exists',
        },
      ];
      const error = new AppError(
        'Validation failed',
        ErrorCode.VALIDATION_ERROR,
        400,
        details
      );
      const json = error.toJSON();

      expect(json.details![0].message).not.toContain('test@example.com');
      expect(json.details![0].message).toContain('[REDACTED_EMAIL]');
    });

    it('should redact PII in ValidationError (subclass)', () => {
      const details: ErrorDetail[] = [
        {
          field: 'email',
          message: 'Email test@example.com is invalid',
        },
      ];
      const error = new ValidationError(details);
      const json = error.toJSON();

      expect(json.details![0].message).not.toContain('test@example.com');
      expect(json.details![0].message).toContain('[REDACTED_EMAIL]');
    });

    it('should handle undefined details', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);
      const json = error.toJSON();

      expect(json.details).toBeUndefined();
    });
  });

  describe('ErrorCode enum', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ErrorCode.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
      expect(ErrorCode.EXTERNAL_SERVICE_ERROR).toBe('EXTERNAL_SERVICE_ERROR');
      expect(ErrorCode.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ErrorCode.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
      expect(ErrorCode.AUTHORIZATION_ERROR).toBe('AUTHORIZATION_ERROR');
      expect(ErrorCode.NOT_FOUND).toBe('NOT_FOUND');
      expect(ErrorCode.CONFLICT).toBe('CONFLICT');
      expect(ErrorCode.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
      expect(ErrorCode.CIRCUIT_BREAKER_OPEN).toBe('CIRCUIT_BREAKER_OPEN');
      expect(ErrorCode.RETRY_EXHAUSTED).toBe('RETRY_EXHAUSTED');
    });
  });
});

describe('ValidationError', () => {
  it('should create ValidationError with correct defaults', () => {
    const details: ErrorDetail[] = [
      { field: 'email', message: 'Invalid email' },
      { field: 'name', message: 'Name is required' },
    ];

    const error = new ValidationError(details);

    expect(error.message).toBe('Request validation failed');
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(error.statusCode).toBe(400);
    expect(error.retryable).toBe(false);
    expect(error.name).toBe('ValidationError');
    expect(error.details).toEqual(details);
  });

  it('should handle single validation error', () => {
    const details: ErrorDetail[] = [
      { field: 'age', message: 'Must be positive' },
    ];

    const error = new ValidationError(details);

    expect(error.details).toHaveLength(1);
  });

  it('should handle empty details array', () => {
    const error = new ValidationError([]);

    expect(error.details).toEqual([]);
  });
});

describe('RateLimitError', () => {
  it('should create RateLimitError with correct defaults', () => {
    const error = new RateLimitError(60, 100, 25);

    expect(error.message).toContain('Rate limit exceeded');
    expect(error.message).toContain('60 seconds');
    expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
    expect(error.statusCode).toBe(429);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('RateLimitError');
    expect(error.retryAfter).toBe(60);
    expect(error.limit).toBe(100);
    expect(error.remaining).toBe(25);
  });

  it('should include rate limit info in toJSON', () => {
    const error = new RateLimitError(30, 50, 10);
    const json = error.toJSON();

    expect(json.error).toContain('30 seconds');
    expect(json.details).toEqual([{ message: 'Limit: 50, Remaining: 10' }]);
  });

  it('should handle edge case values', () => {
    const error = new RateLimitError(0, 0, 0);

    expect(error.retryAfter).toBe(0);
    expect(error.limit).toBe(0);
    expect(error.remaining).toBe(0);
  });
});

describe('ExternalServiceError', () => {
  it('should create ExternalServiceError with correct defaults', () => {
    const error = new ExternalServiceError('Service unavailable', 'OpenAI');

    expect(error.message).toContain('External service error');
    expect(error.message).toContain('OpenAI');
    expect(error.message).toContain('Service unavailable');
    expect(error.code).toBe(ErrorCode.EXTERNAL_SERVICE_ERROR);
    expect(error.statusCode).toBe(502);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('ExternalServiceError');
    expect(error.service).toBe('OpenAI');
  });

  it('should include original error', () => {
    const originalError = new Error('Connection failed');
    const error = new ExternalServiceError(
      'Service unavailable',
      'Notion',
      originalError
    );

    expect(error.originalError).toBe(originalError);
  });

  it('should handle null original error', () => {
    const error = new ExternalServiceError(
      'Service unavailable',
      'Trello',
      null as any
    );

    expect(error.originalError).toBeNull();
  });

  it('should handle undefined original error', () => {
    const error = new ExternalServiceError('Service unavailable', 'GitHub');

    expect(error.originalError).toBeUndefined();
  });
});

describe('TimeoutError', () => {
  it('should create TimeoutError with correct defaults', () => {
    const error = new TimeoutError('Request timed out', 5000);

    expect(error.message).toContain('Request timed out');
    expect(error.code).toBe(ErrorCode.TIMEOUT_ERROR);
    expect(error.statusCode).toBe(504);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('TimeoutError');
    expect(error.timeoutMs).toBe(5000);
  });

  it('should include timeout duration as property', () => {
    const error = new TimeoutError('Request timed out', 10000);

    expect(error.timeoutMs).toBe(10000);
  });

  it('should handle zero timeout', () => {
    const error = new TimeoutError('Request timed out', 0);

    expect(error.timeoutMs).toBe(0);
  });
});

describe('CircuitBreakerError', () => {
  it('should create CircuitBreakerError with correct defaults', () => {
    const resetTime = new Date('2024-01-01T12:00:00Z');
    const error = new CircuitBreakerError('OpenAI', resetTime);

    expect(error.message).toContain('Circuit breaker open');
    expect(error.message).toContain('OpenAI');
    expect(error.message).toContain(resetTime.toISOString());
    expect(error.code).toBe(ErrorCode.CIRCUIT_BREAKER_OPEN);
    expect(error.statusCode).toBe(503);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('CircuitBreakerError');
    expect(error.service).toBe('OpenAI');
    expect(error.resetTime).toBe(resetTime);
  });

  it('should not include details in toJSON', () => {
    const resetTime = new Date('2024-01-01T12:00:00Z');
    const error = new CircuitBreakerError('Notion', resetTime);
    const json = error.toJSON();

    expect(json.details).toBeUndefined();
  });
});

describe('AppRetryExhaustedError', () => {
  it('should create RetryExhaustedError with correct defaults', () => {
    const error = new AppRetryExhaustedError(
      'Failed after retries',
      'OpenAI',
      5
    );

    expect(error.message).toContain('Failed after retries');
    expect(error.message).toContain('5 attempts');
    expect(error.code).toBe(ErrorCode.RETRY_EXHAUSTED);
    expect(error.statusCode).toBe(502);
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('RetryExhaustedError');
    expect(error.service).toBe('OpenAI');
    expect(error.attempts).toBe(5);
  });

  it('should include original error', () => {
    const originalError = new Error('Connection failed');
    const error = new AppRetryExhaustedError(
      'Failed',
      'Trello',
      3,
      originalError
    );

    expect(error.originalError).toBe(originalError);
  });

  it('should handle null original error', () => {
    const error = new AppRetryExhaustedError(
      'Failed',
      'GitHub',
      2,
      null as any
    );

    expect(error.originalError).toBeNull();
  });
});

describe('toErrorResponse', () => {
  it('should convert AppError to Response', () => {
    const error = new AppError(
      'Test error',
      ErrorCode.INTERNAL_ERROR,
      500,
      [],
      true
    );
    const response = toErrorResponse(error, 'req_123');

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(500);
  });

  it('should include correct headers for AppError', () => {
    const error = new AppError(
      'Test error',
      ErrorCode.INTERNAL_ERROR,
      500,
      [],
      true
    );
    const response = toErrorResponse(error, 'req_123');

    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('X-Request-ID')).toBe('req_123');
    expect(response.headers.get('X-Error-Code')).toBe(ErrorCode.INTERNAL_ERROR);
    expect(response.headers.get('X-Retryable')).toBe('true');
  });

  it('should include correct headers for non-retryable error', () => {
    const error = new AppError(
      'Test error',
      ErrorCode.INTERNAL_ERROR,
      500,
      [],
      false
    );
    const response = toErrorResponse(error, 'req_123');

    expect(response.headers.get('X-Retryable')).toBe('false');
  });

  it('should include RateLimitError specific headers', () => {
    const error = new RateLimitError(60, 100, 40);
    const response = toErrorResponse(error, 'req_123');

    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('40');
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });

  it('should convert standard Error to ErrorResponse', () => {
    const error = new Error('Standard error');
    const response = toErrorResponse(error);

    expect(response.status).toBe(500);
    expect(response.headers.get('X-Error-Code')).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('should convert unknown error to ErrorResponse', () => {
    const error = 'string error' as any;
    const response = toErrorResponse(error);

    expect(response.status).toBe(500);
    expect(response.headers.get('X-Error-Code')).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('should include generated requestId when not provided', () => {
    const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);
    const response = toErrorResponse(error);
    const requestId = response.headers.get('X-Request-ID');

    expect(requestId).toBeDefined();
    expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
  });

  it('should parse response body for AppError', async () => {
    const error = new AppError(
      'Test error',
      ErrorCode.INTERNAL_ERROR,
      500,
      [],
      true
    );
    const response = toErrorResponse(error, 'req_123');
    const body = await response.json();

    expect(body.error).toBe('Test error');
    expect(body.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(body.timestamp).toBeDefined();
    expect(body.requestId).toBe('req_123');
    expect(body.retryable).toBe(true);
  });

  it('should parse response body for standard Error', async () => {
    const error = new Error('Standard error');
    const response = toErrorResponse(error);
    const body = await response.json();

    expect(body.error).toBe('Standard error');
    expect(body.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('should parse response body for unknown error', async () => {
    const error = null as any;
    const response = toErrorResponse(error);
    const body = await response.json();

    expect(body.error).toBe('Unknown error occurred');
    expect(body.code).toBe(ErrorCode.INTERNAL_ERROR);
  });

  it('should parse response body for RateLimitError', async () => {
    const error = new RateLimitError(30, 50, 20);
    const response = toErrorResponse(error);
    const body = await response.json();

    expect(body.details).toEqual([{ message: 'Limit: 50, Remaining: 20' }]);
  });

  it('should include details from AppError', async () => {
    const details: ErrorDetail[] = [
      { field: 'email', message: 'Invalid email' },
    ];
    const error = new AppError(
      'Validation failed',
      ErrorCode.VALIDATION_ERROR,
      400,
      details
    );
    const response = toErrorResponse(error);
    const body = await response.json();

    expect(body.details).toEqual(details);
  });

  it('should handle missing requestId', async () => {
    const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);
    const response = toErrorResponse(error);
    const body = await response.json();

    expect(body.requestId).toBeDefined();
  });

  it('should set correct status code for ValidationError', () => {
    const error = new ValidationError([]);
    const response = toErrorResponse(error);

    expect(response.status).toBe(400);
  });

  it('should set correct status code for RateLimitError', () => {
    const error = new RateLimitError(60, 100, 40);
    const response = toErrorResponse(error);

    expect(response.status).toBe(429);
  });

  it('should set correct status code for ExternalServiceError', () => {
    const error = new ExternalServiceError('Service error', 'OpenAI');
    const response = toErrorResponse(error);

    expect(response.status).toBe(502);
  });

  it('should set correct status code for TimeoutError', () => {
    const error = new TimeoutError('Timeout', 5000);
    const response = toErrorResponse(error);

    expect(response.status).toBe(504);
  });

  it('should set correct status code for CircuitBreakerError', () => {
    const error = new CircuitBreakerError('OpenAI', new Date());
    const response = toErrorResponse(error);

    expect(response.status).toBe(503);
  });
});

describe('generateRequestId', () => {
  it('should generate unique request IDs', () => {
    const id1 = generateRequestId();
    const id2 = generateRequestId();

    expect(id1).not.toBe(id2);
  });

  it('should follow correct format', () => {
    const id = generateRequestId();

    expect(id).toMatch(/^req_\d+_[a-z0-9]{9}$/);
  });

  it('should include timestamp', () => {
    const before = Date.now();
    const id = generateRequestId();
    const after = Date.now();

    const timestampMatch = id.match(/req_(\d+)_/);
    expect(timestampMatch).not.toBeNull();

    const timestamp = parseInt(timestampMatch![1], 10);
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after);
  });

  it('should include random suffix', () => {
    const id = generateRequestId();
    const suffixMatch = id.match(/req_\d+_([a-z0-9]{9})$/);
    expect(suffixMatch).not.toBeNull();
    expect(suffixMatch![1]).toHaveLength(9);
  });

  it('should generate IDs quickly', () => {
    const start = Date.now();
    const ids = Array.from({ length: 1000 }, () => generateRequestId());
    const end = Date.now();

    expect(end - start).toBeLessThan(1000);
    expect(new Set(ids).size).toBe(1000);
  });
});

describe('isRetryableError', () => {
  describe('AppError instances', () => {
    it('should return true for retryable AppError', () => {
      const error = new AppError(
        'Test',
        ErrorCode.INTERNAL_ERROR,
        500,
        [],
        true
      );

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable AppError', () => {
      const error = new AppError(
        'Test',
        ErrorCode.VALIDATION_ERROR,
        400,
        [],
        false
      );

      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for RateLimitError', () => {
      const error = new RateLimitError(60, 100, 40);

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for ExternalServiceError', () => {
      const error = new ExternalServiceError('Service error', 'OpenAI');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for TimeoutError', () => {
      const error = new TimeoutError('Timeout', 5000);

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for CircuitBreakerError', () => {
      const error = new CircuitBreakerError('OpenAI', new Date());

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for RetryExhaustedError', () => {
      const error = new AppRetryExhaustedError('Failed', 'OpenAI', 5);

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for ValidationError', () => {
      const error = new ValidationError([]);

      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('standard Error instances', () => {
    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = new Error('Rate limit exceeded');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for ECONNRESET errors', () => {
      const error = new Error('ECONNRESET');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for ECONNREFUSED errors', () => {
      const error = new Error('ECONNREFUSED');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for ETIMEDOUT errors', () => {
      const error = new Error('ETIMEDOUT');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for ENOTFOUND errors', () => {
      const error = new Error('ENOTFOUND');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should be case insensitive', () => {
      const error = new Error('REQUEST TIMEOUT');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Validation failed');

      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for generic errors', () => {
      const error = new Error('Something went wrong');

      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('non-Error values', () => {
    it('should return false for null', () => {
      expect(isRetryableError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRetryableError(undefined)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isRetryableError('error string')).toBe(false);
    });

    it('should return false for numbers', () => {
      expect(isRetryableError(123)).toBe(false);
    });

    it('should return false for objects', () => {
      expect(isRetryableError({ error: 'test' })).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty error message', () => {
      const error = new Error('');

      expect(isRetryableError(error)).toBe(false);
    });

    it('should handle error with only whitespace', () => {
      const error = new Error('   ');

      expect(isRetryableError(error)).toBe(false);
    });

    it('should handle partial match for timeout', () => {
      const error = new Error('Network timeout occurred');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should handle partial match for rate limit', () => {
      const error = new Error('Hit rate limit, try again later');

      expect(isRetryableError(error)).toBe(true);
    });
  });
});

describe('ErrorDetail interface', () => {
  it('should allow minimal ErrorDetail', () => {
    const detail: ErrorDetail = { message: 'Test error' };

    expect(detail.message).toBe('Test error');
  });

  it('should allow ErrorDetail with field', () => {
    const detail: ErrorDetail = { field: 'email', message: 'Invalid email' };

    expect(detail.field).toBe('email');
    expect(detail.message).toBe('Invalid email');
  });

  it('should allow ErrorDetail with code', () => {
    const detail: ErrorDetail = {
      field: 'age',
      message: 'Must be positive',
      code: 'INVALID_VALUE',
    };

    expect(detail.code).toBe('INVALID_VALUE');
  });
});
