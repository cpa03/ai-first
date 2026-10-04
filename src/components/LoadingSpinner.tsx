'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import {
  COMPONENT_CONFIG,
  UI_CONFIG,
  SPINNER_TAILWIND,
  TEXT_COLOR_CLASSES,
  TRANSITION_CLASSES,
  LOADING_SPINNER_RIPPLE,
  COMPONENT_MAGIC_NUMBERS,
  BORDER_COLORS,
  REMAINING_PATTERNS,
  CSS_POSITIONING,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { LOADING_SPINNER_ELAPSED_TEXT } from '@/lib/config/remaining-hardcoded-patterns';
import { SR_ONLY } from '@/lib/config/remaining-hardcoded-patterns';
import { LOADING_SPINNER_LABELS } from '@/lib/config/component-labels';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  animationDelay?: number;
  label?: string;
  showDelay?: number;
  showElapsedTime?: boolean;
}

function LoadingSpinnerComponent({
  size = COMPONENT_CONFIG.SPINNER.DEFAULT_SIZE,
  className = '',
  ariaLabel = COMPONENT_CONFIG.LOADING.DEFAULT_ARIA_LABEL,
  animationDelay = 0,
  label,
  showDelay = 0,
  showElapsedTime = false,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hasAppeared, setHasAppeared] = useState(false);
  const [shouldShow, setShouldShow] = useState(showDelay === 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Micro-UX: Track when spinner first becomes visible for entrance animation
  useEffect(() => {
    if (!prefersReducedMotion) {
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
    }
  }, [prefersReducedMotion]);

  // Micro-UX: Delay showing spinner to prevent visual flickering for fast operations
  useEffect(() => {
    if (showDelay <= 0) return;

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay]);

  // Micro-UX: Elapsed time counter — appears after threshold, updates every second
  // Reduces user anxiety during long operations by showing "Still loading (Xs)"
  useEffect(() => {
    if (!showElapsedTime || !shouldShow) return;

    const thresholdId = setTimeout(() => {
      setElapsedSeconds(1);

      const intervalId = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, COMPONENT_CONFIG.SPINNER.ELAPSED_TIME_INTERVAL_MS);

      return () => clearInterval(intervalId);
    }, COMPONENT_CONFIG.SPINNER.ELAPSED_TIME_THRESHOLD_MS);

    return () => clearTimeout(thresholdId);
  }, [showElapsedTime, shouldShow]);

  // PERFORMANCE: Memoize spinner dimensions to prevent recalculation on every render
  // These values only change when the size prop changes
  const spinnerDimensions = useMemo(() => {
    const spinnerSize =
      COMPONENT_CONFIG.SPINNER.SIZES[
        size.toUpperCase() as keyof typeof COMPONENT_CONFIG.SPINNER.SIZES
      ];
    const dimension = spinnerSize.width;
    const pulseRing =
      dimension * COMPONENT_MAGIC_NUMBERS.SPINNER.PULSE_RING_MULTIPLIER;
    const pulseRingOffset = (pulseRing - dimension) / 2;

    return { spinnerSize, dimension, pulseRing, pulseRingOffset };
  }, [size]);

  const {
    spinnerSize,
    dimension: spinnerDimension,
    pulseRing: pulseRingSize,
    pulseRingOffset,
  } = spinnerDimensions;

  // PERFORMANCE: Memoize style objects to prevent object recreation on each render
  const pulseRingStyle = useMemo(
    () => ({
      width: `${pulseRingSize}px`,
      height: `${pulseRingSize}px`,
      top: `-${pulseRingOffset}px`,
      ...CSS_POSITIONING.CENTER_HORIZONTAL,
      animationDelay: animationDelay > 0 ? `${animationDelay}ms` : undefined,
    }),
    [pulseRingSize, pulseRingOffset, animationDelay]
  );

  const borderRingStyle = useMemo(
    () => ({
      width: `${spinnerDimension + COMPONENT_MAGIC_NUMBERS.SPINNER.PADDING}px`,
      height: `${spinnerDimension + COMPONENT_MAGIC_NUMBERS.SPINNER.PADDING}px`,
      top: SPINNER_TAILWIND.BORDER_RING_OFFSET,
      ...CSS_POSITIONING.CENTER_HORIZONTAL,
      animation: `pulse ${COMPONENT_CONFIG.SPINNER.ANIMATION_MS}ms ${UI_CONFIG.ANIMATION.EASING.SPINNER} infinite`,
      animationDelay: animationDelay > 0 ? `${animationDelay}ms` : undefined,
    }),
    [spinnerDimension, animationDelay]
  );

  const svgStyle = useMemo(
    () => ({
      width: `${spinnerSize.width}px`,
      height: `${spinnerSize.height}px`,
      animationDuration: prefersReducedMotion
        ? '0s'
        : `${COMPONENT_CONFIG.SPINNER.ANIMATION_MS}ms`,
      animationDelay: animationDelay > 0 ? `${animationDelay}ms` : undefined,
    }),
    [
      spinnerSize.width,
      spinnerSize.height,
      prefersReducedMotion,
      animationDelay,
    ]
  );

  // Don't render anything until showDelay has elapsed (prevents visual flickering)
  if (!shouldShow) return null;

  return (
    <div
      className={`flex justify-center items-center gap-2.5 ${className} ${
        !prefersReducedMotion && !hasAppeared
          ? 'opacity-0 scale-90'
          : `opacity-100 scale-100 ${TRANSITION_CLASSES.SLOW_EASE_OUT}`
      }`}
      role={COMPONENT_CONFIG.ARIA.STATUS}
      aria-live={COMPONENT_CONFIG.ARIA.POLITE}
      aria-label={ariaLabel}
    >
      <span className={SR_ONLY}>{ariaLabel}</span>
      {!prefersReducedMotion && (
        <div
          className={LOADING_SPINNER_RIPPLE}
          style={pulseRingStyle}
          aria-hidden="true"
        />
      )}

      {!prefersReducedMotion && (
        <div
          className={REMAINING_PATTERNS.SPINNER_BORDER_RING}
          style={borderRingStyle}
          aria-hidden="true"
        />
      )}

      <svg
        className={`
          ${REMAINING_PATTERNS.SPINNER_SVG_CONTAINER}
          ${prefersReducedMotion ? `border-2 ${BORDER_COLORS.DEFAULT}` : `animate-spin border-2 ${BORDER_COLORS.LIGHT} border-t-primary-600`}
        `}
        style={svgStyle}
        fill="none"
        viewBox={`0 0 ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE} ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className={REMAINING_PATTERNS.SPINNER_CIRCLE_OPACITY}
          cx={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          cy={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          r={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2 - 2}
          stroke="currentColor"
          strokeWidth={COMPONENT_CONFIG.SPINNER.STROKE_WIDTH}
        />
        <path
          className={
            prefersReducedMotion
              ? REMAINING_PATTERNS.SPINNER_PATH_REDUCED_MOTION
              : REMAINING_PATTERNS.SPINNER_PATH_NORMAL_MOTION
          }
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span
          className={`text-sm ${TEXT_COLOR_CLASSES.BODY} font-medium ${FADE_IN}`}
          aria-hidden={ariaLabel === label ? 'true' : undefined}
        >
          {label}
        </span>
      )}
      {showElapsedTime && elapsedSeconds > 0 && (
        <span
          className={`${LOADING_SPINNER_ELAPSED_TEXT} ${FADE_IN}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {LOADING_SPINNER_LABELS.ELAPSED_TIME_FORMAT(
            COMPONENT_CONFIG.SPINNER.ELAPSED_TIME_LABEL,
            elapsedSeconds
          )}
        </span>
      )}
    </div>
  );
}

export default memo(LoadingSpinnerComponent);
