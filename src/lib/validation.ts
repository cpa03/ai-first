import {
  VALIDATION_LIMITS_CONFIG,
  VALIDATION_LIMITS,
  STATUS_CODES,
  HTTP_HEADERS,
  AI_CONFIG,
} from './config/constants';
import { USER_STORY_CONFIG } from './config/user-story-config';
import { SANITIZATION_CONFIG, VALIDATION_CONFIG } from './config/validation';
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


/**
 * Validate AI model temperature parameter
 * SECURITY: Prevents extreme temperature values
 */
export function validateModelTemperature(temperature: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  if (temperature === undefined || temperature === null) {
    return { valid: true, errors: [] };
  }

  if (typeof temperature !== 'number' || isNaN(temperature)) {
    errors.push({ field: 'temperature', message: 'temperature must be a valid number' });
    return { valid: false, errors };
  }

  if (temperature < VALIDATION.TEMPERATURE_MIN) {
    errors.push({ field: 'temperature', message: 'temperature must be at least ' + VALIDATION.TEMPERATURE_MIN });
  }

  if (temperature > VALIDATION.TEMPERATURE_MAX) {
    errors.push({ field: 'temperature', message: 'temperature must not exceed ' + VALIDATION.TEMPERATURE_MAX });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate AI model maxTokens parameter
 */
export function validateModelMaxTokens(maxTokens: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  if (maxTokens === undefined || maxTokens === null) {
    return { valid: true, errors: [] };
  }

  if (typeof maxTokens !== 'number' || isNaN(maxTokens)) {
    errors.push({ field: 'maxTokens', message: 'maxTokens must be a valid number' });
    return { valid: false, errors };
  }

  if (!Number.isInteger(maxTokens)) {
    errors.push({ field: 'maxTokens', message: 'maxTokens must be an integer' });
  }

  if (maxTokens < VALIDATION.MAX_TOKENS_MIN) {
    errors.push({ field: 'maxTokens', message: 'maxTokens must be at least ' + VALIDATION.MAX_TOKENS_MIN });
  }

  if (maxTokens > VALIDATION.MAX_TOKENS_MAX) {
    errors.push({ field: 'maxTokens', message: 'maxTokens must not exceed ' + VALIDATION.MAX_TOKENS_MAX });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate AI model name
 */
export function validateModelName(model: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  if (!model || typeof model !== 'string') {
    errors.push({ field: 'model', message: 'model is required and must be a string' });
    return { valid: false, errors };
  }

  const trimmed = model.trim();
  if (trimmed.length === 0) {
    errors.push({ field: 'model', message: 'model cannot be empty' });
    return { valid: false, errors };
  }

  if (!VALIDATION.MODEL_NAME_PATTERN.test(trimmed)) {
    errors.push({ field: 'model', message: 'model must contain only alphanumeric characters, dashes, and dots' });
  }

  const hasAllowedPrefix = VALIDATION.ALLOWED_MODEL_PREFIXES.some(prefix => trimmed.toLowerCase().startsWith(prefix));
  if (!hasAllowedPrefix) {
    errors.push({ field: 'model', message: 'model must start with one of: ' + VALIDATION.ALLOWED_MODEL_PREFIXES.join(', ') });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate complete AI model configuration
 */
export function validateAIModelConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!config || typeof config !== 'object') {
    errors.push({ field: 'config', message: 'AI model config must be an object' });
    return { valid: false, errors };
  }

  const cfg = config as Record<string, unknown>;
  errors.push(...validateModelName(cfg.model).errors);
  errors.push(...validateModelTemperature(cfg.temperature).errors);
  errors.push(...validateModelMaxTokens(cfg.maxTokens).errors);

  return { valid: errors.length === 0, errors };
}

/**
 * API Key Validation Result
 */
export interface ApiKeyValidationResult extends ValidationResult {
  provider?: 'openai' | 'anthropic';
  isPlaceholder?: boolean;
}

/**
 * Validate OpenAI API key format
 * SECURITY: Checks that the key matches expected format to detect placeholders
 * or misconfigured keys at startup rather than on first use
 */
export function validateOpenAIApiKey(apiKey: unknown): ApiKeyValidationResult {
  const errors: ValidationError[] = [];
  
  if (!apiKey || typeof apiKey !== 'string') {
    errors.push({ field: 'OPENAI_API_KEY', message: 'API key must be a non-empty string' });
    return { valid: false, errors, provider: 'openai' };
  }

  const key = apiKey.trim();
  const config = AI_CONFIG.API_KEY_VALIDATION.OPENAI;

  // Check length
  if (key.length < config.MIN_LENGTH || key.length > config.MAX_LENGTH) {
    errors.push({ 
      field: 'OPENAI_API_KEY', 
      message: `API key must be between ${config.MIN_LENGTH} and ${config.MAX_LENGTH} characters` 
    });
  }

  // Check prefix
  if (!key.startsWith(config.PREFIX)) {
    errors.push({ 
      field: 'OPENAI_API_KEY', 
      message: `API key must start with '${config.PREFIX}'` 
    });
  }

  // Check pattern
  if (!config.PATTERN.test(key)) {
    errors.push({ 
      field: 'OPENAI_API_KEY', 
      message: 'API key contains invalid characters' 
    });
  }

  // Check blocked patterns (placeholders)
  const isPlaceholder = AI_CONFIG.API_KEY_VALIDATION.BLOCKED_PATTERNS.some(
    pattern => key.toLowerCase().startsWith(pattern)
  );

  if (isPlaceholder) {
    errors.push({ 
      field: 'OPENAI_API_KEY', 
      message: 'API key appears to be a placeholder or test key' 
    });
  }

  return { 
    valid: errors.length === 0, 
    errors, 
    provider: 'openai',
    isPlaceholder 
  };
}

/**
 * Validate Anthropic API key format
 * SECURITY: Checks that the key matches expected format to detect placeholders
 * or misconfigured keys at startup rather than on first use
 */
export function validateAnthropicApiKey(apiKey: unknown): ApiKeyValidationResult {
  const errors: ValidationError[] = [];
  
  if (!apiKey || typeof apiKey !== 'string') {
    errors.push({ field: 'ANTHROPIC_API_KEY', message: 'API key must be a non-empty string' });
    return { valid: false, errors, provider: 'anthropic' };
  }

  const key = apiKey.trim();
  const config = AI_CONFIG.API_KEY_VALIDATION.ANTHROPIC;

  // Check length
  if (key.length < config.MIN_LENGTH || key.length > config.MAX_LENGTH) {
    errors.push({ 
      field: 'ANTHROPIC_API_KEY', 
      message: `API key must be between ${config.MIN_LENGTH} and ${config.MAX_LENGTH} characters` 
    });
  }

  // Check prefix
  if (!key.startsWith(config.PREFIX)) {
    errors.push({ 
      field: 'ANTHROPIC_API_KEY', 
      message: `API key must start with '${config.PREFIX}'` 
    });
  }

  // Check pattern
  if (!config.PATTERN.test(key)) {
    errors.push({ 
      field: 'ANTHROPIC_API_KEY', 
      message: 'API key contains invalid characters' 
    });
  }

  // Check blocked patterns (placeholders)
  const isPlaceholder = AI_CONFIG.API_KEY_VALIDATION.BLOCKED_PATTERNS.some(
    pattern => key.toLowerCase().startsWith(pattern)
  );

  if (isPlaceholder) {
    errors.push({ 
      field: 'ANTHROPIC_API_KEY', 
      message: 'API key appears to be a placeholder or test key' 
    });
  }

  return { 
    valid: errors.length === 0, 
    errors, 
    provider: 'anthropic',
    isPlaceholder 
  };
}
