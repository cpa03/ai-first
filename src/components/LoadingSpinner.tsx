'use client';

import { useEffect, useState } from 'react';
import { COMPONENT_CONFIG } from '@/lib/config';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export default function LoadingSpinner({
  size = COMPONENT_CONFIG.SPINNER.DEFAULT_SIZE,
  className = '',
  ariaLabel = COMPONENT_CONFIG.LOADING.DEFAULT_ARIA_LABEL,
}: LoadingSpinnerProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const spinnerSize =
    COMPONENT_CONFIG.SPINNER.SIZES[
      size.toUpperCase() as keyof typeof COMPONENT_CONFIG.SPINNER.SIZES
    ];

  const spinnerDimension = spinnerSize.width;
  const pulseRingSize = spinnerDimension * 1.4;
  const pulseRingOffset = (pulseRingSize - spinnerDimension) / 2;

  return (
    <div
      className={`flex justify-center relative ${className}`}
      role={COMPONENT_CONFIG.ARIA.STATUS}
      aria-live={COMPONENT_CONFIG.ARIA.POLITE}
      aria-label={ariaLabel}
    >
      {!prefersReducedMotion && (
        <div
          className="absolute rounded-full bg-primary-100/50"
          style={{
            width: `${pulseRingSize}px`,
            height: `${pulseRingSize}px`,
            top: `-${pulseRingOffset}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
          aria-hidden="true"
        />
      )}

      {!prefersReducedMotion && (
        <div
          className="absolute rounded-full border border-primary-200/60"
          style={{
            width: `${spinnerDimension + 8}px`,
            height: `${spinnerDimension + 8}px`,
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
          aria-hidden="true"
        />
      )}

      <svg
        className={`
          relative z-10 rounded-full
          ${prefersReducedMotion ? 'border-2 border-gray-400' : 'animate-spin border-2 border-gray-300 border-t-primary-600'}
        `}
        style={{
          width: `${spinnerSize.width}px`,
          height: `${spinnerSize.height}px`,
          animationDuration: prefersReducedMotion ? '0s' : '0.75s',
        }}
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

      <style jsx>{`
        @keyframes ping-slow {
          75%,
          100% {
            transform: translateX(-50%) scale(1.4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
