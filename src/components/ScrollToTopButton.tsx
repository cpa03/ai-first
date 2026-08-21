'use client';

import { memo, useCallback, useEffect, useState, useRef } from 'react';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  TRANSITION_CLASSES,
  GRAY_CLASSES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  ICON_SIZES,
  FOCUS_RING_OFFSET_PATTERNS,
  COMPONENT_CONFIG,
  UI_CONFIG,
  SCROLL_TO_TOP_APPEAR,
} from '@/lib/config';
import { PAGE_ELEMENT_IDS } from '@/lib/config/element-ids';
import { PLATFORM } from '@/lib/dom-utils';
import { SCROLL_TO_TOP_BUTTON_LABELS } from '@/lib/config/component-labels';
import Tooltip from './Tooltip';
import { COMPONENT_PRIMARY_PATTERNS } from '@/lib/config/primary-colors';

/**
 * ScrollToTopButton - Footer scroll-to-top link
 *
 * Micro-UX: Replaces static "Scroll to top" text with an interactive button
 * that smoothly scrolls to the top of the page. Provides haptic feedback
 * and keyboard accessibility for a delightful user experience.
 *
 * Micro-UX: Adds a subtle pulse animation on first appearance to draw
 * user attention to this useful feature, especially on long pages.
 *
 * Micro-UX: Shows persistent keyboard shortcut hint (⌘+↑ / Ctrl+Home)
 * next to the button text on desktop for discoverability. Follows the
 * pattern established by the login page for inline shortcut hints.
 *
 * Follows the pattern established by ScrollToTop component for consistency.
 */
function ScrollToTopButtonComponent() {
  const [isHoveredOrFocused, setIsHoveredOrFocused] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Micro-UX: Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion) {
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
      pulseTimeoutRef.current = setTimeout(() => {
        setHasAppeared(false);
      }, COMPONENT_CONFIG.SCROLL_TO_TOP_BUTTON.PULSE_DURATION_MS);
    }

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [prefersReducedMotion]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isModifierPressed = e.metaKey || e.ctrlKey;
      const isHomeKey = e.key === 'Home';
      const isUpArrow = e.key === 'ArrowUp' && !e.shiftKey;

      // ⌘+↑ on Mac, Ctrl+Home on Windows/Linux
      if (isModifierPressed && (isHomeKey || isUpArrow)) {
        if ((isMac && isUpArrow) || (!isMac && isHomeKey)) {
          e.preventDefault();
          handleScrollToTop();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleScrollToTop, isMac]);

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
        ${COMPONENT_PRIMARY_PATTERNS.SCROLL_TO_TOP_HOVER}
        ${FOCUS_RING_OFFSET_PATTERNS.FOCUS} rounded-md
        inline-flex items-center gap-1.5
        group
        ${hasAppeared && !prefersReducedMotion ? SCROLL_TO_TOP_APPEAR : ''}
      `}
      aria-label={SCROLL_TO_TOP_BUTTON_LABELS.ARIA_LABEL}
    >
      <span aria-hidden="true">{SCROLL_TO_TOP_BUTTON_LABELS.BUTTON_TEXT}</span>
      {/* Micro-UX: Persistent keyboard shortcut hint for discoverability */}
      {/* Only visible on desktop (sm+) to avoid cluttering mobile footer */}
      {/* Subtle opacity ensures it doesn't distract from the main button text */}
      <span
        className={`hidden sm:inline-flex items-center gap-1 transition-opacity ${TRANSITION_CLASSES.DEFAULT}`}
        aria-hidden="true"
      >
        <kbd
          className={`px-1 py-0.5 ${UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}`}
        >
          {isMac ? '⌘' : 'Ctrl'}
        </kbd>
        <kbd
          className={`px-1 py-0.5 ${UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}`}
        >
          {isMac ? '↑' : 'Home'}
        </kbd>
      </span>
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
