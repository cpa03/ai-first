/**
 * Global error handlers for unhandled promise rejections and uncaught exceptions.
 * This file is loaded by Next.js at startup when instrumentationHook is enabled.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { CLEANUP_CONFIG, validateConfigurationOrThrow } from './lib/config';
import { ENV_ACCESSORS } from './lib/config/env-keys';
import { createLogger } from './lib/logger';
import { resourceCleanupManager } from './lib/resource-cleanup';

const GRACEFUL_SHUTDOWN_TIMEOUT_MS =
  CLEANUP_CONFIG.RESOURCE_MANAGER.GRACEFUL_SHUTDOWN_TIMEOUT_MS;

function performGracefulShutdown(
  signal: string,
  logger: ReturnType<typeof createLogger>
): void {
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

function registerNodejsHandlers(logger: ReturnType<typeof createLogger>): void {
  validateConfigurationOrThrow();

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

      if (ENV_ACCESSORS.PLATFORM.NODE_ENV() === 'development') {
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

  process.on('SIGTERM', () => performGracefulShutdown('SIGTERM', logger));
  process.on('SIGINT', () => performGracefulShutdown('SIGINT', logger));

  if (ENV_ACCESSORS.PLATFORM.NODE_ENV() !== 'production') {
    logger.info('Global error handlers registered successfully');
  }
}

export async function register() {
  if (ENV_ACCESSORS.PLATFORM.NEXT_RUNTIME() === 'nodejs') {
    const { validateEnvironmentStrict } =
      await import('./lib/security/env-validation');
    validateEnvironmentStrict();

    const logger = createLogger('Instrumentation');
    registerNodejsHandlers(logger);
  }
}
