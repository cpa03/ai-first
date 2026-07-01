/**
 * Notification Configuration
 * Centralizes notification-related strings, URLs, and defaults
 * Follows the "Flexy" principle: eliminate hardcoded values
 */

import { EnvLoader } from './environment';

/**
 * Browser settings URLs for different browsers
 * Eliminates hardcoded browser URLs in components
 * All values support environment variable overrides via EnvLoader
 */
export const BROWSER_SETTINGS_URLS = {
  /** Chrome notification settings URL
   *  Env: BROWSER_SETTINGS_URL_CHROME (default: 'chrome://settings') */
  CHROME: EnvLoader.string('BROWSER_SETTINGS_URL_CHROME', 'chrome://settings'),
  /** Firefox notification settings URL
   *  Env: BROWSER_SETTINGS_URL_FIREFOX (default: 'about:preferences#privacy') */
  FIREFOX: EnvLoader.string(
    'BROWSER_SETTINGS_URL_FIREFOX',
    'about:preferences#privacy'
  ),
  /** Safari notification settings URL
   *  Env: BROWSER_SETTINGS_URL_SAFARI (default: 'x-apple.systempreferences:com.apple.preference.notifications') */
  SAFARI: EnvLoader.string(
    'BROWSER_SETTINGS_URL_SAFARI',
    'x-apple.systempreferences:com.apple.preference.notifications'
  ),
  /** Edge notification settings URL
   *  Env: BROWSER_SETTINGS_URL_EDGE (default: 'edge://settings/content/notifications') */
  EDGE: EnvLoader.string(
    'BROWSER_SETTINGS_URL_EDGE',
    'edge://settings/content/notifications'
  ),
  /** Default fallback
   *  Env: BROWSER_SETTINGS_URL_DEFAULT (default: 'chrome://settings') */
  DEFAULT: EnvLoader.string(
    'BROWSER_SETTINGS_URL_DEFAULT',
    'chrome://settings'
  ),
} as const;

/**
 * Notification permission status strings
 * Eliminates hardcoded status text in components
 */
export const NOTIFICATION_STATUS = {
  GRANTED: 'Enabled',
  DENIED: 'Blocked',
  PROMPT: 'Not yet enabled',
  UNSUPPORTED: 'Not supported',
  SAVING: 'Saving...',
} as const;

/**
 * Notification preference labels
 * Eliminates hardcoded labels in NotificationPreferences component
 */
export const NOTIFICATION_LABELS = {
  /** Main heading for notification settings */
  SETTINGS_TITLE: 'Notification Settings',
  /** Browser notifications section title */
  BROWSER_SECTION: 'Browser Notifications',
  /** Save button text when changes exist */
  SAVE_BUTTON: 'Save Changes',
  /** Save button text when saving in progress */
  SAVING_BUTTON: 'Saving...',
  /** Manage button for browser notifications */
  MANAGE_BUTTON: 'Manage',
  /** Unblock button when notifications are blocked */
  UNBLOCK_BUTTON: 'Unblock',
  /** Enable button when notifications not yet enabled */
  ENABLE_BUTTON: 'Enable',
  /** Notification types section heading */
  NOTIFICATION_TYPES_HEADING: 'Notification Types',
  /** Task reminders toggle label */
  TASK_REMINDERS_LABEL: 'Task Reminders',
  /** Task reminders description */
  TASK_REMINDERS_DESCRIPTION: 'Get notified when tasks are updated',
  /** Idea updates toggle label */
  IDEA_UPDATES_LABEL: 'Idea Updates',
  /** Idea updates description */
  IDEA_UPDATES_DESCRIPTION: 'Updates about your ideas',
  /** Weekly digest toggle label */
  WEEKLY_DIGEST_LABEL: 'Weekly Digest',
  /** Weekly digest description */
  WEEKLY_DIGEST_DESCRIPTION: 'Summary of your weekly progress',
} as const;

/**
 * Notification prompt labels
 * Eliminates hardcoded labels in NotificationPrompt component
 */
export const NOTIFICATION_PROMPT_LABELS = {
  /** Enable button label */
  ENABLE_LABEL: 'Enable Notifications',
  /** Enabled state label */
  ENABLED_LABEL: 'Notifications Enabled',
  /** Default message explaining notification benefits */
  MESSAGE: 'Stay updated with important progress on your ideas!',
  /** Dismiss button text */
  DISMISS_TEXT: 'Maybe later',
  /** ARIA label for dismiss button */
  DISMISS_ARIA_LABEL: 'Maybe later',
  /** ARIA label for notification prompt region */
  ARIA_LABEL: 'Stay updated with notifications',
  /** Heading text when card variant is shown */
  HEADING: 'Stay in the Loop',
  /** Status text when notifications are blocked */
  BLOCKED_STATUS: 'Notifications blocked',
  /** Loading state text */
  ENABLING: 'Enabling...',
} as const;

/**
 * Default notification preferences
 * Eliminates hardcoded default values
 */
export const DEFAULT_NOTIFICATION_PREFERENCES = {
  BROWSER: false,
  EMAIL: true,
  TASK_REMINDERS: true,
  IDEA_UPDATES: true,
  WEEKLY_DIGEST: false,
} as const;

/**
 * Notification configuration object
 * Combines all notification-related configuration
 */
export const NOTIFICATION_CONFIG = {
  /** Browser settings URLs */
  BROWSER_URLS: BROWSER_SETTINGS_URLS,

  /** Permission status strings */
  STATUS: NOTIFICATION_STATUS,

  /** Preference labels */
  LABELS: NOTIFICATION_LABELS,

  /** Prompt labels */
  PROMPT_LABELS: NOTIFICATION_PROMPT_LABELS,

  /** Default preferences */
  DEFAULT_PREFERENCES: DEFAULT_NOTIFICATION_PREFERENCES,

  /** Detect current browser settings URL */
  getBrowserSettingsUrl: (): string => {
    if (typeof window === 'undefined') {
      return BROWSER_SETTINGS_URLS.DEFAULT;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('edge')) {
      return BROWSER_SETTINGS_URLS.EDGE;
    }
    if (userAgent.includes('firefox')) {
      return BROWSER_SETTINGS_URLS.FIREFOX;
    }
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return BROWSER_SETTINGS_URLS.SAFARI;
    }
    return BROWSER_SETTINGS_URLS.CHROME;
  },
} as const;

export type NotificationConfig = typeof NOTIFICATION_CONFIG;
