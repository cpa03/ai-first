import '@testing-library/jest-dom';

// Mock OpenAI shims
import 'openai/shims/node';

// Mock OpenAI module - must be before imports that use it
jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock AI response',
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Mock OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock AI response',
              },
            },
          ],
        }),
      },
    },
  }));
});

// Mock OpenAI module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Mock AI response',
              },
            },
          ],
        }),
      },
    },
  }));
});

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

// Polyfill Response for Node.js environment
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this._body = body;
      this._status = init.status || 200;
      this._headers = {};

      if (init.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((value, key) => {
            this._headers[key.toLowerCase()] = value;
          });
        } else if (typeof init.headers === 'object') {
          Object.keys(init.headers).forEach((key) => {
            this._headers[key.toLowerCase()] = init.headers[key];
          });
        }
      }
    }

    get status() {
      return this._status;
    }

    get headers() {
      return {
        get: (key) => this._headers[key.toLowerCase()],
        set: (key, value) => {
          this._headers[key.toLowerCase()] = value;
        },
        has: (key) => this._headers[key.toLowerCase()] !== undefined,
      };
    }

    async json() {
      return JSON.parse(this._body);
    }

    async text() {
      return this._body;
    }

    clone() {
      return new Response(this._body, {
        status: this._status,
        headers: this._headers,
      });
    }
  };
}

// Mock setTimeout to support unref() for Jest timers
const originalSetTimeout = global.setTimeout;
global.setTimeout = ((callback, delay, ...args) => {
  const timeoutId = originalSetTimeout(callback, delay, ...args);
  if (timeoutId && typeof timeoutId.unref === 'function') {
    timeoutId.unref();
  }
  return timeoutId;
}).bind(global);

// Cleanup after each test
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Test timeout configuration
jest.setTimeout(15000);
