import { AI_CONFIG } from '../config/constants';
import { ValidationError, ValidationResult } from './input-sanitizer';

/**
 * Validates an AI model name against security constraints.
 *
 * @param model - The model name to validate
 * @returns ValidationResult with validity status and any errors
 *
 * Security rules:
 * - Must start with allowed prefixes: 'gpt-', 'claude-', 'o1-', 'o3-'
 * - Maximum 100 characters
 * - Only alphanumeric, hyphens, dots allowed
 * - Rejects empty, non-string, malicious patterns
 */
export function validateModelName(model: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  // Check if model is a string
  if (typeof model !== 'string') {
    errors.push({
      field: 'model',
      message: 'Model must be a string',
    });
    return { valid: false, errors };
  }

  const trimmed = model.trim();

  // Check for empty string
  if (trimmed.length === 0) {
    errors.push({
      field: 'model',
      message: 'Model name cannot be empty',
    });
    return { valid: false, errors };
  }

  // Check max length (Security DoS Prevention)
  if (trimmed.length > VALIDATION.MODEL_NAME_MAX_LENGTH) {
    errors.push({
      field: 'model',
      message: `Model name must not exceed ${VALIDATION.MODEL_NAME_MAX_LENGTH} characters`,
    });
    return { valid: false, errors };
  }

  // Check allowed prefixes to prevent shadow model usage
  const allowedPrefixes = VALIDATION.ALLOWED_MODEL_PREFIXES;
  const hasValidPrefix = allowedPrefixes.some((prefix) =>
    trimmed.startsWith(prefix)
  );
  if (!hasValidPrefix) {
    errors.push({
      field: 'model',
      message: `Model name must start with one of: ${allowedPrefixes.join(', ')}`,
    });
    return { valid: false, errors };
  }

  // Check character pattern (only alphanumeric, hyphens, dots)
  if (!VALIDATION.MODEL_NAME_PATTERN.test(trimmed)) {
    errors.push({
      field: 'model',
      message:
        'Model name must contain only alphanumeric characters, hyphens, and dots',
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates AI model temperature parameter.
 *
 * @param temp - Temperature value to validate (can be undefined/null for default fallback)
 * @returns ValidationResult with validity status and any errors
 *
 * Rules:
 * - Valid range: [0, 2.0]
 * - Allows undefined/null (for default fallback)
 * - Rejects non-numbers, NaN, out of bounds
 */
export function validateModelTemperature(
  temp: number | undefined | null
): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  // Allow undefined/null for default fallback
  if (temp === undefined || temp === null) {
    return { valid: true, errors: [] };
  }

  // Check if it's a number
  if (typeof temp !== 'number') {
    errors.push({
      field: 'temperature',
      message: 'Temperature must be a number',
    });
    return { valid: false, errors };
  }

  // Check for NaN
  if (Number.isNaN(temp)) {
    errors.push({
      field: 'temperature',
      message: 'Temperature cannot be NaN',
    });
    return { valid: false, errors };
  }

  // Check range [0, 2.0]
  if (temp < VALIDATION.TEMPERATURE_MIN || temp > VALIDATION.TEMPERATURE_MAX) {
    errors.push({
      field: 'temperature',
      message: `Temperature must be between ${VALIDATION.TEMPERATURE_MIN} and ${VALIDATION.TEMPERATURE_MAX}`,
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates AI model maxTokens parameter.
 *
 * @param tokens - Max tokens value to validate (can be undefined/null for default fallback)
 * @returns ValidationResult with validity status and any errors
 *
 * Rules:
 * - Valid range: [1, 32000]
 * - Must be integer
 * - Rejects non-integers, out of bounds, invalid types
 */
export function validateModelMaxTokens(
  tokens: number | undefined | null
): ValidationResult {
  const errors: ValidationError[] = [];
  const { VALIDATION } = AI_CONFIG;

  // Allow undefined/null for default fallback
  if (tokens === undefined || tokens === null) {
    return { valid: true, errors: [] };
  }

  // Check if it's a number
  if (typeof tokens !== 'number') {
    errors.push({
      field: 'maxTokens',
      message: 'Max tokens must be a number',
    });
    return { valid: false, errors };
  }

  // Check for NaN
  if (Number.isNaN(tokens)) {
    errors.push({
      field: 'maxTokens',
      message: 'Max tokens cannot be NaN',
    });
    return { valid: false, errors };
  }

  // Check if it's an integer
  if (!Number.isInteger(tokens)) {
    errors.push({
      field: 'maxTokens',
      message: 'Max tokens must be an integer',
    });
    return { valid: false, errors };
  }

  // Check range [1, 32000]
  if (
    tokens < VALIDATION.MAX_TOKENS_MIN ||
    tokens > VALIDATION.MAX_TOKENS_MAX
  ) {
    errors.push({
      field: 'maxTokens',
      message: `Max tokens must be between ${VALIDATION.MAX_TOKENS_MIN} and ${VALIDATION.MAX_TOKENS_MAX}`,
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

/**
 * Validates a complete AI model configuration object.
 *
 * @param config - Configuration object to validate
 * @returns ValidationResult with aggregated errors from sub-validations
 *
 * Rules:
 * - Validates config is an object
 * - Aggregates errors from sub-validations for model, temperature, maxTokens
 */
export function validateAIModelConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check if config is an object
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    errors.push({
      field: 'config',
      message: 'AI model config must be an object',
    });
    return { valid: false, errors };
  }

  const configObj = config as Record<string, unknown>;

  // Validate model name
  if ('model' in configObj) {
    const modelResult = validateModelName(configObj.model);
    if (!modelResult.valid) {
      errors.push(...modelResult.errors);
    }
  }

  // Validate temperature
  if ('temperature' in configObj) {
    const tempResult = validateModelTemperature(
      configObj.temperature as number | undefined | null
    );
    if (!tempResult.valid) {
      errors.push(...tempResult.errors);
    }
  }

  // Validate maxTokens
  if ('maxTokens' in configObj) {
    const tokensResult = validateModelMaxTokens(
      configObj.maxTokens as number | undefined | null
    );
    if (!tokensResult.valid) {
      errors.push(...tokensResult.errors);
    }
  }

  return { valid: errors.length === 0, errors };
}
