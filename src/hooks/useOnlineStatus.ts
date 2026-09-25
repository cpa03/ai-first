'use client';

import { useState, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('useOnlineStatus');

export interface UseOnlineStatusResult {
  /** Whether the browser is currently online */
  isOnline: boolean;
  /** Whether the user was recently offline (for showing "back online" message) */
  wasOffline: boolean;
  /** Clears the wasOffline flag */
  clearWasOffline: () => void;
}

/**
 * Custom hook to track browser online/offline status.
 *
 * Uses navigator.onLine and online/offline events to provide
 * real-time connectivity status with a "was offline" flag for
 * showing "back online" confirmation messages.
 *
 * @returns UseOnlineStatusResult with isOnline, wasOffline, and clearWasOffline
 *
 * @example
 * const { isOnline, wasOffline, clearWasOffline } = useOnlineStatus();
 */
export function useOnlineStatus(): UseOnlineStatusResult {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  });
  const [wasOffline, setWasOffline] = useState(false);

  const clearWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      logger.debug('Browser came online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      logger.debug('Browser went offline');
    };

    // Sync initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline, clearWasOffline };
}

export default useOnlineStatus;
