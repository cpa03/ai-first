import { IdeaService } from '@/lib/db/ideas';
import type { ClientProvider } from '@/lib/db/ideas';

const createMockClientProvider = (): ClientProvider => ({
  getClient: jest.fn(),
  getAdmin: jest.fn(),
});

interface MockSupabaseChain {
  from: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
  is: jest.Mock;
  order: jest.Mock;
  range: jest.Mock;
  or: jest.Mock;
  then: (
    resolve: (value: unknown) => unknown,
    reject?: (reason: unknown) => unknown
  ) => Promise<unknown>;
}

const createMockSupabaseClient = (): MockSupabaseChain => {
  const chain: MockSupabaseChain = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    is: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    or: jest.fn(),
    then: function (
      resolve: (value: unknown) => unknown,
      reject?: (reason: unknown) => unknown
    ) {
      return Promise.resolve({ data: [], count: 0, error: null }).then(resolve, reject);
    },
  };

  chain.from.mockReturnValue(chain);
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.is.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);
  chain.range.mockReturnValue(chain);
  chain.or.mockReturnValue(chain);

  return chain;
};

describe('IdeaService Security', () => {
  let ideaService: IdeaService;
  let mockProvider: ClientProvider;
  let mockClient: MockSupabaseChain;

  beforeEach(() => {
    mockProvider = createMockClientProvider();
    mockClient = createMockSupabaseClient();
    (mockProvider.getClient as jest.Mock).mockReturnValue(mockClient);
    ideaService = new IdeaService(mockProvider);
  });

  describe('getUserIdeasPaginated search term escaping', () => {
    it('should correctly handle search terms with commas', async () => {
      const searchTerm = 'foo,bar';
      await ideaService.getUserIdeasPaginated('user-1', {}, { search: searchTerm });

      // Current (vulnerable) implementation will produce:
      // title.ilike.%foo,bar%,raw_text.ilike.%foo,bar%
      // Which PostgREST interprets incorrectly because of the unquoted comma.

      const orCall = mockClient.or.mock.calls[0][0];

      // We expect it to be properly quoted to be safe in PostgREST
      expect(orCall).toContain('title.ilike."%foo,bar%"');
      expect(orCall).toContain('raw_text.ilike."%foo,bar%"');
    });

    it('should correctly handle search terms with double quotes', async () => {
      const searchTerm = 'foo"bar';
      await ideaService.getUserIdeasPaginated('user-1', {}, { search: searchTerm });

      const orCall = mockClient.or.mock.calls[0][0];

      // Double quotes should be escaped by doubling them
      expect(orCall).toContain('title.ilike."%foo""bar%"');
      expect(orCall).toContain('raw_text.ilike."%foo""bar%"');
    });
  });
});
