'use client';

import { useSyncExternalStore } from 'react';

/**
 * Custom hook to subscribe to prefers-reduced-motion media query.
 * Consolidates accessibility logic used across multiple components to reduce code duplication and bundle size.
 *
 * @returns {boolean} True if the user prefers reduced motion, false otherwise.
 */
const subscribeToMotionPreference = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerMotionSnapshot = () => false;

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionSnapshot,
    getServerMotionSnapshot
  );
}

export default usePrefersReducedMotion;
