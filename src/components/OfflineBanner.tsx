'use client';

import { memo, useEffect, useState, useCallback, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
// Micro-UX: Auto-dismiss duration for "back online" confirmation
// Long enough to read, short enough to not be annoying
const BACK_ONLINE_DISMISS_MS = 4000;

/**
 * OfflineBanner - Subtle connectivity status indicator
 *
 * Shows a non-intrusive banner at the top of the page when the user
 * goes offline, and a brief "back online" confirmation when restored.
 *
 * Accessibility:
 * - Uses role="status" and aria-live="polite" for screen reader announcements
 * - Respects prefers-reduced-motion
 * - Banner is dismissible via Escape key
 */
function OfflineBannerComponent() {
  const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const dismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  // Show banner when offline
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setIsDismissed(false);
    } else if (wasOffline) {
      // Show "back online" briefly, then hide
      setShowBanner(true);
      setIsDismissed(false);

      dismissTimeoutRef.current = setTimeout(() => {
        setShowBanner(false);
        clearWasOffline();
      }, BACK_ONLINE_DISMISS_MS);
    } else {
      setShowBanner(false);
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [isOnline, wasOffline, clearWasOffline]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    setShowBanner(false);
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
  }, []);

  // Escape key to dismiss
  useEffect(() => {
    if (!showBanner) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBanner, handleDismiss]);

  if (!showBanner || isDismissed) {
    return null;
  }

  const isOffline = !isOnline;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed top-0 left-0 right-0 z-[9999]
        flex items-center justify-center
        px-4 py-2
        text-sm font-medium
        transition-all duration-300 ease-out
        ${prefersReducedMotion ? '' : 'animate-slide-down'}
        ${
          isOffline
            ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
            : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
        }
      `}
    >
      <div className="flex items-center gap-2">
        {/* Status icon */}
        {isOffline ? (
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.242 2.829a5 5 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}

        {/* Message */}
        <span>
          {isOffline
            ? "You're offline. Some features may be unavailable."
            : "You're back online!"}
        </span>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className={`
            ml-2 p-1 rounded-md
            transition-colors duration-150
            ${
              isOffline
                ? 'hover:bg-amber-100 text-amber-600'
                : 'hover:bg-emerald-100 text-emerald-600'
            }
          `}
          aria-label="Dismiss notification"
          type="button"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const OfflineBanner = memo(OfflineBannerComponent);

export default OfflineBanner;
