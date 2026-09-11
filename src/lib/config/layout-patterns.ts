/**
 * Layout Patterns Configuration
 *
 * Centralizes all layout and positioning Tailwind patterns used throughout the codebase.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { LAYOUT_PATTERNS } from '@/lib/config/layout-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="flex items-center justify-center">
 *
 * // Use modular config:
 * <div className={LAYOUT_PATTERNS.FLEX_CENTER}>
 * ```
 */

/**
 * Layout main content styles
 * Used in: Layout.tsx
 */
export const MAIN_CONTENT = 'min-h-screen flex flex-col';

/**
 * Layout header styles
 * Used in: Layout.tsx
 */
export const HEADER = 'flex justify-between items-center h-16';

/**
 * Layout skip link target
 * Used in: Layout.tsx
 */
export const SKIP_LINK_TARGET = 'flex-1 focus:outline-none';

/**
 * Responsive width patterns
 * Used in: Auth callback buttons, ErrorBoundary buttons
 */
export const RESPONSIVE_WIDTH = 'w-full sm:w-auto';

/**
 * Responsive width with margin patterns
 * Used in: ErrorBoundary cancel button
 */
export const RESPONSIVE_WIDTH_WITH_MARGIN = 'w-full sm:w-auto ml-0 sm:ml-2';

/**
 * Absolute center patterns
 * Used in: TaskManagement loading overlay, StepCelebration
 */
export const ABSOLUTE_CENTER_OVERLAY =
  'absolute inset-0 flex items-center justify-center';

/**
 * Absolute center with flex-col patterns
 * Used in: StepCelebration
 */
export const ABSOLUTE_CENTER_FLEX_COL =
  'absolute inset-0 flex flex-col items-center justify-center';

/**
 * Responsive flex with justify-between and gap patterns
 * Used in: ReferralLink
 */
export const RESPONSIVE_FLEX_BETWEEN_GAP =
  'flex flex-col sm:flex-row sm:items-center justify-between gap-3';

/**
 * Flex with space-x patterns
 * Used in: MobileNav
 */
export const FLEX_SPACE_X = 'flex space-x-2 sm:space-x-4';

/**
 * Flex-1 with min-width patterns
 * Used in: TaskManagementSkeleton, DeliverableCard
 */
export const FLEX_1 = 'flex-1';

/**
 * Flex items-center (simple)
 * Used in: ErrorBoundary, layout.tsx, various components
 */
export const FLEX_ITEMS_CENTER = 'flex items-center';

/**
 * Text left alignment
 * Used in: Not found page
 */
export const TEXT_LEFT = 'text-left';

/**
 * Font medium text
 * Used in: Forgot password page
 */
export const FONT_MEDIUM = 'font-medium';

/**
 * Inline flex items-center
 * Used in: ClarificationFlow
 */
export const INLINE_FLEX_ITEMS_CENTER = 'inline-flex items-center';

/**
 * Centering container pattern
 * Used in: Auth callback page
 */
export const CENTER_INLINE_FLEX =
  'relative inline-flex items-center justify-center';

/**
 * Flex justify-center items-center
 * Used in: Results page loading
 */
export const FLEX_CENTER = 'flex justify-center items-center';

/**
 * Relative positioning
 * Used in: ClarificationFlow, TaskItem, ScrollToTop, SuccessCelebration, StepCelebration, Tooltip, IdeaInput, InputWithValidation, KeyboardShortcutsHelp
 */
export const RELATIVE = 'relative';

/**
 * Relative positioning with group hover
 * Used in: TaskItem, BlueprintDisplay
 */
export const RELATIVE_GROUP = 'relative group';

/**
 * Hidden on small screens
 * Used in: ProgressStepper
 */
export const HIDDEN_SM = 'sm:hidden';

/**
 * Pointer events none
 * Used in: InputWithValidation
 */
export const POINTER_EVENTS_NONE = 'pointer-events-none';

/**
 * Small horizontal margin
 * Used in: KeyboardShortcutsHelp
 */
export const MX_SMALL = 'mx-1.5';

/**
 * Margin top utility class
 * Used in: Dashboard page error state, various components
 */
export const MARGIN_TOP_4 = 'mt-4';

/**
 * Margin bottom utility class
 * Used in: Results page, various components
 */
export const MARGIN_BOTTOM_4 = 'mb-4';

/**
 * Justify center utility class
 * Used in: Login, Signup pages, various components
 */
export const JUSTIFY_CENTER = 'justify-center';

/**
 * Grid column span responsive pattern
 * Used in: Layout page footer
 */
export const GRID_COL_SPAN = 'col-span-2 md:col-span-1';

/**
 * Skip link styles
 * Used in: Layout page accessibility
 */
export const SKIP_LINK = 'skip-link';

/**
 * Common inline-flex patterns
 * Used in: ShareButton, CopyButton, EmailButton, ToastContainer
 */
export const INLINE_FLEX_RELATIVE = 'relative inline-flex';

/**
 * Common responsive flex patterns
 * Used across multiple components
 */
export const COMMON_FLEX_BETWEEN_RESPONSIVE =
  'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4';

/**
 * Common inline flex with gap patterns
 * Used across multiple components
 */
export const COMMON_INLINE_FLEX_GAP = 'flex items-center gap-2';

/**
 * Common inline flex with small gap patterns
 * Used across multiple components
 */
export const COMMON_INLINE_FLEX_GAP_SM = 'flex items-center gap-1.5';

/**
 * Combined layout patterns for easy access
 */
export const LAYOUT_PATTERNS = {
  /** Main content styles */
  MAIN_CONTENT,
  /** Header styles */
  HEADER,
  /** Skip link target */
  SKIP_LINK_TARGET,
  /** Responsive width */
  RESPONSIVE_WIDTH,
  /** Responsive width with margin */
  RESPONSIVE_WIDTH_WITH_MARGIN,
  /** Absolute center overlay */
  ABSOLUTE_CENTER_OVERLAY,
  /** Absolute center flex-col */
  ABSOLUTE_CENTER_FLEX_COL,
  /** Responsive flex between gap */
  RESPONSIVE_FLEX_BETWEEN_GAP,
  /** Flex space-x */
  FLEX_SPACE_X,
  /** Flex-1 */
  FLEX_1,
  /** Flex items-center */
  FLEX_ITEMS_CENTER,
  /** Text left alignment */
  TEXT_LEFT,
  /** Font medium */
  FONT_MEDIUM,
  /** Inline flex items-center */
  INLINE_FLEX_ITEMS_CENTER,
  /** Center inline flex */
  CENTER_INLINE_FLEX,
  /** Flex center */
  FLEX_CENTER,
  /** Relative positioning */
  RELATIVE,
  /** Relative group */
  RELATIVE_GROUP,
  /** Hidden on small screens */
  HIDDEN_SM,
  /** Pointer events none */
  POINTER_EVENTS_NONE,
  /** Small horizontal margin */
  MX_SMALL,
  /** Margin top 4 */
  MARGIN_TOP_4,
  /** Margin bottom 4 */
  MARGIN_BOTTOM_4,
  /** Justify center */
  JUSTIFY_CENTER,
  /** Grid column span */
  GRID_COL_SPAN,
  /** Skip link */
  SKIP_LINK,
  /** Inline flex relative */
  INLINE_FLEX_RELATIVE,
  /** Common flex between responsive */
  COMMON_FLEX_BETWEEN_RESPONSIVE,
  /** Common inline flex gap */
  COMMON_INLINE_FLEX_GAP,
  /** Common inline flex gap small */
  COMMON_INLINE_FLEX_GAP_SM,
} as const;
