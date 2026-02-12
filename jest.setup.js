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
// SECURITY: These are test-only placeholder values, not real secrets
// In CI/production, real values should be injected via environment variables
// Never commit actual API keys or credentials to version control
process.env.OPENAI_API_KEY =
  process.env.TEST_OPENAI_API_KEY || 'test-openai-api-key-placeholder';
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.TEST_SUPABASE_URL || 'https://test-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY || 'test-supabase-anon-key-placeholder';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
  'test-supabase-service-key-placeholder';
process.env.NOTION_API_KEY =
  process.env.TEST_NOTION_API_KEY || 'test-notion-api-key-placeholder';
process.env.TRELLO_API_KEY =
  process.env.TEST_TRELLO_API_KEY || 'test-trello-api-key-placeholder';
process.env.TRELLO_TOKEN =
  process.env.TEST_TRELLO_TOKEN || 'test-trello-token-placeholder';
process.env.GITHUB_TOKEN =
  process.env.TEST_GITHUB_TOKEN || 'test-github-token-placeholder';
process.env.GOOGLE_CLIENT_ID =
  process.env.TEST_GOOGLE_CLIENT_ID || 'test-google-client-id-placeholder';
process.env.GOOGLE_CLIENT_SECRET =
  process.env.TEST_GOOGLE_CLIENT_SECRET ||
  'test-google-client-secret-placeholder';

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

// Mock NextResponse
jest.mock('next/server', () => {
  const actualModule = jest.requireActual('next/server');
  return {
    ...actualModule,
    NextResponse: {
      json: (data, init = {}) => {
        const response = new actualModule.NextResponse(JSON.stringify(data), {
          ...init,
          headers: {
            'content-type': 'application/json',
            ...init.headers,
          },
        });
        return response;
      },
    },
  };
});

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
global.sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: global.sessionStorageMock,
});

// Mock window.open
global.open = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Polyfill Headers for Node.js environment
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = {};

      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => {
            this._headers[key.toLowerCase()] = value;
          });
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value;
          });
        } else if (typeof init === 'object') {
          Object.keys(init).forEach((key) => {
            this._headers[key.toLowerCase()] = init[key];
          });
        }
      }
    }

    append(name, value) {
      const key = name.toLowerCase();
      const existing = this._headers[key];
      this._headers[key] = existing ? `${existing}, ${value}` : value;
    }

    delete(name) {
      delete this._headers[name.toLowerCase()];
    }

    get(name) {
      return this._headers[name.toLowerCase()] || null;
    }

    has(name) {
      return this._headers[name.toLowerCase()] !== undefined;
    }

    set(name, value) {
      this._headers[name.toLowerCase()] = value;
    }

    forEach(callback, thisArg) {
      Object.entries(this._headers).forEach(([key, value]) => {
        callback.call(thisArg, value, key, this);
      });
    }

    *entries() {
      for (const [key, value] of Object.entries(this._headers)) {
        yield [key, value];
      }
    }

    *keys() {
      for (const key of Object.keys(this._headers)) {
        yield key;
      }
    }

    *values() {
      for (const value of Object.values(this._headers)) {
        yield value;
      }
    }

    [Symbol.iterator]() {
      return this.entries();
    }
  };
}

// Polyfill Request for Node.js environment
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init = {}) {
      this._url = typeof input === 'string' ? input : input.url;
      this._method = init.method || 'GET';
      this._headers = new Headers(init.headers);
    }

    get url() {
      return this._url;
    }

    get method() {
      return this._method;
    }

    get headers() {
      return this._headers;
    }
  };
}

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

    static json(data, init = {}) {
      const response = new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers,
        },
      });
      return response;
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
