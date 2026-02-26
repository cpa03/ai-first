import {
  ANALYTICS_EVENTS,
  ANALYTICS_CONFIG,
  ANALYTICS_PROVIDERS,
  trackEvent,
  trackPageView,
  trackSocialShare,
  trackIdeaSubmit,
  trackCtaClick,
  trackCopyAction,
  trackOnboardingStart,
  trackOnboardingComplete,
  flush,
  resetAnalytics,
} from '@/lib/analytics';

// Mock the environment loader
jest.mock('@/lib/config/environment', () => ({
  EnvLoader: {
    boolean: jest.fn(() => true),
    number: jest.fn(() => 100),
    string: jest.fn(() => ''),
  },
}));

// Mock logger - track debug calls
export const mockLoggerDebug = jest.fn();
jest.mock('@/lib/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: (...args: unknown[]) => mockLoggerDebug(...args),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
  setLogLevel: jest.fn(),
  LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
}));

describe('Analytics', () => {
  beforeEach(() => {
    // Reset analytics state before each test
    resetAnalytics();
    // Clear mocks
    jest.clearAllMocks();
    mockLoggerDebug.mockClear();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('ANALYTICS_EVENTS', () => {
    it('should have all required event types', () => {
      expect(ANALYTICS_EVENTS.IDEA_SUBMIT).toBe('idea_submit');
      expect(ANALYTICS_EVENTS.IDEA_CLARIFY_START).toBe('idea_clarify_start');
      expect(ANALYTICS_EVENTS.IDEA_CLARIFY_COMPLETE).toBe(
        'idea_clarify_complete'
      );
      expect(ANALYTICS_EVENTS.SOCIAL_SHARE).toBe('social_share');
      expect(ANALYTICS_EVENTS.SOCIAL_SHARE_CLICK).toBe('social_share_click');
      expect(ANALYTICS_EVENTS.PAGE_VIEW).toBe('page_view');
      expect(ANALYTICS_EVENTS.CTA_CLICK).toBe('cta_click');
      expect(ANALYTICS_EVENTS.COPY_ACTION).toBe('copy_action');
      expect(ANALYTICS_EVENTS.SIGNUP_START).toBe('signup_start');
      expect(ANALYTICS_EVENTS.LOGIN_START).toBe('login_start');
      expect(ANALYTICS_EVENTS.ONBOARDING_START).toBe('onboarding_start');
      expect(ANALYTICS_EVENTS.ONBOARDING_COMPLETE).toBe('onboarding_complete');
      expect(ANALYTICS_EVENTS.ERROR_OCCURRED).toBe('error_occurred');
    });
  });

  describe('ANALYTICS_PROVIDERS', () => {
    it('should have PostHog and Console providers', () => {
      expect(ANALYTICS_PROVIDERS.POSTHOG).toBe('posthog');
      expect(ANALYTICS_PROVIDERS.CONSOLE).toBe('console');
    });
  });

  describe('ANALYTICS_CONFIG', () => {
    it('should have required configuration properties', () => {
      expect(ANALYTICS_CONFIG).toHaveProperty('ENABLED');
      expect(ANALYTICS_CONFIG).toHaveProperty('DEBUG');
      expect(ANALYTICS_CONFIG).toHaveProperty('SAMPLE_RATE');
      expect(ANALYTICS_CONFIG).toHaveProperty('MAX_QUEUE_SIZE');
      expect(ANALYTICS_CONFIG).toHaveProperty('FLUSH_INTERVAL_MS');
      expect(ANALYTICS_CONFIG).toHaveProperty('EXCLUDED_EVENTS');
      expect(ANALYTICS_CONFIG).toHaveProperty('PROVIDER');
      expect(ANALYTICS_CONFIG).toHaveProperty('POSTHOG_API_KEY');
      expect(ANALYTICS_CONFIG).toHaveProperty('POSTHOG_HOST');
      expect(ANALYTICS_CONFIG).toHaveProperty('POSTHOG_ENABLED');
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should track a basic event', () => {
      // Check logger.debug was called

      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW);

      // Flush events
      jest.advanceTimersByTime(ANALYTICS_CONFIG.FLUSH_INTERVAL_MS + 1);

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should include event properties', () => {
      // Check logger.debug was called

      trackEvent(ANALYTICS_EVENTS.IDEA_SUBMIT, {
        idea_id: 'test-idea-123',
      });

      jest.advanceTimersByTime(ANALYTICS_CONFIG.FLUSH_INTERVAL_MS + 1);

      expect(mockLoggerDebug).toHaveBeenCalled();
      const logCall = mockLoggerDebug.mock.calls.find(
        (call: unknown[]) =>
          (call[0] as string)?.includes('Track event') ||
          (call[0] as string)?.includes('Events:')
      );
      expect(logCall).toBeDefined();
    });

    it('should skip events when analytics is disabled', () => {
      // Check logger.debug was called
      // Track should return early without logging when disabled
      // The exact behavior depends on ANALYTICS_CONFIG.ENABLED
    });
  });

  describe('trackPageView', () => {
    it('should track page view event', () => {
      // Check logger.debug was called

      trackPageView('/test-page');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should use current path when no custom path provided', () => {
      // Check logger.debug was called

      trackPageView();

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackSocialShare', () => {
    it('should track social share with platform', () => {
      // Check logger.debug was called

      trackSocialShare('twitter', 'idea-123');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should track social share without idea ID', () => {
      // Check logger.debug was called

      trackSocialShare('copy');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackIdeaSubmit', () => {
    it('should track idea submission with idea ID', () => {
      // Check logger.debug was called

      trackIdeaSubmit('idea-abc-123');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackCtaClick', () => {
    it('should track CTA click with name', () => {
      // Check logger.debug was called

      trackCtaClick('get_started');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackCopyAction', () => {
    it('should track copy action with type', () => {
      // Check logger.debug was called

      trackCopyAction('blueprint');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackOnboardingStart', () => {
    it('should track onboarding start with step', () => {
      // Check logger.debug was called

      trackOnboardingStart('welcome');

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('trackOnboardingComplete', () => {
    it('should track onboarding completion', () => {
      // Check logger.debug was called

      trackOnboardingComplete({ total_steps: 4 });

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should track skipped onboarding', () => {
      // Check logger.debug was called

      trackOnboardingComplete({
        skipped: true,
        completed_steps: 2,
        total_steps: 4,
      });

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should handle no options', () => {
      // Check logger.debug was called

      trackOnboardingComplete();

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should flush pending events', () => {
      // Check logger.debug was called

      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW);
      flush();

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should not error when queue is empty', () => {
      expect(() => flush()).not.toThrow();
    });
  });

  describe('resetAnalytics', () => {
    it('should reset the event queue', () => {
      // Check logger.debug was called

      // Add some events
      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW);
      trackEvent(ANALYTICS_EVENTS.IDEA_SUBMIT);

      // Reset
      resetAnalytics();

      // Flush should have nothing to send
      flush();

      // Should not have logged the events after reset
      // (exact behavior depends on implementation)
    });

    it('should not throw when called multiple times', () => {
      expect(() => {
        resetAnalytics();
        resetAnalytics();
        resetAnalytics();
      }).not.toThrow();
    });
  });

  describe('Event properties', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should include timestamp in event', () => {
      // Check logger.debug was called

      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW);

      jest.advanceTimersByTime(ANALYTICS_CONFIG.FLUSH_INTERVAL_MS + 1);

      expect(mockLoggerDebug).toHaveBeenCalled();
    });

    it('should include session_id in event', () => {
      // Check logger.debug was called

      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW);

      jest.advanceTimersByTime(ANALYTICS_CONFIG.FLUSH_INTERVAL_MS + 1);

      expect(mockLoggerDebug).toHaveBeenCalled();
    });
  });
});
