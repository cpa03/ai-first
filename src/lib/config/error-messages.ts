/**
 * API Error Messages Configuration
 * Centralizes all error messages to enable easy modification and i18n support
 *
 * Guidelines for adding new error messages:
 * 1. Use uppercase snake_case for message keys
 * 2. Group messages by category (NOT_FOUND, VALIDATION, INTERNAL, AUTH, etc.)
 * 3. Keep messages user-friendly and actionable
 * 4. Include relevant context when helpful (e.g., field names, limits)
 */

export const API_ERROR_MESSAGES = {
  NOT_FOUND: {
    IDEA: 'Idea not found',
    TASK: 'Task not found',
    DELIVERABLE: 'Deliverable not found',
    SESSION: 'Session not found',
    CLARIFICATION_SESSION: 'Clarification session not found',
    BREAKDOWN_SESSION: 'Breakdown session not found',
    RESOURCE: 'Resource not found',
    USER: 'User not found',
    MILESTONE: 'Milestone not found',
  },
  VALIDATION: {
    IDEA_ID_REQUIRED: 'Idea ID is required',
    INVALID_IDEA_ID: 'Invalid idea ID format',
    COMPLETION_PERCENTAGE_RANGE:
      'Completion percentage must be between 0 and 100',
    INVALID_STATUS: 'Invalid task status',
    INVALID_RISK_LEVEL: 'Invalid risk level. Must be one of: low, medium, high',
    INVALID_DELIVERABLE_TYPE:
      'Invalid deliverable type. Must be one of: feature, documentation, testing, deployment, research',
    INVALID_PRIORITY: 'Priority must be a positive integer',
    INVALID_ESTIMATE: 'Estimate must be a positive number',
    SESSION_ID_REQUIRED: 'Session ID is required',
    QUESTION_ID_REQUIRED: 'Question ID is required',
    ANSWER_REQUIRED: 'Answer is required',
    ANSWER_TOO_LONG: 'Answer exceeds maximum allowed length',
  },
  INTERNAL: {
    UPDATE_TASK_FAILED: 'Failed to update task',
    DELETE_TASK_FAILED: 'Failed to delete task',
    FETCH_TASK_FAILED: 'Failed to fetch task',
    CREATE_TASK_FAILED: 'Failed to create task',
    FETCH_TASKS_FAILED: 'Failed to fetch tasks',
    UPDATE_IDEA_FAILED: 'Failed to update idea',
    DELETE_IDEA_FAILED: 'Failed to delete idea',
    FETCH_IDEA_FAILED: 'Failed to fetch idea',
    CREATE_IDEA_FAILED: 'Failed to create idea',
    UPDATE_DELIVERABLE_FAILED: 'Failed to update deliverable',
    DELETE_DELIVERABLE_FAILED: 'Failed to delete deliverable',
    FETCH_DELIVERABLE_FAILED: 'Failed to fetch deliverable',
    CREATE_DELIVERABLE_FAILED: 'Failed to create deliverable',
    FETCH_DELIVERABLES_FAILED: 'Failed to fetch deliverables',
    CLARIFICATION_START_FAILED: 'Failed to start clarification session',
    CLARIFICATION_ANSWER_FAILED: 'Failed to submit clarification answer',
    CLARIFICATION_COMPLETE_FAILED: 'Failed to complete clarification session',
    BREAKDOWN_FAILED: 'Failed to generate project breakdown',
    FETCH_BREAKDOWN_FAILED: 'Failed to fetch breakdown session',
  },
  AUTH: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    INVALID_TOKEN: 'Invalid authentication token',
    EXPIRED_TOKEN: 'Authentication token has expired',
    TOKEN_MISSING: 'Authorization token is missing',
    TOKEN_MALFORMED: 'Authorization token is malformed',
    ADMIN_REQUIRED: 'Administrator privileges required',
  },
  RATE_LIMIT: {
    EXCEEDED: 'Rate limit exceeded. Please try again later.',
    EXCEEDED_STRICT:
      'Too many requests to this sensitive endpoint. Please wait before retrying.',
    EXCEEDED_MODERATE:
      'Request rate limit exceeded. Please slow down and try again.',
    EXCEEDED_LENIENT:
      'You have exceeded the request limit. Please try again shortly.',
  },
  SERVICE: {
    AI_UNAVAILABLE: 'AI service is temporarily unavailable',
    DATABASE_ERROR: 'Database operation failed',
    EXPORT_FAILED: 'Export operation failed',
    EXTERNAL_SERVICE_TIMEOUT: 'External service request timed out',
    EXTERNAL_SERVICE_ERROR: 'External service returned an error',
    CIRCUIT_BREAKER_OPEN:
      'Service temporarily unavailable due to repeated failures',
  },
  CONFLICT: {
    SESSION_EXISTS: 'A session already exists for this idea',
    TASK_DEPENDENCY_CYCLE:
      'Cannot create task dependency that would form a cycle',
    RESOURCE_LOCKED: 'Resource is currently locked for modification',
  },
} as const;

export type APIErrorMessages = typeof API_ERROR_MESSAGES;
