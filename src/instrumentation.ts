/**
 * Global error handlers for unhandled promise rejections and uncaught exceptions.
 * This file is loaded by Next.js at startup when instrumentationHook is enabled.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { CLEANUP_CONFIG } from './lib/config';
import { resourceCleanupManager } from './lib/resource-cleanup';

const GRACEFUL_SHUTDOWN_TIMEOUT_MS =
  CLEANUP_CONFIG.RESOURCE_MANAGER.GRACEFUL_SHUTDOWN_TIMEOUT_MS;

function performGracefulShutdown(signal: string): void {
  const timestamp = new Date().toISOString();
  console.log(
    `[GRACEFUL] Received ${signal} at ${timestamp}. Starting graceful shutdown...`
  );

  const taskCount = resourceCleanupManager.getTaskCount();
  console.log(`[GRACEFUL] Executing ${taskCount} registered cleanup tasks...`);

  const forceExitTimeout = setTimeout(() => {
    console.error(
      `[GRACEFUL] Forced shutdown after ${GRACEFUL_SHUTDOWN_TIMEOUT_MS}ms - cleanup timed out`
    );
    process.exit(1);
  }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);

  resourceCleanupManager
    .cleanup()
    .then(() => {
      clearTimeout(forceExitTimeout);
      console.log('[GRACEFUL] Graceful shutdown completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      clearTimeout(forceExitTimeout);
      console.error(
        '[GRACEFUL] Error during graceful shutdown:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.on(
      'unhandledRejection',
      (reason: unknown, _promise: Promise<unknown>) => {
        const timestamp = new Date().toISOString();
        const errorMessage =
          reason instanceof Error ? reason.message : String(reason);
        const stack = reason instanceof Error ? reason.stack : undefined;

        const logEntry = {
          level: 'fatal',
          type: 'unhandledRejection',
          timestamp,
          message: errorMessage,
          stack,
          environment: process.env.NODE_ENV || 'unknown',
        };

        console.error(
          '[FATAL] Unhandled Promise Rejection:',
          JSON.stringify(logEntry)
        );

        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[FATAL] Exiting due to unhandled rejection in development mode'
          );
          process.exit(1);
        }
      }
    );

    process.on('uncaughtException', (error: Error) => {
      const timestamp = new Date().toISOString();

      const logEntry = {
        level: 'fatal',
        type: 'uncaughtException',
        timestamp,
        message: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV || 'unknown',
      };

      console.error('[FATAL] Uncaught Exception:', JSON.stringify(logEntry));

      process.exit(1);
    });

    process.on('SIGTERM', () => performGracefulShutdown('SIGTERM'));

    process.on('SIGINT', () => performGracefulShutdown('SIGINT'));

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Instrumentation] Global error handlers registered successfully'
      );
    }
  }
}
