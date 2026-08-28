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
  SCROLL_DEPTH_THRESHOLDS,
  TYPOGRAPHY_CLASSES,
  COMPONENT_STATE_COLORS,
  GRAY_CLASSES,
  ICON_SIZES,
  PAGE_ELEMENT_IDS,
  COMMON_SPACING_PATTERNS,
  COORDINATE_POSITION_PATTERNS,
  SUCCESS_POP,
  SCROLL_TO_TOP_BOUNCE,
} from '@/lib/config';
import type { ComponentConfig } from '@/lib/config/components';
import { FOCUS_RING_OFFSET_PATTERNS } from '@/lib/config/focus-ring-offsets';
import { MX_CLASSES } from '@/lib/config/spacing';
import { triggerHapticFeedback } from '@/lib/utils';
import { PLATFORM } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import Tooltip from './Tooltip';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';
import { COMPONENT_PRIMARY_PATTERNS } from '@/lib/config/primary-colors';

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
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showReachedEndCelebration, setShowReachedEndCelebration] =
    useState(false);
  const [isMac, setIsMac] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);
  const prevHasReachedEndRef = useRef(false);

  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

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
      const clampedProgress = Math.min(progress, PROGRESS_PERCENTAGE.MAX);
      setScrollProgress(clampedProgress);

      const reachedEnd = clampedProgress >= SCROLL_DEPTH_THRESHOLDS.REACHED_END;
      if (reachedEnd && !prevHasReachedEndRef.current) {
        setHasReachedEnd(true);
        setShowReachedEndCelebration(true);
        triggerHapticFeedback();
        setTimeout(
          () => setShowReachedEndCelebration(false),
          (COMPONENT_CONFIG as ComponentConfig).SCROLL_TO_TOP
            .CELEBRATION_DURATION_MS
        );
      } else if (!reachedEnd) {
        setHasReachedEnd(false);
      }
      prevHasReachedEndRef.current = reachedEnd;

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

    const mainContent = document.getElementById(PAGE_ELEMENT_IDS.MAIN_CONTENT);
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
  const getScrollDepthColor = useCallback(
    (progress: number, reachedEnd: boolean) => {
      if (reachedEnd) {
        return {
          stroke: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.REACHED_END_STROKE,
          text: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.REACHED_END_TEXT,
          label: SCROLL_TO_TOP_LABELS.SCROLL_DEPTH_LABELS.REACHED_END,
        };
      }
      if (progress <= SCROLL_DEPTH_THRESHOLDS.NEAR_TOP) {
        return {
          stroke: TEXT_COLORS.MUTED,
          text: TEXT_COLORS.MUTED,
          label: SCROLL_TO_TOP_LABELS.SCROLL_DEPTH_LABELS.NEAR_TOP,
        };
      }
      if (progress <= SCROLL_DEPTH_THRESHOLDS.MIDDLE) {
        return {
          stroke: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.MIDDLE_STROKE,
          text: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.MIDDLE_TEXT,
          label: SCROLL_TO_TOP_LABELS.SCROLL_DEPTH_LABELS.MIDDLE,
        };
      }
      return {
        stroke: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.NEAR_BOTTOM_STROKE,
        text: COMPONENT_STATE_COLORS.SCROLL_PROGRESS.NEAR_BOTTOM_TEXT,
        label: SCROLL_TO_TOP_LABELS.SCROLL_DEPTH_LABELS.NEAR_BOTTOM,
      };
    },
    []
  );

  const scrollDepthColor = getScrollDepthColor(scrollProgress, hasReachedEnd);

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
    <div className={COMMON_SPACING_PATTERNS.FLEX_COL_SM}>
      <div className={COMMON_SPACING_PATTERNS.FLEX_CENTER_SM}>
        <span className={TYPOGRAPHY_CLASSES.MEDIUM}>
          {hasReachedEnd
            ? SCROLL_TO_TOP_LABELS.TITLE_REACHED_END
            : isNearTop
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
        {hasReachedEnd ? (
          <span>Press to scroll back to top</span>
        ) : (
          <>
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
            <span className={MX_CLASSES.SM}>
              {SCROLL_TO_TOP_LABELS.SEPARATOR}
            </span>
            <kbd
              className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
            >
              {isMac ? '⌘' : SCROLL_TO_TOP_LABELS.KEYS.HOME}
            </kbd>{' '}
            {isMac ? '↑' : SCROLL_TO_TOP_LABELS.TOP}
            <span className={MX_CLASSES.SM}>
              {SCROLL_TO_TOP_LABELS.SEPARATOR}
            </span>
            <kbd
              className={`px-1 py-0.5 ${BG_COLORS.DARK} rounded ${TEXT_SIZE_PRESETS.KBD}`}
            >
              {isMac ? '⌘' : SCROLL_TO_TOP_LABELS.KEYS.END}
            </kbd>{' '}
            {isMac ? '↓' : SCROLL_TO_TOP_LABELS.BOTTOM}
          </>
        )}
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
            ${ICON_SIZES.XXXXL}
            flex items-center justify-center
            ${BG_COLORS.DEFAULT} ${TEXT_COLORS.SECONDARY}
            rounded-full ${SHADOW_CLASSES.LARGE}
            border ${BORDER_COLORS.LIGHT}
            ${TRANSITION_CLASSES.SLOW} ease-out
            ${GRAY_CLASSES.HOVER_BG_50} ${COMPONENT_PRIMARY_PATTERNS.SCROLL_TO_TOP_HOVER} hover:${SHADOW_CLASSES.EXTRA_LARGE} hover:scale-110
            ${COMPONENT_PRIMARY_PATTERNS.SCROLL_TO_TOP_BORDER_HOVER}
            ${FOCUS_RING_OFFSET_PATTERNS.LARGE}
            focus-visible:scale-110
            active:scale-95
            ${prefersReducedMotion ? '' : hasAppeared ? SCROLL_TO_TOP_BOUNCE : 'opacity-0'}
            ${className}
          `}
          aria-label={
            hasReachedEnd
              ? SCROLL_TO_TOP_LABELS.ARIA_LABEL_REACHED_END
              : isNearTop
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
              className={`${COORDINATE_POSITION_PATTERNS.INSET} w-full h-full -rotate-90 pointer-events-none`}
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

          {hasReachedEnd && !prefersReducedMotion ? (
            <svg
              className={`relative z-10 ${ICON_SIZES.LG} ${scrollDepthColor.stroke} ${showReachedEndCelebration ? SUCCESS_POP : ''}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.THICK}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : showPercentage && !prefersReducedMotion ? (
            <span
              className={`relative z-10 ${TEXT_SIZE_CLASSES.XS} font-semibold ${scrollDepthColor.text} tabular-nums leading-none transition-colors ${DURATION_TAILWIND[300]} ease-out`}
              aria-hidden="true"
            >
              {animatedPercentage}
            </span>
          ) : (
            <svg
              className={`
                relative z-10 ${ICON_SIZES.LG} transition-all ${DURATION_TAILWIND[200]}
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

          <span className={SR_ONLY}>
            {hasReachedEnd
              ? SCROLL_TO_TOP_LABELS.SR_TEXT_REACHED_END
              : isNearTop
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
