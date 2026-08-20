'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput } from '@/lib/dom-utils';
import { ROUTES } from '@/lib/config/routes';
import {
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ICON_SIZES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  GRAY_CLASSES,
  BG_COLORS,
} from '@/lib/config';

/**
 * Route-level error boundary for /results.
 *
 * Micro-UX: Localized error UI with recovery options. Users can retry or
 * navigate to the home page without losing the app shell.
 *
 * Keyboard shortcuts:
 * - Enter: Retry
 * - Escape: Go home
 */
export default function ResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleRetry = useCallback(() => {
    triggerHapticFeedback();
    reset();
  }, [reset]);

  const handleGoHome = useCallback(() => {
    triggerHapticFeedback();
    window.location.href = ROUTES.HOME;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;

      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleRetry();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleGoHome();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleRetry, handleGoHome]);

  return (
    <div className={`${PAGE_LAYOUT_CLASSES.CONTAINER_MD} py-16`}>
      <div className={`${CONTAINER_WIDTHS.SM} w-full mx-auto`}>
        <div className={`${CARD_PATTERNS.BASE} p-8 text-center`}>
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${BG_COLORS.LIGHT} mb-6`}
          >
            <svg
              className={`${ICON_SIZES.XL} ${GRAY_CLASSES.TEXT_400}`}
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className={`text-xl font-bold ${GRAY_CLASSES.TEXT_900} mb-2 focus:outline-none`}
          >
            Results unavailable
          </h1>

          <p className={`${GRAY_CLASSES.TEXT_600} mb-8 max-w-sm mx-auto`}>
            We couldn&apos;t load your results. Please try again or start a new
            idea.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={handleRetry}>
              <svg
                className={ICON_SIZES.SM}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                />
              </svg>
              Try again
            </Button>

            <Link href={ROUTES.HOME}>
              <Button variant="secondary" className="w-full sm:w-auto">
                <svg
                  className={ICON_SIZES.SM}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Start new idea
              </Button>
            </Link>
          </div>

          <div
            className={`mt-6 flex items-center justify-center gap-4 text-xs ${GRAY_CLASSES.TEXT_500}`}
            aria-hidden="true"
          >
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-sans font-medium text-gray-600">
                Enter
              </kbd>
              <span>retry</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-sans font-medium text-gray-600">
                Esc
              </kbd>
              <span>new idea</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
