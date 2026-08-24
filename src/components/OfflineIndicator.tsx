'use client';

import { memo, useEffect, useState, useCallback } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

/**
 * OfflineIndicator - Subtle connection status banner
 *
 * Detects online/offline status via the browser's Navigator.onLine API
 * and network events. Shows a non-intrusive, animated banner when the
 * user loses internet connectivity, and a brief "back online" confirmation
 * when connectivity is restored.
 *
 * Features:
 * - Animated slide-in/out banner
 * - Respects prefers-reduced-motion
 * - Accessible with aria-live="status" for screen readers
 * - Auto-hides "back online" message after 3 seconds
 * - No layout shift (fixed positioning)
 */
function OfflineIndicatorComponent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleOnline = useCallback(() => {
    setShowBanner(false);
    setShowReconnected(true);

    // Auto-hide reconnected message after 3 seconds
    setTimeout(() => {
      setShowReconnected(false);
    }, 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setShowBanner(true);
    setShowReconnected(false);
  }, []);

  useEffect(() => {
    if (!navigator.onLine) {
      setShowBanner(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Don't render anything if both states are hidden
  if (!showBanner && !showReconnected) {
    return null;
  }

  const animationDuration = prefersReducedMotion
    ? 'duration-0'
    : 'duration-300';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Offline Banner */}
      {showBanner && (
        <div
          className={cn(
            'pointer-events-auto mb-4 px-4 py-2.5 rounded-lg shadow-lg',
            'bg-gray-900 text-white text-sm font-medium',
            'flex items-center gap-2',
            'transition-all',
            animationDuration,
            'ease-in-out',
            'transform translate-y-0 opacity-100'
          )}
          role="alert"
        >
          {/* Wifi-off icon */}
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
              d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 00-.707-.707m-4.243.707a5 5 0 01-.707-.707M8.464 15.536a5 5 0 01-.707-.707m0 0l-1.414 1.414M12 12l-1.414 1.414m1.414-1.414l1.414 1.414"
            />
          </svg>
          <span>You&apos;re offline. Some features may be unavailable.</span>
        </div>
      )}

      {/* Reconnected Banner */}
      {showReconnected && !showBanner && (
        <div
          className={cn(
            'pointer-events-auto mb-4 px-4 py-2.5 rounded-lg shadow-lg',
            'bg-green-800 text-white text-sm font-medium',
            'flex items-center gap-2',
            'transition-all',
            animationDuration,
            'ease-in-out',
            'transform translate-y-0 opacity-100'
          )}
          role="status"
        >
          {/* Check icon */}
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
          <span>You&apos;re back online.</span>
        </div>
      )}
    </div>
  );
}

const OfflineIndicator = memo(OfflineIndicatorComponent);

export default OfflineIndicator;
