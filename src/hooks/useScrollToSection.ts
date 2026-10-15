'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';
import { triggerHapticFeedback } from '@/lib/utils';

interface UseScrollToSectionOptions {
  /** Offset in pixels from the top to account for sticky headers (default: 80) */
  offset?: number;
  /** Duration of the highlight effect in ms (default: 2000) */
  highlightDuration?: number;
  /** Whether to update URL hash (default: true) */
  updateHash?: boolean;
}

/**
 * Micro-UX: Smooth scroll-to-section with sticky header offset handling
 *
 * Provides a delightful navigation experience when scrolling to sections:
 * 1. Accounts for sticky header height with configurable offset
 * 2. Shows a subtle highlight effect on the target section
 * 3. Updates URL hash without page jump
 * 4. Supports prefers-reduced-motion for accessibility
 *
 * Usage:
 * ```tsx
 * const { scrollToSection } = useScrollToSection({ offset: 80 });
 *
 * <a href="#section-id" onClick={(e) => {
 *   e.preventDefault();
 *   scrollToSection('section-id');
 * }}>
 * ```
 */
export function useScrollToSection(options: UseScrollToSectionOptions = {}) {
  const { offset = 80, highlightDuration = 2000, updateHash = true } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (!element) return;

      triggerHapticFeedback();

      // Calculate scroll position with sticky header offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      // Smooth scroll to the section
      if (prefersReducedMotion) {
        window.scrollTo(0, offsetPosition);
      } else {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }

      // Update URL hash without triggering page jump
      if (updateHash) {
        const url = new URL(window.location.href);
        url.hash = sectionId;
        window.history.replaceState({}, '', url.toString());
      }

      // Micro-UX: Add subtle highlight effect to the target section
      // Provides visual feedback about which section was navigated to
      if (!prefersReducedMotion) {
        // Remove any existing highlight
        document.querySelectorAll('[data-section-highlight]').forEach((el) => {
          el.removeAttribute('data-section-highlight');
          el.classList.remove('section-highlight');
        });

        // Add highlight to target section
        element.setAttribute('data-section-highlight', 'true');
        element.classList.add('section-highlight');

        // Remove highlight after duration
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = setTimeout(() => {
          element.removeAttribute('data-section-highlight');
          element.classList.remove('section-highlight');
        }, highlightDuration);
      }

      // Set focus for screen readers (accessibility)
      element.setAttribute('tabindex', '-1');
      element.focus({ preventScroll: true });
    },
    [offset, highlightDuration, updateHash, prefersReducedMotion]
  );

  return { scrollToSection };
}
