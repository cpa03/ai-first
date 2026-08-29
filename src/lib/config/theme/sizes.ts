/**
 * Theme Sizes Module
 * Centralizes all size and spacing-related theme constants
 */

import { EnvLoader } from '../environment';

/**
 * Spacing constants (in pixels) for calculations
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
  ICON: {
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },
  TEXTAREA: {
    MIN_HEIGHT: 100,
    MIN_HEIGHT_PX: '100px',
  },
  COMPONENT: {
    IDEA_INPUT_MIN_HEIGHT: `min-h-[${EnvLoader.number('UI_IDEA_INPUT_MIN_HEIGHT', 120, 80, 200)}px]`,
    TEXTAREA_MIN_HEIGHT: `min-h-[${EnvLoader.number('UI_TEXTAREA_MIN_HEIGHT', 100, 50, 300)}px]`,
    TOAST_BUTTON_MIN_SIZE: `min-h-[${EnvLoader.number('UI_TOAST_BUTTON_MIN_SIZE', 32, 24, 48)}px] min-w-[${EnvLoader.number('UI_TOAST_BUTTON_MIN_SIZE', 32, 24, 48)}px]`,
    KEYBOARD_SHORTCUT_MIN_SIZE: `min-w-[${EnvLoader.number('UI_KBD_MIN_WIDTH', 20, 16, 32)}px] min-h-[${EnvLoader.number('UI_KBD_MIN_HEIGHT', 20, 16, 32)}px]`,
    MODAL_MAX_HEIGHT: 'max-h-[90vh]',
    SCROLLABLE_MAX_HEIGHT: 'max-h-[60vh]',
    ONBOARDING_TOOLTIP_WIDTH: `w-[${EnvLoader.number('UI_ONBOARDING_WIDTH', 300, 200, 500)}px]`,
    ARROW_NEGATIVE_MARGIN: `mt-[${EnvLoader.string('UI_ARROW_NEGATIVE_MARGIN', '-1.5rem')}]`,
  },
} as const;

/**
 * SVG Size Configuration
 */
export const SVG_SIZES = {
  XS: 'w-2 h-2',
  SM: 'w-3 h-3',
  SMD: 'w-3.5 h-3.5',
  MD: 'w-4 h-4',
  LG: 'w-5 h-5',
  XL: 'w-6 h-6',
  '2XL': 'w-8 h-8',
  '3XL': 'w-10 h-10',
  '4XL': 'w-12 h-12',
  '5XL': 'w-16 h-16',
} as const;

/**
 * SVG Center Constants
 */
export const SVG_CIRCLE = {
  CX_24: '12',
  CY_24: '12',
  R_10: '10',
  CX_16: '8',
  CY_16: '8',
  R_6: '6',
} as const;

/**
 * Gap Size Configuration
 */
export const GAP_SIZES = {
  XS: 'gap-1',
  SM: 'gap-1.5',
  MD: 'gap-2',
  LG: 'gap-3',
  XL: 'gap-4',
  '2XL': 'gap-6',
} as const;

/**
 * Z-Index Layer Configuration
 */
export const Z_INDEX_LAYERS = {
  BASE: 0,
  CONTENT: 10,
  STICKY: 20,
  OVERLAY: EnvLoader.number('Z_INDEX_OVERLAY', 30, 10, 50),
  MOBILE_OVERLAY: EnvLoader.number('Z_INDEX_MOBILE_OVERLAY', 35, 20, 55),
  MODAL: EnvLoader.number('Z_INDEX_MODAL', 40, 20, 60),
  MOBILE_MENU: EnvLoader.number('Z_INDEX_MOBILE_MENU', 45, 30, 65),
  TOAST: EnvLoader.number('Z_INDEX_TOAST', 50, 30, 70),
  CELEBRATION: EnvLoader.number('Z_INDEX_CELEBRATION', 50, 30, 70),
} as const;

/**
 * Z-Index Tailwind Classes
 * Maps Z_INDEX_LAYERS to Tailwind utility classes
 */
export const Z_INDEX_CLASSES = {
  BASE: 'z-0',
  CONTENT: 'z-10',
  STICKY: 'z-20',
  OVERLAY: 'z-30',
  MOBILE_OVERLAY: 'z-[35]',
  MODAL: 'z-40',
  MOBILE_MENU: 'z-[45]',
  TOAST: 'z-50',
  CELEBRATION: 'z-50',
} as const;

/**
 * Progress Bar Accessibility Constants
 */
export const PROGRESS_BAR_A11Y = {
  VALUE_MIN: 0,
  VALUE_MAX: 100,
} as const;

/**
 * Tooltip Component Configuration
 */
export const TOOLTIP_CONFIG = {
  ARROW: {
    BORDER_SIZE: 'border-l-4 border-r-4',
    BORDER_COLOR_NAME: 'gray-800',
    TRANSPARENT: {
      TOP_BOTTOM: 'border-l-transparent border-r-transparent',
      LEFT_RIGHT: 'border-t-transparent border-b-transparent',
    },
  } as const,
  CONTENT_PADDING: 'px-2.5 py-1.5',
  CONTENT_GAP: 'gap-2.5',
  SHORTCUT_GAP: 'gap-1',
  SHORTCUT_SECTION: 'pl-2 ml-auto',
  VIEWPORT_PADDING: EnvLoader.number('TOOLTIP_VIEWPORT_PADDING', 8, 0, 32),
  TRIGGER_SPACING: EnvLoader.number('TOOLTIP_TRIGGER_SPACING', 8, 4, 16),
} as const;
