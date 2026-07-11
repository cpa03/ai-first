/**
 * Timeline & Task Configuration
 * Centralizes timeline generation and task decomposition constants
 * Supports environment variable overrides via EnvLoader
 */

import { EnvLoader } from './environment';
import { generateId } from '@/lib/security/crypto';

export const TIMELINE_CONFIG = {
  HOURS: {
    /** Hours per work week - Env: TIMELINE_HOURS_PER_WEEK (default: 40) */
    PER_WEEK: EnvLoader.number('TIMELINE_HOURS_PER_WEEK', 40, 1, 168),
    /** Hours per work day - Env: TIMELINE_HOURS_PER_DAY (default: 8) */
    PER_DAY: EnvLoader.number('TIMELINE_HOURS_PER_DAY', 8, 1, 24),
  },

  MILLISECONDS: {
    PER_SECOND: 1000,
    PER_MINUTE: 60 * 1000,
    PER_HOUR: 60 * 60 * 1000,
    PER_DAY: 24 * 60 * 60 * 1000,
    PER_WEEK: 7 * 24 * 60 * 60 * 1000,
  },

  PHASES: {
    RATIOS: {
      /** Planning phase ratio (0.0-1.0) - Env: TIMELINE_RATIO_PLANNING (default: 0.2) */
      PLANNING: EnvLoader.number('TIMELINE_RATIO_PLANNING', 20, 0, 100) / 100,
      /** Development phase ratio (0.0-1.0) - Env: TIMELINE_RATIO_DEVELOPMENT (default: 0.5) */
      DEVELOPMENT:
        EnvLoader.number('TIMELINE_RATIO_DEVELOPMENT', 50, 0, 100) / 100,
      /** Testing phase ratio (0.0-1.0) - Env: TIMELINE_RATIO_TESTING (default: 0.2) */
      TESTING: EnvLoader.number('TIMELINE_RATIO_TESTING', 20, 0, 100) / 100,
      /** Deployment phase ratio (0.0-1.0) - Env: TIMELINE_RATIO_DEPLOYMENT (default: 0.1) */
      DEPLOYMENT:
        EnvLoader.number('TIMELINE_RATIO_DEPLOYMENT', 10, 0, 100) / 100,
    },
    NAMES: {
      PLANNING: 'Planning & Setup',
      DEVELOPMENT: 'Development',
      TESTING: 'Testing & QA',
      DEPLOYMENT: 'Deployment',
    },
  },

  MILESTONES: {
    SPACING_MULTIPLIER: 1,
    /** Minimum milestone duration in days - Env: TIMELINE_MILESTONE_MIN_DAYS (default: 1) */
    MIN_DURATION_DAYS: EnvLoader.number(
      'TIMELINE_MILESTONE_MIN_DAYS',
      1,
      1,
      30
    ),
    /** Maximum milestone duration in days - Env: TIMELINE_MILESTONE_MAX_DAYS (default: 90) */
    MAX_DURATION_DAYS: EnvLoader.number(
      'TIMELINE_MILESTONE_MAX_DAYS',
      90,
      7,
      365
    ),
  },

  DATE_FORMATS: {
    DISPLAY: 'MMM d, yyyy',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    SHORT: 'MMM d',
  },

  OPTIONS: {
    TIMELINE_CHOICES: [
      '1-2 weeks',
      '1 month',
      '3 months',
      '6 months',
      '1 year',
    ] as const,
    DEFAULT_TIMELINE: '1 month',
  },
} as const;

export const TASK_CONFIG = {
  DEFAULTS: {
    COMPLEXITY: 5,
    SKILLS: ['General'] as string[],
    PRIORITY: 3,
    STATUS: 'pending' as const,
    COMPLETION_PERCENTAGE: 0,
    PRIORITY_SCORE: 0,
    COMPLEXITY_SCORE: 0,
    RISK_LEVEL: 'low' as const,
    ESTIMATE: 0,
  },

  ID: {
    /** Task ID prefix - Env: TASK_ID_PREFIX (default: 't_') */
    PREFIX: EnvLoader.string('TASK_ID_PREFIX', 't_'),
    SEPARATOR: '_',
    GENERATOR: (index: number) =>
      `${EnvLoader.string('TASK_ID_PREFIX', 't_')}${index + 1}`,
  },

  COMPLEXITY: {
    /** Minimum complexity score - Env: TASK_COMPLEXITY_MIN (default: 1) */
    MIN: EnvLoader.number('TASK_COMPLEXITY_MIN', 1, 0, 10),
    /** Maximum complexity score - Env: TASK_COMPLEXITY_MAX (default: 10) */
    MAX: EnvLoader.number('TASK_COMPLEXITY_MAX', 10, 1, 20),
    WEIGHTS: {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 5,
    },
  },

  CONFIDENCE: {
    /** Default confidence score - Env: TASK_CONFIDENCE_DEFAULT (default: 0.8) */
    DEFAULT: EnvLoader.number('TASK_CONFIDENCE_DEFAULT', 80, 0, 100) / 100,
    /** Confidence multiplier - Env: TASK_CONFIDENCE_MULTIPLIER (default: 0.9) */
    MULTIPLIER:
      EnvLoader.number('TASK_CONFIDENCE_MULTIPLIER', 90, 0, 100) / 100,
    THRESHOLD: {
      HIGH: 0.8,
      MEDIUM: 0.5,
      LOW: 0.3,
    },
  },

  DEPENDENCIES: {
    /** Maximum dependency depth - Env: TASK_MAX_DEPENDENCY_DEPTH (default: 10) */
    MAX_DEPTH: EnvLoader.number('TASK_MAX_DEPENDENCY_DEPTH', 10, 1, 50),
    SEPARATOR: ',',
  },

  STATUSES: {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
  } as const,

  /** All valid task statuses as an array - use for validation */
  VALID_STATUSES: ['todo', 'in_progress', 'completed'] as const,

  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  } as const,

  /** All valid risk levels as an array - use for validation */
  VALID_RISK_LEVELS: ['low', 'medium', 'high'] as const,

  COMPLETION: {
    MIN: 0,
    MAX: 100,
    PERCENTAGES: {
      NOT_STARTED: 0,
      IN_PROGRESS: 50,
      COMPLETED: 100,
    },
  },
} as const;

export const IDEA_CONFIG = {
  ID: {
    /** Idea ID prefix - Env: IDEA_ID_PREFIX (default: 'idea_') */
    PREFIX: EnvLoader.string('IDEA_ID_PREFIX', 'idea_'),
    SEPARATOR: '_',
    // SECURITY: Use centralized generateId() for cryptographically secure IDs
    GENERATOR: () =>
      `${EnvLoader.string('IDEA_ID_PREFIX', 'idea_')}${generateId()}`,
  },

  VALIDATION: {
    /** Maximum title length - Env: IDEA_MAX_TITLE_LENGTH (default: 100) */
    MAX_TITLE_LENGTH: EnvLoader.number('IDEA_MAX_TITLE_LENGTH', 100, 10, 500),
    /** Maximum description length - Env: IDEA_MAX_DESCRIPTION_LENGTH (default: 5000) */
    MAX_DESCRIPTION_LENGTH: EnvLoader.number(
      'IDEA_MAX_DESCRIPTION_LENGTH',
      5000,
      100,
      50000
    ),
    /** Minimum title length - Env: IDEA_MIN_TITLE_LENGTH (default: 3) */
    MIN_TITLE_LENGTH: EnvLoader.number('IDEA_MIN_TITLE_LENGTH', 3, 1, 50),
  },

  DEFAULTS: {
    STATUS: 'draft',
  },
} as const;

export type TimelineConfig = typeof TIMELINE_CONFIG;
export type TaskConfig = typeof TASK_CONFIG;
export type IdeaConfig = typeof IDEA_CONFIG;
