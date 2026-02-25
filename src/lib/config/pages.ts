/**
 * Page Metadata Configuration
 * Centralizes page-specific metadata for Next.js layouts
 * Eliminates hardcoded URLs and metadata in layout files
 */

import { APP_CONFIG } from './app';

/**
 * Results page metadata configuration
 */
export const RESULTS_PAGE_CONFIG = {
  METADATA: {
    title: 'Project Results & Blueprints - Your Action Plans | IdeaFlow',
    description:
      'View and download your AI-generated project blueprints, timelines, and task lists. Export to GitHub, Notion, and other project management tools.',
    keywords: [
      'project blueprints',
      'action plans',
      'task management',
      'project results',
      'AI-generated plans',
    ],
    openGraph: {
      title: 'Project Results & Blueprints - Your Action Plans | IdeaFlow',
      description:
        'View and download your AI-generated project blueprints, timelines, and task lists.',
      url: `${APP_CONFIG.URLS.BASE}/results`,
    },
  },
} as const;

/**
 * Clarify page metadata configuration
 */
export const CLARIFY_PAGE_CONFIG = {
  METADATA: {
    title: 'AI Idea Clarification - Refine Your Concepts | IdeaFlow',
    description:
      'Let our AI ask the right questions to clarify and refine your project ideas. Get detailed requirements and scope definition for better planning.',
    keywords: [
      'AI idea clarification',
      'project requirements',
      'scope definition',
      'concept refinement',
      'project planning',
    ],
    openGraph: {
      title: 'AI Idea Clarification - Refine Your Concepts | IdeaFlow',
      description:
        'Let our AI ask the right questions to clarify and refine your project ideas.',
      url: `${APP_CONFIG.URLS.BASE}/clarify`,
    },
  },
} as const;

/**
 * Dashboard page metadata configuration
 */
export const DASHBOARD_PAGE_CONFIG = {
  METADATA: {
    title: `Dashboard - Your Ideas | ${APP_CONFIG.NAME}`,
    description:
      'Manage and track all your project ideas. View progress, export plans, and organize your workflow.',
    keywords: [
      'dashboard',
      'project ideas',
      'idea management',
      'project tracking',
      'workflow',
    ],
    openGraph: {
      title: `Dashboard - Your Ideas | ${APP_CONFIG.NAME}`,
      description: 'Manage and track all your project ideas in one place.',
      url: `${APP_CONFIG.URLS.BASE}/dashboard`,
    },
  },
} as const;

/**
 * Home page metadata configuration
 */
export const HOME_PAGE_CONFIG = {
  METADATA: {
    title: APP_CONFIG.META.TITLE,
    description: APP_CONFIG.META.DEFAULT_DESCRIPTION,
    keywords: APP_CONFIG.META.KEYWORDS,
    openGraph: {
      title: APP_CONFIG.META.TITLE,
      description: APP_CONFIG.META.DEFAULT_DESCRIPTION,
      url: APP_CONFIG.URLS.BASE,
    },
  },
} as const;

/**
 * All page configurations exported as a single object
 */
export const PAGE_CONFIG = {
  HOME: HOME_PAGE_CONFIG,
  RESULTS: RESULTS_PAGE_CONFIG,
  CLARIFY: CLARIFY_PAGE_CONFIG,
  DASHBOARD: DASHBOARD_PAGE_CONFIG,
} as const;

export type PageConfig = typeof PAGE_CONFIG;
export type ResultsPageConfig = typeof RESULTS_PAGE_CONFIG;
export type ClarifyPageConfig = typeof CLARIFY_PAGE_CONFIG;
export type DashboardPageConfig = typeof DASHBOARD_PAGE_CONFIG;
export type HomePageConfig = typeof HOME_PAGE_CONFIG;
