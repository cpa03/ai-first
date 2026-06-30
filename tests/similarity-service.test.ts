import { findSimilarIdeas } from '@/lib/similarity-service';

// Mock Supabase client
const mockSingle = jest.fn();
const mockEq = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: mockSingle }) });
const mockRpc = jest.fn();
const mockIn = jest.fn().mockReturnThis();

const mockFrom = jest.fn((table) => {
  if (table === 'vectors') {
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: mockSingle,
          }),
        }),
      }),
    };
  }
  if (table === 'ideas') {
    return {
      select: () => ({
        in: mockIn,
      }),
    };
  }
  return {};
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  })),
}));

describe('SimilarityService', () => {
  const userId = 'user-123';
  const ideaId = 'idea-123';
  let originalWindow: unknown;

  beforeAll(() => {
    originalWindow = global.window;
  });

  afterAll(() => {
    // @ts-expect-error - restoring window
    global.window = originalWindow;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-key';

    // Simulate server environment
    // @ts-expect-error - deleting window
    delete global.window;
  });

  describe('findSimilarIdeas', () => {
    it('should fetch similar ideas in a single bulk query and maintain sorting', async () => {
      // 1. Mock vector retrieval
      mockSingle.mockResolvedValueOnce({
        data: { embedding: [0.1, 0.2] },
        error: null,
      });

      // 2. Mock RPC result (similarity search)
      const rpcResults = [
        { idea_id: 'similar-1', similarity: 0.9 },
        { idea_id: 'similar-2', similarity: 0.8 },
      ];
      mockRpc.mockResolvedValueOnce({
        data: rpcResults,
        error: null,
      });

      // 3. Mock bulk ideas retrieval
      const mockIdeas = [
        { id: 'similar-2', title: 'Idea 2', status: 'draft', created_at: '2026-01-02', user_id: userId },
        { id: 'similar-1', title: 'Idea 1', status: 'completed', created_at: '2026-01-01', user_id: userId },
      ];

      mockIn.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          is: jest.fn().mockResolvedValueOnce({
            data: mockIdeas,
            error: null,
          })
        })
      });

      const result = await findSimilarIdeas(ideaId, userId);

      // Verify results
      expect(result).toHaveLength(2);

      // Verify sorting is maintained from RPC (similar-1 first with 0.9)
      expect(result[0].id).toBe('similar-1');
      expect(result[0].similarity).toBe(0.9);
      expect(result[0].title).toBe('Idea 1');

      expect(result[1].id).toBe('similar-2');
      expect(result[1].similarity).toBe(0.8);
      expect(result[1].title).toBe('Idea 2');

      // Verify bulk query was used
      expect(mockIn).toHaveBeenCalledWith('id', ['similar-1', 'similar-2']);
    });

    it('should return empty array if no embeddings found', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await findSimilarIdeas(ideaId, userId);
      expect(result).toEqual([]);
    });

    it('should handle RPC errors', async () => {
      mockSingle.mockResolvedValueOnce({ data: { embedding: [0.1] }, error: null });
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC Error' } });

      await expect(findSimilarIdeas(ideaId, userId)).rejects.toThrow();
    });
  });
});
