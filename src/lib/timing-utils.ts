/**
 * Timing / async utilities (SRP extraction from `lib/utils.ts`).
 *
 * Pure, dependency-free helpers moved here so `lib/utils.ts` stays focused
 * on class-name merging (`cn`). Re-exported from `lib/utils.ts` for
 * backward compatibility — existing `import { sleep } from '@/lib/utils'`
 * imports keep working.
 *
 * @module lib/timing-utils
 */

/**
 * Sleep/delay utility for pausing execution.
 *
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 *
 * @example
 * ```typescript
 * await sleep(1000); // Sleep for 1 second
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Timeout wrapper for Promise.
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutError - Custom error message for timeout
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * ```typescript
 * const result = await promiseTimeout(fetchData(), 5000, 'Request timed out');
 * ```
 */
export async function promiseTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(timeoutError ?? `Promise timed out after ${timeoutMs}ms`)
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}
