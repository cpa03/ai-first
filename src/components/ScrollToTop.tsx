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

  const animatedPercentage = useAnimatedCounter(Math.round(scrollProgress), {
    duration: UI_DURATIONS.ANIMATED_COUNTER,
  });

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress =
      docHeight > 0
        ? (scrollTop / docHeight) * PROGRESS_PERCENTAGE.MAX
        : PROGRESS_PERCENTAGE.MIN;
    setScrollProgress(Math.min(progress, PROGRESS_PERCENTAGE.MAX));
  }, []);

  const toggleVisibility = useCallback(() => {
    const shouldShow = window.scrollY > showAt;

    if (shouldShow && !isVisible) {
      setIsVisible(true);
      setHasAppeared(false);
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
    } else if (!shouldShow) {
      setIsVisible(false);
      setHasAppeared(false);
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(calculateScrollProgress);
  }, [showAt, calculateScrollProgress, isVisible]);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [toggleVisibility]);

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

  const isNearBottom = scrollProgress >= 85;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isNearBottom) {
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
    [scrollToTop, scrollToBottom, prefersReducedMotion, isNearBottom]
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
      <span className={TYPOGRAPHY_CLASSES.BOLD}>
        {isNearBottom
          ? SCROLL_TO_TOP_LABELS.TITLE_BOTTOM
          : SCROLL_TO_TOP_LABELS.TITLE}
      </span>
      <span className={`${TEXT_SIZE_CLASSES.XS} text-gray-300 opacity-80`}>
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
          onClick={isNearBottom ? scrollToBottom : scrollToTop}
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
            isNearBottom
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
                className="text-gray-100"
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                strokeLinecap="round"
                className={`text-primary-500 transition-all ${DURATION_TAILWIND[150]} ease-out`}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
          )}

          {showPercentage && !prefersReducedMotion ? (
            <span
              className={`relative z-10 ${TEXT_SIZE_CLASSES.XS} font-semibold text-primary-600 tabular-nums leading-none group-hover:text-primary-700 transition-colors ${DURATION_TAILWIND[200]}`}
              aria-hidden="true"
            >
              {animatedPercentage}
            </span>
          ) : (
            <svg
              className={`
                relative z-10 w-5 h-5 transition-all ${DURATION_TAILWIND[200]}
                ${prefersReducedMotion ? '' : isNearBottom ? 'group-hover:translate-y-0.5' : 'group-hover:-translate-y-0.5'}
              `}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              {isNearBottom ? (
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
            {isNearBottom
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
