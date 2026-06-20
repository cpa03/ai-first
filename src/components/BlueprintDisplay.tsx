'use client';

import React, {
  useState,
  useSyncExternalStore,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/Button';
import Skeleton from '@/components/Skeleton';
import LoadingAnnouncer from '@/components/LoadingAnnouncer';
import SuccessCelebration from '@/components/SuccessCelebration';
import Tooltip from '@/components/Tooltip';
import { useBlueprintGeneration } from '@/hooks/useBlueprintGeneration';
import { MESSAGES, COMPONENT_DEFAULTS, COMPONENT_CONFIG } from '@/lib/config';
import { triggerHapticFeedback } from '@/lib/utils';

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerSnapshot = () => false;

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

interface BlueprintDisplayProps {
  idea: string;
  answers: Record<string, string>;
}

const BlueprintDisplayComponent = function BlueprintDisplay({
  idea,
  answers,
}: BlueprintDisplayProps) {
  const {
    isGenerating,
    blueprint,
    copied,
    showCelebration,
    handleDownload,
    handleCopy,
    dismissCelebration,
  } = useBlueprintGeneration(idea, answers);

  const prefersReducedMotion = usePrefersReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const wasGeneratingRef = useRef(isGenerating);

  // Micro-UX: Add Cmd/Ctrl + C keyboard shortcut to copy blueprint
  // This provides a familiar shortcut for keyboard users to quickly copy content
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle shortcut when not generating and blueprint is available
      if (
        !isGenerating &&
        blueprint &&
        (e.metaKey || e.ctrlKey) &&
        e.key === 'c'
      ) {
        // Check if there's a text selection - if so, let the default copy behavior work
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          return;
        }

        e.preventDefault();
        triggerHapticFeedback();
        handleCopy();
      }
    },
    [isGenerating, blueprint, handleCopy]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus management: Set focus to heading when blueprint generation completes (Issue #723)
  useEffect(() => {
    // When generation completes (was generating, now not)
    if (wasGeneratingRef.current && !isGenerating && headingRef.current) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Move focus to heading for screen readers and keyboard users
      headingRef.current.focus();
    }
    // Update ref for next render
    wasGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  // Restore focus after copy/download actions
  const handleCopyWithFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    handleCopy();
  };

  const handleDownloadWithFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    handleDownload();
  };

  const comingSoonBadgeClass = prefersReducedMotion
    ? ''
    : 'animate-coming-soon-badge';

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <LoadingAnnouncer message={MESSAGES.LOADING.BLUEPRINT} />
        <div className="text-center mb-8">
          <LoadingSpinner
            size="lg"
            className="mb-4"
            ariaLabel={MESSAGES.BLUEPRINT.ARIA_LABEL_GENERATING}
          />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            {MESSAGES.BLUEPRINT.GENERATING_TITLE}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {MESSAGES.BLUEPRINT.GENERATING_DESCRIPTION}
          </p>
        </div>

        <section
          aria-labelledby="skeleton-heading"
          className="bg-white rounded-lg shadow-lg"
        >
          <header className="border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-6 sm:h-8 w-36 sm:w-48" variant="text" />
              <Skeleton className="h-10 w-full sm:w-40" />
            </div>
          </header>

          <div className="p-4 sm:p-8 space-y-4">
            <Skeleton className="h-5 sm:h-6 w-3/4" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            <Skeleton className="h-3 sm:h-4 w-5/6" variant="text" />

            <div className="mt-6 sm:mt-8 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-1/2" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-full" variant="text" />
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <Skeleton className="h-4 sm:h-5 w-1/2" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-11/12" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-10/12" variant="text" />
            </div>
          </div>

          <footer className="border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Skeleton className="h-3 sm:h-4 w-full sm:w-1/2" variant="text" />
              <div className="flex sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row">
                <Skeleton className="h-10 w-full sm:w-28" />
                <Skeleton className="h-10 w-full sm:w-36" />
              </div>
            </div>
          </footer>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <section
        aria-labelledby="blueprint-heading"
        className="bg-white rounded-lg shadow-lg"
      >
        <header className="border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2
              id="blueprint-heading"
              ref={headingRef}
              className="text-xl sm:text-2xl font-semibold text-gray-900"
              tabIndex={-1}
              aria-live="polite"
            >
              {MESSAGES.BLUEPRINT.PAGE_TITLE}
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCopyWithFocus}
                variant="outline"
                fullWidth={false}
                aria-label={
                  copied
                    ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                    : COMPONENT_DEFAULTS.ARIA_LABELS.COPY_BLUEPRINT
                }
              >
                {copied
                  ? MESSAGES.BLUEPRINT.COPIED_BUTTON
                  : MESSAGES.BLUEPRINT.COPY_BUTTON}
              </Button>
              <Button
                onClick={handleDownloadWithFocus}
                variant="primary"
                fullWidth={false}
                aria-label={COMPONENT_DEFAULTS.ARIA_LABELS.DOWNLOAD_BLUEPRINT}
              >
                {MESSAGES.BLUEPRINT.DOWNLOAD_BUTTON}
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <div className="prose prose-sm sm:prose-lg max-w-none">
            <div className="relative group">
              <pre
                className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-gray-800 bg-gray-50 p-4 sm:p-6 rounded-lg overflow-x-auto"
                aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_CONTENT}
              >
                {blueprint}
              </pre>
              {/* Micro-UX: Copy button on code block for easy copying */}
              <CopyCodeButton text={blueprint || ''} />
            </div>
          </div>
        </div>

        <footer className="border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {MESSAGES.BLUEPRINT.FOOTER_TEXT}
            </p>
            <div className="flex sm:space-x-4 space-y-2 sm:space-y-0 w-full sm:w-auto flex-col sm:flex-row">
              <Tooltip
                content={MESSAGES.BLUEPRINT.TOOLTIP_START_OVER}
                position="top"
              >
                <Button
                  variant="secondary"
                  fullWidth={false}
                  aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_START_OVER}
                  disabled
                >
                  {MESSAGES.BLUEPRINT.START_OVER_BUTTON}
                  <span
                    className={`ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ${comingSoonBadgeClass}`}
                  >
                    {MESSAGES.BLUEPRINT.COMING_SOON_BADGE}
                  </span>
                </Button>
              </Tooltip>
              <Tooltip
                content={MESSAGES.BLUEPRINT.TOOLTIP_EXPORT}
                position="top"
              >
                <Button
                  variant="primary"
                  fullWidth={false}
                  aria-label={MESSAGES.BLUEPRINT.ARIA_LABEL_EXPORT}
                  disabled
                >
                  {MESSAGES.BLUEPRINT.EXPORT_BUTTON}
                  <span
                    className={`ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ${comingSoonBadgeClass}`}
                  >
                    {MESSAGES.BLUEPRINT.COMING_SOON_BADGE}
                  </span>
                </Button>
              </Tooltip>
            </div>
          </div>
        </footer>
      </section>

      <SuccessCelebration
        show={showCelebration}
        onComplete={dismissCelebration}
      />
    </div>
  );
};

function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      triggerHapticFeedback();
      setCopied(true);

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, COMPONENT_CONFIG.COPY_FEEDBACK.DURATION_MS);
    } catch (err) {
      console.error('Failed to copy blueprint:', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`
        absolute top-3 right-3 
        flex items-center gap-1.5 px-2.5 py-1.5 
        text-xs font-medium rounded-md
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${prefersReducedMotion ? '' : 'motion-reduce:transition-none'}
        ${
          copied
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
        }
      `}
      aria-label={
        copied ? 'Copied to clipboard' : 'Copy blueprint to clipboard'
      }
      aria-live="polite"
      type="button"
    >
      {copied ? (
        <svg
          className={`w-3.5 h-3.5 ${prefersReducedMotion ? '' : 'animate-in fade-in zoom-in duration-200'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
      <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}

export default React.memo(BlueprintDisplayComponent);
