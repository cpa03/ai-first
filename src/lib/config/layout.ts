/**
 * Layout Configuration
 * Centralizes spacing, sizing, and layout-related values
 * Eliminates hardcoded Tailwind spacing values throughout the codebase
 */

/**
 * Container max-width values
 * Standardized container widths for consistent page layouts
 */
export const CONTAINER_SIZES = {
  /** Extra small container - 640px */
  XS: 'max-w-md',
  /** Small container - 768px */
  SM: 'max-w-2xl',
  /** Medium container - 1024px */
  MD: 'max-w-4xl',
  /** Large container - 1280px */
  LG: 'max-w-6xl',
  /** Extra large container - 1536px */
  XL: 'max-w-7xl',
} as const;

/**
 * Standardized padding values for page sections
 */
export const PAGE_PADDING = {
  /** Standard horizontal padding */
  X: 'px-4 sm:px-6 lg:px-8',
  /** Standard vertical padding */
  Y: 'py-8 sm:py-12',
  /** Combined padding */
  BOTH: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
} as const;

/**
 * Z-index values for layering components
 * Centralizes z-index values to prevent conflicts
 */
export const Z_INDEX = {
  /** Behind content - for overlays/backdrops */
  BACKDROP: 'z-[99]',
  /** Navigation layer */
  NAV: 'z-40',
  /** Fixed elements like scroll-to-top */
  FIXED: 'z-50',
  /** Dropdown menus and popovers */
  DROPDOWN: 'z-[100]',
  /** Modal overlays */
  MODAL_OVERLAY: 'z-50',
  /** Modal content */
  MODAL: 'z-[100]',
  /** Toast notifications */
  TOAST: 'z-50',
  /** Tooltip layer */
  TOOLTIP: 'z-50',
  /** Highest layer - loading overlays */
  LOADING: 'z-50',
} as const;

/**
 * Component sizing values
 * Standardized sizes for reusable components
 */
export const COMPONENT_SIZES = {
  /** Icon sizes */
  ICON: {
    XS: 'w-3 h-3',
    SM: 'w-4 h-4',
    MD: 'w-5 h-5',
    LG: 'w-6 h-6',
    XL: 'w-8 h-8',
    '2XL': 'w-10 h-10',
    '3XL': 'w-12 h-12',
    '4XL': 'w-24 h-24',
  },
  /** Button sizes */
  BUTTON: {
    SM: 'px-3 py-1.5 text-sm',
    MD: 'px-4 py-2',
    LG: 'px-6 py-3 text-lg',
  },
  /** Avatar/container sizes */
  CONTAINER: {
    XS: 'w-6 h-6',
    SM: 'w-8 h-8',
    MD: 'w-10 h-10',
    LG: 'w-12 h-12',
    XL: 'w-16 h-16',
    '2XL': 'w-20 h-20',
  },
} as const;

/**
 * Grid configuration values
 * Standardized grid layouts
 */
export const GRID_CONFIG = {
  /** Feature grid - 3 columns on desktop */
  FEATURES: 'grid md:grid-cols-3 gap-8',
  /** Card grid - 2 columns on desktop */
  CARDS: 'grid md:grid-cols-2 gap-6',
  /** Stats grid - 3 columns */
  STATS: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  /** Auth grid - 2 columns */
  AUTH: 'grid grid-cols-2 gap-3',
} as const;

/**
 * Spacing values for margins and padding
 */
export const SPACING = {
  /** Section margins */
  SECTION: 'mt-16',
  /** Card padding */
  CARD: 'p-6 sm:p-8',
  /** Large card padding */
  CARD_LG: 'p-8',
  /** Inner card spacing */
  CARD_INNER: 'space-y-4',
  /** Form field spacing */
  FORM: 'space-y-6',
  /** Compact spacing */
  COMPACT: 'space-y-2',
} as const;

/**
 * Layout dimensions
 * Fixed height/width values
 */
export const DIMENSIONS = {
  /** Header height */
  HEADER_HEIGHT: 'h-16',
  /** Footer padding */
  FOOTER_PADDING: 'py-4',
  /** Minimum screen height calculation */
  MIN_SCREEN: 'min-h-[calc(100vh-4rem)]',
  /** Modal max height */
  MODAL_MAX_HEIGHT: 'max-h-[90vh]',
  /** Scrollable content max height */
  SCROLLABLE_MAX: 'max-h-[60vh]',
} as const;

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  /** Small rounded corners */
  SM: 'rounded',
  /** Standard rounded */
  MD: 'rounded-md',
  /** Large rounded */
  LG: 'rounded-lg',
  /** Extra large rounded */
  XL: 'rounded-xl',
  /** Full rounded (circles) */
  FULL: 'rounded-full',
} as const;

/**
 * Shadow values
 */
export const SHADOWS = {
  /** Small shadow */
  SM: 'shadow-sm',
  /** Standard shadow */
  MD: 'shadow-lg',
  /** Large shadow */
  LG: 'shadow-2xl',
  /** Extra shadow on hover */
  HOVER: 'hover:shadow-xl',
} as const;

/**
 * Animation durations in milliseconds
 * Use with setTimeout or for CSS-in-JS
 */
export const ANIMATION_MS = {
  /** Fast animations */
  FAST: 150,
  /** Standard animations */
  NORMAL: 200,
  /** Slow animations */
  SLOW: 300,
  /** Very slow */
  VERY_SLOW: 500,
  /** Toast exit */
  TOAST_EXIT: 300,
} as const;

/**
 * Timeout durations in milliseconds
 * For setTimeout/setInterval calls
 */
export const TIMEOUT_MS = {
  /** Quick feedback */
  QUICK: 500,
  /** Standard delay */
  STANDARD: 1000,
  /** Tooltip hide delay */
  TOOLTIP_HIDE: 1000,
  /** Copy feedback */
  COPY_FEEDBACK: 2000,
  /** Debounce delay */
  DEBOUNCE: 300,
} as const;

/**
 * Opacity values
 */
export const OPACITY = {
  /** Disabled state */
  DISABLED: 'opacity-50',
  /** Semi-transparent */
  SEMI: 'opacity-75',
  /** Light transparent */
  LIGHT: 'opacity-30',
  /** Very light */
  VERY_LIGHT: 'opacity-25',
} as const;

// Type exports
export type ContainerSize = keyof typeof CONTAINER_SIZES;
export type PagePadding = keyof typeof PAGE_PADDING;
export type ZIndex = keyof typeof Z_INDEX;
export type ComponentSize = keyof typeof COMPONENT_SIZES;
export type GridConfig = keyof typeof GRID_CONFIG;
export type Spacing = keyof typeof SPACING;
export type BorderRadius = keyof typeof BORDER_RADIUS;
export type Shadow = keyof typeof SHADOWS;
