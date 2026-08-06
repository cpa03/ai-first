/**
 * Dot Indicators Configuration
 *
 * Centralizes all hardcoded dot indicator patterns used throughout components.
 * This eliminates scattered dot size/color/shape strings and provides a single source of truth.
 *
 * ## Usage
 *
 * ```typescript
 * import { DOT_INDICATORS } from '@/lib/config/dot-indicators';
 *
 * // Instead of hardcoded dot classes:
 * className="w-1.5 h-1.5 rounded-full bg-primary-400"
 *
 * // Use centralized config:
 * className={DOT_INDICATORS.TYPING_INDICATOR.DOT}
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded dot classes with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * className="w-1.5 h-1.5 rounded-full bg-primary-400"
 *
 * // AFTER (modular)
 * import { DOT_INDICATORS } from '@/lib/config/dot-indicators';
 * className={DOT_INDICATORS.TYPING_INDICATOR.DOT}
 * ```
 *
 * ## Adding New Dot Patterns
 *
 * 1. Add the dot pattern constant with descriptive name
 * 2. Group related dot patterns together
 * 3. Add documentation with description
 * 4. Update this header with the new dot pattern
 */

/**
 * Dot Size Constants
 * Standardized dot sizes used across the application
 */
export const DOT_SIZES = {
  /** Extra small dot (4px / w-1 h-1) */
  XS: 'w-1 h-1',
  /** Small dot (6px / w-1.5 h-1.5) */
  SM: 'w-1.5 h-1.5',
  /** Medium dot (8px / w-2 h-2) */
  MD: 'w-2 h-2',
  /** Large dot (12px / w-3 h-3) */
  LG: 'w-3 h-3',
} as const;

/**
 * Dot Shape Constants
 * Standardized dot shapes used across the application
 */
export const DOT_SHAPES = {
  /** Circular dot */
  CIRCLE: 'rounded-full',
  /** Small rounded dot */
  SMALL: 'rounded-sm',
  /** Medium rounded dot */
  MEDIUM: 'rounded-md',
  /** Large rounded dot */
  LARGE: 'rounded-lg',
} as const;

/**
 * Dot Color Constants
 * Standardized dot colors used across the application
 */
export const DOT_COLORS = {
  /** Primary 400 (typing indicator) */
  PRIMARY_400: 'bg-primary-400',
  /** Primary 500 */
  PRIMARY_500: 'bg-primary-500',
  /** Primary 600 (active states) */
  PRIMARY_600: 'bg-primary-600',
  /** Gray 300 (inactive states) */
  GRAY_300: 'bg-gray-300',
  /** Gray 400 */
  GRAY_400: 'bg-gray-400',
  /** Success green */
  SUCCESS: 'bg-green-500',
  /** Warning yellow */
  WARNING: 'bg-yellow-500',
  /** Error red */
  ERROR: 'bg-red-500',
} as const;

/**
 * Typing Indicator Dot Patterns
 * Dot patterns specifically for typing indicator components
 */
export const TYPING_INDICATOR_DOT = {
  /** Standard typing indicator dot */
  DOT: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.PRIMARY_400}`,
  /** Active typing indicator dot */
  DOT_ACTIVE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.PRIMARY_500}`,
  /** Inactive typing indicator dot */
  DOT_INACTIVE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.GRAY_300}`,
} as const;

/**
 * Footer Navigation Dot Patterns
 * Dot patterns for footer navigation indicators
 */
export const FOOTER_NAV_DOT = {
  /** Active indicator dot */
  DOT_ACTIVE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.PRIMARY_600}`,
  /** Inactive indicator dot */
  DOT_INACTIVE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.GRAY_400}`,
} as const;

/**
 * Progress Dot Patterns
 * Dot patterns for progress indicators
 */
export const PROGRESS_DOT = {
  /** Small progress dot */
  DOT_SM: `${DOT_SIZES.XS} ${DOT_SHAPES.CIRCLE}`,
  /** Medium progress dot */
  DOT_MD: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE}`,
  /** Large progress dot */
  DOT_LG: `${DOT_SIZES.MD} ${DOT_SHAPES.CIRCLE}`,
} as const;

/**
 * Status Dot Patterns
 * Dot patterns for status indicators
 */
export const STATUS_DOT = {
  /** Online status dot */
  ONLINE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.SUCCESS}`,
  /** Away status dot */
  AWAY: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.WARNING}`,
  /** Offline status dot */
  OFFLINE: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.GRAY_400}`,
  /** Error status dot */
  ERROR: `${DOT_SIZES.SM} ${DOT_SHAPES.CIRCLE} ${DOT_COLORS.ERROR}`,
} as const;

/**
 * All Dot Indicators Combined
 * Single export for all dot indicator patterns
 */
export const DOT_INDICATORS = {
  SIZES: DOT_SIZES,
  SHAPES: DOT_SHAPES,
  COLORS: DOT_COLORS,
  TYPING_INDICATOR: TYPING_INDICATOR_DOT,
  FOOTER_NAV: FOOTER_NAV_DOT,
  PROGRESS: PROGRESS_DOT,
  STATUS: STATUS_DOT,
} as const;

// Type for dot indicators
export type DotIndicators = typeof DOT_INDICATORS;
export type DotSize = keyof typeof DOT_SIZES;
export type DotShape = keyof typeof DOT_SHAPES;
export type DotColor = keyof typeof DOT_COLORS;

// Helper function to create custom dot pattern
export function createDotPattern(
  size: DotSize,
  shape: DotShape,
  color: DotColor
): string {
  return `${DOT_SIZES[size]} ${DOT_SHAPES[shape]} ${DOT_COLORS[color]}`;
}

// Quick access exports for common patterns
export const TYPING_INDICATOR_DOT_PATTERN = TYPING_INDICATOR_DOT.DOT;
export const ACTIVE_DOT = FOOTER_NAV_DOT.DOT_ACTIVE;
export const INACTIVE_DOT = FOOTER_NAV_DOT.DOT_INACTIVE;
