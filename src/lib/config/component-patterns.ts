/**
 * Component Patterns Configuration
 *
 * Centralizes all component-specific Tailwind patterns used throughout the codebase.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { COMPONENT_PATTERNS } from '@/lib/config/component-patterns';
 *
 * // Instead of hardcoded className:
 * <button className="opacity-0 group-hover:opacity-100 transition-opacity">
 *
 * // Use modular config:
 * <button className={COMPONENT_PATTERNS.COPY_BUTTON_HOVER_OPACITY}>
 * ```
 */

/**
 * Copy button hover opacity styles
 * Used in: Dashboard, BlueprintDisplay, TaskItem
 */
export const COPY_BUTTON_HOVER_OPACITY =
  'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity';

/**
 * Loading spinner small size
 * Used in: Dashboard, Button, TaskItem
 */
export const SPINNER_SMALL = 'animate-spin h-3 w-3';

/**
 * Disabled state opacity classes
 * Used in: Button, TaskItem, LoadingSpinner
 */
export const DISABLED_OPACITY = {
  /** opacity-25 - for disabled icons */
  LIGHT: 'opacity-25',
  /** opacity-75 - for disabled content */
  MEDIUM: 'opacity-75',
} as const;

/**
 * Loading spinner ripple border
 * Used in: LoadingSpinner
 */
export const SPINNER_BORDER_RING =
  'absolute rounded-full border border-primary-200/60';

/**
 * Loading spinner SVG container
 * Used in: LoadingSpinner
 */
export const SPINNER_SVG_CONTAINER = 'relative z-10 rounded-full';

/**
 * Loading spinner circle opacity
 * Used in: LoadingSpinner
 */
export const SPINNER_CIRCLE_OPACITY = 'opacity-30';

/**
 * Loading spinner path opacity for reduced motion
 * Used in: LoadingSpinner
 */
export const SPINNER_PATH_REDUCED_MOTION = 'opacity-100';

/**
 * Loading spinner path opacity for normal motion
 * Used in: LoadingSpinner
 */
export const SPINNER_PATH_NORMAL_MOTION = 'opacity-75';

/**
 * Loading spinner elapsed time text style
 * Used in: LoadingSpinner.tsx elapsed time display
 */
export const LOADING_SPINNER_ELAPSED_TEXT = 'text-xs text-gray-400 font-mono';

/**
 * Password visible state background tint
 * Used in: InputWithValidation.tsx when password is toggled visible
 * Provides subtle amber feedback that password text is exposed
 */
export const PASSWORD_VISIBLE_TINT = 'bg-amber-50/50 border-amber-300/60';

/**
 * Valid checkmark icon color
 * Used in: InputWithValidation.tsx success checkmark SVG
 */
export const VALID_CHECKMARK_COLOR = 'text-green-800';

/**
 * Progress bar fill colors based on completion percentage
 * Used in: DeliverableCard.tsx inlineProgressFillClasses
 */
export const PROGRESS_BAR_COLORS = {
  /** bg-green-500 - 100% complete */
  COMPLETE: 'bg-green-500',
  /** bg-blue-500 - 75-99% */
  HIGH: 'bg-blue-500',
  /** bg-blue-400 - 50-74% */
  MEDIUM: 'bg-blue-400',
  /** bg-blue-300 - 1-49% */
  LOW: 'bg-blue-300',
  /** bg-gray-300 - 0% (empty) */
  EMPTY: 'bg-gray-300',
} as const;

/**
 * Tabular nums with font-medium patterns
 * Used in: Dashboard page
 */
export const TABULAR_NUMS_MEDIUM = 'tabular-nums font-medium';

/**
 * Skeleton sizing patterns
 * Used in: TaskManagementSkeleton
 */
export const SKELETON_FULL_THIRD = 'h-full w-1/3';

/**
 * Combined component patterns for easy access
 */
export const COMPONENT_PATTERNS = {
  /** Copy button hover opacity */
  COPY_BUTTON_HOVER_OPACITY,
  /** Loading spinner small */
  SPINNER_SMALL,
  /** Disabled opacity */
  DISABLED_OPACITY,
  /** Spinner border ring */
  SPINNER_BORDER_RING,
  /** Spinner SVG container */
  SPINNER_SVG_CONTAINER,
  /** Spinner circle opacity */
  SPINNER_CIRCLE_OPACITY,
  /** Spinner path reduced motion */
  SPINNER_PATH_REDUCED_MOTION,
  /** Spinner path normal motion */
  SPINNER_PATH_NORMAL_MOTION,
  /** Loading spinner elapsed text */
  LOADING_SPINNER_ELAPSED_TEXT,
  /** Password visible tint */
  PASSWORD_VISIBLE_TINT,
  /** Valid checkmark color */
  VALID_CHECKMARK_COLOR,
  /** Progress bar colors */
  PROGRESS_BAR_COLORS,
  /** Tabular nums medium */
  TABULAR_NUMS_MEDIUM,
  /** Skeleton full third */
  SKELETON_FULL_THIRD,
} as const;
