import '@testing-library/jest-dom';

// Mock environment variables for all tests
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

// Setup fetch mock helper
global.mockFetch = (response, ok = true, status = 200) => {
  global.fetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
  });
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch?.mockClear?.();
});

// Test timeout configuration
jest.setTimeout(10000);
