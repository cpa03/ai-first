'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  COMPONENT_DEFAULTS,
  COMPONENT_CONFIG,
  DURATION_TAILWIND,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  Z_INDEX_LAYERS,
  SCROLL_TO_TOP_LABELS,
  TEXT_SIZE_CLASSES,
  TEXT_SIZE_PRESETS,
  UI_TIMING_CONFIG,
  UI_DURATIONS,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLORS,
  SHADOW_CLASSES,
  TRANSITION_CLASSES,
  PROGRESS_PERCENTAGE,
  TYPOGRAPHY_CLASSES,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import Tooltip from './Tooltip';

interface ScrollToTopProps {
  showAt?: number;
  smooth?: boolean;
  className?: string;
}

function ScrollToTopComponent({
  showAt = COMPONENT_DEFAULTS.SCROLL_TO_TOP.SHOW_AT_PX,
  smooth = COMPONENT_DEFAULTS.SCROLL_TO_TOP.SMOOTH,
  className = '',
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasAppeared, setHasAppeared] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  // Keep a reference to the latest visibility state to avoid re-binding the event listener
  const isVisibleRef = useRef(isVisible);
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const animatedPercentage = useAnimatedCounter(Math.round(scrollProgress), {
    duration: UI_DURATIONS.ANIMATED_COUNTER,
  });

  // PERFORMANCE: High-performance scroll handler gated by requestAnimationFrame.
  // This executes at most once per animation frame, completely eliminating
  // redundant window.scrollY reads (which can cause layout recalculations)
  // and RAF register/cancel thrashing during rapid scroll events.
  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    // Set placeholder to prevent re-entry during synchronous test executions
    rafRef.current = 0;

    const id = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const shouldShow = scrollTop > showAt;
      const currentIsVisible = isVisibleRef.current;

      if (shouldShow && !currentIsVisible) {
        setIsVisible(true);
        setHasAppeared(false);
        requestAnimationFrame(() => {
          setHasAppeared(true);
        });
      } else if (!shouldShow && currentIsVisible) {
        setIsVisible(false);
        setHasAppeared(false);
      }

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0
          ? (scrollTop / docHeight) * PROGRESS_PERCENTAGE.MAX
          : PROGRESS_PERCENTAGE.MIN;
      setScrollProgress(Math.min(progress, PROGRESS_PERCENTAGE.MAX));

      rafRef.current = null;
    });

    // If callback hasn't run yet (async in production), assign the actual ID
    if (rafRef.current !== null) {
      rafRef.current = id;
    }
  }, [showAt]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial scroll check to set visibility if page is already scrolled on mount/HMR
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll]);

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

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [smooth, prefersReducedMotion]);

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

  // Micro-UX: Three-phase color progression for scroll depth indicator
  // Phase 1 (0-40%): Gray - neutral, user is near the top
  // Phase 2 (40-75%): Blue - brand color, user is in the middle
  // Phase 3 (75-100%): Emerald - success color, user is near the bottom
  const getScrollDepthColor = useCallback((progress: number) => {
    if (progress <= 40) {
      return {
        stroke: 'text-gray-400',
        text: 'text-gray-500',
        label: 'Near top',
      };
    }
    if (progress <= 75) {
      return {
        stroke: 'text-primary-500',
        text: 'text-primary-600',
        label: 'Middle of page',
      };
    }
    return {
      stroke: 'text-emerald-500',
      text: 'text-emerald-600',
      label: 'Near bottom',
    };
  }, []);

  const scrollDepthColor = getScrollDepthColor(scrollProgress);

  const isNearTop =
    scrollProgress <=
    PROGRESS_PERCENTAGE.MAX - UI_TIMING_CONFIG.SCROLL_NEAR_BOTTOM_THRESHOLD;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isNearTop) {
          scrollToBottom();
        } else {
          scrollToTop();
        }
        return;
      }

      const scrollIncrement = () => {
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        return docHeight * COMPONENT_CONFIG.SCROLL_TO_TOP.INCREMENT_FACTOR;
      };

      const prefersReducedMotionValue = prefersReducedMotion;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollBy(0, -scrollIncrement());
          } else {
            window.scrollBy({ top: -scrollIncrement(), behavior: 'smooth' });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollBy(0, scrollIncrement());
          } else {
            window.scrollBy({ top: scrollIncrement(), behavior: 'smooth' });
          }
          break;
        case 'Home':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollTo(0, 0);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
        case 'End':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollTo(0, document.documentElement.scrollHeight);
          } else {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth',
            });
          }
          break;
      }
    },
    [scrollToTop, scrollToBottom, prefersReducedMotion, isNearTop]
  );

  if (!isVisible) return null;

  const circumference =
    2 * Math.PI * COMPONENT_DEFAULTS.SCROLL_TO_TOP.PROGRESS_RADIUS;
  const strokeDashoffset =
    circumference - (scrollProgress / PROGRESS_PERCENTAGE.MAX) * circumference;

  const showPercentage =
    scrollProgress >= UI_TIMING_CONFIG.SCROLL_PERCENTAGE_THRESHOLD;

  const tooltipContent = (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className={TYPOGRAPHY_CLASSES.MEDIUM}>
          {isNearTop
            ? SCROLL_TO_TOP_LABELS.TITLE_BOTTOM
            : SCROLL_TO_TOP_LABELS.TITLE}
        </span>
        <span className={`${TEXT_SIZE_CLASSES.XS} opacity-70 font-normal`}>
          &middot; {scrollDepthColor.label}
        </span>
      </div>
      <span
        className={`${TEXT_SIZE_CLASSES.XS} ${TEXT_COLORS.MUTED_LIGHT} opacity-80`}
      >
        <kbd
          className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
        >
          {SCROLL_TO_TOP_LABELS.KEYS.UP}
        </kbd>{' '}
        <kbd
          className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
        >
          {SCROLL_TO_TOP_LABELS.KEYS.DOWN}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.SCROLL_INSTRUCTION}
        <span className="mx-1">{SCROLL_TO_TOP_LABELS.SEPARATOR}</span>
        <kbd
          className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
        >
          {SCROLL_TO_TOP_LABELS.KEYS.HOME}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.TOP}
        <span className="mx-1">{SCROLL_TO_TOP_LABELS.SEPARATOR}</span>
        <kbd
          className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
        >
          {SCROLL_TO_TOP_LABELS.KEYS.END}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.BOTTOM}
      </span>
    </div>
  );

  return (
    <div className={`fixed bottom-8 right-8 z-[${Z_INDEX_LAYERS.TOAST}]`}>
      <Tooltip content={tooltipContent} position="top">
        <button
          onClick={isNearTop ? scrollToBottom : scrollToTop}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className={`
            group
            w-12 h-12
            flex items-center justify-center
            ${BG_COLORS.DEFAULT} ${TEXT_COLORS.SECONDARY}
            rounded-full ${SHADOW_CLASSES.LARGE}
            border ${BORDER_COLORS.LIGHT}
            ${TRANSITION_CLASSES.SLOW} ease-out
            hover:bg-gray-50 hover:text-primary-600 hover:${SHADOW_CLASSES.EXTRA_LARGE} hover:scale-110
            hover:border-primary-200
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2
            focus-visible:scale-110
            active:scale-95
            ${prefersReducedMotion ? '' : hasAppeared ? 'animate-scroll-to-top-bounce' : 'opacity-0'}
            ${className}
          `}
          aria-label={
            isNearTop
              ? SCROLL_TO_TOP_LABELS.ARIA_LABEL_BOTTOM(
                  Math.round(scrollProgress)
                )
              : SCROLL_TO_TOP_LABELS.ARIA_LABEL(Math.round(scrollProgress))
          }
          aria-live="polite"
          type="button"
        >
          {!prefersReducedMotion && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
              viewBox={SVG_VIEWBOX.LARGE}
              aria-hidden="true"
              role="progressbar"
              aria-valuenow={Math.round(scrollProgress)}
              aria-valuemin={PROGRESS_PERCENTAGE.MIN}
              aria-valuemax={PROGRESS_PERCENTAGE.MAX}
            >
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                className={TEXT_COLORS.MUTED_LIGHTER}
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                strokeLinecap="round"
                className={`${scrollDepthColor.stroke} transition-colors ${DURATION_TAILWIND[300]} ease-out`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
          )}

          {showPercentage && !prefersReducedMotion ? (
            <span
              className={`relative z-10 ${TEXT_SIZE_CLASSES.XS} font-semibold ${scrollDepthColor.text} tabular-nums leading-none transition-colors ${DURATION_TAILWIND[300]} ease-out`}
              aria-hidden="true"
            >
              {animatedPercentage}
            </span>
          ) : (
            <svg
              className={`
                relative z-10 w-5 h-5 transition-all ${DURATION_TAILWIND[200]}
                ${prefersReducedMotion ? '' : isNearTop ? 'group-hover:translate-y-0.5' : 'group-hover:-translate-y-0.5'}
              `}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              {isNearTop ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              )}
            </svg>
          )}

          <span className="sr-only">
            {isNearTop
              ? SCROLL_TO_TOP_LABELS.SR_TEXT_BOTTOM
              : SCROLL_TO_TOP_LABELS.SR_TEXT}
          </span>
        </button>
      </Tooltip>
    </div>
  );
}

ScrollToTopComponent.displayName = 'ScrollToTop';

export default memo(ScrollToTopComponent);
