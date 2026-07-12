/**
 * Configuration Validator Limits
 *
 * Centralizes validation limits for configuration modules.
 * This eliminates hardcoded min/max values in config-validator.ts.
 *
 * Usage:
 * ```typescript
 * import { CONFIG_VALIDATOR_LIMITS } from '@/lib/config/config-validator-limits';
 *
 * // Use centralized validation limits:
 * const timeoutLimit = CONFIG_VALIDATOR_LIMITS.TIMEOUT.DEFAULT;
 * if (timeout < timeoutLimit.min || timeout > timeoutLimit.max) { ... }
 * ```
 */

import { EnvLoader } from './environment';

/**
 * Timeout Validation Limits
 * Min/max ranges for validating timeout configuration values
 */
export const TIMEOUT_VALIDATION_LIMITS = {
  DEFAULT: {
    min: EnvLoader.number('TIMEOUT_DEFAULT_MIN', 1000, 100, 10000),
    max: EnvLoader.number('TIMEOUT_DEFAULT_MAX', 300000, 10000, 600000),
  },
  QUICK: {
    min: EnvLoader.number('TIMEOUT_QUICK_MIN', 500, 100, 5000),
    max: EnvLoader.number('TIMEOUT_QUICK_MAX', 60000, 5000, 120000),
  },
  STANDARD: {
    min: EnvLoader.number('TIMEOUT_STANDARD_MIN', 1000, 500, 10000),
    max: EnvLoader.number('TIMEOUT_STANDARD_MAX', 120000, 30000, 300000),
  },
  LONG: {
    min: EnvLoader.number('TIMEOUT_LONG_MIN', 5000, 1000, 30000),
    max: EnvLoader.number('TIMEOUT_LONG_MAX', 600000, 60000, 1800000),
  },
  TRELLO: {
    CREATE_BOARD: {
      min: EnvLoader.number(
        'TIMEOUT_TRELLO_CREATE_BOARD_MIN',
        1000,
        500,
        10000
      ),
      max: EnvLoader.number(
        'TIMEOUT_TRELLO_CREATE_BOARD_MAX',
        60000,
        10000,
        120000
      ),
    },
    CREATE_LIST: {
      min: EnvLoader.number('TIMEOUT_TRELLO_CREATE_LIST_MIN', 1000, 500, 10000),
      max: EnvLoader.number(
        'TIMEOUT_TRELLO_CREATE_LIST_MAX',
        60000,
        10000,
        120000
      ),
    },
    CREATE_CARD: {
      min: EnvLoader.number('TIMEOUT_TRELLO_CREATE_CARD_MIN', 1000, 500, 10000),
      max: EnvLoader.number(
        'TIMEOUT_TRELLO_CREATE_CARD_MAX',
        60000,
        10000,
        120000
      ),
    },
  },
  GITHUB: {
    GET_USER: {
      min: EnvLoader.number('TIMEOUT_GITHUB_GET_USER_MIN', 1000, 500, 10000),
      max: EnvLoader.number(
        'TIMEOUT_GITHUB_GET_USER_MAX',
        60000,
        10000,
        120000
      ),
    },
    CREATE_REPO: {
      min: EnvLoader.number('TIMEOUT_GITHUB_CREATE_REPO_MIN', 1000, 500, 10000),
      max: EnvLoader.number(
        'TIMEOUT_GITHUB_CREATE_REPO_MAX',
        300000,
        30000,
        600000
      ),
    },
  },
  NOTION: {
    CLIENT_TIMEOUT: {
      min: EnvLoader.number('TIMEOUT_NOTION_CLIENT_MIN', 1000, 500, 10000),
      max: EnvLoader.number('TIMEOUT_NOTION_CLIENT_MAX', 300000, 30000, 600000),
    },
  },
} as const;

/**
 * App Metadata Validation Limits
 * Min/max ranges for validating app configuration strings
 */
export const APP_METADATA_VALIDATION_LIMITS = {
  NAME: {
    required: true,
    minLength: EnvLoader.number('APP_NAME_MIN_LENGTH', 1, 1, 10),
    maxLength: EnvLoader.number('APP_NAME_MAX_LENGTH', 100, 10, 500),
  },
  VERSION: {
    required: true,
    minLength: EnvLoader.number('APP_VERSION_MIN_LENGTH', 1, 1, 5),
    maxLength: EnvLoader.number('APP_VERSION_MAX_LENGTH', 20, 5, 50),
  },
  DESCRIPTION: {
    required: true,
    minLength: EnvLoader.number('APP_DESCRIPTION_MIN_LENGTH', 1, 1, 10),
    maxLength: EnvLoader.number('APP_DESCRIPTION_MAX_LENGTH', 500, 100, 2000),
  },
} as const;

/**
 * Pagination Validation Limits
 * Min/max ranges for validating pagination configuration
 */
export const PAGINATION_VALIDATION_LIMITS = {
  DEFAULT_LIMIT: {
    min: EnvLoader.number('PAGINATION_DEFAULT_LIMIT_MIN', 1, 1, 10),
    max: EnvLoader.number('PAGINATION_DEFAULT_LIMIT_MAX', 100, 20, 500),
  },
} as const;

/**
 * Combined config validator limits for convenience
 */
export const CONFIG_VALIDATOR_LIMITS = {
  TIMEOUT: TIMEOUT_VALIDATION_LIMITS,
  APP_METADATA: APP_METADATA_VALIDATION_LIMITS,
  PAGINATION: PAGINATION_VALIDATION_LIMITS,
} as const;

export type ConfigValidatorLimits = typeof CONFIG_VALIDATOR_LIMITS;
