'use client';

import { memo, useEffect, useCallback } from 'react';
import Alert from './Alert';
import Button from './Button';
import Link from 'next/link';
import {
  LAYOUT_ERROR_LABELS,
  CONTAINER_WIDTHS,
  CARD_PATTERNS,
  ROUTES,
  ERROR_FALLBACK_CONTAINER,
  BG_COLORS,
  BORDER_COLORS,
  TEXT_COLORS,
  TEXT_SIZE_CLASSES,
} from '@/lib/config';
import { isFocusedOnInput } from '@/lib/dom-utils';

interface LayoutErrorFallbackProps {
  title: string;
  message: string;
  homeLabel?: string;
}

function LayoutErrorFallbackComponent({
  title,
  message,
  homeLabel = LAYOUT_ERROR_LABELS.HOME_LINK,
}: LayoutErrorFallbackProps) {
  // Micro-UX: Keyboard shortcuts for error recovery actions
  // Enter = Retry (reload page), Escape = Go home
  // Matches the pattern established in ErrorBoundary for consistency
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFocusedOnInput(e.target)) return;

    if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      window.location.reload();
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      window.location.href = ROUTES.HOME;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={ERROR_FALLBACK_CONTAINER}>
      <div
        className={`${CONTAINER_WIDTHS.XS} w-full ${CARD_PATTERNS.COMPACT} text-center`}
      >
        <Alert type="error" title={title}>
          {message}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                {LAYOUT_ERROR_LABELS.RETRY_BUTTON}
              </Button>
              <span
                className={`hidden sm:flex items-center gap-1 text-xs ${TEXT_COLORS.MUTED}`}
                aria-hidden="true"
              >
                <kbd
                  className={`inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.LIGHTER} border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
                >
                  Enter
                </kbd>
                <span>to retry</span>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Link href={ROUTES.HOME} passHref>
                <Button variant="secondary">{homeLabel}</Button>
              </Link>
              <span
                className={`hidden sm:flex items-center gap-1 text-xs ${TEXT_COLORS.MUTED}`}
                aria-hidden="true"
              >
                <kbd
                  className={`inline-flex items-center px-1.5 py-0.5 ${BG_COLORS.LIGHTER} border ${BORDER_COLORS.DEFAULT} rounded ${TEXT_SIZE_CLASSES.XS} font-sans font-medium ${TEXT_COLORS.SECONDARY}`}
                >
                  Esc
                </kbd>
                <span>to go home</span>
              </span>
            </div>
          </div>
        </Alert>
      </div>
    </div>
  );
}

const LayoutErrorFallback = memo(LayoutErrorFallbackComponent);
export default LayoutErrorFallback;
