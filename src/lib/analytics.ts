/**
 * Analytics Event Tracking
 *
 * Provides a simple, extensible event tracking system for measuring user interactions.
 * This is the foundational layer for growth analytics - tracks key events that can later
 * be sent to analytics providers like PostHog, Mixpanel, Google Analytics, etc.
 *
 * Key events tracked:
 * - idea_submit: When user submits a new idea
 * - social_share: When user shares content
 * - page_view: When user views a page
 * - cta_click: When user clicks call-to-action buttons
 * - copy_action: When user copies content
 * - onboarding_start: When user starts onboarding tour
 * - onboarding_complete: When user completes onboarding tour
 */

import { EnvLoader } from '@/lib/config/environment';

/**
 * Event categories for analytics
 */
export const ANALYTICS_EVENTS = {
  // Idea management
  IDEA_SUBMIT: 'idea_submit',
  IDEA_CLARIFY_START: 'idea_clarify_start',
  IDEA_CLARIFY_COMPLETE: 'idea_clarify_complete',

  // Social & viral
  SOCIAL_SHARE: 'social_share',
  SOCIAL_SHARE_CLICK: 'social_share_click',

  // User actions
  PAGE_VIEW: 'page_view',
  CTA_CLICK: 'cta_click',
  COPY_ACTION: 'copy_action',
  SIGNUP_START: 'signup_start',
  LOGIN_START: 'login_start',

  // Onboarding
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_COMPLETE: 'onboarding_complete',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
} as const;

export type AnalyticsEventType =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Analytics event properties
 */
export interface AnalyticsEventProperties {
  // Required
  event: AnalyticsEventType;
  timestamp: number;

  // Optional - context
  page_path?: string;
  page_title?: string;

  // Optional - user context (anonymized)
  session_id?: string;
  user_id?: string;

  // Optional - event-specific properties
  idea_id?: string;
  share_platform?: string;
  cta_name?: string;
  copy_type?: string;
  error_type?: string;
  error_message?: string;
  step?: string;
  skipped?: boolean;
  completed_steps?: number;
  total_steps?: number;

  // Additional custom properties
  [key: string]: string | number | boolean | undefined;
}

/**
 * Analytics configuration
 */
export const ANALYTICS_CONFIG = {
  /**
   * Whether analytics is enabled
   * Env: NEXT_PUBLIC_ANALYTICS_ENABLED (default: true in development, false in production)
   */
  ENABLED: EnvLoader.boolean(
    'NEXT_PUBLIC_ANALYTICS_ENABLED',
    process.env.NODE_ENV !== 'production'
  ),

  /**
   * Console logging for debugging
   * Env: ANALYTICS_DEBUG (default: true in development)
   */
  DEBUG: EnvLoader.boolean(
    'ANALYTICS_DEBUG',
    process.env.NODE_ENV !== 'production'
  ),

  /**
   * Sample rate for events (0-100)
   * Use for reducing event volume in high-traffic scenarios
   * Env: ANALYTICS_SAMPLE_RATE (default: 100)
   */
  SAMPLE_RATE: EnvLoader.number('ANALYTICS_SAMPLE_RATE', 100, 0, 100),

  /**
   * Maximum events to queue before flushing
   * Env: ANALYTICS_MAX_QUEUE_SIZE (default: 10)
   */
  MAX_QUEUE_SIZE: EnvLoader.number('ANALYTICS_MAX_QUEUE_SIZE', 10, 1, 100),

  /**
   * Flush interval in milliseconds
   * Env: ANALYTICS_FLUSH_INTERVAL_MS (default: 5000)
   */
  FLUSH_INTERVAL_MS: EnvLoader.number(
    'ANALYTICS_FLUSH_INTERVAL_MS',
    5000,
    1000,
    60000
  ),

  /**
   * List of events to exclude from tracking
   * Env: ANALYTICS_EXCLUDED_EVENTS (comma-separated)
   */
  EXCLUDED_EVENTS: (EnvLoader.string('ANALYTICS_EXCLUDED_EVENTS', '') || '')
    .split(',')
    .filter(Boolean),
} as const;

/**
 * Internal event queue
 */
let eventQueue: AnalyticsEventProperties[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Get current session ID (anonymous)
 * Creates a simple session ID stored in sessionStorage
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  const storageKey = 'ideaflow_session_id';
  try {
    let sessionId = sessionStorage.getItem(storageKey);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem(storageKey, sessionId);
    }
    return sessionId;
  } catch {
    return 'session_unavailable';
  }
}

/**
 * Get current page context
 */
function getPageContext(): { path: string; title: string } {
  if (typeof window === 'undefined') {
    return { path: '/server', title: 'Server' };
  }
  return {
    path: window.location.pathname,
    title: document.title || 'Unknown',
  };
}

/**
 * Filter events based on configuration
 */
function shouldTrackEvent(event: AnalyticsEventType): boolean {
  // Check if analytics is enabled
  if (!ANALYTICS_CONFIG.ENABLED) {
    return false;
  }

  // Check excluded events
  if (ANALYTICS_CONFIG.EXCLUDED_EVENTS.includes(event)) {
    return false;
  }

  // Check sample rate
  if (ANALYTICS_CONFIG.SAMPLE_RATE < 100) {
    const random = Math.random() * 100;
    if (random > ANALYTICS_CONFIG.SAMPLE_RATE) {
      return false;
    }
  }

  return true;
}

/**
 * Flush events to analytics provider(s)
 * This is where you would integrate with PostHog, Mixpanel, GA, etc.
 */
function flushEvents(): void {
  if (eventQueue.length === 0) return;

  const eventsToSend = [...eventQueue];
  eventQueue = [];

  // Debug logging
  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('[Analytics] Flushing events:', eventsToSend);
  }

  // TODO: Add analytics provider integration here
  // Examples:
  // - posthog.capture_batch(eventsToSend);
  // - mixpanel.track_batch(eventsToSend);
  // - gtag('event', 'batch', { events: eventsToSend });

  // For now, events are logged to console in debug mode
  // In production, you would send to your analytics backend

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
}

/**
 * Queue an event for batch sending
 */
function queueEvent(event: AnalyticsEventProperties): void {
  eventQueue.push(event);

  // Flush if queue is full
  if (eventQueue.length >= ANALYTICS_CONFIG.MAX_QUEUE_SIZE) {
    flushEvents();
    return;
  }

  // Schedule flush if not already scheduled
  if (!flushTimeout) {
    flushTimeout = setTimeout(flushEvents, ANALYTICS_CONFIG.FLUSH_INTERVAL_MS);
  }
}

/**
 * Track an analytics event
 *
 * @param event - The event type to track
 * @param properties - Additional properties for the event
 *
 * @example
 * trackEvent(ANALYTICS_EVENTS.IDEA_SUBMIT, {
 *   idea_id: 'abc123',
 *   page_path: '/',
 * });
 */
export function trackEvent(
  event: AnalyticsEventType,
  properties: Omit<AnalyticsEventProperties, 'event' | 'timestamp'> = {}
): void {
  // Skip if event should not be tracked
  if (!shouldTrackEvent(event)) {
    return;
  }

  const pageContext = getPageContext();

  const fullEvent: AnalyticsEventProperties = {
    event,
    timestamp: Date.now(),
    page_path: pageContext.path,
    page_title: pageContext.title,
    session_id: getSessionId(),
    ...properties,
  };

  // Debug logging
  if (ANALYTICS_CONFIG.DEBUG) {
    console.log('[Analytics] Track event:', fullEvent);
  }

  // Queue for batch sending
  queueEvent(fullEvent);
}

/**
 * Track a page view
 *
 * @param customPath - Optional custom path (defaults to current page)
 *
 * @example
 * trackPageView();
 * trackPageView('/dashboard');
 */
export function trackPageView(customPath?: string): void {
  const path = customPath || getPageContext().path;

  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
    page_path: path,
  });
}

/**
 * Track social share
 *
 * @param platform - The platform being shared to (twitter, facebook, linkedin, etc.)
 * @param ideaId - Optional idea ID being shared
 *
 * @example
 * trackSocialShare('twitter', 'abc123');
 * trackSocialShare('copy', undefined);
 */
export function trackSocialShare(platform: string, ideaId?: string): void {
  trackEvent(ANALYTICS_EVENTS.SOCIAL_SHARE, {
    share_platform: platform,
    idea_id: ideaId,
  });
}

/**
 * Track idea submission
 *
 * @param ideaId - The ID of the submitted idea
 *
 * @example
 * trackIdeaSubmit('idea_abc123');
 */
export function trackIdeaSubmit(ideaId: string): void {
  trackEvent(ANALYTICS_EVENTS.IDEA_SUBMIT, {
    idea_id: ideaId,
  });
}

/**
 * Track CTA click
 *
 * @param ctaName - The name/identifier of the CTA
 *
 * @example
 * trackCtaClick('get_started');
 * trackCtaClick('learn_more');
 */
export function trackCtaClick(ctaName: string): void {
  trackEvent(ANALYTICS_EVENTS.CTA_CLICK, {
    cta_name: ctaName,
  });
}

/**
 * Track copy action
 *
 * @param copyType - The type of content being copied
 *
 * @example
 * trackCopyAction('idea_id');
 * trackCopyAction('blueprint');
 */
export function trackCopyAction(copyType: string): void {
  trackEvent(ANALYTICS_EVENTS.COPY_ACTION, {
    copy_type: copyType,
  });
}

/**
 * Track onboarding tour start
 *
 * @param step - The starting step identifier
 *
 * @example
 * trackOnboardingStart('welcome');
 */
export function trackOnboardingStart(step: string): void {
  trackEvent(ANALYTICS_EVENTS.ONBOARDING_START, {
    step,
  });
}

/**
 * Track onboarding tour completion
 *
 * @param options - Completion options
 *
 * @example
 * trackOnboardingComplete({ total_steps: 4 });
 * trackOnboardingComplete({ skipped: true, completed_steps: 2, total_steps: 4 });
 */
export function trackOnboardingComplete(options?: {
  skipped?: boolean;
  completed_steps?: number;
  total_steps?: number;
}): void {
  trackEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETE, {
    skipped: options?.skipped || false,
    completed_steps: options?.completed_steps,
    total_steps: options?.total_steps,
  });
}

/**
 * Flush all pending events
 * Call this before page unload to ensure all events are sent
 *
 * @example
 * // In a useEffect cleanup
 * window.addEventListener('beforeunload', flush);
 */
export function flush(): void {
  flushEvents();
}

/**
 * Reset analytics session
 * Useful for testing or when user logs out
 *
 * @example
 * resetAnalytics();
 */
export function resetAnalytics(): void {
  eventQueue = [];
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  // Clear session storage
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('ideaflow_session_id');
    } catch {
      // Ignore errors
    }
  }
}

const analytics = {
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
  ANALYTICS_EVENTS,
  ANALYTICS_CONFIG,
};

export default analytics;
