import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
