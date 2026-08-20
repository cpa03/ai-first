'use client';

import { memo, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/logger';
import { ENV_ACCESSORS } from '@/lib/config/env-keys';

const logger = createLogger('GlobalErrorHandler');

/**
 * Micro-UX: GlobalErrorHandler with toast notifications
 *
 * Shows a non-intrusive toast notification when unhandled errors occur,
 * providing visual feedback that something went wrong. The toast auto-dismisses
 * after a few seconds and includes a helpful message.
 *
 * This follows the existing toast pattern used throughout the app via window.showToast.
 */

interface GlobalErrorToast {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  duration?: number;
}

// Debounce to prevent toast spam from rapid error cascades
let lastToastTime = 0;
const TOAST_DEBOUNCE_MS = 3000;

function showErrorToast(message: string) {
  const now = Date.now();
  if (now - lastToastTime < TOAST_DEBOUNCE_MS) return;
  lastToastTime = now;

  if (typeof window !== 'undefined') {
    const win = window as Window & {
      showToast?: (options: GlobalErrorToast) => void;
    };
    win.showToast?.({
      type: 'warning',
      message,
      duration: 6000,
    });
  }
}

function GlobalErrorHandlerComponent() {
  const handleUnhandledRejection = useCallback(
    (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const reasonMessage =
        reason instanceof Error ? reason.message : String(reason);

      logger.errorWithContext('Unhandled Promise Rejection', {
        component: 'GlobalErrorHandler',
        action: 'handleUnhandledRejection',
        metadata: {
          reason: reasonMessage,
          stack: reason instanceof Error ? reason.stack : undefined,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      });

      if (ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development') {
        logger.error(
          `[GlobalErrorHandler] Unhandled Promise Rejection: ${reasonMessage}`
        );
      }

      showErrorToast('An unexpected error occurred. Please try again.');

      event.preventDefault();
    },
    []
  );

  const handleUncaughtException = useCallback((event: ErrorEvent) => {
    const errorMessage = event.error?.message || event.message;

    logger.errorWithContext('Uncaught Exception', {
      component: 'GlobalErrorHandler',
      action: 'handleUncaughtException',
      metadata: {
        message: errorMessage,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    });

    if (ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development') {
      logger.error(`[GlobalErrorHandler] Uncaught Exception: ${errorMessage}`);
    }

    showErrorToast(
      'Something went wrong. Please refresh the page if issues persist.'
    );

    event.preventDefault();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleUncaughtException);

    logger.debug('Global error handlers registered', {
      component: 'GlobalErrorHandler',
      action: 'mount',
    });

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      window.removeEventListener('error', handleUncaughtException);

      logger.debug('Global error handlers unregistered', {
        component: 'GlobalErrorHandler',
        action: 'unmount',
      });
    };
  }, [handleUnhandledRejection, handleUncaughtException]);

  return null;
}

const GlobalErrorHandler = memo(GlobalErrorHandlerComponent);

export default GlobalErrorHandler;
