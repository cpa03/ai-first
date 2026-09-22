'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createLogger } from '@/lib/logger';
import { fetchWithTimeout } from '@/lib/api-client';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useGuestMode } from '@/hooks/useGuestMode';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  DASHBOARD_PAGE_CONFIG,
  DASHBOARD_PAGE_CONTENT,
  DASHBOARD_LABELS,
  DASHBOARD_FILTER_LABELS,
  DASHBOARD_EMPTY_STATE_CTA,
  DASHBOARD_EMPTY_STATE_CTA_ROW,
  DASHBOARD_FILTER_BAR,
  DASHBOARD_FILTER_BADGE_ACTIVE,
  DASHBOARD_FILTER_BADGE_INACTIVE,
  DASHBOARD_FILTER_BADGE_POSITION,
  DASHBOARD_FILTER_CLEAR_CONTAINER,
  DASHBOARD_PAGINATION_CONTAINER,
  DASHBOARD_SPECIFIC,
  DASHBOARD_PATTERNS,
  PAGE_LAYOUT_CLASSES,
  CONTAINER_WIDTHS,
  RESPONSIVE_PADDING,
  ROUTES,
  GRAY_CLASSES,
  TEXT_COLOR_CLASSES,
  BG_COLOR_CLASSES,
  BORDER_COLOR_CLASSES,
  FLEX_PATTERNS,
  SPACE_Y_PATTERNS,
  TYPOGRAPHY_CLASSES,
  ANIMATION_CLASSES,
  ICON_SIZES,
  SVG_VIEWBOX,
  SVG_STROKE_WIDTHS,
  TRANSITION_CLASSES,
  ROUNDED_CLASSES,
  SHADOW_CLASSES,
  CARD_PATTERNS,
  REMAINING_PATTERNS,
  ML_CLASSES,
} from '@/lib/config';
import { UI_CONFIG } from '@/lib/config/ui-config';
import { isFocusedOnInput, PLATFORM } from '@/lib/dom-utils';
import { triggerHapticFeedback } from '@/lib/utils';
import { createRouteWithParams } from '@/lib/config/routes';
import { getRelativeTime } from '@/lib/date-utils';

const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
  ),
});

const IdeaCard = dynamic(
  () => import('@/components/IdeaCard').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
    ),
  }
);

const Pagination = dynamic(() => import('@/components/Pagination'), {
  ssr: false,
  loading: () => (
    <div className="h-12 bg-gray-100 rounded animate-pulse" />
  ),
});

const DashboardEmptyState = dynamic(
  () => import('@/components/DashboardEmptyState').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
    ),
  }
);

function DashboardClientContent({
  initialIdeas,
  initialPagination,
  initialLoading,
  initialError,
  filter,
  page,
  isAuthenticated,
  userId,
}: {
  initialIdeas: Array<{
    id: string;
    idea: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  initialLoading: boolean;
  initialError: string | null;
  filter: string;
  page: number;
  isAuthenticated: boolean;
  userId?: string;
}) {
  const logger = createLogger('DashboardClient');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(initialError);
  const [isMac, setIsMac] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isLoading: authLoading } = useAuthCheck();
  const { isGuest, ideaId: guestIdeaId, idea: guestIdea, clearGuest } = useGuestMode();

  useEffect(() => {
    setIsMac(PLATFORM.isMac());
  }, []);

  // Fetch ideas when filter or page changes (for authenticated users)
  const fetchIdeas = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter,
        page: String(page),
        limit: String(DASHBOARD_PAGE_CONFIG.PAGINATION.DEFAULT_LIMIT),
      });

      const response = await fetchWithTimeout(
        `/api/ideas?${params.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ideas: ${response.status}`);
      }

      const data = await response.json();
      setIdeas(data.data.ideas);
      setPagination(data.data.pagination);
    } catch (err) {
      logger.errorWithContext('Failed to fetch ideas', {
        component: 'DashboardClient',
        action: 'fetchIdeas',
        metadata: {
          filter,
          page,
          error:
            err instanceof Error
              ? err.message
              : 'Unknown error',
        },
      });
      setError(DASHBOARD_PAGE_CONTENT.ERROR_FETCH);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, userId, filter, page, logger]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set('filter', newFilter);
      params.set('page', '1');
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams?.toString());
      params.set('page', String(newPage));
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleIdeaClick = useCallback(
    (ideaId: string) => {
      triggerHapticFeedback();
      router.push(createRouteWithParams(ROUTES.RESULTS, { ideaId }));
    },
    [router]
  );

  const handleDeleteIdea = useCallback(
    async (ideaId: string) => {
      if (!confirm(DASHBOARD_PAGE_CONTENT.DELETE_CONFIRM)) return;

      try {
        const response = await fetchWithTimeout(
          `/api/ideas/${ideaId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete idea: ${response.status}`);
        }

        setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
        if (pagination) {
          setPagination((prev) =>
            prev
              ? { ...prev, total: prev.total - 1 }
              : null
          );
        }
      } catch (err) {
        logger.errorWithContext('Failed to delete idea', {
          component: 'DashboardClient',
          action: 'handleDeleteIdea',
          metadata: {
            ideaId,
            error:
              err instanceof Error
                ? err.message
                : 'Unknown error',
          },
        });
        setError(DASHBOARD_PAGE_CONTENT.ERROR_DELETE);
      }
    },
    [logger, pagination]
  );

  // Determine if we should show guest banner
  const showGuestBanner = !isAuthenticated && isGuest && guestIdeaId;

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={CARD_PATTERNS.CENTERED}>
          <LoadingSpinner
            size="lg"
            className={ML_CLASSES.LG}
            ariaLabel={DASHBOARD_PAGE_CONTENT.LOADING}
            label={DASHBOARD_PAGE_CONTENT.LOADING}
          />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
        <div className={ANIMATION_CLASSES.SLIDE_UP}>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-1">
                  {DASHBOARD_PAGE_CONTENT.ERROR_TITLE}
                </h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <Button
              onClick={() => router.refresh()}
              variant="primary"
              className="mt-4"
            >
              {DASHBOARD_PAGE_CONTENT.RETRY_BUTTON}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={DASHBOARD_SPECIFIC.CONTAINER}>
      {/* Header */}
      <header className={DASHBOARD_SPECIFIC.HEADER}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={DASHBOARD_SPECIFIC.TITLE}>
              {DASHBOARD_PAGE_CONTENT.TITLE}
            </h1>
            <p className={DASHBOARD_SPECIFIC.SUBTITLE}>
              {DASHBOARD_PAGE_CONTENT.SUBTITLE}
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => router.push(ROUTES.HOME)}
              variant="secondary"
              aria-label={DASHBOARD_LABELS.NEW_IDEA_BUTTON}
            >
              <svg
                className={`${ICON_SIZES.SM} mr-2`}
                fill="none"
                viewBox={SVG_VIEWBOX.STANDARD}
                stroke="currentColor"
                strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {DASHBOARD_LABELS.NEW_IDEA_BUTTON}
            </Button>
          )}
        </div>
      </header>

      {/* Guest Mode Banner */}
      {showGuestBanner && (
        <div
          className={`${ANIMATION_CLASSES.SLIDE_UP} ${DASHBOARD_EMPTY_STATE_CTA}`}
          role="status"
          aria-live="polite"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-amber-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {DASHBOARD_PAGE_CONTENT.GUEST_BANNER_TITLE}
                  </p>
                  <p className="text-sm text-amber-700">
                    {DASHBOARD_PAGE_CONTENT.GUEST_BANNER_MESSAGE}
                  </p>
                </div>
              </div>
              <div className={DASHBOARD_EMPTY_STATE_CTA_ROW}>
                <Button
                  onClick={() => router.push(ROUTES.SIGNUP)}
                  variant="primary"
                  className="flex-shrink-0"
                >
                  {DASHBOARD_PAGE_CONTENT.GUEST_BANNER_CTA}
                </Button>
                <Button
                  onClick={() => {
                    clearGuest();
                    router.refresh();
                  }}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-amber-700 hover:bg-amber-100"
                >
                  {DASHBOARD_PAGE_CONTENT.GUEST_BANNER_DISMISS}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className={DASHBOARD_FILTER_BAR}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div
            className={DASHBOARD_FILTER_BADGE_POSITION}
            role="group"
            aria-label={DASHBOARD_LABELS.FILTER_LABEL}
          >
            {DASHBOARD_PAGE_CONFIG.FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`${DASHBOARD_FILTER_BADGE_POSITION} ${
                  filter === f.value
                    ? DASHBOARD_FILTER_BADGE_ACTIVE
                    : DASHBOARD_FILTER_BADGE_INACTIVE
                }`}
                aria-pressed={filter === f.value}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange('all')}
              className={DASHBOARD_FILTER_CLEAR_CONTAINER}
            >
              {DASHBOARD_LABELS.CLEAR_FILTER}
            </Button>
          )}
        </div>
      </div>

      {/* Ideas List or Empty State */}
      {ideas.length === 0 && !showGuestBanner ? (
        <DashboardEmptyState
          filter={filter}
          isAuthenticated={isAuthenticated}
          onNewIdea={() => router.push(ROUTES.HOME)}
        />
      ) : (
        <>
          <div
            className={`${DASHBOARD_PATTERNS.GRID} ${ANIMATION_CLASSES.FADE_IN}`}
            role="list"
            aria-label={DASHBOARD_LABELS.IDEAS_LIST}
          >
            {ideas.map((ideaItem) => (
              <IdeaCard
                key={ideaItem.id}
                idea={ideaItem}
                onClick={() => handleIdeaClick(ideaItem.id)}
                onDelete={isAuthenticated ? () => handleDeleteIdea(ideaItem.id) : undefined}
                isMac={isMac}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav
              className={DASHBOARD_PAGINATION_CONTAINER}
              aria-label={DASHBOARD_LABELS.PAGINATION_LABEL}
            >
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </nav>
          )}
        </>
      )}
    </div>
  );
}

// Wrapper to provide Suspense boundary for dynamic components
export default function DashboardClient(props: {
  initialIdeas: Array<{
    id: string;
    idea: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>;
  initialPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  initialLoading: boolean;
  initialError: string | null;
  filter: string;
  page: number;
  isAuthenticated: boolean;
  userId?: string;
}) {
  return (
    <Suspense
      fallback={
        <div className={PAGE_LAYOUT_CLASSES.CONTAINER_MD}>
          <div className={CARD_PATTERNS.CENTERED}>
            <LoadingSpinner
              size="lg"
              className={ML_CLASSES.LG}
              ariaLabel={DASHBOARD_PAGE_CONTENT.LOADING}
              label={DASHBOARD_PAGE_CONTENT.LOADING}
            />
          </div>
        </div>
      }
    >
      <DashboardClientContent {...props} />
    </Suspense>
  );
}

