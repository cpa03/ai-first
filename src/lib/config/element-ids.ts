/**
 * Element IDs Configuration
 *
 * Follows the "Flexy" principle: eliminate hardcoded element IDs and
 * make them modular and configurable.
 *
 * Centralizes all HTML element `id` and `aria-labelledby` values used
 * throughout components. This ensures ARIA relationships stay in sync
 * when IDs change and eliminates magic strings scattered across files.
 *
 * Usage:
 * ```typescript
 * import { PAGE_ELEMENT_IDS, ARIA_HEADING_IDS } from '@/lib/config';
 *
 * <section aria-labelledby={ARIA_HEADING_IDS.HERO}>
 *   <h1 id={PAGE_ELEMENT_IDS.HERO_HEADING}>...</h1>
 * </section>
 * ```
 */

/**
 * Page-level element IDs
 * Used for main page structure and navigation
 */
export const PAGE_ELEMENT_IDS = {
  /** Main content landmark ID */
  MAIN_CONTENT: 'main-content',

  /** Mobile navigation menu ID */
  MOBILE_MENU: 'mobile-menu',
} as const;

/**
 * Home page element IDs
 * IDs for the hero, idea input, and confirmation sections
 */
export const HOME_PAGE_ELEMENT_IDS = {
  /** Hero section heading ID */
  HERO_HEADING: 'hero-heading',

  /** Idea input heading ID */
  IDEA_INPUT_HEADING: 'idea-input-heading',

  /** Idea confirmation heading ID */
  IDEA_CONFIRMATION_HEADING: 'idea-confirmation-heading',

  /** How it works section heading ID */
  HOW_IT_WORKS_HEADING: 'how-it-works-heading',

  /** Why choose section heading ID */
  WHY_CHOOSE_HEADING: 'why-choose-heading',
} as const;

/**
 * Clarification flow element IDs
 * IDs for question, answer, and progress elements
 */
export const CLARIFICATION_ELEMENT_IDS = {
  /** Question heading ID */
  QUESTION_HEADING: 'question-heading',

  /** Question description ID (sr-only) */
  QUESTION_DESCRIPTION: 'question-description',

  /** Answer textarea ID */
  ANSWER_TEXTAREA: 'answer-textarea',

  /** Answer text input ID */
  ANSWER_TEXT: 'answer-text',

  /** Answer select ID */
  ANSWER_SELECT: 'answer-select',
} as const;

/**
 * Idea input element IDs
 */
export const IDEA_INPUT_ELEMENT_IDS = {
  /** Idea input field ID */
  IDEA_INPUT: 'idea-input',
} as const;

/**
 * Blueprint display element IDs
 */
export const BLUEPRINT_ELEMENT_IDS = {
  /** Skeleton heading ID */
  SKELETON_HEADING: 'skeleton-heading',

  /** Blueprint heading ID */
  BLUEPRINT_HEADING: 'blueprint-heading',
} as const;

/**
 * Dashboard element IDs
 * IDs for filters, modals, and confirmation dialogs
 */
export const DASHBOARD_ELEMENT_IDS = {
  /** Status filter select ID */
  STATUS_FILTER: 'status-filter',

  /** Delete modal title ID */
  DELETE_MODAL_TITLE: 'delete-modal-title',

  /** Delete modal description ID */
  DELETE_MODAL_DESCRIPTION: 'delete-modal-description',

  /** Delete confirm input ID */
  DELETE_CONFIRM_INPUT: 'delete-confirm-input',

  /** Delete confirm hint ID */
  DELETE_CONFIRM_HINT: 'delete-confirm-hint',
} as const;

/**
 * Auth form element IDs
 */
export const AUTH_ELEMENT_IDS = {
  /** Login form ID */
  LOGIN_FORM: 'login-form',

  /** Remember me checkbox ID */
  REMEMBER_ME: 'remember-me',

  /** Signup form ID */
  SIGNUP_FORM: 'signup-form',

  /** Forgot password form ID */
  FORGOT_PASSWORD_FORM: 'forgot-password-form',

  /** Email input field ID (used across login, signup, forgot-password) */
  EMAIL: 'email',

  /** Password input field ID (used across login, signup) */
  PASSWORD: 'password',

  /** Confirm password input field ID (signup only) */
  CONFIRM_PASSWORD: 'confirmPassword',

  /** Auth callback content container ID */
  AUTH_CONTENT: 'auth-content',
} as const;

/**
 * Error/Not Found element IDs
 */
export const ERROR_ELEMENT_IDS = {
  /** Error title ID */
  ERROR_TITLE: 'error-title',

  /** Error content ID */
  ERROR_CONTENT: 'error-content',
} as const;

/**
 * Keyboard shortcuts help element IDs
 */
export const KEYBOARD_SHORTCUTS_ELEMENT_IDS = {
  /** Keyboard shortcuts title ID */
  TITLE: 'keyboard-shortcuts-title',

  /** Filter shortcuts by category aria-label */
  FILTER_LABEL: 'Filter shortcuts by category',
} as const;

/**
 * User onboarding element IDs
 */
export const ONBOARDING_ELEMENT_IDS = {
  /** Onboarding title ID */
  ONBOARDING_TITLE: 'onboarding-title',

  /** Onboarding content ID */
  ONBOARDING_CONTENT: 'onboarding-content',
} as const;

/**
 * Not Found page element IDs
 */
export const NOT_FOUND_ELEMENT_IDS = {
  /** Popular pages heading ID */
  POPULAR_PAGES_HEADING: 'popular-pages-heading',
} as const;

/**
 * Results page element IDs
 */
export const RESULTS_ELEMENT_IDS = {
  /** Blueprint section container ID */
  BLUEPRINT_SECTION: 'blueprint-section',

  /** Tasks section container ID */
  TASKS_SECTION: 'tasks-section',

  /** Exports section container ID */
  EXPORTS_SECTION: 'exports-section',

  /** Start new idea CTA button ID */
  START_NEW_IDEA_CTA: 'start-new-idea-cta',
} as const;

/**
 * All aria-labelledby heading IDs used in components.
 * Maps logical names to their HTML id attribute values.
 *
 * Use this to maintain ARIA label relationships:
 * ```tsx
 * <section aria-labelledby={ARIA_HEADING_IDS.HERO}>
 *   <h1 id={HOME_PAGE_ELEMENT_IDS.HERO_HEADING}>...</h1>
 * </section>
 * ```
 */
export const ARIA_HEADING_IDS = {
  /** Home page: Hero section */
  HERO: HOME_PAGE_ELEMENT_IDS.HERO_HEADING,

  /** Home page: Idea input section */
  IDEA_INPUT: HOME_PAGE_ELEMENT_IDS.IDEA_INPUT_HEADING,

  /** Home page: Idea confirmation section */
  IDEA_CONFIRMATION: HOME_PAGE_ELEMENT_IDS.IDEA_CONFIRMATION_HEADING,

  /** Home page: How it works section */
  HOW_IT_WORKS: HOME_PAGE_ELEMENT_IDS.HOW_IT_WORKS_HEADING,

  /** Home page: Why choose section */
  WHY_CHOOSE: HOME_PAGE_ELEMENT_IDS.WHY_CHOOSE_HEADING,

  /** Clarification flow: Question section */
  QUESTION: CLARIFICATION_ELEMENT_IDS.QUESTION_HEADING,

  /** Blueprint: Skeleton loading */
  SKELETON: BLUEPRINT_ELEMENT_IDS.SKELETON_HEADING,

  /** Blueprint: Main heading */
  BLUEPRINT: BLUEPRINT_ELEMENT_IDS.BLUEPRINT_HEADING,

  /** Keyboard shortcuts dialog */
  KEYBOARD_SHORTCUTS: KEYBOARD_SHORTCUTS_ELEMENT_IDS.TITLE,

  /** Error boundary */
  ERROR: ERROR_ELEMENT_IDS.ERROR_TITLE,

  /** Dashboard: Delete confirmation modal */
  DELETE_MODAL: DASHBOARD_ELEMENT_IDS.DELETE_MODAL_TITLE,

  /** User onboarding dialog */
  ONBOARDING: ONBOARDING_ELEMENT_IDS.ONBOARDING_TITLE,
} as const;

/**
 * ARIA selector strings for targeting elements by aria-labelledby
 * Used in user onboarding tour and other component targeting
 */
export const ARIA_SELECTORS = {
  /** Target the idea input section */
  IDEA_INPUT_SECTION: `[aria-labelledby="${HOME_PAGE_ELEMENT_IDS.IDEA_INPUT_HEADING}"]`,

  /** Target the how it works section */
  HOW_IT_WORKS_SECTION: `[aria-labelledby="${HOME_PAGE_ELEMENT_IDS.HOW_IT_WORKS_HEADING}"]`,

  /** Target the share button */
  SHARE_BUTTON: '[aria-label*="Share IdeaFlow"]',
} as const;

/**
 * Combined element IDs export for convenience
 */
export const ALL_ELEMENT_IDS = {
  PAGE: PAGE_ELEMENT_IDS,
  HOME: HOME_PAGE_ELEMENT_IDS,
  CLARIFICATION: CLARIFICATION_ELEMENT_IDS,
  IDEA_INPUT: IDEA_INPUT_ELEMENT_IDS,
  BLUEPRINT: BLUEPRINT_ELEMENT_IDS,
  DASHBOARD: DASHBOARD_ELEMENT_IDS,
  AUTH: AUTH_ELEMENT_IDS,
  ERROR: ERROR_ELEMENT_IDS,
  KEYBOARD_SHORTCUTS: KEYBOARD_SHORTCUTS_ELEMENT_IDS,
  ONBOARDING: ONBOARDING_ELEMENT_IDS,
  NOT_FOUND: NOT_FOUND_ELEMENT_IDS,
  RESULTS: RESULTS_ELEMENT_IDS,
  ARIA_HEADING: ARIA_HEADING_IDS,
  ARIA_SELECTORS,
} as const;

// Type exports
export type PageElementIds = typeof PAGE_ELEMENT_IDS;
export type HomePageElementIds = typeof HOME_PAGE_ELEMENT_IDS;
export type ClarificationElementIds = typeof CLARIFICATION_ELEMENT_IDS;
export type IdeaInputElementIds = typeof IDEA_INPUT_ELEMENT_IDS;
export type BlueprintElementIds = typeof BLUEPRINT_ELEMENT_IDS;
export type DashboardElementIds = typeof DASHBOARD_ELEMENT_IDS;
export type AuthElementIds = typeof AUTH_ELEMENT_IDS;
export type ErrorElementIds = typeof ERROR_ELEMENT_IDS;
export type KeyboardShortcutsElementIds = typeof KEYBOARD_SHORTCUTS_ELEMENT_IDS;
export type OnboardingElementIds = typeof ONBOARDING_ELEMENT_IDS;
export type NotFoundElementIds = typeof NOT_FOUND_ELEMENT_IDS;
export type ResultsElementIds = typeof RESULTS_ELEMENT_IDS;
export type AriaHeadingIds = typeof ARIA_HEADING_IDS;
export type AriaSelectors = typeof ARIA_SELECTORS;
