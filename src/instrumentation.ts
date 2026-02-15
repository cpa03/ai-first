/**
 * Global error handlers for unhandled promise rejections and uncaught exceptions.
 * This file is loaded by Next.js at startup when instrumentationHook is enabled.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only register in Node.js runtime (not edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Handle unhandled promise rejections
    process.on(
      'unhandledRejection',
      (reason: unknown, _promise: Promise<unknown>) => {
        const timestamp = new Date().toISOString();
        const errorMessage =
          reason instanceof Error ? reason.message : String(reason);
        const stack = reason instanceof Error ? reason.stack : undefined;

        // Use structured logging for production observability
        const logEntry = {
          level: 'fatal',
          type: 'unhandledRejection',
          timestamp,
          message: errorMessage,
          stack,
          environment: process.env.NODE_ENV || 'unknown',
        };

        // Log to stderr for proper log aggregation
        console.error(
          '[FATAL] Unhandled Promise Rejection:',
          JSON.stringify(logEntry)
        );

        // In development, exit immediately to catch bugs early
        // In production, continue running but log for monitoring
        if (process.env.NODE_ENV === 'development') {
          console.error(
            '[FATAL] Exiting due to unhandled rejection in development mode'
          );
          process.exit(1);
        }
      }
    );

    // Handle uncaught exceptions
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

      // Always exit on uncaught exceptions - the process is in an unknown state
      process.exit(1);
    });

    // Log successful registration in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[Instrumentation] Global error handlers registered successfully'
      );
    }
  }
}
