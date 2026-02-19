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

  FEEDBACK: {
    COPY_FEEDBACK_DURATION_MS: 2000,
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
