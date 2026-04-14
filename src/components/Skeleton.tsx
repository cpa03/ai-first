'use client';

import React, { memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

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
    ? 'bg-gray-200'
    : 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';

  const variantClasses = {
    rect: '',
    circle: 'rounded-full',
    text: 'h-4 rounded',
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
