/**
 * UI Configuration
 * Centralizes UI constants, styling, and component defaults
 */

export const UI_CONFIG = {
  FOCUS: {
    DELAY_MS: 50,
    RING_COLOR: 'rgba(59, 130, 246, 0.2)',
    RING_WIDTH: '2px',
  },

  TEXTAREA: {
    MIN_HEIGHT: '100px',
    MAX_HEIGHT: '500px',
    ROWS_DEFAULT: 4,
  },

  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  SPACING: {
    XS: '0.25rem',
    SM: '0.5rem',
    MD: '1rem',
    LG: '1.5rem',
    XL: '2rem',
    XXL: '3rem',
  },

  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },

  Z_INDEX: {
    BASE: 0,
    DROPDOWN: 100,
    STICKY: 200,
    MODAL: 300,
    POPOVER: 400,
    TOOLTIP: 500,
    TOAST: 600,
  },

  SCROLL: {
    BEHAVIOR: 'smooth' as ScrollBehavior,
    OFFSET: 80,
  },
} as const;

export const LABELS = {
  QUESTION: (index: number) => `Question ${index + 1}`,
  STEP: (current: number, total: number) => `Step ${current} of ${total}`,
  PROGRESS: (percent: number) => `${percent}% Complete`,
} as const;

export const PLACEHOLDERS = {
  IDEA_INPUT: 'Describe your idea in detail...',
  CLARIFICATION_ANSWER: 'Type your answer here...',
  SEARCH: 'Search...',
  FILTER: 'Filter results...',
} as const;

export const BUTTON_LABELS = {
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  CONTINUE: 'Continue',
  BACK: 'Back',
  SKIP: 'Skip',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  EXPORT: 'Export',
} as const;

export const TOAST_CONFIG = {
  DURATION: {
    SHORT: 3000,
    NORMAL: 5000,
    LONG: 8000,
  },

  POSITION: {
    TOP: 'top',
    BOTTOM: 'bottom',
    TOP_RIGHT: 'top-right',
    BOTTOM_RIGHT: 'bottom-right',
  },

  STYLES: {
    SUCCESS: {
      BG: 'bg-green-50',
      BORDER: 'border-green-200',
      TEXT: 'text-green-800',
      ICON_COLOR: '#16a34a',
    },
    ERROR: {
      BG: 'bg-red-50',
      BORDER: 'border-red-200',
      TEXT: 'text-red-800',
      ICON_COLOR: '#dc2626',
    },
    WARNING: {
      BG: 'bg-yellow-50',
      BORDER: 'border-yellow-200',
      TEXT: 'text-yellow-800',
      ICON_COLOR: '#ca8a04',
    },
    INFO: {
      BG: 'bg-blue-50',
      BORDER: 'border-blue-200',
      TEXT: 'text-blue-800',
      ICON_COLOR: '#2563eb',
    },
  },
} as const;

export type UiConfig = typeof UI_CONFIG;
export type ToastConfig = typeof TOAST_CONFIG;
