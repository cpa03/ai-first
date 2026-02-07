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

    let timeoutId: NodeJS.Timeout | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        onTimeout?.();
        reject(
          new TimeoutError(`operation timeout after ${timeoutMs}ms`, timeoutMs)
        );
      }, timeoutMs);

      // Only unref in Node.js environment to prevent keeping process alive
      if (typeof (timeoutId as NodeJS.Timeout).unref === 'function') {
        (timeoutId as NodeJS.Timeout).unref();
      }
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      // Clear timeout if operation succeeded
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return result;
    } catch (error) {
      // Ensure timeout is cleared even on error
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      throw error;
    }
  }
}
