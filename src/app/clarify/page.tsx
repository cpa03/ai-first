'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { triggerHapticFeedback } from '@/lib/utils';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import {
  SPINNER_PATTERNS,
  CARD_PATTERNS,
  LOADING_PATTERNS,
  IDEA_STATUS_CONFIG,
  HTTP_HEADERS,
  CLARIFY_PAGE_CONTENT,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  RESPONSIVE_PADDING,
  ROUTES,
  API_ROUTES,
  createRouteWithParams,
  UI_CONFIG,
  GRAY_CLASSES,
  BREATHE,
  REMAINING_PATTERNS,
  ANIMATION_CLASSES,
  HTTP_METHODS,
} from '@/lib/config';
import { API_ERROR_MESSAGES } from '@/lib/config/error-messages';
import {
  CLARIFY_PARAGRAPH_MARGIN,
  CLARIFY_EMPTY_STATE,
} from '@/lib/config/remaining-hardcoded-patterns';

const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <div className={SPINNER_PATTERNS.placeholder.container}>
      {CLARIFY_PAGE_CONTENT.LOADING_SHORT}
    </div>
  ),
});

const Alert = dynamic(() => import('@/components/Alert'), {
  ssr: false,
  loading: () => (
    <div className={LOADING_PATTERNS.SIMPLE}>
      {CLARIFY_PAGE_CONTENT.LOADING_SHORT}
    </div>
  ),
});

const DynamicClarificationFlow = dynamic(
  () => import('@/components/ClarificationFlow').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_SM}>
        <div className={CARD_PATTERNS.CENTERED}>
          <LoadingSpinner
            size="md"
            className={CLARIFY_PARAGRAPH_MARGIN}
            ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
            label={CLARIFY_PAGE_CONTENT.LOADING}
          />
        </div>
      </div>
    ),
  }
);

// Loading fallback for Suspense
function ClarifyPageLoading() {
  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_SM}>
      <div className={CARD_PATTERNS.ANIMATED}>
        <LoadingSpinner
          size="md"
          className={CLARIFY_PARAGRAPH_MARGIN}
          ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
          label={CLARIFY_PAGE_CONTENT.LOADING_SHORT}
        />
      </div>
    </div>
  );
}

// Micro-UX: Success state with keyboard shortcut hint and Enter key handler
// Provides discoverable keyboard navigation consistent with dashboard and not-found patterns
function ClarifySuccessState({
  answers,
  ideaId,
}: {
  answers: Record<string, string>;
  ideaId: string;
}) {
  const router = useRouter();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  // Micro-UX: Enter key to navigate to blueprint generation
  // Matches dashboard pattern where Enter opens the selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocusedOnInput(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        triggerHapticFeedback();
        router.push(createRouteWithParams(ROUTES.RESULTS, { ideaId }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router, ideaId]);

  const handleGenerateBlueprint = useCallback(() => {
    triggerHapticFeedback();
    router.push(createRouteWithParams(ROUTES.RESULTS, { ideaId }));
  }, [router, ideaId]);

  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
      <div className={ANIMATION_CLASSES.SLIDE_UP}>
        <Alert type="success" title={CLARIFY_PAGE_CONTENT.SUCCESS_TITLE}>
          <p className={CLARIFY_PARAGRAPH_MARGIN}>
            {CLARIFY_PAGE_CONTENT.SUCCESS_MESSAGE}
          </p>
          <div className={CARD_PATTERNS.CONTENT}>
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className={REMAINING_PATTERNS.FORM_TEXT_SIZES.SM}>
                <span className={`${GRAY_CLASSES.TEXT_700} font-medium`}>
                  {key.replace(/_/g, ' ')}:
                </span>{' '}
                <span className={GRAY_CLASSES.TEXT_600}>{value}</span>
              </div>
            ))}
          </div>
          <div className={REMAINING_PATTERNS.CLARIFY_LAYOUT.RESPONSIVE_FLEX}>
            <Button onClick={handleGenerateBlueprint} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GENERATE_BLUEPRINT}
            </Button>
            {/* Micro-UX: Keyboard shortcut hint for blueprint generation */}
            {/* Matches the keyboard hint patterns in dashboard, not-found, and clarification flow */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${GRAY_CLASSES.TEXT_500} ${prefersReducedMotion ? '' : BREATHE}`}
              aria-hidden="true"
            >
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                {isMac ? '↵' : 'Enter'}
              </kbd>
              <span>to generate</span>
            </span>
          </div>
        </Alert>
      </div>
    </div>
  );
}

// Inner component that uses URL search params
function ClarifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthCheck();

  // Read URL params safely - useSearchParams returns null on initial server render
  // We use a ref to track if we've hydrated to avoid hydration mismatches
  const hasHydratedRef = useRef(false);
  const [params, setParams] = useState({
    idea: '',
    ideaId: '',
    hasLoaded: false,
  });
  const [isMac, setIsMac] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const logger = createLogger('ClarifyPage');

  // Micro-UX: Detect platform for keyboard shortcut display
  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  // Use useEffect to safely read params after hydration
  // This is necessary to avoid hydration mismatches when reading URL params
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const ideaFromUrl = searchParams?.get('idea');
    const ideaIdFromUrl = searchParams?.get('ideaId');

    setParams({
      idea: ideaFromUrl ? decodeURIComponent(ideaFromUrl) : '',
      ideaId: ideaIdFromUrl || '',
      hasLoaded: true,
    });
  }, [searchParams]);

  const { idea, ideaId, hasLoaded } = params;

  // PERFORMANCE: Memoize handler to prevent unnecessary re-renders of ClarificationFlow
  // which receives this function as a prop
  const handleClarificationComplete = useCallback(
    async (completedAnswers: Record<string, string>) => {
      try {
        if (ideaId) {
          const response = await fetchWithTimeout(
            `${API_ROUTES.IDEAS}/${ideaId}`,
            {
              method: HTTP_METHODS.PUT,
              headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
              body: JSON.stringify({
                status: IDEA_STATUS_CONFIG.TYPES.CLARIFIED,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || `Failed to update idea: ${response.status}`
            );
          }
        }

        setAnswers(completedAnswers);

        // In a real app, this would navigate to results page
        // For now, we'll just show the completion message
      } catch (err) {
        logger.errorWithContext('Failed to save clarification answers', {
          component: 'ClarifyPage',
          action: 'handleClarificationComplete',
          metadata: {
            ideaId,
            error:
              err instanceof Error
                ? err.message
                : API_ERROR_MESSAGES.FALLBACK.UNKNOWN_ERROR,
          },
        });
        setError(CLARIFY_PAGE_CONTENT.FAILED_SAVE_ANSWERS);
      }
    },
    [ideaId, logger]
  );

  if (authLoading || !hasLoaded) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_SM}>
        <div className={CARD_PATTERNS.ANIMATED}>
          <LoadingSpinner
            size="md"
            className={CLARIFY_PARAGRAPH_MARGIN}
            ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
            label={CLARIFY_PAGE_CONTENT.LOADING_SHORT}
          />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <Alert type="warning" title={CLARIFY_PAGE_CONTENT.AUTH_REQUIRED_TITLE}>
          <p>{CLARIFY_PAGE_CONTENT.AUTH_REQUIRED_MESSAGE}</p>
          <div className={REMAINING_PATTERNS.CLARIFY_LAYOUT.RESPONSIVE_FLEX}>
            <Button onClick={() => router.push(ROUTES.HOME)} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GO_HOME}
            </Button>
            {/* Micro-UX: Keyboard shortcut hint for auth-required state */}
            {/* Matches the keyboard hint patterns in not-found and dashboard pages */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${GRAY_CLASSES.TEXT_500} ${prefersReducedMotion ? '' : BREATHE}`}
              aria-hidden="true"
            >
              <kbd
                className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
              >
                {isMac ? '↵' : 'Enter'}
              </kbd>
              <span>to go home</span>
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={ANIMATION_CLASSES.SLIDE_UP}>
          <Alert type="error" title={CLARIFY_PAGE_CONTENT.ERROR_TITLE}>
            <p className={CLARIFY_PARAGRAPH_MARGIN}>{error}</p>
            <div
              className={
                REMAINING_PATTERNS.CLARIFY_LAYOUT.RESPONSIVE_FLEX_NO_MT
              }
            >
              <Button onClick={() => router.back()} variant="primary">
                {CLARIFY_PAGE_CONTENT.BUTTONS.GO_BACK}
              </Button>
              {/* Micro-UX: Keyboard shortcut hint for error state */}
              {/* Matches the keyboard hint patterns in not-found and dashboard pages */}
              <span
                className={`hidden sm:inline-flex items-center gap-1.5 text-xs ${GRAY_CLASSES.TEXT_500} ${prefersReducedMotion ? '' : BREATHE}`}
                aria-hidden="true"
              >
                <kbd
                  className={UI_CONFIG.ACCESSIBILITY.KEYBOARD.KBD_STYLE_COMPACT}
                >
                  {isMac ? '↵' : 'Enter'}
                </kbd>
                <span>to go back</span>
              </span>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  if (answers) {
    return <ClarifySuccessState answers={answers} ideaId={ideaId} />;
  }

  if (!idea) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={ANIMATION_CLASSES.SLIDE_UP}>
          <Alert type="warning" title={CLARIFY_PAGE_CONTENT.NO_IDEA_TITLE}>
            <p className={CLARIFY_PARAGRAPH_MARGIN}>
              {CLARIFY_PAGE_CONTENT.NO_IDEA_MESSAGE}
            </p>
            <Button onClick={() => router.push(ROUTES.HOME)} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GO_TO_HOME}
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={CLARIFY_EMPTY_STATE}>
      <div
        className={`${CONTAINER_WIDTHS.SM} mx-auto ${RESPONSIVE_PADDING.CLASS} mb-8`}
      >
        <div className={REMAINING_PATTERNS.CLARIFY_LAYOUT.TEXT_CENTER}>
          <h1 className={`text-3xl font-bold ${GRAY_CLASSES.TEXT_900} mb-4`}>
            {CLARIFY_PAGE_CONTENT.HEADING}
          </h1>
          <p className={`text-lg ${GRAY_CLASSES.TEXT_600}`}>
            {CLARIFY_PAGE_CONTENT.SUBHEADING}
          </p>
        </div>
      </div>

      <DynamicClarificationFlow
        idea={idea}
        ideaId={ideaId}
        onComplete={handleClarificationComplete}
        onBackToEdit={() => router.push('/')}
      />
    </div>
  );
}

// Main page component wrapped in Suspense
export default function ClarifyPage() {
  return (
    <Suspense fallback={<ClarifyPageLoading />}>
      <ClarifyPageContent />
    </Suspense>
  );
}
