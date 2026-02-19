/**
 * Node.js-specific instrumentation handlers
 * Separated into a separate file to avoid Edge Runtime compatibility warnings
 */

import { CLEANUP_CONFIG } from './lib/config';
import { resourceCleanupManager } from './lib/resource-cleanup';
import { createLogger } from './lib/logger';

const logger = createLogger('Instrumentation');
const GRACEFUL_SHUTDOWN_TIMEOUT_MS =
  CLEANUP_CONFIG.RESOURCE_MANAGER.GRACEFUL_SHUTDOWN_TIMEOUT_MS;

function performGracefulShutdown(signal: string): void {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  const taskCount = resourceCleanupManager.getTaskCount();
  logger.info(`Executing ${taskCount} registered cleanup tasks...`);

  const forceExitTimeout = setTimeout(() => {
    logger.error(
      `Forced shutdown after ${GRACEFUL_SHUTDOWN_TIMEOUT_MS}ms - cleanup timed out`
    );
    process.exit(1);
  }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);

  resourceCleanupManager
    .cleanup()
    .then(() => {
      clearTimeout(forceExitTimeout);
      logger.info('Graceful shutdown completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      clearTimeout(forceExitTimeout);
      logger.error(
        'Error during graceful shutdown:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
}

export function registerNodejsHandlers(): void {
  process.on(
    'unhandledRejection',
    (reason: unknown, _promise: Promise<unknown>) => {
      const stack = reason instanceof Error ? reason.stack : undefined;

      logger.fatal(
        'Unhandled Promise Rejection',
        reason instanceof Error ? reason : undefined,
        {
          type: 'unhandledRejection',
          stack,
        }
      );

      if (process.env.NODE_ENV === 'development') {
        logger.error('Exiting due to unhandled rejection in development mode');
        process.exit(1);
      }
    }
  );

  process.on('uncaughtException', (error: Error) => {
    logger.fatal('Uncaught Exception', error, {
      type: 'uncaughtException',
    });
    process.exit(1);
  });

  process.on('SIGTERM', () => performGracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => performGracefulShutdown('SIGINT'));

  if (process.env.NODE_ENV !== 'production') {
    logger.info('Global error handlers registered successfully');
  }
}
