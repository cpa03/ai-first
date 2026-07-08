'use client';

import { useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ROUTES,
  SVG_STROKE_WIDTHS,
  UI_CONFIG,
} from '@/lib/config';

// Enhanced 404 page with keyboard shortcuts, focus management, and consistent component usage
export default function NotFound() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Micro-UX: Focus management - focus heading on mount for screen readers
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleGoBack = useCallback(() => {
    triggerHapticFeedback();
    if (window.history.length > 1) {
      router.back();
    } else {
      window.location.href = ROUTES.HOME;
    }
  }, [router]);

  // Micro-UX: Keyboard shortcuts for quick navigation
  // Enter = Go back, Escape = Go home (matches ErrorBoundary pattern)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (isInputFocused) return;

      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleGoBack();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        window.location.href = ROUTES.HOME;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack]);

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      {/* Micro-UX: Skip to content link for keyboard users */}
      <a
        href="#error-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md"
      >
        Skip to error content
      </a>

      <div className={`${CONTAINER_WIDTHS.XS} w-full`}>
        <div
          id="error-content"
          className={`${CARD_PATTERNS.CENTERED_LARGE} animate-hero-entrance`}
        >
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
              <span className="text-4xl font-bold text-gray-300 select-none">
                404
              </span>
            </div>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-bold text-gray-900 mb-2 animate-hero-entrance delay-75 focus:outline-none"
          >
            Page not found
          </h1>

          <p className="text-gray-600 mb-8 max-w-sm mx-auto animate-hero-entrance delay-150">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            may have been moved or doesn&apos;t exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-hero-entrance delay-200">
            <Button
              variant="primary"
              onClick={handleGoBack}
              className="inline-flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go back
            </Button>

            <Link href={ROUTES.HOME}>
              <Button
                variant="secondary"
                className="inline-flex items-center justify-center gap-2 w-full"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Go home
              </Button>
            </Link>

            <Link href={ROUTES.DASHBOARD}>
              <Button
                variant="outline"
                className="inline-flex items-center justify-center gap-2 w-full"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                Go to dashboard
              </Button>
            </Link>
          </div>

          {/* Micro-UX: Keyboard shortcut hints for discoverability */}
          <div
            className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400 animate-hero-entrance delay-300"
            aria-hidden="true"
          >
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                Enter
              </kbd>
              <span>go back</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                Esc
              </kbd>
              <span>go home</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
