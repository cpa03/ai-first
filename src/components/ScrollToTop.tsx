'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  COMPONENT_DEFAULTS,
  COMPONENT_CONFIG,
  SVG_STROKE_WIDTHS,
  Z_INDEX_LAYERS,
  SCROLL_TO_TOP_LABELS,
} from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Tooltip from './Tooltip';

interface ScrollToTopProps {
  showAt?: number;
  smooth?: boolean;
  className?: string;
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
    triggerHapticFeedback();
    if (prefersReducedMotion) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }

    // A11y Pattern: Restore keyboard focus to main content after scroll to top (Issue #942)
    // This prevents keyboard users from being "lost" at the bottom of the document
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [smooth, prefersReducedMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
        return;
      }

      const scrollIncrement = () => {
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        return docHeight * COMPONENT_CONFIG.SCROLL_TO_TOP.INCREMENT_FACTOR;
      };

      const prefersReducedMotionValue = prefersReducedMotion;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollBy(0, -scrollIncrement());
          } else {
            window.scrollBy({ top: -scrollIncrement(), behavior: 'smooth' });
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollBy(0, scrollIncrement());
          } else {
            window.scrollBy({ top: scrollIncrement(), behavior: 'smooth' });
          }
          break;
        case 'Home':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollTo(0, 0);
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
        case 'End':
          e.preventDefault();
          triggerHapticFeedback();
          if (prefersReducedMotionValue) {
            window.scrollTo(0, document.documentElement.scrollHeight);
          } else {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth',
            });
          }
          break;
      }
    },
    [scrollToTop, prefersReducedMotion]
  );

  if (!isVisible) return null;

  const circumference =
    2 * Math.PI * COMPONENT_DEFAULTS.SCROLL_TO_TOP.PROGRESS_RADIUS;
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference;

  // Micro-UX: Determine when to show percentage text vs arrow icon
  // Show percentage when scrolled past 10% for meaningful feedback
  const showPercentage = scrollProgress >= 10;

  const tooltipContent = (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium">{SCROLL_TO_TOP_LABELS.TITLE}</span>
      <span className="text-[10px] text-gray-300 opacity-80">
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">
          {SCROLL_TO_TOP_LABELS.KEYS.UP}
        </kbd>{' '}
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">
          {SCROLL_TO_TOP_LABELS.KEYS.DOWN}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.SCROLL_INSTRUCTION}
        <span className="mx-1">{SCROLL_TO_TOP_LABELS.SEPARATOR}</span>
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">
          {SCROLL_TO_TOP_LABELS.KEYS.HOME}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.TOP}
        <span className="mx-1">{SCROLL_TO_TOP_LABELS.SEPARATOR}</span>
        <kbd className="px-1 py-0.5 bg-gray-700 rounded text-[9px]">
          {SCROLL_TO_TOP_LABELS.KEYS.END}
        </kbd>{' '}
        {SCROLL_TO_TOP_LABELS.BOTTOM}
      </span>
    </div>
  );

  return (
    <div className={`fixed bottom-8 right-8 z-[${Z_INDEX_LAYERS.TOAST}]`}>
      <Tooltip content={tooltipContent} position="top">
        <button
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className={`
            group
            w-12 h-12
            flex items-center justify-center
            bg-white text-gray-700
            rounded-full shadow-lg
            border border-gray-200
            transition-all duration-300 ease-out
            hover:bg-gray-50 hover:text-primary-600 hover:shadow-xl hover:scale-110
            hover:border-primary-200
            focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2
            focus-visible:scale-110
            active:scale-95
            ${prefersReducedMotion ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-300'}
            ${className}
          `}
          aria-label={SCROLL_TO_TOP_LABELS.ARIA_LABEL(
            Math.round(scrollProgress)
          )}
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
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                className="text-gray-100"
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                strokeLinecap="round"
                className="text-primary-500 transition-all duration-150 ease-out"
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
          )}

          {/* Micro-UX: Show scroll percentage inside the button for at-a-glance feedback */}
          {showPercentage && !prefersReducedMotion ? (
            <span
              className="relative z-10 text-[10px] font-semibold text-primary-600 tabular-nums leading-none group-hover:text-primary-700 transition-colors duration-200"
              aria-hidden="true"
            >
              {Math.round(scrollProgress)}
            </span>
          ) : (
            <svg
              className={`
                relative z-10 w-5 h-5 transition-transform duration-200
                ${prefersReducedMotion ? '' : 'group-hover:-translate-y-0.5'}
              `}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          )}

          <span className="sr-only">{SCROLL_TO_TOP_LABELS.SR_TEXT}</span>
        </button>
      </Tooltip>
    </div>
  );
}

ScrollToTopComponent.displayName = 'ScrollToTop';

export default memo(ScrollToTopComponent);
