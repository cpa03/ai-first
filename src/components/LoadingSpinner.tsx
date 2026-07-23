'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import {
  COMPONENT_CONFIG,
  UI_CONFIG,
  SPINNER_TAILWIND,
  TEXT_COLOR_CLASSES,
  TRANSITION_CLASSES,
  LOADING_SPINNER_RIPPLE,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
  /** Delay animation start by N ms for staggered multi-spinner effects */
  animationDelay?: number;
  /** Optional visible text label to display next to the spinner (e.g., "Loading dashboard...") */
  label?: string;
}

function LoadingSpinnerComponent({
  size = COMPONENT_CONFIG.SPINNER.DEFAULT_SIZE,
  className = '',
  ariaLabel = COMPONENT_CONFIG.LOADING.DEFAULT_ARIA_LABEL,
  animationDelay = 0,
  label,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [hasAppeared, setHasAppeared] = useState(false);

  // Micro-UX: Track when spinner first becomes visible for entrance animation
  // Creates a subtle fade-in + scale effect that makes the loading state feel more polished
  useEffect(() => {
    if (!prefersReducedMotion) {
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
    }
  }, [prefersReducedMotion]);

  // PERFORMANCE: Memoize spinner dimensions to prevent recalculation on every render
  // These values only change when the size prop changes
  const spinnerDimensions = useMemo(() => {
    const spinnerSize =
      COMPONENT_CONFIG.SPINNER.SIZES[
        size.toUpperCase() as keyof typeof COMPONENT_CONFIG.SPINNER.SIZES
      ];
    const dimension = spinnerSize.width;
    const pulseRing = dimension * 1.4;
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
      left: '50%',
      transform: 'translateX(-50%)',
      animationDelay: animationDelay > 0 ? `${animationDelay}ms` : undefined,
    }),
    [pulseRingSize, pulseRingOffset, animationDelay]
  );

  const borderRingStyle = useMemo(
    () => ({
      width: `${spinnerDimension + 8}px`,
      height: `${spinnerDimension + 8}px`,
      top: SPINNER_TAILWIND.BORDER_RING_OFFSET,
      left: '50%',
      transform: 'translateX(-50%)',
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
      <span className="sr-only">{ariaLabel}</span>
      {!prefersReducedMotion && (
        <div
          className={LOADING_SPINNER_RIPPLE}
          style={pulseRingStyle}
          aria-hidden="true"
        />
      )}

      {!prefersReducedMotion && (
        <div
          className="absolute rounded-full border border-primary-200/60"
          style={borderRingStyle}
          aria-hidden="true"
        />
      )}

      <svg
        className={`
          relative z-10 rounded-full
          ${prefersReducedMotion ? 'border-2 border-gray-400' : 'animate-spin border-2 border-gray-300 border-t-primary-600'}
        `}
        style={svgStyle}
        fill="none"
        viewBox={`0 0 ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE} ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="opacity-30"
          cx={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          cy={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          r={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2 - 2}
          stroke="currentColor"
          strokeWidth={COMPONENT_CONFIG.SPINNER.STROKE_WIDTH}
        />
        <path
          className={prefersReducedMotion ? 'opacity-100' : 'opacity-75'}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span
          className={`text-sm ${TEXT_COLOR_CLASSES.BODY} font-medium ${FADE_IN}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export default memo(LoadingSpinnerComponent);
