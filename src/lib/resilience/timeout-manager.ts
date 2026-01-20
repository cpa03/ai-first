import { TimeoutError } from '../errors';
import { TimeoutOptions } from './types';

export class TimeoutManager {
  static async withTimeout<T>(
    operation: () => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const { timeoutMs, onTimeout } = options;

    if (timeoutMs <= 0) {
      return Promise.reject(
        new TimeoutError('timeout must be greater than 0', 0)
      );
    }

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          onTimeout?.();
          reject(
            new TimeoutError(
              `operation timeout after ${timeoutMs}ms`,
              timeoutMs
            )
          );
        }, timeoutMs);

        if (typeof (timeoutId as NodeJS.Timeout).unref === 'function') {
          (timeoutId as NodeJS.Timeout).unref();
        }
      }),
    ]);
  }
}
