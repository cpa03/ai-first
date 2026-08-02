'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/db';
import {
  API_ERROR_MESSAGES,
  ROUTES,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  GRAY_CLASSES,
  SPINNER_PATTERNS,
  COMPONENT_DEFAULTS,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLORS,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  ICON_SIZES,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Button from '@/components/Button';
import StatusAnnouncer from '@/components/StatusAnnouncer';
import Tooltip from '@/components/Tooltip';

/**
 * AuthCallbackPage - Micro-UX enhanced OAuth callback handler
 *
 * Improvements:
 * 1. Accessibility: aria-live announcements for screen readers
 * 2. Keyboard shortcuts: Escape to cancel, Enter to retry
 * 3. User control: Cancel button to abort authentication
 * 4. Timeout handling: Shows helpful message if auth takes too long
 * 5. Progress indication: Subtle animation feedback
 */

// Micro-UX: Timeout threshold (15 seconds) - shows helpful message if auth takes too long
const TIMEOUT_THRESHOLD_SECONDS = 15;

export default function AuthCallbackPage() {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [announcementTriggered, setAnnouncementTriggered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(true);

  // Cleanup timers on unmount
  useEffect(() => {
    const interval = intervalRef.current;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Micro-UX: Track elapsed time for progress feedback
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= TIMEOUT_THRESHOLD_SECONDS && processingRef.current) {
          setHasTimedOut(true);
          setAnnouncement(
            'Authentication is taking longer than expected. You can cancel and try again.'
          );
          setAnnouncementTriggered(true);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Micro-UX: Cancel and go back to login
  const handleCancel = useCallback(() => {
    triggerHapticFeedback();
    if (intervalRef.current) clearInterval(intervalRef.current);
    processingRef.current = false;
    setAnnouncement('Authentication cancelled. Redirecting to login...');
    setAnnouncementTriggered(true);
    // Brief delay to allow announcement before redirect
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 500);
  }, [router]);

  // Micro-UX: Retry authentication
  const handleRetry = useCallback(() => {
    triggerHapticFeedback();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHasTimedOut(false);
    setElapsedSeconds(0);
    setAnnouncement('Retrying authentication...');
    setAnnouncementTriggered(true);

    // Restart the auth process
    const handleAuthCallback = async () => {
      try {
        if (!supabaseClient) {
          throw new Error(API_ERROR_MESSAGES.PAGE.AUTH_SERVICE_UNAVAILABLE);
        }

        const { error } = await supabaseClient.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          throw error;
        }

        router.push(ROUTES.DASHBOARD);
        router.refresh();
      } catch {
        router.push(`${ROUTES.LOGIN}?error=auth_callback_failed`);
      }
    };

    // Restart interval
    intervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= TIMEOUT_THRESHOLD_SECONDS) {
          setHasTimedOut(true);
          setAnnouncement(
            'Authentication is taking longer than expected. You can cancel and try again.'
          );
          setAnnouncementTriggered(true);
        }
        return next;
      });
    }, 1000);

    handleAuthCallback();
  }, [router]);

  // Micro-UX: Keyboard shortcuts for user control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;

      // Escape: Cancel and go back to login
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }

      // Enter: Retry authentication (only after timeout)
      if (e.key === 'Enter' && hasTimedOut) {
        e.preventDefault();
        handleRetry();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasTimedOut, handleCancel, handleRetry]);

  // Micro-UX: Main auth callback handler
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabaseClient) {
          throw new Error(API_ERROR_MESSAGES.PAGE.AUTH_SERVICE_UNAVAILABLE);
        }

        const { error } = await supabaseClient.auth.exchangeCodeForSession(
          window.location.href
        );

        if (error) {
          throw error;
        }

        // Success - clear timers and redirect
        if (intervalRef.current) clearInterval(intervalRef.current);
        processingRef.current = false;
        setAnnouncement(
          'Authentication successful. Redirecting to dashboard...'
        );
        setAnnouncementTriggered(true);
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      } catch {
        // Error - clear timers and redirect to login with error
        if (intervalRef.current) clearInterval(intervalRef.current);
        processingRef.current = false;
        setAnnouncement('Authentication failed. Redirecting to login...');
        setAnnouncementTriggered(true);
        router.push(`${ROUTES.LOGIN}?error=auth_callback_failed`);
      }
    };

    handleAuthCallback();
  }, [router]);

  // Micro-UX: Progress dots animation
  const getProgressDots = () => {
    const dots = Math.min(Math.floor(elapsedSeconds / 2), 5);
    return '.'.repeat(dots);
  };

  // Micro-UX: Format elapsed time for display
  const formatElapsed = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      <StatusAnnouncer
        message={announcement}
        triggered={announcementTriggered}
        politeness="polite"
      />

      {/* Micro-UX: Skip to content link for keyboard users */}
      <a
        href="#auth-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md"
      >
        Skip to authentication content
      </a>

      <div id="auth-content" className={`${CONTAINER_WIDTHS.XS} w-full`}>
        <div className="text-center space-y-6">
          {/* Micro-UX: Animated spinner with progress feedback */}
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`animate-spin rounded-full ${SPINNER_PATTERNS.default.size.lg} ${SPINNER_PATTERNS.default.border} border-primary-600 ${prefersReducedMotion ? '' : 'motion-reduce:animate-none'}`}
            />
            {/* Micro-UX: Subtle pulse ring around spinner for visual feedback */}
            {!prefersReducedMotion && (
              <div className="absolute inset-0 rounded-full border-2 border-primary-200 animate-ping opacity-20" />
            )}
          </div>

          {/* Micro-UX: Title with progress dots for temporal feedback */}
          <div>
            <h1
              className={`text-xl font-semibold ${GRAY_CLASSES.TEXT_900}`}
              aria-live="polite"
              aria-atomic="true"
            >
              {COMPONENT_DEFAULTS.LOADING_TEXT.AUTH_CALLBACK_TITLE}
              <span className="inline-block w-8 text-left" aria-hidden="true">
                {getProgressDots()}
              </span>
            </h1>
            <p className={`mt-2 text-sm ${GRAY_CLASSES.TEXT_600}`}>
              {COMPONENT_DEFAULTS.LOADING_TEXT.AUTH_CALLBACK_MESSAGE}
            </p>
          </div>

          {/* Micro-UX: Elapsed time indicator for transparency */}
          {elapsedSeconds > 2 && (
            <p
              className={`text-xs ${TEXT_COLORS.MUTED} tabular-nums`}
              aria-live="polite"
              aria-atomic="true"
            >
              Elapsed: {formatElapsed(elapsedSeconds)}
            </p>
          )}

          {/* Micro-UX: Timeout warning with retry option */}
          {hasTimedOut && (
            <div
              className={`${BG_COLORS.WARNING_LIGHT} border ${BORDER_COLORS.WARNING} rounded-lg p-4 animate-fade-in`}
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <svg
                  className={`${ICON_SIZES.MD} text-amber-600 flex-shrink-0 mt-0.5`}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${TEXT_COLORS.WARNING}`}>
                    Authentication is taking longer than expected
                  </p>
                  <p className={`text-xs ${TEXT_COLORS.WARNING} mt-1`}>
                    This might be due to a slow network connection or server
                    issue.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Micro-UX: Action buttons with keyboard shortcuts */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasTimedOut && (
              <Tooltip
                content="Retry authentication"
                shortcut={['Enter']}
                position="top"
              >
                <Button
                  variant="primary"
                  onClick={handleRetry}
                  className="w-full sm:w-auto"
                >
                  <svg
                    className={`${ICON_SIZES.MD} mr-2`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Retry
                </Button>
              </Tooltip>
            )}

            <Tooltip
              content="Cancel and go back to login"
              shortcut={['Esc']}
              position="top"
            >
              <Button
                variant={hasTimedOut ? 'secondary' : 'ghost'}
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                <svg
                  className={`${ICON_SIZES.MD} mr-2`}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </Button>
            </Tooltip>
          </div>

          {/* Micro-UX: Keyboard shortcut hints for discoverability */}
          <div
            className={`flex items-center justify-center gap-4 text-xs ${TEXT_COLORS.MUTED}`}
            aria-hidden="true"
          >
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd
                className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
              >
                Esc
              </kbd>
              <span>cancel</span>
            </span>
            {hasTimedOut && (
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <kbd
                  className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
                >
                  Enter
                </kbd>
                <span>retry</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
