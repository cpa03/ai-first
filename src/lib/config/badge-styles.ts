/**
 * Badge Styles Configuration
 *
 * Centralizes all badge-related Tailwind classes used throughout the application.
 * Follows the "Flexy" principle: eliminate hardcoded values and make modular systems.
 *
 * Usage:
 * ```typescript
 * import { BADGE_STYLES } from '@/lib/config';
 * <span className={BADGE_STYLES.COMING_SOON}>Soon</span>
 * <span className={BADGE_STYLES.SETUP_REQUIRED}>Setup Required</span>
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded badge classes with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
 *
 * // AFTER (modular)
 * import { BADGE_STYLES } from '@/lib/config';
 * <span className={BADGE_STYLES.COMING_SOON}>
 * ```
 */

import { GRAY_CLASSES } from './remaining-styles';

/**
 * Badge base styles
 * Common padding, sizing, and border-radius for all badges
 */
const BADGE_BASE = 'px-2 py-0.5 text-xs rounded-full';

/**
 * Badge color variants
 * Different color schemes for various badge types
 */
const BADGE_COLORS = {
  /** Amber badge (warning/coming soon) */
  AMBER: 'bg-amber-100 text-amber-700',

  /** Gray badge (neutral/setup required) */
  GRAY: `${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_500}`,

  /** Green badge (success/complete) */
  GREEN: 'bg-green-100 text-green-700',

  /** Blue badge (info/in progress) */
  BLUE: 'bg-blue-100 text-blue-700',

  /** Red badge (error/critical) */
  RED: 'bg-red-100 text-red-700',

  /** Purple badge (new/feature) */
  PURPLE: 'bg-purple-100 text-purple-700',
} as const;

/**
 * Complete badge style definitions
 * Each badge type combines base styles with specific colors
 */
export const BADGE_STYLES = {
  /** Coming soon badge - amber color scheme */
  COMING_SOON: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.AMBER}`,

  /** Setup required badge - gray color scheme */
  SETUP_REQUIRED: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.GRAY}`,

  /** Complete badge - green color scheme */
  COMPLETE: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.GREEN}`,

  /** In progress badge - blue color scheme */
  IN_PROGRESS: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.BLUE}`,

  /** Error badge - red color scheme */
  ERROR: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.RED}`,

  /** New feature badge - purple color scheme */
  NEW_FEATURE: `ml-2 ${BADGE_BASE} ${BADGE_COLORS.PURPLE}`,

  /** Status badge - compact style for status indicators */
  STATUS: `px-1.5 py-0.5 font-mono text-xs font-medium ${GRAY_CLASSES.TEXT_600} ${GRAY_CLASSES.BG_100} border ${GRAY_CLASSES.BORDER_200} rounded`,

  /** Keyboard shortcut badge */
  KBD: `px-1.5 py-0.5 text-xs font-mono ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`,
} as const;

/**
 * Badge animation classes
 * Animations for badge entrance and hover effects
 */
export const BADGE_STYLE_ANIMATIONS = {
  /** Badge entrance glow effect */
  ENTRANCE_GLOW: 'animate-badge-entrance-glow',

  /** Coming soon badge pulse */
  COMING_SOON_PULSE: 'animate-coming-soon-badge',

  /** Badge hover scale */
  HOVER_SCALE: 'hover:scale-105 transition-transform duration-200',
} as const;

/**
 * Type definitions
 */
export type BadgeStyle = keyof typeof BADGE_STYLES;
export type BadgeAnimation = keyof typeof BADGE_STYLE_ANIMATIONS;
