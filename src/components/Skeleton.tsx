'use client';

import { memo, useState, useEffect } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SKELETON_PATTERNS } from '@/lib/config';
import { TRANSITION_CLASSES } from '@/lib/config/theme';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  /**
   * Micro-UX: Delay before showing the skeleton (in ms).
   * Prevents visual flickering for fast-loading operations (< 300ms).
   * If the content loads before this delay, no skeleton is shown at all.
   * Matches the showDelay pattern established in LoadingSpinner.
   * @default 0
   */
  showDelay?: number;
}

// PERFORMANCE: Memoize Skeleton to prevent unnecessary re-renders
// Skeleton is a pure presentational component used frequently in loading states
function SkeletonComponent({
  className = '',
  variant = 'rect',
  showDelay = 0,
}: SkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [shouldShow, setShouldShow] = useState(showDelay === 0);
  const [hasAppeared, setHasAppeared] = useState(false);

  useEffect(() => {
    if (showDelay <= 0) return;

    const timer = setTimeout(() => {
      setShouldShow(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [showDelay]);

  useEffect(() => {
    if (shouldShow && !prefersReducedMotion) {
      requestAnimationFrame(() => {
        setHasAppeared(true);
      });
    }
  }, [shouldShow, prefersReducedMotion]);

  if (!shouldShow) return null;

  const baseClasses = prefersReducedMotion
    ? SKELETON_PATTERNS.BASE_REDUCED_MOTION
    : SKELETON_PATTERNS.BASE_ANIMATED;

  const variantClasses = {
    rect: SKELETON_PATTERNS.RECT,
    circle: SKELETON_PATTERNS.CIRCLE,
    text: SKELETON_PATTERNS.TEXT,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        !prefersReducedMotion && !hasAppeared
          ? 'opacity-0'
          : `opacity-100 ${TRANSITION_CLASSES.SLOW_EASE_OUT}`
      }`}
      aria-hidden="true"
    />
  );
}

SkeletonComponent.displayName = 'Skeleton';

export default memo(SkeletonComponent);
