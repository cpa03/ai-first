/**
 * API Routes Configuration
 *
 * Centralizes all API endpoint paths for better modularity
 * and maintainability. Eliminates hardcoded API route strings throughout the codebase.
 *
 * Supports environment variable overrides via EnvLoader for flexibility
 * in different deployment environments.
 *
 * Usage:
 * ```typescript
 * import { API_ROUTES } from '@/lib/config';
 * const response = await fetchWithTimeout(API_ROUTES.IDEAS);
 * const response = await fetchWithTimeout(`${API_ROUTES.IDEAS}/${id}`);
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded API route strings with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * fetchWithTimeout('/api/ideas')
 * fetchWithTimeout(`/api/ideas/${id}`)
 *
 * // AFTER (modular)
 * import { API_ROUTES } from '@/lib/config';
 * fetchWithTimeout(API_ROUTES.IDEAS)
 * fetchWithTimeout(`${API_ROUTES.IDEAS}/${id}`)
 * ```
 */

import { EnvLoader } from './environment';

/**
 * API Routes
 * All API endpoint paths centralized in one place
 */
export const API_ROUTES = {
  /** Health check endpoints */
  HEALTH: EnvLoader.string('API_ROUTE_HEALTH', '/api/health'),
  HEALTH_DETAILED: EnvLoader.string(
    'API_ROUTE_HEALTH_DETAILED',
    '/api/health/detailed'
  ),
  HEALTH_DATABASE: EnvLoader.string(
    'API_ROUTE_HEALTH_DATABASE',
    '/api/health/database'
  ),
  HEALTH_LIVE: EnvLoader.string('API_ROUTE_HEALTH_LIVE', '/api/health/live'),
  HEALTH_READY: EnvLoader.string('API_ROUTE_HEALTH_READY', '/api/health/ready'),
  HEALTH_INTEGRATIONS: EnvLoader.string(
    'API_ROUTE_HEALTH_INTEGRATIONS',
    '/api/health/integrations'
  ),

  /** Ideas endpoints */
  IDEAS: EnvLoader.string('API_ROUTE_IDEAS', '/api/ideas'),
  IDEAS_BY_ID: EnvLoader.string('API_ROUTE_IDEAS_BY_ID', '/api/ideas/:id'),
  IDEAS_TASKS: EnvLoader.string(
    'API_ROUTE_IDEAS_TASKS',
    '/api/ideas/:id/tasks'
  ),
  IDEAS_SESSION: EnvLoader.string(
    'API_ROUTE_IDEAS_SESSION',
    '/api/ideas/:id/session'
  ),
  IDEAS_SIMILAR: EnvLoader.string(
    'API_ROUTE_IDEAS_SIMILAR',
    '/api/ideas/:id/similar'
  ),

  /** Clarification endpoints */
  CLARIFY_START: EnvLoader.string(
    'API_ROUTE_CLARIFY_START',
    '/api/clarify/start'
  ),
  CLARIFY_ANSWER: EnvLoader.string(
    'API_ROUTE_CLARIFY_ANSWER',
    '/api/clarify/answer'
  ),
  CLARIFY_COMPLETE: EnvLoader.string(
    'API_ROUTE_CLARIFY_COMPLETE',
    '/api/clarify/complete'
  ),

  /** Breakdown endpoints */
  BREAKDOWN: EnvLoader.string('API_ROUTE_BREAKDOWN', '/api/breakdown'),

  /** Deliverables endpoints */
  DELIVERABLES: EnvLoader.string('API_ROUTE_DELIVERABLES', '/api/deliverables'),
  DELIVERABLES_TASKS: EnvLoader.string(
    'API_ROUTE_DELIVERABLES_TASKS',
    '/api/deliverables/:id/tasks'
  ),

  /** Tasks endpoints */
  TASKS: EnvLoader.string('API_ROUTE_TASKS', '/api/tasks'),
  TASKS_BY_ID: EnvLoader.string('API_ROUTE_TASKS_BY_ID', '/api/tasks/:id'),
  TASKS_STATUS: EnvLoader.string(
    'API_ROUTE_TASKS_STATUS',
    '/api/tasks/:id/status'
  ),

  /** Metrics endpoints */
  METRICS: EnvLoader.string('API_ROUTE_METRICS', '/api/metrics'),

  /** Admin endpoints */
  ADMIN: EnvLoader.string('API_ROUTE_ADMIN', '/api/admin'),
  ADMIN_RATE_LIMIT: EnvLoader.string(
    'API_ROUTE_ADMIN_RATE_LIMIT',
    '/api/admin/rate-limit'
  ),

  /** Export endpoints */
  EXPORT_NOTION: EnvLoader.string(
    'API_ROUTE_EXPORT_NOTION',
    '/api/export/notion'
  ),
  EXPORT_TRELLO: EnvLoader.string(
    'API_ROUTE_EXPORT_TRELLO',
    '/api/export/trello'
  ),
  EXPORT_GITHUB_PROJECTS: EnvLoader.string(
    'API_ROUTE_EXPORT_GITHUB_PROJECTS',
    '/api/export/github-projects'
  ),
  EXPORT_GOOGLE_TASKS: EnvLoader.string(
    'API_ROUTE_EXPORT_GOOGLE_TASKS',
    '/api/export/google-tasks'
  ),

  /** Auth endpoints */
  AUTH_GITHUB_CALLBACK: EnvLoader.string(
    'API_ROUTE_AUTH_GITHUB_CALLBACK',
    '/api/auth/github/callback'
  ),
  AUTH_TRELLO_CALLBACK: EnvLoader.string(
    'API_ROUTE_AUTH_TRELLO_CALLBACK',
    '/api/auth/trello/callback'
  ),
  AUTH_NOTION_CALLBACK: EnvLoader.string(
    'API_ROUTE_AUTH_NOTION_CALLBACK',
    '/api/auth/notion/callback'
  ),
  AUTH_GOOGLE_CALLBACK: EnvLoader.string(
    'API_ROUTE_AUTH_GOOGLE_CALLBACK',
    '/api/auth/google/callback'
  ),

  /** CSP report endpoint */
  CSP_REPORT: EnvLoader.string('API_ROUTE_CSP_REPORT', '/api/csp-report'),
} as const;

/**
 * TypeScript type for API_ROUTES
 */
export type ApiRoutes = typeof API_ROUTES;
