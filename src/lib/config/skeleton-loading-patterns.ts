/**
 * Skeleton Loading Patterns Configuration
 *
 * Centralizes all hardcoded skeleton loading patterns used throughout the application.
 * This follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { SKELETON_LOADING_PATTERNS } from '@/lib/config/skeleton-loading-patterns';
 *
 * // Instead of hardcoded className:
 * <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
 *
 * // Use modular config:
 * <div className={SKELETON_LOADING_PATTERNS.HEADER}></div>
 * ```
 */

/**
 * Results page skeleton patterns
 * Used in: Results page loading states
 */
export const RESULTS_SKELETON = {
  /** h-6 bg-gray-200 rounded w-1/3 mb-4 - header skeleton */
  HEADER: 'h-6 bg-gray-200 rounded w-1/3 mb-4',
  /** h-4 bg-gray-200 rounded - text line skeleton */
  TEXT_LINE: 'h-4 bg-gray-200 rounded',
  /** h-4 bg-gray-200 rounded w-5/6 - text line 83% width */
  TEXT_LINE_WIDE: 'h-4 bg-gray-200 rounded w-5/6',
  /** h-4 bg-gray-200 rounded w-4/6 - text line 66% width */
  TEXT_LINE_MEDIUM: 'h-4 bg-gray-200 rounded w-4/6',
} as const;

/**
 * Success state skeleton patterns
 * Used in: Signup, Auth callback success states
 */
export const SUCCESS_SKELETON = {
  /** h-12 w-12 rounded-full - success icon container */
  ICON_CONTAINER: 'h-12 w-12 rounded-full',
  /** h-6 w-6 - success icon */
  ICON: 'h-6 w-6',
} as const;

/**
 * Dashboard skeleton patterns
 * Used in: Dashboard page loading states
 */
export const DASHBOARD_SKELETON = {
  /** h-5 - status badge height */
  STATUS_BADGE_HEIGHT: 'h-5',
  /** px-1.5 - status badge padding */
  STATUS_BADGE_PADDING: 'px-1.5',
  /** ml-0.5 - small margin left */
  SMALL_MARGIN_LEFT: 'ml-0.5',
} as const;

/**
 * Common skeleton patterns
 * Used across multiple pages
 */
export const COMMON_SKELETON = {
  /** px-1.5 py-0.5 - code badge padding */
  CODE_BADGE: 'px-1.5 py-0.5',
  /** gap-1.5 - small gap */
  GAP_SMALL: 'gap-1.5',
  /** gap-2 - medium gap */
  GAP_MEDIUM: 'gap-2',
  /** gap-3 - large gap */
  GAP_LARGE: 'gap-3',
} as const;

/**
 * All skeleton loading patterns combined
 */
export const SKELETON_LOADING_PATTERNS = {
  RESULTS: RESULTS_SKELETON,
  SUCCESS: SUCCESS_SKELETON,
  DASHBOARD: DASHBOARD_SKELETON,
  COMMON: COMMON_SKELETON,
} as const;

export type SkeletonLoadingPatterns = typeof SKELETON_LOADING_PATTERNS;
export type ResultsSkeleton = typeof RESULTS_SKELETON;
export type SuccessSkeleton = typeof SUCCESS_SKELETON;
export type DashboardSkeleton = typeof DASHBOARD_SKELETON;
export type CommonSkeleton = typeof COMMON_SKELETON;
