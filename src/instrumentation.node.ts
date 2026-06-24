import { CLEANUP_CONFIG, validateConfigurationOrThrow } from './lib/config';
import { ENV_ACCESSORS } from './lib/config/env-keys';
import { createLogger } from './lib/logger';
import { resourceCleanupManager } from './lib/resource-cleanup';

const GRACEFUL_SHUTDOWN_TIMEOUT_MS =
  CLEANUP_CONFIG.RESOURCE_MANAGER.GRACEFUL_SHUTDOWN_TIMEOUT_MS;

const nodeProcess = globalThis.process;

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
    nodeProcess.exit(1);
  }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);

  resourceCleanupManager
    .cleanup()
    .then(() => {
      clearTimeout(forceExitTimeout);
      logger.info('Graceful shutdown completed successfully');
      nodeProcess.exit(0);
    })
    .catch((error) => {
      clearTimeout(forceExitTimeout);
      logger.error(
        'Error during graceful shutdown:',
        error instanceof Error ? error.message : String(error)
      );
      nodeProcess.exit(1);
    });
}

function registerNodejsHandlers(logger: ReturnType<typeof createLogger>): void {
  validateConfigurationOrThrow();

  nodeProcess.on(
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
        nodeProcess.exit(1);
      }
    }
  );

  nodeProcess.on('uncaughtException', (error: Error) => {
    logger.fatal('Uncaught Exception', error, {
      type: 'uncaughtException',
    });
    nodeProcess.exit(1);
  });

  nodeProcess.on('SIGTERM', () => performGracefulShutdown('SIGTERM', logger));
  nodeProcess.on('SIGINT', () => performGracefulShutdown('SIGINT', logger));

  if (ENV_ACCESSORS.PLATFORM.NODE_ENV() !== 'production') {
    logger.info('Global error handlers registered successfully');
  }
}

export async function registerNodejsInstrumentation(): Promise<void> {
  const { validateEnvironmentStrict } =
    await import('./lib/security/env-validation');
  validateEnvironmentStrict();

  const logger = createLogger('Instrumentation');
  registerNodejsHandlers(logger);
}
