/**
 * API Endpoint Configuration
 *
 * Centralizes all API endpoint paths for better modularity and maintainability.
 * Allows for easy updates when API routes change without modifying multiple files.
 *
 * Usage:
 * ```typescript
 * import { API_ENDPOINTS } from '@/lib/config';
 * const response = await fetch(API_ENDPOINTS.IDEA_TASKS(ideaId));
 * ```
 */
import { EnvLoader } from './environment';

/**
 * Base API path prefix
 * Env: API_BASE_PATH (default: '/api')
 */
const BASE_PATH = EnvLoader.string('API_BASE_PATH', '/api');

/**
 * Application base URL for constructing full URLs
 * Env: NEXT_PUBLIC_APP_URL (default: '')
 */
const APP_BASE_URL = EnvLoader.string('NEXT_PUBLIC_APP_URL', '');

/**
 * API Endpoint paths
 * All paths are relative to the API base path
 */
export const API_ENDPOINTS = {
  // Ideas API
  IDEAS: `${BASE_PATH}/ideas`,
  IDEA_TASKS: (ideaId: string) => `${BASE_PATH}/ideas/${ideaId}/tasks`,
  IDEA_SESSION: (ideaId: string) => `${BASE_PATH}/ideas/${ideaId}/session`,
  IDEA_SIMILAR: (ideaId: string) => `${BASE_PATH}/ideas/${ideaId}/similar`,

  // Tasks API
  TASK: (taskId: string) => `${BASE_PATH}/tasks/${taskId}`,
  TASK_STATUS: (taskId: string) => `${BASE_PATH}/tasks/${taskId}/status`,

  // Deliverables API
  DELIVERABLE_TASKS: (deliverableId: string) =>
    `${BASE_PATH}/deliverables/${deliverableId}/tasks`,

  // Clarify API
  CLARIFY: `${BASE_PATH}/clarify`,
  CLARIFY_START: `${BASE_PATH}/clarify/start`,
  CLARIFY_ANSWER: `${BASE_PATH}/clarify/answer`,
  CLARIFY_COMPLETE: `${BASE_PATH}/clarify/complete`,

  // Breakdown API
  BREAKDOWN: `${BASE_PATH}/breakdown`,

  // Health API
  HEALTH: `${BASE_PATH}/health`,
  HEALTH_DATABASE: `${BASE_PATH}/health/database`,
  HEALTH_DETAILED: `${BASE_PATH}/health/detailed`,
  HEALTH_INTEGRATIONS: `${BASE_PATH}/health/integrations`,
  HEALTH_LIVE: `${BASE_PATH}/health/live`,
  HEALTH_READY: `${BASE_PATH}/health/ready`,

  // Metrics API
  METRICS: `${BASE_PATH}/metrics`,

  // Admin API
  ADMIN_RATE_LIMIT: `${BASE_PATH}/admin/rate-limit`,

  // Auth callbacks (full URLs)
  AUTH_CALLBACKS: {
    NOTION: `${APP_BASE_URL}${BASE_PATH}/auth/notion/callback`,
    TRELLO: `${APP_BASE_URL}${BASE_PATH}/auth/trello/callback`,
    GOOGLE: `${APP_BASE_URL}${BASE_PATH}/auth/google/callback`,
    GITHUB: `${APP_BASE_URL}${BASE_PATH}/auth/github/callback`,
  },
} as const;

/**
 * TypeScript type for API_ENDPOINTS
 */
export type ApiEndpoints = typeof API_ENDPOINTS;
