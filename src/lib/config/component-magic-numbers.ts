/**
 * Component Magic Numbers Configuration
 *
 * Centralizes all magic numbers used in React components.
 * This follows the "Flexy" principle: eliminate hardcoded values and make
 * modular systems.
 *
 * Usage:
 * ```typescript
 * import { COMPONENT_MAGIC_NUMBERS } from '@/lib/config/component-magic-numbers';
 *
 * // Instead of hardcoded number:
 * // const size = spinnerDimension + 8;
 * const size = spinnerDimension + COMPONENT_MAGIC_NUMBERS.SPINNER_PADDING;
 * ```
 */

/**
 * Magic numbers for loading spinner components
 */
export const SPINNER_MAGIC_NUMBERS = {
  /** Extra padding for spinner dimension calculations */
  PADDING: 8,
  /** Default pulse ring size */
  DEFAULT_PULSE_RING_SIZE: 40,
  /** Default spinner dimension */
  DEFAULT_DIMENSION: 32,
  /** Pulse ring size multiplier relative to spinner dimension */
  PULSE_RING_MULTIPLIER: 1.4,
} as const;

/**
 * Magic numbers for progress bar components
 */
export const PROGRESS_MAGIC_NUMBERS = {
  /** Maximum progress percentage */
  MAX_PERCENTAGE: 100,
  /** Minimum progress percentage */
  MIN_PERCENTAGE: 0,
  /** Progress calculation multiplier */
  CALCULATION_MULTIPLIER: 100,
} as const;

/**
 * Magic numbers for particle animations
 */
export const PARTICLE_MAGIC_NUMBERS = {
  /** Default particle size */
  DEFAULT_SIZE: 8,
  /** Particle count multiplier */
  COUNT_MULTIPLIER: 1.5,
} as const;

/**
 * Magic numbers for animation calculations
 */
export const ANIMATION_MAGIC_NUMBERS = {
  /** Full rotation in degrees */
  FULL_ROTATION_DEGREES: 360,
  /** Half rotation for calculations */
  HALF_ROTATION: 180,
  /** Maximum horizontal velocity */
  MAX_HORIZONTAL_VELOCITY: 20,
  /** Maximum vertical velocity */
  MAX_VERTICAL_VELOCITY: 30,
  /** Center offset for particle calculations */
  CENTER_OFFSET: 100,
  /** Random angle multiplier */
  ANGLE_MULTIPLIER: Math.PI * 2,
} as const;

/**
 * Magic numbers for font size calculations
 */
export const FONT_SIZE_MAGIC_NUMBERS = {
  /** Default font size */
  DEFAULT: 16,
  /** Small font size */
  SMALL: 14,
  /** Large font size */
  LARGE: 18,
} as const;

/**
 * Magic numbers for spacing calculations
 */
export const SPACING_MAGIC_NUMBERS = {
  /** Default spacing unit */
  DEFAULT_UNIT: 4,
  /** Small spacing */
  SMALL: 2,
  /** Medium spacing */
  MEDIUM: 8,
  /** Large spacing */
  LARGE: 16,
} as const;

/**
 * Magic numbers for animation timing
 */
export const TIMING_MAGIC_NUMBERS = {
  /** Default animation duration */
  DEFAULT_DURATION: 300,
  /** Short animation duration */
  SHORT_DURATION: 150,
  /** Long animation duration */
  LONG_DURATION: 500,
} as const;

/**
 * Combined magic numbers for components
 */
export const COMPONENT_MAGIC_NUMBERS = {
  SPINNER: SPINNER_MAGIC_NUMBERS,
  PROGRESS: PROGRESS_MAGIC_NUMBERS,
  PARTICLE: PARTICLE_MAGIC_NUMBERS,
  ANIMATION: ANIMATION_MAGIC_NUMBERS,
  FONT_SIZE: FONT_SIZE_MAGIC_NUMBERS,
  SPACING: SPACING_MAGIC_NUMBERS,
  TIMING: TIMING_MAGIC_NUMBERS,
} as const;
