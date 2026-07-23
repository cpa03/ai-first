/**
 * Animation Classes Configuration
 *
 * Centralizes all hardcoded Tailwind animation class names used throughout components.
 * This eliminates scattered animation class strings and provides a single source of truth.
 *
 * ## Usage
 *
 * ```typescript
 * import { ANIMATION_CLASSES } from '@/lib/config/animation-classes';
 *
 * // Instead of hardcoded animation class:
 * className="animate-fade-in"
 *
 * // Use centralized config:
 * className={ANIMATION_CLASSES.FADE_IN}
 * ```
 *
 * ## Migration Guide
 *
 * Replace hardcoded animation classes with imports from this module:
 * ```typescript
 * // BEFORE (hardcoded)
 * className="animate-fade-in"
 *
 * // AFTER (modular)
 * import { ANIMATION_CLASSES } from '@/lib/config/animation-classes';
 * className={ANIMATION_CLASSES.FADE_IN}
 * ```
 *
 * ## Adding New Animation Classes
 *
 * 1. Add the animation class constant with descriptive name
 * 2. Group related animations together
 * 3. Add documentation with description
 * 4. Update this header with the new animation class
 */

/**
 * Base Animation Classes
 * Core animation classes used across the application
 */
export const ANIMATION_CLASSES = {
  /** Fade in animation */
  FADE_IN: 'animate-fade-in',

  /** Fade out animation */
  FADE_OUT: 'animate-fade-out',

  /** Slide down animation */
  SLIDE_DOWN: 'animate-slide-down',

  /** Slide up animation */
  SLIDE_UP: 'animate-slide-up',

  /** Slide from left animation */
  SLIDE_FROM_LEFT: 'animate-slide-from-left',

  /** Slide from right animation */
  SLIDE_FROM_RIGHT: 'animate-slide-from-right',

  /** Scale in animation */
  SCALE_IN: 'animate-scale-in',

  /** Scale out animation */
  SCALE_OUT: 'animate-scale-out',

  /** Pop animation */
  POP: 'animate-pop',

  /** Bounce animation */
  BOUNCE: 'animate-bounce',

  /** Pulse animation */
  PULSE: 'animate-pulse',

  /** Spin animation */
  SPIN: 'animate-spin',

  /** Shake animation */
  SHAKE: 'animate-shake',

  /** Wiggle animation */
  WIGGLE: 'animate-wiggle',

  /** Flash animation */
  FLASH: 'animate-flash',
} as const;

/**
 * UI Feedback Animation Classes
 * Animations for user interactions and feedback
 */
export const UI_FEEDBACK_ANIMATIONS = {
  /** Success check animation */
  SUCCESS_CHECK: 'animate-success-check',

  /** Success pop animation */
  SUCCESS_POP: 'animate-success-pop',

  /** Draw check animation (SVG path drawing) */
  DRAW_CHECK: 'animate-draw-check',

  /** Copy success glow animation */
  COPY_SUCCESS_GLOW: 'animate-copy-success-glow',

  /** Share success glow animation */
  SHARE_SUCCESS_GLOW: 'animate-share-success-glow',

  /** Input valid celebration animation */
  INPUT_VALID_CELEBRATION: 'animate-input-valid-celebration',

  /** Counter pulse animation */
  COUNTER_PULSE: 'animate-counter-pulse',

  /** Counter glow animation */
  COUNTER_GLOW: 'animate-counter-glow',

  /** Focus ring animation */
  FOCUS_RING: 'animate-focus-ring',

  /** Gentle pulse animation */
  GENTLE_PULSE: 'animate-gentle-pulse',

  /** Step check pop animation */
  STEP_CHECK_POP: 'animate-step-check-pop',

  /** Discover pulse animation */
  DISCOVER_PULSE: 'animate-discover-pulse',
} as const;

/**
 * Task Management Animation Classes
 * Animations specific to task management components
 */
export const TASK_ANIMATIONS = {
  /** Task complete animation */
  TASK_COMPLETE: 'animate-task-complete',

  /** Checkbox pulse animation */
  CHECKBOX_PULSE: 'animate-checkbox-pulse',

  /** Deliverable complete animation */
  DELIVERABLE_COMPLETE: 'animate-deliverable-complete',

  /** Expand content animation */
  EXPAND_CONTENT: 'animate-expand-content',

  /** Collapse content animation */
  COLLAPSE_CONTENT: 'animate-collapse-content',
} as const;

/**
 * Confetti and Celebration Animation Classes
 * Animations for celebrations and confetti effects
 */
export const CELEBRATION_ANIMATIONS = {
  /** Copy confetti animation */
  COPY_CONFETTI: 'animate-copy-confetti',

  /** Success confetti animation */
  SUCCESS_CONFETTI: 'animate-success-confetti',

  /** Celebration pop animation */
  CELEBRATION_POP: 'animate-celebration-pop',
} as const;

/**
 * Mobile Navigation Animation Classes
 * Animations for mobile navigation components
 */
export const MOBILE_NAV_ANIMATIONS = {
  /** Mobile menu item animation (with index suffix) */
  MENU_ITEM: 'animate-mobile-menu-item',

  /** Mobile menu item animation with delay */
  MENU_ITEM_DELAYED: 'animate-mobile-menu-item-delayed',
} as const;

/**
 * Scroll Animation Classes
 * Animations related to scrolling behavior
 */
export const SCROLL_ANIMATIONS = {
  /** Scroll to top bounce animation */
  SCROLL_TO_TOP_BOUNCE: 'animate-scroll-to-top-bounce',

  /** Scroll progress animation */
  SCROLL_PROGRESS: 'animate-scroll-progress',
} as const;

/**
 * Badge Animation Classes
 * Animations for badge elements
 */
export const BADGE_ANIMATIONS = {
  /** Badge entrance glow animation */
  BADGE_ENTRANCE_GLOW: 'animate-badge-entrance-glow',

  /** Coming soon badge animation */
  COMING_SOON_BADGE: 'animate-coming-soon-badge',
} as const;

/**
 * Checklist Animation Classes
 * Animations for checklist and requirements components
 */
export const CHECKLIST_ANIMATIONS = {
  /** Checklist item animation (with index suffix) */
  CHECKLIST_ITEM: 'animate-checklist-item',

  /** Requirement met animation */
  REQUIREMENT_MET: 'animate-requirement-met',
} as const;

/**
 * Typing Indicator Animation Classes
 * Animations for typing indicator components
 */
export const TYPING_ANIMATIONS = {
  /** Typing dot animation */
  TYPING_DOT: 'animate-typing-dot',
} as const;

/**
 * Miscellaneous Animation Classes
 * Other animations used across the application
 */
export const MISC_ANIMATIONS = {
  /** Breathe animation (subtle pulsing effect) */
  BREATHE: 'animate-breathe',

  /** Hero entrance animation (for page hero sections) */
  HERO_ENTRANCE: 'animate-hero-entrance',

  /** Ripple ring animation 1 (first ring) */
  RIPPLE_RING_1: 'animate-ripple-ring-1',

  /** Ripple ring animation 2 (second ring) */
  RIPPLE_RING_2: 'animate-ripple-ring-2',
} as const;

/**
 * All Animation Classes Combined
 * Single export for all animation classes
 */
export const ALL_ANIMATION_CLASSES = {
  ...ANIMATION_CLASSES,
  ...UI_FEEDBACK_ANIMATIONS,
  ...TASK_ANIMATIONS,
  ...CELEBRATION_ANIMATIONS,
  ...MOBILE_NAV_ANIMATIONS,
  ...SCROLL_ANIMATIONS,
  ...BADGE_ANIMATIONS,
  ...CHECKLIST_ANIMATIONS,
  ...TYPING_ANIMATIONS,
  ...MISC_ANIMATIONS,
} as const;

/**
 * Animation class categories for easy access
 */
export const ANIMATION_CATEGORIES = {
  BASE: ANIMATION_CLASSES,
  UI_FEEDBACK: UI_FEEDBACK_ANIMATIONS,
  TASK: TASK_ANIMATIONS,
  CELEBRATION: CELEBRATION_ANIMATIONS,
  MOBILE_NAV: MOBILE_NAV_ANIMATIONS,
  SCROLL: SCROLL_ANIMATIONS,
  BADGE: BADGE_ANIMATIONS,
  CHECKLIST: CHECKLIST_ANIMATIONS,
  TYPING: TYPING_ANIMATIONS,
  MISC: MISC_ANIMATIONS,
} as const;

// Type for animation classes
export type AnimationClasses = typeof ANIMATION_CLASSES;
export type AllAnimationClasses = typeof ALL_ANIMATION_CLASSES;

// Helper function to get animation class by category
export function getAnimationClass(
  category: keyof typeof ANIMATION_CATEGORIES,
  animationName: string
): string {
  const categoryAnimations = ANIMATION_CATEGORIES[category];
  if (categoryAnimations && typeof categoryAnimations === 'object') {
    const animation = (categoryAnimations as Record<string, string>)[
      animationName
    ];
    if (typeof animation === 'string') {
      return animation;
    }
  }
  return '';
}

// Helper function to get indexed animation class (for animations with index suffix)
export function getIndexedAnimationClass(
  baseClass: string,
  index: number
): string {
  return `${baseClass}-${index}`;
}

// Common animation class constants for quick access
export const FADE_IN = ANIMATION_CLASSES.FADE_IN;
export const FADE_OUT = ANIMATION_CLASSES.FADE_OUT;
export const SLIDE_DOWN = ANIMATION_CLASSES.SLIDE_DOWN;
export const SLIDE_UP = ANIMATION_CLASSES.SLIDE_UP;
export const SCALE_IN = ANIMATION_CLASSES.SCALE_IN;
export const POP = ANIMATION_CLASSES.POP;
export const BOUNCE = ANIMATION_CLASSES.BOUNCE;
export const PULSE = ANIMATION_CLASSES.PULSE;
export const SPIN = ANIMATION_CLASSES.SPIN;

// UI Feedback quick access
export const SUCCESS_CHECK = UI_FEEDBACK_ANIMATIONS.SUCCESS_CHECK;
export const SUCCESS_POP = UI_FEEDBACK_ANIMATIONS.SUCCESS_POP;
export const DRAW_CHECK = UI_FEEDBACK_ANIMATIONS.DRAW_CHECK;
export const COPY_SUCCESS_GLOW = UI_FEEDBACK_ANIMATIONS.COPY_SUCCESS_GLOW;
export const FOCUS_RING = UI_FEEDBACK_ANIMATIONS.FOCUS_RING;

// Task animation quick access
export const TASK_COMPLETE = TASK_ANIMATIONS.TASK_COMPLETE;
export const CHECKBOX_PULSE = TASK_ANIMATIONS.CHECKBOX_PULSE;
export const DELIVERABLE_COMPLETE = TASK_ANIMATIONS.DELIVERABLE_COMPLETE;

// Celebration animation quick access
export const COPY_CONFETTI = CELEBRATION_ANIMATIONS.COPY_CONFETTI;

// Mobile nav animation quick access
export const MOBILE_MENU_ITEM = MOBILE_NAV_ANIMATIONS.MENU_ITEM;

// Scroll animation quick access
export const SCROLL_TO_TOP_BOUNCE = SCROLL_ANIMATIONS.SCROLL_TO_TOP_BOUNCE;

// Badge animation quick access
export const BADGE_ENTRANCE_GLOW = BADGE_ANIMATIONS.BADGE_ENTRANCE_GLOW;
export const COMING_SOON_BADGE = BADGE_ANIMATIONS.COMING_SOON_BADGE;

// Checklist animation quick access
export const CHECKLIST_ITEM = CHECKLIST_ANIMATIONS.CHECKLIST_ITEM;
export const REQUIREMENT_MET = CHECKLIST_ANIMATIONS.REQUIREMENT_MET;

// Typing animation quick access
export const TYPING_DOT = TYPING_ANIMATIONS.TYPING_DOT;

// Misc animation quick access
export const BREATHE = MISC_ANIMATIONS.BREATHE;
export const HERO_ENTRANCE = MISC_ANIMATIONS.HERO_ENTRANCE;
export const RIPPLE_RING_1 = MISC_ANIMATIONS.RIPPLE_RING_1;
export const RIPPLE_RING_2 = MISC_ANIMATIONS.RIPPLE_RING_2;
