import {
  VALIDATION_LIMITS_CONFIG,
  VALIDATION_CONFIG,
} from './config/constants';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Re-export validation constants from centralized config
export const MAX_IDEA_LENGTH = VALIDATION_CONFIG.MAX_IDEA_LENGTH;
export const MIN_IDEA_LENGTH = VALIDATION_CONFIG.MIN_IDEA_LENGTH;
export const MAX_TITLE_LENGTH = 500; // Not in constants, keeping here
export const MAX_IDEA_ID_LENGTH = VALIDATION_CONFIG.MAX_IDEA_ID_LENGTH;

// Answer validation constants for clarification flow
// Using values from VALIDATION_CONFIG
export const MIN_ANSWER_LENGTH = 5; // Not in constants, keeping here
export const MAX_ANSWER_LENGTH = VALIDATION_CONFIG.MAX_ANSWER_LENGTH;
export const MIN_SHORT_ANSWER_LENGTH = 2; // Not in constants, keeping here
export const MAX_SHORT_ANSWER_LENGTH = 100; // Not in constants, keeping here

export * from './type-guards';

export function validateIdea(idea: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!idea || typeof idea !== 'string') {
    errors.push({
      field: 'idea',
      message: 'idea is required and must be a string',
    });
    return { valid: false, errors };
  }

  const trimmed = idea.trim();

  if (trimmed.length < MIN_IDEA_LENGTH) {
    errors.push({
      field: 'idea',
      message: `idea must be at least ${MIN_IDEA_LENGTH} characters`,
    });
  }

  if (trimmed.length > MAX_IDEA_LENGTH) {
    errors.push({
      field: 'idea',
      message: `idea must not exceed ${MAX_IDEA_LENGTH} characters`,
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateIdeaId(ideaId: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!ideaId || typeof ideaId !== 'string') {
    errors.push({
      field: 'ideaId',
      message: 'ideaId is required and must be a string',
    });
    return { valid: false, errors };
  }

  const trimmed = ideaId.trim();

  if (trimmed.length === 0) {
    errors.push({
      field: 'ideaId',
      message: 'ideaId cannot be empty',
    });
  }

  if (trimmed.length > MAX_IDEA_ID_LENGTH) {
    errors.push({
      field: 'ideaId',
      message: `ideaId must not exceed ${MAX_IDEA_ID_LENGTH} characters`,
    });
  }

  const validFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
  if (!validFormat) {
    errors.push({
      field: 'ideaId',
      message:
        'ideaId must contain only alphanumeric characters, underscores, and hyphens',
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateUserResponses(responses: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!responses) {
    return { valid: true, errors: [] };
  }

  if (typeof responses !== 'object' || Array.isArray(responses)) {
    errors.push({
      field: 'userResponses',
      message: 'userResponses must be an object',
    });
    return { valid: false, errors };
  }

  const jsonStr = JSON.stringify(responses);
  if (jsonStr.length > VALIDATION_LIMITS_CONFIG.MAX_USER_RESPONSE_SIZE) {
    errors.push({
      field: 'userResponses',
      message: `userResponses must not exceed ${VALIDATION_LIMITS_CONFIG.MAX_USER_RESPONSE_SIZE} characters`,
    });
  }

  for (const [key, value] of Object.entries(responses)) {
    if (
      typeof key !== 'string' ||
      key.length > VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_KEY_LENGTH
    ) {
      errors.push({
        field: 'userResponses',
        message: `Invalid key format: ${key}`,
      });
    }

    if (typeof value !== 'string' && value !== null && value !== undefined) {
      errors.push({
        field: 'userResponses',
        message: `Value for key "${key}" must be a string`,
      });
    }

    if (
      typeof value === 'string' &&
      value.length > VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_VALUE_LENGTH
    ) {
      errors.push({
        field: 'userResponses',
        message: `Value for key "${key}" must not exceed ${VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_VALUE_LENGTH} characters`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRequestSize(
  request: Request,
  maxSizeBytes: number = VALIDATION_LIMITS_CONFIG.DEFAULT_MAX_REQUEST_SIZE_BYTES
): ValidationResult {
  const errors: ValidationError[] = [];
  const contentLength = request.headers.get('content-length');

  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > maxSizeBytes) {
      errors.push({
        field: 'request',
        message: `request must not exceed ${maxSizeBytes} bytes`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeString(
  input: string,
  maxLength: number = MAX_IDEA_LENGTH
): string {
  let sanitized = input.trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitizes HTML content by removing script tags and escaping HTML entities
 * to prevent XSS attacks. This is a basic sanitization suitable for
 * simple text fields like titles.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their contents
  let sanitized = input.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Remove event handlers (onload, onclick, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');

  // Escape HTML entities to prevent script injection
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  sanitized = sanitized.replace(
    /[&<>"'/]/g,
    (char) => htmlEscapes[char] || char
  );

  return sanitized.trim();
}

export function buildErrorResponse(errors: ValidationError[]): Response {
  return new Response(
    JSON.stringify({
      error: 'Validation failed',
      details: errors,
    }),
    {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

import { isString } from './type-guards';

export function safeJsonParse<T = unknown>(
  jsonString: unknown,
  fallback: T,
  schemaValidator?: (data: unknown) => data is T
): T {
  try {
    if (!isString(jsonString)) {
      return fallback;
    }

    const trimmed = jsonString.trim();
    if (trimmed.length === 0) {
      return fallback;
    }

    const parsed = JSON.parse(trimmed);

    if (schemaValidator && !schemaValidator(parsed)) {
      return fallback;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}
