import { ENV_ACCESSORS } from './lib/config/env-keys';

export async function register() {
  if (ENV_ACCESSORS.PLATFORM.NEXT_RUNTIME() === 'nodejs') {
    // Use direct import path for webpack static analysis
    const nodeHandlers = await import('./instrumentation.node');
    await nodeHandlers.registerNodejsInstrumentation();
  }
}
