jest.mock('@/lib/db', () => ({
  dbService: {
    getUserIdeasPaginated: jest.fn(),
    createIdea: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  requireAuth: jest
    .fn()
    .mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
}));

jest.mock('@/lib/embedding-service', () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

jest.mock('@/lib/similarity-service', () => ({
  storeIdeaEmbedding: jest.fn().mockResolvedValue(undefined),
}));

import { GET, POST } from '@/app/api/ideas/route';
import { dbService } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { createMockRequest } from './utils/_testHelpers';

const mockDbService = dbService as jest.Mocked<typeof dbService>;
const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;

describe('/api/ideas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return paginated ideas for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      const mockIdeas = [
        {
          id: 'idea-1',
          title: 'Test Idea 1',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'idea-2',
          title: 'Test Idea 2',
          status: 'clarified',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: mockIdeas,
        total: 2,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = createMockRequest({
        url: 'http://localhost:3000/api/ideas',
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(200);
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
      mockRequireAuth.mockResolvedValue(mockUser as never);

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = createMockRequest({
        url: 'http://localhost:3000/api/ideas?status=draft',
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 1, pageSize: 50 },
        { status: 'draft', search: undefined }
      );
    });

    it('should search ideas by term', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        pageSize: 50,
        hasMore: false,
      });

      const request = createMockRequest({
        url: 'http://localhost:3000/api/ideas?search=test',
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 1, pageSize: 50 },
        { status: null, search: 'test' }
      );
    });

    it('should handle pagination parameters', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      mockDbService.getUserIdeasPaginated.mockResolvedValue({
        data: [],
        total: 100,
        page: 2,
        pageSize: 10,
        hasMore: true,
      });

      const request = createMockRequest({
        url: 'http://localhost:3000/api/ideas?page=2&limit=10',
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(200);
      expect(mockDbService.getUserIdeasPaginated).toHaveBeenCalledWith(
        'user-123',
        { page: 2, pageSize: 10 },
        { status: null, search: undefined }
      );
    });
  });

  describe('POST', () => {
    it('should create a new idea', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      const mockIdea = {
        id: 'idea-new',
        title: 'Test Idea',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockDbService.createIdea.mockResolvedValue(mockIdea as never);

      const request = createMockRequest({
        json: async () => ({ idea: 'Test Idea for testing' }),
      });

      const response = await POST(request, { params: Promise.resolve({}) });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.id).toBe('idea-new');
      expect(data.data.title).toBe('Test Idea');
      expect(data.data.status).toBe('draft');
      expect(mockDbService.createIdea).toHaveBeenCalled();
    });

    it('should return 400 when idea is missing', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      const request = createMockRequest({
        json: async () => ({}),
      });

      const response = await POST(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(400);
    });

    it('should return 400 when idea is too short', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      const request = createMockRequest({
        json: async () => ({ idea: 'Hi' }),
      });

      const response = await POST(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(400);
    });

    it('should handle database errors', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockRequireAuth.mockResolvedValue(mockUser as never);

      mockDbService.createIdea.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        json: async () => ({ idea: 'Test Idea for testing' }),
      });

      const response = await POST(request, { params: Promise.resolve({}) });

      expect(response.status).toBe(500);
    });
  });
});
