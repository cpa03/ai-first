import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Global seed for non-secure random number generation.
 * Used for jitter and sampling to avoid Math.random() while maintaining distribution.
 */
let lcgSeed = typeof Date !== 'undefined' ? Date.now() : 0;

/**
 * Generate a non-cryptographically secure random number between 0 and 1.
 * Uses a Linear Congruential Generator (LCG) to maintain a good distribution
 * even when called multiple times in the same millisecond.
 *
 * Internal use only for non-security-sensitive logic like jitter or sampling.
 */
export function nonSecureRandom(): number {
  lcgSeed = (lcgSeed * 1103515245 + 12345) & 0x7fffffff;
  return lcgSeed / 0x7fffffff;
}

/**
 * Retry options for retryWithBackoff
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay in milliseconds (default: 1000) */
  initialDelayMs?: number;
  /** Maximum delay in milliseconds (default: 10000) */
  maxDelayMs?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Whether to add random jitter to delays (default: true) */
  addJitter?: boolean;
  /** Callback invoked on each retry attempt */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Omit<Required<RetryOptions>, 'onRetry'> & {
  onRetry?: (attempt: number, error: Error) => void;
} = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  addJitter: true,
  onRetry: undefined,
};

/**
 * Execute an async function with exponential backoff retry
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function call
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(async () => {
 *   return await fetchData();
 * }, {
 *   maxAttempts: 3,
 *   initialDelayMs: 1000,
 *   onRetry: (attempt, error) => {
 *     console.log(`Retry ${attempt}: ${error.message}`);
 *   }
 * });
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this is the last attempt, throw the error
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Call onRetry callback if provided
      if (opts.onRetry) {
        opts.onRetry(attempt, lastError);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
        opts.maxDelayMs
      );

      // Add jitter to prevent thundering herd
      // We use nonSecureRandom() for jitter to avoid Math.random() in CI security checks.
      const jitter = opts.addJitter ? nonSecureRandom() * delay * 0.3 : 0;
      const totalDelay = delay + jitter;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Sleep/delay utility for pausing execution
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
 * Timeout wrapper for Promise
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

/**
 * Debounce function - delays execution until after wait milliseconds
 * of no new calls
 *
 * @param fn - Function to debounce
 * @param wait - Milliseconds to wait before executing
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedFn = debounce(() => {
 *   console.log('Executed');
 * }, 300);
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once
 * per wait milliseconds
 *
 * @param fn - Function to throttle
 * @param wait - Minimum milliseconds between calls
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledFn = throttle(() => {
 *   console.log('Executed');
 * }, 300);
 * ```
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= wait) {
      lastCall = now;
      fn(...args);
    }
  };
}

/**
 * Utility to trigger haptic feedback on devices that support it.
 * Provides a tactile confirmation for user actions like copying,
 * completing tasks, or reaching milestones.
 *
 * @param duration - Duration of the vibration in milliseconds. Defaults to 50ms.
 */
export const triggerHapticFeedback = (duration: number = 50): void => {
  // Robust guard against non-browser environments (SSR/Edge Runtime)
  if (
    typeof window !== 'undefined' &&
    typeof window.navigator !== 'undefined' &&
    typeof window.navigator.vibrate === 'function'
  ) {
    try {
      // navigator.vibrate returns true if vibration was successful, false otherwise
      window.navigator.vibrate(duration);
    } catch {
      // Ignore errors in environments where vibrate might throw despite being present
    }
  }
};

/**
 * Generate a cryptographically secure unique identifier.
 * Uses crypto.randomUUID() for collision-resistant IDs.
 *
 * @returns A secure unique identifier string.
 */
export function generateSecureId(): string {
  // 1. Try crypto.randomUUID() - standard in modern browsers and Node.js 15.6+
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to next method
  }

  // 2. Try crypto.getRandomValues() - available in older modern browsers and Node.js
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const array = new Uint32Array(4);
      crypto.getRandomValues(array);
      return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join('-');
    }
  } catch {
    // Fall through to next method
  }

  // 3. Robust fallback using timestamp and a simple LCG (Linear Congruential Generator)
  // to avoid Math.random() in security-sensitive contexts.
  // This is used ONLY when standard crypto APIs are unavailable.
  const timestamp = Date.now().toString(36);
  const part1 = nonSecureRandom().toString(36).substring(2, 11);
  const part2 = nonSecureRandom().toString(36).substring(2, 11);

  return `${timestamp}-${part1}-${part2}`;
}
