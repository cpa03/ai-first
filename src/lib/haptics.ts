import { ANIMATION_DELAYS } from './config';

/**
 * Utility to trigger haptic feedback on devices that support it.
 * Provides a tactile confirmation for user actions like copying,
 * completing tasks, or reaching milestones.
 *
 * @param duration - Duration of the vibration in milliseconds. Defaults to ANIMATION_DELAYS.MICRO.
 */
export const triggerHapticFeedback = (
  duration: number = ANIMATION_DELAYS.MICRO
): void => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    // navigator.vibrate returns true if vibration was successful, false otherwise
    // We ignore the return value as failure is typically due to browser policy
    // or hardware limitations and doesn't require application-level handling.
    navigator.vibrate(duration);
  }
};
