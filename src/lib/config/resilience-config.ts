import { RETRY_CONFIG } from './retry-config';
import { EnvLoader } from './environment';

/**
 * Resilience configuration defaults
 * Used for circuit breakers, retries, and timeouts
 */
export const RESILIENCE_CONFIG = {
  RETRY: {
    DEFAULT_MAX_RETRIES: RETRY_CONFIG.DEFAULT_MAX_RETRIES,
    DEFAULT_BASE_DELAY_MS: RETRY_CONFIG.INITIAL_DELAY,
    DEFAULT_MAX_DELAY_MS: RETRY_CONFIG.MAX_DELAY,
    DEFAULT_BACKOFF_MULTIPLIER: RETRY_CONFIG.BACKOFF_MULTIPLIER,
  } as const,

  CIRCUIT_BREAKER: {
    DEFAULT_FAILURE_THRESHOLD: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_FAILURE_THRESHOLD',
      5,
      1,
      50
    ),
    DEFAULT_RESET_TIMEOUT_MS: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_RESET_TIMEOUT_MS',
      60000,
      5000,
      600000
    ),
    DEFAULT_MONITORING_PERIOD_MS: EnvLoader.number(
      'RESILIENCE_CB_DEFAULT_MONITORING_PERIOD_MS',
      10000,
      1000,
      60000
    ),
  } as const,

  TIMEOUTS: {
    OPENAI: EnvLoader.number('RESILIENCE_TIMEOUT_OPENAI', 60000, 5000, 300000),
    NOTION: EnvLoader.number('RESILIENCE_TIMEOUT_NOTION', 30000, 5000, 300000),
    TRELLO: EnvLoader.number('RESILIENCE_TIMEOUT_TRELLO', 15000, 1000, 120000),
    GITHUB: EnvLoader.number('RESILIENCE_TIMEOUT_GITHUB', 30000, 5000, 300000),
    DATABASE: EnvLoader.number(
      'RESILIENCE_TIMEOUT_DATABASE',
      10000,
      1000,
      120000
    ),
    SUPABASE: EnvLoader.number(
      'RESILIENCE_TIMEOUT_SUPABASE',
      10000,
      1000,
      120000
    ),
    DEFAULT: EnvLoader.number(
      'RESILIENCE_TIMEOUT_DEFAULT',
      30000,
      1000,
      300000
    ),
  } as const,

  SERVICE_RETRY: {
    OPENAI: {
      maxRetries: EnvLoader.number('RETRY_OPENAI_MAX_RETRIES', 3, 0, 10),
      baseDelayMs: EnvLoader.number(
        'RETRY_OPENAI_BASE_DELAY_MS',
        1000,
        100,
        60000
      ),
      maxDelayMs: EnvLoader.number(
        'RETRY_OPENAI_MAX_DELAY_MS',
        10000,
        1000,
        300000
      ),
    },
    GITHUB: {
      maxRetries: EnvLoader.number('RETRY_GITHUB_MAX_RETRIES', 3, 0, 10),
      baseDelayMs: EnvLoader.number(
        'RETRY_GITHUB_BASE_DELAY_MS',
        1000,
        100,
        60000
      ),
      maxDelayMs: EnvLoader.number(
        'RETRY_GITHUB_MAX_DELAY_MS',
        5000,
        1000,
        300000
      ),
    },
    NOTION: {
      maxRetries: EnvLoader.number('RETRY_NOTION_MAX_RETRIES', 3, 0, 10),
      baseDelayMs: EnvLoader.number(
        'RETRY_NOTION_BASE_DELAY_MS',
        1000,
        100,
        60000
      ),
      maxDelayMs: EnvLoader.number(
        'RETRY_NOTION_MAX_DELAY_MS',
        5000,
        1000,
        300000
      ),
    },
    TRELLO: {
      maxRetries: EnvLoader.number('RETRY_TRELLO_MAX_RETRIES', 3, 0, 10),
      baseDelayMs: EnvLoader.number(
        'RETRY_TRELLO_BASE_DELAY_MS',
        500,
        100,
        60000
      ),
      maxDelayMs: EnvLoader.number(
        'RETRY_TRELLO_MAX_DELAY_MS',
        3000,
        500,
        300000
      ),
    },
    SUPABASE: {
      maxRetries: EnvLoader.number('RETRY_SUPABASE_MAX_RETRIES', 2, 0, 10),
      baseDelayMs: EnvLoader.number(
        'RETRY_SUPABASE_BASE_DELAY_MS',
        1000,
        100,
        60000
      ),
      maxDelayMs: EnvLoader.number(
        'RETRY_SUPABASE_MAX_DELAY_MS',
        10000,
        1000,
        300000
      ),
    },
  } as const,

  SERVICE_CIRCUIT_BREAKER: {
    OPENAI: {
      failureThreshold: EnvLoader.number(
        'CB_OPENAI_FAILURE_THRESHOLD',
        5,
        1,
        50
      ),
      resetTimeoutMs: EnvLoader.number(
        'CB_OPENAI_RESET_TIMEOUT_MS',
        60000,
        5000,
        600000
      ),
    },
    GITHUB: {
      failureThreshold: EnvLoader.number(
        'CB_GITHUB_FAILURE_THRESHOLD',
        5,
        1,
        50
      ),
      resetTimeoutMs: EnvLoader.number(
        'CB_GITHUB_RESET_TIMEOUT_MS',
        30000,
        5000,
        600000
      ),
    },
    NOTION: {
      failureThreshold: EnvLoader.number(
        'CB_NOTION_FAILURE_THRESHOLD',
        5,
        1,
        50
      ),
      resetTimeoutMs: EnvLoader.number(
        'CB_NOTION_RESET_TIMEOUT_MS',
        30000,
        5000,
        600000
      ),
    },
    TRELLO: {
      failureThreshold: EnvLoader.number(
        'CB_TRELLO_FAILURE_THRESHOLD',
        3,
        1,
        50
      ),
      resetTimeoutMs: EnvLoader.number(
        'CB_TRELLO_RESET_TIMEOUT_MS',
        20000,
        5000,
        600000
      ),
    },
    SUPABASE: {
      failureThreshold: EnvLoader.number(
        'CB_SUPABASE_FAILURE_THRESHOLD',
        10,
        1,
        100
      ),
      resetTimeoutMs: EnvLoader.number(
        'CB_SUPABASE_RESET_TIMEOUT_MS',
        60000,
        5000,
        600000
      ),
    },
  } as const,

  /** Circuit breaker manager configuration */
  MANAGER: {
    DEFAULT_MAX_SIZE: EnvLoader.number(
      'RESILIENCE_MANAGER_DEFAULT_MAX_SIZE',
      100,
      10,
      1000
    ),
  } as const,
} as const;
