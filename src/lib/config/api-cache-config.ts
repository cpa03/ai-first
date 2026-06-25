import { EnvLoader } from './environment';

/**
 * API Cache Configuration
 * HTTP caching configuration for API endpoints
 * Now supports environment variable overrides
 */
export const API_CACHE_CONFIG = {
  /**
   * Health endpoint cache TTL in seconds
   * Short cache to reduce health check load while maintaining responsiveness
   * Env: API_CACHE_HEALTH_TTL_SECONDS (default: 5)
   */
  HEALTH_TTL_SECONDS: EnvLoader.number(
    'API_CACHE_HEALTH_TTL_SECONDS',
    5,
    0,
    60
  ),

  /**
   * Database health endpoint cache TTL in seconds
   * Env: API_CACHE_DATABASE_HEALTH_TTL_SECONDS (default: 5)
   */
  DATABASE_HEALTH_TTL_SECONDS: EnvLoader.number(
    'API_CACHE_DATABASE_HEALTH_TTL_SECONDS',
    5,
    0,
    60
  ),

  /**
   * Liveness probe cache TTL in seconds
   * Very short TTL for k8s liveness checks
   * Env: API_CACHE_LIVE_TTL_SECONDS (default: 1)
   */
  LIVE_TTL_SECONDS: EnvLoader.number('API_CACHE_LIVE_TTL_SECONDS', 1, 0, 10),

  /**
   * Readiness probe cache TTL in seconds
   * Env: API_CACHE_READY_TTL_SECONDS (default: 2)
   */
  READY_TTL_SECONDS: EnvLoader.number('API_CACHE_READY_TTL_SECONDS', 2, 0, 30),

  /**
   * Detailed health cache TTL in seconds
   * Longer TTL as detailed health is less frequently needed
   * Env: API_CACHE_DETAILED_HEALTH_TTL_SECONDS (default: 10)
   */
  DETAILED_HEALTH_TTL_SECONDS: EnvLoader.number(
    'API_CACHE_DETAILED_HEALTH_TTL_SECONDS',
    10,
    0,
    120
  ),

  /**
   * Ideas list cache TTL in seconds (for authenticated users)
   * Private cache - only cached by the client, not shared caches
   * Env: API_CACHE_IDEAS_LIST_TTL_SECONDS (default: 10)
   */
  IDEAS_LIST_TTL_SECONDS: EnvLoader.number(
    'API_CACHE_IDEAS_LIST_TTL_SECONDS',
    10,
    0,
    300
  ),
} as const;
