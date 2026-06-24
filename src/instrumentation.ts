import { ENV_ACCESSORS } from './lib/config/env-keys';

export async function register() {
  if (ENV_ACCESSORS.PLATFORM.NEXT_RUNTIME() === 'nodejs') {
    const modulePath = './instrumentation' + '.node';
    const nodeHandlers = await import(modulePath);
    await nodeHandlers.registerNodejsInstrumentation();
  }
}
