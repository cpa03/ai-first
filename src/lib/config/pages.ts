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
  HERO_ANIMATION_DELAYS: {
    TITLE: '0ms',
    DESCRIPTION: '100ms',
    CTA: '200ms',
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
 * Login page content configuration
 * Eliminates hardcoded UI strings in login page
 */
export const LOGIN_PAGE_CONTENT = {
  HEADING: 'Sign in to your account',
  SUBHEADING: 'Welcome back! Please sign in to continue.',
  FORM: {
    EMAIL_LABEL: 'Email address',
    PASSWORD_LABEL: 'Password',
    PASSWORD_PLACEHOLDER: 'Enter your password',
    REMEMBER_ME: 'Remember me',
    FORGOT_PASSWORD: 'Forgot password?',
    SUBMIT_BUTTON: 'Sign in',
    SUBMIT_LOADING: 'Signing in...',
  },
  OAUTH: {
    SEPARATOR: 'Or continue with',
    GOOGLE: 'Google',
    GOOGLE_LOADING: 'Connecting...',
    GOOGLE_ARIA_LABEL: 'Sign in with Google',
    GOOGLE_LOADING_ARIA_LABEL: 'Connecting to Google...',
    GITHUB: 'GitHub',
    GITHUB_LOADING: 'Connecting...',
    GITHUB_ARIA_LABEL: 'Sign in with GitHub',
    GITHUB_LOADING_ARIA_LABEL: 'Connecting to GitHub...',
  },
  FOOTER: {
    NO_ACCOUNT: "Don't have an account?",
    SIGN_UP: 'Sign up',
  },
  ERRORS: {
    TITLE: 'Sign In Error',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    SIGN_IN_FAILED: 'Failed to sign in. Please try again.',
    OAUTH_FAILED_PREFIX: 'Failed to sign in with',
    OAUTH_FAILED_SUFFIX: '. Please try again.',
  },
  BUTTONS: {
    GO_BACK: 'Go Back',
  },
} as const;

/**
 * Signup page content configuration
 * Eliminates hardcoded UI strings in signup page
 */
export const SIGNUP_PAGE_CONTENT = {
  HEADING: 'Create your account',
  SUBHEADING: 'Get started with IdeaFlow today.',
  FORM: {
    EMAIL_LABEL: 'Email address',
    PASSWORD_LABEL: 'Password',
    PASSWORD_HELP_TEXT: 'Must be at least 8 characters',
    CONFIRM_PASSWORD_LABEL: 'Confirm Password',
    CONFIRM_PASSWORD_PLACEHOLDER: 'Confirm your password',
    SUBMIT_BUTTON: 'Create account',
    SUBMIT_LOADING: 'Creating account...',
  },
  OAUTH: {
    SEPARATOR: 'Or sign up with',
    GOOGLE: 'Google',
    GOOGLE_LOADING: 'Connecting...',
    GOOGLE_ARIA_LABEL: 'Sign up with Google',
    GOOGLE_LOADING_ARIA_LABEL: 'Connecting to Google...',
    GITHUB: 'GitHub',
    GITHUB_LOADING: 'Connecting...',
    GITHUB_ARIA_LABEL: 'Sign up with GitHub',
    GITHUB_LOADING_ARIA_LABEL: 'Connecting to GitHub...',
  },
  FOOTER: {
    HAS_ACCOUNT: 'Already have an account?',
    SIGN_IN: 'Sign in',
  },
  SUCCESS: {
    HEADING: 'Check your email',
    MESSAGE_PREFIX: "We've sent a confirmation link to",
    MESSAGE_SUFFIX:
      'Please check your email and click the link to verify your account.',
    RETURN_LINK: 'Return to sign in',
  },
  PASSWORD_MATCH: {
    MATCH: 'Passwords match',
    MISMATCH: 'Passwords do not match',
  },
  ERRORS: {
    TITLE: 'Sign Up Error',
    INVALID_EMAIL: 'Please enter a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
    CREATE_ACCOUNT_FAILED: 'Failed to create account',
    CREATE_ACCOUNT_FAILED_RETRY: 'Failed to create account. Please try again.',
    OAUTH_FAILED_PREFIX: 'Failed to sign up with',
    OAUTH_FAILED_SUFFIX: '. Please try again.',
  },
  BUTTONS: {
    GO_BACK: 'Go Back',
  },
} as const;

/**
 * Clarify page content configuration
 * Eliminates hardcoded UI strings in clarify page
 */
export const CLARIFY_PAGE_CONTENT = {
  HEADING: 'Clarify Your Idea',
  SUBHEADING:
    'Answer a few questions to help us create the perfect action plan for your project.',
  LOADING: 'Loading clarification flow...',
  LOADING_SHORT: 'Loading...',
  ERROR_TITLE: 'Error',
  SUCCESS_TITLE: 'Clarification Complete!',
  SUCCESS_MESSAGE:
    'Your answers have been collected. Ready to generate your blueprint?',
  AUTH_REQUIRED_TITLE: 'Sign In Required',
  AUTH_REQUIRED_MESSAGE: 'Please sign in to clarify your ideas.',
  NO_IDEA_TITLE: 'No Idea Provided',
  NO_IDEA_MESSAGE: 'Please provide an idea to clarify.',
  BUTTONS: {
    GO_BACK: 'Go Back',
    GO_HOME: 'Go Home',
    GO_TO_HOME: 'Go to Home',
    GENERATE_BLUEPRINT: 'Generate Blueprint',
  },
} as const;

/**
 * Results page content configuration
 * Eliminates hardcoded UI strings in results page
 */
export const RESULTS_PAGE_CONTENT = {
  HEADING: 'Project Blueprint',
  LOADING: 'Loading blueprint...',
  LOADING_SHORT: 'Loading...',
  GENERATING: 'Generating your project blueprint...',
  ERROR_TITLE: 'Error',
  SUCCESS_TITLE: 'Export Successful',
  SUCCESS_MESSAGE: 'The file should download automatically.',
  WARNING_TITLE: 'No Idea Found',
  WARNING_MESSAGE: "The idea you're looking for doesn't exist.",
  AUTH_REQUIRED_MESSAGE: 'Please sign in to view results',
  EXPORT_HEADING: 'Export Your Blueprint',
  SHARE_HEADING: 'Share Your Blueprint',
  SHARE_MESSAGE:
    'Love your project blueprint? Share it with your network to inspire others!',
  SHARE_BUTTON_LABEL: 'Share Blueprint',
  SHARE_BUTTON_SUCCESS_LABEL: 'Shared!',
  SETUP_REQUIRED_LABEL: 'Setup Required',
  BUTTONS: {
    GO_BACK: '← Back',
    GO_HOME: 'Go Home',
  },
  TOOLTIPS: {
    MARKDOWN: 'Best for documentation, README files, and sharing with teams',
    JSON: 'Best for importing into other tools and automation workflows',
    NOTION: 'Configure NOTION_API_KEY in environment to enable Notion export',
    TRELLO: 'Configure TRELLO_API_KEY in environment to enable Trello export',
    GOOGLE_TASKS:
      'Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment to enable Google Tasks export',
    GITHUB_PROJECTS:
      'Configure GITHUB_TOKEN in environment to enable GitHub Projects export',
  },
  ARIA_LABELS: {
    GO_BACK: 'Return to previous page',
    DOWNLOAD_MARKDOWN: 'Download project blueprint as Markdown file',
    EXPORT_JSON: 'Export project blueprint as JSON data',
    EXPORT_NOTION: 'Export project to Notion',
    EXPORT_NOTION_SETUP: 'Export to Notion - requires API configuration',
    EXPORT_TRELLO: 'Export project to Trello',
    EXPORT_TRELLO_SETUP: 'Export to Trello - requires API configuration',
    EXPORT_GOOGLE_TASKS: 'Export tasks to Google Tasks',
    EXPORT_GOOGLE_TASKS_SETUP:
      'Export to Google Tasks - requires API configuration',
    EXPORT_GITHUB_PROJECTS: 'Export tasks to GitHub Projects',
    EXPORT_GITHUB_PROJECTS_SETUP:
      'Export to GitHub Projects - requires API configuration',
  },
} as const;

/**
 * Dashboard page content configuration
 * Eliminates hardcoded UI strings in dashboard page
 */
export const DASHBOARD_PAGE_CONTENT = {
  HEADING: 'Your Ideas',
  LOADING: 'Loading your ideas...',
  ERROR_TITLE: 'Error',
  TRY_AGAIN: 'Try Again',
  CLEAR_FILTER: 'Clear Filter',
  RESTART_TOUR: 'Restart Tour',
  SHORTCUTS: 'Shortcuts',
  EMPTY_STATE: {
    TITLE: 'No ideas yet',
    DESCRIPTION:
      'Start by creating your first idea to get AI-powered project planning.',
    BUTTON: 'Create Your First Idea',
    NO_MATCHING_TITLE: 'No matching ideas',
    NO_MATCHING_DESCRIPTION:
      'No ideas match the {filter} filter. Try clearing the filter to see all your ideas.',
    CREATE_NEW_IDEA: 'Create New Idea',
  },
  TABLE: {
    TITLE_HEADER: 'Title',
    STATUS_HEADER: 'Status',
    CREATED_HEADER: 'Created',
    ACTIONS_HEADER: 'Actions',
  },
  FILTER: {
    LABEL: 'Filter by status',
    ALL: 'All',
    DRAFT: 'Draft',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
  },
  IDEA_COUNT: {
    SINGULAR: 'idea',
    PLURAL: 'ideas',
    TOTAL: 'total',
  },
  ACTIONS: {
    NEW_IDEA: '+ New Idea',
    VIEW: 'View',
    EDIT: 'Edit',
    DELETE: 'Delete',
  },
  DELETE_MODAL: {
    TITLE: 'Delete Idea',
    CONFIRM: 'Are you sure you want to delete this idea?',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    DELETING: 'Deleting...',
  },
  ERRORS: {
    FETCH_FAILED: 'Failed to fetch ideas',
    DELETE_FAILED: 'Failed to delete idea',
    SIGN_IN_REQUIRED: 'Please sign in to view your ideas',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
  ARIA_LABELS: {
    FILTER_STATUS: 'Filter ideas by status',
    CLEAR_FILTER: 'Clear filter',
    SHOW_KEYBOARD_SHORTCUTS: 'Show keyboard shortcuts (press ?)',
    RESTART_ONBOARDING: 'Restart the onboarding tour',
    HOW_IT_WORKS: 'How IdeaFlow works: three steps',
    IDEAS_LIST: 'List of your ideas',
    SITE_FOOTER: 'Site footer',
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
