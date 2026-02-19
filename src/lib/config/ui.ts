/**
 * UI Configuration
 * Centralizes UI constants, styling, and component defaults
 * Now supports environment variable overrides via EnvLoader for timing values
 */
import { EnvLoader } from './environment';

/**
 * Design System Color Tokens
 * These constants align with Tailwind theme colors defined in tailwind.config.js
 * and CSS variables in globals.css for consistent color usage across the app.
 */
const DESIGN_TOKENS = {
  COLORS: {
    SUCCESS: '#16a34a', // green-600
    ERROR: '#dc2626', // red-600
    WARNING: '#ca8a04', // yellow-600
    INFO: '#2563eb', // primary-600 (blue-600)
  },
} as const;

export const UI_CONFIG = {
  FOCUS: {
    /** Env: UI_FOCUS_DELAY_MS (default: 50) */
    DELAY_MS: EnvLoader.number('UI_FOCUS_DELAY_MS', 50, 10, 500),
    /** Focus ring color - matches primary-500 (#3b82f6) with 20% opacity */
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
      /** Env: UI_ANIMATION_FAST (default: 150) */
      FAST: EnvLoader.number('UI_ANIMATION_FAST', 150, 50, 1000),
      /** Env: UI_ANIMATION_NORMAL (default: 300) */
      NORMAL: EnvLoader.number('UI_ANIMATION_NORMAL', 300, 50, 2000),
      /** Env: UI_ANIMATION_SLOW (default: 500) */
      SLOW: EnvLoader.number('UI_ANIMATION_SLOW', 500, 100, 5000),
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
    /** Env: UI_SCROLL_OFFSET (default: 80) */
    OFFSET: EnvLoader.number('UI_SCROLL_OFFSET', 80, 0, 500),
  },

  FEEDBACK: {
    /** Env: UI_COPY_FEEDBACK_DURATION_MS (default: 2000) */
    COPY_FEEDBACK_DURATION_MS: EnvLoader.number(
      'UI_COPY_FEEDBACK_DURATION_MS',
      2000,
      500,
      10000
    ),
  },
} as const;

export const LABELS = {
  QUESTION: (index: number) => `Question ${index + 1}`,
  STEP: (current: number, total: number) => `Step ${current} of ${total}`,
  PROGRESS: (percent: number) => `${percent}% Complete`,
} as const;

export const PLACEHOLDERS = {
  IDEA_INPUT: 'Describe your idea in detail...',
  CLARIFICATION_ANSWER: 'Enter your answer here...',
  SEARCH: 'Search...',
  FILTER: 'Filter results...',
} as const;

export const MESSAGES = {
  CLARIFICATION: {
    GENERATING_QUESTIONS: 'Generating questions...',
    LOADING_QUESTION: 'Loading question...',
    NO_QUESTIONS_TITLE: 'No Questions Generated',
    NO_QUESTIONS_DESCRIPTION:
      "We couldn't generate specific questions for your idea.",
    NO_QUESTIONS_SUGGESTION:
      'Please go back and try with a more detailed idea.',
    FALLBACK_ERROR: "We're using fallback questions to continue.",
    ANSWER_HELP_TEXT:
      'Provide a detailed answer to help us understand your needs better.',
    ERROR_TITLE: 'Error',
    ERROR_FETCH_QUESTIONS: 'Failed to fetch clarifying questions',
  },
  NAVIGATION: {
    PREVIOUS: '← Previous',
    NEXT: 'Next →',
    COMPLETE: 'Complete',
  },
  LOADING: {
    DEFAULT: 'Loading...',
    SAVING: 'Saving...',
    SAVED: 'Saved',
    TASKS: 'Loading tasks...',
    BLUEPRINT: 'Generating your blueprint',
  },
  ERRORS: {
    DEFAULT: 'An error occurred',
    LOADING_TASKS: 'Error Loading Tasks',
    LOADING_TASKS_DESCRIPTION: 'Unable to load tasks. Please try again.',
    SOMETHING_WENT_WRONG: 'Something went wrong',
    FAILED_SAVE_IDEA: 'Failed to save your idea. Please try again.',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },
  TASK_MANAGEMENT: {
    TITLE: 'Task Management',
    NO_TASKS_TITLE: 'No Tasks Found',
    NO_TASKS_DESCRIPTION: 'Get started by creating your first task.',
    RETRY_BUTTON: 'Retry',
    EXPAND_ALL: 'Expand All',
    COLLAPSE_ALL: 'Collapse All',
    PROGRESS_LABEL: 'Overall project progress',
  },
  IDEA_INPUT: {
    SUBMIT_BUTTON: 'Start Clarifying →',
    PROCESSING_BUTTON: 'Processing...',
    KEYBOARD_SHORTCUT_LABEL: (isMac: boolean) =>
      `Keyboard shortcut: ${isMac ? 'Command' : 'Control'} Enter to submit`,
  },
  BLUEPRINT: {
    COPY_BUTTON: 'Copy to Clipboard',
    COPIED_BUTTON: 'Copied!',
    DOWNLOAD_BUTTON: 'Download Markdown',
    GENERATING_TITLE: 'Generating Your Blueprint...',
    GENERATING_DESCRIPTION:
      'Our AI is analyzing your answers and creating a detailed action plan.',
    PAGE_TITLE: 'Your Project Blueprint',
    FOOTER_TEXT:
      'Ready to start implementing? Share this blueprint with your team or keep it as your guide.',
    START_OVER_BUTTON: 'Start Over',
    EXPORT_BUTTON: 'Export to Tools',
    COMING_SOON_BADGE: 'Soon',
    TOOLTIP_START_OVER: 'Start over with a new idea - coming soon',
    TOOLTIP_EXPORT: 'Export to Notion, Trello, and more - coming soon',
    ARIA_LABEL_GENERATING: 'Generating your blueprint',
    ARIA_LABEL_CONTENT: 'Generated project blueprint content',
    ARIA_LABEL_START_OVER: 'Start over with a new idea (coming soon)',
    ARIA_LABEL_EXPORT:
      'Export blueprint to project management tools (coming soon)',
  },
  ERROR_BOUNDARY: {
    TITLE: 'Something went wrong',
    DESCRIPTION: 'An error has occurred.',
    RETRY_BUTTON: 'Try Again',
    DETAILS_BUTTON: 'Error Details',
    COPY_BUTTON: 'Copy Error Details',
    NO_STACK_TRACE: 'No stack trace available',
  },
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
  RETRY: 'Retry',
  CLOSE: 'Close',
  COPY: 'Copy',
  DOWNLOAD: 'Download',
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
      ICON_COLOR: DESIGN_TOKENS.COLORS.SUCCESS, // green-600
    },
    ERROR: {
      BG: 'bg-red-50',
      BORDER: 'border-red-200',
      TEXT: 'text-red-800',
      ICON_COLOR: DESIGN_TOKENS.COLORS.ERROR, // red-600
    },
    WARNING: {
      BG: 'bg-yellow-50',
      BORDER: 'border-yellow-200',
      TEXT: 'text-yellow-800',
      ICON_COLOR: DESIGN_TOKENS.COLORS.WARNING, // yellow-600
    },
    INFO: {
      BG: 'bg-blue-50',
      BORDER: 'border-blue-200',
      TEXT: 'text-blue-800',
      ICON_COLOR: DESIGN_TOKENS.COLORS.INFO, // primary-600
    },
  },
} as const;

/**
 * Component default values
 * Centralizes hardcoded defaults from components
 */
export const COMPONENT_DEFAULTS = {
  /**
   * SuccessCelebration component defaults
   */
  SUCCESS_CELEBRATION: {
    /** Default animation duration in milliseconds */
    DURATION_MS: 2000,
    /** Default particle count */
    PARTICLE_COUNT: 30,
    /** Default reduced motion duration */
    REDUCED_MOTION_DURATION_MS: 500,
  } as const,

  /**
   * ScrollToTop component defaults
   */
  SCROLL_TO_TOP: {
    /** Default scroll position (in pixels) to show button */
    SHOW_AT_PX: 400,
    /** Default smooth scroll behavior */
    SMOOTH: true,
    /** Circle radius for progress indicator */
    PROGRESS_RADIUS: 22,
    /** Progress stroke width */
    STROKE_WIDTH: 2,
  } as const,

  /**
   * AutoSaveIndicator component defaults
   */
  AUTO_SAVE_INDICATOR: {
    /** Maximum progress percentage */
    MAX_PROGRESS: 100,
    /** Minimum progress percentage */
    MIN_PROGRESS: 0,
  } as const,

  /**
   * Progress calculation defaults
   */
  PROGRESS: {
    /** Full percentage */
    COMPLETE: 100,
    /** Empty percentage */
    EMPTY: 0,
  } as const,

  /**
   * ARIA labels for accessibility
   */
  ARIA_LABELS: {
    LOADING_TASKS: 'Loading tasks',
    LOADING_QUESTIONS: 'Generating questions',
    GENERATING_BLUEPRINT: 'Generating your blueprint',
    COPY_IDEA: 'Copy original idea',
    COPY_BLUEPRINT: 'Copy blueprint to clipboard',
    DOWNLOAD_BLUEPRINT: 'Download blueprint as Markdown file',
    CLOSE_ERROR: 'Dismiss error',
  } as const,

  /**
   * ErrorBoundary component defaults
   */
  ERROR_BOUNDARY: {
    DEFAULT_ERROR_TITLE: 'Something went wrong',
  } as const,

  /**
   * ClarificationFlow component defaults
   */
  CLARIFICATION_FLOW: {
    ANSWER_TEXTAREA_NAME: 'answer',
    ANSWER_TEXTAREA_PLACEHOLDER: 'Enter your answer here...',
    REFERENCE_LABEL: 'Reference: Your Original Idea',
    STEP_DESCRIPTION: (currentStep: number, totalSteps: number) =>
      `Answer the following question and then click Next to continue or Previous to go back. Question ${currentStep} of ${totalSteps}.`,
    KEYBOARD_SHORTCUT_TEXT: (isMac: boolean, isLastStep: boolean) =>
      `Press ${isMac ? '⌘' : 'Ctrl'} + Enter to ${isLastStep ? 'complete' : 'submit'}.`,
    SELECT_PLACEHOLDER: 'Select an option...',
  } as const,
} as const;

export type UiConfig = typeof UI_CONFIG;
export type ToastConfig = typeof TOAST_CONFIG;
export type MessagesConfig = typeof MESSAGES;
export type ComponentDefaults = typeof COMPONENT_DEFAULTS;
