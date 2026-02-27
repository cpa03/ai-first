import type { NextRequest } from 'next/server';
import type { RateLimitInfo, UserRole } from '@/lib/rate-limit';

/**
 * Standard API response format
 */
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  requestId: string;
  timestamp: string;
}

/**
 * Timeout preset for API routes
 * - 'quick': 5 seconds (health checks, simple lookups)
 * - 'standard': 10 seconds (most API operations)
 * - 'long': 30 seconds (complex operations, large data)
 */
export type TimeoutPreset = 'quick' | 'standard' | 'long';

/**
 * Options for configuring the API handler
 */
export interface ApiHandlerOptions {
  rateLimit?: keyof typeof import('@/lib/rate-limit').rateLimitConfigs;
  validateSize?: boolean;
  cacheTtlSeconds?: number;
  cacheScope?: 'public' | 'private';
  /**
   * Timeout preset for API routes
   * - 'quick': 5 seconds (health checks, simple lookups)
   * - 'standard': 10 seconds (most API operations)
   * - 'long': 30 seconds (complex operations, large data)
   * Takes precedence over timeoutMs if both are specified
   */
  timeout?: TimeoutPreset;
  /**
   * Timeout in milliseconds (explicit)
   * Used when a specific timeout value is needed beyond presets
   */
  timeoutMs?: number;
  skipCSRF?: boolean;
}

/**
 * Context object passed to API handlers
 */
export interface ApiContext {
  requestId: string;
  request: NextRequest;
  rateLimit: RateLimitInfo;
  /**
   * User ID if authenticated, null for anonymous requests
   */
  userId: string | null;
  /**
   * User role for tiered rate limiting
   */
  userRole: UserRole;
}

/**
 * Type for the API handler function
 */
export type ApiHandler = (context: ApiContext) => Promise<Response>;
