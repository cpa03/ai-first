'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import {
  trackSessionStart,
  trackSessionEnd,
  trackPageTime,
  flush,
} from '@/lib/session-analytics';
import { SESSION_TRACKING_CONFIG } from '@/lib/config/session-tracking';

/**
 * Hook for tracking session duration and page time
 *
 * Growth: Enables retention metrics tracking
 * - Tracks total session duration
 * - Tracks time spent on each page
 * - Handles visibility changes and page unload
 *
 * @example
 * const { getSessionDuration, getPageDuration } = useSessionDuration();
 */
export function useSessionDuration() {
  const sessionStartTime = useRef<number>(0);
  const pageStartTime = useRef<number>(0);
  const isInitialized = useRef<boolean>(false);

  // Track session start
  const initializeSession = useCallback(() => {
    if (typeof window === 'undefined' || isInitialized.current) {
      return;
    }

    sessionStartTime.current = Date.now();
    pageStartTime.current = Date.now();
    isInitialized.current = true;

    // Track session start event
    trackSessionStart();
  }, []);

  // Track page time on navigation or unmount
  const trackCurrentPageTime = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const timeSpent = Date.now() - pageStartTime.current;
    const currentPath = window.location.pathname;

    if (timeSpent >= SESSION_TRACKING_CONFIG.MIN_PAGE_TIME_MS && currentPath) {
      trackPageTime(currentPath, timeSpent);
    }
  }, []);

  // Handle page visibility changes
  const handleVisibilityChange = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (document.visibilityState === 'hidden') {
      // User switched tabs or minimized - track current page time
      trackCurrentPageTime();
      pageStartTime.current = Date.now();
    } else if (document.visibilityState === 'visible') {
      // User returned to tab - reset page timer
      pageStartTime.current = Date.now();
    }
  }, [trackCurrentPageTime]);

  // Handle pagehide for bfcache compatibility (replaces beforeunload)
  // Using 'pagehide' instead of 'beforeunload' allows back/forward cache to work
  // which improves performance and Lighthouse scores
  const handlePageHide = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Track page time for current page
    trackCurrentPageTime();

    // Track session end
    if (sessionStartTime.current > 0) {
      const sessionDuration = Date.now() - sessionStartTime.current;
      trackSessionEnd(sessionDuration);
    }

    // Flush any pending events
    flush();
  }, [trackCurrentPageTime]);

  // Initialize session and set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Initialize session on first load
    initializeSession();

    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for pagehide (bfcache-compatible) to track session end
    window.addEventListener('pagehide', handlePageHide);

    // Track page time on unmount
    return () => {
      trackCurrentPageTime();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [
    initializeSession,
    handleVisibilityChange,
    handlePageHide,
    trackCurrentPageTime,
  ]);

  // Calculate current session duration
  const getSessionDuration = useCallback((): number => {
    if (!sessionStartTime.current) {
      return 0;
    }
    return Date.now() - sessionStartTime.current;
  }, []);

  // Calculate current page duration
  const getPageDuration = useCallback((): number => {
    return Date.now() - pageStartTime.current;
  }, []);

  // PERFORMANCE: Memoize the return object to ensure referential stability.
  // This prevents unnecessary re-renders in consumer components that use this hook.
  return useMemo(
    () => ({
      getSessionDuration,
      getPageDuration,
    }),
    [getSessionDuration, getPageDuration]
  );
}

export default useSessionDuration;
