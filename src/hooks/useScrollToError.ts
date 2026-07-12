'use client';

import { useCallback, useRef } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { COMPONENT_CONFIG } from '@/lib/config';

interface ScrollToErrorOptions {
  offset?: number;
  haptic?: boolean;
}

export function useScrollToError(options: ScrollToErrorOptions = {}) {
  const {
    offset = COMPONENT_CONFIG.SCROLL_TO_ERROR.DEFAULT_OFFSET,
    haptic = true,
  } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const lastErrorRef = useRef<string | null>(null);

  const scrollToError = useCallback(
    (errorSelector = COMPONENT_CONFIG.SCROLL_TO_ERROR.DEFAULT_SELECTOR) => {
      const errorElement = document.querySelector(errorSelector);

      if (!errorElement) return;

      const errorKey = errorElement.getBoundingClientRect().top.toString();
      if (lastErrorRef.current === errorKey) return;
      lastErrorRef.current = errorKey;

      setTimeout(() => {
        lastErrorRef.current = null;
      }, COMPONENT_CONFIG.SCROLL_TO_ERROR.DEBOUNCE_MS);

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
        }, COMPONENT_CONFIG.SCROLL_TO_ERROR.REDUCED_MOTION_DELAY_MS);
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
