/**
 * Page Patterns Configuration
 *
 * Centralizes hardcoded Tailwind classes used in page components.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { HOMEPAGE_PATTERNS, NOT_FOUND_PATTERNS, FORGOT_PASSWORD_PATTERNS } from '@/lib/config/page-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="grid md:grid-cols-3 gap-8">
 *
 * // Use modular config:
 * <div className={HOMEPAGE_PATTERNS.FEATURE_GRID}>
 * ```
 */

/**
 * Homepage-specific patterns
 * Used in: HomePageClient.tsx
 */
export const HOMEPAGE_PATTERNS = {
  /** Grid layout for feature cards */
  FEATURE_GRID: 'grid md:grid-cols-3 gap-8',

  /** Feature card container */
  FEATURE_CARD:
    'text-center p-6 rounded-xl bg-white border border-gray-200 flex flex-col items-center justify-center',

  /** Feature card circle skeleton */
  FEATURE_CARD_CIRCLE: 'mx-auto mb-4',

  /** Feature card title skeleton */
  FEATURE_CARD_TITLE: 'mx-auto mb-2 w-3/4',

  /** Feature card description skeleton */
  FEATURE_CARD_DESC: 'mx-auto w-full',

  /** Why choose section container */
  WHY_CHOOSE_CONTAINER: 'rounded-lg p-8',

  /** Why choose item card */
  WHY_CHOOSE_CARD:
    'flex items-start p-4 rounded-lg bg-white border border-gray-200',

  /** Why choose item title skeleton */
  WHY_CHOOSE_ITEM_TITLE: 'mb-2 w-1/2',

  /** Why choose item description skeleton */
  WHY_CHOOSE_ITEM_DESC: 'w-3/4',

  /** Hero heading text */
  HERO_HEADING: 'text-4xl font-bold mb-4',

  /** Hero description text */
  HERO_DESCRIPTION: 'text-xl max-w-2xl mx-auto',

  /** Idea confirmation section */
  IDEA_CONFIRMATION: 'mt-8 rounded-lg p-6',

  /** Idea confirmation heading */
  IDEA_CONFIRMATION_HEADING: 'text-lg font-semibold mb-2',

  /** Idea confirmation ID code */
  IDEA_CONFIRMATION_CODE: 'px-1.5 py-0.5 rounded font-mono text-xs',

  /** Idea confirmation text */
  IDEA_CONFIRMATION_TEXT: 'text-sm mt-3',
} as const;

/**
 * Not Found page-specific patterns
 * Used in: not-found.tsx
 */
export const NOT_FOUND_PATTERNS = {
  /** 404 container */
  CONTAINER: 'mb-6',

  /** 404 icon container */
  ICON_CONTAINER: 'inline-flex items-center justify-center rounded-full',

  /** 404 number text */
  NUMBER_TEXT: 'text-4xl font-bold select-none',

  /** Page heading */
  HEADING: 'text-2xl font-bold mb-2',

  /** Page description */
  DESCRIPTION: 'mb-8 max-w-sm mx-auto',

  /** Button group */
  BUTTON_GROUP: 'flex flex-col sm:flex-row gap-3 justify-center',

  /** Button inline */
  BUTTON_INLINE: 'inline-flex items-center justify-center gap-2',

  /** Button inline full width */
  BUTTON_INLINE_FULL: 'inline-flex items-center justify-center gap-2 w-full',

  /** Copy section */
  COPY_SECTION: 'flex flex-col sm:flex-row items-center justify-center gap-3',

  /** Keyboard shortcuts section */
  SHORTCUTS_SECTION: 'flex items-center justify-center gap-4 text-xs',

  /** Popular pages section */
  POPULAR_SECTION: 'mt-8 pt-6 border-t',

  /** Popular pages grid */
  POPULAR_GRID: 'grid grid-cols-1 sm:grid-cols-3 gap-3',

  /** Popular page item */
  POPULAR_ITEM: 'group flex items-center gap-3 p-3 rounded-lg border',

  /** Popular page icon */
  POPULAR_ICON:
    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',

  /** Copy URL hint */
  COPY_HINT: 'text-xs hidden sm:inline-flex items-center gap-1.5',

  /** Actions container */
  ACTIONS: 'flex flex-col sm:flex-row gap-3 justify-center',
} as const;

/**
 * Forgot Password page-specific patterns
 * Used in: forgot-password/page.tsx
 */
export const FORGOT_PASSWORD_PATTERNS = {
  /** Form container */
  FORM_CONTAINER: 'relative w-full',

  /** Success icon container */
  SUCCESS_ICON: 'mx-auto flex items-center justify-center rounded-full',

  /** Success heading */
  SUCCESS_HEADING: 'text-center',

  /** Success text */
  SUCCESS_TEXT: 'text-sm',

  /** Success small text */
  SUCCESS_SMALL_TEXT: 'text-xs',

  /** Success email highlight */
  SUCCESS_EMAIL: 'font-medium',

  /** Success resend text */
  SUCCESS_RESEND: 'text-sm',

  /** Form overlay */
  FORM_OVERLAY: 'relative',

  /** Form link */
  FORM_LINK: 'text-sm',
} as const;

/**
 * Common page patterns
 * Used across multiple pages
 */
export const COMMON_PAGE_PATTERNS = {
  /** Centered container */
  CENTERED: 'mx-auto',

  /** Full width container */
  FULL_WIDTH: 'w-full',

  /** Responsive flex */
  RESPONSIVE_FLEX: 'flex flex-col sm:flex-row',

  /** Responsive flex with gap */
  RESPONSIVE_FLEX_GAP: 'flex flex-col sm:flex-row gap-3',

  /** Centered text */
  CENTERED_TEXT: 'text-center',

  /** Skip link */
  SKIP_LINK: 'skip-link',
} as const;

/**
 * Combined page patterns object for easy access
 */
export const PAGE_PATTERNS = {
  HOMEPAGE: HOMEPAGE_PATTERNS,
  NOT_FOUND: NOT_FOUND_PATTERNS,
  FORGOT_PASSWORD: FORGOT_PASSWORD_PATTERNS,
  COMMON: COMMON_PAGE_PATTERNS,
} as const;
