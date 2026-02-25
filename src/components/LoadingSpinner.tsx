'use client';

import { memo, useMemo, useSyncExternalStore } from 'react';
import { COMPONENT_CONFIG } from '@/lib/config';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

const subscribeReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getReducedMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getReducedMotionServerSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

function LoadingSpinnerComponent({
  size = COMPONENT_CONFIG.SPINNER.DEFAULT_SIZE,
  className = '',
  ariaLabel = COMPONENT_CONFIG.LOADING.DEFAULT_ARIA_LABEL,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

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
    }),
    [pulseRingSize, pulseRingOffset]
  );

  const borderRingStyle = useMemo(
    () => ({
      width: `${spinnerDimension + 8}px`,
      height: `${spinnerDimension + 8}px`,
      top: '-4px',
      left: '50%',
      transform: 'translateX(-50%)',
      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }),
    [spinnerDimension]
  );

  const svgStyle = useMemo(
    () => ({
      width: `${spinnerSize.width}px`,
      height: `${spinnerSize.height}px`,
      animationDuration: prefersReducedMotion ? '0s' : '0.75s',
    }),
    [spinnerSize.width, spinnerSize.height, prefersReducedMotion]
  );

  return (
    <div
      className={`flex justify-center relative ${className}`}
      role={COMPONENT_CONFIG.ARIA.STATUS}
      aria-live={COMPONENT_CONFIG.ARIA.POLITE}
      aria-label={ariaLabel}
    >
      {!prefersReducedMotion && (
        <div
          className="absolute rounded-full bg-primary-100/50 animate-ping-slow"
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
    </div>
  );
}

export default memo(LoadingSpinnerComponent);
