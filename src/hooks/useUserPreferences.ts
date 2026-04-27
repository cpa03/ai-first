'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useUserPreferences');

/**
 * Default user preferences
 */
export interface UserPreferences {
  /** Theme preference: 'light' | 'dark' | 'system' */
  theme: 'light' | 'dark' | 'system';
  /** Whether to show onboarding tour */
  hasSeenOnboarding: boolean;
  /** Notification preferences */
  notifications: {
    browser: boolean;
    email: boolean;
    taskReminders: boolean;
    ideaUpdates: boolean;
    weeklyDigest: boolean;
  };
  /** Last seen timestamp */
  lastSeen?: number;
  /** First visit timestamp */
  firstVisit?: number;
  /** Number of times user has visited */
  visitCount: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  hasSeenOnboarding: false,
  notifications: {
    browser: false,
    email: true,
    taskReminders: true,
    ideaUpdates: true,
    weeklyDigest: false,
  },
  visitCount: 1,
};

/**
 * Storage key for preferences
 */
const STORAGE_KEY = 'ideaflow_user_preferences';

/**
 * Get initial preferences from localStorage or defaults
 */
function getInitialPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new fields
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        notifications: {
          ...DEFAULT_PREFERENCES.notifications,
          ...parsed.notifications,
        },
      };
    }
  } catch (error) {
    logger.error('Failed to parse user preferences from localStorage', error);
  }

  // First visit - set firstVisit timestamp
  const prefs = { ...DEFAULT_PREFERENCES };
  prefs.firstVisit = Date.now();
  return prefs;
}

export interface UseUserPreferencesReturn {
  /** Current user preferences */
  preferences: UserPreferences;
  /** Whether preferences are loaded from localStorage */
  isLoading: boolean;
  /** Update a single preference */
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  /** Update multiple preferences at once */
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  /** Update notification preferences */
  updateNotificationPreferences: (
    updates: Partial<UserPreferences['notifications']>
  ) => void;
  /** Reset preferences to defaults */
  resetPreferences: () => void;
}

/**
 * Hook for managing user preferences with localStorage persistence
 *
 * Growth: Enables personalized user experiences and retention tracking.
 * Persists theme, notifications, onboarding state, and visit metrics.
 *
 * @example
 * const { preferences, updatePreference } = useUserPreferences();
 *
 * // Update theme
 * updatePreference('theme', 'dark');
 *
 * // Check if first visit
 * if (preferences.visitCount === 1) {
 *   showWelcomeMessage();
 * }
 */
export function useUserPreferences(): UseUserPreferencesReturn {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loaded = getInitialPreferences();

    // Increment visit count if not first visit
    if (loaded.firstVisit) {
      loaded.visitCount = (loaded.visitCount || 0) + 1;
    }

    loaded.lastSeen = Date.now();

    setPreferences(loaded);
    setIsLoading(false);

    logger.debug('User preferences loaded', {
      visitCount: loaded.visitCount,
      theme: loaded.theme,
      hasSeenOnboarding: loaded.hasSeenOnboarding,
    });
  }, []);

  // Persist to localStorage whenever preferences change
  const persistPreferences = useCallback((prefs: UserPreferences) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      logger.debug('User preferences persisted');
    } catch (error) {
      logger.error('Failed to persist user preferences', error);
    }
  }, []);

  /**
   * Update a single preference
   */
  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  /**
   * Update multiple preferences at once
   */
  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const updated = { ...prev, ...updates };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  /**
   * Update notification preferences specifically
   */
  const updateNotificationPreferences = useCallback(
    (updates: Partial<UserPreferences['notifications']>) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          notifications: {
            ...prev.notifications,
            ...updates,
          },
        };
        persistPreferences(updated);
        return updated;
      });
    },
    [persistPreferences]
  );

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(() => {
    const defaults = { ...DEFAULT_PREFERENCES };
    defaults.firstVisit = Date.now();
    defaults.visitCount = 1;
    setPreferences(defaults);
    persistPreferences(defaults);
    logger.info('User preferences reset to defaults');
  }, [persistPreferences]);

  // PERFORMANCE: Memoize return object to ensure referential stability.
  // This prevents unnecessary re-renders in components consuming this hook.
  return useMemo(
    () => ({
      preferences,
      isLoading,
      updatePreference,
      updatePreferences,
      updateNotificationPreferences,
      resetPreferences,
    }),
    [
      preferences,
      isLoading,
      updatePreference,
      updatePreferences,
      updateNotificationPreferences,
      resetPreferences,
    ]
  );
}

export default useUserPreferences;
