import type { NextRequest } from 'next/server';
import type { RateLimitInfo } from '@/lib/rate-limit';

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
 * Options for configuring the API handler
 */
export interface ApiHandlerOptions {
  rateLimit?: keyof typeof import('@/lib/rate-limit').rateLimitConfigs;
  validateSize?: boolean;
  cacheTtlSeconds?: number;
  cacheScope?: 'public' | 'private';
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
}

/**
 * Type for the API handler function
 */
export type ApiHandler = (context: ApiContext) => Promise<Response>;
