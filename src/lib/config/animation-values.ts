/**
 * Animation Values Configuration
 *
 * Centralizes all hardcoded animation values used throughout the application.
 * This eliminates magic numbers and hardcoded durations scattered throughout the codebase.
 *
 * Usage:
 * ```typescript
 * import { ANIMATION_VALUES } from '@/lib/config/animation-values';
 *
 * // Instead of hardcoded value:
 * transition: 'duration-200'
 *
 * // Use centralized config:
 * transition: `duration-${ANIMATION_VALUES.DURATION.FAST}`
 * ```
 */

export const ANIMATION_VALUES = {
  // Duration values (in milliseconds)
  DURATION: {
    INSTANT: 0,
    FASTEST: 50,
    FASTER: 100,
    FAST: 150,
    NORMAL: 200,
    SLOWER: 300,
    SLOW: 400,
    SLOWEST: 500,
    EXTREMELY_SLOW: 1000,
    GLACIAL: 2000,
    PAINFULLY_SLOW: 3000,
    ETERNITY: 5000,
  },

  // Duration classes (Tailwind-compatible)
  DURATION_CLASSES: {
    INSTANT: 'duration-0',
    FASTEST: 'duration-50',
    FASTER: 'duration-100',
    FAST: 'duration-150',
    NORMAL: 'duration-200',
    SLOWER: 'duration-300',
    SLOW: 'duration-400',
    SLOWEST: 'duration-500',
    EXTREMELY_SLOW: 'duration-1000',
  },

  // Delay values (in milliseconds)
  DELAY: {
    NONE: 0,
    FASTEST: 50,
    FASTER: 75,
    FAST: 100,
    NORMAL: 150,
    SLOWER: 200,
    SLOW: 300,
    SLOWEST: 500,
    EXTREMELY_SLOW: 1000,
    GLACIAL: 2000,
  },

  // Delay classes (Tailwind-compatible)
  DELAY_CLASSES: {
    NONE: 'delay-0',
    FASTEST: 'delay-50',
    FASTER: 'delay-75',
    FAST: 'delay-100',
    NORMAL: 'delay-150',
    SLOWER: 'delay-200',
    SLOW: 'delay-300',
    SLOWEST: 'delay-500',
    EXTREMELY_SLOW: 'delay-1000',
  },

  // Easing functions
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    EASE_IN_BACK: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    EASE_OUT_BACK: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    EASE_IN_OUT_BACK: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    EASE_IN_ELASTIC: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    EASE_OUT_ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    EASE_IN_OUT_ELASTIC: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ELASTIC: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    BACK: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
  },

  // Easing classes (Tailwind-compatible)
  EASING_CLASSES: {
    LINEAR: 'ease-linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },

  // Scale values
  SCALE: {
    NONE: 1,
    SMALLER: 0.95,
    SMALL: 0.9,
    NORMAL: 1,
    LARGE: 1.05,
    LARGER: 1.1,
    HUGE: 1.25,
    MASSIVE: 1.5,
    GIGANTIC: 2,
  },

  // Scale classes (Tailwind-compatible)
  SCALE_CLASSES: {
    NONE: 'scale-100',
    SMALLER: 'scale-95',
    SMALL: 'scale-90',
    NORMAL: 'scale-100',
    LARGE: 'scale-105',
    LARGER: 'scale-110',
    HUGE: 'scale-125',
    MASSIVE: 'scale-150',
    GIGANTIC: 'scale-200',
  },

  // Rotate values (in degrees)
  ROTATE: {
    NONE: 0,
    QUARTER: 90,
    HALF: 180,
    THREE_QUARTERS: 270,
    FULL: 360,
    MINIMAL: 5,
    SMALL: 15,
    LARGE: 45,
    HUGE: 135,
  },

  // Rotate classes (Tailwind-compatible)
  ROTATE_CLASSES: {
    NONE: 'rotate-0',
    QUARTER: 'rotate-90',
    HALF: 'rotate-180',
    THREE_QUARTERS: 'rotate-270',
    FULL: 'rotate-360',
    MINIMAL: 'rotate-5',
    SMALL: 'rotate-15',
    LARGE: 'rotate-45',
    HUGE: 'rotate-135',
    NEGATIVE_QUARTER: '-rotate-90',
    NEGATIVE_HALF: '-rotate-180',
    NEGATIVE_THREE_QUARTERS: '-rotate-270',
    NEGATIVE_FULL: '-rotate-360',
    NEGATIVE_MINIMAL: '-rotate-5',
    NEGATIVE_SMALL: '-rotate-15',
    NEGATIVE_LARGE: '-rotate-45',
    NEGATIVE_HUGE: '-rotate-135',
  },

  // Translate values (in pixels or percentages)
  TRANSLATE: {
    NONE: 0,
    MINIMAL: 2,
    SMALL: 4,
    NORMAL: 8,
    LARGE: 16,
    LARGER: 24,
    HUGE: 32,
    MASSIVE: 48,
    GIGANTIC: 64,
  },

  // Translate classes (Tailwind-compatible)
  TRANSLATE_CLASSES: {
    NONE: 'translate-x-0 translate-y-0',
    MINIMAL_X: 'translate-x-0.5',
    SMALL_X: 'translate-x-1',
    NORMAL_X: 'translate-x-2',
    LARGE_X: 'translate-x-4',
    LARGER_X: 'translate-x-6',
    HUGE_X: 'translate-x-8',
    MASSIVE_X: 'translate-x-12',
    GIGANTIC_X: 'translate-x-16',
    MINIMAL_Y: 'translate-y-0.5',
    SMALL_Y: 'translate-y-1',
    NORMAL_Y: 'translate-y-2',
    LARGE_Y: 'translate-y-4',
    LARGER_Y: 'translate-y-6',
    HUGE_Y: 'translate-y-8',
    MASSIVE_Y: 'translate-y-12',
    GIGANTIC_Y: 'translate-y-16',
    NEGATIVE_MINIMAL_X: '-translate-x-0.5',
    NEGATIVE_SMALL_X: '-translate-x-1',
    NEGATIVE_NORMAL_X: '-translate-x-2',
    NEGATIVE_LARGE_X: '-translate-x-4',
    NEGATIVE_LARGER_X: '-translate-x-6',
    NEGATIVE_HUGE_X: '-translate-x-8',
    NEGATIVE_MASSIVE_X: '-translate-x-12',
    NEGATIVE_GIGANTIC_X: '-translate-x-16',
    NEGATIVE_MINIMAL_Y: '-translate-y-0.5',
    NEGATIVE_SMALL_Y: '-translate-y-1',
    NEGATIVE_NORMAL_Y: '-translate-y-2',
    NEGATIVE_LARGE_Y: '-translate-y-4',
    NEGATIVE_LARGER_Y: '-translate-y-6',
    NEGATIVE_HUGE_Y: '-translate-y-8',
    NEGATIVE_MASSIVE_Y: '-translate-y-12',
    NEGATIVE_GIGANTIC_Y: '-translate-y-16',
  },

  // Opacity values
  OPACITY: {
    NONE: 0,
    SLIGHTLY_VISIBLE: 0.05,
    VISIBLE: 0.1,
    FAINT: 0.2,
    LIGHT: 0.25,
    MODERATE: 0.5,
    STRONG: 0.75,
    ALMOST_OPAQUE: 0.9,
    OPAQUE: 1,
  },

  // Opacity classes (Tailwind-compatible)
  OPACITY_CLASSES: {
    NONE: 'opacity-0',
    SLIGHTLY_VISIBLE: 'opacity-5',
    VISIBLE: 'opacity-10',
    FAINT: 'opacity-20',
    LIGHT: 'opacity-25',
    MODERATE: 'opacity-50',
    STRONG: 'opacity-75',
    ALMOST_OPAQUE: 'opacity-90',
    OPAQUE: 'opacity-100',
  },

  // Blur values (in pixels)
  BLUR: {
    NONE: 0,
    SMALL: 2,
    NORMAL: 4,
    LARGE: 8,
    LARGER: 12,
    HUGE: 16,
    MASSIVE: 24,
    GIGANTIC: 40,
  },

  // Blur classes (Tailwind-compatible)
  BLUR_CLASSES: {
    NONE: 'blur-none',
    SMALL: 'blur-sm',
    NORMAL: 'blur',
    LARGE: 'blur-md',
    LARGER: 'blur-lg',
    HUGE: 'blur-xl',
    MASSIVE: 'blur-2xl',
    GIGANTIC: 'blur-3xl',
  },

  // Border radius values (in pixels)
  BORDER_RADIUS: {
    NONE: 0,
    SMALL: 2,
    NORMAL: 4,
    LARGE: 6,
    LARGER: 8,
    HUGE: 12,
    MASSIVE: 16,
    GIGANTIC: 24,
    FULL: 9999,
  },

  // Border radius classes (Tailwind-compatible)
  BORDER_RADIUS_CLASSES: {
    NONE: 'rounded-none',
    SMALL: 'rounded-sm',
    NORMAL: 'rounded',
    LARGE: 'rounded-md',
    LARGER: 'rounded-lg',
    HUGE: 'rounded-xl',
    MASSIVE: 'rounded-2xl',
    GIGANTIC: 'rounded-3xl',
    FULL: 'rounded-full',
  },

  // Shadow values
  SHADOW: {
    NONE: 'none',
    SMALL: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    NORMAL: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    LARGE:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    LARGER:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    HUGE: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    MASSIVE: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    GIGANTIC: '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // Shadow classes (Tailwind-compatible)
  SHADOW_CLASSES: {
    NONE: 'shadow-none',
    SMALL: 'shadow-sm',
    NORMAL: 'shadow',
    LARGE: 'shadow-md',
    LARGER: 'shadow-lg',
    HUGE: 'shadow-xl',
    MASSIVE: 'shadow-2xl',
    INNER: 'shadow-inner',
    COLORED: 'shadow-colored',
  },

  // Transition property classes (Tailwind-compatible)
  TRANSITION_CLASSES: {
    NONE: 'transition-none',
    ALL: 'transition-all',
    COLORS: 'transition-colors',
    OPACITY: 'transition-opacity',
    SHADOW: 'transition-shadow',
    TRANSFORM: 'transition-transform',
    WIDTH: 'transition-width',
    HEIGHT: 'transition-height',
    SPACING: 'transition-spacing',
    BORDER: 'transition-border',
    RING: 'transition-ring',
    FONT: 'transition-font',
    TEXT: 'transition-text',
    FILL: 'transition-fill',
    STROKE: 'transition-stroke',
    BOX: 'transition-box',
    GRID: 'transition-grid',
    FLEX: 'transition-flex',
    POSITION: 'transition-position',
  },

  // Keyframe animation names
  KEYFRAMES: {
    NONE: 'none',
    SPIN: 'spin',
    PING: 'ping',
    PULSE: 'pulse',
    BOUNCE: 'bounce',
    FADE_IN: 'fadeIn',
    FADE_OUT: 'fadeOut',
    SLIDE_IN: 'slideIn',
    SLIDE_OUT: 'slideOut',
    ZOOM_IN: 'zoomIn',
    ZOOM_OUT: 'zoomOut',
    SCALE_IN: 'scaleIn',
    SCALE_OUT: 'scaleOut',
    FLIP: 'flip',
    SHAKE: 'shake',
    WOBBLE: 'wobble',
    JELLO: 'jello',
    HEART_BEAT: 'heartBeat',
    RUBBER_BAND: 'rubberBand',
    SWING: 'swing',
    TADA: 'tada',
    LIGHT_SPEED_IN: 'lightSpeedIn',
    LIGHT_SPEED_OUT: 'lightSpeedOut',
    ROTATE_IN: 'rotateIn',
    ROTATE_OUT: 'rotateOut',
    BOUNCE_IN: 'bounceIn',
    BOUNCE_OUT: 'bounceOut',
    FLASH: 'flash',
    HEAD_SHAKE: 'headShake',
    JACK_IN_THE_BOX: 'jackInTheBox',
  },

  // Animation iteration counts
  ITERATION_COUNT: {
    NONE: 0,
    ONCE: 1,
    TWICE: 2,
    THREE_TIMES: 3,
    FIVE_TIMES: 5,
    TEN_TIMES: 10,
    TWENTY_TIMES: 20,
    FIFTY_TIMES: 50,
    HUNDRED_TIMES: 100,
    INFINITE: 'infinite',
  },

  // Animation fill modes
  FILL_MODE: {
    NONE: 'none',
    FORWARDS: 'forwards',
    BACKWARDS: 'backwards',
    BOTH: 'both',
  },

  // Animation play states
  PLAY_STATE: {
    RUNNING: 'running',
    PAUSED: 'paused',
  },

  // Animation directions
  DIRECTION: {
    NORMAL: 'normal',
    REVERSE: 'reverse',
    ALTERNATE: 'alternate',
    ALTERNATE_REVERSE: 'alternate-reverse',
  },

  // Common animation presets
  PRESETS: {
    FADE_IN: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    FADE_OUT: {
      duration: 'duration-200',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SLIDE_IN_LEFT: {
      duration: 'duration-300',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SLIDE_IN_RIGHT: {
      duration: 'duration-300',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SLIDE_IN_UP: {
      duration: 'duration-300',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SLIDE_IN_DOWN: {
      duration: 'duration-300',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SLIDE_OUT_LEFT: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    SLIDE_OUT_RIGHT: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    SLIDE_OUT_UP: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    SLIDE_OUT_DOWN: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    ZOOM_IN: {
      duration: 'duration-200',
      timing: 'ease-out',
      fill: 'forwards',
    },
    ZOOM_OUT: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    SCALE_IN: {
      duration: 'duration-200',
      timing: 'ease-out',
      fill: 'forwards',
    },
    SCALE_OUT: {
      duration: 'duration-200',
      timing: 'ease-in',
      fill: 'forwards',
    },
    ROTATE_IN: {
      duration: 'duration-300',
      timing: 'ease-out',
      fill: 'forwards',
    },
    ROTATE_OUT: {
      duration: 'duration-300',
      timing: 'ease-in',
      fill: 'forwards',
    },
    BOUNCE_IN: {
      duration: 'duration-500',
      timing: 'ease-out',
      fill: 'forwards',
    },
    BOUNCE_OUT: {
      duration: 'duration-500',
      timing: 'ease-in',
      fill: 'forwards',
    },
    PULSE: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    SPIN: {
      duration: 'duration-1000',
      timing: 'linear',
      iteration: 'infinite',
    },
    BOUNCE: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
      iteration: 'infinite',
    },
    SHAKE: {
      duration: 'duration-500',
      timing: 'ease-in-out',
    },
    WOBBLE: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    JELLO: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    HEART_BEAT: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    RUBBER_BAND: {
      duration: 'duration-750',
      timing: 'ease-in-out',
    },
    SWING: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    TADA: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    LIGHT_SPEED_IN: {
      duration: 'duration-500',
      timing: 'ease-out',
      fill: 'forwards',
    },
    LIGHT_SPEED_OUT: {
      duration: 'duration-500',
      timing: 'ease-in',
      fill: 'forwards',
    },
    FLIP: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    FLASH: {
      duration: 'duration-1000',
      timing: 'ease-in-out',
    },
    HEAD_SHAKE: {
      duration: 'duration-500',
      timing: 'ease-in-out',
    },
    JACK_IN_THE_BOX: {
      duration: 'duration-500',
      timing: 'ease-in-out',
    },
  },
} as const;

// Type for animation values
export type AnimationValues = typeof ANIMATION_VALUES;

// Helper function to get animation duration class
export function getDurationClass(
  duration: keyof AnimationValues['DURATION']
): string {
  return `duration-${ANIMATION_VALUES.DURATION[duration]}`;
}

// Helper function to get animation delay class
export function getDelayClass(delay: keyof AnimationValues['DELAY']): string {
  return `delay-${ANIMATION_VALUES.DELAY[delay]}`;
}

// Helper function to get animation easing class
export function getEasingClass(
  easing: keyof AnimationValues['EASING_CLASSES']
): string {
  return ANIMATION_VALUES.EASING_CLASSES[easing];
}

// Helper function to get animation scale class
export function getScaleClass(
  scale: keyof AnimationValues['SCALE_CLASSES']
): string {
  return ANIMATION_VALUES.SCALE_CLASSES[scale];
}

// Helper function to get animation rotate class
export function getRotateClass(
  rotate: keyof AnimationValues['ROTATE_CLASSES']
): string {
  return ANIMATION_VALUES.ROTATE_CLASSES[rotate];
}

// Helper function to get animation translate class
export function getTranslateClass(
  translate: keyof AnimationValues['TRANSLATE_CLASSES']
): string {
  return ANIMATION_VALUES.TRANSLATE_CLASSES[translate];
}

// Helper function to get animation opacity class
export function getOpacityClass(
  opacity: keyof AnimationValues['OPACITY_CLASSES']
): string {
  return ANIMATION_VALUES.OPACITY_CLASSES[opacity];
}

// Helper function to get animation blur class
export function getBlurClass(
  blur: keyof AnimationValues['BLUR_CLASSES']
): string {
  return ANIMATION_VALUES.BLUR_CLASSES[blur];
}

// Helper function to get animation border radius class
export function getBorderRadiusClass(
  radius: keyof AnimationValues['BORDER_RADIUS_CLASSES']
): string {
  return ANIMATION_VALUES.BORDER_RADIUS_CLASSES[radius];
}

// Helper function to get animation shadow class
export function getShadowClass(
  shadow: keyof AnimationValues['SHADOW_CLASSES']
): string {
  return ANIMATION_VALUES.SHADOW_CLASSES[shadow];
}

// Helper function to get animation transition class
export function getTransitionClass(
  transition: keyof AnimationValues['TRANSITION_CLASSES']
): string {
  return ANIMATION_VALUES.TRANSITION_CLASSES[transition];
}

// Helper function to get animation keyframe class
export function getKeyframeClass(
  keyframe: keyof AnimationValues['KEYFRAMES']
): string {
  return ANIMATION_VALUES.KEYFRAMES[keyframe];
}

// Helper function to get animation preset
export function getAnimationPreset(
  preset: keyof AnimationValues['PRESETS']
): AnimationValues['PRESETS'][keyof AnimationValues['PRESETS']] {
  return ANIMATION_VALUES.PRESETS[preset];
}

// Common animation constants for quick access
export const DURATION_VALUES = ANIMATION_VALUES.DURATION;
export const DELAY_VALUES = ANIMATION_VALUES.DELAY;
export const EASING_VALUES = ANIMATION_VALUES.EASING;
export const SCALE_VALUES = ANIMATION_VALUES.SCALE;
export const ROTATE_VALUES = ANIMATION_VALUES.ROTATE;
export const TRANSLATE_VALUES = ANIMATION_VALUES.TRANSLATE;
export const OPACITY_VALUES = ANIMATION_VALUES.OPACITY;
export const BLUR_VALUES = ANIMATION_VALUES.BLUR;
export const BORDER_RADIUS_VALUES = ANIMATION_VALUES.BORDER_RADIUS;
export const SHADOW_VALUES = ANIMATION_VALUES.SHADOW;
export const TRANSITION_VALUES = ANIMATION_VALUES.TRANSITION_CLASSES;
export const KEYFRAME_VALUES = ANIMATION_VALUES.KEYFRAMES;
export const ITERATION_COUNT_VALUES = ANIMATION_VALUES.ITERATION_COUNT;
export const FILL_MODE_VALUES = ANIMATION_VALUES.FILL_MODE;
export const PLAY_STATE_VALUES = ANIMATION_VALUES.PLAY_STATE;
export const DIRECTION_VALUES = ANIMATION_VALUES.DIRECTION;
export const ANIMATION_PRESETS = ANIMATION_VALUES.PRESETS;
