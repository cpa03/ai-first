'use client';

import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SCROLL_SHADOW_CONFIG } from '@/lib/config';

/**
 * ScrollShadow - Adds a subtle shadow to the header when scrolling down
 *
 * Micro-UX: Provides clear visual feedback that the header is sticky/fixed
 * by revealing a shadow that separates the header from the scrolling content.
 *
 * Benefits:
 * - Helps users understand page structure (header is fixed)
 * - Provides spatial awareness when scrolling
 * - Subtle animation that doesn't distract from content
 * - Respects prefers-reduced-motion for accessibility
 * - Uses passive scroll listener for performance
 */
function ScrollShadowComponent() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      setHasScrolled(window.scrollY > SCROLL_SHADOW_CONFIG.THRESHOLD);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Apply shadow styles to the header element
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    if (hasScrolled) {
      header.style.boxShadow = prefersReducedMotion
        ? SCROLL_SHADOW_CONFIG.SHADOWS.REDUCED_MOTION
        : SCROLL_SHADOW_CONFIG.SHADOWS.DEFAULT;
      header.style.transition = prefersReducedMotion
        ? SCROLL_SHADOW_CONFIG.TRANSITIONS.NONE
        : SCROLL_SHADOW_CONFIG.TRANSITIONS.SHADOW;
    } else {
      header.style.boxShadow = '';
      header.style.transition = prefersReducedMotion
        ? SCROLL_SHADOW_CONFIG.TRANSITIONS.NONE
        : SCROLL_SHADOW_CONFIG.TRANSITIONS.SHADOW;
    }
  }, [hasScrolled, prefersReducedMotion]);

  // This component doesn't render any UI - it only modifies the header's styles
  return null;
}

export default memo(ScrollShadowComponent);
