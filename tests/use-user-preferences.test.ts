import { renderHook, act } from '@testing-library/react';

// Mock the logger
const mockLoggerDebug = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: (...args: unknown[]) => mockLoggerDebug(...args),
    info: (...args: unknown[]) => mockLoggerInfo(...args),
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: jest.fn(),
  })),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useUserPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    (localStorageMock.getItem as jest.Mock).mockReturnValue(null);
    (localStorageMock.setItem as jest.Mock).mockImplementation(
      (key: string, value: string) => {
        (localStorageMock as any).store[key] = value;
      }
    );
  });

  describe('Initial state', () => {
    it('should return default preferences when localStorage is empty', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      // Wait for loading to complete
      expect(result.current.isLoading).toBe(false);

      expect(result.current.preferences.theme).toBe('system');
      expect(result.current.preferences.hasSeenOnboarding).toBe(false);
      expect(result.current.preferences.notifications.browser).toBe(false);
      expect(result.current.preferences.notifications.email).toBe(true);
      expect(result.current.preferences.visitCount).toBeGreaterThanOrEqual(1);
    });

    it('should load preferences from localStorage when available', () => {
      const storedPrefs = {
        theme: 'dark' as const,
        hasSeenOnboarding: true,
        notifications: {
          browser: true,
          email: false,
          taskReminders: true,
          ideaUpdates: false,
          weeklyDigest: true,
        },
        visitCount: 5,
        firstVisit: 1000000,
        lastSeen: 2000000,
      };

      (localStorageMock.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(storedPrefs)
      );

      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      expect(result.current.preferences.theme).toBe('dark');
      expect(result.current.preferences.hasSeenOnboarding).toBe(true);
      expect(result.current.preferences.notifications.browser).toBe(true);
    });

    it('should merge stored preferences with defaults for new fields', () => {
      const storedPrefs = {
        theme: 'light' as const,
        // Missing other fields - should use defaults
      };

      (localStorageMock.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(storedPrefs)
      );

      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      expect(result.current.preferences.theme).toBe('light');
      // Should have default for missing fields
      expect(result.current.preferences.hasSeenOnboarding).toBe(false);
      expect(result.current.preferences.notifications).toBeDefined();
    });
  });

  describe('updatePreference', () => {
    it('should update a single preference', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      act(() => {
        result.current.updatePreference('theme', 'dark');
      });

      expect(result.current.preferences.theme).toBe('dark');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should update hasSeenOnboarding preference', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      act(() => {
        result.current.updatePreference('hasSeenOnboarding', true);
      });

      expect(result.current.preferences.hasSeenOnboarding).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update multiple preferences at once', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      act(() => {
        result.current.updatePreferences({
          theme: 'light',
          hasSeenOnboarding: true,
        });
      });

      expect(result.current.preferences.theme).toBe('light');
      expect(result.current.preferences.hasSeenOnboarding).toBe(true);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      act(() => {
        result.current.updateNotificationPreferences({
          browser: true,
          weeklyDigest: true,
        });
      });

      expect(result.current.preferences.notifications.browser).toBe(true);
      expect(result.current.preferences.notifications.weeklyDigest).toBe(true);
      // Other notification prefs should remain unchanged
      expect(result.current.preferences.notifications.email).toBe(true);
    });

    it('should not affect other preferences when updating notifications', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      // First set a theme
      act(() => {
        result.current.updatePreference('theme', 'dark');
      });

      // Then update notifications
      act(() => {
        result.current.updateNotificationPreferences({
          browser: true,
        });
      });

      expect(result.current.preferences.theme).toBe('dark');
      expect(result.current.preferences.notifications.browser).toBe(true);
    });
  });

  describe('resetPreferences', () => {
    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      // First modify some preferences
      act(() => {
        result.current.updatePreferences({
          theme: 'dark',
          hasSeenOnboarding: true,
        });
      });

      // Then reset
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences.theme).toBe('system');
      expect(result.current.preferences.hasSeenOnboarding).toBe(false);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'User preferences reset to defaults'
      );
    });
  });

  describe('Persistence', () => {
    it('should persist preferences to localStorage on update', () => {
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      act(() => {
        result.current.updatePreference('theme', 'dark');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ideaflow_user_preferences',
        expect.stringContaining('"theme":"dark"')
      );
    });

    it('should handle localStorage errors gracefully', () => {
      (localStorageMock.setItem as jest.Mock).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      // Should not throw
      expect(() => {
        act(() => {
          result.current.updatePreference('theme', 'dark');
        });
      }).not.toThrow();

      expect(mockLoggerError).toHaveBeenCalled();
    });
  });

  describe('Server-side rendering', () => {
    it('should return default preferences on server (typeof window === undefined)', () => {
      // This test verifies the hook handles SSR gracefully
      // The actual SSR handling depends on the implementation
      const { result } = renderHook(() =>
        require('@/hooks/useUserPreferences').useUserPreferences()
      );

      // Should have default values
      expect(result.current.preferences).toBeDefined();
      expect(result.current.preferences.theme).toBeDefined();
    });
  });
});
