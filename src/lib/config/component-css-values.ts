/**
 * Component CSS Values Configuration
 *
 * Centralizes all hardcoded CSS values used in React components.
 * This follows the "Flexy" principle: eliminate hardcoded values and make
 * modular systems.
 *
 * Usage:
 * ```typescript
 * import { COMPONENT_CSS_VALUES } from '@/lib/config/component-css-values';
 *
 * // Instead of hardcoded className:
 * // <div className="w-24 h-24 rounded-full bg-gray-100">
 * <div className={`${COMPONENT_CSS_VALUES.CIRCLE.XL} bg-gray-100`}>
 * ```
 */

/**
 * Common CSS class patterns for circles
 */
export const CIRCLE_CLASSES = {
  /** Small circle: w-8 h-8 rounded-full */
  SM: 'w-8 h-8 rounded-full',
  /** Medium circle: w-12 h-12 rounded-full */
  MD: 'w-12 h-12 rounded-full',
  /** Large circle: w-16 h-16 rounded-full */
  LG: 'w-16 h-16 rounded-full',
  /** Extra large circle: w-24 h-24 rounded-full */
  XL: 'w-24 h-24 rounded-full',
} as const;

/**
 * Common CSS class patterns for cards
 */
export const CARD_CLASSES = {
  /** Default card pattern */
  DEFAULT: 'bg-white rounded-lg shadow-md',
  /** Card with hover effect */
  HOVER: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow',
  /** Card with border */
  BORDER: 'bg-white rounded-lg border border-gray-200',
  /** Card with padding */
  PADDED: 'bg-white rounded-lg shadow-md p-6',
} as const;

/**
 * Common CSS class patterns for containers
 */
export const CONTAINER_CLASSES = {
  /** Default container */
  DEFAULT: 'container mx-auto px-4',
  /** Container with max width */
  MAX_WIDTH: 'max-w-4xl mx-auto px-4',
  /** Container for content */
  CONTENT: 'max-w-2xl mx-auto px-4',
  /** Full width container */
  FULL_WIDTH: 'w-full px-4',
} as const;

/**
 * Common CSS class patterns for flex layouts
 */
export const FLEX_CLASSES = {
  /** Default flex layout */
  DEFAULT: 'flex items-center',
  /** Flex with gap */
  GAP: 'flex items-center gap-2',
  /** Flex column layout */
  COLUMN: 'flex flex-col',
  /** Flex with justify */
  JUSTIFY: 'flex items-center justify-center',
  /** Flex with wrap */
  WRAP: 'flex flex-wrap items-center',
  /** Flex with spacing */
  SPACING: 'flex items-center gap-4',
} as const;

/**
 * Common CSS class patterns for text styles
 */
export const TEXT_CLASSES = {
  /** Heading styles */
  HEADING: 'text-2xl font-bold text-gray-900',
  /** Subheading styles */
  SUBHEADING: 'text-lg font-semibold text-gray-800',
  /** Body text styles */
  BODY: 'text-base text-gray-600',
  /** Small text styles */
  SMALL: 'text-sm text-gray-500',
  /** Caption styles */
  CAPTION: 'text-xs text-gray-400',
} as const;

/**
 * Common CSS class patterns for buttons
 */
export const BUTTON_CLASSES = {
  /** Primary button */
  PRIMARY:
    'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors',
  /** Secondary button */
  SECONDARY:
    'bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors',
  /** Outline button */
  OUTLINE:
    'border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors',
  /** Ghost button */
  GHOST:
    'text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors',
} as const;

/**
 * Common CSS class patterns for form elements
 */
export const FORM_CLASSES = {
  /** Input field */
  INPUT:
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
  /** Label */
  LABEL: 'block text-sm font-medium text-gray-700 mb-1',
  /** Error message */
  ERROR: 'text-sm text-red-600 mt-1',
  /** Helper text */
  HELPER: 'text-sm text-gray-500 mt-1',
} as const;

/**
 * Common CSS class patterns for loading states
 */
export const LOADING_CLASSES = {
  /** Spinner container */
  SPINNER_CONTAINER: 'flex items-center justify-center',
  /** Pulse animation */
  PULSE: 'animate-pulse bg-gray-200 rounded',
  /** Skeleton loading */
  SKELETON: 'animate-pulse bg-gray-200 rounded h-4',
} as const;

/**
 * Combined CSS values for components
 */
export const COMPONENT_CSS_VALUES = {
  CIRCLE: CIRCLE_CLASSES,
  CARD: CARD_CLASSES,
  CONTAINER: CONTAINER_CLASSES,
  FLEX: FLEX_CLASSES,
  TEXT: TEXT_CLASSES,
  BUTTON: BUTTON_CLASSES,
  FORM: FORM_CLASSES,
  LOADING: LOADING_CLASSES,
} as const;
