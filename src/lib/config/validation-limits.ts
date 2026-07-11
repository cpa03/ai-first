/**
 * Validation Limits Configuration
 *
 * Centralizes all hardcoded validation limits used throughout the application.
 * This eliminates magic numbers scattered throughout the codebase.
 *
 * Usage:
 * ```typescript
 * import { VALIDATION_LIMITS } from '@/lib/config/validation-limits';
 *
 * // Instead of hardcoded number:
 * if (title.length > 100) { ... }
 *
 * // Use centralized config:
 * if (title.length > VALIDATION_LIMITS.TITLE.MAX_LENGTH) { ... }
 * ```
 */

export const VALIDATION_LIMITS = {
  // Title limits
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
    WARN_LENGTH: 150,
  },

  // Description limits
  DESCRIPTION: {
    MIN_LENGTH: 0,
    MAX_LENGTH: 5000,
    WARN_LENGTH: 4000,
  },

  // Content limits
  CONTENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50000,
    WARN_LENGTH: 40000,
  },

  // Comment limits
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 2000,
    WARN_LENGTH: 1500,
  },

  // Message limits
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 10000,
    WARN_LENGTH: 8000,
  },

  // Email limits
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    WARN_LENGTH: 200,
  },

  // Password limits
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    WARN_LENGTH: 100,
  },

  // Username limits
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    WARN_LENGTH: 40,
  },

  // Name limits
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    WARN_LENGTH: 80,
  },

  // Phone limits
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 20,
    WARN_LENGTH: 15,
  },

  // Address limits
  ADDRESS: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 500,
    WARN_LENGTH: 400,
  },

  // URL limits
  URL: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2048,
    WARN_LENGTH: 2000,
  },

  // Search query limits
  SEARCH: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
    WARN_LENGTH: 400,
  },

  // Tag limits
  TAG: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    MAX_COUNT: 20,
    WARN_COUNT: 15,
  },

  // Category limits
  CATEGORY: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    WARN_LENGTH: 80,
  },

  // File limits
  FILE: {
    NAME_MAX_LENGTH: 255,
    EXTENSION_MAX_LENGTH: 10,
    PATH_MAX_LENGTH: 1000,
  },

  // File size limits (in bytes)
  FILE_SIZE: {
    IMAGE: {
      MIN: 1024, // 1 KB
      MAX: 10485760, // 10 MB
      WARN: 8388608, // 8 MB
    },
    DOCUMENT: {
      MIN: 1024, // 1 KB
      MAX: 52428800, // 50 MB
      WARN: 41943040, // 40 MB
    },
    VIDEO: {
      MIN: 10240, // 10 KB
      MAX: 104857600, // 100 MB
      WARN: 83886080, // 80 MB
    },
    AUDIO: {
      MIN: 10240, // 10 KB
      MAX: 52428800, // 50 MB
      WARN: 41943040, // 40 MB
    },
    GENERAL: {
      MIN: 1024, // 1 KB
      MAX: 10485760, // 10 MB
      WARN: 8388608, // 8 MB
    },
  },

  // Pagination limits
  PAGINATION: {
    PAGE: {
      MIN: 1,
      MAX: 10000,
      DEFAULT: 1,
    },
    LIMIT: {
      MIN: 1,
      MAX: 100,
      DEFAULT: 20,
      WARN: 50,
    },
    OFFSET: {
      MIN: 0,
      MAX: 100000,
      DEFAULT: 0,
    },
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: {
      MIN: 1000, // 1 second
      MAX: 86400000, // 24 hours
      DEFAULT: 900000, // 15 minutes
      WARN: 3600000, // 1 hour
    },
    MAX_REQUESTS: {
      MIN: 1,
      MAX: 10000,
      DEFAULT: 100,
      WARN: 500,
    },
  },

  // Timeout limits
  TIMEOUT: {
    REQUEST: {
      MIN: 1000, // 1 second
      MAX: 300000, // 5 minutes
      DEFAULT: 30000, // 30 seconds
      WARN: 60000, // 1 minute
    },
    CONNECTION: {
      MIN: 1000, // 1 second
      MAX: 60000, // 1 minute
      DEFAULT: 10000, // 10 seconds
      WARN: 30000, // 30 seconds
    },
    RESPONSE: {
      MIN: 1000, // 1 second
      MAX: 300000, // 5 minutes
      DEFAULT: 60000, // 1 minute
      WARN: 120000, // 2 minutes
    },
    DATABASE: {
      MIN: 1000, // 1 second
      MAX: 60000, // 1 minute
      DEFAULT: 10000, // 10 seconds
      WARN: 30000, // 30 seconds
    },
    AI: {
      MIN: 5000, // 5 seconds
      MAX: 600000, // 10 minutes
      DEFAULT: 120000, // 2 minutes
      WARN: 300000, // 5 minutes
    },
  },

  // Retry limits
  RETRY: {
    MAX_ATTEMPTS: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 3,
      WARN: 5,
    },
    DELAY_MS: {
      MIN: 100, // 100ms
      MAX: 60000, // 1 minute
      DEFAULT: 1000, // 1 second
      WARN: 5000, // 5 seconds
    },
    MAX_DELAY_MS: {
      MIN: 1000, // 1 second
      MAX: 300000, // 5 minutes
      DEFAULT: 30000, // 30 seconds
      WARN: 60000, // 1 minute
    },
  },

  // Cache limits
  CACHE: {
    MAX_SIZE: {
      MIN: 1,
      MAX: 100000,
      DEFAULT: 10000,
      WARN: 50000,
    },
    TTL_MS: {
      MIN: 1000, // 1 second
      MAX: 86400000, // 24 hours
      DEFAULT: 300000, // 5 minutes
      WARN: 3600000, // 1 hour
    },
  },

  // API limits
  API: {
    REQUEST_SIZE: {
      MIN: 1024, // 1 KB
      MAX: 10485760, // 10 MB
      DEFAULT: 1048576, // 1 MB
      WARN: 5242880, // 5 MB
    },
    RESPONSE_SIZE: {
      MIN: 1024, // 1 KB
      MAX: 10485760, // 10 MB
      DEFAULT: 1048576, // 1 MB
      WARN: 5242880, // 5 MB
    },
    CONCURRENT_REQUESTS: {
      MIN: 1,
      MAX: 1000,
      DEFAULT: 100,
      WARN: 500,
    },
  },

  // Database limits
  DATABASE: {
    CONNECTION_POOL: {
      MIN: 1,
      MAX: 100,
      DEFAULT: 10,
      WARN: 50,
    },
    QUERY_TIMEOUT: {
      MIN: 1000, // 1 second
      MAX: 300000, // 5 minutes
      DEFAULT: 30000, // 30 seconds
      WARN: 60000, // 1 minute
    },
    BATCH_SIZE: {
      MIN: 1,
      MAX: 1000,
      DEFAULT: 100,
      WARN: 500,
    },
    MAX_ROWS: {
      MIN: 1,
      MAX: 1000000,
      DEFAULT: 10000,
      WARN: 100000,
    },
  },

  // AI limits
  AI: {
    TOKENS: {
      MIN: 1,
      MAX: 100000,
      DEFAULT: 4000,
      WARN: 8000,
    },
    MAX_TOKENS: {
      MIN: 1,
      MAX: 100000,
      DEFAULT: 4000,
      WARN: 8000,
    },
    TEMPERATURE: {
      MIN: 0,
      MAX: 2,
      DEFAULT: 0.7,
      WARN: 1.5,
    },
    TOP_P: {
      MIN: 0,
      MAX: 1,
      DEFAULT: 1,
      WARN: 0.9,
    },
    FREQUENCY_PENALTY: {
      MIN: -2,
      MAX: 2,
      DEFAULT: 0,
      WARN: 1,
    },
    PRESENCE_PENALTY: {
      MIN: -2,
      MAX: 2,
      DEFAULT: 0,
      WARN: 1,
    },
  },

  // Export limits
  EXPORT: {
    MAX_ITEMS: {
      MIN: 1,
      MAX: 10000,
      DEFAULT: 1000,
      WARN: 5000,
    },
    FILE_SIZE: {
      MIN: 1024, // 1 KB
      MAX: 104857600, // 100 MB
      DEFAULT: 10485760, // 10 MB
      WARN: 52428800, // 50 MB
    },
  },

  // Import limits
  IMPORT: {
    MAX_ITEMS: {
      MIN: 1,
      MAX: 10000,
      DEFAULT: 1000,
      WARN: 5000,
    },
    FILE_SIZE: {
      MIN: 1024, // 1 KB
      MAX: 104857600, // 100 MB
      DEFAULT: 10485760, // 10 MB
      WARN: 52428800, // 50 MB
    },
  },

  // Notification limits
  NOTIFICATION: {
    MAX_PER_DAY: {
      MIN: 1,
      MAX: 100,
      DEFAULT: 50,
      WARN: 80,
    },
    MAX_PER_HOUR: {
      MIN: 1,
      MAX: 50,
      DEFAULT: 20,
      WARN: 30,
    },
  },

  // Session limits
  SESSION: {
    MAX_DURATION: {
      MIN: 300000, // 5 minutes
      MAX: 86400000, // 24 hours
      DEFAULT: 3600000, // 1 hour
      WARN: 7200000, // 2 hours
    },
    MAX_INACTIVE: {
      MIN: 60000, // 1 minute
      MAX: 3600000, // 1 hour
      DEFAULT: 900000, // 15 minutes
      WARN: 1800000, // 30 minutes
    },
  },

  // Security limits
  SECURITY: {
    MAX_LOGIN_ATTEMPTS: {
      MIN: 1,
      MAX: 10,
      DEFAULT: 5,
      WARN: 3,
    },
    LOCKOUT_DURATION: {
      MIN: 60000, // 1 minute
      MAX: 86400000, // 24 hours
      DEFAULT: 900000, // 15 minutes
      WARN: 3600000, // 1 hour
    },
    PASSWORD_HISTORY: {
      MIN: 1,
      MAX: 24,
      DEFAULT: 12,
      WARN: 6,
    },
    PASSWORD_EXPIRY: {
      MIN: 2592000000, // 30 days
      MAX: 31536000000, // 1 year
      DEFAULT: 7776000000, // 90 days
      WARN: 15552000000, // 180 days
    },
  },

  // Analytics limits
  ANALYTICS: {
    MAX_EVENTS_PER_BATCH: {
      MIN: 1,
      MAX: 1000,
      DEFAULT: 100,
      WARN: 500,
    },
    MAX_EVENT_SIZE: {
      MIN: 100, // 100 bytes
      MAX: 10240, // 10 KB
      DEFAULT: 1024, // 1 KB
      WARN: 5120, // 5 KB
    },
    FLUSH_INTERVAL: {
      MIN: 1000, // 1 second
      MAX: 300000, // 5 minutes
      DEFAULT: 5000, // 5 seconds
      WARN: 60000, // 1 minute
    },
  },
} as const;

// Type for validation limits
export type ValidationLimits = typeof VALIDATION_LIMITS;

// Helper function to get nested validation limit
export function getValidationLimit(
  category: keyof ValidationLimits,
  subcategory: string,
  limitType: string
): number {
  const categoryLimits = VALIDATION_LIMITS[category];
  if (categoryLimits && typeof categoryLimits === 'object') {
    const subcategoryLimits = (categoryLimits as Record<string, unknown>)[
      subcategory
    ];
    if (subcategoryLimits && typeof subcategoryLimits === 'object') {
      const limit = (subcategoryLimits as Record<string, unknown>)[limitType];
      if (typeof limit === 'number') {
        return limit;
      }
    }
  }
  return 0;
}

// Helper function to validate a value against limits
export function validateAgainstLimits(
  value: number,
  limits: { min?: number; max?: number; default?: number }
): { valid: boolean; error?: string } {
  if (limits.min !== undefined && value < limits.min) {
    return { valid: false, error: `Value must be at least ${limits.min}` };
  }
  if (limits.max !== undefined && value > limits.max) {
    return { valid: false, error: `Value must be at most ${limits.max}` };
  }
  return { valid: true };
}

// Helper function to clamp a value within limits
export function clampToLimits(
  value: number,
  limits: { min?: number; max?: number; default?: number }
): number {
  if (limits.min !== undefined && value < limits.min) {
    return limits.min;
  }
  if (limits.max !== undefined && value > limits.max) {
    return limits.max;
  }
  return value;
}

// Common validation limit constants for quick access
export const TITLE_LIMITS = VALIDATION_LIMITS.TITLE;
export const DESCRIPTION_LIMITS = VALIDATION_LIMITS.DESCRIPTION;
export const CONTENT_LIMITS = VALIDATION_LIMITS.CONTENT;
export const EMAIL_LIMITS = VALIDATION_LIMITS.EMAIL;
export const PASSWORD_LIMITS = VALIDATION_LIMITS.PASSWORD;
export const USERNAME_LIMITS = VALIDATION_LIMITS.USERNAME;
export const FILE_SIZE_LIMITS = VALIDATION_LIMITS.FILE_SIZE;
export const PAGINATION_LIMITS = VALIDATION_LIMITS.PAGINATION;
export const RATE_LIMIT_CONFIG = VALIDATION_LIMITS.RATE_LIMIT;
export const TIMEOUT_LIMITS = VALIDATION_LIMITS.TIMEOUT;
export const RETRY_LIMITS = VALIDATION_LIMITS.RETRY;
export const CACHE_LIMITS = VALIDATION_LIMITS.CACHE;
export const API_LIMITS = VALIDATION_LIMITS.API;
export const DATABASE_LIMITS = VALIDATION_LIMITS.DATABASE;
export const AI_LIMITS = VALIDATION_LIMITS.AI;
export const EXPORT_LIMITS = VALIDATION_LIMITS.EXPORT;
export const IMPORT_LIMITS = VALIDATION_LIMITS.IMPORT;
export const NOTIFICATION_LIMITS = VALIDATION_LIMITS.NOTIFICATION;
export const SESSION_LIMITS = VALIDATION_LIMITS.SESSION;
export const SECURITY_LIMITS = VALIDATION_LIMITS.SECURITY;
export const ANALYTICS_LIMITS = VALIDATION_LIMITS.ANALYTICS;

// Add EXTERNAL property to RATE_LIMIT_CONFIG for backward compatibility
// This maintains compatibility with external-rate-limit.ts
export const RATE_LIMIT_CONFIG_WITH_EXTERNAL = {
  ...RATE_LIMIT_CONFIG,
  EXTERNAL: {
    THROTTLE_THRESHOLD: 0.2,
    MAX_AGE_MS: 3600000,
    MAX_SERVICES: 20,
  },
} as const;
