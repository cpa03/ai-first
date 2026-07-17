'use client';

import { memo, useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  COMPONENT_CONFIG,
  SVG_STROKE_WIDTHS,
  SVG_ANIMATION,
  SVG_VIEWBOX,
  IDEA_READY_INDICATOR_LABELS,
  TRANSITION_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
} from '@/lib/config';

interface IdeaReadyIndicatorProps {
  isReady: boolean;
  className?: string;
}

function IdeaReadyIndicatorComponent({
  isReady,
  className = '',
}: IdeaReadyIndicatorProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isReady && !hasAnimated) {
      // Small delay to make the animation feel more deliberate
      const timer = setTimeout(() => {
        setShowCheckmark(true);
        setHasAnimated(true);
      }, COMPONENT_CONFIG.IDEA_READY_INDICATOR.DELAY_MS);
      return () => clearTimeout(timer);
    } else if (!isReady) {
      setShowCheckmark(false);
      setHasAnimated(false);
    }
  }, [isReady, hasAnimated]);

  if (!isReady && !showCheckmark) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${TRANSITION_CLASSES.SLOW} ${
        isReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`
          relative flex items-center justify-center w-5 h-5 rounded-full
          ${TRANSITION_CLASSES.SLOW_EASE_OUT}
          ${isReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}
        `}
      >
        {/* Checkmark SVG with draw animation */}
        <svg
          className={`
            w-3 h-3 ${TRANSITION_CLASSES.SLOW}
            ${showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
          `}
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
            className={`
              ${prefersReducedMotion ? '' : 'animate-draw-check'}
              ${showCheckmark ? 'stroke-dashoffset-0' : 'stroke-dashoffset-24'}
            `}
            style={{
              strokeDasharray: SVG_ANIMATION.DASH_ARRAY.FULL,
              strokeDashoffset: showCheckmark
                ? SVG_ANIMATION.DASH_OFFSET.VISIBLE
                : SVG_ANIMATION.DASH_OFFSET.FULL,
              transition: prefersReducedMotion
                ? 'none'
                : 'stroke-dashoffset 0.4s ease-out 0.1s',
            }}
          />
        </svg>

        {/* Subtle pulse ring on ready */}
        {isReady && !prefersReducedMotion && (
          <div
            className={`absolute inset-0 rounded-full ${BG_COLORS.SUCCESS_LIGHTER} animate-ping-once opacity-30`}
            aria-hidden="true"
          />
        )}
      </div>
      <span
        className={`
          text-xs font-medium ${TRANSITION_CLASSES.COLOR_SLOW}
          ${isReady ? TEXT_COLORS.SUCCESS_DARK : TEXT_COLORS.MUTED}
        `}
      >
        {isReady
          ? IDEA_READY_INDICATOR_LABELS.READY_TEXT
          : IDEA_READY_INDICATOR_LABELS.WRITING_TEXT}
      </span>
    </div>
  );
}

IdeaReadyIndicatorComponent.displayName = 'IdeaReadyIndicator';

export default memo(IdeaReadyIndicatorComponent);
