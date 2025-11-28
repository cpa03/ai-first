// Polyfill for Next.js Request in Node test environment
import { Request as NodeRequest } from 'node-fetch';

// Mock Next.js Request
global.Request = NodeRequest as any;
global.Response = Response as any;

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-key';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Test timeout configuration
jest.setTimeout(10000);