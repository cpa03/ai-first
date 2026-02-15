'use client';

import { useEffect } from 'react';
import { createLogger } from '@/lib/logger';

const logger = createLogger('GlobalErrorHandler');

export default function GlobalErrorHandler() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      logger.errorWithContext('Unhandled Promise Rejection', {
        component: 'GlobalErrorHandler',
        action: 'handleUnhandledRejection',
        metadata: {
          reason: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : undefined,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.error(
          '[GlobalErrorHandler] Unhandled Promise Rejection:',
          reason
        );
      }

      event.preventDefault();
    };

    const handleUncaughtException = (event: ErrorEvent) => {
      logger.errorWithContext('Uncaught Exception', {
        component: 'GlobalErrorHandler',
        action: 'handleUncaughtException',
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.error('[GlobalErrorHandler] Uncaught Exception:', event.error);
      }

      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleUncaughtException);

    logger.info('Global error handlers registered', {
      component: 'GlobalErrorHandler',
      action: 'mount',
    });

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      window.removeEventListener('error', handleUncaughtException);

      logger.info('Global error handlers unregistered', {
        component: 'GlobalErrorHandler',
        action: 'unmount',
      });
    };
  }, []);

  return null;
}
