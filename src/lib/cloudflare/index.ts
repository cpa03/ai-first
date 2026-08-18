/**
 * Cloudflare utilities and helpers
 *
 * This module provides utilities for detecting and working with Cloudflare
 * Workers environment, including platform detection, header extraction,
 * geo information, cache control, and edge-specific operations.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
 * @see https://developers.cloudflare.com/workers/runtime-apis/request/
 */

// Re-export all types
export type {
  CfCacheStatusType,
  CloudflareRequestInfo,
  CloudflareGeoInfo,
  ExecutionContext,
  CacheControlOptions,
  RequestContext,
  EarlyHintsOptions,
  BotDetectionResult,
  NextRequestExtension,
} from './types';

export { CF_CACHE_STATUS } from './types';

// Re-export headers and constants
export {
  CLOUDFLARE_HEADERS,
  CLOUDFLARE_ENV_VARS,
  CORRELATION_HEADERS,
} from './headers';

// Re-export platform detection
export {
  isCloudflareWorker,
  isCloudflareRequest,
  detectPlatform,
  getExecutionContext,
  isEdgeRequest,
} from './platform';

// Re-export request utilities
export {
  getCloudflareRequestInfo,
  getCloudflareGeoInfo,
  getClientIp,
  getRequestLatency,
  getVisitorScheme,
  createCloudflareDebugHeaders,
  getRequestContext,
} from './request';

// Re-export cache utilities
export { CF_CACHE_TTL } from './cache';
export { createCacheControlHeaders, getCacheKey } from './cache';

// Re-export correlation utilities
export {
  generateRequestId,
  getOrCreateRequestId,
  getCorrelationId,
  createCorrelationHeaders,
  addCorrelationHeaders,
} from './correlation';

// Re-export bot detection
export { detectBot } from './bot';

// Re-export Early Hints
export { createEarlyHintsHeaders, shouldSendEarlyHints } from './early-hints';

// Re-export KV utilities
export {
  CloudflareKV,
  createKVCache,
  KV_CACHE_OPTIONS,
} from './kv';

// Re-export from config for backward compatibility
export { CF_LIMITS } from '../config/cloudflare-config';
