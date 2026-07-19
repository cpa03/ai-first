/**
 * Error codes and suggestions
 */

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
  RETRY_EXHAUSTED = 'RETRY_EXHAUSTED',
  NOT_READY = 'NOT_READY',
}

export const ERROR_SUGGESTIONS: Record<ErrorCode, string[]> = {
  VALIDATION_ERROR: [
    'Check that all required fields are present in your request',
    'Ensure field values match the expected format',
    'Verify that string lengths are within the allowed limits',
    'Check that UUIDs are properly formatted',
  ],
  BAD_REQUEST: [
    'Check that all required fields are present in your request',
    'Ensure field values match the expected format',
    'Verify that the request body is valid JSON',
    'Check that all parameters are within allowed ranges',
  ],
  RATE_LIMIT_EXCEEDED: [
    'Wait for the specified number of seconds before retrying',
    'Implement client-side rate limiting to avoid this error',
    'Reduce your request frequency',
    'Contact support for higher rate limits if needed',
  ],
  INTERNAL_ERROR: [
    'An unexpected error occurred on the server',
    'Check the detailed health endpoint for system status',
    'Contact support with the requestId for assistance',
  ],
  EXTERNAL_SERVICE_ERROR: [
    'An external service (AI provider, database, etc.) returned an error',
    'The system will automatically retry this operation',
    'Check your API credentials for external services',
    'Monitor the detailed health endpoint for service status',
  ],
  TIMEOUT_ERROR: [
    'The operation exceeded the time limit and was terminated',
    'Try again with a simpler or smaller request',
    'The system will automatically retry this operation',
    'Check if external services are experiencing high latency',
  ],
  AUTHENTICATION_ERROR: [
    'Authentication is required to access this resource',
    'Provide a valid authorization token in the Authorization header',
    'Check that your token has not expired',
    'Verify you have valid API credentials',
  ],
  AUTHORIZATION_ERROR: [
    'You do not have permission to access this resource',
    'Verify you have the appropriate role or permissions',
    'Contact the resource owner for access',
    'Check that you are accessing your own data',
  ],
  NOT_FOUND: [
    'The requested resource was not found',
    'Verify that the resource ID is correct',
    'Check if the session has expired',
    'Ensure you are using the correct endpoint',
  ],
  CONFLICT: [
    'A conflict occurred with the current state of the resource',
    'Check if a session already exists for this idea',
    'Resolve any concurrent modification conflicts',
    'Retry the operation with updated data',
  ],
  SERVICE_UNAVAILABLE: [
    'The service is temporarily unavailable',
    'Wait and retry with exponential backoff',
    'Check the detailed health endpoint for system status and ETA',
    'Monitor for service recovery announcements',
  ],
  CIRCUIT_BREAKER_OPEN: [
    'The circuit breaker is open due to repeated failures',
    'Wait until the reset time specified in the error message',
    'The system will automatically test service recovery',
    'Use the detailed health endpoint to monitor circuit breaker status',
  ],
  RETRY_EXHAUSTED: [
    'All retry attempts for the operation failed',
    'Check the detailed health endpoint for service status',
    'Verify your API credentials and quotas for external services',
    'Contact support with the requestId if this persists',
  ],
  NOT_READY: [
    'Service is initializing or dependencies are unavailable',
    'Wait briefly and retry the request',
    'Check the detailed health endpoint for specific dependency status',
    'This is typically returned during service startup or maintenance',
  ],
};
