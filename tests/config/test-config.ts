/**
 * Centralized Test Configuration
 *
 * This module provides a single source of truth for test configuration values,
 * eliminating hardcoded URLs and magic numbers across test files.
 *
 * Addresses issue #1026: Consolidate Hardcoded Configuration Values
 *
 * Usage:
 * ```typescript
 * import { TEST_CONFIG, buildApiUrl } from '@/tests/config/test-config';
 *
 * const request = new NextRequest(buildApiUrl('/api/clarify/start'), { ... });
 * ```
 */

/**
 * Environment variable loader for tests
 * Provides type-safe access to test configuration via environment variables
 */
function getEnvString(key: string, defaultValue: string): string {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

function getEnvNumber(
  key: string,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;

  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;

  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;

  return parsed;
}

/**
 * Base URL Configuration
 * Can be overridden via TEST_BASE_URL environment variable
 */
export const BASE_URL = getEnvString('TEST_BASE_URL', 'http://localhost:3000');

/**
 * API Base URL (for API route testing)
 * Can be overridden via TEST_API_BASE_URL environment variable
 */
export const API_BASE_URL = getEnvString(
  'TEST_API_BASE_URL',
  `${BASE_URL}/api`
);

/**
 * Test Configuration Constants
 */
export const TEST_CONFIG = {
  /** Base URL for the application */
  BASE_URL,

  /** Base URL for API routes */
  API_BASE_URL,

  /** Default timeout for async operations in tests (ms) */
  DEFAULT_TIMEOUT: getEnvNumber('TEST_DEFAULT_TIMEOUT', 5000, 100, 60000),

  /** Extended timeout for slow operations (ms) */
  EXTENDED_TIMEOUT: getEnvNumber('TEST_EXTENDED_TIMEOUT', 30000, 1000, 120000),

  /** API endpoint paths */
  ENDPOINTS: {
    // Clarification API
    CLARIFY: '/clarify',
    CLARIFY_START: '/clarify/start',
    CLARIFY_ANSWER: '/clarify/answer',
    CLARIFY_COMPLETE: '/clarify/complete',

    // Health API
    HEALTH: '/health',
    HEALTH_DETAILED: '/health/detailed',
    HEALTH_DATABASE: '/health/database',
    HEALTH_LIVE: '/health/live',
    HEALTH_READY: '/health/ready',

    // Ideas API
    IDEAS: '/ideas',

    // Tasks API
    TASKS: '/tasks',

    // Deliverables API
    DELIVERABLES: '/deliverables',

    // Metrics API
    METRICS: '/metrics',

    // Admin API
    ADMIN_RATE_LIMIT: '/admin/rate-limit',
  } as const,

  /** Common test values */
  VALUES: {
    /** Default localhost URL for origin headers */
    LOCALHOST_ORIGIN: 'http://localhost:3000',

    /** Example production origin */
    EXAMPLE_ORIGIN: 'https://example.com',

    /** Default pagination limit */
    DEFAULT_PAGINATION_LIMIT: 50,

    /** Maximum pagination limit */
    MAX_PAGINATION_LIMIT: 100,
  } as const,
} as const;

/**
 * URL Builder Functions
 * Provides type-safe URL construction for tests
 */

/**
 * Build a full URL for an API endpoint
 * @param endpoint - The API endpoint path (e.g., '/clarify/start')
 * @returns Full URL string
 */
export function buildApiUrl(endpoint: string): string {
  // Remove leading slash from endpoint if present to avoid double slashes
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

/**
 * Build a full URL for a page route
 * @param path - The page path (e.g., '/dashboard')
 * @returns Full URL string
 */
export function buildPageUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${normalizedPath}`;
}

/**
 * Build a URL for a specific idea
 * @param ideaId - The idea ID
 * @returns Full URL string for the idea endpoint
 */
export function buildIdeaUrl(ideaId: string): string {
  return buildApiUrl(`/ideas/${ideaId}`);
}

/**
 * Build a URL for a specific task
 * @param taskId - The task ID
 * @returns Full URL string for the task endpoint
 */
export function buildTaskUrl(taskId: string): string {
  return buildApiUrl(`/tasks/${taskId}`);
}

/**
 * Build a URL for deliverables of a specific idea
 * @param ideaId - The idea ID
 * @returns Full URL string for the deliverables endpoint
 */
export function buildDeliverablesUrl(ideaId: string): string {
  return buildApiUrl(`/deliverables/${ideaId}/tasks`);
}

/**
 * Type exports for better type safety in tests
 */
export type TestConfig = typeof TEST_CONFIG;
export type TestEndpoints = typeof TEST_CONFIG.ENDPOINTS;
export type TestValues = typeof TEST_CONFIG.VALUES;
