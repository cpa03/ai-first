/**
 * Application Configuration
 * Centralizes all app metadata, branding, environment variables, and constants
 * All values support environment variable overrides where applicable
 */

import { EnvLoader } from './environment';

export const APP_CONFIG = {
  NAME: 'IdeaFlow',
  /**
   * Application version
   * Env: APP_VERSION (default: '1.0.0')
   * Used by health checks, exports, and metadata
   */
  VERSION: EnvLoader.string('APP_VERSION', '1.0.0'),
  DESCRIPTION: 'Turn ideas into action with AI-powered project planning',
  TAGLINE: 'Turn ideas into action.',

  URLS: {
    BASE: 'https://ideaflow.ai',
    SITE: 'https://ideaflow.ai',
    WWW: 'https://www.ideaflow.ai',
  },

  BRANDING: {
    COPYRIGHT: '© 2025 IdeaFlow. Turn ideas into action.',
    OG_IMAGE_PATH: '/og-image.jpg',
    FAVICON_PATH: '/favicon.ico',
  },

  CONTACT: {
    SUPPORT_EMAIL: 'support@ideaflow.ai',
    TWITTER_HANDLE: '@ideaflowai',
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

    OPTIONAL: ['NODE_ENV', 'VERCEL', 'CF_WORKER', 'CLOUDFLARE'] as const,
  },

  HEALTH_STATUS: {
    HEALTHY: 'healthy',
    UNHEALTHY: 'unhealthy',
    WARNING: 'warning',
  } as const,

  /**
   * Pagination configuration
   * Centralizes pagination limits and offsets
   */
  PAGINATION: {
    /** Default number of items per page */
    DEFAULT_LIMIT: 50,
    /** Maximum allowed items per page */
    MAX_LIMIT: 100,
    /** Minimum allowed items per page */
    MIN_LIMIT: 10,
    /** Default offset for pagination */
    DEFAULT_OFFSET: 0,
  } as const,

  STRING_LIMITS: {
    TITLE_PREVIEW_LENGTH: 50,
    IDEA_ID_RANDOM_LENGTH: 11,
    IDEA_ID_RANDOM_RADIX: 36,
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
