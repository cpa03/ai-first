/**
 * Table Patterns Configuration
 *
 * Centralizes all table-related Tailwind patterns used throughout the codebase.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { TABLE_PATTERNS } from '@/lib/config/table-patterns';
 *
 * // Instead of hardcoded className:
 * <tbody className="bg-white divide-y divide-gray-200">
 *
 * // Use modular config:
 * <tbody className={TABLE_PATTERNS.BODY}>
 * ```
 */

/**
 * Table body styles
 * Used in: Dashboard page table body
 */
export const TABLE_BODY = 'bg-white divide-y divide-gray-200';

/**
 * Table row selected ring styles
 * Used in: Dashboard page selected row
 */
export const TABLE_ROW_SELECTED_RING = 'ring-2 ring-primary-400 ring-inset';

/**
 * Combined table patterns for easy access
 */
export const TABLE_UI_PATTERNS = {
  /** Table body styles */
  BODY: TABLE_BODY,
  /** Table row selected ring styles */
  SELECTED_ROW_RING: TABLE_ROW_SELECTED_RING,
} as const;
