/**
 * Theme Animations Module
 * Centralizes all animation-related theme constants
 */

import { EnvLoader } from '../environment';

/**
 * Animation duration constants (in ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Animation delay constants (in ms)
 */
export const ANIMATION_DELAYS = {
  IMMEDIATE: 0,
  MICRO: 50,
  PARTICLE_STAGGER: 50,
  SHORT: 100,
  CLEANUP: 100,
  MEDIUM: 150,
  LONG: 200,
  RIPPLE: 600,
  STEP_TRANSITION: 800,
  SHAKE: 500,
  PROGRESS: 700,
  STEP_ANIMATION: 400,
  FLOAT_DELAY_1: 300,
  FLOAT_DELAY_2: 600,
  CSS_CLASSES: {
    FLOAT_DELAY_1: 'animate-float-delay-1',
    FLOAT_DELAY_2: 'animate-float-delay-2',
  },
  TAILWIND: {
    0: 'delay-0',
    50: 'delay-50',
    75: 'delay-75',
    100: 'delay-100',
    150: 'delay-150',
    200: 'delay-200',
    250: 'delay-250',
    300: 'delay-300',
    500: 'delay-500',
    700: 'delay-700',
    1000: 'delay-1000',
  } as const,
  INLINE: {
    IMMEDIATE: '0ms',
    MICRO: '50ms',
    SHORT: '100ms',
    MEDIUM: '150ms',
    LONG: '200ms',
    STANDARD: '300ms',
    EXTENDED: '450ms',
    RIPPLE: '600ms',
    STEP_TRANSITION: '800ms',
  } as const,
} as const;

/**
 * Tailwind transition-duration class mapping
 */
export const DURATION_TAILWIND = {
  75: 'duration-75',
  100: 'duration-100',
  150: 'duration-150',
  200: 'duration-200',
  300: 'duration-300',
  500: 'duration-500',
  700: 'duration-700',
  1000: 'duration-1000',
} as const;

export type DurationTailwind = typeof DURATION_TAILWIND;

/**
 * Button ripple animation configuration
 */
export const RIPPLE_CONFIG = {
  DURATION_MS: 600,
  SCALE_FACTOR: 4,
  START_OPACITY: 0.3,
  END_OPACITY: 0,
} as const;

/**
 * Animation physics constants
 */
export const ANIMATION_PHYSICS = {
  GRAVITY: 0.8,
  FRICTION: 0.98,
  PARTICLE_COUNT: 30,
  DEFAULT_DURATION_MS: EnvLoader.number(
    'THEME_ANIMATION_DEFAULT_DURATION_MS',
    2000,
    500,
    10000
  ),
  REDUCED_MOTION_DURATION_MS: EnvLoader.number(
    'THEME_ANIMATION_REDUCED_MOTION_DURATION_MS',
    500,
    100,
    2000
  ),
  STEP_CELEBRATION_DURATION_MS: EnvLoader.number(
    'THEME_STEP_CELEBRATION_DURATION_MS',
    1500,
    500,
    5000
  ),
  OPACITY_DECAY: 0.015,
  VELOCITY_MULTIPLIER: 0.5,
  CENTER_OFFSET: 20,
  CENTER_POSITION: EnvLoader.number(
    'THEME_ANIMATION_CENTER_POSITION',
    50,
    25,
    75
  ),
  MAX_HORIZONTAL_VELOCITY: 30,
  MAX_VERTICAL_VELOCITY: 25,
  MIN_VERTICAL_BOOST: 10,
  PARTICLE_SIZE: {
    MIN: 4,
    MAX: 8,
  },
  ROTATION_MULTIPLIER: 2,
  FULL_ROTATION_DEGREES: 360,
  SCALE_RANGE: {
    MIN: 0.5,
    MAX: 1.0,
  },
} as const;

/**
 * SVG Animation constants
 */
export const SVG_ANIMATION = {
  CHECKMARK_PATH_LENGTH: 24,
  DASH_ARRAY: {
    FULL: 24,
    HIDDEN: 24,
  } as const,
  DASH_OFFSET: {
    VISIBLE: 0,
    HIDDEN: '24',
    VISIBLE_STR: '0',
    FULL: 24,
  } as const,
  PROGRESS: {
    DEFAULT_RADIUS: 10,
    getCircumference: (radius: number) => 2 * Math.PI * radius,
    getDashOffset: (circumference: number, progress: number) =>
      circumference * (1 - progress / 100),
  },
} as const;

/**
 * Transition Utility Classes
 */
export const TRANSITION_CLASSES = {
  DEFAULT: 'transition-all duration-200',
  FAST: 'transition-all duration-150',
  SLOW: 'transition-all duration-300',
  ULTRA_SLOW: 'transition-all duration-500',
  DEFAULT_EASE_OUT: 'transition-all duration-200 ease-out',
  SLOW_EASE_OUT: 'transition-all duration-300 ease-out',
  SLOW_EASE_IN_OUT: 'transition-all duration-300 ease-in-out',
  COLOR: 'transition-colors',
  COLOR_DEFAULT: 'transition-colors duration-200',
  COLOR_SLOW: 'transition-colors duration-300',
  OPACITY: 'transition-opacity',
  OPACITY_DEFAULT: 'transition-opacity duration-200',
  OPACITY_SLOW: 'transition-opacity duration-300',
  OPACITY_FAST: 'transition-opacity duration-150',
  TRANSFORM: 'transition-transform',
  TRANSFORM_DEFAULT: 'transition-transform duration-200',
  TRANSFORM_SLOW: 'transition-transform duration-300',
  TRANSFORM_FAST: 'transition-transform duration-150',
  NONE: 'transition-none',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
} as const;

/**
 * Opacity Utility Classes
 * Eliminates hardcoded opacity-* values throughout components
 */
export const OPACITY_CLASSES = {
  /** opacity-0 - fully transparent */
  HIDDEN: 'opacity-0',
  /** opacity-5 - 5% opacity */
  NEARLY_TRANSPARENT: 'opacity-5',
  /** opacity-10 - 10% opacity */
  VERY_LOW: 'opacity-10',
  /** opacity-20 - 20% opacity */
  LOW: 'opacity-20',
  /** opacity-25 - 25% opacity */
  LIGHT: 'opacity-25',
  /** opacity-30 - 30% opacity */
  MEDIUM_LOW: 'opacity-30',
  /** opacity-40 - 40% opacity */
  MEDIUM: 'opacity-40',
  /** opacity-50 - 50% opacity */
  HALF: 'opacity-50',
  /** opacity-60 - 60% opacity */
  MEDIUM_HIGH: 'opacity-60',
  /** opacity-70 - 70% opacity */
  HIGH: 'opacity-70',
  /** opacity-75 - 75% opacity */
  VERY_HIGH: 'opacity-75',
  /** opacity-80 - 80% opacity */
  ALMOST_FULL: 'opacity-80',
  /** opacity-90 - 90% opacity */
  NEAR_FULL: 'opacity-90',
  /** opacity-95 - 95% opacity */
  ALMOST_OPAQUE: 'opacity-95',
  /** opacity-100 - fully opaque */
  FULL: 'opacity-100',
} as const;

/**
 * Scale Transform Classes
 * Eliminates hardcoded scale-* values throughout components
 */
export const SCALE_CLASSES = {
  /** scale-50 - 50% scale */
  HALF: 'scale-50',
  /** scale-75 - 75% scale */
  THREE_QUARTERS: 'scale-75',
  /** scale-90 - 90% scale */
  NEARLY_FULL: 'scale-90',
  /** scale-95 - 95% scale */
  ALMOST_FULL: 'scale-95',
  /** scale-100 - 100% scale (no transform) */
  FULL: 'scale-100',
  /** scale-105 - 105% scale */
  SLIGHTLY_LARGER: 'scale-105',
  /** scale-110 - 110% scale */
  LARGER: 'scale-110',
  /** scale-125 - 125% scale */
  MUCH_LARGER: 'scale-125',
  /** scale-150 - 150% scale */
  DOUBLE: 'scale-150',
  /** scale-175 - 175% scale */
  VERY_LARGE: 'scale-175',
} as const;

/**
 * Rotation Transform Classes
 * Eliminates hardcoded rotate-* values throughout components
 */
export const ROTATE_CLASSES = {
  /** -rotate-90 - -90 degrees rotation */
  MINUS_90: '-rotate-90',
  /** -rotate-45 - -45 degrees rotation */
  MINUS_45: '-rotate-45',
  /** -rotate-12 - -12 degrees rotation */
  MINUS_12: '-rotate-12',
  /** rotate-0 - no rotation */
  NONE: 'rotate-0',
  /** rotate-12 - 12 degrees rotation */
  PLUS_12: 'rotate-12',
  /** rotate-45 - 45 degrees rotation */
  PLUS_45: 'rotate-45',
  /** rotate-90 - 90 degrees rotation */
  PLUS_90: 'rotate-90',
  /** rotate-180 - 180 degrees rotation */
  FLIP: 'rotate-180',
} as const;

/**
 * Translate Transform Classes
 * Eliminates hardcoded translate-* values throughout components
 */
export const TRANSLATE_CLASSES = {
  /** -translate-y-1/2 - translate up 50% */
  UP_HALF: '-translate-y-1/2',
  /** -translate-y-1 - translate up 1 unit */
  UP_1: '-translate-y-1',
  /** -translate-y-0.5 - translate up 0.5 unit */
  UP_HALF_UNIT: '-translate-y-0.5',
  /** translate-y-0 - no translation */
  NONE_Y: 'translate-y-0',
  /** translate-y-0.5 - translate down 0.5 unit */
  DOWN_HALF_UNIT: 'translate-y-0.5',
  /** translate-y-1 - translate down 1 unit */
  DOWN_1: 'translate-y-1',
  /** translate-y-2 - translate down 2 units */
  DOWN_2: 'translate-y-2',
  /** translate-y-4 - translate down 4 units */
  DOWN_4: 'translate-y-4',
  /** -translate-x-1/2 - translate left 50% */
  LEFT_HALF: '-translate-x-1/2',
  /** translate-x-1/2 - translate right 50% */
  RIGHT_HALF: 'translate-x-1/2',
} as const;

/**
 * Combined Transform Classes for common patterns
 * Eliminates hardcoded transform combinations throughout components
 */
export const TRANSFORM_PATTERNS = {
  /** Common entrance animation state */
  ENTRANCE: 'opacity-100 scale-100 translate-y-0',
  /** Common exit animation state */
  EXIT: 'opacity-0 scale-95 translate-y-4',
  /** Hover scale effect */
  HOVER_SCALE: 'hover:scale-105 active:scale-95',
  /** Focus scale effect */
  FOCUS_SCALE: 'focus-visible:scale-110',
  /** Group hover scale effect */
  GROUP_HOVER_SCALE: 'group-hover:scale-110',
} as const;

export type AnimationDelays = typeof ANIMATION_DELAYS;
export type AnimationPhysics = typeof ANIMATION_PHYSICS;
export type TransitionClasses = typeof TRANSITION_CLASSES;
export type OpacityClasses = typeof OPACITY_CLASSES;
export type ScaleClasses = typeof SCALE_CLASSES;
export type RotateClasses = typeof ROTATE_CLASSES;
export type TranslateClasses = typeof TRANSLATE_CLASSES;
export type TransformPatterns = typeof TRANSFORM_PATTERNS;
