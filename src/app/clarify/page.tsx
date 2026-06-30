'use client';

import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthCheck } from '@/hooks/useAuthCheck';
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
} from '@/lib/config';

const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <div className={SPINNER_PATTERNS.placeholder.container}>Loading...</div>
  ),
});

const Alert = dynamic(() => import('@/components/Alert'), {
  ssr: false,
  loading: () => <div className={LOADING_PATTERNS.SIMPLE}>Loading...</div>,
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
            className="mb-4"
            ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
          />
          <p className="text-gray-600">{CLARIFY_PAGE_CONTENT.LOADING}</p>
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
          className="mb-4"
          ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
        />
        <p className="text-gray-600">{CLARIFY_PAGE_CONTENT.LOADING_SHORT}</p>
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
  const logger = createLogger('ClarifyPage');

  // Use useLayoutEffect to safely read params after hydration
  // This is necessary to avoid hydration mismatches when reading URL params
  useLayoutEffect(() => {
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
          const response = await fetchWithTimeout(`/api/ideas/${ideaId}`, {
            method: 'PUT',
            headers: HTTP_HEADERS.JSON_CONTENT_TYPE,
            body: JSON.stringify({
              status: IDEA_STATUS_CONFIG.TYPES.CLARIFIED,
            }),
          });

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
            error: err instanceof Error ? err.message : 'Unknown error',
          },
        });
        setError('Failed to save your answers. Please try again.');
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
            className="mb-4"
            ariaLabel={CLARIFY_PAGE_CONTENT.LOADING}
          />
          <p className="text-gray-600">{CLARIFY_PAGE_CONTENT.LOADING_SHORT}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <Alert type="warning" title={CLARIFY_PAGE_CONTENT.AUTH_REQUIRED_TITLE}>
          <p>{CLARIFY_PAGE_CONTENT.AUTH_REQUIRED_MESSAGE}</p>
          <div className="mt-4">
            <Button onClick={() => router.push('/')} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GO_HOME}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className="slide-up">
          <Alert type="error" title={CLARIFY_PAGE_CONTENT.ERROR_TITLE}>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GO_BACK}
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (answers) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className="slide-up">
          <Alert type="success" title={CLARIFY_PAGE_CONTENT.SUCCESS_TITLE}>
            <p className="mb-4">{CLARIFY_PAGE_CONTENT.SUCCESS_MESSAGE}</p>
            <div className={CARD_PATTERNS.CONTENT}>
              {Object.entries(answers).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium text-gray-700">
                    {key.replace(/_/g, ' ')}:
                  </span>{' '}
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => router.push(`/results?ideaId=${ideaId}`)}
              variant="primary"
            >
              Generate Blueprint
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className="slide-up">
          <Alert type="warning" title={CLARIFY_PAGE_CONTENT.NO_IDEA_TITLE}>
            <p className="mb-4">{CLARIFY_PAGE_CONTENT.NO_IDEA_MESSAGE}</p>
            <Button onClick={() => router.push('/')} variant="primary">
              {CLARIFY_PAGE_CONTENT.BUTTONS.GO_TO_HOME}
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div
        className={`${CONTAINER_WIDTHS.SM} mx-auto ${RESPONSIVE_PADDING.CLASS} mb-8`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {CLARIFY_PAGE_CONTENT.HEADING}
          </h1>
          <p className="text-lg text-gray-600">
            {CLARIFY_PAGE_CONTENT.SUBHEADING}
          </p>
        </div>
      </div>

      <DynamicClarificationFlow
        idea={idea}
        ideaId={ideaId}
        onComplete={handleClarificationComplete}
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
