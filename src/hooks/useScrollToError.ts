'use client';

import { useCallback, useRef } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ScrollToErrorOptions {
  offset?: number;
  haptic?: boolean;
}

export function useScrollToError(options: ScrollToErrorOptions = {}) {
  const { offset = 80, haptic = true } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastErrorRef = useRef<string | null>(null);

  const scrollToError = useCallback(
    (errorSelector = '[aria-invalid="true"], .text-red-700') => {
      const errorElement = document.querySelector(errorSelector);

      if (!errorElement) return;

      const errorKey = errorElement.getBoundingClientRect().top.toString();
      if (lastErrorRef.current === errorKey) return;
      lastErrorRef.current = errorKey;

      setTimeout(() => {
        lastErrorRef.current = null;
      }, 1000);

      if (haptic) {
        triggerHapticFeedback();
      }

      const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      errorElement.scrollIntoView({
        behavior: scrollBehavior,
        block: 'center',
        inline: 'nearest',
      });

      if (!prefersReducedMotion) {
        requestAnimationFrame(() => {
          window.scrollBy({
            top: -offset,
            behavior: 'auto',
          });
        });
      } else {
        setTimeout(() => {
          window.scrollBy({ top: -offset, behavior: 'auto' });
        }, 50);
      }

      if (errorElement instanceof HTMLElement) {
        errorElement.focus({ preventScroll: true });
      }
    },
    [offset, haptic, prefersReducedMotion]
  );

  return { scrollToError };
}

export default useScrollToError;
