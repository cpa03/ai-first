'use client';

import Link from 'next/link';
import {
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ROUTES,
  SVG_STROKE_WIDTHS,
} from '@/lib/config';

/**
 * Custom 404 Not Found page
 *
 * Provides a branded, helpful experience when users navigate to
 * a non-existent URL. Includes clear navigation back to known routes
 * instead of the generic Next.js default 404 page.
 */
export default function NotFound() {
  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      <div className={`${CONTAINER_WIDTHS.XS} w-full`}>
        <div
          className={`${CARD_PATTERNS.CENTERED_LARGE} animate-hero-entrance`}
        >
          {/* Animated 404 number with visual flair */}
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
              <span className="text-4xl font-bold text-gray-300 select-none">
                404
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 animate-hero-entrance delay-75">
            Page not found
          </h1>

          <p className="text-gray-600 mb-8 max-w-sm mx-auto animate-hero-entrance delay-150">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            may have been moved or doesn&apos;t exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-hero-entrance delay-200">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
            </Link>

            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
