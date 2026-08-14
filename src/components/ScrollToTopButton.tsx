'use client';

import { memo, useCallback, useEffect, useState } from 'react';
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
import { PLATFORM } from '@/lib/dom-utils';
import { SCROLL_TO_TOP_BUTTON_LABELS } from '@/lib/config/component-labels';
import Tooltip from './Tooltip';

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
  const [isMac, setIsMac] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Micro-UX: Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

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

  const buttonElement = (
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
      aria-label={SCROLL_TO_TOP_BUTTON_LABELS.ARIA_LABEL}
    >
      <span>{SCROLL_TO_TOP_BUTTON_LABELS.BUTTON_TEXT}</span>
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

  // Micro-UX: Show keyboard shortcut in tooltip for discoverability
  // Follows the same pattern as Button component for consistency
  const shortcut = isMac ? ['⌘', '↑'] : ['Ctrl', 'Home'];

  return (
    <Tooltip content="Scroll to top" shortcut={shortcut} position="top">
      {buttonElement}
    </Tooltip>
  );
}

ScrollToTopButtonComponent.displayName = 'ScrollToTopButton';

export default memo(ScrollToTopButtonComponent);
