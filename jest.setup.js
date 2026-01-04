import '@testing-library/jest-dom';

// Mock OpenAI shims
import 'openai/shims/node';

// Mock environment variables for all tests
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
process.env.NOTION_API_KEY = 'test-notion-key';
process.env.TRELLO_API_KEY = 'test-trello-key';
process.env.TRELLO_TOKEN = 'test-trello-token';
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';

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

// Mock ResizeObserver and IntersectionObserver for UI components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Setup fetch mock helper
global.mockFetch = (response, ok = true, status = 200) => {
  global.fetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => response,
  });
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock window.open
global.open = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  global.fetch?.mockClear?.();
});

// Cleanup after each test
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Test timeout configuration
jest.setTimeout(15000);
