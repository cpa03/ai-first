export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export const MAX_IDEA_LENGTH = 10000;
export const MIN_IDEA_LENGTH = 10;
export const MAX_TITLE_LENGTH = 500;
export const MAX_IDEA_ID_LENGTH = 100;
const MAX_USER_RESPONSE_SIZE = 5000;

// Answer validation constants for clarification flow
export const MIN_ANSWER_LENGTH = 5;
export const MAX_ANSWER_LENGTH = 500;
export const MIN_SHORT_ANSWER_LENGTH = 2;
export const MAX_SHORT_ANSWER_LENGTH = 100;

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
  if (jsonStr.length > MAX_USER_RESPONSE_SIZE) {
    errors.push({
      field: 'userResponses',
      message: `userResponses must not exceed ${MAX_USER_RESPONSE_SIZE} characters`,
    });
  }

  for (const [key, value] of Object.entries(responses)) {
    if (typeof key !== 'string' || key.length > 100) {
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

    if (typeof value === 'string' && value.length > 1000) {
      errors.push({
        field: 'userResponses',
        message: `Value for key "${key}" must not exceed 1000 characters`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateRequestSize(
  request: Request,
  maxSizeBytes: number = 1024 * 1024
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

export function safeJsonParse<T = unknown>(
  jsonString: unknown,
  fallback: T,
  schemaValidator?: (data: unknown) => data is T
): T {
  try {
    if (typeof jsonString !== 'string') {
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

export function isArrayOf<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemValidator);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function hasProperty<K extends string>(
  obj: unknown,
  prop: K
): obj is Record<K, unknown> {
  return isObject(obj) && prop in obj;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isClarifierQuestion(data: unknown): data is {
  id: string;
  question: string;
  type: 'open' | 'multiple_choice' | 'yes_no';
  options?: string[];
  required: boolean;
} {
  if (!isObject(data)) return false;
  if (!hasProperty(data, 'id') || !isString(data.id)) return false;
  if (!hasProperty(data, 'question') || !isString(data.question)) return false;
  if (!hasProperty(data, 'type') || !isString(data.type)) return false;
  const typeValues = ['open', 'multiple_choice', 'yes_no'];
  if (!typeValues.includes((data as any).type)) return false; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (hasProperty(data, 'options') && !isArrayOf(data.options, isString)) {
    return false;
  }
  if (!hasProperty(data, 'required') || !isBoolean(data.required)) {
    return false;
  }
  return true;
}

export function isTask(data: unknown): data is {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  complexity: number;
} {
  if (!isObject(data)) return false;
  if (!hasProperty(data, 'id') || !isString(data.id)) return false;
  if (!hasProperty(data, 'title') || !isString(data.title)) return false;
  if (!hasProperty(data, 'description') || !isString(data.description))
    return false;
  if (!hasProperty(data, 'estimatedHours') || !isNumber(data.estimatedHours)) {
    return false;
  }
  if (!hasProperty(data, 'complexity') || !isNumber(data.complexity)) {
    return false;
  }
  return true;
}

export function isIdeaAnalysis(data: unknown): data is {
  objectives: Array<{ title: string; description: string; confidence: number }>;
  deliverables: Array<{
    title: string;
    description: string;
    priority: number;
    estimatedHours: number;
    confidence: number;
  }>;
  complexity: {
    score: number;
    factors: string[];
    level: 'simple' | 'medium' | 'complex';
  };
  scope: {
    size: 'small' | 'medium' | 'large';
    estimatedWeeks: number;
    teamSize: number;
  };
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: number;
  }>;
  successCriteria: string[];
  overallConfidence: number;
} {
  if (!isObject(data)) return false;
  if (
    !hasProperty(data, 'objectives') ||
    !isArrayOf(data.objectives, isObject)
  ) {
    return false;
  }
  if (
    !hasProperty(data, 'deliverables') ||
    !isArrayOf(data.deliverables, isObject)
  ) {
    return false;
  }
  if (!hasProperty(data, 'complexity') || !isObject(data.complexity))
    return false;
  if (!hasProperty(data, 'scope') || !isObject(data.scope)) return false;
  if (
    !hasProperty(data, 'riskFactors') ||
    !isArrayOf(data.riskFactors, isObject)
  ) {
    return false;
  }
  if (
    !hasProperty(data, 'successCriteria') ||
    !isArrayOf(data.successCriteria, isString)
  ) {
    return false;
  }
  return true;
}
