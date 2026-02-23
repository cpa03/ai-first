/**
 * Application Configuration
 * Centralizes all app metadata, branding, environment variables, and constants
 */

import { EnvLoader } from './env-loader';
import { PLATFORM_ENV_VARS } from './constants';

export const APP_CONFIG = {
  NAME: 'IdeaFlow',
  /**
   * Application version
   * Env: APP_VERSION (default: '1.0.0')
   * Allows for dynamic versioning in different deployment environments
   */
  VERSION: EnvLoader.string('APP_VERSION', '1.0.0'),
  DESCRIPTION: 'Turn ideas into action with AI-powered project planning',
  TAGLINE: 'Turn ideas into action.',

  URLS: {
    /** Base URL for the application - Env: APP_BASE_URL (default: 'https://ideaflow.ai') */
    BASE: EnvLoader.string('APP_BASE_URL', 'https://ideaflow.ai'),
    /** Site URL for SEO - Env: APP_SITE_URL (default: 'https://ideaflow.ai') */
    SITE: EnvLoader.string('APP_SITE_URL', 'https://ideaflow.ai'),
    /** WWW redirect URL - Env: APP_WWW_URL (default: 'https://www.ideaflow.ai') */
    WWW: EnvLoader.string('APP_WWW_URL', 'https://www.ideaflow.ai'),
  },

  BRANDING: {
    /** Dynamic copyright with current year - eliminates hardcoded year */
    get COPYRIGHT() {
      return `© ${new Date().getFullYear()} IdeaFlow. Turn ideas into action.`;
    },
    OG_IMAGE_PATH: '/og-image.jpg',
    FAVICON_PATH: '/favicon.ico',
  },

  CONTACT: {
    /** Support email address - Env: APP_SUPPORT_EMAIL (default: 'support@ideaflow.ai') */
    SUPPORT_EMAIL: EnvLoader.string('APP_SUPPORT_EMAIL', 'support@ideaflow.ai'),
    /** Twitter handle - Env: APP_TWITTER_HANDLE (default: '@ideaflowai') */
    TWITTER_HANDLE: EnvLoader.string('APP_TWITTER_HANDLE', '@ideaflowai'),
  },

  META: {
    TITLE: 'IdeaFlow - Turn Ideas into Action',
    TITLE_TEMPLATE: '%s | IdeaFlow',
    DEFAULT_DESCRIPTION:
      'Transform your ideas into structured projects with AI-powered planning, task breakdown, and export to your favorite tools.',
    KEYWORDS: [
      'project planning',
      'AI',
      'idea management',
      'task breakdown',
      'productivity',
    ],
    AUTHORS: [{ name: 'IdeaFlow Team', url: 'https://ideaflow.ai' }],
    CREATOR: 'IdeaFlow Team',
    PUBLISHER: 'IdeaFlow',
    CATEGORY: 'Productivity',
  },

  ENV_VARS: {
    REQUIRED: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'COST_LIMIT_DAILY',
      'NEXT_PUBLIC_APP_URL',
    ] as const,

    AI_PROVIDERS: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'] as const,

    OPTIONAL: [
      'NODE_ENV',
      PLATFORM_ENV_VARS.VERCEL.VERCEL,
      PLATFORM_ENV_VARS.CLOUDFLARE.CF_WORKER,
      PLATFORM_ENV_VARS.CLOUDFLARE.CLOUDFLARE,
    ] as const,
  },

  HEALTH_STATUS: {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    WARNING: 'warning',
  } as const,

  /**
   * Pagination configuration
   * Centralizes pagination limits and offsets
   * All values have sensible defaults but can be overridden via environment variables
   */
  PAGINATION: {
    /** Default number of items per page - Default: 50 */
    DEFAULT_LIMIT: EnvLoader.number('PAGINATION_DEFAULT_LIMIT', 50, 1, 1000),
    /** Maximum allowed items per page - Default: 100 */
    MAX_LIMIT: EnvLoader.number('PAGINATION_MAX_LIMIT', 100, 10, 1000),
    /** Minimum allowed items per page - Default: 10 */
    MIN_LIMIT: EnvLoader.number('PAGINATION_MIN_LIMIT', 10, 1, 100),
    /** Default offset for pagination - Default: 0 */
    DEFAULT_OFFSET: EnvLoader.number('PAGINATION_DEFAULT_OFFSET', 0, 0, 10000),
  },

  /**
   * String limits configuration
   * Centralizes string length limits for IDs and previews
   * All values have sensible defaults but can be overridden via environment variables
   */
  STRING_LIMITS: {
    /** Maximum length for title preview - Default: 50 */
    TITLE_PREVIEW_LENGTH: EnvLoader.number(
      'STRING_TITLE_PREVIEW_LENGTH',
      50,
      10,
      200
    ),
    /** Length of random portion in idea IDs - Default: 11 */
    IDEA_ID_RANDOM_LENGTH: EnvLoader.number(
      'STRING_ID_RANDOM_LENGTH',
      11,
      4,
      32
    ),
    /** Radix for idea ID generation (2-36) - Default: 36 */
    IDEA_ID_RANDOM_RADIX: EnvLoader.number(
      'STRING_ID_RANDOM_RADIX',
      36,
      2,
      36
    ),
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
