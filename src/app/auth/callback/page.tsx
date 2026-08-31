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
  COMPONENT_CONFIG,
  UI_CONFIG,
  SPACE_Y_PATTERNS,
  FADE_IN,
  REMAINING_PATTERNS,
} from '@/lib/config';
import {
  CENTER_INLINE_FLEX,
  RESPONSIVE_WIDTH,
  FLEX_1,
} from '@/lib/config/remaining-hardcoded-patterns';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Button from '@/components/Button';
import { COMPONENT_PRIMARY_PATTERNS } from '@/lib/config/primary-colors';
import { AUTH_ELEMENT_IDS } from '@/lib/config/element-ids';
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

const TIMEOUT_THRESHOLD_SECONDS =
  COMPONENT_CONFIG.AUTH_CALLBACK.TIMEOUT_SECONDS;

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
          setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_TIMEOUT);
          setAnnouncementTriggered(true);
        }
        return next;
      });
    }, COMPONENT_CONFIG.AUTH_CALLBACK.TRACKING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Micro-UX: Cancel and go back to login
  const handleCancel = useCallback(() => {
    triggerHapticFeedback();
    if (intervalRef.current) clearInterval(intervalRef.current);
    processingRef.current = false;
    setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_CANCEL);
    setAnnouncementTriggered(true);
    // Brief delay to allow announcement before redirect
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, COMPONENT_CONFIG.AUTH_CALLBACK.REDIRECT_DELAY_MS);
  }, [router]);

  // Micro-UX: Retry authentication
  const handleRetry = useCallback(() => {
    triggerHapticFeedback();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setHasTimedOut(false);
    setElapsedSeconds(0);
    setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_RETRY);
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
          setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_TIMEOUT);
          setAnnouncementTriggered(true);
        }
        return next;
      });
    }, COMPONENT_CONFIG.AUTH_CALLBACK.TRACKING_INTERVAL_MS);

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
        setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_SUCCESS);
        setAnnouncementTriggered(true);
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      } catch {
        // Error - clear timers and redirect to login with error
        if (intervalRef.current) clearInterval(intervalRef.current);
        processingRef.current = false;
        setAnnouncement(COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.ANNOUNCE_FAILURE);
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
        className={`${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.BASE} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.BG} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.TEXT}`}
      >
        {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.SKIP_LINK}
      </a>

      <div
        id={AUTH_ELEMENT_IDS.AUTH_CONTENT}
        className={`${CONTAINER_WIDTHS.XS} w-full`}
      >
        <div className={`text-center ${SPACE_Y_PATTERNS.XL}`}>
          {/* Micro-UX: Animated spinner with progress feedback */}
          <div className={CENTER_INLINE_FLEX}>
            <div
              className={`animate-spin rounded-full ${SPINNER_PATTERNS.default.size.lg} ${SPINNER_PATTERNS.default.border} ${COMPONENT_PRIMARY_PATTERNS.AUTH_SPINNER_BORDER} ${prefersReducedMotion ? '' : 'motion-reduce:animate-none'}`}
            />
            {/* Micro-UX: Subtle pulse ring around spinner for visual feedback */}
            {!prefersReducedMotion && (
              <div className={REMAINING_PATTERNS.AUTH_CALLBACK_ANIMATION} />
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
              <span
                className={REMAINING_PATTERNS.AUTH_CALLBACK_WIDTH}
                aria-hidden="true"
              >
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
              className={`${BG_COLORS.WARNING_LIGHT} border ${BORDER_COLORS.WARNING} rounded-lg p-4 ${FADE_IN}`}
              role="alert"
              aria-live="assertive"
            >
              <div
                className={
                  COMPONENT_CONFIG.AUTH_CALLBACK.STYLES
                    .TIMEOUT_WARNING_CONTAINER
                }
              >
                <svg
                  className={`${ICON_SIZES.MD} ${TEXT_COLORS.WARNING_ICON} ${COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.TIMEOUT_WARNING_ICON}`}
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
                <div className={FLEX_1}>
                  <p
                    className={`${COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.TIMEOUT_WARNING_TITLE} ${TEXT_COLORS.WARNING}`}
                  >
                    {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.TIMEOUT_TITLE}
                  </p>
                  <p
                    className={`${COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.TIMEOUT_WARNING_DESCRIPTION} ${TEXT_COLORS.WARNING}`}
                  >
                    {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.TIMEOUT_DESCRIPTION}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Micro-UX: Action buttons with keyboard shortcuts */}
          <div
            className={COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.BUTTONS_CONTAINER}
          >
            {hasTimedOut && (
              <Tooltip
                content={COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.RETRY_TOOLTIP}
                shortcut={['Enter']}
                position="top"
              >
                <Button
                  variant="primary"
                  onClick={handleRetry}
                  className={RESPONSIVE_WIDTH}
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
                  {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.RETRY_BUTTON}
                </Button>
              </Tooltip>
            )}

            <Tooltip
              content={COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.CANCEL_TOOLTIP}
              shortcut={['Esc']}
              position="top"
            >
              <Button
                variant={hasTimedOut ? 'secondary' : 'ghost'}
                onClick={handleCancel}
                className={RESPONSIVE_WIDTH}
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
                {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.CANCEL_BUTTON}
              </Button>
            </Tooltip>
          </div>

          {/* Micro-UX: Keyboard shortcut hints for discoverability */}
          <div
            className={`${COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.KEYBOARD_HINTS} ${TEXT_COLORS.MUTED}`}
            aria-hidden="true"
          >
            <span
              className={
                COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.KEYBOARD_HINT_ITEM
              }
            >
              <kbd
                className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
              >
                Esc
              </kbd>
              <span>
                {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.KEYBOARD_HINT_CANCEL}
              </span>
            </span>
            {hasTimedOut && (
              <span
                className={
                  COMPONENT_CONFIG.AUTH_CALLBACK.STYLES.KEYBOARD_HINT_ITEM
                }
              >
                <kbd
                  className={`px-1.5 py-0.5 ${GRAY_CLASSES.BG_100} ${GRAY_CLASSES.TEXT_600} rounded text-xs font-mono`}
                >
                  Enter
                </kbd>
                <span>
                  {COMPONENT_CONFIG.AUTH_CALLBACK.TEXT.KEYBOARD_HINT_RETRY}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
