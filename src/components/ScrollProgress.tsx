'use client';

import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  Z_INDEX_LAYERS,
  SCROLL_PROGRESS_BAR,
  TEXT_SIZE_CLASSES,
  DURATION_TAILWIND,
  GRADIENT_CONFIG,
  UI_CONFIG,
  TRANSITION_CLASSES,
  ICON_SIZES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  PROGRESS_BAR_A11Y,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { SCROLL_PROGRESS_LABELS } from '@/lib/config/component-labels';
import { triggerHapticFeedback } from '@/lib/utils';

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
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const showPercentage =
    scrollPercent >= UI_CONFIG.SCROLL_PROGRESS_SHOW_THRESHOLD;
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

  const scrollToPosition = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const clickPercent = Math.max(
        0,
        Math.min(100, ((clientX - rect.left) / rect.width) * 100)
      );

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTarget = (clickPercent / 100) * docHeight;

      triggerHapticFeedback();

      window.scrollTo({
        top: scrollTarget,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    },
    [prefersReducedMotion]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      scrollToPosition(e.clientX);
    },
    [scrollToPosition]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      scrollToPosition(e.clientX);
    },
    [scrollToPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        scrollToPosition(e.clientX);
      }
    },
    [isDragging, scrollToPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        scrollToPosition(e.clientX);
      };
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, scrollToPosition]);

  if (scrollPercent < 1) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className={`${SCROLL_PROGRESS_BAR} ${
        isHovered || isDragging ? 'h-1.5 cursor-pointer' : 'cursor-pointer'
      } ${TRANSITION_CLASSES.DEFAULT}`}
      style={{ zIndex: Z_INDEX_LAYERS.STICKY }}
      role="slider"
      aria-valuenow={displayPercentage}
      aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
      aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
      aria-label={
        showPercentage
          ? SCROLL_PROGRESS_LABELS.CLICK_TO_SCROLL_ARIA(displayPercentage)
          : SCROLL_PROGRESS_LABELS.ARIA_LABEL
      }
      aria-roledescription="Click to scroll"
      title={SCROLL_PROGRESS_LABELS.CLICK_TO_SCROLL_TOOLTIP}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDragging(false);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.scrollTo({
            top: (scrollPercent / 100) * document.documentElement.scrollHeight,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        }
      }}
      tabIndex={0}
    >
      <div
        className={`h-full rounded-r-full ${GRADIENT_CONFIG.SCROLL_PROGRESS_BAR} ${
          prefersReducedMotion
            ? ''
            : `transition-all ${DURATION_TAILWIND[150]} ease-out`
        } ${isHovered || isDragging ? 'opacity-90' : 'opacity-100'}`}
        style={{ width: `${scrollPercent}%` }}
      />
      {showPercentage && (
        <div
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 ${FADE_IN} ${
            isHovered || isDragging ? 'opacity-100' : 'opacity-0'
          } ${prefersReducedMotion ? '' : `transition-opacity ${DURATION_TAILWIND[150]}`}`}
          aria-hidden="true"
        >
          <svg
            className={`${ICON_SIZES.SM} text-white drop-shadow-sm`}
            fill="none"
            viewBox={SVG_VIEWBOX.STANDARD}
            stroke="currentColor"
            strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
              transform="rotate(180 12 12)"
            />
          </svg>
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
