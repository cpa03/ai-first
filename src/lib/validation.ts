import {
  VALIDATION_LIMITS_CONFIG,
  VALIDATION_LIMITS,
  USER_STORY_CONFIG,
  STATUS_CODES,
  HTTP_HEADERS,
} from './config/constants';
import { SANITIZATION_CONFIG, VALIDATION_CONFIG } from './config';
import { isString } from './type-guards';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Export constants from VALIDATION_LIMITS for backward compatibility
export const MAX_IDEA_LENGTH = VALIDATION_LIMITS.IDEA.MAX_LENGTH;
export const MIN_IDEA_LENGTH = VALIDATION_LIMITS.IDEA.MIN_LENGTH;
export const MAX_TITLE_LENGTH = VALIDATION_LIMITS.TITLE.MAX_LENGTH;
export const MAX_IDEA_ID_LENGTH = VALIDATION_LIMITS.IDEA.MAX_ID_LENGTH;

// Answer validation constants for clarification flow
export const MIN_ANSWER_LENGTH = VALIDATION_LIMITS.ANSWER.MIN_LENGTH;
export const MAX_ANSWER_LENGTH = VALIDATION_LIMITS.ANSWER.MAX_LENGTH;
export const MIN_SHORT_ANSWER_LENGTH =
  VALIDATION_LIMITS.ANSWER.MIN_SHORT_LENGTH;
export const MAX_SHORT_ANSWER_LENGTH =
  VALIDATION_LIMITS.ANSWER.MAX_SHORT_LENGTH;

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

  const validFormat = VALIDATION_CONFIG.IDEA_ID.REGEX.test(trimmed);
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
  maxLength: number = VALIDATION_LIMITS.IDEA.MAX_LENGTH
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
  let sanitized = input.replace(SANITIZATION_CONFIG.REGEX.SCRIPT, '');

  // Remove event handlers (onload, onclick, etc.)
  sanitized = sanitized.replace(SANITIZATION_CONFIG.REGEX.EVENT_HANDLER, '');

  // Escape HTML entities to prevent script injection
  const htmlEscapes = SANITIZATION_CONFIG.HTML.ESCAPE_MAP;
  const escapePattern = new RegExp(
    `[${Object.keys(htmlEscapes)
      .join('')
      .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`,
    'g'
  );

  sanitized = sanitized.replace(
    escapePattern,
    (char) => htmlEscapes[char as keyof typeof htmlEscapes] || char
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
      status: STATUS_CODES.BAD_REQUEST,
      headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
    }
  );
}

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

export interface UserStoryValidationResult extends ValidationResult {
  persona?: string;
  goal?: string;
  benefit?: string;
  suggestions?: string[];
  isPartial?: boolean;
}

export function validateUserStoryFormat(
  idea: string,
  options: { strict?: boolean; enabled?: boolean } = {}
): UserStoryValidationResult {
  const {
    strict = true,
    enabled = USER_STORY_CONFIG.FORMAT_VALIDATION_ENABLED,
  } = options;

  if (!enabled) {
    return { valid: true, errors: [] };
  }

  const errors: ValidationError[] = [];
  const suggestions: string[] = [];
  const trimmed = idea.trim();

  const fullMatch = trimmed.match(USER_STORY_CONFIG.PATTERNS.FULL_STORY);

  if (fullMatch) {
    const [, persona, goal, benefit] = fullMatch;

    if (persona.length < USER_STORY_CONFIG.MIN_LENGTHS.PERSONA) {
      errors.push({
        field: 'idea',
        message: USER_STORY_CONFIG.ERROR_MESSAGES.PERSONA_TOO_SHORT,
      });
    }

    if (goal.length < USER_STORY_CONFIG.MIN_LENGTHS.GOAL) {
      errors.push({
        field: 'idea',
        message: USER_STORY_CONFIG.ERROR_MESSAGES.GOAL_TOO_SHORT,
      });
    }

    if (benefit.length < USER_STORY_CONFIG.MIN_LENGTHS.BENEFIT) {
      errors.push({
        field: 'idea',
        message: USER_STORY_CONFIG.ERROR_MESSAGES.BENEFIT_TOO_SHORT,
      });
    }

    const normalizedPersona = persona.toLowerCase().trim();
    const hasKnownPersona = USER_STORY_CONFIG.KNOWN_PERSONAS.some((p) =>
      normalizedPersona.includes(p)
    );

    if (!hasKnownPersona) {
      suggestions.push(
        `Consider using a known persona: ${USER_STORY_CONFIG.KNOWN_PERSONAS.join(', ')}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      persona,
      goal,
      benefit,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      isPartial: false,
    };
  }

  const partialMatch = trimmed.match(USER_STORY_CONFIG.PATTERNS.PARTIAL_STORY);

  if (partialMatch) {
    if (strict) {
      if (!/so\s+that/i.test(trimmed) && !/in\s+order\s+to/i.test(trimmed)) {
        errors.push({
          field: 'idea',
          message: USER_STORY_CONFIG.ERROR_MESSAGES.MISSING_BENEFIT,
        });
      }

      if (!/i\s+want/i.test(trimmed)) {
        errors.push({
          field: 'idea',
          message: USER_STORY_CONFIG.ERROR_MESSAGES.MISSING_GOAL,
        });
      }
    }

    return {
      valid: !strict || errors.length === 0,
      errors,
      suggestions: strict
        ? [
            'Complete the user story format: "As a [persona], I want [goal], So that [benefit]"',
          ]
        : undefined,
      isPartial: true,
    };
  }

  if (strict) {
    errors.push({
      field: 'idea',
      message: USER_STORY_CONFIG.ERROR_MESSAGES.MISSING_FORMAT,
    });
  }

  suggestions.push(
    'Format your idea as a user story: "As a [persona], I want [goal], So that [benefit]"'
  );

  return {
    valid: !strict,
    errors,
    suggestions,
    isPartial: false,
  };
}

export function validateIdeaWithUserStory(
  idea: unknown,
  options: { validateUserStory?: boolean; strictUserStory?: boolean } = {}
): UserStoryValidationResult {
  const { validateUserStory = false, strictUserStory = true } = options;

  const baseResult = validateIdea(idea);

  if (!baseResult.valid) {
    return { ...baseResult, isPartial: false };
  }

  if (!validateUserStory) {
    return { ...baseResult, isPartial: false };
  }

  const userStoryResult = validateUserStoryFormat(idea as string, {
    strict: strictUserStory,
    enabled: true,
  });

  return {
    ...baseResult,
    valid: userStoryResult.valid,
    errors: [...baseResult.errors, ...userStoryResult.errors],
    persona: userStoryResult.persona,
    goal: userStoryResult.goal,
    benefit: userStoryResult.benefit,
    suggestions: userStoryResult.suggestions,
    isPartial: userStoryResult.isPartial,
  };
}
