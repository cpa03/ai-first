/**
 * Application Configuration
 * Centralizes all app metadata, branding, and constants
 */

export const APP_CONFIG = {
  NAME: 'IdeaFlow',
  VERSION: '1.0.0',
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
    DEFAULT_DESCRIPTION: 'Transform your ideas into structured projects with AI-powered planning, task breakdown, and export to your favorite tools.',
    KEYWORDS: ['project planning', 'AI', 'idea management', 'task breakdown', 'productivity'],
    AUTHORS: [{ name: 'IdeaFlow Team', url: 'https://ideaflow.ai' }],
    CREATOR: 'IdeaFlow Team',
    PUBLISHER: 'IdeaFlow',
    CATEGORY: 'Productivity',
  },
} as const;

export type AppConfig = typeof APP_CONFIG;
