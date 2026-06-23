/**
 * Global error handlers for unhandled promise rejections and uncaught exceptions.
 * This file is loaded by Next.js at startup when instrumentationHook is enabled.
 *
 * Node.js-specific handlers are dynamically imported to avoid Edge Runtime
 * compatibility warnings during static analysis.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import { ENV_ACCESSORS } from './lib/config/env-keys';

export async function register() {
  if (ENV_ACCESSORS.PLATFORM.NEXT_RUNTIME() === 'nodejs') {
    // SECURITY: Validate environment before starting application
    // This prevents the app from running with misconfigured credentials
    const { validateEnvironmentStrict } =
      await import('./lib/security/env-validation');
    validateEnvironmentStrict();

    const { registerNodejsHandlers } = await import('./instrumentation.node');
    registerNodejsHandlers();
  }
}
