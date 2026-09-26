'use client';

import { useCallback } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { PAGE_ELEMENT_IDS } from '@/lib/config/element-ids';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface UseScrollToTopOptions {
  /**
   * Default scroll behavior for programmatic scrolls.
   * Always overridden by instant scroll when the user prefers reduced motion.
   */
  smooth?: boolean;
}

/**
 * Shared scroll-to-top/scroll-to-bottom logic (Wave 2C extraction).
 *
 * Consolidates the logic previously duplicated between `ScrollToTop`
 * (floating progress button) and `ScrollToTopButton` (footer link):
 * reduced-motion-aware scrolling, haptic feedback, and moving focus to the
 * main content for screen readers. The two components keep their own UI.
 */
export function useScrollToTop(
  options: UseScrollToTopOptions = {}
) {
  const { smooth = true } = options;
  const prefersReducedMotion = usePrefersReducedMotion();

  const focusMainContent = useCallback(() => {
    const mainContent = document.getElementById(PAGE_ELEMENT_IDS.MAIN_CONTENT);
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    triggerHapticFeedback();
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
    focusMainContent();
  }, [smooth, prefersReducedMotion, focusMainContent]);

  const scrollToBottom = useCallback(() => {
    triggerHapticFeedback();
    if (prefersReducedMotion) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [smooth, prefersReducedMotion]);

  return { scrollToTop, scrollToBottom, prefersReducedMotion, focusMainContent };
}

/**
 * @deprecated Use `useScrollToTop` instead. Kept for backward compatibility.
 */
export function useScrollToTopActions(
  options: UseScrollToTopOptions = {}
) {
  return useScrollToTop(options);
}
