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

// Helper to safely set process.env values for testing
export const setProcessEnv = (
  key: string,
  value: string | undefined
): (() => void) => {
  const originalValue = process.env[key];
  process.env[key] = value;
  return () => {
    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  };
};
