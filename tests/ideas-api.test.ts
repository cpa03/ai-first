process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

jest.mock('@/lib/db', () => ({
  dbService: {
    createIdea: jest.fn(),
  },
}));

import { POST } from '@/app/api/ideas/route';
import { dbService } from '@/lib/db';

const mockCreateIdea = dbService.createIdea as jest.MockedFunction<
  typeof dbService.createIdea
>;

describe('/api/ideas POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Happy Path', () => {
    it('should create idea and return 201 with correct response structure', async () => {
      const mockIdea = {
        id: 'idea-123',
        title: 'Build a task management app',
        status: 'draft' as const,
        created_at: '2024-01-15T10:00:00.000Z',
        raw_text: 'Build a task management app for remote teams',
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({
          idea: 'Build a task management app for remote teams',
        }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        id: 'idea-123',
        title: 'Build a task management app',
        status: 'draft',
        createdAt: '2024-01-15T10:00:00.000Z',
      });
      expect(data.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(data.timestamp).toBeTruthy();
      expect(response.headers.get('X-Request-ID')).toBeTruthy();
      expect(mockCreateIdea).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from idea before saving', async () => {
      const mockIdea = {
        id: 'idea-456',
        title: 'Valid idea',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        raw_text: 'Valid idea',
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: '  Valid idea  ' }),
      };

      const response = await POST(request as any);

      expect(response.status).toBe(201);
      expect(mockCreateIdea).toHaveBeenCalledWith(
        expect.objectContaining({
          raw_text: 'Valid idea',
        })
      );
    });

    it('should truncate title to 50 characters when idea is longer', async () => {
      const longIdea =
        'Build a comprehensive task management application that includes features for remote teams, real-time collaboration, and advanced project tracking capabilities';

      const mockIdea = {
        id: 'idea-789',
        title: longIdea.substring(0, 50) + '...',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        raw_text: longIdea,
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: longIdea }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toHaveLength(53);
      expect(data.data.title).toBe(longIdea.substring(0, 50) + '...');
    });

    it('should not truncate title when idea is exactly 50 characters', async () => {
      const exactLengthIdea =
        'Build a task management app for remote teams 12345';
      expect(exactLengthIdea.length).toBe(50);

      const mockIdea = {
        id: 'idea-999',
        title: exactLengthIdea,
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        raw_text: exactLengthIdea,
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: exactLengthIdea }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.title).toBe(exactLengthIdea);
      expect(data.data.title).not.toContain('...');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when idea field is missing', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({}),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.details).toEqual([
        {
          field: 'idea',
          message: 'idea is required and must be a string',
        },
      ]);
      expect(data.requestId).toBeTruthy();
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea is null', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: null }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea is undefined', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: undefined }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea is not a string', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: { text: 'object' } }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea is too short (less than 10 characters)', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: 'Too short' }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.details).toEqual([
        {
          field: 'idea',
          message: 'idea must be at least 10 characters',
        },
      ]);
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea is too long (exceeds 10000 characters)', async () => {
      const longIdea = 'x'.repeat(10001);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: longIdea }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.details).toEqual([
        {
          field: 'idea',
          message: 'idea must not exceed 10000 characters',
        },
      ]);
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should return 400 when idea contains only whitespace', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: '     ' }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle database creation errors', async () => {
      mockCreateIdea.mockRejectedValue(new Error('Database connection failed'));

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: 'Test idea for error handling' }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeTruthy();
      expect(data.code).toBe('INTERNAL_ERROR');
      expect(data.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    it('should include request ID in error responses', async () => {
      mockCreateIdea.mockRejectedValue(new Error('Database error'));

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: 'Test idea' }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(data.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  describe('Response Structure', () => {
    it('should include all required response fields', async () => {
      const mockIdea = {
        id: 'idea-struct',
        title: 'Test idea for response structure',
        status: 'draft' as const,
        created_at: '2024-01-15T12:00:00.000Z',
        raw_text: 'Test idea for response structure',
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: 'Test idea for response structure' }),
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('requestId');
      expect(data).toHaveProperty('timestamp');
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('title');
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('createdAt');
      expect(data.data).not.toHaveProperty('raw_text');
      expect(data.data).not.toHaveProperty('user_id');
      expect(data.data).not.toHaveProperty('deleted_at');
    });
  });

  describe('Boundary Cases', () => {
    it('should accept idea exactly at minimum length (10 characters)', async () => {
      const mockIdea = {
        id: 'idea-111',
        title: '1234567890',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        raw_text: '1234567890',
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: '1234567890' }),
      };

      const response = await POST(request as any);

      expect(response.status).toBe(201);
      expect(mockCreateIdea).toHaveBeenCalled();
    });

    it('should reject idea one below minimum length (9 characters)', async () => {
      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: '123456789' }),
      };

      const response = await POST(request as any);

      expect(response.status).toBe(400);
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });

    it('should accept idea exactly at maximum length (10000 characters)', async () => {
      const longIdea = 'x'.repeat(10000);

      const mockIdea = {
        id: 'idea-max',
        title: longIdea.substring(0, 50) + '...',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        raw_text: longIdea,
        user_id: 'default_user',
        deleted_at: null,
      };

      mockCreateIdea.mockResolvedValue(mockIdea as any);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: longIdea }),
      };

      const response = await POST(request as any);

      expect(response.status).toBe(201);
      expect(mockCreateIdea).toHaveBeenCalled();
    });

    it('should reject idea one above maximum length (10001 characters)', async () => {
      const longIdea = 'x'.repeat(10001);

      const request = {
        headers: { get: jest.fn(() => undefined) },
        json: async () => ({ idea: longIdea }),
      };

      const response = await POST(request as any);

      expect(response.status).toBe(400);
      expect(mockCreateIdea).not.toHaveBeenCalled();
    });
  });
});
