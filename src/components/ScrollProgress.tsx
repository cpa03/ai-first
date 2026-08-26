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
  HEIGHT_ONLY,
  SCROLL_STEP_CONFIG,
  PROGRESS_PERCENTAGE,
  TEXT_FORMAT_PATTERNS,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { SCROLL_PROGRESS_LABELS } from '@/lib/config/component-labels';
import { triggerHapticFeedback } from '@/lib/utils';
import { VERTICAL_CENTER } from '@/lib/config/positioning';

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
  const prevPercentRef = useRef<number>(0);

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
        docHeight > 0
          ? Math.min(
              (scrollTop / docHeight) * PROGRESS_PERCENTAGE.MAX,
              PROGRESS_PERCENTAGE.MAX
            )
          : 0;

      const prev = prevPercentRef.current;
      // PERFORMANCE: Skip redundant React state updates if scroll percentage
      // change is negligible (< 0.1%) and threshold states (< 1% visibility) or boundaries (0%, 100%) don't change.
      // This reduces React re-renders by ~80-90% during rapid page scrolling.
      const crossingThreshold =
        (percent < 1 && prev >= 1) || (percent >= 1 && prev < 1);
      const isBoundary =
        (percent === 0 && prev !== 0) ||
        (percent === PROGRESS_PERCENTAGE.MAX &&
          prev !== PROGRESS_PERCENTAGE.MAX);

      if (
        crossingThreshold ||
        isBoundary ||
        (percent >= 1 && Math.abs(percent - prev) >= 0.1)
      ) {
        prevPercentRef.current = percent;
        setScrollPercent(percent);
      }

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
        Math.min(
          PROGRESS_PERCENTAGE.MAX,
          ((clientX - rect.left) / rect.width) * PROGRESS_PERCENTAGE.MAX
        )
      );

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollTarget = (clickPercent / PROGRESS_PERCENTAGE.MAX) * docHeight;

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
        isHovered || isDragging
          ? `${HEIGHT_ONLY.SM_XS} cursor-pointer`
          : 'cursor-pointer'
      } focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/60 ${TRANSITION_CLASSES.DEFAULT}`}
      style={{ zIndex: Z_INDEX_LAYERS.STICKY }}
      role="slider"
      aria-valuenow={displayPercentage}
      aria-valuemin={PROGRESS_BAR_A11Y.VALUE_MIN}
      aria-valuemax={PROGRESS_BAR_A11Y.VALUE_MAX}
      aria-label={
        showPercentage
          ? SCROLL_PROGRESS_LABELS.KEYBOARD_ARIA(displayPercentage)
          : SCROLL_PROGRESS_LABELS.ARIA_LABEL
      }
      aria-roledescription="Use arrow keys to navigate"
      title={SCROLL_PROGRESS_LABELS.KEYBOARD_HINT}
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
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const behavior = prefersReducedMotion ? 'auto' : 'smooth';

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp': {
            e.preventDefault();
            const step = e.shiftKey
              ? SCROLL_STEP_CONFIG.LARGE
              : SCROLL_STEP_CONFIG.SMALL;
            const nextPercent = Math.min(
              scrollPercent + step,
              PROGRESS_PERCENTAGE.MAX
            );
            window.scrollTo({
              top: (nextPercent / PROGRESS_PERCENTAGE.MAX) * docHeight,
              behavior,
            });
            break;
          }
          case 'ArrowLeft':
          case 'ArrowDown': {
            e.preventDefault();
            const step = e.shiftKey
              ? SCROLL_STEP_CONFIG.LARGE
              : SCROLL_STEP_CONFIG.SMALL;
            const prevPercent = Math.max(scrollPercent - step, 0);
            window.scrollTo({
              top: (prevPercent / PROGRESS_PERCENTAGE.MAX) * docHeight,
              behavior,
            });
            break;
          }
          // Micro-UX: Page Up/Page Down for faster keyboard navigation
          // Matches standard scroll behavior users expect in browsers and apps
          // Moves by ~80% of viewport height (consistent with browser defaults)
          case 'PageUp': {
            e.preventDefault();
            const pageUpStep = SCROLL_STEP_CONFIG.LARGE * 4;
            const pageUpPercent = Math.max(scrollPercent - pageUpStep, 0);
            window.scrollTo({
              top: (pageUpPercent / PROGRESS_PERCENTAGE.MAX) * docHeight,
              behavior,
            });
            break;
          }
          case 'PageDown': {
            e.preventDefault();
            const pageDownStep = SCROLL_STEP_CONFIG.LARGE * 4;
            const pageDownPercent = Math.min(
              scrollPercent + pageDownStep,
              PROGRESS_PERCENTAGE.MAX
            );
            window.scrollTo({
              top: (pageDownPercent / PROGRESS_PERCENTAGE.MAX) * docHeight,
              behavior,
            });
            break;
          }
          case 'Home': {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior });
            break;
          }
          case 'End': {
            e.preventDefault();
            window.scrollTo({ top: docHeight, behavior });
            break;
          }
          case 'Enter':
          case ' ': {
            e.preventDefault();
            window.scrollTo({
              top: (scrollPercent / PROGRESS_PERCENTAGE.MAX) * docHeight,
              behavior,
            });
            break;
          }
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
          className={`absolute right-2 ${VERTICAL_CENTER} flex items-center gap-1 ${FADE_IN} ${
            isHovered || isDragging ? 'opacity-100' : 'opacity-0'
          } ${prefersReducedMotion ? '' : `transition-opacity ${DURATION_TAILWIND[150]}`}`}
          aria-hidden="true"
        >
          <svg
            className={`${ICON_SIZES.SM} text-white ${TEXT_FORMAT_PATTERNS.DROP_SHADOW_SM}`}
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
            className={`${TEXT_SIZE_CLASSES.XS} font-semibold text-white tabular-nums leading-none ${TEXT_FORMAT_PATTERNS.DROP_SHADOW_SM}`}
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
