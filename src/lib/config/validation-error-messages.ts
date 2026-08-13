/**
 * Validation Error Messages Configuration
 * Centralizes all validation error messages for consistency and i18n support
 */

export const VALIDATION_ERROR_MESSAGES = {
  IDEA: {
    REQUIRED: 'idea is required and must be a string',
    TOO_SHORT: (minLength: number) =>
      `idea must be at least ${minLength} characters`,
    TOO_LONG: (maxLength: number) =>
      `idea must not exceed ${maxLength} characters`,
  },
  IDEA_ID: {
    REQUIRED: 'ideaId is required and must be a string',
    EMPTY: 'ideaId cannot be empty',
    TOO_LONG: (maxLength: number) =>
      `ideaId must not exceed ${maxLength} characters`,
    INVALID_FORMAT:
      'ideaId must contain only alphanumeric characters, underscores, and hyphens',
  },
  USER_RESPONSES: {
    MUST_BE_OBJECT: 'userResponses must be an object',
    TOO_LONG: (maxLength: number) =>
      `userResponses must not exceed ${maxLength} characters`,
    INVALID_KEY: (key: string) => `Invalid key format: ${key}`,
    INVALID_VALUE_TYPE: (key: string) =>
      `Value for key "${key}" must be a string`,
    VALUE_TOO_LONG: (key: string, maxLength: number) =>
      `Value for key "${key}" must not exceed ${maxLength} characters`,
  },
  REQUEST: {
    TOO_LARGE: (maxSizeBytes: number) =>
      `request must not exceed ${maxSizeBytes} bytes`,
  },
  AI_MODEL: {
    TEMPERATURE: {
      INVALID: 'temperature must be a valid number',
      TOO_LOW: (min: number) => `temperature must be at least ${min}`,
      TOO_HIGH: (max: number) => `temperature must not exceed ${max}`,
    },
    MAX_TOKENS: {
      INVALID: 'maxTokens must be a valid number',
      NOT_INTEGER: 'maxTokens must be an integer',
      TOO_LOW: (min: number) => `maxTokens must be at least ${min}`,
      TOO_HIGH: (max: number) => `maxTokens must not exceed ${max}`,
    },
    MODEL: {
      REQUIRED: 'model is required and must be a string',
      EMPTY: 'model cannot be empty',
      TOO_LONG: (maxLength: number) =>
        `model must not exceed ${maxLength} characters`,
      INVALID_CHARS:
        'model must contain only alphanumeric characters, dashes, and dots',
      INVALID_PREFIX: (prefixes: string[]) =>
        `model must start with one of: ${prefixes.join(', ')}`,
    },
    CONFIG: {
      MUST_BE_OBJECT: 'AI model config must be an object',
    },
  },
} as const;
