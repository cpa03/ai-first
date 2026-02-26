/**
 * API Timeout Configuration
 *
 * All timeout values are in milliseconds.
 * Supports environment variable overrides.
 *
 * Usage:
 * ```typescript
 * import { TIMEOUT_CONFIG } from '@/lib/config';
 * const timeout = TIMEOUT_CONFIG.DEFAULT;
 * ```
 */
import { EnvLoader } from './environment';

export const TIMEOUT_CONFIG = {
  /**
   * Default timeout for API requests (ms)
   * Env: API_TIMEOUT_DEFAULT (default: 30000)
   */
  DEFAULT: EnvLoader.number('API_TIMEOUT_DEFAULT', 30000, 1000, 300000),

  /**
   * Timeout for quick API calls (health checks, simple lookups) (ms)
   * Env: API_TIMEOUT_QUICK (default: 5000)
   */
  QUICK: EnvLoader.number('API_TIMEOUT_QUICK', 5000, 500, 60000),

  /**
   * Timeout for standard API requests (ms)
   * Env: API_TIMEOUT_STANDARD (default: 10000)
   */
  STANDARD: EnvLoader.number('API_TIMEOUT_STANDARD', 10000, 1000, 120000),

  /**
   * Timeout for long-running operations (creating resources, large uploads) (ms)
   * Env: API_TIMEOUT_LONG (default: 30000)
   */
  LONG: EnvLoader.number('API_TIMEOUT_LONG', 30000, 5000, 600000),

  /**
   * Service-specific timeouts
   */
  TRELLO: {
    CREATE_BOARD: EnvLoader.number(
      'API_TIMEOUT_TRELLO_BOARD',
      10000,
      1000,
      60000
    ),
    CREATE_LIST: EnvLoader.number(
      'API_TIMEOUT_TRELLO_LIST',
      10000,
      1000,
      60000
    ),
    CREATE_CARD: EnvLoader.number(
      'API_TIMEOUT_TRELLO_CARD',
      10000,
      1000,
      60000
    ),
  },

  GITHUB: {
    GET_USER: EnvLoader.number('API_TIMEOUT_GITHUB_USER', 10000, 1, 60000),
    CREATE_REPO: EnvLoader.number(
      'API_TIMEOUT_GITHUB_REPO',
      30000,
      1000,
      300000
    ),
  },

  NOTION: {
    CLIENT_TIMEOUT: EnvLoader.number('API_TIMEOUT_NOTION', 30000, 1000, 300000),
  },
} as const;

/**
 * TypeScript type for TimeoutConfig
 */
export type TimeoutConfig = typeof TIMEOUT_CONFIG;
