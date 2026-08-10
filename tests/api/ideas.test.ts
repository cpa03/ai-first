import { NextRequest } from 'next/server';
import { buildApiUrl, TEST_CONFIG } from '../config/test-config';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config/http';
import { AuthenticatedUser } from '@/lib/auth';

// Mock the dependencies BEFORE importing the route
jest.mock('@/lib/db', () => ({
  dbService: {
    getUserIdeasPaginated: jest.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    }),
    createIdea: jest.fn().mockResolvedValue({
      id: 'idea-new',
      title: 'New Idea',
      status: 'draft' as const,
      created_at: '2026-01-01T00:00:00Z',
    }),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
}));

jest.mock('@/lib/embedding-service', () => ({
  generateEmbedding: jest
    .fn()
    .mockResolvedValue({ embedding: [0.1, 0.2, 0.3] }),
}));

jest.mock('@/lib/similarity-service', () => ({
  storeIdeaEmbedding: jest.fn().mockResolvedValue(undefined),
}));

// Import the route AFTER mocking
import { GET, POST } from '@/app/api/ideas/route';
import { dbService } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const mockDbService = dbService as jest.Mocked<typeof dbService>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/ideas', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET', () => {
    it('should return paginated ideas for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockIdeas: Array<{
        id: string;
        user_id: string;
        title: string;
        raw_text: string;
        status: 'draft' | 'clarified' | 'breakdown' | 'completed';
        deleted_at: string | null;
        created_at: string;
        updated_at: string;
      }> = [
        {
          id: 'idea-1',
          user_id: 'user-123',
          title: 'Test Idea 1',
          raw_text: 'Test Idea 1',
          status: 'draft' as const,
          deleted_at: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'idea-2',
          user_id: 'user-123',
          title: 'Test Idea 2',
          raw_text: 'Test Idea 2',
          status: 'clarified' as const,
          deleted_at: null,
          created_at: '2026-01-02T00:00:00Z',
          updated_at: '2026-01-02T00:00:00Z',
        },
      ];

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: mockIdeas,
        total: 2,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.ideas).toHaveLength(2);
      expect(data.data.pagination.total).toBe(2);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 1, pageSize: 50 },
        { status: null, search: undefined }
      );
    });

    it('should filter ideas by status', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = new NextRequest(
        buildApiUrl(`${TEST_CONFIG.ENDPOINTS.IDEAS}?status=draft`),
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(200);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 1, pageSize: 50 },
        { status: 'draft' as const, search: undefined }
      );
    });

    it('should search ideas by term', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = new NextRequest(
        buildApiUrl(`${TEST_CONFIG.ENDPOINTS.IDEAS}?search=test`),
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(200);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 1, pageSize: 50 },
        { status: null, search: 'test' }
      );
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockRejectedValue(
        new AppError(
          'Unauthorized',
          ErrorCode.AUTHENTICATION_ERROR,
          STATUS_CODES.UNAUTHORIZED
        )
      );

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        { method: 'GET' }
      );

      const response = await GET(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('should create a new idea', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockNewIdea = {
        id: 'idea-new',
        user_id: 'user-123',
        title: 'New Test Idea',
        raw_text: 'New Test Idea',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
      };

      mockDbService.createIdea.mockResolvedValue(
        mockNewIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        {
          method: 'POST',
          body: JSON.stringify({ idea: 'New Test Idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, {
        params: Promise.resolve({}),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('idea-new');
      expect(data.data.title).toBe('New Test Idea');
      expect(data.data.status).toBe('draft');
      expect(mockDbService.createIdea).toHaveBeenCalled();
    });

    it('should return 400 when idea is missing', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        {
          method: 'POST',
          body: JSON.stringify({}),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(400);
    });

    it('should return 400 for empty idea', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        {
          method: 'POST',
          body: JSON.stringify({ idea: '' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockRejectedValue(
        new AppError(
          'Unauthorized',
          ErrorCode.AUTHENTICATION_ERROR,
          STATUS_CODES.UNAUTHORIZED
        )
      );

      const request = new NextRequest(
        buildApiUrl(TEST_CONFIG.ENDPOINTS.IDEAS),
        {
          method: 'POST',
          body: JSON.stringify({ idea: 'Test Idea' }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const response = await POST(request, {
        params: Promise.resolve({}),
      });

      expect(response.status).toBe(401);
    });
  });
});
