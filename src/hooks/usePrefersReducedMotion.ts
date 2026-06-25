'use client';

import { useSyncExternalStore } from 'react';

/**
 * Shared hook to subscribe to prefers-reduced-motion media query.
 *
 * This hook properly updates when OS accessibility settings change during runtime.
 * It uses useSyncExternalStore for proper server-side rendering support.
 *
 * @returns boolean indicating if user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = usePrefersReducedMotion();
 */

// PERFORMANCE: Shared MediaQueryList instance to avoid repeated window.matchMedia calls.
// Initialized lazily to ensure compatibility with SSR/Edge runtimes.
let memoizedMediaQuery: MediaQueryList | null = null;

const getMediaQuery = () => {
  if (typeof window === 'undefined') return null;
  if (!memoizedMediaQuery) {
    memoizedMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  }
  return memoizedMediaQuery;
};

const subscribe = (callback: () => void) => {
  const mediaQuery = getMediaQuery();
  if (!mediaQuery) return () => {};
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  const mediaQuery = getMediaQuery();
  return mediaQuery ? mediaQuery.matches : false;
};

const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default usePrefersReducedMotion;
