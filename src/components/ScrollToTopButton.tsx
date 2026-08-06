'use client';

import { memo, useCallback, useState } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  TRANSITION_CLASSES,
  GRAY_CLASSES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  ICON_SIZES,
  FOCUS_RING_OFFSET_PATTERNS,
} from '@/lib/config';
import { PAGE_ELEMENT_IDS } from '@/lib/config/element-ids';

/**
 * ScrollToTopButton - Footer scroll-to-top link
 *
 * Micro-UX: Replaces static "Scroll to top" text with an interactive button
 * that smoothly scrolls to the top of the page. Provides haptic feedback
 * and keyboard accessibility for a delightful user experience.
 *
 * Follows the pattern established by ScrollToTop component for consistency.
 */
function ScrollToTopButtonComponent() {
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleScrollToTop = useCallback(() => {
    triggerHapticFeedback();

    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    // Focus main content for screen readers
    const mainContent = document.getElementById(PAGE_ELEMENT_IDS.MAIN_CONTENT);
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [prefersReducedMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleScrollToTop();
      }
    },
    [handleScrollToTop]
  );

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onMouseLeave={() => setIsHoveredOrFocused(false)}
      onFocus={() => setIsHoveredOrFocused(true)}
      onBlur={() => setIsHoveredOrFocused(false)}
      className={`
        text-sm ${GRAY_CLASSES.TEXT_500}
        ${TRANSITION_CLASSES.COLOR} ease-out
        hover:text-primary-600
        ${FOCUS_RING_OFFSET_PATTERNS.FOCUS} rounded-md
        inline-flex items-center gap-1.5
        group
      `}
      aria-label="Scroll to top of page"
    >
      <span>Scroll to top</span>
      <svg
        className={`${ICON_SIZES.SM} transition-transform ${TRANSITION_CLASSES.DEFAULT} ${
          isHoveredOrFocused && !prefersReducedMotion ? '-translate-y-0.5' : ''
        }`}
        fill="none"
        viewBox={SVG_VIEWBOX.STANDARD}
        stroke="currentColor"
        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}

ScrollToTopButtonComponent.displayName = 'ScrollToTopButton';

export default memo(ScrollToTopButtonComponent);
