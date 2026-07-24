/**
 * Theme Configuration
 * Centralizes Tailwind-compatible styling values, colors, and shadow utilities
 * Eliminates hardcoded CSS values in component files
 * Supports environment variable overrides for timing values
 */

import { EnvLoader } from './environment';

/**
 * State shadow utilities for form inputs (non-focus states)
 * Pre-defined shadow classes for success/error/warning visual feedback
 * Use these for transient state indicators like success flash effects
 */
export const STATE_SHADOWS = {
  /**
   * Green success shadow - used for valid input success flash
   * Equivalent to: shadow-[0_0_0_3px_rgba(34,197,94,0.2)]
   */
  SUCCESS: 'shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',

  /**
   * Blue primary shadow - used for active/selected state indicators
   * Equivalent to: shadow-[0_0_0_3px_rgba(59,130,246,0.2)]
   */
  PRIMARY: 'shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',

  /**
   * Red error shadow - used for invalid input error indicators
   * Equivalent to: shadow-[0_0_0_3px_rgba(239,68,68,0.2)]
   */
  ERROR: 'shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',
} as const;

/**
 * Standard classes for <kbd> elements across the application
 * Eliminates hardcoded keyboard shortcut styling in component files
 */
export const KBD_CLASSES =
  'hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-400 rounded text-xs font-sans font-medium text-gray-800';

/**
 * Focus ring shadow utilities for form inputs
 * Pre-defined shadow classes for consistent focus states
 */
export const FOCUS_SHADOWS = {
  /**
   * Blue focus shadow - primary/default focus state
   * Equivalent to: shadow-[0_0_0_3px_rgba(59,130,246,0.2)]
   */
  PRIMARY: 'focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.2)]',

  /**
   * Red focus shadow - error state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(239,68,68,0.2)]
   */
  ERROR: 'focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]',

  /**
   * Green focus shadow - success state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(34,197,94,0.2)]
   */
  SUCCESS: 'focus-visible:shadow-[0_0_0_3px_rgba(34,197,94,0.2)]',

  /**
   * Amber/Yellow focus shadow - warning state focus
   * Equivalent to: shadow-[0_0_0_3px_rgba(245,158,11,0.2)]
   */
  WARNING: 'focus-visible:shadow-[0_0_0_3px_rgba(245,158,11,0.2)]',
} as const;

/**
 * Border color utilities for form states
 */
export const BORDER_COLORS = {
  DEFAULT: 'border-gray-300',
  LIGHT: 'border-gray-200',
  MUTED: 'border-gray-400',
  PRIMARY: 'border-primary-500',
  PRIMARY_LIGHT: 'border-primary-200',
  PRIMARY_DARK: 'border-primary-300',
  ERROR: 'border-red-300',
  ERROR_FOCUS: 'focus-visible:border-red-500',
  SUCCESS: 'border-green-500',
  SUCCESS_LIGHT: 'border-green-100',
  SUCCESS_LIGHTER: 'border-green-200',
  SUCCESS_MEDIUM: 'border-green-300',
  WARNING: 'border-amber-500',
  WARNING_LIGHT: 'border-amber-200',
  INFO: 'border-blue-200',
} as const;

/**
 * Ring color utilities for focus states
 */
export const RING_COLORS = {
  /** Primary ring color */
  PRIMARY: 'focus-visible:ring-primary-500',

  /** Error ring color */
  ERROR: 'focus-visible:ring-red-500',

  /** Success ring color */
  SUCCESS: 'focus-visible:ring-green-500',

  /** Success medium ring color */
  SUCCESS_MEDIUM: 'focus-visible:ring-green-500',
} as const;

/**
 * Text color utilities
 */
export const TEXT_COLORS = {
  PRIMARY: 'text-gray-900',
  SECONDARY: 'text-gray-600',
  MUTED: 'text-gray-500',
  MUTED_LIGHT: 'text-gray-200',
  MUTED_DARK: 'text-gray-400',
  MUTED_LIGHTER: 'text-gray-100',
  ERROR: 'text-red-700',
  ERROR_LIGHT: 'text-red-500',
  SUCCESS: 'text-green-800',
  SUCCESS_LIGHT: 'text-green-500',
  SUCCESS_LIGHTER: 'text-green-100',
  SUCCESS_MEDIUM: 'text-green-600',
  SUCCESS_DARK: 'text-green-700',
  SUCCESS_VERY_LIGHT: 'text-green-400',
  WARNING: 'text-amber-700',
  WARNING_LIGHT: 'text-amber-600',
  WARNING_MEDIUM: 'text-amber-500',
  INFO: 'text-blue-800',
  INFO_LIGHT: 'text-blue-600',
  INFO_DARK: 'text-blue-900',
  BRAND: 'text-primary-600',
  BRAND_LIGHT: 'text-primary-500',
  HOVER_SECONDARY: 'hover:text-gray-600',
  HOVER_PRIMARY: 'hover:text-gray-900',
} as const;

/**
 * Background color utilities
 */
export const BG_COLORS = {
  /** Default background */
  DEFAULT: 'bg-white',
  DARK: 'bg-gray-700',
  LIGHT: 'bg-gray-50',
  LIGHTER: 'bg-gray-100',
  LIGHT_DARK: 'bg-gray-200',
  SUCCESS: 'bg-green-600',
  SUCCESS_LIGHT: 'bg-green-100',
  SUCCESS_LIGHTER: 'bg-green-200',
  SUCCESS_VERY_LIGHT: 'bg-green-50',
  WARNING: 'bg-amber-600',
  WARNING_LIGHT: 'bg-amber-100',
  WARNING_LIGHTER: 'bg-amber-50',
  ERROR: 'bg-red-500',
  INFO: 'bg-blue-100',
  INFO_LIGHT: 'bg-blue-50',
  PROGRESS_NEUTRAL: 'bg-gray-200',
  OVERLAY: 'bg-black/40',
  OVERLAY_DARK: 'bg-black/50',
  BRAND_LIGHT: 'bg-primary-50',
  BRAND_LIGHTER: 'bg-primary-50/30',
  BRAND_LIGHT_HALF: 'bg-primary-50/50',
  BRAND: 'bg-primary-600',
  BRAND_HOVER: 'hover:bg-primary-700',
} as const;

/**
 * Complete input styling configurations by state
 * Combines all relevant utilities for each state
 */
export const INPUT_STYLES = {
  /** Base input classes (always applied) */
  BASE: [
    'w-full px-4 py-3 border rounded-md shadow-sm',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-200',
    'hover:border-gray-400 hover:shadow-md',
  ].join(' '),

  /** Normal/default state */
  NORMAL: [
    BORDER_COLORS.DEFAULT,
    RING_COLORS.PRIMARY,
    FOCUS_SHADOWS.PRIMARY,
  ].join(' '),

  /** Error state */
  ERROR: [
    BORDER_COLORS.ERROR,
    BORDER_COLORS.ERROR_FOCUS,
    RING_COLORS.ERROR,
    FOCUS_SHADOWS.ERROR,
  ].join(' '),

  /** Success state */
  SUCCESS: [
    BORDER_COLORS.SUCCESS,
    RING_COLORS.SUCCESS,
    FOCUS_SHADOWS.SUCCESS,
  ].join(' '),
} as const;

/**
 * Animation duration constants (in ms) for use with inline styles or JS
 * For Tailwind classes, use the corresponding Tailwind classes instead
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Animation delay constants (in ms) for setTimeout/setInterval calls
 * Eliminates hardcoded magic numbers in component timing logic
 */
export const ANIMATION_DELAYS = {
  /** Immediate execution (setTimeout 0 pattern for next tick) */
  IMMEDIATE: 0,
  /** Micro delay for haptic feedback and quick UI updates */
  MICRO: 50,
  /** Small delay for particle stagger effects */
  PARTICLE_STAGGER: 50,
  /** Short delay for step transitions and quick animations */
  SHORT: 100,
  /** Standard delay for element cleanup (URL revocation, DOM removal) */
  CLEANUP: 100,
  /** Medium delay for staggered element transitions */
  MEDIUM: 150,
  /** Long delay for secondary element transitions */
  LONG: 200,
  /** Ripple animation duration */
  RIPPLE: 600,
  /** Step celebration delay before transitioning */
  STEP_TRANSITION: 800,
  /** Shake animation duration */
  SHAKE: 500,
  /** Progress bar transition duration */
  PROGRESS: 700,
  /** Step animation transition duration */
  STEP_ANIMATION: 400,
  FLOAT_DELAY_1: 300,
  FLOAT_DELAY_2: 600,
  CSS_CLASSES: {
    FLOAT_DELAY_1: 'animate-float-delay-1',
    FLOAT_DELAY_2: 'animate-float-delay-2',
  },
  /** Tailwind delay class mapping */
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
  /**
   * Inline style delay strings for use with style prop
   * Returns string with 'ms' suffix for CSS transitions
   */
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
 * Eliminates hardcoded duration-NN classes throughout components
 * Usage: DURATION_TAILWIND[200] → 'duration-200'
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
 * Eliminates hardcoded ripple duration in Button component
 */
export const RIPPLE_CONFIG = {
  /** Duration of the ripple animation in milliseconds */
  DURATION_MS: 600,
  /** Scale factor for ripple expansion */
  SCALE_FACTOR: 4,
  /** Opacity start value (0-1) */
  START_OPACITY: 0.3,
  /** Opacity end value (0-1) */
  END_OPACITY: 0,
} as const;

/**
 * Spacing constants (in pixels) for calculations
 * For Tailwind classes, use the corresponding Tailwind classes instead
 */
export const SPACING_PX = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

/**
 * Size constants for components
 */
export const SIZES = {
  /** Icon sizes */
  ICON: {
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },

  /** Textarea minimum heights */
  TEXTAREA: {
    MIN_HEIGHT: 100,
    MIN_HEIGHT_PX: '100px',
  },

  /** Common component dimensions (Tailwind arbitrary values) */
  COMPONENT: {
    IDEA_INPUT_MIN_HEIGHT: `min-h-[${EnvLoader.number('UI_IDEA_INPUT_MIN_HEIGHT', 120, 80, 200)}px]`,
    TEXTAREA_MIN_HEIGHT: `min-h-[${EnvLoader.number('UI_TEXTAREA_MIN_HEIGHT', 100, 50, 300)}px]`,
    TOAST_BUTTON_MIN_SIZE: `min-h-[${EnvLoader.number('UI_TOAST_BUTTON_MIN_SIZE', 32, 24, 48)}px] min-w-[${EnvLoader.number('UI_TOAST_BUTTON_MIN_SIZE', 32, 24, 48)}px]`,
    KEYBOARD_SHORTCUT_MIN_SIZE: `min-w-[${EnvLoader.number('UI_KBD_MIN_WIDTH', 20, 16, 32)}px] min-h-[${EnvLoader.number('UI_KBD_MIN_HEIGHT', 20, 16, 32)}px]`,
    MODAL_MAX_HEIGHT: 'max-h-[90vh]',
    SCROLLABLE_MAX_HEIGHT: 'max-h-[60vh]',
    ONBOARDING_TOOLTIP_WIDTH: `w-[${EnvLoader.number('UI_ONBOARDING_WIDTH', 300, 200, 500)}px]`,
    /** Negative margin for dashboard arrows - Env: UI_ARROW_NEGATIVE_MARGIN (default: '-1.5rem') */
    ARROW_NEGATIVE_MARGIN: `mt-[${EnvLoader.string('UI_ARROW_NEGATIVE_MARGIN', '-1.5rem')}]`,
  },
} as const;

/**
 * SVG Animation constants for stroke-dasharray and stroke-dashoffset
 * Used for checkmark animations and progress indicators
 * Eliminates hardcoded SVG animation values in components
 */
export const SVG_ANIMATION = {
  /** Checkmark animation path length (matches the checkmark SVG path) */
  CHECKMARK_PATH_LENGTH: 24,

  /** Stroke dasharray values for different animation states */
  DASH_ARRAY: {
    /** Full path length for complete visibility */
    FULL: 24,
    /** Hidden state (for animation start) */
    HIDDEN: 24,
  } as const,

  /** Stroke dashoffset values for different animation states */
  DASH_OFFSET: {
    /** Fully visible (animation complete) - matches numeric value used in TaskItem.tsx */
    VISIBLE: 0,
    /** Hidden (animation start) - matches string value used in InputWithValidation.tsx */
    HIDDEN: '24',
    /** Fully visible as string variant */
    VISIBLE_STR: '0',
    /** Full hidden state (animation start) - numeric variant for IdeaReadyIndicator */
    FULL: 24,
  } as const,

  /** Progress circle calculations */
  PROGRESS: {
    /** Default radius for progress circles */
    DEFAULT_RADIUS: 10,
    /**
     * Calculate circumference for a given radius
     * @param radius - Circle radius
     * @returns Circumference (2 * PI * radius)
     */
    getCircumference: (radius: number) => 2 * Math.PI * radius,
    /**
     * Calculate stroke-dashoffset for a given progress percentage
     * @param circumference - Circle circumference
     * @param progress - Progress percentage (0-100)
     * @returns Stroke dashoffset value
     */
    getDashOffset: (circumference: number, progress: number) =>
      circumference * (1 - progress / 100),
  },
} as const;

/**
 * SVG ViewBox Configuration
 * Centralizes SVG viewBox values used across all icon components.
 * Eliminates hardcoded viewBox="0 0 24 24" in 47+ component files.
 *
 * Usage:
 * ```typescript
 * import { SVG_VIEWBOX } from '@/lib/config';
 * <svg viewBox={SVG_VIEWBOX.STANDARD} />
 * ```
 */
export const SVG_VIEWBOX = {
  /**
   * Standard viewBox for most icons (24x24)
   * Used by Lucide/Feather icon set and custom SVG icons
   */
  STANDARD: '0 0 24 24',

  /**
   * Small viewBox for smaller icons (20x20)
   * Used by some utility icons (Info, Alert)
   */
  SMALL: '0 0 20 20',

  /**
   * Large viewBox for scroll arrows and custom icons (48x48)
   */
  LARGE: '0 0 48 48',
} as const;

/**
 * Celebration animation colors
 * Used for success/confetti animations
 * Eliminates hardcoded color values in SuccessCelebration component
 * Supports environment variable overrides
 */
export const CELEBRATION_COLORS = {
  /** Success green */
  SUCCESS: EnvLoader.string('CELEBRATION_COLOR_SUCCESS', '#10B981'),
  /** Primary blue */
  PRIMARY: EnvLoader.string('CELEBRATION_COLOR_PRIMARY', '#3B82F6'),
  /** Purple accent */
  PURPLE: EnvLoader.string('CELEBRATION_COLOR_PURPLE', '#8B5CF6'),
  /** Amber/warning */
  AMBER: EnvLoader.string('CELEBRATION_COLOR_AMBER', '#F59E0B'),
  /** Pink accent */
  PINK: EnvLoader.string('CELEBRATION_COLOR_PINK', '#EC4899'),
  /** Cyan accent */
  CYAN: EnvLoader.string('CELEBRATION_COLOR_CYAN', '#06B6D4'),
  /** All colors as array for iteration */
  ALL: (() => {
    const colors = [
      EnvLoader.string('CELEBRATION_COLOR_SUCCESS', '#10B981'),
      EnvLoader.string('CELEBRATION_COLOR_PRIMARY', '#3B82F6'),
      EnvLoader.string('CELEBRATION_COLOR_PURPLE', '#8B5CF6'),
      EnvLoader.string('CELEBRATION_COLOR_AMBER', '#F59E0B'),
      EnvLoader.string('CELEBRATION_COLOR_PINK', '#EC4899'),
      EnvLoader.string('CELEBRATION_COLOR_CYAN', '#06B6D4'),
    ];
    return colors as unknown as readonly string[];
  })(),
  /** Progress circle colors - eliminates hardcoded colors in StepCelebration */
  PROGRESS_CIRCLE: {
    /** Background track color (gray-200) */
    TRACK: EnvLoader.string('CELEBRATION_PROGRESS_TRACK_COLOR', '#e5e7eb'),
    /** Progress indicator color (blue-600/primary) */
    PROGRESS: EnvLoader.string(
      'CELEBRATION_PROGRESS_INDICATOR_COLOR',
      '#2563eb'
    ),
    /** Radius for the progress circle */
    RADIUS: EnvLoader.number('CELEBRATION_PROGRESS_RADIUS', 45, 20, 100),
  },
  /** Shadow colors for progress glow effects - eliminates hardcoded rgba() in StepCelebration */
  SHADOWS: {
    /** Drop shadow for progress circle (blue-600 at 40% opacity) */
    DROP_SHADOW: EnvLoader.string(
      'CELEBRATION_SHADOW_DROP',
      'rgba(37, 99, 235, 0.4)'
    ),
    /** Box shadow for progress bar (blue-600 at 50% opacity) */
    BOX_SHADOW: EnvLoader.string(
      'CELEBRATION_SHADOW_BOX',
      'rgba(37, 99, 235, 0.5)'
    ),
  },
} as const;

/**
 * Brand Colors
 * Eliminates hardcoded brand colors in layout metadata and meta tags
 * Env: BRAND_COLOR_PRIMARY (default: '#2563eb')
 */
export const BRAND_COLORS = {
  /** Primary brand color - used for theme-color, TileColor, and progress indicators */
  PRIMARY: EnvLoader.string('BRAND_COLOR_PRIMARY', '#2563eb'),
} as const;

/**
 * Confetti Colors for CopyButton and Celebration Components
 * Eliminates hardcoded confetti color arrays in CopyButton.tsx
 * Supports environment variable overrides for customization
 */
export const CONFETTI_COLORS = {
  /** Primary confetti colors - used for copy button confetti animation */
  PRIMARY: [
    EnvLoader.string('CONFETTI_COLOR_1', '#22c55e'),
    EnvLoader.string('CONFETTI_COLOR_2', '#3b82f6'),
    EnvLoader.string('CONFETTI_COLOR_3', '#eab308'),
    EnvLoader.string('CONFETTI_COLOR_4', '#ec4899'),
    EnvLoader.string('CONFETTI_COLOR_5', '#8b5cf6'),
  ] as readonly string[],
  /** Number of particles to generate per confetti burst */
  PARTICLE_COUNT: EnvLoader.number('CONFETTI_PARTICLE_COUNT', 6, 3, 12),
  /** Minimum distance from center for confetti particles (px) */
  MIN_DISTANCE: EnvLoader.number('CONFETTI_MIN_DISTANCE', 20, 5, 50),
  /** Maximum additional random distance (px) */
  MAX_DISTANCE_VARIANCE: EnvLoader.number(
    'CONFETTI_MAX_DISTANCE_VARIANCE',
    20,
    5,
    50
  ),
  /** Minimum particle size (px) */
  MIN_SIZE: EnvLoader.number('CONFETTI_MIN_SIZE', 4, 2, 10),
  /** Maximum additional random size (px) */
  MAX_SIZE_VARIANCE: EnvLoader.number('CONFETTI_MAX_SIZE_VARIANCE', 6, 2, 10),
  /** Delay between particle animations (ms) */
  PARTICLE_DELAY_MS: EnvLoader.number('CONFETTI_PARTICLE_DELAY_MS', 30, 5, 100),
} as const;

/**
 * OAuth provider brand colors
 * Used for social login buttons (Google, GitHub, etc.)
 * Eliminates hardcoded brand colors in login/signup pages
 */
export const OAUTH_PROVIDER_COLORS = {
  GOOGLE: {
    BLUE: EnvLoader.string('GOOGLE_OAUTH_BLUE', '#4285F4'),
    GREEN: EnvLoader.string('GOOGLE_OAUTH_GREEN', '#34A853'),
    YELLOW: EnvLoader.string('GOOGLE_OAUTH_YELLOW', '#FBBC05'),
    RED: EnvLoader.string('GOOGLE_OAUTH_RED', '#EA4335'),
  } as const,
  GITHUB: {
    BLACK: EnvLoader.string('GITHUB_OAUTH_BLACK', '#24292F'),
  } as const,
} as const;

/**
 * Animation physics constants
 * Used for particle animations and physics calculations
 */
export const ANIMATION_PHYSICS = {
  /** Gravity constant for particle fall */
  GRAVITY: 0.8,
  /** Friction coefficient for velocity decay */
  FRICTION: 0.98,
  /** Default particle count for celebrations */
  PARTICLE_COUNT: 30,
  /** Env: THEME_ANIMATION_DEFAULT_DURATION_MS (default: 2000) */
  DEFAULT_DURATION_MS: EnvLoader.number(
    'THEME_ANIMATION_DEFAULT_DURATION_MS',
    2000,
    500,
    10000
  ),
  /** Env: THEME_ANIMATION_REDUCED_MOTION_DURATION_MS (default: 500) */
  REDUCED_MOTION_DURATION_MS: EnvLoader.number(
    'THEME_ANIMATION_REDUCED_MOTION_DURATION_MS',
    500,
    100,
    2000
  ),
  /** Env: THEME_STEP_CELEBRATION_DURATION_MS (default: 1500) */
  STEP_CELEBRATION_DURATION_MS: EnvLoader.number(
    'THEME_STEP_CELEBRATION_DURATION_MS',
    1500,
    500,
    5000
  ),
  /** Particle opacity decay rate */
  OPACITY_DECAY: 0.015,
  /** Velocity multiplier for particle movement */
  VELOCITY_MULTIPLIER: 0.5,
  /** Center position offset range (percentage) */
  CENTER_OFFSET: 20,
  /** Center position for particle generation (percentage) */
  CENTER_POSITION: EnvLoader.number(
    'THEME_ANIMATION_CENTER_POSITION',
    50,
    25,
    75
  ),
  /** Maximum horizontal velocity */
  MAX_HORIZONTAL_VELOCITY: 30,
  /** Maximum vertical velocity (negative = upward) */
  MAX_VERTICAL_VELOCITY: 25,
  /** Minimum vertical velocity boost */
  MIN_VERTICAL_BOOST: 10,
  /** Particle size range */
  PARTICLE_SIZE: {
    MIN: 4,
    MAX: 8,
  },
  /** Rotation velocity multiplier */
  ROTATION_MULTIPLIER: 2,
  /** Degrees in a full rotation */
  FULL_ROTATION_DEGREES: 360,
  /** Particle scale range */
  SCALE_RANGE: {
    MIN: 0.5,
    MAX: 1.0,
  },
} as const;

/**
 * Button Component Styles
 * Centralizes all button variant, size, and state styles
 * Eliminates hardcoded Tailwind classes in Button component
 */
export const BUTTON_STYLES = {
  /** Variant styles for different button types */
  VARIANTS: {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 disabled:hover:bg-primary-600 btn-glow-hover shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    secondary:
      'bg-gray-600 text-white hover:bg-gray-700 disabled:hover:bg-gray-600 shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    outline:
      'border-2 border-gray-700 text-gray-700 hover:bg-gray-50 disabled:hover:bg-transparent shadow-sm hover:shadow-md active:shadow-sm disabled:hover:shadow-sm disabled:active:shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0 hover:border-gray-900 disabled:hover:border-gray-700',
    ghost:
      'text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
    danger:
      'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600 btn-glow-hover shadow-md hover:shadow-lg active:shadow-sm disabled:hover:shadow-md disabled:active:shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0 disabled:active:translate-y-0',
  } as const,

  /** Focus ring classes per variant */
  FOCUS_RINGS: {
    primary: 'focus-visible:ring-primary-500',
    secondary: 'focus-visible:ring-gray-500',
    outline: 'focus-visible:ring-gray-500',
    ghost: 'focus-visible:ring-gray-500',
    danger: 'focus-visible:ring-red-500',
  } as const,

  SIZES: {
    sm: `px-3 py-1.5 text-sm min-h-[${EnvLoader.number('UI_BUTTON_SM_HEIGHT', 36, 28, 48)}px]`,
    md: `px-4 py-2 text-base min-h-[${EnvLoader.number('UI_BUTTON_MD_HEIGHT', 44, 36, 56)}px]`,
    lg: `px-6 py-3 text-lg min-h-[${EnvLoader.number('UI_BUTTON_LG_HEIGHT', 48, 40, 64)}px]`,
  } as const,

  /** State classes for disabled/loading states */
  STATES: {
    disabled:
      'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:translate-y-0 active:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 pointer-events-none shadow-none',
    enabled:
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
  } as const,

  /** Base classes applied to all buttons */
  BASE: 'rounded-md font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none touch-manipulation relative overflow-hidden animate-focus-ring',
} as const;

/**
 * Alert Component Styles
 * Centralizes all alert type styles including colors
 * Eliminates hardcoded Tailwind classes in Alert component
 */
export const ALERT_STYLES = {
  error: {
    container: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    textColor: 'text-red-800',
    subtextColor: 'text-red-600',
    focusRing: 'focus-visible:ring-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
    textColor: 'text-yellow-800',
    subtextColor: 'text-yellow-600',
    focusRing: 'focus-visible:ring-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    textColor: 'text-blue-800',
    subtextColor: 'text-blue-600',
    focusRing: 'focus-visible:ring-blue-500',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    textColor: 'text-green-800',
    subtextColor: 'text-green-600',
    focusRing: 'focus-visible:ring-green-500',
  },
} as const;

/** Base classes applied to all alerts */
export const ALERT_BASE_STYLES = {
  container: 'border rounded-lg p-4 flex items-start gap-3',
  transition:
    'transition-all duration-200 ease-out motion-reduce:transition-none',
  visible: 'opacity-100 scale-100 translate-y-0',
  exiting: 'opacity-0 scale-[0.98] translate-y-[-8px]',
  closeButton: `flex-shrink-0 ml-2 hover:opacity-75 focus:outline-none rounded-md p-1 min-h-[${EnvLoader.number('UI_ALERT_CLOSE_BUTTON_SIZE', 32, 24, 48)}px] min-w-[${EnvLoader.number('UI_ALERT_CLOSE_BUTTON_SIZE', 32, 24, 48)}px] transition-opacity`,
} as const;

/**
 * Deliverable Card Styles
 * Centralizes deliverable card styling based on progress status
 * Eliminates inline style logic in DeliverableCard component
 */
export const DELIVERABLE_STYLES = {
  /** Completed deliverable (100% progress) */
  COMPLETED: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  /** In-progress deliverable (>0% and <100%) */
  IN_PROGRESS: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  /** Not started deliverable (0% progress) */
  NOT_STARTED: {
    bgColor: 'bg-white',
    borderColor: 'border-gray-200',
  },
  /**
   * Get style based on progress percentage
   * @param progress - Progress percentage (0-100)
   * @returns Style object with bgColor and borderColor
   */
  getByProgress: (progress: number) => {
    if (progress === 100) return DELIVERABLE_STYLES.COMPLETED;
    if (progress > 0) return DELIVERABLE_STYLES.IN_PROGRESS;
    return DELIVERABLE_STYLES.NOT_STARTED;
  },
} as const;

export type FocusShadows = typeof FOCUS_SHADOWS;
export type BorderColors = typeof BORDER_COLORS;
export type RingColors = typeof RING_COLORS;
export type TextColors = typeof TEXT_COLORS;
export type BgColors = typeof BG_COLORS;
export type InputStyles = typeof INPUT_STYLES;
export type CelebrationColors = typeof CELEBRATION_COLORS;
export type AnimationPhysics = typeof ANIMATION_PHYSICS;
export type ButtonStyles = typeof BUTTON_STYLES;
export type AlertStyles = typeof ALERT_STYLES;
export type AnimationDelays = typeof ANIMATION_DELAYS;

/**
 * Action Colors for Dashboard and Table Actions
 * Centralizes action button colors (continue, view, delete, etc.)
 * Eliminates hardcoded color classes in dashboard and results pages
 */
export const ACTION_COLORS = {
  /** Continue action - typically primary brand color */
  CONTINUE: {
    text: 'text-primary-600',
    hoverText: 'hover:text-primary-900',
    bg: '',
    hoverBg: 'hover:bg-primary-50',
    ariaLabel: 'Continue working on this idea',
  },
  /** View action - green for positive action */
  VIEW: {
    text: 'text-green-600',
    hoverText: 'hover:text-green-900',
    bg: '',
    hoverBg: 'hover:bg-green-50',
    ariaLabel: 'View blueprint',
  },
  /** Delete action - red for destructive action */
  DELETE: {
    text: 'text-red-600',
    hoverText: 'hover:text-red-900',
    bg: '',
    hoverBg: 'hover:bg-red-50',
    ariaLabel: 'Delete this item',
  },
  /** Edit action - indigo for secondary action */
  EDIT: {
    text: 'text-indigo-600',
    hoverText: 'hover:text-indigo-900',
    bg: '',
    hoverBg: 'hover:bg-indigo-50',
    ariaLabel: 'Edit this item',
  },
} as const;

/**
 * Table Component Patterns
 * Centralizes table styling for dashboard and other list views
 * Eliminates hardcoded Tailwind classes in table components
 */
export const TABLE_PATTERNS = {
  /** Table container */
  container: 'w-full',
  /** Table header styles */
  header: {
    container: 'bg-gray-50',
    cell: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
  },
  /** Table body row styles */
  row: {
    default: '',
    hover: 'hover:bg-gray-50',
    even: '',
    odd: '',
  },
  /** Table cell styles */
  cell: {
    padding: 'px-6 py-4 whitespace-nowrap',
    text: 'text-sm text-gray-500',
    primary: 'text-sm font-medium text-gray-900',
  },
  /** Actions cell */
  actions: {
    container: 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium',
    buttonGroup: 'flex justify-end gap-2',
    buttonBase: 'px-2 py-1 rounded transition-colors',
  },
  /** Status badge styles */
  statusBadge: {
    base: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
  },
} as const;

/**
 * Modal Component Patterns
 * Centralizes modal/dialog styling
 * Eliminates hardcoded Tailwind classes in modal components
 */
export const MODAL_PATTERNS = {
  /** Overlay/backdrop */
  overlay: 'fixed inset-0 bg-gray-900/50',
  /** Modal container */
  container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
  /** Modal content box */
  content: {
    container: 'bg-white rounded-lg shadow-lg p-8 max-w-md w-full',
    transition: 'transition-all duration-200',
  },
  /** Modal header */
  header: {
    container: 'mb-6',
    title: 'text-lg font-semibold text-gray-900',
    description: 'text-gray-600 mb-6',
  },
  /** Modal footer with buttons */
  footer: {
    container: 'flex justify-end gap-3',
    button: 'px-4 py-2 rounded-md transition-colors',
    cancelButton: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
    confirmButton: 'bg-red-600 text-white hover:bg-red-700',
  },
  /** Close button */
  closeButton: {
    iconSize: 'w-5 h-5',
    iconColor: 'text-red-600',
  },
  /** Danger zone icon */
  dangerIcon: {
    container:
      'w-10 h-10 rounded-full bg-red-100 flex items-center justify-center',
    icon: 'w-5 h-5 text-red-600',
  },
} as const;

/**
 * Spinner Component Patterns
 * Centralizes loading spinner styling
 * Eliminates hardcoded Tailwind classes in loading components
 */
export const SPINNER_PATTERNS = {
  /** Default spinner */
  default: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
    },
    border: 'border-b-2',
    borderColor: 'border-indigo-600',
    borderColorAlt: 'border-transparent',
  },
  /** Loading placeholder for dynamic imports */
  placeholder: {
    container: 'px-4 py-2 bg-gray-200 rounded-md text-gray-600',
  },
} as const;

/**
 * SVG Stroke Width Configuration
 * Centralizes SVG strokeWidth values used across all icon and visualization components.
 * Eliminates hardcoded numeric strokeWidth props in 17+ component files.
 *
 * Usage:
 * ```typescript
 * import { SVG_STROKE_WIDTHS } from '@/lib/config';
 * <svg strokeWidth={SVG_STROKE_WIDTHS.STANDARD} />
 * ```
 */
export const SVG_STROKE_WIDTHS = {
  /**
   * Standard stroke width (2px) - default for most icons
   * Env: SVG_STROKE_WIDTH_STANDARD (default: 2)
   */
  STANDARD: EnvLoader.number('SVG_STROKE_WIDTH_STANDARD', 2, 1, 4),

  /**
   * Light stroke width (1.5px) - for thin/delicate icons
   * Env: SVG_STROKE_WIDTH_LIGHT (default: 1.5)
   */
  LIGHT: EnvLoader.number('SVG_STROKE_WIDTH_LIGHT', 1.5, 0.5, 3),

  /**
   * Thick stroke width (3px) - for emphasis icons (checkmarks, close)
   * Env: SVG_STROKE_WIDTH_THICK (default: 3)
   */
  THICK: EnvLoader.number('SVG_STROKE_WIDTH_THICK', 3, 2, 6),

  /**
   * Extra thick stroke width (2.5px) - for progress indicators
   * Env: SVG_STROKE_WIDTH_EXTRA_THICK (default: 2.5)
   */
  EXTRA_THICK: EnvLoader.number('SVG_STROKE_WIDTH_EXTRA_THICK', 2.5, 1, 5),

  /**
   * Spinner stroke width (4px) - for loading spinner circles
   * Env: SVG_STROKE_WIDTH_SPINNER (default: 4)
   */
  SPINNER: EnvLoader.number('SVG_STROKE_WIDTH_SPINNER', 4, 2, 6),
} as const;

/**
 * SVG Size Configuration
 * Centralizes SVG icon size Tailwind classes used across all icon components.
 * Eliminates hardcoded w-N h-N classes in 20+ component files.
 *
 * Usage:
 * ```typescript
 * import { SVG_SIZES } from '@/lib/config';
 * <svg className={SVG_SIZES.SM} />  // w-5 h-5
 * <svg className={SVG_SIZES.MD} />  // w-6 h-6
 * <svg className={SVG_SIZES.LG} />  // w-8 h-8
 * ```
 */
export const SVG_SIZES = {
  /**
   * Extra small icon (8x8px) - for dots, indicators
   * Equivalent to: w-2 h-2
   */
  XS: 'w-2 h-2',

  /**
   * Small icon (12x12px) - for tiny indicators, bullets
   * Equivalent to: w-3 h-3
   */
  SM: 'w-3 h-3',

  /**
   * Small-Medium icon (14x14px) - for compact inline icons
   * Equivalent to: w-3.5 h-3.5
   */
  SMD: 'w-3.5 h-3.5',

  /**
   * Medium icon (16x16px) - default for inline icons
   * Equivalent to: w-4 h-4
   */
  MD: 'w-4 h-4',

  /**
   * Large icon (20x20px) - for standard UI icons
   * Equivalent to: w-5 h-5
   */
  LG: 'w-5 h-5',

  /**
   * Extra large icon (24x24px) - for emphasis icons
   * Equivalent to: w-6 h-6
   */
  XL: 'w-6 h-6',

  /**
   * 2XL icon (32x32px) - for prominent icons
   * Equivalent to: w-8 h-8
   */
  '2XL': 'w-8 h-8',

  /**
   * 3XL icon (40x40px) - for large buttons
   * Equivalent to: w-10 h-10
   */
  '3XL': 'w-10 h-10',

  /**
   * 4XL icon (48x48px) - for featured icons
   * Equivalent to: w-12 h-12
   */
  '4XL': 'w-12 h-12',

  /**
   * 5XL icon (64x64px) - for hero/celebration icons
   * Equivalent to: w-16 h-16
   */
  '5XL': 'w-16 h-16',
} as const;

/**
 * SVG Center Constants
 * Centralizes hardcoded cx, cy, and r values for SVG circles
 * Eliminates hardcoded cx="12" cy="12" r="10" patterns in component files
 *
 * Usage:
 * ```typescript
 * import { SVG_CIRCLE } from '@/lib/config';
 * <circle cx={SVG_CIRCLE.CX_24} cy={SVG_CIRCLE.CY_24} r={SVG_CIRCLE.R_10} />
 * ```
 */
export const SVG_CIRCLE = {
  /** Center X for 24x24 viewBox (standard) */
  CX_24: '12',
  /** Center Y for 24x24 viewBox (standard) */
  CY_24: '12',
  /** Radius for 24x24 viewBox (standard) */
  R_10: '10',
  /** Center X for 16x16 viewBox */
  CX_16: '8',
  /** Center Y for 16x16 viewBox */
  CY_16: '8',
  /** Radius for 16x16 viewBox */
  R_6: '6',
} as const;

/**
 * Gap Size Configuration
 * Centralizes gap Tailwind classes used across all flex/grid layouts.
 * Eliminates hardcoded gap-N classes in 15+ component files.
 *
 * Usage:
 * ```typescript
 * import { GAP_SIZES } from '@/lib/config';
 * <div className={`flex ${GAP_SIZES.SM}`} />  // gap-2
 * <div className={`flex ${GAP_SIZES.MD}`} />  // gap-4
 * ```
 */
export const GAP_SIZES = {
  /**
   * Extra small gap (4px) - for tight inline elements
   * Equivalent to: gap-1
   */
  XS: 'gap-1',

  /**
   * Small gap (6px) - for compact layouts
   * Equivalent to: gap-1.5
   */
  SM: 'gap-1.5',

  /**
   * Medium gap (8px) - default for most layouts
   * Equivalent to: gap-2
   */
  MD: 'gap-2',

  /**
   * Large gap (12px) - for spaced layouts
   * Equivalent to: gap-3
   */
  LG: 'gap-3',

  /**
   * Extra large gap (16px) - for section spacing
   * Equivalent to: gap-4
   */
  XL: 'gap-4',

  /**
   * 2XL gap (24px) - for major section separation
   * Equivalent to: gap-6
   */
  '2XL': 'gap-6',
} as const;

/**
 * Z-Index Layer Configuration
 * Centralizes z-index values used across all UI layering components.
 * Eliminates hardcoded z-NN tailwind classes in 10+ component files.
 * Follows a consistent layering system: base < overlay < modal < toast < celebration.
 *
 * Usage:
 * ```typescript
 * import { Z_INDEX_LAYERS } from '@/lib/config';
 * <div className={`z-[${Z_INDEX_LAYERS.MODAL}]`} />
 * // or as style: style={{ zIndex: Z_INDEX_LAYERS.MODAL }}
 * ```
 */
export const Z_INDEX_LAYERS = {
  /**
   * Base layer (0) - default stacking context
   */
  BASE: 0,

  /**
   * Content layer (10) - above base, for regular content
   */
  CONTENT: 10,

  /**
   * Sticky layer (20) - for sticky headers and navigation
   */
  STICKY: 20,

  /**
   * Overlay layer (30) - for backdrop overlays and highlights
   * Env: Z_INDEX_OVERLAY (default: 30)
   */
  OVERLAY: EnvLoader.number('Z_INDEX_OVERLAY', 30, 10, 50),

  /**
   * Mobile navigation overlay layer (35) - for mobile nav backdrop
   * Env: Z_INDEX_MOBILE_OVERLAY (default: 35)
   */
  MOBILE_OVERLAY: EnvLoader.number('Z_INDEX_MOBILE_OVERLAY', 35, 20, 55),

  /**
   * Modal layer (40) - for modals, drawers, and onboarding
   * Env: Z_INDEX_MODAL (default: 40)
   */
  MODAL: EnvLoader.number('Z_INDEX_MODAL', 40, 20, 60),

  /**
   * Mobile navigation menu layer (45) - for mobile nav menu
   * Env: Z_INDEX_MOBILE_MENU (default: 45)
   */
  MOBILE_MENU: EnvLoader.number('Z_INDEX_MOBILE_MENU', 45, 30, 65),

  /**
   * Toast layer (50) - for toast notifications and tooltips
   * Env: Z_INDEX_TOAST (default: 50)
   */
  TOAST: EnvLoader.number('Z_INDEX_TOAST', 50, 30, 70),

  /**
   * Celebration layer (50) - for celebration animations and success popups
   * Env: Z_INDEX_CELEBRATION (default: 50)
   */
  CELEBRATION: EnvLoader.number('Z_INDEX_CELEBRATION', 50, 30, 70),
} as const;

/**
 * Card Component Patterns
 * Centralizes card/container styling used across pages and components
 * Eliminates hardcoded 'bg-white rounded-lg shadow-lg' patterns in 24+ locations
 *
 * Usage:
 * ```typescript
 * import { CARD_PATTERNS } from '@/lib/config';
 * <div className={CARD_PATTERNS.BASE}>...</div>
 * <div className={CARD_PATTERNS.CENTERED}>...</div>
 * ```
 */
export const CARD_PATTERNS = {
  /** Base card: white background, rounded corners, shadow, padding */
  BASE: 'bg-white rounded-lg shadow-lg p-8',

  /** Centered card: base card with text-center */
  CENTERED: 'bg-white rounded-lg shadow-lg p-8 text-center',

  /** Large centered card: wider padding */
  CENTERED_LARGE: 'bg-white rounded-lg shadow-lg p-12 text-center',

  /** Card with overflow hidden: for tables and lists */
  OVERFLOW_HIDDEN: 'bg-white rounded-lg shadow-lg overflow-hidden',

  /** Responsive card: adjusts padding at sm breakpoint */
  RESPONSIVE: 'bg-white rounded-lg shadow-lg p-6 sm:p-8',

  /** Card with top margin */
  WITH_MARGIN: 'bg-white rounded-lg shadow-lg p-8 mt-8',

  /** Animated card with fade-in */
  ANIMATED: 'bg-white rounded-lg shadow-lg p-8 text-center fade-in',

  /** Skeleton loading card */
  SKELETON: 'bg-white rounded-lg shadow-lg p-8 animate-pulse',

  /** Compact card: smaller padding */
  COMPACT: 'bg-white rounded-lg shadow-lg p-6',

  /** Content card: for inline content like answers */
  CONTENT: 'bg-white border border-gray-200 rounded-md p-4 mb-4 space-y-2',

  /** Flat card: no shadow, subtle border */
  FLAT: 'bg-white rounded-lg border border-gray-200 p-8',
} as const;

/**
 * Loading State Patterns
 * Centralizes loading placeholder styling
 * Eliminates hardcoded 'bg-gray-100 p-4' loading patterns
 */
export const LOADING_PATTERNS = {
  /** Simple loading placeholder */
  SIMPLE: 'bg-gray-100 p-4',

  /** Loading with rounded corners */
  ROUNDED: 'bg-gray-100 p-4 rounded',

  /** Loading with text */
  TEXT: 'text-center text-gray-600',
} as const;

/**
 * Skeleton Loading Patterns
 * Centralizes skeleton loading component styling
 * Eliminates hardcoded CSS values in Skeleton.tsx and other skeleton components
 */
export const SKELETON_PATTERNS = {
  /** Base skeleton class for reduced motion preference */
  BASE_REDUCED_MOTION: 'bg-gray-200',

  /** Base skeleton class with shimmer animation */
  BASE_ANIMATED:
    'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]',

  /** Rectangle variant (default) */
  RECT: '',

  /** Circle variant */
  CIRCLE: 'rounded-full',

  /** Text variant */
  TEXT: 'h-4 rounded',
} as const;

/**
 * Gradient Patterns
 * Centralizes gradient styling used across components
 * Eliminates hardcoded gradient classes in login, signup, and other pages
 */
export const GRADIENT_PATTERNS = {
  /** Shimmer effect for buttons and interactive elements */
  SHIMMER:
    'absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer',

  /** Progress bar gradient */
  PROGRESS_BAR:
    'bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700 ease-out',

  /** Success button gradient */
  SUCCESS_BUTTON: 'bg-gradient-to-r from-green-400 to-green-600',

  /** Primary button gradient */
  PRIMARY_BUTTON: 'bg-gradient-to-r from-primary-400 to-primary-600',

  /** Decorative divider gradient */
  DIVIDER_PRIMARY: 'bg-gradient-to-r from-primary-300 to-primary-100',

  /** Decorative divider gradient (amber to primary) */
  DIVIDER_AMBER_PRIMARY: 'bg-gradient-to-r from-amber-300 to-primary-300',

  /** Decorative divider gradient (primary to green) */
  DIVIDER_PRIMARY_GREEN: 'bg-gradient-to-r from-primary-300 to-green-300',
} as const;

export type SkeletonPatterns = typeof SKELETON_PATTERNS;
export type GradientPatterns = typeof GRADIENT_PATTERNS;

/**
 * Text Color Utility Classes
 * Centralizes text color Tailwind classes used across all components
 * Eliminates hardcoded text-gray-* and text-primary-* classes in 50+ locations
 *
 * Usage:
 * ```typescript
 * import { TEXT_COLOR_CLASSES } from '@/lib/config';
 * <h1 className={TEXT_COLOR_CLASSES.HEADING}>...</h1>
 * <p className={TEXT_COLOR_CLASSES.BODY}>...</p>
 * ```
 */
export const TEXT_COLOR_CLASSES = {
  /** Primary heading text (gray-900) */
  HEADING: 'text-gray-900',

  /** Secondary/subheading text (gray-600) */
  BODY: 'text-gray-600',

  /** Tertiary/muted text (gray-500) */
  MUTED: 'text-gray-500',

  /** Disabled/placeholder text (gray-500) */
  PLACEHOLDER: 'text-gray-500',

  /** Primary brand text (primary-600) */
  BRAND: 'text-primary-600',

  /** Primary brand text hover (primary-900) */
  BRAND_HOVER: 'hover:text-primary-900',

  /** Error text (red-700) */
  ERROR: 'text-red-700',

  /** Success text (green-800) */
  SUCCESS: 'text-green-800',

  /** Success dark text (green-700) */
  SUCCESS_DARK: 'text-green-700',

  /** Success medium text (green-600) */
  SUCCESS_MEDIUM: 'text-green-600',

  /** Warning text (amber-700) */
  WARNING: 'text-amber-700',

  /** Warning light text (amber-600) */
  WARNING_LIGHT: 'text-amber-600',

  /** Warning medium text (amber-500) */
  WARNING_MEDIUM: 'text-amber-500',

  /** Info text (blue-800) */
  INFO: 'text-blue-800',

  /** Info light text (blue-600) */
  INFO_LIGHT: 'text-blue-600',

  /** Info dark text (blue-900) */
  INFO_DARK: 'text-blue-900',

  /** Inverse text (white) */
  INVERSE: 'text-white',

  /** Link text with underline (gray-500 hover:primary-600) */
  LINK: 'text-gray-500 hover:text-primary-600 underline',

  /** Small label text (gray-500) */
  LABEL: 'text-gray-500',

  /** Input text (gray-800) */
  INPUT: 'text-gray-800',
} as const;

/**
 * Background Color Utility Classes
 * Centralizes background color Tailwind classes used across all components
 * Eliminates hardcoded bg-gray-* and bg-primary-* classes in 40+ locations
 *
 * Usage:
 * ```typescript
 * import { BG_COLOR_CLASSES } from '@/lib/config';
 * <div className={BG_COLOR_CLASSES.PAGE}>...</div>
 * <div className={BG_COLOR_CLASSES.CARD}>...</div>
 * ```
 */
export const BG_COLOR_CLASSES = {
  /** Page background (gray-50) */
  PAGE: 'bg-gray-50',

  /** Card background (white) */
  CARD: 'bg-white',

  /** Subtle background (gray-100) */
  SUBTLE: 'bg-gray-100',

  /** Light background (gray-200) */
  LIGHT: 'bg-gray-200',

  /** Primary brand background (primary-600) */
  BRAND: 'bg-primary-600',

  /** Primary brand background hover (primary-700) */
  BRAND_HOVER: 'hover:bg-primary-700',

  /** Success background (green-600) */
  SUCCESS: 'bg-green-600',

  /** Success light background (green-100) */
  SUCCESS_LIGHT: 'bg-green-100',

  /** Error background (red-500) */
  ERROR: 'bg-red-500',

  /** Warning background (amber-600) */
  WARNING: 'bg-amber-600',

  /** Info background (blue-100) */
  INFO: 'bg-blue-100',

  /** Info light background (blue-50) */
  INFO_LIGHT: 'bg-blue-50',

  /** Transparent background */
  TRANSPARENT: 'bg-transparent',

  /** Skeleton loading background (gray-200) */
  SKELETON: 'bg-gray-200',
} as const;

/**
 * Border Color Utility Classes
 * Centralizes border color Tailwind classes used across all components
 * Eliminates hardcoded border-gray-* classes in 30+ locations
 *
 * Usage:
 * ```typescript
 * import { BORDER_COLOR_CLASSES } from '@/lib/config';
 * <div className={BORDER_COLOR_CLASSES.DEFAULT}>...</div>
 * <div className={BORDER_COLOR_CLASSES.FOCUS}>...</div>
 * ```
 */
export const BORDER_COLOR_CLASSES = {
  /** Default border (gray-300) */
  DEFAULT: 'border-gray-300',

  /** Light border (gray-200) */
  LIGHT: 'border-gray-200',

  /** Focus border (primary-500) */
  FOCUS: 'border-primary-500',

  /** Error border (red-300) */
  ERROR: 'border-red-300',

  /** Success border (green-500) */
  SUCCESS: 'border-green-500',

  /** Warning border (amber-500) */
  WARNING: 'border-amber-500',

  /** Warning light border (amber-200) */
  WARNING_LIGHT: 'border-amber-200',

  /** Info border (blue-200) */
  INFO: 'border-blue-200',

  /** No border */
  NONE: 'border-0',

  /** Top border only */
  TOP: 'border-t border-gray-200',
} as const;

/**
 * Focus Ring Utility Classes
 * Centralizes focus ring Tailwind classes used across all components
 * Eliminates hardcoded focus-visible:ring-* classes in 25+ locations
 *
 * Usage:
 * ```typescript
 * import { FOCUS_RING_CLASSES } from '@/lib/config';
 * <button className={FOCUS_RING_CLASSES.PRIMARY}>...</button>
 * ```
 */
export const FOCUS_RING_CLASSES = {
  /** Primary focus ring (primary-500) */
  PRIMARY: 'focus-visible:ring-primary-500',

  /** Error focus ring (red-500) */
  ERROR: 'focus-visible:ring-red-500',

  /** Success focus ring (green-500) */
  SUCCESS: 'focus-visible:ring-green-500',

  /** No focus ring */
  NONE: 'focus-visible:ring-0',
} as const;

/**
 * Spacing Utility Classes
 * Centralizes spacing Tailwind classes used across all components
 * Eliminates hardcoded m-*, p-*, gap-* classes in 40+ locations
 *
 * Usage:
 * ```typescript
 * import { SPACING_CLASSES } from '@/lib/config';
 * <div className={SPACING_CLASSES.SECTION}>...</div>
 * ```
 */
export const SPACING_CLASSES = {
  /** Section spacing (mb-8) */
  SECTION: 'mb-8',

  /** Component spacing (mb-6) */
  COMPONENT: 'mb-6',

  /** Element spacing (mb-4) */
  ELEMENT: 'mb-4',

  /** Small spacing (mb-2) */
  SMALL: 'mb-2',

  /** Extra small spacing (mb-1) */
  EXTRA_SMALL: 'mb-1',

  /** No spacing */
  NONE: 'mb-0',

  /** Top margin (mt-8) */
  TOP: 'mt-8',

  /** Top margin small (mt-2) */
  TOP_SMALL: 'mt-2',

  /** Page padding (p-8) */
  PAGE: 'p-8',

  /** Card padding (p-6) */
  CARD: 'p-6',

  /** Component padding (p-4) */
  COMPONENT_PADDING: 'p-4',

  /** Small padding (p-2) */
  PADDING_SMALL: 'p-2',
} as const;

/**
 * Typography Utility Classes
 * Centralizes typography Tailwind classes used across all components
 * Eliminates hardcoded text-*, font-* classes in 30+ locations
 *
 * Usage:
 * ```typescript
 * import { TYPOGRAPHY_CLASSES } from '@/lib/config';
 * <h1 className={TYPOGRAPHY_CLASSES.HEADING}>...</h1>
 * ```
 */
export const TYPOGRAPHY_CLASSES = {
  /** Page heading (text-3xl font-bold) */
  PAGE_HEADING: 'text-3xl font-bold',

  /** Section heading (text-2xl font-semibold) */
  SECTION_HEADING: 'text-2xl font-semibold',

  /** Component heading (text-xl font-semibold) */
  COMPONENT_HEADING: 'text-xl font-semibold',

  /** Subheading (text-lg font-semibold) */
  SUBHEADING: 'text-lg font-semibold',

  /** Body text (text-base) */
  BODY: 'text-base',

  /** Small text (text-sm) */
  SMALL: 'text-sm',

  /** Extra small text (text-xs) */
  EXTRA_SMALL: 'text-xs',

  /** Code text (font-mono) */
  CODE: 'font-mono',

  /** Normal weight text (font-normal) */
  NORMAL: 'font-normal',

  /** Medium weight text (font-medium) */
  MEDIUM: 'font-medium',

  /** Semibold text (font-semibold) */
  SEMIBOLD: 'font-semibold',

  /** Bold text (font-bold) */
  BOLD: 'font-bold',

  /** Light weight text (font-light) */
  LIGHT: 'font-light',
} as const;

/**
 * Layout Utility Classes
 * Centralizes layout Tailwind classes used across all components
 * Eliminates hardcoded flex, grid, and positioning classes in 30+ locations
 *
 * Usage:
 * ```typescript
 * import { LAYOUT_CLASSES } from '@/lib/config';
 * <div className={LAYOUT_CLASSES.CENTER}>...</div>
 * ```
 */
export const LAYOUT_CLASSES = {
  /** Center content (flex items-center justify-center) */
  CENTER: 'flex items-center justify-center',

  /** Flex row (flex items-center) */
  FLEX_ROW: 'flex items-center',

  /** Flex column (flex flex-col) */
  FLEX_COL: 'flex flex-col',

  /** Grid layout (grid grid-cols-1) */
  GRID: 'grid grid-cols-1',

  /** Responsive grid (grid grid-cols-1 sm:grid-cols-2) */
  RESPONSIVE_GRID: 'grid grid-cols-1 sm:grid-cols-2',

  /** Full width (w-full) */
  FULL_WIDTH: 'w-full',

  /** Full height (h-full) */
  FULL_HEIGHT: 'h-full',

  /** Min height screen (min-h-screen) */
  MIN_HEIGHT_SCREEN: 'min-h-screen',

  /** Text center */
  TEXT_CENTER: 'text-center',

  /** Overflow hidden */
  OVERFLOW_HIDDEN: 'overflow-hidden',

  /** Overflow auto */
  OVERFLOW_AUTO: 'overflow-auto',
} as const;

/**
 * Transition Utility Classes
 * Centralizes transition Tailwind classes used across all components
 * Eliminates hardcoded transition-* classes in 20+ locations
 *
 * Usage:
 * ```typescript
 * import { TRANSITION_CLASSES } from '@/lib/config';
 * <div className={TRANSITION_CLASSES.DEFAULT}>...</div>
 * ```
 */
export const TRANSITION_CLASSES = {
  /** Default transition (transition-all duration-200) */
  DEFAULT: 'transition-all duration-200',

  /** Fast transition (transition-all duration-150) */
  FAST: 'transition-all duration-150',

  /** Slow transition (transition-all duration-300) */
  SLOW: 'transition-all duration-300',

  /** Ultra slow transition (transition-all duration-500) */
  ULTRA_SLOW: 'transition-all duration-500',

  /** Default with ease-out (transition-all duration-200 ease-out) */
  DEFAULT_EASE_OUT: 'transition-all duration-200 ease-out',

  /** Slow with ease-out (transition-all duration-300 ease-out) */
  SLOW_EASE_OUT: 'transition-all duration-300 ease-out',

  /** Slow with ease-in-out (transition-all duration-300 ease-in-out) */
  SLOW_EASE_IN_OUT: 'transition-all duration-300 ease-in-out',

  /** Color transition (transition-colors) */
  COLOR: 'transition-colors',

  /** Color transition with duration-200 (transition-colors duration-200) */
  COLOR_DEFAULT: 'transition-colors duration-200',

  /** Color transition with duration-300 (transition-colors duration-300) */
  COLOR_SLOW: 'transition-colors duration-300',

  /** Transform transition (transition-transform) */
  TRANSFORM: 'transition-transform',

  /** No transition */
  NONE: 'transition-none',

  /** Ease out timing */
  EASE_OUT: 'ease-out',

  /** Ease in out timing */
  EASE_IN_OUT: 'ease-in-out',
} as const;

/**
 * Shadow Utility Classes
 * Centralizes shadow Tailwind classes used across all components
 * Eliminates hardcoded shadow-* classes in 15+ locations
 *
 * Usage:
 * ```typescript
 * import { SHADOW_CLASSES } from '@/lib/config';
 * <div className={SHADOW_CLASSES.CARD}>...</div>
 * ```
 */
export const SHADOW_CLASSES = {
  /** Small shadow (shadow-sm) */
  SMALL: 'shadow-sm',

  /** Default shadow (shadow-md) */
  DEFAULT: 'shadow-md',

  /** Large shadow (shadow-lg) */
  LARGE: 'shadow-lg',

  /** Extra large shadow (shadow-xl) */
  EXTRA_LARGE: 'shadow-xl',

  /** No shadow */
  NONE: 'shadow-none',
} as const;

/**
 * Rounded Corner Utility Classes
 * Centralizes rounded corner Tailwind classes used across all components
 * Eliminates hardcoded rounded-* classes in 20+ locations
 *
 * Usage:
 * ```typescript
 * import { ROUNDED_CLASSES } from '@/lib/config';
 * <div className={ROUNDED_CLASSES.DEFAULT}>...</div>
 * ```
 */
export const ROUNDED_CLASSES = {
  /** Small rounded corners (rounded) */
  DEFAULT: 'rounded',

  /** Medium rounded corners (rounded-md) */
  MEDIUM: 'rounded-md',

  /** Large rounded corners (rounded-lg) */
  LARGE: 'rounded-lg',

  /** Extra large rounded corners (rounded-xl) */
  EXTRA_LARGE: 'rounded-xl',

  /** Full rounded corners (rounded-full) */
  FULL: 'rounded-full',

  /** No rounded corners */
  NONE: 'rounded-none',
} as const;

/**
 * Progress Bar Accessibility Constants
 * Centralizes hardcoded ARIA attribute values for progress bars
 * Follows the "Flexy" principle: eliminate hardcoded values
 *
 * Usage:
 * ```typescript
 * import { PROGRESS_BAR_A11Y } from '@/lib/config';
 * <div aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN} aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}>...</div>
 * ```
 */
export const PROGRESS_BAR_A11Y = {
  /**
   * Minimum value for aria-valuemin
   * Replaces hardcoded aria-valuemin={0} in 6+ components
   */
  VALUE_MIN: 0,

  /**
   * Maximum value for aria-valuemax
   * Replaces hardcoded aria-valuemax={100} in 4+ components
   */
  VALUE_MAX: 100,
} as const;

/**
 * Character Count Colors
 * Centralizes hardcoded color values for character count indicators
 * Eliminates hardcoded #b91c1c, #15803d, #4b5563 in InputWithValidation.tsx
 *
 * Usage:
 * ```typescript
 * import { CHAR_COUNT_COLORS } from '@/lib/config';
 * if (ratio > 1) return CHAR_COUNT_COLORS.OVER_LIMIT;
 * ```
 */
export const CHAR_COUNT_COLORS = {
  /**
   * Over-limit color (red) - used when character count exceeds max
   * Env: CHAR_COUNT_COLOR_OVER_LIMIT (default: '#b91c1c')
   */
  OVER_LIMIT: EnvLoader.string('CHAR_COUNT_COLOR_OVER_LIMIT', '#b91c1c'),

  /**
   * Near-limit warning color transition - used for interpolation
   * These values define the RGB range for the gradient effect
   */
  WARNING_START: { r: 180, g: 119, b: 11 },
  WARNING_END: { r: 185, g: 28, b: 28 },

  /**
   * Success color transition - used for healthy character count
   * These values define the RGB range for the gradient effect
   */
  SUCCESS_START: { r: 22, g: 163, b: 74 },
  SUCCESS_END: { r: 180, g: 119, b: 11 },

  /**
   * Normal/safe color (green) - used when character count is within limits
   * Env: CHAR_COUNT_COLOR_NORMAL (default: '#15803d')
   */
  NORMAL: EnvLoader.string('CHAR_COUNT_COLOR_NORMAL', '#15803d'),

  /**
   * Empty/neutral color (gray) - used when character count is zero
   * Env: CHAR_COUNT_COLOR_EMPTY (default: '#4b5563')
   */
  EMPTY: EnvLoader.string('CHAR_COUNT_COLOR_EMPTY', '#4b5563'),
} as const;

/**
 * Combined Tailwind Utility Classes
 * Provides all utility classes in a single object for convenience
 *
 * Usage:
 * ```typescript
 * import { TAILWIND_UTILS } from '@/lib/config';
 * <div className={TAILWIND_UTILS.TEXT.HEADING}>...</div>
 * ```
 */
export const TAILWIND_UTILS = {
  TEXT: TEXT_COLOR_CLASSES,
  BG: BG_COLOR_CLASSES,
  BORDER: BORDER_COLOR_CLASSES,
  FOCUS: FOCUS_RING_CLASSES,
  SPACING: SPACING_CLASSES,
  TYPOGRAPHY: TYPOGRAPHY_CLASSES,
  LAYOUT: LAYOUT_CLASSES,
  TRANSITION: TRANSITION_CLASSES,
  SHADOW: SHADOW_CLASSES,
  ROUNDED: ROUNDED_CLASSES,
} as const;

export type TextColorClasses = typeof TEXT_COLOR_CLASSES;
export type BgColorClasses = typeof BG_COLOR_CLASSES;
export type BorderColorClasses = typeof BORDER_COLOR_CLASSES;
export type FocusRingClasses = typeof FOCUS_RING_CLASSES;
export type SpacingClasses = typeof SPACING_CLASSES;
export type TypographyClasses = typeof TYPOGRAPHY_CLASSES;
export type LayoutClasses = typeof LAYOUT_CLASSES;
export type TransitionClasses = typeof TRANSITION_CLASSES;
export type ShadowClasses = typeof SHADOW_CLASSES;
export type RoundedClasses = typeof ROUNDED_CLASSES;
export type CharCountColors = typeof CHAR_COUNT_COLORS;
export type TailwindUtils = typeof TAILWIND_UTILS;
