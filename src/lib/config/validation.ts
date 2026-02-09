/**
 * Validation Configuration
 * Centralizes regex patterns, validation rules, and sanitization
 */

export const VALIDATION_CONFIG = {
  IDEA_ID: {
    REGEX: /^[a-zA-Z0-9_-]+$/,
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    ALLOWED_CHARS: 'alphanumeric, hyphens, underscores',
  },

  TEXT: {
    MAX_LENGTH: 10000,
    MIN_LENGTH: 1,
    TRIM_WHITESPACE: true,
  },

  QUESTION_TYPES: {
    VALID: ['open', 'multiple_choice', 'yes_no'] as const,
    DEFAULT: 'open' as const,
  },

  NUMBER: {
    MIN: 0,
    MAX: 999999,
    DECIMAL_PLACES: 2,
  },
} as const;

export const SANITIZATION_CONFIG = {
  HTML: {
    ESCAPE_MAP: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    } as const,

    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'] as const,
    ALLOWED_ATTRIBUTES: ['class'] as const,
  },

  REGEX: {
    SCRIPT: /<script[^>]*>[\s\S]*?<\/script>/gi,
    EVENT_HANDLER: /\s*on\w+\s*=\s*"[^"]*"/gi,
    JAVASCRIPT_PROTOCOL: /javascript:/gi,
    DATA_URI: /data:text\/html/gi,
  },

  PII: {
    PATTERNS: {
      EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      PHONE: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
      CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
      API_KEY: /\b(?:api[_-]?key|apikey)[\s]*[:=][\s]*["']?[a-zA-Z0-9]{32,}["']?\b/gi,
      PASSWORD: /\b(?:password|passwd|pwd)[\s]*[:=][\s]*["']?[^"'\s]+["']?\b/gi,
    },

    SENSITIVE_FIELDS: [
      'password', 'passwd', 'pwd', 'secret', 'token', 'api_key', 'apikey',
      'access_token', 'refresh_token', 'private_key', 'credit_card',
    ] as const,

    REDACTION_TEXT: '[REDACTED]',
  },
} as const;

export const ERROR_SUGGESTIONS_CONFIG = {
  NETWORK: {
    title: 'Connection Issue',
    suggestion: 'Please check your internet connection and try again.',
    action: 'Retry',
  },

  RATE_LIMIT: {
    title: 'Rate Limited',
    suggestion: 'You\'ve made too many requests. Please wait a moment before trying again.',
    action: 'Wait',
  },

  AUTH: {
    title: 'Authentication Required',
    suggestion: 'Please sign in to continue with this action.',
    action: 'Sign In',
  },

  VALIDATION: {
    title: 'Invalid Input',
    suggestion: 'Please check your input and try again.',
    action: 'Edit',
  },

  SERVER: {
    title: 'Server Error',
    suggestion: 'Something went wrong on our end. Please try again later.',
    action: 'Retry',
  },

  NOT_FOUND: {
    title: 'Not Found',
    suggestion: 'The requested resource could not be found.',
    action: 'Go Home',
  },

  DEFAULT: {
    title: 'Error',
    suggestion: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  },
} as const;

export type ValidationConfig = typeof VALIDATION_CONFIG;
export type SanitizationConfig = typeof SANITIZATION_CONFIG;
export type ErrorSuggestionsConfig = typeof ERROR_SUGGESTIONS_CONFIG;
