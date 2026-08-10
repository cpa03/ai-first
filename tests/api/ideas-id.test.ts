import { NextRequest } from 'next/server';
import { buildIdeaUrl } from '../config/test-config';
import { AppError, ErrorCode } from '@/lib/errors';
import { STATUS_CODES } from '@/lib/config/http';
import { AuthenticatedUser } from '@/lib/auth';

// Mock the dependencies BEFORE importing the route
jest.mock('@/lib/db', () => ({
  dbService: {
    getIdea: jest.fn().mockResolvedValue(null),
    updateIdea: jest.fn().mockResolvedValue({
      id: 'idea-123',
      user_id: 'user-123',
      title: 'Updated Idea',
      raw_text: 'Updated Idea',
      status: 'draft' as const,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }),
    softDeleteIdea: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'user-123', email: 'test@example.com' }),
  verifyResourceOwnership: jest.fn(),
}));

// Import the route AFTER mocking
import { GET, PUT, DELETE } from '@/app/api/ideas/[id]/route';
import { dbService } from '@/lib/db';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

const mockDbService = dbService as jest.Mocked<typeof dbService>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockVerifyResourceOwnership =
  verifyResourceOwnership as jest.MockedFunction<
    typeof verifyResourceOwnership
  >;

describe('/api/ideas/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-setup mock implementations after clearing
    mockDbService.getIdea.mockResolvedValue(null);
    mockDbService.updateIdea.mockResolvedValue({
      id: 'idea-123',
      user_id: 'user-123',
      title: 'Updated Idea',
      raw_text: 'Updated Idea',
      status: 'draft' as const,
      deleted_at: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    });
    mockDbService.softDeleteIdea.mockResolvedValue(undefined);
    mockRequireAuth.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
    } as AuthenticatedUser);
    mockVerifyResourceOwnership.mockImplementation(() => {});
  });

  describe('GET', () => {
    it('should return idea by id', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Test Idea',
        raw_text: 'Test Idea',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      };

      mockDbService.getIdea.mockResolvedValue(
        mockIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'GET',
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('idea-123');
      expect(mockDbService.getIdea).toHaveBeenCalledWith('idea-123');
      expect(mockVerifyResourceOwnership).toHaveBeenCalledWith(
        'user-123',
        'user-123',
        'idea'
      );
    });

    it('should return 404 when idea not found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      mockDbService.getIdea.mockResolvedValue(null);

      const request = new NextRequest(buildIdeaUrl('nonexistent'), {
        method: 'GET',
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 403 when user does not own idea', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockIdea = {
        id: 'idea-123',
        user_id: 'other-user',
        title: 'Test Idea',
        raw_text: 'Test Idea',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
      };

      mockDbService.getIdea.mockResolvedValue(
        mockIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );
      mockVerifyResourceOwnership.mockImplementation(() => {
        throw new AppError(
          'Forbidden',
          ErrorCode.AUTHORIZATION_ERROR,
          STATUS_CODES.FORBIDDEN
        );
      });

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'GET',
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });

      expect(response.status).toBe(403);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockRejectedValue(
        new AppError(
          'Unauthorized',
          ErrorCode.AUTHENTICATION_ERROR,
          STATUS_CODES.UNAUTHORIZED
        )
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'GET',
      });

      const response = await GET(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT', () => {
    it('should update idea title', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockExistingIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Old Title',
        raw_text: 'Old Title',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
      };

      const mockUpdatedIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'New Title',
        raw_text: 'New Title',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockDbService.getIdea.mockResolvedValue(
        mockExistingIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );
      mockDbService.updateIdea.mockResolvedValue(
        mockUpdatedIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        }
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'PUT',
        body: JSON.stringify({ title: 'New Title' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Title');
      expect(mockDbService.updateIdea).toHaveBeenCalled();
    });

    it('should update idea status', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockExistingIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Test Idea',
        raw_text: 'Test Idea',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
      };

      const mockUpdatedIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Test Idea',
        raw_text: 'Test Idea',
        status: 'clarified' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-02T00:00:00Z',
      };

      mockDbService.getIdea.mockResolvedValue(
        mockExistingIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );
      mockDbService.updateIdea.mockResolvedValue(
        mockUpdatedIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'clarified';
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        }
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'PUT',
        body: JSON.stringify({ status: 'clarified' as const }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('clarified');
    });

    it('should return 404 when idea not found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      mockDbService.getIdea.mockResolvedValue(null);

      const request = new NextRequest(buildIdeaUrl('nonexistent'), {
        method: 'PUT',
        body: JSON.stringify({ title: 'New Title' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockRejectedValue(
        new AppError(
          'Unauthorized',
          ErrorCode.AUTHENTICATION_ERROR,
          STATUS_CODES.UNAUTHORIZED
        )
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'PUT',
        body: JSON.stringify({ title: 'New Title' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE', () => {
    it('should soft delete idea', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      const mockExistingIdea = {
        id: 'idea-123',
        user_id: 'user-123',
        title: 'Test Idea',
        raw_text: 'Test Idea',
        status: 'draft' as const,
        deleted_at: null,
        created_at: '2026-01-01T00:00:00Z',
      };

      mockDbService.getIdea.mockResolvedValue(
        mockExistingIdea as {
          id: string;
          user_id: string;
          title: string;
          raw_text: string;
          status: 'draft';
          deleted_at: string | null;
          created_at: string;
        }
      );
      mockDbService.softDeleteIdea.mockResolvedValue(undefined);

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('idea-123');
      expect(mockDbService.softDeleteIdea).toHaveBeenCalledWith('idea-123');
    });

    it('should return 404 when idea not found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as AuthenticatedUser);

      mockDbService.getIdea.mockResolvedValue(null);

      const request = new NextRequest(buildIdeaUrl('nonexistent'), {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      mockRequireAuth.mockRejectedValue(
        new AppError(
          'Unauthorized',
          ErrorCode.AUTHENTICATION_ERROR,
          STATUS_CODES.UNAUTHORIZED
        )
      );

      const request = new NextRequest(buildIdeaUrl('idea-123'), {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'idea-123' }),
      });

      expect(response.status).toBe(401);
    });
  });
});
