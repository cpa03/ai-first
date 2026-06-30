'use client';

import { memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SKELETON_PATTERNS } from '@/lib/config';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

// PERFORMANCE: Memoize Skeleton to prevent unnecessary re-renders
// Skeleton is a pure presentational component used frequently in loading states
function SkeletonComponent({
  className = '',
  variant = 'rect',
}: SkeletonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

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
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

SkeletonComponent.displayName = 'Skeleton';

export default memo(SkeletonComponent);
