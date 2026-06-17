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
  HERO: {
    TITLE: 'AI-Powered Project Planning & Task Management',
    DESCRIPTION:
      'Transform raw ideas into actionable project plans with AI. Get automated task breakdown, realistic timelines, and comprehensive roadmaps in minutes.',
  },
  SHARE: {
    TITLE: 'IdeaFlow - Turn Ideas into Action',
    TEXT: 'Transform your ideas into structured projects with AI-powered planning, task breakdown, and export to your favorite tools.',
    LABEL: 'Share IdeaFlow',
    ARIA_LABEL: 'Share IdeaFlow with friends',
  },
  CONFIRMATION: {
    LABEL: 'Your Idea:',
    SAVED_WITH_ID: 'Saved with ID:',
    REDIRECTING: 'Redirecting to clarification...',
  },
} as const;

/**
 * Login page metadata configuration
 */
export const LOGIN_PAGE_CONFIG = {
  METADATA: {
    title: `Login | ${APP_CONFIG.NAME}`,
    description:
      'Sign in to your IdeaFlow account to continue turning your ideas into actionable projects.',
    keywords: [
      'login',
      'sign in',
      'account access',
      'IdeaFlow login',
      'authentication',
    ],
    openGraph: {
      title: `Login | ${APP_CONFIG.NAME}`,
      description:
        'Sign in to your IdeaFlow account to continue turning your ideas into actionable projects.',
      url: `${APP_CONFIG.URLS.BASE}/login`,
    },
  },
} as const;

/**
 * Signup page metadata configuration
 */
export const SIGNUP_PAGE_CONFIG = {
  METADATA: {
    title: `Sign Up | ${APP_CONFIG.NAME}`,
    description:
      'Create your IdeaFlow account and start transforming your ideas into actionable projects with AI-powered planning.',
    keywords: [
      'sign up',
      'create account',
      'register',
      'IdeaFlow signup',
      'new account',
    ],
    openGraph: {
      title: `Sign Up | ${APP_CONFIG.NAME}`,
      description:
        'Create your IdeaFlow account and start transforming your ideas into actionable projects with AI-powered planning.',
      url: `${APP_CONFIG.URLS.BASE}/signup`,
    },
  },
} as const;

/**
 * Auth callback page metadata configuration
 */
export const AUTH_CALLBACK_PAGE_CONFIG = {
  METADATA: {
    title: `Authenticating | ${APP_CONFIG.NAME}`,
    description: 'Please wait while we complete your authentication.',
    keywords: ['authentication', 'oauth', 'callback', 'sign in'],
    openGraph: {
      title: `Authenticating | ${APP_CONFIG.NAME}`,
      description: 'Please wait while we complete your authentication.',
      url: `${APP_CONFIG.URLS.BASE}/auth/callback`,
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
  LOGIN: LOGIN_PAGE_CONFIG,
  SIGNUP: SIGNUP_PAGE_CONFIG,
  AUTH_CALLBACK: AUTH_CALLBACK_PAGE_CONFIG,
} as const;

export type PageConfig = typeof PAGE_CONFIG;
export type ResultsPageConfig = typeof RESULTS_PAGE_CONFIG;
export type ClarifyPageConfig = typeof CLARIFY_PAGE_CONFIG;
export type DashboardPageConfig = typeof DASHBOARD_PAGE_CONFIG;
export type HomePageConfig = typeof HOME_PAGE_CONFIG;
export type LoginPageConfig = typeof LOGIN_PAGE_CONFIG;
export type SignupPageConfig = typeof SIGNUP_PAGE_CONFIG;
export type AuthCallbackPageConfig = typeof AUTH_CALLBACK_PAGE_CONFIG;
