/**
 * API Error Messages Configuration
 * Centralizes all error messages to enable easy modification and i18n support
 */

export const API_ERROR_MESSAGES = {
  NOT_FOUND: {
    IDEA: 'Idea not found',
    TASK: 'Task not found',
    DELIVERABLE: 'Deliverable not found',
    SESSION: 'Session not found',
    RESOURCE: 'Resource not found',
  },
  VALIDATION: {
    IDEA_ID_REQUIRED: 'Idea ID is required',
    INVALID_IDEA_ID: 'Invalid idea ID format',
    COMPLETION_PERCENTAGE_RANGE:
      'Completion percentage must be between 0 and 100',
    INVALID_STATUS: 'Invalid task status',
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
  },
  AUTH: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    INVALID_TOKEN: 'Invalid authentication token',
    EXPIRED_TOKEN: 'Authentication token has expired',
  },
  RATE_LIMIT: {
    EXCEEDED: 'Rate limit exceeded. Please try again later.',
  },
  SERVICE: {
    AI_UNAVAILABLE: 'AI service is temporarily unavailable',
    DATABASE_ERROR: 'Database operation failed',
    EXPORT_FAILED: 'Export operation failed',
  },
} as const;

export type APIErrorMessages = typeof API_ERROR_MESSAGES;
