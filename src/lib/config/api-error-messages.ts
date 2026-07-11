/**
 * API Error Messages Configuration
 *
 * Centralizes all hardcoded error messages used in API routes and handlers.
 * This eliminates string literals scattered throughout the codebase.
 *
 * Usage:
 * ```typescript
 * import { API_ERROR_MESSAGES } from '@/lib/config/api-error-messages';
 *
 * // Instead of hardcoded string:
 * throw new Error('Failed to generate metrics');
 *
 * // Use centralized config:
 * throw new Error(API_ERROR_MESSAGES.METRICS.GENERATION_FAILED);
 * ```
 */

export const API_ERROR_MESSAGES = {
  // Metrics API errors
  METRICS: {
    GENERATION_FAILED: 'Failed to generate metrics',
    UNAUTHORIZED: 'Unauthorized: Invalid or missing API key',
    RATE_LIMITED: 'Rate limit exceeded. Please try again later.',
    INVALID_FORMAT: 'Invalid metrics format requested',
  },

  // Ideas API errors
  IDEAS: {
    NOT_FOUND: 'Idea not found',
    CREATION_FAILED: 'Failed to create idea',
    UPDATE_FAILED: 'Failed to update idea',
    DELETION_FAILED: 'Failed to delete idea',
    FETCH_FAILED: 'Failed to fetch ideas',
    EMBEDDING_GENERATION_FAILED: 'Failed to generate embedding for idea',
    VALIDATION_FAILED: 'Invalid idea data provided',
    TITLE_REQUIRED: 'Title is required',
    TITLE_TOO_LONG: 'Title exceeds maximum length',
    DESCRIPTION_TOO_LONG: 'Description exceeds maximum length',
  },

  // Tasks API errors
  TASKS: {
    NOT_FOUND: 'Task not found',
    CREATION_FAILED: 'Failed to create task',
    UPDATE_FAILED: 'Failed to update task status',
    DELETION_FAILED: 'Failed to delete task',
    FETCH_FAILED: 'Failed to fetch tasks',
    INVALID_STATUS: 'Invalid task status provided',
    STATUS_REQUIRED: 'Task status is required',
    IDEA_ID_REQUIRED: 'Idea ID is required for task creation',
  },

  // Deliverables API errors
  DELIVERABLES: {
    NOT_FOUND: 'Deliverable not found',
    CREATION_FAILED: 'Failed to create deliverable',
    UPDATE_FAILED: 'Failed to update deliverable',
    DELETION_FAILED: 'Failed to delete deliverable',
    FETCH_FAILED: 'Failed to fetch deliverables',
    IDEA_ID_REQUIRED: 'Idea ID is required for deliverable creation',
  },

  // Clarification API errors
  CLARIFICATION: {
    SESSION_NOT_FOUND: 'Clarification session not found',
    SESSION_EXPIRED: 'Clarification session has expired',
    ANSWER_FAILED: 'Failed to save clarification answers',
    QUESTIONS_FETCH_FAILED: 'Failed to fetch clarifying questions',
    COMPLETION_FAILED: 'Failed to complete clarification',
    INVALID_ANSWER: 'Invalid answer format provided',
    SESSION_LIMIT_EXCEEDED: 'Maximum clarification sessions reached',
  },

  // Authentication API errors
  AUTH: {
    UNAUTHORIZED: 'Unauthorized: Authentication required',
    INVALID_TOKEN: 'Invalid or expired authentication token',
    TOKEN_EXPIRED: 'Authentication token has expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions for this action',
    PROVIDER_ERROR: 'Authentication provider error',
    CALLBACK_FAILED: 'Authentication callback failed',
    SESSION_ERROR: 'Authentication session error',
  },

  // Export API errors
  EXPORT: {
    NOTION_FAILED: 'Failed to export to Notion',
    TRELLO_FAILED: 'Failed to export to Trello',
    GITHUB_FAILED: 'Failed to export to GitHub Projects',
    LINEAR_FAILED: 'Failed to export to Linear',
    ASANA_FAILED: 'Failed to export to Asana',
    GOOGLE_TASKS_FAILED: 'Failed to export to Google Tasks',
    INVALID_FORMAT: 'Invalid export format requested',
    MISSING_CREDENTIALS: 'Missing export service credentials',
    RATE_LIMITED: 'Export service rate limit exceeded',
    TIMEOUT: 'Export operation timed out',
    PARTIAL_SUCCESS: 'Export completed with partial success',
  },

  // CSP Report API errors
  CSP: {
    PARSE_FAILED: 'Failed to parse CSP report',
    PROCESSING_ERROR: 'Error processing CSP report',
    INVALID_REPORT: 'Invalid CSP report format',
    STORE_FAILED: 'Failed to store CSP report',
  },

  // Health check API errors
  HEALTH: {
    UNHEALTHY: 'Service is unhealthy',
    DATABASE_UNAVAILABLE: 'Database is unavailable',
    EXTERNAL_SERVICE_UNAVAILABLE: 'External service is unavailable',
    TIMEOUT: 'Health check timed out',
    CONFIGURATION_ERROR: 'Configuration error detected',
  },

  // Rate limiting errors
  RATE_LIMIT: {
    EXCEEDED: 'Rate limit exceeded. Please try again later.',
    TOO_MANY_REQUESTS: 'Too many requests. Please slow down.',
    IP_BLOCKED: 'IP address has been temporarily blocked',
  },

  // Validation errors
  VALIDATION: {
    INVALID_INPUT: 'Invalid input provided',
    MISSING_REQUIRED_FIELD: 'Required field is missing',
    INVALID_FORMAT: 'Invalid format provided',
    VALUE_TOO_LONG: 'Value exceeds maximum length',
    VALUE_TOO_SHORT: 'Value does not meet minimum length',
    INVALID_EMAIL: 'Invalid email address format',
    INVALID_URL: 'Invalid URL format',
    INVALID_JSON: 'Invalid JSON format',
    PAYLOAD_TOO_LARGE: 'Request payload is too large',
  },

  // Database errors
  DATABASE: {
    CONNECTION_FAILED: 'Database connection failed',
    QUERY_FAILED: 'Database query failed',
    TRANSACTION_FAILED: 'Database transaction failed',
    CONSTRAINT_VIOLATION: 'Database constraint violation',
    DUPLICATE_ENTRY: 'Duplicate entry detected',
    RECORD_NOT_FOUND: 'Record not found in database',
  },

  // External service errors
  EXTERNAL: {
    SERVICE_UNAVAILABLE: 'External service is unavailable',
    TIMEOUT: 'External service request timed out',
    INVALID_RESPONSE: 'Invalid response from external service',
    RATE_LIMITED: 'External service rate limit exceeded',
    AUTHENTICATION_FAILED: 'External service authentication failed',
    NETWORK_ERROR: 'Network error communicating with external service',
  },

  // General errors
  GENERAL: {
    INTERNAL_ERROR: 'An internal server error occurred',
    NOT_FOUND: 'The requested resource was not found',
    METHOD_NOT_ALLOWED: 'HTTP method not allowed',
    BAD_REQUEST: 'Bad request',
    FORBIDDEN: 'Access to this resource is forbidden',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
    MAINTENANCE: 'Service is currently under maintenance',
  },
} as const;

// Type for API error messages
export type ApiErrorMessages = typeof API_ERROR_MESSAGES;

// Helper function to get nested error message
export function getApiErrorMessage(
  category: keyof ApiErrorMessages,
  key: string
): string {
  const categoryMessages = API_ERROR_MESSAGES[category];
  if (categoryMessages && typeof categoryMessages === 'object') {
    const message = (categoryMessages as Record<string, string>)[key];
    if (typeof message === 'string') {
      return message;
    }
  }
  return API_ERROR_MESSAGES.GENERAL.INTERNAL_ERROR;
}

// Helper function to create error with code
export function createApiError(
  category: keyof ApiErrorMessages,
  key: string,
  details?: Record<string, unknown>
): Error & { code: string; details?: Record<string, unknown> } {
  const message = getApiErrorMessage(category, key);
  const error = new Error(message) as Error & {
    code: string;
    details?: Record<string, unknown>;
  };
  error.code = `${category.toUpperCase()}_${key.toUpperCase()}`;
  if (details) {
    error.details = details;
  }
  return error;
}
