/**
 * Component Text Strings Configuration
 *
 * Centralizes all hardcoded text strings used in React components.
 * This follows the "Flexy" principle: eliminate hardcoded values and make
 * modular systems.
 *
 * Usage:
 * ```typescript
 * import { COMPONENT_TEXT_STRINGS } from '@/lib/config/component-text-strings';
 *
 * // Instead of hardcoded string:
 * // <div>Loading...</div>
 * <div>{COMPONENT_TEXT_STRINGS.LOADING.DEFAULT}</div>
 * ```
 */

/**
 * Loading text strings
 */
export const LOADING_STRINGS = {
  /** Default loading text */
  DEFAULT: 'Loading...',
  /** Loading data */
  DATA: 'Loading data...',
  /** Loading content */
  CONTENT: 'Loading content...',
  /** Please wait */
  PLEASE_WAIT: 'Please wait...',
  /** Processing */
  PROCESSING: 'Processing...',
} as const;

/**
 * Error text strings
 */
export const ERROR_STRINGS = {
  /** Default error message */
  DEFAULT: 'An error occurred',
  /** Something went wrong */
  SOMETHING_WENT_WRONG: 'Something went wrong',
  /** Try again */
  TRY_AGAIN: 'Try again',
  /** Error loading data */
  LOADING_DATA: 'Error loading data',
  /** Error saving data */
  SAVING_DATA: 'Error saving data',
  /** Network error */
  NETWORK: 'Network error',
  /** Unauthorized */
  UNAUTHORIZED: 'Unauthorized',
  /** Forbidden */
  FORBIDDEN: 'Forbidden',
  /** Not found */
  NOT_FOUND: 'Not found',
  /** Server error */
  SERVER: 'Server error',
} as const;

/**
 * Success text strings
 */
export const SUCCESS_STRINGS = {
  /** Default success message */
  DEFAULT: 'Success!',
  /** Saved successfully */
  SAVED: 'Saved successfully',
  /** Updated successfully */
  UPDATED: 'Updated successfully',
  /** Deleted successfully */
  DELETED: 'Deleted successfully',
  /** Copied to clipboard */
  COPIED: 'Copied to clipboard',
  /** Operation completed */
  COMPLETED: 'Operation completed',
} as const;

/**
 * Action text strings
 */
export const ACTION_STRINGS = {
  /** Save button */
  SAVE: 'Save',
  /** Cancel button */
  CANCEL: 'Cancel',
  /** Delete button */
  DELETE: 'Delete',
  /** Edit button */
  EDIT: 'Edit',
  /** Add button */
  ADD: 'Add',
  /** Remove button */
  REMOVE: 'Remove',
  /** Submit button */
  SUBMIT: 'Submit',
  /** Close button */
  CLOSE: 'Close',
  /** Back button */
  BACK: 'Back',
  /** Next button */
  NEXT: 'Next',
  /** Previous button */
  PREVIOUS: 'Previous',
  /** Continue button */
  CONTINUE: 'Continue',
  /** Finish button */
  FINISH: 'Finish',
  /** Try again button */
  TRY_AGAIN: 'Try again',
  /** Refresh button */
  REFRESH: 'Refresh',
  /** Retry button */
  RETRY: 'Retry',
} as const;

/**
 * Confirmation text strings
 */
export const CONFIRMATION_STRINGS = {
  /** Are you sure? */
  ARE_YOU_SURE: 'Are you sure?',
  /** Confirm deletion */
  CONFIRM_DELETION: 'Are you sure you want to delete this?',
  /** Confirm action */
  CONFIRM_ACTION: 'Are you sure you want to proceed?',
  /** Unsaved changes */
  UNSAVED_CHANGES: 'You have unsaved changes',
  /** Leave page */
  LEAVE_PAGE: 'Are you sure you want to leave this page?',
} as const;

/**
 * Form text strings
 */
export const FORM_STRINGS = {
  /** Required field */
  REQUIRED: 'This field is required',
  /** Invalid email */
  INVALID_EMAIL: 'Please enter a valid email address',
  /** Password required */
  PASSWORD_REQUIRED: 'Password is required',
  /** Passwords do not match */
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  /** Minimum length */
  MIN_LENGTH: 'Must be at least {min} characters',
  /** Maximum length */
  MAX_LENGTH: 'Must be at most {max} characters',
  /** Invalid format */
  INVALID_FORMAT: 'Invalid format',
} as const;

/**
 * Navigation text strings
 */
export const NAVIGATION_STRINGS = {
  /** Home */
  HOME: 'Home',
  /** Dashboard */
  DASHBOARD: 'Dashboard',
  /** Settings */
  SETTINGS: 'Settings',
  /** Profile */
  PROFILE: 'Profile',
  /** Logout */
  LOGOUT: 'Logout',
  /** Login */
  LOGIN: 'Login',
  /** Sign up */
  SIGN_UP: 'Sign up',
} as const;

/**
 * Status text strings
 */
export const STATUS_STRINGS = {
  /** Active */
  ACTIVE: 'Active',
  /** Inactive */
  INACTIVE: 'Inactive',
  /** Pending */
  PENDING: 'Pending',
  /** Completed */
  COMPLETED: 'Completed',
  /** In progress */
  IN_PROGRESS: 'In progress',
  /** Cancelled */
  CANCELLED: 'Cancelled',
  /** Draft */
  DRAFT: 'Draft',
  /** Published */
  PUBLISHED: 'Published',
} as const;

/**
 * Time text strings
 */
export const TIME_STRINGS = {
  /** Just now */
  JUST_NOW: 'Just now',
  /** Minutes ago */
  MINUTES_AGO: '{minutes} minutes ago',
  /** Hours ago */
  HOURS_AGO: '{hours} hours ago',
  /** Days ago */
  DAYS_AGO: '{days} days ago',
  /** Weeks ago */
  WEEKS_AGO: '{weeks} weeks ago',
  /** Months ago */
  MONTHS_AGO: '{months} months ago',
  /** Years ago */
  YEARS_AGO: '{years} years ago',
} as const;

/**
 * Combined text strings for components
 */
export const COMPONENT_TEXT_STRINGS = {
  LOADING: LOADING_STRINGS,
  ERROR: ERROR_STRINGS,
  SUCCESS: SUCCESS_STRINGS,
  ACTION: ACTION_STRINGS,
  CONFIRMATION: CONFIRMATION_STRINGS,
  FORM: FORM_STRINGS,
  NAVIGATION: NAVIGATION_STRINGS,
  STATUS: STATUS_STRINGS,
  TIME: TIME_STRINGS,
} as const;
