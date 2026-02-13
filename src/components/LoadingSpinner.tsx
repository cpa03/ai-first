'use client';

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
  const spinnerSize =
    COMPONENT_CONFIG.SPINNER.SIZES[
      size.toUpperCase() as keyof typeof COMPONENT_CONFIG.SPINNER.SIZES
    ];

  return (
    <div
      className={`flex justify-center ${className}`}
      role={COMPONENT_CONFIG.ARIA.STATUS}
      aria-live={COMPONENT_CONFIG.ARIA.POLITE}
      aria-label={ariaLabel}
    >
      <svg
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`}
        style={{ width: spinnerSize.width, height: spinnerSize.height }}
        fill="none"
        viewBox={`0 0 ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE} ${COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          cy={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2}
          r={COMPONENT_CONFIG.SPINNER.VIEWBOX_SIZE / 2 - 2}
          stroke="currentColor"
          strokeWidth={COMPONENT_CONFIG.SPINNER.STROKE_WIDTH}
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}
