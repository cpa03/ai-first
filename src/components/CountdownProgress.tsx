'use client';

import React, { memo } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { TEXT_COLORS, TYPOGRAPHY_CLASSES } from '@/lib/config';

interface CountdownProgressProps {
  /** Current seconds remaining */
  seconds: number;
  /** Total seconds for the countdown (used to calculate percentage) */
  totalSeconds: number;
  /** Whether the countdown is paused */
  isPaused?: boolean;
  /** Optional size variant */
  size?: 'sm' | 'md';
}

/**
 * Micro-UX: Visual countdown progress indicator
 * Shows a circular progress ring that depletes as time passes,
 * providing delightful visual feedback for cooldown timers.
 */
function CountdownProgressComponent({
  seconds,
  totalSeconds,
  isPaused = false,
  size = 'md',
}: CountdownProgressProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Calculate progress percentage (0-100)
  const progress = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;

  // SVG circle calculations
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const strokeWidth = size === 'sm' ? 2 : 2.5;
  const radius = size === 'sm' ? 14 : 17;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${sizeClasses}`}
      role="timer"
      aria-live="polite"
      aria-label={`${seconds} seconds remaining`}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${size === 'sm' ? 32 : 40} ${size === 'sm' ? 32 : 40}`}
        aria-hidden="true"
      >
        <circle
          cx={size === 'sm' ? 16 : 20}
          cy={size === 'sm' ? 16 : 20}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size === 'sm' ? 16 : 20}
          cy={size === 'sm' ? 16 : 20}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${isPaused ? 'text-gray-400' : 'text-indigo-500'} ${prefersReducedMotion ? '' : 'transition-all duration-1000 ease-linear'}`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Seconds display */}
      <span
        className={`${TYPOGRAPHY_CLASSES.XS_MEDIUM} tabular-nums ${isPaused ? TEXT_COLORS.MUTED : TEXT_COLORS.SECONDARY} ${prefersReducedMotion ? '' : 'transition-colors duration-200'}`}
      >
        {seconds}s
      </span>
    </div>
  );
}

export const CountdownProgress = memo(CountdownProgressComponent);
