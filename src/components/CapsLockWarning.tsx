'use client';

import { memo, useSyncExternalStore } from 'react';
import { SVG_STROKE_WIDTHS } from '@/lib/config';

interface CapsLockWarningProps {
  /** Whether Caps Lock is currently on */
  isOn: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

const subscribeToReducedMotion = (callback: () => void) => {
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
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
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

  if (!isOn) return null;

  return (
    <div
      className={`flex items-center gap-1.5 text-amber-600 text-xs font-medium transition-all duration-200 ease-out ${
        prefersReducedMotion ? '' : 'animate-fade-in'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
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
