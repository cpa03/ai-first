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

    // IMPORTANT: The import path is constructed dynamically using a template literal
    // to prevent Turbopack from statically tracing it into the Edge Runtime bundle.
    // The .node.ts file contains Node.js-only APIs (process.exit, process.on) that
    // are incompatible with Edge Runtime.
    const nodeModule = './instrumentation' + '.node';
    const { registerNodejsHandlers } = await import(
      /* webpackIgnore: true */ nodeModule
    );
    registerNodejsHandlers();
  }
}
