'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  Z_INDEX_LAYERS,
  SCROLL_PROGRESS_BAR,
  TEXT_SIZE_CLASSES,
  DURATION_TAILWIND,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { SCROLL_PROGRESS_LABELS } from '@/lib/config/component-labels';

const SHOW_PERCENTAGE_THRESHOLD = 75;

/**
 * ScrollProgress - Visual scroll position indicator
 *
 * Displays a thin animated bar at the top of the viewport showing how far
 * the user has scrolled through the page content. Helps users maintain
 * spatial awareness on long pages like blueprint results.
 *
 * Micro-UX benefits:
 * - Provides spatial awareness on long content pages
 * - Encourages scrolling to discover full output
 * - Animates smoothly with CSS transitions
 * - Respects prefers-reduced-motion for accessibility
 * - Hidden when not needed (at top of page)
 */
function ScrollProgressComponent() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  const showPercentage = scrollPercent >= SHOW_PERCENTAGE_THRESHOLD;
  const displayPercentage = Math.round(scrollPercent);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent =
        docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollPercent(percent);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

  // Don't render anything when at the very top of the page
  if (scrollPercent < 1) {
    return null;
  }

  return (
    <div
      className={SCROLL_PROGRESS_BAR}
      style={{ zIndex: Z_INDEX_LAYERS.STICKY }}
      role="progressbar"
      aria-valuenow={displayPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={
        showPercentage
          ? SCROLL_PROGRESS_LABELS.ARIA_LABEL_WITH_PERCENTAGE(displayPercentage)
          : SCROLL_PROGRESS_LABELS.ARIA_LABEL
      }
    >
      <div
        className={`h-full rounded-r-full bg-gradient-to-r from-primary-500 to-primary-600 ${
          prefersReducedMotion
            ? ''
            : `transition-all ${DURATION_TAILWIND[150]} ease-out`
        }`}
        style={{ width: `${scrollPercent}%` }}
      />
      {showPercentage && !prefersReducedMotion && (
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 ${FADE_IN}`}
          aria-hidden="true"
        >
          <span
            className={`${TEXT_SIZE_CLASSES.XS} font-semibold text-white tabular-nums leading-none drop-shadow-sm`}
          >
            {displayPercentage}%
          </span>
        </div>
      )}
    </div>
  );
}

const ScrollProgress = memo(ScrollProgressComponent);
ScrollProgress.displayName = 'ScrollProgress';

export default ScrollProgress;
