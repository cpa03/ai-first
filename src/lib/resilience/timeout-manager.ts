import { TimeoutError } from '../errors';
import { TimeoutOptions } from './types';

/**
 * TimeoutManager provides utilities for adding timeout behavior to async operations.
 *
 * Supports two modes:
 * 1. withTimeout - Uses setTimeout (Node.js compatible)
 * 2. withTimeoutAndSignal - Uses AbortController (edge-compatible)
 */
export class TimeoutManager {
  /**
   * Execute an operation with timeout using setTimeout.
   * Note: This approach may not work properly in edge runtimes (Cloudflare Workers, Vercel Edge).
   * For edge environments, use withTimeoutAndSignal instead.
   */
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

  /**
   * Execute an operation with timeout using AbortController.
   * This approach is compatible with edge runtimes (Cloudflare Workers, Vercel Edge).
   *
   * @param operation - The async operation to execute (receives AbortSignal as parameter)
   * @param timeoutMs - Timeout in milliseconds
   * @param onTimeout - Optional callback when timeout occurs
   * @returns Promise that resolves with the operation result or rejects on timeout
   */
  static async withTimeoutAndSignal<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    timeoutMs: number,
    onTimeout?: () => void
  ): Promise<T> {
    if (timeoutMs <= 0) {
      return Promise.reject(
        new TimeoutError('timeout must be greater than 0', 0)
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      onTimeout?.();
      controller.abort();
    }, timeoutMs);

    try {
      const result = await operation(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      // If the operation was aborted, throw a TimeoutError
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(
          `operation timeout after ${timeoutMs}ms`,
          timeoutMs
        );
      }
      throw error;
    }
  }
}
