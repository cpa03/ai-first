'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { COMPONENT_CONFIG } from '@/lib/config';

interface UseAnnouncementOptions {
  /** Delay before announcing (ms) - defaults to 0 (next microtask) */
  delay?: number;
  /** Whether to use queueMicrotask (true) or setTimeout (false) */
  useMicrotask?: boolean;
}

interface UseAnnouncementReturn {
  /** Whether the announcement has been made */
  announced: boolean;
  /** Reset the announcement state */
  reset: () => void;
}

/**
 * Custom hook for consistent screen reader announcements.
 * Standardizes the pattern for announcing error/success messages to screen readers.
 *
 * @param shouldAnnounce - Whether to make the announcement
 * @param options - Configuration options
 * @returns Object with announced state and reset function
 */
export function useAnnouncement(
  shouldAnnounce: boolean,
  options: UseAnnouncementOptions = {}
): UseAnnouncementReturn {
  const { delay = 0, useMicrotask = true } = options;
  const [announced, setAnnounced] = useState(false);
  const announcedRef = useRef(announced);

  // Keep ref in sync with state
  useEffect(() => {
    announcedRef.current = announced;
  }, [announced]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (shouldAnnounce && !announcedRef.current) {
      if (useMicrotask) {
        queueMicrotask(() => setAnnounced(true));
      } else if (delay > 0) {
        timeoutId = setTimeout(() => setAnnounced(true), delay);
      } else {
        setAnnounced(true);
      }
    } else if (!shouldAnnounce && announcedRef.current) {
      if (useMicrotask) {
        queueMicrotask(() => setAnnounced(false));
      } else if (delay > 0) {
        timeoutId = setTimeout(() => setAnnounced(false), delay);
      } else {
        setAnnounced(false);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldAnnounce, delay, useMicrotask]);

  const reset = useCallback(() => {
    setAnnounced(false);
    announcedRef.current = false;
  }, []);

  return { announced, reset };
}

interface UseFocusManagementOptions {
  /** Delay before focusing (ms) - defaults to 0 */
  delay?: number;
  /** Whether to restore focus when modal closes */
  restoreFocus?: boolean;
}

interface UseFocusManagementReturn {
  /** Ref to attach to the element that should receive focus */
  focusRef: React.RefObject<HTMLElement | null>;
  /** Store the current focus for later restoration */
  storeFocus: () => void;
  /** Restore the previously stored focus */
  restoreFocus: () => void;
  /** Focus the target element */
  focusTarget: () => void;
}

/**
 * Custom hook for consistent focus management in modals and dialogs.
 * Standardizes the pattern for storing and restoring focus.
 *
 * @param isActive - Whether the modal/dialog is active
 * @param options - Configuration options
 * @returns Object with focus management functions
 */
export function useFocusManagement(
  isActive: boolean,
  options: UseFocusManagementOptions = {}
): UseFocusManagementReturn {
  const { delay = 0, restoreFocus = true } = options;
  const focusRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const storeFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocusFn = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, []);

  const focusTarget = useCallback(() => {
    if (focusRef.current) {
      if (delay > 0) {
        setTimeout(() => focusRef.current?.focus(), delay);
      } else {
        focusRef.current.focus();
      }
    }
  }, [delay]);

  useEffect(() => {
    if (isActive) {
      storeFocus();
      focusTarget();
    } else if (restoreFocus) {
      restoreFocusFn();
    }
  }, [isActive, storeFocus, focusTarget, restoreFocusFn, restoreFocus]);

  return {
    focusRef,
    storeFocus,
    restoreFocus: restoreFocusFn,
    focusTarget,
  };
}

interface UseToastOptions {
  /** Duration before auto-hide (ms) */
  duration?: number;
  /** Position of the toast */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface UseToastReturn {
  /** Show a toast notification */
  showToast: (options: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }) => void;
  /** Hide the current toast */
  hideToast: () => void;
}

/**
 * Custom hook for consistent toast notifications.
 * Provides a standardized interface for showing toast messages.
 *
 * @param options - Configuration options
 * @returns Object with toast functions
 */
export function useToast(options: UseToastOptions = {}): UseToastReturn {
  const { duration = COMPONENT_CONFIG.TOAST.SHORT_DURATION_MS } = options;

  const showToast = useCallback(
    (toastOptions: {
      type: 'success' | 'error' | 'warning' | 'info';
      message: string;
      duration?: number;
    }) => {
      // Use global showToast if available (from ToastContainer)
      if (typeof window !== 'undefined') {
        const win = window as unknown as Window & {
          showToast?: (options: {
            type: string;
            message: string;
            duration: number;
          }) => void;
        };

        if (win.showToast) {
          win.showToast({
            type: toastOptions.type,
            message: toastOptions.message,
            duration: toastOptions.duration || duration,
          });
        }
      }
    },
    [duration]
  );

  const hideToast = useCallback(() => {
    // Implementation depends on toast system
  }, []);

  return { showToast, hideToast };
}
