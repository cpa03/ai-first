import { EnvLoader } from './environment';

/**
 * API validation configuration
 * Now supports environment variable overrides
 */
export const VALIDATION_CONFIG = {
  MAX_ANSWER_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_ANSWER_LENGTH',
    5000,
    100,
    50000
  ),
  DEFAULT_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_DEFAULT_PAGINATION_LIMIT',
    50,
    5,
    500
  ),
  MAX_PAGINATION_LIMIT: EnvLoader.number(
    'VALIDATION_MAX_PAGINATION_LIMIT',
    100,
    10,
    1000
  ),
  MIN_IDEA_LENGTH: EnvLoader.number('VALIDATION_MIN_IDEA_LENGTH', 10, 1, 1000),
  MAX_IDEA_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_LENGTH',
    10000,
    100,
    100000
  ),
  MAX_IDEA_ID_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_IDEA_ID_LENGTH',
    100,
    10,
    500
  ),
  MAX_REQUEST_BODY_SIZE: EnvLoader.number(
    'VALIDATION_MAX_REQUEST_BODY_SIZE',
    1048576,
    1024,
    10485760
  ),
} as const;

/**
 * Validation limits configuration
 * Now supports environment variable overrides
 */
export const VALIDATION_LIMITS_CONFIG = {
  MAX_USER_RESPONSE_SIZE: VALIDATION_CONFIG.MAX_ANSWER_LENGTH,
  MAX_RESPONSE_KEY_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_RESPONSE_KEY_LENGTH',
    100,
    10,
    500
  ),
  MAX_RESPONSE_VALUE_LENGTH: EnvLoader.number(
    'VALIDATION_MAX_RESPONSE_VALUE_LENGTH',
    1000,
    100,
    5000
  ),
  DEFAULT_MAX_REQUEST_SIZE_BYTES: VALIDATION_CONFIG.MAX_REQUEST_BODY_SIZE,
} as const;

/**
 * Agent configuration for breakdown engine and clarifier
 */
export const AGENT_CONFIG = {
  BREAKDOWN_CONFIDENCE_WEIGHTS: {
    ANALYSIS:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_ANALYSIS', 30, 0, 100) / 100,
    TASKS: EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_TASKS', 30, 0, 100) / 100,
    DEPENDENCIES:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_DEPENDENCIES', 20, 0, 100) / 100,
    TIMELINE:
      EnvLoader.number('AGENT_BREAKDOWN_WEIGHT_TIMELINE', 20, 0, 100) / 100,
  } as const,

  BREAKDOWN_FALLBACK_CONFIDENCE: {
    DEPENDENCIES: 0.8,
    TIMELINE: 0.7,
  } as const,

  IDEA_ANALYSIS_FALLBACK: {
    COMPLEXITY_SCORE: 5,
    COMPLEXITY_LEVEL: 'medium' as const,
    SCOPE_SIZE: 'medium' as const,
    ESTIMATED_WEEKS: 8,
    TEAM_SIZE: 2,
    OVERALL_CONFIDENCE: 0.7,
  } as const,

  QUESTION_GENERATOR: {
    MIN_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MIN', 3, 1, 10),
    MAX_QUESTIONS: EnvLoader.number('AGENT_QUESTION_MAX', 5, 1, 20),
    DEFAULT_QUESTION_TYPE: 'open' as const,
    REQUIRED_DEFAULT: true,
    FALLBACK_QUESTIONS: [
      {
        id: 'q_1',
        question:
          'What is main problem you are trying to solve with this idea?',
        type: 'open' as const,
        options: [] as string[],
        required: true,
      },
      {
        id: 'q_2',
        question: 'Who is target audience for this solution?',
        type: 'open' as const,
        options: [] as string[],
        required: true,
      },
      {
        id: 'q_3',
        question: 'What are key features or functionality you envision?',
        type: 'open' as const,
        options: [] as string[],
        required: true,
      },
    ],
  } as const,

  CLARIFIER_CONFIDENCE: {
    BASE_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_BASE_CONFIDENCE', 30, 0, 100) / 100,
    CONFIDENCE_INCREMENT_PER_ANSWER:
      EnvLoader.number('AGENT_CLARIFIER_INCREMENT', 60, 0, 100) / 100,
    MAX_CONFIDENCE:
      EnvLoader.number('AGENT_CLARIFIER_MAX_CONFIDENCE', 90, 50, 100) / 100,
    DEFAULT_CONFIDENCE: 0.5,
  } as const,

  DATABASE: {
    MAX_CONNECTION_RETRIES: EnvLoader.number('AGENT_DB_MAX_RETRIES', 3, 0, 10),
    HEALTH_CHECK_STALE_THRESHOLD_MS: EnvLoader.number(
      'AGENT_DB_HEALTH_CHECK_STALE_MS',
      30000,
      5000,
      300000
    ),
    /**
     * Timeout for database health check operations (ms)
     * Prevents health checks from hanging indefinitely
     * Env: AGENT_DB_HEALTH_CHECK_TIMEOUT_MS (default: 5000)
     */
    HEALTH_CHECK_TIMEOUT_MS: EnvLoader.number(
      'AGENT_DB_HEALTH_CHECK_TIMEOUT_MS',
      5000,
      1000,
      30000
    ),
    DEFAULT_SEARCH_LIMIT: EnvLoader.number(
      'AGENT_DB_DEFAULT_SEARCH_LIMIT',
      10,
      1,
      100
    ),
    VECTOR_SIMILARITY_THRESHOLD:
      EnvLoader.number('AGENT_DB_VECTOR_SIMILARITY_THRESHOLD', 78, 0, 100) /
      100,
  } as const,
} as const;

/**
 * Legacy validation limits configuration
 * Note: VALIDATION_CONFIG above is the primary source for API validation
 * These constants provide field-specific limits for use in validation.ts
 */
export const VALIDATION_LIMITS = {
  IDEA: {
    MIN_LENGTH: VALIDATION_CONFIG.MIN_IDEA_LENGTH,
    MAX_LENGTH: VALIDATION_CONFIG.MAX_IDEA_LENGTH,
    MAX_ID_LENGTH: VALIDATION_CONFIG.MAX_IDEA_ID_LENGTH,
  } as const,

  TITLE: {
    MAX_LENGTH: EnvLoader.number('VALIDATION_TITLE_MAX_LENGTH', 500, 50, 1000),
  } as const,

  ANSWER: {
    MIN_LENGTH: EnvLoader.number('VALIDATION_ANSWER_MIN_LENGTH', 5, 1, 50),
    MAX_LENGTH: EnvLoader.number('VALIDATION_ANSWER_MAX_LENGTH', 500, 50, 5000),
    MIN_SHORT_LENGTH: EnvLoader.number(
      'VALIDATION_ANSWER_MIN_SHORT_LENGTH',
      2,
      1,
      10
    ),
    MAX_SHORT_LENGTH: EnvLoader.number(
      'VALIDATION_ANSWER_MAX_SHORT_LENGTH',
      100,
      10,
      500
    ),
  } as const,

  PAGINATION: {
    DEFAULT_LIMIT: VALIDATION_CONFIG.DEFAULT_PAGINATION_LIMIT,
    MAX_LIMIT: VALIDATION_CONFIG.MAX_PAGINATION_LIMIT,
    AGENT_LOGS_DEFAULT: EnvLoader.number(
      'VALIDATION_AGENT_LOGS_DEFAULT',
      100,
      10,
      1000
    ),
  } as const,

  DATABASE: {
    STALE_SESSION_THRESHOLD_MS:
      AGENT_CONFIG.DATABASE.HEALTH_CHECK_STALE_THRESHOLD_MS,
  } as const,
} as const;

/**
 * Clarifier Agent Values
 * Now supports environment variable overrides
 */
export const CLARIFIER_VALUES = {
  LOG_PREVIEW_LENGTH: EnvLoader.number(
    'AGENT_CLARIFIER_LOG_PREVIEW_LENGTH',
    100,
    50,
    500
  ),
  INITIAL_CONFIDENCE: AGENT_CONFIG.CLARIFIER_CONFIDENCE.BASE_CONFIDENCE,
  COMPLETION_CONFIDENCE: AGENT_CONFIG.CLARIFIER_CONFIDENCE.MAX_CONFIDENCE,
} as const;

/**
 * Task Validation
 * Now supports environment variable overrides
 */
export const TASK_VALIDATION = {
  MAX_TITLE_LENGTH: EnvLoader.number(
    'VALIDATION_TASK_MAX_TITLE_LENGTH',
    255,
    50,
    1000
  ),
} as const;
