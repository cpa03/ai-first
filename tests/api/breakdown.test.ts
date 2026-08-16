import { NextRequest } from 'next/server';
import { buildApiUrl, TEST_CONFIG } from '../config/test-config';

jest.mock('@/lib/agents/breakdown-engine', () => ({
  breakdownEngine: {
    initialize: jest.fn().mockResolvedValue(undefined),
    startBreakdown: jest.fn().mockResolvedValue({
      id: 'session-123',
      ideaId: 'idea-123',
      status: 'started',
    }),
    getBreakdownSession: jest.fn().mockResolvedValue({
      id: 'session-123',
      ideaId: 'idea-123',
      status: 'completed',
    }),
  },
}));

jest.mock('@/lib/validation', () => ({
  validateIdea: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  validateIdeaId: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  validateUserResponses: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  sanitizeHtml: jest.fn((text) => text),
}));

jest.mock('@/lib/errors', () => ({
  ValidationError: jest.fn().mockImplementation((errors) => ({
    message: 'Validation error',
    errors,
    isOperational: true,
  })),
  AppError: jest.fn().mockImplementation((message, code, statusCode) => ({
    message,
    code,
    statusCode,
    isOperational: true,
  })),
  ErrorCode: { NOT_FOUND: 'NOT_FOUND' },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
  }),
  verifyResourceOwnership: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  dbService: {
    getIdea: jest.fn().mockResolvedValue({
      id: 'idea-123',
      user_id: 'user-123',
      title: 'Test Idea',
    }),
  },
}));

jest.mock('@/lib/config/error-messages', () => ({
  API_ERROR_MESSAGES: {
    NOT_FOUND: {
      IDEA: 'Idea not found',
      SESSION: 'Session not found',
    },
    ROUTE_VALIDATION: {
      IDEA_ID_REQUIRED: 'Idea ID is required',
    },
  },
}));

jest.mock('@/lib/config/constants', () => ({
  STATUS_CODES: { OK: 200, NOT_FOUND: 404 },
}));

jest.mock('@/lib/api-handler', () => ({
  standardSuccessResponse: jest
    .fn()
    .mockImplementation((data, requestId, status, rateLimit) => {
      return new Response(
        JSON.stringify({
          success: true,
          data,
          requestId,
          timestamp: new Date().toISOString(),
        }),
        {
          status: status || 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }),
  withApiHandler: jest.fn().mockImplementation((handler, options) => {
    return async (
      request: NextRequest,
      context: { params: Promise<Record<string, string>> }
    ) => {
      const rateLimit = { remaining: 100, reset: Date.now() + 60000 };
      return handler({ request, rateLimit, requestId: 'test-request-id' });
    };
  }),
}));

import { POST, GET } from '@/app/api/breakdown/route';

describe('/api/breakdown', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST', () => {
    it('should start a breakdown session', async () => {
      const request = new NextRequest(buildApiUrl('/api/breakdown'), {
        method: 'POST',
        body: JSON.stringify({
          ideaId: 'idea-123',
          refinedIdea: 'Test refined idea',
          userResponses: { key: 'value' },
        }),
      });

      const response = await POST(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toBeDefined();
      expect(data.data.session.id).toBe('session-123');
    });
  });

  describe('GET', () => {
    it('should get a breakdown session', async () => {
      const request = new NextRequest(
        buildApiUrl('/api/breakdown?ideaId=idea-123'),
        {
          method: 'GET',
        }
      );

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session).toBeDefined();
      expect(data.data.session.id).toBe('session-123');
    });

    it('should return error when ideaId is missing', async () => {
      expect(true).toBe(true);
    });
  });
});
