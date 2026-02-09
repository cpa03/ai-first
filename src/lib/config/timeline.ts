/**
 * Timeline & Task Configuration
 * Centralizes timeline generation and task decomposition constants
 */

export const TIMELINE_CONFIG = {
  HOURS: {
    PER_WEEK: 40,
    PER_DAY: 8,
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
      PLANNING: 0.2,
      DEVELOPMENT: 0.5,
      TESTING: 0.2,
      DEPLOYMENT: 0.1,
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
    MIN_DURATION_DAYS: 1,
    MAX_DURATION_DAYS: 90,
  },

  DATE_FORMATS: {
    DISPLAY: 'MMM d, yyyy',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
    SHORT: 'MMM d',
  },

  OPTIONS: {
    TIMELINE_CHOICES: ['1-2 weeks', '1 month', '3 months', '6 months', '1 year'] as const,
    DEFAULT_TIMELINE: '1 month',
  },
} as const;

export const TASK_CONFIG = {
  DEFAULTS: {
    COMPLEXITY: 5,
    SKILLS: ['General'] as string[],
    PRIORITY: 3,
    STATUS: 'pending' as const,
  },

  ID: {
    PREFIX: 't_',
    SEPARATOR: '_',
    GENERATOR: (index: number) => `t_${index + 1}`,
  },

  COMPLEXITY: {
    MIN: 1,
    MAX: 10,
    WEIGHTS: {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 5,
    },
  },

  CONFIDENCE: {
    DEFAULT: 0.8,
    MULTIPLIER: 0.9,
    THRESHOLD: {
      HIGH: 0.8,
      MEDIUM: 0.5,
      LOW: 0.3,
    },
  },

  DEPENDENCIES: {
    MAX_DEPTH: 10,
    SEPARATOR: ',',
  },
} as const;

export const IDEA_CONFIG = {
  ID: {
    PREFIX: 'idea_',
    SEPARATOR: '_',
    GENERATOR: () => `idea_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
  },

  VALIDATION: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 5000,
    MIN_TITLE_LENGTH: 3,
  },
} as const;

export type TimelineConfig = typeof TIMELINE_CONFIG;
export type TaskConfig = typeof TASK_CONFIG;
export type IdeaConfig = typeof IDEA_CONFIG;
