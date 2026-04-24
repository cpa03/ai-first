/**
 * Task Management Configuration
 * Centralizes all styling and constants for task management components
 * Eliminates hardcoded Tailwind classes and magic values
 */

import { TaskStatus } from '@/types/task';

/**
 * Task status configuration
 * Centralizes status labels, colors, and styling
 */
export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    ringColor: string;
  }
> = {
  todo: {
    label: 'To Do',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    ringColor: 'focus-visible:ring-gray-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    ringColor: 'focus-visible:ring-blue-500',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    ringColor: 'focus-visible:ring-green-500',
  },
} as const;

/**
 * Risk level configuration
 * Centralizes risk level styling
 */
export const RISK_LEVEL_CONFIG: Record<
  'low' | 'medium' | 'high',
  {
    label: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  low: {
    label: 'Low Risk',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  medium: {
    label: 'Medium Risk',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  high: {
    label: 'High Risk',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
} as const;

/**
 * Task item component styling
 */
export const TASK_ITEM_STYLES = {
  CONTAINER:
    'flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow',
  CHECKBOX: {
    BASE: 'mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500',
    UNCHECKED:
      'border-gray-300 hover:border-primary-500 hover:scale-105 cursor-pointer',
    CHECKED: 'bg-green-500 border-green-500 scale-110',
    DISABLED: 'opacity-50 cursor-not-allowed',
  },
  CHECKMARK: {
    CONTAINER: 'w-3 h-3 text-white animate-draw-check',
    STROKE_WIDTH: 3,
    PATH: 'M5 13l4 4L19 7',
  },
  LOADING_SPINNER: {
    CONTAINER: 'w-3 h-3 text-gray-500 animate-spin',
    STROKE_WIDTH: 4,
  },
  TITLE: {
    BASE: 'text-sm font-medium transition-all duration-300',
    COMPLETED: 'text-gray-500 line-through decoration-2 decoration-gray-400',
    PENDING: 'text-gray-900',
  },
  STATUS_BADGE: {
    BASE: 'flex-shrink-0 px-2 py-0.5 text-xs rounded-full',
  },
  DESCRIPTION: 'text-xs text-gray-600 mt-1 line-clamp-2',
  METADATA: {
    CONTAINER: 'flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500',
    ICON: 'w-3 h-3',
    RISK_BADGE: 'px-1.5 py-0.5 rounded',
    ITEM: 'flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 cursor-default',
  },
} as const;

/**
 * Task management header styling
 */
export const TASK_HEADER_STYLES = {
  CONTAINER: 'bg-white rounded-lg shadow-lg p-6',
  TITLE: 'text-2xl font-bold text-gray-900',
  SUBTITLE: 'text-gray-600 mt-1',
  STATS: {
    CONTAINER:
      'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4',
    VALUE: 'text-3xl font-bold text-primary-600',
    LABEL: 'text-sm text-gray-600',
    PERCENTAGE: 'text-xs text-gray-500 mt-1',
  },
  PROGRESS: {
    CONTAINER: 'w-full bg-gray-200 rounded-full h-3',
    BAR: 'bg-primary-600 h-3 rounded-full transition-all duration-500',
    ARIA: {
      MIN: 0,
      MAX: 100,
    },
  },
} as const;

/**
 * Deliverable card styling
 */
export const DELIVERABLE_CARD_STYLES = {
  CONTAINER: (bgColor: string, borderColor: string) =>
    `rounded-lg shadow-md border-2 transition-all duration-200 ${bgColor} ${borderColor}`,
  HEADER: {
    BASE: 'w-full px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 rounded-lg',
    TITLE: 'text-lg font-semibold text-gray-900',
    DESCRIPTION: 'text-sm text-gray-600 mt-1',
    PROGRESS: {
      VALUE: 'text-lg font-semibold text-gray-900',
      LABEL: 'text-xs text-gray-600',
    },
    ICON: (isExpanded: boolean) =>
      `w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`,
  },
  CONTENT: {
    CONTAINER: 'px-6 pb-4 border-t border-gray-200',
    PROGRESS_BAR: {
      CONTAINER: 'w-full bg-gray-200 rounded-full h-2',
      FILL: 'bg-primary-500 h-2 rounded-full transition-all duration-500',
    },
    EMPTY_STATE: 'text-gray-500 text-sm py-4',
  },
} as const;

/**
 * Deliverable progress thresholds and styling
 */
export const DELIVERABLE_PROGRESS_CONFIG = {
  THRESHOLDS: {
    COMPLETED: 100,
    IN_PROGRESS: 0,
  },
  STYLES: {
    COMPLETED: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
    },
    IN_PROGRESS: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
    NOT_STARTED: {
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-400',
    },
  },
} as const;

/**
 * Task management page messages
 */
export const TASK_MANAGEMENT_MESSAGES = {
  LOADING: 'Loading tasks...',
  ERROR: {
    TITLE: 'Error Loading Tasks',
    DESCRIPTION: 'Unable to load tasks. Please try again.',
    BUTTON: 'Retry',
  },
  EMPTY: {
    TITLE: 'No Tasks Found',
    DESCRIPTION: 'Get started by creating your first task.',
  },
  HEADER: {
    TITLE: 'Task Management',
    PROGRESS_LABEL: 'Overall project progress',
    STATS_LABELS: {
      COMPLETED: 'completed',
      TOTAL: 'total tasks',
    },
  },
  ACTIONS: {
    EXPAND_ALL: 'Expand All',
    COLLAPSE_ALL: 'Collapse All',
  },
  ARIA: {
    PROGRESS_LABEL: 'Overall project progress',
    CHECKBOX_LABEL: (taskTitle: string, isCompleted: boolean) =>
      isCompleted
        ? `Mark "${taskTitle}" as incomplete`
        : `Mark "${taskTitle}" as complete`,
  },
  METADATA: {
    ESTIMATE: (hours: number) =>
      `Estimated time: ${hours} ${hours === 1 ? 'hour' : 'hours'}`,
    ASSIGNEE: (name: string) => `Assigned to ${name}`,
    RISK: (level: string) => `${level.charAt(0).toUpperCase() + level.slice(1)} risk level`,
  },
} as const;

/**
 * Task management dimensions and sizing
 */
export const TASK_DIMENSIONS = {
  CHECKBOX: {
    SIZE: 20, // w-5 h-5 = 20px
    BORDER_WIDTH: 2,
  },
  CHECKMARK: {
    SIZE: 12, // w-3 h-3 = 12px
  },
  SPINNER: {
    SIZE: 12, // w-3 h-3 = 12px
  },
  STATUS_BADGE: {
    PADDING_X: 8, // px-2 = 8px
    PADDING_Y: 2, // py-0.5 = 2px
  },
  ICON: {
    SIZE: 12, // w-3 h-3 = 12px
  },
  ITEM_PADDING: 12, // p-3 = 12px
  GAP: 12, // gap-3 = 12px
} as const;

/**
 * Animation durations for task management
 */
export const TASK_ANIMATION_DURATIONS = {
  CHECKBOX_TRANSITION: 200, // duration-200
  TITLE_TRANSITION: 300, // duration-300
  PROGRESS_TRANSITION: 500, // duration-500
  HOVER_SCALE: 105, // scale-105 = 1.05
  CHECKED_SCALE: 110, // scale-110 = 1.10
} as const;

export type TaskStatusConfig = typeof TASK_STATUS_CONFIG;
export type RiskLevelConfig = typeof RISK_LEVEL_CONFIG;
export type TaskItemStyles = typeof TASK_ITEM_STYLES;
export type TaskHeaderStyles = typeof TASK_HEADER_STYLES;
export type DeliverableCardStyles = typeof DELIVERABLE_CARD_STYLES;
