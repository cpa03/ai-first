'use client';

import { useSyncExternalStore } from 'react';

/**
 * Subscribes to the prefers-reduced-motion media query.
 */
const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

/**
 * Returns the current value of the prefers-reduced-motion media query.
 */
const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Server-side snapshot - defaults to no reduced motion.
 */
const getServerSnapshot = () => false;

/**
 * Centralized hook to subscribe to the prefers-reduced-motion media query.
 *
 * PERFORMANCE: This leverages useSyncExternalStore to efficiently track media query
 * changes with minimal overhead, while allowing multiple components to share the
 * subscription logic.
 *
 * @returns boolean - true if the user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
