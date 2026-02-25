'use client';

import {
  memo,
  useCallback,
  useEffect,
  useState,
  useRef,
  useSyncExternalStore,
} from 'react';
import {
  UI_CONFIG as UI_CONFIG,
  ANIMATION_CONFIG,
} from '@/lib/config/constants';
import { TOAST_CONFIG } from '@/lib/config';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

// Custom hook to subscribe to prefers-reduced-motion media query
// This properly updates when OS accessibility settings change during runtime
const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const toastIcons = {
  success: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  ),
  error: (
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  ),
  warning: (
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  ),
  info: (
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
      clipRule="evenodd"
    />
  ),
};

const toastColors = {
  success: {
    container: `${TOAST_CONFIG.STYLES.SUCCESS.BG} ${TOAST_CONFIG.STYLES.SUCCESS.BORDER}`,
    iconColor: TOAST_CONFIG.STYLES.SUCCESS.ICON_COLOR,
    titleColor: TOAST_CONFIG.STYLES.SUCCESS.TEXT,
    textColor: TOAST_CONFIG.STYLES.SUCCESS.TEXT,
  },
  error: {
    container: `${TOAST_CONFIG.STYLES.ERROR.BG} ${TOAST_CONFIG.STYLES.ERROR.BORDER}`,
    iconColor: TOAST_CONFIG.STYLES.ERROR.ICON_COLOR,
    titleColor: TOAST_CONFIG.STYLES.ERROR.TEXT,
    textColor: TOAST_CONFIG.STYLES.ERROR.TEXT,
  },
  warning: {
    container: `${TOAST_CONFIG.STYLES.WARNING.BG} ${TOAST_CONFIG.STYLES.WARNING.BORDER}`,
    iconColor: TOAST_CONFIG.STYLES.WARNING.ICON_COLOR,
    titleColor: TOAST_CONFIG.STYLES.WARNING.TEXT,
    textColor: TOAST_CONFIG.STYLES.WARNING.TEXT,
  },
  info: {
    container: `${TOAST_CONFIG.STYLES.INFO.BG} ${TOAST_CONFIG.STYLES.INFO.BORDER}`,
    iconColor: TOAST_CONFIG.STYLES.INFO.ICON_COLOR,
    titleColor: TOAST_CONFIG.STYLES.INFO.TEXT,
    textColor: TOAST_CONFIG.STYLES.INFO.TEXT,
  },
};

function ToastComponent({ toast, onClose }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const progressRef = useRef(100);
  const touchStartXRef = useRef<number>(0);
  const touchCurrentXRef = useRef<number>(0);

  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const duration = toast.duration || UI_CONFIG.TOAST_DURATION;
    const updateInterval = UI_CONFIG.TOAST_PROGRESS_INTERVAL;
    const totalSteps = duration / updateInterval;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      if (isPaused) return;

      currentStep++;
      const remainingProgress = Math.max(
        0,
        100 - (currentStep / totalSteps) * 100
      );
      progressRef.current = remainingProgress;
      setProgress(remainingProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
        setIsLeaving(true);
        setTimeout(() => onClose(toast.id), ANIMATION_CONFIG.TOAST_EXIT);
      }
    }, updateInterval);

    return () => clearInterval(progressTimer);
  }, [toast.id, toast.duration, onClose, isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchCurrentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    touchCurrentXRef.current = e.touches[0].clientX;
    const diff = touchCurrentXRef.current - touchStartXRef.current;
    if (diff > 0) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    const diff = touchCurrentXRef.current - touchStartXRef.current;

    if (diff > UI_CONFIG.TOAST_SWIPE_DISMISS_THRESHOLD) {
      setIsLeaving(true);
      setTimeout(() => onClose(toast.id), ANIMATION_CONFIG.TOAST_EXIT);
    } else {
      setSwipeOffset(0);
    }

    touchStartXRef.current = 0;
    touchCurrentXRef.current = 0;
  };

  const styles = toastColors[toast.type];

  // PERFORMANCE: Memoize close handler to prevent function recreation on each render
  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onClose(toast.id), ANIMATION_CONFIG.TOAST_EXIT);
  }, [onClose, toast.id]);

  const toastRole = toast.type === 'error' ? 'alert' : 'status';
  const ariaLive = toast.type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={toastRole}
      aria-live={ariaLive}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        ${styles.container} border rounded-lg shadow-lg p-4
        flex items-start gap-3 max-w-md relative overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${prefersReducedMotion ? '' : 'touch-pan-y'}
      `}
      style={{
        transform:
          isSwiping || isLeaving
            ? `translateX(${isLeaving ? '100%' : `${swipeOffset}px`})`
            : undefined,
        transition: isSwiping ? 'none' : undefined,
      }}
    >
      <svg
        className="w-5 h-5 flex-shrink-0 mt-0.5"
        style={{ color: styles.iconColor }}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        {toastIcons[toast.type]}
      </svg>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${styles.titleColor}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={handleClose}
        className={`flex-shrink-0 ml-2 ${styles.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-md p-1 min-h-[32px] min-w-[32px] transition-opacity`}
        aria-label="Close notification"
      >
        <svg
          className="w-4 h-4"
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
      {isSwiping && swipeOffset > 20 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 rounded-l-lg"
          style={{
            opacity:
              Math.min(
                swipeOffset / UI_CONFIG.TOAST_SWIPE_DISMISS_THRESHOLD,
                1
              ) * 0.5,
          }}
          aria-hidden="true"
        />
      )}

      <div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-75 ease-linear rounded-b-lg"
        style={{
          width: `${progress}%`,
          transitionDuration: isPaused
            ? '0ms'
            : `${UI_CONFIG.TOAST_PROGRESS_TRANSITION_MS}ms`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

const Toast = memo(ToastComponent);

/**
 * ToastContainer component - displays toast notifications
 * Wrapped in React.memo to prevent unnecessary re-renders when parent updates
 */
function ToastContainerComponent() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const win = window as Window & {
      showToast?: (options: ToastOptions) => void;
    };
    win.showToast = showToast;

    return () => {
      delete win.showToast;
    };
  }, [showToast]);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-h-screen overflow-y-auto"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={closeToast} />
      ))}
    </div>
  );
}

const ToastContainer = memo(ToastContainerComponent);

export default ToastContainer;
