/**
 * Validation Configuration
 * Centralizes regex patterns, validation rules, and sanitization
 * Supports environment variable overrides for validation limits
 */

import { EnvLoader } from './environment';

export const VALIDATION_CONFIG = {
  IDEA_ID: {
    REGEX: /^[a-zA-Z0-9_-]+$/,
    MIN_LENGTH: EnvLoader.number('VALIDATION_IDEA_ID_MIN_LENGTH', 3, 1, 20),
    MAX_LENGTH: EnvLoader.number('VALIDATION_IDEA_ID_MAX_LENGTH', 50, 10, 200),
    ALLOWED_CHARS: 'alphanumeric, hyphens, underscores',
  },

  TEXT: {
    MAX_LENGTH: EnvLoader.number(
      'VALIDATION_TEXT_MAX_LENGTH',
      10000,
      100,
      100000
    ),
    MIN_LENGTH: EnvLoader.number('VALIDATION_TEXT_MIN_LENGTH', 1, 1, 100),
    TRIM_WHITESPACE: true,
  },

  QUESTION_TYPES: {
    VALID: ['open', 'multiple_choice', 'yes_no'] as const,
    DEFAULT: 'open' as const,
  },

  NUMBER: {
    MIN: 0,
    MAX: EnvLoader.number('VALIDATION_NUMBER_MAX', 999999, 1000, 9999999),
    DECIMAL_PLACES: EnvLoader.number(
      'VALIDATION_NUMBER_DECIMAL_PLACES',
      2,
      0,
      10
    ),
  },

  /**
   * Common regex patterns used across the application.
   * Eliminates duplicated regex definitions in login/signup pages.
   */
  COMMON_REGEX: {
    /** Email validation regex - used in login, signup, and form validation */
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    /** Phone number regex - basic US format */
    PHONE: /^\+?[\d\s\-()]+$/,
    /** URL regex - basic validation */
    URL: /^https?:\/\/.+/,
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
      '`': '&#x60;',
    } as const,

    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre'] as const,
    ALLOWED_ATTRIBUTES: ['class'] as const,
  },

  REGEX: {
    SCRIPT: /<script[^>]*>[\s\S]*?<\/script>/gi,
    EVENT_HANDLER: /[\s/]*on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
    JAVASCRIPT_PROTOCOL: /(?:javascript|vbscript|livescript)\s*:/gi,
    DATA_URI: /data\s*:\s*(?:text\/html|image\/svg\+xml)/gi,
    STYLE: /[\s/]*style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
  },

  PII: {
    PATTERNS: {
      EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      PHONE:
        /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
      SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
      CREDIT_CARD: /\b(?:\d[ -]*?){13,16}\b/g,
      API_KEY:
        /\b(?:api[_-]?key|apikey)[\s]*[:=][\s]*["']?[a-zA-Z0-9]{32,}["']?\b/gi,
      PASSWORD: /\b(?:password|passwd|pwd)[\s]*[:=][\s]*["']?[^"'\s]+["']?\b/gi,
    },

    SENSITIVE_FIELDS: [
      'password',
      'passwd',
      'pwd',
      'secret',
      'token',
      'api_key',
      'apikey',
      'access_token',
      'refresh_token',
      'private_key',
      'credit_card',
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
    suggestion:
      "You've made too many requests. Please wait a moment before trying again.",
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
