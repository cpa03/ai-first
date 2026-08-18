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
  TRANSFORM: 'transition-transform',
  NONE: 'transition-none',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
} as const;

export type AnimationDelays = typeof ANIMATION_DELAYS;
export type AnimationPhysics = typeof ANIMATION_PHYSICS;
export type TransitionClasses = typeof TRANSITION_CLASSES;
