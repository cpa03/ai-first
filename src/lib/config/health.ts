/**
 * Health Monitoring Configuration Module
 *
 * Centralizes health check and memory monitoring constants.
 * Extracted from constants.ts to improve modularity and reduce file size.
 *
 * @module lib/config/health
 */

import { EnvLoader } from './environment';

/**
 * Health Check Configuration
 * Centralizes health score constants and reliability weights
 * Used by the detailed health endpoint for consistent health scoring
 */
export const HEALTH_CONFIG = {
  /**
   * Health score values (0-100 scale)
   * HEALTHY = 100: Service is fully operational
   * DEGRADED = 50: Service is operational but with reduced functionality
   * UNHEALTHY = 0: Service is not operational
   */
  SCORES: {
    HEALTHY: 100,
    DEGRADED: 50,
    UNHEALTHY: 0,
  } as const,

  /**
   * Reliability factor weights (must sum to 1.0)
   * Used to calculate overall reliability score from individual service scores
   * Higher weight = more impact on overall reliability
   */
  RELIABILITY_WEIGHTS: {
    database: 0.25,
    ai: 0.25,
    exports: 0.15,
    circuitBreakers: 0.15,
    memory: 0.2,
  } as const,

  /**
   * Status thresholds for reliability score
   * Used to determine overall health status from reliability score
   */
  THRESHOLDS: {
    /** Score >= this threshold is considered healthy */
    HEALTHY_MIN: 80,
    /** Score >= this threshold is considered degraded */
    DEGRADED_MIN: 50,
    /** Score < DEGRADED_MIN is considered unhealthy */
  } as const,
} as const;

/**
 * Memory Health Configuration
 * Thresholds for memory usage monitoring and alerts
 * Used by the detailed health endpoint for memory leak detection
 */
export const MEMORY_CONFIG = {
  /**
   * Heap usage warning threshold (percentage of heapTotal)
   * Env: MEMORY_HEAP_WARNING_THRESHOLD (default: 80)
   */
  HEAP_WARNING_THRESHOLD: EnvLoader.number(
    'MEMORY_HEAP_WARNING_THRESHOLD',
    80,
    50,
    95
  ),

  /**
   * Heap usage critical threshold (percentage of heapTotal)
   * Env: MEMORY_HEAP_CRITICAL_THRESHOLD (default: 95)
   */
  HEAP_CRITICAL_THRESHOLD: EnvLoader.number(
    'MEMORY_HEAP_CRITICAL_THRESHOLD',
    95,
    80,
    99
  ),

  /**
   * RSS (Resident Set Size) warning threshold in MB
   * Env: MEMORY_RSS_WARNING_MB (default: 512)
   */
  RSS_WARNING_MB: EnvLoader.number('MEMORY_RSS_WARNING_MB', 512, 128, 4096),

  /**
   * RSS critical threshold in MB
   * Env: MEMORY_RSS_CRITICAL_MB (default: 1024)
   */
  RSS_CRITICAL_MB: EnvLoader.number('MEMORY_RSS_CRITICAL_MB', 1024, 256, 8192),

  /**
   * External memory warning threshold in MB
   * (Array buffers, bindings, etc.)
   * Env: MEMORY_EXTERNAL_WARNING_MB (default: 100)
   */
  EXTERNAL_WARNING_MB: EnvLoader.number(
    'MEMORY_EXTERNAL_WARNING_MB',
    100,
    10,
    1024
  ),

  /**
   * External memory critical threshold in MB
   * Env: MEMORY_EXTERNAL_CRITICAL_MB (default: 256)
   */
  EXTERNAL_CRITICAL_MB: EnvLoader.number(
    'MEMORY_EXTERNAL_CRITICAL_MB',
    256,
    50,
    2048
  ),
} as const;

// Type exports
export type HealthConfig = typeof HEALTH_CONFIG;
export type MemoryConfig = typeof MEMORY_CONFIG;
