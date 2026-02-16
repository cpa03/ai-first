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

// Set test environment variables from environment or use safe defaults
// These are DUMMY values for testing only - never real credentials
process.env.OPENAI_API_KEY =
  process.env.TEST_OPENAI_API_KEY || 'sk-test-DUMMY-VALUE-FOR-TESTING-ONLY';
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.TEST_SUPABASE_URL || 'https://test-DUMMY.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY || 'test-DUMMY-anon-key-FOR-TESTING';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  process.env.TEST_SUPABASE_SERVICE_ROLE_KEY ||
  'test-DUMMY-service-key-FOR-TESTING';
process.env.NOTION_API_KEY =
  process.env.TEST_NOTION_API_KEY || 'test-DUMMY-notion-key-FOR-TESTING';
process.env.TRELLO_API_KEY =
  process.env.TEST_TRELLO_API_KEY || 'test-DUMMY-trello-key-FOR-TESTING';
process.env.TRELLO_TOKEN =
  process.env.TEST_TRELLO_TOKEN || 'test-DUMMY-trello-token-FOR-TESTING';
process.env.GITHUB_TOKEN =
  process.env.TEST_GITHUB_TOKEN || 'test-DUMMY-github-token-FOR-TESTING';
process.env.GOOGLE_CLIENT_ID =
  process.env.TEST_GOOGLE_CLIENT_ID ||
  'test-DUMMY-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET =
  process.env.TEST_GOOGLE_CLIENT_SECRET ||
  'test-DUMMY-client-secret-FOR-TESTING';

// Also set TEST_* variables for test-secrets.ts compatibility
process.env.TEST_API_KEY_OPENAI =
  process.env.TEST_API_KEY_OPENAI || 'sk-test-DUMMY-OPENAI-KEY-LONG-ENOUF';
process.env.TEST_API_KEY_GENERIC =
  process.env.TEST_API_KEY_GENERIC || 'test-DUMMY-GENERIC-KEY';
process.env.TEST_API_KEY_SHORT = process.env.TEST_API_KEY_SHORT || 'test-key';
process.env.TEST_API_KEY_LONG =
  process.env.TEST_API_KEY_LONG || 'sk-test-DUMMY-LONG-KEY-1234567890ABCDEFGHI';
process.env.TEST_JWT_TOKEN =
  process.env.TEST_JWT_TOKEN || 'test-DUMMY-JWT-TOKEN';
process.env.TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';
process.env.TEST_PASSWORD_SIMPLE =
  process.env.TEST_PASSWORD_SIMPLE || 'testpass';
process.env.TEST_NOTION_API_KEY =
  process.env.TEST_NOTION_API_KEY || 'test-DUMMY-NOTION-KEY';
process.env.TEST_GITHUB_TOKEN =
  process.env.TEST_GITHUB_TOKEN || 'test-DUMMY-GITHUB-TOKEN';
process.env.TEST_TRELLO_API_KEY =
  process.env.TEST_TRELLO_API_KEY || 'test-DUMMY-TRELLO-KEY';
process.env.TEST_TRELLO_TOKEN =
  process.env.TEST_TRELLO_TOKEN || 'test-DUMMY-TRELLO-TOKEN';
process.env.TEST_GOOGLE_CLIENT_ID =
  process.env.TEST_GOOGLE_CLIENT_ID || 'test-DUMMY-CLIENT-ID';
process.env.TEST_GOOGLE_CLIENT_SECRET =
  process.env.TEST_GOOGLE_CLIENT_SECRET || 'test-DUMMY-CLIENT-SECRET';
process.env.TEST_SUPABASE_URL =
  process.env.TEST_SUPABASE_URL || 'https://test-DUMMY.supabase.co';
process.env.TEST_SUPABASE_ANON_KEY =
  process.env.TEST_SUPABASE_ANON_KEY || 'test-DUMMY-ANON-KEY';
process.env.TEST_SUPABASE_SERVICE_KEY =
  process.env.TEST_SUPABASE_SERVICE_KEY || 'test-DUMMY-SERVICE-KEY';

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

// Mock window.matchMedia for media query tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

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

// Polyfill TextEncoder and TextDecoder
const util = require('node:util');
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}

// Polyfill crypto
const cryptoModule = require('node:crypto');
if (typeof global.crypto === 'undefined' || !global.crypto.subtle) {
  Object.defineProperty(global, 'crypto', {
    value: cryptoModule.webcrypto,
    writable: true,
    configurable: true,
  });
}

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
