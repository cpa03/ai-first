'use client';

import { memo, useState, useEffect, useRef } from 'react';
import {
  DURATION_TAILWIND,
  SVG_SIZES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  TEXT_COLORS,
} from '@/lib/config';
import { FADE_IN } from '@/lib/config/animation-classes';
import { ANIMATION_DELAYS } from '@/lib/config/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CapsLockWarningProps {
  /** Whether Caps Lock is currently on */
  isOn: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CapsLockWarning - Subtle warning indicator for password fields
 *
 * Shows a small, non-intrusive warning when Caps Lock is enabled,
 * helping users avoid frustrating login/signup errors.
 *
 * Features:
 * - Smooth fade-in/fade-out animation
 * - Respects prefers-reduced-motion
 * - Accessible with proper ARIA attributes
 * - Compact design that doesn't disrupt form layout
 */
function CapsLockWarningComponent({
  isOn,
  className = '',
}: CapsLockWarningProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [shouldRender, setShouldRender] = useState(isOn);
  const [isExiting, setIsExiting] = useState(false);
  const [pulseOnce, setPulseOnce] = useState(false);
  const prevIsOnRef = useRef(isOn);

  useEffect(() => {
    if (isOn && !prevIsOnRef.current) {
      setShouldRender(true);
      setIsExiting(false);
      // Micro-UX: Pulse icon once when warning first appears for visual attention
      if (!prefersReducedMotion) {
        setPulseOnce(true);
        const timer = setTimeout(
          () => setPulseOnce(false),
          ANIMATION_DELAYS.RIPPLE
        );
        return () => clearTimeout(timer);
      }
    }
    prevIsOnRef.current = isOn;
  }, [isOn, prefersReducedMotion]);

  useEffect(() => {
    if (!isOn && prevIsOnRef.current) {
      setIsExiting(true);
      // Allow the exit animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, ANIMATION_DELAYS.LONG);
      return () => clearTimeout(timer);
    }
  }, [isOn]);

  if (!shouldRender) return null;

  return (
    <div
      className={`flex items-center gap-1.5 ${TEXT_COLORS.WARNING_LIGHT} text-xs font-medium transition-all ${DURATION_TAILWIND[200]} ease-out ${
        prefersReducedMotion ? '' : isExiting ? 'opacity-0 scale-95' : FADE_IN
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className={`${SVG_SIZES.SMD} flex-shrink-0 ${pulseOnce ? 'animate-pulse-once' : ''}`}
        fill="none"
        viewBox={SVG_VIEWBOX.STANDARD}
        stroke="currentColor"
        strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      <span>Caps Lock is on</span>
    </div>
  );
}

CapsLockWarningComponent.displayName = 'CapsLockWarning';

export const CapsLockWarning = memo(CapsLockWarningComponent);
