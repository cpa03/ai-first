import {
  VALIDATION_LIMITS_CONFIG,
  VALIDATION_LIMITS,
  STATUS_CODES,
  HTTP_HEADERS,
  AI_CONFIG,
} from '../config';
import { USER_STORY_CONFIG } from '../config/user-story-config';
import { VALIDATION_ERROR_MESSAGES } from '../config/validation-error-messages';
import { isString } from '../type-guards';
import { CACHE_CONFIG } from '../config/cache';
import { ValidationError, ValidationResult } from './input-sanitizer';
import {
  MIN_IDEA_LENGTH,
  MAX_IDEA_LENGTH,
  MAX_IDEA_ID_LENGTH,
} from './input-sanitizer';

/**
 * Schema validation functions for structured data validation.
 */

export function validateIdea(idea: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!idea || typeof idea !== 'string') {
    errors.push({
      field: 'idea',
      message: VALIDATION_ERROR_MESSAGES.IDEA.REQUIRED,
    });
    return { valid: false, errors };
  }

  const trimmed = idea.trim();

  if (trimmed.length < MIN_IDEA_LENGTH) {
    errors.push({
      field: 'idea',
      message: VALIDATION_ERROR_MESSAGES.IDEA.TOO_SHORT(MIN_IDEA_LENGTH),
    });
  }

  if (trimmed.length > MAX_IDEA_LENGTH) {
    errors.push({
      field: 'idea',
      message: VALIDATION_ERROR_MESSAGES.IDEA.TOO_LONG(MAX_IDEA_LENGTH),
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an idea and returns a single formatted error message if invalid.
 * Centralizes UI-facing error feedback.
 */
export function validateIdeaToMessage(idea: unknown): string | null {
  const result = validateIdea(idea);
  if (!result.valid && result.errors.length > 0) {
    const message = result.errors[0].message;
    return message.charAt(0).toUpperCase() + message.slice(1);
  }
  return null;
}

export function validateIdeaId(ideaId: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!ideaId || typeof ideaId !== 'string') {
    errors.push({
      field: 'ideaId',
      message: VALIDATION_ERROR_MESSAGES.IDEA_ID.REQUIRED,
    });
    return { valid: false, errors };
  }

  const trimmed = ideaId.trim();

  if (trimmed.length === 0) {
    errors.push({
      field: 'ideaId',
      message: VALIDATION_ERROR_MESSAGES.IDEA_ID.EMPTY,
    });
  }

  if (trimmed.length > MAX_IDEA_ID_LENGTH) {
    errors.push({
      field: 'ideaId',
      message: VALIDATION_ERROR_MESSAGES.IDEA_ID.TOO_LONG(MAX_IDEA_ID_LENGTH),
    });
  }

  // SECURITY: Enforce alphanumeric + hyphen/underscore pattern
  const validFormat = /^[a-zA-Z0-9_-]+$/.test(trimmed);
  if (!validFormat) {
    errors.push({
      field: 'ideaId',
      message: VALIDATION_ERROR_MESSAGES.IDEA_ID.INVALID_FORMAT,
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
      message: VALIDATION_ERROR_MESSAGES.USER_RESPONSES.MUST_BE_OBJECT,
    });
    return { valid: false, errors };
  }

  const jsonStr = JSON.stringify(responses);
  if (jsonStr.length > VALIDATION_LIMITS_CONFIG.MAX_USER_RESPONSE_SIZE) {
    errors.push({
      field: 'userResponses',
      message: VALIDATION_ERROR_MESSAGES.USER_RESPONSES.TOO_LONG(
        VALIDATION_LIMITS_CONFIG.MAX_USER_RESPONSE_SIZE
      ),
    });
  }

  for (const [key, value] of Object.entries(responses)) {
    if (
      typeof key !== 'string' ||
      key.length > VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_KEY_LENGTH
    ) {
      errors.push({
        field: 'userResponses',
        message: VALIDATION_ERROR_MESSAGES.USER_RESPONSES.INVALID_KEY(key),
      });
    }

    if (typeof value !== 'string' && value !== null && value !== undefined) {
      errors.push({
        field: 'userResponses',
        message:
          VALIDATION_ERROR_MESSAGES.USER_RESPONSES.INVALID_VALUE_TYPE(key),
      });
    }

    if (
      typeof value === 'string' &&
      value.length > VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_VALUE_LENGTH
    ) {
      errors.push({
        field: 'userResponses',
        message: VALIDATION_ERROR_MESSAGES.USER_RESPONSES.VALUE_TOO_LONG(
          key,
          VALIDATION_LIMITS_CONFIG.MAX_RESPONSE_VALUE_LENGTH
        ),
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
    const size = parseInt(contentLength.trim(), 10);
    // Guard: malformed or negative content-length is untrusted/spoofable —
    // ignore it explicitly rather than comparing NaN (existing tests expect
    // valid=true for these cases; actual body size must be enforced downstream).
    if (Number.isNaN(size) || !Number.isFinite(size) || size < 0) {
      return { valid: true, errors };
    }
    if (size > maxSizeBytes) {
      errors.push({
        field: 'request',
        message: VALIDATION_ERROR_MESSAGES.REQUEST.TOO_LARGE(maxSizeBytes),
      });
    }
  }

  return { valid: errors.length === 0, errors };
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