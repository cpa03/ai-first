/**
 * Storage Keys Configuration
 *
 * Centralizes all localStorage and sessionStorage key prefixes and names.
 * Follows the "Flexy" principle: eliminate hardcoded storage keys.
 *
 * All keys use a consistent prefix pattern for easy identification and
 * to avoid conflicts with third-party libraries.
 */

import { EnvLoader } from './environment';

/**
 * Application storage key prefix
 * All storage keys are prefixed with this to avoid conflicts
 * Env: STORAGE_KEY_PREFIX (default: 'ideaflow_')
 */
const STORAGE_PREFIX = EnvLoader.string('STORAGE_KEY_PREFIX', 'ideaflow_');

/**
 * LocalStorage Keys
 * Used for persistent client-side storage
 */
export const LOCAL_STORAGE_KEYS = {
  /** User remembered email for login form */
  REMEMBERED_EMAIL: `${STORAGE_PREFIX}remembered_email`,

  /** User preferences (theme, notifications, etc.) */
  USER_PREFERENCES: `${STORAGE_PREFIX}user_preferences`,

  /** Keyboard shortcuts preferences */
  KEYBOARD_SHORTCUTS: `${STORAGE_PREFIX}keyboard_shortcuts`,

  /** Onboarding completion status */
  ONBOARDING_COMPLETED: `${STORAGE_PREFIX}onboarding_completed`,

  /** A/B test variant assignments */
  AB_TEST_ASSIGNMENTS: `${STORAGE_PREFIX}ab_assignments`,

  /** Cache entries */
  CACHE_PREFIX: `${STORAGE_PREFIX}cache_`,
} as const;

/**
 * SessionStorage Keys
 * Used for session-scoped client-side storage
 */
export const SESSION_STORAGE_KEYS = {
  /** Session ID for analytics and tracking */
  SESSION_ID: `${STORAGE_PREFIX}session_id`,

  /** Temporary form state */
  FORM_STATE: `${STORAGE_PREFIX}form_state`,
} as const;

/**
 * Supabase Auth Storage Keys
 * Used by Supabase client library (prefixed differently)
 */
export const SUPABASE_STORAGE_KEYS = {
  /** Auth token storage key pattern */
  AUTH_TOKEN: 'sb-',
} as const;

/**
 * All storage keys combined for convenience
 */
export const STORAGE_KEYS = {
  LOCAL: LOCAL_STORAGE_KEYS,
  SESSION: SESSION_STORAGE_KEYS,
  SUPABASE: SUPABASE_STORAGE_KEYS,
} as const;

export type LocalStorageKeys = typeof LOCAL_STORAGE_KEYS;
export type SessionStorageKeys = typeof SESSION_STORAGE_KEYS;
export type StorageKeys = typeof STORAGE_KEYS;
