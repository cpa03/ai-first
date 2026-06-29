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
  /** Default border */
  DEFAULT: 'border-gray-300',

  /** Primary/brand border */
  PRIMARY: 'border-primary-500',

  /** Error state border */
  ERROR: 'border-red-300',
  ERROR_FOCUS: 'focus-visible:border-red-500',

  /** Success state border */
  SUCCESS: 'border-green-500',

  /** Warning state border */
  WARNING: 'border-amber-500',
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
} as const;

/**
 * Text color utilities
 */
export const TEXT_COLORS = {
  /** Primary text */
  PRIMARY: 'text-gray-900',

  /** Secondary/muted text */
  SECONDARY: 'text-gray-600',

  /** Error text */
  ERROR: 'text-red-700',

  /** Success text */
  SUCCESS: 'text-green-800',

  /** Warning text */
  WARNING: 'text-amber-700',

  /** Brand primary text */
  BRAND: 'text-primary-600',
} as const;

/**
 * Background color utilities
 */
export const BG_COLORS = {
  /** Default background */
  DEFAULT: 'bg-white',

  /** Success background */
  SUCCESS: 'bg-green-600',

  /** Warning background */
  WARNING: 'bg-amber-600',

  /** Error background */
  ERROR: 'bg-red-500',

  /** Progress bar neutral */
  PROGRESS_NEUTRAL: 'bg-gray-200',
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
    IDEA_INPUT_MIN_HEIGHT: 'min-h-[120px]',
    TEXTAREA_MIN_HEIGHT: 'min-h-[100px]',
    TOAST_BUTTON_MIN_SIZE: 'min-h-[32px] min-w-[32px]',
    KEYBOARD_SHORTCUT_MIN_SIZE: 'min-w-[24px] min-h-[24px]',
    MODAL_MAX_HEIGHT: 'max-h-[90vh]',
    SCROLLABLE_MAX_HEIGHT: 'max-h-[60vh]',
    ONBOARDING_TOOLTIP_WIDTH: 'w-[300px]',
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
  /** Google brand colors for OAuth button SVG paths */
  GOOGLE: {
    /** Google Blue - used for "G" letter part */
    BLUE: '#4285F4',
    /** Google Green - used for "L" part */
    GREEN: '#34A853',
    /** Google Yellow - used for "E" part */
    YELLOW: '#FBBC05',
    /** Google Red - used for "G" curved part */
    RED: '#EA4335',
  } as const,
  /** GitHub brand color (for future use) */
  GITHUB: {
    /** GitHub brand black */
    BLACK: '#24292F',
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

  /** Size classes for button dimensions */
  SIZES: {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  } as const,

  /** State classes for disabled/loading states */
  STATES: {
    disabled:
      'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100 hover:translate-y-0 active:translate-y-0 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0 pointer-events-none shadow-none',
    enabled:
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
  } as const,

  /** Base classes applied to all buttons */
  BASE: 'rounded-md font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none touch-manipulation relative overflow-hidden',
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
  closeButton:
    'flex-shrink-0 ml-2 hover:opacity-75 focus:outline-none rounded-md p-1 min-h-[32px] min-w-[32px] transition-opacity',
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
   * Small SVG icon (20x20px) - default for most icons
   * Equivalent to: w-5 h-5
   */
  SM: 'w-5 h-5',

  /**
   * Medium SVG icon (24x24px) - for emphasis icons
   * Equivalent to: w-6 h-6
   */
  MD: 'w-6 h-6',

  /**
   * Large SVG icon (32x32px) - for prominent icons
   * Equivalent to: w-8 h-8
   */
  LG: 'w-8 h-8',
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
