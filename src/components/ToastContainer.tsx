'use client';

import { useEffect, useState } from 'react';
import {
  UI_CONFIG as UI_CONSTANTS,
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
    iconColor: `text-[${TOAST_CONFIG.STYLES.SUCCESS.ICON_COLOR}]`,
    titleColor: TOAST_CONFIG.STYLES.SUCCESS.TEXT,
    textColor: TOAST_CONFIG.STYLES.SUCCESS.TEXT,
  },
  error: {
    container: `${TOAST_CONFIG.STYLES.ERROR.BG} ${TOAST_CONFIG.STYLES.ERROR.BORDER}`,
    iconColor: `text-[${TOAST_CONFIG.STYLES.ERROR.ICON_COLOR}]`,
    titleColor: TOAST_CONFIG.STYLES.ERROR.TEXT,
    textColor: TOAST_CONFIG.STYLES.ERROR.TEXT,
  },
  warning: {
    container: `${TOAST_CONFIG.STYLES.WARNING.BG} ${TOAST_CONFIG.STYLES.WARNING.BORDER}`,
    iconColor: `text-[${TOAST_CONFIG.STYLES.WARNING.ICON_COLOR}]`,
    titleColor: TOAST_CONFIG.STYLES.WARNING.TEXT,
    textColor: TOAST_CONFIG.STYLES.WARNING.TEXT,
  },
  info: {
    container: `${TOAST_CONFIG.STYLES.INFO.BG} ${TOAST_CONFIG.STYLES.INFO.BORDER}`,
    iconColor: `text-[${TOAST_CONFIG.STYLES.INFO.ICON_COLOR}]`,
    titleColor: TOAST_CONFIG.STYLES.INFO.TEXT,
    textColor: TOAST_CONFIG.STYLES.INFO.TEXT,
  },
};

function Toast({ toast, onClose }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || UI_CONSTANTS.TOAST_DURATION;
    const updateInterval = UI_CONSTANTS.TOAST_PROGRESS_INTERVAL;
    const totalSteps = duration / updateInterval;
    let currentStep = 0;

    const progressTimer = setInterval(() => {
      currentStep++;
      const remainingProgress = Math.max(
        0,
        100 - (currentStep / totalSteps) * 100
      );
      setProgress(remainingProgress);

      if (currentStep >= totalSteps) {
        clearInterval(progressTimer);
        setIsLeaving(true);
        setTimeout(() => onClose(toast.id), ANIMATION_CONFIG.TOAST_EXIT);
      }
    }, updateInterval);

    return () => clearInterval(progressTimer);
  }, [toast.id, toast.duration, onClose]);

  const styles = toastColors[toast.type];

  return (
    <div
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`
        ${styles.container} border rounded-lg shadow-lg p-4
        flex items-start gap-3 max-w-md
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <svg
        className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`}
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
        onClick={() => {
          setIsLeaving(true);
          setTimeout(() => onClose(toast.id), ANIMATION_CONFIG.TOAST_EXIT);
        }}
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
      {/* Progress bar showing time remaining */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-75 ease-linear rounded-b-lg"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);
  };

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    (
      window as Window & { showToast?: (options: ToastOptions) => void }
    ).showToast = showToast;
    return () => {
      const win = window as Window & {
        showToast?: (options: ToastOptions) => void;
      };
      delete win.showToast;
    };
  }, []);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-h-screen overflow-y-auto"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={closeToast} />
      ))}
    </div>
  );
}
