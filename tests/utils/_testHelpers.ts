// Helper to safely set process.env values (avoids read-only property errors)
export const setProcessEnv = (
  key: string,
  value: string | undefined
): string | undefined => {
  const original = process.env[key];
  (process.env as Record<string, string | undefined>)[key] = value;
  return original;
};

/**
 * Mock utilities for consistent test environment setup
 */

import { MOCK_SECRETS } from './test-secrets';

// Centralized mock environment variables using MOCK_SECRETS
// This ensures all test files use the same safe, mock credentials
// @see tests/utils/test-secrets.ts for the source of truth
export const mockEnvVars = {
  OPENAI_API_KEY: MOCK_SECRETS.OPENAI_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: MOCK_SECRETS.SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: MOCK_SECRETS.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: MOCK_SECRETS.SUPABASE_SERVICE_ROLE_KEY,
  NOTION_API_KEY: MOCK_SECRETS.NOTION_API_KEY,
  TRELLO_API_KEY: MOCK_SECRETS.TRELLO_API_KEY,
  TRELLO_TOKEN: MOCK_SECRETS.TRELLO_TOKEN,
  GITHUB_TOKEN: MOCK_SECRETS.GITHUB_TOKEN,
  GOOGLE_CLIENT_ID: MOCK_SECRETS.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: MOCK_SECRETS.GOOGLE_CLIENT_SECRET,
};

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockSingle = jest.fn().mockResolvedValue({
    data: { id: 'test-id', content: 'test-content' },
    error: null,
  });
  const mockIs = jest.fn(() => ({
    single: mockSingle,
  }));
  const mockEq = jest.fn(() => ({
    single: mockSingle,
    is: mockIs,
  }));
  const mockSelect = jest.fn().mockReturnValue({
    eq: mockEq,
    single: mockSingle,
  });
  const mockOrder = jest.fn(() => ({
    data: [],
    error: null,
  }));
  const mockUpdateEq = jest.fn().mockResolvedValue({
    data: { id: 'test-id', updated: true },
    error: null,
  });
  const mockUpdate = jest.fn(() => ({
    eq: mockUpdateEq,
  }));
  const mockDeleteEq = jest.fn().mockResolvedValue({
    data: null,
    error: null,
  });
  const mockDelete = jest.fn(() => ({
    eq: mockDeleteEq,
  }));

  // Mock select result for insert().select() chain that also supports .single()
  const mockSelectAfterInsert = jest.fn().mockReturnValue({
    single: mockSingle,
  });

  // Mock insert that supports chaining with .select() and .select().single()
  const mockInsert = jest.fn().mockReturnValue({
    select: mockSelectAfterInsert,
  });

  return {
    from: jest.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
      update: mockUpdate,
      delete: mockDelete,
    })),
    mockInsert,
    mockSelect,
    mockEq,
    mockSingle,
    mockUpdateEq,
    mockOrder,
    mockUpdate,
    mockDeleteEq,
    mockDelete,
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  };
};

// Mock OpenAI responses
export const mockOpenAIResponses = {
  clarificationQuestions: [
    {
      id: 'q_1',
      question: 'What is main problem you are trying to solve with this idea?',
      type: 'open',
      options: [],
      required: true,
    },
    {
      id: 'q_2',
      question: 'Who is target audience for this solution?',
      type: 'open',
      options: [],
      required: true,
    },
    {
      id: 'q_3',
      question: 'What are key features or functionality you envision?',
      type: 'open',
      options: [],
      required: true,
    },
  ],
  refinedIdea: 'This is a refined idea based on user answers',
  breakdownBlueprint: {
    title: 'Test Project',
    description: 'Test Description',
    phases: [
      {
        name: 'Phase 1',
        tasks: [
          {
            title: 'Task 1',
            description: 'Description 1',
            estimated: '2 days',
          },
        ],
      },
    ],
  },
};

// Mock API responses
export const mockAPIResponses = {
  success: { success: true, data: 'test-data' },
  error: { success: false, error: 'Test error message' },
  networkError: new Error('Network error'),
  unauthorized: { success: false, error: 'Unauthorized' },
};

// Mock export results
export const mockExportResults = {
  markdown: {
    success: true,
    url: 'https://example.com/export.md',
    content: '# Test Project\n\nTest content',
  },
  notion: {
    success: true,
    url: 'https://notion.so/test-page',
    notionPageId: 'test-page-id',
  },
  trello: {
    success: true,
    url: 'https://trello.com/b/test-board',
    boardId: 'test-board-id',
  },
  github: {
    success: true,
    url: 'https://github.com/test/repo/projects/1',
    projectId: 1,
  },
};

// Mock user journey data
export const mockUserJourney = {
  ideaInput: 'I want to build a habit tracking app',
  questions: mockOpenAIResponses.clarificationQuestions,
  answers: {
    q_1: 'To help people build better habits',
    q_2: 'People looking to improve their daily routines',
    q_3: 'Track daily tasks and milestones',
  },
  refinedIdea: mockOpenAIResponses.refinedIdea,
  blueprint: mockOpenAIResponses.breakdownBlueprint,
  exports: mockExportResults,
};

// Helper function to wait for async operations
export const waitForAsync = (ms = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Helper to create mock fetch responses
export const createMockFetch = (
  response: unknown,
  options: { status?: number; ok?: boolean; delay?: number } = {}
) => {
  const { status = 200, ok = true, delay = 0 } = options;

  return jest.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok,
            status,
            json: async () => response,
            text: async () => JSON.stringify(response),
          });
        }, delay);
      })
  );
};

// Helper to create mock fetch responses with standardSuccessResponse format
export const createStandardMockFetch = (
  data: unknown,
  options: { status?: number; ok?: boolean; delay?: number } = {}
) => {
  const { status = 200, ok = true, delay = 0 } = options;

  const response = {
    success: true,
    data: data,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  return jest.fn().mockImplementation(
    () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok,
            status,
            json: async () => response,
            text: async () => JSON.stringify(response),
          });
        }, delay);
      })
  );
};

// Helper to mock console methods
export const mockConsole = () => {
  const originalConsole = { ...console };
  const mockConsole = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  };

  beforeEach(() => {
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });

  return mockConsole;
};

// =============================================================================
// Typed Mock Helpers - Reduce 'as any' usage in test files
// =============================================================================

import type { ApiContext } from '@/lib/api-handler';
import type { Vector } from '@/lib/db';

/**
 * Creates a properly typed mock ApiHandler for use in tests.
 * This eliminates the need for 'as any' when passing handlers to withApiHandler.
 *
 * @param response - The response the handler should return
 * @returns A jest.fn() typed as ApiHandler
 */
export const createMockApiHandler = (
  response: Response
): jest.Mock<Promise<Response>, [ApiContext]> => {
  return jest.fn<Promise<Response>, [ApiContext]>().mockResolvedValue(response);
};

/**
 * Creates a mock ApiHandler that can be configured with custom behavior.
 *
 * @param impl - Optional implementation function
 * @returns A jest.fn() typed as ApiHandler
 */
export const createTypedMockHandler = (
  impl?: (context: ApiContext) => Promise<Response>
): jest.Mock<Promise<Response>, [ApiContext]> => {
  return jest.fn<Promise<Response>, [ApiContext]>(impl);
};

/**
 * Type-safe way to create partial mock objects for database operations.
 * Use this instead of '{} as any' for mock return values.
 *
 * @example
 * const mockResult = createPartialMock<DbResult>({ id: 'test-1' });
 */
export function createPartialMock<T>(partial: Partial<T>): Partial<T> {
  return partial;
}

/**
 * Type-safe way to test invalid inputs in validation functions.
 * This allows passing values that would normally be rejected by TypeScript
 * while maintaining type safety in the test file itself.
 *
 * @example
 * const result = validateIdea(asInvalidInput(null));
 * const result = validateIdea(asInvalidInput(undefined));
 */
export function asInvalidInput<T>(value: unknown): T {
  return value as T;
}

/**
 * Helper to set multiple process.env values and get a cleanup function.
 * More convenient than calling setProcessEnv multiple times.
 */
export const setProcessEnvVars = (
  vars: Record<string, string | undefined>
): (() => void) => {
  const originals: Record<string, string | undefined> = {};

  Object.entries(vars).forEach(([key, value]) => {
    originals[key] = setProcessEnv(key, value);
  });

  return () => {
    Object.entries(originals).forEach(([key, value]) => {
      setProcessEnv(key, value);
    });
  };
};

/**
 * Creates a typed mock Vector for testing.
 * Use this instead of '{} as any' when mocking vector operations.
 *
 * @param overrides - Partial Vector properties to override
 * @returns A properly typed Vector object
 */
export const createMockVector = (overrides: Partial<Vector> = {}): Vector => ({
  id: 'test-vector-id',
  idea_id: 'test-idea-id',
  vector_data: { test: 'data' },
  reference_type: 'clarification_session',
  reference_id: 'test-ref-id',
  created_at: new Date().toISOString(),
  embedding: [0.1, 0.2, 0.3],
  ...overrides,
});

/**
 * Creates a typed mock Vector array for getVectors mock responses.
 * Use this instead of '[] as any' when mocking vector queries.
 *
 * @param count - Number of vectors to create
 * @param overrides - Properties to apply to all vectors
 * @returns An array of properly typed Vector objects
 */
export const createMockVectorArray = (
  count: number = 1,
  overrides: Partial<Vector> = {}
): Vector[] =>
  Array.from({ length: count }, (_, i) =>
    createMockVector({
      id: `test-vector-${i + 1}`,
      idea_id: `test-idea-${i + 1}`,
      ...overrides,
    })
  );

/**
 * Creates a mock for database operations that return void/success.
 * Use this instead of 'mockResolvedValue({} as any)' for db operations.
 *
 * @returns A promise that resolves to undefined
 */
export const createMockDbSuccess = (): Promise<void> =>
  Promise.resolve(undefined);

/**
 * Creates a typed mock for database create operations.
 * Use this instead of 'mockResolvedValue({ id: "xxx" } as any)'.
 *
 * @param id - The ID to return
 * @returns A promise resolving to an object with the given ID
 */
export const createMockDbCreate = <T extends { id: string }>(
  id: string,
  additionalFields: Partial<T> = {}
): Promise<T> =>
  Promise.resolve({
    id,
    ...additionalFields,
  } as T);

// =============================================================================
// Additional Typed Mock Helpers - Reduce 'as any' in API tests
// =============================================================================

/**
 * Creates a mock Next.js Request object for API route testing.
 * Use this instead of '{} as any' or 'request as any' when testing API routes.
 *
 * @example
 * const request = createMockRequest({
 *   json: async () => ({ idea: 'My idea' })
 * });
 * const response = await POST(request);
 */
export interface MockRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
  body?: string | null;
  url?: string;
}

export const createMockRequest = (
  options: MockRequestOptions = {}
): Request => {
  const {
    method = 'POST',
    headers = {},
    json = async () => ({}),
    text = async () => '',
    body = null,
    url = 'http://localhost:3000/api/test',
  } = options;

  const mockRequest = {
    method,
    headers: new Headers(headers),
    json,
    text,
    body,
    url,
    clone: function () {
      return this;
    },
    cache: 'default' as RequestCache,
    credentials: 'same-origin' as RequestCredentials,
    destination: 'document' as RequestDestination,
    integrity: '',
    isHistoryNavigation: false,
    isReload: false,
    mode: 'cors' as RequestMode,
    redirect: 'follow' as RequestRedirect,
    referrer: '',
    referrerPolicy: 'no-referrer' as ReferrerPolicy,
    signal: new AbortSignal(),
  };

  return mockRequest as unknown as Request;
};

/**
 * Creates a typed mock for a database query result.
 * Use this instead of 'mockResolvedValue({} as any)' for db queries.
 *
 * @example
 * const mockResult = createMockDbQueryResult([{ id: '1', name: 'Test' }]);
 * mockDbService.getIdeas.mockResolvedValue(mockResult);
 */
export interface DbQueryResult<T> {
  data: T[] | null;
  error: Error | null;
  count?: number;
}

export const createMockDbQueryResult = <T>(
  data: T[],
  options: { error?: Error | null; count?: number } = {}
): Promise<{ data: T[]; error: null } | { data: null; error: Error }> => {
  const { error = null, count } = options;

  if (error) {
    return Promise.resolve({ data: null, error });
  }

  const result: { data: T[]; error: null; count?: number } = { data, error };
  if (count !== undefined) {
    result.count = count;
  }
  return Promise.resolve(result);
};

/**
 * Creates a typed mock for a database single result (e.g., from .single()).
 * Use this instead of 'mockResolvedValue({} as any)' for db single results.
 *
 * @example
 * const mockResult = createMockDbSingleResult({ id: '1', name: 'Test' });
 * mockDbService.getIdeaById.mockResolvedValue(mockResult);
 */
export const createMockDbSingleResult = <T>(
  data: T | null,
  error: Error | null = null
): Promise<{ data: T; error: null } | { data: null; error: Error }> => {
  if (error || data === null) {
    return Promise.resolve({
      data: null,
      error: error ?? new Error('No data found'),
    });
  }
  return Promise.resolve({ data, error: null });
};

/**
 * Creates a typed mock for a database insert result.
 * Use this instead of 'mockResolvedValue({} as any)' for db inserts.
 *
 * @example
 * const mockResult = createMockDbInsertResult({ id: 'new-1', name: 'New' });
 * mockDbService.createIdea.mockResolvedValue(mockResult);
 */
export const createMockDbInsertResult = <T extends { id: string }>(
  data: T,
  error: Error | null = null
): Promise<{ data: T; error: null } | { data: null; error: Error }> => {
  if (error) {
    return Promise.resolve({ data: null, error });
  }
  return Promise.resolve({ data, error: null });
};

/**
 * Creates a typed mock for a database update result.
 * Use this instead of 'mockResolvedValue({} as any)' for db updates.
 *
 * @example
 * const mockResult = createMockDbUpdateResult({ id: '1', updated: true });
 * mockDbService.updateIdea.mockResolvedValue(mockResult);
 */
export const createMockDbUpdateResult = <T>(
  data: T,
  error: Error | null = null
): Promise<{ data: T; error: null } | { data: null; error: Error }> => {
  if (error) {
    return Promise.resolve({ data: null, error });
  }
  return Promise.resolve({ data, error: null });
};

/**
 * Creates a typed mock for a database delete result.
 * Use this instead of 'mockResolvedValue({} as any)' for db deletes.
 *
 * @example
 * const mockResult = createMockDbDeleteResult();
 * mockDbService.deleteIdea.mockResolvedValue(mockResult);
 */
export const createMockDbDeleteResult = (
  error: Error | null = null
): Promise<{ data: null; error: Error | null }> => {
  return Promise.resolve({ data: null, error });
};

// =============================================================================
// NEW: Additional Typed Mock Helpers for Issue #1795
// Reduce 'as any' in various test scenarios
// =============================================================================

/**
 * Creates a typed mock for database operations that return void (no data).
 * Use this instead of 'mockResolvedValue({} as any)' for operations like:
 * - storeVector()
 * - updateIdea()
 * - createTask() (when not returning created task)
 *
 * @example
 * mockDbService.storeVector.mockResolvedValue(createMockDbVoidResult());
 * mockDbService.updateIdea.mockResolvedValue(createMockDbVoidResult());
 */
export const createMockDbVoidResult = (): Promise<void> =>
  Promise.resolve(undefined);

/**
 * Creates a typed mock for global.window in Node.js test environments.
 * Use this instead of '(global as any).window' for browser API mocking.
 *
 * @example
 * // In beforeEach
 * const { cleanup } = createMockGlobalWindow();
 *
 * // In afterEach
 * cleanup();
 */
export const createMockGlobalWindow = (): {
  window: typeof globalThis.window;
  cleanup: () => void;
} => {
  const originalWindow = (global as { window?: typeof globalThis.window })
    .window;

  const mockWindow = {
    location: {
      href: 'http://localhost/',
      pathname: '/',
      protocol: 'http:',
      host: 'localhost',
    },
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    sessionStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  // Set the mock window
  (global as { window: typeof mockWindow }).window =
    mockWindow as typeof globalThis.window;

  return {
    window: mockWindow as typeof globalThis.window,
    cleanup: () => {
      if (originalWindow !== undefined) {
        (global as { window: typeof originalWindow }).window = originalWindow;
      } else {
        delete (global as { window?: typeof mockWindow }).window;
      }
    },
  };
};

/**
 * Creates a typed mock for localStorage in tests.
 * Use this instead of 'localStorageMock as any' or '(localStorage as any).store'.
 *
 * @example
 * const localStorageMock = createMockLocalStorage();
 * global.localStorage = localStorageMock;
 *
 * // To pre-populate storage
 * const storage = createMockLocalStorage({ key1: 'value1' });
 */
export const createMockLocalStorage = (
  initialData: Record<string, string> = {}
): {
  getItem: jest.Mock<string | null, [string]>;
  setItem: jest.Mock<void, [string, string]>;
  removeItem: jest.Mock<void, [string]>;
  clear: jest.Mock<void, []>;
  key: jest.Mock<string | null, [number]>;
  length: number;
  store: Record<string, string>;
} => {
  const store = { ...initialData };

  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
    store, // Direct access to store for tests that need it
  };
};

/**
 * Creates a typed mock Idea object for tests.
 * Use this instead of 'mockIdea as any' when testing idea-related operations.
 *
 * @example
 * const idea = createMockIdea({ title: 'My Idea' });
 * mockDbService.createIdea.mockResolvedValue(idea);
 */
export interface MockIdea {
  id: string;
  title: string;
  status: 'draft' | 'clarifying' | 'breakdown' | 'completed' | 'archived';
  raw_text: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  deleted_at: string | null;
}

export const createMockIdea = (
  overrides: Partial<MockIdea> = {}
): MockIdea => ({
  id: 'test-idea-id',
  title: 'Test Idea',
  status: 'draft' as const,
  raw_text: 'This is a test idea for validation purposes',
  user_id: 'test-user-id',
  created_at: new Date().toISOString(),
  deleted_at: null,
  ...overrides,
});

/**
 * Creates a typed mock API response for idea creation/retrieval.
 * Use this instead of manually constructing API response objects.
 *
 * @example
 * const ideaResponse = createMockIdeaApiResponse(idea);
 * expect(ideaResponse.success).toBe(true);
 */
export const createMockIdeaApiResponse = (
  idea: MockIdea
): {
  success: boolean;
  data: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  };
  requestId: string;
  timestamp: string;
} => ({
  success: true,
  data: {
    id: idea.id,
    title: idea.title,
    status: idea.status,
    createdAt: idea.created_at,
  },
  requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  timestamp: new Date().toISOString(),
});
