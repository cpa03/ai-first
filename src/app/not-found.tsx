'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import StatusAnnouncer from '@/components/StatusAnnouncer';
import { useClipboard } from '@/hooks/useClipboard';
import { triggerHapticFeedback } from '@/lib/utils';
import {
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ROUTES,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  UI_CONFIG,
  NOT_FOUND_PAGE_CONFIG,
  NOT_FOUND_LABELS,
  BREATHE,
  HERO_ENTRANCE,
  GRAY_CLASSES,
  ICON_SIZES,
  COMPONENT_CONFIG,
  TRANSITION_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLORS,
} from '@/lib/config';
import { ANIMATION_PATTERNS } from '@/lib/config/remaining-styles';
import {
  NOT_FOUND_404_CONTAINER,
  NOT_FOUND_BUTTON_INLINE,
  NOT_FOUND_BUTTON_INLINE_FULL,
  NOT_FOUND_SHORTCUTS_SECTION,
  KEYBOARD_HINT_INLINE,
  POPULAR_PAGES_SECTION,
  POPULAR_PAGES_GRID,
  POPULAR_PAGES_ITEM,
  POPULAR_PAGES_ICON,
  COPY_URL_HINT,
  NOT_FOUND_COPY_SECTION,
  TEXT_LEFT,
} from '@/lib/config/remaining-hardcoded-patterns';
import type { ComponentConfig } from '@/lib/config/components';
import { ERROR_ELEMENT_IDS } from '@/lib/config/element-ids';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import Tooltip from '@/components/Tooltip';

// Lazy load CopyButton for code splitting
const CopyButton = dynamic(() => import('@/components/CopyButton'), {
  ssr: false,
});

// Enhanced 404 page with keyboard shortcuts, focus management, and consistent component usage
export default function NotFound() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isMac, setIsMac] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { copy, hasCopied } = useClipboard({
    duration: (COMPONENT_CONFIG as ComponentConfig).NOT_FOUND_PAGE
      .CLIPBOARD_DURATION_MS,
  });

  // Micro-UX: Focus management - focus heading on mount for screen readers
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Micro-UX: Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
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
  // Enter/Cmd+Enter = Go back, Escape = Go home, d = Go to dashboard, Ctrl/Cmd+C = Copy URL
  // Cmd+Enter matches login/signup pages for consistency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;

      // Enter or Cmd/Ctrl+Enter = Go back (consistent with login/signup pages)
      if (e.key === 'Enter') {
        e.preventDefault();
        handleGoBack();
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        window.location.href = ROUTES.HOME;
      }

      // Micro-UX: 'd' key navigates to dashboard (consistent with dashboard shortcut conventions)
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        triggerHapticFeedback();
        window.location.href = ROUTES.DASHBOARD;
      }

      // Micro-UX: Ctrl/Cmd+C copies page URL for easy sharing of broken links
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const selection = window.getSelection()?.toString();
        if (!selection && typeof navigator !== 'undefined') {
          copy(window.location.href);
          triggerHapticFeedback();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack, copy]);

  return (
    <div className={PAGE_LAYOUT_CLASSES.AUTH_CONTAINER}>
      <StatusAnnouncer
        message={NOT_FOUND_LABELS.COPY_URL_SUCCESS}
        triggered={hasCopied}
      />
      {/* Micro-UX: Skip to content link for keyboard users */}
      <a
        href="#error-content"
        className={`${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.BASE} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.BG} ${UI_CONFIG.ACCESSIBILITY.SKIP_LINK.COLORS.TEXT}`}
      >
        Skip to error content
      </a>

      <div className={`${CONTAINER_WIDTHS.XS} w-full`}>
        <div
          id={ERROR_ELEMENT_IDS.ERROR_CONTENT}
          className={`${CARD_PATTERNS.CENTERED_LARGE} ${HERO_ENTRANCE}`}
        >
          <div className={NOT_FOUND_404_CONTAINER}>
            <div
              className={`inline-flex items-center justify-center ${ICON_SIZES.MASSIVE} rounded-full ${GRAY_CLASSES.BG_100}`}
            >
              <span
                className={`text-4xl font-bold ${GRAY_CLASSES.TEXT_300} select-none ${prefersReducedMotion ? '' : BREATHE}`}
              >
                404
              </span>
            </div>
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className={`text-2xl font-bold ${GRAY_CLASSES.TEXT_900} mb-2 ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_1} focus:outline-none`}
          >
            Page not found
          </h1>

          <p
            className={`${GRAY_CLASSES.TEXT_600} mb-8 max-w-sm mx-auto ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_2}`}
          >
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            may have been moved or doesn&apos;t exist.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-3 justify-center ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_3}`}
          >
            <Tooltip
              content={NOT_FOUND_LABELS.GO_BACK_TOOLTIP}
              shortcut={[isMac ? '⌘' : 'Ctrl', 'Enter']}
              position="top"
            >
              <Button
                variant="primary"
                onClick={handleGoBack}
                className={NOT_FOUND_BUTTON_INLINE}
              >
                <svg
                  className={ICON_SIZES.MD}
                  fill="none"
                  viewBox={SVG_VIEWBOX.STANDARD}
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
            </Tooltip>

            <Link href={ROUTES.HOME}>
              <Tooltip
                content={NOT_FOUND_LABELS.GO_HOME_TOOLTIP}
                shortcut={['Esc']}
                position="top"
              >
                <Button
                  variant="secondary"
                  className={NOT_FOUND_BUTTON_INLINE_FULL}
                >
                  <svg
                    className={ICON_SIZES.MD}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
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
              </Tooltip>
            </Link>

            <Tooltip
              content={NOT_FOUND_LABELS.GO_DASHBOARD_TOOLTIP}
              shortcut={['d']}
              position="top"
            >
              <Link href={ROUTES.DASHBOARD}>
                <Button
                  variant="outline"
                  className={NOT_FOUND_BUTTON_INLINE_FULL}
                >
                  <svg
                    className={ICON_SIZES.MD}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
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
            </Tooltip>
          </div>

          <div
            className={`${NOT_FOUND_COPY_SECTION} ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_4}`}
          >
            <CopyButton
              textToCopy={
                typeof window !== 'undefined' ? window.location.href : ''
              }
              label={NOT_FOUND_LABELS.COPY_URL_BUTTON}
              successLabel={NOT_FOUND_LABELS.COPY_URL_SUCCESS}
              ariaLabel={NOT_FOUND_LABELS.COPY_URL_ARIA_LABEL}
              variant="subtle"
            />
            <Tooltip
              content={NOT_FOUND_LABELS.COPY_URL_HINT}
              shortcut={[isMac ? '⌘' : 'Ctrl', 'C']}
              position="top"
            >
              <span className={`${COPY_URL_HINT}`}>
                <kbd
                  className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
                >
                  {isMac ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd
                  className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
                >
                  C
                </kbd>
              </span>
            </Tooltip>
          </div>

          {/* Micro-UX: Keyboard shortcut hints for discoverability */}
          {/* Uses discover-pulse animation to draw attention to available shortcuts */}
          <div
            className={`${NOT_FOUND_SHORTCUTS_SECTION} ${GRAY_CLASSES.TEXT_500} ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_5} ${ANIMATION_PATTERNS.DISCOVER_PULSE} rounded-lg px-4 py-2`}
            aria-hidden="true"
          >
            <span className={KEYBOARD_HINT_INLINE}>
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                {isMac ? '⌘' : 'Ctrl'}
              </kbd>
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                Enter
              </kbd>
              <span>go back</span>
            </span>
            <span className={KEYBOARD_HINT_INLINE}>
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                Esc
              </kbd>
              <span>go home</span>
            </span>
            <span className={KEYBOARD_HINT_INLINE}>
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                d
              </kbd>
              <span>dashboard</span>
            </span>
            <span className={KEYBOARD_HINT_INLINE}>
              {hasCopied ? (
                <span
                  className={`${TEXT_COLORS.SUCCESS_MEDIUM_DARK} font-medium animate-fade-in`}
                >
                  {NOT_FOUND_LABELS.COPY_URL_SUCCESS}
                </span>
              ) : (
                <>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    {isMac ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd
                    className={
                      UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT
                    }
                  >
                    C
                  </kbd>
                  <span>{NOT_FOUND_LABELS.COPY_URL_HINT}</span>
                </>
              )}
            </span>
          </div>

          {/* Micro-UX: Popular pages suggestions to help users find what they're looking for */}
          {/* Provides quick access to common destinations, reducing frustration from 404 errors */}
          <div
            className={`${POPULAR_PAGES_SECTION} ${BORDER_COLORS.LIGHT} ${HERO_ENTRANCE} ${NOT_FOUND_PAGE_CONFIG.HERO_ANIMATION_DELAYS.STEP_6}`}
          >
            <h2
              id="popular-pages-heading"
              className={`text-sm font-medium ${GRAY_CLASSES.TEXT_700} mb-4 text-center`}
            >
              Popular pages
            </h2>
            <nav aria-labelledby="popular-pages-heading">
              <ul className={POPULAR_PAGES_GRID}>
                {[
                  {
                    href: ROUTES.HOME,
                    label: 'Home',
                    description: 'Start a new idea',
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    ),
                  },
                  {
                    href: ROUTES.DASHBOARD,
                    label: 'Dashboard',
                    description: 'View your ideas',
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    ),
                  },
                  {
                    href: ROUTES.SIGNUP,
                    label: 'Sign up',
                    description: 'Create an account',
                    icon: (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    ),
                  },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`${POPULAR_PAGES_ITEM} ${BORDER_COLORS.LIGHT} ${BG_COLORS.DEFAULT} hover:${BORDER_COLORS.PRIMARY_LIGHT} hover:${BG_COLORS.BRAND_LIGHT} ${TRANSITION_CLASSES.DEFAULT} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${POPULAR_PAGES_ICON} ${BG_COLORS.LIGHT} group-hover:${BG_COLORS.BRAND_LIGHT} ${TRANSITION_CLASSES.DEFAULT}`}
                      >
                        <svg
                          className={`${ICON_SIZES.LG} ${GRAY_CLASSES.TEXT_500} group-hover:${TEXT_COLORS.BRAND_LIGHT} ${TRANSITION_CLASSES.DEFAULT}`}
                          fill="none"
                          viewBox={SVG_VIEWBOX.STANDARD}
                          stroke="currentColor"
                          strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                          aria-hidden="true"
                        >
                          {item.icon}
                        </svg>
                      </span>
                      <span className={TEXT_LEFT}>
                        <span
                          className={`block text-sm font-medium ${GRAY_CLASSES.TEXT_900} group-hover:${TEXT_COLORS.BRAND_LIGHT} ${TRANSITION_CLASSES.DEFAULT}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`block text-xs ${GRAY_CLASSES.TEXT_500}`}
                        >
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
