'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
  memo,
} from 'react';
import { COMPONENT_DEFAULTS } from '@/lib/config';

interface ScrollToTopProps {
  showAt?: number;
  smooth?: boolean;
  className?: string;
}

const subscribeToReducedMotionMediaQuery = (callback: () => void) => {
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
    subscribeToReducedMotionMediaQuery,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
}

// PERFORMANCE: Memoize ScrollToTop to prevent re-renders when parent components update
// This component only needs to re-render when its own state changes
function ScrollToTopComponent({
  showAt = COMPONENT_DEFAULTS.SCROLL_TO_TOP.SHOW_AT_PX,
  smooth = COMPONENT_DEFAULTS.SCROLL_TO_TOP.SMOOTH,
  className = '',
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rafRef = useRef<number | null>(null);

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollProgress(Math.min(progress, 100));
  }, []);

  const toggleVisibility = useCallback(() => {
    if (window.scrollY > showAt) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(calculateScrollProgress);
  }, [showAt, calculateScrollProgress]);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [toggleVisibility]);

  const scrollToTop = useCallback(() => {
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [smooth, prefersReducedMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    },
    [scrollToTop]
  );

  if (!isVisible) return null;

  const circumference =
    2 * Math.PI * COMPONENT_DEFAULTS.SCROLL_TO_TOP.PROGRESS_RADIUS;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      onKeyDown={handleKeyDown}
      className={`
        group
        fixed bottom-8 right-8 z-50
        w-12 h-12
        flex items-center justify-center
        bg-white text-gray-700
        rounded-full shadow-lg
        border border-gray-200
        transition-all duration-300 ease-out
        hover:bg-gray-50 hover:text-primary-600 hover:shadow-xl hover:scale-110
        hover:border-primary-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        active:scale-95
        ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-300'}
        ${className}
      `}
      aria-label={`Scroll to top of page (${Math.round(scrollProgress)}% scrolled)`}
      aria-live="polite"
      type="button"
    >
      {!prefersReducedMotion && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          viewBox="0 0 48 48"
          aria-hidden="true"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-100"
          />
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-primary-500 transition-all duration-150 ease-out"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
      )}

      <svg
        className={`
          relative z-10 w-5 h-5 transition-transform duration-200
          ${prefersReducedMotion ? '' : 'group-hover:-translate-y-0.5'}
        `}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>

      <span className="sr-only">Back to top</span>
    </button>
  );
}

ScrollToTopComponent.displayName = 'ScrollToTop';

export default memo(ScrollToTopComponent);
