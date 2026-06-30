'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import dynamic from 'next/dynamic';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  ACTION_COLORS,
  TABLE_PATTERNS,
  MODAL_PATTERNS,
  SPINNER_PATTERNS,
  CARD_PATTERNS,
  DASHBOARD_FILTER_LABELS,
  API_ERROR_MESSAGES,
  ROUTES,
  DASHBOARD_PAGE_CONTENT,
  SVG_STROKE_WIDTHS,
  LOCAL_STORAGE_KEYS,
  ANIMATION_CONFIG,
  PAGE_LAYOUT_CLASSES,
} from '@/lib/config';
// Lazy load Button and LoadingSpinner for code splitting
const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <button className={SPINNER_PATTERNS.placeholder.container} disabled>
      Loading...
    </button>
  ),
});

// Growth: Lazy load ReferralLink for code splitting
const ReferralLink = dynamic(() => import('@/components/ReferralLink'), {
  ssr: false,
});

// Lazy load Tooltip for code splitting - used for showing absolute date on hover
const Tooltip = dynamic(() => import('@/components/Tooltip'), {
  ssr: false,
});
import { createLogger } from '@/lib/logger';
import Alert from '@/components/Alert';
import Link from 'next/link';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { APP_CONFIG } from '@/lib/config';
import { IDEA_STATUS_CONFIG, type IdeaStatus } from '@/lib/config/constants';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcutsProvider';
import {
  triggerHapticFeedback,
  getRelativeTime,
  formatAbsoluteDate,
} from '@/lib/utils';
interface Idea {
  id: string;
  title: string;
  status: IdeaStatus;
  createdAt: string;
  updatedAt?: string;
}
interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Use centralized status configuration from constants.ts
const statusColors = IDEA_STATUS_CONFIG.COLORS;
const statusLabels = IDEA_STATUS_CONFIG.LABELS;
const logger = createLogger('DashboardPage');

// PERFORMANCE: Extract pure functions outside component to prevent recreation on every render
// Using relative time for better UX - shows "2 hours ago" instead of requiring mental date math
const formatDate = (dateString: string): string => {
  return getRelativeTime(dateString);
};

// Also export absolute date for cases where it's needed.
// PERFORMANCE: Uses the optimized formatAbsoluteDate from utils for maximum efficiency.
const formatDateAbsolute = (dateString: string): string => {
  return formatAbsoluteDate(new Date(dateString));
};

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    idea: Idea | null;
  }>({
    isOpen: false,
    idea: null,
  });
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const filterSelectRef = useRef<HTMLSelectElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthCheck();
  const { openHelp } = useKeyboardShortcuts();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Set CSS custom properties for dashboard animation from config
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      '--dashboard-stagger-delay',
      `${ANIMATION_CONFIG.DASHBOARD_STAGGER_DELAY}ms`
    );
    root.style.setProperty(
      '--dashboard-row-duration',
      `${ANIMATION_CONFIG.DASHBOARD_ROW_DURATION}ms`
    );
  }, []);

  // Growth: Generate referral code from user ID (first 8 chars)
  const referralCode = userId ? userId.slice(0, 8).toLowerCase() : '';

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      params.set('limit', String(APP_CONFIG.PAGINATION.DEFAULT_LIMIT));

      const queryString = params.toString();
      const response = await fetchWithTimeout(
        `/api/ideas${queryString ? `?${queryString}` : ''}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError(DASHBOARD_PAGE_CONTENT.ERRORS.SIGN_IN_REQUIRED);
          setIdeas([]);
          setPagination(null);
          return;
        }
        throw new Error(API_ERROR_MESSAGES.PAGE.FETCH_IDEAS_FAILED);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch ideas');
      }

      setIdeas(data.data.ideas);
      setPagination(data.data.pagination);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : DASHBOARD_PAGE_CONTENT.ERRORS.UNKNOWN_ERROR;
      if (!errorMessage.includes('sign in')) {
        logger.error('Error fetching ideas:', err);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError(DASHBOARD_PAGE_CONTENT.ERRORS.SIGN_IN_REQUIRED);
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchIdeas();
    }
  }, [fetchIdeas, authLoading, isAuthenticated]);

  // PERFORMANCE: Memoize event handlers to prevent unnecessary re-renders
  const openDeleteModal = useCallback((idea: Idea) => {
    setDeleteModal({ isOpen: true, idea });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, idea: null });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.idea) return;

    const id = deleteModal.idea.id;
    const ideaTitle = deleteModal.idea.title;

    try {
      setDeletingId(id);

      const response = await fetchWithTimeout(`/api/ideas/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(API_ERROR_MESSAGES.PAGE.DELETE_IDEA_FAILED);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || DASHBOARD_PAGE_CONTENT.ERRORS.DELETE_FAILED
        );
      }

      setIdeas((prevIdeas) => prevIdeas.filter((idea) => idea.id !== id));
      setPagination((prev) =>
        prev ? { ...prev, total: Math.max(0, prev.total - 1) } : null
      );
      closeDeleteModal();

      if (typeof window !== 'undefined') {
        const win = window as Window & {
          showToast?: (options: { type: string; message: string }) => void;
        };
        win.showToast?.({
          type: 'success',
          message: `"${ideaTitle}" deleted successfully`,
        });
      }
    } catch (err) {
      logger.error('Error deleting idea:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete idea');
    } finally {
      setDeletingId(null);
    }
  }, [deleteModal.idea, closeDeleteModal]);

  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Handle focus when modal opens/closes
  useEffect(() => {
    let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;

    if (deleteModal.isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      focusTimeoutId = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 0);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    return () => {
      if (focusTimeoutId) {
        clearTimeout(focusTimeoutId);
      }
    };
  }, [deleteModal.isOpen]);

  // Handle keyboard events for focus trap and escape
  useEffect(() => {
    if (!deleteModal.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDeleteModal();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteModal.isOpen, closeDeleteModal]);

  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (deleteModal.isOpen) return;

      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isInputFocused) return;

      if (
        ideas.length > 0 &&
        (e.key === 'j' || e.key === 'k') &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        triggerHapticFeedback();
        setSelectedRowIndex((prev) => {
          const next = e.key === 'j' ? prev + 1 : prev - 1;
          return Math.max(0, Math.min(next, ideas.length - 1));
        });
        return;
      }

      if (
        e.key === 'Enter' &&
        selectedRowIndex >= 0 &&
        selectedRowIndex < ideas.length
      ) {
        e.preventDefault();
        const idea = ideas[selectedRowIndex];
        if (idea) {
          triggerHapticFeedback();
          if (idea.status === 'completed') {
            window.location.href = `/results?ideaId=${idea.id}`;
          } else {
            window.location.href = `/clarify?ideaId=${idea.id}`;
          }
        }
        return;
      }

      if (e.key === 'Escape' && selectedRowIndex >= 0) {
        e.preventDefault();
        setSelectedRowIndex(-1);
        return;
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        triggerHapticFeedback();
        filterSelectRef.current?.focus();
      }

      if (
        (e.key === 'n' || e.key === 'N') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        triggerHapticFeedback();
        window.location.href = ROUTES.HOME;
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () =>
      document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [deleteModal.isOpen, ideas, selectedRowIndex]);

  useEffect(() => {
    if (selectedRowIndex >= 0 && tableBodyRef.current) {
      const rows = tableBodyRef.current.querySelectorAll('tr');
      const selectedRow = rows[selectedRowIndex];
      if (selectedRow) {
        selectedRow.scrollIntoView({
          block: 'nearest',
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    }
  }, [selectedRowIndex, prefersReducedMotion]);

  if (loading) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_LG}>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={PAGE_LAYOUT_CLASSES.CONTAINER_LG}>
        <Alert type="error" title={DASHBOARD_PAGE_CONTENT.ERROR_TITLE}>
          {error}
          <div className="mt-4">
            <Button onClick={fetchIdeas} variant="primary">
              {DASHBOARD_PAGE_CONTENT.TRY_AGAIN}
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={PAGE_LAYOUT_CLASSES.CONTAINER_LG}>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectedRowIndex >= 0 && ideas[selectedRowIndex]
          ? `Row ${selectedRowIndex + 1} of ${ideas.length}: ${ideas[selectedRowIndex].title}. Press Enter to ${
              ideas[selectedRowIndex].status === 'completed'
                ? 'view blueprint'
                : 'continue editing'
            }.`
          : ''}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {DASHBOARD_PAGE_CONTENT.HEADING}
          </h1>
          <p className="text-gray-600 mt-1">
            {pagination?.total || 0}{' '}
            {pagination?.total !== 1
              ? DASHBOARD_PAGE_CONTENT.IDEA_COUNT.PLURAL
              : DASHBOARD_PAGE_CONTENT.IDEA_COUNT.SINGULAR}{' '}
            {DASHBOARD_PAGE_CONTENT.IDEA_COUNT.TOTAL}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Create a new idea" shortcut={['N']}>
            <Link href="/">
              <Button variant="primary">
                {DASHBOARD_PAGE_CONTENT.ACTIONS.NEW_IDEA}
              </Button>
            </Link>
          </Tooltip>
        </div>
      </div>
      {/* Growth: Referral Link - Viral Growth Loop */}
      {isAuthenticated && referralCode && (
        <div className="mb-8">
          <ReferralLink referralCode={referralCode} />
        </div>
      )}
      {/* Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label htmlFor="status-filter" className="sr-only">
          {DASHBOARD_PAGE_CONTENT.FILTER.LABEL}
        </label>
        <div className="relative">
          <Tooltip content="Filter by status" shortcut={['/']}>
            <select
              ref={filterSelectRef}
              id="status-filter"
              value={filter}
              onChange={(e) => {
                triggerHapticFeedback();
                setFilter(e.target.value);
              }}
              className={`block w-full sm:w-auto px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer animate-focus-ring transition-all duration-200 ${
                filter !== 'all'
                  ? 'border-primary-300 bg-primary-50 text-primary-900 font-medium shadow-sm'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.FILTER_STATUS}
            >
              <option
                value="all"
                className={filter === 'all' ? 'bg-primary-50 font-medium' : ''}
              >
                {filter === 'all'
                  ? DASHBOARD_FILTER_LABELS.ALL.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.ALL.LABEL}
              </option>
              <option
                value="draft"
                className={
                  filter === 'draft' ? 'bg-primary-50 font-medium' : ''
                }
              >
                {filter === 'draft'
                  ? DASHBOARD_FILTER_LABELS.DRAFT.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.DRAFT.LABEL}
              </option>
              <option
                value="clarified"
                className={
                  filter === 'clarified' ? 'bg-primary-50 font-medium' : ''
                }
              >
                {filter === 'clarified'
                  ? DASHBOARD_FILTER_LABELS.CLARIFIED.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.CLARIFIED.LABEL}
              </option>
              <option
                value="breakdown"
                className={
                  filter === 'breakdown' ? 'bg-primary-50 font-medium' : ''
                }
              >
                {filter === 'breakdown'
                  ? DASHBOARD_FILTER_LABELS.BREAKDOWN.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.BREAKDOWN.LABEL}
              </option>
              <option
                value="completed"
                className={
                  filter === 'completed' ? 'bg-primary-50 font-medium' : ''
                }
              >
                {filter === 'completed'
                  ? DASHBOARD_FILTER_LABELS.COMPLETED.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.COMPLETED.LABEL}
              </option>
            </select>
          </Tooltip>
          {ideas.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span
                key={ideas.length}
                className={`flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 text-xs font-semibold rounded-full transition-all duration-300 ${
                  filter !== 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-100 text-primary-700'
                }`}
                aria-live="polite"
              >
                {ideas.length}
              </span>
            </div>
          )}
        </div>
        {filter !== 'all' && (
          <div className="flex items-center gap-2 animate-fade-in">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ring-1 ring-primary-200">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              {filter === 'breakdown'
                ? DASHBOARD_FILTER_LABELS.BREAKDOWN.LABEL
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </span>
            <Tooltip content="Clear filter" shortcut={['/']}>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback();
                  setFilter('all');
                }}
                className="text-xs text-gray-500 hover:text-primary-600 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
                aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.CLEAR_FILTER}
              >
                {DASHBOARD_PAGE_CONTENT.CLEAR_FILTER}
              </button>
            </Tooltip>
          </div>
        )}
        <button
          type="button"
          onClick={() => openHelp()}
          className="ml-2 text-xs text-gray-500 hover:text-primary-600 underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          aria-label={
            DASHBOARD_PAGE_CONTENT.ARIA_LABELS.SHOW_KEYBOARD_SHORTCUTS
          }
        >
          {DASHBOARD_PAGE_CONTENT.SHORTCUTS}
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED);
            window.location.reload();
          }}
          className="ml-2 text-xs text-gray-500 hover:text-primary-600 underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded"
          aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.RESTART_ONBOARDING}
        >
          {DASHBOARD_PAGE_CONTENT.RESTART_TOUR}
        </button>
      </div>
      {/* Ideas List */}
      {ideas.length === 0 ? (
        <div className={CARD_PATTERNS.CENTERED_LARGE}>
          {filter !== 'all' ? (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-primary-50 rounded-full">
                <svg
                  className="w-10 h-10 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.NO_MATCHING_TITLE}
              </h2>
              <p className="text-gray-600 mb-6">
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.NO_MATCHING_DESCRIPTION.replace(
                  '{filter}',
                  filter === 'breakdown'
                    ? IDEA_STATUS_CONFIG.LABELS.breakdown
                    : filter
                )}
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setFilter('all')}>
                  {DASHBOARD_PAGE_CONTENT.CLEAR_FILTER}
                </Button>
                <Link href="/">
                  <Button variant="primary">
                    {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.CREATE_NEW_IDEA}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.TITLE}
              </h2>
              <p className="text-gray-600 mb-6">
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.DESCRIPTION}
              </p>

              {/* Micro-UX: Animated 3-step visual flow showing the IdeaFlow journey */}
              {/* Helps users understand the product value proposition at a glance */}
              <div
                className="flex items-center justify-center gap-2 sm:gap-4 mb-8"
                role="list"
                aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.HOW_IT_WORKS}
              >
                {/* Step 1: Idea */}
                <div
                  className="flex flex-col items-center gap-2 animate-fade-in"
                  role="listitem"
                  style={{ animationDelay: '0ms' }}
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 transition-transform duration-200 hover:scale-110">
                    <svg
                      className="w-7 h-7 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    Share Idea
                  </span>
                </div>

                {/* Arrow 1 */}
                <div
                  className="flex items-center animate-fade-in mt-[-1.5rem]"
                  aria-hidden="true"
                  style={{ animationDelay: '150ms' }}
                >
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-amber-300 to-primary-300" />
                  <svg
                    className="w-4 h-4 text-primary-400 -ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Step 2: Clarify */}
                <div
                  className="flex flex-col items-center gap-2 animate-fade-in"
                  role="listitem"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary-50 border border-primary-200 transition-transform duration-200 hover:scale-110">
                    <svg
                      className="w-7 h-7 text-primary-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    Get Clarified
                  </span>
                </div>

                {/* Arrow 2 */}
                <div
                  className="flex items-center animate-fade-in mt-[-1.5rem]"
                  aria-hidden="true"
                  style={{ animationDelay: '450ms' }}
                >
                  <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-primary-300 to-green-300" />
                  <svg
                    className="w-4 h-4 text-green-400 -ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Step 3: Blueprint */}
                <div
                  className="flex flex-col items-center gap-2 animate-fade-in"
                  role="listitem"
                  style={{ animationDelay: '600ms' }}
                >
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-green-50 border border-green-200 transition-transform duration-200 hover:scale-110">
                    <svg
                      className="w-7 h-7 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={SVG_STROKE_WIDTHS.LIGHT}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    Get Blueprint
                  </span>
                </div>
              </div>

              <Link href="/">
                <Button variant="primary" attention>
                  {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.BUTTON}
                </Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className={CARD_PATTERNS.OVERFLOW_HIDDEN}>
          <div className="overflow-x-auto">
            <table
              className={`${TABLE_PATTERNS.container} divide-y divide-gray-200`}
              role="table"
              aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.IDEAS_LIST}
            >
              <thead className={TABLE_PATTERNS.header.container}>
                <tr>
                  <th scope="col" className={TABLE_PATTERNS.header.cell}>
                    {DASHBOARD_PAGE_CONTENT.TABLE.TITLE_HEADER}
                  </th>
                  <th scope="col" className={TABLE_PATTERNS.header.cell}>
                    {DASHBOARD_PAGE_CONTENT.TABLE.STATUS_HEADER}
                  </th>
                  <th scope="col" className={TABLE_PATTERNS.header.cell}>
                    {DASHBOARD_PAGE_CONTENT.TABLE.CREATED_HEADER}
                  </th>
                  <th
                    scope="col"
                    className={TABLE_PATTERNS.header.cell.replace(
                      'text-left',
                      'text-right'
                    )}
                  >
                    {DASHBOARD_PAGE_CONTENT.TABLE.ACTIONS_HEADER}
                  </th>
                </tr>
              </thead>
              <tbody
                ref={tableBodyRef}
                className="bg-white divide-y divide-gray-200"
              >
                {ideas.map((idea, index) => (
                  <tr
                    key={idea.id}
                    data-row-index={index}
                    tabIndex={selectedRowIndex === index ? 0 : -1}
                    aria-selected={selectedRowIndex === index}
                    className={`${TABLE_PATTERNS.row.hover} animate-dashboard-row animate-dashboard-row-${Math.min(index + 1, 10)} transition-colors ${
                      selectedRowIndex === index
                        ? 'bg-primary-50 ring-2 ring-primary-400 ring-inset'
                        : ''
                    }`}
                  >
                    <td className={TABLE_PATTERNS.cell.padding}>
                      <div className={TABLE_PATTERNS.cell.primary}>
                        {idea.title}
                      </div>
                    </td>
                    <td className={TABLE_PATTERNS.cell.padding}>
                      <span
                        className={`${TABLE_PATTERNS.statusBadge.base} ${statusColors[idea.status]}`}
                      >
                        {statusLabels[idea.status]}
                      </span>
                    </td>
                    <td
                      className={`${TABLE_PATTERNS.cell.padding} ${TABLE_PATTERNS.cell.text}`}
                    >
                      <Tooltip
                        content={formatDateAbsolute(idea.createdAt)}
                        position="top"
                      >
                        <span className="cursor-help border-b border-dotted border-gray-400">
                          {formatDate(idea.createdAt)}
                        </span>
                      </Tooltip>
                    </td>
                    <td className={TABLE_PATTERNS.actions.container}>
                      <div className={TABLE_PATTERNS.actions.buttonGroup}>
                        <Link
                          href={`/clarify?ideaId=${idea.id}`}
                          className={`${ACTION_COLORS.CONTINUE.text} ${ACTION_COLORS.CONTINUE.hoverText} ${TABLE_PATTERNS.actions.buttonBase} ${ACTION_COLORS.CONTINUE.hoverBg} transition-colors`}
                          aria-label={`Continue working on ${idea.title}`}
                        >
                          Continue
                        </Link>
                        <Link
                          href={`/results?ideaId=${idea.id}`}
                          className={`${ACTION_COLORS.VIEW.text} ${ACTION_COLORS.VIEW.hoverText} ${TABLE_PATTERNS.actions.buttonBase} ${ACTION_COLORS.VIEW.hoverBg} transition-colors`}
                          aria-label={`View blueprint for ${idea.title}`}
                        >
                          View
                        </Link>
                        <button
                          onClick={() => openDeleteModal(idea)}
                          disabled={deletingId === idea.id}
                          className={`${ACTION_COLORS.DELETE.text} ${ACTION_COLORS.DELETE.hoverText} ${TABLE_PATTERNS.actions.buttonBase} ${ACTION_COLORS.DELETE.hoverBg} transition-colors disabled:opacity-50 inline-flex items-center gap-1`}
                          aria-label={`Delete ${idea.title}`}
                        >
                          {deletingId === idea.id && (
                            <svg
                              className="animate-spin h-3 w-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          )}
                          {deletingId === idea.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {ideas.length > 0 && !loading && (
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              j
            </kbd>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              k
            </kbd>
            navigate
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              Enter
            </kbd>
            open
          </span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">
              Esc
            </kbd>
            deselect
          </span>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.idea && (
        <div
          ref={modalRef}
          className={MODAL_PATTERNS.overlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
          onTouchEnd={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div
            className={`${MODAL_PATTERNS.content.container} ${MODAL_PATTERNS.content.transition}`}
          >
            <div className={MODAL_PATTERNS.header.container}>
              <div className={MODAL_PATTERNS.dangerIcon.container}>
                <svg
                  className={MODAL_PATTERNS.dangerIcon.icon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3
                id="delete-modal-title"
                className={MODAL_PATTERNS.header.title}
              >
                Delete Idea
              </h3>
            </div>

            <p
              id="delete-modal-description"
              className={MODAL_PATTERNS.header.description}
            >
              Are you sure you want to delete &quot;{deleteModal.idea.title}
              &quot;? This action cannot be undone.
            </p>

            <div className={MODAL_PATTERNS.footer.container}>
              <Button
                ref={cancelButtonRef}
                variant="outline"
                onClick={closeDeleteModal}
                disabled={!!deletingId}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={!!deletingId}
              >
                Delete Idea
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
