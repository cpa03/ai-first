'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribes to the (prefers-reduced-motion: reduce) media query changes.
 * Used with useSyncExternalStore for a robust, performant implementation
 * that works correctly across SSR and client-side hydration.
 */
const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Use modern addEventListener if available, fallback to addListener for older browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  } else {
    (mediaQuery as MediaQueryList).addListener(callback);
    return () => {
      (mediaQuery as MediaQueryList).removeListener(callback);
    };
  }
};

/**
 * Returns the current state of the prefers-reduced-motion media query.
 */
const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns the server-side snapshot (defaults to false/no reduced motion).
 */
const getServerSnapshot = () => false;

/**
 * A hook that returns true if the user has requested reduced motion at the OS level.
 * Centralizing this logic improves performance by reducing redundant event listeners
 * and ensures consistency across the application.
 *
 * @returns boolean indicating if reduced motion is preferred
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default usePrefersReducedMotion;
