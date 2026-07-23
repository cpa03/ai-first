'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWithTimeout } from '@/lib/api-client';
import dynamic from 'next/dynamic';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useFocusManagement } from '@/hooks/useAnnouncement';
import {
  ACTION_COLORS,
  TABLE_PATTERNS,
  MODAL_PATTERNS,
  SPINNER_PATTERNS,
  CARD_PATTERNS,
  DASHBOARD_FILTER_LABELS,
  API_ERROR_MESSAGES,
  ROUTES,
  API_ROUTES,
  DASHBOARD_PAGE_CONTENT,
  SVG_STROKE_WIDTHS,
  SVG_VIEWBOX,
  LOCAL_STORAGE_KEYS,
  ANIMATION_CONFIG,
  PAGE_LAYOUT_CLASSES,
  ANIMATION_DELAYS,
  DASHBOARD_LABELS,
  DASHBOARD_TAILWIND,
  TEXT_SIZE_CLASSES,
  STATUS_CODES,
  IDEA_STATUS_CONFIG,
  SIZES,
  TABLE_CLASSES,
  TEXT_COLORS,
  BG_COLORS,
  BORDER_COLORS,
  RING_COLORS,
  UI_DURATIONS,
  DASHBOARD_PATTERNS,
  GRAY_CLASSES,
  DURATION_TAILWIND,
} from '@/lib/config';
import { isFocusedOnInput } from '@/lib/dom-utils';
// Lazy load Button and LoadingSpinner for code splitting
const Button = dynamic(() => import('@/components/Button'), {
  ssr: false,
  loading: () => (
    <button className={SPINNER_PATTERNS.placeholder.container} disabled>
      {DASHBOARD_PAGE_CONTENT.LOADING_SHORT}
    </button>
  ),
});

// Micro-UX: Lazy load CopyButton for idea titles
const CopyButton = dynamic(() => import('@/components/CopyButton'), {
  ssr: false,
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
import ScrollProgress from '@/components/ScrollProgress';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import { APP_CONFIG } from '@/lib/config';
import { type IdeaStatus } from '@/lib/config/constants';
import { useKeyboardShortcuts } from '@/components/KeyboardShortcutsProvider';
import {
  triggerHapticFeedback,
  getRelativeTime,
  formatAbsoluteDate,
  parseDate,
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
  return formatAbsoluteDate(parseDate(dateString));
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
  const [isFilterClearing, setIsFilterClearing] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const filterSelectRef = useRef<HTMLSelectElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const filterClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthCheck();
  const { openHelp } = useKeyboardShortcuts();
  const prefersReducedMotion = usePrefersReducedMotion();
  // Micro-UX: Animated counter for idea count provides a delightful count-up effect
  // when the dashboard loads, giving users a sense of their data at a glance
  const animatedIdeaCount = useAnimatedCounter(pagination?.total || 0, {
    duration: UI_DURATIONS.DASHBOARD_COUNTER,
  });

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
        `${API_ROUTES.IDEAS}${queryString ? `?${queryString}` : ''}`
      );

      if (!response.ok) {
        if (response.status === STATUS_CODES.UNAUTHORIZED) {
          setError(DASHBOARD_PAGE_CONTENT.ERRORS.SIGN_IN_REQUIRED);
          setIdeas([]);
          setPagination(null);
          return;
        }
        throw new Error(API_ERROR_MESSAGES.PAGE.FETCH_IDEAS_FAILED);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || DASHBOARD_PAGE_CONTENT.ERRORS.FETCH_FAILED
        );
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

  // Cleanup filter clear timeout on unmount
  useEffect(() => {
    return () => {
      if (filterClearTimeoutRef.current) {
        clearTimeout(filterClearTimeoutRef.current);
      }
    };
  }, []);

  // Micro-UX: Smooth fade-out animation when clearing filter badge
  // Provides visual continuity instead of abrupt disappearance
  const handleClearFilter = useCallback(() => {
    triggerHapticFeedback();
    if (prefersReducedMotion) {
      setFilter('all');
      return;
    }
    setIsFilterClearing(true);
    filterClearTimeoutRef.current = setTimeout(() => {
      setFilter('all');
      setIsFilterClearing(false);
    }, ANIMATION_CONFIG.FAST); // Match transition duration
  }, [prefersReducedMotion]);

  // PERFORMANCE: Memoize event handlers to prevent unnecessary re-renders
  const openDeleteModal = useCallback((idea: Idea) => {
    setDeleteModal({ isOpen: true, idea });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, idea: null });
    setDeleteConfirmText('');
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.idea) return;

    const id = deleteModal.idea.id;
    const ideaTitle = deleteModal.idea.title;

    try {
      setDeletingId(id);

      const response = await fetchWithTimeout(`${API_ROUTES.IDEAS}/${id}`, {
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
      setError(
        err instanceof Error
          ? err.message
          : DASHBOARD_PAGE_CONTENT.ERRORS.DELETE_FAILED
      );
    } finally {
      setDeletingId(null);
    }
  }, [deleteModal.idea, closeDeleteModal]);

  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const deleteConfirmInputRef = useRef<HTMLInputElement>(null);

  useFocusManagement(deleteModal.isOpen, { delay: 0, restoreFocus: true });

  useEffect(() => {
    if (deleteConfirmInputRef.current) {
      deleteConfirmInputRef.current.focus();
    }
  }, [deleteModal.isOpen]);

  useEffect(() => {
    if (!deleteModal.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDeleteModal();
        return;
      }

      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement as HTMLElement;
        const elementText = activeElement?.textContent || '';
        const elementLabel = activeElement?.getAttribute('aria-label') || '';
        const isCancelButton =
          elementText.includes(DASHBOARD_PAGE_CONTENT.DELETE_MODAL.CANCEL) ||
          elementLabel.includes(DASHBOARD_PAGE_CONTENT.DELETE_MODAL.CANCEL);
        const isConfirmInput = activeElement?.id === 'delete-confirm-input';

        // Only allow Enter to delete if confirmation text matches
        if (!isCancelButton && deleteConfirmText === deleteModal.idea?.title) {
          e.preventDefault();
          handleDelete();
        } else if (isConfirmInput) {
          // Prevent form submission from the input, but don't delete unless confirmed
          e.preventDefault();
        }
        return;
      }

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
  }, [
    deleteModal.isOpen,
    deleteModal.idea?.title,
    closeDeleteModal,
    handleDelete,
    deleteConfirmText,
  ]);

  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      if (deleteModal.isOpen) return;

      if (isFocusedOnInput(e.target)) return;

      if (
        ideas.length > 0 &&
        (e.key === 'j' || e.key === 'k') &&
        !e.ctrlKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        triggerHapticFeedback();
        setSelectedRowIndex((prev) => {
          if (prev === -1) {
            return e.key === 'j' ? 0 : ideas.length - 1;
          }
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
          if (idea.status === IDEA_STATUS_CONFIG.TYPES.COMPLETED) {
            window.location.href = `/results?ideaId=${idea.id}`;
          } else {
            window.location.href = `/clarify?ideaId=${idea.id}`;
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        // Micro-UX: Escape key clears active filter or deselects row
        // Priority: 1) Deselect row if selected, 2) Clear filter if active
        if (selectedRowIndex >= 0) {
          setSelectedRowIndex(-1);
        } else if (filter !== 'all') {
          triggerHapticFeedback();
          handleClearFilter();
        }
        return;
      }

      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedRowIndex >= 0 &&
        selectedRowIndex < ideas.length
      ) {
        const idea = ideas[selectedRowIndex];
        if (idea) {
          e.preventDefault();
          triggerHapticFeedback();
          openDeleteModal(idea);
        }
        return;
      }

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        triggerHapticFeedback();
        filterSelectRef.current?.focus();
        // Micro-UX: Scroll filter into view when focused via keyboard shortcut
        // Ensures the filter is visible on mobile or when user has scrolled down
        filterSelectRef.current?.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }

      // Micro-UX: ? key opens keyboard shortcuts help panel
      // Provides discoverability for users who want to see all available shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        triggerHapticFeedback();
        openHelp();
        return;
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
  }, [
    deleteModal.isOpen,
    ideas,
    selectedRowIndex,
    openDeleteModal,
    prefersReducedMotion,
    filter,
    handleClearFilter,
    openHelp,
  ]);

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

  useEffect(() => {
    if (loading || error || ideas.length === 0) return;
    if (typeof window === 'undefined') return;

    const hintShown = localStorage.getItem(
      LOCAL_STORAGE_KEYS.DASHBOARD_KEYBOARD_HINT_SHOWN
    );
    if (hintShown) return;

    const timer = setTimeout(() => {
      const win = window as Window & {
        showToast?: (options: { type: string; message: string }) => void;
      };
      win.showToast?.({
        type: 'info',
        message: 'Tip: Press j/k to navigate ideas, Enter to open',
      });
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.DASHBOARD_KEYBOARD_HINT_SHOWN,
        'true'
      );
    }, ANIMATION_CONFIG.DASHBOARD_KEYBOARD_HINT_DELAY);

    return () => clearTimeout(timer);
  }, [loading, error, ideas.length]);

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
      {/* Micro-UX: Scroll progress indicator for spatial awareness on long dashboard lists */}
      <ScrollProgress />
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {selectedRowIndex >= 0 && ideas[selectedRowIndex]
          ? `Row ${selectedRowIndex + 1} of ${ideas.length}: ${ideas[selectedRowIndex].title}. Press Enter to ${
              ideas[selectedRowIndex].status ===
              IDEA_STATUS_CONFIG.TYPES.COMPLETED
                ? 'view blueprint'
                : 'continue editing'
            }.`
          : ''}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className={DASHBOARD_PATTERNS.PAGE_HEADING}>
            {DASHBOARD_PAGE_CONTENT.HEADING}
          </h1>
          <p className={DASHBOARD_PATTERNS.PAGE_SUBHEADING}>
            <span className="tabular-nums font-medium">
              {animatedIdeaCount}
            </span>{' '}
            {pagination?.total !== 1
              ? DASHBOARD_PAGE_CONTENT.IDEA_COUNT.PLURAL
              : DASHBOARD_PAGE_CONTENT.IDEA_COUNT.SINGULAR}{' '}
            {DASHBOARD_PAGE_CONTENT.IDEA_COUNT.TOTAL}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip
            content={DASHBOARD_LABELS.NEW_IDEA_TOOLTIP}
            shortcut={DASHBOARD_LABELS.NEW_IDEA_SHORTCUT}
          >
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
          <Tooltip
            content={DASHBOARD_LABELS.FILTER_TOOLTIP}
            shortcut={DASHBOARD_LABELS.FILTER_SHORTCUT}
          >
            <select
              ref={filterSelectRef}
              id="status-filter"
              value={filter}
              onChange={(e) => {
                triggerHapticFeedback();
                setFilter(e.target.value);
              }}
              className={`block w-full sm:w-auto px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer animate-focus-ring transition-all ${DURATION_TAILWIND[200]} ${
                filter !== 'all'
                  ? 'border-primary-300 bg-primary-50 text-primary-900 font-medium shadow-sm'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
              aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.FILTER_STATUS}
            >
              <option
                value="all"
                className={
                  filter === IDEA_STATUS_CONFIG.FILTERS.ALL
                    ? DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE
                    : ''
                }
              >
                {filter === IDEA_STATUS_CONFIG.FILTERS.ALL
                  ? DASHBOARD_FILTER_LABELS.ALL.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.ALL.LABEL}
              </option>
              <option
                value="draft"
                className={
                  filter === IDEA_STATUS_CONFIG.FILTERS.DRAFT
                    ? DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE
                    : ''
                }
              >
                {filter === IDEA_STATUS_CONFIG.FILTERS.DRAFT
                  ? DASHBOARD_FILTER_LABELS.DRAFT.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.DRAFT.LABEL}
              </option>
              <option
                value="clarified"
                className={
                  filter === IDEA_STATUS_CONFIG.FILTERS.CLARIFIED
                    ? DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE
                    : ''
                }
              >
                {filter === IDEA_STATUS_CONFIG.FILTERS.CLARIFIED
                  ? DASHBOARD_FILTER_LABELS.CLARIFIED.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.CLARIFIED.LABEL}
              </option>
              <option
                value="breakdown"
                className={
                  filter === IDEA_STATUS_CONFIG.FILTERS.BREAKDOWN
                    ? DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE
                    : ''
                }
              >
                {filter === IDEA_STATUS_CONFIG.FILTERS.BREAKDOWN
                  ? DASHBOARD_FILTER_LABELS.BREAKDOWN.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.BREAKDOWN.LABEL}
              </option>
              <option
                value="completed"
                className={
                  filter === IDEA_STATUS_CONFIG.FILTERS.COMPLETED
                    ? DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE
                    : ''
                }
              >
                {filter === IDEA_STATUS_CONFIG.FILTERS.COMPLETED
                  ? DASHBOARD_FILTER_LABELS.COMPLETED.SELECTED_LABEL
                  : DASHBOARD_FILTER_LABELS.COMPLETED.LABEL}
              </option>
            </select>
          </Tooltip>
          {ideas.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <span
                className={`flex items-center justify-center min-w-[${DASHBOARD_TAILWIND.STATUS_BADGE_MIN_W}] h-5 px-1.5 text-xs font-semibold rounded-full transition-all ${DURATION_TAILWIND[300]} ${
                  filter !== IDEA_STATUS_CONFIG.FILTERS.ALL
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
          <div
            className={`flex items-center gap-2 transition-all ${DURATION_TAILWIND[200]} ease-out ${
              isFilterClearing
                ? 'opacity-0 scale-95 -translate-x-2'
                : 'animate-fade-in'
            }`}
          >
            <span className={DASHBOARD_PATTERNS.STATUS_BADGE_ACTIVE}>
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox={SVG_VIEWBOX.SMALL}
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
            <Tooltip
              content={DASHBOARD_LABELS.CLEAR_FILTER_TOOLTIP}
              shortcut={DASHBOARD_LABELS.FILTER_SHORTCUT}
            >
              <button
                type="button"
                onClick={handleClearFilter}
                className={DASHBOARD_PATTERNS.ACTION_LINK}
                aria-label={DASHBOARD_PAGE_CONTENT.ARIA_LABELS.CLEAR_FILTER}
              >
                {DASHBOARD_PAGE_CONTENT.CLEAR_FILTER}
              </button>
            </Tooltip>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED);
            window.location.reload();
          }}
          className={`ml-2 ${DASHBOARD_PATTERNS.ACTION_LINK} cursor-pointer`}
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
              <div
                className={`${DASHBOARD_PATTERNS.EMPTY_STATE_ICON} ${BG_COLORS.BRAND_LIGHT} ${BORDER_COLORS.PRIMARY_LIGHT}`}
              >
                <svg
                  className={`${DASHBOARD_PATTERNS.EMPTY_STATE_ICON_INNER} ${TEXT_COLORS.BRAND}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox={SVG_VIEWBOX.STANDARD}
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
              <h2 className={DASHBOARD_PATTERNS.SECTION_HEADING}>
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.NO_MATCHING_TITLE}
              </h2>
              <p className={DASHBOARD_PATTERNS.SECTION_SUBHEADING}>
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
                <Link href={ROUTES.HOME}>
                  <Button variant="primary">
                    {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.CREATE_NEW_IDEA}
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className={DASHBOARD_PATTERNS.SECTION_HEADING}>
                {DASHBOARD_PAGE_CONTENT.EMPTY_STATE.TITLE}
              </h2>
              <p className={DASHBOARD_PATTERNS.SECTION_SUBHEADING}>
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
                  style={{ animationDelay: ANIMATION_DELAYS.INLINE.IMMEDIATE }}
                >
                  <div
                    className={`${DASHBOARD_PATTERNS.STEP_ICON} ${BG_COLORS.WARNING_LIGHTER} ${BORDER_COLORS.WARNING_LIGHT} ${prefersReducedMotion ? '' : 'animate-float'}`}
                  >
                    <svg
                      className={`${DASHBOARD_PATTERNS.STEP_ICON_SIZE} ${TEXT_COLORS.WARNING_MEDIUM}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox={SVG_VIEWBOX.STANDARD}
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
                  <span className={DASHBOARD_PATTERNS.STEP_LABEL}>
                    {DASHBOARD_PAGE_CONTENT.HOW_IT_WORKS_STEPS.SHARE_IDEA}
                  </span>
                </div>

                {/* Arrow 1 */}
                <div
                  className={`${DASHBOARD_PATTERNS.ARROW_CONTAINER} animate-fade-in ${SIZES.COMPONENT.ARROW_NEGATIVE_MARGIN}`}
                  aria-hidden="true"
                  style={{ animationDelay: ANIMATION_DELAYS.INLINE.MEDIUM }}
                >
                  <div
                    className={`${DASHBOARD_PATTERNS.ARROW_LINE} bg-gradient-to-r from-amber-300 to-primary-300`}
                  />
                  <svg
                    className={`${DASHBOARD_PATTERNS.ARROW_ICON} ${TEXT_COLORS.BRAND_LIGHT}`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
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
                  style={{ animationDelay: ANIMATION_DELAYS.INLINE.STANDARD }}
                >
                  <div
                    className={`${DASHBOARD_PATTERNS.STEP_ICON} bg-primary-50 border border-primary-200 ${prefersReducedMotion ? '' : 'animate-float-delay-1'}`}
                  >
                    <svg
                      className={`${DASHBOARD_PATTERNS.STEP_ICON_SIZE} ${TEXT_COLORS.BRAND_LIGHT}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox={SVG_VIEWBOX.STANDARD}
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
                  <span className={DASHBOARD_PATTERNS.STEP_LABEL}>
                    {DASHBOARD_PAGE_CONTENT.HOW_IT_WORKS_STEPS.GET_CLARIFIED}
                  </span>
                </div>

                {/* Arrow 2 */}
                <div
                  className={`${DASHBOARD_PATTERNS.ARROW_CONTAINER} animate-fade-in ${SIZES.COMPONENT.ARROW_NEGATIVE_MARGIN}`}
                  aria-hidden="true"
                  style={{ animationDelay: ANIMATION_DELAYS.INLINE.EXTENDED }}
                >
                  <div
                    className={`${DASHBOARD_PATTERNS.ARROW_LINE} bg-gradient-to-r from-primary-300 to-green-300`}
                  />
                  <svg
                    className={`${DASHBOARD_PATTERNS.ARROW_ICON} ${TEXT_COLORS.SUCCESS_LIGHT}`}
                    fill="none"
                    viewBox={SVG_VIEWBOX.STANDARD}
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
                  style={{ animationDelay: ANIMATION_DELAYS.INLINE.RIPPLE }}
                >
                  <div
                    className={`${DASHBOARD_PATTERNS.STEP_ICON} ${BG_COLORS.SUCCESS_VERY_LIGHT} ${BORDER_COLORS.SUCCESS_LIGHTER} ${prefersReducedMotion ? '' : 'animate-float-delay-2'}`}
                  >
                    <svg
                      className={`${DASHBOARD_PATTERNS.STEP_ICON_SIZE} ${TEXT_COLORS.SUCCESS_LIGHT}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox={SVG_VIEWBOX.STANDARD}
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
                  <span className={DASHBOARD_PATTERNS.STEP_LABEL}>
                    {DASHBOARD_PAGE_CONTENT.HOW_IT_WORKS_STEPS.GET_BLUEPRINT}
                  </span>
                </div>
              </div>

              <Link href={ROUTES.HOME}>
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
                    className={`${TABLE_PATTERNS.row.hover} table-row-lift animate-dashboard-row animate-dashboard-row-${Math.min(index + 1, 10)} transition-colors ${
                      selectedRowIndex === index
                        ? `${DASHBOARD_PATTERNS.SELECT_OPTION_ACTIVE} ring-2 ring-primary-400 ring-inset`
                        : ''
                    }`}
                  >
                    <td className={TABLE_PATTERNS.cell.padding}>
                      <div
                        className={`${TABLE_PATTERNS.cell.primary} flex items-center gap-2 group`}
                      >
                        <span
                          className={`truncate ${TABLE_CLASSES.TITLE_MAX_WIDTH} sm:max-w-md`}
                        >
                          {idea.title}
                        </span>
                        <CopyButton
                          textToCopy={idea.title}
                          variant="icon-only"
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 transition-opacity"
                          showToast={false}
                        />
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
                        <span className={DASHBOARD_PATTERNS.TOOLTIP_LINK}>
                          {formatDate(idea.createdAt)}
                        </span>
                      </Tooltip>
                    </td>
                    <td className={TABLE_PATTERNS.actions.container}>
                      <div className={TABLE_PATTERNS.actions.buttonGroup}>
                        <Link
                          href={`/clarify?ideaId=${idea.id}`}
                          className={`${ACTION_COLORS.CONTINUE.text} ${ACTION_COLORS.CONTINUE.hoverText} ${TABLE_PATTERNS.actions.buttonBase} ${ACTION_COLORS.CONTINUE.hoverBg} transition-colors`}
                          aria-label={`${DASHBOARD_PAGE_CONTENT.ACTIONS.CONTINUE} working on ${idea.title}`}
                        >
                          {DASHBOARD_PAGE_CONTENT.ACTIONS.CONTINUE}
                        </Link>
                        <Link
                          href={`/results?ideaId=${idea.id}`}
                          className={`${ACTION_COLORS.VIEW.text} ${ACTION_COLORS.VIEW.hoverText} ${TABLE_PATTERNS.actions.buttonBase} ${ACTION_COLORS.VIEW.hoverBg} transition-colors`}
                          aria-label={`${DASHBOARD_PAGE_CONTENT.ACTIONS.VIEW_BLUEPRINT} for ${idea.title}`}
                        >
                          {DASHBOARD_PAGE_CONTENT.ACTIONS.VIEW}
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
                              viewBox={SVG_VIEWBOX.STANDARD}
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth={SVG_STROKE_WIDTHS.SPINNER}
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          )}
                          {deletingId === idea.id
                            ? DASHBOARD_PAGE_CONTENT.DELETE_MODAL.DELETING
                            : DASHBOARD_PAGE_CONTENT.ACTIONS.DELETE}
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
        <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_BAR}>
          <div className={DASHBOARD_PATTERNS.KEYBOARD_HINTS_GROUP}>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.NAVIGATE_KEYS[0]}
              </kbd>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.NAVIGATE_KEYS[1]}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.NAVIGATE_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.OPEN_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.OPEN_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.DESELECT_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.DESELECT_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.DELETE_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.DELETE_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.NEW_IDEA_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.NEW_IDEA_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.FILTER_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.FILTER_LABEL}
              </span>
            </span>
            <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_ITEM}>
              <kbd
                className={`px-1.5 py-0.5 font-mono ${TEXT_SIZE_CLASSES.XS} font-semibold ${GRAY_CLASSES.TEXT_600} bg-white border ${GRAY_CLASSES.BORDER_200} rounded shadow-sm`}
              >
                {DASHBOARD_LABELS.KEYBOARD_HINTS.HELP_KEY}
              </kbd>
              <span className={DASHBOARD_PATTERNS.KEYBOARD_HINT_LABEL}>
                {DASHBOARD_LABELS.KEYBOARD_HINTS.HELP_LABEL}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => openHelp()}
            className={DASHBOARD_PATTERNS.VIEW_SHORTCUTS_BTN}
            aria-label={
              DASHBOARD_PAGE_CONTENT.ARIA_LABELS.SHOW_KEYBOARD_SHORTCUTS
            }
          >
            <span>{DASHBOARD_PAGE_CONTENT.VIEW_ALL_SHORTCUTS}</span>
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox={SVG_VIEWBOX.STANDARD}
              stroke="currentColor"
              strokeWidth={SVG_STROKE_WIDTHS.STANDARD}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
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
                  viewBox={SVG_VIEWBOX.STANDARD}
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
                {DASHBOARD_PAGE_CONTENT.DELETE_MODAL.TITLE}
              </h3>
            </div>

            <p
              id="delete-modal-description"
              className={MODAL_PATTERNS.header.description}
            >
              {DASHBOARD_PAGE_CONTENT.DELETE_MODAL.CONFIRM} &quot;
              {deleteModal.idea.title}&quot;? This action cannot be undone.
            </p>

            <div className="mt-4">
              <label
                htmlFor="delete-confirm-input"
                className={DASHBOARD_PATTERNS.DELETE_CONFIRM_LABEL}
              >
                {DASHBOARD_PAGE_CONTENT.DELETE_CONFIRM.INPUT_LABEL}
              </label>
              <input
                ref={deleteConfirmInputRef}
                id="delete-confirm-input"
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deleteModal.idea.title}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  deleteConfirmText === deleteModal.idea.title
                    ? `${BORDER_COLORS.SUCCESS_MEDIUM} ${BG_COLORS.SUCCESS_VERY_LIGHT} ${RING_COLORS.SUCCESS_MEDIUM} ${BORDER_COLORS.SUCCESS}`
                    : `${BORDER_COLORS.DEFAULT} ${RING_COLORS.PRIMARY} ${BORDER_COLORS.PRIMARY}`
                }`}
                aria-describedby="delete-confirm-hint"
                autoComplete="off"
                spellCheck="false"
              />
              <p
                id="delete-confirm-hint"
                className={DASHBOARD_PATTERNS.DELETE_CONFIRM_HINT}
              >
                {deleteConfirmText === deleteModal.idea.title
                  ? DASHBOARD_PAGE_CONTENT.DELETE_CONFIRM.CONFIRMED_HINT
                  : DASHBOARD_PAGE_CONTENT.DELETE_CONFIRM.ENTER_HINT.replace(
                      '{title}',
                      deleteModal.idea.title
                    )}
              </p>
            </div>

            <div className={MODAL_PATTERNS.footer.container}>
              <Button
                ref={cancelButtonRef}
                variant="outline"
                onClick={closeDeleteModal}
                disabled={!!deletingId}
              >
                {DASHBOARD_PAGE_CONTENT.DELETE_MODAL.CANCEL}
              </Button>
              <Tooltip
                content={
                  deleteConfirmText === deleteModal.idea.title
                    ? DASHBOARD_PAGE_CONTENT.DELETE_MODAL.CONFIRM_DELETION
                    : DASHBOARD_PAGE_CONTENT.DELETE_CONFIRM.TOOLTIP_DISABLE
                }
                shortcut={
                  deleteConfirmText === deleteModal.idea.title
                    ? ['Enter']
                    : undefined
                }
                position="top"
              >
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={!!deletingId}
                  disabled={deleteConfirmText !== deleteModal.idea.title}
                >
                  {DASHBOARD_PAGE_CONTENT.DELETE_MODAL.TITLE}
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
