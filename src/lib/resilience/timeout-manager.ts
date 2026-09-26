import { TimeoutError } from '../errors';
import { TimeoutOptions } from './types';

/**
 * TimeoutManager provides utilities for adding timeout behavior to async operations.
 *
 * Uses AbortController for modern environments (works in both Node.js and edge runtimes).
 * Falls back to Promise.race with setTimeout for legacy compatibility.
 */
export class TimeoutManager {
  /**
   * Execute an operation with timeout.
   * Automatically detects if the operation supports AbortSignal and uses the appropriate method.
   * Works in both Node.js and edge runtimes (Cloudflare Workers, Vercel Edge).
   *
   * @param operation - The async operation to execute (can accept AbortSignal as parameter)
   * @param options - Timeout configuration
   * @returns Promise that resolves with the operation result or rejects on timeout
   */
  static async withTimeout<T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    options: TimeoutOptions
  ): Promise<T> {
    const { timeoutMs, onTimeout } = options;

    if (timeoutMs <= 0) {
      return Promise.reject(
        new TimeoutError('timeout must be greater than 0', 0)
      );
    }

    // Check if operation expects an AbortSignal (by checking function length)
    const usesSignal = operation.length > 0;

    if (usesSignal) {
      // Modern AbortController-based approach
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        onTimeout?.();
        controller.abort();
      }, timeoutMs);

      if (typeof timeoutId.unref === 'function') {
        timeoutId.unref();
      }

      try {
        const result = await operation(controller.signal);
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError(
            `operation timeout after ${timeoutMs}ms`,
            timeoutMs
          );
        }
        throw error;
      }
    } else {
      // Legacy Promise.race approach for backwards compatibility
      return TimeoutManager.withTimeoutLegacy(operation as () => Promise<T>, options);
    }
  }

  /**
   * @deprecated Use {@link withTimeout} with an AbortSignal-aware operation instead.
   * Legacy method for operations that don't support AbortSignal.
   * Uses Promise.race with setTimeout (Node.js only, not edge-compatible).
   */
  static async withTimeoutLegacy<T>(
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

      if (typeof (timeoutId as NodeJS.Timeout).unref === 'function') {
        (timeoutId as NodeJS.Timeout).unref();
      }
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      return result;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      throw error;
    }
  }
}
