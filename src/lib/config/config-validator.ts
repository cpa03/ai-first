/**
 * Configuration Validator - Runtime validation for centralized configuration modules
 * Addresses issue #615: Missing runtime validation for centralized configuration modules
 */

import { APP_CONFIG } from './app';
import { TIMEOUT_CONFIG } from './constants';
import { createLogger } from '../logger';

const logger = createLogger('ConfigValidator');

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateRange(
  value: number,
  min: number,
  max: number,
  name: string
): string | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${name} is not a valid number`;
  }
  if (value < min) {
    return `${name} (${value}) is below minimum (${min})`;
  }
  if (value > max) {
    return `${name} (${value}) exceeds maximum (${max})`;
  }
  return null;
}

function validateString(
  value: string,
  name: string,
  options?: { minLength?: number; maxLength?: number; required?: boolean }
): string | null {
  if (typeof value !== 'string') {
    return `${name} is not a string`;
  }
  if (options?.required && value.trim().length === 0) {
    return `${name} is required but empty`;
  }
  if (options?.minLength && value.length < options.minLength) {
    return `${name} is too short (min: ${options.minLength})`;
  }
  if (options?.maxLength && value.length > options.maxLength) {
    return `${name} is too long (max: ${options.maxLength})`;
  }
  return null;
}

const TIMEOUT_VALIDATION_CHECKS = [
  {
    value: TIMEOUT_CONFIG.DEFAULT,
    name: 'TIMEOUT_CONFIG.DEFAULT',
    min: 1000,
    max: 300000,
  },
  {
    value: TIMEOUT_CONFIG.QUICK,
    name: 'TIMEOUT_CONFIG.QUICK',
    min: 500,
    max: 60000,
  },
  {
    value: TIMEOUT_CONFIG.STANDARD,
    name: 'TIMEOUT_CONFIG.STANDARD',
    min: 1000,
    max: 120000,
  },
  {
    value: TIMEOUT_CONFIG.LONG,
    name: 'TIMEOUT_CONFIG.LONG',
    min: 5000,
    max: 600000,
  },
  {
    value: TIMEOUT_CONFIG.TRELLO.CREATE_BOARD,
    name: 'TIMEOUT_CONFIG.TRELLO.CREATE_BOARD',
    min: 1000,
    max: 60000,
  },
  {
    value: TIMEOUT_CONFIG.TRELLO.CREATE_LIST,
    name: 'TIMEOUT_CONFIG.TRELLO.CREATE_LIST',
    min: 1000,
    max: 60000,
  },
  {
    value: TIMEOUT_CONFIG.TRELLO.CREATE_CARD,
    name: 'TIMEOUT_CONFIG.TRELLO.CREATE_CARD',
    min: 1000,
    max: 60000,
  },
  {
    value: TIMEOUT_CONFIG.GITHUB.GET_USER,
    name: 'TIMEOUT_CONFIG.GITHUB.GET_USER',
    min: 1000,
    max: 60000,
  },
  {
    value: TIMEOUT_CONFIG.GITHUB.CREATE_REPO,
    name: 'TIMEOUT_CONFIG.GITHUB.CREATE_REPO',
    min: 1000,
    max: 300000,
  },
  {
    value: TIMEOUT_CONFIG.NOTION.CLIENT_TIMEOUT,
    name: 'TIMEOUT_CONFIG.NOTION.CLIENT_TIMEOUT',
    min: 1000,
    max: 300000,
  },
];

function validateTimeoutConfig(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const check of TIMEOUT_VALIDATION_CHECKS) {
    const error = validateRange(check.value, check.min, check.max, check.name);
    if (error) {
      errors.push(error);
    }
  }

  if (TIMEOUT_CONFIG.QUICK >= TIMEOUT_CONFIG.STANDARD) {
    warnings.push(
      'TIMEOUT_CONFIG.QUICK should be faster than TIMEOUT_CONFIG.STANDARD'
    );
  }

  if (TIMEOUT_CONFIG.STANDARD >= TIMEOUT_CONFIG.LONG) {
    warnings.push(
      'TIMEOUT_CONFIG.STANDARD should be faster than TIMEOUT_CONFIG.LONG'
    );
  }

  return { errors, warnings };
}

const APP_METADATA_CHECKS = [
  {
    value: APP_CONFIG.NAME,
    name: 'APP_CONFIG.NAME',
    options: { required: true, minLength: 1, maxLength: 100 },
  },
  {
    value: APP_CONFIG.VERSION,
    name: 'APP_CONFIG.VERSION',
    options: { required: true, minLength: 1, maxLength: 20 },
  },
  {
    value: APP_CONFIG.DESCRIPTION,
    name: 'APP_CONFIG.DESCRIPTION',
    options: { required: true, minLength: 1, maxLength: 500 },
  },
];

function validateAppConfig(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const check of APP_METADATA_CHECKS) {
    const error = validateString(check.value, check.name, check.options);
    if (error) {
      errors.push(error);
    }
  }

  if (!APP_CONFIG.URLS.BASE.startsWith('http')) {
    warnings.push(
      'APP_CONFIG.URLS.BASE should be a valid URL starting with http(s)'
    );
  }

  const paginationError = validateRange(
    APP_CONFIG.PAGINATION.DEFAULT_LIMIT,
    APP_CONFIG.PAGINATION.MIN_LIMIT,
    APP_CONFIG.PAGINATION.MAX_LIMIT,
    'APP_CONFIG.PAGINATION.DEFAULT_LIMIT'
  );
  if (paginationError) {
    errors.push(paginationError);
  }

  if (APP_CONFIG.PAGINATION.MIN_LIMIT >= APP_CONFIG.PAGINATION.MAX_LIMIT) {
    errors.push('APP_CONFIG.PAGINATION.MIN_LIMIT must be less than MAX_LIMIT');
  }

  return { errors, warnings };
}

function validateEnvironmentConfig(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  const requiredEnvVars = APP_CONFIG.ENV_VARS.REQUIRED;
  const missingVars: string[] = [];

  for (const varName of requiredEnvVars) {
    const isClientVar = varName.startsWith('NEXT_PUBLIC_');
    const hasValue = process.env[varName];

    if (!hasValue) {
      if (typeof window === 'undefined' && isClientVar) {
        warnings.push(
          `Environment variable ${varName} not set (may be expected in server context)`
        );
      } else {
        missingVars.push(varName);
      }
    }
  }

  if (missingVars.length > 0) {
    errors.push(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const aiProviderKeys = APP_CONFIG.ENV_VARS.AI_PROVIDERS;
  const hasAiProvider = aiProviderKeys.some((key) => process.env[key]);

  if (!hasAiProvider) {
    warnings.push(
      `No AI provider API key found. Set one of: ${aiProviderKeys.join(', ')}`
    );
  }

  return { errors, warnings };
}

/** Validates all configuration modules and returns validation result */
export function validateConfiguration(): ConfigValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  const timeoutResult = validateTimeoutConfig();
  const appResult = validateAppConfig();
  const envResult = validateEnvironmentConfig();

  allErrors.push(
    ...timeoutResult.errors,
    ...appResult.errors,
    ...envResult.errors
  );
  allWarnings.push(
    ...timeoutResult.warnings,
    ...appResult.warnings,
    ...envResult.warnings
  );

  for (const warning of allWarnings) {
    logger.warn(`Configuration warning: ${warning}`);
  }

  for (const error of allErrors) {
    logger.error(`Configuration error: ${error}`);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/** Validates configuration and throws if invalid (fail-fast in production) */
export function validateConfigurationOrThrow(): void {
  const result = validateConfiguration();

  if (!result.valid) {
    const errorMessage = `Configuration validation failed:\n${result.errors.join('\n')}`;
    logger.error(errorMessage);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    }
  }

  if (result.warnings.length > 0) {
    logger.warn(`Configuration warnings:\n${result.warnings.join('\n')}`);
  }
}

/** Quick health check - returns true if configuration appears valid */
export function isConfigurationHealthy(): boolean {
  try {
    const result = validateConfiguration();
    return result.valid;
  } catch {
    return false;
  }
}
